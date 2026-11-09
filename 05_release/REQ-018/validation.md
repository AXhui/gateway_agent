# REQ-018 · EG71 M-Bus 数据转发（四通道）— 验收记录

- PRD：飞书 wiki `CqYjwRIS9ieQPikk3O0ck4mOnO`（【EG71】AI测试需求 §5.8 数据转发，source.txt）
- 视觉真源：无 Figma 专属稿——基准分级取二级（PRD 5.8 字段/流程描述 + PRD 内站点参考截图）+ 三级（组件 SKILL 契约 + tokens + spacing 红线）
- 产物：`05_release/REQ-018/demo.html`（单文件，4 独立 script 块 + 内联 tokens/base/business/page-css）
- 主题：MQTT / HTTP / BACnet Server / Modbus Server 四通道 M-Bus 对象接入（同一 PRD 已交付 REQ-011/014/015，本次差异化 5.8）
- 路由：`/data-services/data-forwarding`（navGroups 既有入口，未改菜单）

## 一、三角色验收（scoring.md §0）

### UED 走查

| # | 证据 |
|---|---|
| [U1-1] | 唯一壳：`MS_EG71_SHELL.render+bind` 各 2 次（score_component.json ④=100）；route 命中 navGroups 既有 Data Forwarding 入口，无私加菜单；两级视图（服务列表 / 对象列表）均为列表页单卡形态（`.ms-content--wide` + 单 `ms-card`），卡片内不套卡（空态已用 `emptyHtml()` 抽出 `.ms-empty` 规避 bc-empty 包卡）。零扣分 |
| [U2-1] | 模块清点（对 mapping.md）：服务列表（四通道行 + Object Count 下钻 + 操作列 + 详情）/ 对象列表（page-back + com-title+tag + 工具栏 + 列差异表格 + 表尾批量栏）/ 添加对象抽屉（设备树 + 无对象设备置灰 + 已选计数底栏）/ 编辑对象抽屉（BACnet / Modbus 联动表单）/ 删除二次确认 / 批量导出 toast / hover 双层信息卡——全部落地、顺序一致。零扣分 |
| [U3-1] | 视觉基准（三级：组件契约 + 红线）：9 状态截图目检（服务列表 / MQTT·BACnet 对象列表 / 空态 / 添加抽屉 / Modbus 编辑抽屉 / 删除弹窗 / 详情抽屉 / 校验错误态）——标题行 B_ComTitle 主变体 + 轻量 Tag、表格左对齐（EG71 契约）、图标全 16+（chevronRight 12 为 §3 装饰性微标豁免且补 `.ms-ico--12` 规则）、13px 清零（.ms-stat-title 与 .ms-empty-text 均 13→12 就地修正）。零扣分 |
| [U3-2] | 壳侧边栏菜单标签 51 个仍为 13px（base.css/.bc-eg71-sidenav 存量）：冻结壳资产 + §7 清单未列，REQ-013/016/017 均保留同判例，待 runtime 统一升级清除。建议扣分 −4 |
| [U4-1] | 三契约：标题契约 ✓（对象列表页 B_ComTitle 主变体 16/500 + tag + inline describe，操作钮独立 gap 12）；Tab 栏契约不适用（本页无页签——数据转发为单层管理页，非 Tab 分区场景）；Alert 契约不适用（本页无全局提示场景，操作反馈走 toast / 弹窗）。零扣分 |
| [U5-1] | 纯净性：可见 UI 无 PRD 注记 / 交互评审指引 / 装配痕迹 / 校验徽标（9 状态截图目检）。零扣分 |

**UED 结论：visual = 100 − 4 = 96；structure 走查零扣分（脚本权威 100）**

### DEV 走查

| # | 证据 |
|---|---|
| [D1-1] | `score_component.py --report` → **component 84**，明细归档 `score_component.json`：①98（"自造类" 11 个均为 JS 字符串/标识符误报 cr/cur/fileType/last/on/page/tab/tool/val/version，无真实越界 class）②95（bc-eg71-fw-\* 19 个页面层结构类，mapping.md 已按报备范式登记）③70（"疑似手写函数" 19 个均为页面抽屉内容编排 editDrawerHtml/renderAddDrawer/addDrawerObjRow 等；删除确认/二次弹窗全走 `renderEg71Modal` 契约，R2b 一票否决项为零——脚本函数名启发式近似，见 D2）④100 ⑤63（令牌 69%；裸 px 687 绝大多数为内联 runtime 源文件固有值——tokens/base/business 整库内联口径，REQ-017 D1 同款豁免；页面层新增样式 page-css 全 L1 token） |
| [D2-1] | 映射清单核对：mapping.md 13 个 B_\* 映射全部按 SKILL 契约 ctx 调用（shell/toolbar×2/data-table/com-title/page-back/protocol-detail/modal×2/form-item-select/input/message/tag/ms-empty），bind 全挂（eg71-toolbar-action / eg71-page-back / eg71-message-show 事件驱动）；R2b 对照：弹窗形态零手搓。零扣分 |
| [D3-1] | 自造类复核：页面代码仅 `bc-eg71-fw-*` 结构类族（19 个，布局/显隐/hover-tip，视觉值全 L1 令牌）+ 复用 ms-\* 原子；无既非 ms-\* 又非 bc-\* 又非 token 引用的样式值。零扣分 |
| [D4-1] | 装配完整性：内联块首尾 64 字节 diff 全 OK（tokens/base/business/page-css + 3 registry + page-js 共 8 块，build 脚本断言）；令牌活性断言 PASS（pre-compaction 浏览器探针）；10 状态渲染零 pageerror。零扣分 |
| [D5-1] | spacing §7 偏差就地修正清单执行：ico 14→16 ×41（chevronRight 12 豁免 + `.ms-ico--12` 补规则）；ms-space--8→12 ×7（按钮组 7 行，标签/筛选/分页 6 处保留）；.ms-stat-title 13→12；.ms-empty-text 13→12（**新发现偏差，已回填 spacing.md §7 清单**）；.bc-eg71-protocol-card 竖向 padding→16；ms-tabs gap 24→32 + 定高 48 + active/hover 文字→text-primary + ms-tab padding 8→12（Tab 契约）。全部只落 demo 副本、不回写 assets。零扣分 |

**DEV 结论：component = 84（脚本权威）**

### TEST 走查

| # | 证据 |
|---|---|
| [T1-1] | 服务列表链：四通道行渲染（MQTT/HTTP ThingsBoard/BACnet/Modbus）→ Object Count 下钻 → 对象列表（列差异：HTTP/MQTT=对象名/ID/关联对象；BACnet=+对象类型/实例编号/单位；Modbus=+寄存器类型/数据格式/数目/地址）→ page-back 返回。全通。零扣分 |
| [T1-2] | 添加对象链：`+ 添加` → 抽屉设备树 → 无对象设备 MB-104 置灰 + info 图标 + PRD 原文提示「设备下没有对象，请先到【设备数采】菜单添加对象后，再操作」→ 勾选对象（已在本服务对象 checked+disabled 锁定）→ 已选 N/M 底栏计数 → 保存 → toast + 列表刷新 + 编号分配。全通。零扣分 |
| [T1-3] | 编辑对象链（仅 BACnet/Modbus 行）：Modbus 寄存器类型 Input↔Holding ↔ 数据格式联动（Input 18 项定长 1/2/4；Holding=String 默认 64 可改）+ 寄存器地址可编辑；BACnet 类型（Analog-Input/CharacterString-Value）→ 实例编号建议（分组从 0 递增）→ 保存即生效。全通（级联截图走查一致）。零扣分 |
| [T1-4] | 删除链：行内删除 / 批量删除 → B_Eg71Modal 二次确认「您确认要删除所选的对象吗？」okText「删除」→ 确认 → toast + 行移除 + 实例编号/寄存器地址**释放并优先复用**（重新添加优先占用 POOL 空号，引擎断言通过）。全通。零扣分 |
| [T2-1] | 必备状态集：列表（空态 ms-empty「暂无转发对象」/ 数据态 / 危险确认 ✓）；表单（未填默认 / 校验失败红字「对象名称为必填项。」/ 保存成功反馈 ✓）；操作按钮（批量导出/删除 `disabled:selCount===0` 原生 disabled 联动 ✓）；数据同步（保存/删除/导出 toast，error 持久不自动消失）。全齐。零扣分 |
| [T3-1] | 状态保持与回滚：无对象设备置灰（opacity 0.45 + 值保持原样，非清空）；添加抽屉重开勾选状态按服务重算不残留跨服务污染（member 级覆盖修正后）；删除释放编号不影响其余行既有编号。全通。零扣分 |
| [T4-1] | 字段核对：四服务清单与 PRD 5.8 一致（含 MQTT Broker tcp://broker.emqx.io:1883 / QoS 1 / 发布主题 mbus/eg71/+/data）；BACnet 字段四项 / Modbus 字段四项全对；详情抽屉失败处理四态（HTTP 失败数据丢失 / MQTT 缓存重传 / BACnet·Modbus 等待 Client 重查）；Error Notification 4 条（一次地址冲突/二次地址冲突/采集失败/数据帧异常）全齐。全对 PRD。零扣分 |
| [T5-1] | 边界：空态文案与引导、必填校验红字不自动消失、hover 信息卡 `tabindex=0`+`:focus` 键盘可达（设备名称→设备名称/ID/型号；M-Bus 对象→名称/DIB/VIB；非 M-Bus 对象无 DIB/VIB 行）、Esc 全链关闭（页面层抽屉/详情/弹窗 + runtime B_* 自带，document.contains 守卫）。全通。零扣分 |

**TEST 结论：interaction 零扣分 = 100；field 走查零扣分（脚本权威 100）**

### 真实性校验（§0.4）

structure 100 = 脚本分（score_fidelity.json：统一壳/骨架 5/5/装配 270 调用点），U1/U2 零扣分行 ✓；component 84 = 脚本分（D1，score_component.json）✓；interaction 100 = 100 − 0（T1–T5 零扣分行）✓；visual 96 = 100 − 4（U3-2 壳侧边栏 13px，REQ-013/016/017 同判例）✓；field 100 = 脚本分（score_fidelity.json：实体 30 key/装配 76 点/静态校验全满分），T4 零扣分 ✓。综合 = 0.2×100 + 0.2×84 + 0.25×100 + 0.2×96 + 0.15×100 = **96.0 ≥ 80 门槛** ✓

## 二、交互链缺口（A5，interaction-completeness §2）

| # | 功能点 | 类别 | 缺口 | demo 处理 | 差异归因（§2.5） |
|---|---|---|---|---|---|
| 1 | 批量导出 xlsx 内容形态 | D | PRD「批量导出 xlsx 增加 M-Bus 对象信息」未列具体列清单 | toast 反馈导出动作（内容形态 PRD 未细化） | demo 侧 UI 细节（不发） |
| 2 | loading/error/empty/确认 | — | 无缺口（B 类全补全：空态/危险确认/校验失败/批量 disabled） | — | — |

### 差异核对表（§2.5）

| 功能点 | PRD 写了什么 | demo 实现了什么 | 归因 |
|---|---|---|---|
| 批量删除按钮文案 | 未定义；PRD 内站点参考截图为 "Delete" | 「删除」（对齐站点参考） | demo 侧 UI 细节 |
| 添加/编辑/删除/导出 | 「均复用现有网关逻辑」 | 按 REQ-001~004 既有网关范式（工具栏+抽屉+弹窗） | demo 侧 UI 细节 |
| 导出内容 | 「增加 M-Bus 对象信息」一句 | toast 占位反馈 | demo 侧最小默认（占位） |

**结论：无 C2 / D 大缺口，不发 PRD 评论；台账记 D-1 一行（demo 侧 UI 细节，评论状态「不发-非逻辑漏洞」）。**

## 三、过程记录

- 装配 4 独立 `<script>` 块（base/entities/business/page）+ 独立 page-css——score_component 按「资产块 vs 页面块」分类依赖块边界（REQ-017 同款教训）。
- **新发现 runtime 偏差**：`.ms-empty-text` 13px（spacing §4 字号红线）——已按 §7 范式 demo 内就地修正 13→12 并回填偏差清单（本 REQ 唯一回填项）。
- 空态卡中卡规避：bc-empty 包 ms-card，对象列表空态改用 `emptyHtml()` 直出 `.ms-empty`（REQ-015 同款范式）。
- 编号分配-释放-复用引擎（BACnet inst 按类型分组 / Modbus addr 按寄存器组）：页面状态机承载，POOL 复用经功能断言验证。
- 视觉走查 9 状态截图（含 sips 重编码重传 1 次）全过；「虚线下划线」为 hover 信息卡有意 affordance非缺陷；删除弹窗遮罩 rgba(0,0,0,0.4) 为 `--surface-mask` 库标准值。
