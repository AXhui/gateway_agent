---
name: B_Eg71AlertBar
version: 1.0.0
description: EG71 页内业务横幅（业务组件）：S_Alert 封装的引导/异常横幅，标题可选、可带关闭钮
---

# 页内业务横幅 · B_Eg71AlertBar

## 1. 描述

**这是什么**：EG71 页内业务横幅，`S_Alert` 的业务封装。`tone:'info'` 呈引导态（如扫描确认页顶部「仅能发现 OTAA 设备」引导），`tone:'error'` 呈异常态（如扫描配置页 AppKey 导入 4 种失败提示）。标题可选、正文必填；可带关闭钮，关闭时隐藏横幅并冒泡 `eg71-alert-close` 通知宿主。

**不是什么**：不是全局导航级提示条（扫描中常驻、跨页跳转的「正在LoRaWAN扫描中」用 `bc-eg71-scan-banner`）；不是 Toast 轻提示（非阻断式反馈用 `ms-message-stack`）。

**归属产品线**：`eg71`（Milesight LoRaWAN 网关）。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Alert` | `ms-alert` / `ms-alert--info` / `ms-alert--error` / `ms-alert-icon` / `ms-alert-body(-title/-desc)` | 横幅视觉骨架与语义色 |
| `S_Icon` | `ico('info'/'warn', 16)` / `ico('close', 16)` | 语义图标与关闭图标（16px 阶梯） |
| `S_Button` | `ms-btn`（仅交互语义，实际为裸 button + 结构类） | 关闭钮（24px 热区） |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tone` | `'info' \| 'error'` | `'info'` | 引导 / 异常语义 |
| `ctx.title` | string | 无 | 可选标题，未传不渲染标题行 |
| `ctx.desc` | string | — | **必填正文；为空整体不渲染**（返回 `''`） |
| `ctx.closable` | boolean | `false` | 是否渲染关闭钮 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-alert-close` | `{}` | 点击关闭钮（横幅已就地 `hidden`） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 引导态 | `tone:'info'` | `ms-alert--info`（primary-bg 底 + info 图标） |
| 异常态 | `tone:'error'` | `ms-alert--error`（error 语义底 + warn 图标） |
| 关闭 | 点击 `[data-alert-close]` | `.bc-eg71-alert-bar` 加 `hidden` 属性，冒泡事件 |
| 关闭钮 hover | 鼠标悬停 | 图标色 `--color-icon-secondary` → `--color-icon-normal` |

## 4. 场景（Scenarios）

**何时用**：页内需要常驻一段引导或异常说明时——扫描确认页顶部 OTAA 引导横幅、AppKey 导入失败（size / count / no-header / invalid 四场景，由宿主监听 `eg71-scan-import-error` 后以本组件渲染文案）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 扫描中全局常驻、可点击跳转的提示条 | `bc-eg71-scan-banner` |
| 非阻断轻量 Toast | `ms-message-stack` + `ms-message` |
| 弹窗内的警示说明 | `bc-eg71-modal`（`confirmKeyword` 场景自带 alert 行） |

## 5. Token（设计令牌）

视觉全部继承 `S_Alert`（`ms-alert--*`）。本组件新增结构类仅引用：
- `--spacing-24`（关闭钮 24×24 热区）
- `--color-icon-secondary` / `--color-icon-normal`（关闭钮图标色与 hover 色）
- `--radius-4`（关闭钮热区圆角）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。运行时依赖 `alert` / `icon`。结构类 `.bc-eg71-alert-bar` / `.bc-eg71-alert-close`（`library/business.css`），纯布局/热区编排，无视觉常量。

## 7. 示例（Examples）

```js
// 引导横幅（扫描确认页顶部，03-ued §6.7 文案）
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-alert-bar'].render({
  tone: 'info',
  desc: '扫描仅能发现OTAA入网模式的设备，请核对 DevEUI是否与您的设备一致。若长时间未发现目标设备，请确认设备处于开机状态，缩短设备与网关距离并重启设备后再试。'
});
B['bc-eg71-alert-bar'].bind(app);

// 导入失败异常横幅（可关闭）
B['bc-eg71-alert-bar'].render({ tone: 'error', desc: '文件超过1M无法上传，请重新上传文件', closable: true });

app.addEventListener('eg71-alert-close', e => { /* 宿主记录横幅已关 */ });
```

## 8. 版本（Version）

见 frontmatter `version:`。
