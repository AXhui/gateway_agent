---
name: B_Eg71FormItemInput
version: 1.0.0
description: EG71 表单输入项（业务组件，存量补档）：标签 + 输入框 + 提示文案，normal/error 态与 0/32 字数统计开关
---

# 表单输入项 · B_Eg71FormItemInput

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-input`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的原子化输入项：标签行（必填星号 + 单位 + info 图标 + 可选字数统计）+ 输入框（lg）+ 提示文案行；`status:'error'` 时输入框转 error 描边、提示转错误色。

**不是什么**：不是完整表单卡（组合多项目 `S_Card` + `bc-eg71-formgrid`）；无 bind（纯展示骨架，值变更由宿主在原生 input 上监听）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_Input` | `ms-input(--lg/--error)` | 输入框 |
| `S_Icon` | `ico('info', 16)` | 标签说明图标 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位，渲染为 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.value` | string | `''` | 输入值 |
| `ctx.placeholder` | string | `'Example'` | 占位 |
| `ctx.status` | `'error'` \| 其他 | — | error 态 |
| `ctx.showCount` | boolean | `false` | 标签行右侧 `0/32` 计数 |
| `ctx.msg` | string | `'Please input passenger's name…'` | 提示文案（传 `''` 不渲染） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| normal | 默认 | `ms-input--lg` |
| error | `ctx.status==='error'` | `ms-input--error` + `.bc-eg71-form-item-msg--error` |

## 4. 场景（Scenarios）

**何时用**：设置页单字段输入（名称、地址、说明等）；配合 `bc-eg71-formgrid` 两列栅格使用。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 下拉选择 | `bc-eg71-form-item-select` |
| 输入 + 触发按钮 | `bc-eg71-form-item-input-button` |
| 数值步进 | `S_InputNumber` 直接组合 |
| 激活设置灰卡（AppKey 校验） | `bc-eg71-activation-card` |

## 5. Token（设计令牌）

继承 `S_Form` / `S_Input`。结构类 `.bc-eg71-form-item-labelrow/-unit/-count/-msg(--error)` 引用 `--spacing-*` 与文本语义色令牌（`library/business.css` 311-343）。

## 6. 依赖（Dependencies）

`atoms`：`['form','input']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-input'].render({
  label: 'Description', required: false, showCount: true,
  placeholder: 'Input description', msg: 'Supportive text'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
