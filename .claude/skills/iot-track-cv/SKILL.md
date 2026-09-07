---
name: iot-track-cv
description: 物联网「CV 计算机视觉 / 边缘 AI」赛道判断与思考方向。当 iot-track-router 判定 PRD 主/副赛道命中 CV（AI/算法/识别/检测/人脸/车牌/OCR/行为分析/边缘AI/模型/推理/深度学习），或用户直接提 AI 视觉需求时，进入本赛道：按「算法 → 数据 → 算力 → 部署」四要素审 PRD 合理性，核对识别精度/召回率/算力/时延/隐私等关键点，并对标边缘 AI 方案（Nvidia Jetson/Rockchip/Ambarella/OpenVINO）与 Milesight CV 能力线（安防 AI 摄像机/VS 人数感知/OpenVision）。知识文件：.claude/knowledge/milesight-products/cv-ai.md。
---

# CV 计算机视觉 / 边缘 AI 赛道 — 判断与思考方向

> 知识真源：`.claude/knowledge/milesight-products/cv-ai.md`（Milesight CV 能力线：安防 AI 算法/VS 人数感知传感器/OpenVision 边缘 AI 平台 + 精度基线）。审 PRD 前先读这份，对标锚点见其「五、对标要点」。
> 竞品对标再叠加 `.claude/knowledge/competitor-research/README.md` 的 7 维对标框架；安防摄像机硬件成像参数见 `security-cctv.md`。

## 一句话定位

CV = 用模型把「图像/视频流」变成「结构化结果」（框/属性/事件）。审 PRD 的关键是**四要素是否闭环：算法能不能做到、数据够不够训/标、算力放端还是云、部署到哪**。

## 判断与思考方向（审 PRD 四要素）

### 1. 算法（任务 + 精度）
- 任务类型：检测/分类/分割/识别（人脸/车牌/OCR）/行为分析/计数/姿态。
- 精度指标是否给全：准确率 vs **召回率**（安防漏报代价高，重点看召回）、mAP、FPS。
- 是否「拍脑袋给 99%」：精度必须有「在什么数据集/什么光照/什么角度」前提，裸精度是硬伤。
- 误报率与告警疲劳：告警准确性决定用户是否关掉告警。

### 2. 数据（训练与标注）
- 数据从哪来？有没有真实场景样本，还是靠公开数据集凑。
- 标注成本：检测/分割/关键点标注价差巨大，PRD 是否算清。
- 长尾/对抗场景：夜间、逆光、遮挡、雨雾、密集人群——模型是否覆盖。

### 3. 算力（端 vs 边 vs 云）
- 部署位置：端侧(摄像头内置)/边缘(盒子/网关)/云。决定时延与成本。
- 芯片选型：Nvidia Jetson / Rockchip / Ambarella / 海思 / Intel OpenVINO / TPU。
- 单路算力需求：模型 FLOPs × 分辨率 × 帧率 → 选什么芯片、一路/多路、功耗多少。
- 模型优化：INT8 量化/剪枝/蒸馏，能否落到目标芯片实时跑。

### 4. 部署与合规（隐私是 CV 特有红线）
- 时延要求：实时（端/边）vs 准实时（云）。
- 隐私合规：人脸识别涉 GDPR/个保法，需知情同意 + 数据最小化 + 存储期限。海外市场这是硬门槛，PRD 不提=重大遗漏。
- 模型更新/OTA、多模型热切换、回滚。

## 需求澄清必问
1. 识别的「对象 + 动作」到底是什么？（对象越具体越可落地）
2. 精度目标 + 在什么条件下达成？
3. 部署在哪（端/边/云）？时延预算？
4. 数据与标注从哪来？隐私合规怎么过？

## 竞品对标方向（触发时调研）
- 边缘算力：Nvidia Jetson 家族 / Rockchip / Ambarella / 海思 / Intel。
- 平台：AWS Panorama / Azure Percept / Google Coral。
- 同源参考：Milesight CV 能力线（安防 AI 摄像机内置算法 + VS 人数感知传感器 + OpenVision 边缘平台，参数见 .claude/knowledge/milesight-products/cv-ai.md）。

## 产出物
任务+精度定义核对 + 算力/芯片选型测算 + 数据与隐私合规清单 + 竞品基线 + 风险（精度拍脑袋、隐私漏项、算力不足）。
