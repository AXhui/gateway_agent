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
