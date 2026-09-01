# Notification · 通知提醒框

> **分类**：反馈  
> **Figma**：1432-49994

---

## 概述

右上角的通知卡片，可承载标题、详细描述、操作按钮。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'success' | 'info' | 'warning' | 'error'` | `'info'` | 类型 |
| `message` | `ReactNode` | `-` | 标题 |
| `description` | `ReactNode` | `-` | 详细 |
| `placement` | `4 角` | `'topRight'` | 位置 |
| `duration` | `number` | `4.5` | 持续时间 |

### 设计令牌

使用的 CSS 变量：

- `--shadow-2`
- `var(--color-bg-card)`
- `--color-success-normal`


---

## 交互规则

### 设计指引

承载详细描述时用 Notification；只显示一句话用 Message。

### 交互 Skill

【Notification 交互 Skill】
API：notification.open({ message, description, icon, btn, duration, placement })。

与 Message 区别：Notification 有标题+描述+操作按钮，适合需要用户阅读和操作的提醒。

位置：topRight（默认）/ topLeft / bottomRight / bottomLeft。
duration：默认 4.5s；需用户操作时设 duration=0（不自动关闭）。

使用场景：
- 系统通知（新消息/任务完成）：带 icon + 描述 + "查看"Link
- 后台任务完成：duration=0，btn=["查看结果"，"关闭"]
- 异常告警：icon=<AlertTriangle color=--color-error-normal />

禁止：不同时弹出 3 条以上；不用于操作即时反馈（用 Message）。


---

## 代码示例

```html
<Notification type="info" message="-" description="-" />
```

---

## 文件映射

- Preview 文件：`notification-preview.html`
- 组件目录：`frontend/components/Notification/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
