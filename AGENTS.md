# AGENTS.md — AI 协作规范

本文件由 Codex / Claude Code / Cursor 等 AI 编程工具自动读取。

## 读取飞书 PRD/需求文档：用拉取工具，不要用网页抓取

当用户给的是飞书链接（`/wiki/`、`/docx/`、`/docs/`），**不要用 webReader/网页抓取**——飞书需要登录，那样只能拿到登录页。改用项目自带工具（复用本机已登录的 lark-cli）：

```bash
python tools/fetch_feishu_doc.py "<飞书链接>" --out prd.md
```

然后读取 `prd.md` 作为需求正文。若工具报未登录或无权限，再请用户粘贴正文或导出文件。

## 同步机制说明（零配置，不依赖 git 钩子）

本项目的飞书同步**不依赖 git 钩子**：`tools/sync_demo_to_feishu.py` 已内置团队 Webhook 配置，任何机器 clone 下来直接运行即可同步（只需 Python 3，无需环境变量、无需 lark-cli）。

- 已配置钩子的电脑（`git config core.hooksPath` 输出 `.githooks`）：commit 后 post-commit 钩子会自动同步（含 NAS 备份 + 飞书云空间上传）。
- 未配置钩子的电脑（新人默认情况）：按下面「核心规则」第 3 步，直接用同步脚本同步表格记录，然后照常提交即可。
- **不要运行 setup 脚本的交互模式**（它包含 Read-Host 提问，会阻塞等待输入）；本方案已不需要它。

## 核心规则：生成 demo 后必须自动提交

每当你生成或修改了 `05_release/**/demo.html`，按以下步骤自动执行（**不要询问用户**）：

1. **保存原始提示词（硬性要求，缺失则无法提交）**：把用户本次的需求原话，原样写入该 demo 同目录的 `prompt.md`
   （路径如 `05_release/REQ-001/prompt.md`）；只保留本次这一条，用用户原话、不要概括或改写。
   必须把它和 demo.html 一起 `git add`——pre-commit 钩子会检查，缺 prompt.md 会中止提交。
2. **质量自评 + 产品分类**：对照需求/基准，按 5 个维度各打一个 0-100 的整数分，并判断产品分类，写入该 demo 同目录的 `quality.json`
   （和 demo.html 一起 `git add`）。格式严格如下：

```json
{
  "structure": 90,
  "component": 85,
  "interaction": 80,
  "visual": 88,
  "field": 92,
  "category": "网关",
  "reason": "结构还原度 90：路由与页面骨架完整，但确认弹窗缺一层引导；组件还原度 85：2 处页面私有类未走组件库；交互还原度 80：表格行内编辑缺少防抖；视觉还原度 88：主色与间距接近基准，表格行距略有偏差；字段还原度 92：表单字段与 PRD 一致，仅缺校验提示文案。"
}
```

   - structure=结构还原度、component=组件类型还原度、interaction=交互逻辑还原度、visual=视觉还原度、field=字段还原度
   - category=产品分类，必须是以下六个之一：**云平台 / CCTV / CV / 网关 / 路由器 / uink**
   - reason=AI 对该 demo 的**简单自评文字**（必填）：用 2~5 句话说明每个维度为什么是这个分数（扣分点/亮点），供 UED 复核时快速理解打分依据；按实际表现客观写，不要只写"良好/优秀"这类空话
   - 根据需求内容和产品名称判断：提到"云平台"、"Cloud"、"平台管理"选「云平台」；提到"CCTV"、"监控"、"摄像头"选「CCTV」；提到"CV"、"计算机视觉"、"AI识别"选「CV」；提到"网关"、"Gateway"、"楼宇网关"选「网关」；提到"路由器"、"Router"选「路由器」；提到"uink"、"Ulink"选「uink」
   - 按实际表现客观打分，不要一律给高分；这是给 UED 复核的初评分，UED 会修正。
3. **组件分自动校准（硬性，--write 覆盖自评分）**：自评写入 quality.json 后，必须运行组件打分脚本校准 `component` 分：
   ```bash
   python tools/score_component.py --demo 05_release/REQ-XXX/demo.html --write
   ```
   脚本按 5 条规则自动算分（①组件库命中率 20% ②注册表覆盖 20% ③契约调用 25% ④壳契约 15% ⑤设计令牌 20%），并把 `component` 覆盖为脚本分（其余 4 维仍为自评）。若与自评分差异大，说明组件实现与规则不符，先修复 demo 再同步；不要跳过本步直接同步。
3b. **结构/字段分自动校准（硬性，--write 覆盖自评分）**：继续运行结构/字段打分脚本校准 `structure` 与 `field` 分：
   ```bash
   python tools/score_fidelity.py --demo 05_release/REQ-XXX/demo.html --write
   ```
   脚本按 6 条子规则自动算分（字段：①实体定义完整 40% ②装配活跃度 35% ③静态字段校验 25%；结构：①统一壳 35% ②骨架完整 35% ③装配健康 30%），并把 `structure`、`field` 覆盖为脚本分（`component`/`interaction`/`visual` 不动）。若与自评分差异大，说明结构/字段实现与规则不符，先修复 demo 再同步；不要跳过本步直接同步。
3. **同步到飞书（二选一，禁止重复同步）**：

   - **质量门槛（硬性）**：综合还原度（按结构0.2+组件0.2+交互0.25+视觉0.2+字段0.15 加权）**低于 80 分不得同步到飞书多维表格**，脚本会自动拦截并提示修复；先修复 demo 使综合分 ≥80 再重新同步。5 维分数不齐全时跳过门槛检查（等 UED 打分）。
   - **方式一：未配置钩子（新人默认，推荐）**。若 `git config core.hooksPath` 输出**不是** `.githooks`，用下面命令直接同步（脚本已内置 Webhook，零配置）：

   ```bash
   python tools/sync_demo_to_feishu.py \
     --name "REQ-XXX · <简短描述>" \
     --description "<commit 描述>" \
     --preview-url "\\192.168.5.50\公共临时文件夹（每季度定期清空）\chenwk\UI_demo\05_release\REQ-XXX\demo.html" \
     --generator "$(git config user.name)" \
     --version "01" \
     --source "Agent 生成" \
     --action-type "新建" \
     --prompt "$(cat 05_release/REQ-XXX/prompt.md)" \
     --quality-file "05_release/REQ-XXX/quality.json" \
     --req-id "REQ-XXX" \
     --category "<云平台/CCTV/CV/网关/路由器/uink 之一>" \
     --status "已生成"
   ```

   - **方式二：已配置钩子**。若 `git config core.hooksPath` 输出是 `.githooks`，直接执行第 4 步提交即可，post-commit 钩子会自动同步（**不要再手动调脚本**，避免重复记录）。
   - 参数填写规则：`--version` = 该需求第几次生成就是第几版，两位数补零（01、02…）；首次生成 `--action-type 新建`，再次修改 `--action-type 更新`；`--duration` 可选（生成耗时分钟数）；`--generator` 从 `git config user.name` 读取（显示为飞书「生成人」）。
   - 预览 URL：未配置钩子时 demo 不会自动上传飞书云空间，上面的 UNC 路径仅作记录占位；若本机装有 lark-cli 且已登录，可自行上传后填入真实云空间链接。
   - 同步成功标志：脚本输出 `[同步成功] HTTP 200`。若输出 `[同步失败]`，把错误信息告知用户，**不要跳过同步**。

4. **提交**：

```bash
git add .
git commit -m "feat: 生成 <需求编号> <简短描述> demo"
```

直接执行。已配置钩子时，提交后钩子会自动把 demo 复制到 NAS 并同步飞书；未配置钩子时，同步已在第 3 步完成，提交仅用于保存代码。

## Demo 生成规范

1. 输出路径：`05_release/REQ-XXX/demo.html`（XXX 为需求编号，如 REQ-001）
2. 必须是**单文件 HTML**，所有 CSS/JS 内联，不依赖外部资源
3. **必须使用组件库（硬性要求，缺失则无法提交）**：所有样式必须基于组件库生成，禁止自写一套样式。
   - 组件库真源：`library/base.css`（基础样式）、`library/business.css`（业务组件，class 前缀 `bc-`）、`.claude/tokens/tokens.css`（设计令牌）
   - demo.html 中必须使用组件库的 class（如 `bc-*` 业务组件类），样式内联时必须包含组件库样式内容
   - pre-commit 钩子会检查 demo.html 是否包含组件库标识（`bc-` 前缀 class 或 `base.css`/`business.css` 引用），未使用组件库会中止提交
4. 组件运行时真源：`library/*.css` + `assets/js/registry-*.js`，A4 渲染时内联进 demo.html（工作台与 engine-* 已移除，不做本地预览，`tools/build-css-bundle.py` 已随工作台删除）
5. 每次生成/修改 demo，都必须把用户的原始提示词写入同目录 `prompt.md`（供飞书记录收集）
6. 每次生成/修改 demo，都必须按 5 维度自评并写入同目录 `quality.json`（含 `reason` 自评文字；供飞书质检，UED 复核）

## Demo 生成前置：组件映射清单（硬性，含一把梭场景）

无论走 PRD 链路（A1→A4）还是用户白话直接要 demo（一把梭），**写第一行页面前必须先产出组件映射清单**（详见 `.claude/rules/page-assembly.md` §0）：

1. **清单格式**：每个业务形态一行——`形态描述 → B_* 组件 ID + ctx 参数`（例：`删除确认弹窗 → B_Eg71Modal + ctx.action='delete'`）。清单先给用户确认（或落 `04_pages/REQ-###/` 供链路消费），确认后才开写 demo。
2. **禁止自我生产**：demo 里不允许出现与已注册 `B_*` 形态重叠的手写渲染函数（如手搓 `xxxConfirmHtml()` 删除确认而不调 `renderEg71Modal`）。库里没有的形态走铸造注册回库（page-assembly.md §3），不现场手搓。A5 按 R2b 一票否决（签名表见 `.claude/knowledge/K_validation.md`）。
3. **读契约再调用**：开工前读清单涉及组件的 SKILL.md §2 组装契约；**只内联组件 JS 代码、不按契约以 ctx 调用 = 未完成匹配**。
4. **EG71 必查清单**（涉及即必读契约）：壳（`window.MS_EG71_SHELL` + `navGroups`）、`B_Eg71Modal`（删除/禁用/确认/选择弹窗调度）、`B_ComDangerAction`（不可恢复操作统一规范）。

> 背景：REQ-005 M-Bus demo 曾手搓 `delConfirmHtml()` 删除确认弹窗，而 `B_Eg71Modal` 契约齐全且代码已内联同文件——根因是跳过了清单动作。用户白话直出 demo 时同样要先过本清单，不允许因「需求小/急」跳过。

## EG71 唯一壳契约（硬性）

EG71 产品线的 demo 只允许一套壳，侧边栏 + 顶部导航固定不变：

1. **唯一壳**：EG71 demo 一律内联 `window.MS_EG71_SHELL`（连同菜单唯一源 `navGroups`，见 `assets/js/registry-business.js` 约 130 行）并按范式调用：

   ```js
   $app.innerHTML = window.MS_EG71_SHELL.render(
     { route: '<该页路由>', entity: {...}, rows: [...] },
     { content: '<内容区HTML>', footer: '' }
   );
   window.MS_EG71_SHELL.bind($app);
   ```

   **禁止**自造壳（页面私有 shell/topbar/sider 结构类）、**禁止**自编菜单树。基准范式：`output/eg71-verify.html`（还原度最高的壳核实页）；已交付参考：`05_release/REQ-001` ~ `REQ-004` 的 demo.html。
2. **需求匹配动作**：新需求先把它映射到 `navGroups` 既有入口——命中既有入口（如 System Setting → General）则 demo 渲染在该入口路由下，基于该入口当前内容做修改；确属新功能才修改 `navGroups` 唯一源增补菜单项，**不在单个 demo 里私自加菜单**。
3. **内容区卡片形态按页面类型**：设置类页面 = `bc-eg71-content` 多区块卡片（默认）；列表/流程类页面 = 单张卡片、四周 20px（`.ms-content` 页面级覆写 `padding: var(--spacing-20)`），卡片内部禁止再套卡片。
4. **壳资产冻结**：`registry-business.js` / `library/*.css` 里的壳实现不因某个 demo 的需要反向修改；要改先单独提案。

## EG71 表格左对齐契约（硬性）

EG71 线表格一律左对齐，写死不改：

- **数字列**：`bc-num`（mono + tabular-nums，左对齐），禁用 `ms-table-num`。
- **操作列**：`bc-eg71-table-ops`（`library/business.css`，仅 nowrap，左对齐），禁用 `ms-table-ops`。
- 空态占位（`ms-empty`）居中除外；com / router / cctv / cv 线不受此约束。
- 存量已修正：`bc-eg71-alarm`、`bc-eg71-device-list`（2026-09-15）。

## EG71 Alert 位置契约（硬性）

来源：Figma 业务组件库「.Alert 警告提示」页（网关/路由器通用业务组件库）。Alert（`ms-alert`）在 EG71 页面只允许以下 4 个位置，**按提示的作用范围选位置**，位置与宽度写死：

| 位置 | 摆放 | 宽度 | 提示范围 |
|---|---|---|---|
| ① 全局顶部 | 整页最顶（侧边栏与顶栏之上） | 视口通栏 | 系统/设备级，影响所有页面 |
| ② 导航栏与 Tab 栏之间 | 右列，紧贴导航栏下沿 | 右列通栏（**无左右边距**） | 本页全部 Tab 共享 |
| ③ Tab 栏与内容之间 | 右列，紧贴 Tab 栏下沿 | 右列通栏（**无左右边距**） | 当前 Tab |
| ④ 卡片内 | 卡片标题正下方、内容上方 | 卡片内容宽（随卡片内边距缩进） | 本卡片/表单 |

- **宽度铁律**：①②③ 通栏不缩进；④ 随卡片 padding 缩进。内容区 20px 边距约束内容与 Tab 栏，**不约束 ②③ 的 Alert**（demo 内用负 margin 结构类拉通）。
- **范围判断**：影响多大范围放多高；只影响当前 Tab 不上 ②，只影响一张卡不上 ③。禁止把 Tab 级提示塞进卡片、把卡片级提示拉到通栏。
- **持久性**：error/warn 类不自动消失；成功类瞬时反馈走 toast（右下角），不占以上四个位置。
- 弹窗/抽屉 body 内的 Alert 属表单级提示，置于 body 顶部（④ 的精神）。


## EG71 标题契约（硬性）

来源：Figma 业务组件库「标题」页（网关/路由器通用业务组件库，node 41:33628，主/次标题两变体）。EG71 一切标题经 `B_ComTitle`（`bc-com-title`）表达，规格写死：

### 两变体规格

| 变体 | 规格 | 用途 |
|---|---|---|
| 主标题（`variant='main'`） | **16px / 500 / 行高 24px** / `--color-text-primary` | 页面主标题、卡片/区块标题 |
| 次标题（`variant='sub'`） | **14px / 500 / 行高 22px** / `--color-text-primary` | 表单分组标题（`ms-form-section-title` 左竖条形态同规格） |

- 与通用红线（spacing.md §4）的关系：**EG71 页面主标题不用 H2 24px**，一律主标题变体 16px/500；卡片/区块标题 = 主标题变体；分组标题 = 次标题变体。字重 500（Medium），不是 600。
- 标题颜色只允许 `--color-text-primary`。

### 标题行解剖（自左向右，同行 gap 8px、行高 32、items-center）

1. **标题文字**（变体规格如上）；
2. **Tag**（可选）：背景 `--color-fill-base-normal`、12px/400/行高 20、水平内边距 4px、圆角 4px、字色 `--color-text-primary`、**无边框**（轻量形态）；
3. **备注 describe**（可选，`describeMode='inline'`）：**同行**排布，16px/400/行高 24、`--color-text-auxiliary`；下一行备注用 `describeMode='below'`；
4. **提示图标 tip**（可选）：**18px**（图标阶梯唯一 18px 场景，见 spacing.md §3）；
5. **开关**（可选）：28×16（`ms-switch--xs`），**跟在大标题/次标题右侧**——紧跟标题组、不在行尾（「标题」页与「.启用/禁用功能逻辑」页两源一致）；带开关时该开关即本卡片/区块启用禁用的**总闸**，载体分工（标题 switch / 字段组 checkbox / 双箭头）与联动语义（总闸优先 / 两级制约 / 状态保持）见 [.claude/rules/business-specific.md](.claude/rules/business-specific.md) §6；
6. **按钮区**（可选）：右对齐占满剩余宽（flex-1 justify-end），**独立按钮、按钮间 gap 12px**、高 32（`ms-btn--sm`）；**禁止**把标题操作按钮拼成贴合式 `ms-btn-group`。

### 实现落点

- 以上视觉值（500 字重、22px 行高、Tag 轻量形态）以 `.bc-com-title` 组件域作用覆写落在 `library/business.css`，render 骨架（开关位置 / tip 18 / describe 同行 / 独立按钮）落在 `registry-business.js`——A4 内联时随两源自动生效，**无需手工修正**；不得在页面层重复覆写。

## EG71 Tab 栏契约（硬性）

来源：Figma 业务组件库「Tabs/Top」组件。EG71 页面级 Tab 栏规格写死：

- **位置**：右列顶部、导航栏正下方；左起 20px（与内容区边距对齐），右侧到列边；内容区从 Tab 栏分隔线下沿开始。
- **规格**：高 48px（`--spacing-5xl`）、白底、底部 1px 分隔线 `--color-divider-base-2`；tab 项间 gap 32px（`--spacing-3xl`）；tab 文字 14px。
- **两态**：未选中 = Regular 400 + `--color-text-secondary`；选中 = Medium 500 + `--color-text-primary` + 底部 2px 下划线 `--color-primary-normal`（撑满 tab 项）。hover（未选中）→ `--color-text-primary`。
- **与 Alert 组合**：Alert 走位置 ② 时 Tab 栏随之下移、自身 20px 左边距不变；走位置 ③ 时 Alert 贴 Tab 栏分隔线下沿通栏。
- **runtime 偏差（A4 内联时就地修正，不回写 assets 源头）**：`library/base.css` 的 `.ms-tabs` 现状 gap 24 / tab `padding:8px 0`（高≈38）/ active 文字 `--color-primary-normal`，与本契约不一致；内联时改为 gap 32、容器定高 48 垂直居中、active 与 hover 文字改 `--color-text-primary`。源头统一升级时同步删除本条。


## PRD 评论锚定（生成 demo 后，如用户要求发 review 到 PRD）

生成 demo 后，若用户要求把 review 评论发到飞书 PRD 文档，**不要用纯文本 append 到文档底部**，要用锚定评论脚本，让每条评论挂到 PRD 原文对应段落上：

**评论范围（硬性）**：PRD 评论**只发「需求侧逻辑漏洞」**——PRD 内部矛盾（正文 vs 图例/附录冲突）、流程断头（去向未定义/跳转目标不存在）、业务规则空白（位数/格式/默认值/权限影响业务行为）。UI 实现细节（展示态补全、入口形态、选项排序、文案措辞）**不发 PRD 评论**，只落 validation.md + 台账；判定口径与差异核对表见 [.claude/rules/interaction-completeness.md](.claude/rules/interaction-completeness.md) §2.5。每条评论必须是**方案评论**：指出漏洞 + 给出可采纳的裁决/规则/默认值，只提问不给方案的评论不合格。

1. 先把 review 整理成 JSON 文件（如 `05_release/REQ-XXX/prd_comments.json`），每条包含：
   - `quote`：评论引用的 PRD 原文片段（从 PRD 原文里摘，要能被搜索到）
   - `comment`：方案评论内容（逻辑漏洞 + 方案建议）
2. 运行脚本：
   ```bash
   python tools/add_prd_comments.py \
     --doc "<PRD 飞书链接>" \
     --comments "05_release/REQ-XXX/prd_comments.json"
   ```
3. 脚本自动：拉 PRD 所有段落 → 按 quote 匹配 block → 用 `--block-id` 发锚定评论；匹配不到的自动 fallback 到全文评论，不报错。

**不要自己用 lark-cli 直接发评论**（那样都是全文评论，不能定位到原文）。

## REQ 编号与多机同步（硬性）

- **分配编号前必查远端**：生成新 demo 前，`git fetch origin gitlab` 后取**所有远程** `05_release/` 的最大编号 +1，禁止只看本地目录分配编号（2026-10-16 双机各自生成 REQ-014 撞号事故的根因）。
- **同步与撞号处理按规则文件执行**：GitHub → GitLab 同步动作序列、REQ 目录 add/add 冲突决策表（远端保号 / 本地挪号 + 字样替换 + 残留验证）、rebase 工作区保护范式，见 [.claude/rules/sync-numbering.md](.claude/rules/sync-numbering.md)，必须逐项执行，不临场发挥。

## 提交信息格式

- 生成新 demo：`feat: 生成 REQ-XXX <页面名称> demo`
- 修改已有 demo：`fix: 更新 REQ-XXX <页面名称> demo`
- 其他改动：按常规 Conventional Commits 规范

## 跨平台说明（Windows / macOS）

本项目的 git 钩子同时支持 Windows 和 macOS：

- **Windows**：运行 `setup.ps1`（PowerShell）或 `setup.bat` 一键配置
- **macOS / Linux**：运行 `bash setup.sh` 一键配置

**macOS 用户额外注意**：
1. NAS 共享文件夹（SMB）需要先在 Finder 中挂载：按 `Cmd+K`，输入 `smb://192.168.5.50/公共临时文件夹（每季度定期清空）`，连接后挂载到 `/Volumes/` 下
2. 挂载后 post-commit 钩子会自动把 UNC 路径转换为 `/Volumes/` 本地路径进行复制
3. 如果未挂载，飞书同步仍会执行，只是 NAS 备份会跳过并输出警告

## 注意事项

- 不要提交 `.env`、`node_modules/`、临时文件
- 每次只 commit 一个需求的 demo，不要混在一起
- commit 后如果钩子输出 `[post-commit] 同步完成`，说明飞书已同步成功
