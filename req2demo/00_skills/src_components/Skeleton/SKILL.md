# Skeleton · 骨架屏

> **分类**：反馈
> **Figma**：1439-19991
> **组件目录**：`../../../../frontend/components/Skeleton/`
> **版本**：v1.1.0（已对齐 antd `Skeleton` `active` / `avatar` / `paragraph` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**加载占位**，还原页面真实骨架（头像、段落、图片位置），减少首屏空白感，让用户感知内容即将出现。

### 何时用
- 首屏加载 **>500ms** 时，用骨架占位。
- 列表/卡片/详情页的**结构占位**。
- 需要稳定布局、避免加载时跳动（CLS）的场景。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 短暂加载（<500ms） | 无需占位 |
| 局部小区域加载 | `Spin` |
| 不确定进度长任务 | `Spin` / `Progress` |
| 空数据（非加载） | `Empty` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `active` | 流光动画 | 大面积骨架动画易造成视觉疲劳 |
| `avatar` | 含头像占位（列表/评论） | 头像占位要匹配真实头像形状 |
| `paragraph` | 段落行占位 | 行数要与真实内容行数接近 |
| `loading` | 包裹真实内容 | 内容加载完平滑切换，不要闪烁 |
| `round` | 圆角占位 | 与真实元素圆角一致 |

### 无障碍
- `role="status"` 或 `aria-busy="true"` 标注加载中。
- 骨架占位 `aria-hidden`，不参与读屏。
- 加载完成后 `aria-busy="false"`，读屏播报内容出现。
- 不要只靠动画表达加载，需语义标注。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 段落行高 | 14px | 与正文行高一致 |
| 段落行间距 | 8px | 行间留白 |
| 头像尺寸 | 32×32 / 40×40 | 匹配真实头像 |
| 圆角 | `var(--radius-4)`（默认）/ `var(--radius-full)`（round） | 占位块 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 占位块 | bg `var(--color-bg-hover)` |
| active 流光 | 从 `--color-bg-hover` 到 `--color-bg-page` 渐变移动 |
| 页面底 | `var(--color-bg-page)` |

### 过渡
流光动画 `1.4s` 循环（ease）；加载完成骨架淡出、内容淡入 `160ms`。

### 使用的设计令牌
`--color-bg-hover`（占位块）、`--color-bg-page`（流光/页面底）、`--radius-4`、`--radius-full`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 token（无具体映射项），已统一到规范令牌 `--color-bg-hover` / `--color-bg-page`。

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
| `active` | `boolean` | `false` | **antd 同名同值**：流光动画 |
| `avatar` | `boolean \| object` | `false` | **antd 同名同义**：头像占位 |
| `paragraph` | `boolean \| object` | `true` | **antd 同名同义**：段落占位 |
| `loading` | `boolean` | `true` | **antd 同名同值**：是否加载中 |
| `round` | `boolean` | `false` | **antd 同名同值**：圆角占位 |
| `title` | `boolean \| object` | `true` | **antd 同名同义**：标题占位 |

### 受控/非受控语义
- `loading` 控制占位与真实内容的切换；`loading=true` 渲染骨架，`false` 渲染 children。
- 嵌套 Skeleton 时（`Skeleton.Button`/`Skeleton.Image`/`Skeleton.Avatar`）各自独立。

### 事件 / 键盘
- 纯展示组件，无交互；`aria-busy` 语义标注加载状态。

---

## 代码示例

```html
<Skeleton active avatar paragraph={{ rows: 3 }} />
<Skeleton loading={loading}>
  <DeviceDetail data={device} />
</Skeleton>
<Skeleton.Image style={{ width: 200, height: 120 }} />
```

---

## 文件映射

- Preview 文件：`skeleton-preview.html`
- 组件目录：`../../../../frontend/components/Skeleton/index.html`
- 令牌文件：`../../Tokens/tokens.css`
