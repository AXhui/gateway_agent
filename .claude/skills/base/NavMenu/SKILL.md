---
name: NavMenu
description: 导航菜单（基础组件）
---

# NavMenu · 导航菜单

> **分类**：导航
> **Figma**：1372-127827
> **组件目录**：`../../../../frontend/components/NavMenu/`
> **版本**：v1.1.0（已对齐 antd `Menu` `mode` / `items` / `selectedKeys` / `openKeys` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**应用主导航菜单**，支持水平/垂直/内嵌三种模式与多级子菜单，承载应用的功能入口与当前定位。

### 何时用
- **应用侧边栏/顶栏**的主导航。
- 需要**多级层级**的功能导航。
- 需要**当前选中/展开**状态高亮的导航。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 下拉操作菜单 | `DropdownMenu` |
| 步骤流程 | `Steps` |
| 同级标签切换 | `Tabs` |
| 面包屑层级路径 | `Breadcrumb` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `mode="inline"` | 侧边栏垂直 | 侧栏折叠时子菜单弹出 |
| `mode="horizontal"` | 顶栏水平 | 层级 ≤ 2 |
| `mode="vertical"` | 独立垂直菜单 | 无内嵌缩进 |
| 选中态 | `selectedKeys` | 选中项主色高亮 |
| 展开态 | `openKeys` | 默认展开当前路径 |

### 无障碍
- `role="menu"` / `role="menuitem"` 语义。
- 键盘上下键导航，Enter 触发；`aria-current` 标注当前项。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 菜单项高 | 40px | 垂直模式 |
| 水平项高 | 40px | 水平模式 |
| 子菜单缩进 | 16px/级 | inline 模式 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 背景 | `--color-bg-card` |
| 默认文字 | `--color-text-primary` |
| 选中文字 | `--color-primary-normal` |
| 选中/悬浮背景 | `--color-primary-bg` |

### 过渡
背景/颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中文字）、`--color-primary-bg`（选中/悬浮背景）、`--color-bg-card`（容器背景）、`--color-text-primary`（默认文字）。

> **Token 修正**：`--color-brand-50` → `--color-primary-bg`（选中/悬浮背景统一用主色淡背景 token）。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 菜单项 hover `--color-bg-hover` |
| active（点击反馈） | 按下加深 |
| 键盘 | `↑↓` 导航、`Enter` 激活、`Esc` 关闭 |
| loading | 无加载态 |
| error | 无 |

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'inline' \| 'horizontal' \| 'vertical'` | `'inline'` | **antd 同名同值**：模式 |
| `items` | `Array<MenuItem>` | `[]` | **antd 同名同值**：菜单项 |
| `selectedKeys` | `string[]` | `[]` | **antd 同名同值**：选中项 |
| `openKeys` | `string[]` | `[]` | **antd 同名同值**：展开子菜单 |
| `onClick` | `({key}) => void` | `-` | **antd 同名同值**：点击回调 |
| `onOpenChange` | `(keys) => void` | `-` | **antd 同名同值**：展开变化 |

### 受控/非受控语义
- `selectedKeys`/`openKeys` + 对应回调为**受控**；缺省回调时内部维护非受控状态。

### 事件 / 键盘
- 键盘上下导航、Enter 触发、Esc 关闭子菜单；`onClick` 返回 `key`。

---

## 代码示例

```html
<NavMenu
  mode="inline"
  items={[
    { key: 'dashboard', label: '仪表盘' },
    { key: 'devices', label: '设备管理', children: [
      { key: 'list', label: '设备列表' },
      { key: 'group', label: '设备分组' }
    ]}
  ]}
  selectedKeys={['list']}
  openKeys={['devices']}
  onClick={({key}) => navigate(key)}
/>
```

---

## 文件映射

- Preview 文件：`navmenu-preview.html`
- 组件目录：`../../../../frontend/components/NavMenu/index.html`
- 令牌文件：`../../../tokens/tokens.css`
