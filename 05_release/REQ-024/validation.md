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
