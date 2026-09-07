---
name: DatePicker
description: 日期选择（基础组件）
---

# DatePicker · 日期选择

> **分类**：数据录入
> **Figma**：1471-40068
> **组件目录**：`../../../../frontend/components/DatePicker/`
> **版本**：v1.1.0（已对齐 antd `DatePicker` `picker` / `showTime` / `range` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**日期/日期时间选择器**。基于 dayjs，覆盖日期、周、月、季、年及范围选择，是时间维度取值的最常用控件。

### 何时用
- 需要选择**日期**（下单日期、到期日、生效日）。
- 需要选择**日期 + 时间**（`showTime`）。
- 需要**范围选择**（`range`，如统计区间、活动周期）。
- 需要**限定可选范围**（`disabledDate`）或**预设快捷范围**（近 7 天 / 本月）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 只要时间（时分秒） | `TimePicker` |
| 相对时间描述（如「最近 24 小时」） | `Select` / `Segmented` 预设 |
| 只读展示日期 | 文本 |
| 需要自由输入任意日期字符串 | `Input` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `picker="date"` | 默认日期 | 默认即可 |
| `picker="week/month/quarter/year"` | 周/月/季/年粒度 | 粒度要与业务统计口径一致 |
| `showTime` | 日期 + 时分秒 | 无时分需求时不要开，增加操作成本 |
| `range` | 起止范围，双输入框 | 起止不可交叉，联动校验 |
| `presets` | 快捷范围（近 7 天/本月/今年） | 预设要与表格筛选口径统一 |

### 无障碍
- 触发框为可聚焦输入/按钮，展开面板用 `role="grid"` + `role="gridcell"`，`aria-selected` 标记选中日。
- 键盘 `↑ ↓ ← →` 移动日期、`PageUp/PageDown` 翻月、`Enter` 确认、`Esc` 关闭。
- 今天用 `aria-label="今天"` 标记；禁用日期读屏可感知。
- 范围选择两个输入框用 `aria-label` 区分「开始日期 / 结束日期」。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 触发框高度 | 24/32/40（sm/md/lg） | 对齐 `Input` |
| 面板单元格 | 32×32 | 7×6 网格 |
| 面板内边距 | 16px | 头部 + 表格 |
| 面板圆角 | `var(--radius-8)` | 悬浮层 |
| 面板投影 | `0 6px 20px rgba(11,18,32,0.08)` | 悬浮层 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `var(--color-border-base)`，bg `var(--color-bg-card)` |
| 聚焦 | 边框 `var(--color-primary-normal)` + focus ring `0 0 0 3px var(--color-primary-bg)` |
| 选中日 | bg `var(--color-primary-normal)`，文字白 |
| 范围起止 | bg `var(--color-primary-normal)`；中间区间 bg `--color-primary-bg` |
| 今日 | 边框 `var(--color-primary-normal)`（未选中时） |
| hover 日 | bg `var(--color-bg-page)` |
| 禁用日 | 文字 `var(--color-text-disable)`，不可点 |
| 其他月 | 文字 `var(--color-text-auxiliary)` |

### 过渡
面板展开淡入 120ms；单元格 hover/选中 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中/聚焦/今日）、`--color-primary-bg`（范围中间底，等价 `--color-fill-primary`）、`--color-border-base`（默认边框）、`--color-bg-card`（触发框/面板底）、`--color-bg-page`（hover 日）、`--color-text-primary`、`--color-text-auxiliary`、`--color-text-disable`、`--color-text-constant-normal`（选中文字）、`--radius-4`、`--radius-8`、`--shadow-1`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（范围中间底）与 `--shadow-2`（面板投影），已分别统一为 `--color-primary-bg` 与 `--shadow-1`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 输入框 hover（见矩阵） |
| active（点击反馈） | 按下 |
| 键盘 | `Enter` 确认、`Esc` 关闭、面板内方向键导航 |
| loading | 无（面板静态） |
| error | 边框 `--color-error-normal` + 焦点环 `--color-error-bg` |

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
| `value` | `Dayjs \| [Dayjs, Dayjs]` | `-` | 受控选中值 |
| `defaultValue` | `Dayjs \| [Dayjs, Dayjs]` | `-` | **antd 别名**，非受控默认值 |
| `picker` | `'date' \| 'week' \| 'month' \| 'quarter' \| 'year'` | `'date'` | **antd 同名同值**：粒度类型 |
| `showTime` | `boolean \| object` | `false` | **antd 同名同值**：含时间选择 |
| `format` | `string` | `'YYYY-MM-DD'` | **antd 同名同值**：显示格式 |
| `range` | `boolean` | `false` | **antd 同名同义**：范围选择 |
| `disabledDate` | `(current: Dayjs) => boolean` | `-` | **antd 同名同义**：禁用日期 |
| `placeholder` | `string \| [string, string]` | `-` | 占位文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 触发框尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(date: Dayjs, dateString: string) => void` | `-` | 选中回调 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，选中经 `onChange(date, dateString)` 通知外部；否则内部维护 `defaultValue`。
- `range` 为 true 时 `value` 为 `[start, end]`；`format` 决定 `dateString` 输出形态。

### 事件 / 键盘
- 触发框展开面板；`↑ ↓ ← →` 移动日期、`PageUp/PageDown` 翻月、`Enter` 确认、`Esc` 关闭。
- `disabledDate` 由业务方按 `current` 动态返回禁用；范围选择起止联动，禁止交叉。

---

## 代码示例

```html
<DatePicker defaultValue={dayjs('2026-09-02')} />
<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
<DatePicker range presets={[{label:'近 7 天',value:[dayjs().add(-7,'d'),dayjs()]}]} />
<DatePicker picker="month" value={m} onChange={setM} disabledDate={d => d.isAfter(dayjs())} />
```

---

## 文件映射

- Preview 文件：`datepicker-preview.html`
- 组件目录：`../../../../frontend/components/DatePicker/index.html`
- 令牌文件：`../../../tokens/tokens.css`
