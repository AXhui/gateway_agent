---
name: B_Eg71Alarm
description: 告警事件列表（业务组件）
---

# 告警事件列表 · B_Eg71Alarm

> **逻辑名**：`B_Eg71Alarm`
> **现 id**：`bc-eg71-alarm`
> **分类**：系统设置
> **entityHint**：`alarm`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（筛选 + 分页 + 批量选择）
> **注**：本组件为第 19 个业务组件，此前在 `_index.json` 与 README 中缺失，本次固化补登。

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
EG71 告警事件列表，含关键统计、筛选、批量选择与分页，Events 告警的专用列表。

### 何时用
- EG71 告警/预警/事件（Events）页，需要统计 + 筛选 + 批量 + 列表一体。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 通用设备列表 | `B_DataTable` |
| 告警规则配置 | `B_RuleForm` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 容器 |
| `S_Statistic` | `ms-stat-*` | 关键统计 |
| `S_Input` | `ms-input` | 搜索 |
| `S_Select` | `ms-select` | 类型/级别筛选 |
| `S_Button` | `ms-btn` | 操作 |
| `S_Table` | `ms-table` | 事件表 |
| `S_Checkbox` | `ms-checkbox` | 批量选择 |
| `S_Tag` | `ms-tag`（经 `U.statusTag`） | 级别/状态 |
| `S_Pagination` | `ms-pagination` | 分页 |
| `S_Icon` | `ms-ico` | 图标 |

### render 骨架（业务框架）
1. 顶部：关键统计 `ms-stat` 组（告警总数/未处理/已确认）。
2. 筛选行：`ms-input` 搜索 + `ms-select` 类型/级别 + 批量操作 `ms-btn`。
3. 事件表：首列 `ms-checkbox` 多选 + 级别/状态 `U.statusTag` + 时间 + 设备 + 操作。
4. 表尾：`ms-pagination`。

### bind 骨架
1. 筛选变更 → 重新筛选行数据。
2. 批量选择 → 更新已选数，切换批量操作可用态。
3. 分页点击 → 切页。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-eg71-alarm', cn: '告警事件列表', cat: '系统设置', desc: 'EG71 告警事件列表，统计 + 筛选 + 批量 + 分页…', atoms: ['card','statistic','input','select','button','table','checkbox','tag','pagination','icon'], entityHint: 'alarm', tags: ['告警','报警','事件','Events','预警','规则','列表','EG71','告警列表'], render(ctx){/* stat → filter → table → pagination */}, bind(root){/* 筛选 + 分页 + 批量选择 */} }
```

### 上下文 ctx 契约
- `ctx.entity.metrics`（关键统计）、`ctx.entity.statuses`（级别/状态枚举）、`ctx.rows`（事件行）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-alarm`
- 结构类：无新增（复用 `ms-card/table/stat` 体系）
- 实体（只读）：`assets/js/registry-entities.js`（key `alarm`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-alarm-verify.html`（`MS_BIZ_INDEX['bc-eg71-alarm'].render/bind`）
