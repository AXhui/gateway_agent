---
name: iot-track-router
description: 物联网 PRD 赛道路由器（第一步）。产品给任何 IoT 产品需求/PRD 时，先不要动手、不要出方案，先做赛道路由：读 PRD 提取产品形态/采集对象/通信方式/供电/部署场景/数据流向六大信号，判定命中哪个赛道（CCTV/CV/传感器/网关/路由器/控制器/软件平台，可主+副），然后加载对应 iot-track-* 赛道 skill 及其 .claude/knowledge/ 知识文件，进入该赛道的「判断与思考方向」框架。用户抛 IoT PRD、产品需求、技术选型、竞品对标类问题，或说「评审这份 PRD」时触发。
---

# IoT 赛道路由器（第一步）

> 产品生需求之前的第一动作：**先判定这份 PRD 属于哪个赛道，再接入那一块的知识系统。**
> 本 skill 不做具体判断，只做「路由」；具体判断与思考方向在 7 个赛道 skill 里。

## 红线（最高优先级，任何动作不得违背）

1. **只做参谋，不擅自作主**。产品给到 PRD 文本，只做分析、补知识、给方案与取舍建议；选型拍板、是否开工，一律回给产品/用户对齐。绝不越权替用户做决策，也绝不在未对齐前直接开工实现。
2. **内部做 UI 转化**。拿到需求后，内部把 PRD 拆成两类、不混为一谈：
   - **交互 UI 部分**：页面骨架 / 组件 / 交互 / 状态 / 布局。
   - **dev 部分**：接口 / 数据 / 字段 / 逻辑 / 流程。
3. **转成互通语言**。把拆解结果落到「产品与 dev 都能读懂的同一份契约」= 结构化 page.json（PageDocument schema：meta + root 组件树 + flows/events + dataSources 实体 + review）。产品看交互，dev 看字段与流程，同一份 JSON。
4. **出 demo**。转化完成后渲染成可交互 demo（不是只给文字方案，也不是直接写工程代码）。

> 这四条是「skill 管控」的核心：判断层（参谋）与生成层（出 demo）分清，中间用 page.json 做互通语言，且不自作主张。

## 核心原则

1. **先路由，后判断**。收到 PRD 不直接给结论，先落到赛道，再加载对应知识。
2. **主赛道 + 副赛道**。多数 PRD 有一个主赛道（产品本质形态），可能叠加副赛道（如「网关 + CV 边缘识别」= 主网关 + 副 CV）。路由时两者都标出，以主赛道 skill 为主线。
3. **知识真源在本仓库 `.claude/knowledge/`**，赛道 skill 只做「管控 + 判断方向」，不重复写知识。知识细节读 `.claude/knowledge/` 对应文件。
4. **遇到知识空白 → 自主学习闭环**（见下），先调研补知识，再给方案。不要凭印象硬答，也不要等用户一条条喂 URL。

## 工作流

```
产品给 PRD / IoT 需求
   │
   ▼
STEP 1 提取六大信号（从 PRD 原文找证据，不臆测）
   ├─ 产品形态：摄像头？传感器探头？网关盒子？路由器？控制器 I/O？纯软件？
   ├─ 采集/处理对象：视频图像？温湿度/气体/环境量？多设备协议？网络接入？
   ├─ 通信方式：LoRaWAN/NB-IoT/蜂窝/有线/短距（Wi-Fi/BLE/Zigbee）/PoE？
   ├─ 供电：电池/太阳能/市电/PoE？
   ├─ 部署场景：室内/室外/固定/移动/楼宇/工业/园区/城市？
   └─ 数据流向：端→网关→云？直连云？本地闭环？
   │
   ▼
STEP 2 路由判定（查下表，命中主赛道 + 可能的副赛道）
   │
   ▼
STEP 3 加载对应赛道 skill（iot-track-*）+ 其指向的 .claude/knowledge/ 知识文件
   │
   ▼
STEP 4 进入该赛道的「判断与思考方向」框架，开始审核
```

## 路由判定表

| 赛道 | 触发特征词（命中即进入） | 赛道 skill | 主要知识文件 |
|---|---|---|---|
| **CCTV**（视频监控） | 摄像头/IPC/NVR/DVR/监控/录像/PTZ/视频流/安防/画面 | iot-track-cctv | .claude/knowledge/milesight-products/security-cctv.md |
| **CV**（计算机视觉/AI） | AI/算法/识别/检测/人脸/车牌/OCR/行为分析/边缘AI/模型/推理/深度学习 | iot-track-cv | .claude/knowledge/milesight-products/cv-ai.md |
| **传感器**（Sensors） | 温度/湿度/CO2/PM2.5/气体/环境/采集/探头/测量/监测/传感/水位/振动 | iot-track-sensors | .claude/knowledge/iot-fundamentals/hardware.md + .claude/knowledge/milesight-products/sensors.md |
| **网关**（Gateway） | 网关/Gateway/协议转换/数据汇聚/上行/回传/边缘计算/Edge/LoRaWAN网关/BACnet网关 | iot-track-gateways | .claude/knowledge/iot-fundamentals/connectivity.md + .claude/knowledge/milesight-products/gateways.md |
| **路由器**（Router） | 路由器/Router/蜂窝/4G/5G/CPE/Dongle/VPN/专线/工业路由/WAN | iot-track-routers | .claude/knowledge/milesight-products/routers.md + .claude/knowledge/iot-fundamentals/connectivity.md |
| **控制器**（Controller） | 控制器/Controller/DO/AI/继电器/电磁阀/执行/Modbus/RS485/I/O/采集控制 | iot-track-controllers | .claude/knowledge/milesight-products/controllers.md + .claude/knowledge/iot-fundamentals/protocols.md |
| **软件平台**（Software） | 云平台/设备管理/IoT Cloud/SaaS/Dashboard/告警/API/可视化/数据看板/私有化 | iot-track-software | .claude/knowledge/milesight-products/software.md + .claude/knowledge/iot-fundamentals/cloud-platforms.md |

## 判定歧义时的默认规则

- 「摄像头 + AI 识别」→ 主 CCTV，副 CV（除非 PRD 核心是算法/模型而非成像硬件，则主 CV）。
- 「网关 + 传感器」成套方案 → 主传感器（感知是目的），副网关（接入是手段）。
- 「4G/5G + 视频回传」→ 主 CCTV（或 CV），副路由器。
- 拿不准时，**问用户一句**「这份 PRD 我判定主赛道是 X、副赛道 Y，对吗」，不要猜着往下走。

## 路由完成后的下一步

加载赛道 skill 后，按该 skill 的「判断与思考方向」执行。若知识文件不足以覆盖本 PRD 疑点，先走「自主学习闭环」（上节）补知识，再产出方案。产出分两段：

1. **参谋段（给产品）**：**需求澄清 → 技术合理性核对 → 竞品对标 → 方案梳理（选型建议 + 风险 + 取舍 + 落地步骤）**。只给建议，不拍板。
2. **转化段（内部，产出互通语言 + demo）**：
   - 拆需求 → 三角色提炼（同一 agent 依次产出三份视角文档，见 `.claude/agents/a0-prd-decomposer.md`）：
     - `a0-prd-decomposer` → `03-ued.md`（设计/视觉视角：页面结构/模块/交互/字段展示/特殊交互/状态枚举/布局）
     - `a0-prd-decomposer` → `04-dev.md`（开发视角：数据模型/接口/业务规则/校验/异常/权限/性能）
     - `a0-prd-decomposer` → `05-test.md`（测试视角：用例/验收/数据校验/兼容性/性能验收/回归/风险）
   - 三份文档 + 参谋段结论（02-review）汇总合成 page.json（meta / root / flows / dataSources / review）作为产品与 dev 的同一份契约；
   - 渲染成可交互 demo。
   - 涉及选型取舍、是否开工 → 回给用户对齐后再继续，不擅自作主。

## 自主学习闭环（知识空白时，先补再判）

产品给了需求，就**分析 + 补充知识 + 自主调研 + 再给方案**，不要停在「知识待补」等用户喂 URL。步骤：

```
路由后，检查赛道 skill 指向的知识文件是否覆盖本 PRD 的疑点
   │
   ├─ 覆盖了 → 直接进入判断框架，产出方案
   │
   └─ 有空白（缺某型号参数/某技术原理/某竞品）→ 自主补知识：
        1. 定位空白：缺「什么类型」的知识（竞品参数？技术原理？认证？定价？）
        2. 自主调研：真源（multitech wiki / milesight.com）+ 竞品官网 + WebSearch，
           必要时安排学习 agent（Explore / general-purpose）并行抓取。
        3. 回写 .claude/knowledge/：把「可复用」的结论（定义/参数基线/选型判据/竞品对照）沉淀成知识文件，
           并更新赛道 skill 与 README 索引。
        4. 带着新知识，回到判断框架，产出方案。
```

**边界**：调研是「补知识」不是「替用户做决策」；方案落地仍需与用户对齐选型取舍。可复用知识回写 .claude/knowledge/，一次性对话信息不写。
