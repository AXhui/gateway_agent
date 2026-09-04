# Slider · 滑动输入条

> **分类**：数据录入
> **Figma**：1453-4767
> **组件目录**：`../../../../frontend/components/Slider/`
> **版本**：v1.1.0（已对齐 antd `range` / `marks` / `step` / `defaultValue` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**连续或离散数值**的拖拽输入控件。用于「在区间内快速取一个近似值」，不适合需要精确数字输入的场景。

### 何时用
- 用户在**已知上下限**内快速取值（音量、亮度、缩放、额度百分比）。
- 值的大小**相对感知**即可，不追求绝对精确（如「预留带宽」）。
- 需要展示**范围区间**（`range` 两个滑块）的筛选，如价格区间、时间区间。
- 需要**刻度提示**关键档位（`marks`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 需要精确到个位的数值 | `InputNumber`（或 Slider 右侧配 InputNumber） |
| 步长粒度下取值含糊、误触率高 | `InputNumber` / `Select` |
| 数据跨度极大（对数级，如 1~1e9） | `InputNumber`，Slider 线性刻度失真 |
| 只读展示进度/占比 | `Progress` |
| 选项是离散枚举（非数值） | `Select` / `Radio` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 单个 thumb，快速取单值 | 不要脱离 min/max 语境裸放 |
| `range` | 两个 thumb 表达区间 | 两个 thumb 不可交叉，最小间距 = step |
| `marks` | 关键刻度/阈值提示 | marks 不要过密（≤5 个），喧宾夺主 |
| `step` | 离散取值（如 0/25/50/75/100） | 连续滑块不要设 step=1 假装连续 |
| `disabled` | 不可调节时 | 不要用 disabled 表达「当前值」 |
| `Tooltip`（拖拽中） | 拖拽实时显示当前值 | 松开后不常驻，避免遮挡 |

### 无障碍
- 根为可聚焦元素（原生 `role="slider"` + `tabindex`），读屏播报 `aria-valuemin/max/now`。
- 键盘 `←→` 按 `step` 调节，`Home/End` 跳 min/max；`range` 时上下箭头切换 focus 的 thumb。
- 拖拽用 Pointer Events + `setPointerCapture`，触屏/鼠标/笔统一。
- 不要只靠颜色显示进度，刻度（marks）或 Tooltip 提供数值反馈。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| 属性 | 值 | 说明 |
|------|-----|------|
| 轨道高度 | 4px | `--spacing-4` |
| thumb 直径 | 16px | 固定 |
| 轨道圆角 | `var(--radius-full)` | 胶囊 |
| thumb 圆角 | `var(--radius-full)` | 正圆 |
| thumb 边框 | 2px `var(--color-primary-normal)` | 白底蓝边 |
| 已走进度高度 | 4px | 与轨道同高 |

### 状态视觉矩阵
| 状态 | 已走进度 | 未走轨道 | thumb |
|------|----------|----------|-------|
| default | `var(--color-primary-normal)` | `var(--color-fill-base-hover)` | 白底 + 2px 蓝边 |
| hover | 同 default | 同 default | thumb 放大 1.2x（19.2px） |
| dragging | 同 default | 同 default | thumb 放大 1.2x + `--shadow-diffusion-primary` |
| disabled | `var(--color-divider-base-1)` | `var(--color-divider-base-1)` | `opacity:0.5`，无边框高亮 |

### Tooltip（拖拽中）
拖拽时 thumb 上方显示当前值 Tooltip，bg `var(--color-gray-09)`、文字 `var(--color-text-constant-normal)`、圆角 `var(--radius-4)`、字号 12px，松开后隐藏。

### 过渡
thumb 放大 / 背景色 同步 `160ms var(--easing-standard)`；拖拽值变化即时（无动画延迟）。

### 使用的设计令牌
`--color-primary-normal`（已走进度/thumb 边）、`--color-fill-base-hover`（未走轨道）、`--color-primary-bg`（thumb 拖拽 diffusion 背景）、`--color-divider-base-1`（禁用轨道）、`--color-gray-09`（Tooltip 底）、`--color-text-constant-normal`（Tooltip 文字）、`--radius-full`、`--radius-4`、`--spacing-4`、`--shadow-diffusion-primary`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`，已统一为 `--color-primary-bg`（品牌蓝 50 号浅底，等价 `--color-fill-primary`）。

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
| `min` | `number` | `0` | 最小值（antd 同名同义） |
| `max` | `number` | `100` | 最大值（antd 同名同义） |
| `step` | `number` | `1` | 步长（antd 同名同义） |
| `value` | `number \| [number, number]` | `-` | 受控值；`range` 时传二元数组 |
| `defaultValue` | `number \| [number, number]` | `-` | **antd 别名**，非受控默认值 |
| `range` | `boolean` | `false` | **antd 同名同值**：双 thumb 区间模式 |
| `marks` | `{ [value: number]: ReactNode }` | `-` | **antd 同名同义**：刻度提示 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(value: number \| [number, number]) => void` | `-` | 拖拽中持续回调，回传新值 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，拖拽仅触发 `onChange(newVal)` 通知外部更新，位置由外部 value 决定。
- 否则内部维护 `defaultValue`，拖拽直接更新内部状态。

### 事件 / 键盘
- 拖拽用 Pointer Events（`pointerdown` → `setPointerCapture` → `pointermove`），`eventToVal` 将指针 X 映射到 `[min,max]` 并 `clamp` + 对齐 `step`。
- 点击轨道跳转最近 `step` 档位（`pct` → 值）。
- 键盘 `←→` 按 step 增减，`Home/End` 跳 min/max；`range` 两个 thumb 不可交叉（最小间距 = step）。

---

## 代码示例

```html
<Slider defaultValue={40} />
<Slider marks={{0:'0',25:'25',50:'50',75:'75',100:'100'}} defaultValue={30} />
<Slider range defaultValue={[20, 70]} />
<Slider range defaultValue={[30, 60]} disabled />
<Slider value={v} onChange={setV} />
```

---

## 文件映射

- Preview 文件：`slider-preview.html`
- 组件目录：`../../../../frontend/components/Slider/index.html`
- 令牌文件：`../../Tokens/tokens.css`
