---
name: B_Eg71MaintMessage
version: 1.0.0
description: 维护结果反馈 Message 卡（业务组件 · 升级/重启说明页 Frame75/76 形态）
---

# 维护结果反馈卡 · B_Eg71MaintMessage

> **逻辑名**：`B_Eg71MaintMessage`
> **运行时 id**：`bc-eg71-maint-message`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`139:27173`「.升级说明」Frame75/Message（416px 卡）、`139:27593`「.重启说明」Frame75/Frame76

---

## 一、描述

维护域共用的结果反馈 Message 卡：416px 定宽白卡 = 居中 140 插图（success / error / info 三态换色）+ 标题 + 正文 + 右下按钮组。被 `B_Eg71Upgrade`、`B_Eg71Restart` 在结果态引用。

不是全局轻提示——非阻塞 toast 改用 `S_Message` / `S_Notification`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 白卡外壳（边框/圆角） |
| `S_Button` | `ms-btn` / `ms-btn--filled` | 右下按钮组 |
| `S_Icon` | `ms-ico` | 按钮内图标（预留） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tone` | `'success'｜'error'｜'info'` | `'info'` | 插图与配色基调 |
| `ctx.title` | `string` | `''` | 卡标题（16px / 500） |
| `ctx.content` | `string` | `''` | 正文（14px / secondary） |
| `ctx.actions` | `{label,primary}[]` | `[{label:'Back'}]` | 按钮组 |

### render 骨架
```
section.ms-card.bc-eg71-maint-msg（416px 定宽居中）
  ├ 插图 maintIllu(tone)（140×140）
  ├ .bc-eg71-maint-msg-title
  ├ .bc-eg71-maint-msg-content
  └ .bc-eg71-maint-msg-actions（右对齐按钮组）
```

### bind 骨架
`[data-maint-action]` 点击 → `eg71-maint-action {action}`（action = 按钮文案）。

## 三、状态

| 状态 | 表现 |
|---|---|
| success | 绿色圆形对勾插图 |
| error | 红色圆形叉插图 |
| info | 蓝色圆形 i 插图 |

## 四、场景

**何时用**：升级/重启/备份等长耗时维护操作的终态反馈（整页接管，Figma 说明页定形态）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 非阻塞轻提示 | `S_Message`（`ms-message`） |
| 危险操作二次确认 | `B_Eg71Modal` / `B_ComDangerAction` |
| 表单校验错误 | `bc-eg71-form-item-*` 的 `--error` 态 |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-success-normal`、`--color-success-bg`、`--color-error-normal`、`--color-error-bg`、`--color-primary-normal`、`--color-primary-bg`、`--color-text-constant-normal`、`--spacing-24`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`。
（416px 定宽为 Figma Frame75 指定；140px 插图为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。插图由 `registry-business.js` 顶部 `maintIllu(kind)` 生成（同文件维护域共享）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-maint-message'].render({
  tone: 'success', title: 'Upgrade completed',
  content: 'The firmware has been upgraded.',
  actions: [{ label: 'Back' }]
});
BIZ['bc-eg71-maint-message'].bind(app);
app.addEventListener('eg71-maint-action', e => goBack());
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-maint-message`
- 结构类：`library/business.css`（`bc-eg71-maint-msg-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
