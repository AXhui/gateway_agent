---
name: B_MetricCard
description: 指标卡组（业务组件）
---

# 指标卡组 · B_MetricCard

> **逻辑名**：`B_MetricCard`
> **现 id**：`bc-metric-card`
> **分类**：概览
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
一行四列的关键指标卡，含同比趋势与状态色，是所有控制台首屏的标配入口。

### 何时用
- 控制台/看板**首屏**，把实体 `metrics` 拍成 4 张等宽卡片。
- 需要「当前值 + 较昨日趋势 + 后缀单位」三要素同屏。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 单条数值强调 | `S_Statistic`（基础组件） |
| 指标 + 列表混合首屏 | `B_QuickActions` + `B_DataTable` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Statistic` | `ms-stat-title/value/suffix/trend` | 数值 + 趋势三要素 |
| `S_Card` | `ms-card/body` | 卡片容器 |
| `S_Tag` | `ms-tag` | 状态色语义（经 `U.statusTag`） |
| `S_Icon` | `ms-ico` | 图标（`U.ico`） |

### render 骨架（业务框架）
1. 外层 `ms-grid-4` 四列栅格。
2. 逐条 `e.metrics` → `ms-card.bc-metric` → `ms-card-body.bc-metric-body`。
3. 卡内：标题 → 数值 + 后缀 → 趋势（`dir` 决定 ↑/↓/— 与 `ms-stat-trend--*` 态）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-metric-card', cn: '指标卡组', cat: '概览', desc: '一行四列的关键指标卡…', atoms: ['statistic','card','tag','icon'], entityHint: 'device', tags: ['指标','概览','看板','统计','总览','首屏','数据'], render(ctx) { /* ms-grid-4 → ms-card.bc-metric → 标题/数值/趋势 */ } }
```

### 上下文 ctx 契约
- `ctx.entity`：实体词典条目，取 `entity.metrics`（`{cn,value,suffix,dir,trend}`）。

### 结构类（`library/business.css`）
`.bc-metric`（hover 边框/阴影）、`.bc-metric-body`（竖排 gap-8 padding-20）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-metric-card`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
