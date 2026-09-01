# Badge · 徽标数

> **分类**：数据展示  
> **Figma**：1492-108660

---

## 概述

通知红点/数字徽标，可独立使用或附加到子元素。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | `number` | `-` | 数字 |
| `dot` | `boolean` | `false` | 红点模式 |
| `status` | `'success' | 'processing' | 'default' | 'error' | 'warning'` | `-` | 状态点 |
| `offset` | `[number, number]` | `-` | 偏移 |
| `overflowCount` | `number` | `99` | 超过显示 + |

### 设计令牌

使用的 CSS 变量：

- `--color-error-normal`
- `--color-success-normal`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

未读数 >99 显示 99+；纯提醒用 dot 不带数字。

### 交互 Skill

【Badge 交互 Skill】
count：数字角标，默认红色 bg --color-error-normal；count=0 自动隐藏（showZero=true 则显示）。
dot：仅显示小红点（无数字），用于有新消息未读提示。
status：processing（脉冲动画，表示进行中）/ success / warning / error / default。

位置：absolute right-top，offset 微调位置。
overflow：count > overflowCount（默认99）显示"99+"。

动画：count 变化时数字上下滚动 160ms；从 0 到有值时 zoom-in 进入。

颜色：count 支持 color prop 自定义（必须用 token 变量）。


---

## 代码示例

```html
<Badge count="-" status="-" />
```

---

## 文件映射

- Preview 文件：`badge-preview.html`
- 组件目录：`frontend/components/Badge/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
