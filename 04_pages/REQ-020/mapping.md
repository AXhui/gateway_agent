# REQ-020 组件映射清单 · 设备库内置库（Data Library · Inbuilt）

> PRD：`设备库内置库需求 AI测试文档`（飞书 docx ANsBdqewEosemCxsQL0cRaFWnJg，本地 `prd-req020.md`）；
> 基础 PRD：【EG71】设备库导入&导出（`prd-req020-base.md`，校验规则/错误表/并发锁真源）。
> 视觉基准（一级）：Figma 71.0.0.4（file CVVyZcQHpcu8lipmsXRZIm，主帧 387:78306）。
> 历史关系：同页面曾以 REQ-004（原始交付）→ REQ-017（Tab 修复迭代）交付；本次为新会话窗口**全新重做**（sync-numbering §1 窗口规则），旧 demo 仅作差异化定位，不沿用旧形态。
> 页面路由：`/data-services/data-library`（navGroups 既有入口命中，**不增补菜单**）。

## 一、形态 → 组件映射（page-assembly §0）

| # | 形态描述 | 组件 ID + ctx 要点 |
|---|---|---|
| 1 | EG71 唯一壳（侧边栏+顶栏+面包屑） | `MS_EG71_SHELL.render({route:'/data-services/data-library', entity:{cn:'Data Library'}, rows:[EG71 网关行]},{content,footer})` + `bind` |
| 2 | 页级 Tab 栏（Inbuilt Data Parsing Library / Custom Data Parsing） | `B_Eg71PageTabs` ctx `{tabs:[{key:'inbuilt',label:'Inbuilt Data Parsing Library'},{key:'custom',label:'Custom Data Parsing'}], tab, flush:true}`（EG71 Tab 栏契约：flush 紧贴导航栏） |
| 3 | 内置库标题行（Library Version + 1.3.5 徽标 + Obtain/Upload 按钮） | `B_ComTitle` ctx `{title:'Library Version', showTag:true, tag:'1.3.5', showButton:true, buttons:[{t:'Obtain',kind:'filled',icon:'download',key:'obtain'},{t:'Upload',icon:'upload',key:'upload'}]}` —— **组件升级 1.1.0→1.2.0**（按钮区新增 icon/key/disabled 字段 + bind 分发 `eg71-com-title-btn`，向后兼容） |
| 4 | 内置库型号表（**6 列**：Device Model / Vendor / Protocol Type / Number of Objects / Device Reference Count / Operation[view]） | `B_Eg71DeviceLibTable` ctx `{rows:[{model,vendor,protocol,objects,refs}], total:17, countTitle:'Device Reference Count', opsMode:'view'}` —— **组件升级 1.0.0→2.0.0**（Figma 主帧 6 列真源；Props 契约破坏性变更：rows 增字段 + 新列标题 ctx + opsMode） |
| 5 | 自定义库型号表（同 6 列，Operation=edit/delete） | 同 `B_Eg71DeviceLibTable` ctx `{rows:[custom 型号], opsMode:'manage'}`（新增事件 eg71-devicelib-edit/-delete） |
| 6 | 自定义库工具栏（Import / Batch Export —— 锁定规则点名控件） | `B_Eg71Toolbar` ctx `{actions:[{action:'import',label:'Import',icon:'upload'},{action:'export',label:'Batch Export',icon:'download'}], reset:false}` |
| 7 | 在线更新·获取中（遮罩+文案，无进度条） | `B_Eg71LibProgressModal` ctx `{phase:'fetch', title:'Online Update'}` |
| 8 | 在线更新·网络异常（遮罩消失 + 红 toast） | `B_Eg71Message` dispatch `eg71-message-show` `{type:'error', text:'Network connection/download timed out. Please check the network.'}`（错误表英文文案，error 不自动消失） |
| 9 | 解析中/写入中（遮罩+进度条） | `B_Eg71LibProgressModal` ctx `{phase:'parse'/'write', percent:30/65/72/100, title:'Online Update'|'Importing'}` |
| 10 | 离线包上传弹窗（Alert+官方下载链接+Upload-Drag，empty/ok/error 三态） | `B_Eg71LibUploadModal` ctx `{fileState, fileName:'msil-inbuilt-1.4.0.zip', fileSize:'12.8 MB'（≤30MB 与弹窗副文案上限自洽）, dropSub:'Only .zip files are supported. Maximum file size is 30 MB.'（Figma 副文案真源）}`；官方下载点击 → 后台下载 success toast（PRD 步骤 1.1）。首次选文件演示 error 态（.tar.gz/58.4MB → 错误表文案），再次选择进入 ok 态 |
| 11 | 更新完成摘要（统计 0 值省略 + renamed/inuse/kept 段 + copy） | `B_Eg71LibResultModal` ctx `{stats:{added,updated,removed?}, sections:[{type:'renamed',items:[{from:'AM02',to:'AM02-1'}]},{type:'inuse'},{type:'kept'}]}`；ok 后回库页 + 版本号刷新 |
| 12 | 删除自定义模板确认（危险二次确认） | `B_Eg71Modal` ctx `{action:'delete', title:'Delete Device Model', desc, okText:'Delete'}`（B_ComDangerAction 规范稿在 eg71 线的落点）；被引用型号删除 → 阻断提示（错误表第 3 行，适用自定义库） |
| 13 | 编辑自定义模板（占位闭环） | `B_Eg71Modal` info 确认 + success toast —— base PRD 范围外的 D 类占位（PRD 字面形态：入口存在 + 锁定联动；不发明模板编辑器） |
| 14 | 自定义库导入（复用离线包三段链） | `B_Eg71LibUploadModal`（ctx 文案覆写为 custom 包 + `hideLink:true` **组件升级 1.0.0→1.1.0**——非官方源场景不渲染官方下载链接，向后兼容）→ #9 → #11（base PRD：ZIP 级校验与三段流程同构） |

**不走铸造的说明**：以上 14 形态全部命中既有/升级后资产，无新增 L3；唯二组件升级见 §三。

## 二、数据设计（Figma 主帧 + base PRD 语义）

- **内置库 17 型号**（Total: 17，首页 10 行 + 分页 1/2）：Milesight 为主 + 第三方厂商（Adeunis / Elsys / Netvox / MClimate）；协议类型混排 LoRaWAN / Modbus RTU / M-Bus（objects 4–32 合理分布；refs 与「被引用」叙事一致：AM319=6、EM500-PP=7、BU-VIE9185=4 等）。
- **自定义库 3 型号**：AM02（refs 2，被设备引用 → 冲突重命名/不可删除叙事源）、BU-KMC6727（refs 1）、WS302-Custom（refs 0，可删除 → 删除闭环载体）。
- **在线更新结果**：stats {added:30, updated:20}（removed 0 省略）+ renamed 段（AM02→AM02-1、BU-KMC6727→BU-KMC6727-1）+ inuse 段（BU-VIE9185、EM500-PP 原版本自动备份）→ 完成后版本 1.3.5→1.4.0、Total 17→47、自定义库重命名生效。
- **离线包结果**（第二个可复放链路）：stats {added:2, updated:3}。
- **英文输出**：PRD 中文、Figma 英文 → demo 按 Figma 英文惯例（REQ-016 先例，对照字段落 validation.md）。

## 三、组件契约升级（本次随 REQ-020 落库）

| 组件 | 版本 | 变更 | 影响评估 |
|---|---|---|---|
| `B_Eg71DeviceLibTable` | 1.0.0 → **2.0.0**（major） | 3 列→6 列（Figma 主帧真源）：rows 增 `vendor/protocol/objects`；新增 `vendorTitle/protocolTitle/objectsTitle/countTitle` 列标题 ctx；新增 `opsMode:'view'/'manage'`（manage=edit+delete 图标钮，新事件 eg71-devicelib-edit/-delete） | 已交付 demo 均内联冻结副本、无运行时消费方；major 安全 |
| `B_ComTitle` | 1.1.0 → **1.2.0**（minor） | 按钮区 buttons 增可选 `icon/key/disabled` 字段（渲染图标 + `data-title-btn`）；新增 `bind(root)` 分发 `eg71-com-title-btn {detail:{key}}` | 纯向后兼容新增；bc-com-* 跨线评估：eg71/router/cctv/cv 四线现无 showButton 消费方，零回归 |
| `B_Eg71LibUploadModal` | 1.0.0 → **1.1.0**（minor） | 新增 `ctx.hideLink`（true 时不渲染官方下载链接；自定义库包导入等非官方源场景） | 纯向后兼容新增；默认 false 行为不变，四线零回归 |

## 四、C2 需求侧逻辑漏洞候选（差异核对 §2.5，demo 侧已裁决）

1. **状态机 conflict-block「❌错误弹框+冲突列表」 vs 交互要点④「不阻断，自动重命名」**——demo 按交互要点④：非阻断，冲突在完成弹窗 Renamed 段体现（base PRD C-3 同裁决）。
2. **状态机 network-error 行被划掉 vs 交互要点②+错误表保留网络异常**——demo 实现网络异常态（红 toast + 英文文案）。
3. **正文「Update 按钮点击展开下拉菜单（在线更新/导入离线包）」 vs Figma Obtain+Upload 两个独立按钮**——demo 按 Figma 一级基准：Obtain 直接触发在线更新、Upload 打开离线包弹窗。

## 五、MS_FIGMA_EXPORT 状态枚举（全状态铺开契约）

default(inbuilt) / tab-custom / progress-fetch / progress-parse(30%) / progress-write(80%) / network-error-toast / upload-empty / upload-ok / upload-error / result-online(renamed+inuse) / result-offline(纯统计) / lock-write(按钮禁用+写入中)。
