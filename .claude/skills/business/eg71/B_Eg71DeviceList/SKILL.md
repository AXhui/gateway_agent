---
name: B_Eg71DeviceList
version: 1.1.1
description: EG71 设备数采设备列表（业务组件，存量补档）：工具栏 + 设备表 + 信号气泡 + 分页表尾；v1.1.0 入网失败状态；v1.1.1 站点转录色票勘误 Offline→暖橙
---

# 设备数采 · 设备列表 · B_Eg71DeviceList

> **存量补档**：本组件运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-device-list`），本文档按运行时反向固化契约；v1.1.0 扩展（REQ-012 入网失败）随档同步。

## 1. 描述

**这是什么**：Milesight 网关「Data Services → Data Acquisition → Device」设备列表：工具栏（Manually Add 主按钮 / Scan Add / Batch Add / Delete 危险钮随勾选启停）+ 设备表（复选列 + Identifier / Name / Model / Protocol Type / Signal / Last updated / Status / Number of objects，行内 Edit·Monitor·Delete）+ 信号列 hover 气泡（SF / SNR / RSSI）+ 表尾（Total + 已选计数 + 分页跳转）；空态保留表头、表体替换 Empty；行删除 / 批量删除复用 `bc-eg71-modal` 删除确认弹窗。v1.1.0（REQ-012）：状态新增 **Join failed（入网失败，error 态）**，`failReason` 存在时状态右侧渲染问号图标，hover 气泡展示失败原因（密钥错误 / 节点未收到入网应答包）。v1.1.1（站点转录）：Offline 色票勘误 `muted→warm`——真实站 equipment-data 页 Offline 渲染为暖橙 tag（`ant-tag-orange`），依据 `output/eg71-site-distill/diff-matrix.md` §1#14；Props 与结构零变化。

**不是什么**：不是扫描确认页的发现设备表（那是 `bc-eg71-scan-device-table`，双 Tab + 行内编辑 + 添加/放弃）；不做真实增删改——操作以冒泡事件交宿主。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn(--sm/--filled/--danger)` | 工具栏与行内操作 |
| `S_Table` | `ms-table` / `ms-table-wrap` | 设备表骨架 |
| `S_Checkbox` | `ms-checkbox` | 行选择 + 表头全选（indeterminate） |
| `S_Tag` | statusTag（`ms-tag` 语义色） | 状态列（Online/Offline/Not activated/**Join failed**） |
| `S_Icon` | `ico(...)`（refresh/filter/操作图标/问号） | 工具栏、表头筛选、失败原因提示 |
| `S_Pagination` | `ms-pagination` / `ms-page-item` / `ms-page-jump` | 表尾分页 |
| `S_Empty` | `ms-empty` | 空态 |
| `B_Eg71Modal` | 内嵌 render | 删除确认弹窗 |
| `S_Tooltip`（结构同构） | `.bc-eg71-signal-tip` / `.bc-eg71-fail-tip`（absolute 气泡） | 信号与失败原因 hover 气泡 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.rows` | Row[] | 内置 6 行演示数据 | `{ id, name, model, protocol, network, signal:{level:'good'\|'medium'\|'poor', tip:string[]}\|null, updated, status, objects, failReason? }` |
| `ctx.state` | `'empty'` \| 其他 | — | `'empty'` 时空态 |
| `ctx.total` | number | `312` | 表尾 Total |

**v1.1.0 行级新增**：`status:'Join failed'`（STATUS map 新增 `{ cn:'Join failed', tone:'error' }`）；`failReason`：`'key_error'` → 气泡「密钥错误」，`'no_join_accept'` → 「节点未收到入网应答包」（亦可传 `failReasonText` 直接给原文；无 failReasonText 时兜底「密钥错误」）。失败原因**仅作状态右侧注记提示，不是独立状态**（03-ued §6.2）。

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-device-add` | `{ path:'manual'\|'scan'\|'batch' }` | 工具栏添加类按钮（scan 即 LoRaWAN 扫描入口） |
| `eg71-device-op` | `{ op:'edit'\|'monitor' }` | 行内编辑/监视按钮 |

（删除走内嵌弹窗确认后直接移除行，不发事件。）

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 空态 | `ctx.state==='empty'` | 表头保留，表体 `ms-empty` |
| 勾选联动 | checkbox change | Delete 批量钮启停；表头全选 checked/indeterminate；表尾 Selected N |
| 删除确认 | 行内/批量 Delete | 内嵌 `bc-eg71-modal`（action:'delete'），确认后移除行 |
| 信号气泡 | hover 信号格 | `.bc-eg71-signal-tip` 显隐（三档条 + SF/SNR/RSSI） |
| **入网失败提示**（v1.1.0） | hover 状态列问号图标 | `.bc-eg71-fail-tip` 显隐（`.bc-eg71-fail-tipwrap` = relative 容器 + 16px 问号，24px 命中区） |

## 4. 场景（Scenarios）

**何时用**：设备数采页主列表（含 REQ-012 后的入网失败状态展示与扫描入口）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| LoRaWAN 扫描发现的设备（双 Tab + 行内编辑 + 添加/放弃） | `bc-eg71-scan-device-table` |
| 单台设备编辑整页 | `bc-eg71-device-form` |
| 通道/转发列表 | `bc-eg71-event-*` 系列 |

## 5. Token（设计令牌）

- 信号条：`--color-success-normal`（good）/ `--color-primary-normal`（medium）/ `--color-warm-normal`（poor）/ `--color-divider-base-2`（底）；条高 `--spacing-4/6/8/12`、宽 `--spacing-2`
- 气泡（信号 + 失败原因同范式）：`--color-bg-card` 底 + `--color-divider-base-1` 边 + `--shadow-3` + `--radius-6`，偏移 `calc(100% + --spacing-8)`
- 失败原因图标：`--color-icon-secondary`；文案 `--color-text-secondary` 12px
- 状态 Tag：statusTag 语义色（error 态 = Join failed）
- 左对齐契约：数字列 `bc-num`、操作列 `bc-eg71-table-ops`

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `button` / `table` / `checkbox` / `tag` / `icon` / `pagination` / `empty` / `modal`（业务内嵌）。结构类 `.bc-eg71-device-list`（作用域根）+ 作用域内 `.bc-eg71-signal-*` 与 v1.1.0 新增 `.bc-eg71-fail-tipwrap/-tip`（`library/business.css`）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-device-list'].render({
  rows: [
    { id: '3425', name: 'AM319', model: 'AM319', protocol: 'LoRaWAN', network: '',
      signal: { level: 'good', tip: ['SF:9', 'SNR: -97dB', 'RSSI: -108dBm'] },
      updated: '2024-12-23 09:30', status: 'Join failed', objects: 34,
      failReason: 'key_error' },          // v1.1.0：入网失败 + 密钥错误提示
    { id: '3426', name: 'EM500-PT100', model: 'EM500-PT100', protocol: 'Modbus TCP',
      signal: null, updated: '', status: 'Offline', objects: 232 }
  ],
  total: 2
});
B['bc-eg71-device-list'].bind(app);

app.addEventListener('eg71-device-add', e => {
  if (e.detail.path === 'scan') router.push('/data-services/data-acquisition/lorawan-scan');
});
```

## 8. 版本（Version）

见 frontmatter `version:`。v1.1.0（REQ-012）：状态枚举新增 Join failed（error）+ failReason/failReasonText 行级字段与 hover 原因提示；默认行为与其余契约不变。
