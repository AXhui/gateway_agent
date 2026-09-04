# Button · 按钮

> **分类**：基础
> **Figma**：1294-844
> **组件目录**：`../../../../frontend/components/Button/`
> **版本**：v1.1.0（已对齐 antd `type` API）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
触发一次即时操作的交互入口。按钮是「动作」的视觉载体，不是「状态」或「导航」。

### 何时用
- 需要触发某个**操作**（提交、新建、删除、导出、跳转）时。
- 表单提交、表格行操作、对话框主/次操作、批量操作区。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 页面/区块之间的跳转，无「动作」语义 | `Link` / 面包屑 |
| 开关状态切换（开/关） | `Switch` |
| 一次性选中、选中态需要保留 | `Radio` / `Checkbox` |
| 触发下拉菜单（按钮本身承载多个动作） | `Dropdown`（按钮作为 trigger） |
| 纯文字超链接跳转 | 用 `type="link"`，不要用 `<a>` 硬编码样式 |

### 变体选择建议（Do / Don't）
| 类型 | 用法 | 禁忌 |
|------|------|------|
| `primary` / `variant="filled"` | **一屏只允许一个**，代表最高优先级主操作 | 不要在同一视区出现两个 primary |
| `default` / `variant="outlined"` | 次要操作，与 primary 组合 | 不要与 primary 视觉权重相同 |
| `dashed` | 表单「添加配置项」这类可扩展动作 | 不要用于删除/确认等严肃操作 |
| `text` | 表格行内轻操作（编辑/查看） | 不要承载主流程唯一操作 |
| `link` | 跳转/超链接语义 | 不要用于「提交」「删除」等动作 |
| `ghost` | 深色/彩色背景上的反白按钮 | 不要在白色背景上单独使用 |

### 危险操作
破坏性操作（删除、停用）必须「`status="danger"` + 二次确认（Popconfirm/Modal）」，**禁止**点击即执行。

### 无障碍
- `loading` 时设置 `aria-busy`，禁用指针事件。
- 图标按钮必须提供 `aria-label`。
- 键盘可聚焦：`Tab` 进入，`Enter`/`Space` 触发（原生 `<button>` 已提供）。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| size | height | padding-x | 字号 | 圆角(rect) |
|------|--------|-----------|------|-----------|
| `xs` | 24px | 8px | 12px | `--radius-4` |
| `sm` | 28px | 10px | 14px | `--radius-4` |
| `md`（默认） | 32px | 12px | 14px/22px | `--radius-4` |
| `lg` | 40px | 16px | 16px | `--radius-8` |

`shape="pill"` 时圆角统一 `--radius-full`。

### 变体 × 状态视觉矩阵
| 变体 | default | hover | active | disabled |
|------|---------|-------|--------|----------|
| `filled` | bg `--color-primary-normal`，字 `--color-text-constant-normal` | bg `--color-primary-hover` | bg `--color-primary-active` | opacity 0.5 |
| `outlined` | bg `--color-bg-card`，边框/字 `--color-primary-normal` | bg `--color-primary-bg` | bg `--color-primary-bg` | opacity 0.5 |
| `dashed` | 同 outlined，边框 `1px dashed` | 同 outlined | 同 outlined | opacity 0.5 |
| `ghost` | bg transparent，边框/字 `--color-primary-normal` | bg `--color-primary-bg` | 同 hover | opacity 0.5 |
| `text` | bg transparent，边框 transparent，字 `--color-primary-normal` | bg `--color-primary-bg` | 同 hover | opacity 0.5 |
| `link` | 同 text，`text-decoration: underline`，offset 2px | 无背景变化 | 无背景变化 | opacity 0.5 |

### 状态色映射（`status` → 主色）
| status | 主色 | 说明 |
|--------|------|------|
| `standard`（默认） | `--color-primary-normal` | 主操作 |
| `danger` | `--color-error-normal` | 破坏性 |
| `success` | `--color-success-normal` | 成功/通过 |
| `warn` | `--color-warm-normal` | 警告 |
| `normal` | `--color-text-secondary` | 中性 |
| `transparent` | `--color-text-constant-normal` | 反白场景 |

### 焦点态
`focus-visible`：`outline: 2px solid var(--color-primary-normal)`，`outline-offset: 2px`。

### 过渡
`transition: background-color / border-color / color / box-shadow 160ms var(--easing-standard)`。

### 图标
- 图标默认 16px（`md`），与文字间距 4px（`xs/sm`）/ 6px（`lg`）。
- 图标按钮（无 children）：宽 = 高（正方形），padding 0。

### 使用的设计令牌
`--color-primary-normal`、`--color-primary-hover`、`--color-primary-active`、`--color-primary-bg`、`--color-error-normal`、`--color-success-normal`、`--color-warm-normal`、`--color-text-primary/secondary/auxiliary/constant-normal`、`--color-bg-card`、`--color-bg-hover`、`--radius-4/8/full`、`--spacing-*`、`--duration-fast`、`--easing-standard`、`--shadow-diffusion-*`。

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
| `type` | `'primary' \| 'default' \| 'dashed' \| 'ghost' \| 'text' \| 'link'` | `'default'` | **antd 别名**，映射到 `variant` |
| `variant` | `'filled' \| 'outlined' \| 'dashed' \| 'ghost' \| 'text' \| 'link'` | `'filled'` | Milesight 原生变体，`type` 优先 |
| `status` | `'standard' \| 'danger' \| 'success' \| 'warn' \| 'normal' \| 'transparent'` | `'standard'` | 语义状态色 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `shape` | `'rect' \| 'pill'` | `'rect'` | 形状 |
| `loading` | `boolean \| { delay?: number }` | `false` | 加载态（左侧 Spin） |
| `disabled` | `boolean` | `false` | 禁用 |
| `iconLeft` / `iconRight` | `ReactNode` | `-` | 图标（loading 时 iconLeft 被替换） |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 type |
| `block` | `boolean` | `false` | 撑满容器宽度 |
| `href` / `target` | `string` | `-` | 渲染为 `<a>`（link 场景） |

### 别名映射（`type` → `variant`）
```
primary → filled
default → outlined
dashed  → dashed
ghost   → ghost
text    → text
link    → link
```

### 受控/非受控语义
- 纯受控组件：无内部 `value`，交互状态（hover/active/focus）由组件内部管理，不暴露。
- `loading` 与 `disabled` 互斥逻辑：`loading` 强制 `disabled` 行为。

### 事件
继承原生 `<button>` 全部事件（`onClick`、`onMouseEnter`、`onFocus` 等），通过 `...rest` 透传。

---

## 代码示例

```html
<Button type="primary">主操作</Button>
<Button variant="outlined" status="danger">删除</Button>
<Button type="ghost">幽灵按钮</Button>
<Button loading>加载中</Button>
<Button iconLeft={<PlusIcon />} aria-label="add" />
```

---

## 文件映射

- Preview 文件：`button-preview.html`
- 组件目录：`../../../../frontend/components/Button/index.html`
- 令牌文件：`../../Tokens/tokens.css`
