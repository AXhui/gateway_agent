# K_pattern · 表单页范式

> 表单型需求的装配参考。适合「规则配置 / 参数设置 / 新增 / 编辑」类需求。

## 结构

```
T_Config / T_Detail
└── M_RuleConfig       规则/条件/参数配置表单区
```

## 关键模块与组件

| 层 | 模块 | 内部业务组件 |
|---|---|---|
| L4 | `M_RuleConfig` | `B_RuleForm` |
| L4 | `M_DetailDrawer` | `B_DetailDrawer`（>5 字段用抽屉） |

## 装配要点

- 表单字段 > 5 个时用 `B_DetailDrawer`（抽屉）承载，不打断主流程；少量字段可内联。
- 基础输入组件来自 L0：`S_Form` / `S_Input` / `S_InputNumber` / `S_Select` / `S_DatePicker` / `S_TimePicker` / `S_Switch` / `S_Checkbox` / `S_Radio` 等（见 `_index.json` `components` 数据录入类）。
- 底部操作栏（提交/取消）对应 `B_Eg71FormFooter`。

## 相关

- 映射见 [`K_mapping.md`](../K_mapping.md)；校验见 [`K_validation.md`](../K_validation.md)。
