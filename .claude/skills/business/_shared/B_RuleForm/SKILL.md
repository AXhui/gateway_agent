---
name: B_RuleForm
description: 规则配置表单（业务组件）
---

# 规则配置表单 · B_RuleForm

> **逻辑名**：`B_RuleForm`
> **现 id**：`bc-rule-form`
> **分类**：表单
> **entityHint**：`alarm`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
告警规则的配置表单，含条件开关、阈值滑杆与数值输入，支撑规则的「新增/编辑」。

### 何时用
- 告警规则的新增/编辑页，把「名称 + 条件开关 + 阈值 + 触发级别」装配成表单。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 系统设置的复合表单 | `B_Eg71Content` |
| 只读展示规则 | `B_DataTable` + `B_DetailDrawer` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form` | 表单骨架 |
| `S_Input` | `ms-input` | 名称/描述 |
| `S_Select` | `ms-select` | 触发源选择 |
| `S_Switch` | `ms-switch` | 启用开关 |
| `S_Slider` | `ms-slider` | 阈值滑杆 |
| `S_InputNumber` | `ms-input-number` | 阈值数值 |
| `S_Alert` | `ms-alert` | 规则说明提示 |
| `S_Button` | `ms-btn` | 提交/取消 |
| `S_Divider` | `ms-divider` | 分组分隔 |

### render 骨架（业务框架）
1. `ms-alert` 规则说明（informative）。
2. `ms-form` → 分组 `ms-form-section` + `ms-divider`。
3. 基础组：名称 input + 触发源 select + 启用 switch。
4. 阈值组：`ms-slider` + `ms-input-number` 联动。
5. 触发级别 select + 备注 input。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-rule-form', cn: '规则配置表单', cat: '表单', desc: '告警规则配置表单，含条件开关、阈值滑杆…', atoms: ['form','input','select','switch','slider','input-number','alert','button','divider'], entityHint: 'alarm', tags: ['配置','规则','表单','新增','编辑','设置','创建','参数'], render(ctx) { /* alert → form → section(基础/阈值/级别) → divider */ } }
```

### 上下文 ctx 契约
- `ctx.entity.cn`（表单标题）、`ctx.onSubmit`（提交回调预留）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-rule-form`
- 结构类：无新增（复用 `ms-form` 体系）
- 实体（只读）：`assets/js/registry-entities.js`（key `alarm`）
- 令牌（只读）：`.claude/tokens/tokens.css`
