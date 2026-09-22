---
name: B_Eg71FormItemDatePicker
version: 1.0.0
description: EG71 表单日期范围项（业务组件，存量补档）：标签 + 起止两个 lg 输入框（日历图标）+ 减号分隔 + 提示文案
---

# 表单日期范围项 · B_Eg71FormItemDatePicker

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-date-picker`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的日期范围项：标签行 + `ms-datepicker` 容器内两个 lg 输入框（起/止，各带 calendar 图标）以 minus 图标分隔 + 提示文案行。

**不是什么**：不实现日历弹层（日期面板由宿主或 L2 日期控件实现；本组件是骨架 + 值承载）；无 bind。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_DatePicker` | `ms-datepicker` / `ms-input--lg` | 起止输入容器 |
| `S_Icon` | `ico('calendar',16)` / `ico('minus',16)` | 图标 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.startPlaceholder` | string | `'Start date'` | 起始占位 |
| `ctx.endPlaceholder` | string | `'End date'` | 截止占位 |
| `ctx.startValue` | string | 无 | 起始值 |
| `ctx.endValue` | string | 无 | 截止值 |
| `ctx.msg` | string | `'Supportive text'` | 提示文案 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 常规 | 默认 | `.bc-eg71-form-item-range`：input − input，日历图标收尾 |
| 输入中 | focus | `ms-input` focus 态 |

## 4. 场景（Scenarios）

**何时用**：设置页时间区间筛选/配置（如数据保留区间、计划任务区间）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 单个日期 | `S_DatePicker` 直接组合 |
| 单行输入/下拉 | `bc-eg71-form-item-input` / `-select` |

## 5. Token（设计令牌）

继承 `S_Form` / `S_DatePicker` / `S_Icon`。结构类 `.bc-eg71-form-item-labelrow/-unit/-msg` / `.bc-eg71-form-item-range`（`library/business.css`）。

## 6. 依赖（Dependencies）

`atoms`：`['form','input','date-picker']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-date-picker'].render({
  label: 'Active period', startPlaceholder: 'Start date', endPlaceholder: 'End date',
  startValue: '2026-01-01', endValue: '2026-12-31', msg: 'Data retention window.'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
