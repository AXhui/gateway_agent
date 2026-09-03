# Tabs · 标签页

> **分类**：导航
> **Figma**：1481-170977
> **组件目录**：`frontend/components/Tabs/`
> **版本**：v1.1.0（已对齐 antd `Tabs` `type` / `items` / `activeKey` / `centered` / `tabPosition` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**内容分区切换组件**，在同一区域通过标签切换不同内容视图，用于详情页多维度信息、多视图切换。

### 何时用
- **同一内容区**切换不同视图（概览/日志/告警）。
- 详情页**多维度信息**分块（基础信息/配置/事件）。
- 需要**并行视图**但空间受限时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 应用级页面导航 | `NavMenu` |
| 流程步骤 | `Steps` |
| 简单开关切换 | `Switch` / `Segmented` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="line"` | 下划线式 | 默认，最常用 |
| `type="card"` | 卡片式 | 需要块状分区时 |
| `tabPosition="left"` | 左侧竖排 | 标签多或名称长时 |
| `centered` | 居中标签 | 标签少且居中更美观 |
| 内容懒加载 | 首次切换才渲染 | 性能优化 |

### 无障碍
- `role="tablist"` / `role="tab"` / `role="tabpanel"` 语义。
- 键盘左右键切换标签，`aria-selected` 标注选中态。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 标签高 | 40px | 标准 |
| 标签间距 | 24px | line 型 |
| 激活下划线 | 2px | line 型 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 背景 | `--color-bg-page` |
| 默认标签 | `--color-text-primary` |
| 选中标签 | `--color-primary-normal` |
| 激活下划线 | `--color-primary-normal` |
| 分隔线 | `--color-border-base` |

### 过渡
下划线/颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中/下划线）、`--color-border-base`（分隔线）、`--color-bg-page`（背景）、`--color-text-primary`（默认标签）。

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
| `type` | `'line' \| 'card' \| 'editable-card'` | `'line'` | **antd 同名同值**：类型 |
| `items` | `Array<{key, label, children?}>` | `[]` | **antd 同名同值**：标签项 |
| `activeKey` | `string` | `-` | **antd 同名同值**：选中标签 |
| `defaultActiveKey` | `string` | `-` | **antd 同名同值**：默认选中 |
| `centered` | `boolean` | `false` | **antd 同名同值**：居中 |
| `tabPosition` | `'top' \| 'left' \| 'right' \| 'bottom'` | `'top'` | **antd 同名同值**：位置 |
| `onChange` | `(key) => void` | `-` | **antd 同名同值**：切换回调 |

### 受控/非受控语义
- `activeKey` + `onChange` 为**受控**；`defaultActiveKey` 为非受控初始值。

### 事件 / 键盘
- 键盘左右键切换标签；`onChange` 返回选中 `key`。

---

## 代码示例

```html
<Tabs
  activeKey={key}
  onChange={setKey}
  items={[
    { key: 'overview', label: '概览', children: <Overview /> },
    { key: 'log', label: '日志', children: <Log /> },
    { key: 'alarm', label: '告警', children: <Alarm /> }
  ]}
/>
```

---

## 文件映射

- Preview 文件：`tabs-preview.html`
- 组件目录：`frontend/components/Tabs/index.html`
- 令牌文件：`frontend/shared/tokens.css`
