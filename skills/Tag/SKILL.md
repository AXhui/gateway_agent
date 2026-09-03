# Tag · 标签

> **分类**：数据展示
> **Figma**：1492-29313
> **组件目录**：`frontend/components/Tag/`
> **版本**：v1.1.0（已对齐 antd `Tag` `color` / `closable` / `icon` / `bordered` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**信息标签**，用于标记属性、分类、状态，支持预设色、可关闭、图标，用于状态标记、分类筛选。

### 何时用
- **状态标记**（在线/离线/告警）。
- **分类/属性标签**（设备类型、协议）。
- **可关闭筛选标签**（筛选条件展示）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 未读数字角标 | `Badge` |
| 可交互的状态按钮 | `Button` / `Switch` |
| 长文本说明 | 文本 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 预设色 | 状态语义 | 同色不同语义要配文字 |
| `closable` | 可关闭 | 关闭回调必须生效 |
| `icon` | 带图标 | 图标语义与标签一致 |
| `bordered={false}` | 无边框 | 密集列表用 |

### 无障碍
- 颜色不是唯一语义（配文字）；可关闭标签有 `role` 与关闭按钮可聚焦。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 高 | 24px | 默认 |
| 内边距 | 0 8px | 文字留白 |

### 状态视觉矩阵
| 类型 | 背景 | 文字/描边 |
|------|------|-----------|
| 主色 | `--color-primary-bg` | `--color-primary-normal` |
| 成功 | `--color-fill-success` | `--color-success-normal` |
| 错误 | `--color-fill-error` | `--color-error-normal` |
| 警告 | `--color-fill-warm` | `--color-warm-normal` |
| 默认 | `--color-bg-page` | `--color-text-secondary` |

### 过渡
关闭 hover `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-bg`/`--color-primary-normal`（主色）、`--color-fill-success`/`--color-success-normal`（成功）、`--color-fill-error`/`--color-error-normal`（错误）、`--color-fill-warm`/`--color-warm-normal`（警告）。

> **Token 修正**：`--color-brand-50` → `--color-primary-bg`（主色标签浅背景统一用主色淡背景 token）。

---

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
| `color` | `PresetColor \| string` | `-` | **antd 同名同值**：颜色 |
| `closable` | `boolean` | `false` | **antd 同名同值**：可关闭 |
| `icon` | `ReactNode` | `-` | **antd 同名同值**：图标 |
| `bordered` | `boolean` | `true` | **antd 同名同值**：边框 |
| `onClose` | `(e) => void` | `-` | **antd 同名同值**：关闭回调 |
| `children` | `ReactNode` | `-` | 内容 |

### 受控/非受控语义
- 纯展示组件；`closable` 关闭由使用者处理（受控移除）。

### 事件 / 键盘
- 关闭按钮可键盘触发（Enter/Space）。

---

## 代码示例

```html
<Tag color="success">在线</Tag>
<Tag color="error" icon={<Icon name="warning" />}>告警</Tag>
<Tag closable onClose={remove}>筛选：华东区</Tag>
```

---

## 文件映射

- Preview 文件：`tag-preview.html`
- 组件目录：`frontend/components/Tag/index.html`
- 令牌文件：`frontend/shared/tokens.css`
