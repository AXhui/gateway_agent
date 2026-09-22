---
name: B_Eg71FormItemSelect
version: 1.0.0
description: EG71 表单下拉项（业务组件，存量补档）：标签 + 下拉选择框 + 提示文案，normal/error 态
---

# 表单下拉项 · B_Eg71FormItemSelect

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-select`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的原子化下拉项：标签行（必填星号 + 单位 + info 图标）+ 下拉选择框 + 提示文案行；`status:'error'` 转错误描边。

**不是什么**：不是行内小尺寸下拉（表格行内用 `ms-select--sm` 直接组合）；无 bind（纯展示骨架）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_Select` | `ms-select(--error)` | 下拉框 |
| `S_Icon` | `ico('info', 16)` | 标签说明图标 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.options` | string[] | `['Please select']` | 选项 |
| `ctx.value` | string | 无 | 选中项（全等匹配） |
| `ctx.status` | `'error'` \| 其他 | — | error 态 |
| `ctx.msg` | string | `'Please select a time zone.'` | 提示文案（传 `''` 不渲染） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| normal | 默认 | `ms-select` |
| error | `ctx.status==='error'` | `ms-select--error` + `.bc-eg71-form-item-msg--error` |

## 4. 场景（Scenarios）

**何时用**：设置页单选枚举字段（时区、模式、协议等）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 下拉 + 触发按钮 | `bc-eg71-form-item-input-button` |
| 2-3 个互斥项快捷切换 | `bc-eg71-form-item-radio-group` |
| 日期范围 | `bc-eg71-form-item-date-picker` |

## 5. Token（设计令牌）

继承 `S_Form` / `S_Select`。结构类 `.bc-eg71-form-item-labelrow/-unit/-msg(--error)` / `.bc-eg71-form-item-select`（`library/business.css`）。

## 6. 依赖（Dependencies）

`atoms`：`['form','select']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-select'].render({
  label: 'Time zone', options: ['(GMT+08:00) Beijing', '(GMT+00:00) UTC'], value: '(GMT+08:00) Beijing'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
