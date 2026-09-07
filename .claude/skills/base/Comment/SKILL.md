---
name: Comment
description: 评论（基础组件）
---

# Comment · 评论

> **分类**：数据展示
> **Figma**：1478-142292
> **组件目录**：`../../../../frontend/components/Comment/`
> **版本**：v1.1.0（已对齐 antd `Comment` `author` / `content` / `datetime` / `actions` / `avatar` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**评论展示组件**，含作者、头像、内容、时间、操作与嵌套回复，用于评论流、反馈、日志。

### 何时用
- **评论区/反馈流**的展示。
- 需要**作者 + 时间 + 操作**的内容流。
- 需要**嵌套回复**（≤ 2 层）的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 时间轴事件流 | `Timeline` |
| 简单列表 | `List` |
| 系统通知 | `Notification` / `Alert` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `avatar` | 作者头像 | 与 `Avatar` 组件复用 |
| `datetime` | 发布时间 | 次要色，不抢内容 |
| `actions` | 回复/点赞等 | 操作图标配文字 |
| 嵌套 | 回复 | 嵌套深度 ≤ 2，更深用「@用户」引用 |

### 无障碍
- 作者、时间语义清晰；操作按钮可键盘聚焦。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 头像 | 32×32 | 默认 |
| 内容字号 | 14px | 正文 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 作者 | `--color-text-primary` |
| 时间 | `--color-text-auxiliary` |
| 操作链接 | `--color-text-secondary` |

### 过渡
操作链接 hover `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-text-secondary`（操作）、`--color-text-auxiliary`（时间）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

> 五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。

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
| `author` | `ReactNode` | `-` | **antd 同名同值**：作者 |
| `content` | `ReactNode` | `-` | **antd 同名同值**：内容 |
| `datetime` | `ReactNode` | `-` | **antd 同名同值**：时间 |
| `actions` | `ReactNode[]` | `-` | **antd 同名同值**：操作 |
| `avatar` | `ReactNode` | `-` | **antd 同名同值**：头像 |
| `children` | `ReactNode` | `-` | 嵌套回复 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 操作按钮由使用者绑定；无内置键盘行为。

---

## 代码示例

```html
<Comment
  author="张三"
  avatar={<Avatar>张</Avatar>}
  content="设备已上线，状态正常。"
  datetime="2026-09-02 10:00"
  actions={[<span key="reply">回复</span>]}
/>
```

---

## 文件映射

- Preview 文件：`comment-preview.html`
- 组件目录：`../../../../frontend/components/Comment/index.html`
- 令牌文件：`../../../tokens/tokens.css`
