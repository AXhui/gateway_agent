# Typography · 排版

> **分类**：基础
> **Figma**：1294-954
> **组件目录**：`../../../../frontend/components/Typography/`
> **版本**：v1.1.0（已对齐 antd `Typography` `level` / `type` / `ellipsis` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**文本与段落系统**，提供 H1-H5 标题、四种语义文本、链接、行内代码等基础排版能力，统一全站文字层级。

### 何时用
- 页面**标题层级**（H1-H5）。
- **语义化文本**（次要、成功、警告、危险）。
- **链接**、**行内代码**、**自动省略**等排版增强。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 需要强调/加粗 | `Typography` 或 `<strong>` |
| 长段落内容 | 原生 `<p>` 段落 |
| 表单字段标题 | `Form.Item` `label` |
| 状态数字 | `Statistic` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `level` | H1-H5 标题 | 标题层级 H1 > H2 > H3 严格递进，不跳级 |
| `type="secondary"` | 次要说明 | 正文默认主色，次要仅辅助 |
| `type="danger"` | 危险提示 | 不要大面积用危险色 |
| `ellipsis` | 自动省略 | 省略需保留完整信息（title 提示） |
| `code` | 行内代码 | 多行代码用代码块，不混用 |

### 无障碍
- 标题使用语义化标签（`h1`-`h5`），保持层级递进，读屏可导航。
- 链接有明确的 `href` 或 `onClick`，可键盘聚焦。
- 省略文本保留 `title` 属性，读屏可获取完整内容。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 级别 | 字号 | 行高 | 字重 |
|------|------|------|------|
| H1 | 30px | 1.4 | 600 |
| H2 | 24px | 1.4 | 600 |
| H3 | 20px | 1.5 | 600 |
| H4 | 16px | 1.5 | 500 |
| H5 | 14px | 1.5 | 500 |
| 正文 | 14px | 1.571 | 400 |

### 状态视觉矩阵
| 类型 | 文字色 |
|------|--------|
| 默认 | `--color-text-primary` |
| secondary | `--color-text-secondary` |
| success | `--color-success-normal` |
| warning | `--color-warm-normal` |
| danger | `--color-error-normal` |
| 链接 | `--color-primary-normal` |

### 过渡
链接 hover 颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-text-primary`（默认）、`--color-text-secondary`（次要）、`--color-success-normal`/`--color-warm-normal`/`--color-error-normal`（语义）、`--color-primary-normal`（链接）、`--font-sans`、`--duration-fast`、`--easing-standard`。

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
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | **antd 同名同值**（Title）：标题级别 |
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | `-` | **antd 同名同值**（Text）：文本类型 |
| `ellipsis` | `boolean \| object` | `false` | **antd 同名同值**：自动省略 |
| `code` | `boolean` | `false` | **antd 同名同值**：行内代码风格 |
| `children` | `ReactNode` | `-` | 文本内容 |

### 受控/非受控语义
- 纯展示组件，无受控语义；`ellipsis` 内部处理溢出裁剪。

### 事件 / 键盘
- 链接型可键盘聚焦；省略文本 `title` 提供完整内容。

---

## 代码示例

```html
<Typography.Title level={2}>设备列表</Typography.Title>
<Typography.Text type="secondary">共 128 台设备</Typography.Text>
<Typography.Text ellipsis={{ tooltip: longText }}>{longText}</Typography.Text>
<Typography.Link href="/detail">查看详情</Typography.Link>
```

---

## 文件映射

- Preview 文件：`typography-preview.html`
- 组件目录：`../../../../frontend/components/Typography/index.html`
- 令牌文件：`../../Tokens/tokens.css`
