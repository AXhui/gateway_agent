---
name: B_Eg71Message
version: 1.0.0
description: 全局消息 Toast（基础组件 · EG71）
---

# B_Eg71Message · 全局消息 Toast

## 1. 描述

**这是什么**：EG71 页面顶部居中的全局消息提示（toast），L2 `ms-message-stack`/`ms-message` 的业务封装：success / error 两语义态，多条堆叠，success 默认 2.4s 自动消失，error 持久不消失（EG71 Alert 持久性契约）需手动关闭。事件驱动——宿主对容器 `dispatchEvent('eg71-message-show')`。

**不是什么**：不是页内横幅 Alert（那是 `bc-eg71-alert-bar`，占页面四个位置之一）；不是右上角通知 Notification；不承载标题/操作按钮，只有一行文案。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.hidden` | boolean | `true` | render 产物栈容器初始隐藏，首条消息出现即显示 |
| 事件 `eg71-message-show` detail `{type, text, duration}` | — | — | type=`success`/`error`；text 必填；duration 覆盖自动消失（ms，error 默认 0=不消失） |

atoms 依赖：`S_Message`（`ms-message-stack`/`ms-message`，L2 无独立运行时助手，本组件为唯一入口）+ `S_Icon`（check/warn/close 16px）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| success | `type:'success'` | 绿 check 图标 + 主文字色，2.4s 自动消失 |
| error | `type:'error'` | 红 warn 图标 + 主文字色，**不自动消失**，可点 × 关闭 |
| hover × | 鼠标悬停关闭钮 | `--color-text-secondary` |

## 4. 场景

- **何时用**：瞬时操作反馈（保存成功、下载已开始）、网络异常红 toast（「网络连接失败，请检查网络」）。
- **何时不用**：页内持久引导/异常横幅 → `bc-eg71-alert-bar`；带标题和操作的富通知 → `ms-notification`；弹窗内提示 → 弹窗 body 内 Alert。

## 5. Token

`--color-error-normal` / `--color-success-normal`（语义图标色）、`--color-text-primary` / `--color-text-auxiliary`（文案与关闭钮）、`--spacing-4/8/16`（内距与排布）——其余视觉由 L2 `ms-message*` 承载。

## 6. 依赖

`render(ctx)` + `bind(root)`；无新增基础原子，仅封装 `S_Message` 序列。注册：`registry-business.js#bc-eg71-message`。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
app.insertAdjacentHTML('beforeend', B['bc-eg71-message'].render({}));
B['bc-eg71-message'].bind(app);
// 触发：宿主任意位置
app.dispatchEvent(new CustomEvent('eg71-message-show',
  { detail: { type: 'error', text: 'Network connection failed. Please check the network.' } }));
```

## 8. 版本

见 frontmatter `version:`。
