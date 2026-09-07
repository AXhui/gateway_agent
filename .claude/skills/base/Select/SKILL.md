---
name: Select
description: 选择器（基础组件）
---

# Select · 选择器

> **分类**：数据录入
> **Figma**：1424-136357
> **组件目录**：`../../../../frontend/components/Select/`
> **版本**：v1.1.0（已对齐 antd `mode` / `open` / `onOpenChange` API）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
从一组**预定义选项**中选取一个或多个值。Select 是「从有限集合中做选择」的载体，不是「输入自由文本」的载体。

### 何时用
- 需要从 8–30 个固定选项中选择一项或多项时。
- 需要下拉承载搜索、分组、异步加载等扩展选择能力时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 选项 ≤ 7，且单选、一次性展示 | `Radio`（平铺更高效，减少一次点击） |
| 选项 > 30 且无清晰枚举 | `AutoComplete` 或远程搜索 |
| 用户需要输入任意新值 | `AutoComplete`（`mode="tags"` 之外） |
| 层级/树形结构选择 | `TreeSelect` / `Cascader` |
| 两个列表间批量移项 | `Transfer` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 单选（默认） | 明确唯一选择，提交时取 `value` | 选项过多仍硬塞单选下拉 |
| `mode="multiple"` | 多选，值以 Tag 显示在框内 | 选中的 Tag 不要溢出框外（超出需折叠计数） |
| `mode="tags"` | 多选 + 允许自定义新标签 | 不要用于严格枚举（业务不允许新值时用 multiple） |
| `showSearch` | 选项 > 8 时开启 | 选项很少时不要无谓开启搜索 |
| `allowClear` | 允许一键回到空态 | 必填字段不提供清空 |

### 无障碍
- 根元素 `role="combobox"`，展开态 `aria-expanded`，下拉 `aria-haspopup="listbox"`。
- 键盘：`Enter`/`ArrowDown`/`Space` 展开，`ArrowUp`/`ArrowDown` 移动高亮，`Enter` 选中，`Escape` 收起。
- 禁用项（`option.disabled`）不可选中、不可高亮，光标 `not-allowed`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| size | min-height | 字号/行高 |
|------|-----------|-----------|
| `sm` | 24px | 12px/20px |
| `md`（默认） | 32px | 14px/22px |
| `lg` | 40px | 16px/24px |

### 状态视觉矩阵
| 状态 | 边框 | 焦点环 | 说明 |
|------|------|--------|------|
| default | `1px solid var(--color-border-base)` | 无 | 未聚焦 |
| hover/focus | `1px solid var(--color-primary-normal)` | `0 0 0 3px var(--color-primary-bg)` | 展开/聚焦 |
| error | `1px solid var(--color-error-normal)` | `0 0 0 3px var(--color-error-bg)` | `status="error"` |
| disabled | `1px solid var(--color-border-base)` | 无 | bg `--color-bg-hover`，字 `--color-text-disable`，cursor not-allowed |

### 下拉面板
- 距输入框 4px，`border-radius: var(--radius-8)`，阴影 `0 6px 20px rgba(11,18,32,0.08)`。
- 最大高度 256px，超出内部滚动。
- 选项 padding `6px 12px`，圆角 `--radius-4`。

### 选项态
| 态 | 视觉 |
|----|------|
| 默认 | 字 `--color-text-primary`，bg transparent |
| hover/高亮 | bg `--color-bg-page` |
| 选中 | 字 `--color-primary-normal`，bg `--color-primary-bg`，右侧对勾 |
| 禁用 | 字 `--color-text-disable`，cursor not-allowed |

### 多选 Tag
选中项以 Tag 形式显示：bg `--color-bg-hover`，圆角 `--radius-2`，含 × 删除按钮（`TagX`），× 移除单项不影响下拉状态。

### 图标 / 过渡
- 右 chevron：12px，展开时 `rotate(180deg)`，过渡 `transform var(--duration-fast) var(--easing-standard)`。
- 清空 ×：`allowClear` 且 `hasValue` 且非 disabled 时显示在 chevron 左侧，hover 可清空。

### 使用的设计令牌
`--color-primary-normal`、`--color-primary-bg`、`--color-error-normal`、`--color-text-primary/secondary/auxiliary/disable`、`--color-bg-card`、`--color-bg-hover`、`--color-bg-page`、`--color-border-base`、`--color-divider-base-1`、`--radius-2/4/8`、`--spacing-*`、`--duration-fast`、`--easing-standard`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 边框 + 焦点环（见矩阵） |
| active（点击反馈） | 选项按下 |
| 键盘 | `↑↓` 导航、`Enter` 选中、`Esc` 收起、`Space` 展开 |
| loading | 下拉异步 `loading`（回指总纲） |
| error | 边框 `--color-error-normal` + 焦点环 `--color-error-bg` |

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
| `options` | `Option[]` | `[]` | 选项列表，`Option = { value, label, disabled? }` |
| `value` | `Value \| Value[]` | `-` | 受控值 |
| `defaultValue` | `Value \| Value[]` | `-` | 非受控默认值 |
| `mode` | `'multiple' \| 'tags'` | `-` | **antd 别名**，多选/标签 |
| `multiple` / `tags` | `boolean` | `false` | Milesight 原生多选开关，等价 `mode` |
| `showSearch` | `boolean` | `false` | 可搜索 |
| `allowClear` | `boolean` | `false` | 可清空 |
| `open` | `boolean` | `-` | **antd 受控**下拉开关 |
| `defaultOpen` | `boolean` | `false` | 默认展开 |
| `onOpenChange` | `(open: boolean) => void` | `-` | 展开状态变化回调 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `status` | `'default' \| 'error'` | `'default'` | 校验态 |
| `placeholder` | `string` | `'请选择'` | 占位 |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(value) => void` | `-` | 选中变化回调 |

### 受控/非受控语义
- `value !== undefined` 时受控，`onChange` 回调后由外部更新 `value`。
- `open !== undefined` 时受控下拉；否则内部维护，`onOpenChange` 仅作通知。
- 单选 `value` 为标量，多选 `value` 为数组。

### 事件 / 键盘
- 键盘导航：`ArrowDown`/`ArrowUp` 移动高亮索引 `hi`（循环），`Enter` 选中高亮项，`Escape` 收起。
- 点击外部（`mousedown` 监听 + `ref.contains`）自动收起下拉。

---

## 代码示例

```html
<Select options={regions} defaultValue="cn-east-1" />
<Select multiple options={regions} defaultValue={["cn-east-1", "cn-north-2"]} />
<Select mode="multiple" allowClear showSearch options={regions} />
<Select options={regions} status="error" />
<Select open={open} onOpenChange={setOpen} options={regions} />
```

---

## 文件映射

- Preview 文件：`select-preview.html`
- 组件目录：`../../../../frontend/components/Select/index.html`
- 令牌文件：`../../../tokens/tokens.css`
