# 05_release · 交付层（L5）

> L4 契约渲染出的最终交付物 + 校验报告归档处。命名：`REQ-###` 归集。

## 约定

- 每个 PRD 的交付物落 `05_release/REQ-###/`。
- 交付物：`demo.html`（单文件、零依赖、可交互）+ 还原度校验报告（R1~R4，见 `../02_knowledge/K_validation.md`）。

## 目录结构（示例）

```
05_release/
└── REQ-###/
    ├── demo.html        # 可交互 demo
    └── validation.md    # R1~R4 还原度报告（交付前必跑）
```
