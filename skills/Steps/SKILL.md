# Steps · 步骤条

> **分类**：导航  
> **Figma**：1400-35527

---

## 概述

任务流程指示器，支持横向/竖向、状态、点状步骤。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `current` | `number` | `0` | 当前步骤 |
| `items` | `StepItem[]` | `[]` | 步骤项 |
| `direction` | `'horizontal' | 'vertical'` | `'horizontal'` | 方向 |
| `status` | `'wait' | 'process' | 'finish' | 'error'` | `'process'` | 当前状态 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-success-normal`
- `--color-error-normal`


---

## 交互规则

### 设计指引

步骤数控制在 3-5 个；超过 5 步考虑改为表单分组。

### 交互 Skill

【Steps 交互 Skill】
status: wait(灰) / process(品牌蓝，pulse 动画) / finish(绿色对勾) / error(红色叹号)。

交互：
- 可点击步骤（clickable=true）：hover cursor pointer，已完成步骤可回退
- 不可点击：cursor default
- 步骤切换：Content 区域 fade 过渡 240ms

方向：
- horizontal（默认）：步骤数 ≤ 5
- vertical：步骤数 > 5 或步骤描述文字较长
- 移动端强制 vertical

错误步骤：status=error + description 说明原因，操作区显示重试按钮。


---

## 代码示例

```html
<Steps current="0" items="[]" direction="horizontal" />
```

---

## 文件映射

- Preview 文件：`steps-preview.html`
- 组件目录：`frontend/components/Steps/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
