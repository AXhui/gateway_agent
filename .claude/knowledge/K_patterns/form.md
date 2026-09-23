# K_pattern · 表单页范式

> 表单型需求的装配参考。适合「规则配置 / 参数设置 / 新增 / 编辑」类需求。
> §站点表单证据（2026-09，EG71 真实产品站 22 表单页 DOM 归纳，`output/eg71-site-distill/`）。

## 结构

```
T_Config / T_Detail
└── M_RuleConfig       规则/条件/参数配置表单区
```

EG71 线表单页装配序列（站点同构）：

```
bc-eg71-topnav(面包屑) → [bc-eg71-page-tabs 页签条(可选)]
→ bc-eg71-content(区块卡竖排) 或 bc-eg71-page-back(子页) + 表单
→ bc-eg71-form-footer(吸底 保存/取消)
```

## 关键模块与组件

| 层 | 模块 | 内部业务组件 |
|---|---|---|
| L4 | `M_RuleConfig` | `B_RuleForm`；EG71 线 = `bc-eg71-content` + `bc-eg71-form-item-*` ×7（input/select/input-button/date-picker/radio-group/button/**upload**） |
| L4 | `M_DetailDrawer` | `B_DetailDrawer`（>5 字段用抽屉） |

## 站点表单规则（EG71 22 表单页证据）

- **label 垂直上置**：`.ant-form-item-label{flex:0 0 100%}`——标签在控件上方（站点全量一致；库 form-item 族同构）。label→控件间距 4px。
- **表单项行距 24px**（`.ysd-form .ant-form-item{margin-bottom:24px}` = `--spacing-2xl`，与 spacing.md 红线「表单项 ≥16 推荐 24」一致）。
- **双列栅格**：`ant-col-12` ×2、列间 gutter 24（12+12 padding）；长控件/独立语义字段占整行。库：`bc-eg71-formgrid`。
- **区块卡**：卡头（标题 16px/500 + 尾部 Switch 或 Add/导入按钮组）+ 卡体表单（network_vpn/system_setting/platform 同构）。库：`bc-eg71-content`。
- **分段单选**（2-3 互斥选项，如 Configuration Method: Page/File、Protocol: UDP/TCP）：outline 分段钮组，站点类 `radio-group-item`。库：`bc-eg71-form-item-radio-group`（同构，勿重造）。
- **导入/导出位**：Import 主钮 + Export ghost（无文件置灰）+ accept 约束提示。库：`bc-eg71-form-item-upload`（v1.0.0，8 页证据）。
- **校验**：必填红标前置、错误文案红字下置、成功态无文案；说明文案（supportive text）辅助色下置。
- **子页表单**（新增/编辑/向导）用返回头 + 卡片表单 + 吸底 footer（Cancel 左、Save/Next 主钮右；未满足前置条件时主钮置灰）。

## 装配要点

- 表单字段 > 5 个时用 `B_DetailDrawer`（抽屉）承载，不打断主流程；少量字段可内联。
- 基础输入组件来自 L0：`S_Form` / `S_Input` / `S_InputNumber` / `S_Select` / `S_DatePicker` / `S_TimePicker` / `S_Switch` / `S_Checkbox` / `S_Radio` 等（见 `_index.json` `components` 数据录入类）。
- 底部操作栏（提交/取消）对应 `B_Eg71FormFooter`（ctx.buttons 自定义组：向导页 Cancel/Next）。

## 相关

- 上传形态范式见 [`upload.md`](upload.md)；映射见 [`K_mapping.md`](../K_mapping.md)；校验见 [`K_validation.md`](../K_validation.md)。
