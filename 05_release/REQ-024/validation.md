# REQ-024 · UG6X LoRa Mesh（侧边栏去 LoRa 二级项）validation

## 需求与基线

- 用户指令：该 demo（REQ-023 交付物，飞书预览）侧边栏 LoRa 不展示二级选项——General/Radio/Gateway Fleet 切换由页内 Tab 承担，侧边栏只留一级入口。
- 基线：REQ-023 demo（Figma 71.0.0.5 + PRD wiki QK6RwHDmuidau8kg3yEcGBKPnad）。本次为新会话窗口下发 → 按 sync-numbering.md §1 窗口粒度新增 REQ-024，不沿用旧编号续写。
- 变更面（对照 REQ-023）：
  1. `navGroups` LoRa 项移除 `children: ['General','Radio','Gateway Fleet']`——唯一源 `assets/js/registry-business.js:207` 与 demo 内联副本同步修改（AGENTS.md 壳契约「需求匹配动作」 sanctioned 路径，非私改单 demo 菜单）。
  2. 壳面包屑子项兜底 `cap(segs[1])` → `segs[1].split('-').map(cap).join(' ')`（`/lora/gateway-fleet` 无 children 匹配时显示 "Gateway Fleet" 而非 "Gateway-fleet"；唯一源 + 内联副本同步，通用修正非 demo 私有）。

## 旧形态 × 新规则 修订行（page-assembly.md §0.5）

| 旧形态（REQ-023 及更早） | 当前裁定 | 本次动作 |
|---|---|---|
| 侧边栏 LoRa 挂二级项 General/Radio/Gateway Fleet | 用户裁定（2026-11-13）：切换走页内 Tab（bc-eg71-page-tabs），侧边栏不展示二级 | 移除 children，同步唯一源；页内 Tab 切换链复验通过 |
| Fleet 成员卡带标题行（gateway 图标 + "Member Gateways"） | 用户裁定（2026-11-13 第二轮，附截图圈红）：标题和图标整行移除；同 AGENTS.md「单表格页免标题」 | 内联副本改条件渲染（不传 title/actionsHtml 不渲染卡头），操作栏贴卡顶；registry 源头保持默认兜底（契约注明），不回写 |
| 成员表第一列表头 Identifier | 用户裁定（2026-11-13 第二轮）：第一列是 Relay ID | 组件契约变更：registry 列头 + demo 内联 + SKILL.md §一/§二 + 实体契约 fleetMember.fields.eui.cn 同步改 Relay ID；编辑抽屉只读 ID 标签同步 |
| 编辑抽屉含 GPS Latitude/GPS Longitude/Altitude 只读行 | 用户裁定（2026-11-13 第二轮，红框圈定）：只保留 ID 和 Name | 调用点 ctx.editDrawer 移除 info 数组（组件 info 能力保留为可选契约）；数据池 gps 字段随之无消费方，一并删除 |
| Edit/Detail 抽屉关闭仅就地隐藏，宿主状态未清 | 前轮遗留修复（本批收口）：关闭后再次打开会复活叠加 | 组件 bind 派发 `eg71-mesh-fleet-drawer-close`，宿主清 S.fleet.edit/detail；两抽屉打开互斥 |

## 三角色验收（scoring.md §0.2–0.4）

浏览器实测（Playwright/Chromium，1440×900，file:// 直开）：

### UED

- [U1-1] 侧边栏 LoRa 项｜AGENTS.md 壳契约 navGroups 唯一源｜无 chevron、无 .bc-eg71-sub 子容器、收起态无 [data-popup="/lora"] 浮窗｜0
- [U2-1] 页内 Tab｜AGENTS.md EG71 Tab 栏契约｜General/Radio/Gateway Fleet 三 tab、flush 贴顶、active 态 2px 下划线｜0
- [U3-1] 面包屑｜壳面包屑契约｜/lora/gateway-fleet 显示 "Gateway Fleet"（连字符分词大写）｜0
- [U4-1] 标题/Alert/工具栏契约｜AGENTS.md 三契约｜沿袭 REQ-023 已验形态，本次未改动相关区块｜0
- [U5-1] 纯净性｜page-assembly §5｜可见 UI 无评审注记/装配痕迹｜0

### DEV

- [D1-1] score_component.py --report｜scoring.md ②｜明细归档 score_component.json｜见脚本分
- [D2-1] 组件映射｜page-assembly §0｜本次未新增业务形态，沿用 REQ-023 映射（壳 + page-tabs + mesh 系列组件）｜0
- [D3-1] 自造类复核｜naming/R2｜无新增类名，变更仅数据（navGroups）与一行兜底逻辑｜0
- [D4-1] 装配完整性｜assembly-integrity §2｜令牌活性断言 --spacing-24=24px；页面零控制台报错/零 pageerror｜0

### TEST

- [T1-1] Tab 切换链｜interaction-completeness §1｜General→Radio→Gateway Fleet 点击路由跳转 + active 高亮正确｜0
- [T2-1] 侧边栏一级导航｜壳契约｜点击 LoRa 一级项落 /lora → General 页（content() 兜底 generalPage）｜0
- [T3-1] 收起态侧边栏｜壳契约｜LoRa 无浮窗菜单（无 children 自动不生成）｜0
- [T4-1] 字段｜PRD 字段表｜本次未改动表单/表格字段｜0
- [T5-1] 边界｜五轴交互｜/lora 直达、/lora/radio、/lora/gateway-fleet 三路由渲染正常｜0

### 落分

- 证据行零扣分：structure/interaction/visual/field 证据反推均为 100，按 scoring.md §0.6 写 90。
- component/structure/field 为脚本分（score_component.py / score_fidelity.py --write 覆盖），写入值同样按 §0.6 钳制 [80,90]；原始分见两个脚本 JSON。

## 三角色验收 · 第二轮（2026-11-13 Fleet 成员表修订）

浏览器实测（Playwright/Chromium，1440×900，file:// 直开，经 MS_FIGMA_EXPORT states 驱动）：

### UED

- [U2-2] Fleet 成员卡｜AGENTS.md 单表格页免标题｜`.bc-eg71-mesh-fleet .ms-card-head` 不存在；操作栏（批量 Delete + 搜索）为白卡第一行贴顶，`--headless` 修饰类生效｜0
- [U3-2] 成员表第一列｜用户裁定 + 组件契约｜表头自左向右 = 勾选 / Relay ID / Name / Status / Last Updated / Operations｜0
- [U4-2] 编辑抽屉表单｜用户裁定｜仅 Relay ID（只读）+ Name（可编辑）两个表单项，GPS/Altitude 行已删；无标题/无多余字段｜0

### DEV

- [D2-2] 组件契约同步｜documentation/versioning｜B_Eg71MeshFleetTable v1.4.0（未发布批次内合并 bump）：列头 Relay ID + drawer-close 事件；registry/SKILL.md/实体契约/demo 四处一致｜0
- [D3-2] 自造类复核｜naming/R2｜仅新增 `bc-eg71-mesh-fleet-body--headless` 结构修饰类（BEM 范式，内联 CSS 就地修正不回写源头）｜0
- [D4-2] 装配完整性｜assembly-integrity §2｜令牌活性断言 --spacing-24=24px；三状态（成员勾选/编辑抽屉/邻居表）零 console error、零 pageerror｜0

### TEST

- [T1-2] 编辑抽屉链｜interaction-completeness §1｜Edit 点击 → 抽屉开（ID 只读 + Name 可编辑 + 规则提示）→ Save/Cancel/蒙版/关闭钮均收起｜0
- [T3-2] 抽屉关闭状态清理｜前批修复项｜关闭后 S.fleet.edit/detail 清空，重复打开不叠加；Edit↔Detail 打开互斥｜0
- [T4-2] 字段｜实体契约｜fleetMember.fields.eui.cn='Relay ID' 与表头一致；Name 校验规则（字母开头/20 字符）保持｜0
- [T5-2] 边界｜五轴交互｜neighbors 视角列头 ID/Name/Last Updated 不受影响；搜索空态表头保留｜0

### 落分（第二轮）

- 第二轮证据行零扣分：structure/interaction/visual/field 反推 100 写 90（§0.6）；component/structure/field 以第二轮脚本 --write 分为准（见 score_component.json / score_fidelity 输出）。

## 三角色验收 · 第三轮（2026-11-13 Radio 对齐线上真机 v2）

基线 = 线上真机 `http://192.168.40.211/lora/radio`（admin 登录，**全程只读**：仅导航 + DOM 取证，未对设备做任何写操作——用户红线）。浏览器实测（Playwright/Chromium，1440×960，file:// 直开，24 项交互检查全过 + 三 Tab 烟测）：

### v2 变更面

- `bc-eg71-mesh-radio` 整组件重写为**四卡组**（v2.0.0，major：ctx 契约 `freqs/title/actionsHtml` → `channels/antenna/lora/fsk/beacon/intervals/crc/custom/errors/advOpen`，事件 `eg71-mesh-radio-toggle` → `ch/sec/check/field/adv` 五族）：Antenna Settings（EIRP Alert + 必填增益 + tip）、Channel Settings（Multi ×8 表 + LoRa/FSK 子区）、Advanced Settings（默认折叠；ClassB/Intervals/Forward CRC 三子区）、Custom Configuration（卡头总闸 + textarea）。
- 页面层：channels 数组化状态、harvest 免重渲染收集、radioDirty JSON 比对驱动 Apply 启停、radioSetField/validateRadio/onRadioApply 全链、导航往返 harvest 保持。
- MS_FIGMA_EXPORT 补 6 个 Radio 状态（默认/频道编辑/子区启用/Advanced 展开校验失败/Custom 启用）。
- SKILL.md v2.0.0 八章节重写（atoms 十原子 + ctx/事件契约）。

### UED

- [U2-3] Radio 四卡结构｜线上真机（只读核对）｜Antenna / Channel（Multi×8 + LoRa + FSK）/ Advanced（ClassB + Intervals + Forward CRC，默认折叠）/ Custom 四卡与线上一致｜0
- [U3-3] 卡片标题形态｜AGENTS.md 标题契约 + 基准范式｜裸卡头走 `ms-card-title`（16px），与 REQ-001~004 基准并存用法一致；无 tag/describe/按钮解剖的标题不触发 B_ComTitle 行｜0
- [U4-3] Alert 位置｜AGENTS.md Alert 位置④｜EIRP info Alert 在 Antenna 卡标题正下方、内容上方，随卡片 padding 缩进｜0
- [U3-5] 表单项标签契约｜AGENTS.md label 契约｜单位 `ms-form-unit` gray-05（dBi/MHz/kHz/Hz/dBm/s/ms）；增益字段带 16px tip 钮（热区 24）；EIRP 长文案走 Alert 与 tipnote，不入 label 行｜0
- [U3-6] 双列布局｜business-specific §5.2｜ClassB 8 项 > 6 走 `ms-grid-2 bc-com-form-grid`；Intervals 3 项、LoRa/FSK 3 项单列（≤6 且含频率宽控件）｜0
- [U5-2] 纯净性｜page-assembly §5｜可见 UI 无评审注记/装配痕迹/校验徽标｜0

### DEV

- [D1-3] score_component.py --report｜scoring.md ②｜component 83（②覆盖 95%·未注册 34 个为 mesh 系列结构类族、③手写函数 9 个为 modal/drawer 基建设施与上轮同集、⑤令牌 69%），明细 score_component.json｜见脚本分
- [D2-3] 组件映射｜page-assembly §0｜`Radio 四卡卡组 → bc-eg71-mesh-radio v2 + ctx(channels/antenna/lora/fsk/beacon/intervals/crc/custom)`；按 SKILL.md §二 契约调用，非仅内联｜0
- [D3-3] 自造类复核｜naming/R2｜新增 `bc-eg71-mesh-radio-*` 结构类族 + `bc-eg71-form-item-tip`（BEM 范式，SKILL.md 契约登记；registry 源头冻结，demo 内联演进）｜0
- [D4-3] 装配完整性｜assembly-integrity §2｜令牌活性断言通过；Radio/General/Fleet 三 Tab 零 console error、零 pageerror｜0
- [D5-1] runtime 偏差｜spacing §7｜未新增偏差清单条目；ico16/按钮 gap 12 沿袭已修正基线｜0

### TEST

- [T1-3] 交互链五段｜interaction-completeness §1｜入口（Tab）→操作（开关/输入/折叠）→反馈（校验错误 + error class）→结果态（Apply 启用→保存 toast→再禁用）→边界（必填清空报错）实测通过（24/24）｜0
- [T2-3] 必备状态集｜§1.1 表单类｜未填默认/校验失败/提交反馈/pristine-禁用四态齐｜0
- [T3-4] 启停状态保持｜business-specific §6.2｜LoRa/FSK/Custom 总闸 off → `--disabled` 灰显 + aria-disabled、值不清空；切页往返 loraFreq 原样保持｜0
- [T4-4] 字段对齐｜线上真机清单｜增益/8 频道/LoRa·FSK（Freq/BW/DR）/Beacon 8 字段/Intervals 3/CRC 3 态/Custom 全量在位；线上空值项补合理默认（Sync Type=GPS、Beacon BW=125000）｜0
- [T5-4] 联动边界｜§1 + 组件契约｜Mesh 视角频段 chips 7 个 = Radio 启用频道（F8 off 正确排除）；Advanced aria 展开/tipnote aria 同步｜0

### 差异核对（interaction-completeness §2.5，本轮「需求」=线上真机，非飞书 PRD 文档）

| 差异点 | 线上形态 | demo 实现 | 归因 |
|---|---|---|---|
| Beacon Time Sync Type / BW 等线上空值下拉 | 无取值展示 | GPS/RTC、125000/500000 合理枚举 | demo 侧补全（不发评论） |
| Advanced 默认折叠 | 折叠 | 折叠一致 | 真源对齐，无差异 |
| 线上 Antd 表单单列 | 单列 | 子区 ≤6 项单列、ClassB >6 双列（business-specific §5.2） | demo 侧契约优先（不发） |

本轮无「需求侧逻辑漏洞」候选（真机为唯一真源，无正文矛盾可引）。

### 落分（第三轮）

- structure/interaction/visual/field 证据行零扣分：反推 100 写 90（§0.6）；component/structure/field 以第三轮脚本 --write 分为准（原始分见两脚本 JSON，写入值按 §0.6 钳制 [80,90]）。

## 三角色验收 · 第三轮 A（2026-11-16 页码条修复 + 编辑抽屉提示删除，与第三轮 B 并行交付）

> 本轮与 mesh-radio v2 轮（第三轮 B）由两个并行会话协作交付：本轮先提交页码条修复与编辑提示删除，B 轮随后基于本轮提交落 mesh 工作。浏览器实测（Playwright/Chromium 1440×900，MS_FIGMA_EXPORT states 驱动 `Fleet · 成员表勾选` / `Fleet · 编辑抽屉`）。

### 缺陷与修复

1. **页码条溢出**：`.bc-eg71-mesh-fleet-size` 未限宽，L2 `.ms-select` 基类 `width:100%`（表单语义）解析成容器全宽 → 整条分页溢出。修复：组件域 `width:auto` 覆写（与 REQ-023 同款，源头已同步）。
2. **‹/› 箭头误挂 active**：`item(n,label)` 对翻页钮也按 `n===cur` 判 active（第 1 页时 ‹ 蓝底）。修复：`label == null && n === cur` 才挂 active（registry 源头同步）。
3. **13px 字号红线**：`.ms-pagination` / `.ms-page-jump input` 13px（spacing §4 全场景禁用）→ 内联改 14px；spacing.md §7 偏差清单已登记（随 REQ-023 轮 90bcd98 入库）。
4. **编辑抽屉 Name 规则提示删除**（用户裁定）：label 行 `(letters, digits, - or _; ...)` span 移除；非法输入的运行时校验错误反馈保留（交互链完整性要求）。

### UED

- [U3-5] 页码条｜spacing §4｜分页与跳页输入 computed 14px，无 13px 残留｜0
- [U4-5] 页码条布局｜组件契约｜刷新+Total+页码窗口（居中）+每页条数+跳页同行，`Fleet · 成员表勾选` 态卡片 scrollWidth−clientWidth = 0（零溢出），select 实宽 105px｜0
- [U4-6] 编辑抽屉 label 行｜用户裁定｜`.bc-eg71-form-item-unit` 计数 0，抽屉字段仅 Relay ID + Name｜0

### DEV

- [D3-5] 自造类复核｜naming/R2｜无新增类名；4 处修复均与 REQ-023 同款且 registry/business.css 源头已同步｜0
- [D4-5] 装配完整性｜assembly-integrity §2｜两态实测零 console error / 零 pageerror｜0

### TEST

- [T1-5] 分页交互｜interaction-completeness §1｜页码点击/翻页/每页条数/跳页链路保持；‹ 第 1 页 `disabled` 且 class 无 active，仅数字项 "1" 高亮（active 唯一）｜0
- [T5-5] 边界｜五轴交互｜首/末页箭头禁用态、当前页高亮唯一；编辑抽屉非法输入仍有校验错误反馈｜0

### 落分（第三轮 A）

- 五维脚本分（对提交版运行）：component 84、structure/field/interaction/visual 100；证据行零扣分。写入值按 §0.6 钳制：100 → 90，component 84 在 [80,90] 区间不动。
