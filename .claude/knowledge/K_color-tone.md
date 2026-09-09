# K_color-tone · 状态用色规范 + 调用链

> 用途：统一「状态 / 标签」类内容的用色标准，避免各业务组件各自发明颜色语义。
> 来源：Figma《网关/路由器 通用业务组件库》节点 `12:21665`（Tag 标签状态规范页），色值二次核对以其引用的
> 颜色 token 源文件（`Er9jFJWKavCdkG7HXPc58v` 节点 `1460-20469`）为准；本文件只收敛**语义 → tone** 的对照，
> 不重复定义颜色本身（颜色本身由 L1 token 承担，见下方调用链）。

---

## 一、Figma 权威规则

### 1. 数值范围类型（按百分比区间分级）

| 区间 | 色系 | 对应 L1 token |
|---|---|---|
| 正常数值 | 蓝色系 | `--color-primary-bg` / `--color-primary-normal` |
| 警告数值 | 橙色系 | `--color-warm-bg` / `--color-warm-normal` |
| 异常数值 | 红色系 | `--color-error-bg` / `--color-error-normal` |

> 注：Figma 源页面的百分比区间用于「健康度类」数值（如剩余寿命/信号强度），与本仓库 `type: 'percent'` 单元格
> （见 `assets/js/registry-business.js#cellHtml`）语义不同，本文件不改动 percent 单元格的既有分级逻辑，仅收敛
> **状态标签类**（下表）。

### 2. 状态标签（按业务语义分组）

| 语义分组 | 典型文案 | 色系 | 对应 tone |
|---|---|---|---|
| 进行中 | 连接中 / 使用中 / 等待中 / 准备中 | 蓝色系 | `primary` |
| 成功 / 正常 | 正常 / 成功 / 启用 / 上线 / 运行中 | 绿色系 | `success` |
| 警告 | 警告 / 异常（提醒级） | 橙色系 | `warm` |
| 失败 / 危险 | 失败 / 告警 / 危险 | 红色系 | `error` |
| 停用 / 离线 | 未启用 / 未连接 / 下线 | 灰色系 | `muted` |

**判断口径**：「进行中」组的核心特征是——动作仍在推进、等待外部条件、非终态；与「警告」组（已出现异常但未失败）区分开。
`处理中 / 待推送 / 待激活 / 待审 / 待处理` 属于「进行中」（等待/推进中），不属于「警告」。

---

## 二、调用链（tone → 视觉）

```
ctx.entity.statuses[i] = { cn, tone }          ← assets/js/registry-entities.js（唯一数据源）
        │
        ▼
U.statusTag(st) / U.cellHtml(field,row,entity) ← assets/js/registry-business.js（TONE 映射表）
        │   const TONE = { success: 'ms-tag--success', error: 'ms-tag--error',
        │                  warm: 'ms-tag--warm', primary: 'ms-tag--primary', muted: 'ms-tag' }
        ▼
.ms-tag.ms-tag--<tone>                          ← library/base.css（L2 基础样式，颜色值来自 L1 token）
        │
        ▼
S_Tag（.claude/skills/base/Tag/SKILL.md）        ← L2 组件契约，antd 对齐
```

- 业务组件（如 `B_Eg71Alarm`）不直接持有颜色，只消费 `ctx.entity.statuses` 里的 `tone` 字段。
- `tone` 的合法取值仅 5 个：`success` / `error` / `warm` / `primary` / `muted`，一一对应上表五组语义。
- 新增实体或新增状态文案时，先在上表找语义分组，再取对应 `tone`，不新增 tone 取值、不在业务层写颜色常量
  （对应 `.claude/rules/business-specific.md` §1 样式铁律）。

---

## 三、现状盘点 + 修正记录

`assets/js/registry-entities.js` 8 个实体的 `statuses` 逐条对照 Figma 规则核查，发现「进行中」语义组内部
tone 使用不一致（`firmware.升级中` 已是 `primary`，但同语义的其余 5 处误用 `warm`），已按上表统一修正：

| 实体 | 状态文案 | 修正前 | 修正后 | 依据 |
|---|---|---|---|---|
| `alarm` | 处理中 | `warm` | `primary` | 处理动作进行中，非警告态 |
| `firmware` | 待推送 | `muted` | `primary` | 排队等待推送，非停用态 |
| `member` | 待激活 | `warm` | `primary` | 等待激活动作完成，非警告态 |
| `log` | 待审 | `warm` | `primary` | 审核动作进行中，非警告态 |
| `generic` | 待处理 | `warm` | `primary` | 兜底实体同步对齐 |

修正范围仅限 `assets/js/registry-entities.js` 的 `tone` 字段，未改动 `library/base.css` 的 `.ms-tag--*` 定义，
未改动 `registry-business.js` 的 `TONE` 映射表。

低置信度、本次未改动的候选（供后续人工复核）：

- `sensor.采集中` 现为 `success`（绿）。若按「使用中」语义可归入「进行中」（蓝），若按「运行正常」语义则维持
  `success` 更贴切——语义边界模糊，本次保持现状，不擅自改动。

---

## 四、涉及的 EG71 业务组件

| 业务组件 | entityHint | 消费方式 |
|---|---|---|
| `B_Eg71Alarm`（`bc-eg71-alarm`） | `alarm` | 事件表「处理状态」列走 `type: 'status'` → `U.cellHtml` → `U.statusTag` |
| 其余 4 个 EG71 业务组件（`Sidenav`/`Topnav`/`Content`/`FormFooter`） | `gateway` | 不直接消费 `statuses`（无状态标签场景） |

跨产品线共用组件 `B_StatusTag`（`bc-status-tag`，`.claude/skills/business/_shared/B_StatusTag/SKILL.md`）
是本规则的标准封装出口，任何产品线新增状态标签场景应优先复用它，而非在各业务组件内重复拼 `ms-tag--*`。
