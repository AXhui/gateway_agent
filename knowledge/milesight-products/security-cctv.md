# Milesight 安防（CCTV/视频监控）产品线

来源：milesight.com/security（VIR-2026 战略页），检索日期 2026-09-03

> 这是 Milesight **安防产品线**（区别于 `milesight.com/iot/` 的 LoRaWAN/楼宇 IoT 线）。
> 本文基于 VIR-2026 战略总览页沉淀；逐型号硬参数（分辨率/传感器/码率/镜头焦距等）需到具体系列 datasheet 深挖，标记为「待补参数」。

---

## 一、V.I.R 战略框架（2026）

Milesight 安防线的产品哲学四支柱：

| 支柱 | 含义 | 落地信号 |
|---|---|---|
| **V — Vision 视觉** | 复杂环境下清晰成像 | TrueColor 全彩、Smart hybrid light、WDR 优化、Smart IR、算法去雾+镜头加热 |
| **I — Intelligence 智能** | 精准检测、减少误报 | 多目标/小目标跟踪、误报抑制、结构化元数据、隐私感知 AI |
| **R — Reliability 可靠** | 长期户外稳定 | IP67+IK10、NEMA 4X（即将）、4kV 浪涌（即将）、5 年质保 |
| **Open 开放** | 生态集成 + 边缘 AI 部署 | OpenVision 平台、第三方 VMS 嵌入、Developer Toolkit、高性能边缘算力 |

---

## 二、产品线地图

### IPC 摄像机系列

| 系列 | 定位 | 关键特征 |
|---|---|---|
| **Q 系列** | TrueColor 全彩 + 主动威慑(Active Deterrence) | 全彩成像、主动声光威慑 |
| **Pro 系列** | 项目级(Project-Grade) | 高端传感器、增强 AI 处理器、丰富接口 |
| **Panoramic 系列** | 全景无盲区 | 180°/360°，无缝双传感器 180°、多传感器 360° |
| **PTZ 系列** | 新一代精准控制 | 高光学变焦、AI 辅助自动跟踪、新电机系统 |
| **Mini 系列** | 轻量入门 | — |
| **5G 系列** | 5G 蜂窝直连 | 移动/无网部署 |
| **OpenVision 系列** | 开放边缘智能 | 嵌入第三方 VMS 与 AI、直接部署算法/应用 |
| **TrafficX 系列** | 执法级交通 | 执法级精度、Global Shutter 全局快门 |
| **TrafficC 系列** | 日常交通管理/违章 | — |
| **Parking Management** | 停车管理 | 实时车位检测、动态引导、出入口 |
| **Entrance & Exit** | 出入口 | — |
| **Solar-Powered 系列** | 离网部署 | 低功耗 + 4G/Wi-Fi、太阳能供电 |

### NVR / 服务器 / 配套

| 类别 | 型号/系列 |
|---|---|
| 4K Mini NVR | 1000 系列 |
| 4K Pro NVR | 5000 / 7000 / 8000 系列 |
| 4K Mini PoE NVR | 1000 系列 |
| 4K PoE NVR | 5000 / 7000 系列 |
| Enterprise NVR | 3U 系列 |
| 智能服务器 | OpenVision Server |
| 配套 | PoE 交换机(4/8/16/24口)、IP 扬声器、键盘 |

---

## 三、关键硬参数基线（VIR-2026 已披露）

### 成像
- 分辨率：4K（NVR 系列支持；IPC 具体规格待补）
- 成像技术：TrueColor 全彩、Smart hybrid light（智能混光）、Advanced WDR 优化、Smart IR 智能红外、自适应红外波长、算法去雾、镜头加热、镜头畸变校正
- 特殊：WDRX 技术、Frame Parity Flashing、Global Shutter（全局快门，交通执法用）

### AI 能力（安防核心差异化）
- **精准检测**：多目标 & 小目标跟踪、跨角度/距离精准捕获、误报抑制、环境噪声过滤
- **结构化元数据**：物体属性识别、本地元数据存储、后端元数据检索
- **行为分析**：跌倒(Fall) & 暴力(Violence)检测、AI 声音分类、隐私感知 AI 处理、PPE 合规监测
- **客流**：人数统计、流向分析、密度监测、热力图
- **智能交通**：PlateXpert 2.0（车牌）、VioGuard；**99% 捕获率、98% ANPR 精度、0.1s 识别时间、支持 50+ 国家**

### 存储 / 网络 / 协议
- 压缩：H.265+/H.264+ 智能流、先进图像压缩、**四码流(Quad stream)**
- 网络：4G / 5G / Wi-Fi / 有线
- 协议：**ONVIF 互操作**、FTP / SMTP / TCP / HTTP / **MQTT**、Milesight One API

### 防护 / 供电 / 质保
- 防护：IP67 + IK10；工业级 NEMA 4X 外壳（coming soon）；4kV 浪涌（coming soon）
- 供电：低功耗设计、4G/5G 太阳能就绪设计
- 质保：最高 5 年

### 开放平台（OpenVision）
- 嵌入式第三方 VMS + AI 集成、开放边缘架构、直接在摄像机上部署 AI 算法/应用/自定义软件
- Milesight Developer Toolkit、高性能边缘平台（充足 CPU/GPU/内存）

---

## 四、应用场景

| 场景 | 细分 |
|---|---|
| 公共安全 | Safe City 监控、政务安防 |
| 移动监控 | 拖车/塔基移动监控、偏远无电网部署 |
| 工业/矿业 | 矿场安防、工地 |
| 商业零售 | 零售视频监控、行为分析、顾客计数、热区分析 |
| 智能交通 | 交通监控、执法、测速执法、智能停车 |
| 停车场 | 室内停车引导、出入口管理 |

---

## 五、对标要点（CCTV 赛道参数基线锚点）

- **Milesight 安防线能力矩阵**：全彩成像(TrueColor) + 主动威慑 + 全景/PTZ + AI 结构化 + 交通执法(ANPR) + 边缘开放(OpenVision) + 5G/太阳能离网。
- **相对海外一线（Axis/Bosch/Hanwha）的定位**：Milesight 走「AI 场景化 + 开放边缘 + 离网供电」差异化，而非纯成像硬件堆料。
- **本赛道审 PRD 时的对照锚**：分辨率/码率(H.265+) → 低照度全彩 → 防护(IP67/IK10) → AI 精度(ANPR 98%/0.1s 作参照) → 开放协议(ONVIF/MQTT) → 离网供电(太阳能/低功耗)。

---

## 六、待补清单（后续深挖 datasheet）

- [ ] Q / Pro / PTZ / Panoramic / TrafficX 各系列具体型号的分辨率、传感器、镜头焦距/FOV、最低照度、红外距离
- [ ] NVR 各系列路数、码流能力、硬盘槽位
- [ ] OpenVision Server 算力规格
- [ ] 逐型号认证（FCC/CE/NDAA 合规性——北美安防市场敏感点）
- [ ] 定价与 NVR/摄像机套包成本
