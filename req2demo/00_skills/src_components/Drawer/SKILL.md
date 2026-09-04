# Drawer · 抽屉

> **分类**：反馈
> **Figma**：1445-39010
> **组件目录**：`../../../../frontend/components/Drawer/`
> **版本**：v1.1.0（已对齐 antd `Drawer` `open` / `placement` / `footer` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**侧边滑入面板**，从屏幕四边滑出，承载详情、表单、配置等中等复杂度内容。相比 Modal 更轻量，不打断主流程，适合「边看主内容边操作侧边任务」。

### 何时用
- 查看**详情**且需保留主页面上下文（列表详情、设备详情）。
- 承载**中等复杂度表单**（字段 >5 个或需要较长填写）。
- 需要**保持主流程可见**的配置/编辑任务。
- 需要**宽面板**展示表格、日志、多列信息。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 二次确认、必须阻断主流程 | `Modal` |
| 轻量确认（删除单条） | `Popconfirm` |
| 瞬时操作结果提示 | `Message` |
| 只展示一句话信息 | `Tooltip` / `Message` |
| 整页详情（无主上下文） | 独立路由页面 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `placement="right"` | 默认，详情/表单 | 表单过长可改用整页 |
| `placement="left"` | 导航类侧栏 | 不要与主导航冲突 |
| `size="large"` | 表格/多列内容 | 不要为少量字段开大抽屉 |
| `footer` | 固定底部操作按钮 | 危险操作放右下，主操作靠右 |
| 遮罩 | 可点击遮罩关闭 | 表单有未保存内容时关闭需二次确认 |

### 无障碍
- 面板 `role="dialog"`，`aria-modal="true"`，标题关联 `aria-labelledby`。
- 打开时焦点移入面板，`Esc` 关闭，关闭后焦点还原到触发元素。
- 遮罩点击关闭，但键盘操作需等价支持。
- 内容可滚动区域 `tabIndex=0`，滚动条可见。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认宽度 | 378px | `size="default"` |
| large 宽度 | 736px | `size="large"` |
| 头部高 | 56px | 标题 + 关闭按钮 |
| 底部高 | 56px | footer 操作区 |
| 内边距 | 24px | 内容区 |
| 圆角 | 顶部无圆角（贴边） | 滑入面板 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 面板 | bg `var(--color-bg-card)` |
| 遮罩 | `rgba(11,18,32,0.5)` |
| 头部标题 | `--color-text-primary` |
| 分割线 | `var(--color-divider-base-1)` |
| 关闭按钮 | hover `--color-bg-hover` |
| 投影 | `var(--shadow-1)` |
| footer 背景 | `var(--color-bg-card)` |

### 过渡
滑入动画 `240ms var(--easing-standard)`（从对应方向位移入屏）；遮罩淡入 `160ms`。

### 使用的设计令牌
`--color-bg-card`（面板/底）、`--color-bg-hover`（关闭按钮 hover）、`--color-divider-base-1`（分割线）、`--color-text-primary`、`--color-text-secondary`、`--shadow-1`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--shadow-3`（面板投影），已统一为 `--shadow-1`。

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
| `open` | `boolean` | `false` | **antd 同名同值**：是否展开 |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | **antd 同名同值**：滑出方向 |
| `size` | `'default' \| 'large' \| number` | `'default'` | **antd 同名同义**：面板尺寸 |
| `onClose` | `() => void` | `-` | **antd 同名同义**：关闭回调 |
| `footer` | `ReactNode` | `-` | **antd 同名同义**：底部操作区 |
| `title` | `ReactNode` | `-` | **antd 同名同义**：标题 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- Drawer 为**受控组件**，`open` 由外部状态驱动，点击遮罩/关闭按钮触发 `onClose`，由父组件置 `open=false`。
- 不使用非受控模式，避免内部状态与外部显隐不一致。

### 事件 / 键盘
- `Esc` 关闭；打开时焦点移入面板，关闭后焦点还原触发元素。
- 遮罩点击触发 `onClose`（可配置 `maskClosable` 禁止）。
- footer 按钮聚焦顺序：主操作在 Tab 序末尾。

---

## 代码示例

```html
<Drawer open={open} onClose={() => setOpen(false)} title="设备详情">
  <DeviceDetail id={id} />
</Drawer>
<Drawer size="large" placement="right" title="编辑规则" footer={<><Button onClick={cancel}>取消</Button><Button type="primary">保存</Button></>}>
  <RuleForm fields={fields} />
</Drawer>
```

---

## 文件映射

- Preview 文件：`drawer-preview.html`
- 组件目录：`../../../../frontend/components/Drawer/index.html`
- 令牌文件：`../../Tokens/tokens.css`
