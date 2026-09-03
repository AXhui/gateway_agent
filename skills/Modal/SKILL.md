# Modal · 对话框

> **分类**：反馈
> **Figma**：1430-37845
> **组件目录**：`frontend/components/Modal/`
> **版本**：v1.1.0（已对齐 antd `Modal` `open` / `onOk` / `footer` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**模态对话框**，覆盖在页面之上，阻断主流程，承载需要用户聚焦处理的确认、输入或详情。是最重的反馈容器，仅在必须中断时使用。

### 何时用
- **二次确认**（删除、覆盖、退出等不可逆操作）。
- 需要用户**输入/选择后继续**的表单（字段 ≤5 个）。
- 需要用户**明确决策**的分支（确认/取消）。
- 展示**关键信息**且要求用户知晓后才能继续。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 表单字段 >5 个 | `Drawer` |
| 轻量删除确认（单条） | `Popconfirm` |
| 瞬时结果提示 | `Message` |
| 非阻断的通知 | `Notification` |
| 页内常驻提示 | `Alert` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `onOk` / `onCancel` | 标准双按钮 | 主操作文案要动词化（「删除」而非「确定」） |
| `footer={null}` | 无默认按钮，自定义内容 | 不要失去明确退出路径 |
| `width` | 按内容调宽（520/620） | 内容简单不要过度加宽 |
| 危险确认 | 主按钮用 error 色 | 破坏性操作必须明确标红 |
| 表单弹窗 | 校验失败内联提示 | 字段过多改用 Drawer |

### 无障碍
- `role="dialog"` + `aria-modal="true"`，标题关联 `aria-labelledby`。
- 打开时焦点移入对话框，关闭后焦点还原触发元素。
- `Esc` 关闭、遮罩点击关闭（可配置禁用）。
- 打开时聚焦陷阱（Focus Trap），`Tab` 在对话框内循环。
- 关闭后不保留滚动位置错乱，body 滚动锁。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认宽度 | 520px | 可 `width` 覆盖 |
| 头部高 | 56px | 标题 + 关闭按钮 |
| 底部高 | 56px | 按钮右对齐 |
| 内边距 | 24px | 内容区 |
| 圆角 | `var(--radius-8)` | 对话框 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 对话框 | bg `var(--color-bg-card)` |
| 遮罩 | `rgba(11,18,32,0.5)` |
| 标题 | `--color-text-primary` |
| 主按钮 | bg `--color-primary-normal`，hover `--color-primary-hover` |
| 次按钮 | 边框 `var(--color-border-base)` |
| 投影 | `var(--shadow-1)` |

### 过渡
淡入 + 轻微上移 `200ms var(--easing-standard)`；关闭淡出 `160ms`。

### 使用的设计令牌
`--color-bg-card`（对话框底）、`--color-primary-normal`/`--color-primary-hover`（主按钮）、`--color-border-base`（次按钮边框）、`--color-text-primary`、`--color-text-secondary`、`--shadow-1`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--shadow-3`（对话框投影），已统一为 `--shadow-1`。

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
| `open` | `boolean` | `false` | **antd 同名同值**：是否显示 |
| `title` | `ReactNode` | `-` | **antd 同名同义**：标题 |
| `onOk` | `() => void` | `-` | **antd 同名同义**：确定回调 |
| `onCancel` | `() => void` | `-` | **antd 同名同义**：取消回调 |
| `width` | `number \| string` | `520` | **antd 同名同值**：宽度 |
| `footer` | `ReactNode \| null` | `-` | **antd 同名同义**：底部（null 隐藏） |
| `confirmLoading` | `boolean` | `false` | **antd 同名同值**：确定按钮 loading |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- Modal 为**受控组件**，`open` 由外部状态驱动；`onOk`/`onCancel` 由父组件关闭或提交。
- 异步提交时用 `confirmLoading` 防止重复点击，成功后自行关闭。

### 事件 / 键盘
- `Esc` 关闭、遮罩点击关闭（`maskClosable` 可禁）。
- 打开时 Focus Trap，焦点在对话框内循环，关闭后还原。
- `onOk` 需处理异步 loading 态，避免重复提交。

---

## 代码示例

```html
<Modal open={open} title="删除设备" onOk={handleDelete} onCancel={() => setOpen(false)} confirmLoading={deleting}>
  确定删除设备「{name}」？删除后不可恢复。
</Modal>
<Modal title="新建规则" footer={null} onCancel={close} width={620}>
  <RuleForm onSubmit={submit} />
</Modal>
```

---

## 文件映射

- Preview 文件：`modal-preview.html`
- 组件目录：`frontend/components/Modal/index.html`
- 令牌文件：`frontend/shared/tokens.css`
