# Affix · 固钉

> **分类**：导航
> **Figma**：1372-131274
> **组件目录**：`frontend/components/Affix/`
> **版本**：v1.1.0（已对齐 antd `Affix` `offsetTop` / `offsetBottom` / `onChange` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**将元素固定于可视窗口的组件**，滚动时在 `offsetTop`/`offsetBottom` 触达处吸附，常用于固定操作栏、工具栏、锚点。

### 何时用
- **固定操作栏**（长表单的提交/取消按钮随滚动固定）。
- **固定筛选/工具栏**（表格页顶部筛选区）。
- 需要**吸附置顶**的标题或导航。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 始终固定的 Header | `Layout.Header` |
| 侧边栏固定 | `Layout.Sider` |
| 无需吸附的普通元素 | 原生定位 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `offsetTop` | 距顶部吸附距离 | 默认 0，需避开 Header 时设 Header 高度 |
| `offsetBottom` | 距底部吸附 | 与 offsetTop 二选一 |
| 固定态阴影 | 吸附后加阴影区分层级 | 用 `--shadow-1` 而非自定义 |

### 无障碍
- 吸附为视觉行为，不改变 DOM 顺序，读屏不受影响。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| offsetTop | 0 | 默认顶部吸附 |
| 吸附后阴影 | `--shadow-1` | 与内容区分层级 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 未吸附 | 无阴影，随流 |
| 已吸附 | `--shadow-1`，`position: fixed` |

### 过渡
吸附切换无动画（或阴影 `160ms var(--easing-standard)` 渐入）。

### 使用的设计令牌
`--shadow-1`（吸附态阴影）。

> **Token 修正**：`--shadow-2` → `--shadow-1`（吸附阴影统一用标准一级阴影）。

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
| `offsetTop` | `number` | `0` | **antd 同名同值**：距顶部吸附距离 |
| `offsetBottom` | `number` | `-` | **antd 同名同值**：距底部吸附距离 |
| `onChange` | `(affixed) => void` | `-` | **antd 同名同值**：吸附状态变化 |
| `children` | `ReactNode` | `-` | 内容 |

### 受控/非受控语义
- 内部通过滚动监听维护吸附态，`onChange` 返回 `affixed` 布尔值（非受控，仅通知）。

### 事件 / 键盘
- 纯容器，无键盘交互；吸附态变化触发 `onChange`。

---

## 代码示例

```html
<Affix offsetTop={56}>
  <div className="toolbar">筛选工具栏</div>
</Affix>
<Affix offsetBottom={0}>
  <Button type="primary">提交</Button>
</Affix>
```

---

## 文件映射

- Preview 文件：`affix-preview.html`
- 组件目录：`frontend/components/Affix/index.html`
- 令牌文件：`frontend/shared/tokens.css`
