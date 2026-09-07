---
name: B_UpgradeModal
description: 批量任务弹窗（业务组件）
---

# 批量任务弹窗 · B_UpgradeModal

> **逻辑名**：`B_UpgradeModal`
> **现 id**：`bc-upgrade-modal`
> **分类**：反馈
> **entityHint**：`firmware`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
固件 OTA 批量升级的任务弹窗，含步骤条、版本选择、进度与设备清单。

### 何时用
- 固件升级/批量推送的确认弹窗，用 `S_Steps` 引导三步任务流。
- 需要「步骤 + 灰度选择 + 进度 + 设备表」的任务弹窗。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 普通确认对话框 | `S_Modal`（基础组件） |
| 详情抽屉 | `B_DetailDrawer` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Modal` | `ms-modal` | 弹窗容器 |
| `S_Steps` | `ms-steps` | 步骤条 |
| `S_Select` | `ms-select` | 固件版本/灰度 |
| `S_Progress` | `ms-progress` | 任务进度 |
| `S_Alert` | `ms-alert` | 风险提示 |
| `S_Checkbox` | `ms-checkbox` | 设备多选 |
| `S_Button` | `ms-btn` | 取消/确认 |
| `S_Table` | `ms-table` | 设备清单 |

### render 骨架（业务框架）
1. `ms-modal` 头：任务标题。
2. `ms-steps`：选择固件 → 选择设备 → 执行确认。
3. 步骤一：`ms-select` 版本 + `ms-alert` 灰度说明。
4. 步骤二：设备表 `ms-table`（`ms-checkbox` 多选）。
5. 步骤三：`ms-progress` 进度 + 汇总。
6. 脚：取消 + 主行动「开始升级」。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-upgrade-modal', cn: '批量任务弹窗', cat: '反馈', desc: '固件 OTA 批量升级任务弹窗，含步骤、进度与设备清单…', atoms: ['modal','steps','select','progress','alert','checkbox','button','table'], entityHint: 'firmware', tags: ['升级','固件','OTA','批量','推送','弹窗','任务','灰度'], render(ctx) { /* modal → steps(3) → select/table/progress → footer */ } }
```

### 上下文 ctx 契约
- `ctx.entity.versions`（固件版本）、`ctx.rows`（设备清单）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-upgrade-modal`
- 结构类：无新增（复用 `ms-modal` 体系）
- 实体（只读）：`assets/js/registry-entities.js`（key `firmware`）
- 令牌（只读）：`.claude/tokens/tokens.css`
