---
name: Segmented
description: 分段控制器（基础组件）
---

# Segmented · 分段控制器

> **分类**：数据录入
> **Figma**：1481-177125
> **组件目录**：`../../../../frontend/components/Segmented/`
> **版本**：v1.1.0（已对齐 antd `Segmented` `options` / `block` / `size` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**互斥的视图/形态切换**控件。介于 `Radio.Button` 与 `Tabs` 之间——比 Radio 视觉更强、比 Tabs 更轻量。选中即切换内容，无需二次提交。

### 何时用
- 在 2~5 个**互斥**形态间切换，且切换后主区域内容整体变化（卡片/列表/表格、日/周/月）。
- 需要「当前选中项」一眼可辨、点按区域明确。
- 空间有限，不想引入整行 Tab 栏时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 表单字段的值选择（非视图切换） | `Radio.Group` |
| 内容分组较多、需整行 Tab 栏 | `Tabs` |
| 开/关二态 | `Switch` |
| 多选、可同时成立 | `Checkbox.Group` |
| 选项很多需要搜索 | `Select` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 2~5 个短选项，胶囊滑块切换 | 不要超过 5 个，撑满一行 |
| `block` | 撑满父容器等分宽度 | 选项文案过长时不要用 block，会折行 |
| `size="small"` | 紧凑行内、卡片头 | 不要 small 与默认混排 |
| `disabled`（项级） | 不可用形态（如「大屏暂未开放」） | 不要整组禁用来表达只读 |
| 图标+文字 | 视觉型形态切换（卡片/列表图标） | 图标要表意，不要装饰性图标 |

### 无障碍
- 根为 `role="radiogroup"`，每个选项 `role="radio"` + `aria-checked`，读屏播报「已选/未选」。
- 键盘 `← →` 切换选项，`Tab` 聚焦进入。
- 选中滑块动画由 CSS `transform` 实现，不要只靠颜色区分选中态。
- 不要用 `aria-label` 替代可见文字；图标选项需补 `aria-label` 说明含义。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 容器圆角 | `var(--radius-8)` | 外框胶囊 |
| 选项内高 | 见 size 表 | 减去容器 padding 4px |
| 滑块圆角 | `var(--radius-8)` | 跟随外框 |
| 容器背景 | `var(--color-bg-hover)` | 未选中轨道底 |
| 滑块背景 | `var(--color-bg-card)` | 白色，配 `--shadow-1` |

### size 尺寸表
| size | 容器高度 | 字号 | 左右 padding |
|------|----------|------|-------------|
| `small` | 24px | 12px | 12px |
| `middle` | 28px | 14px | 16px |
| `large` | 32px | 16px | 16px |

### 状态视觉矩阵
| 状态 | 滑块 | 文字 |
|------|------|------|
| 选中 | `var(--color-bg-card)` + `--shadow-1` | `var(--color-text-primary)` |
| 未选中 | 透明（露出容器 `--color-bg-hover`） | `var(--color-text-secondary)` |
| hover（未选） | 透明 | `var(--color-text-primary)` |
| disabled | 选中态降 `opacity:0.6` | `var(--color-text-disable)` |

### 过渡
滑块 `transform:translateX` 与背景同步 `200ms var(--easing-standard)`；文字色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-card`（滑块底）、`--color-bg-hover`（容器底）、`--color-text-primary`（选中文字）、`--color-text-secondary`（未选文字）、`--color-text-disable`（禁用文字）、`--shadow-1`（滑块投影）、`--radius-8`、`--duration-fast`、`--easing-standard`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 项 hover `--color-bg-hover` |
| active（点击反馈） | 按下加深 |
| 键盘 | `←/→` 切换、`Enter`/`Space` 选中 |
| loading | 无加载态 |
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
| `options` | `(string \| number \| { label, value, disabled? })[]` | `[]` | **antd 同名同义**：选项集合 |
| `value` | `string \| number` | `-` | 受控选中值 |
| `defaultValue` | `string \| number` | `-` | **antd 别名**，非受控默认值 |
| `block` | `boolean` | `false` | **antd 同名同值**：撑满父容器等分 |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | **antd 同名同值**：尺寸 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `onChange` | `(value: string \| number) => void` | `-` | 回传新选中值（非事件） |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，点击仅触发 `onChange(newVal)`；否则内部维护 `defaultValue`。

### 事件 / 键盘
- 根为 `role="radiogroup"` 容器，选项为 `role="radio"`；`← →` 切换，`Space` 确认。
- 滑块位置由选中 index 计算，用 `transform:translateX(index * itemWidth)` 平滑滑动。

---

## 代码示例

```html
<Segmented options={['日', '周', '月']} defaultValue="周" />
<Segmented block options={[{label:'卡片',value:'card'},{label:'列表',value:'list'}]} value={view} onChange={setView} />
<Segmented size="small" options={['轻量', '标准', '完整']} />
<Segmented options={[{label:'实时',value:'live'},{label:'历史',value:'hist',disabled:true}]} />
```

---

## 文件映射

- Preview 文件：`segmented-preview.html`
- 组件目录：`../../../../frontend/components/Segmented/index.html`
- 令牌文件：`../../../tokens/tokens.css`
