# InputNumber · 数字输入框

> **分类**：数据录入
> **Figma**：1452-26685
> **组件目录**：`frontend/components/InputNumber/`
> **版本**：v1.1.0（已对齐 antd `size` / `min` / `max` / `step` / `precision` / `formatter` / `parser` / `controls` / `keyboard` API）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
承载**严格数值**的输入控件。InputNumber 是「让用户键入/步进一个带边界与精度的数字」的入口，不是「自由文本」的入口（那是 `Input`），也不是「从集合中选值」的入口（那是 `Select`）。

### 何时用
- 需要输入**可枚举范围、有上下限、有步进、有小数精度**的数值时（端口、阈值、温度、周期、金额、百分比）。
- 用户需要「点 ↑↓ 微调」而不只是「手打」时。
- 需要强制数值格式（千分位、货币符号、百分比）时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 自由文本、名称、ID、密钥 | `Input` |
| 从有限离散值中选一个 | `Select` / `Radio` |
| 范围（起止两个数值） | `Slider`（连续区间）或两个 `InputNumber` 组合 |
| 需要键盘滑动条的直观感 | `Slider` |
| 纯整数开关量（0/1） | `Switch` |
| 日期/时间数值 | `DatePicker` / `TimePicker` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础（默认） | 整数或小数，步进 `step=1` | 不要用浮点 `step` 时不做精度控制 |
| `precision` | 金额 `precision={2}`、百分比 `precision={1}` | 不要在 `formatter` 里再 `toFixed`（重复控制精度） |
| `formatter` + `parser` | 千分位、货币符号（`¥ 1,280`）等展示/解析成对出现 | 只给 `formatter` 不给 `parser`，输入会被污染 |
| `min` / `max` | 阈值、端口范围、百分比 0–100 | 不要只在 `onBlur` 才 clamp，交互中也要限制箭头 |
| `controls={false}` | 不需要步进按钮的纯数字输入（ID、序号） | 需要微调场景不要关掉 controls |
| `keyboard={false}` | 禁用滚轮/↑↓ 误触（表单滚动场景） | 表格内嵌时建议禁用滚轮，避免滚动页面误改数值 |

### 无障碍
- 根 `<input inputMode="decimal">`，移动端弹数字键盘。
- 步进按钮为原生 `<button>`，`Tab` 可聚焦；超出 `min`/`max` 时对应箭头 `disabled` + `cursor: not-allowed`。
- 直接输入非法值（NaN）时不得崩溃，`onBlur` 回落为最近合法值。
- 禁用态不响应滚轮/键盘增减。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| size | height | 字号/行高 | 步进按钮区宽 |
|------|--------|-----------|--------------|
| `sm` | 24px | 12px/20px | 22px（↑↓ 各 12px） |
| `md`（默认） | 32px | 14px/22px | 22px（↑↓ 各 16px） |
| `lg` | 40px | 16px/24px | 22px（↑↓ 各 20px） |

antd 尺寸别名：`small`→`sm`、`middle`→`md`、`large`→`lg`。

### 状态视觉矩阵
| 状态 | 边框 | 焦点环 | 背景 | 说明 |
|------|------|--------|------|------|
| default | `1px solid var(--color-border-base)` | 无 | `--color-bg-card` | 未聚焦 |
| hover | `1px solid var(--color-border-base-disable)` | 无 | `--color-bg-card` | 悬停 |
| focus | `1px solid var(--color-primary-normal)` | `0 0 0 2px rgba(52,145,250,0.12)` | `--color-bg-card` | 聚焦 |
| error | `1px solid var(--color-error-normal)` | `0 0 0 2px rgba(241,53,53,0.12)` | `--color-bg-card` | `status="error"` |
| disabled | `1px solid var(--color-border-base)` | 无 | `--color-bg-hover` | 字 `--color-text-disable`，箭头 `--color-text-disable` |

### 步进按钮
- 右侧竖向两个 `<button>`，宽度 22px，中间以 `1px solid var(--color-divider-base-1)` 分隔。
- 箭头 icon 10px，color `--color-text-auxiliary`；disabled 时 `--color-text-disable`。
- hover 箭头态变 `--color-text-secondary`。

### 过渡
`transition: border-color / box-shadow 160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`、`--color-error-normal`、`--color-text-primary/secondary/auxiliary/disable`、`--color-bg-card`、`--color-bg-hover`、`--color-border-base`、`--color-border-base-disable`、`--color-divider-base-1`、`--radius-4`、`--spacing-12`、`--duration-fast`、`--easing-standard`。

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
| `value` | `number` | `-` | 受控值 |
| `defaultValue` | `number` | `-` | 非受控默认值 |
| `min` | `number` | `-Infinity` | 最小值 |
| `max` | `number` | `Infinity` | 最大值 |
| `step` | `number` | `1` | 步进（可为小数） |
| `precision` | `number` | `-` | 小数精度（四舍五入） |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸；**antd 别名** `'small' \| 'middle' \| 'large'` 自动映射 |
| `status` | `'default' \| 'error'` | `'default'` | 校验态 |
| `formatter` | `(value: number) => string` | `-` | 展示格式化（千分位/货币） |
| `parser` | `(text: string) => number` | `-` | 输入解析（与 `formatter` 配对） |
| `controls` | `boolean` | `true` | **antd 别名**，是否显示步进按钮 |
| `keyboard` | `boolean` | `true` | **antd 别名**，是否启用键盘/滚轮增减 |
| `placeholder` | `string` | `-` | 占位 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(value: number) => void` | `-` | 值变化回调（数值，非 event） |
| `onBlur` / `onFocus` | `(e) => void` | `-` | 焦点事件 |

### 别名映射（`size` antd → Milesight）
```
small  → sm
middle → md
large  → lg
```

### 受控/非受控语义
- `value !== undefined` 时受控，`onChange(value)` 通知外部更新。
- 否则内部维护 `defaultValue`，步进/输入时内部 `setInner`。
- 焦点态内部维护 `focus` + `text`（编辑中的原始字符串），`onBlur` 时按 `clamp` 落回 `[min, max]` 并 `toFixed(precision)`。

### clamp 逻辑
```
1. min !== undefined && n < min → n = min
2. max !== undefined && n > max → n = max
3. precision !== undefined   → n = Number(n.toFixed(precision))
```

### formatter / parser 约定
- `formatter` 只在**失焦展示**时作用，编辑中显示原始 `text`。
- `parser` 负责把用户输入还原为 `number`（如剥离 `¥` 与千分位）。
- 禁止在 `formatter` 中再做 `toFixed`——精度统一交给 `precision`。

---

## 代码示例

```html
<InputNumber defaultValue={5} min={0} max={10} step={1} />
<InputNumber defaultValue={0.5} min={0} max={1} step={0.1} precision={1} />
<InputNumber defaultValue={1280}
  formatter={n => `¥ ${n.toLocaleString()}`}
  parser={s => Number(s.replace(/[^\d.-]/g, ''))} />
<InputNumber controls={false} placeholder="输入序号" />
<InputNumber keyboard={false} defaultValue={42} />
<InputNumber status="error" defaultValue={42} />
```

---

## 文件映射

- Preview 文件：`input-number-preview.html`
- 组件目录：`frontend/components/InputNumber/index.html`
- 令牌文件：`frontend/shared/tokens.css`
