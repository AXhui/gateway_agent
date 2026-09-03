# Milesight 工业路由器产品线

来源：milesight.com/iot，检索日期 2026-09-03

> 蜂窝路由器/CPE 全线：工业级、宽温（-40~70℃）、宽压供电、GNSS 可选、DLMS（智能电表协议）支持、VPN（IPsec/OpenVPN 等）+ MilesightVPN/DeviceHub 远程运维、Python SDK 二次开发。

## UR41（Mini 系列）
- **定位**：迷你经济型，嵌入式/紧凑空间。
- **关键参数**：4G LTE Cat4/WCDMA/GSM，1×Nano SIM，GNSS 2.5m CEP；1×RJ45 10/100 + 1×RS232/RS485 可切 + 1×DI/DO 隔离 + USB-C。
- **供电**：5–24VDC / USB-C 5V，数据链路 226mA@12V。
- **场景**：嵌入式 IoT、智能电表（DLMS）、充电桩、电池/太阳能供电、变电站自动化。

## UR32（Pro/Lite 系列）
- **定位**：口袋级工业路由器，低成本高效率。
- **关键参数**：4G LTE Cat4，双 SIM；2×RJ45 10/100 + 1×RS232（可选 RS485）+ 1×DI/DO + Micro SD；可选 WiFi/GNSS/PoE 输出（2×802.3af/at 各 30W）。
- **供电**：9–48VDC，典型 1.9W。
- **场景**：M2M/IoT、变电站、智能电表、电网监控。

## UR35（Pro 系列）
- **定位**：工业 Pro，多口多设备接入。
- **关键参数**：4G LTE Cat4，双 SIM；5×RJ45（1WAN+4LAN）+ 1×RS232 + 1×RS485 + 1×DI/DO；可选 WiFi/GNSS/PoE（4×802.3af/at，30W/口、总 60W）。
- **供电**：9–48VDC（48V 供 PoE），典型 3.9W。
- **场景**：智能电表/变电站、工业远程监控、VPN 隧道。

## UR75（5G 路由器）
- **定位**：5G 旗舰工业路由器。
- **关键参数**：5G NR SA/NSA + 4G LTE + WCDMA，Sub-6 下行最高 4.67Gbps，GNSS 2m CEP；5×RJ45 千兆（1WAN+4LAN）+ RS232/RS485 + DI/DO + USB3.0；WiFi6 双频并发 1.8Gbps；可选 PoE（4×af/at，总 60W）。
- **供电**：9–48VDC / Type-C 5V/3A。
- **场景**：工业 IoT、M2M、恶劣环境远程管理。

## UF31（5G Dongle/加密狗）
- **定位**：5G 上网棒，嵌入式/机器人/机器内部空间受限。
- **关键参数**：5G NR SA/NSA + 4G + WCDMA，4×4 MIMO 下行 4.13Gbps，GNSS；1×RJ45 千兆 LAN + USB3.0 + Micro SIM。
- **供电**：5–24VDC / USB-C 5V/3A。
- **场景**：移动/嵌入式、通用「G 升级」、机器人。

## UF51（5G CPE）
- **定位**：5G 客户端设备（CPE），室内外两用。
- **关键参数**：5G NR SA/NSA + 4G + WCDMA，8 内置天线，双 SIM，GNSS 2m CEP；2×以太网（1×2.5G + 1×1G）+ RS485（可选 RS232）+ DI/DO + USB3.0；可选 WiFi6（2.4G 1200M + 5G 2400M）。
- **供电**：9–48VDC / 802.3at PoE PD；IP67 + 抗 UV，桌面/壁挂/杆装。
- **场景**：室内外高速联网，连接更多设备。

## 参数基线速查表（路由器横比）
| 型号 | 定位 | 蜂窝 | 以太网 | 串口/I/O | 供电 | 防护/温度 |
|---|---|---|---|---|---|---|
| UR41 | Mini | 4G Cat4 | 1×10/100 | RS232/485+DI/DO | 5–24V | — |
| UR32 | 口袋工业 | 4G Cat4 双 SIM | 2×10/100 | RS232+DI/DO | 9–48V | -40~70℃ |
| UR35 | Pro 多口 | 4G Cat4 双 SIM | 5×(1WAN+4LAN) | RS232+RS485+DI/DO | 9–48V | IP30 -40~70℃ |
| UR75 | 5G 旗舰 | 5G+4G | 5×千兆 | RS232+RS485+DI/DO | 9–48V | 工业级 |
| UF31 | 5G 上网棒 | 5G+4G | 1×千兆 | USB3.0 | 5–24V | 嵌入式 |
| UF51 | 5G CPE | 5G+4G 双 SIM | 1×2.5G+1×1G | RS485+DI/DO | 9–48V/PoE | IP67 |

**关键差异结论**：4G 与 5G 两条线——4G（UR41/UR32/UR35）按「端口数量」分档（1→2→5 以太网口），5G（UR75 路由 / UF31 加密狗 / UF51 CPE）按「产品形态」分档（整机路由 / 嵌入式棒 / 大覆盖 CPE）；共性是 DLMS 电表协议 + 双 SIM + 宽温宽压 + GNSS 定位，直接面向「电力/能源/充电桩」行业。
