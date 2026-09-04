# Steps · 步骤条

> **分类**：导航
> **Figma**：1400-35527
> **组件目录**：`../../../../frontend/components/Steps/`
> **版本**：v1.1.0（已对齐 antd `Steps` `current` / `items` / `direction` / `status` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**流程进度指示组件**，展示多步任务的当前进度与状态，用于引导式表单、审批流、向导。

### 何时用
- **多步表单/向导**（分步填写）。
- **审批/流转流程**的状态展示。
- 需要**可视化进度**的线性任务。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 单步或并列项 | 无需步骤条 |
| 百分比进度 | `Progress` |
| 时间线事件流 | `Timeline` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `direction="horizontal"` | 横向步骤 | 步骤 ≤ 5 为宜 |
| `direction="vertical"` | 纵向步骤 | 步骤多或空间窄 |
| `status` | 完成/进行中/错误 | 错误态用 `--color-error-normal` |
| 步骤数 | 3-5 步 | 过多需拆分或竖向 |

### 无障碍
- 步骤条有 `aria-label` 描述流程；当前步 `aria-current="step"`。
- 状态不只靠颜色，配合图标/文字。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 步骤圆点 | 32px | 横向 |
| 连线 | 1px | 步骤间 |
| 标题字号 | 14px | 步骤名 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 完成 | `--color-primary-normal`（或 `--color-success-normal`） |
| 进行中 | `--color-primary-normal` |
| 错误 | `--color-error-normal` |
| 待处理 | `--color-border-base` 灰态 |

### 过渡
状态切换颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（完成/进行中）、`--color-success-normal`（完成成功态）、`--color-error-normal`（错误）、`--color-border-base`（待处理）。

> **Token 修正**：无。旧版 Skill 已符合规范。

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
| `current` | `number` | `0` | **antd 同名同值**：当前步骤 |
| `items` | `Array<{title, description?, status?}>` | `[]` | **antd 同名同值**：步骤项 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | **antd 同名同值**：方向 |
| `status` | `'wait' \| 'process' \| 'finish' \| 'error'` | `'process'` | **antd 同名同值**：状态 |
| `onChange` | `(current) => void` | `-` | **antd 同名同值**：步骤变化 |

### 受控/非受控语义
- `current` + `onChange` 为**受控**；缺省时内部维护非受控状态。

### 事件 / 键盘
- 可点击步骤可键盘触发；`onChange` 返回当前步。

---

## 代码示例

```html
<Steps
  current={1}
  items={[
    { title: '基础信息' },
    { title: '网络配置', status: 'process' },
    { title: '完成' }
  ]}
/>
```

---

## 文件映射

- Preview 文件：`steps-preview.html`
- 组件目录：`../../../../frontend/components/Steps/index.html`
- 令牌文件：`../../Tokens/tokens.css`
