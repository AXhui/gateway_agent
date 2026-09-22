<title>【设备数采】测试需求</title>

<table><colgroup><col/><col/><col/><col/></colgroup><thead><tr><th>版本号</th><th>修订内容</th><th>日期</th><th>修订人</th></tr></thead><tbody><tr><td>V0.9</td><td>补充设备编辑页切换配置的逻辑，快速链接：<cite doc-id="Bukcw7s0ViRk69kpzGBcIc1Anhc" file-type="wiki" title="【设备数采】LoRaWAN设备入网优化和扫描" type="doc"></cite></td><td>2026.6.23</td><td>黄淳峰</td></tr><tr><td>V0.8</td><td>移除2.3.1中ABP模式的AppKey输入框</td><td>2026.5.9</td><td>黄淳峰</td></tr><tr><td>V0.7</td><td><ol><li seq="1">补充入网失败的UED</li><li>ABP下AppKey输入框的位置调整</li></ol></td><td>2026.5.8</td><td>黄淳峰</td></tr><tr><td>V0.6</td><td><ol><li seq="1">AppKey去掉批量删除按钮，调整为清空</li><li>AppKey导入允许重复，不去重</li><li>批量编辑设备时不允许编辑设备型号</li><li>补充了用户在设备不处于扫描中状态，直接通过url跳转到扫描确认页的处理和提示</li></ol></td><td>2026.5.6</td><td>黄淳峰</td></tr><tr><td>V0.5</td><td><ol><li seq="1">新增批量删除AppKey的UED</li><li>明确AppKey需要作为配置备份还原</li><li>明确没有配置AppKey时不允许扫描</li><li>停止扫描的文案修改</li></ol></td><td>2026.4.30</td><td>黄淳峰</td></tr><tr><td>V0.4</td><td>补充了导入AppKey文件时，大小和行数超过限制的横幅内容</td><td>2026.4.29</td><td>黄淳峰</td></tr><tr><td>V0.3</td><td>补充了状态页的扫描中提示样式</td><td>2026.4.28</td><td>黄淳峰</td></tr><tr><td>V0.2</td><td>移除数据埋点需求</td><td>2026.4.24</td><td>黄淳峰</td></tr><tr><td>V0.1</td><td>需求初稿</td><td>2026.03.30</td><td>黄淳峰</td></tr></tbody></table>

# 一、需求背景：



关联需求：<cite doc-id="V9UJw1wbOi2ChhkX1c5cfXbRnrd" file-type="wiki" title="【设备数采】导入导出功能" type="doc"></cite>

关联tapd：[【设备数采】扫描添加新增扫描添加LoRaWAN节点 ](https://www.tapd.cn/tapd_fe/37636876/story/detail/1137636876001075747?app_id=1&from_iteration_id=1137636876001002593)



当前网关在 LoRaWAN 设备接入流程中，针对不同使用经验的用户均存在较高的学习与操作成本。EG71 的核心客户包含大量传统有线设备集成商，这类用户通常对 LoRaWAN 协议缺乏了解，作为新手用户登录网关添加设备时，会直接面对 DevEUI、应用程序密钥等非空必填参数，不仅需要额外理解 DevEUI、OTAA 入网等专业概念，还需自行查找参数获取方式，使用门槛较高。同时设备配置后上线时机不透明，甚至出现因 AppKey 填写错误等原因导致无法上线的问题，用户难以定位原因，进一步影响使用体验。

而对于熟练用户，现有流程仍需逐台通过目视或 Toolbox 读取 DevEUI，手动填写应用程序密钥，加之 Milesight 应用程序密钥存在多种格式变种，需要反复核对，配置完成后还需被动等待设备上线，整体操作繁琐，部署效率偏低。因此 “一键扫描” 功能可有效解决上述问题，对新手用户而言，能够大幅降低 LoRaWAN 相关知识的学习与理解成本，让 LoRaWAN 设备接入如同连接 WiFi 一样简单，无需掌握专业协议概念；对熟练用户而言，可有效降低现场部署成本，支持边安装边配置的灵活部署模式。更低的部署成本、更快的改造速度本身就是 EG71 面向楼宇快速改造场景的核心竞争力，该功能能够进一步强化产品核心价值，提升整体部署与使用效率。

针对场景，如果EG71作为小型BMS使用，通常仅会有少量EG71对接100台以内LoRaWAN设备，实施人员可以通过扫描功能，以类似BACnet扫描的过程来添加设备，可以简化人工投入。为避免扫描功能抢占设备，以及用户能理解哪些设备是属于该网关的，需要人工复核是否添加入网，以及呈现设备型号和信号强度帮助用户理解。

如果是EG71较少应用的大型无线场景，扫描设备后添加设备需要用户二次确认，本身降低了误添加错误设备的情况，即使错误添加，因为EG71还是会转发该设备的报文到应用平台，如果用户并不关心由谁上报也不会产生问题。



# 二、需求说明：



## 入网状态逻辑优化

新增“入网失败”状态，并在该状态右侧由提示展示失败原因，原因分为两类：密钥错误、节点未收到入网应答包。

![](https://feishu.cn/file/CwhrbDwcdodLATxQVGdc1apcnI0)

- 在线判断逻辑修改

  - 对于 OTAA 入网类型：网关收到节点 Join Request 并下发 Join Accept 后，若在节点超时时间内收到正常上行数据包（重复 Join Request 不计入有效数据包），则判定入网成功，状态切换为**在线**。
  - 对于 ABP 入网类型：网关收到节点上行数据包且解析正常，即判定入网成功，状态切换为**在线**。
- 入网失败判断逻辑

  - 对于 OTAA 入网类型：
  
    1. 网关收到节点 Join Request 但 MIC 校验失败，判定为**密钥错误**，状态切换为**入网失败**；
    2. 网关收到 Join Request 并下发 Join Accept 后，在节点超时时间内未收到有效上行数据包，判定为**节点未收到入网包**，状态切换为**入网失败**。
  - 对于 ABP 入网类型：网关收到节点上行数据包但 MIC 校验失败，判定为**密钥错误**，状态切换为**入网失败**。
- 与UG6x差异点

  1. EG71 OTAA模式下没有‘未收到JoinRequest’这个入网失败原因，不区分‘未收到JoinRequest’和‘从未上线’，因为EG71的超时时间较UG6x更长
  2. EG71不单独将‘密钥错误’和‘节点未收到入网应答包’作为设备状态，使用统一‘入网失败’状态，仅作为原因
  3. EG71 ABP模式下没有‘入网超时’，原因同a.
  4. EG71超时时间为配置内的超时时间，不通过Toolbox API传入
  5. EG71将新增的设备状态作为全局对象传给BACnet和Modbus



## 对于Milesight设备新增默认应用程序密钥

若设备型号选择为Milesight设备，或设备EUI以24E124开头，应用程序密码显示“默认密钥”和“自定义密钥”选项，默认为“默认密钥”

### 2.1 OTAA模式默认APPkey规则（2.1.1已实现）

#### 2.1.1 入网逻辑（当前已实现）

OTAA 模式下，APPkey 选择默认时，网关网络服务器（NS）将使用两套 APPkey 进行入网验证：

1. 固定密钥：`5572404c696e6b4c6f52613230313823`
2. 动态密钥：由配置的 DevEUI + DevEUI 拼接生成



网关 NS 收到 JoinRequest 后，按以下流程处理：

1. 接收到 JoinRequest 后，在完成所有密钥校验前需保留该 JoinRequest 报文，不释放或丢弃；
2. 优先使用动态密钥校验 MIC；
3. 若动态密钥校验失败，基于保留的 JoinRequest 报文，切换为固定密钥再次校验；
4. 若两套密钥均校验失败，则按入网失败处理，返回“入网失败”，原因为Key错误；
5. 若任意一套密钥校验成功，则使用该套密钥生成 JoinAccept 并下发，设备使用该密钥入网。



#### 2.1.2 前端调整

1. 设备添加页，【Profiles】选中OTAA入网模式时的前端样式做如下调整。

   1. 新增灰色背景卡片，放置在【Profiles】下方。灰色卡片内从上到下排列【激活设置】和【应用程序密钥】。
   2. 新增单选框组【激活设置】，可选项：“默认值”、“自定义值”。当DevEUI为Milesight设备时（通过oui匹配），默认选中 “默认值”，当DevEUI不为Milesight设备时，默认选中“自定义值”，“默认值”不可选中。
   3. 【应用程序密钥】移除原本左侧的下拉选框。输入限制保持不变。
   4. 移除原有不可编辑的【设备地址】，【应用程序会话秘钥】，【网络会话密钥】。
   5. 配置时，切换选框需要保留用户输入内容。

![](https://feishu.cn/file/P8g3b5USGoxT7FxwK8accqdinVf)



1. LoRaWAN 设备编辑页 — 切换配置文件/设备型号时激活设置行为

前提：

- 页面：LoRaWAN 设备编辑页
- 激活设置有两种模式：默认 / 自定义
- OTAA 样式字段：AppKey（必填，可编辑）、DevAddr / AppSKey / NwkSKey（不可编辑，入网后自动填充）
- ABP 样式字段：DevAddr / AppSKey / NwkSKey（必填，可编辑），无 AppKey

场景1：同类型切换

切换设备型号（含 None）、或切换配置文件但激活类型不变（OTAA→OTAA、ABP→ABP）

- 默认/自定义状态：保持不变
- 字段值：保持不变



场景2：ABP → OTAA

- 默认/自定义状态：保持不变
- AppKey：空（ABP 无此字段），必填
- DevAddr / AppSKey / NwkSKey：从 ABP 配置带入（ABP 必有值），不可编辑

场景3：OTAA → ABP

- 默认/自定义状态：保持不变
- DevAddr / AppSKey / NwkSKey：从 OTAA 入网数据带入（设备已成功入网则有值，否则为空），可编辑
- AppKey：ABP 模式下不显示此字段

前端暂存逻辑（未保存时切换配置文件/设备型号/激活设置）

- 切换配置文件类型时（未点保存），所有字段值在前端暂存
- 切回原类型时恢复暂存值
- 一旦保存，未激活类型的字段值被清除，再切回时为空，需重新填写



<synced-source><h3>2.2 ABP模式默认参数规则</h3><h4>2.2.1 Device Address生成规则</h4><p>ABP 模式下，Device Address按以下规则生成：</p><ol><li seq="1">截取用户配置的 DevEUI 中第 10 至第 16 位字符（示例：若 DevEUI 为 <code>24e124136e445120</code>，则截取部分为 <code>e445120</code>）；</li><li>校验位 <code>*</code> 由 DevEUI 第 7 到 16 位（如示例中的 <code>136e445120</code>），在其开头添加字符“6”（示例<code>6136e445120</code>），通过附录的校验位验算算法生成1位校验位；</li><li>将步骤 1 中截取的6位字符拼接 1 位校验位，最终 DevAddr 格式为 <code>[基础取值]*</code>（示例：<code>e445120*</code>）；</li></ol><p></p><h4>2.2.2 会话密钥生成规则</h4><p>Network Session Key和 Application Session Key的生成规则与 OTAA 模式下 APPkey 规则一致，两套密钥为同类型生效（即同时使用固定密钥，或同时使用动态密钥）：</p><ol><li seq="1">固定密钥：<code>5572404c696e6b4c6f52613230313823</code>；</li><li>动态密钥：由配置的 DevEUI 与自身拼接（DevEUI + DevEUI）生成。</li></ol><p></p><h4>2.2.3 默认参数下的数据收发校验流程</h4><p>ABP 模式无入网流程，默认参数配置下，上下行数据的校验 / 加密流程如下：</p><ol><li seq="1">预配置阶段：用户输入 DevEUI 后，系统自动生成唯一且固定的 DevAddr，并按上述规则生成对应的两套会话密钥；</li><li>首次上行数据校验阶段：网关 NS 收到该 DevAddr 的上行数据包时，按以下顺序校验 MIC：<ul><li seq="auto">第一步：优先使用动态密钥尝试解算并校验 MIC；</li><li seq="auto">第二步：若动态密钥校验失败，切换为固定密钥再次校验；</li><li seq="auto">第三步：若两套密钥均校验失败，返回“入网失败”，原因为Key错误；若任意一套密钥校验成功，系统将持久化保留该套成功的密钥（绑定至对应 DevAddr）；</li></ul></li><li>后续上行数据校验阶段：网关 NS 再次收到该 DevAddr 的数据包时，直接使用已保留的成功密钥进行 MIC 校验，无需重复尝试两套密钥；</li><li>下行数据加密阶段：网关 NS 向该 DevAddr 下发下行数据时，必须使用已绑定的、校验成功的那套密钥进行加密，确保上下行密钥一致。</li></ol></synced-source>

### 2.3 ABP模式下支持Application Key及相关关联需求

#### 2.3.1 ABP模式下新增default

1. ~~ABP 模式下，新增“应用程序秘钥（Application Key）”，样式为标准输入框；~~（本次迭代不实现）
2. 新增单选框组：“默认值”、“自定义值”，当DevEUI为Milesight设备时（通过oui匹配），默认选中 “默认值”，当DevEUI不为Milesight设备时，默认选中“自定义值”，“默认值”不可选中。
3. 配置时，切换选框需要保留用户输入内容。
4. 历史数据兼容：旧设备升级至本版本时，保留 Device Address 原有配置值不变，且该配置项自动标记为 “自定义值”。

选择不同配置选项时，页面配置项的编辑权限按以下规则控制：

1. 选中 “默认值” 时：

   - 置灰不可编辑项：设备地址(Device Address)、网络会话秘钥(Network Session Key)、应用程序会话秘钥(Application Session Key)~~、应用程序秘钥（Application Key）；~~
   - 保留可编辑项：Uplink Frame-counter、Downlink Frame-counter、Timeout；
2. 选中 “自定义值” 时：所有配置项均保留原有编辑权限（无额外置灰限制）~~，APP key非必填~~。

![](https://feishu.cn/file/ZmZbbNkWQofrSoxfTtFcamhwnDh)

![OTAA样式统一调整](https://feishu.cn/file/JJhebSSHOo0axtxZSHBcX4LSnMe)



## 新增LoRaWAN扫描入网



### 3.1 前端改动：

#### 3.1.1 新增LoRaWAN扫描配置页

页面内展示一个AppKey配置卡片，配置项从上至下依次为：默认勾选的【Milesight默认Key】勾选框，【导入文件】按钮，【清空】按钮，搜索框（支持模糊搜索），以及自定义AppKey输入框，支持添加多个自定义AppKey，最多可添加1000个。右下角为【取消】按钮和【开始扫描】按钮，点击【取消】按钮将回退到设备列表。

【Milesight默认Key】为2.1中固定密钥及动态密钥。自定义AppKey输入限制同手动添加LoRaWAN设备时的Appkey输入框限制，32位16进制数。

点击清空后，删除全部自定义AppKey，Milesight默认Key保持原有状态。

Appkey属于网关配置的一部分，升级后保留，需要备份还原。

支持导入csv和xlsx文件，检索文件内存在表头为AppKey（支持大小写）的列，内容为合法AppKey（32位16进制数，支持大小写）即导入成功并体现在【LoRaWAN扫描配置页】。

1. 文件类型：csv和xlsx类型。导入的浏览器文件选择弹窗需要限制文件类型为csv和xlsx。
2. 文件大小：默认上传文件大小不能超过1M，数据1000条

   1. 超过大小时，横幅提示：文件超过1M无法上传，请重新上传文件
   2. 文件内有效Key数量+已存在Key数量>1000，横幅提示：AppKey数量超过1000条，当前仅能再添加N条，请重新上传文件。提示中N为实际剩余可添加数量。
3. 如果表头不存在AppKey（支持大小写），横幅提示：文件内没有找到AppKey，请重新上传文件
4. 如果存在AppKey非法，全部失败，横幅提示：存在非法AppKey，请重新上传文件
5. 如果存在合法AppKey重复，导入时不去重，允许重复。

![](https://feishu.cn/file/V7nFb6r47oZMyyxCTg7c0ReWnn3)

完成AppKey配置并点击【开始扫描】后，跳转至【扫描确认页】并开始扫描。如果没有配置任何AppKey，【开始扫描】置灰不可点击。当设备列设备列表为空时有提示语：“扫描进行中，离开此页面不会打断扫描”

![](https://feishu.cn/file/BhWkbFwdaofEn9xKuFcccrXznlg)

![](https://feishu.cn/file/Dd4sb6jMmo1e6rxTNoscFVC2nLw)

当从【设备数采】页重新进入【LoRaWAN扫描配置页】时，允许新增或删除AppKey，需要保留已经扫描到的设备以及其匹配的AppKey，即使AppKey在【LoRaWAN扫描配置页】中被删除。此时【开始扫描】按钮变更为【应用】按钮。

如果网关正在扫描中，所有页面都显示“正在LoRaWAN扫描中”。如果扫描到新设备，增加红点以及设备数提示。点击“正在LoRaWAN扫描中”将跳转至【扫描确认页】，不中断扫描，去除红点，变为灰色，但保留设备数。设备数为停留在【扫描确认页】中，未被添加入设备的LoRaWAN节点数量。

![](https://feishu.cn/file/Abjrb3BbAoiOp0xGEiLcM7eVnRb)

![](https://feishu.cn/file/TkzabsT7IoKOT8xKTTActoY9nPc)

![状态页](https://feishu.cn/file/DtnIbT1TboVvgexIINicyW1rnCd)

#### 3.1.2 扫描确认页

##### 1. 页面布局与信息展示

- **交互引导**：顶部横幅展示提示：

> - “扫描仅能发现OTAA入网模式的设备，请核对 DevEUI是否与您的设备一致。若长时间未发现目标设备，请确认设备处于开机状态，缩短设备与网关距离并重启设备后再试。”

- 页面分为2个Tab，其中一个为【发现设备】，另一个为【已忽略设备】。【发现设备】和【已忽略设备】都具备设备列表，仅操作不同。
- **设备列表展示**：页面动态展示当前扫描到的 LoRaWAN 设备，按更新时间倒序（最新的在最上方），允许用户直接在列表编辑设备名，设备型号，以及描述。列表完整包含以下字段：

  - **选择框**：支持单选、多选及全选操作。
  - **DevEUI：**支持过滤；
  - **设备名：**默认为DevEUI，可在列表编辑；支持过滤
  - **描述：**默认为空，可在列表编辑；支持过滤
  - **设备型号**：可编辑，支持在列表快速选择设备型号；支持过滤
  
    - 若系统通过 DevEUI 识别出该设备型号，则自动填充。若匹配到多个型号，按以下规则匹配：内置设备库型号>自定义设备型号>自定义设备型号ID靠后的设备。若内置设备库型号重复，显示多个，如AM102/AM102L/AM103/AM103L。
    - 若无法识别，不显示该字段，None。
  - **信号强度**：按当前【设备数采】页的LoRaWAN信号列的图示和逻辑展示信号强度。需要显示具体值。

  ![SNR和RSSI都高才高，任意一个低是低，其他是中](https://feishu.cn/file/Zu70blnAeooc9lxHf2gc65jMnWd)

  - **更新时间**：显示最后收到该DevEUI的Join Request的系统时间（带时区）。
  - **操作列**：【发现设备】有【编辑】和【忽略】两种操作，【已忽略设备】有【取消忽略】一种操作。
- 【发现设备】列表上方有【添加设备】【放弃扫描】【编辑】【忽略】按钮。下方有刷新按钮。点击【忽略】后，该设备从【发现设备】页移动到【已忽略设备】页，信号和最新更新时间正常更新。
- 【已忽略设备】列表上方有【取消忽略】按钮。下方有刷新按钮。点击【取消忽略】后 将设备移动回【发现设备】列表，仍旧按最后更新时间排序。
- 点击【放弃扫描】将弹窗提示，点击确认后结束扫描状态，将清空所有【扫描确认页】中未添加的设备，不添加到网关中。
- 从该页面回退，或退出，其中未被添加的设备（包括已忽略设备）需保持不变。
- 扫描确认页中的设备不需要包含在备份文件中。
- 列表最大设备数量为2000个。如果超过2000个，覆盖更新时间最久的设备。
- 如果勾选的设备超过上限2000个，提示超过设备上限；对象总数超过上限20000个，提示对象超过上限；
- 如果用户通过url直接进入确认页，并且此时不处于扫描中状态，弹窗提示“请先完成扫描配置，页面即将返回配置步骤。” ，然后3秒后跳转回扫描配置页。

![](https://feishu.cn/file/WbFRbQ8KkozNDXx5FoBchlSNnXf)



![](https://feishu.cn/file/PtvrbSpphoJlbWxBSlkcyg3NnGe)

##### 2. 设备编辑与配置（批量/单点）

用户选定设备后，需支持对以下参数进行配置（**内容和约束条件同【设备数采】手动添加页**）：

- **单设备编辑时**：设备名称（支持自动生成默认名称，默认为DevEUI）、设备描述（为空）、设备型号（若识别，则为具体设备型号，若重复或不识别，则为None）、配置文件（此处过滤并不显示ABP模式的配置文件，若识别具体设备型号，按设备型号默认配置文件，否则默认ClassA-OTAA）、fPort（默认1）、超时时间（默认1440）、是否启用帧计数校验（默认不启用）。

![单设备编辑](https://feishu.cn/file/RQD9bh4iBo7sT4xF5S4cse3Ongg)

- **多设备编辑时**：当勾选多个设备时，点击【编辑】，右侧抽屉弹出，抽屉名为编辑多个设备，可统一设置相同的配置文件（此处过滤并不显示ABP模式的配置文件）、fPort、超时时间、是否启用帧计数校验，点击保存将使勾选的全部设备应用当前的配置。配置约束同编辑单个设备。不显示设备名称，设备描述，DevEUI，设备型号。

![多设备编辑](https://feishu.cn/file/KD9tb3xLIoW6ZBxcD0ScmZpcnzb)



##### 3. 提交逻辑与校验

- **确认添加**：点击【添加设备】后，弹窗确认，点击确认系统将所选设备批量注册至当前网关，默认添加全部对象；如果是没有设备型号的，则不添加对象。添加成功将把设备从扫描确认页移除。
- **状态反馈**：

  - **成功**：提示“xx个设备添加成功”，并刷新当前页。
  - **冲突处理**：在多用户操作场景下，若用户尝试添加已被他人抢先添加的设备，系统不进行强制拦截，但在提交时对冲突设备提示：“xx个设备已存在”，其余非冲突设备正常添加。

  ![](https://feishu.cn/file/TDSVbuxu2oaK2dxM1UJcX1SWnDh)

![](https://feishu.cn/file/LNS9bAwuEocHxQxnNhtc8sirnud)

### 3.2 扫描逻辑：

##### 1. 设备过滤与去重

- **重复过滤**：系统接收到 Join Request 后，优先检索本地数据库。若该 **DevEUI** 已存在于当前网关的设备列表中，则直接忽略该报文。
- 如果该DevEUI存在于【扫描确认页】中，更新该DevEUI的信号强度和更新时间。

##### 2. 合法性校验（MIC 匹配）

- **校验机制**：系统提取报文中的 DevEUI、AppNonce 等信息，利用【LoRaWAN 扫描配置】页中定义的 AppKey 列表（包含勾选的 Milesight 默认 Key）进行逐一匹配。
- **匹配规则**：采用“从上至下”的顺序进行 MIC 校验。

  - **校验成功**：判定该设备为合法且可接入设备，立即将其信息（DevEUI、RSSI、SNR、最后更新时间）更新至【扫描确认页】的待确认池中，并记录保存AppKey。
  - **校验失败**：若遍历列表内所有 AppKey 均无法通过 MIC 校验，则视为非法或非目标设备，不予记录。

##### 3. 静默扫描原则

- 在扫描模式下，即便 MIC 校验成功，网关也严禁向设备发送 Join Accept 消息。仅通过用户确认，添加入设备列表的设备才发送Join Accept。

### ~~3.3 数据埋点（本迭代不实现）~~

~~为确认用户是否主要通过LoRaWAN扫描功能添加设备，以及是否刚需描述设备位置，需要在本次功能迭代时额外记录扫描功能的用户行为。~~

~~扫描功能需要额外记录用户共启用几次功能，扫描到几台设备，注册了多少设备，多少设备用户通过该页面手动输入了设备名和描述，具体设备名和设备描述。另存为一份日志文件，在/etc/urlog/下，重置可以清空。~~

##   
三、UED设计稿

https://www.figma.com/design/yye5WFB0rbsf0IdDnwSIel/71.0.03?node-id=255-116041&t=nbZZdNNxZwGtzyFI-4



## 四、附录

### **4.1 算法生成校验代码参考**

```C++
static const QString encryptString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
static const QString decryptString = "29*xy+ab57c4d3efg6hijk81lm@%^rz!n.-#";
static const QString keyForCode = "YEASTAR";

#define ADD_NUMBER  1
#define SUB_NUMBER  2

quint8 UCBurnTool::GenerateSNCheckBit(QString sn)
{
    quint8 bit;
    QByteArray buf;
    int i = 0;
    int j = 0;
    uint checkBit = 0x12;

    for (i=0; i<sn.length(); i++) {
        for (j=0; j<encryptString.length(); j++) {
            if (sn.at(i) == encryptString.at(j)) {
                buf.append(decryptString.at(j));
                break;
            }
        }
        if (j == encryptString.length()) {
            buf.append(sn.at(i));
        }
    }

    for (i=0; i<keyForCode.length(); i++) {
        for (j=0; j<encryptString.length(); j++) {
            if (keyForCode.at(i) == encryptString.at(j)) {
                buf.append(decryptString.at(j));
                break;
            }

        }

        if (j == encryptString.length()) {
            buf.append(keyForCode.at(i));
        }
    }

    for (i=0; i<buf.length(); i++) {
        if (buf.at(i) !=0 && !(i%ADD_NUMBER)) {
            checkBit += (uint)buf.at(i);
        }
        else if (buf.at(i) != 0 && !(i%SUB_NUMBER)) {
            checkBit -= (uint)buf.at(i);
        }
    }

    bit = 0;
    bit += (quint8)(checkBit & 0xFF);
    bit += (quint8)((checkBit>>8) & 0xFF);
    bit += (quint8)((checkBit>>16) & 0xFF);
    bit += (quint8)((checkBit>>24) & 0xFF);
    bit = (bit%10) + 0x30;
    return bit;
}
```

### 4.2 AppKey批量导入excel文件参考

<figure view-type="Preview"><source name="AM308L-868M-SN.xlsx" mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" size="15285" token="YxfQbdJv4oJLRHxUCytcZcjOnNh"/></figure>