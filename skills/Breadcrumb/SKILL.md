# Breadcrumb · 面包屑

> **分类**：导航
> **Figma**：-
> **组件目录**：`frontend/components/Breadcrumb/`
> **版本**：v1.1.0（已对齐 antd `Breadcrumb` `items` / `separator` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**显示当前页面层级路径的导航组件**，帮助用户理解位置并可回溯上级。

### 何时用
- **二级及以下页面**的层级路径（首页 / 设备 / 详情）。
- 层级 ≥ 2 且需要**快速返回上级**的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 单层首页 | 无需面包屑 |
| 同级标签切换 | `Tabs` |
| 多级复杂树形导航 | `NavMenu` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `items` | 层级路径数组 | 最后一级为当前页，不可点击 |
| 中间层可点击 | 返回上级 | 已点击层要有 hover 态 |
| `separator` | 自定义分隔符 | 默认 `>`，全站统一 |

### 无障碍
- 使用 `nav` + `aria-label="breadcrumb"` 语义。
- 当前页用 `aria-current="page"` 标注。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 字号 | 14px | 层级文字 |
| 层级间距 | 8px | 分隔符两侧 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 上级链接 | `--color-text-secondary` |
| 当前页 | `--color-text-auxiliary`（不可点） |
| 链接 hover | `--color-primary-normal` |

### 过渡
链接 hover 颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-text-secondary`（上级链接）、`--color-text-auxiliary`（当前页）、`--color-primary-normal`（hover）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

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
| `items` | `Array<{title, href?, onClick?}>` | `[]` | **antd 同名同值**：层级路径 |
| `separator` | `ReactNode` | `>` | **antd 同名同值**：分隔符 |

### 受控/非受控语义
- 纯导航组件，无受控语义。

### 事件 / 键盘
- 上级链接可键盘聚焦；当前页不可点。

---

## 代码示例

```html
<Breadcrumb items={[
  { title: '首页', href: '/' },
  { title: '设备管理', href: '/devices' },
  { title: '设备详情' }
]} />
```

---

## 文件映射

- Preview 文件：`breadcrumb-preview.html`
- 组件目录：`frontend/components/Breadcrumb/index.html`
- 令牌文件：`frontend/shared/tokens.css`
