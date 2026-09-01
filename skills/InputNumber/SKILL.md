# InputNumber · 数字输入框

> **分类**：数据录入  
> **Figma**：1452-26685

---

## 概述

严格的数字输入控件，含步进按钮、最小最大值、精度控制。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | `-` | 输入值 |
| `min` | `number` | `-Infinity` | 最小值 |
| `max` | `number` | `Infinity` | 最大值 |
| `step` | `number` | `1` | 步进 |
| `precision` | `number` | `-` | 小数精度 |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

金额使用 precision={2}；百分比使用 formatter/parser。

### 交互 Skill

【InputNumber 交互 Skill】
交互：
- hover：右侧显示 ↑↓ 步进箭头
- ↑：+step，↓：-step；超出 min/max 时对应箭头 disabled
- 直接输入：onBlur 时 clamp 到 [min, max] 范围并格式化 precision 小数位
- 鼠标滚轮：focus 状态下 wheel 增减（可禁用 keyboard=false）

格式化：
- formatter + parser 配合使用（如千分位、货币符号）
- precision 控制小数，不要在 formatter 中再做 toFixed


---

## 代码示例

```html
<InputNumber value="-" min="-Infinity" max="Infinity" />
```

---

## 文件映射

- Preview 文件：`input-number-preview.html`
- 组件目录：`frontend/components/InputNumber/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
