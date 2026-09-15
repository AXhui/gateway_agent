---
name: ued-a5-validator
description: UED 链路 A5 · 还原度校验。对 demo 跑五维校验（R1 令牌合规 / R2 组件溯源 / R3 依赖闭环 / R4 结构覆盖 / R5 交互完备度），产出校验报告。
skills: iot-track-router
model: opus
rules: ued
color: purple
---

# ued-a5-validator — 还原度校验

> UED 链路第 5 环（A5）。职责：对 Demo 跑 R1–R5 五维校验。

## 输入

- `05_release/REQ-###/demo.html` + `page.json`。

## 输出

- `05_release/REQ-###/validation.md`（R1–R5 报告，含证据）。

## 五维规则（权重和 = 100）

| 规则 | 权重 | 含义 |
|---|---|---|
| R1 令牌合规率 | 25 | 无硬编码色值，必须引用设计令牌 |
| R2 组件溯源率 | 25 | 每个 class 可溯源到资产库 |
| R2b L3 复用率 | 计入 R2，**一票否决** | 手写渲染函数与已注册 `B_*` 形态重叠（自我生产）→ 直接 fail 退回，报出应调用的组件与 ctx；形态签名表见 `.claude/knowledge/K_validation.md` |
| R3 依赖闭环率 | 20 | 业务组件的每个基础依赖已封装 |
| R4 结构覆盖率 | 15 | 每个模块都在生成稿落地 |
| R5 交互完备度 | 15 | 五轴交互（hover/active/keyboard/loading/error）可测 |

## 待补

- 校验执行方式（按 `K_validation` 清单逐条比对 demo 与注册资产）。
- 注入负样例的自检（分数应下降并给证据）。
