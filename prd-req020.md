<title>设备库内置库需求 AI测试文档</title>

# changelog

| 版本 | 更改内容 | 更新时间 | 操作者 |
|-|-|-|-|
| V1.0 | 需求初稿 |  | lxy |

# 背景和目标



原始需求：<cite doc-id="IpcZwbnKLiqU5akotLYccWB5nje" file-type="wiki" title="【EG71】设备库导入&amp;导出" type="doc"></cite>



# 交互地址



# 需求说明

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

### 在线更新

**流程与规则**

页面右上角保留 `Update` 按钮，点击展开下拉菜单：

```JSON
[Update ▼]
  ├── 在线更新（Online Update）：联网从官方平台拉取最新内置库，整包覆盖；
  └── 导入离线包（Import Offline Package）：用于断网场景，手动上传 Milesight 官方发布的标准 ZIP 离线包
```



<synced_reference src-block-id="LDJxdNfm1s08wMbeCyFcCQKwn9c" src-token="DjTSdCMjIodRKWxYjdUcvB6Xn4e"></synced_reference>

**Figma 画面**：

- 内置库-发起在线更新：[内置库-在线更新](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-78306)
- 网络异常：[在线更新-网络异常](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80062)
- 与自定义库冲突：[在线更新-自定义库冲突](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80809)
- 更新完成：[在线更新-更新完成](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80693)

**交互要点**：

1. 点击"在线更新" → loading 遮罩 + "正在获取最新内置库..."
2. 网络异常（30s 超时）→ 遮罩消失 + 红色 Message toast "网络连接失败，请检查网络"
3. 文件解析中/写入中 → loading 遮罩 + 进度条
4. 与自定义库冲突 → 不阻断(自动将自定义库的名称修改)
5. 更新完成 → 成功摘要弹框（新增/更新/删除型号数/自动更改自定义型号名数）

**状态机（在线更新流程）**：

| 状态 | 视觉 | 触发条件 |
|-|-|-|
| loading-获取 | 遮罩 + "正在获取最新内置库..." | 点击在线更新按钮 |
| ~~network-error~~ | ~~遮罩消失 + 红色 toast~~ | ~~30s 超时 / 连接失败~~ |
| loading-解析 | 遮罩 + 进度条"解析中" | 获取成功 |
| conflict-block | ❌ 错误弹框 + 冲突型号列表 | 与自定义库同名 |
| loading-写入 | 遮罩 + 进度条"写入中" | 解析通过 |
| success | ✅ 摘要弹框 + [确认] 按钮 | 更新完成 |

### 导入离线包

**流程与规则**：

**步骤 1：上传前说明提示**

**交互要点**：

1. 上传前有醒目提示文案 + 官方下载地址链接（用户点击，后台直接下载，避免用户因不知道github该如何下载）
2. Upload-Drag 组件：同自定义库导入，但文案不同（"请确保上传的是 Milesight 官方发布的标准离线包"）
3. 解析/写入流程同在线更新：loading 遮罩 + 进度条
4. 更新完成后的成功摘要弹框格式与在线更新一致
5. 导入期间锁定所有操作（禁止在线更新、自定义库导入/导出、编辑/删除模板）

**Figma 画面**：

- 内置库-导入离线包（上传前说明+上传区域）：[内置库-导入离线包](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=272-44030)

**步骤 2：离线包文件格式**

- Milesight 官方标准 ZIP，结构与在线更新包一致
- 文件格式/大小校验同自定义库导入第一阶段

Figma画面：

- 内置库-离线包-上传中：[内置库-离线包-上传中](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=272-44682)
- 内置库-离线包-上传完成：[离线包-上传完成](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80906)
- 上传失败（文件类型/大小错误）：[离线包-文件类型大小错误](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80882)

**步骤 3：离线包内部校验**

- 离线包的 ZIP 包级校验规则与自定义库导入完全一致（ZIP损坏、version.json 缺失/空/多份、vendors.json 缺失、vendors/ 目录缺失等致命错误，复用同一套校验列表）
- 校验失败时的交互展示也复用自定义库导入设计

Figma画面：

- 与自定义库同名冲突处理：离线包-自定义冲突
- 内置库-离线包-解析中：[内置库-离线包-解析中](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=386-77137)

**步骤 4：导入执行**

- 实时进度条，交互同自定义库导入第三阶段
- 导入期间锁定所有操作（禁止：在线更新、自定义库导入/导出、编辑/删除模板），与在线更新并发约束一致
- 更新逻辑同[在线更新类似](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-BXyidsXMvolJNJxEDkWc1t2hnDc)

Figma画面：[离线包-导入](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=578-145565&m=dev)

**步骤 5：完成后展示**

Figma画面：

- 更新完成：[离线包-更新完成（无特殊情况）](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=547-95855&m=dev)
- 更新完成（被引用型号创建副本）：[离线包-更新完成-被引用更新](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=387-80967)
- 更新完成（被删除保留）：[更新完成（被引用型号无法删除）](https://www.figma.com/design/CVVyZcQHpcu8lipmsXRZIm/71.0.0.4?node-id=457-77312&m=dev)
- 
- 更新完成（与自定义重名）：

> 值为 0 的项省略不展示，避免信息冗余。例如只有新增时展示"新增 N 个型号"，不展示"更新 0 / 删除 0"。

### 异常情况

[同自定义库类似](https://milesight.feishu.cn/wiki/IpcZwbnKLiqU5akotLYccWB5nje#share-KFR3d5J4xoQ8eyxZ8RDcSSUynI0)

错误提示

### 错误提示

| **错误类型** | **出现情况** | **适用场景** | **错误信息（中）** | **错误信息（英）** |
|-|-|-|-|-|
| 网络异常 | 30s 连接超时或 120s 下载超时 | 仅内置库在线更新 | 网络连接失败/下载超时，请检查网络 | Network connection/download timed out. Please check the network. |
| 与自定义库同名冲突 | 内置库更新与自定义库存在同名型号 | 仅内置库更新 | 内置库更新与自定义库存在同名冲突，以下型号将被重命名：{models} | Built-in library update conflicts with custom library models. The following will be renamed: {models}. |
| 被引用型号无法删除 | 全量覆盖模式下，ZIP 缺失型号已被设备引用 | 自定义库+  <br/>内置库 | {n} 个型号被设备引用，无法删除：{models} | The following models are referenced by devices and cannot be deleted: {models}. |
| 被引用型号更新提示 | 更新型号且被设备引用 | 仅内置库库 | {n} 个型号被设备引用，新版本已导入，原版本已自动备份：{models} | {n} models referenced by devices have been updated; original versions automatically backed up: {models}. |