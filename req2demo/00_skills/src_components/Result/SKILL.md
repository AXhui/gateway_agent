# Result · 结果

> **分类**：反馈
> **Figma**：1439-29101
> **组件目录**：`../../../../frontend/components/Result/`
> **版本**：v1.1.0（已对齐 antd `Result` `status` / `title` / `extra` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**页面级结果反馈**，用于整页任务结束后的状态呈现，覆盖成功、失败、403/404/500、信息等状态，并引导用户下一步动作。

### 何时用
- 整页任务结束后的**结果呈现**（提交成功、支付完成、导入失败）。
- **空态/异常页**（404 页面不存在、403 无权限、500 服务异常）。
- 需要**明确下一步动作**引导，避免用户走到死胡同。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 区块内局部结果 | `Alert` / `Empty` |
| 瞬时操作反馈 | `Message` |
| 需要用户输入后继续 | `Modal` / `Drawer` |
| 列表空数据 | `Empty` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `status="success"` | 操作成功 | 必须给「下一步动作」 |
| `status="error"` | 操作失败 | 失败要说明原因 + 重试入口 |
| `status="403/404/500"` | 异常状态页 | 403/404 给「返回首页」引导 |
| `extra` | 放操作按钮 | 按钮动作要单一明确 |
| `subTitle` | 补充说明 | 不要只重复 title |

### 无障碍
- 状态图标 `aria-hidden`，语义由 `title` 承载，`role="status"`（成功）或 `role="alert"`（失败）。
- 标题使用语义化层级（`h1`/`h2`），读屏可导航。
- 操作按钮可键盘聚焦，`extra` 内按钮语义清晰。
- 颜色 + 图标双重表达状态，不只靠色相。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 容器 | 居中，垂直留白 48px+ | 整页布局 |
| 状态图标 | 72×72 | 大图标 |
| 标题字号 | 24px | 主文案 |
| 副标题字号 | 14px | 次要说明 |
| 操作区间距 | 24px | extra 按钮 |

### 状态视觉矩阵
| 状态 | 图标色 | 标题色 | 副标题色 |
|------|--------|--------|----------|
| success | `--color-success-normal` | `--color-text-primary` | `--color-text-secondary` |
| error | `--color-error-normal` | `--color-text-primary` | `--color-text-secondary` |
| info | `--color-primary-normal` | `--color-text-primary` | `--color-text-secondary` |
| warning | `--color-warm-normal` | `--color-text-primary` | `--color-text-secondary` |
| 403/404/500 | `--color-text-disable` | `--color-text-primary` | `--color-text-secondary` |

### 过渡
状态图标可加轻微淡入 `200ms var(--easing-standard)`。

### 使用的设计令牌
`--color-success-normal`/`--color-error-normal`/`--color-primary-normal`/`--color-warm-normal`（状态图标）、`--color-text-primary`（标题）、`--color-text-secondary`（副标题）、`--color-text-disable`（异常态图标）、`--color-bg-page`（页面底）、`--spacing-48`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 token（无具体映射项），已统一到上述规范令牌。

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
| `status` | `'success' \| 'error' \| 'info' \| 'warning' \| '404' \| '403' \| '500'` | `'info'` | **antd 同名同值**：结果状态 |
| `title` | `ReactNode` | `-` | **antd 同名同义**：主文案 |
| `subTitle` | `ReactNode` | `-` | **antd 同名同义**：副文案 |
| `extra` | `ReactNode` | `-` | **antd 同名同义**：操作区 |
| `icon` | `ReactNode` | `-` | **antd 同名同义**：自定义图标 |

### 受控/非受控语义
- 纯展示组件，`status` 决定默认图标与语义色；`icon` 可覆盖。
- `extra` 承载「下一步动作」按钮，由业务方传入。

### 事件 / 键盘
- 无内置交互；`extra` 内按钮需可键盘聚焦。
- `title` 语义化层级，读屏可导航到结果文案。

---

## 代码示例

```html
<Result status="success" title="提交成功" subTitle="预计 3 个工作日内完成审核。" extra={<Button type="primary">返回列表</Button>} />
<Result status="404" title="404" subTitle="抱歉，您访问的页面不存在。" extra={<Button type="primary">返回首页</Button>} />
<Result status="error" title="导入失败" subTitle="文件格式不正确，请检查后重试。" extra={<Button>重新导入</Button>} />
```

---

## 文件映射

- Preview 文件：`result-preview.html`
- 组件目录：`../../../../frontend/components/Result/index.html`
- 令牌文件：`../../Tokens/tokens.css`
