# Progress · 进度条

> **分类**：反馈
> **Figma**：1445-34912
> **组件目录**：`frontend/components/Progress/`
> **版本**：v1.1.0（已对齐 antd `Progress` `percent` / `type` / `status` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**任务进度展示**，含线性（line）、圆形（circle）、仪表盘（dashboard）三种形态，用于有明确进度百分比的长任务反馈。

### 何时用
- 任务耗时 **>2 秒**且**进度可量化**（上传、同步、部署、报表生成）。
- 需要**直观展示完成度**（磁盘占用、配额使用）。
- 有明确百分比来源（已处理/总量）的批量任务。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 不确定时长/无百分比 | `Spin` |
| 短暂操作（<2 秒） | 无需指示 |
| 需要详细步骤说明 | `Steps` |
| 瞬时结果提示 | `Message` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `type="line"` | 内联/列表进度 | 空间充裕时首选 |
| `type="circle"` | 卡片中心/仪表展示 | 不要在小空间用大圆 |
| `type="dashboard"` | 仪表盘形态，半圆 | 适合容量/阈值场景 |
| `status="exception"` | 失败中断 | 失败要有重试入口 |
| `status="success"` | 100% 完成 | 完成后短暂展示即可 |

### 无障碍
- `role="progressbar"`，`aria-valuenow`/`aria-valuemin`/`aria-valuemax` 标注进度。
- `aria-valuetext` 播报「已完成 60%」。
- 颜色不只靠色相区分状态，配合文字/图标表达。
- `showInfo` 关闭时仍需无障碍标注。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| line 高度 | 8px | 轨道 + 进度 |
| circle 直径 | 120px | 默认 |
| 文字字号 | 12px（百分比） | 右侧或中心 |
| 圆角 | `var(--radius-full)` | 轨道/进度 |

### 状态视觉矩阵
| 状态 | 进度色 | 文字色 |
|------|--------|--------|
| normal/active | `--color-primary-normal` | `--color-text-primary` |
| success | `--color-success-normal` | `--color-text-primary` |
| exception | `--color-error-normal` | `--color-text-primary` |
| 轨道 | `--color-fill-base-normal` | — |

### 过渡
进度变化平滑 `200ms var(--easing-standard)`；active 态轨道流光动画。

### 使用的设计令牌
`--color-primary-normal`（正常进度）、`--color-success-normal`（成功）、`--color-error-normal`（异常）、`--color-fill-base-normal`（轨道）、`--color-text-primary`、`--radius-full`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 token（轨道 `--color-fill-base` 语义），已统一为 `--color-fill-base-normal`。

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
| `percent` | `number` | `0` | **antd 同名同值**：进度（0-100） |
| `type` | `'line' \| 'circle' \| 'dashboard'` | `'line'` | **antd 同名同值**：形态 |
| `status` | `'success' \| 'exception' \| 'normal' \| 'active'` | `'normal'` | **antd 同名同值**：状态 |
| `strokeColor` | `string \| object` | `-` | **antd 同名同义**：进度色 |
| `showInfo` | `boolean` | `true` | **antd 同名同值**：显示百分比文字 |
| `size` | `number \| 'small' \| 'default'` | `'default'` | **antd 同名同义**：尺寸 |
| `strokeWidth` | `number` | `8` | **antd 同名同值**：线宽 |

### 受控/非受控语义
- `percent` 由外部状态驱动（受控），进度变化经业务方更新 `percent`。
- `status` 覆盖 `percent` 的默认状态推断（100% 自动 success，异常需显式 `exception`）。

### 事件 / 键盘
- 纯展示组件，无键盘交互；语义由 `role="progressbar"` 提供。

---

## 代码示例

```html
<Progress percent={60} />
<Progress type="circle" percent={75} />
<Progress type="dashboard" percent={82} strokeColor="var(--color-primary-normal)" />
<Progress percent={40} status="exception" />
```

---

## 文件映射

- Preview 文件：`progress-preview.html`
- 组件目录：`frontend/components/Progress/index.html`
- 令牌文件：`frontend/shared/tokens.css`
