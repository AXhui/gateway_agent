# Alert · 警告提示

> **分类**：反馈
> **Figma**：1432-54120
> **组件目录**：`../../../../frontend/components/Alert/`
> **版本**：v1.1.0（已对齐 antd `Alert` `type` / `closable` / `showIcon` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页内常驻警告条**。用于在页面/区块内持续展示需要用户注意的信息，支持 4 种语义类型、关闭、描述与动作。

### 何时用
- 需要**持续**展示的页级提示（配额即将用尽、账号待激活、当前为只读模式）。
- 需要在**固定位置**常驻、不自动消失的告警。
- 需要携带**补充说明 + 操作按钮**（如「立即续费」）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 瞬时操作结果反馈（几秒后消失） | `Message` |
| 右上角弹通知（带标题+描述） | `Notification` |
| 需要用户确认/输入后继续 | `Modal` / `Popconfirm` |
| 表单字段内联校验错误 | `Form.Item` `error` |
| 整页结果态（空/异常） | `Result` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="info"` | 中性提示、说明 | 不要用 info 表达危险操作 |
| `type="success"` | 操作成功、状态健康 | 不要常驻成功信息刷屏 |
| `type="warning"` | 有风险、需注意 | 不要用 warning 表达已经失败 |
| `type="error"` | 出错、阻断 | error 只用于真正失败 |
| `closable` | 允许用户手动关闭 | 关键告警不要 closable，防止被误关 |
| `description` + action | 详细说明 + 引导操作 | 描述要给出下一步，不要只重复标题 |

### 无障碍
- 用 `role="alert"`（error/warning）或 `role="status"`（info/success），读屏立即播报。
- 图标 `aria-hidden`，语义由文字承载。
- 关闭按钮有 `aria-label="关闭"`，聚焦可见。
- 不要只靠颜色区分类型，图标 + 文字双重表达。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认高度 | 自适应（padding 8px 12px） | 带描述时更高 |
| 图标尺寸 | 16×16 | 左侧 |
| 内边距 | `8px 12px` | 与文字间距 |
| 圆角 | `var(--radius-8)` | 条形容器 |

### 状态视觉矩阵
| 类型 | 图标色 | 文字色 | 背景 | 左边框/图标 |
|------|--------|--------|------|-------------|
| info | `--color-primary-normal` | `--color-text-primary` | `--color-primary-bg` | 品牌蓝 |
| success | `--color-success-normal` | `--color-text-primary` | `--color-success-bg` | 成功绿 |
| warning | `--color-warm-normal` | `--color-text-primary` | `--color-warm-bg` | 警示橙 |
| error | `--color-error-normal` | `--color-text-primary` | `--color-error-bg` | 错误红 |

### 过渡
关闭按钮 hover 透明度 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`/`--color-primary-bg`（info）、`--color-success-normal`/`--color-success-bg`（success）、`--color-warm-normal`/`--color-warm-bg`（warning）、`--color-error-normal`/`--color-error-bg`（error）、`--color-text-primary`、`--color-text-secondary`（description）、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-warm-normaling`（warning 图标，笔误），已统一为 `--color-warm-normal`。

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
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | **antd 同名同值**：语义类型 |
| `message` | `ReactNode` | `-` | **antd 同名同义**：主标题 |
| `description` | `ReactNode` | `-` | **antd 同名同义**：详细描述 |
| `closable` | `boolean` | `false` | **antd 同名同值**：可关闭 |
| `showIcon` | `boolean` | `false` | **antd 同名同值**：显示图标 |
| `onClose` | `() => void` | `-` | 关闭回调 |
| `action` | `ReactNode` | `-` | **antd 同名同义**：右侧操作 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- Alert 为**内部维护 visible** 的无状态提示；`closable` 时点击关闭置 hidden，触发 `onClose`。
- 如需外部控制显隐，由父组件条件渲染（`{visible && <Alert/>}`）。

### 事件 / 键盘
- 关闭按钮聚焦可见，`Enter`/`Space` 触发关闭。
- `type` 映射到 `role="alert"`（error/warning）或 `role="status"`（info/success）。

---

## 代码示例

```html
<Alert type="info" message="实例将在 3 天后到期" />
<Alert type="warning" showIcon closable message="磁盘使用率超过 80%" description="建议清理或扩容存储。" />
<Alert type="error" showIcon message="连接失败" action={<Button size="small">重试</Button>} />
```

---

## 文件映射

- Preview 文件：`alert-preview.html`
- 组件目录：`../../../../frontend/components/Alert/index.html`
- 令牌文件：`../../Tokens/tokens.css`
