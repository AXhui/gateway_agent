# List · 列表

> **分类**：数据展示  
> **Figma**：1486-105119

---

## 概述

通用列表，支持基础、栅格、加载、分页、虚拟滚动。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dataSource` | `any[]` | `[]` | 数据源 |
| `renderItem` | `(item) => ReactNode` | `-` | 项渲染 |
| `grid` | `object` | `-` | 栅格配置 |
| `pagination` | `object | false` | `-` | 分页 |

### 设计令牌

使用的 CSS 变量：

- `--color-divider-base-1`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

>100 行考虑虚拟滚动；通用 CRUD 优先用 Table。

### 交互 Skill

【List 交互 Skill】
grid 模式：等同 Row+Col 卡片布局，Item 为 Card。
非 grid：垂直列表，Item 间 Divider 分隔。

交互：
- hover（可点击项）：bg --color-bg-page，cursor pointer
- Item actions：右侧操作链接（link 类型 Button），hover color --color-primary-normal
- 加载更多：底部 loadMore 区域，Button default"加载更多" 或 Spin（无限滚动）

虚拟滚动：列表项 > 200 条使用 List.Virtual（固定高度 itemHeight），避免大 DOM。
空态：dataSource=[] 显示 Empty 组件（内置）。


---

## 代码示例

```html
<List dataSource="[]" renderItem="-" grid="-" />
```

---

## 文件映射

- Preview 文件：`list-preview.html`
- 组件目录：`frontend/components/List/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
