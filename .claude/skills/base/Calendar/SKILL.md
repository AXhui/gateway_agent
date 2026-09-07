---
name: Calendar
description: 日历（基础组件）
---

# Calendar · 日历

> **分类**：数据展示
> **Figma**：1517-2040
> **组件目录**：`../../../../frontend/components/Calendar/`
> **版本**：v1.1.0（已对齐 antd `Calendar` `value` / `mode` / `cellRender` / `onPanelChange` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**日历视图组件**，支持月/年两种模式、单元格自定义渲染、日期选择回调，用于日程、巡检、计划类页面。

### 何时用
- **调度/日程/巡检**类页面的日历视图。
- 需要**日期单元格自定义内容**（任务、事件）的场景。
- 需要**月/年切换**的时间维度展示。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 仅选一个日期 | `DatePicker` |
| 选时间范围 | `DatePicker.RangePicker` |
| 简单月份切换 | `DatePicker` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `mode="month"` | 月视图 | 默认 |
| `mode="year"` | 年视图 | 年度概览 |
| `cellRender` | 自定义单元格 | 事件过多要做折叠/提示 |
| 今天/选中 | 高亮标注 | 今天与选中态区分清楚 |

### 无障碍
- 日期单元格有 `aria-label`（完整日期）；键盘方向键可切换日期。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 单元格 | 自适应 | 月视图 7 列 |
| 表头高 | 40px | 星期行 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 选中日期 | `--color-primary-normal` 底 + 白字 |
| 今天 | 边框 `--color-primary-normal` |
| 悬浮日期 | 背景 `--color-primary-bg` |
| 单元格分隔 | `--color-divider-base-1` |

### 过渡
背景/边框 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中）、`--color-primary-bg`（悬浮背景）、`--color-divider-base-1`（分隔线）。

> **Token 修正**：`--color-brand-50` → `--color-primary-bg`（悬浮/今天背景统一用主色淡背景 token）。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 单元格 hover `--color-bg-hover` |
| active（点击反馈） | 选中按下 |
| 键盘 | `↑↓←→` 移动日期、`Enter` 选中、`Esc` 关闭面板 |
| loading | 无（数据异步由上层 Skeleton 承载） |
| error | 无 |

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Dayjs` | `-` | **antd 同名同值**：显示日期 |
| `mode` | `'month' \| 'year'` | `'month'` | **antd 同名同值**：模式 |
| `cellRender` | `(date, info) => ReactNode` | `-` | **antd 同名同值**：单元格渲染 |
| `onPanelChange` | `(date, mode) => void` | `-` | **antd 同名同值**：面板切换 |
| `onSelect` | `(date, info) => void` | `-` | **antd 同名同值**：选择回调 |

### 受控/非受控语义
- `value` + `onSelect`/`onPanelChange` 为**受控**；缺省 `value` 时内部维护非受控日期。

### 事件 / 键盘
- 键盘方向键切换日期；`onSelect` 返回选中日期。

---

## 代码示例

```html
<Calendar
  value={current}
  mode="month"
  cellRender={(date, info) =>
    info.type === 'date' ? <ScheduleCell date={date} /> : info.originNode
  }
  onPanelChange={(d, m) => setMode(m)}
/>
```

---

## 文件映射

- Preview 文件：`calendar-preview.html`
- 组件目录：`../../../../frontend/components/Calendar/index.html`
- 令牌文件：`../../../tokens/tokens.css`
