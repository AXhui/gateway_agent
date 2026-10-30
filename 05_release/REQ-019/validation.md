# REQ-019 校验记录 · EG71 M-Bus（EN 13757）数采支持

- PRD 源：`source.txt`（飞书 wiki CqYjwRIS9ieQPikk3O0ck4mOnOe，正文 2961 行）
- 装配：`demo.html`（单文件，runtime 真源全量内联 + spacing §7 就地修正，构建脚本 `/tmp/build_req019.py`）
- 冒烟：`/tmp/shot_req019.py`——9 个 MS_FIGMA_EXPORT 状态截图 + 结构断言 + 7 条交互链，末次运行 **ALL PASS**（零 pageerror / 零 console.error）

## 一、装配完整性自检（assembly-integrity §2）

- 8 个内联块（tokens / base / business / page.css / registry-base / entities / business / page.js）首尾 64 字节 diff 全 OK（构建脚本内建检查输出 `[OK] 全部内联块首尾 64 字节完整`）。
- 令牌活性断言：`--spacing-24` 计算值非空；`.ms-content` computed padding = 20px（非塌陷初始值）。
- spacing §7 runtime 偏差就地修正清单全部命中（构建断言逐条 assert）：`ico(*,14)→16` ×41、按钮组 `ms-space--8→12` ×7 行（保留标签/筛选/分页 6 处）、`.ms-stat-title`/`.ms-empty-text` 13→12px、`.ms-tabs` gap 32 + 定高 48 + active/hover→text-primary + tab padding 12、补 `.ms-ico--12`、`bc-eg71-protocol-card` 竖向 padding→16。均只落在 demo，不回写 assets 源头。

## 二、组件映射清单核对（page-assembly §0 / D2）

`mapping.md` 13 条 B_* 映射逐一落地，页面层全部经 `MS_BIZ_INDEX[id].render(...)` 契约调用（脚本检出契约调用 31 处）：
壳 MS_EG71_SHELL、bc-eg71-page-tabs、bc-eg71-toolbar、bc-eg71-table、bc-eg71-modal（添加方式选择/停止确认/切型号确认/复制冲突/删除确认/模板删除阻断/部分失败结果 ×7 复用）、bc-eg71-form-item-*（input/select/radio-group）、bc-com-title、bc-eg71-page-back、bc-eg71-protocol-card、bc-eg71-stat、bc-eg71-steps、bc-eg71-scan-edit-drawer 范式（页面层 showDrawer 镜像其开合骨架）。无手写渲染函数绕过已注册形态（R2b 零命中）。

## 三、三角色验收（scoring.md §0.2 → §0.3 证据行）

### UED 清单

| # | 检查项 | 结论 |
|---|---|---|
| U1 | 唯一壳 + 入口 | MS_EG71_SHELL.render/bind 各 2 次；激活导航 "Data Services"，路由 /data-services/data-acquisition 命中 navGroups 既有入口，无私造菜单 |
| U2 | 模块清点 | PRD P0 模块（接入网络/扫描+手动添加/设备管理/对象管理/数据流/设备库/状态概览）全落地，顺序按 PRD 5.1-5.11；P1/P2（导入导出/设备替换/Node-RED/转发）按 mapping.md 范围裁决不进 demo |
| U3 | 视觉基准（三级：无 Figma 稿） | 全量令牌引用；§7 修正后无 13px、图标 ≥16、间距走令牌阶梯；英文操作钮 + 中文字段/校验文案的混排与 PRD 自身惯例一致（PRD 截图 Figma 层为英文钮 Cancel/Rescan/OK/Complete，字段表与错误文案为中文） |
| U4 | EG71 三契约 | 标题：bc-com-title 主标题变体（Device List / Custom Device Library 等）；Tab：bc-eg71-page-tabs 注册组件原生合规（gap 32 / 高 48 / active text-primary+500+2px 下划线）；Alert：PRD 仅定义表内 ⚠ 告警（d1001 已落，文案逐字），无页面级 Alert 场景 |
| U5 | 纯净性 | 可见 UI 全文扫描无 PRD/评审/装配/映射/B_*/REQ-019 字样 |

### DEV 清单

| # | 检查项 | 结论 |
|---|---|---|
| D1 | score_component.py --report | **82 分**（①98 ②89 ③70 ④100 ⑤63），明细 `score_component.json` |
| D2 | 映射清单契约调用 | 31 处注册表 render 调用，13 条映射全命中（见 §二） |
| D3 | 自造类复核 | ① 报的 12 个"自造类"多为 JS 字符串字面量（'false'/'page'/'val' 等）与注册表状态类 is-open；② 报的 41 个未注册类全部为 `bc-req019-*` 页面层纯结构类（布局/显隐），page-assembly §6 允许，无越界视觉常量 |
| D4 | 装配完整性 | 见 §一，64B diff ×8 OK + 令牌活性 OK |
| D5 | §7 偏差修正 | 见 §一，全部命中且构建断言防回归 |

### TEST 清单

| # | 检查项 | 结论 |
|---|---|---|
| T1 | 交互链五段 ×7 链 | ① 扫描向导全流程（方式选择→掩码默认全选→进度→中途停止确认→步骤二分组/面板→改名→取消勾选→确认→部分失败结果弹窗→回列表计数 1,998 台）② 设备编辑（必填校验→切型号确认弹窗→保存 toast）③ 对象扫描（进度≥2s→结果抽屉→确认添加行数增长）④ 复制对象（无同型号→抽屉；同型号→冲突弹窗）⑤ 网络编辑（波特率 9600 联动默认 10/700；重试 99→失焦错误文案「请输入有效值，范围：0 到 10。」）⑥ 数据流查看 + Esc 关抽屉 ⑦ 设备库引用中模板删除阻断（弹窗含"引用"）+ 删除确认 + 手动向导（空提交≥2 错误→模板对象选择→完成） |
| T2 | 必备状态集 | loading：扫描/添加进度弹窗（进度条）；empty：d1003 对象页 ms-empty（暂无对象…）、数据流/设备库 ms-empty；确认：删除/停止/切型号/复制冲突/模板删除阻断；成功反馈：toast 保存成功 |
| T3 | 状态保持与回滚 | 对象页 5 个启用开关 True→关→开，勾选态与值保持；启停无失败分支（PRD 未定义回滚场景，demo 不发明） |
| T4 | 字段逐项 vs PRD 字段表 | 设备列表 9 列逐字对齐 PRD 表（设备名称/设备型号/协议类型「M-Bus / 网络名」/状态三值+⚠/对象数量可点/最新更新时间/信号统一"-"（PRD 明文）/操作）；名称 hover 展示名称+标识符（Heat Meter 01/标识符：4900035…）；非 None 型号点击→设备库配置；手动向导寻址方式单选（一次/二次，联动 label 与 placeholder 1-250/16 位十六进制）；波特率四档联动默认值对齐 PRD（1200:75/3800 …9600:10/700） |
| T5 | 边界值 | 重试 99 越界拦截；M-Bus 配额 250（基线 249+扫描 1 台恰达上限，链 7 真实删除 d1003 释放后再走手动添加）；VIB 坏行勾选禁用 ×1；DIB+VIB 重复记录位置失焦拦截；扫描部分失败（地址分配失败）结果弹窗列明失败设备 |

### 证据行（扣分依据，scoring.md §0.3 格式）

- [U3-1] 对象页空态文案｜page-assembly §5 产品文案（非违规项备忘）｜「暂无对象，点击 Add 或 Scan to add 添加」中英混排略生硬，与另两处空态（暂无数据/暂无模板）风格不一｜建议扣分 0（无条款命中，仅文案备忘）
- [D1-1] score_component.py｜scoring.md §4② ③⑤｜脚本分 82：③ 疑似手写函数 19 个（实为页面层编排 helper，均内部调 B_*，R2b 零命中）⑤ 令牌占比 69%（裸值多为内联库 CSS 固有 px 与 SVG path 数据）｜脚本分即 component 维分
- [T1-1] PRD 5.6 即时读取值（获取值）｜interaction-completeness §1｜对象操作列"获取值"入口已落（obj-get），冒烟未单测即时读值反馈链｜建议扣分 0（链已实现，仅未入冒烟断言；T4 抽查对象表值列正常渲染）

## 四、五维落分（真实性校验基础）

- structure / field / component：由 `score_fidelity.py --write` / `score_component.py --write` 脚本分覆盖（AGENTS.md 第 4/4b 步），证据为对应 json 报告。
- interaction：TEST 走查零实扣（T1-1 为备忘非扣分）→ 100。
- visual：UED 走查零条款命中扣分（U3-1 为文案备忘）→ 100。
- 真实性校验：quality.json 落盘后逐维反推——interaction/visual 可由上方证据行反推（零扣分行），三脚本维以 json 报告为准。

## 五、交互链缺口（A5，interaction-completeness §2）

- 模块级：PRD P1/P2 项（设备导入导出、设备替换、Node-RED 节点、四通道转发、Class 1 告警采集、地址冲突主动修复、网关替换）不进本 demo——mapping.md 范围裁决（D 类范围外，demo 按 P0 交付）。类別：D（不实现，PRD 分期明确）。
- 状态级：PRD 未写加载/空/确认态处均按 §1.2 用库组件补全（B 类已补全，清单见 mapping.md「补全标注」列，不进可见 UI）。

## 六、差异核对（§2.5，评论过滤门）

| 功能点 | PRD 写了什么 | demo 实现了什么 | 差异归因 |
|---|---|---|---|
| 扫描设备名厂商段 | 正文 5.3.3「厂商名称」vs changelog 2026-8-20「厂商名称改成厂商代码」 | 按厂商代码（Vendor ID 缩短形态）生成 | **需求侧逻辑漏洞候选 C2**（正文未随 changelog 同步，两处不一致） |
| 设备名称长度上限 | Figma 弹窗截图 64 vs 字段表 127 | 按 127（字段表为权威） | **需求侧逻辑漏洞候选 C2**（图例与表冲突） |
| 记录位置上限 | 规则正文「1 到 250」vs changelog 2026-8-18 更正「1~255」 | 按 255（changelog 更正后） | **需求侧逻辑漏洞候选 C2**（正文未随更正同步） |
| 信号列 | PRD 明文「统一显示 -」 | 全列 "-" | demo 侧按 PRD（非差异） |
| 界面语言 | Figma 层英文按钮 + 字段表中文 | 英文操作钮 + 中文字段/校验 | demo 侧 UI 细节（与 PRD 自身惯例一致，不发） |
| 扫描停止语义 | 「可中途停止」→ 步骤二 | 停止确认后进步骤二（已发现设备可用） | demo 侧 UI 细节（PRD 未写停止后去向属 B 类补全，非逻辑断头） |

结论：**逻辑漏洞候选 3 条**（上表前三行，均带可拍板方案），待用户确认是否发 PRD 锚定评论；其余差异均归 demo 侧 UI 细节，只落本表不发。

## 七、旧形态 × 新规则核验（page-assembly §0 第 5 条）

本 REQ 为该 PRD 首次交付（无旧 REQ 基线）；对照当前 AGENTS.md 契约逐条走：唯一壳 ✓、表格左对齐（bc-num/bc-eg71-table-ops）✓、工具栏置顶（标题行+操作栏+分隔线贴卡顶）✓、Tab 契约（page-tabs 组件原生）✓、标题契约（bc-com-title 两变体）✓、动词闭环 13 动词全扫描（mapping.md 清单）✓。
