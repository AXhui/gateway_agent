---
name: B_Eg71SnmpMib
version: 1.0.0
description: SNMP MIB 文件下载（业务组件 · 系统设置 → SNMP → MIB）
---

# SNMP MIB 文件下载 · B_Eg71SnmpMib

> **逻辑名**：`B_Eg71SnmpMib`
> **运行时 id**：`bc-eg71-snmp-mib`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:2856`（MIB，1220×186）

---

## 一、描述

SNMP → MIB 页：MIB File 下拉（设备支持的 MIB 文件清单）+ Download 主按钮。只读下载，无上传/编辑。

不是 MIB 视图定义——OID 子树裁剪改用 `B_Eg71SnmpMibView`；这里只是把设备内置的 MIB 定义文件取回本地给 NMS 导入。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | MIB File 字段结构 |
| `S_Select` | `ms-select` | MIB 文件下拉 |
| `S_Button` | `ms-btn ms-btn--filled`（32px） | Download 主按钮 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.files` | `string[]` | `['BRIDGE-MIB.txt']` | 可下载 MIB 文件清单（设备固件决定） |
| `ctx.file` | `string` | `files[0]` | 下拉初值（不在清单内时回退首项） |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  └ ms-form > ms-form-item
      ├ 标签「MIB File」
      └ .bc-eg71-snmp-mibrow = ms-select[data-snmp-mib-file] + ms-btn--filled[data-snmp-mib-download]「Download」
```

### bind 骨架
Download click → 冒泡 `eg71-snmp-mib-download {file}`（file 取下拉当前值）；宿主执行真实下载。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 下拉选中首文件；Download 主按钮可用 |
| 下载中 | 由宿主自行反馈（loading/toast），组件无内嵌状态机 |

### 业务规范（整理自 Figma 123:2856）
1. **只读下载**：MIB 页签仅 select 选文件 + Download 主按钮，无上传/删除/编辑——文件清单由设备固件决定。
2. **文案勘误**：Figma 按钮文案「Downliad」为设计稿笔误，实现取「Download」。
3. **单文件单动作**：一次下载一个文件；批量打包如后续需要由宿主层扩展，本组件不承载。

## 四、场景

**何时用**：把网关的 MIB 定义文件下载到本地，供 NMS（如 Milesight Tool / 其他网管）导入解析 OID。
**何时不用**：

| 场景 | 改用 |
|---|---|
| OID 视图裁剪 | `B_Eg71SnmpMibView` |
| 固件/配置文件下载 | `B_Eg71Backup` / `B_Eg71Upgrade` |
| 日志文件下载 | 维护 → 日志类组件 |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-12`、`--radius-4`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-snmp-mib'].render({ files: ['BRIDGE-MIB.txt', 'HOST-RESOURCES-MIB.txt'] });
BIZ['bc-eg71-snmp-mib'].bind(app);
app.addEventListener('eg71-snmp-mib-download', e => saveBlob(fetchMib(e.detail.file)));
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-mib`
- 结构类：`library/business.css`（`bc-eg71-snmp-mibrow`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
