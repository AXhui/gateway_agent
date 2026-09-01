# Slider · 滑动输入条

> **分类**：数据录入  
> **Figma**：1453-4767

---

## 概述

区间内连续值选择，支持双滑块、刻度、提示。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number | [number, number]` | `-` | 值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `range` | `boolean` | `false` | 双滑块 |
| `marks` | `object` | `-` | 刻度 |
| `step` | `number` | `1` | 步进 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`


---

## 交互规则

### 设计指引

价格区间用 range；连续配置项用单值滑块。

### 交互 Skill

【Slider 交互 Skill】
交互：
- 拖拽 thumb：鼠标按下 thumb 放大 1.2x，拖拽中显示 Tooltip 当前值
- 点击 track：跳到最近的 step 位置
- 键盘（focus）：← → 按 step 移动，Home/End 跳 min/max

range=true（双向）：两个 thumb 不可交叉，最小间距 = step。
marks：显示刻度标记，点击刻度直接跳转。

配合 InputNumber：Slider + InputNumber 联动，实时同步值，InputNumber blur 后 clamp。
disabled：track bg --color-divider-base-1，thumb 不可拖拽。


---

## 代码示例

```html
<Slider value="-" min="0" max="100" />
```

---

## 文件映射

- Preview 文件：`slider-preview.html`
- 组件目录：`frontend/components/Slider/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
