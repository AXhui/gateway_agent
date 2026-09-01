# Statistic · 统计数值

> **分类**：数据展示  
> **Figma**：1496-40385

---

## 概述

数字统计展示，支持精度、前后缀、动画、趋势配色。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | `-` | 数值 |
| `precision` | `number` | `-` | 小数位 |
| `prefix` | `ReactNode` | `-` | 前缀 |
| `suffix` | `ReactNode` | `-` | 后缀 |
| `valueStyle` | `CSSProperties` | `-` | 数字样式 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `--color-success-normal`
- `--color-error-normal`


---

## 交互规则

### 设计指引

涨跌用色 success/error，必须配箭头图标避免色盲不可读。

### 交互 Skill

【Statistic 交互 Skill】
展示：大数字（font 28-36px/700）+ 标题（12-14px/--color-text-auxiliary）+ 前后缀。

交互：
- Countdown：实时倒计时，onFinish 回调触发后续操作（如自动刷新）
- 数字变化：valueStyle 配合 transition，数字滚动动画（可选 CountUp 库）

趋势：
- prefix/suffix 放 Icon（↑↓）表示趋势，颜色 --color-success-normal/--color-error-normal
- 环比数据放 description，color --color-text-auxiliary，font 12px

布局：4个指标卡用 Row gutter=[16,16] Col span=6，移动端 span=12。


---

## 代码示例

```html
<Statistic value="-" precision="-" prefix="-" />
```

---

## 文件映射

- Preview 文件：`statistic-preview.html`
- 组件目录：`frontend/components/Statistic/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
