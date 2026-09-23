---
name: B_Eg71Toolbar
version: 1.0.0
description: EG71 列表工具栏（业务组件）：左操作组（主/ghost/危险钮随勾选启停）+ 右筛选组（搜索/下拉/Reset），无卡片壳单行
---

# EG71 列表工具栏 · B_Eg71Toolbar

> **逻辑名**：`B_Eg71Toolbar`
> **现 id**：`bc-eg71-toolbar`
> **分类**：列表
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（action/filter 事件冒泡）
> **站点依据**：`output/eg71-site-distill/` 31/37 页 `.device-list-toolbar` / `.table-header`（equipment-data：Manually Add 主钮 + Scan to add/Batch Import/Batch Export/Delete + search + Device Model 筛选 + Reset；data-forwarding：Add 主钮）

## 1. 描述

**这是什么**：EG71 列表页标准工具栏：无卡片壳单行，左操作组（primary 新增 + ghost 链 + 危险钮 disabled 随勾选启停）+ 右筛选组（关键词搜索 + 下拉筛选 + Reset 链接钮），组内 12px 间距。与 `bc-data-table`（`opsMode:'icon'`）+ 分页表尾拼成完整列表页。

**不是什么**：不是带卡片壳的查询筛选卡（那是 `_shared` 的 `bc-filter-bar`，两种形态并存：本组件对应站点 ms-table-pro 体系的无壳工具栏）；不做筛选逻辑——搜索/选择值以事件交宿主。

**归属产品线**：`eg71`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn(--filled/--danger/--link)` | 左操作组主/ghost/危险钮 + Reset 链接钮 |
| `S_Input` | `ms-input` | 右侧关键词搜索框 |
| `S_Select` | `ms-select` | 右侧筛选下拉 |
| `S_Icon` | `ico('plus'/'scan'/'upload'/'download'/'trash'/'refresh'/'search'/'chevronDown', 16)` | 按钮与输入内 16px 图标（阶梯下限） |
| `S_Space` | `ms-space--12` | 组内 12px 间距（按钮间红线 ≥12） |
| `S_Dropdown` | dropdown 触发箭头 | `dropdown:true` 动作加 chevronDown |

### ctx 上下文契约（只读，变更走回调）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.actions` | `{action, label, icon?, kind?: 'primary'\|'danger', disabled?, dropdown?}[]` | 站点 equipment-data 五钮 | 左操作组 |
| `ctx.filters` | `{type:'search', key?, placeholder?, value?} \| {type:'select', key?, placeholder?, options?}[]` | `[]` | 右筛选组 |
| `ctx.reset` | boolean | `true` | 是否渲染 Reset 链接钮 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-toolbar-action` | `{ action, label }` | 点击操作钮（disabled 不触发） |
| `eg71-toolbar-filter` | `{ key, value }` | 搜索框 change / 下拉 change |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 主钮 | `kind:'primary'` | `ms-btn--filled` |
| ghost 钮 | 默认 | `ms-btn` |
| 危险钮 | `kind:'danger'` | `ms-btn--danger` |
| disabled | `disabled:true` | 原生置灰 + 不触发事件（站点：未勾选时 Batch Export/Delete 置灰） |
| dropdown 触发器 | `dropdown:true` | 文字后 16px chevronDown（站点 Scan to add） |

## 4. 场景（Scenarios）

**何时用**：一切 ms-table-pro 型列表页头部（站点 31/37 页）；表单页卡头操作区也可用（data-forwarding 仅 Add 一钮）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 卡片壳包裹的查询区（查询/重置按钮组） | `bc-filter-bar`（_shared） |
| 表单底部固定操作栏 | `bc-eg71-form-footer` |
| 卡片标题行尾按钮 | `bc-com-title`（showButton） |

## 5. Token（设计令牌）

- 间距：`--spacing-12`（组内钮距/控件距，按钮红线 ≥12）
- 图标：16px 阶梯（`--spacing-16` 由 `ms-ico--16` 承载），颜色随按钮态
- 结构宽：搜索 260px / 下拉 min-width 140px（结构类来源注释，非视觉常量）

## 6. 依赖（Dependencies）

`atoms: ['button','input','select','icon','space','dropdown']`——仅编排。结构类 `.bc-eg71-toolbar(-spacer/-search/-select)`（`library/business.css`）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-toolbar'].render({
  actions: [
    { action: 'add', label: 'Add', icon: 'plus', kind: 'primary' },
    { action: 'delete', label: 'Delete', icon: 'trash', kind: 'danger', disabled: true }
  ],
  filters: [{ type: 'search', placeholder: 'Device Name or EUI' },
            { type: 'select', placeholder: 'Device Model', options: ['WT201', 'AM319'] }]
});
B['bc-eg71-toolbar'].bind(el);
el.addEventListener('eg71-toolbar-action', e => { if (e.detail.action === 'add') openForm(); });
```

## 8. 版本（Version）

见 frontmatter `version:`。
