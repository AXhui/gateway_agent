# PageHeader · 页头

> **分类**：导航
> **Figma**：1363-99512
> **组件目录**：`frontend/components/PageHeader/`
> **版本**：v1.1.0（已对齐 antd `PageHeader` `title` / `subTitle` / `onBack` / `extra` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页面级头部组件**，承载标题、副标题、面包屑、返回按钮与操作区，用于详情页/二级页的上下文导航。

### 何时用
- **详情页/二级页**的标题区（返回 + 标题 + 操作）。
- 需要**面包屑 + 标题**的层级导航页。
- 页头需要**右侧操作区**（按钮、更多操作）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 简单单行标题 | `Typography.Title` |
| 顶部导航栏 | `Layout.Header` + `NavMenu` |
| 卡片内标题 | `Card` `title` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `onBack` | 返回上一级 | 返回箭头在标题左侧 |
| `breadcrumb` | 层级路径 | 与标题层级呼应 |
| `subTitle` | 辅助说明 | 副标题次要色，不抢主标题 |
| `extra` | 右侧操作区 | 主要操作 + 次要操作分组 |

### 无障碍
- 返回按钮有 `aria-label`（「返回」）。
- 标题使用 `h1`/`h2` 语义，读屏可导航。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 页头内边距 | 16px 24px | 内容留白 |
| 标题字号 | 20px | 主标题 |
| 副标题字号 | 14px | 次要 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 背景 | `--color-bg-card` |
| 标题 | `--color-text-primary` |
| 副标题 | `--color-text-secondary` |
| 底部分隔 | `--color-divider-base-1` |

### 过渡
返回按钮 hover 背景 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-text-primary`（标题）、`--color-text-secondary`（副标题）、`--color-bg-card`（背景）、`--color-divider-base-1`（底部分隔）。

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
| `title` | `ReactNode` | `-` | **antd 同名同值**：主标题 |
| `subTitle` | `ReactNode` | `-` | **antd 同名同值**：副标题 |
| `onBack` | `() => void` | `-` | **antd 同名同值**：返回回调 |
| `extra` | `ReactNode` | `-` | **antd 同名同值**：右侧操作区 |
| `breadcrumb` | `ReactNode` | `-` | **antd 同名同值**：面包屑 |

### 受控/非受控语义
- 纯展示 + 回调组件，无受控语义。

### 事件 / 键盘
- `onBack` 返回按钮可键盘触发（Enter/Space）。

---

## 代码示例

```html
<PageHeader
  title="设备详情"
  subTitle="设备 ID：MS-1001"
  onBack={() => history.back()}
  breadcrumb={<Breadcrumb items={[{title:'设备'},{title:'详情'}]} />}
  extra={<Space><Button>编辑</Button><Button type="primary">保存</Button></Space>}
/>
```

---

## 文件映射

- Preview 文件：`pageheader-preview.html`
- 组件目录：`frontend/components/PageHeader/index.html`
- 令牌文件：`frontend/shared/tokens.css`
