---
name: iot-track-software
description: 物联网「软件平台 / 设备管理 / 数据可视化」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中软件平台（云平台/设备管理/IoT Cloud/SaaS/Dashboard/告警/API/可视化/数据看板/私有化），或用户直接提平台需求时，进入本赛道：按「设备接入 → 数据与规则 → 应用与可视化 → 部署与商业化」四段审 PRD 合理性，并对标 Milesight 软件（IoT Cloud/DeviceHub/MilesightVPN/Beaver IoT/Dev Platform）与 AWS IoT/Azure IoT。知识文件：.claude/knowledge/milesight-products/software.md + .claude/knowledge/iot-fundamentals/cloud-platforms.md。
---

# 软件平台 / 设备管理赛道 — 判断与思考方向

> 知识真源：`.claude/knowledge/milesight-products/software.md`（Milesight 5 平台 + 计费）+ `.claude/knowledge/iot-fundamentals/cloud-platforms.md`（AWS IoT/Azure IoT/设备影子/设备管理）。审 PRD 前先读这两份。

## 一句话定位

软件平台 = 把海量设备接进来、管起来、把数据变成可视化与告警的「上层大脑」。审 PRD 的关键是**接入协议接得全、数据模型立得住、规则告警真能用、部署商业化讲得清**。

## 判断与思考方向（审 PRD 四段）

### 1. 设备接入（多协议、大规模）
- 接入协议：MQTT/HTTP/CoAP/LoRaWAN(网络服务器)/Modbus 网关/直连 SDK。
- 设备建模：物模型/设备影子/属性-服务-事件三要素；是否支持设备批量注册与认证。
- 规模：万级/百万级设备并发接入、消息吞吐(QPS)、设备分组与权限（对照 cloud-platforms.md）。

### 2. 数据与规则（数据的核心价值）
- 数据存储：时序数据库选型；数据保留策略与成本。
- 规则引擎：阈值/联动/定时触发告警；告警去重与升级(告警疲劳)。
- 数据转发：规则 → 第三方(SaaS/存储/大屏)。

### 3. 应用与可视化
- Dashboard/大屏/报表/历史趋势；移动端。
- 告警通知：App/邮件/短信/Webhook。
- API 开放性：开放 API/SDK 给第三方与集成商。

### 4. 部署与商业化（软件平台特有追问）
- 部署形态：公有云 SaaS vs 私有化(本地/专有云) vs 开源自建（对照 Milesight 三态：IoT Cloud/DeviceHub/Beaver IoT）。
- 计费模式：按设备数/按消息量/按功能订阅；最低起订与免费层。
- 合规：数据主权、GDPR、行业合规（能源/医疗）。

## 需求澄清必问
1. 接什么设备、什么协议、多少量级？
2. 数据怎么用：只看板，还是要规则告警/转发/大屏？
3. 部署形态：SaaS / 私有化 / 开源？（决定架构与商业）
4. 计费模式想清楚了吗？（决定能不能赚钱）

## 竞品对标
主对标 Milesight 软件（IoT Cloud 分层计费/DeviceHub 本地工具/Beaver IoT 开源/Dev Platform 价格，参数见 .claude/knowledge/milesight-products/software.md）；必要时补 AWS IoT Core/Azure IoT Hub 基线。

## 产出物
接入协议与规模核对 + 物模型/数据模型核对 + 规则告警设计 + 部署与计费 + 竞品基线 + 风险（规模预估失真/告警疲劳/商业化不清晰）。
