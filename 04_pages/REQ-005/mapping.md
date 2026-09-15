# REQ-005 组件映射清单（M-Bus 设备扫描添加）

> 依据 AGENTS.md「Demo 生成前置：组件映射清单（硬性）」。本清单为 REQ-005 demo 的全量形态映射；本轮（2026-09-15）增量修正 = 原先手搓的删除确认弹窗迁回 `B_Eg71Modal`，表格数字/操作列对齐 EG71 左对齐契约。

## 一、壳与布局

| 形态 | 组件 / 规则 | ctx / 参数 |
|---|---|---|
| 壳（侧边栏 + 顶栏 + 面包屑） | `MS_EG71_SHELL`（bc-eg71-sidenav + bc-eg71-topnav，菜单唯一源 navGroups） | `route:'/data-services/data-acquisition'`，`entity/rows` = 网关实体（EG71-MBus-Gateway / 6603C47B1120） |
| 内容区卡片形态 | 列表/流程类 = 单卡片四周 20px | 页面级 `.ms-content { padding: var(--spacing-20); gap: 0 }` |

## 二、页面形态 → 组件

| 形态 | 组件 / 规则 | ctx / 参数 |
|---|---|---|
| **删除确认弹窗（本轮修正）** | `B_Eg71Modal`（`bc-eg71-modal`，禁止手搓 `delConfirmHtml`） | `{ action:'delete', title:'删除 <设备名>', desc:'删除设备后，该设备相关的数据及数据转发应用都将被删除，您是否要删除？', okText:'删除', cancelText:'取消' }`；确认后行为按 `B_ComDangerAction`：执行删除 → Toast「设备已删除」 |
| 表格删除按钮（行内危险项） | `B_ComDangerAction` 规范（红字 text 按钮，运行时类已落地） | `ms-btn--text ms-btn--danger` + `data-action="del-dev"` |
| 设备列表（NEW 标记 / 冲突警示 / prim 地址） | 页面业务逻辑组装 `S_Table`（`ms-table`），无同名注册 B_* 承载扫描专属行为 | 页面渲染函数 renderList |
| 编辑设备弹窗 | 一次性表单弹窗：`S_Modal` + `S_Form` 直组（R2b 豁免项） | drawerEditHtml |
| 扫描中弹窗（spinner 轮询） | 无注册 B_* 重叠（loading 态非业务形态） | addingModalHtml |
| 扫描结果弹窗 | 无注册 B_* 重叠（结果汇总一次性展示） | resultModalHtml |
| 表格数字列 / 操作列 | EG71 表格左对齐契约：`bc-num`（mono+tabular，左对齐）、`bc-eg71-table-ops`（仅 nowrap） | 页面级补齐 `.bc-eg71-table-ops` 结构类（镜像 library/business.css:560，壳资产不动） |

## 三、R2b 自查

- 形态签名表唯一在册签名：`ms-modal` + `ms-btn--danger` 手搓 → 本轮消除（delConfirmHtml 删除）。
- 页面区剩余 `ms-modal` 使用均为 S_Modal+S_Form 一次性表单或 loading/结果弹窗，无 danger 确认，属签名表维护约定豁免。
