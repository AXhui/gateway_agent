---
name: B_Eg71FormItemInputButton
version: 1.0.0
description: EG71 表单输入按钮项（业务组件，存量补档）：下拉框 + 主/次按钮组，选择后触发动作
---

# 表单输入按钮项 · B_Eg71FormItemInputButton

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-input-button`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的「下拉 + 主/次按钮组」项：标签行 + 下拉框 + 线框按钮组（主 filled-lg + 次 lg），用于选择后触发动作（如 SNTP 服务器选择后 Test/Apply）。

**不是什么**：不执行按钮动作（无 bind，纯展示骨架）；输入型字段配合按钮的场景用 `bc-eg71-app-card` 的行内按钮格。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_Select` | `ms-select` | 下拉框 |
| `S_Button` | `ms-btn--filled ms-btn--lg` / `ms-btn--lg` | 主/次按钮 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.options` | string[] | `['Please select']` | 下拉选项 |
| `ctx.value` | string | 无 | 选中项 |
| `ctx.primaryLabel` | string | `'Button'` | 主按钮文案 |
| `ctx.secondaryLabel` | string | `'Button'` | 次按钮文案 |
| `ctx.msg` | string | `'Supportive text'` | 提示文案 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 常规 | 默认 | `.bc-eg71-form-item-btnrow`：下拉 + `ms-btn-group`（主/次） |
| 窄屏 | ≤980px | 按钮行随表单栅格降列 |

## 4. 场景（Scenarios）

**何时用**：设置页「选择枚举 + 立即触发」复合动作（测试连接、应用配置）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 纯下拉 | `bc-eg71-form-item-select` |
| 单一动作按钮 | `bc-eg71-form-item-button` |
| 导入卡行内按钮 | `bc-eg71-app-card` |

## 5. Token（设计令牌）

继承 `S_Form` / `S_Select` / `S_Button`。结构类 `.bc-eg71-form-item-labelrow/-unit/-msg` / `.bc-eg71-form-item-btnrow` / `.bc-eg71-form-item-select`（`library/business.css`），按钮间距走 `ms-btn-group` 契约。

## 6. 依赖（Dependencies）

`atoms`：`['form','select','button']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-input-button'].render({
  label: 'NTP server', options: ['pool.ntp.org', 'time.google.com'],
  primaryLabel: 'Test', secondaryLabel: 'Apply', msg: 'Sync gateway clock with NTP server.'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
