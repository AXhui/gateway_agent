# DropdownMenu · 下拉菜单

> **分类**：导航
> **Figma**：-
> **组件目录**：`frontend/components/DropdownMenu/`
> **版本**：v1.1.0（已对齐 antd `Dropdown` `trigger` / `items` / `placement` / `disabled` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**下拉菜单组件**，将一组操作收纳进悬浮面板，点击触发器展开，用于操作菜单、更多操作、右键菜单。

### 何时用
- **表格/列表操作列**的「更多」下拉。
- 收纳**次要操作**，避免操作按钮堆叠。
- **右键菜单**、筛选器、排序器。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 应用主导航 | `NavMenu` |
| 级联选项选择 | `Cascader` / `Select` |
| 快速切换标签 | `Tabs` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `trigger="hover"` | 悬浮展开 | 移动端用 click |
| `trigger="click"` | 点击展开 | 桌面端「更多」用 click |
| 危险操作 | 红色项 | 危险操作放最后并标红 |
| 菜单项 | 图 + 文 | 图标统一 16px |

### 无障碍
- `role="menu"` / `role="menuitem"`；键盘上下导航、Enter 触发、Esc 关闭。
- 触发器 `aria-haspopup="true"`、`aria-expanded` 标注展开态。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 面板宽 | 160px 起 | 随内容 |
| 菜单项高 | 32px | 紧凑 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 面板背景 | `--color-bg-card` |
| 面板阴影 | `--shadow-1` |
| 菜单项 hover/选中 | 背景 `--color-primary-bg` |
| 危险项 | `--color-error-normal` |

### 过渡
面板展开 `160ms var(--easing-standard)` 缩放淡入。

### 使用的设计令牌
`--color-bg-card`（面板）、`--shadow-1`（阴影）、`--color-primary-bg`（hover/选中背景）、`--color-error-normal`（危险项）。

> **Token 修正**：`--shadow-2` → `--shadow-1`（面板阴影统一用标准一级阴影）；`--color-brand-50` → `--color-primary-bg`（hover/选中背景统一用主色淡背景 token）。

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
| `trigger` | `'click' \| 'hover' \| 'contextMenu'` | `'click'` | **antd 同名同值**：触发方式 |
| `items` | `Array<MenuItem>` | `[]` | **antd 同名同值**（menu）：菜单项 |
| `placement` | `'bottomLeft' \| 'bottomRight' \| ...` | `'bottomLeft'` | **antd 同名同值**：弹出位置 |
| `disabled` | `boolean` | `false` | **antd 同名同值**：禁用 |
| `onOpenChange` | `(open) => void` | `-` | **antd 同名同值**：展开变化 |
| `children` | `ReactNode` | `-` | 触发器 |

### 受控/非受控语义
- `open`（可选）+ `onOpenChange` 为**受控**；缺省时内部维护非受控展开态。

### 事件 / 键盘
- 键盘上下导航、Enter 触发、Esc 关闭；点击外部关闭。

---

## 代码示例

```html
<DropdownMenu
  trigger="click"
  items={[
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除', danger: true }
  ]}
  onClick={({key}) => handle(key)}
>
  <Button icon={<Icon name="more" />}>更多</Button>
</DropdownMenu>
```

---

## 文件映射

- Preview 文件：`dropdownmenu-preview.html`
- 组件目录：`frontend/components/DropdownMenu/index.html`
- 令牌文件：`frontend/shared/tokens.css`
