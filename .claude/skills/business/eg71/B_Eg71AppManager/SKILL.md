---
name: B_Eg71AppManager
version: 1.0.0
description: EG71 AppManager 管理页（业务组件 · Enable 总闸 + App Management/App Status 双表 + 空态）
---

# EG71 AppManager 管理页 · B_Eg71AppManager

> **逻辑名**：`B_Eg71AppManager`
> **运行时 id**：`bc-eg71-app-manager`
> **分类**：应用管理
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`41:33359`（AppManager Configuration 页签，1220×834）

---

## 一、描述**

AppManager Configuration 页签单卡：「Enable」总闸 + 两张边框子卡——App Management 表（ID 142px / App Command / Logfile Size (MB) / Uninstall 行开关）与 App Status 表（App Name / App Version / SDK Version）；表空时显示 No data 空态（176px 居中）。总闸关闭时双表整体禁用（遮罩态，开关自身可用）。

不是 SDK 安装入口——装 SDK 改用 `B_Eg71AppSdk`；不是应用包导入——改用 `B_Eg71AppCard`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | Enable 总闸 + Uninstall 行开关 |
| `S_Table` | 结构表格（bc- 斑马纹应用表） | 双子卡表格 |
| `S_Title` | `ms-h4` | 卡/子卡标题 |
| `S_Icon` | `ms-ico`（data 32px） | 空态插图替代表达 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 总闸；false 时双表整体 `--disabled` |
| `ctx.manageRows` | `Array<{id, command, logSize, uninstall}>` | `[]`（空态） | App Management 行 |
| `ctx.statusRows` | `Array<{name, version, sdk}>` | `[]`（空态） | App Status 行 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-app-head（ms-h4「Enable」+ ms-switch--xs[data-app-manager-toggle]）
  └ .bc-eg71-event-body{--disabled}
      ├ .bc-eg71-app-subcard：.bc-eg71-app-subhead「App Management」
      │    + table.bc-eg71-app-table（ID 142 / App Command / Logfile Size (MB) 辅色单位 / Uninstall 行开关）
      │    或 .bc-eg71-app-empty（data 32px + No data）
      └ .bc-eg71-app-subcard：「App Status」+ 表（App Name / App Version / SDK Version）或空态
```

### bind 骨架
总闸 change → `eg71-app-manager-toggle {enabled}`；行开关 change → `eg71-app-uninstall {index, enabled}`。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 总闸开；双表空态（设计稿基线即空态） |
| 有数据 | 41px 斑马纹行；Uninstall 列行开关 |
| 总闸关闭 | 双表整体 opacity 0.45 + pointer-events none，开关自身可用 |
| 空表 | 176px 居中空态（图标 + No data，14px 辅色） |

### 业务规范（整理自 Figma 41:33359）
1. **一总闸管两表**：Enable 同时控制 App Management 与 App Status 两子卡（与 SNMP Agent / 通知总闸同范式：遮罩不禁开关）。
2. **子卡边框分区**：总卡内两张 `1px border` 子卡竖排——管理动作（可写）与运行状态（只读）物理分区。
3. **管理表 = 命令登记**：ID（142px 定宽）/ App Command / Logfile Size (MB)（单位辅色缀注）/ Uninstall 行开关——每行一个应用命令的登记与卸载标记。
4. **状态表 = 只读快照**：App Name / App Version / SDK Version 三列纯展示，无任何控件。
5. **空态也是设计稿**：设计基线即空表（未装应用）——空态用统一 176px 居中表达，不隐藏表格结构。
6. **单位辅色规范**：表头单位（(MB)）用辅色 Regular 缀在主文案后——EG71 表头计量单位统一写法。

## 四、场景

**何时用**：AppManager 已装后，对应用命令的登记/卸载管理与运行状态查看。
**何时不用**：

| 场景 | 改用 |
|---|---|
| SDK 安装与升级 | `B_Eg71AppSdk` |
| 应用包/配置导入 | `B_Eg71AppCard` |
| 带分页与工具栏的业务大表 | `B_Eg71EventList` / 设备列表 |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-text-auxiliary`、`--color-icon-auxiliary`、`--color-border-base`、`--font-sans`、`--spacing-8`、`--spacing-12`、`--spacing-20`、`--radius-4`。
（ID 列 142px、表行高 41px、空态高 176px、开关 28×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。表格外壳复用 `bc-eg71-event-body--disabled` 遮罩语义。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
const state = { enabled: true,
  manageRows: [{ id: 1, command: 'python demo.py', logSize: 8, uninstall: false }],
  statusRows: [{ name: 'demo', version: '1.0.0', sdk: '1.2.0' }] };
const render = () => {
  app.innerHTML = BIZ['bc-eg71-app-manager'].render(state);
  BIZ['bc-eg71-app-manager'].bind(app);
};
app.addEventListener('eg71-app-manager-toggle', e => { state.enabled = e.detail.enabled; render(); });
app.addEventListener('eg71-app-uninstall', e => {
  state.manageRows[e.detail.index].uninstall = e.detail.enabled;
});
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-app-manager`
- 结构类：`library/business.css`（`bc-eg71-app-head` / `bc-eg71-app-subcard{,-head}` / `bc-eg71-app-table` / `bc-eg71-app-col-id` / `bc-eg71-app-thunit` / `bc-eg71-app-empty` / 复用 `bc-eg71-event-body--disabled`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-app-verify.html`
