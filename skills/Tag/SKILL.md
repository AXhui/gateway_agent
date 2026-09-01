# Tag · 标签

> **分类**：数据展示  
> **Figma**：1422-92446

---

## 概述

分类、状态、标签型小型展示元素，提供 11 种预设色。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `-` | 颜色 |
| `closable` | `boolean` | `false` | 可关闭 |
| `bordered` | `boolean` | `true` | 边框 |
| `checkable` | `boolean` | `false` | 可选中 |

### 设计令牌

使用的 CSS 变量：

- `--color-brand-50`
- `--color-primary-normal`
- `--radius-4`


---

## 交互规则

### 设计指引

状态用预设色保持全局一致；自定义 color 仅用于业务必须。

### 交互 Skill

【Tag 交互 Skill】
颜色语义：
- primary（--color-primary-bg + --color-primary-normal）：常规分类
- success（--color-success-bg + --color-success-normal）：成功/正常/在线
- error（--color-error-bg + --color-error-normal）：错误/危险/离线
- warn（--color-warm-bg + --color-warm-normal）：警告/待处理
- info（--color-primary-bg + --color-info）：信息/中性

交互：
- closable=true：hover 显示 × 右侧，click 移除（配合 onClose）
- checkable：Toggle 选中态，选中 bg --color-primary-normal text #fff
- 新增标签：最后放"+ 添加"input 形式，blur/Enter 确认

禁止：不超过 3 种颜色在同屏混用；不用 Tag 替代 Badge（有数字用 Badge）。


---

## 代码示例

```html
<Tag color="-" bordered />
```

---

## 文件映射

- Preview 文件：`tag-preview.html`
- 组件目录：`frontend/components/Tag/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
