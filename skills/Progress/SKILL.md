# Progress · 进度条

> **分类**：反馈  
> **Figma**：1445-34912

---

## 概述

任务进度展示，含线性、圆形、仪表盘三种形态。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `percent` | `number` | `0` | 进度（0-100） |
| `type` | `'line' | 'circle' | 'dashboard'` | `'line'` | 类型 |
| `status` | `'success' | 'exception' | 'normal' | 'active'` | `'normal'` | 状态 |
| `strokeColor` | `string | object` | `-` | 颜色 |
| `showInfo` | `boolean` | `true` | 显示文字 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-success-normal`
- `--color-error-normal`


---

## 交互规则

### 设计指引

耗时 >2 秒任务必须显示 Progress；不确定时长用 Spin。

### 交互 Skill

【Progress 交互 Skill】
type: line（默认）/ circle / dashboard。

状态颜色：
- normal：--color-primary-normal（绿色）
- success（percent=100）：--color-success-normal，icon CheckCircle
- exception（status='exception'）：--color-error-normal，icon XCircle
- active（status='active'）：进度条内 shimmer 动画

交互：
- 上传/任务进度：实时更新 percent，动画 transition 400ms
- 步骤进度：circle 类型在 Steps 卡片中心显示，直径 80px

strokeWidth：line 8px（默认），circle 8px；文字 format prop 自定义（如"剩余 {remain}s"）。
禁止：不用 Progress 模拟 Loading（用 Spin/Skeleton）。


---

## 代码示例

```html
<Progress percent="0" type="line" status="normal" />
```

---

## 文件映射

- Preview 文件：`progress-preview.html`
- 组件目录：`frontend/components/Progress/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
