---
name: Empty
description: 空状态（基础组件）
---

# Empty · 空状态

> **分类**：数据展示
> **Figma**：1478-137754
> **组件目录**：`../../../../frontend/components/Empty/`
> **版本**：v1.1.0（已对齐 antd `Empty` `image` / `description` / `imageStyle` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**无数据空状态展示**，提供默认插画与自定义插画，用于列表、搜索结果、下拉为空时的占位。

### 何时用
- **列表/表格**无数据时的占位。
- **搜索结果为空**。
- **下拉/弹层**无选项时。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 加载中 | `Spin` / `Skeleton` |
| 加载失败 | 错误态 + 重试按钮 |
| 无权限 | 权限提示（非「无数据」） |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 默认插画 | 通用空态 | 无数据时 |
| `description` | 说明文案 | 区分「无数据」「无权限」「加载失败」 |
| 自定义 `image` | 场景化插画 | 保持全站空态风格一致 |

### 无障碍
- 描述文字有语义，读屏可读；插画 `aria-hidden="true"`。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 插画 | 默认尺寸 | 居中 |
| 描述字号 | 14px | 说明 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 描述文字 | `--color-text-auxiliary` |
| 背景 | `--color-bg-page` |

### 过渡
无动画。

### 使用的设计令牌
`--color-text-auxiliary`（描述）、`--color-bg-page`（背景）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

> 五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。

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
| `image` | `ReactNode \| string` | `default` | **antd 同名同值**：图片 |
| `description` | `ReactNode` | `'暂无数据'` | **antd 同名同值**：描述 |
| `imageStyle` | `CSSProperties` | `-` | **antd 同名同值**：图片样式 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 无交互。

---

## 代码示例

```html
<Empty description="暂无设备" />
<Empty description="搜索无结果" image={Empty.PRESENTED_IMAGE_SIMPLE} />
```

---

## 文件映射

- Preview 文件：`empty-preview.html`
- 组件目录：`../../../../frontend/components/Empty/index.html`
- 令牌文件：`../../../tokens/tokens.css`
