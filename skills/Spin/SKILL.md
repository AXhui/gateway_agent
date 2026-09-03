# Spin · 加载中

> **分类**：反馈
> **Figma**：1424-160894
> **组件目录**：`frontend/components/Spin/`
> **版本**：v1.1.0（已对齐 antd `Spin` `spinning` / `size` / `delay` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**加载指示器**，可单独显示或包裹内容产生遮罩 loading，用于不确定时长、无明确进度的等待场景。

### 何时用
- 短暂等待（<2 秒但需反馈）或**不确定时长**的加载。
- 包裹内容，在数据加载时显示遮罩。
- 按钮内 loading（提交中、保存中）。
- 局部区域/组件的加载态。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 首屏加载 >500ms | `Skeleton` |
| 长任务且有明确进度 | `Progress` |
| 有明确步骤 | `Steps` |
| 瞬时（<300ms） | `delay` 避免闪烁 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `spinning` | 包裹内容遮罩 | 遮罩要半透明，保留内容轮廓 |
| `delay={300}` | 短暂操作防闪烁 | 不要对必然慢的请求设 delay |
| `size` | small/default/large | 按钮内用 small |
| `tip` | 附带提示文字 | 文案要说明在做什么，不要只「加载中」 |
| `indicator` | 自定义指示器 | 保持旋转语义一致 |

### 无障碍
- `role="status"` + `aria-live="polite"`，读屏播报加载状态。
- `tip` 文字承载语义，图标 `aria-hidden`。
- `aria-busy="true"` 标注包裹区域加载中。
- 加载完成后移除 loading，读屏可感知内容就绪。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| small | 16×16 | 按钮/局部 |
| default | 24×24 | 默认 |
| large | 32×32 | 大区域 |
| tip 间距 | 8px | 指示器与文字 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 指示器 | `--color-primary-normal` |
| 包裹遮罩 | `var(--color-bg-card)` 半透明 |
| tip 文字 | `--color-text-secondary` |
| 图标 | `--color-text-disable`（次级场景） |

### 过渡
旋转动画线性循环（0.8s/圈）；遮罩淡入 `160ms`。

### 使用的设计令牌
`--color-primary-normal`（指示器）、`--color-bg-card`（遮罩底）、`--color-text-secondary`（tip）、`--color-text-disable`（次级图标）、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 token（无具体映射项），已统一到规范令牌。

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
| `spinning` | `boolean` | `true` | **antd 同名同值**：是否加载中 |
| `tip` | `ReactNode` | `-` | **antd 同名同义**：提示文字 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | **antd 同名同值**：尺寸 |
| `indicator` | `ReactNode` | `-` | **antd 同名同义**：自定义指示器 |
| `delay` | `number` | `-` | **antd 同名同值**：延迟显示（ms） |
| `children` | `ReactNode` | `-` | 包裹内容 |

### 受控/非受控语义
- `spinning` 由外部状态驱动（受控）；`delay` 使短暂操作延迟出现，避免闪烁。
- 包裹 `children` 时生成半透明遮罩；不包裹时独立显示指示器。

### 事件 / 键盘
- 纯展示组件，无键盘交互；`role="status"` + `aria-busy` 提供语义。

---

## 代码示例

```html
<Spin spinning={loading}>
  <DeviceTable data={devices} />
</Spin>
<Spin size="small" tip="保存中..." />
<Button loading={submitting}>保存</Button>
```

---

## 文件映射

- Preview 文件：`spin-preview.html`
- 组件目录：`frontend/components/Spin/index.html`
- 令牌文件：`frontend/shared/tokens.css`
