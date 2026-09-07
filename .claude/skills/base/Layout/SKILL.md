---
name: Layout
description: 布局（基础组件）
---

# Layout · 布局

> **分类**：布局
> **Figma**：-
> **组件目录**：`../../../../frontend/components/Layout/`
> **版本**：v1.1.0（已对齐 antd `Layout` / `Sider` `collapsible` / `theme` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页面骨架布局组件**，提供 `Header` / `Sider` / `Content` / `Footer` 四大区域，支持侧边栏折叠，用于搭建中后台应用的整体框架。

### 何时用
- 中后台**整体页面骨架**（顶栏 + 侧栏 + 内容 + 页脚）。
- 需要**可折叠侧边栏**的应用框架。
- 内容区需要**独立滚动**的固定骨架布局。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 简单上下堆叠 | 普通块级布局 |
| 卡片内局部布局 | `Grid` / `Space` / `Flex` |
| 仅需要顶栏 | 单 `Header` 或自定义 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `hasSider` | 含侧边栏时开启 | 有 Sider 必须设 `hasSider` |
| `Sider collapsible` | 可折叠侧栏 | 折叠时用紧凑 Logo |
| `theme="light"` | 浅色侧栏 | 全站侧栏主题一致 |
| `theme="dark"` | 深色侧栏 | 与 Header 主题协调 |

### 无障碍
- 语义化 `header` / `aside` / `main` / `footer` 标签，读屏可快速导航区域。
- 折叠按钮有 `aria-label`（「展开/收起侧栏」）。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| Sider 默认宽 | 208px | 可 `width` 调整 |
| Sider 折叠宽 | 56px | 折叠态 |
| Header 高 | 56px | 顶栏 |
| Footer 高 | 48px | 页脚 |

### 状态视觉矩阵
| 区域 | 背景 |
|------|------|
| Sider | `--color-bg-card` |
| Content | `--color-bg-page` |
| Header | `--color-bg-card` |
| 深色侧栏文字 | `--color-text-constant-normal` |

### 过渡
侧栏折叠宽度过渡 `200ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-card`（Sider/Header）、`--color-bg-page`（Content）、`--color-text-constant-normal`（深色文字）。

> **Token 修正**：`--color-gray-900` → `--color-gray-09`（深色侧栏文字用灰阶标准 token，不用旧灰阶名）。

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
| `hasSider` | `boolean` | `false` | **antd 同名同值**：是否含侧栏 |
| `collapsed` | `boolean` | `false` | **antd 同名同值**（Sider）：折叠态 |
| `collapsible` | `boolean` | `false` | **antd 同名同值**（Sider）：可折叠 |
| `theme` | `'light' \| 'dark'` | `'light'` | **antd 同名同值**（Sider）：主题 |
| `width` | `number` | `208` | **antd 同名同值**（Sider）：宽度 |
| `onCollapse` | `(collapsed) => void` | `-` | 折叠回调 |

### 受控/非受控语义
- `collapsed` + `onCollapse` 为**受控**折叠；缺省 `collapsed` 时内部维护非受控状态。

### 事件 / 键盘
- 折叠按钮可键盘触发（Enter/Space）；`onCollapse` 返回折叠态。

---

## 代码示例

```html
<Layout hasSider>
  <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
    <Logo variant="compact" />
  </Sider>
  <Layout>
    <Header />
    <Content>页面内容</Content>
    <Footer>© 2026 Milesight IOT</Footer>
  </Layout>
</Layout>
```

---

## 文件映射

- Preview 文件：`layout-preview.html`
- 组件目录：`../../../../frontend/components/Layout/index.html`
- 令牌文件：`../../../tokens/tokens.css`
