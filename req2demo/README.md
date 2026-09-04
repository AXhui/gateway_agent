# req2demo · Agent 能力目录契约

> 给任何平台（工作台 / 飞书 / 各 Agent）的**首查入口**：先读 `_index.json`，再定位到对应层。
> 五层目录把「一句话需求」到「可交付 demo」的完整链路拆成稳定、可寻址的资产层。

---

## 一、五层含义

| 层 | 目录 | 定位 | 内容 | 命名 |
|---|---|---|---|---|
| L0 源头 | `00_skills/` | 唯一真源 · 只读 | L1 设计令牌 + 62 个基础组件 Skill | `S_<PascalCase>` |
| L1 业务 | `01_biz_skills/` | 仅封装 00，零新增样式 | 业务组件（组合基础组件） | `B_<业务域>_<组件>` |
| L2 知识 | `02_knowledge/` | 需求 → 组件映射 | 领域知识 + 映射表 + 范式 + 校验清单 | `K_*` |
| L3 输入 | `03_requirements/` | 产品需求文档 | PRD 流转存档 | `R_YYYYMMDD_REQ-###_<域>_<页>` |
| L4 输出 | `04_pages/` | 页面 demo | 渲染出的单文件 HTML | `P_<PageName>` |
| L5 交付 | `05_release/` | 打包 + 校验报告 | 交付物与还原度证据 | `REQ-###` |

**入口**：任何 agent 进来先查 [`_index.json`](./_index.json)，其中 `components` 映射 `S_*` → 组件目录、`business`/`modules`/`templates` 映射现有 `bc-*`/`mod-*`/`tpl-*`、`knowledge` 给出各 `K_*` 路径、`conventions` 给出命名规范。

---

## 二、命名规范（见 `_index.json.conventions`）

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

## 三、与其它资产的关系

- **根工作台引擎**（`index.html` + `assets/js/*.js` + `library/` + `tools/` + `frontend/`）保留在仓库根，是**运行时**；本目录是**契约层**，两者通过 `_index.json` + 相对路径衔接。
- **`.claude/skills/iot-track-*`**：8 个赛道 skill + 赛道路由器，是**管控层**（PRD 把关红线），不迁入本目录。
- **`milesight-ui-prototype-workspace/`**：渲染器回归用例，不迁入本目录。

---

## 四、一条 PRD 走完五层

```
L3 需求  03_requirements/R_20260903_REQ-001_xxx/00-raw.md   ← 产品原始 PRD
L2 知识  02_knowledge/K_mapping.md 查需求要素 → 业务组件
L1 业务  01_biz_skills/ 按 B_* 组合 L0 基础组件（零新增样式）
L0 源头  00_skills/src_components/ 提供 S_* 基础组件（只读，不在此改）
L4 输出  04_pages/REQ-001/P_<PageName>.html                      ← 单文件可交互 demo
L5 交付  05_release/REQ-001/ 打包 + K_validation 校验报告
```
