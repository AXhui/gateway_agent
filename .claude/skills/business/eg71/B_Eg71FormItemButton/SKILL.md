---
name: B_Eg71FormItemButton
version: 1.0.0
description: EG71 表单按钮项（业务组件，存量补档）：标签 + 主操作按钮（filled lg）+ 提示文案
---

# 表单按钮项 · B_Eg71FormItemButton

> **存量补档**：运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-form-item-button`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 设置表单的「标签 + 单一主按钮」项：标签行 + `.bc-eg71-form-item-btnrow` 内一个 `ms-btn ms-btn--filled ms-btn--lg` + 提示文案行。

**不是什么**：不是双按钮组（主/次双动作用 `bc-eg71-form-item-input-button`）；不执行按钮动作（无 bind，纯展示骨架）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` | 表单项骨架 |
| `S_Button` | `ms-btn--filled ms-btn--lg` | 主操作按钮 |

### ctx 上下文契约
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Label'` | 标签 |
| `ctx.unit` | string | 无 | 单位 `(unit)` |
| `ctx.required` | boolean | `true` | 必填星号 |
| `ctx.buttonLabel` | string | `'Button'` | 按钮文案 |
| `ctx.msg` | string | `'Supportive text'` | 提示文案 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 常规 | 默认 | filled lg 主按钮 |
| 悬停/按下 | hover/active | `S_Button` 契约态 |

## 4. 场景（Scenarios）

**何时用**：设置页单动作触发项（恢复出厂、重启服务、导出配置等高危/独立动作入口）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 主/次双按钮 | `bc-eg71-form-item-input-button` |
| 选择 + 触发复合 | `bc-eg71-form-item-input-button` |
| 表单底保存/重置/取消 | `bc-eg71-form-footer` |

## 5. Token（设计令牌）

继承 `S_Form` / `S_Button`。结构类 `.bc-eg71-form-item-labelrow/-unit/-msg` / `.bc-eg71-form-item-btnrow`（`library/business.css`）。

## 6. 依赖（Dependencies）

`atoms`：`['form','button']`，仅编排，不新增基础原子。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-form-item-button'].render({
  label: 'Factory reset', buttonLabel: 'Reset', msg: 'All settings will be restored to defaults.'
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
