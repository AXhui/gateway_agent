# Empty · 空状态

> **分类**：数据展示  
> **Figma**：1478-137754

---

## 概述

无数据展示，提供默认插画与简单插画两种风格。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `image` | `ReactNode | string` | `default` | 图片 |
| `description` | `ReactNode` | `'暂无数据'` | 描述 |
| `imageStyle` | `CSSProperties` | `-` | 图片样式 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-auxiliary`
- `--color-bg-page`


---

## 交互规则

### 设计指引

区别「无数据」与「无权限」「加载失败」，文案要明确。

### 交互 Skill

【Empty 交互 Skill】
使用场景：列表/表格无数据、搜索无结果、权限不足无内容。

样式：
- image 区：默认 Milesight IOT 空状态插图，高 100px；搜索无结果用"放大镜+？"图
- description：12-14px，color --color-text-auxiliary
- extra（操作区）：主操作 Button primary（如"立即创建"）

个性化：
- 无权限：图 + "暂无权限" + 联系管理员 Link
- 搜索无结果：图 + "未找到相关内容" + "清除筛选" Button default
- 加载错误：图 + 错误说明 + "重试" Button default


---

## 代码示例

```html
<Empty image="default" description="暂无数据" imageStyle="-" />
```

---

## 文件映射

- Preview 文件：`empty-preview.html`
- 组件目录：`frontend/components/Empty/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
