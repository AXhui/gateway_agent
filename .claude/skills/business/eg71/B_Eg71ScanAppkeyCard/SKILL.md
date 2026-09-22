---
name: B_Eg71ScanAppkeyCard
version: 1.0.1
description: EG71 扫描 Key 配置卡（业务组件）：Milesight 默认 Key 勾选 + 自定义 AppKey 列表（添加/CSV 导入/搜索/危险清空）+ N/1000 容量计数
---

# 扫描 Key 配置卡 · B_Eg71ScanAppkeyCard

## 1. 描述

**这是什么**：EG71 LoRaWAN 扫描配置页的单卡片：① 「Milesight 默认 AppKey」勾选框（默认勾选）② 导入文件（csv/xlsx）③ 危险描边「清空」（仅清自定义 Key、无确认弹窗、不动勾选框）④ 模糊搜索 ⑤ 自定义 AppKey 逐条添加区（上限 1000，N/1000 计数）。任何勾选/增/删/搜索变更统一冒泡 `eg71-scan-keys-change`，其 `canStart`（= 默认勾选 || 自定义非空）驱动页脚【开始扫描】置灰（交互 #6）。

**不是什么**：不做【开始扫描/取消】按钮（页脚走 `bc-eg71-form-footer`）；导入的 4 种失败横幅不在本卡内渲染——本卡只冒泡 `eg71-scan-import-error`，由宿主以 `bc-eg71-alert-bar` 呈现（横幅形态归 AlertBar，职责分离）。xlsx 为二进制格式，前端无解析库，demo 语义按「文件无效」冒泡，真实解析由宿主接入。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Checkbox` | `ms-checkbox` / `ms-checkbox-box` | Milesight 默认 Key 勾选 |
| `S_Button` | `ms-btn` / `ms-btn--danger` | 导入文件 / 清空（危险描边）/ 添加 / 行删除 |
| `S_Upload` | `ms-upload` + `input[type=file]` | 隐藏的文件选择（accept=.csv,.xlsx） |
| `S_Input` | `ms-input` | 搜索框 / 逐条添加输入（maxlength 32） |
| `S_Tag` | `ms-tag--round ms-tag--outline` | 头部 `N/1000` 容量计数 |
| `S_Icon` | `ico('download'/'trash'/'search'/'plus'/'lorawan', 16|32)` | 操作与空态图标（阶梯 16/32） |
| `S_Empty` | `ms-empty` / `ms-empty-illu` / `ms-empty-text` | 暂无自定义 Key 空态 |
| `S_Card` | `ms-card` / `ms-card-body` | 卡片容器 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.keys` | string[] | `[]` | 自定义 AppKey 列表（32 位十六进制） |
| `ctx.maxKeys` | number | `1000` | 自定义 + 导入合计上限 |
| `ctx.keyword` | string | `''` | 搜索初值 |
| `ctx.defaultKeyChecked` | boolean | `true` | 默认 Key 勾选初值 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-scan-keys-change` | `{ keys, defaultKeyChecked, canStart }` | 勾选切换 / 增 / 删 / 清空 / 搜索输入 / 导入成功 |
| `eg71-scan-import-error` | `{ case:'size'\|'count'\|'no-header'\|'invalid', remaining? }` | 导入失败（count 场景带 remaining = 剩余可添加数） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 空列表 | `keys.length === 0` | 列表 `hidden`，`.bc-eg71-scan-key-empty`（lorawan 32 图标）显示；「清空」disabled |
| 搜索过滤 | 搜索框输入 | 不匹配行 `hidden`（就地过滤，不改 keys 数据） |
| 添加校验失败 | 空 / 非法 hex / 重复 / 超限 | `.bc-eg71-form-item-msg--error` 行内错误文案 |
| 文件类型/大小非法 | 后缀非 csv·xlsx / >1MB | 冒泡 `invalid` / `size`，不进入解析 |
| 表头缺失 | 首行不含 `appkey` | 冒泡 `no-header` |
| 数量超限 | 现有 + 新增 > maxKeys | 冒泡 `count`（带 remaining），全部不导入 |
| 行删除 | 点击行尾删除钮（容器级委托） | 行移除 + 计数同步 |

> 说明：文件大小上限 1MB 以 03-ued §6.8 / PRD §3.1.1 文案「文件超过1M无法上传」为准，校验与文案同口径。

## 4. 场景（Scenarios）

**何时用**：LoRaWAN 扫描配置页（新增二级页）唯一的配置卡；扫描中重新进入时同卡复用（增删 Key，【开始扫描】文案切【应用】由页脚处理）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 手动添加单台设备的 AppKey 输入 | `bc-eg71-activation-card` |
| 设备编辑页激活设置（含 ABP） | `bc-eg71-device-form` |
| 导入失败文案展示 | `bc-eg71-alert-bar`（监听本组件的 import-error） |

## 5. Token（设计令牌）

- 行底/空态：`--color-fill-base-normal`；删除钮图标 `--color-icon-secondary`（hover `--color-icon-normal`）
- Key 文本等宽：`--font-mono`
- 间距：`--spacing-12`（卡体纵向 gap）/ `--spacing-8`（行间/行内）/ `--spacing-24`（删除钮 24px 热区）
- 圆角：`--radius-4`；搜索宽 260px（Figma 结构宽，见 business.css 注记）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `checkbox` / `button` / `upload` / `input` / `tag` / `icon` / `empty`。结构类 `.bc-eg71-scan-appkey-card` / `.bc-eg71-scan-key-body/-actions/-search/-head/-list/-row/-text/-del/-empty/-addrow`（`library/business.css`）；msg 复用 `bc-eg71-form-item-msg`。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-scan-appkey-card'].render({ keys: [], maxKeys: 1000 });
B['bc-eg71-scan-appkey-card'].bind(app);

app.addEventListener('eg71-scan-keys-change', e => {
  startBtn.disabled = !e.detail.canStart; // 未勾默认且无自定义 → 置灰（交互 #6）
});
app.addEventListener('eg71-scan-import-error', e => {
  const TEXT = {
    size: '文件超过1M无法上传，请重新上传文件',
    count: `AppKey数量超过1000条，当前仅能再添加${e.detail.remaining}条，请重新上传文件`,
    'no-header': '文件内没有找到AppKey，请重新上传文件',
    invalid: '存在非法AppKey，请重新上传文件'
  };
  banner.innerHTML = B['bc-eg71-alert-bar'].render({ tone: 'error', desc: TEXT[e.detail.case], closable: true });
  B['bc-eg71-alert-bar'].bind(banner);
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
