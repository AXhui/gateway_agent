# Tree · 树形控件

> **分类**：数据展示  
> **Figma**：1478-129786

---

## 概述

层级数据可视化，支持选中、勾选、拖拽、虚拟滚动。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `treeData` | `TreeNode[]` | `[]` | 数据 |
| `checkable` | `boolean` | `false` | 显示复选框 |
| `draggable` | `boolean` | `false` | 可拖拽 |
| `selectedKeys` | `string[]` | `-` | 选中 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`


---

## 交互规则

### 设计指引

>500 节点开虚拟滚动；拖拽场景必须有撤销操作。

### 交互 Skill

【Tree 交互 Skill】
展开/折叠：点击 chevron（▶/▼），动画 160ms。

交互：
- checkable=true：Checkbox 多选，父子节点联动（indeterminate 状态）
- selectable=true（默认）：click label 选中，高亮 bg --color-primary-bg
- draggable=true：拖拽排序，拖拽中 dashed border 指示目标位置
- 右键菜单：onRightClick 展示 ContextMenu（DropdownMenu contextMenu 模式）

异步加载（loadData）：展开时触发，loading 显示 Spin，加载完成后追加子节点。
搜索高亮：过滤后只显示匹配节点和其父节点路径，不匹配节点隐藏（不折叠）。


---

## 代码示例

```html
<Tree treeData="[]" />
```

---

## 文件映射

- Preview 文件：`tree-preview.html`
- 组件目录：`frontend/components/Tree/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
