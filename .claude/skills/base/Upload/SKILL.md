---
name: Upload
description: 上传（基础组件）
---

# Upload · 上传

> **分类**：数据录入
> **Figma**：1471-13813
> **组件目录**：`../../../../frontend/components/Upload/`
> **版本**：v1.1.0（已对齐 antd `Upload` `listType` / `maxCount` / `accept` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**文件/图片上传控件**。支持点击或拖拽上传，展示上传列表与进度，覆盖文本、图片、卡片三种列表形态。

### 何时用
- 需要上传**文件**（固件、配置、日志、证书）或**图片**（头像、封面、截图）。
- 需要**多文件**批量上传。
- 需要**上传进度**、重试、删除等生命周期管理。
- 需要**拖拽上传**（大文件/常用入口）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 只做文件选择不展示列表 | 原生 `<input type="file">` 封装 |
| 图片裁剪/编辑 | 专用裁剪组件 |
| 富文本内嵌资源 | 编辑器自带上传统一管理 |
| 纯静态图片展示 | `Image` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `listType="text"` | 文档/固件等，列表展示文件名+进度 | 图片预览需求不要用 text |
| `listType="picture"` | 图片缩略图 + 文件名 | 大量图片时缩略图列表过长 |
| `listType="picture-card"` | 图片卡片墙，点卡片上传 | 不要用来传文档，无预览价值 |
| 拖拽（Dragger） | 大文件/批量导入入口 | 移动端拖拽体验差，降级为点击 |
| `maxCount` | 限制数量（如头像 maxCount=1） | 超出后要明确提示，不要静默拒绝 |

### 无障碍
- 触发区为 `role="button"`，可键盘聚焦；拖拽区 `tabIndex=0`，`Enter`/`Space` 打开文件选择。
- 文件列表项用 `role="listitem"`，删除按钮有 `aria-label`（如「删除 xxx」）。
- 上传状态（上传中/成功/失败）用文字 + 图标双重表达，不要只靠颜色。
- 失败项提供「重试」按钮，读屏可感知错误原因。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 触发按钮高度 | 24/32/40（sm/md/lg） | 对齐 `Button` |
| picture-card 尺寸 | 96×96 | 图片卡片 |
| 拖拽区 | 高 140px，宽自适应 | 虚线边框 |
| 列表项高 | 32px | 文件名 + 图标 |
| 圆角 | `var(--radius-8)` | 卡片/拖拽区 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 默认触发 | 边框 `var(--color-border-base)`，bg `var(--color-bg-page)` |
| hover 拖拽区 | 边框 `var(--color-primary-normal)` |
| 拖入（dragover） | 边框加粗 + `--color-primary-bg` 底 |
| 上传中 | 进度条 `--color-primary-normal` |
| 成功 | 文件名 `--color-text-primary` |
| 失败 | 文件名/图标 `--color-error-normal` + 重试 |
| 图片卡片 | hover 显示删除/预览遮罩 |

### 过渡
拖拽区 hover 边框 `160ms var(--easing-standard)`；卡片 hover 遮罩淡入 120ms。

### 使用的设计令牌
`--color-primary-normal`（hover 边框/进度/预览）、`--color-primary-bg`（拖入底）、`--color-border-base`（默认边框）、`--color-bg-page`（触发底）、`--color-bg-card`（卡片底）、`--color-error-normal`（失败态）、`--color-text-primary`、`--color-text-secondary`、`--color-text-disable`、`--radius-4`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（拖入底），已统一为 `--color-primary-bg`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 卡片/按钮 hover |
| active（点击反馈） | 按下加深 |
| 键盘 | `Enter`/`Space` 触发选择 |
| loading | 上传中 progress（回指总纲） |
| error | 失败态 `status="error"`（见矩阵） |

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
| `accept` | `string` | `-` | **antd 同名同值**：接受类型（如 `.jpg,.png`） |
| `multiple` | `boolean` | `false` | **antd 同名同值**：多文件 |
| `listType` | `'text' \| 'picture' \| 'picture-card'` | `'text'` | **antd 同名同值**：列表样式 |
| `maxCount` | `number` | `-` | **antd 同名同值**：数量上限 |
| `fileList` | `UploadFile[]` | `-` | **antd 同名同值**：受控文件列表 |
| `defaultFileList` | `UploadFile[]` | `-` | **antd 别名**，非受控默认列表 |
| `beforeUpload` | `(file) => boolean \| Promise` | `-` | **antd 同名同义**：上传前校验 |
| `onChange` | `({ fileList, file }) => void` | `-` | 列表变化回调 |
| `disabled` | `boolean` | `false` | 禁用 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `fileList !== undefined` 时受控，列表变化经 `onChange({ fileList, file })` 通知外部；否则内部维护 `defaultFileList`。
- `beforeUpload` 返回 `false` 阻止上传，用于前端预校验（大小/类型）。

### 事件 / 键盘
- 触发区 `Enter`/`Space` 打开文件选择；拖拽区支持 drop 事件。
- 文件项提供删除、重试（失败态）；进度由 `onProgress` 驱动进度条。

---

## 代码示例

```html
<Upload beforeUpload={checkSize} onChange={onChange}>
  <Button>选择文件</Button>
</Upload>
<Upload listType="picture-card" maxCount={1} accept="image/*" />
<Upload.Dragger multiple onChange={onChange}>拖拽文件到此</Upload.Dragger>
```

---

## 文件映射

- Preview 文件：`upload-preview.html`
- 组件目录：`../../../../frontend/components/Upload/index.html`
- 令牌文件：`../../../tokens/tokens.css`
