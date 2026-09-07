---
name: B_Eg71Sidenav
description: 网关侧边导航（业务组件）
---

# 网关侧边导航 · B_Eg71Sidenav

> **逻辑名**：`B_Eg71Sidenav`
> **现 id**：`bc-eg71-sidenav`
> **分类**：管理员
> **entityHint**：`gateway`
> **版本**：v1.1.0（已固化）
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（导航高亮 + 路由同步 + 展开/收起）

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
EG71 网关后台的侧边导航，含 Logo、一级菜单、二级下拉与底部用户区，路由由 `ctx.route` 单一来源驱动；Logo 右侧提供「展开/收起」按钮，折叠为 80px icon-only 态。

### 何时用
- EG71 网关后台布局的左侧导航骨架（配合 `MS_EG71_SHELL`）。
- 需要侧边栏折叠收起、腾出内容区宽度的后台场景。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 顶部导航 | `B_Eg71Topnav` |
| 通用导航菜单 | `S_NavMenu`（基础组件） |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_NavMenu` | `ms-nav` | 一级菜单 |
| `S_DropdownMenu` | `ms-dropdown` | 二级下拉 |
| `S_Logo` | `ms-logo` | 品牌 Logo |
| `S_Avatar` | `ms-avatar` | 用户头像 |
| `S_Button` | `ms-btn` | 底部用户区 |
| `S_Icon` | `ms-ico` | 图标（`U.ico`） |

### render 骨架（业务框架）
1. `.bc-eg71-sidenav` 容器。
2. Logo 区 + 展开/收起按钮（`.bc-eg71-collapse`，复用 `S_Icon` 的 `arrowLeft`/`arrowRight`，展开态显示 `arrowLeft`、收起态显示 `arrowRight`）+ 导航菜单（一级项 + 二级 `ms-dropdown`）。
3. 底部用户区（头像 + 用户名 + 退出）。

### bind 骨架
1. 监听菜单项点击 → 更新 `ctx.route`（单一来源）。
2. `syncSidebar` 高亮当前路由对应的菜单项（`ms-nav-item--active`）。
3. 监听 `.bc-eg71-collapse` 点击 → 在容器上切换 `is-collapsed`，`innerHTML` 在 `arrowLeft` ↔ `arrowRight` 间互换，同步 `aria-expanded` / `aria-label`。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-eg71-sidenav', cn: '网关侧边导航', cat: '管理员', desc: 'EG71 网关后台侧边导航，Logo + 菜单 + 用户区…', atoms: ['nav-menu','dropdown-menu','logo','avatar','button','icon'], entityHint: 'gateway', tags: ['侧边栏','导航','菜单','下拉菜单','管理员','EG71','网关','后台'], render(ctx){/* … */}, bind(root){/* 高亮 + 路由同步 */} }
```

### 上下文 ctx 契约
- `ctx.route`（当前路由，单一来源，由 `MS_EG71_SHELL.navigate` 驱动）。

### 结构类（`library/business.css`）
`.bc-eg71-sidenav`（100-149 行：侧边栏宽高、菜单态、二级下拉定位；151-171 行：展开/收起态 `.is-collapsed` 宽 80px + 图标居中 + 折叠图标随状态互换）。

### Figma 源
- sidenav：`2016:89103`

---

## 四、展开/收起交互说明

### 交互契约
- **触发**：点击 Logo 右侧 `.bc-eg71-collapse` 按钮（`arrowLeft` 图标，复用 `S_Icon`）。
- **状态**：容器 `.bc-eg71-sidenav` 上的 `is-collapsed` 类（布尔，非持久化；重渲染后回到默认展开态）。
- **同步**：`aria-expanded`（true=展开 / false=收起）、`aria-label`（「收起侧边栏」/「展开侧边栏」）随状态切换。

### 视觉/UI 变化（收起态 `is-collapsed`）
- 宽度 `220px → 80px`，过渡 `width var(--duration-normal) var(--ease)`（240ms）。
- 隐藏：`.ms-logo-text`（Logo 文字）、一级菜单 `<span>` 文字、`.bc-eg71-chevron`、`.bc-eg71-sub`（二级子菜单）、`.bc-eg71-foot-name`（账户名）、`.bc-eg71-more`（更多按钮）。
- 保留 icon 居中：`.ms-nav-item` / `.bc-eg71-foot` 改为 `justify-content: center`。
- `.bc-eg71-collapse` 图标由 `bind()` 在 `arrowLeft`（展开态，回退左箭头）↔ `arrowRight`（收起态，回退右箭头）间互换；展开态按钮距侧边栏右缘 8px，收起态按钮 50% 悬浮于右缘外侧，且带底框（bg `#182032` + 边框 `#38393b` + 圆角 4px + 高 20px，源自 Figma `basic2Button`）。

### atoms 依赖不变
折叠按钮复用现有 `S_Button`（`.ms-btn--xs.ms-btn--text`）+ `S_Icon`（`arrowLeft`/`arrowRight`），**不新增基础原子**，仅业务层编排 + 结构类控制显隐。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-sidenav`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
