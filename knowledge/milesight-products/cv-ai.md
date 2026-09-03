# Milesight CV / AI（计算机视觉 / 边缘智能）能力线

来源：milesight.com/search?q=CV 检索结果 + milesight.com/security/vir-2026 + milesight.com/iot，检索日期 2026-09-03

> CV 赛道与 CCTV 赛道的边界：CCTV 审「成像→存储→传输→平台」四段硬件链路；**CV 审「算法→数据→算力→部署」四要素**。本文沉淀 Milesight 的 AI/CV 能力作为竞品基线，供 CV 赛道对标。
> 覆盖三块：① 安防 AI 摄像机（内置算法）② 人数感知 VS 系列传感器（AI 视觉/ToF/雷达）③ OpenVision 边缘 AI 平台。

---

## 一、AI 能力全景（安防线内置算法）

> 详见 `security-cctv.md` 三、AI 能力。此处按「算法任务」维度重排，便于 CV 赛道对照。

| 算法任务 | 落地能力 | 代表产品线 |
|---|---|---|
| **目标检测/跟踪** | 多目标 & 小目标跟踪、跨角度/距离精准捕获、误报抑制、环境噪声过滤 | Q/Pro/Panoramic/PTZ/Mini 全系 AI 摄像机 |
| **结构化元数据** | 物体属性识别、本地元数据存储、后端元数据检索（VMS 侧） | 全系 + OpenVision |
| **行为分析** | 跌倒(Fall) & 暴力(Violence)检测、AI 声音分类、隐私感知 AI 处理、PPE 合规监测 | Pro/OpenVision 系列 |
| **客流统计** | 人数统计、流向分析、密度监测、热力图 | People Sensing VS 系列 + 摄像机端 |
| **智能交通(ANPR/LPR)** | PlateXpert 2.0 车牌识别、VioGuard 违章检测、雷达+视觉融合测速 | TrafficX / TrafficC / Parking / Entrance&Exit / Solar ANPR |
| **停车** | 实时车位检测、动态引导、出入口 LPR | Parking Management / Entrance & Exit |

---

## 二、精度基线（CV 赛道对标锚点）

| 能力 | 精度指标 | 备注 |
|---|---|---|
| ANPR 车牌 | **98% 精度 / 0.1s 识别时间 / 99% 捕获率 / 支持 50+ 国家** | TrafficX 执法级，Global Shutter 全局快门 |
| 人数统计（VS121 双目） | **95% 双向计数精度**，190° 水平视场 | 匿名计数，GDPR 合规 |
| 跌倒/暴力检测 | 未披露量化精度（待补） | 边缘端跑，隐私感知处理 |

> 审 PRD 用法：产品若报「人脸 99.9%」「车牌 99%」，先问「在什么数据集/光照/角度下」，并拿 98%/0.1s（Milesight 执法级 ANPR 作参照）比对。**裸精度 = 硬伤**。

---

## 三、人数感知 VS 系列（AI 视觉/ToF/雷达传感器）

> 这是 Milesight 相对竞品最独特的「匿名人员感知」产品线，横跨 CV 与传感两赛道。全系 LoRaWAN 无线，匿名、无面部识别、GDPR 合规。

| 型号 | 传感技术 | 用途 | 关键参数 |
|---|---|---|---|
| **VS125** | 双目立体视觉 (Stereo Vision) | 客流计数 | 双目计数，精度高 |
| **VS133/VS135** | ToF (Time-of-Flight) | 客流计数 | 飞行时间测距计数 |
| **VS126** | 双目立体视觉 | 超高吊装客流计数 | 高位安装 |
| **VS121** | AI 视觉（双目，单目变体） | 办公/区域双向计数 | **95% 精度、190° 视场、16 自定义区、4 人流线、8 隐私遮罩、2.3–4m 安装**；LoRaWAN C / PoE 版；5V/2A 常供 |
| **VS361** | AI 视觉 | 店面客流/足流趋势 | Storefront footfall |
| **VS350** | — | 通道客流 | Passage 计数 |
| **VS351** | 热电堆 (Thermopile) | 迷你客流计数 | 低功耗热成像 |
| **VS360** | 红外断束 (Breakbeam) | 通道计数 | 断束式 |
| **VS370** | 毫米波雷达 (Radar) | 人体存在检测 | 穿透/隐私保护 |
| **VS373** | 毫米波雷达 + AI | 跌倒检测 | 卫生间/养老跌倒告警 |
| **VS340/VS341** | — | 工位/座位占用 | 座椅级占用 |
| **VS330** | — | 卫生间占用 | Restroom 占用 |
| **VS321** | — | 无线 AI 占用 | Wireless occupancy |

**CV 赛道关键洞察**：人数感知领域「**用什么传感器技术**」是第一决策——双目立体视觉（精度高、成本高、需常供电）vs ToF（抗光、中精度）vs 热电堆（低功耗、低精度、无隐私问题）vs 雷达（穿透/隐私好、无成像）vs 断束（最便宜、仅单点计数）。审 PRD 时先问「精度 vs 成本 vs 隐私 vs 供电」四维取舍。

---

## 四、边缘 AI 部署（OpenVision + AI Box）

| 形态 | 定位 | 能力 |
|---|---|---|
| **OpenVision 摄像机** | 开放边缘智能，摄像机内直接跑第三方 AI | 嵌入第三方 VMS + AI、直接部署算法/应用/自定义软件、Milesight Developer Toolkit |
| **OpenVision Server** | 独立智能服务器（NVR 侧） | 高性能边缘算力（充足 CPU/GPU/内存，具体规格待补） |
| **AI Box（X1 Sensing Camera）** | 边缘 AI 盒/感知相机 | 边缘推理节点 |

**CV 赛道关键洞察**：Milesight 走「**边缘开放**」路线（OpenVision 允许第三方算法直接跑在摄像机/服务器上），对标 AWS Panorama / Azure Percept / Google Coral / Nvidia Jetson 生态。审 PRD 的部署段要区分：**端侧（摄像机内置 AI）vs 边缘盒（OpenVision/AI Box/Jetson）vs 云** 三层，分别核对算力、时延、模型能否量化落地。

---

## 五、对标要点（CV 赛道参数基线锚点）

- **Milesight CV 能力矩阵**：目标检测/跟踪 + 结构化元数据 + 行为分析(跌倒/暴力) + 客流统计 + 交通 ANPR + 边缘开放(OpenVision) + 匿名隐私合规。
- **相对边缘 AI 纯算力厂商（Nvidia Jetson/Rockchip/Ambarella）的定位**：Milesight 走「**算法场景化封装 + 匿名隐私 + 开放边缘部署**」，不拼裸算力，拼「开箱即用的场景 AI」。
- **本赛道审 PRD 时的对照锚**：精度(ANPR 98%/0.1s、计数 95%) → 部署层(端/边/云) → 算力(能否 INT8 量化落地) → 隐私(匿名/GDPR) → 传感技术选型(双目/ToF/热电堆/雷达/断束)。

---

## 六、待补清单（后续深挖 datasheet）

- [ ] VS125/VS133/VS135/VS126/VS350/VS351/VS360/VS361/VS370/VS373/VS340/VS341 逐型号的计数精度、安装高度、视场角、供电、续航
- [ ] 行为分析（跌倒/暴力/PPE）的量化精度与误报率
- [ ] OpenVision Server 算力规格（CPU/GPU/内存/路数）
- [ ] OpenVision Developer Toolkit 的 API/模型接入方式（能否跑 ONNX/TensorRT）
- [ ] 隐私合规细节（匿名化技术路径：人脸马赛克/元数据化）
- [ ] 定价（AI 摄像机 vs 普通摄像机溢价、VS 系列单价）

---

## 七、与其它知识文件的联动

- 传感器传感技术细节 → `sensors.md`（People Sensing / CoWork 段）
- 安防 AI 摄像机硬件与成像 → `security-cctv.md`（AI 能力 + VIR-2026）
- 底层连接/协议（LoRaWAN Class、MQTT）→ `../iot-fundamentals/connectivity.md`、`protocols.md`
- 竞品对标框架 → `../competitor-research/README.md`（7 维对标）
