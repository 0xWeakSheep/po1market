# Retrieval 缓存设计（DB 方案）

> 日期：2026-05-11  
> 范围：`backend/src/recommendations/retrieval/*` 及其上游编排层  
> 目标：为检索链路引入可控缓存，降低外部请求成本与延迟，并保持主链路契约稳定。

## 1. 背景与目标

当前 retrieval 每次都会调用外部 provider（Google News / Reddit / official source），在以下场景存在明显浪费：

- 同一问题在短时间内重复请求；
- query 集合变化很小但仍全量回源；
- provider 抖动时无法稳定复用近期结果。

本次目标：

1. 降低重复请求成本；
2. 缩短重复查询延迟；
3. 不改变 `POST /api/v1/recommendations` 对外契约；
4. 与现有 Query Planner / Retrieval Planner 架构兼容；
5. 保持 fallback 可用（缓存异常不影响主链路可用性）。

## 2. 非目标（本轮不做）

- 不改 scoring 主逻辑；
- 不引入复杂多级缓存一致性协议；
- 不做跨服务分布式锁；
- 不做“缓存即事实库”的长期存储。

## 3. 放置位置与职责边界

缓存建议放在 `retrieval` 层，具体在 `CandidateRetrieverService -> SearchClient` 之间：

- Query/Planner 仍负责“生成检索策略”；
- 缓存层负责“是否复用结果”；
- SearchClient 仍负责“执行外部请求”。

推荐职责：

- `CandidateRetrieverService`：构造 cache key、控制读写策略、决定 fallback；
- `SearchClient`：仅执行真实检索，不感知数据库；
- `RecommendationsService`：只消费结果，不承担缓存细节。

## 4. 数据模型（最小可用）

## 4.1 表一：`retrieval_cache_entries`

建议字段：

- `id` (uuid, pk)
- `cache_key` (text, unique, not null)
- `question_normalized` (text, not null)
- `query_signature` (text, not null)
- `strategy_signature` (text, nullable)
- `provider_scope` (text, not null)  // `google_news+reddit+official`
- `candidate_limit_bucket` (int, not null)
- `payload_json` (jsonb, not null)   // `CandidateSource[]`
- `created_at` (timestamptz, not null)
- `expires_at` (timestamptz, not null)
- `last_hit_at` (timestamptz, nullable)
- `hit_count` (int, default 0)

索引建议：

- unique(`cache_key`)
- index(`expires_at`)
- index(`question_normalized`)

## 4.2 表二（可选）：`retrieval_cache_events`

用于观测与排障，初期可选：

- `id` (uuid, pk)
- `cache_key` (text)
- `event_type` (text) // hit | miss | stale | write | bypass | error
- `reason` (text)
- `latency_ms` (int)
- `created_at` (timestamptz)

## 5. Cache Key 规范

禁止只使用原始问题文本。`cache_key` 建议由以下字段归一化后哈希：

1. `question_normalized`
2. `searchQueries`（trim + lower + stable order）
3. `provider_scope`
4. `candidate_limit_bucket`
5. `strategy_signature`（若启用 Retrieval Planner）
6. `schema_version`（例如 `retrieval_cache_v1`）

示例（伪）：

`sha256(v1|question|queries_sig|providers|bucket|strategy_sig)`

## 6. TTL 与失效策略

按来源分层 TTL：

- `official`: 6h~24h
- `google_news`: 15m~30m
- `reddit`: 30m~120m

混合来源策略：

- 默认取“最短 TTL 优先”，保证时效型结果不过旧；
- 后续可按市场类型做动态 TTL。

失效方式：

- 被动失效：`expires_at < now()`
- 主动失效：
  - 策略版本升级（`schema_version` 变化）
  - 手动按 `provider_scope` / `question` 清理
- 安全失效：缓存反序列化失败或结构异常时直接 bypass 并回源。

## 7. 读写流程（建议）

1. 构造 key；
2. 查 `retrieval_cache_entries`；
3. 命中且未过期：返回缓存候选；
4. 未命中或过期：调用 `SearchClient.gatherCandidates`；
5. 成功结果回写缓存；
6. 缓存读写异常：记录日志并继续主链路（不抛给上游）。

写入策略：

- 先“覆盖写”（upsert）即可；
- payload 建议只存必要字段（title/url/snippet/provider/sourceType/publishedAt）；
- 分数字段可不缓存（留给 scoring 动态计算）。

## 8. 与 LLM 策略层协同

当 Retrieval Planner 启用时：

- `strategy_signature` 必须纳入 key（如 queryPlan + providerWeights 哈希）；
- 避免“不同策略命中同一缓存”导致污染；
- fallback 到 rules 时使用 rules 对应 signature（例如 `rules-default`）。

这样可保证：

- LLM 策略和规则策略缓存隔离；
- 便于后续做策略 AB 对比。

## 9. 观测指标（上线必备）

最小指标集：

- `retrieval_cache_hit_rate`
- `retrieval_cache_stale_rate`
- `retrieval_cache_bypass_rate`
- `retrieval_cache_write_error_rate`
- `retrieval_latency_ms`（命中 vs 回源分开）
- `provider_call_count`（按 provider）

诊断字段建议（日志或 meta）：

- `cache_status`: hit | miss | stale | bypass
- `cache_key_prefix`（前 8-12 位）
- `fallback_reason`（若存在）

## 10. 风险与防护

风险：

- 缓存污染（错误结果被复用）
- 过期策略不合理导致“旧信息误导”
- key 设计不稳定导致命中率异常
- payload 过大影响 DB 压力

防护：

- 严格 schema 版本化；
- TTL 分层 + 最短优先；
- payload 字段最小化；
- 缓存异常一律降级回源；
- 提供手动失效入口。

## 11. 实施节奏（分阶段）

### Phase 1：接口与内存模拟（1-2 天）

- 定义 `RetrievalCachePort`（get/set/invalidate）
- 先上内存实现验证 key/TTL/流程
- 补单测（hit/miss/stale/error fallback）

### Phase 2：DB 落地（2-3 天）

- 建表与索引
- 实现 `PostgresRetrievalCache`
- 接入 `CandidateRetrieverService`

### Phase 3：观测与治理（1-2 天）

- 增加命中率/回源率指标
- 增加定向失效能力（按 question/provider/version）
- 完成文档与迭代日志更新

## 12. 验收标准

- 缓存层异常不影响推荐主链路可用性；
- 重复请求平均延迟下降；
- 外部 provider 请求次数显著下降；
- 时效型问题不过期率可控；
- query / retrieval 策略切换时无缓存污染；
- 文档与契约同步更新完成。
