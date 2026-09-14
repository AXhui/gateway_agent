---
name: B_Eg71MissionPlan
version: 1.0.0
description: 任务计划卡片墙（业务组件 · 维护 → Mission Planning）
---

# 任务计划卡片墙 · B_Eg71MissionPlan

> **逻辑名**：`B_Eg71MissionPlan`
> **运行时 id**：`bc-eg71-mission-plan`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`130:4494`（任务计划，1220×364：Add Plan 占位卡 + 启用卡 + 停用卡）

---

## 一、描述

维护 → Mission Planning 页：自适应卡片墙 =「+ Add Plan」虚线占位卡 + 计划卡（标题 + 启用开关 + 删除钮 / 动作下拉 / 时间选择 / 一~日七枚星期多选钮）。

不是表格——计划超过 4 个建议滚动而非分页（卡片墙形态）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` | 卡内字段结构 |
| `S_Select` | `ms-select` | 动作下拉（Reboot…） |
| `S_Input` | `ms-input`（`type="time"`） | 计划触发时间 |
| `S_Button` | `ms-btn` / `ms-btn--sm` | 星期多选钮 / Add Plan / 删除 |
| `S_Switch` | `ms-switch` | 计划启用开关 |
| `S_Icon` | `ms-ico` | plus / trash / clock |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.plans` | `Plan[]` | Figma 双卡示例 | `Plan = { name, enabled, action, time, days:number[] }`，`days` 0=周一…6=周日 |
| `ctx.actions` | `string[]` | `['Reboot']` | 动作下拉选项 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  └ .bc-eg71-plan-grid（auto-fill minmax(300px,1fr)）
      ├ article.bc-eg71-plan-card[data-plan]
      │   ├ .bc-eg71-plan-head（title + ms-switch + trash）
      │   └ .bc-eg71-plan-body（ms-select + time + 7×.bc-eg71-plan-day）
      └ button.bc-eg71-plan-card--add（+ Add Plan）
```

### bind 骨架
`[data-plan-add]` → `eg71-plan-add`；`[data-plan-del]` → `eg71-plan-delete {index}`；`[data-plan-toggle]` change → 原地切 `--disabled` 类 + `eg71-plan-toggle {index,enabled}`；`[data-plan-day]` click → 原地切 `--active` + `aria-pressed` + `eg71-plan-day {index,day,active}`。

## 三、状态

| 状态 | 切换类 / 属性 | 说明 |
|---|---|---|
| 启用卡 | 默认 | 表单区可操作 |
| 停用卡 | `.bc-eg71-plan-card--disabled` | 表单区 `opacity .45` + `pointer-events:none`；开关仍可点以重新启用 |
| 星期选中 | `.bc-eg71-plan-day--active` + `aria-pressed` | 蓝字蓝边 |
| Add 卡悬停 | `:hover` | 虚线边框转主蓝 |

## 四、场景

**何时用**：周期性计划任务（如每周一/四/六/日 14:30 重启）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 立即重启 / 恢复出厂 | `B_Eg71Restart` |
| 计划列表需批量操作/分页 | `B_ComTablePro`（`bc-com-table-pro`） |

## 五、Token

`--color-bg-card`、`--color-border-base`、`--color-border-primary-normal`、`--color-text-primary`、`--color-text-secondary`、`--color-text-primary-normal`、`--color-icon-primary-normal`、`--color-icon-auxiliary`、`--color-text-error-normal`、`--spacing-20`、`--spacing-16`、`--spacing-12`、`--spacing-8`、`--spacing-32`、`--radius-4`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-mission-plan'].render({
  plans: [{ name: 'Plan 1', enabled: true, action: 'Reboot', time: '14:30', days: [0, 3, 5, 6] }]
});
BIZ['bc-eg71-mission-plan'].bind(app);
app.addEventListener('eg71-plan-toggle', e => savePlan(e.detail.index, e.detail.enabled));
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-mission-plan`
- 结构类：`library/business.css`（`bc-eg71-plan-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
