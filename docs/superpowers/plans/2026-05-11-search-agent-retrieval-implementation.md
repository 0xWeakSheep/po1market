# Search Agent（Retrieval）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持当前 `query` 能力稳定的前提下，让 LLM 逐步接管“搜索策略（检索编排）”，提升召回质量与可解释性，并保证任意失败可回退到规则路径。

**Architecture:** 维持现有三层边界：`RetrievalService`（总编排）→ `CandidateRetrieverService`（策略）→ `SearchClient`（执行）。新增 `RetrievalPlanningClient` + `retrieval-planning.schema`，让 LLM 只输出“策略计划”，不直接发外部请求。执行层继续由 `SearchClient` 负责，失败统一 fallback 到当前固定策略。

**Tech Stack:** NestJS, TypeScript, Jest, openai SDK（兼容 DeepSeek/OpenAI）, 现有 providers（Google News RSS / Reddit / official resolution source）。

---

## 0) Agent 负责哪些模块（全局分工）

- **Query Agent（已完成为主）**
  - 负责 query 规划（`query_source: llm|rules`）
  - 输出 `searchQueries` + `planning_meta`
  - 出错回退 `query-builder`

- **Retrieval Agent（本计划主线）**
  - 负责“怎么搜”：query 优先级、各 query 预算、provider 选择、停止条件
  - 仅输出结构化策略，不直接调用 provider
  - 出错回退当前固定策略（均分预算 + news/reddit 固定比例）

- **Scoring Agent（后续）**
  - 负责证据融合、重排、冲突处理
  - 暂不进入本轮改造范围，仅保证接口兼容

- **Policy/Guardrail（平台能力）**
  - 负责超时、重试、限流、缓存、fallback、日志与可观测
  - 由服务端规则层掌控，避免 LLM 直接控制生产稳定性

---

### Task 1: 定义 Retrieval Planner 契约与类型（先立边界）

**Files:**
- Create: `backend/src/recommendations/retrieval/domain/retrieval-planning.schema.ts`
- Modify: `backend/src/recommendations/types/recommendations.ts`
- Test: `backend/src/recommendations/retrieval/domain/retrieval-planning.schema.spec.ts`

- [ ] **Step 1: 写失败测试（schema + sanitize + fallback 触发）**

```ts
import {
  parseRetrievalPlanPayload,
  sanitizeRetrievalPlan
} from './retrieval-planning.schema'

describe('retrieval-planning.schema', () => {
  it('parses valid retrieval plan', () => {
    const payload = parseRetrievalPlanPayload(JSON.stringify({
      query_priorities: [
        { query: 'btc close above 120k', weight: 0.6 },
        { query: 'btc 120k official source', weight: 0.4 }
      ],
      provider_mix: { google_news: 0.7, reddit: 0.3 },
      budget_total: 18
    }))
    expect(payload.query_priorities).toHaveLength(2)
  })

  it('throws on invalid json', () => {
    expect(() => parseRetrievalPlanPayload('oops')).toThrow('invalid_json')
  })

  it('returns null for unusable plan after sanitize', () => {
    const sanitized = sanitizeRetrievalPlan({
      query_priorities: [],
      provider_mix: { google_news: 0, reddit: 0 },
      budget_total: 0
    } as any, 12, ['q1'])
    expect(sanitized).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- retrieval/domain/retrieval-planning.schema.spec.ts`  
Expected: FAIL（文件尚不存在）

- [ ] **Step 3: 写最小实现（解析 + 严格校验 + 归一）**

```ts
export type RetrievalPlanPayload = {
  query_priorities: Array<{ query: string; weight: number }>
  provider_mix?: { google_news?: number; reddit?: number }
  budget_total?: number
}

// parse + strict validate + normalize
// output must be deterministic and bounded
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- retrieval/domain/retrieval-planning.schema.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/recommendations/retrieval/domain/retrieval-planning.schema.ts backend/src/recommendations/retrieval/domain/retrieval-planning.schema.spec.ts backend/src/recommendations/types/recommendations.ts
git commit -m "feat(retrieval): add retrieval planning schema and types"
```

---

### Task 2: 新增 RetrievalPlanningClient（LLM 只管策略）

**Files:**
- Create: `backend/src/recommendations/retrieval/integration/retrieval-planning.client.ts`
- Create: `backend/src/prompts/agent-prompt/retrieval-planning.system.md`
- Modify: `backend/src/recommendations/recommendations.module.ts`
- Modify: `backend/nest-cli.json`
- Test: `backend/src/recommendations/retrieval/domain/candidate-retriever.service.spec.ts`

- [ ] **Step 1: 先写失败测试（CandidateRetriever 可调用 planner）**

```ts
it('uses retrieval planner when enabled', async () => {
  const planner = {
    enabled: true,
    planRetrieval: jest.fn().mockResolvedValue({
      ok: true,
      outputText: JSON.stringify({
        query_priorities: [{ query: 'btc 120k', weight: 1 }],
        provider_mix: { google_news: 1, reddit: 0 },
        budget_total: 12
      })
    })
  }
  // service 调用后应走 planner 分支
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- retrieval/domain/candidate-retriever.service.spec.ts`  
Expected: FAIL（测试文件或依赖尚未存在）

- [ ] **Step 3: 实现 RetrievalPlanningClient 最小版**

```ts
@Injectable()
export class RetrievalPlanningClient {
  readonly enabled: boolean
  async planRetrieval(input: {
    question: string
    searchQueries: string[]
    candidateLimit: number
  }): Promise<{ ok: true; outputText: string } | { ok: false; reason: 'empty_content' | 'request_failed' }> {
    // chat.completions.create + json_object
  }
}
```

- [ ] **Step 4: 注册模块与 prompt 构建资源**

Run updates:
- `recommendations.module.ts` 增加 `RetrievalPlanningClient`
- `nest-cli.json` assets 增加 `prompts/agent-prompt/*.md`（已覆盖则仅确认）

- [ ] **Step 5: 运行测试确认通过**

Run: `npm run test -- retrieval/domain/candidate-retriever.service.spec.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/recommendations/retrieval/integration/retrieval-planning.client.ts backend/src/prompts/agent-prompt/retrieval-planning.system.md backend/src/recommendations/recommendations.module.ts backend/nest-cli.json backend/src/recommendations/retrieval/domain/candidate-retriever.service.spec.ts
git commit -m "feat(retrieval): add llm retrieval planning client"
```

---

### Task 3: 改造 CandidateRetriever 为“LLM 策略优先 + 规则 fallback”

**Files:**
- Modify: `backend/src/recommendations/retrieval/domain/candidate-retriever.service.ts`
- Modify: `backend/src/recommendations/retrieval/integration/search.client.ts`
- Test: `backend/src/recommendations/retrieval/domain/candidate-retriever.service.spec.ts`

- [ ] **Step 1: 先写失败测试（invalid payload 回退规则策略）**

```ts
it('falls back to legacy retrieval strategy on planner payload error', async () => {
  // planner 返回坏 JSON
  // 期望 searchClient 仍按 legacy gatherCandidates 执行
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- retrieval/domain/candidate-retriever.service.spec.ts`  
Expected: FAIL

- [ ] **Step 3: 实现编排逻辑**

```ts
// 1) 构造 planner input
// 2) 尝试 planRetrieval
// 3) parse/sanitize
// 4) 成功 -> 按策略调用 searchClient（新增 strategy 入参）
// 5) 失败 -> legacy gatherCandidates
```

- [ ] **Step 4: 在 SearchClient 增加 strategy 执行能力**

```ts
gatherCandidates({
  queries,
  resolutionSource,
  candidateLimit,
  strategy // optional
})
```

- [ ] **Step 5: 跑测试确认通过**

Run: `npm run test -- retrieval/domain/candidate-retriever.service.spec.ts retrieval/domain/retrieval.service.spec.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/recommendations/retrieval/domain/candidate-retriever.service.ts backend/src/recommendations/retrieval/integration/search.client.ts backend/src/recommendations/retrieval/domain/candidate-retriever.service.spec.ts
git commit -m "feat(retrieval): enable llm-first retrieval strategy with fallback"
```

---

### Task 4: 增加 retrieval 可观测性（生产必备）

**Files:**
- Modify: `backend/src/recommendations/types/recommendations.ts`
- Modify: `backend/src/recommendations/retrieval/domain/retrieval.service.ts`
- Modify: `backend/src/recommendations/recommendations.service.ts`
- Modify: `backend/src/recommendations/retrieval/integration/search.client.ts`
- Test: `backend/src/recommendations/retrieval/domain/retrieval.service.spec.ts`

- [ ] **Step 1: 定义 retrieval 诊断结构（200 响应可消费）**

```ts
type RetrievalMeta = {
  retrieval_source: 'llm' | 'rules'
  fallback_reason?: 'planner_disabled' | 'llm_request_failed' | 'payload_parse_failed' | 'strategy_invalid'
  provider_counts?: Record<string, number>
  query_counts?: Record<string, number>
  candidate_count_before_dedupe?: number
  candidate_count_after_dedupe?: number
  latency_ms?: number
}
```

- [ ] **Step 2: 在 retrieval 链路透传 meta**

Run updates:
- `RetrievalService.retrieve` 返回 `{ market, candidates, retrieval_meta }`
- `RecommendationsService` 可按 debug 配置决定是否透传或写日志

- [ ] **Step 3: 运行测试确认兼容**

Run: `npm run test -- retrieval/domain/retrieval.service.spec.ts recommendations.service.spec.ts`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/recommendations/types/recommendations.ts backend/src/recommendations/retrieval/domain/retrieval.service.ts backend/src/recommendations/recommendations.service.ts backend/src/recommendations/retrieval/integration/search.client.ts backend/src/recommendations/retrieval/domain/retrieval.service.spec.ts
git commit -m "feat(retrieval): add structured retrieval diagnostics"
```

---

### Task 5: 文档同步（架构、契约、迭代日志、看板）

**Files:**
- Modify: `backend/src/recommendations/retrieval/README.md`
- Modify: `docs/superpowers/search-current-state.md`
- Modify: `docs/superpowers/search-iteration-log.md`
- Modify: `docs/superpowers/api-contract-and-errors.md`
- Modify: `task-board.md`

- [ ] **Step 1: 更新 retrieval README（职责与调用关系）**
- [ ] **Step 2: 更新 search-current-state（新增 retrieval planner 现状）**
- [ ] **Step 3: 在 iteration log 追加一条改造记录**
- [ ] **Step 4: 契约文档补充 `retrieval_meta`（若对外）**
- [ ] **Step 5: task-board 刷新当前进度和下一步**

- [ ] **Step 6: Commit**

```bash
git add backend/src/recommendations/retrieval/README.md docs/superpowers/search-current-state.md docs/superpowers/search-iteration-log.md docs/superpowers/api-contract-and-errors.md task-board.md
git commit -m "docs(search): document retrieval agent architecture and progress"
```

---

### Task 6: 端到端验证与分阶段上线节奏

**Files:**
- Modify: `backend/src/recommendations/retrieval/domain/candidate-retriever.service.ts`（仅当验收修复）
- Test: `backend/src/recommendations/retrieval/**`

- [ ] **Step 1: 回归命令**

Run:
- `npm run test -- retrieval/domain/retrieval.service.spec.ts retrieval/domain/candidate-retriever.service.spec.ts`
- `npm run test -- query/domain/query.service.spec.ts`
- `npm run test -- recommendations`

Expected: PASS（或无新增失败）

- [ ] **Step 2: 手工接口验收**

Run:
- `POST /api/v1/search/queries`（确认 query 仍稳定）
- `POST /api/v1/recommendations`（确认 retrieval 生效且可回退）

- [ ] **Step 3: 三阶段发布节奏**

Week 1:
- 完成 Task 1~2（契约 + client）
- 仅开发环境启用 planner

Week 2:
- 完成 Task 3~4（策略接管 + 可观测）
- 预发验证样本集（20~50 条）

Week 3:
- 完成 Task 5~6（文档 + 验收）
- 生产逐步开启，监控无结果率/Top-K/耗时/成本

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore(retrieval): finalize search agent rollout and validation"
```

---

## 范围声明（本轮不做）

- 不改 `scoring` 主逻辑（仅保证兼容）
- 不做多轮自反检索（iterative retrieval v2）
- 不引入新 provider（先把策略层打稳）

## 验收标准（Done Definition）

- `query` 路径不回归，`/search/queries` 行为与契约稳定
- retrieval 可在 `llm` 与 `rules` 两条路径间无损切换
- fallback 可解释（有结构化 reason）
- 关键指标可观测：无结果率、候选池规模、Top-K 命中、延迟、成本
- 文档（现状/迭代/契约/看板）同步完成
