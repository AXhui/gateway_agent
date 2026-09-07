---
name: test-t2-acceptance
description: 测试链路 T2 · 验收标准 + 兼容性。读 05-test.md 的验收标准/数据校验点/兼容性要求，产出可判定验收清单，供 A5 校验。
skills: iot-track-router
model: opus
rules: dev
color: amber
---

# test-t2-acceptance — 验收标准 + 兼容性

> 测试链路第 2 环（T2）。职责：把验收标准 / 数据校验点 / 兼容性要求结构化。

## 输入

- `03_requirements/R_*/05-test.md`（验收标准 / 数据校验点 / 兼容性要求）。

## 输出

- 验收清单：功能 → 通过条件（可判定）。
- 数据校验点：输入 → 期望输出。
- 兼容性矩阵：浏览器 / 分辨率 / 设备类型。

## 职责（骨架）

1. 读 05-test.md 三节。
2. 结构化验收/校验/兼容性。
3. 与 UED 状态枚举、DEV 数据模型对齐口径。

## 待补

- 兼容性矩阵与还原度校验的衔接。
