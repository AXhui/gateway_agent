---
name: B_Eg71FormItemRadioGroup
version: 1.0.0
description: EG71 表单单选按钮组（业务组件，存量补档）：标签 + ms-radio-btn-group 分段单选 + 提示文案
---

# 表单单选按钮组 · B_Eg71FormItemRadioGroup

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-radio-group`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的分段单选组项：标签行 + `ms-radio-btn-group`（role=radiogroup，选项渲染为分段按钮，选中态 aria-checked + 可聚焦）+ 提示文案行。

**不是什么**：不是禁用态选择器（禁用交互由宿主在外层控制，本组件无禁用变体）；无 bind（选中切换由 L2 radio 交互契约/宿主承载）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_Radio` | `ms-radio-btn-group` / `ms-radio-btn` | 分段单选组 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.options` | string[] | `['Option 1','Option 2','Option 3']` | 选项 |
| `ctx.value` | string | 无 | 选中项（全等匹配；**未传时默认选中第 2 项**） |
| `ctx.msg` | string | `'Supportive text'` | 提示文案 |

选中规则：`checked = (o === ctx.value)`；`ctx.value == null` 时 `i === 1` 选中（对齐设置页默认形态）。选中项 `tabindex="0"`，未选中 `tabindex="-1"`（roving tabindex 键盘导航基础）。

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 选中 | `checked` | `aria-checked="true"` + ms-radio-btn 选中态 |
| 未选中 | 默认 | `aria-checked="false"` |
| 键盘焦点 | Tab | 选中项 `tabindex=0` 可聚焦 |

## 4. 场景（Scenarios）

**何时用**：设置页 2-4 个互斥枚举的快捷切换（工作模式、开关策略）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 选项多（>4）或带说明 | `bc-eg71-form-item-select` |
| 需禁用某选项（如非 Milesight 设备锁 ABP） | `bc-eg71-activation-card`（自带 `--disabled` 变体） |
| 纯展示标签组 | `ms-tag` 直接组合 |

## 5. Token（设计令牌）

继承 `S_Form` / `S_Radio`。结构类 `.bc-eg71-form-item-labelrow/-unit/-msg` / `.bc-eg71-form-item-radio-group`（`library/business.css`）。

## 6. 依赖（Dependencies）

`atoms`：`['form','radio']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-radio-group'].render({
  label: 'Work mode', options: ['Online', 'Offline', 'Auto'], value: 'Auto', msg: 'Supportive text'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
