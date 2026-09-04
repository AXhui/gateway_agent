# List · 列表

> **分类**：数据展示
> **Figma**：1478-137768
> **组件目录**：`../../../../frontend/components/List/`
> **版本**：v1.1.0（已对齐 antd `List` `dataSource` / `renderItem` / `pagination` / `itemLayout` / `loading` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**通用列表容器**，支持基础列表、带分页列表、栅格列表、加载态，用于通知、消息、结果、设备列表等。

### 何时用
- **纵向数据列表**（通知、消息、设备、日志）。
- 需要**分页/加载更多**的列表。
- 需要**栅格化卡片列表**（`grid`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 多列结构化数据 + 排序筛选 | `Table` |
| 时间线事件 | `Timeline` |
| 级联层级数据 | `Tree` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `dataSource` + `renderItem` | 标准渲染 | 渲染函数保持轻量 |
| `pagination` | 分页 | 数据量大时分页/滚动加载二选一 |
| `grid` | 栅格卡片 | 响应式列数 |
| `loading` | 加载态 | 空态与加载态分开处理 |

### 无障碍
- 列表 `ul`/`li` 语义；分页焦点管理；加载态有 `aria-busy`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 行内边距 | 12px 24px | 纵向列表项 |
| 项间距 | 8px | 栅格模式 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 列表项分隔 | `--color-divider-base-1` |
| hover 背景 | `--color-fill-base-hover` |
| 主文案 | `--color-text-primary` |
| 描述文案 | `--color-text-auxiliary` |

### 过渡
hover 背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-divider-base-1`（分隔）、`--color-fill-base-hover`（hover 背景）。

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
| `dataSource` | `T[]` | `[]` | **antd 同名同值**：数据源 |
| `renderItem` | `(item, index) => ReactNode` | `-` | **antd 同名同值**：渲染项 |
| `itemLayout` | `'horizontal' \| 'vertical'` | `'horizontal'` | **antd 同名同值**：布局 |
| `pagination` | `object \| boolean` | `false` | **antd 同名同值**：分页 |
| `loading` | `boolean` | `false` | **antd 同名同值**：加载态 |
| `grid` | `object` | `-` | **antd 同名同值**：栅格 |
| `split` | `boolean` | `true` | **antd 同名同值**：分隔线 |

### 受控/非受控语义
- 纯展示组件；分页由使用者控制。

### 事件 / 键盘
- 无内置交互；分页组件自身处理键盘。

---

## 代码示例

```html
<List
  dataSource={devices}
  renderItem={d => (
    <List.Item>
      <List.Item.Meta avatar={<Avatar>{d.name[0]}</Avatar>} title={d.name} description={d.status} />
    </List.Item>
  )}
  pagination={{ pageSize: 10 }}
/>
```

---

## 文件映射

- Preview 文件：`list-preview.html`
- 组件目录：`../../../../frontend/components/List/index.html`
- 令牌文件：`../../Tokens/tokens.css`
