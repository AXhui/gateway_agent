---
name: B_Eg71Backup
version: 1.0.0
description: 配置备份/恢复/导入（业务组件 · 维护 → Backup 三卡结构）
---

# 配置备份 / 恢复 / 导入 · B_Eg71Backup

> **逻辑名**：`B_Eg71Backup`
> **运行时 id**：`bc-eg71-backup`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`132:4624`（备份，1220×526：双卡 + 全宽导入卡）

---

## 一、描述

维护 → Backup 页三卡结构：双卡并排（Backup Running-config：插图 + Backup 次按钮 / Restore Factory Defaults：插图 + Reset 次按钮）+ 全宽导入卡（Importing a Configuration File：Configuration Files 标签 + File 输入带清除 × + Import 主按钮 + Configuration 次按钮）。

不是固件升级——固件文件改用 `B_Eg71Upgrade`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` / `ms-card-body` | 三张白卡外壳 |
| `S_Form` | `ms-form-item` / `ms-form-label` | 导入卡字段结构 |
| `S_Input` | `ms-input` | 配置文件路径（placeholder File） |
| `S_Button` | `ms-btn` / `ms-btn--filled` | Backup / Reset / Import / Configuration / 清除 × |
| `S_Icon` | `ms-ico` | close 清除图标 |
| `S_Title` | `ms-h4` | 卡片标题（16px / 600） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.file` | `string` | `''` | 导入卡已选文件名；有值显示清除 × |

### render 骨架
```
.bc-eg71-maint-body
  ├ .bc-eg71-backup-grid（2 列）
  │   ├ section.ms-card > .ms-card-body.bc-eg71-backup-card（Backup Running-config + maintIllu('backupRun') + Backup）
  │   └ section.ms-card > .ms-card-body.bc-eg71-backup-card（Restore Factory Defaults + maintIllu('backupReset') + Reset）
  └ section.ms-card > .ms-card-body（Importing a Configuration File
      └ ms-form-item（Configuration Files 标签 + .bc-eg71-backup-file = input + × + Import + Configuration））
```

### bind 骨架
五事件冒泡：`eg71-backup-run`（备份）/ `eg71-backup-reset`（恢复出厂）/ `eg71-backup-import`（导入）/ `eg71-backup-config`（查看配置）/ `eg71-backup-clear`（清除文件名）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 双卡 Backup/Reset 次按钮可用；导入卡 Import 主按钮可用 |
| 已选文件 | 文件名回填 + 清除 × 出现 |
| 危险操作前 | Reset（恢复出厂）宿主可挂 `B_Eg71Modal` 二次确认（本组件不内嵌） |

## 四、场景

**何时用**：运行配置导出备份、恢复出厂、导入历史配置文件（维护 → Backup）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 固件升级 | `B_Eg71Upgrade` |
| 仅重启不恢复出厂 | `B_Eg71Restart` |
| 周期性备份计划 | `B_Eg71MissionPlan`（动作下拉扩展 Backup 类动作） |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-icon-secondary`、`--color-icon-auxiliary`、`--color-primary-normal`、`--color-primary-bg`、`--color-success-normal`、`--color-success-bg`、`--color-text-constant-normal`、`--color-border-base`、`--spacing-24`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`、`--radius-8`。
（480px 文件行最大宽、140px 插图为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。插图由 `registry-business.js` 顶部 `maintIllu(kind)` 生成（backupRun / backupReset 两形态）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-backup'].render({});
BIZ['bc-eg71-backup'].bind(app);
app.addEventListener('eg71-backup-run', e => downloadRunningConfig());
app.addEventListener('eg71-backup-import', e => importConfig());
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-backup`
- 结构类：`library/business.css`（`bc-eg71-backup-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
