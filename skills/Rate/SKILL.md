# Rate · 评分

> **分类**：数据展示  
> **Figma**：1424-176466

---

## 概述

星级评分组件，支持半星、清空、自定义字符。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | `0` | 分值 |
| `count` | `number` | `5` | 星星数 |
| `allowHalf` | `boolean` | `false` | 允许半选 |
| `allowClear` | `boolean` | `true` | 允许清空 |
| `character` | `ReactNode` | `★` | 自定义字符 |

### 设计令牌

使用的 CSS 变量：

- `--color-warm-normaling`
- `--color-gray-200`


---

## 交互规则

### 设计指引

满意度调研用 5 星 allowHalf；难度等级用图标 character。

### 交互 Skill

【Rate 交互 Skill】
交互：
- hover：预览高亮到 hover 所在星，cursor pointer
- click：设置值，再次点击同一星取消（allowHalf=false 时）
- allowHalf：鼠标在星的左半部分显示半星
- 键盘：← → 调整，Enter 确认

color：默认 --color-warm-normal（#f77234 金黄）；character 可替换为自定义 icon。
disabled/readonly：cursor default，无 hover 效果，用于展示评分结果。

count：默认 5 颗，可改为 10（NPS 评分场景）。


---

## 代码示例

```html
<Rate value="0" count="5" />
```

---

## 文件映射

- Preview 文件：`rate-preview.html`
- 组件目录：`frontend/components/Rate/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
