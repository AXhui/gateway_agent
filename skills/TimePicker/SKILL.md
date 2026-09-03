# TimePicker · 时间选择框

> **分类**：数据录入
> **Figma**：1476-23271
> **组件目录**：`frontend/components/TimePicker/`
> **版本**：v1.1.0（已对齐 antd `TimePicker` `format` / `hourStep` / `use12Hours` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**时分秒选择器**。用于仅需时间维度（不含日期）的精确取值，如定时任务执行时刻、告警静默时段。

### 何时用
- 只需要**时分秒**、日期无关的取值（每日定时、时间区间）。
- 需要**步进**约束取值粒度（如每 5 分钟一个档）。
- 需要 **12 小时制**（AM/PM）的海外场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 日期 + 时间都要选 | `DatePicker` `showTime` |
| 只选日期 | `DatePicker` |
| 相对时间段（如「30 分钟后」） | `Select` / `InputNumber` |
| 只读展示时刻 | 文本 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 时:分:秒三列 | 无秒级需求时 format 省略秒 |
| `format="HH:mm"` | 只选时分，减少操作 | 不要既省略秒又需秒精度 |
| `hourStep` / `minuteStep` | 调度类业务 `minuteStep={5}` | 步进过大导致取不到精确值 |
| `use12Hours` | 海外 AM/PM | 中文场景默认 24 小时制 |
| 范围选择 | 静默时段、营业时间区间 | 起止不可交叉 |

### 无障碍
- 三列滚轮/输入用原生 `<input type="time">` 或 `role="listbox"`，键盘 `↑ ↓` 调节。
- 值用 `aria-valuetext` 播报完整时刻（含 AM/PM）。
- 不要只靠数字显示，`00` 补零保证可读。
- 禁用时刻（`disabledTime`）需有视觉区分 + 读屏说明。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 触发框高度 | 24/32/40（sm/md/lg） | 对齐 `Input` |
| 面板列宽 | 56px/列 | 时:分:秒三列 |
| 面板项高 | 32px | 居中数字 |
| 选中项背景 | `var(--color-primary-bg)` | 品牌蓝 50 浅底 |
| 面板圆角 | `var(--radius-8)` | 悬浮层 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `var(--color-border-base)`，bg `var(--color-bg-card)` |
| 聚焦 | 边框 `var(--color-primary-normal)` + focus ring |
| 选中列项 | bg `var(--color-primary-bg)`，文字 `var(--color-primary-normal)` |
| hover 项 | bg `var(--color-bg-page)` |
| 禁用时刻 | 文字 `var(--color-text-disable)`，cursor not-allowed |

### 过渡
面板展开淡入 120ms；选中项背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（聚焦/选中文字）、`--color-primary-bg`（选中项底，等价 `--color-fill-primary`）、`--color-border-base`（默认边框）、`--color-bg-card`（触发框/面板底）、`--color-bg-page`（hover 项）、`--color-text-primary`、`--color-text-disable`、`--radius-4`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（选中项底），已统一为 `--color-primary-bg`。

---

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
| `value` | `Dayjs` | `-` | 受控选中值 |
| `defaultValue` | `Dayjs` | `-` | **antd 别名**，非受控默认值 |
| `format` | `string` | `'HH:mm:ss'` | **antd 同名同值**：显示格式 |
| `hourStep` | `number` | `1` | **antd 同名同值**：小时步进 |
| `minuteStep` | `number` | `1` | **antd 同名同值**：分钟步进 |
| `secondStep` | `number` | `1` | **antd 同名同值**：秒步进 |
| `use12Hours` | `boolean` | `false` | **antd 同名同值**：12 小时制 |
| `disabled` | `boolean` | `false` | 禁用 |
| `disabledTime` | `(now) => { disabledHours?, disabledMinutes?, disabledSeconds? }` | `-` | **antd 同名同义**：禁用时刻 |
| `onChange` | `(time: Dayjs, timeString: string) => void` | `-` | **antd 同名同义**：选中回调 |
| `placeholder` | `string` | `-` | 占位文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 触发框尺寸 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，选中经 `onChange(time, timeString)` 通知外部；否则内部维护 `defaultValue`。
- `format` 决定 `timeString` 输出形态（如 `HH:mm` 只回时分）。

### 事件 / 键盘
- 面板三列可独立滚动/输入；`↑ ↓` 调节当前列，`← →` 切换列，`Enter` 确认，`Esc` 关闭。
- `disabledTime` 由业务方按 `now` 动态返回禁用集合，选中项跳过禁用档位。

---

## 代码示例

```html
<TimePicker defaultValue={dayjs('12:30:00','HH:mm:ss')} />
<TimePicker format="HH:mm" minuteStep={5} />
<TimePicker use12Hours format="hh:mm A" />
<TimePicker value={t} onChange={setT} disabledTime={disabledTime} />
```

---

## 文件映射

- Preview 文件：`timepicker-preview.html`
- 组件目录：`frontend/components/TimePicker/index.html`
- 令牌文件：`frontend/shared/tokens.css`
