# Tree · 树形控件

> **分类**：数据展示
> **Figma**：1491-32879
> **组件目录**：`../../../../frontend/components/Tree/`
> **版本**：v1.1.0（已对齐 antd `Tree` `treeData` / `checkable` / `selectable` / `defaultExpandAll` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**层级树形结构**，支持展开/收起、选择、勾选、拖拽，用于组织架构、设备分组、权限、目录等。

### 何时用
- **组织架构/设备分组**的层级展示。
- 需要**多选/勾选**的层级数据（权限、资产）。
- 需要**展开/收起**大量层级数据。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 两级以内下拉选择 | `TreeSelect` / `Cascader` |
| 平铺层级 | `List` |
| 面包屑路径 | `Breadcrumb` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `checkable` | 勾选 | 父子联动（`checkStrictly` 控制） |
| `selectable` | 选择 | 单选场景 |
| `defaultExpandAll` | 默认展开 | 层级深时按需展开 |
| 节点图标 | 类型标识 | 图标与节点语义一致 |

### 无障碍
- 节点可键盘导航（方向键）；`role="tree"`/`treeitem` + `aria-expanded`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 节点高 | 32px | 行高 |
| 缩进 | 24px/级 | 层级缩进 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 选中节点背景 | `--color-primary-bg` |
| 选中节点文字 | `--color-primary-normal` |
| hover 背景 | `--color-fill-base-hover` |
| 勾选框选中 | `--color-primary-normal` |

### 过渡
背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-bg`（选中背景）、`--color-primary-normal`（选中文字/勾选）、`--color-fill-base-hover`（hover）。

> **Token 修正**：`--color-brand-50` → `--color-primary-bg`（选中节点浅背景统一用主色淡背景 token）。

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
| `treeData` | `TreeNode[]` | `[]` | **antd 同名同值**：树数据 |
| `checkable` | `boolean` | `false` | **antd 同名同值**：勾选 |
| `selectable` | `boolean` | `true` | **antd 同名同值**：可选中 |
| `defaultExpandAll` | `boolean` | `false` | **antd 同名同值**：默认展开 |
| `expandedKeys` | `Key[]` | `-` | **antd 同名同值**：受控展开 |
| `checkedKeys` | `Key[]` | `-` | **antd 同名同值**：受控勾选 |
| `onSelect` | `(keys, info) => void` | `-` | **antd 同名同值**：选择回调 |
| `onCheck` | `(keys, info) => void` | `-` | **antd 同名同值**：勾选回调 |

### 受控/非受控语义
- `expandedKeys`/`checkedKeys` + `onExpand`/`onCheck` 为**受控**；缺省时内部维护非受控状态。

### 事件 / 键盘
- 方向键导航、Enter 选择、Space 勾选、→/← 展开收起。

---

## 代码示例

```html
<Tree
  checkable
  defaultExpandAll
  treeData={[
    { key: 'root', title: '全部设备', children: [
      { key: 'g1', title: '华东区', children: [{ key: 'd1', title: 'MS-1001' }] }
    ]}
  ]}
  onCheck={setChecked}
/>
```

---

## 文件映射

- Preview 文件：`tree-preview.html`
- 组件目录：`../../../../frontend/components/Tree/index.html`
- 令牌文件：`../../Tokens/tokens.css`
