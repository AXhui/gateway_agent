# Radio · 单选框

> **分类**：数据录入  
> **Figma**：1318-112964

---

## 概述

互斥选择控件，支持原生 radio、按钮组、卡片组三种样式。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | `-` | 选中值 |
| `options` | `RadioOption[]` | `-` | 选项组 |
| `optionType` | `'default' | 'button'` | `'default'` | 样式类型 |
| `buttonStyle` | `'outline' | 'solid'` | `'outline'` | 按钮风格 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`


---

## 交互规则

### 设计指引

2-3 个选项使用 button 样式；4+ 个使用 default。

### 交互 Skill

【Radio 交互 Skill】
状态同 Checkbox（无 indeterminate）。

Radio.Group：
- 互斥选择，change 后立即生效（无需提交）
- buttonStyle=solid：按钮组形态，选中 bg --color-primary-normal text #fff，未选 bg var(--color-bg-card)
- buttonStyle=outline：线框形态，选中 border+text --color-primary-normal

使用场景：
- 选项 ≤ 4：Radio 水平排列
- 选项 5-8：Radio vertical 排列
- 选项 > 8：改用 Select
- 需要立即触发操作（如切换视图模式）：Segmented 更合适


---

## 代码示例

```html
<Radio value="-" options="-" optionType="default" />
```

---

## 文件映射

- Preview 文件：`radio-preview.html`
- 组件目录：`frontend/components/Radio/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
