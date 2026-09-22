# REQ-012 · LoRaWAN 入网优化与扫描 Demo

## 任务

来源：用户原始提示词——

> https://milesight.feishu.cn/docx/SidJdmUYMol5HyxxLppcxqppn7e?from=from_copylink 出demo

即：按飞书 PRD《【设备数采】LoRaWAN设备入网优化和扫描》（V0.9，黄淳峰）执行 A0→A5 全链路，产出可交互 demo。

## 路由与模块

| 路由 | 模块 |
|---|---|
| /data-services/data-acquisition/lorawan-scan | P1 LoRaWAN 扫描配置页（默认 Key 勾选 + CSV/xlsx 导入 + 清空 + 搜索 + 自定义 AppKey ≤1000） |
| /data-services/data-acquisition/lorawan-scan/confirm | P2 扫描确认页（交互引导横幅 + 发现/已忽略双 Tab + 行内编辑 + 单/多编辑抽屉 + 添加/放弃弹窗） |
| /data-services/data-acquisition/device/add?protocol=lorawan | P3 设备添加页（OTAA/ABP 激活设置单选 + Milesight 默认 Key 分叉） |
| /data-services/data-acquisition/device/edit | P4 设备编辑页（同型/ABP→OTAA/OTAA→ABP 三场景切换 + 前端暂存） |
| 跨页常驻 | G 全局扫描提示条（扫描中/红点+设备数/已读灰态，点击跳确认页） |

## 组件映射清单（page-assembly §0）

| 形态 | 映射 |
|---|---|
| 页面壳（侧边导航+顶栏+路由） | `MS_EG71_SHELL.render(ctx,{content,footer})` + `bind(app)` |
| 全局扫描提示条 | `B_Eg71ScanBanner`（新建） |
| 导入失败横幅（size/count/no-header/invalid） | `B_Eg71AlertBar`（新建，监听 import-error） |
| 扫描 Key 配置卡 | `B_Eg71ScanAppkeyCard`（新建，`eg71-scan-keys-change` 驱动页脚置灰） |
| 激活设置灰卡（默认/自定义单选） | `B_Eg71ActivationCard`（新建） |
| 设备添加/编辑表单（OTAA/ABP 字段分叉） | `B_Eg71DeviceForm`（新建） |
| 扫描确认页设备表（双 Tab/行内编辑/信号强度） | `B_Eg71ScanDeviceTable`（新建） |
| 单/多设备编辑抽屉 | `B_Eg71ScanEditDrawer`（新建，多编辑过滤设备名/描述/DevEUI/型号） |
| 表单底部操作栏（取消/开始扫描↔应用） | `B_Eg71FormFooter`（存量 v1.1.0 扩展双按钮形态） |
| 设备列表 | `B_Eg71DeviceList`（存量 v1.1.0 扩展） |
| 表单项族（输入/下拉/单选/日期/按钮/输入+按钮） | `B_Eg71FormItem*` ×6（存量补档） |
| 二次确认弹窗（放弃扫描/添加确认/URL 直入拦截） | `B_Eg71Modal`（存量） |
| 危险操作（清空） | `B_ComDangerAction`（存量，PRD 定为无确认直清） |

## 关键交互规格（来自 PRD）

1. **入网状态**：新增「入网失败」+ 右侧原因（密钥错误/节点未收到入网应答包）；OTAA/ABP 判定逻辑差异化展示。
2. **默认密钥**：Milesight 设备（oui 匹配）默认选「默认值」，非 Milesight 默认「自定义值」且「默认值」不可选；切换暂存用户输入。
3. **ABP**：DevAddr 生成（DevEUI 第 10–16 位 + 校验位）、会话密钥两套（固定+动态）；「默认值」置灰 DevAddr/会话密钥，保留 Uplink/Downlink Frame-counter/Timeout 可编辑。
4. **编辑页切换**：同型保持、ABP→OTAA（AppKey 空+必填，三密钥带入不可编辑）、OTAA→ABP（三密钥带入可编辑）；未保存切换前端暂存，保存后非激活字段清除。
5. **扫描配置**：导入 csv/xlsx ≤1M ≤1000 条，4 类失败横幅文案逐字落地；无任何 Key 时【开始扫描】置灰；重进页保留已扫设备 +【应用】形态。
6. **扫描确认页**：URL 直入且非扫描中 → 弹窗 + 3s 跳回配置页；上限 2000/勾选 2000/对象 20000 三级拦截；忽略↔发现互移；放弃扫描二次确认并清空未添加设备。
7. **添加反馈**：成功「xx个设备添加成功」+ 冲突「xx个设备已存在」并存。
8. **静态逻辑**（3.2 去重/MIC 顺序匹配/静默扫描、3.3 埋点划线不实现）不做 UI。

## 构建

- 平台层（L1 令牌 / L2 原子 / MS_EG71_SHELL / 冻结 Logo）复用 REQ-007 以来范式。
- A4 按 page.json 渲染单文件 demo；交互链补全（S1–S10）记 validation.md 不进可见 UI。
- 间距红线内联修正按 spacing.md §7 存量偏差清单机械执行。
- 校验：A5 五维（R1 30/R2 30/R3 25/R4 15 + R2b 否决 + 纯净性 + R5 交互链退回权）。
