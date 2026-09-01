/* ==========================================================================
   L2 · 基础组件注册表 (Atom Registry)
   --------------------------------------------------------------------------
   数据来源：milesight-iot-web-doc.html 内嵌的 COMPONENTS 元数据（63 项）
            + Table（按文档 .api 表格规格补齐，IoT 控制台强依赖）
   implemented = true 表示已在 library/base.css 完成令牌化封装，可被业务层调用。
   ========================================================================== */
window.MS_BASE_COMPONENTS = [
 {
  "id": "alert",
  "name": "Alert",
  "cn": "警告提示",
  "cat": "反馈",
  "figma": "1432-54120",
  "summary": "页内常驻警告条，4 种状态 + 可关闭 + 可带描述/动作。",
  "guidance": "页面级提示用 Alert；瞬时反馈用 Message。",
  "props": [
   {
    "name": "type",
    "type": "'info' | 'success' | 'warning' | 'error'",
    "default": "'info'",
    "desc": "类型"
   },
   {
    "name": "message",
    "type": "ReactNode",
    "default": "-",
    "desc": "主标题"
   },
   {
    "name": "description",
    "type": "ReactNode",
    "default": "-",
    "desc": "详细描述"
   },
   {
    "name": "closable",
    "type": "boolean",
    "default": "false",
    "desc": "可关闭"
   },
   {
    "name": "showIcon",
    "type": "boolean",
    "default": "false",
    "desc": "显示图标"
   }
  ],
  "tokens": [
   "--color-success-normal",
   "--color-warm-normaling",
   "--color-error-normal",
   "--color-primary-normal"
  ],
  "skill": "【Alert 交互 Skill】\ntype: success / info / warn / error，对应 icon 和颜色语义 token。\n\n交互：\n- showIcon=true（推荐）：左侧 icon 增强语义\n- closable=true：右侧 × 关闭，fade-out 200ms，onClose 回调\n- banner=true：撑满父容器宽度，无圆角，用于页面级全局提示\n- action：右侧自定义操作区（如\"查看详情\"Link）\n\n层级优先级：error > warn > info > success；同类型合并为一条（不叠加多条）。\n持久性：操作类提示（error/warn）不自动消失；临时反馈用 Message。",
  "implemented": true
 },
 {
  "id": "drawer",
  "name": "Drawer",
  "cn": "抽屉",
  "cat": "反馈",
  "figma": "1445-39010",
  "summary": "侧边滑入面板，承载详情、表单、配置等中等复杂度内容。",
  "guidance": "详情查看用 Drawer 不打断主流程；表单 >5 字段也用 Drawer。",
  "props": [
   {
    "name": "open",
    "type": "boolean",
    "default": "false",
    "desc": "开启"
   },
   {
    "name": "placement",
    "type": "'top' | 'right' | 'bottom' | 'left'",
    "default": "'right'",
    "desc": "方向"
   },
   {
    "name": "size",
    "type": "'default' | 'large' | number",
    "default": "'default'",
    "desc": "尺寸"
   },
   {
    "name": "onClose",
    "type": "() => void",
    "default": "-",
    "desc": "关闭回调"
   },
   {
    "name": "footer",
    "type": "ReactNode",
    "default": "-",
    "desc": "底部"
   }
  ],
  "tokens": [
   "var(--color-bg-card)",
   "--shadow-3",
   "--color-divider-base-1"
  ],
  "skill": "【Drawer 交互 Skill】\nplacement: right（默认，表单/详情）/ left / top / bottom。\n\n交互：\n- 打开：slide + fade，width/height transition 240ms easing-standard\n- 关闭：点击遮罩 or × or Esc；有未保存修改时 Popconfirm 确认\n- 遮罩：bg rgba(0,0,0,0.45)，click 关闭\n\n宽度规范：\n- 详情 Drawer：width 480px\n- 表单 Drawer：width 520px\n- 复杂表单：width 640px，超过改用独立页面\n\nFooter：fixed 在 Drawer 底部，Divider 分隔，Space 放\"取消+提交\"按钮。\n禁止：不在 Drawer 内嵌套 Modal；Drawer 层级最多 2 层。",
  "implemented": true
 },
 {
  "id": "message",
  "name": "Message",
  "cn": "全局提示",
  "cat": "反馈",
  "figma": "1430-44835",
  "summary": "顶部居中的瞬时全局提示，3 秒自动关闭。",
  "guidance": "操作结果反馈首选；不要承载需用户阅读 >5 秒的内容。",
  "props": [
   {
    "name": "type",
    "type": "'success' | 'error' | 'info' | 'warning' | 'loading'",
    "default": "'info'",
    "desc": "类型"
   },
   {
    "name": "content",
    "type": "ReactNode",
    "default": "-",
    "desc": "内容"
   },
   {
    "name": "duration",
    "type": "number",
    "default": "3",
    "desc": "持续时间(秒)"
   },
   {
    "name": "onClose",
    "type": "() => void",
    "default": "-",
    "desc": "关闭回调"
   }
  ],
  "tokens": [
   "--shadow-2",
   "--color-success-normal",
   "--color-error-normal"
  ],
  "skill": "【Message 交互 Skill】\nAPI 调用：message.success / error / warn / info / loading()。\n\n行为：\n- 位置：页面顶部居中，z-index 9999\n- 出现：fade + slideDown 200ms\n- 持续：默认 3s 后自动消失（loading 需手动 close）\n- 多条：垂直堆叠，先进先出\n\n使用场景：\n- 操作成功：message.success('保存成功')，不用 Notification\n- 接口报错：message.error(err.message)\n- 异步操作：message.loading('提交中...')，完成后 .then(close).then(success)\n\n禁止：不用 Message 展示超过 20 字的内容；不用于需要用户操作的提示（用 Modal/Notification）。",
  "implemented": true
 },
 {
  "id": "modal",
  "name": "Modal",
  "cn": "对话框",
  "cat": "反馈",
  "figma": "1430-37845",
  "summary": "模态对话框，承载需用户聚焦的确认/输入/详情。",
  "guidance": "二次确认必弹 Modal；表单 >5 字段改用 Drawer。",
  "props": [
   {
    "name": "open",
    "type": "boolean",
    "default": "false",
    "desc": "开启"
   },
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "标题"
   },
   {
    "name": "onOk",
    "type": "() => void",
    "default": "-",
    "desc": "确定回调"
   },
   {
    "name": "onCancel",
    "type": "() => void",
    "default": "-",
    "desc": "取消回调"
   },
   {
    "name": "width",
    "type": "number | string",
    "default": "520",
    "desc": "宽度"
   },
   {
    "name": "footer",
    "type": "ReactNode | null",
    "default": "-",
    "desc": "底部"
   }
  ],
  "tokens": [
   "var(--color-bg-card)",
   "--shadow-3",
   "--color-primary-normal"
  ],
  "skill": "【Modal 交互 Skill】\n交互：\n- 打开：fade + scale(0.9→1) 200ms，遮罩 fade\n- 关闭：点击遮罩（maskClosable 默认true）/ × / Esc / onCancel\n- 有未保存修改：关闭前 Popconfirm 二次确认\n\n按钮规则：\n- 主操作（onOk）：Button primary，操作中 loading=true\n- 取消（onCancel）：Button default\n- 危险操作：okButtonProps={{ danger:true }}，且 okText=\"确认删除\"（明确写操作对象）\n\n宽度：\n- 小确认框：width 400px\n- 标准表单：width 520px\n- 大内容：width 720px，超过用 Drawer\n\nfooter=null + 自定义 footer：用于非标准按钮布局。\n禁止：不在 Modal 内再弹 Modal；Modal 内 Form 需独立 form 实例。",
  "implemented": true
 },
 {
  "id": "notification",
  "name": "Notification",
  "cn": "通知提醒框",
  "cat": "反馈",
  "figma": "1432-49994",
  "summary": "右上角的通知卡片，可承载标题、详细描述、操作按钮。",
  "guidance": "承载详细描述时用 Notification；只显示一句话用 Message。",
  "props": [
   {
    "name": "type",
    "type": "'success' | 'info' | 'warning' | 'error'",
    "default": "'info'",
    "desc": "类型"
   },
   {
    "name": "message",
    "type": "ReactNode",
    "default": "-",
    "desc": "标题"
   },
   {
    "name": "description",
    "type": "ReactNode",
    "default": "-",
    "desc": "详细"
   },
   {
    "name": "placement",
    "type": "4 角",
    "default": "'topRight'",
    "desc": "位置"
   },
   {
    "name": "duration",
    "type": "number",
    "default": "4.5",
    "desc": "持续时间"
   }
  ],
  "tokens": [
   "--shadow-2",
   "var(--color-bg-card)",
   "--color-success-normal"
  ],
  "skill": "【Notification 交互 Skill】\nAPI：notification.open({ message, description, icon, btn, duration, placement })。\n\n与 Message 区别：Notification 有标题+描述+操作按钮，适合需要用户阅读和操作的提醒。\n\n位置：topRight（默认）/ topLeft / bottomRight / bottomLeft。\nduration：默认 4.5s；需用户操作时设 duration=0（不自动关闭）。\n\n使用场景：\n- 系统通知（新消息/任务完成）：带 icon + 描述 + \"查看\"Link\n- 后台任务完成：duration=0，btn=[\"查看结果\"，\"关闭\"]\n- 异常告警：icon=<AlertTriangle color=--color-error-normal />\n\n禁止：不同时弹出 3 条以上；不用于操作即时反馈（用 Message）。",
  "implemented": true
 },
 {
  "id": "popconfirm",
  "name": "Popconfirm",
  "cn": "气泡确认框",
  "cat": "反馈",
  "figma": "1439-12926",
  "summary": "轻量级二次确认，从触发元素弹出，不阻断主流程。",
  "guidance": "删除等不可逆操作必须使用；非破坏操作直接执行无需确认。",
  "props": [
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "标题"
   },
   {
    "name": "onConfirm",
    "type": "() => void",
    "default": "-",
    "desc": "确认回调"
   },
   {
    "name": "okText",
    "type": "string",
    "default": "'确定'",
    "desc": "确认文案"
   },
   {
    "name": "cancelText",
    "type": "string",
    "default": "'取消'",
    "desc": "取消文案"
   },
   {
    "name": "placement",
    "type": "12 种方位",
    "default": "'top'",
    "desc": "位置"
   }
  ],
  "tokens": [
   "--color-warm-normaling",
   "--shadow-2",
   "var(--color-bg-card)"
  ],
  "skill": "【Popconfirm 交互 Skill】\n触发：click 触发元素（默认 click），展开 fade 200ms，placement bottomLeft。\n\n结构：问号 icon + 文字 + [取消][确认] 按钮。\n\n使用规则：\n- 危险操作必须用 Popconfirm（删除/重置/停用）\n- title 明确说明后果（\"确认删除设备「xxx」？删除后不可恢复\"）\n- onConfirm：执行操作，确认按钮 loading=true，完成后 message.success\n- onCancel：关闭面板，不执行任何操作\n\n样式：\n- 确认按钮：okButtonProps={{ danger:true }}，danger 红色\n- 取消按钮：default\n\n禁止：轻量操作不用 Popconfirm（Toggle Switch / 切换状态）；超过 2 个操作用 Modal。",
  "implemented": true
 },
 {
  "id": "progress",
  "name": "Progress",
  "cn": "进度条",
  "cat": "反馈",
  "figma": "1445-34912",
  "summary": "任务进度展示，含线性、圆形、仪表盘三种形态。",
  "guidance": "耗时 >2 秒任务必须显示 Progress；不确定时长用 Spin。",
  "props": [
   {
    "name": "percent",
    "type": "number",
    "default": "0",
    "desc": "进度（0-100）"
   },
   {
    "name": "type",
    "type": "'line' | 'circle' | 'dashboard'",
    "default": "'line'",
    "desc": "类型"
   },
   {
    "name": "status",
    "type": "'success' | 'exception' | 'normal' | 'active'",
    "default": "'normal'",
    "desc": "状态"
   },
   {
    "name": "strokeColor",
    "type": "string | object",
    "default": "-",
    "desc": "颜色"
   },
   {
    "name": "showInfo",
    "type": "boolean",
    "default": "true",
    "desc": "显示文字"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-success-normal",
   "--color-error-normal"
  ],
  "skill": "【Progress 交互 Skill】\ntype: line（默认）/ circle / dashboard。\n\n状态颜色：\n- normal：--color-primary-normal（绿色）\n- success（percent=100）：--color-success-normal，icon CheckCircle\n- exception（status='exception'）：--color-error-normal，icon XCircle\n- active（status='active'）：进度条内 shimmer 动画\n\n交互：\n- 上传/任务进度：实时更新 percent，动画 transition 400ms\n- 步骤进度：circle 类型在 Steps 卡片中心显示，直径 80px\n\nstrokeWidth：line 8px（默认），circle 8px；文字 format prop 自定义（如\"剩余 {remain}s\"）。\n禁止：不用 Progress 模拟 Loading（用 Spin/Skeleton）。",
  "implemented": true
 },
 {
  "id": "result",
  "name": "Result",
  "cn": "结果",
  "cat": "反馈",
  "figma": "1439-29101",
  "summary": "页面级结果反馈，含成功/失败、403/404/500、信息状态。",
  "guidance": "必须含「下一步动作」按钮，避免用户走入死胡同。",
  "props": [
   {
    "name": "status",
    "type": "'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'",
    "default": "'info'",
    "desc": "状态"
   },
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "主文案"
   },
   {
    "name": "subTitle",
    "type": "ReactNode",
    "default": "-",
    "desc": "副文案"
   },
   {
    "name": "extra",
    "type": "ReactNode",
    "default": "-",
    "desc": "操作"
   },
   {
    "name": "icon",
    "type": "ReactNode",
    "default": "-",
    "desc": "自定义图标"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-success-normal",
   "--color-error-normal"
  ],
  "skill": "【Result 交互 Skill】\nstatus: success / error / warn / info / 403 / 404 / 500。\n\n结构：大图/icon → 标题（H2）→ 描述（14px --color-text-secondary）→ extra 操作区。\n\n使用场景：\n- success：表单提交成功，extra=\"查看详情\" primary + \"返回列表\" default\n- error/500：接口错误，extra=\"重试\" primary + \"联系支持\" link\n- 403：无权限，extra=\"申请权限\" primary\n- 404：页面不存在，extra=\"返回首页\" primary\n\n禁止：不在弹窗（Modal/Drawer）内用 Result；Result 是全页状态，占用整个 Content 区。\n404/500 页面需包含 Layout（保持侧边栏导航，用户不迷路）。",
  "implemented": true
 },
 {
  "id": "skeleton",
  "name": "Skeleton",
  "cn": "骨架屏",
  "cat": "反馈",
  "figma": "1439-19991",
  "summary": "加载占位，还原页面骨架，减少首屏空白感。",
  "guidance": "首屏加载 >500ms 必须用 Skeleton 而非 Spin。",
  "props": [
   {
    "name": "active",
    "type": "boolean",
    "default": "false",
    "desc": "动画"
   },
   {
    "name": "avatar",
    "type": "boolean | object",
    "default": "false",
    "desc": "含头像"
   },
   {
    "name": "paragraph",
    "type": "boolean | object",
    "default": "true",
    "desc": "段落"
   },
   {
    "name": "loading",
    "type": "boolean",
    "default": "true",
    "desc": "加载中"
   },
   {
    "name": "round",
    "type": "boolean",
    "default": "false",
    "desc": "圆角"
   }
  ],
  "tokens": [
   "--color-bg-hover",
   "--color-bg-page"
  ],
  "skill": "【Skeleton 交互 Skill】\n使用时机：首次加载（无缓存数据）时显示，加载完成后 active=false 切换为真实内容，transition 200ms。\n\n配置：\n- avatar：圆形占位（列表头像）\n- paragraph：多行文字占位，rows 控制行数，width 数组精细控制每行宽度\n- Skeleton.Button/Input/Image：针对具体组件的占位符\n\n动画：active=true 时 shimmer 扫光动画（left→right，1.5s 循环）。\n\n禁止：\n- 不在 Spin 和 Skeleton 同时使用，二选一\n- 不超过 3 屏的骨架屏（超长列表用虚拟滚动 + 分页）\n- 内容重新加载（已有数据）用 Spin overlay，不用 Skeleton",
  "implemented": true
 },
 {
  "id": "spin",
  "name": "Spin",
  "cn": "加载中",
  "cat": "反馈",
  "figma": "1424-160894",
  "summary": "加载指示器，可包裹内容产生遮罩 loading。",
  "guidance": "短暂操作设 delay={300} 避免闪烁；长任务首选 Progress。",
  "props": [
   {
    "name": "spinning",
    "type": "boolean",
    "default": "true",
    "desc": "加载中"
   },
   {
    "name": "tip",
    "type": "ReactNode",
    "default": "-",
    "desc": "提示文字"
   },
   {
    "name": "size",
    "type": "'small' | 'default' | 'large'",
    "default": "'default'",
    "desc": "尺寸"
   },
   {
    "name": "indicator",
    "type": "ReactNode",
    "default": "-",
    "desc": "自定义指示器"
   },
   {
    "name": "delay",
    "type": "number",
    "default": "-",
    "desc": "延迟显示(ms)"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "var(--color-bg-card)"
  ],
  "skill": "【Spin 交互 Skill】\nspinning=true：显示加载态，内容区 opacity 0.4 + pointer-events none（避免误操作）。\n\n使用场景：\n- 局部刷新（表格重新请求）：Spin 包裹 Table，spinning={loading}\n- 全页加载：Spin 居中 delay=300ms（避免闪烁）\n- 按钮操作中：Button loading=true（不用 Spin 包裹 Button）\n\nsize: small（14px）/ default（20px）/ large（32px）。\ntip：loading 下方文字说明，color --color-text-auxiliary，font 12px。\n\n禁止：Spin 不叠加 Skeleton；Spin 不超过 3 层嵌套（父有 Spin 子不再加）。",
  "implemented": true
 },
 {
  "id": "button",
  "name": "Button",
  "cn": "按钮",
  "cat": "基础",
  "figma": "1294-844",
  "summary": "触发即时操作的按钮。提供 5 种类型、3 种尺寸，覆盖主要操作、次要操作、文本操作三种场景。",
  "guidance": "主要操作仅一个，使用 type=\"primary\"；批量操作用 default；危险操作搭配确认弹窗。",
  "props": [
   {
    "name": "type",
    "type": "'primary' | 'default' | 'dashed' | 'link' | 'text'",
    "default": "'default'",
    "desc": "按钮类型"
   },
   {
    "name": "size",
    "type": "'large' | 'middle' | 'small'",
    "default": "'middle'",
    "desc": "按钮尺寸"
   },
   {
    "name": "loading",
    "type": "boolean",
    "default": "false",
    "desc": "加载状态"
   },
   {
    "name": "block",
    "type": "boolean",
    "default": "false",
    "desc": "撑满容器"
   },
   {
    "name": "disabled",
    "type": "boolean",
    "default": "false",
    "desc": "禁用状态"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--radius-4",
   "--spacing-12",
   "--color-text-constant-normal"
  ],
  "skill": "【Button 交互 Skill】\n交互状态：\n- default: border 1px --color-border-base, bg var(--color-bg-card), text --color-text-primary\n- hover: border-color --color-primary-normal, text --color-primary-normal, bg --color-primary-bg; transition 160ms\n- active: bg --color-primary-active（primary类型）/ bg --color-bg-hover（default类型）\n- focus-visible: outline 2px --color-border-primary-normal, outline-offset 2px\n- loading: 左侧 Spin icon 替换 iconLeft，disabled pointer-events none\n- disabled: opacity 0.4, cursor not-allowed\n\n尺寸规则：\n- sm: height 28px, padding 0 10px, font 12px\n- md: height 36px, padding 0 16px, font 14px（默认）\n- lg: height 44px, padding 0 20px, font 16px\n\n类型优先级：一屏只允许一个 primary Button；破坏性操作用 type=default + status=error + Popconfirm 二次确认；批量操作区用 default/dashed；纯文字跳转用 link；无边框操作用 text。\n\n危险操作流程：点击 → Popconfirm 弹出 → 确认后执行，执行期间按钮 loading=true。\n\n空态兜底：操作无权限时 disabled=true + Tooltip 说明原因。",
  "implemented": true
 },
 {
  "id": "divider",
  "name": "Divider",
  "cn": "分割线",
  "cat": "基础",
  "figma": "1303-6825",
  "summary": "区隔内容的分割线，支持水平/垂直、虚实线、带文字三类形态。",
  "guidance": "列表项之间不要使用 Divider，使用列表自身的 border-bottom 即可。",
  "props": [
   {
    "name": "type",
    "type": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "desc": "方向"
   },
   {
    "name": "dashed",
    "type": "boolean",
    "default": "false",
    "desc": "虚线"
   },
   {
    "name": "orientation",
    "type": "'left' | 'right' | 'center'",
    "default": "'center'",
    "desc": "文字位置"
   },
   {
    "name": "plain",
    "type": "boolean",
    "default": "false",
    "desc": "普通文字（非标题）"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-text-auxiliary"
  ],
  "skill": "【Divider 交互 Skill】\n无交互，纯视觉分隔。\n\n使用规则：\n- 水平分割线：border-top 1px --color-divider-base-1（卡片内分组）/ --color-border-base（区块间）\n- 有文字时：文字居中，颜色 --color-text-auxiliary，font 12px；左对齐用于列表分组标题\n- vertical 方向：height 1em，margin 0 --spacing-8，用于行内按钮组分隔\n- 表单 fieldset 间距用 Divider + --spacing-20 margin，不用额外 padding",
  "implemented": true
 },
 {
  "id": "icon",
  "name": "Icon",
  "cn": "图标",
  "cat": "基础",
  "figma": "-",
  "summary": "基于 Lucide 图标集的统一图标组件，size 默认跟随父级字号。",
  "guidance": "图标始终使用 currentColor 继承文字颜色，避免硬编码。",
  "props": [
   {
    "name": "name",
    "type": "string",
    "default": "-",
    "desc": "图标名称"
   },
   {
    "name": "size",
    "type": "number",
    "default": "16",
    "desc": "图标尺寸（px）"
   },
   {
    "name": "color",
    "type": "string",
    "default": "'currentColor'",
    "desc": "图标颜色"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "--color-primary-normal"
  ],
  "skill": "【Icon 交互 Skill】\n使用规则：\n- 始终用 currentColor，不写 color prop，由父级文字颜色继承\n- 配合文字时间距 --spacing-4（4px）\n- 可交互图标（如关闭按钮）：hover color --color-text-primary → --color-primary-normal，需 cursor pointer\n- 纯装饰性图标：aria-hidden=\"true\"\n- size 默认 16，正文内 14，大标题区 20/24\n- 状态图标：success=CheckCircle, error=XCircle, warn=AlertTriangle, info=InfoCircle，颜色引用对应语义 token",
  "implemented": true
 },
 {
  "id": "logo",
  "name": "Logo",
  "cn": "品牌标识",
  "cat": "基础",
  "figma": "175-15304",
  "summary": "Milesight IOT 品牌 Logo 组件，提供完整版与紧凑版两种 variant 与白色反色版本。",
  "guidance": "深色 Header 一律使用 color=\"white\"；纸面文档使用 brand。",
  "props": [
   {
    "name": "variant",
    "type": "'full' | 'compact'",
    "default": "'full'",
    "desc": "完整或紧凑"
   },
   {
    "name": "size",
    "type": "number",
    "default": "32",
    "desc": "高度（px）"
   },
   {
    "name": "color",
    "type": "'brand' | 'white'",
    "default": "'brand'",
    "desc": "颜色版本"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-text-constant-normal"
  ],
  "skill": "【Logo 交互 Skill】\n变体：\n- variant=full: 82×32，含图标+文字，用于顶栏/登录页\n- variant=icon: 32×32，仅图标，用于侧边栏收起态/favicon\n\n主题：\n- theme=light（默认）: 绿色图标 + 深色文字，用于白色/浅灰背景\n- theme=dark: 白色版本，用于深色背景/顶栏\n\n点击行为：始终 href=\"/\" 跳首页，无其他交互状态。\n禁止在 Logo 上加 hover 效果或 border。",
  "implemented": true
 },
 {
  "id": "typography",
  "name": "Typography",
  "cn": "排版",
  "cat": "基础",
  "figma": "1294-954",
  "summary": "文本与段落系统。提供 H1-H5 标题、四种段落、链接、行内代码等基础排版能力。",
  "guidance": "全站标题层级保持 H1 > H2 > H3 严格递进，不要跳级。",
  "props": [
   {
    "name": "level",
    "type": "1 | 2 | 3 | 4 | 5",
    "default": "1",
    "desc": "标题级别"
   },
   {
    "name": "type",
    "type": "'secondary' | 'success' | 'warning' | 'danger'",
    "default": "-",
    "desc": "文本类型"
   },
   {
    "name": "ellipsis",
    "type": "boolean | object",
    "default": "false",
    "desc": "自动省略"
   },
   {
    "name": "code",
    "type": "boolean",
    "default": "false",
    "desc": "行内代码风格"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "--color-text-secondary",
   "--color-primary-normal"
  ],
  "skill": "【Typography 交互 Skill】\n层级规则：H1(28-32px/700) > H2(20-24px/600) > H3(16-18px/600) > Body(14px/400)，严格递进不跳级。\n\n交互：\n- Link: hover text-decoration underline, color --color-primary-hover\n- ellipsis=true 时 Tooltip 展示完整内容\n- type=danger 用 --color-error-normal，type=success 用 --color-success-normal，type=secondary 用 --color-text-secondary\n\n可复制文本（code=true）：click 复制，icon 变 CheckIcon 1.5s 后恢复。\n\n响应式：H1 在 md 以下降为 24px，段落 line-height 1.6 保持可读性。",
  "implemented": true
 },
 {
  "id": "anchor",
  "name": "Anchor",
  "cn": "锚点",
  "cat": "导航",
  "figma": "1424-143764",
  "summary": "页内导航锚点，自动追踪滚动位置高亮当前章节。",
  "guidance": "超过 4 屏长度的页面建议加锚点。",
  "props": [
   {
    "name": "items",
    "type": "AnchorItem[]",
    "default": "[]",
    "desc": "锚点项"
   },
   {
    "name": "offsetTop",
    "type": "number",
    "default": "0",
    "desc": "距顶偏移"
   },
   {
    "name": "bounds",
    "type": "number",
    "default": "5",
    "desc": "判定边界"
   },
   {
    "name": "onChange",
    "type": "(activeLink: string) => void",
    "default": "-",
    "desc": "切换回调"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base"
  ],
  "skill": "【Anchor 交互 Skill】\n交互：\n- 点击：平滑滚动到目标 (scroll-behavior: smooth)，URL hash 更新\n- 激活（scroll spy）：距视口顶部 offsetTop 内的标题对应 Anchor item 高亮，color --color-primary-normal，left border 2px\n- hover: color --color-text-primary\n\n位置：固定在内容区右侧，position sticky top 80px，z-index 10。\n层级：只处理 H2/H3，H4 以下不进 Anchor。\n移动端：隐藏 Anchor，改为 ScrollTop 按钮。",
  "implemented": true
 },
 {
  "id": "back-top",
  "name": "BackTop",
  "cn": "回到顶部",
  "cat": "导航",
  "figma": "1424-144522",
  "summary": "页面右下浮动的回到顶部按钮，滚动 400px 后出现。",
  "guidance": "配合 Affix 使用；不要叠加多个浮动按钮。",
  "props": [
   {
    "name": "visibilityHeight",
    "type": "number",
    "default": "400",
    "desc": "显示阈值"
   },
   {
    "name": "duration",
    "type": "number",
    "default": "450",
    "desc": "滚动时长（ms）"
   },
   {
    "name": "onClick",
    "type": "() => void",
    "default": "-",
    "desc": "点击回调"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--shadow-2"
  ],
  "skill": "【BackTop 交互 Skill】\n交互：\n- 出现时机：页面滚动超过 visibilityHeight（默认 400px）时淡入（opacity 0→1, 200ms）\n- 点击：scroll to top，behavior smooth\n- hover：bg --color-primary-normal，color #fff，box-shadow --shadow-2\n\n位置：fixed bottom 40px right 24px，z-index 90。\n禁止与 Affix 底部操作栏重叠，需留出安全距离。",
  "implemented": true
 },
 {
  "id": "breadcrumb",
  "name": "Breadcrumb",
  "cn": "面包屑",
  "cat": "导航",
  "figma": "-",
  "summary": "显示当前页面在系统层级中的位置，支持 items 数据驱动。",
  "guidance": "层级超过 3 级使用面包屑，2 级及以内使用返回按钮。",
  "props": [
   {
    "name": "items",
    "type": "BreadcrumbItem[]",
    "default": "[]",
    "desc": "层级列表"
   },
   {
    "name": "separator",
    "type": "ReactNode",
    "default": "'/'",
    "desc": "分隔符"
   }
  ],
  "tokens": [
   "--color-text-secondary",
   "--color-text-auxiliary"
  ],
  "skill": "【Breadcrumb 交互 Skill】\n交互：\n- 非末级：hover text-decoration underline，color --color-primary-normal，cursor pointer，点击路由跳转\n- 末级：color --color-text-primary，无 hover 效果，不可点\n- 分隔符：默认 /，color --color-text-auxiliary\n\n层级规则：最多显示 4 级；超过 4 级中间层用 ... 折叠，hover 展开 Dropdown。\n配合 PageHeader 使用时放 PageHeader.breadcrumb 属性，不单独摆放。",
  "implemented": true
 },
 {
  "id": "dropdown-menu",
  "name": "DropdownMenu",
  "cn": "下拉菜单",
  "cat": "导航",
  "figma": "-",
  "summary": "操作收纳菜单，支持 hover / click / contextMenu 三种触发。",
  "guidance": "操作 ≤2 个直接展示；3-5 个用 Dropdown 收纳。",
  "props": [
   {
    "name": "trigger",
    "type": "('hover' | 'click' | 'contextMenu')[]",
    "default": "['hover']",
    "desc": "触发方式"
   },
   {
    "name": "items",
    "type": "MenuItem[]",
    "default": "[]",
    "desc": "菜单项"
   },
   {
    "name": "placement",
    "type": "'bottom' | 'bottomLeft' | 'bottomRight'",
    "default": "'bottomLeft'",
    "desc": "弹出位置"
   },
   {
    "name": "disabled",
    "type": "boolean",
    "default": "false",
    "desc": "禁用"
   }
  ],
  "tokens": [
   "var(--color-bg-card)",
   "--shadow-2",
   "--color-brand-50"
  ],
  "skill": "【DropdownMenu 交互 Skill】\ntrigger: click（默认，移动端友好）/ hover（桌面快捷）/ contextMenu（右键菜单）。\n\n交互：\n- 展开：fade + scale(0.95→1) from 触发点，200ms\n- 菜单项 hover: bg --color-bg-page\n- 危险操作项：color --color-error-normal，点击后 Popconfirm 确认\n- disabled 项：opacity 0.4，cursor not-allowed，不响应 click\n- 键盘：↑↓ 导航，Enter 确认，Esc 关闭\n\nplacement: bottomLeft（默认）/ bottomRight / topLeft / topRight，根据边界自动翻转。\n层级：z-index 1050（高于 Modal 1000 不超过 Toast 9999）。",
  "implemented": true
 },
 {
  "id": "nav-menu",
  "name": "NavMenu",
  "cn": "导航菜单",
  "cat": "导航",
  "figma": "1372-127827",
  "summary": "应用主导航，支持 inline / horizontal / vertical 三种模式。",
  "guidance": "侧边栏二级菜单不超过两层；超过则改用 Drawer。",
  "props": [
   {
    "name": "mode",
    "type": "'inline' | 'horizontal' | 'vertical'",
    "default": "'inline'",
    "desc": "模式"
   },
   {
    "name": "items",
    "type": "MenuItem[]",
    "default": "[]",
    "desc": "菜单项"
   },
   {
    "name": "selectedKeys",
    "type": "string[]",
    "default": "-",
    "desc": "选中项"
   },
   {
    "name": "openKeys",
    "type": "string[]",
    "default": "-",
    "desc": "展开项"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "var(--color-bg-card)"
  ],
  "skill": "【NavMenu 交互 Skill】\nmode=vertical（侧边栏）/ horizontal（顶栏）/ inline（嵌套展开）。\n\n状态样式：\n- 默认: color --color-text-secondary, bg transparent\n- hover: bg --color-bg-page, color --color-text-primary\n- 选中(selected): bg --color-primary-bg, color --color-primary-normal, left border 2px --color-primary-normal（vertical模式）\n- 子菜单展开: 旋转 chevron 180°, transition 240ms\n\ncollapsed 模式（vertical）：\n- 宽 56px，仅 Icon，Tooltip placement=right 展示菜单名\n- SubMenu 折叠为 Popover 展开，不再内联展开\n\n角标：用 Badge count 或 dot 叠加在菜单 icon 右上角，count>99 显示 99+。",
  "implemented": true
 },
 {
  "id": "pagination",
  "name": "Pagination",
  "cn": "分页",
  "cat": "导航",
  "figma": "1363-88210",
  "summary": "长列表分页，提供 simple、jumper、size changer 三种增强能力。",
  "guidance": "列表 ≤50 条不分页；首页统一 pageSize=20。",
  "props": [
   {
    "name": "current",
    "type": "number",
    "default": "1",
    "desc": "当前页码"
   },
   {
    "name": "total",
    "type": "number",
    "default": "0",
    "desc": "总条数"
   },
   {
    "name": "pageSize",
    "type": "number",
    "default": "10",
    "desc": "每页条数"
   },
   {
    "name": "showSizeChanger",
    "type": "boolean",
    "default": "false",
    "desc": "显示页大小选择"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base"
  ],
  "skill": "【Pagination 交互 Skill】\n交互：\n- 页码按钮：hover bg --color-bg-page，当前页 bg --color-primary-normal text #fff\n- 省略号：hover 展开跳 5 页的前/后箭头\n- pageSize 切换：Select 组件，change 后重置到第 1 页\n- 快速跳转（showQuickJumper）：输入数字后回车跳转，超出范围自动 clamp\n\n位置：Table 分页固定在内容区底部，padding 16px 0，align right；移动端居中。\ntotal 显示格式：共 {total} 条，放在 Pagination 左侧。",
  "implemented": true
 },
 {
  "id": "steps",
  "name": "Steps",
  "cn": "步骤条",
  "cat": "导航",
  "figma": "1400-35527",
  "summary": "任务流程指示器，支持横向/竖向、状态、点状步骤。",
  "guidance": "步骤数控制在 3-5 个；超过 5 步考虑改为表单分组。",
  "props": [
   {
    "name": "current",
    "type": "number",
    "default": "0",
    "desc": "当前步骤"
   },
   {
    "name": "items",
    "type": "StepItem[]",
    "default": "[]",
    "desc": "步骤项"
   },
   {
    "name": "direction",
    "type": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "desc": "方向"
   },
   {
    "name": "status",
    "type": "'wait' | 'process' | 'finish' | 'error'",
    "default": "'process'",
    "desc": "当前状态"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-success-normal",
   "--color-error-normal"
  ],
  "skill": "【Steps 交互 Skill】\nstatus: wait(灰) / process(品牌蓝，pulse 动画) / finish(绿色对勾) / error(红色叹号)。\n\n交互：\n- 可点击步骤（clickable=true）：hover cursor pointer，已完成步骤可回退\n- 不可点击：cursor default\n- 步骤切换：Content 区域 fade 过渡 240ms\n\n方向：\n- horizontal（默认）：步骤数 ≤ 5\n- vertical：步骤数 > 5 或步骤描述文字较长\n- 移动端强制 vertical\n\n错误步骤：status=error + description 说明原因，操作区显示重试按钮。",
  "implemented": true
 },
 {
  "id": "tabs",
  "name": "Tabs",
  "cn": "标签页",
  "cat": "导航",
  "figma": "1481-170977",
  "summary": "内容分组切换器，line / card / segment 三种风格。",
  "guidance": "页面级用 line；卡片内分组用 segment。",
  "props": [
   {
    "name": "type",
    "type": "'line' | 'card' | 'segment'",
    "default": "'line'",
    "desc": "类型"
   },
   {
    "name": "items",
    "type": "TabItem[]",
    "default": "[]",
    "desc": "标签项"
   },
   {
    "name": "activeKey",
    "type": "string",
    "default": "-",
    "desc": "激活项"
   },
   {
    "name": "centered",
    "type": "boolean",
    "default": "false",
    "desc": "居中"
   },
   {
    "name": "tabPosition",
    "type": "'top' | 'right' | 'bottom' | 'left'",
    "default": "'top'",
    "desc": "位置"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base",
   "--color-bg-page"
  ],
  "skill": "【Tabs 交互 Skill】\ntype: line（默认，下划线）/ card（标签卡）/ segment（分段控制器，等宽）。\n\n交互：\n- 切换：Content 区 fade 200ms，不做 slide（避免跨屏跳动）\n- 激活态（line）：border-bottom 2px --color-primary-normal，color --color-primary-normal\n- hover（未激活）：color --color-text-primary\n- 可关闭（closable）：hover 显示 × icon，click 移除 tab + confirm 弹窗（如有未保存内容）\n- 超出宽度：左右箭头滚动，不换行\n\nBadge：未读消息在 tab label 右侧加 Badge count/dot。\n禁止超过 8 个 tab；超过用 DropdownMenu 折叠。",
  "implemented": true
 },
 {
  "id": "affix",
  "name": "Affix",
  "cn": "固钉",
  "cat": "布局",
  "figma": "1372-131274",
  "summary": "在滚动到边界时将子元素固定，常用于操作栏、回到顶部按钮。",
  "guidance": "长表单的提交栏推荐使用 Affix offsetBottom={0}。",
  "props": [
   {
    "name": "offsetTop",
    "type": "number",
    "default": "0",
    "desc": "距顶距离"
   },
   {
    "name": "offsetBottom",
    "type": "number",
    "default": "-",
    "desc": "距底距离"
   },
   {
    "name": "onChange",
    "type": "(affixed: boolean) => void",
    "default": "-",
    "desc": "固定状态变化"
   }
  ],
  "tokens": [
   "--shadow-2"
  ],
  "skill": "【Affix 交互 Skill】\n交互：\n- offsetTop 设定距离顶部触发吸顶的阈值（默认 0）\n- 吸顶后元素脱离文档流，占位 placeholder 保持原有高度避免页面跳动\n- z-index 建议 90（低于 Modal 的 1000，低于 Header 的 100）\n\n使用场景：表单底部操作栏（offsetBottom=0）、页面侧边快捷导航、表格操作栏。\n避免同一页面设置超过 2 个 Affix，优先考虑 sticky CSS 方案。",
  "implemented": true
 },
 {
  "id": "grid",
  "name": "Grid",
  "cn": "栅格",
  "cat": "布局",
  "figma": "-",
  "summary": "24 栅格响应式布局系统，提供 Row / Col 与 5 档 gutter。",
  "guidance": "页面级布局强制使用 24 栅格；卡片内部布局可使用 Flex/Space。",
  "props": [
   {
    "name": "span",
    "type": "number",
    "default": "-",
    "desc": "列宽（1-24）"
   },
   {
    "name": "offset",
    "type": "number",
    "default": "0",
    "desc": "左偏移列数"
   },
   {
    "name": "gutter",
    "type": "number | [number, number]",
    "default": "0",
    "desc": "列间距"
   },
   {
    "name": "justify",
    "type": "'start' | 'center' | 'end' | 'space-between'",
    "default": "'start'",
    "desc": "水平对齐"
   },
   {
    "name": "align",
    "type": "'top' | 'middle' | 'bottom'",
    "default": "'top'",
    "desc": "垂直对齐"
   }
  ],
  "tokens": [
   "--spacing-12",
   "--spacing-16"
  ],
  "skill": "【Grid 交互 Skill】\n24列系统，gutter 推荐值：[16,16]（卡片列表）/ [24,0]（表单）/ [0,0]（满宽布局）。\n\n响应式断点：\n- xs(<576): span=24（单列）\n- sm(≥576): 12或24\n- md(≥768): 8或12\n- lg(≥992): 6或8（4/3列看板）\n- xl(≥1280): 标准布局固定\n\n常见错误：不要在 Col 内部再嵌套 Row 超过 2 层；不要用 margin 代替 gutter；不要在 Grid 内混用固定 px 宽度。",
  "implemented": true
 },
 {
  "id": "layout",
  "name": "Layout",
  "cn": "布局",
  "cat": "布局",
  "figma": "-",
  "summary": "应用级页面框架，含 Header / Sider / Content / Footer，自动处理侧边栏折叠。",
  "guidance": "侧边栏宽度展开 240，折叠 64；保持 16:9 主内容黄金比例。",
  "props": [
   {
    "name": "hasSider",
    "type": "boolean",
    "default": "-",
    "desc": "含侧边栏"
   },
   {
    "name": "collapsed",
    "type": "boolean",
    "default": "false",
    "desc": "侧边栏折叠"
   },
   {
    "name": "theme",
    "type": "'light' | 'dark'",
    "default": "'light'",
    "desc": "主题"
   }
  ],
  "tokens": [
   "var(--color-bg-card)",
   "--color-bg-page",
   "--color-gray-900"
  ],
  "skill": "【Layout 交互 Skill】\n标准结构：Layout > Sider + Layout > Header + Content + Footer。\n\nSider 交互：\n- collapsed=false: 宽 200px，展示图标+文字\n- collapsed=true: 宽 56px，仅图标，Tooltip 显示菜单文字\n- 切换动画：width transition 240ms easing-standard\n- lg 断点以下：默认 collapsed，移动端 Sider 改为 Drawer 覆盖\n\nHeader：height 56px，position sticky top 0，z-index 100，bg var(--color-bg-card)，border-bottom --color-divider-base-1。\n\nContent：min-height calc(100vh - 56px)，padding 24px，bg --color-bg-page。",
  "implemented": true
 },
 {
  "id": "page-header",
  "name": "PageHeader",
  "cn": "页头",
  "cat": "布局",
  "figma": "1363-99512",
  "summary": "页面顶部容器，承载面包屑、返回、标题、副标题、操作区。",
  "guidance": "详情页一律使用 PageHeader 承载返回 + 操作；列表页省略 onBack。",
  "props": [
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "主标题"
   },
   {
    "name": "subTitle",
    "type": "ReactNode",
    "default": "-",
    "desc": "副标题"
   },
   {
    "name": "onBack",
    "type": "() => void",
    "default": "-",
    "desc": "返回回调"
   },
   {
    "name": "extra",
    "type": "ReactNode",
    "default": "-",
    "desc": "右侧操作区"
   },
   {
    "name": "breadcrumb",
    "type": "BreadcrumbProps",
    "default": "-",
    "desc": "面包屑配置"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "var(--color-bg-card)",
   "--color-divider-base-1"
  ],
  "skill": "【PageHeader 交互 Skill】\n结构：[返回箭头] 面包屑 / 标题 [Badge状态] [extra操作区]\n\n交互：\n- onBack：点击左箭头执行，通常 router.back() 或跳指定路由\n- extra：右侧操作区，主操作 Button primary，次操作 Button default，最多 3 个\n- 面包屑：末级不可点，前级 hover underline\n\n页面类型对应：\n- 列表页：无 onBack，title=模块名，extra=新建按钮\n- 详情页：onBack=true，title=记录名，extra=编辑+删除\n- 表单页：onBack=true，title=新建/编辑，extra 在底部 Footer 而非 PageHeader",
  "implemented": true
 },
 {
  "id": "space",
  "name": "Space",
  "cn": "间距",
  "cat": "布局",
  "figma": "-",
  "summary": "行内/纵向元素间隔工具，自动处理 wrap 与 split。",
  "guidance": "按钮组优先使用 Space 而非手动 margin。",
  "props": [
   {
    "name": "size",
    "type": "'small' | 'middle' | 'large' | number",
    "default": "'small'",
    "desc": "间距大小"
   },
   {
    "name": "direction",
    "type": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "desc": "排列方向"
   },
   {
    "name": "wrap",
    "type": "boolean",
    "default": "false",
    "desc": "自动换行"
   },
   {
    "name": "split",
    "type": "ReactNode",
    "default": "-",
    "desc": "分隔节点"
   }
  ],
  "tokens": [
   "--spacing-8",
   "--spacing-12",
   "--spacing-16"
  ],
  "skill": "【Space 交互 Skill】\ndirection=horizontal（默认）/ vertical。\nsize: small(8px) / middle(16px) / large(24px) 或自定义数字。\n\n使用场景：\n- 按钮组：Space size=8，wrap=false\n- 表单字段组：Space direction=vertical size=16\n- 标签组：Space size=4 wrap=true\n- 页头操作区：Space size=12\n\n禁止用 Space 模拟 Grid 布局；超过 3 列改用 Grid。wrap=true 时注意 align=start 避免拉伸。",
  "implemented": true
 },
 {
  "id": "avatar",
  "name": "Avatar",
  "cn": "头像",
  "cat": "数据展示",
  "figma": "1496-37413",
  "summary": "用户/对象的视觉标识，支持图片、文字、图标、组合。",
  "guidance": "无图时显示姓名首字符；多用户使用 Avatar.Group 重叠。",
  "props": [
   {
    "name": "src",
    "type": "string",
    "default": "-",
    "desc": "图片地址"
   },
   {
    "name": "size",
    "type": "'large' | 'small' | 'default' | number",
    "default": "'default'",
    "desc": "尺寸"
   },
   {
    "name": "shape",
    "type": "'circle' | 'square'",
    "default": "'circle'",
    "desc": "形状"
   },
   {
    "name": "icon",
    "type": "ReactNode",
    "default": "-",
    "desc": "图标"
   },
   {
    "name": "group",
    "type": "boolean",
    "default": "false",
    "desc": "组合模式"
   }
  ],
  "tokens": [
   "--color-bg-hover",
   "--color-primary-normal"
  ],
  "skill": "【Avatar 交互 Skill】\n尺寸：xs=24 / sm=32 / md=40（默认）/ lg=48 / xl=64，shape=circle/square。\n\nFallback 顺序：图片 → src 加载失败显示 alt 首字符 → 显示 UserIcon。\n\n交互：\n- 可点击（如进入个人页）：hover 添加 overlay rgba(0,0,0,0.15)，cursor pointer\n- Avatar.Group：超出 maxCount 显示 \"+N\" 气泡，hover 展开 Tooltip 列表\n\nBadge 组合：在线状态用 Badge status=processing（绿色脉冲点）叠加在右下角。\n图片失败：onError 回调切换为文字/图标模式。",
  "implemented": true
 },
 {
  "id": "badge",
  "name": "Badge",
  "cn": "徽标数",
  "cat": "数据展示",
  "figma": "1492-108660",
  "summary": "通知红点/数字徽标，可独立使用或附加到子元素。",
  "guidance": "未读数 >99 显示 99+；纯提醒用 dot 不带数字。",
  "props": [
   {
    "name": "count",
    "type": "number",
    "default": "-",
    "desc": "数字"
   },
   {
    "name": "dot",
    "type": "boolean",
    "default": "false",
    "desc": "红点模式"
   },
   {
    "name": "status",
    "type": "'success' | 'processing' | 'default' | 'error' | 'warning'",
    "default": "-",
    "desc": "状态点"
   },
   {
    "name": "offset",
    "type": "[number, number]",
    "default": "-",
    "desc": "偏移"
   },
   {
    "name": "overflowCount",
    "type": "number",
    "default": "99",
    "desc": "超过显示 +"
   }
  ],
  "tokens": [
   "--color-error-normal",
   "--color-success-normal",
   "--color-primary-normal"
  ],
  "skill": "【Badge 交互 Skill】\ncount：数字角标，默认红色 bg --color-error-normal；count=0 自动隐藏（showZero=true 则显示）。\ndot：仅显示小红点（无数字），用于有新消息未读提示。\nstatus：processing（脉冲动画，表示进行中）/ success / warning / error / default。\n\n位置：absolute right-top，offset 微调位置。\noverflow：count > overflowCount（默认99）显示\"99+\"。\n\n动画：count 变化时数字上下滚动 160ms；从 0 到有值时 zoom-in 进入。\n\n颜色：count 支持 color prop 自定义（必须用 token 变量）。",
  "implemented": true
 },
 {
  "id": "calendar",
  "name": "Calendar",
  "cn": "日历",
  "cat": "数据展示",
  "figma": "1517-2040",
  "summary": "日历视图，支持月/年模式、单元格自定义、选择回调。",
  "guidance": "调度/日程类页面使用 Calendar；只是选日期用 DatePicker。",
  "props": [
   {
    "name": "value",
    "type": "Dayjs",
    "default": "-",
    "desc": "显示日期"
   },
   {
    "name": "mode",
    "type": "'month' | 'year'",
    "default": "'month'",
    "desc": "模式"
   },
   {
    "name": "cellRender",
    "type": "(date, info) => ReactNode",
    "default": "-",
    "desc": "单元格渲染"
   },
   {
    "name": "onPanelChange",
    "type": "(date, mode) => void",
    "default": "-",
    "desc": "面板切换"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--color-divider-base-1"
  ],
  "skill": "【Calendar 交互 Skill】\nmode: month（默认）/ year 切换。\n\n交互：\n- 日期 click：onSelect 回调，视觉上选中高亮\n- 月/年切换：header 中 Select 组件切换，不用 < > 箭头翻页\n- 今日：高亮圆圈\n- cellRender：自定义单元格内容（如显示任务数 Badge）\n\n与 DatePicker 区别：Calendar 是全量展示用于内容展示（如排班/日程），DatePicker 是弹层用于选值。\n移动端：Calendar 改为 DatePicker 或精简的周视图。",
  "implemented": true
 },
 {
  "id": "card",
  "name": "Card",
  "cn": "卡片",
  "cat": "数据展示",
  "figma": "1492-4939",
  "summary": "通用内容容器，含标题、操作、封面、底部操作区。",
  "guidance": "列表项可点击使用 hoverable；信息密集场景关闭 bordered 减少线条。",
  "props": [
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "标题"
   },
   {
    "name": "extra",
    "type": "ReactNode",
    "default": "-",
    "desc": "右上操作"
   },
   {
    "name": "actions",
    "type": "ReactNode[]",
    "default": "-",
    "desc": "底部操作"
   },
   {
    "name": "bordered",
    "type": "boolean",
    "default": "true",
    "desc": "有边框"
   },
   {
    "name": "hoverable",
    "type": "boolean",
    "default": "false",
    "desc": "悬浮效果"
   }
  ],
  "tokens": [
   "--color-divider-base-1",
   "--shadow-1",
   "var(--color-bg-card)"
  ],
  "skill": "【Card 交互 Skill】\n状态：\n- 默认：bg var(--color-bg-card)，border 1px --color-divider-base-1，border-radius --radius-8，shadow --shadow-1\n- hoverable=true：hover shadow --shadow-2，transform translateY(-1px)，transition 160ms\n- loading：内容区替换为 Skeleton（不用 Spin 覆盖）\n\n结构：[cover 顶部图] → [header: title + extra] → [body] → [footer: actions]\n\nsize=small：padding 12px（默认 16px），title font-size 14px。\n嵌套：Card 内可嵌套 Card（border-color 改为 --color-divider-base-1 降级），不超过 2 层。\nactions：底部 icon 操作区，hover color --color-primary-normal，以 Divider 分隔。",
  "implemented": true
 },
 {
  "id": "collapse",
  "name": "Collapse",
  "cn": "折叠面板",
  "cat": "数据展示",
  "figma": "1492-29683",
  "summary": "分组内容折叠展示，支持手风琴模式与无边框模式。",
  "guidance": "FAQ、详情分组使用；超过 8 个分组改用 Tabs。",
  "props": [
   {
    "name": "items",
    "type": "CollapseItem[]",
    "default": "[]",
    "desc": "面板项"
   },
   {
    "name": "accordion",
    "type": "boolean",
    "default": "false",
    "desc": "手风琴模式"
   },
   {
    "name": "bordered",
    "type": "boolean",
    "default": "true",
    "desc": "有边框"
   },
   {
    "name": "ghost",
    "type": "boolean",
    "default": "false",
    "desc": "幽灵模式"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-bg-page"
  ],
  "skill": "【Collapse 交互 Skill】\n交互：\n- 点击 header：展开/收起，chevron 旋转 180°，内容高度 transition 240ms\n- accordion=true：同时只展开一个 Panel\n- hover header：bg --color-bg-page\n\nGhost 模式：无边框无背景，仅 Divider 分隔，用于页面内嵌说明区。\n\n错误状态：Panel header 可加 Badge/Icon 提示内部有错误需处理。\n禁止在 Collapse 内嵌套 Collapse 超过 2 层。",
  "implemented": true
 },
 {
  "id": "comment",
  "name": "Comment",
  "cn": "评论",
  "cat": "数据展示",
  "figma": "1478-142292",
  "summary": "评论展示组件，含作者、内容、时间、操作、嵌套回复。",
  "guidance": "嵌套深度 ≤2 层，更深层级用「@用户」引用而非缩进。",
  "props": [
   {
    "name": "author",
    "type": "ReactNode",
    "default": "-",
    "desc": "作者"
   },
   {
    "name": "content",
    "type": "ReactNode",
    "default": "-",
    "desc": "内容"
   },
   {
    "name": "datetime",
    "type": "ReactNode",
    "default": "-",
    "desc": "时间"
   },
   {
    "name": "actions",
    "type": "ReactNode[]",
    "default": "-",
    "desc": "操作"
   },
   {
    "name": "avatar",
    "type": "ReactNode",
    "default": "-",
    "desc": "头像"
   }
  ],
  "tokens": [
   "--color-text-secondary",
   "--color-text-auxiliary"
  ],
  "skill": "【Comment 交互 Skill】\n结构：Avatar（左）+ 内容区（右：作者+时间+正文+操作）。\n\n交互：\n- actions：点赞（心形 toggle，count+1/-1）、回复（展开回复输入框）、举报（Popconfirm确认）\n- 回复输入框：expandIn 动画，200ms；提交后 loading，成功后追加子 Comment\n- 时间：显示相对时间（\"3 分钟前\"），hover Tooltip 显示绝对时间\n\n列表：Comment 垂直堆叠，嵌套回复左侧 16px 缩进，最多 3 层缩进。",
  "implemented": true
 },
 {
  "id": "descriptions",
  "name": "Descriptions",
  "cn": "描述列表",
  "cat": "数据展示",
  "figma": "1494-33048",
  "summary": "键值对描述列表，常用于详情页只读信息展示。",
  "guidance": "基础信息用无边框；技术详情、规格用 bordered。",
  "props": [
   {
    "name": "column",
    "type": "number",
    "default": "3",
    "desc": "列数"
   },
   {
    "name": "bordered",
    "type": "boolean",
    "default": "false",
    "desc": "带边框"
   },
   {
    "name": "items",
    "type": "DescriptionItem[]",
    "default": "[]",
    "desc": "项目"
   },
   {
    "name": "size",
    "type": "'default' | 'middle' | 'small'",
    "default": "'default'",
    "desc": "尺寸"
   },
   {
    "name": "layout",
    "type": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "desc": "布局"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-bg-page"
  ],
  "skill": "【Descriptions 交互 Skill】\nlayout: horizontal（label左值右）/ vertical（label上值下）。\nbordered=true：table 形态，用于详情页；bordered=false：纯文字形态，用于摘要区。\n\ncolumn：默认 3（桌面），md 降为 2，sm 降为 1（响应式）。\n\n交互：\n- 可编辑项（editable）：hover 显示 编辑 icon，click 切换 Input 内联编辑，blur/Enter 提交\n- 长文本：ellipsis + Tooltip 展示完整\n- 状态值：Tag 或 Badge 展示（不用纯文字颜色）\n\n与 Form 区别：Descriptions 是只读展示，Form 是编辑录入，不混用。",
  "implemented": true
 },
 {
  "id": "empty",
  "name": "Empty",
  "cn": "空状态",
  "cat": "数据展示",
  "figma": "1478-137754",
  "summary": "无数据展示，提供默认插画与简单插画两种风格。",
  "guidance": "区别「无数据」与「无权限」「加载失败」，文案要明确。",
  "props": [
   {
    "name": "image",
    "type": "ReactNode | string",
    "default": "default",
    "desc": "图片"
   },
   {
    "name": "description",
    "type": "ReactNode",
    "default": "'暂无数据'",
    "desc": "描述"
   },
   {
    "name": "imageStyle",
    "type": "CSSProperties",
    "default": "-",
    "desc": "图片样式"
   }
  ],
  "tokens": [
   "--color-text-auxiliary",
   "--color-bg-page"
  ],
  "skill": "【Empty 交互 Skill】\n使用场景：列表/表格无数据、搜索无结果、权限不足无内容。\n\n样式：\n- image 区：默认 Milesight IOT 空状态插图，高 100px；搜索无结果用\"放大镜+？\"图\n- description：12-14px，color --color-text-auxiliary\n- extra（操作区）：主操作 Button primary（如\"立即创建\"）\n\n个性化：\n- 无权限：图 + \"暂无权限\" + 联系管理员 Link\n- 搜索无结果：图 + \"未找到相关内容\" + \"清除筛选\" Button default\n- 加载错误：图 + 错误说明 + \"重试\" Button default",
  "implemented": true
 },
 {
  "id": "image",
  "name": "Image",
  "cn": "图片",
  "cat": "数据展示",
  "figma": "1491-53161",
  "summary": "图片组件，含预览、缩放、回退、占位。",
  "guidance": "必须设置 fallback；列表图片用 Image.PreviewGroup。",
  "props": [
   {
    "name": "src",
    "type": "string",
    "default": "-",
    "desc": "图片源"
   },
   {
    "name": "preview",
    "type": "boolean | object",
    "default": "true",
    "desc": "预览能力"
   },
   {
    "name": "fallback",
    "type": "string",
    "default": "-",
    "desc": "失败兜底"
   },
   {
    "name": "width",
    "type": "number",
    "default": "-",
    "desc": "宽度"
   },
   {
    "name": "height",
    "type": "number",
    "default": "-",
    "desc": "高度"
   }
  ],
  "tokens": [
   "--color-divider-base-1",
   "--color-bg-hover"
  ],
  "skill": "【Image 交互 Skill】\n交互：\n- preview=true（默认）：click 打开全屏预览 Modal，背景 rgba(0,0,0,0.85)\n- 预览内：← → 切换（PreviewGroup），滚轮缩放，拖拽移动，Esc/× 关闭\n- 加载中：Skeleton 占位，宽高同最终图片\n- 加载失败：fallback 图（broken image icon）\n\nPreviewGroup：多图共享预览上下文，左右箭头翻页，右上角显示 n/total。\n\nlazy loading：默认开启（intersection observer），viewport 外图片不加载。",
  "implemented": true
 },
 {
  "id": "list",
  "name": "List",
  "cn": "列表",
  "cat": "数据展示",
  "figma": "1486-105119",
  "summary": "通用列表，支持基础、栅格、加载、分页、虚拟滚动。",
  "guidance": ">100 行考虑虚拟滚动；通用 CRUD 优先用 Table。",
  "props": [
   {
    "name": "dataSource",
    "type": "any[]",
    "default": "[]",
    "desc": "数据源"
   },
   {
    "name": "renderItem",
    "type": "(item) => ReactNode",
    "default": "-",
    "desc": "项渲染"
   },
   {
    "name": "grid",
    "type": "object",
    "default": "-",
    "desc": "栅格配置"
   },
   {
    "name": "pagination",
    "type": "object | false",
    "default": "-",
    "desc": "分页"
   }
  ],
  "tokens": [
   "--color-divider-base-1",
   "var(--color-bg-card)"
  ],
  "skill": "【List 交互 Skill】\ngrid 模式：等同 Row+Col 卡片布局，Item 为 Card。\n非 grid：垂直列表，Item 间 Divider 分隔。\n\n交互：\n- hover（可点击项）：bg --color-bg-page，cursor pointer\n- Item actions：右侧操作链接（link 类型 Button），hover color --color-primary-normal\n- 加载更多：底部 loadMore 区域，Button default\"加载更多\" 或 Spin（无限滚动）\n\n虚拟滚动：列表项 > 200 条使用 List.Virtual（固定高度 itemHeight），避免大 DOM。\n空态：dataSource=[] 显示 Empty 组件（内置）。",
  "implemented": true
 },
 {
  "id": "popover",
  "name": "Popover",
  "cn": "气泡卡片",
  "cat": "数据展示",
  "figma": "1543-31022",
  "summary": "hover/click 触发的复杂内容浮层，比 Tooltip 容纳更多。",
  "guidance": "短文字提示用 Tooltip；含按钮等交互内容用 Popover。",
  "props": [
   {
    "name": "content",
    "type": "ReactNode",
    "default": "-",
    "desc": "内容"
   },
   {
    "name": "trigger",
    "type": "'hover' | 'click' | 'focus' | 'contextMenu'",
    "default": "'hover'",
    "desc": "触发"
   },
   {
    "name": "placement",
    "type": "12 种方位",
    "default": "'top'",
    "desc": "位置"
   },
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "标题"
   }
  ],
  "tokens": [
   "var(--color-bg-card)",
   "--shadow-2",
   "--color-divider-base-1"
  ],
  "skill": "【Popover 交互 Skill】\ntrigger: hover（信息提示）/ click（富内容操作面板）/ focus。\n\n展开：fade + scale 200ms，placement 自动边界翻转（12个方向）。\n关闭：\n- hover trigger：鼠标离开 trigger 或 content 区域后 150ms 延迟关闭（避免抖动）\n- click trigger：点击外部关闭，再次点击 trigger 切换\n\ncontent 内容规则：\n- 可放 Button、Link、Form（简单表单）\n- 禁止放 Table 或超过 300px 高内容，改用 Drawer\n- 宽度固定 240-320px，内容自适应高度\n\n与 Tooltip 区别：Popover 有标题+富内容，Tooltip 只有一行文本。",
  "implemented": true
 },
 {
  "id": "rate",
  "name": "Rate",
  "cn": "评分",
  "cat": "数据展示",
  "figma": "1424-176466",
  "summary": "星级评分组件，支持半星、清空、自定义字符。",
  "guidance": "满意度调研用 5 星 allowHalf；难度等级用图标 character。",
  "props": [
   {
    "name": "value",
    "type": "number",
    "default": "0",
    "desc": "分值"
   },
   {
    "name": "count",
    "type": "number",
    "default": "5",
    "desc": "星星数"
   },
   {
    "name": "allowHalf",
    "type": "boolean",
    "default": "false",
    "desc": "允许半选"
   },
   {
    "name": "allowClear",
    "type": "boolean",
    "default": "true",
    "desc": "允许清空"
   },
   {
    "name": "character",
    "type": "ReactNode",
    "default": "★",
    "desc": "自定义字符"
   }
  ],
  "tokens": [
   "--color-warm-normaling",
   "--color-gray-200"
  ],
  "skill": "【Rate 交互 Skill】\n交互：\n- hover：预览高亮到 hover 所在星，cursor pointer\n- click：设置值，再次点击同一星取消（allowHalf=false 时）\n- allowHalf：鼠标在星的左半部分显示半星\n- 键盘：← → 调整，Enter 确认\n\ncolor：默认 --color-warm-normal（#f77234 金黄）；character 可替换为自定义 icon。\ndisabled/readonly：cursor default，无 hover 效果，用于展示评分结果。\n\ncount：默认 5 颗，可改为 10（NPS 评分场景）。",
  "implemented": true
 },
 {
  "id": "statistic",
  "name": "Statistic",
  "cn": "统计数值",
  "cat": "数据展示",
  "figma": "1496-40385",
  "summary": "数字统计展示，支持精度、前后缀、动画、趋势配色。",
  "guidance": "涨跌用色 success/error，必须配箭头图标避免色盲不可读。",
  "props": [
   {
    "name": "value",
    "type": "number",
    "default": "-",
    "desc": "数值"
   },
   {
    "name": "precision",
    "type": "number",
    "default": "-",
    "desc": "小数位"
   },
   {
    "name": "prefix",
    "type": "ReactNode",
    "default": "-",
    "desc": "前缀"
   },
   {
    "name": "suffix",
    "type": "ReactNode",
    "default": "-",
    "desc": "后缀"
   },
   {
    "name": "valueStyle",
    "type": "CSSProperties",
    "default": "-",
    "desc": "数字样式"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "--color-success-normal",
   "--color-error-normal"
  ],
  "skill": "【Statistic 交互 Skill】\n展示：大数字（font 28-36px/700）+ 标题（12-14px/--color-text-auxiliary）+ 前后缀。\n\n交互：\n- Countdown：实时倒计时，onFinish 回调触发后续操作（如自动刷新）\n- 数字变化：valueStyle 配合 transition，数字滚动动画（可选 CountUp 库）\n\n趋势：\n- prefix/suffix 放 Icon（↑↓）表示趋势，颜色 --color-success-normal/--color-error-normal\n- 环比数据放 description，color --color-text-auxiliary，font 12px\n\n布局：4个指标卡用 Row gutter=[16,16] Col span=6，移动端 span=12。",
  "implemented": true
 },
 {
  "id": "table",
  "name": "Table",
  "cn": "表格",
  "cat": "数据展示",
  "figma": "—",
  "summary": "展示结构化数据，支持选择、排序、空态与分页联动。本层实现派生自文档中 .api 表格规格。",
  "guidance": "表头使用 12px 大写字重 600；数值列右对齐；操作列固定右侧且不超过 3 个操作。",
  "props": [
   {
    "name": "columns",
    "type": "TableColumn[]",
    "default": "[]",
    "desc": "列定义"
   },
   {
    "name": "selectable",
    "type": "boolean",
    "default": "false",
    "desc": "是否支持行选择"
   },
   {
    "name": "empty",
    "type": "string",
    "default": "'暂无数据'",
    "desc": "空态文案"
   }
  ],
  "tokens": [
   "--radius-12",
   "--color-divider-base-1",
   "--color-bg-card",
   "--color-base-bg"
  ],
  "skill": "【Table 规格·派生自文档 .api】\n容器：border 1px --color-divider-base-1, radius --radius-12, overflow hidden\n单元格：padding 12px 16px, font 400 13px/1.6 --font-sans\n表头：bg --color-base-bg, font 600 12px/1.4, color --color-text-auxiliary, letter-spacing .04em, uppercase\n行悬停：bg --color-base-bg；末行去边框",
  "implemented": true
 },
 {
  "id": "tag",
  "name": "Tag",
  "cn": "标签",
  "cat": "数据展示",
  "figma": "1422-92446",
  "summary": "分类、状态、标签型小型展示元素，提供 11 种预设色。",
  "guidance": "状态用预设色保持全局一致；自定义 color 仅用于业务必须。",
  "props": [
   {
    "name": "color",
    "type": "string",
    "default": "-",
    "desc": "颜色"
   },
   {
    "name": "closable",
    "type": "boolean",
    "default": "false",
    "desc": "可关闭"
   },
   {
    "name": "bordered",
    "type": "boolean",
    "default": "true",
    "desc": "边框"
   },
   {
    "name": "checkable",
    "type": "boolean",
    "default": "false",
    "desc": "可选中"
   }
  ],
  "tokens": [
   "--color-brand-50",
   "--color-primary-normal",
   "--radius-4"
  ],
  "skill": "【Tag 交互 Skill】\n颜色语义：\n- primary（--color-primary-bg + --color-primary-normal）：常规分类\n- success（--color-success-bg + --color-success-normal）：成功/正常/在线\n- error（--color-error-bg + --color-error-normal）：错误/危险/离线\n- warn（--color-warm-bg + --color-warm-normal）：警告/待处理\n- info（--color-primary-bg + --color-info）：信息/中性\n\n交互：\n- closable=true：hover 显示 × 右侧，click 移除（配合 onClose）\n- checkable：Toggle 选中态，选中 bg --color-primary-normal text #fff\n- 新增标签：最后放\"+ 添加\"input 形式，blur/Enter 确认\n\n禁止：不超过 3 种颜色在同屏混用；不用 Tag 替代 Badge（有数字用 Badge）。",
  "implemented": true
 },
 {
  "id": "timeline",
  "name": "Timeline",
  "cn": "时间轴",
  "cat": "数据展示",
  "figma": "1494-20096",
  "summary": "时间维度的事件流展示，支持左右交替、待定状态。",
  "guidance": "运维操作日志、订单流转优先使用；最新事件置顶。",
  "props": [
   {
    "name": "items",
    "type": "TimelineItem[]",
    "default": "[]",
    "desc": "项目"
   },
   {
    "name": "mode",
    "type": "'left' | 'alternate' | 'right'",
    "default": "'left'",
    "desc": "模式"
   },
   {
    "name": "pending",
    "type": "ReactNode",
    "default": "-",
    "desc": "待定项"
   },
   {
    "name": "reverse",
    "type": "boolean",
    "default": "false",
    "desc": "倒序"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base"
  ],
  "skill": "【Timeline 交互 Skill】\nmode: left（图标左）/ right / alternate（左右交替）。\n\n视觉：\n- dot：默认圆点 --color-primary-normal；自定义 icon（如 CheckCircle/XCircle）表示里程碑/异常\n- color：继承语义（success/error/warn/processing）\n- pending（进行中）：最后一项 dot 为 Spin，虚线尾部表示未完成\n\n交互：\n- 可展开详情：click item 展开/收起（Collapse 效果），不要跳转新页\n- 超长列表：显示前 10 条，\"查看全部\"加载更多\n\n详情页常用：设备事件日志（Timeline）+ 分页，替代 Table（视觉更轻量）。",
  "implemented": true
 },
 {
  "id": "tooltip",
  "name": "Tooltip",
  "cn": "文字提示",
  "cat": "数据展示",
  "figma": "1478-144813",
  "summary": "轻量级 hover 文字提示，仅承载补充说明。",
  "guidance": "图标按钮必须配 Tooltip；提示内容 ≤20 字。",
  "props": [
   {
    "name": "title",
    "type": "ReactNode",
    "default": "-",
    "desc": "提示内容"
   },
   {
    "name": "placement",
    "type": "12 种方位",
    "default": "'top'",
    "desc": "位置"
   },
   {
    "name": "trigger",
    "type": "'hover' | 'focus' | 'click'",
    "default": "'hover'",
    "desc": "触发"
   },
   {
    "name": "color",
    "type": "string",
    "default": "-",
    "desc": "颜色"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "var(--color-bg-card)",
   "--shadow-2"
  ],
  "skill": "【Tooltip 交互 Skill】\ntrigger: hover（默认）/ click / focus。\nplacement：12个方向，默认 top，自动边界翻转。\n\n交互：\n- 出现：delay 100ms（避免鼠标路过触发），fade 160ms\n- 消失：鼠标离开后立即消失（无延迟）\n\n使用规则：\n- 文字说明：只放 1-2 行纯文字；富内容用 Popover\n- Icon 按钮必须加 Tooltip（title=功能说明）\n- 截断文字（ellipsis）必须加 Tooltip 展示完整内容\n- 禁止在 Tooltip 内放可交互元素（按钮/链接），改用 Popover",
  "implemented": true
 },
 {
  "id": "tree",
  "name": "Tree",
  "cn": "树形控件",
  "cat": "数据展示",
  "figma": "1478-129786",
  "summary": "层级数据可视化，支持选中、勾选、拖拽、虚拟滚动。",
  "guidance": ">500 节点开虚拟滚动；拖拽场景必须有撤销操作。",
  "props": [
   {
    "name": "treeData",
    "type": "TreeNode[]",
    "default": "[]",
    "desc": "数据"
   },
   {
    "name": "checkable",
    "type": "boolean",
    "default": "false",
    "desc": "显示复选框"
   },
   {
    "name": "draggable",
    "type": "boolean",
    "default": "false",
    "desc": "可拖拽"
   },
   {
    "name": "selectedKeys",
    "type": "string[]",
    "default": "-",
    "desc": "选中"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50"
  ],
  "skill": "【Tree 交互 Skill】\n展开/折叠：点击 chevron（▶/▼），动画 160ms。\n\n交互：\n- checkable=true：Checkbox 多选，父子节点联动（indeterminate 状态）\n- selectable=true（默认）：click label 选中，高亮 bg --color-primary-bg\n- draggable=true：拖拽排序，拖拽中 dashed border 指示目标位置\n- 右键菜单：onRightClick 展示 ContextMenu（DropdownMenu contextMenu 模式）\n\n异步加载（loadData）：展开时触发，loading 显示 Spin，加载完成后追加子节点。\n搜索高亮：过滤后只显示匹配节点和其父节点路径，不匹配节点隐藏（不折叠）。",
  "implemented": true
 },
 {
  "id": "watermark",
  "name": "Watermark",
  "cn": "水印",
  "cat": "数据展示",
  "figma": "1424-145447",
  "summary": "页面/区块水印，使用 Canvas 绘制，自动监听 DOM 变化防移除。",
  "guidance": "涉及合同、隐私文件的页面默认开启；用户名 + 时间戳。",
  "props": [
   {
    "name": "content",
    "type": "string | string[]",
    "default": "-",
    "desc": "水印文字"
   },
   {
    "name": "image",
    "type": "string",
    "default": "-",
    "desc": "图片水印"
   },
   {
    "name": "rotate",
    "type": "number",
    "default": "-22",
    "desc": "旋转角度"
   },
   {
    "name": "gap",
    "type": "[number, number]",
    "default": "[100, 100]",
    "desc": "间距"
   },
   {
    "name": "zIndex",
    "type": "number",
    "default": "9",
    "desc": "层级"
   }
  ],
  "tokens": [
   "--color-text-auxiliary"
  ],
  "skill": "【Watermark 交互 Skill】\n纯视觉层，无交互。\n\n样式规范：\n- content：用户名 + 时间戳（如\"张三 2026-05-14\"），防截图泄露\n- color：rgba(0,0,0,0.08)（浅色背景）/ rgba(255,255,255,0.12)（深色背景）\n- font-size：14px，rotate：-22deg，gap：[100,100]\n\n使用场景：敏感数据页面（财务/权限配置/用户隐私），全屏覆盖在 Content 区。\n禁止：不在 Watermark 上叠加可交互元素，不降低 opacity 使其不可见。",
  "implemented": true
 },
 {
  "id": "auto-complete",
  "name": "AutoComplete",
  "cn": "自动完成",
  "cat": "数据录入",
  "figma": "1453-86532",
  "summary": "输入框 + 下拉建议，适合海量候选项的搜索式选择。",
  "guidance": "远程搜索 onSearch 加 300ms 防抖；空状态显示「暂无匹配」。",
  "props": [
   {
    "name": "options",
    "type": "Option[]",
    "default": "[]",
    "desc": "建议项"
   },
   {
    "name": "value",
    "type": "string",
    "default": "-",
    "desc": "输入值"
   },
   {
    "name": "onSearch",
    "type": "(value: string) => void",
    "default": "-",
    "desc": "搜索回调"
   },
   {
    "name": "allowClear",
    "type": "boolean",
    "default": "false",
    "desc": "允许清除"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--shadow-2"
  ],
  "skill": "【AutoComplete 交互 Skill】\n展开时机：输入内容后实时请求/过滤，防抖 300ms 避免频繁请求。\n\n交互：\n- 候选项 hover：bg --color-bg-page\n- 键盘：↑↓ 导航，Enter 确认，Esc 关闭\n- 无结果：显示\"无匹配结果\"（不用 Empty 组件，inline 文本即可）\n- 清空（allowClear）：× 清空同时关闭下拉\n\n使用场景：搜索框智能提示、城市选择、标签联想。\n与 Select 区别：AutoComplete 可输入任意值，Select 只能选已有选项。",
  "implemented": true
 },
 {
  "id": "cascader",
  "name": "Cascader",
  "cn": "级联选择",
  "cat": "数据录入",
  "figma": "1453-21039",
  "summary": "层级菜单选择器，逐级展开多列展示，适合 3-4 层固定层级。",
  "guidance": "区域、行业分类用 Cascader；树型且可任意层级勾选用 TreeSelect。",
  "props": [
   {
    "name": "options",
    "type": "CascaderOption[]",
    "default": "[]",
    "desc": "层级数据"
   },
   {
    "name": "value",
    "type": "string[]",
    "default": "-",
    "desc": "选中路径"
   },
   {
    "name": "changeOnSelect",
    "type": "boolean",
    "default": "false",
    "desc": "任意层级可选"
   },
   {
    "name": "separator",
    "type": "string",
    "default": "' / '",
    "desc": "显示分隔符"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--shadow-2"
  ],
  "skill": "【Cascader 交互 Skill】\n展开：多列 Panel，逐级联动。\n\n交互：\n- hover（单选）/ click 展开子级，当前列选中项高亮 bg --color-primary-bg\n- changeOnSelect=true：每级都可作为最终值，否则只有叶子节点可选\n- 搜索（showSearch）：输入后平铺展示所有匹配路径，路径以 / 拼接\n- multiple：多选，选中项以 Tag 显示\n\n加载（loadData）：动态加载子节点，loading 时 chevron 替换为 Spin。\n空节点：叶子节点无 children，chevron 不显示。",
  "implemented": true
 },
 {
  "id": "checkbox",
  "name": "Checkbox",
  "cn": "复选框",
  "cat": "数据录入",
  "figma": "1318-100610",
  "summary": "多选项控件，支持半选状态、批量选择、组管理。",
  "guidance": "全选+半选+列表的标准三件套，参考 Table 多选实现。",
  "props": [
   {
    "name": "checked",
    "type": "boolean",
    "default": "false",
    "desc": "是否选中"
   },
   {
    "name": "indeterminate",
    "type": "boolean",
    "default": "false",
    "desc": "半选状态"
   },
   {
    "name": "options",
    "type": "CheckboxOption[]",
    "default": "-",
    "desc": "选项组"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base"
  ],
  "skill": "【Checkbox 交互 Skill】\n状态：\n- unchecked: border 1px --color-border-base\n- hover: border-color --color-primary-normal\n- checked: bg --color-primary-normal, border --color-primary-normal, ✓ 白色\n- indeterminate: bg --color-primary-normal, border --color-primary-normal, — 白色横线\n- disabled: opacity 0.4, cursor not-allowed\n\nCheckbox.Group：\n- 全选逻辑：单独 Checkbox 控制，indeterminate = 部分选中\n- 变更时 onChange 返回选中 value 数组\n\n交互规则：\n- 点击 label 文字同样触发选中\n- 列表全选与行勾选需同步（Table 内置处理）\n- 单个 Checkbox 用于开关类确认（如\"同意协议\"），不用 Switch",
  "implemented": true
 },
 {
  "id": "date-picker",
  "name": "DatePicker",
  "cn": "日期选择框",
  "cat": "数据录入",
  "figma": "1471-40068",
  "summary": "日期/时间选择，含 picker 类型、范围选择、预设范围、禁用日期。",
  "guidance": "统一使用 dayjs；表格筛选用 RangePicker presets。",
  "props": [
   {
    "name": "value",
    "type": "Dayjs",
    "default": "-",
    "desc": "选中值"
   },
   {
    "name": "picker",
    "type": "'date' | 'week' | 'month' | 'quarter' | 'year'",
    "default": "'date'",
    "desc": "类型"
   },
   {
    "name": "showTime",
    "type": "boolean | object",
    "default": "false",
    "desc": "含时间"
   },
   {
    "name": "format",
    "type": "string",
    "default": "'YYYY-MM-DD'",
    "desc": "显示格式"
   },
   {
    "name": "range",
    "type": "boolean",
    "default": "false",
    "desc": "范围选择"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--shadow-2"
  ],
  "skill": "【DatePicker 交互 Skill】\n展开：Input 区域 click 触发，Popup fade 200ms，placement bottomLeft 自动边界翻转。\n\n面板交互：\n- 年/月切换：< > 箭头翻页，点击\"年月\"标题切换到年选/月选视图\n- 日期 hover：bg --color-bg-page\n- 今日：text --color-primary-normal（无选中态）\n- 已选：bg --color-primary-normal text #fff，圆形\n- 禁用日期（disabledDate）：opacity 0.4 不可点\n\nRangePicker：\n- 开始日期选中后，hover 在结束日期前的日期显示范围高亮（bg --color-primary-bg）\n- 可设置同一天为开始=结束\n\nshowTime：面板底部显示时间选择，点击\"确定\"提交。\n键盘：Tab 切换 input，方向键移动日期，Enter 选中，Esc 关闭。",
  "implemented": true
 },
 {
  "id": "form",
  "name": "Form",
  "cn": "表单",
  "cat": "数据录入",
  "figma": "1463-112293",
  "summary": "表单容器，处理布局、校验、提交、字段联动。",
  "guidance": "密集表单 horizontal 标签 6 列、控件 18 列；宽屏对话框用 vertical。",
  "props": [
   {
    "name": "layout",
    "type": "'horizontal' | 'vertical' | 'inline'",
    "default": "'horizontal'",
    "desc": "布局"
   },
   {
    "name": "initialValues",
    "type": "object",
    "default": "-",
    "desc": "初始值"
   },
   {
    "name": "onFinish",
    "type": "(values: object) => void",
    "default": "-",
    "desc": "提交回调"
   },
   {
    "name": "validateTrigger",
    "type": "string | string[]",
    "default": "'onChange'",
    "desc": "校验时机"
   }
  ],
  "tokens": [
   "--color-text-primary",
   "--color-error-normal",
   "--spacing-16"
  ],
  "skill": "【Form 交互 Skill】\nlayout: horizontal（label左，宽度比3:7）/ vertical（label上）/ inline（行内简短筛选）。\n\n校验时机：\n- rules 默认 trigger=onChange，失焦后首次触发，之后实时校验\n- validateTrigger=onBlur：仅失焦时校验（长文本/复杂输入）\n- Form.Item status=error 时 input border --color-error-normal，下方 message color --color-error-normal 12px\n\n提交流程：\n- 点击提交 → form.validateFields() → 全部通过才调接口\n- 提交期间按钮 loading=true，防重复提交\n- 接口失败：不清空表单，Toast error + 对应字段标红（如有）\n\n重置：恢复 initialValues，清除所有 error 状态。\n分步表单：Steps 指示进度，每步独立校验后再 next。",
  "implemented": true
 },
 {
  "id": "input",
  "name": "Input",
  "cn": "输入框",
  "cat": "数据录入",
  "figma": "1416-45643",
  "summary": "基础文本输入框，支持 prefix、suffix、addon、清除、密码切换。",
  "guidance": "密码、密钥使用 type=\"password\" + 切换图标；搜索使用 Input.Search。",
  "props": [
   {
    "name": "value",
    "type": "string",
    "default": "-",
    "desc": "输入值"
   },
   {
    "name": "prefix",
    "type": "ReactNode",
    "default": "-",
    "desc": "前缀"
   },
   {
    "name": "suffix",
    "type": "ReactNode",
    "default": "-",
    "desc": "后缀"
   },
   {
    "name": "allowClear",
    "type": "boolean",
    "default": "false",
    "desc": "允许清除"
   },
   {
    "name": "size",
    "type": "'large' | 'middle' | 'small'",
    "default": "'middle'",
    "desc": "尺寸"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-primary-normal",
   "var(--color-bg-card)"
  ],
  "skill": "【Input 交互 Skill】\n状态：\n- default: border 1px --color-border-base\n- hover: border-color --color-border-base-disable\n- focus: border-color --color-border-primary-normal(--color-primary-normal), box-shadow 0 0 0 3px --color-primary-bg\n- error: border-color --color-error-normal, focus shadow --color-error-bg\n- disabled: bg --color-bg-hover, opacity 0.6, cursor not-allowed\n- readonly: bg --color-bg-page, border --color-divider-base-1\n\n交互细节：\n- allowClear：有值时 hover/focus 显示 × icon，click 清空并 focus\n- prefix/suffix：左右 padding 自动扩展，icon color --color-text-auxiliary\n- addonBefore/After：bg --color-bg-page，border 共用，不圆角拼接\n- 字数限制：右下角显示 n/max，超出 color --color-error-normal\n- 搜索框（Search）：右侧搜索 icon 或按钮，Enter/click 触发\n\n输入验证：实时校验（onChange）或失焦校验（onBlur），错误态 + Form.Item message 组合。",
  "implemented": true
 },
 {
  "id": "input-number",
  "name": "InputNumber",
  "cn": "数字输入框",
  "cat": "数据录入",
  "figma": "1452-26685",
  "summary": "严格的数字输入控件，含步进按钮、最小最大值、精度控制。",
  "guidance": "金额使用 precision={2}；百分比使用 formatter/parser。",
  "props": [
   {
    "name": "value",
    "type": "number",
    "default": "-",
    "desc": "输入值"
   },
   {
    "name": "min",
    "type": "number",
    "default": "-Infinity",
    "desc": "最小值"
   },
   {
    "name": "max",
    "type": "number",
    "default": "Infinity",
    "desc": "最大值"
   },
   {
    "name": "step",
    "type": "number",
    "default": "1",
    "desc": "步进"
   },
   {
    "name": "precision",
    "type": "number",
    "default": "-",
    "desc": "小数精度"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-primary-normal"
  ],
  "skill": "【InputNumber 交互 Skill】\n交互：\n- hover：右侧显示 ↑↓ 步进箭头\n- ↑：+step，↓：-step；超出 min/max 时对应箭头 disabled\n- 直接输入：onBlur 时 clamp 到 [min, max] 范围并格式化 precision 小数位\n- 鼠标滚轮：focus 状态下 wheel 增减（可禁用 keyboard=false）\n\n格式化：\n- formatter + parser 配合使用（如千分位、货币符号）\n- precision 控制小数，不要在 formatter 中再做 toFixed",
  "implemented": true
 },
 {
  "id": "radio",
  "name": "Radio",
  "cn": "单选框",
  "cat": "数据录入",
  "figma": "1318-112964",
  "summary": "互斥选择控件，支持原生 radio、按钮组、卡片组三种样式。",
  "guidance": "2-3 个选项使用 button 样式；4+ 个使用 default。",
  "props": [
   {
    "name": "value",
    "type": "any",
    "default": "-",
    "desc": "选中值"
   },
   {
    "name": "options",
    "type": "RadioOption[]",
    "default": "-",
    "desc": "选项组"
   },
   {
    "name": "optionType",
    "type": "'default' | 'button'",
    "default": "'default'",
    "desc": "样式类型"
   },
   {
    "name": "buttonStyle",
    "type": "'outline' | 'solid'",
    "default": "'outline'",
    "desc": "按钮风格"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-border-base"
  ],
  "skill": "【Radio 交互 Skill】\n状态同 Checkbox（无 indeterminate）。\n\nRadio.Group：\n- 互斥选择，change 后立即生效（无需提交）\n- buttonStyle=solid：按钮组形态，选中 bg --color-primary-normal text #fff，未选 bg var(--color-bg-card)\n- buttonStyle=outline：线框形态，选中 border+text --color-primary-normal\n\n使用场景：\n- 选项 ≤ 4：Radio 水平排列\n- 选项 5-8：Radio vertical 排列\n- 选项 > 8：改用 Select\n- 需要立即触发操作（如切换视图模式）：Segmented 更合适",
  "implemented": true
 },
 {
  "id": "segmented",
  "name": "Segmented",
  "cn": "分段控制器",
  "cat": "数据录入",
  "figma": "1481-177125",
  "summary": "互斥的视图切换控件，比 Radio 更视觉强、比 Tabs 更轻量。",
  "guidance": "用于视图切换（卡片/列表/表格），不要用于表单字段。",
  "props": [
   {
    "name": "options",
    "type": "SegmentedOption[]",
    "default": "[]",
    "desc": "选项"
   },
   {
    "name": "value",
    "type": "string | number",
    "default": "-",
    "desc": "选中值"
   },
   {
    "name": "block",
    "type": "boolean",
    "default": "false",
    "desc": "撑满"
   },
   {
    "name": "size",
    "type": "'large' | 'middle' | 'small'",
    "default": "'middle'",
    "desc": "尺寸"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-bg-hover",
   "var(--color-bg-card)"
  ],
  "skill": "【Segmented 交互 Skill】\n交互：\n- 选中项：bg var(--color-bg-card)（白色卡片），box-shadow --shadow-1，文字 --color-text-primary，滑块动画 160ms\n- 未选：bg transparent，text --color-text-auxiliary\n- hover（未选）：text --color-text-secondary\n- disabled 某项：opacity 0.4，不可点\n\n使用场景：互斥视图切换（列表/卡片/地图），≤ 5 个选项，每项文字简短（≤ 4 字）。\n与 Radio.Group buttonStyle 区别：Segmented 视觉上是整体容器，Radio.Group 是独立按钮。\n宽度：options 等宽分配（block=true）或内容自适应。",
  "implemented": true
 },
 {
  "id": "select",
  "name": "Select",
  "cn": "选择器",
  "cat": "数据录入",
  "figma": "1424-136357",
  "summary": "下拉选择框，支持单选、多选、搜索、远程加载。",
  "guidance": "选项 ≤7 用 Radio；8-30 用 Select；>30 用 AutoComplete 或远程搜索。",
  "props": [
   {
    "name": "options",
    "type": "Option[]",
    "default": "[]",
    "desc": "选项列表"
   },
   {
    "name": "mode",
    "type": "'multiple' | 'tags'",
    "default": "-",
    "desc": "多选/标签"
   },
   {
    "name": "showSearch",
    "type": "boolean",
    "default": "false",
    "desc": "可搜索"
   },
   {
    "name": "allowClear",
    "type": "boolean",
    "default": "false",
    "desc": "允许清除"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--shadow-2"
  ],
  "skill": "【Select 交互 Skill】\n状态同 Input（default/hover/focus/error/disabled）。\n\n展开交互：\n- 下拉：fade + slide 200ms，最大高度 256px，超出内部滚动\n- 搜索（showSearch）：输入过滤 options，无结果显示 Empty 组件\n- 多选（multiple/tags）：选中项以 Tag 形式显示在输入框内，× 删除单项\n- 全选：Checkbox indeterminate + Select All 逻辑自定义实现\n- 清空（allowClear）：hover 时 × 替换 chevron\n\noptions 加载：异步时显示 Spin，加载失败显示重试文本，不显示空 Empty。\n超长 label：Tooltip 展示完整文本，option 内 ellipsis。",
  "implemented": true
 },
 {
  "id": "slider",
  "name": "Slider",
  "cn": "滑动输入条",
  "cat": "数据录入",
  "figma": "1453-4767",
  "summary": "区间内连续值选择，支持双滑块、刻度、提示。",
  "guidance": "价格区间用 range；连续配置项用单值滑块。",
  "props": [
   {
    "name": "value",
    "type": "number | [number, number]",
    "default": "-",
    "desc": "值"
   },
   {
    "name": "min",
    "type": "number",
    "default": "0",
    "desc": "最小值"
   },
   {
    "name": "max",
    "type": "number",
    "default": "100",
    "desc": "最大值"
   },
   {
    "name": "range",
    "type": "boolean",
    "default": "false",
    "desc": "双滑块"
   },
   {
    "name": "marks",
    "type": "object",
    "default": "-",
    "desc": "刻度"
   },
   {
    "name": "step",
    "type": "number",
    "default": "1",
    "desc": "步进"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50"
  ],
  "skill": "【Slider 交互 Skill】\n交互：\n- 拖拽 thumb：鼠标按下 thumb 放大 1.2x，拖拽中显示 Tooltip 当前值\n- 点击 track：跳到最近的 step 位置\n- 键盘（focus）：← → 按 step 移动，Home/End 跳 min/max\n\nrange=true（双向）：两个 thumb 不可交叉，最小间距 = step。\nmarks：显示刻度标记，点击刻度直接跳转。\n\n配合 InputNumber：Slider + InputNumber 联动，实时同步值，InputNumber blur 后 clamp。\ndisabled：track bg --color-divider-base-1，thumb 不可拖拽。",
  "implemented": true
 },
 {
  "id": "switch",
  "name": "Switch",
  "cn": "开关",
  "cat": "数据录入",
  "figma": "1318-116140",
  "summary": "二态开关，立即生效，无需提交按钮。",
  "guidance": "代价高的操作不要用 Switch；危险开关需二次确认。",
  "props": [
   {
    "name": "checked",
    "type": "boolean",
    "default": "false",
    "desc": "开关状态"
   },
   {
    "name": "size",
    "type": "'default' | 'small'",
    "default": "'default'",
    "desc": "尺寸"
   },
   {
    "name": "loading",
    "type": "boolean",
    "default": "false",
    "desc": "加载中"
   },
   {
    "name": "disabled",
    "type": "boolean",
    "default": "false",
    "desc": "禁用"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-gray-200"
  ],
  "skill": "【Switch 交互 Skill】\n交互：\n- 点击切换：thumb slide 动画 160ms，bg 从 --color-border-base 过渡到 --color-primary-normal\n- loading=true：thumb 显示 Spin，不可再次点击\n- checked：bg --color-primary-normal；unchecked：bg --color-border-base（不用灰色 bg 区分）\n\n使用场景：立即生效的全局/功能开关，如\"启用通知\"。\n需要确认再生效的操作不用 Switch，改用 Checkbox + 保存按钮。\nsize=sm（24px高）用于表格行内；size=md（28px高）用于表单。\n\nlabel 放 Switch 右侧（Form.Item label 在上时例外），说明当前状态（\"已开启\"/\"已关闭\"）。",
  "implemented": true
 },
 {
  "id": "time-picker",
  "name": "TimePicker",
  "cn": "时间选择框",
  "cat": "数据录入",
  "figma": "1476-23271",
  "summary": "时分秒选择器，支持 12 小时制、步进、范围选择。",
  "guidance": "调度类业务使用 minuteStep={5} 减少操作；定时任务支持秒级。",
  "props": [
   {
    "name": "value",
    "type": "Dayjs",
    "default": "-",
    "desc": "选中值"
   },
   {
    "name": "format",
    "type": "string",
    "default": "'HH:mm:ss'",
    "desc": "显示格式"
   },
   {
    "name": "hourStep",
    "type": "number",
    "default": "1",
    "desc": "小时步进"
   },
   {
    "name": "use12Hours",
    "type": "boolean",
    "default": "false",
    "desc": "12 小时制"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50"
  ],
  "skill": "【TimePicker 交互 Skill】\n面板：时 / 分 / 秒 三列滚动选择，点击或滚轮切换值，选中项居中高亮。\n\n交互：\n- disabledHours/Minutes/Seconds：对应项 opacity 0.4 不可点\n- 清空：allowClear × 图标\n- 键盘：↑↓ 调整当前列，Tab 切换列，Enter 确认，Esc 关闭\n\nuse12Hours：AM/PM 切换列附加在右侧。\nformat：'HH:mm'（不含秒）/ 'HH:mm:ss'（含秒），format 决定面板显示列数。",
  "implemented": true
 },
 {
  "id": "transfer",
  "name": "Transfer",
  "cn": "穿梭框",
  "cat": "数据录入",
  "figma": "1476-47478",
  "summary": "双列对照的多选控件，适合需要批量调整两侧数据的场景。",
  "guidance": "权限分配、字段映射等场景使用；候选项 >50 必须开 showSearch。",
  "props": [
   {
    "name": "dataSource",
    "type": "TransferItem[]",
    "default": "[]",
    "desc": "数据源"
   },
   {
    "name": "targetKeys",
    "type": "string[]",
    "default": "-",
    "desc": "目标列表 key"
   },
   {
    "name": "showSearch",
    "type": "boolean",
    "default": "false",
    "desc": "显示搜索"
   },
   {
    "name": "titles",
    "type": "[ReactNode, ReactNode]",
    "default": "['源列表','目标列表']",
    "desc": "标题"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50",
   "--color-bg-page"
  ],
  "skill": "【Transfer 交互 Skill】\n结构：左侧\"待选区\"＋中间操作按钮（→ / ←）＋右侧\"已选区\"。\n\n交互：\n- 勾选：左侧 Checkbox 选中 → 点击 → 移入右侧（动画 list 高度变化）\n- 全选：列表头部 Checkbox，indeterminate 表示部分选中\n- 搜索（showSearch）：各自独立过滤，不影响对方列表\n- 右侧项目可拖拽排序（可选）\n\n禁止：不要用 Transfer 做\"关联\"操作，只用于明确的\"分配/取消分配\"场景。\n超出高度：列表内部滚动，高度固定（listStyle={{ height:280 }}）。",
  "implemented": true
 },
 {
  "id": "tree-select",
  "name": "TreeSelect",
  "cn": "树选择",
  "cat": "数据录入",
  "figma": "1453-92859",
  "summary": "树形结构选择器，支持级联勾选、严格模式、搜索。",
  "guidance": "组织架构、地区、分类等层级数据首选 TreeSelect。",
  "props": [
   {
    "name": "treeData",
    "type": "TreeNode[]",
    "default": "[]",
    "desc": "树数据"
   },
   {
    "name": "multiple",
    "type": "boolean",
    "default": "false",
    "desc": "多选"
   },
   {
    "name": "treeCheckable",
    "type": "boolean",
    "default": "false",
    "desc": "显示复选框"
   },
   {
    "name": "showSearch",
    "type": "boolean",
    "default": "false",
    "desc": "可搜索"
   }
  ],
  "tokens": [
   "--color-primary-normal",
   "--color-brand-50"
  ],
  "skill": "【TreeSelect 交互 Skill】\n展开：点击 Input 区域显示树形 Popup，宽度同触发元素。\n\n树交互：\n- 展开/折叠节点：点击 chevron 图标，动画 160ms\n- 选择：点击 label 选中（单选模式关闭下拉，多选模式保持展开）\n- checkable 多选：父节点 indeterminate 状态表示部分子节点选中\n- showCheckedStrategy：SHOW_ALL / SHOW_PARENT / SHOW_CHILD 控制回显策略\n\n搜索（showSearch）：高亮匹配文字，自动展开匹配路径，不匹配节点折叠隐藏。",
  "implemented": true
 },
 {
  "id": "upload",
  "name": "Upload",
  "cn": "上传",
  "cat": "数据录入",
  "figma": "1471-13813",
  "summary": "文件上传组件，支持点击/拖拽、列表/卡片/头像三种 listType。",
  "guidance": "图片用 picture-card；文档用 text；前端预校验文件大小再发请求。",
  "props": [
   {
    "name": "accept",
    "type": "string",
    "default": "-",
    "desc": "接受类型"
   },
   {
    "name": "multiple",
    "type": "boolean",
    "default": "false",
    "desc": "多文件"
   },
   {
    "name": "listType",
    "type": "'text' | 'picture' | 'picture-card'",
    "default": "'text'",
    "desc": "列表样式"
   },
   {
    "name": "maxCount",
    "type": "number",
    "default": "-",
    "desc": "数量上限"
   }
  ],
  "tokens": [
   "--color-border-base",
   "--color-primary-normal",
   "--color-bg-page"
  ],
  "skill": "【Upload 交互 Skill】\ntype=button：按钮形态，点击打开文件选择器。\ntype=dragger：拖拽区域，drag over 时 border-color --color-primary-normal bg --color-primary-bg。\n\n上传流程：\n- 选文件 → beforeUpload 校验（类型/大小）→ 失败显示 error 状态 + message\n- 上传中：Progress bar（line类型），status=active\n- 成功：status=done，thumbnail/icon + 文件名 + 删除按钮\n- 失败：status=error，红色提示 + 重试按钮\n\nlistType=picture-card：n×n 缩略图网格，最后一格为上传触发区。\nmultiple=true：支持多选，maxCount 限制数量，超出禁止继续上传并提示。",
  "implemented": true
 },
 {
  "id": "tokens",
  "name": "Tokens",
  "cn": "设计令牌",
  "cat": "设计资源",
  "figma": "-",
  "summary": "全部设计令牌总览：颜色、间距、字号、圆角、阴影、字体。",
  "guidance": "所有组件样式必须使用 token 变量，禁止硬编码颜色/间距。",
  "props": [],
  "tokens": [
   "--color-*",
   "--spacing-*",
   "--radius-*",
   "--shadow-*",
   "--text-*"
  ],
  "skill": "【Design Tokens 交互 Skill】\nToken 使用原则：\n- 禁止直接写 hex 颜色，必须引用 CSS 变量（--color-primary-normal 而非 #3491fa）\n- 优先使用语义 token（--color-text-primary）而非基础 token（--color-gray-900）\n\n颜色层级：\n- 品牌色：--color-primary-normal / hover / active / bg（bg 用于轻量背景）\n- 语义色：success / error / warn / info，各含 bg 变体\n- 文字：primary(正文) > secondary(辅助) > tertiary(占位/注释) > disabled\n- 背景：base(白) > subtle(页面底色) > muted(禁用/tag底色)\n- 边框：subtle(卡片内) > default(卡片边) > strong(输入框focus前) > focus(聚焦环)\n\n间距用 --spacing-N，圆角用 --radius-N，阴影用 --shadow-N。\n新增自定义组件必须只用 token，不写硬编码值。",
  "implemented": false
 }
];
window.MS_BASE_INDEX = Object.fromEntries(window.MS_BASE_COMPONENTS.map(c => [c.id, c]));
