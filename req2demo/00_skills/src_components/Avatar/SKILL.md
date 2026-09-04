# Avatar · 头像

> **分类**：数据展示
> **Figma**：1496-37413
> **组件目录**：`../../../../frontend/components/Avatar/`
> **版本**：v1.1.0（已对齐 antd `Avatar` `src` / `size` / `shape` / `icon` / `Avatar.Group` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**用户/对象的视觉标识**，支持图片、文字（首字符）、图标三种形态，并支持组合展示。

### 何时用
- 用户**头像/昵称首字符**展示。
- 列表、评论、通知中的**对象标识**。
- 多人**组合头像**（重叠展示）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 品牌/LOGO | `Logo` |
| 状态标识 | `Badge` / `Tag` |
| 功能性图标 | `Icon` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 图片 `src` | 有头像图时 | 加载失败要 fallback 到首字符 |
| 文字首字符 | 无图时 | 取姓名首字符，不要全名 |
| 图标 `icon` | 系统/对象 | 图标语义明确 |
| `Avatar.Group` | 多人重叠 | 重叠数量有上限（默认 +N） |

### 无障碍
- 纯装饰头像 `aria-hidden="true"`；承载身份信息时用 `alt`/`aria-label`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| default | 32×32 | 默认 |
| small | 24×24 | 小 |
| large | 40×40 | 大 |
| number | 自定义 | 精确控制 |

### 状态视觉矩阵
| 形态 | 表现 |
|------|------|
| 文字头像背景 | `--color-bg-hover` |
| 文字头像文字 | `--color-primary-normal` |
| 组合重叠边框 | `--color-bg-card` |

### 过渡
组合头像 hover 上浮 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-bg-hover`（文字头像背景）、`--color-primary-normal`（文字）、`--color-bg-card`（组合边框）。

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
| `src` | `string` | `-` | **antd 同名同值**：图片地址 |
| `size` | `'large' \| 'small' \| 'default' \| number` | `'default'` | **antd 同名同值**：尺寸 |
| `shape` | `'circle' \| 'square'` | `'circle'` | **antd 同名同值**：形状 |
| `icon` | `ReactNode` | `-` | **antd 同名同值**：图标 |
| `group` | `boolean` | `false` | **antd 别名**（对应 `Avatar.Group`）：组合模式 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 无交互；承载身份时可作为链接聚焦。

---

## 代码示例

```html
<Avatar src={user.avatar} />
<Avatar>{user.name[0]}</Avatar>
<Avatar icon={<Icon name="user" />} />
<Avatar.Group maxCount={3}>
  <Avatar src={a} /><Avatar src={b} /><Avatar src={c} />
</Avatar.Group>
```

---

## 文件映射

- Preview 文件：`avatar-preview.html`
- 组件目录：`../../../../frontend/components/Avatar/index.html`
- 令牌文件：`../../Tokens/tokens.css`
