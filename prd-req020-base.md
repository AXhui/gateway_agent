<title>【EG71】设备库导入&amp;导出</title>

# Changelog

<table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th vertical-align="top">版本</th><th vertical-align="top">更改内容</th><th vertical-align="top">更新时间</th><th vertical-align="top">操作者</th></tr></thead><tbody><tr><td>V1.3</td><td>设备型号被引用，更新/删除的逻辑调整，参见<a href="https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-WgLRdlH1mo1VgVxiTwdc5hhgnNe">校验规则章节</a></td><td>2029.09.21</td><td>lxy</td></tr><tr><td>V1.2</td><td>1、因内置库从平台获取与当前的界面校验不匹配，需要调整前端约束放开枚举值的约束，允许用户只有一条配置，详见：<a href="https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-EyHtdil3HokZbgxDe2QcPuiXnKh">4.6章节</a><br/>2、因当前页面约束，后端约束和导入字段约束存在差异，统一梳理字段的输入限制汇总，参考<cite doc-id="Hg3dwYmHNiTZiikjrIBcEYUknBh" file-type="wiki" table-id="tblTXXP9iw4HTdFo" title="输入限制汇总" type="doc" view-id="vew2Y9wfrB"></cite></td><td>2026.09.14</td><td>lxy</td></tr><tr><td>V1.1</td><td>因前端无资源，无法满足所有需求，需要砍掉部分需求。<br/>调整部分参见黄色字体和删除线<br/>1、自定义设备库的策略选择页面删除，默认自定义库导入为全量覆盖；同时将删除型号是否有被设备引用的校验提前，在校验规则阶段就做。<br/>2、第四步导入完成，仅toast提示，不再呈现相关页面摘要提示<br/>3、内置库的所有前端界面功能都删除，保留后端的导入校验逻辑</td><td>2026.08.03</td><td>lxy</td></tr><tr><td vertical-align="top">V1.0</td><td vertical-align="top">需求初稿</td><td vertical-align="top">2026.06.02</td><td vertical-align="top">lxy</td></tr></tbody></table>

# 一、需求背景

> 注：设备库整体体验问题 1–4（缺乏第三方设备库、型号搜索无引导、无厂商维度、内置/自定义割裂）已移至独立需求文档《增加厂商维度》。以下仅列出与导入/导出流程直接相关的背景问题。

1. **模板跨网关流通体验差**：导入大量型号时无进度反馈，错误信息笼统，定位困难；代理商和 SI 无法高效地在多网关间分发模板
2. **对象上限过窄阻碍主流设备接入**：Modbus/BACnet 对象上限仅 100，而主流楼控 DDC 常见 300–1000 个对象，上限直接卡住 Schneider 电表、Siemens DDC 等高频设备

# 二、目标

**优化模板跨网关导入流程，提供进度反馈和结构化错误报告**

> **用户故事**：代理商技术人员，批量导入设备模板时看到实时进度，完成后获得结构化的成功/失败报告，快速定位失败原因并修正，不需要猜测。

**放宽对象上限，兼容主流楼控设备**

> **用户故事**：SI 工程师，导入 Schneider 电表（1008 对象）或 Siemens DDC 时不再被上限阻断，能完整导入并使用全部对象。

# 三、需求列表

<table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th>模块</th><th vertical-align="top">需求</th><th vertical-align="top">说明</th><th>优先级</th></tr></thead><tbody><tr><td rowspan="2">容量调整</td><td vertical-align="top">内置模板数量上限 500→3000</td><td vertical-align="top">预留未来设备覆盖增长空间</td><td>P0</td></tr><tr><td vertical-align="top">单模板对象数量上限调整</td><td vertical-align="top">Modbus/BACnet→2000、KNX/LoRaWAN→512、M-Bus→100</td><td>P0</td></tr><tr><td>导入</td><td vertical-align="top">自定义库导入四阶段流程</td><td vertical-align="top">上传→解析校验→执行导入→导入完成</td><td>P0</td></tr><tr><td></td><td vertical-align="top">导入策略选择</td><td vertical-align="top">全量覆盖 、新增/更新设备型号</td><td>P0</td></tr><tr><td></td><td vertical-align="top">预检反馈页</td><td vertical-align="top">通过✅ / 失败❌ （失败的原因归类呈现）</td><td>P0</td></tr><tr><td></td><td vertical-align="top">导入实时进度条</td><td vertical-align="top">告知用户当前进展</td><td>P0</td></tr><tr><td></td><td vertical-align="top"><del>导入完成 xlsx 报告</del></td><td vertical-align="top"><del>方便用户快速定位问题</del></td><td><del>P0</del></td></tr><tr><td><del>内置库</del></td><td vertical-align="top"><del>内置库在线更新</del></td><td vertical-align="top"><del>联网拉取最新内置库</del></td><td><del>P0</del></td></tr><tr><td></td><td vertical-align="top"><del>内置库离线导入</del></td><td vertical-align="top"><del>断网场景兜底                                                       </del></td><td><del>P0</del></td></tr><tr><td></td><td vertical-align="top"><del>内置库冲突提示</del></td><td vertical-align="top"><del>与自定义库同名冲突时到导入成功，结果告知用户自定义库改名</del></td><td><del>P0</del></td></tr><tr><td></td><td vertical-align="top"><del>内置库网络异常处理</del></td><td vertical-align="top"><del>超时30s/连接失败 → 提示</del></td><td><del>P0</del></td></tr><tr><td><del>导出</del></td><td vertical-align="top"><del>设备库导出优化</del></td><td vertical-align="top"><del>增加进度条</del></td><td><del>P0</del></td></tr><tr><td></td><td vertical-align="top"><del>导出前厂商未完善提示</del></td><td vertical-align="top"><del>厂商为空时 toast 提示</del></td><td><del>P3（非MVP）</del></td></tr></tbody></table>

# 四、需求说明   

## 4.1 设备库容量

<synced-source><h3 seq="auto" seq-level="auto">模板数量上限</h3><table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th vertical-align="top">类型</th><th vertical-align="top">现有上限</th><th vertical-align="top">建议上限</th><th vertical-align="top">调整依据</th></tr></thead><tbody><tr><td vertical-align="top">内置模板</td><td vertical-align="top">500</td><td vertical-align="top">&gt;3000（实际可行值研发提供）</td><td vertical-align="top">Wattsense 已有约 1990 条，未来覆盖率提升需要充足空间。至少3000 ≈ 1990 × 1.5，预留 50% 增长空间</td></tr><tr><td vertical-align="top">自定义模板</td><td vertical-align="top">500</td><td vertical-align="top">500</td><td vertical-align="top">当前 500 上限可覆盖绝大多数项目场景（单网关通常接入 ≤100 台设备，每台设备引用 ≤5 个模板）。代理商大规模内置场景（模板包超 500）属于极端场景，优先级低于其他需求，本期维持 500 不调整</td></tr></tbody></table></synced-source>

### 单模板对象数量上限

| 协议 | 现有上限 | 建议上限 | 调整依据 |
|-|-|-|-|
| Modbus RTU/TCP | 100 | >2000 | Wattsense 真实设备最大 1008（Komfovent、Schneider 电表等），100 的上限会直接卡住主流楼控设备 |
| BACnet | 100 | >2000 | 主流楼控 DDC（Siemens、JCI）常见 300–1000 个对象，与 Modbus 对齐统一为 2000 |
| KNX | 100 | 512 | Wattsense 中 Siemens Synco 系列最高 480，保持同 LoRaWAN 相同的上限 |
| LoRaWAN | 300→512 | 512 | 目前 LoRaWAN 已调整到 512（Wattsense 最高 266） |
| M-Bus | — | 100 | M-Bus 设备对象数普遍偏少（10–60），100 覆盖热量表上限场景 + 预留非标准设备空间；详见《对象分组》M-Bus 分析 |

> 这是最低标准，研发评估网关性能（内存、采集调度）看性能上是否有问题。

## 4.2 自定义库导入

### 决策依据

**A-1 厂商名匹配采用严格匹配，不做模糊匹配**

> 依据：模糊匹配规则对用户不透明，误判后用户无法理解。严格匹配规则简单可预测——`Honeywell` = `honeywell` 归入同一厂商，`honey-well` 视为新厂商。导入后若出现相似厂商脏数据，由模板维护者通过修改模板厂商字段手动整理（后续再支持批量修改）。

**A-2 双导入模式：全量覆盖 + 新增/更新设备型号，在预检页选择**

> 依据：SI/SP 在不同场景下的意图不同：
> 
> - **全量覆盖**：项目交付前，以标准模板包重建自定义库，确保网关与交付标准完全一致。ZIP = 目标库的完整状态，不在 ZIP 中的型号将被删除。
> - **新增/更新设备型号**：项目运行中新增一种设备类型，不想动已有型号。ZIP = 本次要新增/更新的型号，不在 ZIP 中的型号保留不动。否则只有全量覆盖，需要用户手动先导出+调整+重新导入，增加了需要导出系统已有全量数据的操作
> 
> 两种模式的校验规则、冲突判定、阻断逻辑完全一致，唯一区别是**不在 ZIP 中的已有型号是否删除**。

**A-3 被引用型号不允许删除，阻断整包导入**

> 依据：型号被设备引用意味着有设备正在依赖此模板采集数据，现有界面就无法删除，导入保持同界面相同逻辑。

**A-4 型号名全局唯一 + 冲突解需厂商+协议匹配**

> 依据：型号名是用户识别设备模板的首要维度，全局唯一简化搜索和引用逻辑。但冲突能否自动解决（覆盖更新）需更严格的条件——只有**厂商相同且协议相同**时才允许覆盖更新，否则阻断。
> 
> 冲突判定逻辑：
> 
> - 型号名相同 + 厂商相同 + 协议相同 → **允许自动更新**
> - 型号名相同 + 厂商不同（比如一个是milesight，一个厂商为空） → **阻断整包**
> - 型号名相同 + 协议不同 → **阻断整包**
> - 型号名不同 → 新增
> 
> 特殊值：当型号未归类到任何厂商时，视为相同厂商，可互相覆盖。厂商为空与任何具体厂商名视为不同厂商，阻断覆盖。

**A-5 跨厂商/跨协议冲突阻断整包导入**

> 依据：跨厂商覆盖会导致厂商变更（Milesight 的 AM103 → Honeywell 的 AM103），用户无法预期这种隐含变更。跨协议覆盖会导致协议变更（Modbus 的 AM103 → LoRaWAN 的 AM103），设备引用的协议类型与实际不匹配，采集逻辑断裂。两种情况均属于数据层面的不可逆变更，阻断是最安全的处理方式。

### 导入流程

导入分四个阶段：**上传文件 → 解析校验 → 执行导入 → 导入完成**

```Plain Text
第一阶段：上传文件
                       

第二阶段：解析校验
  ┌─ 扫描阶段
  │  ┌─ ZIP 损坏 → ❌ 只报1条"文件已损坏"
  │  └─ 解压成功 → 扫描 ZIP 包的整体结构合规性（必填文件和目录的存在性）
  │     ┌─ 有致命错误 → ❌ 报告所有ZIP包级问题
  │     └─ 无致命错误 → 进入解析阶段
  │
  └─ 解析阶段（进度百分比）
     ┌─ 解析完成 
     │  ├─ 解析失败：展示失败信息 + xlsx 错误文件
     │  └─ 解析成功：默认采用全量覆盖，无需策略选择
     │     ┌─ 全量覆盖 → 用zip全量替换系统的文件
     │     └─ 新增/更新设备型号 → 新增+更新(设备型号下的对象将以zip为准)

第三阶段：执行导入
  进度条：已导入 N / 总计 N ，实时进度条

第四阶段：导入完成
   ┌─ 导入成功 → 删除备份 → → 展示结果摘要 （不展示摘要，仅告知结果）
   └─ 导入异常 → 回滚至导入前状态
```

#### 第一阶段：上传文件

##### **规则与约束**：

- 文件格式非 .zip → 上传区域直接提示错误，终止
- 文件超过 N **MB**（⚠️ 研发确认） → 上传区域直接提示错误，终止

> 未来 3500 个设备模板 + 增加厂商字段 + 对象分组+ 常用推荐等信息后，**最终数值以研发评估为准**。

**错误**：

| 错误类型 | 说明 |
|-|-|
| 文件类型错误 | 仅支持zip类型文件 |
| 大小超限 | 提示"文件超过 N MB，无法上传" |

##### **交互说明：**

**Figma 画面**：

- 默认上传窗口：[自定义设备库-默认上传窗口](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=189-42111)
- 选择上传文件后：[自定义设备库-选择上传](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=270-10632)
- 上传成功：[自定义设备库-上传成功](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=189-42117)
- 上传失败（文件类型/大小错误）：[自定义设备库-上传失败](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=189-38621)

**交互要点**：

1. Upload-Drag 组件：拖拽上传区域，支持 click 上传，文案 "Drag & drop or click to upload, .zip file, max N MB"
2. 文件类型校验：非 zip → 上传区域内直接提示错误文字      "Only .zip files are supported"，不弹 toast 
3. 文件大小校验：超限 → 上传区域内直接提示 "File exceeds N MB limit"，不弹 toast
4. 上传成功后 → 自动进入解析校验阶段（无需用户确认）

**状态机（Upload 区域）**：

| 状态 | 视觉 | 触发条件 |
|-|-|-|
| default | 空上传区域 + 提示文案 | 初始加载 |
| drag-hover | 边框高亮 + 底色浅蓝 | 文件拖入上传区域 |
| uploading | Progress 进度条 + Spin icon | 文件正在上传 |
| success | 自动跳转到解析校验阶段 | 上传完成 |
| error-type | 红色边框 + 错误文案 | 文件格式非 zip |
| error-size | 红色边框 + 错误文案 | 文件大小超限 |

#### 第二阶段：解析校验

##### **1、ZIP包级别**

ZIP 包级错误为**致命错误**，出现任何一个即终止，不继续解析。

| 错误 | 错误说明 |
|-|-|
| ZIP 损坏 | 解压失败，连目录树都看不到 |
| version.json 文件不存在 | 无法识别包版本，且这是根入口文件 |
| version.json 多个（待确认） | 根目录存在多个大小写不同的同名文件（如 `version.json` + `Version.json`） |
| version.json 内容为空 | 无法定位厂商信息 |
| version.json 的 `vendors` 字段缺失 | 指向错误路径则无法定位厂商信息 |
| vendors.json 文件不存在 | 无法找到任何厂商信息，后续全断 |
| vendors.json 多个（待确认） | 根目录存在多个大小写不同的同名文件（如 vendors`.json` + Vendors`.json`） |
| vendors.json内容为空 | 无法获取厂商信息 |
| vendors/ 目录不存在 | 没有厂商文件夹，整个数据层不存在 |

##### 2、厂商级

解析 vendors.json 后，逐厂商校验

> 特殊值 ：当型号未归类到任何厂商时，归为_none厂商， 视为合法厂商，两个都是厂商为空的型号，匹配时视为相同厂商。空厂商与任何具体厂商名视为不同厂商。参考[空厂商](https://milesight.feishu.cn/wiki/QeZewRfttiznsCkUn3pcSWkonsA#share-IKc7dWvWIoXR6TxgOnycihafnVe)

| 错误 | 说明 |
|-|-|
| vendors.json 中某个厂商条目缺少 ~~id/~~name |  |
| vendors.json 中某个厂商 ~~id/~~name 不符合约束 |  |
| vendors.json 中厂商 ~~id /~~ name 重复 |  |
| vendors.json 中 devices 字段指向的路径不存在 |  |
| 厂商文件夹不存在（vendors.json 中引用的） |  |
| 厂商文件夹与厂商的名称不匹配 |  |
| devices.json 不存在 |  |
| devices.json 多个 |  |
| devices.json 为空 |  |
| oui 不满足数据约束 |  |

##### 3、型号级别**（该章节需研发确认是否有问题）**

解析 devices.json 后，逐型号校验

###### **devices.json 字段校验**

| 字段 | LoRaWAN | KNX/BACnet/Modbus | 说明 |
|-|-|-|-|
| id | 可选 | 可选 | 唯一标识 |
| name | 必需  | 必需 | 列表显示名，唯一标识 |
| description | 可选  | 可选 | 可空 |
| protocol | 必需 | 必需 |  |
| catalog | 可选 | 可选 |  |
| template_id | 可选 | 可选 | 有引用模板的时候才有 |
| sn | 可选  | —— | 可空 |
| pn | 可选 | —— |  |
| deveui | 可选  | —— | 仅作为默认选择界面回填，用户可以手动输入 |
| device_profile | 必需  | —— | 仅 LoRaWAN |
| codec | 必需 | 必需 | gs524n 无此字段，在界面上就不展示了 |
| decoder_script | 必需  | —— | gs524n仅此字段，有codec必须有decode才能解析 |
| encoder_script | 可选 | —— | gs524n 为空字符串 `""`，只要不下行就可以不需要 |
| ipso_version | 可选 | —— | 为空或是错误忽略，默认采用ipso_version = v2 |

**⚠️ 需要确认**：没有 codec 字段当前页面不展示，作为有问题的数据无法被用户引用

| 错误 | 说明 |
|-|-|
| 型号文件夹不存在（devices.json 中指定的） |  |
| 型号子文件夹为空 |  |
| devices.json 中某个型号 缺少~~id/~~ name |  |
| devices.json 型号中  ~~id/~~name 不符合约束 |  |
| devices.json 型号中  ~~id/~~name 重复 |  |
| devices.json 型号中 description 字段不符合约束 |  |
| devices.json 型号中 protocol 字段缺失 |  |
| devices.json 型号中 protocol 不符合规范 |  |
| devices.json 型号中 catalog 不符合规范 |  |
| devices.json 型号中 template_id 不符合规范 |  |
| devices.json 型号中 sn 不符合规范 |  |
| devices.json 型号中 pn 不符合规范 |  |
| devices.json 型号中 deveui 不符合规范 |  |
| ~~devices.json 型号中 deveui 在lorawan协议下缺失~~ |  |
| devices.json 型号中 device_profile 不符合规范 |  |
| devices.json 型号中 device_profile 在lorawan协议下缺失 |  |
| devices.json 型号中 codec 字段缺失 |  |
| devices.json 型号中 codec 文件不存在 |  |
| devices.json 型号中 decoder_script 在lorawan协议下字段缺失 |  |
| devices.json 型号中 decoder_script 在lorawan协议下字段值为空 |  |
| devices.json 型号中decoder_script  文件不存在 |  |
| ~~devices.json 型号中 encoder_script 在lorawan协议下字段缺失~~ |  |
| ~~devices.json 型号中 encoder_script 在lorawan协议下字段值为空~~ |  |
| ~~devices.json  型号中 encoder_script 文件不存在~~ |  |
|  devices.json 中version 字段缺失 |  |
| devices.json 中version 字段不满足规范 |  |

###### **codec.json 字段校验**：~~（~~[~~同步71.0.0.3 迭代优化~~](https://milesight.feishu.cn/wiki/ZWe9w3WY7ighqikSYGbcIGIUnRf#share-Ku7vd2lkwoNrlgxeceRcTRiwnpl)~~）~~

**1. JSON 顶层结构（所有协议类型）**

```JSON
{
    "object": []
}
```

| 顶层字段 | 必填 | 类型 | 数量 | 限制说明 |
|-|-|-|-|-|
| version | 否 | 字符串 | - |  格式：x.x.x |
| bytes | 否 | 字符串 | - | hex格式 |
| `object` | 是 | 数组 | [参照协议上限](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-NFe1d85jPoXQd9xr6OEc7bH1nph) | 对象列表，缺失时校验失败 |

参考：<cite doc-id="Hg3dwYmHNiTZiikjrIBcEYUknBh" file-type="wiki" table-id="tblTXXP9iw4HTdFo" title="输入限制汇总" type="doc" view-id="vew2Y9wfrB"></cite>

###### group.json 字段校验（同步对象分组需求）

<synced_reference src-block-id="PcJ4dnV3ks6cNBb7M1ncbQSdn3g" src-token="Gkqcddd7sodTWXxAwJJcr98ynpd"></synced_reference>

##### 4、交互设计

###### 4.1 解析流程

**Figma 画面**：

- 扫描阶段进度：[解析中-扫描阶段](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=223-1829)
- 解析阶段进度：[解析中-解析阶段](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-77381)
- 扫描阶段提示弹窗：[扫描阶段提示弹窗](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=422-85633)

**交互要点**：      

研发评估，若是导入时间超过30s，则需要增加进度条，告知用户当前进展，避免用户以为是系统出现问题。

1. 解析进度分两段：扫描（5%）+ 解析（95%），扫描阶段有提示弹窗告知"正在检查文件结构"
2. 解析过程中有 Progress 进度条 + 百分比 + 文件数提示"已解析 M/N 文件"
3. 解析过程中允许取消（[取消导入] 按钮）→ 取消后中止任务
4. [ZIP 包级致命错误 ](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-VqFnd7Dpnoh9CXxRPrqcybFBnRc)→ 直接进入失败页（❌ 导入失败），不继续解析，失败提示参见：[ZIP包级致命错误](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-BwXfdxRx4oUsodxSsYYcVvg9nsd)                               

**状态机（解析进度）**：

| **状态** | **视觉** | **触发条件** |
|-|-|-|
| scanning | 平滑过度到5% + 提示弹窗"正在检查文件结构" | 上传成功，进入扫描 |
| scanning-cancelable | [取消导入] 按钮 | 扫描过程中 |
| parsing | 进度条 + 百分比 + "已解析 M/N" | 扫描通过，进入解析 |
| parsing-cancelable | [取消导入] 按钮 | 解析过程中 |
| zip-error | ❌ 导入失败 + 致命错误列表 + [重新上传] | ZIP 包级致命错误 |

###### 4.2 校验规则

**ZIP 包级通过 → 厂商级 + 型号级校验 → 预检结果页**

<table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th>类别</th><th>说明</th><th>全量覆盖</th><th><b>新增/更新设备型号</b></th></tr></thead><tbody><tr><td>校验失败（厂商级）</td><td>厂商数据有问题</td><td><b>阻塞</b></td><td>与全量覆盖保持一致</td></tr><tr><td>校验失败（型号级）</td><td>型号数据有问题</td><td><b>阻塞</b></td><td>与全量覆盖保持一致</td></tr><tr><td>冲突（型号已存在）</td><td>相同型号+相同厂商+协议，<b>被引用</b></td><td><b><del>不阻塞</del></b><del>，同页面保持一致（允许更新）</del><br/><b>不阻塞，</b>不更新，直接跳过<blockquote><p>这里界面和导入逻辑有差异：界面上被引用型号：允许新增新对象，删除未被引用对象，编辑编辑被引用/未被引用对象，不允许删除被引用对象）</p></blockquote></td><td>与全量覆盖保持一致</td></tr><tr><td></td><td>相同型号+相同厂商+协议，<b>未被引用</b></td><td><b>不阻塞，</b>可更新</td><td>与全量覆盖保持一致</td></tr><tr><td></td><td>相同型号name，<b>厂商或协议不同</b></td><td><b>阻塞，</b>型号名称全局唯一</td><td>与全量覆盖保持一致</td></tr><tr><td></td><td>相同型号+相同厂商+协议(lorawan)，<b>DevEUI Prefix 不同</b><blockquote><p>现状：</p><p>1、型号被引用不允许更新</p><p>2、型号没引用允许更新</p></blockquote></td><td>阻塞，同界面保持一致（已引用的不允许修改DevEUI；未引用的允许修改 ）</td><td>与全量覆盖保持一致</td></tr><tr><td>删除型号</td><td>相同型号+相同厂商+协议，<b>被引用</b></td><td><b><del>阻塞，</del></b><del>同界面保持一致，不允许删除</del><br/><b>不阻塞</b>，也不删除，直接跳过</td><td>无</td></tr><tr><td></td><td>相同型号+相同厂商+协议，<b>未被引用</b></td><td><b>不阻塞，</b>可删除</td><td>无</td></tr></tbody></table>

**原则：按导入的包进行全量覆盖**

1. 新增设备型号——允许新增
2. 设备型号没有引用，在zip包中删除——允许删除
3. 设备型号有被引用，在zip包中删除——不允许删除，忽略跳过
4. 设备型号没有引用，在zip包中更新——允许更新
5. 设备型号有被引用，在zip包中更新（即：存在同名的设备型号直接跳过）——不允许更新，忽略跳过

针对忽略跳过的，后端直接返回导入结果呈现：Model import complete ({vendorCount} vendors): {created} created, {updated} updated, {deleted} deleted, {retained} skipped (in use).

<table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th>库型号</th><th>ZIP包型号</th><th>EG71现状</th><th>改造方案</th></tr></thead><tbody><tr><td>a——被引用</td><td>a——无变更（即导出后重新导入）/a更新/a删除</td><td>报错<img name="image.png" alt="图片展示的是设备库中自定义库界面。上方有“Built-in Device Repository”和“Custom Device Repository”选项卡，当前选中“Custom Device Repository”。下方显示“a_use”型号的设备库信息，协议类型为LoRaWAN，对象数量25，设备引用计数1。右侧有“+ Add”“Import”“Batch Export”按钮，以及“Operation”列的编辑和删除图标。红色提示框显示“Duplicate device model names found, please rename and continue”，提示存在重复设备型号，需重命名继续。" mime="image/png" scale="1.000000" src="LqPUbun5EoOD93x9cetc18KQnih"/></td><td>允许导入，保留a</td></tr><tr><td>a——被引用</td><td>c——新增</td><td>导入成功<img name="image.png" alt="图片展示的是设备库导入后的界面。上方显示“Data Service - Device Library”及Gateway信息。下方有“Built-in Device Repository”和“Custom Device Repository”选项卡，当前选中“Custom Device Repository”。界面中有“Add”“Import”“Batch Export”按钮。列表显示了设备模型“c-updata”和“a_use”，其中“a_use”被选中，其协议类型为LoRaWAN，对象数量为25，设备引用计数为1，操作栏有编辑和删除图标。右上角显示“Import success 1, failure 0”。" mime="image/png" scale="1.000000" src="MEgPb9CoJoP4pexYtP1cUJsDnS5"/><br/>最终：a+c</td><td>允许导入，保留a+新增c<br/>被引用的无法删除，默认跳过</td></tr><tr><td>a——被引用<br/>c——无引用</td><td>c——更新</td><td>导入成功，保留a+更新c<img name="image.png" alt="该图片展示了设备库自定义导入阶段的操作界面，界面顶部显示“Import success 1, failure 0”的提示，表明自定义库导入操作成功，无失败项。界面的核心区域为设备列表，包含两条设备信息，分别为设备型号“c-updata”“a_use”，它们的协议类型均为LoRaWAN，对象数量分别为1和25，设备引用计数分别为0和1，每条数据右侧配有编辑和删除操作图标，界面还提供添加、导入、批量导出的功能按钮。" mime="image/png" scale="1.000000" src="ZiYjbGhVPo6DELxpJtfcuk4Rnpc"/></td><td>导入成功，保留a+更新c</td></tr><tr><td>a——被引用<br/>c——无引用</td><td>a——保留/更新</td><td>报错，不更新a+删除c<img name="image.png" alt="这张设备库相关的界面里，顶部路径为Data Service &gt; Device Library，界面右侧显示GATEWAY编号6438F39156400001；中间有红色弹窗提示“Duplicate device model names found, please rename and continue”，表示检测到重复的设备型号名称需重命名后继续操作；下方是设备型号列表，包含两行数据，分别是型号c-updata（对应LoRaWAN协议，关联对象数1，设备引用计数0）和型号a_use（对应LoRaWAN协议，关联对象数25，设备引用计数1），列表右上角有添加、批量导入、批量导出的操作按钮，每个型号右侧还有编辑和删除的操作图标。" mime="image/png" scale="1.000000" src="Uf7KbFS7vo1J8ExCobEcyZ7WnTd"/><img name="image.png" alt="图片展示的是设备库界面，处于“Custom Device Repository”标签下。界面上方有“Data Service”和“Device Library”选项，右侧显示“GATEWAY 6438F39156400001”及“编辑”按钮。下方有“Add”“Import”“Batch Export”按钮，列表显示设备模型“a_use”、协议类型“LoRaWAN”、对象数量“25”、设备引用计数“1”，操作栏有编辑和删除图标。该图与文档中自定义库导入的交互设计内容相关，展示了导入后的设备库界面情况。" mime="image/png" scale="1.000000" src="HFBnba1L6oHuJkxdza1cIUJ9n6f"/></td><td>允许，保留a+删除c</td></tr><tr><td>a——被引用<br/>c——无引用</td><td>a——保留/更新<br/>c——不变/更新</td><td>报错，保留a+删除c<img name="image.png" alt="图片展示的是设备库界面。上方显示“Data Service”和“Device Library”，右侧有“GATEWAY”及编号。中间提示“Duplicate device model names found, please rename and continue”。下方有“Add”“Import”“Batch Export”按钮，列表显示设备模型“c - updata”“a - use”，协议类型均为LoRaWAN，对象数量分别为1、25，设备引用计数分别为0、1，操作栏有编辑和删除图标。该图与文档中自定义库导入解析校验交互设计相关，用于展示导入过程中遇到的设备模型名称重复问题。" mime="image/png" scale="1.000000" src="Bcd3b1RZ4oGLQPxa21scUZpZnWg"/><img name="image.png" alt="这张图片是设备库功能的操作界面，顶部显示当前路径为Data Service下的Device Library，页面选中“Custom Device Repository（自定义设备库）”标签页，其左侧为“Inbuilt Device Repository（内置设备库）”。界面提供“Add”“Import”“Batch Export”三个操作按钮，下方展示了一条设备数据记录，该设备型号为a_use，协议类型为LoRaWAN，关联对象数为25，被引用次数为1，右侧还有编辑和删除的操作图标，内容与文档中EG71设备库自定义导入的功能场景对应，体现了设备库的管理操作入口与设备数据展示情况。" mime="image/png" scale="1.000000" src="O9vPbXVd2oTj3Ax7wyicpNdmng1"/></td><td>导入成功，保留a+保留c/更新c</td></tr><tr><td>b——无引用</td><td>b——更新</td><td>导入成功，更新b</td><td>导入成功，更新b</td></tr><tr><td>b——无引用<br/>c——无引用</td><td>c——无变更/更新</td><td>导入成功，删除b+保留c</td><td>导入成功，更新b</td></tr><tr><td>b——无引用<br/>c——无引用</td><td>c——更新<br/>d——新增</td><td>导入成功，删除b+更新c+新增d</td><td>导入成功，删除b+更新c+新增d</td></tr></tbody></table>

###### 4.3 校验失败呈现

**Figma 画面**：

- 校验结果失败：[校验结果失败](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=238-16636)

**交互要点**：

1. 校验失败页：展示错误大类（厂商级+设备型号级）和详细错误说明（列出每个设备型号的错误总数+错误文件）
2. 提供 [下载完整失败报告 (xlsx)] 链接和拷贝按钮。错误提示参见：[错误汇总章节](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-P2J0dEZN1oZxKixQtAUciqKtnxe)
3. 提供 [重新上传] 按钮

**状态机（校验失败页）**：

| 状态 | 视觉 | 触发条件 |
|-|-|-|
| collapsed | 错误大类和详细错误说明 | 默认 |
| expanded | 按交互规范展示，多数据滚动展示 | 下拉滚动 |
| download | xlsx 文件下载 | 用户点击下载链接 |

**excel表格**

汇总提供详细的问题原因，方便用户知悉问题并调整，所以一个厂商根据错误数展示多条数据

1、文件名称：EG71-device-models-import-error-xxx(网关SN)-版本-YYYYMMDD-xxxx(4位时间序号).xlsx

2、sheet名称：Manufacture Errors、Device Models Errors

3、厂商失败列名：厂商名称、错误原因（[参考错误章节](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-HP5sd5tTEorHF4xf4Hzct6pdnqb)）、定位路径

4、型号识别列名：型号名、厂商、协议、错误原因（[参考错误章节](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-HP5sd5tTEorHF4xf4Hzct6pdnqb)）、定位路径

Manufacture Errors示例：

| 厂商名称 | 错误原因 | 定位路径 |
|-|-|-|
| Honeywell iot | 厂商 name 格式错误 | vendors.json |
| Honeywell-iot | devices.json 为空 | vendors/honeywell-iot/ |
| Honeywell-iot | 厂商 name 格式错误 | vendors.json |
|  | 厂商名称为空 | vendors.json |

Device Models Errors示例：

| 型号名 | 厂商名 | 协议 | 错误原因 | 定位路径 |
|-|-|-|-|-|
| AM102 | Honeywell-iot | lorawan | 缺少 codec.json | vendors/Honeywell-iot/am-series/am102/ |
|  | Honeywell | lorawan | 型号名称为空 | vendors/Honeywell/devices.json |

<synced-source><h6>4.4 校验通过——策略选择（71.0.0.4因前端无资源，默认为全量覆盖）</h6><p>   默认为覆盖更新，无策略选择页面让用户选择。所以删除设备的校验需要相应的放到第二个解析校验步骤中。</p><p><b><del>Figma 画面</del></b><del>：</del></p><ul><li><del>校验通过（预检页）：</del><a href="https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-77474"><del>校验通过</del></a></li></ul><p><b><del>交互要点</del></b><del>：</del></p><ol><li seq="1"><del>预检通过页：用户可以选择"全量覆盖 、新增/更新设备型号"（仅自定义库中有设备型号时，需要让用户选择；若是自定义库中没有任何设备型号，则不展示该页面，直接进入到下一步执行导入流程）</del></li><li><del>切换后：下方结果实时更新（新增 N / 更新 N / 删除 N 或不涉及删除）——值为0的不展示该项</del></li><li><del>全量覆盖：</del><ol><li seq="1"><del>显示醒目提示"</del><del>不在 ZIP 中的已有型号将被删除</del><del>"</del></li><li><del>新增型号：直接呈现数据（如有）</del></li><li><del>更新型号：</del><ol><li seq="1"><del>直观展示更新的数量（如有，且设备型号没有被设备引用）</del></li><li><del>有被设备引用：增加提示说明，5个设备型号被设备引用，本次仅更新设备型号，设备需手动更新，并列出型号列表</del></li></ol></li><li><del>删除型号：</del><ol><li seq="1"><del>直接呈现数据（如有，且未被设备引用）</del></li><li><del>被设备引用：确认按钮禁用 + 告知原因：2个设备型号被使用，无法删除，并列出具体型号列表+提示"切换【新增/更新设备型号】或先解绑设备"</del></li></ol></li></ol></li><li><del>新增/更新设备型号：</del><ol><li seq="1"><del>显示醒目提示"不在 ZIP 中的已有型号保留不动；已存在同名型号将以 ZIP 包为准"</del></li><li><del>新增型号：直接呈现数据（如有）</del></li><li><del>更新型号：</del><ol><li seq="1"><del>直观展示更新的数量（如有，且设备型号没有被设备引用）</del></li><li><del>有被设备引用：增加提示说明，5个设备型号被设备引用，本次仅更新设备型号，设备需手动更新，并列出型号列表</del></li></ol></li></ol></li></ol></synced-source>

**~~状态机（预检通过页）~~**~~：~~

| ~~状态~~ | ~~视觉~~ | ~~触发条件~~ |
|-|-|-|
| ~~预检通过-新增/更新设备型号~~ | ~~"新增/更新设备型号" 选中 + 结果摘要（新增/更新）~~ | ~~默认/新增/更新设备型号更新选中~~ |
| ~~预检通过-全量覆盖~~ |  ~~"全量覆盖" 选中 + 删除型号列表 + 醒目删除提示~~ | ~~全量覆盖选中~~ |
| ~~全量覆盖-阻断~~ | ~~确认按钮禁用 + 红色提示 + 被引用型号列表~~ | ~~删除型号中被引用型号存在~~ |

###### 4.5 异常情况

1. 非用户主动中止或是完成任务的情况，都算异常情况，比如：F5页面刷新、关闭浏览器等，都算任务中止。

注意：当前在任务执行过程，session要自动延迟。

1. 多账号登录/单账号多窗口：则提示用户，当前存在导入任务。

   ```XML
   ┌─────────────────────────────────────┐
   │  ⚠️  已存在导入任务                  │
   │                                     │
   │  请等待当前导入任务完成后再试。        │
   │                                     │
   │            [ 确定 ]                 │
   └─────────────────────────────────────┘
   ```



#### 第三阶段：执行导入

- 用户主动取消：用户正常使用中不会在导入的过程中取消，但保持交互一致性（与异常情况取消任务），放置取消按钮允许用户中途取消，则回滚数据库。
- ⚠️ 导入过程中异常情况（比如：网关断电/崩溃时），全量写入失败任务回滚
- ⚠️ 导入过程中异常情况（比如：用户刷新/关闭浏览器），取消任务

**Figma 画面**：

- 执行导入进度：[执行导入](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=271-10990)

**交互要点**：

1. 执行导入期间： loading 遮罩 + 实时进度条（"正在写入 N/M 型号"）+取消按钮+  信息提示"数据写入中，请勿断电或关闭页面"
2. 进度条显示：已导入 M 型号 / 总计 N 型号，实时更新
3. 导入期间所有其他操作锁定（禁止再次导入、导出、编辑/删除模板）
4. 取消，则任务中止，写入数据全部失败回滚

**状态机（执行导入）**：

| **状态** | **视觉** | **触发条件** |
|-|-|-|
| importing | 遮罩 + 进度条 + "正在写入 N/M" + 取消按钮+信息提示 | 点击确认导入 |
| cancel | 取消遮罩，终止任务 | 用户点击取消 |
| Error  | 展示错误信息告知用户异常，导入失败 | 导入过程中出现异常 |

#### 第四阶段：导入完成

直接toat提示写入成功，不展示具体详细信息给客户。

**~~Figma 画面~~**~~：~~

- ~~导入完成提示：~~[~~导入完成提示~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=272-43587)

**~~交互要点~~**~~：~~

1. ~~导入完成分三种场景：新增/更新设备型号 成功（有/无被引用型号更新）+ 全量覆盖成功~~
2. ~~被引用型号更新提示：显示具体型号名 + 引用设备数 + "请前往设备管理手动更新这些设备"~~
3. ~~值为 0 的项省略不展示（如只有新增时不展示"更新 0 / 删除 0"）~~

**~~状态机（导入完成）~~**~~：~~

| ~~状态~~ | ~~视觉~~ | ~~触发条件~~ |
|-|-|-|
| ~~success-append-with-ref~~ | ~~✅ 导入完成（新增/更新设备型号）+ 被引用型号列表 + [返回设备库]~~ | ~~新增/更新设备型号成功且有被引用型号更新~~ |
| ~~success-append-no-ref~~ | ~~✅ 导入完成（新增/更新设备型号）+ 结果摘要 + [返回设备库]~~ | ~~新增/更新设备型号成功且无被引用型号更新~~ |
| ~~success-full--with-ref~~ | ~~✅ 导入完成（全量覆盖）+ 被引用提示 + [返回设备库]~~ | ~~全量覆盖成功且有被引用型号更新~~ |
| ~~success-full--no-ref~~ | ~~✅ 导入完成（全量覆盖）+ 结果摘要 + [返回设备库]~~ | ~~全量覆盖成功且无被引用型号更新~~ |

## 4.3 内置库更新

### 决策依据

**C-1 内置库支持本地 ZIP 离线导入，作为在线更新的离线兜底**

> 依据：网络隔离场景（工厂/政府楼宇）在楼宇 IoT 项目中属中频场景，非小概率。断网时若需要使用新型号模板（平台已新增但设备上没有），无离线导入能力则完全卡死。通过自定义库导入官方模板作为替代方案不可行——自定义库优先级低于内置库，导入后新模板在自动匹配场景下仍不生效。

**~~C-2 内置库在线更新与离线导入合并为 Obtain ->Update 下拉，不做平级并列~~**

> ~~依据：在线更新是主路径（有网时优先推荐），离线导入是兜底路径（断网场景）。两者都属于"更新内置库"这一意图，合并在同一个下拉操作下语义一致，视觉上也避免两个同权重按钮让用户产生选择困惑。平级并列会误导用户认为两者等价，增加误操作。~~

**C-3 内置库更新遇自定义库同名冲突时，导入成功，但是告知用户自定义库同名的被修改**

> 依据：内置库是一个版本整体，若是存在内置库与自定义库同名的情况，优先保证内置库能顺利更新，保留现有逻辑会自动修改自定义同名的设备型号名称为xxx-1，但是这种隐形规则需要同步知悉用户，用户可感知。

### 校验规则**（该章节需研发确认是否有问题）**

与自定义校验差异：

| 文件 | 字段 | 内置库 | 自定义库 |
|-|-|-|-|
| version.json | version | 必需，且数据格式为：x.x.x；转换后字节长度<16 | 无该字段 |
|  | link | 必需，数据格式：https://网址，<128字符 | 无该字段 |
| vendors.json | logo | 可选；<256字符 | 无该字段 |
|  | website | 可选，<256字符 | 与内置库相同 |
| 厂商文件夹logo文件 | —— | 若vendors.json中logo字段有指定，需要 |  |
| bacnet_unit.md | —— | 文件必需 | 无该文件 |
| devices.json  | codec | 非必需，没有codec则界面不展示 | 必需，否则报错 |
|  | decoder_script | 非必需 | 必需，否则报错 |
|  | encoder_script | 非必需 |  |

### ~~在线更新~~

**~~流程与规则~~**

~~页面右上角保留 `Update` 按钮，点击展开下拉菜单：~~

```
[Update ▼]
  ├── 在线更新（Online Update）：联网从官方平台拉取最新内置库，整包覆盖；
  └── 导入离线包（Import Offline Package）：用于断网场景，手动上传 Milesight 官方发布的标准 ZIP 离线包
```



<synced-source><p><b>更新逻辑</b>：从官方平台拉取最新内置库整包后</p><ul><li>包中已有的型号：<b>更新</b>（若被设备引用，则走快照保留旧版本，新版本正常写入，并告知客户结果）</li><li>包中没有的型号：<b>删除</b>（若被设备引用，不删除，并告知用户结果）</li><li>与自定义库同名冲突：<b>允许整包更新</b>（结果告知用户自定义同名冲突被修改）</li></ul></synced-source>

**~~Figma 画面~~**~~：~~

- ~~内置库-发起在线更新：~~[~~内置库-在线更新~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-78306)
- ~~网络异常：~~[~~在线更新-网络异常~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80062)
- ~~与自定义库冲突：~~[~~在线更新-自定义库冲突~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80809)
- ~~更新完成：~~[~~在线更新-更新完成~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80693)

**~~交互要点~~**~~：~~

1. ~~点击"在线更新" → loading 遮罩 + "正在获取最新内置库..."~~
2. ~~网络异常（30s 超时）→ 遮罩消失 + 红色 Message toast "网络连接失败，请检查网络"~~
3. ~~文件解析中/写入中 → loading 遮罩 + 进度条~~
4. ~~与自定义库冲突 → 不阻断(自动将自定义库的名称修改)~~
5. ~~更新完成 → 成功摘要弹框（新增/更新/删除型号数/自动更改自定义型号名数）~~

**~~状态机（在线更新流程）~~**~~：~~

| ~~状态~~ | ~~视觉~~ | ~~触发条件~~ |
|-|-|-|
| ~~loading-获取~~ | ~~遮罩 + "正在获取最新内置库..."~~ | ~~点击在线更新按钮~~ |
| ~~network-error~~ | ~~遮罩消失 + 红色 toast~~ | ~~30s 超时 / 连接失败~~ |
| ~~loading-解析~~ | ~~遮罩 + 进度条"解析中"~~ | ~~获取成功~~ |
| ~~conflict-block~~ | ~~❌ 错误弹框 + 冲突型号列表~~ | ~~与自定义库同名~~ |
| ~~loading-写入~~ | ~~遮罩 + 进度条"写入中"~~ | ~~解析通过~~ |
| ~~success~~ | ~~✅ 摘要弹框 + [确认] 按钮~~ | ~~更新完成~~ |

### ~~导入离线包~~

**~~流程与规则~~**~~：~~

**~~步骤 1：上传前说明提示~~**

**~~交互要点~~**~~：~~

1. ~~上传前有醒目提示文案 + 官方下载地址链接（用户点击，后台直接下载，避免用户因不知道github该如何下载）~~
2. ~~Upload-Drag 组件：同自定义库导入，但文案不同（"请确保上传的是 Milesight 官方发布的标准离线包"）~~
3. ~~解析/写入流程同在线更新：loading 遮罩 + 进度条~~
4. ~~更新完成后的成功摘要弹框格式与在线更新一致~~
5. ~~导入期间锁定所有操作（禁止在线更新、自定义库导入/导出、编辑/删除模板）~~

**~~Figma 画面~~**~~：~~

- ~~内置库-导入离线包（上传前说明+上传区域）：~~[~~内置库-导入离线包~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=272-44030)

**~~步骤 2：离线包文件格式~~**

- ~~Milesight 官方标准 ZIP，结构与在线更新包一致~~
- ~~文件格式/大小校验同自定义库导入第一阶段~~

~~Figma画面：~~

- ~~内置库-离线包-上传中：~~[~~内置库-离线包-上传中~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=272-44682)
- ~~内置库-离线包-上传完成：~~[~~离线包-上传完成~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80906)
- ~~上传失败（文件类型/大小错误）：~~[~~离线包-文件类型大小错误~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80882)

**~~步骤 3：离线包内部校验~~**

- ~~离线包的 ZIP 包级校验规则与自定义库导入完全一致（ZIP损坏、version.json 缺失/空/多份、vendors.json 缺失、vendors/ 目录缺失等致命错误，复用同一套校验列表）~~
- ~~校验失败时的交互展示也复用自定义库导入设计~~

~~Figma画面：~~

- ~~与自定义库同名冲突处理：离线包-自定义冲突~~
- ~~内置库-离线包-解析中：~~[~~内置库-离线包-解析中~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=386-77137)

**~~步骤 4：导入执行~~**

- ~~实时进度条，交互同自定义库导入第三阶段~~
- ~~导入期间锁定所有操作（禁止：在线更新、自定义库导入/导出、编辑/删除模板），与在线更新并发约束一致~~
- ~~更新逻辑同~~[~~在线更新类似~~](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-BXyidsXMvolJNJxEDkWc1t2hnDc)

~~Figma画面：~~[~~离线包-导入~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=578-145565&m=dev)

**~~步骤 5：完成后展示~~**

~~Figma画面：~~

- ~~更新完成：~~[~~离线包-更新完成（无特殊情况）~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=547-95855&m=dev)
- ~~更新完成（被引用型号创建副本）：~~[~~离线包-更新完成-被引用更新~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80967)
- ~~更新完成（被删除保留）：~~[~~更新完成（被引用型号无法删除）~~](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=457-77312&m=dev)
- 
- ~~更新完成（与自定义重名）：~~

> ~~值为 0 的项省略不展示，避免信息冗余。例如只有新增时展示"新增 N 个型号"，不展示"更新 0 / 删除 0"。~~

### ~~5. 异常情况~~

[~~同自定义库类似~~](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-KFR3d5J4xoQ8eyxZ8RDcSSUynI0)

## ~~4.4 设备库导出~~

**~~交互要点~~**~~：~~

1. ~~导出耗时 ≤ 5s → 无进度展示，导出完成后自动下载 zip 文件 + 遮罩消失~~
2. ~~导出耗时 5-30s → loading 遮罩（无进度条），完成后遮罩消失 + 自动下载~~
3. ~~导出耗时 > 30s → loading 遮罩 + 实时进度条"M 条 / 总 N 条"，完成后遮罩消失 + 自动下载~~
4. ~~导出期间禁止导入；~~

**~~状态机（导出流程）~~**~~：~~

| ~~状态~~ | ~~视觉~~ | ~~触发条件~~ |
|-|-|-|
| ~~instant~~ | ~~无遮罩，自动下载~~ | ~~导出耗时 ≤ 5s~~ |
| ~~loading~~ | ~~遮罩（无进度条）~~ | ~~导出耗时 5-30s~~ |
| ~~progress~~ | ~~遮罩 + 进度条"M 条 / 总 N 条"~~ | ~~导出耗时 > 30s~~ |
| ~~done~~ | ~~遮罩消失 + 自动下载~~ | ~~导出完成~~ |

## 4.5 错误类型汇总表

针对字段不满足系统约束规则的，除了告知用户哪个字段外，还需告知其到底系统的约束规则是什么，比如：

### 1. 上传阶段

| **错误类型与出现情况** | **错误信息（中）** | **错误信息（英）** |
|-|-|-|
| 上传了非 .zip 文件 | 仅支持 .zip 文件，请重新上传 | Only .zip files are supported. Please upload a valid .zip file. |
| 文件超过大小上限 N MB | 文件大小超过 {size} MB 限制 | File size exceeds the {size} MB limit. |

### 2. 解析阶段

注意：要是字段不满足约束规则的，需要在错误提示中告知用户该字段的实际约束，这样用户才能知道该怎么填写该字段。

#### A. ZIP 包级致命错误（前端展示）

| **错误类型与出现情况** | **适用场景** | **错误信息（中）** | **错误信息（英）** |
|-|-|-|-|
| ZIP 文件损坏或无法解压 | 内置+自定义 | 压缩包已损坏或无法解压，请检查文件完整性 | The archive is corrupted or cannot be extracted. Please verify the file integrity. |
| 缺少文件/目录（如 version.json、vendors.json、vendors/ 等） | 内置+自定义 | 缺少文件/目录：{path} | Missing file/directory: {path}. |
| 存在多个同名不同大小写文件（如 version.json + Version.json） | 内置+自定义 | 文件重复：{filename} | Duplicate file: {filename}. |
| 入口 JSON 文件内容为空（version.json / vendors.json 等） | 内置+自定义 | 文件内容为空：{filename} | File is empty: {filename}. |

备注：相同类型的错误，可以归为一个类型，比如缺少文件：version.json、vendors.json.

#### B. version.json 校验（excel-厂商级使用）

| 错误类型 | 出现情况 | 适用场景 | 错误信息（英） |
|-|-|-|-|
| 字段缺失 | 缺少 vendors 字段 | 自定义库导入、内置库离线导入 | version.json is missing the {field} field. |
| 存在多个同名文件 | 如：vendors.json + Vendors.json | 自定义库导入、内置库离线导入 | Duplicate file: {filename}. |
| 字段格式错误 | 内置库 version 不是 x.x.x / 长度 ≥16；link 不是 https / 长度 ≥128 | 内置库离线导入 |  {field} format is invalid: {value}. |

#### C. vendors.json 校验（excel-厂商级使用）

| 错误类型 | 出现情况 | 适用场景 | 错误信息（英） |
|-|-|-|-|
| 缺少文件/目录 | vendors.json 中 devices/logo 指向的文件或目录不存在 | 自定义库导入、内置库离线导入 | Missing file/directory: {path}. |
| 文件为空 | vendors.json 内容为空 | 自定义库导入、内置库离线导入 | File is empty: vendors.json. |
| 字段缺失 | 厂商条目缺少 name / devices 等必填字段 | 自定义库导入、内置库离线导入 | Vendor "{vendor}" is missing the {field} field. |
| 字段格式错误 | name / oui / website / logo 格式或长度错误 | 自定义库导入、内置库离线导入 | Vendor "{vendor}" field {field} is invalid: {value}. |
| 数据重复 | 厂商 name 重复 | 自定义库导入、内置库离线导入 | Duplicate vendor name: {name}. |
| 目录不匹配 | 厂商目录名与厂商 name 不匹配 | 自定义库导入、内置库离线导入 | Vendor directory name mismatch: {path}. |

#### D. devices.json 校验（excel-型号级使用）

| **错误类型** | **出现情况** | **适用场景** | **错误信息（英）** |
|-|-|-|-|
| 缺少文件 | 厂商目录下 devices.json 缺失 | 自定义库导入、内置库离线导入 | Missing file: {path}. |
| 文件重复 | 厂商目录下存在多个大小写不同的 devices.json | 自定义库导入、内置库离线导入 | Duplicate file: {filename}. |
| 文件为空 | devices.json 内容为空 | 自定义库导入、内置库离线导入 | File is empty: {path}. |
| 字段缺失 | 型号缺少 id / name / protocol；自定义库缺少 codec / decoder_script | 自定义库导入、内置库离线导入 | Device model "{model}" is missing the {field} field. |
| 字段格式错误 | id / name / description / catalog / template_id / protocol / device_profile / deveui / sn / pn 等格式错误 | 自定义库导入、内置库离线导入 | Device model "{model}" field {field} is invalid: {value}. |
| 数据重复 | 型号 id / name 重复 | 自定义库导入、内置库离线导入 | Duplicate model {field}: {value}. |
| 缺少文件 | codec / decoder_script 指向的文件不存在；型号目录不存在 | 自定义库导入、内置库离线导入 | Missing file/directory: {path}. |
| 跨厂商/跨协议冲突 | 型号名相同，但厂商或协议不同 | 仅自定义库 | Model "{model}" already exists with a different vendor or protocol and cannot be overwritten. |
| DevEUI 前缀冲突 | LoRaWAN 同名同厂商同协议，DevEUI 前缀不同 | 仅自定义库 | Model "{model}" DevEUI prefix conflicts with the existing model and cannot be updated. |

#### E. codec.json 校验（excel-型号级使用）

| **错误类型** | **出现情况** | **适用场景** | **错误信息（英）** |
|-|-|-|-|
| 缺少字段 | codec.json 缺少 object 数组 | 自定义库导入、内置库离线导入 | Device model "{model}" codec.json is missing the {field}. |
| 数量超限 | 对象数超过协议上限 | 自定义库导入、内置库离线导入 | Device model "{model}" object count exceeds the {protocol} limit of {limit}. |
| 字段缺失 | 对象缺少 id / name / access_mode / data_type | 自定义库导入、内置库离线导入 | Device model "{model}" object is missing the {field}. |
| 字段格式错误 | id / name / description / data_type / access_mode / value_type / values / max_length 等格式错误 | 自定义库导入、内置库离线导入 | Device model "{model}" object field {field} is invalid: {value}. |
| 数据重复 | 同一 codec.json 中对象 id / name 重复 | 自定义库导入、内置库离线导入 | Device model "{model}" object {field} is duplicated: {value}. |
| 引用不存在 | reference 引用的对象 id 不存在 | 自定义库导入、内置库离线导入 | Device model "{model}" reference does not exist: {id}. |
| BACnet 配置错误 | BACnet type / instance_id 等不合法 | 自定义库导入、内置库离线导入 | Device model "{model}" BACnet configuration is invalid: {detail}. |
| Modbus 配置错误 | register_type / data_format / register_num / register_addr 不合法或重叠 | 自定义库导入、内置库离线导入 | Device model "{model}" Modbus configuration is invalid: {detail}. |
| KNX 配置错误 | knx_sign / data_point_type / data_length 不合法 | 自定义库导入、内置库离线导入 | Device model "{model}" KNX configuration is invalid: {detail}. |
| target.bacnet 配置错误 | target.bacnet 中 enable/type/条件字段不合法 | 自定义库导入、内置库离线导入 | Device model "{model}" target.bacnet configuration is invalid. |
| target.modbus 配置错误 | target.modbus 中 enable/register_type/data_format/register_num 不合法 | 自定义库导入、内置库离线导入 | Device model "{model}" target.modbus configuration is invalid. |

<synced-source><h4>F. group.json 校验（excel-型号级使用）</h4><table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th><b>错误类型</b></th><th><b>出现情况</b></th><th><b>适用场景</b></th><th><b>错误信息（英）</b></th></tr></thead><tbody><tr><td>JSON 解析错误</td><td>group.json 文件内容不是合法 JSON</td><td>文件本身语法有误（多余逗号、缺引号等）</td><td>Failed to parse group config JSON: {error}</td></tr><tr><td>缺少字段</td><td>顶层缺少 groups 中的任一必填字段</td><td>文件结构不完整</td><td>Group config is missing field: {field}.</td></tr><tr><td>字段格式错误</td><td>version / product / codec_file 不是字符串；tag_definitions / groups 不是对象；tag 的 description 不是字符串；objects[].codec_id 不是字符串；objects[].tags 不是数组</td><td>字段值类型不匹配</td><td>Group config field "{field}" is invalid: {value}.</td></tr><tr><td>数据重复</td><td>tag 名称重复定义；codec_id 在不同分组中重复出现</td><td>标签或对象归属不明确</td><td>Group config {field} is duplicated: {value}.</td></tr><tr><td>分组层级超限</td><td>groups 嵌套深度超过 7 层（不含 groups 本身）</td><td>分组设计过深，影响渲染和检索</td><td>Group nesting exceeds 7 levels (current: {n}), please simplify the structure.</td></tr><tr><td>引用不存在</td><td>codec_id 在对应的 codec 文件中不存在；tags 引用了未定义的 tag</td><td>编写 group.json 时写错或漏写引用</td><td>Group config reference does not exist: {value}.</td></tr></tbody></table></synced-source>

### 3、预检结果呈现（前端展示）

| 错误类型 | 出现情况 | 适用场景 | 错误信息（中） | 错误信息（英） |
|-|-|-|-|-|
| 被引用型号无法删除 | 全量覆盖模式下，ZIP 缺失型号已被设备引用 | 自定义库+  <br/>内置库 | {n} 个型号被设备引用，无法删除：{models} | The following models are referenced by devices and cannot be deleted: {models}. |
| ~~被引用型号更新提示~~ | ~~更新型号且被设备引用~~ | ~~仅自定义库~~ | ~~{n} 个型号被设备引用，仅更新型号，设备需手动更新：{models}~~ | ~~{n} model(s) are referenced by devices. Only model templates will be updated; please update devices manually: {models}.~~ |
| ~~被引用型号更新提示~~ | ~~更新型号且被设备引用~~ | ~~仅内置库库~~ | ~~{n} 个型号被设备引用，新版本已导入，原版本已自动备份：{models}~~ | ~~{n} models referenced by devices have been updated; original versions automatically backed up: {models}.~~ |
| ~~全量覆盖~~ | ~~全量覆盖模式下，默认提示~~ | ~~仅自定义库~~ | ~~不在 ZIP 中的已有型号将被删除~~ | ~~In full overwrite mode, existing models not in the ZIP package will be deleted.~~ |
| ~~新增/更新设备型号~~ | ~~新增/更新设备型号模式下，默认提示~~ | ~~仅自定义库~~ | ~~不在 ZIP 中的已有型号保留不动；已存在同名型号将以 ZIP 包为准~~ | ~~In add/update mode, existing models not in the ZIP package will be retained; existing models with the same name will be overwritten by the ZIP package.~~ |

### 4、~~内置库在线更新（前端展示）~~

| **~~错误类型~~** | **~~出现情况~~** | **~~适用场景~~** | **~~错误信息（中）~~** | **~~错误信息（英）~~** |
|-|-|-|-|-|
| ~~网络异常~~ | ~~30s 连接超时或 120s 下载超时~~ | ~~仅内置库在线更新~~ | ~~网络连接失败/下载超时，请检查网络~~ | ~~Network connection/download timed out. Please check the network.~~ |
| ~~与自定义库同名冲突~~ | ~~内置库更新与自定义库存在同名型号~~ | ~~仅内置库更新~~ | ~~内置库更新与自定义库存在同名冲突，以下型号将被重命名：{models}~~ | ~~Built-in library update conflicts with custom library models. The following will be renamed: {models}.~~ |
| ~~被引用型号无法删除~~ | ~~全量覆盖模式下，ZIP 缺失型号已被设备引用~~ | ~~自定义库+~~  <br/>~~内置库~~ | ~~{n} 个型号被设备引用，无法删除：{models}~~ | ~~The following models are referenced by devices and cannot be deleted: {models}.~~ |
| ~~被引用型号更新提示~~ | ~~更新型号且被设备引用~~ | ~~仅内置库库~~ | ~~{n} 个型号被设备引用，新版本已导入，原版本已自动备份：{models}~~ | ~~{n} models referenced by devices have been updated; original versions automatically backed up: {models}.~~ |

## 4.6 页面约束调整

内置库中存在枚举值，但是只有一条的情况，与界面不匹配：

![这张图片展示了与设备库相关的代码编辑界面，左侧的文件列表中红框标注了`em400-udl-code.json`文件，表明这是当前操作的目标文件。右侧代码区域中，红框标注的部分为`values: \[{ "value": 0, "name": "standard" }\]`，对应了上下文提及的内置库枚举值仅一条的情况，代码中此处默认设置的枚举值仅有0这一个选项。代码上方还标注了`working_mode`的字段信息，结合上下文可知，该内容是为解决内置库存在枚举值但仅一条、与界面不匹配的问题，相关界面约束调整需基于此处的枚举值规则进行修改。](https://feishu.cn/file/T6hPbPDQBoWXHuxX7WXcTEWFnRb)

![图片展示的是IoT Gateway平台中Device Library下的Custom Device Repository页面及Edit Object弹窗。页面左侧为导航栏，右侧显示“Add”操作，可手动添加、解码添加或导入对象。弹窗中“Object Name”为“Working Mode”，“Data Type”为“ENUM”，“Value”为0，Name为“standard”，还有“+ Add”按钮。该图片与上下文紧密相关，直观呈现了内置库中存在只有一条枚举值的情况，与界面不匹配，需调整界面约束，允许用户删除其中一条，仅剩下一条的需求背景。](https://feishu.cn/file/UlHcbmXZKot41QxAXIScVHIvnRe)

需要调整界面约束：默认还是生成两条0和1值，但是允许用户删除其中的一条，仅剩下一条。

![图片展示的是Milesight平台设备库添加页面。左侧为平台导航栏，选中“设备库”。右侧上方显示“添加”操作，下方有“手动添加”“解析添加”等选项。右侧弹出“添加对象”窗口，其中“对象名称”为“ENUM”，“Value”处有0和1，下方有“+添加”按钮。该图片与文档中需求说明部分相关，用于说明内置库中存在只有一条枚举值的情况，需调整界面约束，允许用户删除其中一条，仅剩下一条。](https://feishu.cn/file/SrXHbesHPolP7oxJidXcftxtnrc)

# 五、交互汇总：

https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=226-1965&t=AsvrD3EKFaLT84EG-4

# 六、性能与约束

## 6.1 导入性能

| 指标 | 要求 | 说明 |
|-|-|-|
| 文件上传大小上限 | N MB（⚠️ 研发确认） | 基于3500 模板 × 150KB 压缩后预估 |
| 文件上传超时 | 60s | 网关局域网环境 |
| ZIP 解析速度 | ≤ 30s / 1000 模板 | 解析 + 校验全流程 |
| 单模板导入耗时 | ≤ 50ms / 模板 | 含数据库写入 + 对象解析 |
| 整包导入耗时 | ≤ 60s / 1000 模板 |  |
| 内存占用峰值 | ≤ 网关可用内存 50% | 导入期间不影响网关正常采集和数据上报 |

## 6.2 内置库更新性能

| 指标 | 要求 | 说明 |
|-|-|-|
| 在线更新超时 | 30s 连接 + 120s 下载 | 网关联网环境，整包约 50MB |
| 在线更新解析+导入 | ≤ 60s / 1990 模板 | 同自定义库导入性能要求 |

## 6.3 导出性能

| 指标 | 要求 | 说明 |
|-|-|-|
| 导出速度 | ≤ 30s / 1000 模板 | 含文件读取 + ZIP 打包 |
| 导出文件大小 | ≤ 20MB / 1000 模板 | 与导入上限对齐 |

## 6.4 并发操作约束

| 操作 | 约束 | 说明 |
|-|-|-|
| 导入进行中 | 禁止：再次导入、导出、编辑/删除模板 | 防止数据冲突 |
| 导出进行中 | 禁止：导入；允许：编辑/删除模板 | 导出为只读操作 |
| 在线更新进行中 | 禁止：导入、导出、编辑/删除模板 | 内置库整包更新期间锁定 |
| 两个导入同时发起 | UI 层面禁止：导入按钮在导入期间禁用 |  |

## 6.5 UI 响应性

| 指标 | 要求 |
|-|-|
| 设备库列表加载 | ≤ 2s / 500 模板 |
| 对象列表加载 | ≤ 1s / 300 对象 |
| 搜索响应 | ≤ 500ms |



---