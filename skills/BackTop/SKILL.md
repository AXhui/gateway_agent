# BackTop · 回到顶部

> **分类**：导航  
> **Figma**：1424-144522

---

## 概述

页面右下浮动的回到顶部按钮，滚动 400px 后出现。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visibilityHeight` | `number` | `400` | 显示阈值 |
| `duration` | `number` | `450` | 滚动时长（ms） |
| `onClick` | `() => void` | `-` | 点击回调 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--shadow-2`


---

## 交互规则

### 设计指引

配合 Affix 使用；不要叠加多个浮动按钮。

### 交互 Skill

【BackTop 交互 Skill】
交互：
- 出现时机：页面滚动超过 visibilityHeight（默认 400px）时淡入（opacity 0→1, 200ms）
- 点击：scroll to top，behavior smooth
- hover：bg --color-primary-normal，color #fff，box-shadow --shadow-2

位置：fixed bottom 40px right 24px，z-index 90。
禁止与 Affix 底部操作栏重叠，需留出安全距离。


---

## 代码示例

```html
<BackTop visibilityHeight="400" duration="450" onClick="-" />
```

---

## 文件映射

- Preview 文件：`backtop-preview.html`
- 组件目录：`frontend/components/BackTop/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
