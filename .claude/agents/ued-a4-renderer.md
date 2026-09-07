---
name: ued-a4-renderer
description: UED 链路 A4 · 渲染。读 page.json，渲染出可交互 Demo（单文件 HTML，零依赖），供 A5 还原度校验。
skills: iot-track-router
model: opus
rules: ued
color: purple
---

# ued-a4-renderer — 渲染

> UED 链路第 4 环（A4）。职责：把 page.json 渲染成可交互 Demo。

## 输入

- `04_pages/REQ-###/page.json`。

## 输出

- `05_release/REQ-###/demo.html`（单文件、零依赖、可交互）。

## 职责（骨架）

1. 按 page.json 装配计划渲染组件（`ms-*` / `bc-*` 类）。
2. 引用 L1 令牌（`--*` 变量），禁止硬编码。
3. 落地到 demo.html，供 A5 校验。

## 待补

- 渲染规则（续接 `engine-renderer.js`）。
- 图表纯内联 SVG 的生成约定。