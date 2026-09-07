---
name: B_Eg71FormFooter
description: 表单底部操作栏（业务组件）
---

# 表单底部操作栏 · B_Eg71FormFooter

> **逻辑名**：`B_Eg71FormFooter`
> **现 id**：`bc-eg71-form-footer`
> **分类**：系统设置
> **entityHint**：`gateway`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
EG71 表单页底部固定操作栏，含保存/取消/重置，用固钉（Affix）吸附页底。

### 何时用
- EG71 设置表单页底部，承载提交类操作。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 顶部操作 | `B_Eg71Topnav` |
| 非固定操作栏 | `S_Space` + `S_Button` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Affix` | `ms-affix` | 底部固钉 |
| `S_Space` | `ms-space` | 布局 |
| `S_Button` | `ms-btn` | 保存/取消/重置 |

### render 骨架（业务框架）
1. `ms-affix` 底置 → `.bc-eg71-formfooter` 容器。
2. `ms-space` 横向：取消（ghost）+ 重置 + 保存（主行动）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-eg71-form-footer', cn: '表单底部操作栏', cat: '系统设置', desc: 'EG71 表单页底部固定操作栏，保存/取消/重置…', atoms: ['affix','space','button'], entityHint: 'gateway', tags: ['表单','操作栏','底部固定','固钉','保存','取消','重置','EG71'], render(ctx){/* affix → formfooter → space(取消/重置/保存) */} }
```

### 上下文 ctx 契约
- `ctx.onSave/onCancel/onReset`（提交回调预留）。

### 结构类（`library/business.css`）
`.bc-eg71-formfooter`（208-213：固定底部栏）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-form-footer`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
