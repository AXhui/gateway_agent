---
name: B_Eg71Upgrade
version: 1.0.0
description: 固件升级（业务组件 · 维护 → Upgrade · 含「.升级说明」状态机）
---

# 固件升级 · B_Eg71Upgrade

> **逻辑名**：`B_Eg71Upgrade`
> **运行时 id**：`bc-eg71-upgrade`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`135:25976`（升级页）；状态机规范源 `139:27173`「.升级说明」

---

## 一、描述

维护 → Upgrade 固件升级页：固件版本行（蓝链接）+ 140 插图 + Upgrade Files 文件行（File 输入 + 清除 × + Import 主按钮 + Upgrade 次按钮）+ Restore to factory settings 复选；按「.升级说明」状态机在 idle / importing / upgrading / success / failed 间切换。

不是配置文件导入——配置备份/导入改用 `B_Eg71Backup`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-label` | Firmware version / Upgrade Files 标签 |
| `S_Input` | `ms-input` | 固件文件路径（placeholder File） |
| `S_Checkbox` | `ms-checkbox` | Restore to factory settings |
| `S_Button` | `ms-btn` / `ms-btn--filled` | Import / Upgrade / 清除 × / 结果卡按钮 |
| `S_Link` | `ms-link` | 固件版本蓝链接 |
| `S_Card` | `ms-card` | 白卡外壳 |
| `S_Icon` | `ms-ico` | close 清除图标 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.state` | `'idle'｜'importing'｜'upgrading'｜'success'｜'failed'` | `'idle'` | 状态机当前态 |
| `ctx.version` | `string` | `'60.0.0.42-r5-a5'` | 当前固件版本 |
| `ctx.file` | `string` | `''` | 已选文件名；有值才显示清除钮且 Upgrade 可用 |
| `ctx.factory` | `boolean` | `false` | 恢复出厂复选初值 |
| `ctx.title` / `ctx.content` / `ctx.actions` | — | 按 state 兜底 | 结果卡文案覆写 |

### render 骨架
```
state ∈ {success, failed} → B_Eg71MaintMessage 结果卡（tone 映射 success/error）
否则：
.bc-eg71-maint-body > section.ms-card > .ms-card-body > .bc-eg71-upgrade
  ├ .bc-eg71-upgrade-version（ms-form-label + ms-link）
  └ .bc-eg71-upgrade-center
      ├ maintIllu('upgrade')（140×140）
      ├ .bc-eg71-upgrade-filelabel（Upgrade Files）
      ├ .bc-eg71-upgrade-file（input + × + Import + Upgrade）
      └ ms-checkbox（Restore to factory settings）
```

### bind 骨架
四事件冒泡：`eg71-upgrade-import` / `eg71-upgrade-start` / `eg71-upgrade-clear` / `eg71-upgrade-factory {factory}`；结果态转发 `eg71-maint-action`。

## 三、状态（升级说明状态机 · 源 Figma 139:27173）

| 态 | 表现 | 迁移触发 |
|---|---|---|
| **idle**（Frame74 默认） | 版本链接可点；Import 可用；Upgrade 需已选文件；复选可勾 | Import 选文件 → 回填 `file`；Upgrade → `upgrading` |
| **importing / upgrading**（Frame74 中间态：插图 + 表单行 + 双按钮 + 复选全禁用） | 文件行/复选/双按钮整体 `disabled`，仅插图与文案可见 | 宿主上报进度完成 → `success` / `failed` |
| **success**（Frame75 Message 卡：140 插图 + title + content + 按钮组） | 绿色对勾 + "Upgrade completed" + Back | Back → 回 `idle` |
| **failed** | 红色叉 + 失败文案 + Back | Back → 回 `idle` |

### 业务规范（整理自「.升级说明」）
1. **按钮时序**：Import（主按钮）选择本地固件包 → 文件名回填输入框并出现清除 × → Upgrade（次按钮）方可点击；清除 × 一键回到未选文件态。
2. **版本只读展示**：Firmware version 以蓝链接呈现（可跳版本历史），不可编辑。
3. **中间态不可操作**：importing / upgrading 期间文件行、双按钮、复选全部禁用——升级中断电/刷新会导致变砖，故无任何可触发交互。
4. **恢复出厂联动**：勾选 Restore to factory settings 后，升级完成将连带恢复出厂配置（危险项，随升级一体提交，不单独触发）。
5. **终态接管**：成功/失败以整页 Message 卡反馈（非 toast），用户必须显式 Back 返回。

## 四、场景

**何时用**：EG71 固件升级（维护 → Upgrade）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 配置文件导入/备份 | `B_Eg71Backup` |
| 批量设备升级任务 | `B_UpgradeModal`（`bc-upgrade-modal`） |
| 重启/恢复出厂 | `B_Eg71Restart` |

## 五、Token

`--color-bg-card`、`--color-text-secondary`、`--color-text-primary`、`--color-text-link-normal`、`--color-text-link-hover`、`--color-icon-primary-normal`、`--color-icon-auxiliary`、`--color-primary-normal`、`--color-primary-bg`、`--color-success-normal`、`--color-remind-normal`、`--color-text-constant-normal`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`。
（480px 文件行最大宽、140px 插图为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；同线引用 `B_Eg71MaintMessage`（结果态）；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
const render = s => {
  app.innerHTML = BIZ['bc-eg71-upgrade'].render({ state: s, file: s === 'idle' ? '' : 'EG71_V60.0.0.42.bin' });
  BIZ['bc-eg71-upgrade'].bind(app);
};
render('idle');
app.addEventListener('eg71-upgrade-import', () => render('idle'));   // 选文件后回填 ctx.file
app.addEventListener('eg71-upgrade-start', () => render('upgrading'));
setTimeout(() => render('success'), 3000);
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-upgrade`
- 结构类：`library/business.css`（`bc-eg71-upgrade-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
