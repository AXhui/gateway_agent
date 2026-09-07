---
name: Badge
description: 徽标数（基础组件）
---

# Badge · 徽标数

> **分类**：数据展示
> **Figma**：1492-108660
> **组件目录**：`../../../../frontend/components/Badge/`
> **版本**：v1.1.0（已对齐 antd `Badge` `count` / `dot` / `status` / `offset` / `overflowCount` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**通知红点/数字徽标**，可独立使用或附加到图标/按钮等子元素，用于未读提示、状态标识。

### 何时用
- **未读消息/通知**数量提示。
- 图标上的**状态红点**（新消息、在线状态）。
- 需要**角标计数**的入口（消息、购物车）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 纯文字状态标签 | `Tag` |
| 数字统计展示 | `Statistic` |
| 需要进度 | `Progress` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `count` | 数字徽标 | >99 自动显示 99+（`overflowCount`） |
| `dot` | 红点 | 纯提醒不带数字 |
| `status` | 状态点 | 状态点 + 文字语义，不只看颜色 |
| `offset` | 位置微调 | 图标右上角对齐 |

### 无障碍
- 徽标数字需有可读语义（如 `aria-label="5 条未读"`）；红点状态点配文字。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 数字徽标高 | 20px | 最小 |
| 红点 | 8×8 | dot 模式 |
| 状态点 | 8×8 | status |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 数字徽标 | `--color-error-normal` 底 + 白字 |
| 状态 success | `--color-success-normal` |
| 状态 processing | `--color-primary-normal` |
| 状态 error | `--color-error-normal` |
| 状态 warning | `--color-warm-normal` |

### 过渡
无动画。

### 使用的设计令牌
`--color-error-normal`（默认红/错误）、`--color-success-normal`（成功）、`--color-primary-normal`（处理中）、`--color-warm-normal`（警告）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

> 五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。

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
| `count` | `number` | `-` | **antd 同名同值**：数字 |
| `dot` | `boolean` | `false` | **antd 同名同值**：红点模式 |
| `status` | `'success' \| 'processing' \| 'default' \| 'error' \| 'warning'` | `-` | **antd 同名同值**：状态点 |
| `offset` | `[number, number]` | `-` | **antd 同名同值**：偏移 |
| `overflowCount` | `number` | `99` | **antd 同名同值**：超限显示 `+` |
| `children` | `ReactNode` | `-` | 附加子元素 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 附加到子元素时继承其交互；独立徽标无交互。

---

## 代码示例

```html
<Badge count={5}><Icon name="bell" /></Badge>
<Badge dot><Icon name="message" /></Badge>
<Badge count={128} overflowCount={99} />
<Badge status="success" text="在线" />
```

---

## 文件映射

- Preview 文件：`badge-preview.html`
- 组件目录：`../../../../frontend/components/Badge/index.html`
- 令牌文件：`../../../tokens/tokens.css`
