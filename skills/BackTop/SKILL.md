# BackTop · 回到顶部

> **分类**：导航
> **Figma**：1424-144522
> **组件目录**：`frontend/components/BackTop/`
> **版本**：v1.1.0（已对齐 antd `BackTop` `visibilityHeight` / `duration` / `onClick` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**回到页面顶部的悬浮按钮**，长页面滚动到阈值后浮现，点击平滑滚回顶部。

### 何时用
- **长列表/长文档**页面的快速回顶。
- 滚动深度大，用户回顶成本高的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 短页面 | 无需回顶 |
| 需要多锚点跳转 | `Anchor` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `visibilityHeight` | 浮现阈值 | 默认 400px |
| `duration` | 滚动动画时长 | 默认 450ms，不宜过长 |
| 位置 | 右下角 | 避开其他悬浮按钮 |

### 无障碍
- 按钮有 `aria-label`（「回到顶部」），可键盘聚焦触发。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 按钮 | 40×40 | 圆形 |
| 位置 | 右下角 24px | 距边缘 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 背景 `--color-bg-card`，阴影 `--shadow-1` |
| 图标 | `--color-primary-normal` |
| hover | 背景提升 |

### 过渡
浮现淡入 `160ms var(--easing-standard)`；滚动平滑。

### 使用的设计令牌
`--color-primary-normal`（图标）、`--shadow-1`（阴影）、`--color-bg-card`（背景）。

> **Token 修正**：`--shadow-2` → `--shadow-1`（按钮阴影统一用标准一级阴影）。

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
| `visibilityHeight` | `number` | `400` | **antd 同名同值**：浮现阈值 |
| `duration` | `number` | `450` | **antd 同名同值**：动画时长 |
| `onClick` | `() => void` | `-` | **antd 同名同值**：点击回调 |

### 受控/非受控语义
- 内部滚动监听控制显隐，非受控。

### 事件 / 键盘
- 按钮可键盘触发；点击滚动至顶部并触发 `onClick`。

---

## 代码示例

```html
<BackTop visibilityHeight={400} duration={450} onClick={() => console.log('back top')} />
```

---

## 文件映射

- Preview 文件：`backtop-preview.html`
- 组件目录：`frontend/components/BackTop/index.html`
- 令牌文件：`frontend/shared/tokens.css`
