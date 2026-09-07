---
name: Descriptions
description: 描述列表（基础组件）
---

# Descriptions · 描述列表

> **分类**：数据展示
> **Figma**：1494-33048
> **组件目录**：`../../../../frontend/components/Descriptions/`
> **版本**：v1.1.0（已对齐 antd `Descriptions` `column` / `bordered` / `items` / `size` / `layout` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**键值对描述列表**，用于详情页只读信息的结构化展示，支持多列、边框、垂直布局。

### 何时用
- **详情页只读信息**（设备信息、配置、规格）。
- 需要**键值对整齐对齐**的展示。
- 需要**多列**压缩篇幅的字段列表。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 可编辑表单 | `Form` |
| 单个指标数值 | `Statistic` |
| 列表型数据 | `List` / `Table` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `bordered={false}` | 基础信息 | 常规只读信息用无边框 |
| `bordered` | 技术规格 | 需强对齐用边框 |
| `column` | 列数 1-4 | 窄屏自动降列 |
| `layout="vertical"` | 上下布局 | 标签长时用 |

### 无障碍
- 键值对语义（`dt`/`dd` 或表格），读屏可成对读取。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 标签宽 | 自适应 | 默认 |
| size | default/middle/small | 尺寸档 |

### 状态视觉矩阵
| 元素 | 表现 |
|------|------|
| 标签 | `--color-text-auxiliary` |
| 内容 | `--color-text-primary` |
| 边框 | `--color-border-base` |
| 无边框行背景 | `--color-bg-page` |

### 过渡
无动画。

### 使用的设计令牌
`--color-border-base`（边框）、`--color-bg-page`（行背景）。

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
| `column` | `number` | `3` | **antd 同名同值**：列数 |
| `bordered` | `boolean` | `false` | **antd 同名同值**：带边框 |
| `items` | `DescriptionItem[]` | `[]` | **antd 同名同值**：项目 |
| `size` | `'default' \| 'middle' \| 'small'` | `'default'` | **antd 同名同值**：尺寸 |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | **antd 同名同值**：布局 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 无交互。

---

## 代码示例

```html
<Descriptions column={3} bordered items={[
  { key: 'name', label: '设备名称', children: 'MS-1001' },
  { key: 'type', label: '设备类型', children: '传感器' },
  { key: 'status', label: '状态', children: <Badge status="success" text="在线" /> }
]} />
```

---

## 文件映射

- Preview 文件：`descriptions-preview.html`
- 组件目录：`../../../../frontend/components/Descriptions/index.html`
- 令牌文件：`../../../tokens/tokens.css`
