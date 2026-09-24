---
name: B_Eg71ScanDeviceTable
version: 1.0.1
description: EG71 扫描设备双页签表（业务组件）：发现/已忽略双 Tab + 行内编辑 + 批量操作 + 添加设备/放弃扫描（内嵌确认弹窗 + Toast + 行淡出）；v1.0.1 表格卡 20px 内边距（hover 内收）+ 卡内工具栏与表格间距 20px
---

# 扫描设备双页签表 · B_Eg71ScanDeviceTable

## 1. 描述

**这是什么**：EG71 扫描确认页主体：页签条（发现设备 N / 已忽略设备 M）→ 分 Tab 工具栏 → 8 列设备表 → 表尾刷新。行按更新时间倒序；设备名/描述/型号支持行内编辑（交互 #1）；发现 Tab 操作列【编辑】【忽略】、已忽略 Tab【取消忽略】；工具栏批量操作随勾选启停，发现 Tab 另有【添加设备】主钮 +【放弃扫描】危险钮。添加设备经内嵌确认弹窗 → Toast「N个设备添加成功」+ 行淡出移除；超限（2000 台，D4）经确认弹窗拦截；放弃扫描经删除确认弹窗 → 全部行淡出移除。单/批量编辑只冒泡事件，抽屉由宿主用 `bc-eg71-scan-edit-drawer` 呈现。

**不是什么**：不是设备数采页主设备列表（那是 `bc-eg71-device-list`——本表的信号条图示与其同范式但为独立未加作用域的 `bc-eg71-scan-signal*` 类，且本表常显 `RSSI/SNR` 具体值）；不做真实路由跳转与后端提交——全部以冒泡事件交宿主。

**归属产品线**：`eg71`。**entityHint**：`device`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` / `ms-card-body` | 表卡容器（页签条复用全局 `bc-eg71-event-bar/-tab`） |
| `S_Button` | `ms-btn(--sm/--filled/--danger)` | 批量/行操作/添加/放弃/刷新 |
| `S_Table` | `ms-table` / `ms-table-wrap bc-eg71-table` / `th/td` | 8 列表格骨架 |
| `S_Checkbox` | `ms-checkbox` | 行选择 + 表头全选（indeterminate） |
| `S_Input` | `ms-input--sm` | 行内名称/描述编辑 |
| `S_Select` | `ms-select--sm` | 行内型号快速选择 |
| `S_Tag` | `ms-tag--round(--outline)` | 型号多匹配 Tag 组 / 页签计数 |
| `S_Icon` | `ico(…, 16|32)` | 操作列/工具栏/空态图标 |
| `S_Empty` | `ms-empty` | 空态（found：扫描进行中文案） |
| `S_Message` | `ms-message-stack` + `ms-message`（直组，bind 内 append 到 body） | 添加成功 Toast |
| `B_Eg71Modal` | `MS_BIZ_INDEX['bc-eg71-modal']` render+bind | 添加确认（confirm）/ 放弃确认（delete）/ 超限提示（confirm）三弹窗 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'found' \| 'ignored'` | `'found'` | 当前页签（决定操作列与工具栏形态） |
| `ctx.rows` | Row[] | 内置 4 行演示数据 | `{ devEui, name, description, model: string\|string[], rssi, snr, level:'good'\|'medium'\|'poor', lastUpdateAt, ignored? }`；渲染前按 lastUpdateAt 倒序 |
| `ctx.maxDevices` | number | `2000` | 设备数上限（超限拦截阈值，写 `data-scan-max-devices`） |
| `ctx.existingDevices` | number | `0` | 既有设备数（与勾选数合计判定超限） |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-scan-tab` | `{ tab }` | 点击另一页签（宿主重渲染对应 Tab） |
| `eg71-scan-refresh` | `{ tab }` | 表尾【刷新】 |
| `eg71-scan-row-edit` | `{ devEui, field:'name'\|'description'\|'model', value }` | 行内控件 change |
| `eg71-scan-edit-single` | `{ devEui }` | 行内【编辑】 |
| `eg71-scan-edit-multi` | `{ devEuis }` | 工具栏批量【编辑】 |
| `eg71-scan-ignore` | `{ devEuis, ignored:boolean }` | 行内/批量【忽略】或【取消忽略】（Tab 间移动由宿主重渲染） |
| `eg71-scan-add` | `{ devEuis }` | 添加确认弹窗点【确认】（已 Toast + 行淡出移除） |
| `eg71-scan-abandon` | `{}` | 放弃弹窗点【放弃扫描】（全部行已淡出移除） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| found 空态 | 发现 Tab 无行 | 表头保留，表体 Empty「扫描进行中，离开此页面不会打断扫描」 |
| ignored 空态 | 已忽略 Tab 无行 | Empty「暂无已忽略设备」 |
| 勾选联动 | 任一 checkbox change | 批量钮 +【添加设备】随 n>0 启停；表头全选 checked/indeterminate |
| 型号多匹配 | `model` 为数组且长度>1 | Tag 组展示（候选 + None 描边）；否则行内 `ms-select--sm` |
| 添加成功 | 添加弹窗确认 | Toast「N个设备添加成功」+ 行加 `.bc-eg71-scan-row--leaving`（`--duration-normal` 淡出后移除，计数同步） |
| 超限拦截 | existing + 勾选数 > maxDevices | 直接打开「超过数量上限」确认弹窗，不进添加流程 |
| 放弃扫描 | 危险钮 → 删除弹窗确认 | `eg71-scan-abandon` + 全部行淡出移除 |

## 4. 场景（Scenarios）

**何时用**：LoRaWAN 扫描确认页主体表（发现/已忽略双 Tab 全场景）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 设备数采页主列表（状态/对象数/分页） | `bc-eg71-device-list` |
| 单/多设备编辑表单本体 | `bc-eg71-scan-edit-drawer`（本表只发事件） |
| 扫描配置（AppKey 管理） | `bc-eg71-scan-appkey-card` |

## 5. Token（设计令牌）

- 信号条：`--color-success-normal`（good）/ `--color-primary-normal`（medium）/ `--color-warm-normal`（poor）/ 底 `--color-divider-base-2`；条高 `--spacing-4/6/8/12`
- 信号值文案：`--color-text-secondary`，12px
- 行淡出：`opacity` 过渡 `--duration-normal`
- 间距：`--spacing-12`（卡体纵向/工具栏 gap）；其余继承 Card/Table/Tag/Button
- 页签条复用 `bc-eg71-event-bar/-tab`（48px，active 走 primary 下划线）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `tabs(事件表条)` / `button` / `table` / `checkbox` / `input` / `select` / `tag` / `icon` / `empty` / `message` / `modal`（业务内嵌 `B_Eg71Modal`，三个弹窗各居独立 wrapper 分开 bind）。结构类 `.bc-eg71-scan-device-table` / `.bc-eg71-scan-body/-toolbar(-spacer)/-signal(-bars/-bar(--good|medium|poor)/-vals)/-model-tags/-model-select/-row(--leaving)/-modal`（`library/business.css`）；左对齐契约复用 `bc-eg71-table-ops` / `bc-num` / `bc-col-check` / `bc-table-foot` / `bc-count`。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-scan-device-table'].render({ tab: 'found', maxDevices: 2000, existingDevices: 1998 });
B['bc-eg71-scan-device-table'].bind(app);

app.addEventListener('eg71-scan-ignore', e => rerender(moveRows(e.detail.devEuis, e.detail.ignored)));
app.addEventListener('eg71-scan-edit-single', e => openDrawer('single', e.detail.devEui));
app.addEventListener('eg71-scan-edit-multi', e => openDrawer('multi', e.detail.devEuis));
app.addEventListener('eg71-scan-add', e => api.addAll(e.detail.devEuis)); // Toast/移除已由组件完成
app.addEventListener('eg71-scan-abandon', () => { api.abandon(); location.hash = '#/device'; });
```

## 8. 版本（Version）

见 frontmatter `version:`。
