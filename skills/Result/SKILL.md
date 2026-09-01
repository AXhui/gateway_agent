# Result · 结果

> **分类**：反馈  
> **Figma**：1439-29101

---

## 概述

页面级结果反馈，含成功/失败、403/404/500、信息状态。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | `'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'` | `'info'` | 状态 |
| `title` | `ReactNode` | `-` | 主文案 |
| `subTitle` | `ReactNode` | `-` | 副文案 |
| `extra` | `ReactNode` | `-` | 操作 |
| `icon` | `ReactNode` | `-` | 自定义图标 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-success-normal`
- `--color-error-normal`


---

## 交互规则

### 设计指引

必须含「下一步动作」按钮，避免用户走入死胡同。

### 交互 Skill

【Result 交互 Skill】
status: success / error / warn / info / 403 / 404 / 500。

结构：大图/icon → 标题（H2）→ 描述（14px --color-text-secondary）→ extra 操作区。

使用场景：
- success：表单提交成功，extra="查看详情" primary + "返回列表" default
- error/500：接口错误，extra="重试" primary + "联系支持" link
- 403：无权限，extra="申请权限" primary
- 404：页面不存在，extra="返回首页" primary

禁止：不在弹窗（Modal/Drawer）内用 Result；Result 是全页状态，占用整个 Content 区。
404/500 页面需包含 Layout（保持侧边栏导航，用户不迷路）。


---

## 代码示例

```html
<Result status="info" title="-" subTitle="-" />
```

---

## 文件映射

- Preview 文件：`result-preview.html`
- 组件目录：`frontend/components/Result/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
