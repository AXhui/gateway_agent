---
name: Collapse
description: 折叠面板（基础组件）
---

# Collapse · 折叠面板

> **分类**：数据展示
> **Figma**：1492-29683
> **组件目录**：`../../../../frontend/components/Collapse/`
> **版本**：v1.1.0（已对齐 antd `Collapse` `items` / `accordion` / `bordered` / `ghost` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**分组内容折叠展示**，支持手风琴模式与无边框/幽灵模式，用于 FAQ、详情分组、长内容收纳。

### 何时用
- **FAQ / 帮助文档**的问答折叠。
- **详情分组**（基础/高级配置分组收起）。
- 需要**默认收起**降低页面长度的内容。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 超过 8 个分组 | `Tabs` |
| 流程步骤 | `Steps` |
| 单块卡片 | `Card` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `accordion` | 手风琴（单开） | 需要多开对比时关闭 |
| `bordered` | 有边框 | 信息密集可关闭 |
| `ghost` | 幽灵模式 | 背景透明场景 |
| 默认展开 | 首个展开 | 重要内容默认展开 |

### 无障碍
- 面板头 `role="button"` + `aria-expanded`；键盘 Enter/Space 切换展开。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 面板头高 | 48px | 标题行 |
| 内容内边距 | 16px | 展开内容 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 面板头背景 | `--color-bg-page` |
| 分隔线 | `--color-border-base` |
| 展开图标 | `--color-text-auxiliary` |

### 过渡
展开/收起高度过渡 `200ms var(--easing-standard)`。

### 使用的设计令牌
`--color-border-base`（分隔线）、`--color-bg-page`（面板头背景）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 标题 hover `--color-bg-hover` |
| active（点击反馈） | 按下加深 |
| 键盘 | `Tab` 聚焦、`Enter`/`Space` 展开、`←/→` 展开收起 |
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
| `items` | `CollapseItem[]` | `[]` | **antd 同名同值**：面板项 |
| `accordion` | `boolean` | `false` | **antd 同名同值**：手风琴模式 |
| `bordered` | `boolean` | `true` | **antd 同名同值**：边框 |
| `ghost` | `boolean` | `false` | **antd 同名同值**：幽灵模式 |
| `activeKey` | `string[]` | `-` | **antd 同名同值**：展开项 |
| `onChange` | `(keys) => void` | `-` | **antd 同名同值**：展开变化 |

### 受控/非受控语义
- `activeKey` + `onChange` 为**受控**；缺省时内部维护非受控展开状态。

### 事件 / 键盘
- 面板头可键盘触发；`onChange` 返回展开的 key 数组。

---

## 代码示例

```html
<Collapse
  accordion
  items={[
    { key: '1', label: '如何连接设备？', children: <p>...</p> },
    { key: '2', label: '如何配置网络？', children: <p>...</p> }
  ]}
  onChange={setActive}
/>
```

---

## 文件映射

- Preview 文件：`collapse-preview.html`
- 组件目录：`../../../../frontend/components/Collapse/index.html`
- 令牌文件：`../../../tokens/tokens.css`
