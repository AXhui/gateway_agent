---
name: Anchor
description: 锚点（基础组件）
---

# Anchor · 锚点

> **分类**：导航
> **Figma**：1424-143764
> **组件目录**：`../../../../frontend/components/Anchor/`
> **版本**：v1.1.0（已对齐 antd `Anchor` `items` / `offsetTop` / `bounds` / `onChange` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页面内锚点导航组件**，高亮当前滚动位置对应的章节，点击平滑滚动到目标，用于长文档/详情页目录导航。

### 何时用
- **长文档/详情页**的章节目录导航。
- 需要**快速跳转**到页面内某节。
- 需要**滚动高亮**当前章节的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 跨页面导航 | `NavMenu` |
| 同页标签切换 | `Tabs` |
| 简短内容 | 无需锚点 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `items` | 章节项 | 章节 ID 唯一 |
| `offsetTop` | 偏移顶部距离 | 需避开固定 Header |
| 高亮当前项 | 滚动联动 | 滚动高亮与点击互斥冲突要处理 |
| 层级 | 支持多级 | 层级过深反而难扫读 |

### 无障碍
- 锚点链接可键盘聚焦；高亮项 `aria-current` 标注。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 锚点项高 | 28px | 紧凑 |
| 指示条宽 | 2px | 当前项左侧 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认 | `--color-text-primary` |
| 当前项 | `--color-primary-normal` + 左指示条 |
| 分隔线 | `--color-border-base` |

### 过渡
指示条/颜色 `160ms var(--easing-standard)`；滚动平滑。

### 使用的设计令牌
`--color-primary-normal`（当前项/指示条）、`--color-border-base`（分隔线）、`--color-text-primary`（默认）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 链接 hover `--color-text-link-hover` |
| active（点击反馈） | 无（纯链接，回指总纲） |
| 键盘 | `Tab` 聚焦 + `Enter` 激活锚点 |
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
| `items` | `Array<{key, href, title}>` | `[]` | **antd 同名同值**：锚点项 |
| `offsetTop` | `number` | `0` | **antd 同名同值**：偏移距离 |
| `bounds` | `number` | `5` | **antd 同名同值**：判断范围 |
| `onChange` | `(key) => void` | `-` | **antd 同名同值**：高亮变化 |

### 受控/非受控语义
- 内部滚动监听维护高亮，`onChange` 返回当前 `key`（通知型）。

### 事件 / 键盘
- 锚点链接可键盘触发；点击平滑滚动至目标。

---

## 代码示例

```html
<Anchor
  offsetTop={64}
  items={[
    { key: 'base', href: '#base', title: '基础信息' },
    { key: 'network', href: '#network', title: '网络配置' },
    { key: 'event', href: '#event', title: '事件记录' }
  ]}
  onChange={setCurrent}
/>
```

---

## 文件映射

- Preview 文件：`anchor-preview.html`
- 组件目录：`../../../../frontend/components/Anchor/index.html`
- 令牌文件：`../../../tokens/tokens.css`
