---
name: B_Eg71Restart
version: 1.0.0
description: 重启/恢复出厂（业务组件 · 维护 → Restart · 含「.重启说明」状态机）
---

# 重启 / 恢复出厂 · B_Eg71Restart

> **逻辑名**：`B_Eg71Restart`
> **运行时 id**：`bc-eg71-restart`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`138:26542`（重启页）；状态机规范源 `139:27593`「.重启说明」

---

## 一、描述

维护 → Restart 页：顶部 warm 警示条 + 三选一单选组（Reboot / Restore to factory settings / Restore to factory settings and reboot）+ Restart 主按钮；按「.重启说明」状态机在 idle / restarting / restoring / success 间切换。

不是升级——固件更新改用 `B_Eg71Upgrade`；不是危险二次确认弹窗——那是 `B_Eg71Modal` 的职责（本组件提交前可由宿主挂确认弹窗）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Alert` | `ms-alert--warn` | 顶部警示条（说明页 1272×40 形态） |
| `S_Form` | `ms-form` / `ms-form-item` | 单选组结构 |
| `S_Radio` | `ms-radio` / `ms-radio-dot` | 三模式互斥单选 |
| `S_Button` | `ms-btn` / `ms-btn--filled` | Restart 触发（72×32） |
| `S_Icon` | `ms-ico` | warn 图标 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.state` | `'idle'｜'restarting'｜'restoring'｜'success'` | `'idle'` | 状态机当前态 |
| `ctx.mode` | `'reboot'｜'factory'｜'factory-reboot'` | `'reboot'` | 单选初值 |
| `ctx.alertText` | `string` | 见 render | 警示条文案覆写 |
| `ctx.title` / `ctx.content` / `ctx.actions` | — | 按 state 兜底 | 结果卡文案覆写 |

### render 骨架
```
state === 'success' → B_Eg71MaintMessage 结果卡
state ∈ {restarting, restoring}（说明页中间态：140 插图 + 禁用按钮）
  .bc-eg71-maint-body > section.ms-card > .ms-card-body > .bc-eg71-restart
    └ .bc-eg71-restart-center（maintIllu('restart') + disabled Restart）
state === 'idle'
  同外壳 .bc-eg71-restart
    ├ .ms-alert--warn（警示条）
    └ .ms-form（3 × ms-radio 竖排 + ms-btn--filled[data-restart-submit]）
```

### bind 骨架
单选 change → `eg71-restart-mode {mode}`；`[data-restart-submit]` → `eg71-restart-submit {mode}`（取当前 checked 值）；结果态转发 `eg71-maint-action`。

## 三、状态（重启说明状态机 · 源 Figma 139:27593）

| 态 | 表现 | 迁移触发 |
|---|---|---|
| **idle**（Frame74 默认：警示条 + 三单选 + 按钮） | 三模式互斥单选，默认 Reboot；Restart 可用 | Restart → `restarting` / `restoring`（按 mode） |
| **restarting / restoring**（Frame74 中间态：插图 140 + 按钮 72×32 禁用） | 表单整体收起，仅插图 + 禁用 Restart | 设备回连 → `success` |
| **success**（Frame75/76 Message 卡 416×166：插图 + 标题 + 正文 + 按钮组） | 绿色对勾 + "Restart completed" + Back | Back → 回 `idle` |

### 业务规范（整理自「.重启说明」）
1. **前置警示**：页首常驻 warm 警示条（1272×40）——重启期间设备不可用，禁止断电/刷新页面；警示条不可关闭。
2. **三模式语义**：Reboot（仅重启）/ Restore to factory settings（仅恢复出厂）/ Restore to factory settings and reboot（恢复出厂并重启）。互斥单选，默认 Reboot。
3. **恢复出厂为危险操作**：`factory` / `factory-reboot` 模式提交前宿主应挂 `B_Eg71Modal`（action='delete' 形态）二次确认——本组件不内嵌确认，保持单向数据流。
4. **中间态全禁操作**：重启进行中仅插图 + 禁用按钮（说明页「中间状态」帧），防止重复提交。
5. **终态接管**：完成以整页 Message 卡反馈（Frame76 带插图形态），Back 显式返回。
6. **单选禁用态**（说明页单选样例）：radio `disabled` 态走 L2 `ms-radio` 令牌（`--color-text-disable` / `--color-border-base-disable`），不在业务层另写。

## 四、场景

**何时用**：网关重启 / 恢复出厂 / 恢复出厂并重启（维护 → Restart）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 周期性定时重启 | `B_Eg71MissionPlan`（任务计划） |
| 固件升级（含升级后恢复出厂复选） | `B_Eg71Upgrade` |
| 仅恢复网络出厂配置 | `B_Eg71Backup`（Reset 双卡形态） |

## 五、Token

`--color-bg-card`、`--color-warm-normal`、`--color-warm-bg`、`--color-text-secondary`、`--color-text-primary`、`--color-primary-normal`、`--color-primary-bg`、`--color-success-normal`、`--color-success-bg`、`--color-text-constant-normal`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`。
（560px 内容最大宽、140px 插图为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；同线引用 `B_Eg71MaintMessage`（结果态）；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let mode = 'reboot';
const render = s => {
  app.innerHTML = BIZ['bc-eg71-restart'].render({ state: s, mode });
  BIZ['bc-eg71-restart'].bind(app);
};
render('idle');
app.addEventListener('eg71-restart-mode', e => { mode = e.detail.mode; });
app.addEventListener('eg71-restart-submit', e => {
  if (e.detail.mode !== 'reboot' && !confirmDanger()) return;  // 宿主挂危险确认
  render(e.detail.mode === 'reboot' ? 'restarting' : 'restoring');
  setTimeout(() => render('success'), 4000);
});
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-restart`
- 结构类：`library/business.css`（`bc-eg71-restart-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
