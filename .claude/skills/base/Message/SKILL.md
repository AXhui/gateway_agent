---
name: Message
description: 全局提示（基础组件）
---

# Message · 全局提示

> **分类**：反馈
> **Figma**：1430-44835
> **组件目录**：`../../../../frontend/components/Message/`
> **版本**：v1.1.0（已对齐 antd `Message` `type` / `duration` / `content` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**顶部居中的瞬时全局提示**，默认 3 秒自动关闭，用于操作结果的一次性反馈。不打断用户当前操作，反馈后自动消失。

### 何时用
- 操作**成功/失败**的一次性反馈（保存成功、删除失败）。
- 需要**短暂**告知用户结果，无需阅读长内容。
- 后台操作完成/出错的通知（上传完成、同步失败）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 需承载标题 + 详细描述 + 操作 | `Notification` |
| 需要用户确认后继续 | `Modal` / `Popconfirm` |
| 页内常驻提示 | `Alert` |
| 需阅读 >5 秒的长内容 | `Notification` |
| 加载过程提示 | `Spin` / `Progress` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="success"` | 操作成功 | 不要频繁成功刷屏 |
| `type="error"` | 操作失败 | 错误信息要给出原因，不要只写「失败」 |
| `type="info"` | 中性提示 | 不要用 info 表达警告 |
| `type="warning"` | 有风险需注意 | 警告要有下一步，不要含糊 |
| `type="loading"` | 进行中（手动关闭） | 有明确终态的任务用 Progress/Spin |

### 无障碍
- `role="alert"`（error/warning）或 `role="status"`（success/info），读屏播报。
- 图标 `aria-hidden`，语义由文字承载。
- 自动关闭时长要足够读完内容（一般 ≥3 秒）。
- 多条 Message 堆叠要有上限，避免遮挡内容。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 高度 | 40px | 图标 + 文字 |
| 内边距 | `8px 16px` | 水平留白 |
| 图标尺寸 | 16×16 | 左侧 |
| 圆角 | `var(--radius-8)` | 条形容器 |
| 定位 | 顶部居中 | 距顶 24px |

### 状态视觉矩阵
| 类型 | 图标色 | 文字色 | 背景 |
|------|--------|--------|------|
| success | `--color-success-normal` | `--color-text-primary` | `var(--color-bg-card)` |
| error | `--color-error-normal` | `--color-text-primary` | `var(--color-bg-card)` |
| info | `--color-primary-normal` | `--color-text-primary` | `var(--color-bg-card)` |
| warning | `--color-warm-normal` | `--color-text-primary` | `var(--color-bg-card)` |

### 过渡
滑入 + 淡入 `200ms var(--easing-standard)`；自动关闭淡出 `160ms`。

### 使用的设计令牌
`--color-success-normal`（success）、`--color-error-normal`（error）、`--color-primary-normal`（info）、`--color-warm-normal`（warning）、`--color-text-primary`、`--color-bg-card`、`--shadow-1`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--shadow-2`（容器投影），已统一为 `--shadow-1`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 无（自动消失） |
| active（点击反馈） | 无 |
| 键盘 | 无（`role="alert"`/`status` 播报） |
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
| `type` | `'success' \| 'error' \| 'info' \| 'warning' \| 'loading'` | `'info'` | **antd 同名同值**：提示类型 |
| `content` | `ReactNode` | `-` | **antd 同名同义**：提示内容 |
| `duration` | `number` | `3` | **antd 同名同值**：持续秒数（0 不自动关闭） |
| `onClose` | `() => void` | `-` | **antd 同名同义**：关闭回调 |

### 受控/非受控语义
- 命令式 API（`message.success('...')`）与声明式 `<Message/>` 并存；通常用命令式全局实例，由 `duration` 自动关闭。
- `duration=0` 时不自动关闭，需手动调用 close。

### 事件 / 键盘
- 自动关闭，`loading` 态不自动关，需显式 close。
- 无键盘交互，纯展示；语义由 `role` 播报。

---

## 代码示例

```html
message.success('保存成功');
message.error('删除失败：存在关联数据');
message.warning('磁盘空间不足，请及时清理');
```

---

## 文件映射

- Preview 文件：`message-preview.html`
- 组件目录：`../../../../frontend/components/Message/index.html`
- 令牌文件：`../../../tokens/tokens.css`
