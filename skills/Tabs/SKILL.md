# Tabs · 标签页

> **分类**：导航  
> **Figma**：1481-170977

---

## 概述

内容分组切换器，line / card / segment 三种风格。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'line' | 'card' | 'segment'` | `'line'` | 类型 |
| `items` | `TabItem[]` | `[]` | 标签项 |
| `activeKey` | `string` | `-` | 激活项 |
| `centered` | `boolean` | `false` | 居中 |
| `tabPosition` | `'top' | 'right' | 'bottom' | 'left'` | `'top'` | 位置 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`
- `--color-bg-page`


---

## 交互规则

### 设计指引

页面级用 line；卡片内分组用 segment。

### 交互 Skill

【Tabs 交互 Skill】
type: line（默认，下划线）/ card（标签卡）/ segment（分段控制器，等宽）。

交互：
- 切换：Content 区 fade 200ms，不做 slide（避免跨屏跳动）
- 激活态（line）：border-bottom 2px --color-primary-normal，color --color-primary-normal
- hover（未激活）：color --color-text-primary
- 可关闭（closable）：hover 显示 × icon，click 移除 tab + confirm 弹窗（如有未保存内容）
- 超出宽度：左右箭头滚动，不换行

Badge：未读消息在 tab label 右侧加 Badge count/dot。
禁止超过 8 个 tab；超过用 DropdownMenu 折叠。


---

## 代码示例

```html
<Tabs type="line" items="[]" activeKey="-" />
```

---

## 文件映射

- Preview 文件：`tabs-preview.html`
- 组件目录：`frontend/components/Tabs/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
