# Message · 全局提示

> **分类**：反馈  
> **Figma**：1430-44835

---

## 概述

顶部居中的瞬时全局提示，3 秒自动关闭。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'success' | 'error' | 'info' | 'warning' | 'loading'` | `'info'` | 类型 |
| `content` | `ReactNode` | `-` | 内容 |
| `duration` | `number` | `3` | 持续时间(秒) |
| `onClose` | `() => void` | `-` | 关闭回调 |

### 设计令牌

使用的 CSS 变量：

- `--shadow-2`
- `--color-success-normal`
- `--color-error-normal`


---

## 交互规则

### 设计指引

操作结果反馈首选；不要承载需用户阅读 >5 秒的内容。

### 交互 Skill

【Message 交互 Skill】
API 调用：message.success / error / warn / info / loading()。

行为：
- 位置：页面顶部居中，z-index 9999
- 出现：fade + slideDown 200ms
- 持续：默认 3s 后自动消失（loading 需手动 close）
- 多条：垂直堆叠，先进先出

使用场景：
- 操作成功：message.success('保存成功')，不用 Notification
- 接口报错：message.error(err.message)
- 异步操作：message.loading('提交中...')，完成后 .then(close).then(success)

禁止：不用 Message 展示超过 20 字的内容；不用于需要用户操作的提示（用 Modal/Notification）。


---

## 代码示例

```html
<Message type="info" content="-" duration="3" />
```

---

## 文件映射

- Preview 文件：`message-preview.html`
- 组件目录：`frontend/components/Message/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
