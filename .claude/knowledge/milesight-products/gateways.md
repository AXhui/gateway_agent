# Milesight IoT 网关产品线

来源：milesight.com/iot，检索日期 2026-09-03

> LoRaWAN 网关普遍：8 通道（半/全双工，SX1302 芯片）、-140dBm@292bps 灵敏度、27dBm 最大发射、约 2000 节点（Class A/B/C）、内置网络服务器（LNS）+ FUOTA + 网关集群（Gateway Fleet）+ Node-RED/Python 边缘计算 + BMS 协议（BACnet/IP、BACnet/SC、Modbus TCP/RTU），兼容 ChirpStack/TTN/AWS 等主流 NS。

## UG63 Mini
- **定位**：迷你经济型，小规模/分散点位部署、盲区补盲。
- **关键参数**：8 通道半双工，2000 节点，城区 2km，兼容主流 NS。
- **通信**：LoRaWAN + 以太网 10/100 + 4G LTE Cat1/GSM（可选）+ 2.4G WiFi（仅配置）。
- **供电**：5V/2A Type-C / 2.5–12V DC / 802.3af PoE（转接），典型 2.9W。
- **场景**：小范围 IoT、盲区补点。

## UG56 Industrial
- **定位**：工业级，紧凑可嵌入设备柜。
- **关键参数**：8 通道半双工，2000 节点，LBT（先听后发）降信道冲突。
- **通信**：LoRaWAN + 以太网（PoE PD）+ WiFi + 4G（可选）；支持 BACnet/IP、BACnet/SC、Modbus TCP/RTU。
- **供电**：802.3af PoE / 5V/2A USB-C，典型 1.8W。
- **场景**：工业 IoT、建筑系统集成。

## UG65 Indoor
- **定位**：室内/半室外主力，SX1302。
- **关键参数**：8 通道全/半双工，2000 节点，城区 2km，支持 SF5/SF6 快速传输，Noise Analyzer 选信道。
- **通信**：LoRaWAN + 以太网（PoE PD）+ 4G（可选）+ WiFi。
- **供电**：9–24V DC / PoE / Type-C 5V，典型 2.9W。
- **场景**：智慧楼宇。

## UG67 Outdoor
- **定位**：户外旗舰，IP67 抗恶劣环境。
- **关键参数**：8 通道 SX1302，2000 节点，乡村 15km，-40~70℃，内置超级电容 1 分钟断电告警备份。
- **通信**：LoRaWAN + 以太网/蜂窝/WiFi 带 failover 切换。
- **供电**：802.3af PoE / 6–12V DC（M12），典型 3.6W。
- **场景**：智慧农业、智慧城市/灾害预警、楼宇漏水、高空科研、大型工业。

## SG50 Solar（超低功耗太阳能）
- **定位**：远程无供电地区全无线部署。
- **关键参数**：8 通道，2000 节点，乡村 15km，GPS，超低功耗 0.8W，内置 25Ah 可充电池（无日照续航 4 天），电池低温加热、按温度动态调充电电流、数据包过滤省流量、低光照自动关 WiFi。
- **通信**：LoRaWAN + 4G Cat1/GSM + WiFi（仅配置）+ GNSS。
- **供电**：30W（可选 45W）太阳能板 + 12–24V DC / USB-C；IP67 铸铝壳。
- **场景**：偏远地区、智能路灯（夜间充电白天放电）。

## HL31（Wi-Fi HaLow）
- **定位**：补齐 LoRaWAN 与 WiFi 之间的「图片传输」空白。
- **关键参数**：IEEE 802.11ah（850–950MHz），最高 32Mbps、约 1km，200+ 节点。
- **通信**：HaLow + 以太网 10/100 + 4G Cat4（可选）+ 2.4G WiFi（仅配置）+ VPN（IPsec/OpenVPN/L2TP/PPTP/DMVPN）。
- **供电**：5V/2A Type-C / 2.5–12V DC / PoE，典型 3.9W。
- **场景**：需低功耗传图的智慧楼宇/工业（配对 X1 传感相机）。

## EG71（Building IoT 网关）
- **定位**：智慧楼宇「有线+无线统一」边缘网关，替代传统协议转换器 + I/O 模块 + LoRaWAN 网关三合一。
- **关键参数**：8 通道 LoRaWAN（-140dBm/27dBm）+ 2×RS485（256 设备）+ 1×KNX + 1×M-Bus（规划中）+ 8 路通用输入 + 4 路干接点 + 3 路继电器 + 4 路模拟输出；边缘算力四核 1.5GHz/2GB/32GB，支持 Python/Node-RED/Docker。
- **通信**：采集 BACnet/IP、BACnet MS/TP、Modbus TCP/RTU、KNX TP、M-Bus；转发 MQTT(s)/HTTP(s)/BACnet/IP/Modbus TCP。
- **供电**：24V DC/AC / PoE / 5V/3A Type-C，典型 8.2W。
- **场景**：楼宇 BMS 集成与改造、HVAC 监控控制、照明能源管理（已预集成西门子/JCI/Niagara4/特灵）。

## 参数基线速查表（网关横比）
| 型号 | 定位 | 通道/节点 | 回传 | 供电 | 典型功耗 | 防护 |
|---|---|---|---|---|---|---|
| UG63 | Mini 经济 | 8ch/2000 | Eth+4G(Cat1) | Type-C/DC/PoE | 2.9W | 室内 |
| UG56 | 工业嵌入 | 8ch/2000 | Eth+WiFi+4G | PoE/USB-C | 1.8W | IP30 |
| UG65 | 室内主力 | 8ch/2000(SX1302) | Eth+4G+WiFi | DC/PoE/Type-C | 2.9W | IP65 |
| UG67 | 户外旗舰 | 8ch/2000(SX1302) | Eth/蜂窝/WiFi 冗余 | PoE/6–12V | 3.6W | IP67 |
| SG50 | 太阳能远程 | 8ch/2000 | 4G Cat1 | 30W 太阳能+25Ah | 0.8W | IP67 |
| HL31 | WiFi HaLow | 200+ | Eth+4G | Type-C/DC/PoE | 3.9W | 室内 |
| EG71 | 楼宇边缘 | 8ch/2000 | Eth+RS485/KNX/M-Bus | 24V/PoE/Type-C | 8.2W | 室内 |

**关键差异结论**：回传能力三档——UG63/UG56（以太网+可选 4G）、UG65/UG67（以太网+蜂窝+WiFi 三冗余）、SG50（纯 4G+太阳能）；差异化在 SG50 的「太阳能+电池管理」和 EG71 的「楼宇有线总线融合 + Docker 边缘算力」，后者是从「网关」向「边缘计算/楼宇集成平台」升维的产品。
