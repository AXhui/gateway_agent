# Tooltip · 文字提示

> **分类**：数据展示
> **Figma**：1478-137793
> **组件目录**：`frontend/components/Tooltip/`
> **版本**：v1.1.0（已对齐 antd `Tooltip` `title` / `placement` / `trigger` / `open` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**轻量文字提示浮层**，悬停/聚焦时展示简短说明，用于按钮释义、图标说明、截断文本补全。

### 何时用
- **图标/按钮**无文字的释义。
- **截断文本**的完整内容补全。
- **简短操作提示**。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 内容含图文/交互 | `Popover` |
| 需确认操作 | `Popconfirm` |
| 复杂表单说明 | `Form.Item` 的 extra/help |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `trigger="hover"` | 默认悬停 | 移动端避免 hover |
| `placement` | 定位 | 边缘自动翻转 |
| 提示文案 | 简洁 | ≤ 20 字，过长用 Popover |

### 无障碍
- 触发元素 `aria-describedby`；`trigger="focus"` 时键盘可触发；Esc 关闭。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 内边距 | 6px 8px | 文字留白 |
| 字号 | 12px | 小字提示 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 背景 | 深色（`--color-text-primary` 反白） |
| 阴影 | `--shadow-1` |
| 文字 | 白字 |

### 过渡
出现/消失 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--shadow-1`（阴影）。

> **Token 修正**：`--shadow-2` → `--shadow-1`（提示浮层阴影统一使用 `--shadow-1` 标准层）。

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
| `title` | `ReactNode` | `-` | **antd 同名同值**：提示内容 |
| `placement` | `Placement` | `'top'` | **antd 同名同值**：位置 |
| `trigger` | `'hover' \| 'focus' \| 'click'` | `'hover'` | **antd 同名同值**：触发方式 |
| `open` | `boolean` | `-` | **antd 同名同值**：受控显隐 |
| `onOpenChange` | `(open) => void` | `-` | **antd 同名同值**：显隐变化 |
| `children` | `ReactNode` | `-` | 触发元素 |

### 受控/非受控语义
- `open` + `onOpenChange` 为**受控**；缺省时内部维护非受控显隐。

### 事件 / 键盘
- Esc 关闭；`trigger="focus"` 时聚焦触发、失焦关闭。

---

## 代码示例

```html
<Tooltip title="刷新数据">
  <Button icon={<Icon name="refresh" />} />
</Tooltip>
<Tooltip title={longText} placement="bottom"><span>{truncated}</span></Tooltip>
```

---

## 文件映射

- Preview 文件：`tooltip-preview.html`
- 组件目录：`frontend/components/Tooltip/index.html`
- 令牌文件：`frontend/shared/tokens.css`
