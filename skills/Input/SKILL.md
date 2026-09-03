# Input · 输入框

> **分类**：数据录入
> **Figma**：1416-45643
> **组件目录**：`frontend/components/Input/`
> **版本**：v1.1.0（已对齐 antd `size` / `type` / `showCount` / `onPressEnter` API）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
承载**自由文本**的输入载体。Input 是「让用户键入任意值」的入口，不是「从有限集合中做选择」的入口。

### 何时用
- 用户需要输入**不可枚举**的值（名称、ID、密钥、URL、备注、搜索关键词）时。
- 需要 prefix/suffix 标注单位、addon 标注协议/域名时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 从有限集合中选一个值 | `Select` / `Radio` |
| 多行长文本（备注、描述、协议正文） | `TextArea` |
| 数字值需步进/上下限 | `InputNumber` |
| 日期/时间/时间段 | `DatePicker` / `TimePicker` |
| 固定格式且需分段（IP、银行卡） | 多个 Input 组合或专用 `Input.Group` |
| 用户在选项里可搜索 | `AutoComplete` / `Select` 的 `showSearch` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础（默认） | 单行自由文本 | 长文本不要硬塞单行 |
| `type="password"` | 密码、密钥、token，配合「眼睛」切换明文/密文 | 不要默认明文展示敏感值 |
| `Input.Search` | 列表页/资源检索，Enter 或点击触发 `onSearch` | 不要用普通 Input + suffix 图标伪装搜索（无 Enter 语义） |
| `prefix` / `suffix` | 图标/单位标注（如 `RMB`、`搜索图标`） | 不要同时塞满 prefix+suffix+clear，视觉拥挤 |
| `addonBefore/After` | 协议、域名、固定前后缀（`https://`、`.com`、`账号`） | addon 承载动作按钮时改 `Input.Search` |
| `allowClear` | 允许一键清空回空态 | 必填字段不提供清空 |
| `showCount` + `maxLength` | 有字数上限时展示 `n/max` | 不要只截断不提示 |

### 无障碍
- 根 `<input>` 原生可聚焦，`Tab` 进入；`Enter` 提交表单（`onPressEnter` 可扩展）。
- `prefix`/`suffix` 图标标记 `aria-hidden`，不参与读屏。
- `type="password"` 切换按钮提供 `aria-label`（如「显示密码」）。
- 错误态通过 `status="error"` + Form.Item `message` 双通道提示，不单靠颜色。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| size | height | 字号/行高 | 左右 padding |
|------|--------|-----------|--------------|
| `sm` | 24px | 12px/20px | `--spacing-12` |
| `md`（默认） | 32px | 14px/22px | `--spacing-12` |
| `lg` | 40px | 16px/24px | `--spacing-12` |

antd 尺寸别名：`small`→`sm`、`middle`→`md`、`large`→`lg`。

### 状态视觉矩阵
| 状态 | 边框 | 焦点环 | 背景 | 说明 |
|------|------|--------|------|------|
| default | `1px solid var(--color-border-base)` | 无 | `--color-bg-card` | 未聚焦 |
| hover | `1px solid var(--color-border-base-disable)` | 无 | `--color-bg-card` | 悬停 |
| focus | `1px solid var(--color-primary-normal)` | `0 0 0 2px rgba(52,145,250,0.12)` | `--color-bg-card` | 聚焦 |
| error | `1px solid var(--color-error-normal)` | `0 0 0 2px rgba(241,53,53,0.12)` | `--color-bg-card` | `status="error"` |
| disabled | `1px solid var(--color-border-base)` | 无 | `--color-bg-hover` | 字 `--color-text-disable`，cursor not-allowed |
| readonly | `1px solid var(--color-divider-base-1)` | 无 | `--color-bg-page` | 只读 |

### prefix / suffix / addon
- `prefix`/`suffix` 图标/文字 color `--color-text-auxiliary`，随输入框自动扩展左右 padding。
- `addonBefore`/`addonAfter`：bg `--color-bg-page`，字 `--color-text-secondary`，边框 `--color-border-base`，与输入框边框共用、拼接处不设圆角（左右端点用 `--radius-4`）。

### allowClear
有值且非 disabled 时，hover/focus 显示 × 图标（圆形，bg `--color-border-base`，× 色 `--color-text-constant-normal`），click 清空并保持 focus。

### 字数限制（showCount）
右下角显示 `n/max`，超出上限部分 color `--color-error-normal`。

### 过渡
`transition: border-color / box-shadow 160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`、`--color-error-normal`、`--color-text-primary/secondary/auxiliary/disable/constant-normal`、`--color-bg-card`、`--color-bg-hover`、`--color-bg-page`、`--color-border-base`、`--color-border-base-disable`、`--color-divider-base-1`、`--radius-4`、`--spacing-8/12`、`--duration-fast`、`--easing-standard`。

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
| `value` | `string` | `-` | 受控值 |
| `defaultValue` | `string` | `''` | 非受控默认值 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸；**antd 别名** `'small' \| 'middle' \| 'large'` 自动映射 |
| `status` | `'default' \| 'error'` | `'default'` | 校验态（antd 同名） |
| `type` | `string` | `'text'` | 原生 input type（`'password'` 等） |
| `prefix` | `ReactNode` | `-` | 前缀 |
| `suffix` | `ReactNode` | `-` | 后缀 |
| `addonBefore` / `addonAfter` | `ReactNode` | `-` | 前后置标签 |
| `allowClear` | `boolean` | `false` | 可清空 |
| `onClear` | `() => void` | `-` | 清空回调 |
| `showCount` | `boolean` | `false` | **antd 别名**，显示字数 |
| `maxLength` | `number` | `-` | 最大长度 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(e) => void` | `-` | 值变化回调（原生 event） |
| `onPressEnter` | `(e) => void` | `-` | **antd 别名**，回车回调 |
| `onSearch` | `(value: string) => void` | `-` | `Input.Search` 触发回调 |

### 别名映射（`size` antd → Milesight）
```
small  → sm
middle → md
large  → lg
```

### 受控/非受控语义
- `value !== undefined` 时受控，输入经 `onChange(e)` 通知外部更新。
- 否则内部维护 `defaultValue`。
- `onClear` 清空：受控时仅触发 `onClear` + `onChange({target:{value:''}})`，由外部清空 `value`。

### 变体：Input.Search
`search` 形态：右侧搜索按钮/图标，`Enter` 或点击触发 `onSearch(value)`，值取自当前输入。

### 事件 / 键盘
- 继承原生 `<input>` 全部事件（`onFocus`/`onBlur`/`onChange` 等），经 `...rest` 透传。
- 焦点态由内部 `focus` state 驱动边框 + 焦点环。

---

## 代码示例

```html
<Input placeholder="请输入实例名称" />
<Input size="small" prefix={<SearchIcon />} placeholder="搜索实例 ID" />
<Input type="password" placeholder="请输入密钥" />
<Input.Search placeholder="搜索" onSearch={v => console.log(v)} />
<Input allowClear defaultValue="可清除内容" />
<Input addonBefore="https://" addonAfter=".com" defaultValue="uink" />
<Input showCount maxLength={20} placeholder="最多 20 字" />
<Input status="error" defaultValue="非法输入" />
```

---

## 文件映射

- Preview 文件：`input-preview.html`
- 组件目录：`frontend/components/Input/index.html`
- 令牌文件：`frontend/shared/tokens.css`
