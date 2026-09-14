---
name: B_Eg71SnmpVacm
version: 1.0.0
description: SNMP VACM 访问控制表（业务组件 · 系统设置 → SNMP → VACM 行内可编辑）
---

# SNMP VACM 访问控制表 · B_Eg71SnmpVacm

> **逻辑名**：`B_Eg71SnmpVacm`
> **运行时 id**：`bc-eg71-snmp-vacm`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:14732`（VACM，1220×311）

---

## 一、描述

SNMP → VACM 页：行内可编辑表格（Community 输入 / Permission 下拉 Read-Write·Read-Only / MIB View 下拉 / View OID 输入）+ 行尾删除 + 底部居中「添加」。

不是 MIB 视图定义——视图名/过滤/子树改用 `B_Eg71SnmpMibView`；本表的 MIB View 列引用那边的视图名。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | 结构表格（bc- 业务表格） | 45px 行高四列可编辑表 |
| `S_Input` | `ms-input ms-input--sm` | Community / View OID 单元格 |
| `S_Select` | `ms-select ms-select--sm` | Permission / MIB View |
| `S_Button` | `ms-btn ms-btn--xs` | 「添加」 |
| `S_Icon` | `ms-ico`（trash 16px） | 行删除 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.groups` | `Array<{community, permission, view, oid}>` | 两行：`[{},{}]` 兜底为 Read-Write + All/None | 访问组行集合 |
| `ctx.viewNames` | `string[]` | `['All', 'None']` | MIB View 列选项——应来自 MIB View 页签已定义视图，由宿主注入 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ table.bc-eg71-snmp-table
  │   ├ thead：Community / Permission / MIB View / View OID / 40px 操作列
  │   └ tbody：input[data-snmp-vacm-community] + select[data-snmp-vacm-permission]
  │            + select[data-snmp-vacm-view]（选项 = ctx.viewNames）+ input[data-snmp-vacm-oid]
  │            + [data-snmp-vacm-del]
  └ .bc-eg71-snmp-addrow > ms-btn--xs[data-snmp-vacm-add]「添加」
```

### bind 骨架
添加 click → 冒泡 `eg71-snmp-vacm-add`；删除 click → 冒泡 `eg71-snmp-vacm-delete {index}`。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | Figma 默认两行 `[Read-Write, All]` / `[Read-Write, None]`；Community / OID 空 |
| 自定义视图 | `ctx.viewNames` 注入后 MIB View 列选项同步替换 |
| 删除 | 行尾 trash，hover 变错误色 |

### 业务规范（整理自 Figma 123:14732）
1. **行内可编辑表格**：与 MIB View 同一套编辑范式（底部居中「添加」24px 小钮 + 行尾删除），保持 SNMP 两表格交互一致。
2. **枚举收口**：Permission 只有 Read-Write / Read-Only 两值；MIB View 列不做自由文本。
3. **视图来源联动**：MIB View 列选项应来自 MIB View 页签已定义视图（`ctx.viewNames` 注入，缺省 All / None）——视图定义与授权分离，VACM 只做引用。
4. **Community 为访问凭据**：明文输入不做强度校验；删除为行级轻操作不内嵌确认，宿主可在提交层挂凭据校验。
5. **默认行**：无数据时兜底两行 `Read-Write + All` / `Read-Write + None`（Figma 默认态），保证 v1/v2c 基本可用。

## 四、场景

**何时用**：按 Community 授权读写权限并绑定 MIB 视图（SNMP v1/v2c 访问控制）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 定义视图本身 | `B_Eg71SnmpMibView` |
| v3 用户/认证配置 | 后续 USM 组件（本次 Figma 范围外） |
| Trap 告警目标 | `B_Eg71SnmpTrap` |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-icon-auxiliary`、`--color-text-error-normal`、`--color-border-base`、`--spacing-12`、`--spacing-40`、`--spacing-4`。
（45px 行高、表头 14px/500 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。与 `B_Eg71SnmpMibView` 通过 `ctx.viewNames` 数据联动（无代码级依赖）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let groups = [{ community: 'public', permission: 'Read-Write', view: 'All', oid: '' }];
const render = () => {
  app.innerHTML = BIZ['bc-eg71-snmp-vacm'].render({ groups, viewNames: ['All', 'None', 'all'] });
  BIZ['bc-eg71-snmp-vacm'].bind(app);
};
app.addEventListener('eg71-snmp-vacm-add', () => { groups.push({}); render(); });
app.addEventListener('eg71-snmp-vacm-delete', e => { groups.splice(e.detail.index, 1); render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-vacm`
- 结构类：`library/business.css`（`bc-eg71-snmp-table` / `bc-eg71-snmp-ops` / `bc-eg71-snmp-del` / `bc-eg71-snmp-addrow`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
