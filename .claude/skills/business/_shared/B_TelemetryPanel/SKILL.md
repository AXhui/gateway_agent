---
name: B_TelemetryPanel
description: 遥测面板（业务组件）
---

# 遥测面板 · B_TelemetryPanel

> **逻辑名**：`B_TelemetryPanel`
> **现 id**：`bc-telemetry-panel`
> **分类**：数据
> **entityHint**：`sensor`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
图表 + 指标 + 标签页的三段式数据面板，传感器遥测数据的标准展示容器。

### 何时用
- 监控/看板页的**数据主区**，用 `S_Tabs`/`S_Segmented` 切换多路遥测曲线。
- 需要「趋势图 + 关键统计 + 时间粒度切换」的数据页。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 只要关键指标不要图 | `B_MetricCard` |
| 单曲线大图 | `S_*` 图表原子内联 |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 容器 |
| `S_Tabs` / `S_Segmented` | `ms-tabs` / `ms-segmented` | 通道/粒度切换 |
| `S_Statistic` | `ms-stat-*` | 关键统计 |
| `S_Tag` | `ms-tag` | 状态色 |
| `S_Button` | `ms-btn` | 导出/刷新 |

### render 骨架（业务框架）
1. 卡头：标题 + 状态 + 操作（导出/刷新）。
2. 卡体：`ms-tabs` → 每路遥测 → `.bc-chart-card`。
3. 图区：`U.svgLine()` 折线 / `U.svgBars()` 柱状（按 `ctx.viz` 切换）。
4. 图下：`ms-segmented` 粒度切换（时/日/周/月）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-telemetry-panel', cn: '遥测面板', cat: '数据', desc: '图表 + 指标 + 标签页的三段式数据面板…', atoms: ['card','tabs','segmented','statistic','tag','button'], entityHint: 'sensor', tags: ['数据','遥测','图表','趋势','曲线','监控','看板','报表','分析'], render(ctx) { /* card → tabs → bc-chart-card → svgLine/svgBars → segmented */ } }
```

### 上下文 ctx 契约
- `ctx.entity.metrics`（关键统计）、`ctx.channels`（多路遥测）、`ctx.viz`（line/bars）。

### 结构类（`library/business.css`）
`.bc-chart-card`（图卡）、`.bc-chart`（svg 容器）、`.bc-chart-tip`（悬浮提示）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-telemetry-panel`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `sensor`）
- 令牌（只读）：`.claude/tokens/tokens.css`
