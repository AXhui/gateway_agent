---
name: TreeSelect
description: 树选择（基础组件）
---

# TreeSelect · 树选择

> **分类**：数据录入
> **Figma**：1453-92859
> **组件目录**：`../../../../frontend/components/TreeSelect/`
> **版本**：v1.1.0（已对齐 antd `TreeSelect` `treeData` / `treeCheckable` / `showSearch` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**树形结构选择器**。用于「组织架构、地区、分类」等有层级关系的数据取值，下拉展开一棵可勾选的树，兼顾层级浏览与多选。

### 何时用
- 数据天然**有层级**（部门/地区/分类/设备分组），需要按层级导航选取。
- 需要**级联勾选**（勾父节点自动带出子节点）。
- 层级较深（>3 层）且需要展开/收起导航。
- 多选 + 层级混合（如给某角色分配多棵子树权限）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 层级固定 ≤3 层、逐列平铺展示 | `Cascader` |
| 无层级、扁平枚举 | `Select` |
| 海量候选项需输入联想 | `AutoComplete` |
| 左右两列批量搬运数据 | `Transfer` |
| 只读展示层级 | `Tree` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 单选 | 选中一个节点，展示完整路径 | 父节点可选中时需 `treeCheckable=false` |
| `multiple` | 多选节点，展示 `a / b / c` 回显 | 不要和多级路径混淆展示 |
| `treeCheckable` | 树带复选框，级联勾选 | 勾选语义需明确父子联动（全选/半选） |
| `showSearch` | 树内搜索节点名称，命中高亮 | 大量节点时必须开启，否则无法定位 |
| 严格模式 | `treeCheckStrictly` 父子勾选不联动 | 权限分配等需精确到单节点的场景 |

### 无障碍
- 触发框为可聚焦按钮，下拉用 `role="tree"` + `role="treeitem"`，`aria-expanded` 标记展开。
- 键盘 `↑ ↓` 移动节点、`← →` 收起/展开、`Enter`/`Space` 勾选。
- 勾选状态用 `aria-checked`（true/false/mixed）播报。
- 回显值需读屏可读完整路径，不要只显示叶子节点名。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 触发框高度 | 24/32/40（sm/md/lg） | 对齐 `Select` |
| 下拉内边距 | 4px | 与 `Select` 一致 |
| 树节点行高 | 32px | padding `6px 12px`，缩进 20px/层 |
| 复选框尺寸 | 16×16 | 与 `Checkbox` 一致 |
| 下拉圆角 | `var(--radius-8)` | 悬浮层 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `var(--color-border-base)`，bg `var(--color-bg-card)` |
| 聚焦 | 边框 `var(--color-primary-normal)` + focus ring `0 0 0 3px var(--color-primary-bg)` |
| 选中节点 | 文字 `var(--color-primary-normal)`，选中底 `--color-primary-bg` |
| hover 节点 | bg `var(--color-bg-page)` |
| 半选（父） | 复选框中间横杠 `--color-primary-normal` |
| 命中搜索 | 高亮命中片段 `--color-primary-normal` |

### 过渡
下拉展开淡入 120ms；节点 hover/选中背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（聚焦/选中/高亮）、`--color-primary-bg`（选中节点底，等价 `--color-fill-primary`）、`--color-border-base`（默认边框）、`--color-bg-card`（触发框/下拉底）、`--color-bg-page`（hover 节点）、`--color-text-primary`、`--color-text-secondary`、`--color-text-disable`、`--radius-4`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（选中节点底），已统一为 `--color-primary-bg`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 选项 hover |
| active（点击反馈） | 按下加深 |
| 键盘 | `↑↓←→` 导航、`Enter` 选中、`Esc` 关闭 |
| loading | 树异步加载（回指总纲） |
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
| `treeData` | `TreeNode[]` | `[]` | **antd 同名同义**：树数据（`{title,value,children?}`） |
| `value` | `string \| string[]` | `-` | 受控选中值（单选 string / 多选 string[]） |
| `defaultValue` | `string \| string[]` | `-` | **antd 别名**，非受控默认值 |
| `multiple` | `boolean` | `false` | **antd 同名同值**：多选 |
| `treeCheckable` | `boolean` | `false` | **antd 同名同值**：树带复选框 |
| `treeCheckStrictly` | `boolean` | `false` | **antd 同名同值**：父子勾选不联动 |
| `showSearch` | `boolean` | `false` | **antd 同名同值**：树内搜索 |
| `placeholder` | `string` | `'请选择'` | 占位文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 触发框尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(value, label) => void` | `-` | 选中变化回调 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，选中经 `onChange(value, label)` 通知外部；否则内部维护 `defaultValue`。
- `multiple` / `treeCheckable` 决定 `value` 类型：单选为 `string`，多选/勾选为 `string[]`。

### 事件 / 键盘
- 触发框展开/收起下拉；树节点 `↑ ↓` 移动、`← →` 收起/展开、`Enter`/`Space` 勾选。
- 搜索过滤树节点，命中高亮；`treeCheckStrictly` 下父节点勾选不自动联动子节点。

---

## 代码示例

```html
<TreeSelect treeData={deptTree} defaultValue="dept-1" />
<TreeSelect multiple treeCheckable treeData={permTree} onChange={setKeys} />
<TreeSelect showSearch treeData={regionTree} placeholder="搜索地区" />
<TreeSelect treeCheckStrictly treeData={aclTree} value={keys} onChange={setKeys} />
```

---

## 文件映射

- Preview 文件：`treeselect-preview.html`
- 组件目录：`../../../../frontend/components/TreeSelect/index.html`
- 令牌文件：`../../../tokens/tokens.css`
