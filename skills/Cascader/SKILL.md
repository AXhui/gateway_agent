# Cascader · 级联选择

> **分类**：数据录入
> **Figma**：1453-21039
> **组件目录**：`frontend/components/Cascader/`
> **版本**：v1.1.0（已对齐 antd `Cascader` `options` / `changeOnSelect` / `separator` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**逐级展开的多列级联选择器**。选中一级后右侧展开下一级，适合层级**固定且浅（3-4 层）**的数据，如「省/市/区」「行业/细分」等。

### 何时用
- 层级固定且 ≤4 层，逐列平铺更直观。
- 需要「边选边看到下一级」，路径展示清晰（`A / B / C`）。
- 最终值通常是**叶子节点**，逐级收窄选择范围。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 层级深（>4）或需展开/收起导航 | `TreeSelect` |
| 任意层级都可选 + 多选勾选 | `TreeSelect` |
| 无层级、扁平枚举 | `Select` |
| 海量候选项需输入联想 | `AutoComplete` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 逐级选择，回显 `A / B / C` | 层级过深时改用 TreeSelect |
| `changeOnSelect` | 任意层级即可选中（非叶子也可） | 默认只能选叶子，需明确业务是否允许选中父级 |
| `separator` | 自定义分隔符（`' / '` → `'>'`） | 分隔符要全局一致，不要随意换 |
| 搜索（扩展） | 输入直接过滤末端路径 | 层级深或量大时必开 |

### 无障碍
- 触发框可聚焦，下拉多列用 `role="menu"` + `role="menuitem"`，`aria-expanded` 标记展开的父级。
- 键盘 `↑ ↓` 在当前列移动，`→` 进入下一列，`←` 返回上一列，`Enter` 选中，`Esc` 关闭。
- 回显路径用 `aria-valuetext` 播报完整 `A / B / C`。
- 高亮当前列选中项，读屏可感知列位置。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 触发框高度 | 24/32/40（sm/md/lg） | 对齐 `Select` |
| 列宽 | 160px/列 | 多列平铺 |
| 列表项高 | 32px | padding `6px 12px` |
| 下拉内边距 | 4px | 每列独立滚动 |
| 下拉圆角 | `var(--radius-8)` | 悬浮层 |
| 下拉投影 | `0 6px 20px rgba(11,18,32,0.08)` | 悬浮层 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `var(--color-border-base)`，bg `var(--color-bg-card)` |
| 聚焦 | 边框 `var(--color-primary-normal)` + focus ring |
| 当前列选中项 | 文字 `var(--color-primary-normal)`，选中底 `--color-primary-bg` |
| hover 项 | bg `var(--color-bg-page)` |
| 有子级的项 | 右侧箭头 icon，`--color-text-secondary` |
| 空列 | 「暂无数据」`--color-text-auxiliary` |

### 过渡
下拉展开淡入 120ms；项 hover/选中背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（聚焦/选中）、`--color-primary-bg`（选中底，等价 `--color-fill-primary`）、`--color-border-base`（默认边框）、`--color-bg-card`（触发框/下拉底）、`--color-bg-page`（hover 项）、`--color-text-primary`、`--color-text-secondary`、`--color-text-auxiliary`、`--radius-4`、`--radius-8`、`--shadow-1`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（选中底）与 `--shadow-2`（下拉投影），已分别统一为 `--color-primary-bg` 与 `--shadow-1`。

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
| `options` | `CascaderOption[]` | `[]` | **antd 同名同义**：层级数据（`{label,value,children?}`） |
| `value` | `string[]` | `-` | 受控选中路径（如 `['浙江','杭州']`） |
| `defaultValue` | `string[]` | `-` | **antd 别名**，非受控默认路径 |
| `changeOnSelect` | `boolean` | `false` | **antd 同名同值**：任意层级可选 |
| `separator` | `string` | `' / '` | **antd 同名同值**：回显分隔符 |
| `placeholder` | `string` | `'请选择'` | 占位文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 触发框尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(value: string[], selectedOptions) => void` | `-` | 选中路径回调 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，选中经 `onChange(value, selectedOptions)` 通知外部；否则内部维护 `defaultValue`。
- `value` 为完整路径数组，回显时用 `separator` 拼接展示。

### 事件 / 键盘
- 触发框展开多列面板；`↑ ↓` 列内移动，`→` 进入下一列，`←` 返回上一列，`Enter` 选中，`Esc` 关闭。
- `changeOnSelect` 为 true 时任意层级点击即触发 `onChange`；false 时仅叶子节点触发。

---

## 代码示例

```html
<Cascader options={regionOptions} defaultValue={['zhejiang','hangzhou']} />
<Cascader changeOnSelect options={industryOptions} onChange={setPath} />
<Cascader separator=">" options={areaOptions} placeholder="选择地区" />
```

---

## 文件映射

- Preview 文件：`cascader-preview.html`
- 组件目录：`frontend/components/Cascader/index.html`
- 令牌文件：`frontend/shared/tokens.css`
