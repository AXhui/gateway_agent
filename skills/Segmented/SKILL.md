# Segmented · 分段控制器

> **分类**：数据录入  
> **Figma**：1481-177125

---

## 概述

互斥的视图切换控件，比 Radio 更视觉强、比 Tabs 更轻量。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `SegmentedOption[]` | `[]` | 选项 |
| `value` | `string | number` | `-` | 选中值 |
| `block` | `boolean` | `false` | 撑满 |
| `size` | `'large' | 'middle' | 'small'` | `'middle'` | 尺寸 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-bg-hover`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

用于视图切换（卡片/列表/表格），不要用于表单字段。

### 交互 Skill

【Segmented 交互 Skill】
交互：
- 选中项：bg var(--color-bg-card)（白色卡片），box-shadow --shadow-1，文字 --color-text-primary，滑块动画 160ms
- 未选：bg transparent，text --color-text-auxiliary
- hover（未选）：text --color-text-secondary
- disabled 某项：opacity 0.4，不可点

使用场景：互斥视图切换（列表/卡片/地图），≤ 5 个选项，每项文字简短（≤ 4 字）。
与 Radio.Group buttonStyle 区别：Segmented 视觉上是整体容器，Radio.Group 是独立按钮。
宽度：options 等宽分配（block=true）或内容自适应。


---

## 代码示例

```html
<Segmented options="[]" value="-" />
```

---

## 文件映射

- Preview 文件：`segmented-preview.html`
- 组件目录：`frontend/components/Segmented/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
