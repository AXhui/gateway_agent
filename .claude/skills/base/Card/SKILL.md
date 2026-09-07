---
name: Card
description: 卡片（基础组件）
---

# Card · 卡片

> **分类**：数据展示
> **Figma**：1492-4939
> **组件目录**：`../../../../frontend/components/Card/`
> **版本**：v1.1.0（已对齐 antd `Card` `title` / `extra` / `actions` / `bordered` / `hoverable` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**通用内容容器**，含标题、右上操作、封面、底部操作区，用于信息分组与列表卡片。

### 何时用
- **信息分组**的容器（概览指标、详情分组）。
- **列表卡片**（设备卡片、数据卡片）。
- 需要**标题 + 操作**的区块。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 纯内容分区无标题 | `Layout.Content` / `div` |
| 详情键值对 | `Descriptions` |
| 需折叠的分组 | `Collapse` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `title` + `extra` | 标题 + 右上操作 | 操作按钮右上角 |
| `actions` | 底部操作 | 操作数 ≤ 4 |
| `hoverable` | 可点击卡片 | 列表项可点击时开启 |
| `bordered={false}` | 无边框 | 信息密集时关闭减少线条 |

### 无障碍
- 卡片语义容器；`hoverable` 可点击卡片需可键盘聚焦。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 卡片内边距 | 16px 24px | 内容留白 |
| 标题字号 | 16px | 标题 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 背景 | `--color-bg-card` |
| 默认阴影 | `--shadow-1` |
| hoverable 悬浮 | 阴影提升 |
| 底部分隔 | `--color-divider-base-1` |

### 过渡
hoverable 阴影提升 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-card`（背景）、`--shadow-1`（阴影）、`--color-divider-base-1`（分隔）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | `box-shadow` 提升一级（`--shadow-1`，回指总纲） |
| active（点击反馈） | 无（纯容器） |
| 键盘 | 无键盘语义（含可点击区域则 `Tab`/`Enter`） |
| loading | `loading` 态 Skeleton（见矩阵） |
| error | 无 |

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
| `title` | `ReactNode` | `-` | **antd 同名同值**：标题 |
| `extra` | `ReactNode` | `-` | **antd 同名同值**：右上操作 |
| `actions` | `ReactNode[]` | `-` | **antd 同名同值**：底部操作 |
| `bordered` | `boolean` | `true` | **antd 同名同值**：边框 |
| `hoverable` | `boolean` | `false` | **antd 同名同值**：悬浮效果 |
| `children` | `ReactNode` | `-` | 内容 |

### 受控/非受控语义
- 纯展示容器，无受控语义。

### 事件 / 键盘
- `hoverable` 可点击时需自行绑定交互；无内置键盘行为。

---

## 代码示例

```html
<Card title="设备概览" extra={<a>查看全部</a>}>
  <Statistic title="在线设备" value={128} />
</Card>
<Card hoverable bordered={false} actions={[<a>详情</a>, <a>编辑</a>]}>
  <DeviceInfo />
</Card>
```

---

## 文件映射

- Preview 文件：`card-preview.html`
- 组件目录：`../../../../frontend/components/Card/index.html`
- 令牌文件：`../../../tokens/tokens.css`
