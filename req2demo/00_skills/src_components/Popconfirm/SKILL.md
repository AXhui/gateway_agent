# Popconfirm · 气泡确认框

> **分类**：反馈
> **Figma**：1439-12926
> **组件目录**：`../../../../frontend/components/Popconfirm/`
> **版本**：v1.1.0（已对齐 antd `Popconfirm` `title` / `onConfirm` / `okText` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**轻量级二次确认**，从触发元素旁弹出气泡，用于确认后执行的小范围操作。相比 Modal 更轻，不阻断整个页面，只围绕目标元素。

### 何时用
- **删除/不可逆操作**（删除记录、清空配置、移除成员）。
- 单条记录的**轻量确认**，无需整页 Modal。
- 操作结果影响**局部**、无需输入补充信息的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 非破坏性操作（可直接执行） | 直接执行，无需确认 |
| 需输入补充信息 | `Modal` |
| 表单字段 >5 个 | `Drawer` |
| 需结构化确认（多步骤） | `Modal` |
| 批量操作确认 | `Modal` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `title` | 明确说明影响（「删除后不可恢复」） | 不要含糊的「确定？」 |
| `onConfirm` | 执行操作 | 确认后要有结果反馈（Message） |
| `okText` | 动词化（「删除」「移除」） | 不要默认「确定」掩盖破坏性 |
| `placement` | 默认 `top`，避免遮挡目标 | 靠近边缘自动翻转 |
| 危险确认 | 确认按钮 error 色 | 破坏操作必须标红 |

### 无障碍
- 气泡 `role="dialog"` 或 `role="tooltip"` + 触发元素 `aria-describedby`。
- 触发元素可键盘聚焦，`Enter`/`Space` 打开气泡。
- 打开后焦点移入气泡，`Esc` 关闭，关闭后焦点还原。
- 确认/取消按钮语义清晰，读屏可感知确认文案。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 气泡宽 | 自适应（min 240px） | 标题 + 按钮 |
| 内边距 | `12px 16px` | 气泡内容 |
| 按钮尺寸 | 24px 高（small） | 确认/取消 |
| 圆角 | `var(--radius-8)` | 气泡 |
| 箭头 | 8px | 指向触发元素 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 气泡 | bg `var(--color-bg-card)` |
| 标题 | `--color-text-primary` |
| 确认按钮 | bg `--color-error-normal`（危险），hover `--color-error-hover` |
| 取消按钮 | 边框 `var(--color-border-base)` |
| 图标 | `--color-warm-normal`（警示） |
| 投影 | `var(--shadow-1)` |

### 过渡
气泡展开淡入 + 位移 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-card`（气泡底）、`--color-error-normal`/`--color-error-hover`（危险确认）、`--color-warm-normal`（警示图标）、`--color-text-primary`、`--color-border-base`（取消按钮）、`--shadow-1`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-warm-normaling`（警示图标，笔误）与 `--shadow-2`（气泡投影），已分别统一为 `--color-warm-normal` 与 `--shadow-1`。

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
| `title` | `ReactNode` | `-` | **antd 同名同义**：确认提示文案 |
| `onConfirm` | `() => void` | `-` | **antd 同名同义**：确认回调 |
| `onCancel` | `() => void` | `-` | **antd 同名同义**：取消回调 |
| `okText` | `string` | `'确定'` | **antd 同名同值**：确认文案 |
| `cancelText` | `string` | `'取消'` | **antd 同名同值**：取消文案 |
| `placement` | `12 种方位` | `'top'` | **antd 同名同值**：气泡位置 |
| `children` | `ReactNode` | `-` | 触发元素 |

### 受控/非受控语义
- 气泡显隐由内部维护，点击触发元素展开；`onConfirm` 执行后关闭，`onCancel` 或点击外部关闭。
- 可通过 `open` + `onOpenChange` 受控（对齐 antd）。

### 事件 / 键盘
- 触发元素 `Enter`/`Space` 打开气泡；`Esc` 关闭。
- 确认按钮 `Enter` 触发 `onConfirm`；`onConfirm` 支持异步（Promise 结束前按钮 loading）。

---

## 代码示例

```html
<Popconfirm title="删除后不可恢复，确定删除？" okText="删除" onConfirm={handleDelete}>
  <Button danger type="text">删除</Button>
</Popconfirm>
<Popconfirm title="移除该成员？" okText="移除" onConfirm={removeMember}>
  <a>移除</a>
</Popconfirm>
```

---

## 文件映射

- Preview 文件：`popconfirm-preview.html`
- 组件目录：`../../../../frontend/components/Popconfirm/index.html`
- 令牌文件：`../../Tokens/tokens.css`
