# TreeSelect · 树选择

> **分类**：数据录入  
> **Figma**：1453-92859

---

## 概述

树形结构选择器，支持级联勾选、严格模式、搜索。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `treeData` | `TreeNode[]` | `[]` | 树数据 |
| `multiple` | `boolean` | `false` | 多选 |
| `treeCheckable` | `boolean` | `false` | 显示复选框 |
| `showSearch` | `boolean` | `false` | 可搜索 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`


---

## 交互规则

### 设计指引

组织架构、地区、分类等层级数据首选 TreeSelect。

### 交互 Skill

【TreeSelect 交互 Skill】
展开：点击 Input 区域显示树形 Popup，宽度同触发元素。

树交互：
- 展开/折叠节点：点击 chevron 图标，动画 160ms
- 选择：点击 label 选中（单选模式关闭下拉，多选模式保持展开）
- checkable 多选：父节点 indeterminate 状态表示部分子节点选中
- showCheckedStrategy：SHOW_ALL / SHOW_PARENT / SHOW_CHILD 控制回显策略

搜索（showSearch）：高亮匹配文字，自动展开匹配路径，不匹配节点折叠隐藏。


---

## 代码示例

```html
<TreeSelect treeData="[]" />
```

---

## 文件映射

- Preview 文件：`tree-select-preview.html`
- 组件目录：`frontend/components/TreeSelect/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
