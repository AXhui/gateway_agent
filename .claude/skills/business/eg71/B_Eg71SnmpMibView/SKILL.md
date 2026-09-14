---
name: B_Eg71SnmpMibView
version: 1.0.0
description: SNMP MIB View 视图表（业务组件 · 系统设置 → SNMP → MIB View 行内可编辑）
---

# SNMP MIB View 视图表 · B_Eg71SnmpMibView

> **逻辑名**：`B_Eg71SnmpMibView`
> **运行时 id**：`bc-eg71-snmp-mibview`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:8159`（MIB View，1220×311）

---

## 一、描述

SNMP → MIB View 页：行内可编辑表格（View Name 输入 / View Filter 下拉 Included·Excluded / View OID 输入）+ 行尾删除图标 + 底部居中「添加」小钮。

不是访问控制——Community/Permission 组合改用 `B_Eg71SnmpVacm`；本表定义的视图名会被 VACM 的 MIB View 列引用。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | 结构表格（bc- 业务表格） | 45px 行高可编辑表 |
| `S_Input` | `ms-input ms-input--sm`（28px） | View Name / View OID 单元格 |
| `S_Select` | `ms-select ms-select--sm` | View Filter（Included / Excluded） |
| `S_Button` | `ms-btn ms-btn--xs`（24px） | 「添加」小钮 |
| `S_Icon` | `ms-ico`（trash 16px） | 行删除 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.views` | `Array<{name, filter, oid}>` | 两行全空 | 视图行集合；`filter` 缺省 `'Included'` |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ table.bc-eg71-snmp-table
  │   ├ thead：View Name / View Filter / View OID / 40px 操作列
  │   └ tbody：每行 input[data-snmp-view-name] + select[data-snmp-view-filter] + input[data-snmp-view-oid] + [data-snmp-view-del]
  └ .bc-eg71-snmp-addrow > ms-btn--xs[data-snmp-view-add]「添加」
```

### bind 骨架
添加 click → 冒泡 `eg71-snmp-view-add`（宿主向 `ctx.views` 追加空行后重渲染）；删除 click → 冒泡 `eg71-snmp-view-delete {index}`。单元格值变更不逐字段上报，由宿主提交时整体读取。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 45px 行高，表头灰底主文字色，控件内嵌单元格（宽度撑满列） |
| 空表 | 仍保留表头 + 添加钮（空行由宿主控制） |
| 删除 | 行尾 trash 图标，hover 变错误色 |

### 业务规范（整理自 Figma 123:8159）
1. **行内可编辑表格**：MIB View 以行内控件表格维护，无独立编辑页；底部居中「添加」（24px 小钮）追加空行，行尾删除图标移除该行。
2. **枚举收口**：View Filter 只有 Included / Excluded 两值（OID 子树纳入或排除），不做自由文本。
3. **删除为行级轻操作**：不内嵌确认弹窗；视图被 VACM 引用时的联动校验由宿主在提交层承担。
4. **列宽语义**：操作列固定 40px 容纳 16px 图标；其余列均分。

## 四、场景

**何时用**：定义/裁剪 SNMP 可访问的 OID 子树视图（供 VACM 绑定）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Community 访问授权 | `B_Eg71SnmpVacm` |
| 只读查看型数据表 | L2 `S_Table`（`ms-table`） |
| Trap 目标配置 | `B_Eg71SnmpTrap` |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-icon-auxiliary`、`--color-text-error-normal`、`--color-border-base`、`--spacing-12`、`--spacing-40`、`--spacing-4`。
（45px 行高、表头 14px/500 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。表格视觉走 `bc-eg71-snmp-table` 结构类（`ms-table` 为 dashboard 专用形态，不适用行内编辑场景）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let views = [{ name: 'all', filter: 'Included', oid: '.1' }];
const render = () => {
  app.innerHTML = BIZ['bc-eg71-snmp-mibview'].render({ views });
  BIZ['bc-eg71-snmp-mibview'].bind(app);
};
app.addEventListener('eg71-snmp-view-add', () => { views.push({}); render(); });
app.addEventListener('eg71-snmp-view-delete', e => { views.splice(e.detail.index, 1); render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-mibview`
- 结构类：`library/business.css`（`bc-eg71-snmp-table` / `bc-eg71-snmp-ops` / `bc-eg71-snmp-del` / `bc-eg71-snmp-addrow`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
