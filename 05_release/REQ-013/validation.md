# REQ-013 · EG71 M-Bus 数据转发 — A5 校验报告

> demo：`05_release/REQ-013/demo.html`（单文件，367KB，全量内联）
> 范围：PRD（【EG71】AI测试，2026-8-25 版）5.8 数据转发；5.9 Node-RED / 5.6 引擎逻辑不入（见 mapping.md 头注）。
> 校验时间：2026-09-30（首轮交付）；2026-09-30 复验（Alert 位置 / Tab 栏两条新契约驱动调整，见 §三.5）。

## 一、R1–R5 五维结果

| 规则 | 结果 | 证据 |
|---|---|---|
| **R1 令牌合规** | ✅ 通过 | 无裸色值；间距/字号/图标尺寸均落 spacing.md 阶梯；§7 偏差就地修正：ico(*,14)→16（37 处）、按钮组 ms-space--8→--12（7 处）、.ms-stat-title 13→12、bc-eg71-protocol-card padding 12→16，未回写 assets 源头；复验追加：`.ms-tabs` 偏差修正（gap 24→32 / 高 38→48 / active+hover 文字 primary→text-primary，AGENTS.md Tab 栏契约 runtime 偏差条） |
| **R2 组件溯源** | ✅ 通过 | 全部 class 落 `bc-eg71-*` / `ms-*` / demo 结构前缀 `req013-*`；无手写 `<svg>`（图标全经 S_Icon/MS_ICONS）；标题经 S_Typography 阶梯（ms-h2） |
| **R2b L3 复用率** | ✅ 通过 | 删除确认走 `B_Eg71Modal`（render+bind 按 SKILL §2 契约，desc 用 PRD 原话「您确认要删除所选的对象吗？」）；无手搓 ConfirmHtml；壳走 `MS_EG71_SHELL`，navGroups 零改动 |
| **R3 依赖闭环** | ✅ 通过 | demo 消费的 L3（bc-eg71-modal / bc-eg71-form-item-* / bc-eg71-subarea / bc-eg71-table 结构类）其 atoms 均为已注册 S_*，无越级引用 |
| **R4 结构覆盖** | ✅ 通过 | 4 服务页签（MQTT/HTTP/BACnet Server/Modbus Server）、列集按 mapping.md §二逐列落地、全局对象子区（HTTP/MQTT）、空态、批量操作、编辑抽屉（BACnet/Modbus）全覆盖 |
| **R5 交互链完整性** | ✅ 通过（含 1 B / 1 C / 1 D 缺口，见 §二） | 五态齐：数据态 / 空态 / 危险确认 / 操作反馈 / 边界（String 1–121、编号复用、重复添加拦截） |
| **纯净性** | ✅ 通过 | 可见 UI 无 PRD 注记、无映射清单、无校验徽标；「已添加」为产品语义标签非过程标注 |

## 二、交互链缺口（A5 逐功能点）

| 功能点 | 类别 | 缺什么 | demo 处理 | 建议给 PRD 的话术 |
|---|---|---|---|---|
| 添加对象 | **B 链路断** | PRD 未写保存后反馈 | 已补全：toast「已添加 X 个对象，转发立即生效」；重复添加置灰拦截（已添加行 disabled + 「已添加」tag） | 建议补充保存后反馈与重复添加的拦截规则 |
| 批量导出 | **C 待澄清** | PRD 只写「导出 xlsx」，未写文件结构 | 按字面实现，toast 演绎；导出列结构留 issue | 需澄清导出文件结构（列集/文件名/多服务是否分 sheet） |
| 全局对象切换失败态 | **D 隐含缺失** | PRD 未定义切换失败的业务去向 | 小缺口：仅演示成功态 toast；失败回滚未实现 | 建议 PRD 增补切换失败回滚策略 |
| Modbus String 数量 1–121 | **A 完整** | — | showCount + 边界演绎（Float 固定 2 禁用，String 可改带实时提示） | — |
| BACnet/Modbus 编号分配 | **A 完整** | — | 自动分配、删除后释放复用（freeInst 演绎） | — |

## 三、本 demo 生产过程中发现并修复的缺陷（不外溢）

1. **tokens.css 装配截断（本 REQ，已修复）**：内联时丢失 tokens.css 首行注释开头 `/* ====…`，残留 `*/` 把 `:root{…}` 粘成非法规则，解析器丢弃整块 → 全部 CSS 变量失效（gap/padding 塌陷、svg 300×300）。修复：补回首行注释。几何复核：`--spacing-24` 计算值 24px、页签 pad 8px、nav 高 40。
2. **`.ms-ico--12` 无 base.css 规则**：base.css 图标阶梯为 14/16/20/24/32，面包屑 chevron 用的 `ms-ico--12` 未受约束导致 svg 300×300。修复：demo 内 `.ms-ico--12{width:12px;height:12px}`（spacing.md §3 允许装饰性微标 12px）。
3. **视觉终审两轮全绿**：主页面（页签间距均匀/侧边栏无挤压/表格对齐/面包屑小箭头）+ 抽屉（遮罩布局/树层级/已添加置灰/底部按钮禁用态）均经视觉模型复核通过。
4. **批量操作位置返工（用户指出）**：首版把「批量导出 / 批量删除」放在底部 `bc-table-foot`（误用 `bc-data-table` 通用表尾形态）。正确形态 = EG71 一律**表格顶部** `ms-table-toolbar`（T9 / `bc-eg71-device-list` 范式：filled 新增在前 → 次操作 → danger 批量删除随勾选启停；表尾只放计数）。已返工并复验：按钮序/种类/禁用态、按钮间距 12/12、工具栏紧邻表头上方、表尾 0 按钮、勾选启停、删除确认、空态禁用全过。同族规则收紧：K_patterns/list.md T9 已消除「两线并存」歧义。
5. **Alert 位置 / Tab 栏契约驱动调整（2026-09-30，Figma 业务组件库「.Alert 警告提示」+「Tabs/Top」两条新硬性契约落 AGENTS.md 后复验）**：
   - **Tab 栏规格**：`.ms-tabs` 按 Tabs/Top 契约就地修正——gap `--spacing-3xl`(32)、容器定高 `--spacing-5xl`(48) 垂直居中（tab 项 `align-self:stretch + inline-flex` 保下划线贴底）、active/hover 文字改 `--color-text-primary`（选中态仅下划线保留 `--color-primary-normal`）、未选中 Regular + `--color-text-secondary` 不变。
   - **Alert 位置③**：当前服务机制说明（`svc().desc`）从「只在添加抽屉内」升格为 Tab 栏与内容之间**右列通栏**提示——`req013-strip` 结构类负 margin 拉通（20px / 760 断点 16px 联动）、方角、去三边框仅留底部分隔线（`--color-divider-base-2` 与 Tab 栏同源）、文字左起 20px 与 Tab 项对齐、`margin-top:-16` 抵页面 gap 贴 Tab 栏下沿。作用范围=当前 Tab（只影响本服务），符合契约「范围判断」：不上②（非全 Tab 共享）、不进卡片（非单卡范围）。
   - **内容区对齐**：`.ms-content` 页面级覆写 `--spacing-20`（列表类页面，壳契约 3），Tab 左起 20 与内容区严格对齐。
   - 添加/编辑抽屉 body 顶部 info alert 保留（表单级，④ 的精神）；toast（右下角）不变，符合契约「持久性」条。

## 四、跨 REQ 存量问题（不在本 demo 修，建议立项）

1. **REQ-011 存在同类装配截断**：其 demo 丢失 `<style>` 开标签（与本 REQ tokens 截断同族）。建议装配自检规则（见交付说明）落地后回扫 REQ-001~012。
2. **REQ-011 未执行 spacing §7 偏差修正**：ico(*,14) 与 ms-space--8 存量未按红线就地修正（当时清单尚未生效）。
3. **REQ-011 表格存在 `ms-table-num`**：违反 EG71 左对齐契约（应 `bc-num`），2026-09-15 已修 bc-eg71-alarm / bc-eg71-device-list，但 REQ-011 demo 内可能仍有残留，建议回扫。

## 五、结论

R1–R5 + 纯净性全过；B 类缺口已补全，C/D 类已记 issue 待 A6 回流 PRD。**demo 达到交付标准。**
