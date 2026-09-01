# Logo · 品牌标识

> **分类**：基础  
> **Figma**：175-15304

---

## 概述

Milesight IOT 品牌 Logo 组件，提供完整版与紧凑版两种 variant 与白色反色版本。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'full' | 'compact'` | `'full'` | 完整或紧凑 |
| `size` | `number` | `32` | 高度（px） |
| `color` | `'brand' | 'white'` | `'brand'` | 颜色版本 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-text-constant-normal`


---

## 交互规则

### 设计指引

深色 Header 一律使用 color="white"；纸面文档使用 brand。

### 交互 Skill

【Logo 交互 Skill】
变体：
- variant=full: 82×32，含图标+文字，用于顶栏/登录页
- variant=icon: 32×32，仅图标，用于侧边栏收起态/favicon

主题：
- theme=light（默认）: 绿色图标 + 深色文字，用于白色/浅灰背景
- theme=dark: 白色版本，用于深色背景/顶栏

点击行为：始终 href="/" 跳首页，无其他交互状态。
禁止在 Logo 上加 hover 效果或 border。


---

## 代码示例

```html
<Logo variant="full" size="32" color="brand" />
```

---

## 文件映射

- Preview 文件：`logo-preview.html`
- 组件目录：`frontend/components/Logo/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
