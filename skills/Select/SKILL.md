# Select · 选择器

> **分类**：数据录入  
> **Figma**：1424-136357

---

## 概述

下拉选择框，支持单选、多选、搜索、远程加载。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `Option[]` | `[]` | 选项列表 |
| `mode` | `'multiple' | 'tags'` | `-` | 多选/标签 |
| `showSearch` | `boolean` | `false` | 可搜索 |
| `allowClear` | `boolean` | `false` | 允许清除 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--shadow-2`


---

## 交互规则

### 设计指引

选项 ≤7 用 Radio；8-30 用 Select；>30 用 AutoComplete 或远程搜索。

### 交互 Skill

【Select 交互 Skill】
状态同 Input（default/hover/focus/error/disabled）。

展开交互：
- 下拉：fade + slide 200ms，最大高度 256px，超出内部滚动
- 搜索（showSearch）：输入过滤 options，无结果显示 Empty 组件
- 多选（multiple/tags）：选中项以 Tag 形式显示在输入框内，× 删除单项
- 全选：Checkbox indeterminate + Select All 逻辑自定义实现
- 清空（allowClear）：hover 时 × 替换 chevron

options 加载：异步时显示 Spin，加载失败显示重试文本，不显示空 Empty。
超长 label：Tooltip 展示完整文本，option 内 ellipsis。


---

## 代码示例

```html
<Select options="[]" mode="-" />
```

---

## 文件映射

- Preview 文件：`select-preview.html`
- 组件目录：`frontend/components/Select/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
