# 04_pages · 页面 demo 输出层（L4）

> L3 需求转化后的中间契约落地处。命名：`P_<PageName>` 约定 + `REQ-###` 归集。

## 约定

- 每个 PRD 的 `page.json`（PageDocument schema）落 `04_pages/REQ-###/page.json`。
- 页面模块名用 `P_<PageName>` 逻辑 ID，模块内部引用 `M_*` / `B_*` / `S_*`（软映射见 `../_index.json`）。
- 同目录可附渲染前的装配计划说明，便于与交付物 `05_release/REQ-###/` 对照。

## 目录结构（示例）

```
04_pages/
└── REQ-###/
    ├── page.json        # 产品 + dev 的同一份契约
    └── plan.md          # 可选：装配计划（模块→组件映射）
```
