# REQ-017 组件映射清单 · 设备库内置库交互流程优化

> PRD: https://milesight.feishu.cn/wiki/EaMAwC2TkiOOMqkjHpAcWYB0nqg
> 视觉真源: Figma 71.0.0.4（file CVVyZcQHpcu8lipmsXRZIm，已解析 6 关键帧）
> route: `/data-services/data-library`（navGroups 既有入口 Data Services → Data Library，不改菜单）

## 一、复用既有组件

| # | 业务形态 | 组件 | ctx 要点 |
|---|---|---|---|
| 1 | EG71 页面壳 | `window.MS_EG71_SHELL` | route='/data-services/data-library'，entity 含 gateway 信息 |
| 2 | 页级页签（Inbuilt Data Parsing Library / Custom Data Parsing） | `bc-eg71-page-tabs` | tabs=[{key:'inbuilt',label:'Inbuilt Data Parsing Library'},{key:'custom',label:'Custom Data Parsing'}]，tab='inbuilt'；custom 页签内容为范围外空态占位 |
| 3 | 表卡头行（Library Version 1.3.5 + Obtain/Upload） | `bc-com-title` | title='Library Version'，showTag+tag='1.3.5'（成功后变 1.4.0），showButton+buttons=[Obtain(primary,sm), Upload(default,sm)]，gap12 独立按钮 |
| 4 | 型号表格（Device Model / Service Reference Count / Operation） | `bc-data-table` | fields=[{model},{refCount type:link,bc-num},{operation}]，opsMode='icon'（view→detail 图标钮），rows 17 条（含 Figma 真实型号 BLM-LRB1062/BU-CAR6497/BU-VIE9185/BU-KMC6727…），表尾分页 Total 17 |
| 5 | Custom 页签空态 | `bc-empty-state` | PRD 范围外（自定义库属另一需求），空态占位不发明功能 |

## 二、铸造新 L3（走 Learner 模式 B，注册回 registry + SKILL.md + _index.json，v1.0.0）

| # | 业务形态 | 新组件 | 铸造参考 | ctx 要点 |
|---|---|---|---|---|
| 6 | 更新/导入进度弹窗（获取中 spinner / 解析中 / 写入中 + 进度% + Cancel） | `B_Eg71_LibProgressModal` → `bc-eg71-lib-progress-modal` | bc-upgrade-modal 进度反馈段 | phase='fetch'/'parse'/'write'，percent，hint 文案（Fetching the latest built-in libraries... / Parsing… Please wait. / Writing…），cancelText='Cancel'；400×156 深遮罩 |
| 7 | 更新完成摘要弹窗（绿✓ Import Completed + 统计 + 详情段 + Back to Device Library） | `B_Eg71_LibResultModal` → `bc-eg71-lib-result-modal` | bc-eg71-maint-message 结果态 | stats={added,updated,removed}（0 值省略不渲染），sections=[{type:'renamed',items:[{from:'AM02',to:'AM02-1'}]},{type:'backup',items:[…]},{type:'inuse',items:[…]}]（段可选、带 copy 按钮），okText='Back to Device Library' |
| 8 | 离线包上传弹窗（说明 + 官方下载链接 + Upload-Drag + 校验错误态 + Cancel/Upload） | `B_Eg71_LibUploadModal` → `bc-eg71-lib-upload-modal` | bc-eg71-batch-import 上传卡 | note（醒目提示文案），linkText='Official Download'，dropHint='Please ensure you are uploading a standard offline package released by Milesight'，fileState='empty'/'ok'/'error'，errorText（文件类型/大小错误红字），Upload 主钮随 fileState 启停 |
| 9 | 顶部 toast（网络异常红色 Message） | `B_Eg71_Message` → `bc-eg71-message` | ms-message-stack（L2 无独立运行时助手，升 L3） | type='error'/'success'，text（PRD 错误提示表文案），duration 自动消失；error 类不自动消失由宿主控制 |

## 三、MS_FIGMA_EXPORT 状态枚举（10 态）

1. 内置库 · 默认表格
2. 页签 · Custom Data Parsing（空态）
3. 在线更新 · 获取中（spinner + Fetching…）
4. 在线更新 · 网络异常（红色 toast）
5. 在线更新 · 解析中（30%）
6. 在线更新 · 写入中
7. 更新完成 · 标准摘要（Added/Updated）
8. 更新完成 · 冲突重命名 + 在用备份（Renamed AM02→AM02-1 / Backed-up 段）
9. 离线包 · 上传弹窗
10. 离线包 · 文件类型/大小错误

## 四、PRD 缺口预判（A5 时定稿）

| 功能点 | 类别 | 归因 | demo 处理 |
|---|---|---|---|
| 更新入口：PRD「Update ▼ 下拉菜单」 vs Figma「Obtain/Upload 两按钮」 | C2 矛盾 | 需求侧逻辑漏洞（PRD vs 其引用的 Figma 真源） | demo 按 Figma 两按钮；发方案评论（建议 PRD 更新入口描述） |
| 状态机 conflict-block「❌错误弹框+冲突列表」 vs 交互要点④「不阻断自动改名」 | C2 矛盾 | 需求侧逻辑漏洞（PRD 内部两处冲突） | demo 按 Figma（冲突在完成弹窗内 Renamed 段体现，不阻断）；发方案评论（建议删除 conflict-block 状态行） |
| 状态机 network-error 行被划掉 vs 交互要点②/错误提示表保留 | C1 待澄清 | demo 侧按 Figma+交互要点 | 保留网络异常 toast 态 |
| ZIP 内部校验规则「需研发确认是否有问题」 | D 备注 | PRD 自标待确认 | demo 不实现 ZIP 内部校验 UI（复用自定义库设计=范围外引用），台账记备注 |
