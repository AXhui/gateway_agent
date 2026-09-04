# Tokens · 设计令牌

> **分类**：设计资源  
> **Figma**：-

---

## 概述

全部设计令牌总览：颜色、间距、字号、圆角、阴影、字体。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|

### 设计令牌

使用的 CSS 变量：

- `--color-*`
- `--spacing-*`
- `--radius-*`
- `--shadow-*`
- `--text-*`


---

## 交互规则

### 设计指引

所有组件样式必须使用 token 变量，禁止硬编码颜色/间距。

### 交互 Skill

【Design Tokens 交互 Skill】
Token 使用原则：
- 禁止直接写 hex 颜色，必须引用 CSS 变量（--color-primary-normal 而非 #3491fa）
- 优先使用语义 token（--color-text-primary）而非基础 token（--color-gray-900）

颜色层级：
- 品牌色：--color-primary-normal / hover / active / bg（bg 用于轻量背景）
- 语义色：success / error / warn / info，各含 bg 变体
- 文字：primary(正文) > secondary(辅助) > tertiary(占位/注释) > disabled
- 背景：base(白) > subtle(页面底色) > muted(禁用/tag底色)
- 边框：subtle(卡片内) > default(卡片边) > strong(输入框focus前) > focus(聚焦环)

间距用 --spacing-N，圆角用 --radius-N，阴影用 --shadow-N。
新增自定义组件必须只用 token，不写硬编码值。


---

## 代码示例

```html
<Tokens />
```

---

## 文件映射

- 令牌真源：`tokens.css`（L1 唯一真源，取代原 library/tokens.css 与 frontend/shared/tokens.css）
- Preview 文件：`tokens-preview.html`
- 组件目录：`req2demo/00_skills/Tokens/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `req2demo/00_skills/Tokens/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
