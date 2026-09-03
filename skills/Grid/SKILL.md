# Grid · 栅格

> **分类**：布局
> **Figma**：-
> **组件目录**：`frontend/components/Grid/`
> **版本**：v1.1.0（已对齐 antd `Row` / `Col` `span` / `gutter` / `offset` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**24 栅格响应式布局系统**，提供 `Row` / `Col` 与 5 档 gutter，用于页面级、区块级的多列布局与对齐。

### 何时用
- **页面级多列布局**（筛选区 + 列表区、左右分栏）。
- 需要**响应式**断点调整的布局。
- 需要**列偏移 / 对齐**的精细排版。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 卡片内部简单布局 | `Flex` / `Space` |
| 一行元素间隔 | `Space` |
| 上下堆叠 | 普通块级布局 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `span` | 列宽 1-24 | 24 列求和尽量为 24 或留空 |
| `gutter` | 列间距（5 档） | 不要用 margin 替代 gutter |
| `offset` | 左偏移 | 偏移要基于 24 栅格对齐 |
| 响应式 | `xs/sm/md/lg/xl` 断点 | 断点口径要全站一致 |

### 无障碍
- 栅格为布局容器，不产生额外语义；内容顺序保持 DOM 顺序（`order` 慎用，影响读屏顺序）。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 列数 | 24 | 固定 24 栅格 |
| gutter 档位 | 8/12/16/20/24 | 对应 `--spacing-*` |
| 默认列间距 | 0 | 需显式设 gutter |

### 状态视觉矩阵
无状态，纯布局。

### 过渡
响应式断点切换 `200ms var(--easing-standard)`（可选）。

### 使用的设计令牌
`--spacing-12`、`--spacing-16`（gutter）、`--spacing-8`/`--spacing-20`/`--spacing-24`（其他档位）。

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
| `span` | `number` | `-` | **antd 同名同值**：列宽（1-24） |
| `offset` | `number` | `0` | **antd 同名同值**：左偏移列数 |
| `gutter` | `number \| [number, number]` | `0` | **antd 同名同值**：列间距 |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between'` | `'start'` | **antd 同名同值**：水平对齐 |
| `align` | `'top' \| 'middle' \| 'bottom'` | `'top'` | **antd 同名同值**：垂直对齐 |
| `xs/sm/md/lg/xl` | `number \| object` | `-` | **antd 同名同值**：响应式断点 |

### 受控/非受控语义
- 纯布局组件，无受控语义。

### 事件 / 键盘
- 布局容器，无交互。

---

## 代码示例

```html
<Row gutter={16}>
  <Col span={8}>筛选区</Col>
  <Col span={16}>列表区</Col>
</Row>
<Row gutter={[16, 24]} justify="space-between" align="middle">
  <Col span={12} />
  <Col span={12} />
</Row>
```

---

## 文件映射

- Preview 文件：`grid-preview.html`
- 组件目录：`frontend/components/Grid/index.html`
- 令牌文件：`frontend/shared/tokens.css`
