# Watermark · 水印

> **分类**：数据展示
> **Figma**：1491-33013
> **组件目录**：`frontend/components/Watermark/`
> **版本**：v1.1.0（已对齐 antd `Watermark` `content` / `gap` / `rotate` / `fontSize` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页面/区域水印**，以平铺文字标识内容归属，用于敏感信息防泄密、页面归属标识。

### 何时用
- **敏感数据页面**的防泄密水印（账号、工号）。
- **内部文档/页面**的归属标识。
- 需要**全屏/区域平铺**文字标识。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 图片上的版权标识 | 图片处理 |
| 单次提示 | `Alert` / `Tooltip` |
| 背景装饰 | CSS 背景 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `content` | 水印文字 | 用当前用户标识（防泄密） |
| `rotate` | 角度 | 默认 -22° |
| `gap` | 间距 | 覆盖均匀 |
| 多层内容 | 图片+文字 | 需要时叠加 |

### 无障碍
- 水印为装饰性，`aria-hidden="true"`，不干扰读屏。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 字号 | 14px | 可 `fontSize` |
| 角度 | -22° | `rotate` |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 文字颜色 | `--color-text-auxiliary`（低对比） |
| 覆盖区域 | 平铺不遮挡内容交互 |

### 过渡
无动画。

### 使用的设计令牌
`--color-text-auxiliary`（水印文字）。

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
| `content` | `string \| string[]` | `-` | **antd 同名同值**：水印内容 |
| `gap` | `[number, number]` | `[100, 100]` | **antd 同名同值**：间距 |
| `rotate` | `number` | `-22` | **antd 同名同值**：角度 |
| `fontSize` | `number` | `14` | **antd 同名同值**：字号 |
| `zIndex` | `number` | `9` | **antd 同名同值**：层级 |
| `children` | `ReactNode` | `-` | 被水印覆盖的内容 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 无交互；水印层不拦截内容交互。

---

## 代码示例

```html
<Watermark content={user.name} gap={[120, 120]}>
  <div style={{ height: 400 }}>敏感内容区域</div>
</Watermark>
```

---

## 文件映射

- Preview 文件：`watermark-preview.html`
- 组件目录：`frontend/components/Watermark/index.html`
- 令牌文件：`frontend/shared/tokens.css`
