# REQ-016 校验报告 · LoRa Mesh（EG71）

> demo：`05_release/REQ-016/demo.html`（单文件 630 KB，5 路由多角色）
> PRD 源：`source.txt`（飞书 wiki，见 prompt.md）
> 组件映射清单：`04_pages/REQ-016/mapping.md`

## 一、装配完整性自检（assembly-integrity.md §2）

| 检查 | 结果 |
|---|---|
| 首尾 64 字节 diff（tokens / base.css / business.css / registry-base / registry-business / controller） | ✅ 全部一致 |
| `--spacing-24` 令牌存在性 | ✅ |
| `node --check` 全量 JS bundle | ✅ |
| 组件级 smoke（23 项 render 断言 + `[object Object]` 泄漏扫描） | ✅ |

## 二、R1–R5 校验

| 规则 | 结果 | 说明 |
|---|---|---|
| R1 令牌合规 | ✅（见偏差清单） | demo 自有 CSS 全部令牌化；§7 就地修正：ico(*,14)→16 ×37、按钮组 ms-space--8→--12 ×7、.ms-stat-title 13px→12px、.bc-eg71-protocol-card 竖向 padding 12→16、追加 .ms-ico--12 |
| R2 组件溯源 | ✅ | 全部业务形态经已注册 B_*；页面层仅结构类（ms-stack / ms-content--wide / nav 显隐） |
| R2b L3 复用率 | ✅ | 无手写渲染函数绕过 B_*；映射清单 8 组件全部按 SKILL §2 契约以 ctx 调用 |
| R3 依赖闭环 | ✅ | 8 个新铸 L3 的 atoms 序列全部封装于 registry-business.js |
| R4 结构覆盖 | ✅ | 5 路由对应 PRD 5 模块（General / Radio / Fleet / Dashboard / Data Stream）；角色 × 前向类型 × 视图全覆盖 |
| R5 交互链完整性 | ✅（缺口见 §四） | 表单五态（默认/校验失败/提交确认/成功/重置）、列表三态（数据/空/删除确认）、角色切换二次确认、hops 调整提示、Radio 开关 toast 均落地 |
| 纯净性 | ✅ | 可见 UI 无 PRD 注记 / 评审指引 / 装配信息 / 校验徽标 |

### R1 残留说明（不新增偏差清单条目，仅记录）

`library/base.css` 源头存在 `font-size: 13px`（.ms-btn--sm / .ms-input--sm / .ms-table-ops / .ms-empty-text 等），不在 spacing.md §7 偏差清单内，按「内联不回写源头、清单外保持原样」的既有口径随 REQ-013 先例原样内联。建议未来 runtime 统一升级时一并清理。

## 三、实现要点备忘

- **角色模型**：deployment ∈ {lora-mesh, ip, ip-mesh}；角色 5 种；meshcfg 可见 = mesh-master/mesh-relay/ipmesh-master；forward 卡仅 masters（ipmesh-master 强制 embedded 形态）；Relay / 外置 NS Master 隐藏数采四入口（nav 显隐 + 页面仍可直接路由）。
- **保存链路**：harvest（DOM 回读）→ 校验（key 32-hex / hops 1-8 / txPower 0-27 / heartbeat 30-300 仅 Relay / 频段 ≥1 / chirpstack: topic+server+port、凭证勾选时 user+pass、TLS 自签名时根证书必导 / semtech: server+双端口 1700 默认）→ 五向角色切换二次确认弹窗 → 提交（外置 NS 置 Connected）→ toast；Cancel 回滚草稿、Reset 恢复上次保存快照。
- **英文输出**：PRD 中文，demo 按 Figma 站点英文惯例输出（对照字段落 mapping.md；不计缺口）。
- **种子数据**：Relay ID 用 PRD 图例值 24E124FFFE123456；Fleet/帧数据为合理演绎数据；GPS（编辑抽屉只读行）为占位值 24.5012°N / 118.1473°E / 23m。

## 四、交互链缺口（A5，B/C/D 分类）

| # | 功能点 | 类别 | 缺什么 | demo 处理 | 建议 PRD 话术 |
|---|---|---|---|---|---|
| 1 | Mesh 配置截图 | C | 「Master 角色展示配置项」配图 alt 自述为 Relay 界面，图/标题矛盾 | 按字段表实现（表内 Master/Relay 两块字段齐全） | 确认 Master 配置块截图是否放错 |
| 2 | Relay ID 位数 | C | 正文「8 位十六进制」vs 图例 24E124FFFE123456（16 位） | 按图例 16 位值展示 | 明确 Relay ID 位数 |
| 3 | 附录A 频率表 | C | AS923-1 的 F1 与 F8 同为 923.2（AS923-2/3/4 无重复），疑笔误 | EU868 种子演示，未消费 AS923-1 | 确认 F8 频率值 |
| 4 | 跳数调整风险提示 | C | 「预计可用容量」依赖 LoRa 分析页容量数据，未定义无数据/首次使用时默认展示 | 占位容量演算（1 跳 33% / 2 跳 17%）+ PRD 双文案（调大/调小）toast | 补无数据时的默认行为 |
| 5 | Gateway Status 级联网关 | C | PRD：点卡片开抽屉、抽屉内「配置」入口；组件库契约：行 View 开抽屉、卡头 Configuration | 按组件库契约（卡头 Configuration → Gateway Fleet） | 确认入口位置以哪边为准 |
| 6 | 组网方式排序 | D | 选项排序未定义（PRD 表格 IP Connection 在前） | LoRa Mesh / IP / IP & Mesh | 增补排序 |
| 7 | IP Master 下载证书 | D | 证书内容/格式未说明 | 入口 + 下载成功 toast | 增补证书说明 |
| 8 | IP 模式页面构成 | C | IP Master/Agent 下 LoRa General 仅角色提示文案，页面构成未明示 | 演绎为「组网+角色+Alert 提示（Mesh 功能不可用）」 | 明确该形态页面构成 |
| 9 | 设备概况 Add 跳转 | D（小） | 跳转目标（添加设备页）不在本需求范围 | toast 提示不可用 | 明确跳转链路 |

> B 类（链路断）：无——所有功能点链路五态齐。
> 台账回写 + PRD 评论：待用户确认评论清单后执行（A6）。

## 五、组件资产变更（随本 REQ 铸造/扩展）

| 组件 | 版本 | 变更 |
|---|---|---|
| B_Eg71MeshRoleCard / ConfigCard / ForwardCard / FlowDiagram / FleetTable / FrameList / RadioCard / ModuleCard | 1.1.0 | 新铸注册（atoms 序列 + render/bind 契约见各自 SKILL.md） |
| B_Eg71MeshFleetTable | 1.2.0 | editDrawer 增 `info?: [{label,value}]` 只读行（GPS 经纬度/高度） |
| navGroups 唯一源 | — | 新增 LoRa 菜单（General / Radio / Gateway Fleet），提案已批 |
