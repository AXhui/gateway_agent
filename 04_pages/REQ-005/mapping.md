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
| **删除确认弹窗（2026-09-15 修正）** | `B_Eg71Modal`（`bc-eg71-modal`，禁止手搓 `delConfirmHtml`） | `{ action:'delete', title:'删除 <设备名>', desc:'删除设备后，该设备相关的数据及数据转发应用都将被删除，您是否要删除？', okText:'删除', cancelText:'取消' }`；确认后行为按 `B_ComDangerAction`：执行删除 → Toast「设备已删除」 |
| **型号切换二次确认（2026-09-16 增）** | `B_Eg71Modal` | `{ action:'confirm', title:'切换设备型号', desc:'设备型号切换后，设备当前已创建的对象以及相关的转发数据都会被清除，请确认是否要切换？', okText:'确认', cancelText:'取消' }` |
| **对象数量上限拦截弹框（2026-09-16 增）** | `B_Eg71Modal` | `{ action:'confirm', title:'对象数量超出限制', desc:'⚠️ …上限提示逐行', okText:'确认' }` |
| 表格删除按钮（行内危险项） | `B_ComDangerAction` 规范（红字 text 按钮，运行时类已落地） | `ms-btn--text ms-btn--danger` + `data-action="del-dev"` |
| **手动添加 Step1 表单弹窗（2026-09-16 增）** | 一次性表单弹窗：`S_Modal`（`ms-modal--lg` 两列）+ `S_Form` 直组（R2b 豁免项）；失焦校验 `ms-input--error` + `ms-form-error`；寻址方式 `ms-radio-btn` 分段 | PRD 5.3 字段矩阵（名称唯一/≤127；一次地址 1-250 或二次地址 16 位 hex；采集间隔 60-86400） |
| **手动添加 Step2 对象选择（2026-09-16 增）** | 同上直组（勾选表 + 取消/上一步/完成/完成并继续添加） | 对象来自设备型号模板；数量上限校验（网关 20000 / 单设备 100）命中走上行 B_Eg71Modal 拦截 |
| **设备名 hover 标识符 / 状态告警 hover（2026-09-16 增）** | 页面级 `mb-tip` 结构类（镜像 library `.bc-eg71-signal-tip` 模式，纯令牌） | 名称+设备标识符；告警逐条展示 |
| 设备列表（NEW 标记 / 冲突警示 / prim 地址） | 页面业务逻辑组装 `S_Table`（`ms-table`），无同名注册 B_* 承载扫描专属行为 | 页面渲染函数 renderList |
| 编辑设备弹窗 | 一次性表单弹窗：`S_Modal` + `S_Form` 直组（R2b 豁免项）；2026-09-16 扩展字段（型号/描述/采集间隔/二次地址只读）+ 失焦校验 | drawerEditHtml |
| 扫描中弹窗（spinner 轮询） | 无注册 B_* 重叠（loading 态非业务形态） | addingModalHtml |
| 扫描结果弹窗 | 无注册 B_* 重叠（结果汇总一次性展示） | resultModalHtml |
| 表格数字列 / 操作列 | EG71 表格左对齐契约：`bc-num`（mono+tabular，左对齐）、`bc-eg71-table-ops`（仅 nowrap） | 页面级补齐 `.bc-eg71-table-ops` 结构类（镜像 library/business.css:560，壳资产不动） |

## 二·五、跨轮依赖（本轮不做，记录待后续轮次）

| 依赖 | 归属轮次 |
|---|---|
| 手动添加型号=None 分支的「对象列表页」入口（扫描添加对象/手动添加对象） | 数据对象管理轮 |
| 协议类型列接入网络名称点击跳转接入网络详情页 | 接入网络管理轮（navGroups 需增入口，单独提案） |
| 对象数量列点击进入对象列表页 | 数据对象管理轮 |

## 三、R2b 自查

- 形态签名表唯一在册签名：`ms-modal` + `ms-btn--danger` 手搓 → 本轮消除（delConfirmHtml 删除）。
- 页面区剩余 `ms-modal` 使用均为 S_Modal+S_Form 一次性表单或 loading/结果弹窗，无 danger 确认，属签名表维护约定豁免。
