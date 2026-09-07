---
name: B_Eg71Topnav
description: 顶部导航（业务组件）
---

# 顶部导航 · B_Eg71Topnav

> **逻辑名**：`B_Eg71Topnav`
> **现 id**：`bc-eg71-topnav`
> **分类**：概览
> **entityHint**：`gateway`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
EG71 网关后台顶部导航，含面包屑与右侧操作，两种变体：通用型（general）与仪表盘型（dashboard）。

### 何时用
- EG71 后台布局顶部 Header（配合 `MS_EG71_SHELL`）。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 侧边导航 | `B_Eg71Sidenav` |
| 面包屑基础组件 | `S_Breadcrumb` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Breadcrumb` | `ms-breadcrumb` | 面包屑 |
| `S_Button` | `ms-btn` | 右侧操作 |
| `S_Icon` | `ms-ico` | 图标（`U.ico`） |

### render 骨架（业务框架）
1. `.bc-eg71-topnav--general` 或 `--dashboard` 容器。
2. 左：`ms-breadcrumb`（面包屑，`bc-eg71-crumb-sep` 分隔符）。
3. 右：`ms-btn` 操作（刷新/设置）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-eg71-topnav', cn: '顶部导航', cat: '概览', desc: 'EG71 网关后台顶部导航，面包屑 + 操作…', atoms: ['breadcrumb','button','icon'], entityHint: 'gateway', tags: ['顶部导航','Header','面包屑','网关','EG71','后台','导航'], render(ctx){/* topnav--general/dashboard → breadcrumb + actions */} }
```

### 上下文 ctx 契约
- `ctx.variant`（general/dashboard）、`ctx.breadcrumb`（面包屑项）。

### 结构类（`library/business.css`）
`.bc-eg71-topnav--general`（155-181）、`.bc-eg71-topnav--dashboard`（186-204）、`.bc-eg71-crumb-sep .ms-ico`（160，chevron 12px 图标尺寸修正）。

### Figma 源
- topnav default：`2016:88258`

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-topnav`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
