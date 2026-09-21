---
name: Statistic
description: 统计数值（基础组件）
---

# Statistic · 统计数值

> **分类**：数据展示
> **Figma**：1492-29223
> **组件目录**：`../../../../frontend/components/Statistic/`
> **版本**：v1.1.0（已对齐 antd `Statistic` `value` / `title` / `prefix` / `suffix` / `precision` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**数值统计展示**，支持前后缀、精度、倒计时，用于看板指标、仪表盘、关键数据突出展示。

### 何时用
- **看板/仪表盘**关键指标（设备数、在线率、告警数）。
- 需要**单位前后缀**的数值。
- **倒计时/计时**（`Countdown`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 明细数据列表 | `Descriptions` / `Table` |
| 趋势变化 | `Chart` 类组件 |
| 普通数字标签 | `Tag` / 文本 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `title` | 指标名 | 指标名简洁 |
| `value` | 数值 | 大字号突出 |
| `prefix` / `suffix` | 单位/图标 | 单位清晰不冗余 |
| `precision` | 小数位 | 金额/比例用 |

### 无障碍
- 数值有语义；`title` 描述指标含义。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 数值字号 | 28/24/20（阶梯，见 `rules/spacing.md` §4 数值展示家族） | 突出 |
| 标题字号 | 12 或 14（**禁止 13px**，正文/标题字号集合 {30/24/20/16/14/12}） | 次要 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 数值 | `--color-text-primary` |
| 标题 | `--color-text-auxiliary` |
| 前缀/后缀 | `--color-text-secondary` |

### 过渡
无动画（Countdown 数值变化可用 `160ms`）。

### 使用的设计令牌
`--color-text-primary`（数值）、`--color-text-auxiliary`（标题）。

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
| `value` | `number \| string` | `-` | **antd 同名同值**：数值 |
| `title` | `ReactNode` | `-` | **antd 同名同值**：标题 |
| `prefix` | `ReactNode` | `-` | **antd 同名同值**：前缀 |
| `suffix` | `ReactNode` | `-` | **antd 同名同值**：后缀 |
| `precision` | `number` | `-` | **antd 同名同值**：小数位 |

### 受控/非受控语义
- 纯展示组件；`Countdown` 内部维护计时（非受控）。

### 事件 / 键盘
- 无交互。

---

## 代码示例

```html
<Statistic title="在线设备" value={128} suffix="台" />
<Statistic title="设备在线率" value={98.6} precision={1} suffix="%" />
<Statistic.Countdown title="维护倒计时" value={deadline} />
```

---

## 文件映射

- Preview 文件：`statistic-preview.html`
- 组件目录：`../../../../frontend/components/Statistic/index.html`
- 令牌文件：`../../../tokens/tokens.css`
