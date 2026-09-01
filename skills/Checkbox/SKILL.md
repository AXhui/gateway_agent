# Checkbox · 复选框

> **分类**：数据录入  
> **Figma**：1318-100610

---

## 概述

多选项控件，支持半选状态、批量选择、组管理。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |
| `indeterminate` | `boolean` | `false` | 半选状态 |
| `options` | `CheckboxOption[]` | `-` | 选项组 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`


---

## 交互规则

### 设计指引

全选+半选+列表的标准三件套，参考 Table 多选实现。

### 交互 Skill

【Checkbox 交互 Skill】
状态：
- unchecked: border 1px --color-border-base
- hover: border-color --color-primary-normal
- checked: bg --color-primary-normal, border --color-primary-normal, ✓ 白色
- indeterminate: bg --color-primary-normal, border --color-primary-normal, — 白色横线
- disabled: opacity 0.4, cursor not-allowed

Checkbox.Group：
- 全选逻辑：单独 Checkbox 控制，indeterminate = 部分选中
- 变更时 onChange 返回选中 value 数组

交互规则：
- 点击 label 文字同样触发选中
- 列表全选与行勾选需同步（Table 内置处理）
- 单个 Checkbox 用于开关类确认（如"同意协议"），不用 Switch


---

## 代码示例

```html
<Checkbox options="-" />
```

---

## 文件映射

- Preview 文件：`checkbox-preview.html`
- 组件目录：`frontend/components/Checkbox/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
