# Milesight 产品全景图（IoT 线 + 安防线）

> Milesight 有两条独立产品线：**IoT 线**（milesight.com/iot，LoRaWAN/楼宇）与**安防线**（milesight.com/security，CCTV/视频监控）。
> 本文件是 IoT 线全景图；安防线见 [security-cctv.md](security-cctv.md)；跨线的 CV/AI 能力（安防 AI 算法 + VS 人数感知 + OpenVision）见 [cv-ai.md](cv-ai.md)。
> 用于竞品对标 + 参数基线。详细规格见同目录各文件。

---

## 〇、安防产品线（CCTV，独立于本表）

Milesight 安防线（milesight.com/security）涵盖 IPC 摄像机（Q/Pro/Panoramic/PTZ/Mini/5G/OpenVision/TrafficX/TrafficC/Parking/Solar 系列）+ NVR（4K Mini/Pro/PoE/Enterprise）+ OpenVision 智能服务器 + 配套。**见 [security-cctv.md](security-cctv.md)**。

跨线的 **CV/AI 能力**（安防 AI 算法内置 + VS 人数感知传感器 + OpenVision 边缘 AI 平台）单独沉淀于 **[cv-ai.md](cv-ai.md)**，供 CV 赛道对标。

---

## 一、产品线总览（IoT 线）

| 大类 | 系列 | 定位 |
|---|---|---|
| 传感器 | AM / People Sensing / WT / GS / CoWork / WTS / TS / EM300 / EM400 / EM500 / AT / CT / IoT Display | 环境/空气质量/人数/温控/气体/气象/距离/资产/电流 |
| 网关 | UG63 / UG56 / UG65 / UG67 / SG50 / HL31 / EG71 | LoRaWAN 网关（室内/室外/工业/太阳能）+ Wi-Fi HaLow + 楼宇网关 |
| 控制器 | UC100 / UC300 / UC50x / UC51x | Modbus→LoRaWAN / LoRaWAN+4G / 多接口 / 电磁阀 |
| 工业路由 | UR41/41L / UR32/32L/32S / UR35 / UR75 / UF31 / UF51 | 蜂窝路由 / 5G 路由 / 5G Dongle / 5G CPE |
| 软件平台 | IoT Cloud / DeviceHub / MilesightVPN / Beaver IoT / Dev Platform | 设备管理 / 数据上云 / 私有化 |

---

## 二、传感器（Sensors）

| 系列 | 用途 |
|---|---|
| **AM Series** | 室内空气质量（IAQ）：CO2 / PM2.5 / 温湿度 / TVOC / HCHO |
| **People Sensing** | 人数统计 / 占位检测（PIR/毫米波/ToF） |
| **WT Series** | 智能温控器 / HVAC 控制 |
| **GS Series** | 气体检测（可燃/有毒气体） |
| **CoWork Series** | 智能办公（工位/会议室/环境一体） |
| **WTS Series** | 气象站（风速/风向/雨量/光照/温湿度/气压） |
| **TS Series** | 温度传感 |
| **EM300 Series** | 多功能环境（温湿度/漏水/门磁/占位/距离等） |
| **EM400 Series** | 距离/液位（超声波/ToF） |
| **EM500 Series** | 户外环境（土壤/气象/太阳能供电） |
| **AT Series** | 资产追踪（GPS/Wi-Fi 定位） |
| **CT Series** | 电流互感器 / 电能监测 |
| **IoT Display** | 电子墨水屏（低功耗显示） |

---

## 三、网关（Gateways）

| 型号 | 定位 |
|---|---|
| **UG63** | Mini LoRaWAN 网关（轻量室内） |
| **UG56** | 工业级 LoRaWAN 网关 |
| **UG65** | 室内 LoRaWAN 网关（主力） |
| **UG67** | 室外 LoRaWAN 网关（IP67） |
| **SG50** | 超低功耗太阳能 LoRaWAN 网关 |
| **HL31** | Wi-Fi HaLow 网关（长距离 Wi-Fi） |
| **EG71** | 楼宇 IoT 网关（BACnet/Modbus 接入） |

---

## 四、控制器（Controllers）

| 型号 | 定位 |
|---|---|
| **UC100** | Modbus → LoRaWAN 转换器 |
| **UC300** | LoRaWAN + 4G 控制器 |
| **UC50x** | LoRaWAN 多接口控制器（AI/DI/DO/RS485） |
| **UC51x** | LoRaWAN 电磁阀控制器 |

---

## 五、工业路由（Industrial Routers）

| 型号 | 定位 |
|---|---|
| **UR41 / UR41L** | Mini 系列蜂窝路由 |
| **UR32 / UR32L / UR32S** | Pro / Lite 系列蜂窝路由 |
| **UR35** | Pro 系列蜂窝路由 |
| **UR75** | 5G 路由 |
| **UF31** | 5G Dongle |
| **UF51** | 5G CPE |

---

## 六、软件平台（Software）

| 产品 | 定位 |
|---|---|
| **Milesight IoT Cloud** | 一站式设备管理 + 数据可视化云平台 |
| **DeviceHub** | 设备批量配置/管理工具 |
| **MilesightVPN** | 设备远程安全接入 |
| **Beaver IoT** | 新一代 IoT 平台（多协议接入） |
| **Dev Platform** | 开发者平台（API/SDK） |

---

## 七、Demo Kits（场景套件，竞品/方案参考）

IAQ Kit / Smart Agriculture Kit / Smart Restroom Kit / Smart Building Kit / CoWork Kit-A · Kit-B

> 这些套件是 Milesight 的场景化方案打包——做 PRD 方案梳理时，是「场景→产品组合」的最佳参考。

---

## 八、典型技术栈画像（用于竞品对标）

Milesight 的核心能力矩阵：
- **连接**：LoRaWAN（主力）+ 蜂窝（4G/5G）+ Wi-Fi HaLow
- **协议**：Modbus / BACnet / MQTT / HTTP（EG71 楼宇网关做协议转换）
- **感知**：环境/空气质量/占位/计量/资产追踪全覆盖
- **云**：IoT Cloud（SaaS）+ DeviceHub（工具）+ Beaver IoT（新平台）
- **场景**：楼宇 / 办公 / 农业 / 公厕 / 室内环境 / 资产追踪
