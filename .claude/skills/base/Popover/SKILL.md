---
name: Popover
description: 气泡卡片（基础组件）
---

# Popover · 气泡卡片

> **分类**：数据展示
> **Figma**：1478-138289
> **组件目录**：`../../../../frontend/components/Popover/`
> **版本**：v1.1.0（已对齐 antd `Popover` `content` / `title` / `trigger` / `placement` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**气泡浮层**，承载较丰富的卡片内容（标题、图文、操作），悬停或点击触发，用于操作说明、详情预览、快捷操作。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 纯文字提示 | `Tooltip` |
| 需确认操作 | `Popconfirm` |
| 复杂交互面板 | `Drawer` / `DropdownMenu` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `trigger="hover"` | 详情预览 | 移动端避免 |
| `trigger="click"` | 操作面板 | 内容含交互时用 click |
| `title` | 气泡标题 | 标题与内容区分层级 |
| `placement` | 定位 | 边缘自动翻转 |

### 无障碍
- 触发元素 `aria-describedby` 关联气泡；Esc 关闭；焦点移入不自动关闭。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 内容内边距 | 12px 16px | 内容留白 |
| 最小宽 | 依内容 | 自适应 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 背景 | `--color-bg-card` |
| 阴影 | `--shadow-1` |
| 标题 | `--color-text-primary` |
| 箭头 | 与背景同色 |

### 过渡
出现/消失 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-card`（背景）、`--shadow-1`（阴影）。

> **Token 修正**：`--shadow-2` → `--shadow-1`（气泡浮层阴影统一使用 `--shadow-1` 标准层）。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 无（触发元素） |
| active（点击反馈） | 无 |
| 键盘 | `Esc` 关闭、`Tab` 焦点进入 |
| loading | 无加载态 |
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
| `content` | `ReactNode` | `-` | **antd 同名同值**：内容 |
| `title` | `ReactNode` | `-` | **antd 同名同值**：标题 |
| `trigger` | `'hover' \| 'click' \| 'focus'` | `'hover'` | **antd 同名同值**：触发方式 |
| `placement` | `Placement` | `'top'` | **antd 同名同值**：位置 |
| `open` | `boolean` | `-` | **antd 同名同值**：受控显隐 |
| `onOpenChange` | `(open) => void` | `-` | **antd 同名同值**：显隐变化 |
| `children` | `ReactNode` | `-` | 触发元素 |

### 受控/非受控语义
- `open` + `onOpenChange` 为**受控**；缺省时内部维护非受控显隐。

### 事件 / 键盘
- Esc 关闭；`trigger="focus"` 时聚焦触发。

---

## 代码示例

```html
<Popover title="设备详情" content={<DeviceInfo />} trigger="click" placement="right">
  <Button>查看</Button>
</Popover>
```

---

## 文件映射

- Preview 文件：`popover-preview.html`
- 组件目录：`../../../../frontend/components/Popover/index.html`
- 令牌文件：`../../../tokens/tokens.css`
