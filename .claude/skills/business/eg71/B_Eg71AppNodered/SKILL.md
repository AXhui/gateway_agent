---
name: B_Eg71AppNodered
version: 1.0.0
description: EG71 Node RED 应用卡（业务组件 · APP → Node red 启停双态）
---

# EG71 Node RED 应用卡 · B_Eg71AppNodered

> **逻辑名**：`B_Eg71AppNodered`
> **运行时 id**：`bc-eg71-app-nodered`
> **分类**：应用管理
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`41:18749`（启用态 1180×220）/ `41:19865`（禁用态 1180×68）

---

## 一、描述

APP → Node red 页单卡：「Enable」开关 + 头部 Reset / Export / Launch 按钮组（Launch 主色）+ 内容区——Node-RED Version / Node Library Version 两只读版本字段 + Upgrade Node Library 选择与 Import / Upgrade 行内升级组。开关关闭时内容整体收起，头部三按钮转禁用（卡高 220 → 68）。

不是 Python 应用管理——SDK 状态卡改用 `B_Eg71AppSdk`；不是通用导入卡——无标题的字段+按钮组改用 `B_Eg71AppCard`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | Enable 开关 |
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段结构 |
| `S_Input` | `ms-input ms-input--disabled`（readonly） | 版本只读展示 |
| `S_Select` | `ms-select ms-select--sm` | Upgrade Node Library 文件选择 |
| `S_Button` | `ms-btn`（32px）/ `ms-btn--primary` | Reset / Export / Launch / Import / Upgrade |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 启用开关；false 收起内容并禁用头部按钮 |
| `ctx.nodeRedVersion` | `string` | `'3.0.2'` | 只读版本展示 |
| `ctx.nodeLibraryVersion` | `string` | `'1.0.13'` | 只读版本展示 |
| `ctx.upgradeFiles` | `string[]` | `['']` | 可选升级文件（宿主从文件服务注入） |
| `ctx.file` | `string` | 选项首项 | 当前选中文件；未选中时 Upgrade 禁用 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-app-head（ms-h4「Enable」+ ms-switch--xs[data-app-nodered-toggle]
  │    + .bc-eg71-app-head-actions：Reset / Export（default）+ Launch（primary），enabled=false 时全 disabled）
  └ enabled 时 .bc-eg71-app-body
      ├ .bc-eg71-app-fieldsrow：Node-RED Version / Node Library Version（ms-input--disabled readonly）
      └ .bc-eg71-app-fieldsrow：.bc-eg71-app-inline（Upgrade Node Library select
           + Import（primary）+ Upgrade（未选文件 disabled））
```

### bind 骨架
开关 change → `eg71-app-nodered-toggle {enabled}`；头部/升级按钮 click → `eg71-app-nodered-reset|-export|-launch|-import|-upgrade`；文件 select change → `eg71-app-nodered-file {value}`。均只上报，状态由宿主持有。

## 三、状态

| 状态 | 表现 |
|---|---|
| 启用 | 卡高 220：头部 + 两行内容；Launch 主色可点 |
| 禁用 | 卡高 68：仅标题行；Reset/Export/Export 边框灰字、Launch 主色禁用（L2 `disabled` 语义） |
| 未选文件 | Upgrade 禁用；选中升级文件后可点 |

### 业务规范（整理自 Figma 41:18749 / 41:19865）
1. **开关收内容不收头部**：Enable 关闭时内容区整体不渲染（非遮罩），头部按钮转禁用保留占位——开关即「功能存在性」，禁用即「功能未开启」。
2. **版本只读**：Node-RED Version / Node Library Version 是固件/库的既装版本，用 `ms-input--disabled` readonly 呈现，不可编辑。
3. **Import 先于 Upgrade**：升级文件先 Import（上传入库，主色），再从库中选中后 Upgrade（应用，未选禁用）——两步式升级动线，与固件升级同范式。
4. **Launch 跳编辑器**：Launch 主色按钮打开 Node RED 编辑器（新窗口/跳转由宿主处理），Reset 恢复默认流，Export 导出流备份——三动作全部宿主侧执行，组件只上报。
5. **Launch 为唯一主色**：头部三按钮中仅 Launch 主色（正向入口），Reset/Export 均默认描边态。

## 四、场景

**何时用**：Node RED 可视化流的启停、版本查看、库升级与编辑器入口。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Python SDK 状态与升级 | `B_Eg71AppSdk` |
| 通用「标题+字段+按钮」导入卡 | `B_Eg71AppCard` |
| 固件/系统升级 | 维护域 Upgrade 组件 |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-border-base`、`--color-fill-base-normal`、`--color-text-disable`、`--spacing-8`、`--spacing-12`、`--spacing-16`、`--spacing-20`。
（开关 28×16、列距 32 = 2×16、按钮 32px 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。只读展示复用 L2 `ms-input--disabled` 变体，禁用按钮复用 L2 `[disabled]` 语义。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
const state = { enabled: true, upgradeFiles: [], file: '' };
const render = () => {
  app.innerHTML = BIZ['bc-eg71-app-nodered'].render(state);
  BIZ['bc-eg71-app-nodered'].bind(app);
};
app.addEventListener('eg71-app-nodered-toggle', e => { state.enabled = e.detail.enabled; render(); });
app.addEventListener('eg71-app-nodered-file', e => { state.file = e.detail.value; render(); });
app.addEventListener('eg71-app-nodered-import', () => log('宿主：上传库文件后回填 upgradeFiles'));
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-app-nodered`
- 结构类：`library/business.css`（`bc-eg71-app-head{,-actions}` / `bc-eg71-app-body` / `bc-eg71-app-fieldsrow` / `bc-eg71-app-inline`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-app-verify.html`
