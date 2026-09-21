# Modulor · Agent 能力目录契约

> 给任何平台（工作台 / 飞书 / 各 Agent）的**首查入口**：先读 [`_index.json`](./_index.json)，再定位到对应资产。
> 本目录把「一句话需求」到「可交付 demo + 可编辑 Figma 设计稿」的完整链路拆成稳定、可寻址的资产层，由 **18 个 Agent** 分链路驱动。

---

## 一、组件库 4 层架构

| 层 | 目录 | 定位 | 内容 | 命名 |
|---|---|---|---|---|
| **基础组件** | `.claude/tokens/` + `.claude/skills/base/` | 唯一真源 · 只读 | 设计令牌 + 63 个基础组件 Skill（62 物理 + 1 派生 S_Table） | `S_<PascalCase>` → `ms-*` |
| **业务组件** | `.claude/skills/business/` | 仅封装基础组件，零新增样式 | 业务组件（组合基础组件） | `B_<域>_<组件>` → `bc-<域>-<组件>` |
| **治理规则** | `.claude/rules/` | 基础/业务共用一份 | 封装 / 版本 / 命名 / 文档 / 发布 / 间距红线 / 交互链闭环 + 业务补充 | — |
| **Agent 规则** | `.claude/agents/` + `.claude/knowledge/` | 驱动链路 + 页面装配知识 | 18 个 agent 定义 + 需求→组件映射（`K_*`） | `A*` / `D*` / `T*` / `K_*` |

> 原「五层」中的 **L1 设计令牌并入基础组件层**、**L2 知识并入 Agent 规则层**，`M_*` 模块 / `T_*` 模板归为「页面装配知识」，由 Agent 规则层承载，不再单列层。
> 工作目录（`03_requirements/`、`04_pages/`、`05_release/`）在仓库根，是 PRD 流转的**工作产物**，不属于本 4 层能力资产。

---

## 二、Agent 链路（18 个 agent）

| 段 | 编号 | 职责 |
|---|---|---|
| **拆解** | A0 | PRD 三角色拆解：单一 agent `a0-prd-decomposer` 依次产出 UED / DEV / 测试 三份视角文档 |
| **UED 链路** | A1–A8 | 页面装配规划 → 组件匹配 → 渲染 → 还原度校验 → 质量数据记录 → Figma 转换 + 审核补充 |
| **DEV 链路** | D1–D5 | 数据模型 → 接口 → 业务规则 → 校验 → 异常/权限/性能 |
| **测试链路** | T1–T4 | 用例 → 验收 → 兼容性 → 性能验收 + 回归 + 风险 |

入口：任何 agent 进来先查 [`_index.json`](./_index.json)，其中 `components` 映射 `S_*` → 组件目录、`business`/`modules`/`templates` 映射现有 `bc-*`/`mod-*`/`tpl-*`、`knowledge` 给出各 `K_*` 路径、`conventions` 给出命名规范。

---

## 三、命名规范（见 `_index.json#conventions`）

| 对象 | 规范 | 示例 |
|---|---|---|
| 基础组件 | `S_<PascalCase>` | `S_Button`、`S_DatePicker` |
| 业务组件 | `B_<域>_<组件>` | `B_Device_List`、`B_Rule_Form` |
| 页面模块 | `M_<PascalCase>` | `M_Metrics`、`M_FilterList` |
| 页面模板 | `T_<PascalCase>` | `T_List`、`T_Dashboard` |
| 需求目录 | `R_YYYYMMDD_REQ-###_<域>_<页>` | `R_20260903_REQ-001_gateway_mgmt` |
| 页面产出 | `P_<PageName>` | `P_GatewayList` |
| 交付目录 | `REQ-###` | `REQ-001` |

> 基础组件是**软映射**：目录名保持 `Button/`、`Input/` 不变，`S_Button` 等逻辑 ID 只在 `_index.json` 注册，不做物理改名（git 历史友好）。

---

## 四、一条 PRD 走完整链路

```
需求层  03_requirements/R_*/00-raw.md                     ← 产品原始 PRD
   │
   ▼
A0 拆解  a0-prd-decomposer 一 agent → 03-ued / 04-dev / 05-test
   │
   ├─ UED 链路 A1-A8  ──→ 装配规划 → 组件匹配 → 渲染 → 可交互 Demo
   ├─ DEV 链路 D1-D5  ──→ 数据/接口/规则/校验/异常（并行视角）
   └─ 测试链路 T1-T4  ──→ 用例/验收/兼容/性能（并行视角）
   │
   ▼
组件库 4 层  tokens + base → business → rules → agents/knowledge
   │
   ▼
还原度校验 5 维（R1 令牌 / R2 溯源 / R3 闭环 / R4 结构 / R5 交互）→ 质量数据（多维表格）+ 机器人反馈
   │
   ▼
A8 Figma 转换 + UED 审核补充 → 可编辑 Figma 设计稿 + 审核报告 + 补充项清单
   │
   └─ 组件优化反馈（闭环迭代）
```

---

## 五、PRD 流转（工作目录）

> 核心原则：**一个 PRD 一个目录**，从原始需求到 demo 全程同目录，按需求编号可排序、可回溯。
> 流转规则见 [`.claude/skills/iot-track-router/SKILL.md`](./skills/iot-track-router/SKILL.md)（红线：只做参谋不擅自作主；A0 三角色提炼「UED + DEV + 测试」→ 合成 page.json；出 demo）。

### 目录结构

```
03_requirements/
└── R_YYYYMMDD_REQ-###_<域>_<页>/       # 每个 PRD 一个目录（R_* 命名，见下）
    ├── 00-raw.md                       # ① 原始需求（产品给的 PRD 原文，尽量原文照录）
    ├── 01-route.md                     # ② 赛道路由判定：六大信号 → 主赛道 + 副赛道
    ├── 02-review.md                    # ③ 参谋段产出：需求澄清 / 技术合理性 / 竞品对标 / 方案(选型+风险+取舍+落地)
    ├── 03-ued.md                       # ④ A0 视角一 · UED（a0-prd-decomposer）：页面结构/模块/交互/字段展示/特殊交互/状态枚举/布局
    ├── 04-dev.md                       # ⑤ A0 视角二 · DEV（a0-prd-decomposer）：数据模型/接口/业务规则/校验/异常/权限/性能
    ├── 05-test.md                      # ⑥ A0 视角三 · 测试（a0-prd-decomposer）：用例/验收/数据校验/兼容性/性能验收/回归/风险
    ├── page.json                       # ⑦ 转化段产出：三份文档 + 02-review 合成，产品 + dev 的同一份契约（PageDocument schema）
    └── demo.html                       # ⑧ 可选：渲染出的可交互 demo（单文件，零依赖）
```

### 流转（与赛道路由器一一对应）

```
产品给 PRD
   │  → 00-raw.md           原样归档
   ▼
路由判定（六大信号 → 主/副赛道）
   │  → 01-route.md         判定 + 证据（从原文找，不臆测）
   ▼
参谋段（四步法：澄清→合理性→竞品→方案）
   │  → 02-review.md        只给建议，不拍板
   ▼
A0 三角色提炼（a0-prd-decomposer 一 agent，依次产出）
   ├─ 视角一 UED → 03-ued.md    设计/视觉视角
   ├─ 视角二 DEV → 04-dev.md    开发视角
   └─ 视角三 测试 → 05-test.md  测试视角（复用 03+04 对齐口径）
   ▼
转化段（03-ued + 04-dev + 05-test + 02-review 合成 page.json → demo）
      → 04_pages/REQ-###/page.json + 05_release/REQ-###/demo.html
```

> **何时写 01 / 02**：路由判定和参谋段结论随 PRD 出现即回写，避免「只记得对话、找不到结论」。选型拍板、是否开工，一律回给产品对齐后再继续。
> **三角色文档何时生成**：02-review 定稿后，由单一 agent（a0-prd-decomposer）依次提炼 UED → DEV → 测试 三份视角文档（测试视角复用 03+04 对齐口径），作为 page.json 的**前置输入**。

### 命名规范

- 目录：`R_YYYYMMDD_REQ-###_<域>_<页>`，如 `R_20260903_REQ-001_gateway_mgmt`（日期 + 需求编号 + 业务域 + 页面短名）。
- 文件名固定 `00-raw.md` / `01-route.md` / `02-review.md` / `03-ued.md` / `04-dev.md` / `05-test.md` / `page.json` / `demo.html`，缺哪个阶段就不写哪个，不空占位。
- 产出落位：
  - 中间契约 `page.json` → `04_pages/REQ-###/page.json`
  - 交付物 `demo.html` → `05_release/REQ-###/demo.html`

---

## 六、工作目录约定（输入 / 输出 / 交付）

> PRD 转化后的中间契约与交付物落地处。工作目录在仓库根，不在 `.claude/` 下。

- 每个 PRD 的 `page.json`（PageDocument schema）落 `04_pages/REQ-###/page.json`。
- 页面模块名用 `P_<PageName>` 逻辑 ID，模块内部引用 `M_*` / `B_*` / `S_*`（软映射见 [`_index.json`](./_index.json)）。
- 每个 PRD 的交付物落 `05_release/REQ-###/`：`demo.html`（单文件、零依赖、可交互）+ 还原度校验报告（R1~R5，见 [`../.claude/knowledge/K_validation.md`](./knowledge/K_validation.md)）。

```
04_pages/REQ-###/page.json        # 产品 + dev 的同一份契约
05_release/REQ-###/demo.html      # 可交互 demo
05_release/REQ-###/validation.md  # R1~R5 还原度报告（交付前必跑）
```

---

## 七、与其它资产的关系

- **组件运行时**（`assets/js/registry-*.js` + `library/*.css` + `frontend/` + `tools/`）保留在仓库根，是**运行时**（demo 渲染时内联）；本目录是**契约层**，两者通过 `_index.json` + 相对路径衔接。工作台（index.html + engine-*）已移除，页面产出全走 agent 链路（A1–A5）。
- **`.claude/skills/iot-track-*`**：8 个赛道 skill + 赛道路由器，是**管控层**（PRD 把关红线），不迁入本目录。
- **`.claude/rules/`**：治理规则层（封装 / 版本 / 命名 / 文档 / 发布 / 产出目录 / 页面装配 / Figma 资产库 / 间距红线 / 交互链闭环 + 业务补充），只写一份。
- **`.claude/agents/`**：Agent 规则层 · 18 个 agent 定义（A0 + A1–A8 + D1–D5 + T1–T4）。
- **`milesight-ui-prototype-workspace/`**：渲染器回归用例，不迁入本目录。
