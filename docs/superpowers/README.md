# Superpowers 文档治理（前后端分治）

> 最后更新：2026-05-10

## 目标

- 建立可持续维护的技术文档体系；
- 按前后端分治，避免迭代记录混杂；
- 让协作者能快速找到“现状 / 计划 / 迭代记录”。

## 文档分层

- 基线现状（后端搜索主链路）：`docs/superpowers/search-current-state.md`
- 后端迭代日志：`docs/superpowers/search-iteration-log.md`
- 前端迭代日志：`docs/superpowers/frontend-iteration-log.md`
- 实施计划：`docs/superpowers/plans/`

## 分治规则

- 后端搜索逻辑（query/recall/scoring/agent 接口）改动：
  - 必更：`search-current-state.md`（若现状发生变化）
  - 必更：`search-iteration-log.md`
- 前端控制台或展示层改动：
  - 必更：`frontend-iteration-log.md`
- 跨端改动：
  - 前后端日志都要追加记录，并在记录中互相引用。

## 记录最小模板

每条迭代记录至少包含：

- 背景
- 改动范围（文件路径）
- 实现要点
- 验证方式
- 结果与下一步

## 维护节奏

- 每个相关 PR 至少追加 1 条日志；
- 每周巡检一次，清理过期计划和重复描述；
- 任务看板 `task-board.md` 保持与日志入口一致。
