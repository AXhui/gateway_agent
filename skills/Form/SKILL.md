# Form · 表单

> **分类**：数据录入  
> **Figma**：1463-112293

---

## 概述

表单容器，处理布局、校验、提交、字段联动。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `layout` | `'horizontal' | 'vertical' | 'inline'` | `'horizontal'` | 布局 |
| `initialValues` | `object` | `-` | 初始值 |
| `onFinish` | `(values: object) => void` | `-` | 提交回调 |
| `validateTrigger` | `string | string[]` | `'onChange'` | 校验时机 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `--color-error-normal`
- `--spacing-16`


---

## 交互规则

### 设计指引

密集表单 horizontal 标签 6 列、控件 18 列；宽屏对话框用 vertical。

### 交互 Skill

【Form 交互 Skill】
layout: horizontal（label左，宽度比3:7）/ vertical（label上）/ inline（行内简短筛选）。

校验时机：
- rules 默认 trigger=onChange，失焦后首次触发，之后实时校验
- validateTrigger=onBlur：仅失焦时校验（长文本/复杂输入）
- Form.Item status=error 时 input border --color-error-normal，下方 message color --color-error-normal 12px

提交流程：
- 点击提交 → form.validateFields() → 全部通过才调接口
- 提交期间按钮 loading=true，防重复提交
- 接口失败：不清空表单，Toast error + 对应字段标红（如有）

重置：恢复 initialValues，清除所有 error 状态。
分步表单：Steps 指示进度，每步独立校验后再 next。


---

## 代码示例

```html
<Form layout="horizontal" initialValues="-" onFinish="-" />
```

---

## 文件映射

- Preview 文件：`form-preview.html`
- 组件目录：`frontend/components/Form/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
