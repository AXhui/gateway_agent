# Icon · 图标

> **分类**：基础
> **Figma**：-
> **组件目录**：`frontend/components/Icon/`
> **版本**：v1.1.0（已对齐 antd 图标用法，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**基于 Lucide 图标集的统一图标组件**，`size` 默认跟随父级字号，颜色默认继承 `currentColor`，用于增强界面语义与可读性。

### 何时用
- 按钮/菜单/表格操作列的**语义图标**（删除、编辑、搜索）。
- 状态/类型标识（成功、警告、错误）。
- 导航/菜单入口的辅助图标。
- 需要**视觉锚点**降低阅读成本的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 纯装饰且无语义 | 直接省略 |
| 需要文字承载语义 | 图标 + 文字并用，不要只留图标 |
| 复杂插画/品牌图形 | `Logo` / 图片 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `name` | 指定图标名（Lucide） | 不要混用多套图标集，保持统一 |
| `size` | 跟随父级字号或显式 px | 同一按钮组图标尺寸一致 |
| `color` | 默认 `currentColor` 继承 | 不要硬编码色值，除非状态色 |

### 无障碍
- 纯装饰图标 `aria-hidden="true"`，语义由相邻文字承载。
- 仅图标的按钮必须有 `aria-label`（如「删除」）。
- 状态图标（成功/失败）配合文字或 `aria-label`，不只靠颜色。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认尺寸 | 16×16 | 跟随父级字号（1em） |
| 常见尺寸 | 12/16/20/24 | 小/默认/大/特大 |
| 线宽 | 2px | Lucide 默认 stroke |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | `currentColor` 继承文字色 |
| 主色强调 | `--color-primary-normal` |
| 次级 | `--color-text-secondary` |
| 禁用 | `--color-text-disable` |

### 过渡
颜色继承 `currentColor`，随文字色变化即时切换，无需动画。

### 使用的设计令牌
`--color-text-primary`（默认继承）、`--color-primary-normal`（强调）、`--color-text-secondary`（次级）、`--color-text-disable`（禁用）。

> **Token 修正**：无。旧版 Skill 已符合规范，颜色一律用 `currentColor` 继承。

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
| `name` | `string` | `-` | **antd 别名**（对应 `icon`）：图标名称 |
| `size` | `number` | `16` | 图标尺寸（px），默认 1em 跟随字号 |
| `color` | `string` | `'currentColor'` | 图标颜色 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 独立图标无交互；置于按钮内时继承按钮的键盘/焦点行为。

---

## 代码示例

```html
<Icon name="search" size={16} />
<Icon name="trash" color="var(--color-error-normal)" />
<Button icon={<Icon name="plus" />}>新建</Button>
```

---

## 文件映射

- Preview 文件：`icon-preview.html`
- 组件目录：`frontend/components/Icon/index.html`
- 令牌文件：`frontend/shared/tokens.css`
