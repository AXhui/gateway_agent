# REQ-020 校验记录 · 设备库内置库（Data Library · Inbuilt / Custom）

> PRD：飞书 docx `ANsBdqewEosemCxsQL0cRaFWnJg`（`prd-req020.md`）；基础 PRD：【EG71】设备库导入&导出（`prd-req020-base.md`，校验规则/错误表/并发锁真源）。
> 视觉基准（一级）：Figma 71.0.0.4（file `CVVyZcQHpcu8lipmsXRZIm`，主帧 387:78306）。
> demo：`05_release/REQ-020/demo.html`（683 KB 单文件，6 内联块）；走查脚本 `output/req020-build/walkthrough.py`（43 项）。

## 一、装配完整性自检（assembly-integrity §2）

| 项 | 结果 |
|---|---|
| 6 内联块首 64 字节与源一致（tokens/base/business/registry-base/registry-business/entities/controller） | 全部 OK（`output/req020-build/check.py`） |
| 3 个 JS 块 `node --check` | 全部通过 |
| `:root` 令牌块含 `--spacing-24` | OK |
| 运行时令牌活性断言（getComputedStyle） | OK（walkthrough #1） |
| 内联块尾差 | base/business/registry-business 三块尾差均为 spacing §7 就地修正追加（预期）；tokens/registry-base/entities/controller 尾字节全等 |

**spacing §7 偏差就地修正（build.py，不回写 assets 源头）**：ms-stat-title / ms-empty-text 13px→12px；追加 `.ms-ico--12`；protocol-card 竖向 padding 12→16；`ico(*,14)`→16 ×36；按钮组 `ms-space--8`→`--12` ×7（标签组/下拉组保留 `--8`，硬性计数守卫）。Tab 栏契约无需修正：本页用 `bc-eg71-page-tabs`（组件域 CSS 已按契约实现 gap 32 / 高 48 / active `--color-text-primary` + 2px 下划线），不涉及 `.ms-tabs`。

## 二、组件映射清单核对（page-assembly §0 / D2）

`04_pages/REQ-020/mapping.md` §一 14 形态逐项落地，全部经注册组件契约调用（`MS_BIZ_INDEX` render ×16 + `MS_EG71_SHELL.render/bind`），零手写业务形态（R2b 复核见 DEV 清单）。随 REQ 升级三个组件：`B_Eg71DeviceLibTable` 2.0.0（major）、`B_ComTitle` 1.2.0（minor）、`B_Eg71LibUploadModal` 1.1.0（minor），SKILL.md 同步。

## 三、三角色验收（scoring.md §0.2 → §0.3 证据行）

### UED 清单

| # | 检查项 | 结果 |
|---|---|---|
| U1 | 唯一壳 + navGroups 入口 | 过：`MS_EG71_SHELL.render/bind`；route `/data-services/data-library` 命中 Data Services → Data Library 既有入口，无私加菜单 |
| U2 | 模块清点 vs 装配计划 | 过：14 形态全落地（walkthrough 43 项覆盖），无缺失/多出 |
| U3 | 视觉基准（一级 Figma 主帧） | 过：默认帧截图比对——6 列列头 / Library Version + 1.3.5 Tag + Obtain/Upload / Total 17 / 分页 / view 单眼钮全对齐；上传弹窗、结果弹窗、自定义 Tab 三帧亦对齐 |
| U4 | EG71 三契约 | 过：标题（B_ComTitle 主标题变体 + Tag 轻量形态 + 独立按钮非 btn-group）；Tab 栏（组件域 CSS 契约值）；Alert（页面无 Alert 场景，上传弹窗内 Alert 置 body 顶部＝④精神） |
| U5 | 纯净性 | 过：可见 UI 无 PRD 注记 / 交互指引 / REQ-020 / B_ / 映射 / 校验痕迹（walkthrough 5 项全文扫描） |

**验收中发现并当场修复（交付前，不成立扣分）**：[U4-1] `.bc-eg71-device-lib-table thead th`｜AGENTS.md 表头黑色加粗（REQ-019 修订 3 全局指令）｜2.0.0 表体未挂 `bc-eg71-table` 结构类，表头呈现 L2 默认 12px 灰大写｜源头修复：`library/business.css` 共享表头规则扩并列选择器 `.bc-eg71-device-lib-table thead th`（不挂裸类免 20px padding 副作用），SKILL §5 同步；重建后 computed 断言 500/14px/rgb(39,46,59)/none 通过。

### DEV 清单

| # | 检查项 | 结果 |
|---|---|---|
| D1 | `score_component.py --report` | component 84，明细归档 `score_component.json` |
| D2 | 映射清单契约调用核对 | 过：16 处 render 均按 SKILL §2 组装契约以 ctx 调用 |
| D3 | 自造类复核 | 过：仅 `bc-req020-*` 5 个纯结构类（布局/显隐，值全 token，page-assembly §6 允许）；脚本报的 11 个"自造类"（cr/cur/false/fileType/last/on/page/tab/tool/val/version）为 JS 字符串误提取，非 CSS 类 |
| D4 | 装配完整性 | 过：§一全绿 + 运行时令牌活性断言 |
| D5 | spacing §7 偏差修正 | 过：§一清单 5 项逐条确认 |

脚本分说明（84 = ①98×0.2 + ②99×0.2 + ③70×0.25 + ④100×0.15 + ⑤62×0.2）：③的 9 个"疑似手写函数"中 7 个（closeAllPopups/openModal/closeModal/editDrawerHtml/eg71ModalVariant/eg71ModalBody/bindEg71Modal）是内联 registry 源内组件私有助手，2 个页面助手（openDialog/onDialogOk）内部调 `B['bc-eg71-modal'].render`——`.ms-modal` 的 `stopPropagation` 契约使确认钮必须直接挂接（页面级委托收不到），非 R2b 自我生产；⑤令牌占比 69%，684 处裸 px 全部来自内联 L2 库 CSS 固有值（spacing §6 边界：L2 内部以 SKILL 契约为准），页面层结构类零裸值。

### TEST 清单

| # | 检查项 | 结果 |
|---|---|---|
| T1 | 交互链五段（PRD 功能点逐条） | 过：Obtain（入口→点击→fetch 遮罩→网络异常 toast / 成功链 5 步→结果弹窗→Total 17→47）；Upload（弹窗三态→导入链→结果）；自定义导入（hideLink→直接 ok→结果→+1 行）；删除（被引用阻断 toast / 未引用确认弹窗→行减少）；编辑（确认→toast）；翻页；计数下钻；进度取消（原子回滚：版本/Total 不变） |
| T2 | 必备状态集 | 过：表格数据态/空态（组件级 `ms-empty` 兜底）/危险确认（B_Eg71Modal delete）；上传 empty/ok/error 三态；进度 fetch/parse/write 三段；结果弹窗（0 值统计省略 + renamed/inuse 段） |
| T3 | 状态保持与回滚 | 本页无启停开关（PRD 无此形态）N/A；导入取消＝原子回滚已测（版本/Total/列表不变） |
| T4 | 字段逐项 vs PRD 字段表 | 过：6 列字段存在性/类型/语义（型号 code / 厂商 / 协议 / 对象数 bc-num / 引用计数下钻链接 / 操作）；17 型号数据 + Figma 英文文案 |
| T5 | 边界值走查 | 过：ZIP 级校验失败（首选文件→错误表英文文案）→再选有效包；网络超时（fail-first→toast，error 不自动消失→可重试）；被引用删除阻断（refs>0）；导入锁定（标题按钮 + 工具栏 disabled） |

键盘 Esc 关闭弹窗：`bc-eg71-modal` / 上传弹窗家族 runtime 未实现 keydown（组件库五轴项），与 REQ-019 同口径不落本 REQ 扣分，留组件库后续统一升级。

### 证据行（扣分依据）

```
[U4-1] .bc-eg71-device-lib-table thead th｜表头黑色加粗契约｜2.0.0 未挂共享结构类，表头 12px 灰大写｜已源头修复（交付前），不成立扣分
[T2-1] 自定义库表｜interaction §1.1 列表空态｜PRD 未定义空自定义库场景；demo 数据下不可达（3 行中仅 WS302-Custom refs=0 可删）；组件级 ms-empty 兜底已具备｜0
```

五维均无成立扣分；component/structure/field 以脚本分为准（见 §四）。

## 四、五维落分（真实性校验基础）

| 维度 | 分 | 来源 |
|---|---|---|
| structure | 100 | `score_fidelity.py --write`（骨架 5/5 + 装配健康 245 调用点 + 业务定制度满分，`score_fidelity.json`） |
| component | 84 | `score_component.py --write`（明细 `score_component.json`，DEV 清单说明） |
| interaction | 100 | TEST 清单零成立扣分（C2 冲突按免责条款，见 §六） |
| visual | 100 | UED 清单零成立扣分（U4-1 交付前修复） |
| field | 92 | `score_fidelity.py --write`（①81：两实体共用 5 去重字段键——本页 PRD 真源即 5 个数据字段（6 列 = 5 数据列 + 操作列），非字段缺失；②③满分，`score_fidelity.json`） |

综合（0.2/0.2/0.25/0.2/0.15 加权）= **95.6 ≥ 80**，过同步门槛。

## 五、交互链缺口（A5，interaction-completeness §2）

| 功能点 | 类别 | 缺什么 | demo 处理 |
|---|---|---|---|
| 在线更新 / 离线导入 / 自定义导入 / 删除 / 编辑 / 翻页 / 计数下钻 / 批量导出 | A 完整 | — | 五态齐 |
| 网络异常态 / ZIP 校验失败态 | B 链路（PRD 错误表定义文案） | — | 已按错误表英文文案补全（首次 Obtain / 首次选文件 fail-first 演示路径，此后可复放成功链） |
| 编辑自定义模板 | D 小缺口（base PRD 范围外） | 模板编辑器未定义 | 按 PRD 字面占位：入口 + 锁定联动 + 确认反馈，不发明编辑器 |
| 自定义库空态 | D 小缺口 | PRD 未定义 | 组件级 ms-empty 兜底；demo 数据下不可达 |

## 六、差异核对（§2.5，评论过滤门）

### 差异核对表

| 功能点 | PRD 写了什么（原文摘录） | demo 实现了什么 | 差异归因 |
|---|---|---|---|
| 冲突型号处理 | 状态机 conflict-block：「❌ 错误弹框 + 冲突型号列表」阻断导入；交互要点④：「与自定义库冲突的型号**不阻断**，自动重命名（原模板备份）」 | 非阻断：更新完成弹窗 Renamed Device Models 段呈现 AM02→AM02-1 等重命名，自定义库同步改名 | **需求侧逻辑漏洞 C2**（前后矛盾，只能取其一；base PRD C-3 同裁决取非阻断） |
| 网络异常 | 状态机 network-error 行被划掉（删除）；交互要点②与错误表均保留「网络连接/下载超时」文案 | 实现网络异常态：遮罩消失 + 红 toast（错误表英文文案，不自动消失，可重试） | **需求侧逻辑漏洞 C2**（状态机与交互要点/错误表矛盾） |
| 更新入口形态 | 正文：「点击 Update 按钮展开下拉菜单（在线更新 / 导入离线包）」 | Figma 71.0.0.4 主帧：Obtain + Upload 两个独立按钮，Obtain 直接触发在线更新 | **需求侧逻辑漏洞 C2**（正文与一级视觉基准矛盾；demo 按 Figma） |
| 输出语言 | PRD 中文 | demo 英文（Figma 主帧英文惯例，REQ-016 先例） | demo 侧 UI 细节（不发） |
| 离线包演示数据 | 未定义文件名/大小 | msil-inbuilt-1.4.0.zip / 12.8 MB（≤30MB 与弹窗副文案上限自洽；REQ-017 曾用 45.2MB 与上限矛盾，已修正） | demo 侧 UI 细节（不发） |
| 首次 Obtain 网络异常、首次选文件校验失败 | 错误表定义了文案但未定义触发时机 | fail-first 演示路径（首次失败、此后成功），保证错误态可达且可复放成功链 | demo 侧 UI 细节（B 类展示态补全，不发） |
| 自定义 Tab 标题行 | 未定义 | 工具栏（Import/Batch Export）直接贴卡片顶（无 B_ComTitle 行） | demo 侧 UI 细节（Figma 自定义 Tab 帧真源形态，不发） |
| 版本徽标形态 | 未定义 | Tag 轻量形态（无边框 12px，标题契约解剖第 2 条） | demo 侧 UI 细节（Figma 真源，不发） |

### 评论清单（待用户裁定，见主对话）

**可发（C2 ×3，均为方案评论）**：冲突处理矛盾（建议裁决取交互要点④非阻断）、network-error 划掉与错误表矛盾（建议保留网络异常态）、Update 下拉 vs Figma 两独立按钮（建议按 Figma 两按钮）。
**不发**：上表后 6 行（demo 侧 UI 细节 / 展示态补全）。

**发送记录（2026-10-31，用户确认「全部发送」）**：3 条经 `tools/add_prd_comments.py` 发至 PRD 文档——③ Update 下拉锚定到段落 `doxcnpnBK3bfGnq10nsOdk0Bcxd`；①②（表格行引用含 `~~` 删除线与管道符，段落匹配未命中）按脚本既定 fallback 发全文评论。底稿 `prd_comments.json`。

## 七、旧形态 × 新规则核验（page-assembly §0 第 5 条）

同页面第三次下发（REQ-004 → REQ-017 → REQ-020），全新重做，旧 demo 仅差异化定位。对照当前规则的关键修订：

| 旧形态（REQ-004/017） | 当前规则 | REQ-020 落地 |
|---|---|---|
| 3 列型号表 | Figma 主帧 6 列 + 表头黑粗指令 | DeviceLibTable 2.0.0 六列 + 共享表头范式选择器 |
| 标题行按钮页面层手写 | B_ComTitle 1.2.0 按钮区契约 | 组件化（icon/key/disabled + eg71-com-title-btn） |
| 离线包 45.2 MB | 弹窗副文案上限 30 MB | 12.8 MB（自洽） |
| 自定义导入渲染官方下载链接 | 非官方源不应有官方链接 | LibUploadModal 1.1.0 `ctx.hideLink` |
| 无实体契约块 | score_fidelity ①实体定义 | `window.MS_ENTITIES`（内置型号/自定义模板两实体，独立 script 块） |
| Tab 栏 runtime 偏差 | Tab 契约 + B_Eg71PageTabs 1.1.0 | 组件域 CSS 契约值自动生效，无需内联修正 |

## 八、MS_FIGMA_EXPORT 状态枚举（14 态）

default-inbuilt / tab-custom / online-fetch / online-parse-30 / online-write-80 / network-error / upload-empty / upload-ok / upload-error / upload-custom / result-online / result-offline / result-custom / lock-write；reset() 关闭 fail-first 旗标保证导出确定性。
