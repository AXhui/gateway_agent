---
name: iot-track-sensors
description: 物联网「传感器」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中传感器（温度/湿度/CO2/PM2.5/气体/环境/采集/探头/测量/监测/传感/水位/振动/占位/追踪），或用户直接提传感产品需求时，进入本赛道：按「测量对象 → 精度量程 → 供电续航 → 通信上报」四段审 PRD 合理性，并对标 Milesight 传感全系列（AM/EM300/400/500/VS/WS/GS/AT/CT）。知识文件：.claude/knowledge/iot-fundamentals/hardware.md + .claude/knowledge/milesight-products/sensors.md。
---

# 传感器赛道 — 判断与思考方向

> 知识真源：`.claude/knowledge/iot-fundamentals/hardware.md`（硬件/感知/AI·AO/单位换算）+ `.claude/knowledge/milesight-products/sensors.md`（Milesight 13 系列参数基线）。审 PRD 前先读这两份。

## 一句话定位

传感器 = 把物理量变成电信号再变成数据的「测量 + 上报」单元。审 PRD 的关键是**测量对象选对传感器原理、精度量程给得诚实、供电续航算得清、通信匹配上报频次**。

## 判断与思考方向（审 PRD 四段）

### 1. 测量对象与原理（先问「测什么、怎么测」）
- 被测物理量 → 对应传感器原理：温度(热敏/热电偶/PT100)、湿度(电容式)、CO2(NDIR 非色散红外)、PM2.5(激光散射)、气体(电化学/催化燃烧/半导体)、距离/液位(超声波/ToF/雷达)、占位(PIR/毫米波/ToF)、定位(GPS/Wi-Fi)。
- 原理选错是 PRD 最常见硬伤：如测 CO2 却选电化学、测液位用不适配的原理。

### 2. 精度 / 量程 / 分辨率（参数诚实性）
- 量程是否覆盖场景极值？精度给的是「±x」还是「满量程的 x%」？分辨率够不够用？
- 对照 Milesight 基线（.claude/knowledge/milesight-products/sensors.md 有各系列参数）识别「拍脑袋」参数。
- 漂移/长期稳定性、温度补偿、标定方式（是否需要现场标定）。

### 3. 供电与续航（电池/太阳能设备的核心）
- 供电：电池(容量/可换)、太阳能、市电、PoE。
- 续航测算：采样频率 × 上报频率 × 通信功耗 → 电池寿命。上报频率是续航最大变量，PRD 若「1 分钟上报 + 3 年电池」需算清是否自洽。
- 低功耗机制：省电模式、上报间隔可配、睡眠唤醒。

### 4. 通信与上报
- 连接：LoRaWAN/NB-IoT/LTE-M/蜂窝/短距（对照 .claude/knowledge/iot-fundamentals/connectivity.md 选型速查表）。
- 上报频次 vs 通信能力是否匹配：低频传感器(温湿度)配 LoRaWAN 合理；高频/实时配蜂窝或本地有线。
- 数据格式/单位换算/阈值告警/本地缓存（断网补传）。

## 需求澄清必问
1. 测什么物理量？精度/量程/分辨率的真实需求是多少？
2. 供电与期望续航？（决定上报频次与通信方式）
3. 采样与上报频次？实时性要求？
4. 室内/室外？防护等级？批量规模（决定成本与运维）？

## 竞品对标
主对标 Milesight 传感全系列（本仓库 .claude/knowledge/milesight-products/sensors.md 已有参数基线）；必要时横向补 Sensirion/Bosch/EnOcean 芯片与模块级基线。

## 产出物
测量原理选型 + 参数诚实性核对 + 续航测算 + 通信匹配 + 竞品基线 + 风险（原理错配/参数拍脑袋/续航自洽性）。
