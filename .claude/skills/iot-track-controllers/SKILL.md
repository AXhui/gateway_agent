---
name: iot-track-controllers
description: 物联网「控制器 / I/O 执行」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中控制器（控制器/Controller/DO/AI/继电器/电磁阀/执行/Modbus/RS485/I/O/采集控制），或用户直接提控制/执行需求时，进入本赛道：按「接口能力 → 控制逻辑 → 上行协议 → 安全与本地自控」四段审 PRD 合理性，并对标 Milesight 控制器（UC100/UC300/UC50x/UC51x）。知识文件：knowledge/milesight-products/controllers.md + knowledge/iot-fundamentals/protocols.md。
---

# 控制器 / I/O 执行赛道 — 判断与思考方向

> 知识真源：`knowledge/milesight-products/controllers.md`（UC 系列参数基线）+ `knowledge/iot-fundamentals/protocols.md`（Modbus/RS485/AI·AO/BI·BO）。审 PRD 前先读这两份。

## 一句话定位

控制器 = 从「看」到「动」的执行单元：采集输入(AI/DI) → 逻辑判断 → 输出控制(AO/DO/继电器)。审 PRD 的关键是**接口够不够、逻辑跑在哪、上行通不通、失联时本地能不能自控**。

## 判断与思考方向（审 PRD 四段）

### 1. 接口能力（I/O 点表是否对得上）
- 输入：AI(模拟 0-10V/4-20mA) / DI(干接点/脉冲计数)。
- 输出：AO / DO / 继电器(触点容量) / 电磁阀(UC51x)。
- 串口：RS485(Modbus RTU) 接子设备。
- **PRD 硬伤高发**：I/O 点数量/类型与实际设备点表对不上（如把 DO 当 AO 用、继电器触点容量不够带动负载）。

### 2. 控制逻辑（逻辑跑在哪）
- 本地逻辑 vs 云端下发：本地规则引擎（掉线仍自控）vs 云控（依赖链路）。
- 联动/条件/定时/阈值触发；PID 调节（温控/阀控）。
- 失联自控策略：断网时保持最后一次指令 or 执行预设安全状态（安全态是工业控制关键）。

### 3. 上行协议（怎么接入 IoT）
- Modbus→LoRaWAN（UC100）、LoRaWAN+4G（UC300）等协议转换（对照 protocols.md）。
- 遥测/遥信/遥控三遥是否齐全；下行控制时延与可靠性。

### 4. 安全与执行可靠性
- 控制指令鉴权/加密，防止误控/恶意控制。
- 继电器寿命/触点保护（感性负载需续流/浪涌保护）。
- 本地状态上报与异常检测。

## 需求澄清必问
1. 控制什么负载（阀/继电器/电机/灯）？功率/电压/电流多大？（定触点容量）
2. I/O 点表和类型列全了吗？
3. 逻辑必须在本地自控（掉线仍执行），还是可依赖云？
4. 失联时安全态是什么？（这是控制器区别于传感器的核心追问）

## 竞品对标
主对标 Milesight 控制器（UC100 Modbus→LoRaWAN / UC300 LoRaWAN+4G / UC50x 多接口 / UC51x 电磁阀，参数见 knowledge/milesight-products/controllers.md）。

## 产出物
I/O 点表核对 + 控制逻辑部署定位 + 三遥完整性 + 安全态设计 + 竞品基线 + 风险（点表错配/触点容量不足/失联无安全态）。
