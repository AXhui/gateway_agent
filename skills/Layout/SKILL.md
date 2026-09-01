# Layout · 布局

> **分类**：布局  
> **Figma**：-

---

## 概述

应用级页面框架，含 Header / Sider / Content / Footer，自动处理侧边栏折叠。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hasSider` | `boolean` | `-` | 含侧边栏 |
| `collapsed` | `boolean` | `false` | 侧边栏折叠 |
| `theme` | `'light' | 'dark'` | `'light'` | 主题 |

### 设计令牌

使用的 CSS 变量：

- `var(--color-bg-card)`
- `--color-bg-page`
- `--color-gray-900`


---

## 交互规则

### 设计指引

侧边栏宽度展开 240，折叠 64；保持 16:9 主内容黄金比例。

### 交互 Skill

【Layout 交互 Skill】
标准结构：Layout > Sider + Layout > Header + Content + Footer。

Sider 交互：
- collapsed=false: 宽 200px，展示图标+文字
- collapsed=true: 宽 56px，仅图标，Tooltip 显示菜单文字
- 切换动画：width transition 240ms easing-standard
- lg 断点以下：默认 collapsed，移动端 Sider 改为 Drawer 覆盖

Header：height 56px，position sticky top 0，z-index 100，bg var(--color-bg-card)，border-bottom --color-divider-base-1。

Content：min-height calc(100vh - 56px)，padding 24px，bg --color-bg-page。


---

## 代码示例

```html
<Layout theme="light" />
```

---

## 文件映射

- Preview 文件：`layout-preview.html`
- 组件目录：`frontend/components/Layout/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
