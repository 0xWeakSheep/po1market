# Query 模块接口文档（临时）

> 说明：该文档当前放在 `query/` 目录下，后续会统一整合到全局接口文档。

## 1. 模块职责

`query` 模块负责“查询词生成（query planning）”能力，包括：

- 接收 `market_id` 或 `market_question`
- 解析市场问题上下文（必要时调用 Polymarket）
- 生成 `searchQueries` 供后续召回流程使用

## 2. 目录结构（治理约定）

- `api/`：功能接口层（Controller / DTO / Contract）
- `domain/`：业务层（Service / Rule / UseCase）
- `integration/`：提供方整合层（外部 Provider 适配）

当前对应文件：

- `api/query.controller.ts`
- `domain/query.service.ts`
- `domain/query-builder.ts`
- `integration/query-market.provider.ts`

## 3. 接口定义

### 3.1 生成查询词

- **Method**: `POST`
- **Path**: `/api/v1/search/queries`
- **Controller**: `QueryController.create`

请求体（`RecommendationRequest`）：

```json
{
  "market_id": "optional-string",
  "market_question": "optional-string",
  "market_description": "optional-string",
  "resolution_source": "optional-string"
}
```

约束：

- `market_id` 和 `market_question` 至少提供一个
- 若两者都缺失，返回 `400 Bad Request`

成功响应（`QueryPreviewResponse`）：

```json
{
  "question": "Will BTC close above 120k this month?",
  "description": "optional description",
  "resolutionSource": "https://example.com",
  "searchQueries": [
    "Will BTC close above 120k this month?",
    "BTC close above 120k",
    "BTC close above 120k official source"
  ]
}
```

## 4. 内部流程（当前实现）

1. `QueryController` 接收请求并做基础参数校验
2. `QueryService.resolveQueries` 执行业务编排
3. `QueryMarketProvider.resolveQueryMarketInput` 获取标准化的 market 输入
4. `QueryService.buildQueries` 调用 `query-builder` 生成查询词
5. 返回 `QueryPreviewResponse`

## 5. 与推荐主链路关系

- `RecommendationsService` 仍是主推荐入口（`/api/v1/recommendations`）
- `MarketContextResolverService` 会复用 `QueryService.buildQueries`
- `query` 模块接口可被前端/调试工具单独调用，不依赖完整推荐流程
