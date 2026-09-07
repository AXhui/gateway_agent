---
name: iot-track-routers
description: 物联网「工业路由器 / 蜂窝接入」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中路由器（路由器/Router/蜂窝/4G/5G/CPE/Dongle/VPN/专线/工业路由/WAN），或用户直接提路由/蜂窝接入需求时，进入本赛道：按「蜂窝接入 → 网络能力 → 可靠性与冗余 → 安全与专网」四段审 PRD 合理性，并对标 Milesight 路由（UR41/32/35/75/UF31/UF51）。知识文件：.claude/knowledge/iot-fundamentals/connectivity.md + .claude/knowledge/milesight-products/routers.md。
---

# 工业路由器 / 蜂窝接入赛道 — 判断与思考方向

> 知识真源：`.claude/knowledge/iot-fundamentals/connectivity.md`（蜂窝 4G/5G/频谱/eSIM）+ `.claude/knowledge/milesight-products/routers.md`（UR/UF 系列参数基线）。审 PRD 前先读这两份。

## 一句话定位

工业路由器 = 把设备/现场网络接入蜂窝（4G/5G）或 WAN 的「可靠上网通道」。审 PRD 的关键是**蜂窝制式选对、网络能力够用、链路不轻易断、安全专网打通**。

## 判断与思考方向（审 PRD 四段）

### 1. 蜂窝接入（制式与频段）
- 制式：4G(LTE Cat4/Cat6/Cat1) vs 5G(Sub-6/毫米波)；Cat 等级决定带宽，Cat1 低带宽低成本、Cat4 主流、Cat6+ 高带宽。
- 频段覆盖目标地区：北美/欧洲/亚太频段不同，多频段 or 分地区 SKU。
- SIM 形态：单/双 SIM 冗余、eSIM（对照 connectivity.md 的 eSIM/iSIM/MNO/MVNO）。
- 是否需蜂窝入网认证：PTCRB（北美）、GCF（全球）（对照 security-compliance.md）。

### 2. 网络能力（WAN/LAN/VPN）
- 接口：千兆/百兆口数、WAN 聚合、串口(RS232/485)、Wi-Fi。
- VPN：IPsec/OpenVPN/WireGuard/L2TP；是否需站点到站点专网。
- 防火墙/NAT/端口映射/DDNS/静态路由。

### 3. 可靠性与冗余（工业场景核心）
- 双 SIM + 双链路 Failover（蜂窝断→有线/Wi-Fi 自动切换，对照 connectivity.md 的 Failover）。
- 工业级：宽温（-40~75℃）、宽压、防浪涌、看门狗、掉线自动重连。
- 无人值守：远程诊断/重启、集中管理平台。

### 4. 安全与专网
- 加密 VPN、证书、TLS；是否对接企业专网/私有 APN。
- 远程安全接入（MilesightVPN 类）。

## 需求澄清必问
1. 现场接什么设备、要多大上行/下行带宽？（定 Cat 等级与 4G/5G）
2. 部署在什么环境？（室内/户外/车载，定工业级与防护）
3. 目标市场哪个地区？（定频段 + 认证）
4. 要不要 VPN/专网/双链路冗余？

## 竞品对标
主对标 Milesight 路由（UR41 mini / UR32/35 Pro / UR75 5G / UF31 Dongle / UF51 CPE，参数见 .claude/knowledge/milesight-products/routers.md）；必要时补 Cisco/Sierra Wireless/Teltonika 工业路由基线。

## 产出物
制式与频段选型 + 带宽/接口核对 + 可靠性清单 + 安全专网 + 竞品基线 + 风险（频段/认证错配、带宽不足、链路单点）。
