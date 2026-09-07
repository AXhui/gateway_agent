---
name: Pagination
description: 分页（基础组件）
---

# Pagination · 分页

> **分类**：导航
> **Figma**：1363-88210
> **组件目录**：`../../../../frontend/components/Pagination/`
> **版本**：v1.1.0（已对齐 antd `Pagination` `current` / `total` / `pageSize` / `showSizeChanger` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**数据分页导航组件**，支持页码跳转、每页条数切换、快速跳转，用于长列表/表格的数据分页。

### 何时用
- **列表/表格**数据量超过一页时。
- 需要**每页条数切换**（10/20/50）的场景。
- 需要**快速跳页**的大数据量列表。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 无限滚动加载 | `List` 的 `loadMore` / 懒加载 |
| 数据量小（< 一页） | 直接展示，不显示分页 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `showSizeChanger` | 每页条数切换 | 列表默认开启 |
| `showQuickJumper` | 快速跳页 | 大数据量开启 |
| `showTotal` | 显示总数 | 「共 X 条」提升可读性 |
| 页码较多 | 省略号折叠 | 保持当前页 ±2 可见 |

### 无障碍
- 页码按钮可键盘聚焦；当前页 `aria-current="page"`。
- 上一页/下一页有 `aria-label`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 页码按钮 | 32×32 | 标准 |
| 页间距 | 8px | 页码之间 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | 边框 `--color-border-base`，白底 |
| 当前页 | 背景 `--color-primary-normal`，白字 |
| hover | 边框 `--color-primary-normal` |

### 过渡
背景/边框 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（当前页/hover）、`--color-border-base`（默认边框）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 页码 hover（回指总纲） |
| active（点击反馈） | 按下加深 |
| 键盘 | `Tab`/`Enter` 翻页/跳转 |
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
| `current` | `number` | `1` | **antd 同名同值**：当前页 |
| `total` | `number` | `0` | **antd 同名同值**：总条数 |
| `pageSize` | `number` | `10` | **antd 同名同值**：每页条数 |
| `showSizeChanger` | `boolean` | `false` | **antd 同名同值**：切换每页条数 |
| `showQuickJumper` | `boolean` | `false` | **antd 同名同值**：快速跳页 |
| `showTotal` | `(total, range) => ReactNode` | `-` | **antd 同名同值**：总数 |
| `onChange` | `(page, pageSize) => void` | `-` | **antd 同名同值**：翻页回调 |

### 受控/非受控语义
- `current` + `onChange` 为**受控**；缺省 `current` 时内部维护非受控状态。

### 事件 / 键盘
- 页码/上下页按钮可键盘触发；`onChange` 返回 `(page, pageSize)`。

---

## 代码示例

```html
<Pagination
  current={page}
  total={128}
  pageSize={10}
  showSizeChanger
  showQuickJumper
  showTotal={(t) => `共 ${t} 台设备`}
  onChange={(p, s) => fetchData(p, s)}
/>
```

---

## 文件映射

- Preview 文件：`pagination-preview.html`
- 组件目录：`../../../../frontend/components/Pagination/index.html`
- 令牌文件：`../../../tokens/tokens.css`
