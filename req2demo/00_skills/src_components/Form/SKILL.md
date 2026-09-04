# Form · 表单

> **分类**：数据录入
> **Figma**：1463-112293
> **组件目录**：`../../../../frontend/components/Form/`
> **版本**：v1.1.0（已对齐 antd `Form` / `Form.Item` `layout` / `required` / `rules` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**表单容器**，负责数据收集、校验与提交。Form 本身不渲染具体控件，只编排 `Form.Item` 的 label、必填标记、校验反馈与排布，控件（Input/Select/Switch 等）由业务方嵌入。

### 何时用
- 需要**批量收集**多个字段并统一提交（新增/编辑资源、配置面板、设置页）。
- 需要**校验**：必填、格式、长度、唯一性等，提交前一次拦截。
- 需要**对齐排布**的 label + 控件（水平/纵向/行内）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 单个即时筛选/搜索（无提交） | 独立 `Input` / `Select` / `AutoComplete` |
| 只读详情展示（非编辑） | `Descriptions` / 文本布局 |
| 无校验的纯布局 | 普通 `Grid` / Flex |
| 大量分步表单 | `Steps` 分步 + 每步一个 Form |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `layout="horizontal"` | label 左、控件右（label 宽 6 列、控件 18 列）；常规配置 | label 过长会折行，控制 labelWidth |
| `layout="vertical"` | label 上、控件下；宽屏对话框/移动端 | 字段少时空间浪费 |
| `layout="inline"` | 筛选条/搜索行内排布 | 不要放需要长输入或校验复杂的字段 |
| `required` + `*` | 必填项，`--color-error-normal` 星号 | 不要所有字段都必填，制造疲劳 |
| `error` / `help` / `extra` | 校验失败 / 提示 / 补充说明，三选一展示 | 不要同时展示 error 和 help |

### 无障碍
- `label` 用原生 `<label>` 关联控件，点击 label 聚焦控件。
- 必填用 `*` 号 + 读屏可感知，不要只靠颜色区分必填。
- 校验错误用文字提示（`error`），不要只靠边框变红。
- 控件状态（error/disabled）落到内嵌组件的 `status` / `disabled`，保证一致性。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 布局矩阵
| 布局 | label 位置 | 控件位置 | labelWidth 默认 | 使用场景 |
|------|-----------|----------|----------------|----------|
| `horizontal` | 左（右对齐） | 右 | 120px | 常规配置页 |
| `vertical` | 上（左对齐） | 下 | — | 宽屏对话框/移动端 |
| `inline` | 左（行内） | 右 | 自动 | 筛选条/搜索行 |

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| label 字号 | 14px | `--color-text-secondary` |
| 控件高度 | 24/32/40（sm/md/lg） | 由内嵌组件决定 |
| 水平 label 右间距 | `var(--spacing-12)` | label 与控件 |
| 表单项间距 | `var(--spacing-20)` | 纵向排布时项间距 |
| 行内项间距 | `var(--spacing-16)` | inline 布局 |

### 状态视觉矩阵
| 状态 | 触发 | 表现 |
|------|------|------|
| 正常 | 未交互 | label `--color-text-secondary`，控件默认边框 |
| 聚焦 | 控件 focus | 边框 `--color-primary-normal` + focus ring |
| 错误 | `status="error"` / 校验失败 | 控件边框 `--color-error-normal`，下方 message 12px `--color-error-normal` |
| 必填 | `required` | label 前 `*` 号 `--color-error-normal`，右距 4px |
| 提示 | `help` / `extra` | 下方 12px `--color-text-auxiliary` |
| 禁用 | 控件 disabled | 背景 `--color-bg-hover`，文字 `--color-text-disable` |

### 校验反馈
- error message 字号 12px，颜色 `--color-error-normal`，位于控件下方 `marginTop:4`。
- help/extra 字号 12px，颜色 `--color-text-auxiliary`；error 与 help 互斥（error 优先）。

### 使用的设计令牌
`--color-text-primary`、`--color-text-secondary`（label）、`--color-text-auxiliary`（help/extra）、`--color-error-normal`（必填星号/错误态）、`--color-primary-normal`（聚焦边框）、`--color-border-base`（默认边框）、`--color-bg-hover`（禁用底）、`--spacing-4/8/12/16/20`、`--radius-4`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-gray-200`，已统一为 `--color-border-base`。

---

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Form Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | **antd 同名同值**：排布方式 |
| `labelWidth` | `number` | `120` | horizontal 时 label 宽度（px） |
| `labelAlign` | `'left' \| 'right'` | `'right'` | horizontal 时 label 对齐 |
| `colon` | `boolean` | `true` | label 后是否加 `：` |
| `children` | `ReactNode` | `-` | FormItem 集合 |
| `style` / `...rest` | `-` | `-` | 透传（`...rest` 落到原生 `<form>`） |

### FormItem Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `ReactNode` | `-` | label 文字 |
| `required` | `boolean` | `false` | 必填，label 前加 `*` |
| `help` | `ReactNode` | `-` | 提示文字（非 error 时展示） |
| `error` | `ReactNode` | `-` | 错误信息（优先于 help，标红） |
| `extra` | `ReactNode` | `-` | 补充说明（always 展示，辅助色） |
| `children` | `ReactNode` | `-` | 内嵌控件 |
| `style` | `-` | `-` | 透传 |

### 受控/非受控语义
- Form 本身无 value 状态，通过 `Form.Item` 的 `error` 表达校验结果；控件各自受控/非受控。
- 提交语义由业务方实现：`onSubmit` 拦截 `e.preventDefault()` → 读取各控件值 → 校验 → 调接口；loading 态防重复提交。

### 事件 / 键盘
- 根为原生 `<form>`，`onSubmit` 支持 Enter 提交；控件聚焦/失焦触发校验（`validateTrigger` 默认 onChange，失焦后首次触发）。
- `Form.Item` 的 label 用原生 `<label>` 关联，点击聚焦控件。

---

## 代码示例

```html
<Form layout="horizontal" labelWidth={100}>
  <FormItem label="实例名称" required help="2-32 字符">
    <Input placeholder="请输入" />
  </FormItem>
  <FormItem label="密码" error="密码长度不足 8 位">
    <Input type="password" status="error" defaultValue="1234" />
  </FormItem>
  <FormItem label="自动续费">
    <Switch defaultChecked />
  </FormItem>
</Form>

<Form layout="vertical">
  <FormItem label="账号" required><Input placeholder="请输入账号" /></FormItem>
</Form>

<Form layout="inline">
  <FormItem label="关键字"><Input style={{width:180}} /></FormItem>
</Form>
```

---

## 文件映射

- Preview 文件：`form-preview.html`
- 组件目录：`../../../../frontend/components/Form/index.html`
- 令牌文件：`../../Tokens/tokens.css`
