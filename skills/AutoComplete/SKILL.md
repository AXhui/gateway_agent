# AutoComplete · 自动完成

> **分类**：数据录入
> **Figma**：1453-86532
> **组件目录**：`frontend/components/AutoComplete/`
> **版本**：v1.1.0（已对齐 antd `AutoComplete` `options` / `onSearch` / `allowClear` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**输入框 + 下拉建议**。用户边输入边联想，适合「海量候选项、需搜索定位」的选择场景；与 `Select` 的区别在于它允许输入**不在候选项内**的自由值。

### 何时用
- 候选量巨大（数千/远程），无法一次枚举，需输入关键词过滤。
- 允许用户**自由输入**（如标签、邮箱前缀、备注），联想仅作辅助。
- 需要**远程搜索**（按输入请求后端），如全局搜索、资源选择。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 候选项固定且可枚举（<50） | `Select` |
| 值必须严格来自候选项、不允许自由输入 | `Select` |
| 层级数据选择 | `TreeSelect` / `Cascader` |
| 纯文本输入、无联想 | `Input` |
| 即时筛选表格（无选择语义） | `Input.Search` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 本地 options 过滤联想 | options 一次性全量塞入会卡顿 |
| `onSearch` 远程 | 输入触发后端搜索，防抖 300ms | 不要在 onSearch 内做同步重计算 |
| `allowClear` | 提供一键清空 | 有默认值或必填时不要 allowClear |
| 高亮匹配 | 联想项中高亮命中片段 | 高亮颜色不要喧宾夺主 |

### 无障碍
- 根为 `<input>`，联想层用 `role="listbox"` + `role="option"`，`aria-activedescendant` 标记高亮项。
- 键盘 `↑ ↓` 在联想项间切换，`Enter` 选中，`Esc` 关闭下拉。
- 空结果显示「暂无匹配」，不要静默关闭导致用户以为卡死。
- 选中联想项后回填 input 值，读屏可感知。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 输入框高度 | 24/32/40（sm/md/lg） | 对齐 `Input` |
| 下拉内边距 | 4px | 与 `Select` 一致 |
| 联想项高度 | 32px | padding `6px 12px` |
| 下拉圆角 | `var(--radius-8)` | 悬浮层 |
| 下拉投影 | `0 6px 20px rgba(11,18,32,0.08)` | 与 Select 一致 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `var(--color-border-base)`，bg `var(--color-bg-card)` |
| 聚焦 | 边框 `var(--color-primary-normal)` + focus ring |
| 联想高亮项 | bg `rgba(52,145,250,0.08)`，文字 `var(--color-primary-normal)` |
| hover 项 | bg `var(--color-bg-page)` |
| 空结果 | 「暂无匹配」`--color-text-auxiliary` |
| disabled | bg `var(--color-bg-hover)`，文字 `--color-text-disable` |

### 过渡
边框/聚焦环 `160ms var(--easing-standard)`；下拉展开淡入 120ms。

### 使用的设计令牌
`--color-primary-normal`（聚焦/高亮）、`--color-primary-bg`（高亮底，等价 `--color-fill-primary`）、`--color-border-base`（默认边框）、`--color-bg-card`（输入框/下拉底）、`--color-bg-hover`（禁用底）、`--color-bg-page`（hover 项）、`--color-text-primary`、`--color-text-secondary`、`--color-text-auxiliary`、`--color-text-disable`、`--radius-4`、`--radius-8`、`--shadow-1`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（联想高亮底）与 `--shadow-2`（下拉投影），已分别统一为 `--color-primary-bg` 与 `--shadow-1`。

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
| `options` | `{ label, value }[]` | `[]` | **antd 同名同义**：联想候选 |
| `value` | `string` | `-` | 受控输入值 |
| `defaultValue` | `string` | `-` | **antd 别名**，非受控默认值 |
| `onSearch` | `(value: string) => void` | `-` | **antd 同名同义**：输入变化回调（触发联想） |
| `onSelect` | `(value: string, option) => void` | `-` | **antd 同名同义**：选中联想项 |
| `onChange` | `(value: string) => void` | `-` | 输入值变化回调 |
| `allowClear` | `boolean` | `false` | **antd 同名同值**：一键清空 |
| `placeholder` | `string` | `-` | 占位文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `value !== undefined` 时受控，输入/选中经 `onSearch`/`onSelect` 通知外部更新；否则内部维护 `defaultValue`。
- 远程搜索场景：`onSearch` 防抖 300ms → 请求 → 回填 `options`。

### 事件 / 键盘
- 根为 `<input>`；`↑ ↓` 切换高亮、`Enter` 选中、`Esc` 关闭下拉。
- 失焦关闭下拉，但需保证 `onSelect` 在 blur 前触发（用 `onMouseDown` 阻止 input 抢焦点）。

---

## 代码示例

```html
<AutoComplete options={[{label:'华东 1',value:'cn-east-1'}]} onSearch={handleSearch} placeholder="搜索实例" />
<AutoComplete allowClear options={tagOptions} defaultValue="iot" />
<AutoComplete value={kw} onSearch={debounce(search, 300)} onChange={setKw} />
```

---

## 文件映射

- Preview 文件：`autocomplete-preview.html`
- 组件目录：`frontend/components/AutoComplete/index.html`
- 令牌文件：`frontend/shared/tokens.css`
