# IoT 术语全景图（来源：multitech.com/iot-wiki）

> 这是 multitech IoT wiki 的完整词条清单，按主题簇归类。详细定义/选型/参数见同目录各主题文件。
> 原始词条按字母排列；本文件按「业务主题」重组，方便按场景检索。

---

## 主题簇总览

| 簇 | 关键主题 | 详细文件 |
|---|---|---|
| 连接技术 | LoRaWAN / NB-IoT / LTE-M / 蜂窝 / eSIM / 频谱 | connectivity.md |
| 协议 | BACnet / Modbus / RS-485 / MQTT / Zigbee / TCP-IP | protocols.md |
| 云平台 | AWS IoT / Azure IoT / 设备管理 / 设备影子 | cloud-platforms.md |
| 硬件 | 传感器 / 网关 / 控制器 / RFID / UWB / 智能电表 | hardware.md |
| 安全合规 | AES / FCC / CE / ISED / PTCRB / 设备认证 | security-compliance.md |
| 楼宇自动化 | BMS/BAS / COV / 趋势日志 / 日程 / FDD | building-automation.md |

---

## 一、连接技术（Connectivity）

**蜂窝演进**：2G / 3G / 4G / 5G / LTE-M(LTE Cat M-1) / NB-IoT

**LPWAN**：LoRa / LoRaWAN 协议 / LoRa Alliance（联盟与认证）

**SIM 形态**：eSIM / iSIM / APN（接入点名称）/ MNO（移动网络运营商）/ MVNO（虚拟运营商）

**频谱**：Licensed Spectrum（授权频段）/ Unlicensed Spectrum（非授权频段）/ CBRS PALS 3.5 GHz

**省电机制**：eDRX（扩展不连续接收）/ PSM（省电模式，隐含）

**组网与覆盖**：Backhaul（回传）/ Structure Attenuation（结构衰减）/ Segmentation（分段）/ Always-on Connectivity

**短距/其他无线**：Zigbee / 6LoWPAN / WPAN / UWB（超宽带）/ RFID / 无线传感网（WSN）/ 蓝牙（WPAN 相关）

---

## 二、协议（Protocols）

**BACnet 体系（楼宇自控核心，词条最多）**：
- 基础：BACnet / BACnet/IP / BACnet MSTP / BACnet Secure Connect (BACnet/SC)
- 对象：BACnet Objects / Multi-State Objects / Schedule & Calendar Objects / Trend Log
- 服务：BACnet Services / WriteProperty & ReadProperty / COV(Change of Value)
- 属性与配置：BACnet Properties / PICS / BIBBs / Device Instance Number / Network Number / Max APDU Length / Priority Array / Mapping / Virtual BACnet Devices
- 组网：BACnet Router / BACnet Gateway / BBMD / JACE & Niagara Framework
- 集成：LoRaWAN-to-BACnet Integration

**工业/串行**：RS-485 / Modbus（未单列，RS-485 为物理层，Modbus 为其上协议——Milesight UC100 即 Modbus→LoRaWAN）

**网络/消息**：TCP/IP / DHCP / MAC / APDU / Message Broker（消息代理，MQTT 相关）/ QoS（服务质量）

**计量**：Smart Meter（智能电表）/ Unit Conversion（单位换算）

---

## 三、云平台（Cloud Platforms）

AWS IoT / Azure IoT / SaaS Integration / Device Management / Device SDK / Device Shadow（设备影子）/ API / Real Time Monitoring / Device Discovery

---

## 四、硬件（Hardware）

- 设备：Device（IoT Device）/ IoT Devices / Device Management
- 感知：IoT Sensors / IoT Gateway（网关定义）
- 接口：Analog Input(AI)/Analog Output(AO) / Binary Input(BI)/Binary Output(BO)
- 计量：Smart Meter
- 定位/标识：RFID / UWB / AT 系列资产追踪（Milesight）
- 显示：IoT Display（电子墨水屏，Milesight）

---

## 五、安全与合规（Security & Compliance）

**加密**：AES（高级加密标准）

**市场准入认证**：
- 美国：FCC / PTCRB（蜂窝设备）/ CBRS
- 欧盟：CE Marking / ETSI / ASHRAE Standards
- 加拿大：ISED
- 其他：Device Certifications（设备认证总览）/ OTA Testing

**安全实践**：IoT Device Security / Client Isolation（客户端隔离）

---

## 六、楼宇自动化（Building Automation）

BMS/BAS（楼宇管理系统/楼宇自控系统）/ COV / Trend Log / Schedule & Calendar Objects / Hysteresis（迟滞）/ FDD（故障检测与诊断）/ HACCP（危害分析与关键控制点）/ Fault Detection & Diagnostics

---

## 七、交叉概念

- **M2M**（机器对机器，IoT 前身概念）
- **Industrial IoT / IIoT**（工业物联网）
- **Failover**（故障切换，网关高可用）
- **Device Discovery**（设备发现）
- **WriteProperty/ReadProperty**（BACnet 读写服务，也是设备控制的通用心智）

---

## 附：原 wiki 按字母索引（用于回溯真源）

0-9：2G / 3G / 4G / 5G / 6LoWPAN
A：AES / Always-on Connectivity / AI·AO / APDU / API / APN / AWS IoT / Azure IoT
B：Backhaul / BACnet / BACnet Gateway / BACnet MSTP / BACnet Objects / BACnet Properties / BACnet Router / BACnet/SC / BACnet Services / BACnet/IP / BBMD / BIBBs / BI·BO / BMS·BAS
C：CBRS PALS 3.5 GHz / CE Marking / Client Isolation / COV
D：Device / Device Certifications / Device Discovery / Device Instance Number / Device Management / Device SDK / Device Shadow / DHCP
E：eDRX / eSIM / ETSI·ASHRAE
F：Failover / FDD / FCC
H：HACCP / Hysteresis
I：IoT Gateway / IIoT / IoT Device Security / IoT Devices / IoT Sensors / ISED / iSIM
J：JACE·Niagara
L：Licensed Spectrum / LoRa / LoRa Alliance / LoRaWAN / LoRaWAN-to-BACnet / LTE-M
M：M2M / Mapping / Max APDU Length / MAC / Message Broker / MNO / MVNO / Multi-State Objects
N：NB-IoT / Network Number
O：OTA Testing
P：PICS / Priority Array / PTCRB
Q：QoS
R：RFID / Real Time Monitoring / RS-485
S：SaaS Integration / Schedule·Calendar Objects / Segmentation / Smart Meter / Structure Attenuation
T：TCP/IP / Trend Log
U：UWB / Unit Conversion / Unlicensed Spectrum
V：Virtual BACnet Devices
W：WSN / WPAN / WriteProperty·ReadProperty
Z：Zigbee
