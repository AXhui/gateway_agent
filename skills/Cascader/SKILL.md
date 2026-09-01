# Cascader · 级联选择

> **分类**：数据录入  
> **Figma**：1453-21039

---

## 概述

层级菜单选择器，逐级展开多列展示，适合 3-4 层固定层级。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `CascaderOption[]` | `[]` | 层级数据 |
| `value` | `string[]` | `-` | 选中路径 |
| `changeOnSelect` | `boolean` | `false` | 任意层级可选 |
| `separator` | `string` | `' / '` | 显示分隔符 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--shadow-2`


---

## 交互规则

### 设计指引

区域、行业分类用 Cascader；树型且可任意层级勾选用 TreeSelect。

### 交互 Skill

【Cascader 交互 Skill】
展开：多列 Panel，逐级联动。

交互：
- hover（单选）/ click 展开子级，当前列选中项高亮 bg --color-primary-bg
- changeOnSelect=true：每级都可作为最终值，否则只有叶子节点可选
- 搜索（showSearch）：输入后平铺展示所有匹配路径，路径以 / 拼接
- multiple：多选，选中项以 Tag 显示

加载（loadData）：动态加载子节点，loading 时 chevron 替换为 Spin。
空节点：叶子节点无 children，chevron 不显示。


---

## 代码示例

```html
<Cascader options="[]" value="-" />
```

---

## 文件映射

- Preview 文件：`cascader-preview.html`
- 组件目录：`frontend/components/Cascader/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
