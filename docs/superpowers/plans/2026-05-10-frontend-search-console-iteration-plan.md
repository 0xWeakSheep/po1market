# Frontend Search Console Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不阻塞现有业务的前提下，分阶段提升 Query Console 的 UI 可读性与前端韧性，并为“Agent 接管搜索逻辑”预留稳定接口。

**Architecture:** 前端保持“输入层（组件）- 编排层（hook/状态机）- 网络层（API 客户端）”三层边界。先优化 Query Console 的信息结构与结果展示，再引入可观测的错误分类、重试与降级策略，最后在不改动页面交互的情况下把搜索执行器从 `fetchRecommendations` 迁移到 `AgentAdapter`。

**Tech Stack:** Next.js + React + TypeScript + Tailwind CSS + Vitest + Testing Library

---

## 现状评估（结合产品目标）

- 当前 `QueryConsole` 可用，但输入区与结果区承载信息较多，链接密集场景下视觉层级不足，用户难以快速判断“可信度最高来源”。
- 当前 API 调用在 `frontend/api/recommendations.ts` 中为单次请求模型，错误信息可展示但缺少错误分层、自动重试、退避策略、超时控制与可观测上下文。
- 当前前端与后端职责边界清晰，适合在前端先完成“可控韧性层”，再无缝接入 Agent 执行器，避免一次性大改造成风险放大。

## 非目标（本计划不做）

- 不在前端实现推荐评分算法（继续由后端/Agent 负责）。
- 不引入重量级状态管理库（优先局部 hook + reducer）。
- 不一次性改造整个 landing 页，仅覆盖搜索工作台（`QueryConsole`）相关链路。

## 文件结构与职责

- Modify: `frontend/components/dashboard/QueryConsole.tsx`（拆分视图层，保持容器职责）
- Create: `frontend/components/dashboard/console/QueryInputPanel.tsx`（输入与模式切换）
- Create: `frontend/components/dashboard/console/QueryResultPanel.tsx`（结果展示与状态视图）
- Create: `frontend/components/dashboard/console/ResultCard.tsx`（单条来源卡片）
- Create: `frontend/components/dashboard/console/ResultListToolbar.tsx`（排序/过滤/统计）
- Create: `frontend/hooks/useRecommendationsQuery.ts`（查询状态机与重试编排）
- Modify: `frontend/api/recommendations.ts`（增加超时、错误分类、重试参数）
- Create: `frontend/api/agentSearchAdapter.ts`（Agent 接入适配器接口，先 mock passthrough）
- Modify: `frontend/types/recommendation.ts`（补充错误类型、请求元信息）
- Modify: `frontend/tests/query-console.test.tsx`（更新现有测试，覆盖新状态）
- Create: `frontend/tests/recommendations-resilience.test.ts`（重试、超时、错误映射）

---

### Task 1: UI 信息结构重构（不改业务行为）

**Files:**
- Modify: `frontend/components/dashboard/QueryConsole.tsx`
- Create: `frontend/components/dashboard/console/QueryInputPanel.tsx`
- Create: `frontend/components/dashboard/console/QueryResultPanel.tsx`
- Create: `frontend/components/dashboard/console/ResultCard.tsx`
- Test: `frontend/tests/query-console.test.tsx`

- [ ] **Step 1: 写失败测试，锁定现有关键行为不回归**
  
Run: `cd frontend && npm run test -- query-console.test.tsx`
  
Expected: 对将要拆分的 DOM 结构断言先失败（例如结果状态区域、来源卡片文案）。

- [ ] **Step 2: 拆分 QueryConsole 视图子组件**

将 `QueryConsole` 中输入区、结果区、卡片区拆为独立组件，父组件仅保留：
- mode/input/loading 等状态
- submit 触发
- 向子组件传递 props

- [ ] **Step 3: 重构结果卡片层级以提高链接密集场景可读性**

`ResultCard` 最少包含：
- 标题（可读域名）
- 评分（视觉权重高）
- reason（可折叠/截断）
- 主链接 + 辅助动作（复制链接，后续可补）

- [ ] **Step 4: 增加结果工具栏（排序/计数）**

在结果列表顶部增加：
- `Total N sources`
- `Sort by score desc`（默认）
- 保留后续 filter 扩展点

- [ ] **Step 5: 运行测试并提交**

Run: `cd frontend && npm run test -- query-console.test.tsx`
Expected: PASS

Commit:
```bash
git add frontend/components/dashboard/QueryConsole.tsx frontend/components/dashboard/console frontend/tests/query-console.test.tsx
git commit -m "refactor: split query console UI for readability"
```

---

### Task 2: 前端韧性层（错误分类 + 超时 + 重试）

**Files:**
- Modify: `frontend/api/recommendations.ts`
- Modify: `frontend/types/recommendation.ts`
- Create: `frontend/hooks/useRecommendationsQuery.ts`
- Create: `frontend/tests/recommendations-resilience.test.ts`
- Test: `frontend/tests/query-console.test.tsx`

- [ ] **Step 1: 写失败测试覆盖韧性策略**

新增用例覆盖：
- 429/503 可重试
- 4xx 参数错误不重试
- 网络超时触发 `timeout` 错误类型
- 达到最大重试后返回统一错误对象

- [ ] **Step 2: 在 API 层引入请求策略配置**

新增可配置项：
- `timeoutMs`（默认 8s）
- `maxRetries`（默认 2）
- `retryableStatus`（默认 429/503/504）
- 指数退避（如 300ms, 600ms）

- [ ] **Step 3: 统一错误模型**

在 `recommendation` 类型定义中增加：
- `errorType: "validation" | "network" | "timeout" | "server" | "unknown"`
- `retryCount`
- `requestId`（可选，便于后续追踪）

- [ ] **Step 4: 将组件请求逻辑迁移到 useRecommendationsQuery**

`QueryConsole` 只关心：
- `runQuery(input)`
- `state`（idle/loading/success/error/no-results）
- `lastError` 与 `canRetry`

- [ ] **Step 5: 运行测试并提交**

Run:
- `cd frontend && npm run test -- recommendations-resilience.test.ts`
- `cd frontend && npm run test -- query-console.test.tsx`

Expected: PASS

Commit:
```bash
git add frontend/api/recommendations.ts frontend/types/recommendation.ts frontend/hooks/useRecommendationsQuery.ts frontend/tests/recommendations-resilience.test.ts frontend/tests/query-console.test.tsx
git commit -m "feat: add frontend resilience for recommendation queries"
```

---

### Task 3: Agent 接管搜索逻辑的前端预留层

**Files:**
- Create: `frontend/api/agentSearchAdapter.ts`
- Modify: `frontend/hooks/useRecommendationsQuery.ts`
- Modify: `frontend/config/recommendation.ts`
- Modify: `frontend/.env.example`
- Test: `frontend/tests/recommendations-resilience.test.ts`

- [ ] **Step 1: 定义执行器接口（不切流量）**

统一接口：
- `searchByMarketId(marketId)`
- `searchByQuestion(question)`
- 返回类型与现有 `RecommendationsRunState` 对齐

- [ ] **Step 2: 增加 Provider 配置开关**

在配置中新增：
- `NEXT_PUBLIC_SEARCH_PROVIDER=api|agent`（默认 `api`）

- [ ] **Step 3: 在 hook 中做执行器选择**

逻辑：
- `api` → 调用现有 recommendations API
- `agent` → 调用 `agentSearchAdapter`（初期可透传到 api，后续接 Agent runtime）

- [ ] **Step 4: 补充回退策略**

当 provider=`agent` 且出现不可恢复错误时：
- 自动回退一次到 `api` provider
- 在 UI 展示轻提示（不打断用户流程）

- [ ] **Step 5: 运行测试并提交**

Run: `cd frontend && npm run test -- recommendations-resilience.test.ts`
Expected: PASS

Commit:
```bash
git add frontend/api/agentSearchAdapter.ts frontend/hooks/useRecommendationsQuery.ts frontend/config/recommendation.ts frontend/.env.example frontend/tests/recommendations-resilience.test.ts
git commit -m "feat: introduce provider abstraction for agent search takeover"
```

---

### Task 4: UI 可读性收尾与验收基线

**Files:**
- Modify: `frontend/components/dashboard/QueryConsole.tsx`
- Modify: `frontend/tests/query-console.test.tsx`
- Modify: `frontend/README.md`

- [ ] **Step 1: 增加空状态/错误状态文案规范**

规范文案包括：
- 无结果（给出下一步建议）
- 可重试错误（明确“可重试”）
- 不可重试错误（给出检查输入建议）

- [ ] **Step 2: 补充可访问性细节**

检查并修复：
- `aria-live` 结果播报
- 键盘操作路径（Enter 提交与焦点可见）
- 链接可读标签

- [ ] **Step 3: 更新 README 的前端职责与开关说明**

写明：
- UI 层职责
- 韧性策略（重试/超时/错误模型）
- `NEXT_PUBLIC_SEARCH_PROVIDER` 的切换说明

- [ ] **Step 4: 执行回归测试**

Run:
- `cd frontend && npm run test -- query-console.test.tsx`
- `cd frontend && npm run test`

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add frontend/components/dashboard/QueryConsole.tsx frontend/tests/query-console.test.tsx frontend/README.md
git commit -m "chore: finalize query console readability and docs"
```

---

## 验收标准（Done Definition）

- 用户在 10+ 链接结果场景下，能快速识别前 3 个高分来源（信息层级清晰）。
- 网络抖动和 5xx 场景下，前端能自动重试并反馈当前状态，不出现静默失败。
- `api/agent` 两种 provider 可通过环境变量切换，且 agent 失败时有前端回退方案。
- 回归测试通过，且文档对“职责边界 + 开关 + 常见错误”有清晰说明。

## 风险与缓解

- Agent 返回结构可能变化：通过 adapter 做 schema 归一化，避免污染 UI。
- 重试策略过于激进可能放大后端压力：限制重试次数并仅对可重试错误生效。
- 组件拆分期间可能引入样式回归：用测试 + 小步提交降低风险。

## 推荐执行节奏（可并行慢慢做）

- Week 1: Task 1（纯 UI 结构重构）
- Week 2: Task 2（韧性层）
- Week 3: Task 3（Agent 预留 + 回退）
- Week 4: Task 4（收尾验收与文档）

