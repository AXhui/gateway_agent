# Breadcrumb · 面包屑

> **分类**：导航  
> **Figma**：-

---

## 概述

显示当前页面在系统层级中的位置，支持 items 数据驱动。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `BreadcrumbItem[]` | `[]` | 层级列表 |
| `separator` | `ReactNode` | `'/'` | 分隔符 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-secondary`
- `--color-text-auxiliary`


---

## 交互规则

### 设计指引

层级超过 3 级使用面包屑，2 级及以内使用返回按钮。

### 交互 Skill

【Breadcrumb 交互 Skill】
交互：
- 非末级：hover text-decoration underline，color --color-primary-normal，cursor pointer，点击路由跳转
- 末级：color --color-text-primary，无 hover 效果，不可点
- 分隔符：默认 /，color --color-text-auxiliary

层级规则：最多显示 4 级；超过 4 级中间层用 ... 折叠，hover 展开 Dropdown。
配合 PageHeader 使用时放 PageHeader.breadcrumb 属性，不单独摆放。


---

## 代码示例

```html
<Breadcrumb items="[]" separator="/" />
```

---

## 文件映射

- Preview 文件：`breadcrumb-preview.html`
- 组件目录：`frontend/components/Breadcrumb/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
