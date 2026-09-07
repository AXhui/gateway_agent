---
name: Notification
description: 通知提醒框（基础组件）
---

# Notification · 通知提醒框

> **分类**：反馈
> **Figma**：1432-49994
> **组件目录**：`../../../../frontend/components/Notification/`
> **版本**：v1.1.0（已对齐 antd `Notification` `type` / `message` / `placement` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**右上角的通知卡片**，可承载标题、详细描述、操作按钮，默认 4.5 秒自动关闭。相比 Message 更重，适合需要结构化信息（标题 + 正文 + 动作）的反馈。

### 何时用
- 需要**标题 + 详细描述**的反馈（系统通知、任务结果详情）。
- 需要**操作按钮**（「查看详情」「立即处理」）。
- 后台任务完成/失败，需告知结果并可跳转。
- 内容较长、需用户阅读数秒的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 只显示一句话 | `Message` |
| 需用户确认后继续 | `Modal` / `Popconfirm` |
| 页内常驻提示 | `Alert` |
| 页面级结果反馈 | `Result` |
| 进行中进度 | `Progress` / `Spin` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="success/info"` | 成功/中性通知 | 成功后不要附带过多描述 |
| `type="warning/error"` | 告警/错误通知 | error 要给出可执行的下一步 |
| `placement="topRight"` | 默认右上角 | 通知密集时考虑堆叠上限 |
| 带操作按钮 | 引导「查看/处理」 | 按钮动作要单一明确 |
| `duration=0` | 需用户主动关闭 | 关键通知可常驻，但要有关闭 |

### 无障碍
- `role="alert"`（error/warning）或 `role="status"`（success/info），读屏播报。
- 图标 `aria-hidden`，语义由标题 + 描述承载。
- 关闭按钮 `aria-label="关闭"`，可键盘聚焦。
- 自动关闭时长要足够读完内容；`duration=0` 需手动关闭。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 宽度 | 384px | 固定卡片宽 |
| 最小高度 | 自适应 | 标题 + 描述 |
| 内边距 | `16px 24px 16px 16px` | 图标 + 内容 |
| 图标尺寸 | 24×24 | 左上角 |
| 圆角 | `var(--radius-8)` | 卡片 |

### 状态视觉矩阵
| 类型 | 图标色 | 标题色 | 描述色 | 背景 |
|------|--------|--------|--------|------|
| success | `--color-success-normal` | `--color-text-primary` | `--color-text-secondary` | `var(--color-bg-card)` |
| error | `--color-error-normal` | `--color-text-primary` | `--color-text-secondary` | `var(--color-bg-card)` |
| info | `--color-primary-normal` | `--color-text-primary` | `--color-text-secondary` | `var(--color-bg-card)` |
| warning | `--color-warm-normal` | `--color-text-primary` | `--color-text-secondary` | `var(--color-bg-card)` |

### 过渡
滑入 + 淡入 `240ms var(--easing-standard)`；关闭淡出 `160ms`。

### 使用的设计令牌
`--color-success-normal`/`--color-error-normal`/`--color-primary-normal`/`--color-warm-normal`（图标）、`--color-bg-card`（卡片底）、`--color-text-primary`（标题）、`--color-text-secondary`（描述）、`--shadow-1`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--shadow-2`（卡片投影），已统一为 `--shadow-1`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 关闭按钮 hover |
| active（点击反馈） | 按下加深 |
| 键盘 | 关闭按钮 `Enter` |
| loading | 无加载态 |
| error | 自身即 `type="error"` 提示 |

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | **antd 同名同值**：通知类型 |
| `message` | `ReactNode` | `-` | **antd 同名同义**：标题 |
| `description` | `ReactNode` | `-` | **antd 同名同义**：详细描述 |
| `placement` | `'topRight' \| 'topLeft' \| 'bottomRight' \| 'bottomLeft'` | `'topRight'` | **antd 同名同值**：弹出位置 |
| `duration` | `number` | `4.5` | **antd 同名同值**：持续秒数（0 常驻） |
| `onClose` | `() => void` | `-` | 关闭回调 |
| `btn` | `ReactNode` | `-` | 操作按钮 |

### 受控/非受控语义
- 命令式 API（`notification.success({...})`）与声明式 `<Notification/>` 并存；通常用命令式全局实例。
- `duration=0` 常驻，需手动关闭。

### 事件 / 键盘
- 自动关闭（`duration` 控制）；关闭按钮可键盘触发。
- `btn` 操作按钮聚焦可见，动作单一明确。

---

## 代码示例

```html
notification.success({
  message: '固件升级完成',
  description: '设备已重启并恢复在线。',
  btn: <Button size="small">查看详情</Button>,
});
notification.error({ message: '同步失败', description: '网络连接超时，请稍后重试。' });
```

---

## 文件映射

- Preview 文件：`notification-preview.html`
- 组件目录：`../../../../frontend/components/Notification/index.html`
- 令牌文件：`../../../tokens/tokens.css`
