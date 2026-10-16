# Icon 图标清单 · references/icons.md

> **权威源**：`assets/js/registry-business.js` → `window.MS_ICONS`（本文件是导览，冲突时以代码为准）。
> **总量**：115 枚（v1.1.0 存量 50 枚 + v1.2.0 新增 65 枚）。
> **新增取材**：真实产品 iconfont（项目 4834330）图标词汇 ↔ Lucide（lucide-static 1.58.0，描边统一 1.5）。
> **约束**：键名 camelCase（naming.md §2.2）；图标只经 `MS_BIZ_UTIL.ico(name, size)` / `S_Icon` 引用；外链 iconfont CSS 禁止作为运行时依赖。

## 一、存量（v1.1.0，50 枚）

| key | 语义 | 产品 iconfont 对应 |
|---|---|---|
| device | 设备 | icon-device |
| gateway | 网关 | icon-gateway / icon-network |
| alarm | 告警（铃形） | — |
| firmware | 固件 | — |
| member | 成员 | — |
| sensor | 传感器（脉冲） | — |
| log | 日志 | icon-log |
| dashboard | 仪表盘 | — |
| plus | 添加 | icon-add |
| search | 搜索 | icon-search |
| filter | 筛选 | icon-filter / icon-filter-list |
| download | 下载 | icon-download |
| refresh | 刷新 | icon-refresh |
| more | 更多（纵三点） | — |
| check | 成功（圆勾） | icon-check-single |
| warn | 警告（三角） | icon-warning |
| info | 信息 | icon-info |
| close | 关闭 | icon-close |
| chart | 图表 | — |
| topology | 拓扑 | icon-account-tree |
| edit | 编辑 | icon-edit |
| trash | 删除 | icon-delete |
| chevronDown | 下折角 | icon-chevron-down |
| moreHoriz | 更多（横三点） | icon-more-horiz |
| user | 用户 | icon-personal-information |
| settings | 设置 | icon-setting / icon-setting1 |
| data | 数据（圆柱） | icon-data |
| layers | 图层 | — |
| app | 应用 | — |
| copy | 复制 | icon-copy |
| star | 收藏 | — |
| question | 帮助（圆问号） | icon-help |
| chevronRight | 右折角 | icon-chevron-right |
| arrowLeft | 左箭头 | icon-arrow-left |
| arrowRight | 右箭头 | icon-arrow-right |
| menuFold / menuUnfold | 菜单收起/展开 | — |
| calendar | 日历 | icon-calendar |
| clock | 时钟 | icon-clock |
| minus | 减 | icon-minus |
| cellular | 信号强度（条形） | icon-signal-strong |
| wlan | 无线 | — |
| ethernet | 以太网口 | — |
| lorawan | LoRaWAN（自绘） | icon-lora |
| rs485 | RS485（自绘） | — |
| io | DI/DO（自绘） | — |
| knx | KNX（自绘） | — |
| mbus | M-Bus（自绘） | icon-M-Bus |
| upload | 上传 | icon-upload |
| scan | 扫码 | icon-scan |

## 二、新增（v1.2.0，65 枚，Lucide 1.58.0 对齐）

### 导航 / 箭头（11）

| key | 语义 | 产品 iconfont 对应 | Lucide |
|---|---|---|---|
| chevronLeft | 左折角 | icon-chevron-left | chevron-left |
| chevronUp | 上折角 | icon-chevron-up | chevron-up |
| chevronsLeft | 双左（翻页） | icon-double-arrow-left | chevrons-left |
| chevronsRight | 双右（翻页） | icon-double-arrow-right | chevrons-right |
| chevronsUp | 双上（回顶部/展开全部） | icon-double-arrow-up | chevrons-up |
| chevronsDown | 双下（展开全部） | icon-double-arrow-down | chevrons-down |
| arrowUp | 上箭头 | icon-arrow-up | arrow-up |
| arrowDown | 下箭头 | icon-arrow-down | arrow-down |
| cornerUpLeft | 返回（上一级） | icon-back-left | corner-up-left |
| cornerUpRight | 前进 | icon-back-right | corner-up-right |
| arrowUpToLine | 回到顶部 | icon-back-top | arrow-up-to-line |

### 操作 / 通用（30）

| key | 语义 | 产品 iconfont 对应 | Lucide |
|---|---|---|---|
| eye | 可见 | icon-visibility | eye |
| eyeOff | 隐藏（密码） | icon-visibility-off | eye-off |
| lock | 锁定 | icon-lock | lock |
| rotateCcw | 逆旋（含 reset 恢复默认） | icon-rotation-left / icon-reset | rotate-ccw |
| rotateCw | 顺旋 | icon-rotation-right | rotate-cw |
| eraser | 清空 | icon-clear | eraser |
| gripVertical | 拖拽排序 | icon-drag-vertical | grip-vertical |
| indentDecrease | 减缩进 | icon-indent-decrease | indent-decrease |
| indentIncrease | 增缩进 | icon-indent-increase | indent-increase |
| fileText | 备注/文本文档 | icon-note | file-text |
| fileArchive | 压缩包 | icon-zip | file-archive |
| fileInput | 导入 | icon-import | file-input |
| fileOutput | 导出 | icon-export | file-output |
| layoutTemplate | 文件模板 | icon-file-template1 | layout-template |
| folder | 文件夹 | icon-folder | folder |
| type | 文字类型 | icon-type | type |
| image | 图片 | icon-photo | image |
| languages | 多语言 | icon-translate | languages |
| mail | 邮件 | icon-email | mail |
| messageSquare | 反馈 | icon-feedback | message-square |
| share | 分享 | icon-share / icon-a-share2 | share-2 |
| arrowRightLeft | 传输/转换 | icon-transfer | arrow-right-left |
| repeat | 重复 | icon-repetition | repeat |
| columns3 | 列设置 | icon-setting-columns | columns-3 |
| idCard | 个人信息（证件） | icon-personal-information | id-card |
| logout | 登出 | icon-logout-right | log-out |
| login | 登入 | icon-logout-left | log-in |
| list | 列表 | icon-list / icon-view-list | list |
| hash | 计数 | icon-count | hash |
| thumbsUp | 点赞 | icon-good-f | thumbs-up |

### 形状 / 状态（7）

| key | 语义 | 产品 iconfont 对应 | Lucide |
|---|---|---|---|
| circleX | 移除/错误（圆叉） | icon-close-circle / icon-remove-circle | circle-x |
| squareMinus | 方块减（移除项） | icon-remove-square | square-minus |
| squarePlus | 方块加（添加项） | icon-add-square | square-plus |
| squareCheck | 复选框（勾选） | icon-Checkbox | square-check-big |
| circleArrowDown | 圆圈下载 | icon-download-circle | circle-arrow-down |
| circleArrowUp | 圆圈上传 | icon-upload-circle | circle-arrow-up |
| loaderCircle | 加载中（旋转） | icon-loading | loader-circle |

### 领域（17）

| key | 语义 | 产品 iconfont 对应 | Lucide |
|---|---|---|---|
| nfc | NFC | icon-nfc | nfc |
| gauge | 阈值/仪表 | icon-threshold | gauge |
| bellRing | 蜂鸣 | icon-buzzing | bell-ring |
| send | 下发 | icon-issued | send |
| workflow | 联动 | icon-linkage | workflow |
| volume2 | 音量最大 | icon-a-soundlevel-max | volume-2 |
| hand | 手动操作 | icon-a-handmovement | hand |
| packagePlus | 导入产品 | icon-a-importproduct | package-plus |
| toggleLeft | 停用（开关断开） | icon-a-switchdisable | toggle-left |
| toggleRight | 启用（开关接通） | icon-a-switchenable | toggle-right |
| wrench | 维护 | icon-maintenance | wrench |
| database | 数据采集/汇聚 | icon-gather | database |
| databaseBackup | 备份 | icon-backups | database-backup |
| trendingUp | 趋势上升 | icon-trending-up | trending-up |
| gitCompare | 数据对比 | icon-compare | git-compare |
| link | 链接 | icon-link / icon-link1 | link |
| unlink | 解除链接 | icon-unlink | unlink |

## 三、产品 iconfont 未映射项（暂缓，不注册）

| 类别 | iconfont 名 | 处理 |
|---|---|---|
| 实心变体 | check-f / check-f1 / good-f / warning-f / info-f / clock-f / close-circle-f / remove-circle-f / download-circle-f / unchecked | 不注册——语义状态走描边形 + 语义色 token（`ms-tag--success` 等），保持单一描边体系 |
| 语义不明 | Frame / a-Frame427319708 / flex / interface / a-digitalquantity / a-digitinput / back-left-1 | 暂缓——待真实页面用到时按需求语义铸造，避免猜错形态 |

## 四、铸造流程（缺图标时）

1. 查本清单，确认 `MS_ICONS` 无对应；
2. Lucide 取材（lucide-static，描边改 1.5）或自绘（对齐 24 viewBox / 1.5 描边 / currentColor，参照 `mbus` / `lorawan` 先例）；
3. 注册进 `MS_ICONS`（camelCase 键）+ 本清单补行；
4. `S_Icon` bump minor + `output/icon-set-verify.html` 重新核实。
