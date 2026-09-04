# Space · 间距

> **分类**：布局
> **Figma**：-
> **组件目录**：`../../../../frontend/components/Space/`
> **版本**：v1.1.0（已对齐 antd `Space` `size` / `direction` / `wrap` / `split` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**行内元素间距容器**，统一一组相邻元素的水平/垂直间距，支持换行与分隔符，避免手工加 margin。

### 何时用
- 一组**行内元素**（按钮组、标签组、操作链接组）的间距。
- 需要**统一间距**并可整体调整的场景。
- 需要元素间**分隔符**（如面包屑、操作列 `|` 分隔）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 多列布局 | `Grid` / `Flex` |
| 上下堆叠区块 | `Flex` `vertical` 或块级 |
| 列表项布局 | `List` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `size` | 间距（8/12/16） | 全站间距档位用 `--spacing-*` 对齐 |
| `direction` | 水平/垂直 | 表单行内用 horizontal |
| `wrap` | 空间不足换行 | 移动端务必开 wrap |
| `split` | 元素间分隔符 | 分隔符要轻（竖线/逗号） |

### 无障碍
- 纯布局容器；分隔符 `aria-hidden="true"`，不干扰读屏。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| size | 8/12/16 | 对应 `--spacing-8/12/16` |
| 默认 | 8px | 小间距 |
| 垂直方向间距 | 同 size | 上下 |

### 状态视觉矩阵
无状态，纯布局。

### 过渡
无动画。

### 使用的设计令牌
`--spacing-8`、`--spacing-12`、`--spacing-16`（间距档位）。

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
| `size` | `number \| 'small' \| 'middle' \| 'large'` | `'small'` | **antd 同名同值**：间距 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | **antd 同名同值**：方向 |
| `wrap` | `boolean` | `false` | **antd 同名同值**：自动换行 |
| `split` | `ReactNode` | `-` | **antd 同名同值**：分隔符 |
| `children` | `ReactNode` | `-` | 内容 |

### 受控/非受控语义
- 纯布局组件，无受控语义。

### 事件 / 键盘
- 布局容器，无交互。

---

## 代码示例

```html
<Space size="middle">
  <Button>取消</Button>
  <Button type="primary">确定</Button>
</Space>
<Space split={<Divider type="vertical" />}>
  <a>编辑</a><a>删除</a><a>复制</a>
</Space>
```

---

## 文件映射

- Preview 文件：`space-preview.html`
- 组件目录：`../../../../frontend/components/Space/index.html`
- 令牌文件：`../../Tokens/tokens.css`
