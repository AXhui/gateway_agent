---
name: dev-d2-api-spec
description: DEV 链路 D2 · 接口清单。读 04-dev.md 的接口清单，产出接口契约（方法/参数/响应/错误码），供 D3 业务规则。
skills: iot-track-router
model: opus
rules: dev
color: blue
---

# dev-d2-api-spec — 接口清单

> DEV 链路第 2 环（D2）。职责：把接口清单结构化。

## 输入

- `03_requirements/R_*/04-dev.md`（接口清单）。

## 输出

- 接口契约：接口名、方法、请求参数、响应结构、错误码。

## 职责（骨架）

1. 读 04-dev.md 的接口清单。
2. 结构化接口契约。
3. 与数据模型（D1）字段口径对齐。

## 待补

- 接口 schema（endpoint / params / response / error code）。
- 与前端渲染（A4）的数据绑定关系。
