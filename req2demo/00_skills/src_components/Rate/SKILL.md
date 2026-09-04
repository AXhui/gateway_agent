# Rate · 评分

> **分类**：数据展示
> **Figma**：1478-137786
> **组件目录**：`../../../../frontend/components/Rate/`
> **版本**：v1.1.0（已对齐 antd `Rate` `value` / `count` / `allowHalf` / `disabled` / `onChange` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**星级评分组件**，支持半星、只读、自定义数量，用于满意度评价、质量评分、展示评分。

### 何时用
- **满意度/质量评分**的输入。
- **评分展示**（只读 `disabled`）。
- 需要**半星精度**的场景（`allowHalf`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 数值统计 | `Statistic` |
| 二选一（喜欢/不喜欢） | 图标按钮 |
| 进度评价 | `Progress` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `value` | 当前分值 | 展示用只读 |
| `allowHalf` | 半星 | 需要精细评分时 |
| `disabled` | 只读展示 | 详情页评分展示用 |
| `count` | 星级数 | 默认 5 |

### 无障碍
- 每颗星可键盘（方向键）调节；`aria-label` 描述当前分值。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 星尺寸 | 20×20 | 默认 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 选中星 | `--color-warm-normal`（#F77234 暖橙） |
| 未选中星 | `--color-border-base`（描边） |
| 选中星描边 | `--color-warm-normal` |
| hover 星 | 高亮选中 |

### 过渡
颜色 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-warm-normal`（选中星）、`--color-border-base`（未选中描边）。

> **Token 修正**：`--color-warm-normaling` → `--color-warm-normal`（拼写规范化）；`--color-gray-200` → `--color-border-base`（未选中星描边统一用边框基础 token）。

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
| `value` | `number` | `0` | **antd 同名同值**：当前分值 |
| `count` | `number` | `5` | **antd 同名同值**：星数 |
| `allowHalf` | `boolean` | `false` | **antd 同名同值**：半星 |
| `disabled` | `boolean` | `false` | **antd 同名同值**：只读 |
| `onChange` | `(value) => void` | `-` | **antd 同名同值**：变化回调 |

### 受控/非受控语义
- `value` + `onChange` 为**受控**；缺省 `value` 时内部维护非受控分值。

### 事件 / 键盘
- 方向键左右调节分值；Enter 确认。

---

## 代码示例

```html
<Rate value={4.5} allowHalf onChange={setScore} />
<Rate value={4} disabled />
```

---

## 文件映射

- Preview 文件：`rate-preview.html`
- 组件目录：`../../../../frontend/components/Rate/index.html`
- 令牌文件：`../../Tokens/tokens.css`
