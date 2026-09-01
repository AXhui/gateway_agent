# Tooltip · 文字提示

> **分类**：数据展示  
> **Figma**：1478-144813

---

## 概述

轻量级 hover 文字提示，仅承载补充说明。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | `-` | 提示内容 |
| `placement` | `12 种方位` | `'top'` | 位置 |
| `trigger` | `'hover' | 'focus' | 'click'` | `'hover'` | 触发 |
| `color` | `string` | `-` | 颜色 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `var(--color-bg-card)`
- `--shadow-2`


---

## 交互规则

### 设计指引

图标按钮必须配 Tooltip；提示内容 ≤20 字。

### 交互 Skill

【Tooltip 交互 Skill】
trigger: hover（默认）/ click / focus。
placement：12个方向，默认 top，自动边界翻转。

交互：
- 出现：delay 100ms（避免鼠标路过触发），fade 160ms
- 消失：鼠标离开后立即消失（无延迟）

使用规则：
- 文字说明：只放 1-2 行纯文字；富内容用 Popover
- Icon 按钮必须加 Tooltip（title=功能说明）
- 截断文字（ellipsis）必须加 Tooltip 展示完整内容
- 禁止在 Tooltip 内放可交互元素（按钮/链接），改用 Popover


---

## 代码示例

```html
<Tooltip title="-" placement="top" trigger="hover" />
```

---

## 文件映射

- Preview 文件：`tooltip-preview.html`
- 组件目录：`frontend/components/Tooltip/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
