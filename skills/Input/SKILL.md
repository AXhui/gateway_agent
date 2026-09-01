# Input · 输入框

> **分类**：数据录入  
> **Figma**：1416-45643

---

## 概述

基础文本输入框，支持 prefix、suffix、addon、清除、密码切换。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `-` | 输入值 |
| `prefix` | `ReactNode` | `-` | 前缀 |
| `suffix` | `ReactNode` | `-` | 后缀 |
| `allowClear` | `boolean` | `false` | 允许清除 |
| `size` | `'large' | 'middle' | 'small'` | `'middle'` | 尺寸 |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-primary-normal`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

密码、密钥使用 type="password" + 切换图标；搜索使用 Input.Search。

### 交互 Skill

【Input 交互 Skill】
状态：
- default: border 1px --color-border-base
- hover: border-color --color-border-base-disable
- focus: border-color --color-border-primary-normal(--color-primary-normal), box-shadow 0 0 0 3px --color-primary-bg
- error: border-color --color-error-normal, focus shadow --color-error-bg
- disabled: bg --color-bg-hover, opacity 0.6, cursor not-allowed
- readonly: bg --color-bg-page, border --color-divider-base-1

交互细节：
- allowClear：有值时 hover/focus 显示 × icon，click 清空并 focus
- prefix/suffix：左右 padding 自动扩展，icon color --color-text-auxiliary
- addonBefore/After：bg --color-bg-page，border 共用，不圆角拼接
- 字数限制：右下角显示 n/max，超出 color --color-error-normal
- 搜索框（Search）：右侧搜索 icon 或按钮，Enter/click 触发

输入验证：实时校验（onChange）或失焦校验（onBlur），错误态 + Form.Item message 组合。


---

## 代码示例

```html
<Input value="-" prefix="-" suffix="-" />
```

---

## 文件映射

- Preview 文件：`input-preview.html`
- 组件目录：`frontend/components/Input/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
