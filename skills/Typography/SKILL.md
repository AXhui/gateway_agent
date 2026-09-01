# Typography · 排版

> **分类**：基础  
> **Figma**：1294-954

---

## 概述

文本与段落系统。提供 H1-H5 标题、四种段落、链接、行内代码等基础排版能力。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `level` | `1 | 2 | 3 | 4 | 5` | `1` | 标题级别 |
| `type` | `'secondary' | 'success' | 'warning' | 'danger'` | `-` | 文本类型 |
| `ellipsis` | `boolean | object` | `false` | 自动省略 |
| `code` | `boolean` | `false` | 行内代码风格 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `--color-text-secondary`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

全站标题层级保持 H1 > H2 > H3 严格递进，不要跳级。

### 交互 Skill

【Typography 交互 Skill】
层级规则：H1(28-32px/700) > H2(20-24px/600) > H3(16-18px/600) > Body(14px/400)，严格递进不跳级。

交互：
- Link: hover text-decoration underline, color --color-primary-hover
- ellipsis=true 时 Tooltip 展示完整内容
- type=danger 用 --color-error-normal，type=success 用 --color-success-normal，type=secondary 用 --color-text-secondary

可复制文本（code=true）：click 复制，icon 变 CheckIcon 1.5s 后恢复。

响应式：H1 在 md 以下降为 24px，段落 line-height 1.6 保持可读性。


---

## 代码示例

```html
<Typography level="1" type="-" />
```

---

## 文件映射

- Preview 文件：`typography-preview.html`
- 组件目录：`frontend/components/Typography/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
