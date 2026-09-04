# 物联网业务知识库

> 目的：把我打造成「最全物联网高手」——当产品抛 PRD 时，能发挥领域知识、调研海外竞品、做方案梳理。
> 这份知识是**可复用、可检索、可持续增补**的资产，不是一次性对话产物。

---

## 一、知识来源（权威）

| 来源 | 覆盖 | 用途 |
|---|---|---|
| https://multitech.com/iot-wiki/ | 术语 / 协议 / 连接技术 / 合规 | 技术选型、概念澄清、PRD 技术合理性核对 |
| https://www.milesight.com/iot/ | IoT 线：传感/网关/控制器/路由/软件 | 竞品对标、产品形态参考、参数基线 |
| https://www.milesight.com/security/ | 安防线：IPC/NVR/OpenVision | CCTV 赛道竞品对标、参数基线 |

> 以上是「真源」。知识库是消化产物；遇到冲突或过时，以真源当前页面为准并回写更新。

---

## 二、目录结构

```
02_knowledge/
├── README.md                       # 本文件：索引 + 方法论
├── K_mapping.md                    # 需求要素 → 业务组件映射表（L2）
├── K_validation.md                 # 还原度校验清单（R1~R4）
├── K_patterns/                     # 页面范式：list / form / detail
│   ├── list.md
│   ├── form.md
│   └── detail.md
├── iot-fundamentals/               # IoT 底层知识（multitech wiki 消化）
│   ├── 00-overview.md              # 术语全景图 + 主题簇
│   ├── connectivity.md             # 连接技术：LoRaWAN/NB-IoT/LTE-M/蜂窝/eSIM/频谱
│   ├── protocols.md                # 协议：BACnet/Modbus/RS-485/MQTT/Zigbee/TCP-IP
│   ├── cloud-platforms.md          # 云平台：AWS IoT/Azure IoT/设备管理/设备影子
│   ├── hardware.md                 # 硬件：传感器/网关/控制器/RFID/UWB/智能电表
│   ├── security-compliance.md      # 安全与合规：AES/FCC/CE/ISED/PTCRB/设备认证
│   └── building-automation.md      # 楼宇自动化：BMS/BAS/COV/趋势日志/日程/FDD
├── milesight-products/             # Milesight 全产品线（竞品/参数基线）
│   ├── 00-overview.md              # 产品全景图（IoT 线 + 安防线指引）
│   ├── sensors.md / gateways.md / controllers.md / routers.md / software.md
│   ├── security-cctv.md            # 安防线：IPC/NVR/OpenVision（VIR-2026）
│   └── cv-ai.md                    # CV/AI：安防 AI 算法 + VS 人数感知 + OpenVision 边缘平台
└── competitor-research/            # 竞品调研框架 + 逐次调研结论
    └── README.md
```

---

## 三、PRD 把关方法论（核心工作流）

当产品提供 PRD 时，按四步走：

### 1. 需求澄清（先问对问题）
- 目标场景：室内/室外？固定/移动？供电（市电/电池/太阳能）？
- 数据形态：单点 vs 多点？采样频率？时延要求（实时/准实时/离线）？
- 规模：单点试点 vs 千级万级批量部署？
- 生命周期：几年质保？是否需要 OTA 远程升级？

### 2. 技术合理性核对（对照 iot-fundamentals）
- **连接选型是否匹配场景**：LoRaWAN（长距离/低功耗/低频次）vs NB-IoT（运营商覆盖/深覆盖）vs LTE-M（移动性/低时延）vs 蜂窝 4G/5G（高带宽）——错配是最常见 PRD 硬伤。
- **协议是否选对**：楼宇自控用 BACnet；设备互联用 Modbus/RS-485；云上报用 MQTT/HTTP。
- **参数是否站得住**：量程/精度/分辨率/电池寿命/传输距离/穿透——与行业基线比对，识别「拍脑袋」参数。
- **合规是否覆盖**：目标市场认证（FCC/CE/ISED/PTCRB）、频段合法性（licensed vs unlicensed）。

### 3. 竞品对标（对照 milesight-products + 调研）
- 同赛道有哪些海外产品？参数、定价、形态、差异化在哪？
- 我们的方案是否「重新发明轮子」，还是确有差异点？

### 4. 方案梳理（产出）
- 给出：选型建议 + 风险清单 + 取舍（trade-off）+ 落地步骤。

---

## 四、状态与增补

- 完成：两张全景图（00-overview）、本索引、底层知识六大主题、Milesight 六条产品线（IoT 五线 + 安防一线）+ CV/AI 能力线。
- 待补：competitor-research 的逐次调研结论；security-cctv.md 各系列逐型号硬参数（datasheet 深挖）；cv-ai.md 的 VS 逐型号参数/OpenVision 算力/行为分析精度；随 PRD 出现持续回写。

> 增补原则：只沉淀「可复用」的知识——定义、选型判据、关键参数、常见坑、竞品基线。一次性、对话态的信息不写入。
