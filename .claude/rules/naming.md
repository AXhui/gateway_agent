# 命名规则 · Naming

> **适用范围**：基础组件与业务组件**共用一份**。
> **性质**：硬性约束。命名分「层名模式」与「书写格式」两部分。

## 0. 权威源声明（避免重复定义）

层名模式（`S_/B_/M_/T_/R_/P_/REQ`）的唯一权威源是 **`.claude/_index.json` 的 `conventions` 字段**，以及 `.claude/README.md` 的五层合同表。

**本文件不重新定义层名模式，只镜像引用**；若与 `_index.json` 冲突，以 `_index.json` 为准。本文件真正新增的是 `_index.json` 未覆盖的「书写格式」规则（BEM / camelCase / kebab-case / 产品线前缀）。

## 1. 层名模式（镜像自 `.claude/_index.json#conventions`）

| 层 | 逻辑名模式 | 运行时 id | 目录名 | 示例 |
|----|-----------|-----------|--------|------|
| L1 令牌 | — | `--*` 变量 | `tokens/` | `--color-primary-normal` |
| L2 基础组件 | `S_<PascalCase>` | `ms-*` 类 | `base/Button/` | `S_Button` → `ms-btn` |
| L3 业务组件 | `B_<域>_<组件>` | `bc-<域>-<组件>` | `business/<域>/` | `B_Eg71_Sidenav` → `bc-eg71-sidenav` |
| L4 页面模块 | `M_<PascalCase>` | `mod-*` | — | `M_DeviceList` |
| L5 页面模板 | `T_<PascalCase>` | `tpl-*` | — | `T_DeviceDetail` |
| 需求 | `R_YYYYMMDD_REQ-###_<域>_<页>` | — | — | `R_20260906_REQ-001_eg71_device` |
| 页面 | `P_<PageName>` | — | — | `P_DeviceList` |
| 发布 | `REQ-###` | — | — | `REQ-001` |

> **目录名列为已落地结构**（`base/`、`business/<域>/`）。「就地迁移」已完成：`components/` → `base/`；`business/` 按产品线归组为 `business/_shared/`（无前缀通用）与 `business/eg71/`（EG71 网关线）。命名模式本身不受物理迁移影响。

## 2. 书写格式（本文件新增，`_index.json` 未覆盖）

### 2.1 文件名：kebab-case（小写连字符）

- 组件源文件、结构样式文件一律 kebab-case：`device-card.tsx`、`device-card.css`、`index.html`。
- 目录名保留 PascalCase（历史遗留，如 `base/Button/`、`business/eg71/B_Eg71Sidenav/`），**新组件**建议目录名也用 kebab-case 以对齐文件名。
- SKILL.md 文件名保持大写 `SKILL.md`（Claude Code skill 加载器契约要求）。

### 2.2 Props / 变量 / 事件：camelCase（小驼峰）

- 组件 Props：`iconLeft`、`htmlType`、`onClick`、`entityHint`。
- 组件内变量、函数：`syncSidebar`、`isCollapsed`、`renderSkeleton`。
- 布尔 Props 语义前置：`loading` / `disabled` / `block`，不写 `isLoading` / `hasDisabled`。

### 2.3 CSS 类：BEM 变体

- 基础组件：`ms-btn`（块）、`ms-btn--primary`（修饰符）、`ms-nav-item--active`（状态修饰符）。
- 业务结构类：`bc-eg71-sidenav`（块）、`bc-eg71-sidenav--collapsed`（修饰符）、`bc-eg71-foot-name`（元素，用 `-` 连接，不用 `__`）。
- 状态一律用 `--` 修饰符表达，不新增并列块：`is-collapsed` / `--active` / `--disabled`。

### 2.4 业务组件产品线前缀（业务层追加层，基础组件无此层）

- 业务组件名必须携带**产品线/域前缀**，用于跨产品线隔离与检索：

| 域 | 前缀 | 示例逻辑名 | 示例运行时 id |
|----|------|-----------|--------------|
| 网关 EG71 | `eg71` | `B_Eg71_Sidenav` | `bc-eg71-sidenav` |
| 路由器 | `router` | `B_Router_Wan` | `bc-router-wan` |
| CCTV | `cctv` | `B_Cctv_Live` | `bc-cctv-live` |
| 机器视觉 | `cv` | `B_Cv_Detect` | `bc-cv-detect` |
| 跨产品线通用 | `com` | `B_Com_DataTable` | `bc-com-data-table` |

- 对比：基础组件**无前缀**，直接 `S_Button` → `ms-btn`。这是业务与基础命名的唯一结构性差异，其余格式完全一致。
- 跨产品线复用的业务组件，前缀用 `com`，放在 `business/_shared/`（不归任何产品线）。

## 3. 命名一致性校验点（发布前必查，见 release.md）

- 逻辑名 ↔ 运行时 id ↔ 目录名三处一致（`B_Eg71_Sidenav` ↔ `bc-eg71-sidenav` ↔ `business/eg71/B_Eg71Sidenav`）。
- 无硬编码类名越界（基础组件不得出现 `bc-*`，业务组件不得发明新 `ms-*` 类）。
