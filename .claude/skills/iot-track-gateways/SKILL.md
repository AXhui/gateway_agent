---
name: iot-track-gateways
description: 物联网「网关」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中网关（网关/Gateway/协议转换/数据汇聚/上行/回传/边缘计算/Edge/LoRaWAN网关/BACnet网关），或用户直接提网关产品需求时，进入本赛道：按「下行接入 → 上行回传 → 边缘处理 → 管理安全」四段审 PRD 合理性，并对标 Milesight 网关（UG63/56/65/67/SG50/HL31/EG71）。知识文件：.claude/knowledge/iot-fundamentals/connectivity.md + .claude/knowledge/milesight-products/gateways.md。
---

# 网关赛道 — 判断与思考方向

> 知识真源：`.claude/knowledge/iot-fundamentals/connectivity.md`（连接选型/回传）+ `.claude/knowledge/milesight-products/gateways.md`（UG 系列/SG50/HL31/EG71 参数基线）。审 PRD 前先读这两份。

## 一句话定位

网关 = 承上启下的「协议翻译官 + 数据汇聚点」：下行收多设备多协议，上行统一回传到云/本地。审 PRD 的关键是**下行接得全、上行回得通、边缘算得动、管理管得住**。

## 判断与思考方向（审 PRD 四段）

### 1. 下行接入（收什么、接多少）
- 接入协议：LoRaWAN（作为 LoRa 网关）/ Modbus·RS485 / BACnet / 模拟量(AI·DI) / 干接点。
- 容量：并发接入设备数、单网关带载上限（LoRa 网关看信道数与 SF，Modbus 看轮询周期）。
- 是否协议转换：Modbus→LoRaWAN、LoRaWAN→BACnet（对照 .claude/knowledge/iot-fundamentals/protocols.md 的 BACnet 集成）。

### 2. 上行回传（怎么回、回不回得通）
- 回传方式：以太网 / 4G / 5G / Wi-Fi / 卫星；双 SIM/双链路冗余(链路 Failover)。
- 回传带宽与数据量：接入设备总量 × 上报频次 × 单条数据量，算上行压力。
- 断网兜底：本地缓存 + 补传；断网后数据不丢。

### 3. 边缘处理（要不要在网关算）
- 边缘计算/规则引擎/本地告警/数据清洗，还是纯透传。
- 若叠加 AI（边缘推理）→ 叠加 **CV 副赛道**。

### 4. 管理与安全
- 远程管理/OTA/批量配置（DeviceHub 类工具）；设备影子/心跳/离线检测。
- 安全：TLS/DTLS 加密、证书、白名单、防火墙、VPN（对照 .claude/knowledge/iot-fundamentals/security-compliance.md）。

## 需求澄清必问
1. 下行接什么设备、什么协议、多少台？
2. 上行回传走什么？现场有无有线/信号如何？
3. 数据量多大、上报多频？需不需要断网缓存？
4. 网关要不要做边缘计算/本地规则/本地告警？

## 竞品对标
主对标 Milesight 网关（UG63 mini / UG65 室内 / UG67 室外 / SG50 太阳能 / EG71 楼宇 BACnet / HL31 Wi-Fi HaLow，参数见 .claude/knowledge/milesight-products/gateways.md）；必要时补 Kerlink/Multitech 电信级网关基线。

## 产出物
下行接入能力核对 + 上行回传/带宽测算 + 边缘处理定位 + 安全清单 + 竞品基线 + 风险（带载不足/回传不通/断网丢数据）。
