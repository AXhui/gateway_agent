---
name: B_Eg71AppSdk
version: 1.0.0
description: EG71 AppManager 状态卡（业务组件 · APP → Python 页签 · SDK 状态与升级）
---

# EG71 AppManager 状态卡 · B_Eg71AppSdk

> **逻辑名**：`B_Eg71AppSdk`
> **运行时 id**：`bc-eg71-app-sdk`
> **分类**：应用管理
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`92:19752`（Python 页签 · AppManager Status 卡 92:19750）

---

## 一、描述

Python 页签的 AppManager Status 卡：标题 + 状态标签（Uninstalled 等，`ctx.status`）+ SDK Version / SDK Path 两只读字段 + Available Storage 存储选择 + Upgrade Files 导入升级组。标题与内容间距 10px（比标准 20px 紧）。

不是总闸卡——无 Enable 开关，状态只读；AppManager 的运行管理（总闸+双表）改用 `B_Eg71AppManager`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段结构 |
| `S_Input` | `ms-input ms-input--disabled`（readonly） | SDK 版本/路径只读 |
| `S_Select` | `ms-select ms-select--sm` | Available Storage / Upgrade Files |
| `S_Button` | `ms-btn` / `ms-btn--primary` | Import / Upgrade |
| `S_Tag` | 状态标签（bc- 结构编排） | 标题旁安装状态 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.status` | `string` | `'Uninstalled'` | 状态标签文案（Uninstalled / Installed…） |
| `ctx.sdkVersion` / `ctx.sdkPath` | `string` | `''` | 只读展示，未装时为空 |
| `ctx.storages` | `string[]` | `['Local']` | 存储位置选项 |
| `ctx.storage` | `string` | 选项首项 | 当前存储位置 |
| `ctx.upgradeFiles` | `string[]` | `['']` | 升级文件选项（宿主注入） |
| `ctx.file` | `string` | 选项首项 | 当前选中文件；未选中 Upgrade 禁用 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body.bc-eg71-app-card--tight
  ├ .bc-eg71-app-head（ms-h4「AppManager Status」+ .bc-eg71-app-tag 状态标签）
  └ .bc-eg71-app-body（margin-top 10px）
      ├ .bc-eg71-app-fieldsrow：SDK Version / SDK Path（readonly）
      └ .bc-eg71-app-fieldsrow：Available Storage（select）
          + .bc-eg71-app-inline（Upgrade Files select + Import primary + Upgrade）
```

### bind 骨架
存储/文件 select change → `eg71-app-sdk-storage {value}` / `eg71-app-sdk-file {value}`；Import / Upgrade click → `eg71-app-sdk-import` / `eg71-app-sdk-upgrade`。

## 三、状态

| 状态 | 表现 |
|---|---|
| 未安装 | 标签 Uninstalled；版本/路径字段空值只读 |
| 已安装 | 宿主传入版本/路径与状态文案 |
| 未选文件 | Upgrade 禁用 |

### 业务规范（整理自 Figma 92:19752）
1. **状态标签贴标题**：安装状态以 12px 灰底标签缀在卡标题后（不是按钮、不是徽章色）——状态是被动事实，不用语义色强调。
2. **先装 SDK 再管应用**：本卡是 Python 应用的前置依赖入口——SDK Version / SDK Path 只读，升级走 Import → 选文件 → Upgrade 两步式（与 Node RED 库升级、固件升级同范式）。
3. **存储位置可选**：Available Storage 收口存储目的地（Local / SD…），影响 Import 落盘位置；缺省 Local。
4. **无开关无提交**：卡内所有动作即时生效上报，无 Apply/Save footer——升级动作本身就是提交。

## 四、场景

**何时用**：Python SDK（AppManager）安装状态查看与升级、存储位置选择。
**何时不用**：

| 场景 | 改用 |
|---|---|
| AppManager 总闸与应用表 | `B_Eg71AppManager` |
| 应用包/配置导入、调试脚本 | `B_Eg71AppCard` |
| Node RED | `B_Eg71AppNodered` |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-text-disable`、`--color-border-base`、`--spacing-4`、`--spacing-8`、`--spacing-12`、`--spacing-16`、`--spacing-20`、`--radius-4`。
（状态标签 12px/20px、标题内容间距 10px 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
const state = { status: 'Installed', sdkVersion: '1.2.0', sdkPath: '/usr/appmanager',
  storages: ['Local', 'SD Card'], storage: 'Local', upgradeFiles: ['sdk-1.3.0.tar'], file: '' };
const render = () => {
  app.innerHTML = BIZ['bc-eg71-app-sdk'].render(state);
  BIZ['bc-eg71-app-sdk'].bind(app);
};
app.addEventListener('eg71-app-sdk-storage', e => { state.storage = e.detail.value; });
app.addEventListener('eg71-app-sdk-file', e => { state.file = e.detail.value; render(); });
app.addEventListener('eg71-app-sdk-upgrade', () => log('upgrade ' + state.file));
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-app-sdk`
- 结构类：`library/business.css`（`bc-eg71-app-head` / `bc-eg71-app-tag` / `bc-eg71-app-card--tight` / `bc-eg71-app-body` / `bc-eg71-app-fieldsrow` / `bc-eg71-app-inline`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-app-verify.html`
