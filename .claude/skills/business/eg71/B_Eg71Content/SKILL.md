---
name: B_Eg71Content
description: 内容容器（业务组件）
---

# 内容容器 · B_Eg71Content

> **逻辑名**：`B_Eg71Content`
> **现 id**：`bc-eg71-content`
> **分类**：系统设置
> **entityHint**：`gateway`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
EG71 系统设置的复合内容容器，把「区块卡 + 表单控件 + 可编辑表格 + 空态」打包为设置主区。

### 何时用
- EG71 网络/系统设置页的主内容区，承载多类表单控件与可编辑表格。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 纯告警规则表单 | `B_RuleForm` |
| 设备列表 | `B_DataTable` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 区块卡 |
| `S_Form` | `ms-form` | 表单骨架 |
| `S_Input` | `ms-input` | 文本输入 |
| `S_Select` | `ms-select` | 下拉 |
| `S_Radio` | `ms-radio` | 单选 |
| `S_Checkbox` | `ms-checkbox` | 多选 |
| `S_Switch` | `ms-switch` | 开关 |
| `S_Button` | `ms-btn` | 操作 |
| `S_Tag` | `ms-tag` | 状态 |
| `S_Table` | `ms-table` | 可编辑表格 |
| `S_Empty` | `ms-empty` | 空态 |

### render 骨架（业务框架）
1. `.bc-eg71-content` 容器 → 多个 `ms-card` 区块卡。
2. 区块内：`ms-form` 控件（radio/checkbox/switch/select/input）。
3. 可编辑表格区块：`ms-table`（含开关/选择单元格）。
4. 空区块：`ms-empty`。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-eg71-content', cn: '内容容器', cat: '系统设置', desc: 'EG71 系统设置复合内容容器，区块卡 + 表单 + 可编辑表格…', atoms: ['card','form','input','select','radio','checkbox','switch','button','tag','table','empty'], entityHint: 'gateway', tags: ['内容容器','区块卡','表单','设置','网络','开关','单选','多选','可编辑表格','空态','EG71'], render(ctx){/* content → 区块卡(表单/可编辑表格/空态) */} }
```

### 上下文 ctx 契约
- `ctx.entity.cn`（区块标题）、`ctx.rows`（可编辑表格行）。

### 结构类（`library/business.css`）
`.bc-eg71-content`（217-224：内容区布局）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-content`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
