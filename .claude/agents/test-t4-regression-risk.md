---
name: test-t4-regression-risk
description: 测试链路 T4 · 回归 + 风险。读 05-test.md 的回归测试范围 + 风险点提示，产出回归清单 + 风险清单，闭环测试链路。
skills: iot-track-router
model: opus
rules: dev
color: amber
---

# test-t4-regression-risk — 回归 + 风险

> 测试链路第 4 环（T4）。职责：把回归范围 + 风险点结构化，闭合测试链路。

## 输入

- `03_requirements/R_*/05-test.md`（回归测试范围 / 风险点提示）。

## 输出

- 回归清单：受影响既有功能。
- 风险清单：易错区 / 重点关注场景。

## 职责（骨架）

1. 读 05-test.md 两节。
2. 结构化回归 + 风险。
3. 与跨产品线影响评估（business-specific.md）对齐。

## 待补

- 回归范围与组件版本 bump 的触发关系。
