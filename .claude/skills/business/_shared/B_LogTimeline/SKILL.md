---
name: B_LogTimeline
description: 操作日志时间轴（业务组件）
---

# 操作日志时间轴 · B_LogTimeline

> **逻辑名**：`B_LogTimeline`
> **现 id**：`bc-log-timeline`
> **分类**：审计
> **entityHint**：`log`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
操作日志的时间轴视图，按时间降序排布审计流水，可筛选操作类型。

### 何时用
- 审计/日志页，用 `S_Timeline` 呈现操作流水。
- 需要「时间节点 + 操作类型 + 操作人 + 结果」的追踪视图。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 表格形态日志 | `B_DataTable` |
| 告警事件 | `B_Eg71Alarm` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Timeline` | `ms-timeline` | 时间轴 |
| `S_Tag` | `ms-tag` | 操作类型/结果 |
| `S_Button` | `ms-btn` | 加载更多 |
| `S_Select` | `ms-select` | 类型筛选 |
| `S_Empty` | `ms-empty` | 空态 |

### render 骨架（业务框架）
1. 头部：类型筛选 `ms-select`。
2. `ms-timeline` → 逐条日志节点：时间 + 操作人 + 类型 `U.statusTag` + 结果。
3. 尾部：`ms-btn` 加载更多；空时 `ms-empty`。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-log-timeline', cn: '操作日志时间轴', cat: '审计', desc: '操作日志时间轴视图，按时间降序排布审计流水…', atoms: ['timeline','tag','button','select','empty'], entityHint: 'log', tags: ['日志','审计','流水','记录','操作记录','追踪'], render(ctx) { /* select → timeline(节点) → load-more/empty */ } }
```

### 上下文 ctx 契约
- `ctx.rows`（日志流水）、`ctx.entity.logTypes`（操作类型枚举）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-log-timeline`
- 结构类：无新增（复用 `ms-timeline` 体系）
- 实体（只读）：`assets/js/registry-entities.js`（key `log`）
- 令牌（只读）：`.claude/tokens/tokens.css`
