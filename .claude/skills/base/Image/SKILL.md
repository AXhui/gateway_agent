---
name: Image
description: 图片（基础组件）
---

# Image · 图片

> **分类**：数据展示
> **Figma**：1491-53161
> **组件目录**：`../../../../frontend/components/Image/`
> **版本**：v1.1.0（已对齐 antd `Image` `src` / `preview` / `fallback` / `width` / `height` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**图片展示组件**，含预览、缩放、回退占位，用于产品图、截图、缩略图等场景。

### 何时用
- **产品图/截图**的展示与放大预览。
- 需要**加载失败回退**的图片。
- **多图预览组**（`Image.PreviewGroup`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 纯装饰背景图 | CSS `background-image` |
| 头像 | `Avatar` |
| 品牌标识 | `Logo` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `preview` | 可放大预览 | 必须设 `fallback` 兜底 |
| `fallback` | 失败占位 | 失败态有明确占位图 |
| 列表多图 | `Image.PreviewGroup` | 组内图片可连续预览 |

### 无障碍
- 图片有 `alt` 描述；预览浮层可键盘关闭（Esc）。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认宽 | 自适应 | 可 `width`/`height` 固定 |
| 预览遮罩 | 全屏 | 深色遮罩 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 正常 | 原图 |
| hover 预览 | 遮罩 `--color-bg-hover` |
| 占位边框 | `--color-divider-base-1` |

### 过渡
预览淡入 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-divider-base-1`（占位边框）、`--color-bg-hover`（hover 遮罩）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 预览 hover（预览遮罩） |
| active（点击反馈） | 按下 |
| 键盘 | `Enter` 触发预览 |
| loading | 加载占位 → 失败回退图（见矩阵） |
| error | 加载失败回退态 |

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
| `src` | `string` | `-` | **antd 同名同值**：图片源 |
| `preview` | `boolean \| object` | `true` | **antd 同名同值**：预览能力 |
| `fallback` | `string` | `-` | **antd 同名同值**：失败兜底 |
| `width` | `number` | `-` | **antd 同名同值**：宽度 |
| `height` | `number` | `-` | **antd 同名同值**：高度 |

### 受控/非受控语义
- 纯展示组件；预览浮层内部维护显隐（非受控）。

### 事件 / 键盘
- 预览浮层 Esc 关闭；点击遮罩关闭。

---

## 代码示例

```html
<Image src={url} fallback={placeholder} width={200} />
<Image.PreviewGroup>
  <Image src={a} /><Image src={b} />
</Image.PreviewGroup>
```

---

## 文件映射

- Preview 文件：`image-preview.html`
- 组件目录：`../../../../frontend/components/Image/index.html`
- 令牌文件：`../../../tokens/tokens.css`
