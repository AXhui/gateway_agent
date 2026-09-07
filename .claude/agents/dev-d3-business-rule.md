---
name: dev-d3-business-rule
description: DEV 链路 D3 · 业务规则。读 04-dev.md 的业务规则 + 状态流转，产出可判定规则清单，供 D4 校验规则。
skills: iot-track-router
model: opus
rules: dev
color: blue
---

# dev-d3-business-rule — 业务规则

> DEV 链路第 3 环（D3）。职责：把业务规则 + 状态流转结构化。

## 输入

- `03_requirements/R_*/04-dev.md`（业务规则）。

## 输出

- 业务规则清单：条件 → 结果（计算/流转），含状态机。

## 职责（骨架）

1. 读 04-dev.md 的业务规则。
2. 结构化判定条件 / 状态流转。
3. 与 UED 状态枚举（03-ued.md）对齐展示口径。

## 待补

- 状态机定义格式。
- 与测试链路（T1）用例的映射。
