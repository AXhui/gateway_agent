# Divider · 分割线

> **分类**：基础
> **Figma**：1303-6825
> **组件目录**：`../../../../frontend/components/Divider/`
> **版本**：v1.1.0（已对齐 antd `Divider` `type` / `orientation` / `dashed` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**区隔内容的分割线**，支持水平/垂直、实线/虚线、带文字三类形态，用于划分内容区块的视觉边界。

### 何时用
- 划分**不同内容区块**（标题与正文、段落之间）。
- 需要**带文字**的分组说明（「更多设置」「其他」）。
- 垂直分割（工具栏按钮之间、操作列之间）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 列表项之间的分隔 | 列表自身 `border-bottom` |
| 卡片/区块分隔 | 间距 + 背景（`Space` / 空白） |
| 表头与表格内容 | 表格自带边框 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="horizontal"` | 上下分区 | 列表项之间不要用 |
| `type="vertical"` | 行内左右分区 | 高度要适配容器 |
| `dashed` | 弱化分隔 | 需要强分隔时不要虚线 |
| `orientation` + 文字 | 带标题的分组 | 文字要简短，说明区块主题 |

### 无障碍
- 分割线为装饰性元素，`aria-hidden="true"`。
- 带文字时文字作为分组标题语义（可用 `role="separator"` 或标题标签）。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 水平线高 | 1px | 实线/虚线 |
| 垂直间距 | 上下 16px | 水平分割留白 |
| 文字边距 | 左右 16px | 文字与线间距 |
| 文字字号 | 14px | 分组标题 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 线 | `var(--color-border-base)` |
| 文字 | `--color-text-auxiliary` |

### 过渡
无动画。

### 使用的设计令牌
`--color-border-base`（线）、`--color-text-auxiliary`（文字）、`--spacing-16`（留白）。

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
| `type` | `'horizontal' \| 'vertical'` | `'horizontal'` | **antd 同名同值**：方向 |
| `dashed` | `boolean` | `false` | **antd 同名同值**：虚线 |
| `orientation` | `'left' \| 'right' \| 'center'` | `'center'` | **antd 同名同值**：文字位置 |
| `plain` | `boolean` | `false` | **antd 同名同值**：普通文字（非标题） |
| `children` | `ReactNode` | `-` | 分割线文字 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 装饰性元素，无交互；文字作为分组语义。

---

## 代码示例

```html
<Divider />
<Divider dashed>更多设置</Divider>
<Divider orientation="left">基础信息</Divider>
<Divider type="vertical" />
```

---

## 文件映射

- Preview 文件：`divider-preview.html`
- 组件目录：`../../../../frontend/components/Divider/index.html`
- 令牌文件：`../../Tokens/tokens.css`
