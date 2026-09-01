# Popover · 气泡卡片

> **分类**：数据展示  
> **Figma**：1543-31022

---

## 概述

hover/click 触发的复杂内容浮层，比 Tooltip 容纳更多。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `ReactNode` | `-` | 内容 |
| `trigger` | `'hover' | 'click' | 'focus' | 'contextMenu'` | `'hover'` | 触发 |
| `placement` | `12 种方位` | `'top'` | 位置 |
| `title` | `ReactNode` | `-` | 标题 |

### 设计令牌

使用的 CSS 变量：

- `var(--color-bg-card)`
- `--shadow-2`
- `--color-divider-base-1`


---

## 交互规则

### 设计指引

短文字提示用 Tooltip；含按钮等交互内容用 Popover。

### 交互 Skill

【Popover 交互 Skill】
trigger: hover（信息提示）/ click（富内容操作面板）/ focus。

展开：fade + scale 200ms，placement 自动边界翻转（12个方向）。
关闭：
- hover trigger：鼠标离开 trigger 或 content 区域后 150ms 延迟关闭（避免抖动）
- click trigger：点击外部关闭，再次点击 trigger 切换

content 内容规则：
- 可放 Button、Link、Form（简单表单）
- 禁止放 Table 或超过 300px 高内容，改用 Drawer
- 宽度固定 240-320px，内容自适应高度

与 Tooltip 区别：Popover 有标题+富内容，Tooltip 只有一行文本。


---

## 代码示例

```html
<Popover content="-" trigger="hover" placement="top" />
```

---

## 文件映射

- Preview 文件：`popover-preview.html`
- 组件目录：`frontend/components/Popover/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
