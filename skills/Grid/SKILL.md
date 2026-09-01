# Grid · 栅格

> **分类**：布局  
> **Figma**：-

---

## 概述

24 栅格响应式布局系统，提供 Row / Col 与 5 档 gutter。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `span` | `number` | `-` | 列宽（1-24） |
| `offset` | `number` | `0` | 左偏移列数 |
| `gutter` | `number | [number, number]` | `0` | 列间距 |
| `justify` | `'start' | 'center' | 'end' | 'space-between'` | `'start'` | 水平对齐 |
| `align` | `'top' | 'middle' | 'bottom'` | `'top'` | 垂直对齐 |

### 设计令牌

使用的 CSS 变量：

- `--spacing-12`
- `--spacing-16`


---

## 交互规则

### 设计指引

页面级布局强制使用 24 栅格；卡片内部布局可使用 Flex/Space。

### 交互 Skill

【Grid 交互 Skill】
24列系统，gutter 推荐值：[16,16]（卡片列表）/ [24,0]（表单）/ [0,0]（满宽布局）。

响应式断点：
- xs(<576): span=24（单列）
- sm(≥576): 12或24
- md(≥768): 8或12
- lg(≥992): 6或8（4/3列看板）
- xl(≥1280): 标准布局固定

常见错误：不要在 Col 内部再嵌套 Row 超过 2 层；不要用 margin 代替 gutter；不要在 Grid 内混用固定 px 宽度。


---

## 代码示例

```html
<Grid span="-" offset="0" gutter="0" />
```

---

## 文件映射

- Preview 文件：`grid-preview.html`
- 组件目录：`frontend/components/Grid/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
