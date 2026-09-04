# 03_requirements · PRD 输入层（L3）

> PRD 从进入到交付的流转存档。核心原则：**一个 PRD 一个目录**，从原始需求到 demo 全程同目录，按需求编号可排序、可回溯。
> 流转规则见 `.claude/skills/iot-track-router/SKILL.md`（红线：只做参谋不擅自作主；内部拆「交互UI」+「dev」→ page.json；出 demo）。

## 目录结构

```
03_requirements/
├── README.md                           # 本文件：流转说明 + 命名规范 + PRD 清单
└── R_YYYYMMDD_REQ-###_<域>_<页>/       # 每个 PRD 一个目录（R_* 命名，见下）
    ├── 00-raw.md                       # ① 原始需求（产品给的 PRD 原文，尽量原文照录）
    ├── 01-route.md                     # ② 赛道路由判定：六大信号 → 主赛道 + 副赛道
    ├── 02-review.md                    # ③ 参谋段产出：需求澄清 / 技术合理性 / 竞品对标 / 方案(选型+风险+取舍+落地)
    ├── page.json                       # ④ 转化段产出：产品 + dev 的同一份契约（PageDocument schema）
    └── demo.html                       # ⑤ 可选：渲染出的可交互 demo（单文件，零依赖）
```

## 流转（与赛道路由器一一对应）

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
转化段（拆「交互UI」+「dev」→ page.json → demo）
      → 04_pages/REQ-###/page.json + 05_release/REQ-###/demo.html
```

> **何时写 01 / 02**：路由判定和参谋段结论随 PRD 出现即回写，避免「只记得对话、找不到结论」。选型拍板、是否开工，一律回给产品对齐后再继续。

## 命名规范

- 目录：`R_YYYYMMDD_REQ-###_<域>_<页>`，如 `R_20260903_REQ-001_gateway_mgmt`（日期 + 需求编号 + 业务域 + 页面短名）。
- 文件名固定 `00-raw.md` / `01-route.md` / `02-review.md` / `page.json` / `demo.html`，缺哪个阶段就不写哪个，不空占位。
- 产出落位：
  - 中间契约 `page.json` → `04_pages/REQ-###/page.json`
  - 交付物 `demo.html` → `05_release/REQ-###/demo.html`

## PRD 清单

| 需求编号 | 日期 | PRD | 主赛道 | 状态 |
|---|---|---|---|---|
| （暂无归档） | — | — | — | — |

> 现有 page.json 样例仍在 workspace 内（`milesight-ui-prototype-workspace/examples/test-cases/*.page.json`、`src/examples/*.page.json`），作为渲染器回归用例。新 PRD 的转化产物统一落回本目录，workspace 只留回归样例。

## 与其它目录的关系

- **赛道路由器**：`.claude/skills/iot-track-router/SKILL.md`（管控规则）
- **7 个赛道 skill**：`.claude/skills/iot-track-*/SKILL.md`（判断与思考方向）
- **领域知识**：`02_knowledge/`（真源消化产物，评审时查）
- **组件资产**：`00_skills/src_components/README.md`（L1+L2 组件索引）
- **全局注册表**：`../_index.json`（agent 首查入口，软映射 S_*/B_*/M_*/T_*）
- **page.json 契约**：`milesight-ui-prototype-workspace/page-schema.json`（schema 定义）
