# Checkbox · 复选框

> **分类**：数据录入
> **Figma**：1318-100610
> **组件目录**：`frontend/components/Checkbox/`
> **版本**：v1.1.0（已对齐 antd `defaultChecked` / `indeterminate` / `Checkbox.Group` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**多选**控件，用于「并列且非互斥」的选项集合，或布尔项勾选。勾选结果**不即时提交**，通常配合「保存/提交」按钮或表单校验。

### 何时用
- 多个并列、可同时成立的选项（如权限集合、通知渠道、筛选维度）。
- 需要「全选 / 半选 / 部分选」的列表批量操作（配合 `indeterminate`）。
- 布尔型确认项（如「同意《服务协议》」「记住我」），明确勾选动作。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 开/关、启/停等**即时生效**的二态 | `Switch` |
| 多个选项**互斥**、只能选一个 | `Radio` / `Radio.Group` |
| 选项数量很多（>8）需要搜索 | `Select` `multiple` |
| 只读展示布尔/多选结果 | `Tag` / 文本，不要用禁用 Checkbox |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础（默认） | 单复选框，表单/协议勾选 | 不要脱离 label 裸放 |
| `indeterminate` | 表头「全选」，表示部分选中 | 不要用 indeterminate 表达「已选」 |
| `status="error"` | 校验失败/必选未勾时标红 | 不要用 error 表达「强调」 |
| `CheckboxGroup` | 多选集合，受控 `value` 数组 | 不要在 Group 内重复加 disabled 逻辑 |
| `direction="vertical"` | 协议列表、长选项纵向排布 | 选项 ≤4 且短时用水平即可 |
| `disabled` | 无权限/不可变更 | 不要用 disabled 表达「当前值」 |

### 无障碍
- 根为原生 `<input type="checkbox">` + `<label>` 包裹，点击文字即触发，读屏天然可读。
- `disabled` 语义由原生 input 承载；键盘 `Space` 切换。
- 半选态通过 `input.indeterminate = true` 设置（DOM 属性，非 React 属性），`aria` 上无需额外映射。
- 不要只靠颜色区分选中，勾选标记（对勾/横线）保证可见。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| 属性 | 值 | 说明 |
|------|-----|------|
| 勾选框宽高 | 16px × 16px | 固定，不随 size 缩放 |
| 圆角 | `var(--radius-2)`（2px） | 方形微圆角 |
| 对勾尺寸 | 10px | stroke 3.5，白色 |
| 半选横线 | 8px × 2px | 白色，圆角 1px |
| label 间距 | `var(--spacing-8)`（8px） | 勾选框与文字 |
| Group 水平间距 | `var(--spacing-16)`（16px） | 项与项 |
| Group 垂直间距 | `var(--spacing-8)`（8px） | 纵向排列时 |

### 状态视觉矩阵
| 状态 | 边框 | 背景 | 说明 |
|------|------|------|------|
| unchecked | `var(--color-border-base)` | `var(--color-bg-card)` | 默认空框 |
| hover（未选） | `var(--color-primary-normal)` | `var(--color-bg-card)` | 仅边框变色，无 bg |
| checked | `var(--color-primary-normal)` | `var(--color-primary-normal)` | 白色对勾 |
| indeterminate | `var(--color-primary-normal)` | `var(--color-primary-normal)` | 白色横线 |
| error | `var(--color-error-normal)` | 同当前态 | 边框标红（选中时仍为品牌蓝） |
| disabled | 同当前态 | `var(--color-bg-hover)` | `opacity:0.6`，文字 `--color-text-disable`，cursor not-allowed |

### 过渡
边框 / 背景 / 对勾 `transform` 同步 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中/半选）、`--color-border-base`（空框）、`--color-bg-card`（空框底）、`--color-bg-hover`（禁用底）、`--color-error-normal`（错误态）、`--color-text-disable`（禁用文字）、`--color-text-constant-normal`（对勾/横线）、`--radius-2`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用 `--color-gray-200` 等非规范变量，已统一为语义 token（空框 `--color-border-base`、选中 `--color-primary-normal`）。

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
| `checked` | `boolean` | `-` | 受控值（`checked !== undefined` 时受控） |
| `defaultChecked` | `boolean` | `false` | **antd 别名**，非受控默认值 |
| `indeterminate` | `boolean` | `false` | 半选态（antd 同名同义） |
| `status` | `'default' \| 'error'` | `'default'` | 校验状态，error 边框标红 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(checked: boolean, e?: Event) => void` | `-` | 回传新布尔值（非 event，与 antd `e.target.checked` 对齐取值） |
| `children` | `ReactNode` | `-` | label 文字 |
| `style` / `className` / `...rest` | `-` | `-` | 透传，`...rest` 落到原生 input |

### CheckboxGroup Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `{ label, value, disabled? }[]` | `-` | 选项集合 |
| `value` | `(string\|number)[]` | `-` | 受控选中值数组 |
| `defaultValue` | `(string\|number)[]` | `[]` | **antd 别名**，非受控默认值 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排布方向 |
| `onChange` | `(checkedValues: (string\|number)[]) => void` | `-` | 回传选中值数组 |

### 受控/非受控语义
- `checked !== undefined` 时受控，点击经 `onChange(newBool)` 通知外部更新；否则内部维护 `defaultChecked`。
- `CheckboxGroup`：`value !== undefined` 时受控，否则 `defaultValue`；`onChange` 回传**新数组**（不原地 mutate）。

### 事件 / 键盘
- 根为原生 `<input type="checkbox">`，`Space` 原生切换，无需额外键盘逻辑。
- 半选由 `useImperativeHandle` + `useEffect` 直接写 `input.indeterminate`（DOM 属性，React 无对应 prop）。

---

## 代码示例

```html
<Checkbox defaultChecked>已选中</Checkbox>
<Checkbox indeterminate>半选 indeterminate</Checkbox>
<Checkbox status="error" defaultChecked>错误状态</Checkbox>
<CheckboxGroup value={list} onChange={setList}
  options={[{label:'CPU',value:'cpu'},{label:'内存',value:'mem'}]} />
<CheckboxGroup direction="vertical" defaultValue={['a']}
  options={[{label:'同意《服务协议》',value:'a'}]} />
```

---

## 文件映射

- Preview 文件：`checkbox-preview.html`
- 组件目录：`frontend/components/Checkbox/index.html`
- 令牌文件：`frontend/shared/tokens.css`
