# Collapse · 折叠面板

> **分类**：数据展示  
> **Figma**：1492-29683

---

## 概述

分组内容折叠展示，支持手风琴模式与无边框模式。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `CollapseItem[]` | `[]` | 面板项 |
| `accordion` | `boolean` | `false` | 手风琴模式 |
| `bordered` | `boolean` | `true` | 有边框 |
| `ghost` | `boolean` | `false` | 幽灵模式 |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-bg-page`


---

## 交互规则

### 设计指引

FAQ、详情分组使用；超过 8 个分组改用 Tabs。

### 交互 Skill

【Collapse 交互 Skill】
交互：
- 点击 header：展开/收起，chevron 旋转 180°，内容高度 transition 240ms
- accordion=true：同时只展开一个 Panel
- hover header：bg --color-bg-page

Ghost 模式：无边框无背景，仅 Divider 分隔，用于页面内嵌说明区。

错误状态：Panel header 可加 Badge/Icon 提示内部有错误需处理。
禁止在 Collapse 内嵌套 Collapse 超过 2 层。


---

## 代码示例

```html
<Collapse items="[]" bordered />
```

---

## 文件映射

- Preview 文件：`collapse-preview.html`
- 组件目录：`frontend/components/Collapse/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
