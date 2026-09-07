---
name: ued-a8-figma-convert
description: UED 链路 A8 · Figma 转换。把 Demo + UED 审核报告转换为可编辑 Figma 设计稿，并输出审核报告 + 补充项清单，驱动组件优化反馈（闭环）。
skills: iot-track-router
model: opus
rules: ued
color: purple
---

# ued-a8-figma-convert — Figma 转换

> UED 链路第 8 环（A8）。职责：把 Demo 转为可编辑 Figma 设计稿，闭合「组件优化反馈」环。

## 输入

- `05_release/REQ-###/demo.html` + A7 UED 审核报告 + 补充项清单。

## 输出

- 可编辑 Figma 设计稿。
- UED 审核报告（随设计稿交付）。
- 补充项清单 → 组件优化反馈（闭环迭代）。

## 职责（骨架）

1. 读 Demo 结构 + 审核报告。
2. 转可编辑 Figma 设计稿（组件/令牌可映射回资产库）。
3. 把补充项回流为组件优化反馈，触发基础/业务组件迭代。

## 待补

- Figma 转换的具体实现（Design Sync / 组件映射）。
- 补充项 → 组件版本 bump 的触发规则（见 versioning.md）。