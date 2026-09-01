# Popconfirm · 气泡确认框

> **分类**：反馈  
> **Figma**：1439-12926

---

## 概述

轻量级二次确认，从触发元素弹出，不阻断主流程。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | `-` | 标题 |
| `onConfirm` | `() => void` | `-` | 确认回调 |
| `okText` | `string` | `'确定'` | 确认文案 |
| `cancelText` | `string` | `'取消'` | 取消文案 |
| `placement` | `12 种方位` | `'top'` | 位置 |

### 设计令牌

使用的 CSS 变量：

- `--color-warm-normaling`
- `--shadow-2`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

删除等不可逆操作必须使用；非破坏操作直接执行无需确认。

### 交互 Skill

【Popconfirm 交互 Skill】
触发：click 触发元素（默认 click），展开 fade 200ms，placement bottomLeft。

结构：问号 icon + 文字 + [取消][确认] 按钮。

使用规则：
- 危险操作必须用 Popconfirm（删除/重置/停用）
- title 明确说明后果（"确认删除设备「xxx」？删除后不可恢复"）
- onConfirm：执行操作，确认按钮 loading=true，完成后 message.success
- onCancel：关闭面板，不执行任何操作

样式：
- 确认按钮：okButtonProps={{ danger:true }}，danger 红色
- 取消按钮：default

禁止：轻量操作不用 Popconfirm（Toggle Switch / 切换状态）；超过 2 个操作用 Modal。


---

## 代码示例

```html
<Popconfirm title="-" onConfirm="-" okText="确定" />
```

---

## 文件映射

- Preview 文件：`popconfirm-preview.html`
- 组件目录：`frontend/components/Popconfirm/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
