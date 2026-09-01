# Descriptions · 描述列表

> **分类**：数据展示  
> **Figma**：1494-33048

---

## 概述

键值对描述列表，常用于详情页只读信息展示。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `column` | `number` | `3` | 列数 |
| `bordered` | `boolean` | `false` | 带边框 |
| `items` | `DescriptionItem[]` | `[]` | 项目 |
| `size` | `'default' | 'middle' | 'small'` | `'default'` | 尺寸 |
| `layout` | `'horizontal' | 'vertical'` | `'horizontal'` | 布局 |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-bg-page`


---

## 交互规则

### 设计指引

基础信息用无边框；技术详情、规格用 bordered。

### 交互 Skill

【Descriptions 交互 Skill】
layout: horizontal（label左值右）/ vertical（label上值下）。
bordered=true：table 形态，用于详情页；bordered=false：纯文字形态，用于摘要区。

column：默认 3（桌面），md 降为 2，sm 降为 1（响应式）。

交互：
- 可编辑项（editable）：hover 显示 编辑 icon，click 切换 Input 内联编辑，blur/Enter 提交
- 长文本：ellipsis + Tooltip 展示完整
- 状态值：Tag 或 Badge 展示（不用纯文字颜色）

与 Form 区别：Descriptions 是只读展示，Form 是编辑录入，不混用。


---

## 代码示例

```html
<Descriptions column="3" items="[]" />
```

---

## 文件映射

- Preview 文件：`descriptions-preview.html`
- 组件目录：`frontend/components/Descriptions/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
