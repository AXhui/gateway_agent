# Timeline · 时间轴

> **分类**：数据展示
> **Figma**：1492-29428
> **组件目录**：`../../../../frontend/components/Timeline/`
> **版本**：v1.1.0（已对齐 antd `Timeline` `items` / `mode` / `reverse` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**纵向时间线**，展示按时间排序的事件流，支持左右交替模式、颜色状态，用于日志、工单流转、操作记录。

### 何时用
- **操作记录/审计日志**按时间排序。
- **工单/审批流转**节点。
- **事件进展**的时间线。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 步骤流程（固定节点） | `Steps` |
| 评论流 | `Comment` |
| 普通列表 | `List` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `items` | 事件项 | 事件描述简洁 |
| `mode="alternate"` | 左右交替 | 移动端用 left |
| `reverse` | 倒序 | 日志最新在前时 |
| 状态色 | 成功/失败节点 | 颜色配文字 |

### 无障碍
- 时间线 `ol`/`li` 语义；时间与事件成对读取。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 节点 | 10×10 | 圆点 |
| 项间距 | 24px | 纵向 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 轴线 | `--color-divider-base-1` |
| 默认节点 | `--color-primary-normal` |
| 成功节点 | `--color-success-normal` |
| 错误节点 | `--color-error-normal` |
| 时间文字 | `--color-text-auxiliary` |

### 过渡
无动画。

### 使用的设计令牌
`--color-primary-normal`（默认节点）、`--color-success-normal`（成功）、`--color-error-normal`（错误）、`--color-divider-base-1`（轴线）。

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
| `items` | `TimelineItem[]` | `[]` | **antd 同名同值**：事件项 |
| `mode` | `'left' \| 'alternate' \| 'right'` | `'left'` | **antd 同名同值**：模式 |
| `reverse` | `boolean` | `false` | **antd 同名同值**：倒序 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 无交互。

---

## 代码示例

```html
<Timeline
  items={[
    { children: '设备上线', color: 'green' },
    { children: '数据上报正常' },
    { children: '触发温度告警', color: 'red' }
  ]}
/>
```

---

## 文件映射

- Preview 文件：`timeline-preview.html`
- 组件目录：`../../../../frontend/components/Timeline/index.html`
- 令牌文件：`../../Tokens/tokens.css`
