# -*- coding: utf-8 -*-
"""每个基础组件的可运行示例标记（HTML 片段）。

片段只使用 library/base.css 中的 ms-* 类与 L1 设计令牌，
因此每个示例都能离线打开，且与生成引擎产出的页面完全同源。
"""

# 示例里复用的内联 SVG 图标（不引任何图标库）
I = {
    'star': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3.1 1.3-6.6L2.5 9.5l6.6-.8L12 2.5z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    'chevron': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    'chevronR': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>',
    'close': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    'up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V6M6 12l6-6 6 6"/></svg>',
    'device': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10 7h4"/></svg>',
    'alarm': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg>',
    'reply': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 10 4 15l5 5"/><path d="M4 15h9a7 7 0 0 0 7-7V5"/></svg>',
    'warn': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4M12 17h.01"/></svg>',
    'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    'arrowR': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    'arrowL': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
}

DEMOS = {}

DEMOS['button'] = """
<div class="ms-space ms-space--12">
  <button class="ms-btn ms-btn--filled">主要操作</button>
  <button class="ms-btn">次要操作</button>
  <button class="ms-btn ms-btn--dashed">批量操作</button>
  <button class="ms-btn ms-btn--text">文字按钮</button>
  <button class="ms-btn ms-btn--link">链接按钮</button>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--12">
  <button class="ms-btn ms-btn--filled ms-btn--sm">小尺寸</button>
  <button class="ms-btn ms-btn--sm">小尺寸</button>
  <button class="ms-btn ms-btn--filled ms-btn--lg">大尺寸</button>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--12">
  <button class="ms-btn ms-btn--danger">删除</button>
  <button class="ms-btn ms-btn--filled ms-btn--danger">确认删除</button>
  <button class="ms-btn ms-btn--success">通过</button>
  <button class="ms-btn" disabled>禁用</button>
  <button class="ms-btn ms-btn--filled ms-btn--loading"><span class="ms-spin ms-spin--sm">◌</span>提交中</button>
</div>
<div class="ms-divider"></div>
<div class="ms-btn-group">
  <button class="ms-btn">日</button><button class="ms-btn ms-btn--filled">周</button><button class="ms-btn">月</button>
</div>
"""

DEMOS['icon'] = """
<div class="ms-space ms-space--16">
  <span class="ms-ico ms-ico--14">%(device)s</span>
  <span class="ms-ico ms-ico--16">%(alarm)s</span>
  <span class="ms-ico ms-ico--20">%(image)s</span>
  <span class="ms-ico ms-ico--24">%(search)s</span>
  <span class="ms-ico ms-ico--32">%(check)s</span>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--12">
  <button class="ms-btn"><span class="ms-ico ms-ico--16">%(plus)s</span>带图标按钮</button>
  <span class="ms-text ms-text--secondary ms-text--sm">图标尺寸跟随上下文：按钮内 14/16，标题旁 20，空态 32。</span>
</div>
""" % I

DEMOS['typography'] = """
<h1 class="ms-h1">H1 · 页面主标题 28/600</h1>
<h2 class="ms-h2">H2 · 区块标题 22/600</h2>
<h3 class="ms-h3">H3 · 卡片标题 18/600</h3>
<h4 class="ms-h4">H4 · 小标题 16/600</h4>
<h5 class="ms-h5">H5 · 列表标题 14/600</h5>
<div class="ms-divider"></div>
<p class="ms-text">正文 14/1.6，用于表单说明与段落。</p>
<p class="ms-text ms-text--secondary">次要文本，用于描述与辅助信息。</p>
<p class="ms-text ms-text--auxiliary ms-text--sm">辅助文本，用于时间戳与占位提示。</p>
<p class="ms-text ms-text--disabled">禁用文本。</p>
<p class="ms-text"><span class="ms-text--strong">强调</span> · <a class="ms-link">链接</a> · <code class="ms-text--code">代码</code></p>
<div class="ms-divider"></div>
<div style="max-width:260px"><div class="ms-text ms-ellipsis">超长文本截断演示：这是一段会被省略号截断的很长的设备名称</div></div>
"""

DEMOS['logo'] = """
<div class="ms-space ms-space--24">
  <a class="ms-logo"><span class="ms-logo-mark">M</span><span class="ms-logo-text">Milesight IoT</span></a>
  <a class="ms-logo ms-logo--sm"><span class="ms-logo-mark">M</span><span class="ms-logo-text">Milesight</span></a>
  <a class="ms-logo ms-logo--icon"><span class="ms-logo-mark">M</span><span class="ms-logo-text">Milesight IoT</span></a>
</div>
<div class="ms-divider"></div>
<div style="background:var(--color-text-primary);padding:12px 16px;border-radius:8px">
  <a class="ms-logo ms-logo--dark"><span class="ms-logo-mark">M</span><span class="ms-logo-text">深色底反色版</span></a>
</div>
"""

DEMOS['divider'] = """
<p class="ms-text">上方内容</p>
<hr class="ms-divider" />
<p class="ms-text">下方内容</p>
<hr class="ms-divider ms-divider--dashed" />
<div class="ms-divider ms-divider--text">或</div>
<p class="ms-text">文本 A<span class="ms-divider--vertical"></span>文本 B</p>
"""

DEMOS['grid'] = """
<div class="ms-row">
  <div class="ms-col ms-col--12"><div class="ms-card"><div class="ms-card-body">col-12</div></div></div>
  <div class="ms-col ms-col--12"><div class="ms-card"><div class="ms-card-body">col-12</div></div></div>
</div>
<div class="ms-divider"></div>
<div class="ms-row">
  <div class="ms-col ms-col--8"><div class="ms-card"><div class="ms-card-body">col-8</div></div></div>
  <div class="ms-col ms-col--8"><div class="ms-card"><div class="ms-card-body">col-8</div></div></div>
  <div class="ms-col ms-col--8"><div class="ms-card"><div class="ms-card-body">col-8</div></div></div>
</div>
<div class="ms-divider"></div>
<div class="ms-row">
  <div class="ms-col ms-col--6"><div class="ms-card"><div class="ms-card-body">6</div></div></div>
  <div class="ms-col ms-col--18"><div class="ms-card"><div class="ms-card-body">18</div></div></div>
</div>
"""

DEMOS['layout'] = """
<div style="border:1px solid var(--color-border-base);border-radius:12px;overflow:hidden">
  <div class="ms-shell" style="min-height:320px">
    <aside class="ms-sidebar" style="width:180px">
      <div class="ms-sidebar-brand"><span class="ms-sidebar-brand-mark">M</span></div>
      <div class="ms-sidebar-body"><nav class="ms-nav"><a class="ms-nav-item ms-nav-item--active">概览</a><a class="ms-nav-item">设备</a></nav></div>
    </aside>
    <div class="ms-main">
      <header class="ms-header"><span class="ms-text--strong">Header 56px</span></header>
      <div class="ms-content"><div class="ms-card"><div class="ms-card-body">Content 区</div></div></div>
    </div>
  </div>
</div>
"""

DEMOS['space'] = """
<div class="ms-space ms-space--12">
  <button class="ms-btn">按钮</button><button class="ms-btn">按钮</button><button class="ms-btn">按钮</button>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--vertical ms-space--8" style="width:220px">
  <button class="ms-btn ms-btn--block">纵向排列</button><button class="ms-btn ms-btn--block">纵向排列</button>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--16 ms-space--fill ms-space--between">
  <span class="ms-text">左侧标题</span><button class="ms-btn ms-btn--sm">右侧操作</button>
</div>
"""

DEMOS['affix'] = """
<div class="ms-affix ms-affix--sticky" style="top:0">
  <div class="ms-affix-body">
    <div class="ms-card"><div class="ms-card-body ms-card-body--tight">
      <div class="ms-space ms-space--8 ms-space--fill ms-space--between">
        <span class="ms-text--strong">吸顶操作栏（offsetTop=0）</span>
        <span class="ms-space ms-space--8"><button class="ms-btn ms-btn--sm">取消</button><button class="ms-btn ms-btn--sm ms-btn--filled">保存</button></span>
      </div>
    </div></div>
  </div>
</div>
<p class="ms-text ms-text--secondary ms-text--sm">向下滚动页面，上方操作栏会吸附在顶部；占位元素保持原高度，页面不会跳动。</p>
<div style="height:520px"></div>
"""

DEMOS['page-header'] = """
<div class="ms-page-header">
  <div class="ms-page-header-main">
    <div class="ms-page-header-title"><h1 class="ms-h3">设备管理</h1><span class="ms-tag ms-tag--success"><i class="ms-tag-dot"></i>运行中</span></div>
    <div class="ms-page-header-desc">共 12,846 台设备，其中 1,642 台离线</div>
  </div>
  <div class="ms-page-header-extra">
    <button class="ms-btn">刷新</button>
    <button class="ms-btn ms-btn--filled">%(plusicon)s新增设备</button>
  </div>
</div>
""" % {'plusicon': '<span class="ms-ico ms-ico--14">' + I['plus'] + '</span>'}

DEMOS['breadcrumb'] = """
<nav class="ms-breadcrumb">
  <a>首页</a><span class="ms-breadcrumb-sep">/</span>
  <a>设备管理</a><span class="ms-breadcrumb-sep">/</span>
  <span>设备详情</span>
</nav>
"""

DEMOS['nav-menu'] = """
<div style="width:220px">
  <div class="ms-nav-group">监控</div>
  <nav class="ms-nav">
    <a class="ms-nav-item ms-nav-item--active">%(dashicon)s<span>概览</span></a>
    <a class="ms-nav-item">%(alarmicon)s<span>告警中心</span><span class="ms-nav-count">18</span></a>
    <a class="ms-nav-item">%(deviceicon)s<span>设备管理</span><span class="ms-nav-count">12.8k</span></a>
  </nav>
  <div class="ms-nav-group">系统</div>
  <nav class="ms-nav">
    <a class="ms-nav-item">%(checkicon)s<span>审计日志</span></a>
  </nav>
</div>
""" % {'dashicon': '<span class="ms-ico ms-ico--16">' + I['device'] + '</span>',
        'alarmicon': '<span class="ms-ico ms-ico--16">' + I['alarm'] + '</span>',
        'deviceicon': '<span class="ms-ico ms-ico--16">' + I['device'] + '</span>',
        'checkicon': '<span class="ms-ico ms-ico--16">' + I['check'] + '</span>'}

DEMOS['pagination'] = """
<div class="ms-pagination">
  <span class="ms-page-item" disabled>‹</span>
  <span class="ms-page-item ms-page-item--active">1</span>
  <span class="ms-page-item">2</span>
  <span class="ms-page-item">3</span>
  <span class="ms-page-item">…</span>
  <span class="ms-page-item">18</span>
  <span class="ms-page-item">›</span>
  <span class="ms-page-jump">跳至<input value="1">页</span>
</div>
"""

DEMOS['steps'] = """
<div class="ms-steps">
  <div class="ms-step ms-step--done"><span class="ms-step-index">%(check)s</span><div class="ms-step-body"><div class="ms-step-title">选择版本</div><div class="ms-step-desc">v2.4.1</div></div><i class="ms-step-line"></i></div>
  <div class="ms-step ms-step--active"><span class="ms-step-index">2</span><div class="ms-step-body"><div class="ms-step-title">选择设备</div><div class="ms-step-desc">1,208 台</div></div><i class="ms-step-line"></i></div>
  <div class="ms-step"><span class="ms-step-index">3</span><div class="ms-step-body"><div class="ms-step-title">灰度策略</div><div class="ms-step-desc">待设置</div></div></div>
</div>
""" % {'check': '<span class="ms-ico ms-ico--14">' + I['check'] + '</span>'}

DEMOS['dropdown-menu'] = """
<div class="ms-dropdown" style="max-width:200px">
  <div class="ms-dropdown-item">%(editicon)s编辑</div>
  <div class="ms-dropdown-item">%(copyicon)s复制</div>
  <div class="ms-dropdown-sep"></div>
  <div class="ms-dropdown-item ms-dropdown-item--danger">%(trashicon)s删除</div>
</div>
""" % {'editicon': '<span class="ms-ico ms-ico--14">' + I['check'] + '</span>',
        'copyicon': '<span class="ms-ico ms-ico--14">' + I['image'] + '</span>',
        'trashicon': '<span class="ms-ico ms-ico--14">' + I['close'] + '</span>'}

DEMOS['tabs'] = """
<div class="ms-tabs">
  <span class="ms-tab ms-tab--active">设备列表</span>
  <span class="ms-tab">分组管理</span>
  <span class="ms-tab">回收站<span class="ms-tag ms-tag--error ms-tab-badge">3</span></span>
</div>
<div class="ms-divider"></div>
<div class="ms-tabs ms-tabs--card">
  <span class="ms-tab ms-tab--active">日</span><span class="ms-tab">周</span><span class="ms-tab">月</span>
</div>
"""

DEMOS['anchor'] = """
<div style="display:grid;grid-template-columns:200px 1fr;gap:24px">
  <div class="ms-anchor-wrap">
    <div class="ms-anchor">
      <span class="ms-anchor-item ms-anchor-item--active">基础信息</span>
      <span class="ms-anchor-item">遥测配置</span>
      <span class="ms-anchor-item">告警规则</span>
      <span class="ms-anchor-item">操作日志</span>
    </div>
  </div>
  <div class="ms-text ms-text--secondary ms-text--sm">Anchor 固定在内容区右侧（sticky top 24px），只处理 H2/H3 级标题；移动端隐藏并改用 BackTop。</div>
</div>
"""

DEMOS['backtop'] = """
<div class="ms-text ms-text--secondary ms-text--sm">页面滚动超过 400px 后，右下角出现回到顶部按钮；hover 时填充主色。</div>
<div class="ms-space ms-space--12" style="margin-top:12px">
  <span class="ms-backtop">%(upicon)s</span>
  <span class="ms-backtop ms-backtop--hidden">%(upicon)s</span>
  <span class="ms-text ms-text--auxiliary ms-text--sm">（右侧为隐藏态，用于对照）</span>
</div>
""" % {'upicon': '<span class="ms-ico ms-ico--20">' + I['up'] + '</span>'}

DEMOS['input'] = """
<div class="ms-stack ms-stack--tight" style="max-width:420px">
  <label class="ms-input"><input placeholder="基础输入框" value=""></label>
  <label class="ms-input">%(searchicon)s<input placeholder="带前缀图标" value=""></label>
  <label class="ms-input ms-input--error">%(warnicon)s<input value="校验失败的内容"></label>
  <label class="ms-input ms-input--disabled"><input value="禁用态" disabled></label>
  <label class="ms-input ms-input--textarea"><textarea rows="3" placeholder="多行文本域"></textarea></label>
</div>
""" % {'searchicon': '<span class="ms-input-affix"><span class="ms-ico ms-ico--14">' + I['search'] + '</span></span>',
        'warnicon': '<span class="ms-input-affix"><span class="ms-ico ms-ico--14">' + I['warn'] + '</span></span>'}

DEMOS['input-number'] = """
<div class="ms-space ms-space--12">
  <span class="ms-input-number" style="width:140px">
    <input value="45">
    <span class="ms-input-number-step"><button>▴</button><button>▾</button></span>
  </span>
  <span class="ms-text ms-text--secondary ms-text--sm">阈值、数量、间隔等数值录入</span>
</div>
"""

DEMOS['select'] = """
<div class="ms-stack ms-stack--tight" style="max-width:420px">
  <span class="ms-select"><select><option>在线</option><option>离线</option><option>告警</option></select></span>
  <span class="ms-select ms-select--sm"><select><option>小尺寸选择器</option></select></span>
  <span class="ms-select ms-select--error"><select><option>校验失败态</option></select></span>
  <span class="ms-select"><select disabled><option>禁用态</option></select></span>
</div>
"""

DEMOS['checkbox'] = """
<div class="ms-space ms-space--16">
  <label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>已选中</label>
  <label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>未选中</label>
  <label class="ms-checkbox"><input type="checkbox" onclick="return false" class="js-indet"><span class="ms-checkbox-box"></span>半选（indeterminate）</label>
  <label class="ms-checkbox"><input type="checkbox" disabled><span class="ms-checkbox-box"></span>禁用</label>
</div>
<script>document.querySelector('.js-indet').indeterminate = true;</script>
"""

DEMOS['radio'] = """
<div class="ms-space ms-space--16">
  <label class="ms-radio"><input type="radio" name="r1" checked><span class="ms-radio-dot"></span>按设备</label>
  <label class="ms-radio"><input type="radio" name="r1"><span class="ms-radio-dot"></span>按分组</label>
  <label class="ms-radio"><input type="radio" name="r1" disabled><span class="ms-radio-dot"></span>禁用</label>
</div>
"""

DEMOS['switch'] = """
<div class="ms-space ms-space--16">
  <label class="ms-switch"><input type="checkbox" checked><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
  <label class="ms-switch"><input type="checkbox"><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
  <label class="ms-switch ms-switch--sm"><input type="checkbox" checked><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
  <label class="ms-switch"><input type="checkbox" disabled><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
</div>
"""

DEMOS['slider'] = """
<div style="max-width:420px">
  <div class="ms-slider"><i class="ms-slider-fill" style="width:35%%"></i><i class="ms-slider-handle" style="left:35%%"></i></div>
  <div class="ms-text ms-text--secondary ms-text--sm">连续触发 3 个采样点后告警</div>
</div>
"""

DEMOS['date-picker'] = """
<div class="ms-space ms-space--16" style="align-items:flex-start">
  <span class="ms-datepicker" style="width:220px"><label class="ms-input"><input value="2026-08-01 ~ 2026-08-31" readonly></label></span>
  <div class="ms-datepicker-panel">
    <div class="ms-datepicker-head">
      <button class="ms-btn ms-btn--sm ms-btn--text">‹</button>
      <span class="ms-text--strong">2026 年 8 月</span>
      <button class="ms-btn ms-btn--sm ms-btn--text">›</button>
    </div>
    <div class="ms-datepicker-grid">
      <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--muted">27</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--muted">28</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--muted">29</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--muted">30</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--muted">31</span>
      <span class="ms-datepicker-cell">1</span>
      <span class="ms-datepicker-cell">2</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--today">3</span>
      <span class="ms-datepicker-cell">4</span>
      <span class="ms-datepicker-cell ms-datepicker-cell--active">5</span>
      <span class="ms-datepicker-cell">6</span>
    </div>
  </div>
</div>
"""

DEMOS['time-picker'] = """
<div class="ms-timepicker">
  <div class="ms-timepicker-col">
    <div class="ms-timepicker-cell">08</div>
    <div class="ms-timepicker-cell ms-timepicker-cell--active">09</div>
    <div class="ms-timepicker-cell">10</div>
    <div class="ms-timepicker-cell ms-timepicker-cell--disabled">11</div>
  </div>
  <div class="ms-timepicker-col">
    <div class="ms-timepicker-cell">00</div>
    <div class="ms-timepicker-cell ms-timepicker-cell--active">30</div>
    <div class="ms-timepicker-cell">45</div>
  </div>
  <div class="ms-timepicker-col">
    <div class="ms-timepicker-cell ms-timepicker-cell--active">00</div>
    <div class="ms-timepicker-cell">15</div>
    <div class="ms-timepicker-cell">30</div>
  </div>
</div>
"""

DEMOS['upload'] = """
<div class="ms-stack ms-stack--tight" style="max-width:460px">
  <div class="ms-upload">
    %(upicon)s
    <span class="ms-text--strong">点击或拖拽文件到此处上传</span>
    <span class="ms-text--sm ms-text--auxiliary">支持 .bin / .json，单个文件不超过 50MB</span>
  </div>
  <div class="ms-upload-file">%(checkicon)s<span>firmware-v2.4.1.bin</span><span class="ms-text--auxiliary ms-text--sm" style="margin-left:auto">2.4 MB</span></div>
</div>
""" % {'upicon': '<span class="ms-ico ms-ico--24">' + I['up'] + '</span>',
        'checkicon': '<span class="ms-ico ms-ico--16">' + I['check'] + '</span>'}

DEMOS['form'] = """
<div class="ms-form" style="max-width:520px">
  <div class="ms-form-section">
    <div class="ms-form-section-title">基础信息</div>
    <div class="ms-form-item ms-form-item--inline">
      <label class="ms-form-label ms-form-label--required">设备名称</label>
      <div class="ms-form-control"><label class="ms-input"><input value="云谷工厂 3 号"></label></div>
    </div>
    <div class="ms-form-item ms-form-item--inline">
      <label class="ms-form-label">生效范围</label>
      <div class="ms-form-control"><span class="ms-select"><select><option>全部分组</option></select></span></div>
    </div>
  </div>
  <div class="ms-divider"></div>
  <div class="ms-form-item">
    <label class="ms-form-label ms-form-label--required">备注</label>
    <label class="ms-input ms-input--error"><textarea rows="2">内容不符合要求</textarea></label>
    <div class="ms-form-error">%(warnicon)s备注不能超过 200 字</div>
    <div class="ms-form-help">该备注会展示在设备详情页</div>
  </div>
</div>
""" % {'warnicon': '<span class="ms-ico ms-ico--14">' + I['warn'] + '</span>'}

DEMOS['segmented'] = """
<div class="ms-space ms-space--12">
  <span class="ms-segmented">
    <span class="ms-segmented-item">1H</span>
    <span class="ms-segmented-item ms-segmented-item--active">24H</span>
    <span class="ms-segmented-item">7D</span>
    <span class="ms-segmented-item">30D</span>
  </span>
  <span class="ms-segmented">
    <span class="ms-segmented-item ms-segmented-item--active">按网关</span>
    <span class="ms-segmented-item">按区域</span>
  </span>
</div>
"""

DEMOS['auto-complete'] = """
<div class="ms-stack ms-stack--tight" style="max-width:360px">
  <div class="ms-autocomplete">
    <label class="ms-input">%(searchicon)s<input value="云谷" placeholder="输入关键词联想"></label>
    <div class="ms-autocomplete-panel">
      <div class="ms-autocomplete-group">匹配设备</div>
      <div class="ms-autocomplete-item ms-autocomplete-item--active"><mark>云谷</mark>工厂 1 号</div>
      <div class="ms-autocomplete-item"><mark>云谷</mark>工厂 3 号</div>
      <div class="ms-autocomplete-item"><mark>云谷</mark>仓库 2 号</div>
    </div>
  </div>
  <div class="ms-autocomplete" style="position:relative">
    <label class="ms-input"><input value="不存在的关键词"></label>
    <div class="ms-autocomplete-panel"><div class="ms-autocomplete-empty">无匹配结果</div></div>
  </div>
</div>
""" % {'searchicon': '<span class="ms-input-affix"><span class="ms-ico ms-ico--14">' + I['search'] + '</span></span>'}

DEMOS['cascader'] = """
<div class="ms-cascader">
  <div class="ms-cascader-col">
    <div class="ms-cascader-node ms-cascader-node--active">华东<span class="ms-cascader-arrow">%(chevronR)s</span></div>
    <div class="ms-cascader-node">华南<span class="ms-cascader-arrow">%(chevronR)s</span></div>
    <div class="ms-cascader-node ms-cascader-node--disabled">华北（无权限）</div>
  </div>
  <div class="ms-cascader-col">
    <div class="ms-cascader-node">杭州<span class="ms-cascader-arrow">%(chevronR)s</span></div>
    <div class="ms-cascader-node ms-cascader-node--active">苏州<span class="ms-cascader-arrow">%(chevronR)s</span></div>
  </div>
  <div class="ms-cascader-col">
    <div class="ms-cascader-node">工业园区</div>
    <div class="ms-cascader-node ms-cascader-node--active">云谷工厂</div>
  </div>
</div>
""" % {'chevronR': '<span class="ms-ico ms-ico--14">' + I['chevronR'] + '</span>'}

DEMOS['tree-select'] = """
<div class="ms-treeselect-panel">
  <div class="ms-treeselect-search"><label class="ms-input ms-input--sm">%(searchicon)s<input placeholder="搜索分组"></label></div>
  <div class="ms-tree">
    <div class="ms-tree-node"><span class="ms-tree-arrow">%(chevron)s</span>全部分组<span class="ms-tree-count">12.8k</span></div>
    <div class="ms-tree-node ms-tree-node--active" style="padding-left:24px"><span class="ms-tree-arrow"></span>生产车间<span class="ms-tree-count">4.2k</span></div>
    <div class="ms-tree-node" style="padding-left:24px"><span class="ms-tree-arrow">%(chevron)s</span>仓储物流<span class="ms-tree-count">3.1k</span></div>
    <div class="ms-tree-node" style="padding-left:40px"><span class="ms-tree-arrow"></span>临江仓库<span class="ms-tree-count">820</span></div>
  </div>
</div>
""" % {'searchicon': '<span class="ms-input-affix"><span class="ms-ico ms-ico--14">' + I['search'] + '</span></span>',
        'chevron': '<span class="ms-ico ms-ico--14">' + I['chevron'] + '</span>'}

DEMOS['transfer'] = """
<div class="ms-transfer">
  <div class="ms-transfer-panel">
    <div class="ms-transfer-head"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>待选设备</label><span class="ms-transfer-head-count">6/12846</span></div>
    <div class="ms-transfer-body">
      <div class="ms-transfer-item"><label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>云谷工厂 1 号</label></div>
      <div class="ms-transfer-item"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>云谷工厂 3 号</label></div>
      <div class="ms-transfer-item"><label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>临江仓库 2 号</label></div>
      <div class="ms-transfer-item"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>南山基站 4 号</label></div>
    </div>
  </div>
  <div class="ms-transfer-ops">
    <button class="ms-btn ms-btn--sm">%(arrowR)s</button>
    <button class="ms-btn ms-btn--sm">%(arrowL)s</button>
  </div>
  <div class="ms-transfer-panel">
    <div class="ms-transfer-head"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>已选设备</label><span class="ms-transfer-head-count">0/2</span></div>
    <div class="ms-transfer-empty">暂无数据</div>
  </div>
</div>
""" % {'arrowR': '<span class="ms-ico ms-ico--16">' + I['arrowR'] + '</span>',
        'arrowL': '<span class="ms-ico ms-ico--16">' + I['arrowL'] + '</span>'}

DEMOS['avatar'] = """
<div class="ms-space ms-space--16">
  <span class="ms-avatar ms-avatar--sm">陈</span>
  <span class="ms-avatar">陈</span>
  <span class="ms-avatar ms-avatar--lg">陈</span>
  <span class="ms-avatar ms-avatar--square">M</span>
</div>
<div class="ms-divider"></div>
<div class="ms-avatar-group">
  <span class="ms-avatar">陈</span><span class="ms-avatar">林</span><span class="ms-avatar">苏</span><span class="ms-avatar ms-avatar--more">+5</span>
</div>
"""

DEMOS['badge'] = """
<div class="ms-space ms-space--24">
  <span class="ms-badge">%(alarmicon)s<span class="ms-badge-count">18</span></span>
  <span class="ms-badge">%(alarmicon)s<span class="ms-badge-count">9+</span></span>
  <span class="ms-badge">%(deviceicon)s<span class="ms-badge-dot"></span></span>
  <span class="ms-badge">%(deviceicon)s<span class="ms-badge-dot" style="background:var(--color-success-normal)"></span></span>
</div>
""" % {'alarmicon': '<span class="ms-ico ms-ico--20">' + I['alarm'] + '</span>',
        'deviceicon': '<span class="ms-ico ms-ico--20">' + I['device'] + '</span>'}

DEMOS['calendar'] = """
<div class="ms-calendar" style="max-width:560px">
  <div class="ms-calendar-head">
    <span class="ms-text--strong">2026 年 8 月</span>
    <span class="ms-space ms-space--8">
      <span class="ms-select ms-select--sm"><select><option>2026</option></select></span>
      <span class="ms-select ms-select--sm"><select><option>8 月</option></select></span>
    </span>
  </div>
  <div class="ms-calendar-grid">
    <div class="ms-calendar-week">一</div><div class="ms-calendar-week">二</div><div class="ms-calendar-week">三</div>
    <div class="ms-calendar-week">四</div><div class="ms-calendar-week">五</div><div class="ms-calendar-week">六</div><div class="ms-calendar-week">日</div>
    <div class="ms-calendar-cell ms-calendar-cell--muted"><span class="ms-calendar-date">27</span></div>
    <div class="ms-calendar-cell ms-calendar-cell--muted"><span class="ms-calendar-date">28</span></div>
    <div class="ms-calendar-cell"><span class="ms-calendar-date">1</span></div>
    <div class="ms-calendar-cell"><span class="ms-calendar-date">2</span></div>
    <div class="ms-calendar-cell ms-calendar-cell--today"><span class="ms-calendar-date">3</span></div>
    <div class="ms-calendar-cell ms-calendar-cell--selected"><span class="ms-calendar-date">4</span><div class="ms-calendar-note"><span class="ms-tag ms-tag--error">告警 2</span></div></div>
    <div class="ms-calendar-cell"><span class="ms-calendar-date">5</span></div>
  </div>
</div>
"""

DEMOS['card'] = """
<div class="ms-card" style="max-width:520px">
  <div class="ms-card-head">
    <div class="ms-card-title">%(deviceicon)s云谷工厂 3 号</div>
    <div class="ms-card-extra"><span class="ms-tag ms-tag--success"><i class="ms-tag-dot"></i>在线</span></div>
  </div>
  <div class="ms-card-body">
    <div class="ms-desc">
      <div class="ms-desc-item"><div class="ms-desc-label">型号</div><div class="ms-desc-value">VS121</div></div>
      <div class="ms-desc-item"><div class="ms-desc-label">最后上报</div><div class="ms-desc-value">2026-08-31 14:02</div></div>
    </div>
  </div>
  <div class="ms-card-foot"><button class="ms-btn ms-btn--sm">编辑</button><button class="ms-btn ms-btn--sm ms-btn--filled">详情</button></div>
</div>
""" % {'deviceicon': '<span class="ms-ico ms-ico--20">' + I['device'] + '</span>'}

DEMOS['collapse'] = """
<div class="ms-collapse" style="max-width:520px">
  <div class="ms-collapse-item ms-collapse-item--open">
    <div class="ms-collapse-head"><span class="ms-collapse-caret">%(chevron)s</span>基础信息<span class="ms-collapse-extra"><span class="ms-tag ms-tag--success">已填写</span></span></div>
    <div class="ms-collapse-body">设备名称、型号、所属分组等基础属性。</div>
  </div>
  <div class="ms-collapse-item">
    <div class="ms-collapse-head"><span class="ms-collapse-caret">%(chevron)s</span>遥测配置<span class="ms-collapse-extra"><span class="ms-tag ms-tag--error">1 项错误</span></span></div>
  </div>
  <div class="ms-collapse-item">
    <div class="ms-collapse-head"><span class="ms-collapse-caret">%(chevron)s</span>告警规则</div>
  </div>
</div>
<div class="ms-divider"></div>
<div class="ms-collapse ms-collapse--ghost" style="max-width:520px">
  <div class="ms-collapse-item ms-collapse-item--open">
    <div class="ms-collapse-head"><span class="ms-collapse-caret">%(chevron)s</span>Ghost 模式（无边框）</div>
    <div class="ms-collapse-body">用于页面内嵌说明区。</div>
  </div>
  <div class="ms-collapse-item"><div class="ms-collapse-head"><span class="ms-collapse-caret">%(chevron)s</span>常见问题</div></div>
</div>
""" % {'chevron': '<span class="ms-ico ms-ico--14">' + I['chevron'] + '</span>'}

DEMOS['comment'] = """
<div class="ms-comment">
  <span class="ms-avatar">林</span>
  <div class="ms-comment-main">
    <div class="ms-comment-head"><span class="ms-comment-author">林见川</span><span class="ms-comment-time">3 分钟前</span></div>
    <div class="ms-comment-content">温度阈值建议从 50℃ 下调到 45℃，上周有两台设备持续超标。</div>
    <div class="ms-comment-actions">
      <span class="ms-comment-action ms-comment-action--active">%(hearticon)s 12</span>
      <span class="ms-comment-action">%(replyicon)s 回复</span>
    </div>
    <div class="ms-comment-children">
      <div class="ms-comment">
        <span class="ms-avatar ms-avatar--sm">陈</span>
        <div class="ms-comment-main">
          <div class="ms-comment-head"><span class="ms-comment-author">陈亦然</span><span class="ms-comment-time">1 分钟前</span></div>
          <div class="ms-comment-content">同意，先在生产车间灰度。</div>
        </div>
      </div>
    </div>
  </div>
</div>
""" % {'hearticon': '<span class="ms-ico ms-ico--14">' + I['heart'] + '</span>',
        'replyicon': '<span class="ms-ico ms-ico--14">' + I['reply'] + '</span>'}

DEMOS['descriptions'] = """
<div class="ms-desc" style="max-width:560px">
  <div class="ms-desc-item"><div class="ms-desc-label">设备 EUI</div><div class="ms-desc-value"><code class="ms-text--code">24E1A2B30001C7D5</code></div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">型号</div><div class="ms-desc-value">VS121</div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">所属分组</div><div class="ms-desc-value">生产车间</div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">最后上报</div><div class="ms-desc-value">2026-08-31 14:02</div></div>
</div>
<div class="ms-divider"></div>
<div class="ms-desc ms-desc--bordered" style="max-width:560px">
  <div class="ms-desc-item"><div class="ms-desc-label">固件版本</div><div class="ms-desc-value">v2.4.1</div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">信号强度</div><div class="ms-desc-value">-78 dBm</div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">电量</div><div class="ms-desc-value">86%%</div></div>
  <div class="ms-desc-item"><div class="ms-desc-label">状态</div><div class="ms-desc-value"><span class="ms-tag ms-tag--success"><i class="ms-tag-dot"></i>在线</span></div></div>
</div>
"""

DEMOS['empty'] = """
<div class="ms-card" style="max-width:520px">
  <div class="ms-empty">
    <svg class="ms-empty-illu" viewBox="0 0 120 88" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="14" y="20" width="92" height="56" rx="8" stroke="var(--color-border-base)"/>
      <path d="M14 34h92" stroke="var(--color-border-base)"/>
      <circle cx="24" cy="27" r="2" fill="var(--color-border-base)" stroke="none"/>
      <path d="M34 52h52M34 62h34" stroke="var(--color-divider-base-2)"/>
    </svg>
    <div class="ms-empty-text">还没有设备数据</div>
    <div class="ms-space ms-space--8"><button class="ms-btn ms-btn--filled">立即创建设备</button><button class="ms-btn">查看接入文档</button></div>
  </div>
</div>
"""

DEMOS['image'] = """
<div class="ms-space ms-space--16" style="align-items:flex-start">
  <div class="ms-image" style="width:160px;height:100px">
    <span class="ms-image--fallback" style="width:100%%;height:100%%">%(imageicon)s</span>
    <div class="ms-image-caption">现场照片 · 2026-08-31</div>
  </div>
  <div class="ms-image" style="width:120px;height:100px">
    <span class="ms-image--fallback" style="width:100%%;height:100%%">%(imageicon)s</span>
  </div>
  <div class="ms-text ms-text--secondary ms-text--sm" style="max-width:240px">
    示例用占位块代替真实图片，避免外部依赖。实际使用替换为 &lt;img src="…"&gt;；
    preview 打开全屏遮罩（--surface-mask），加载失败回退到 fallback 图标。
  </div>
</div>
""" % {'imageicon': '<span class="ms-ico ms-ico--24">' + I['image'] + '</span>'}

DEMOS['list'] = """
<div class="ms-card" style="max-width:520px">
  <div class="ms-list">
    <div class="ms-list-item">
      <span class="ms-avatar">陈</span>
      <span class="ms-list-meta"><span class="ms-list-title">批量升级固件 v2.4.1</span><span class="ms-list-desc">影响 1,208 台设备 · 2026-08-31 16:42</span></span>
      <span class="ms-list-actions"><button class="ms-btn ms-btn--sm ms-btn--text">详情</button></span>
    </div>
    <div class="ms-list-item">
      <span class="ms-avatar">林</span>
      <span class="ms-list-meta"><span class="ms-list-title">修改告警规则「温度超限」</span><span class="ms-list-desc">阈值 50℃ → 45℃ · 2026-08-31 15:20</span></span>
      <span class="ms-list-actions"><button class="ms-btn ms-btn--sm ms-btn--text">详情</button></span>
    </div>
  </div>
</div>
"""

DEMOS['popover'] = """
<div class="ms-popover">
  <div class="ms-popover-title">采集频率</div>
  <div class="ms-popover-body">当前 10 分钟/次。频率越高功耗越大，建议室外电池供电设备不低于 15 分钟。</div>
</div>
"""

DEMOS['rate'] = """
<div class="ms-stack ms-stack--tight">
  <div class="ms-rate">
    %(star)s%(star)s%(star)s%(star)s<span class="ms-rate-star ms-rate-star--empty">%(star)s</span>
    <span class="ms-rate-text">4.0</span>
  </div>
  <div class="ms-rate ms-rate--sm">%(star)s%(star)s%(star)s<span class="ms-rate-star ms-rate-star--empty">%(star)s</span><span class="ms-rate-star ms-rate-star--empty">%(star)s</span><span class="ms-rate-text">3.0</span></div>
  <div class="ms-rate ms-rate--disabled">%(star)s%(star)s<span class="ms-rate-star ms-rate-star--empty">%(star)s</span><span class="ms-rate-star ms-rate-star--empty">%(star)s</span><span class="ms-rate-star ms-rate-star--empty">%(star)s</span><span class="ms-rate-text">只读态</span></div>
</div>
""" % {'star': '<span class="ms-rate-star">' + I['star'] + '</span>'}

DEMOS['statistic'] = """
<div class="ms-grid-2" style="max-width:520px">
  <div class="ms-card"><div class="ms-card-body">
    <div class="ms-stat"><div class="ms-stat-title">设备总数</div><div class="ms-stat-value">12,846<span class="ms-stat-suffix">台</span></div><div class="ms-stat-trend ms-stat-trend--up">↑ +128 较昨日</div></div>
  </div></div>
  <div class="ms-card"><div class="ms-card-body">
    <div class="ms-stat"><div class="ms-stat-title">离线设备</div><div class="ms-stat-value">1,642<span class="ms-stat-suffix">台</span></div><div class="ms-stat-trend ms-stat-trend--down">↓ -36 较昨日</div></div>
  </div></div>
</div>
"""

DEMOS['table'] = """
<div class="ms-table-wrap">
  <div class="ms-table-toolbar">
    <div class="ms-table-title">设备列表<span class="ms-tag ms-tag--round ms-tag--outline" style="margin-left:8px">12,846</span></div>
    <div class="ms-space ms-space--8"><button class="ms-btn ms-btn--sm ms-btn--filled">新增设备</button></div>
  </div>
  <table class="ms-table">
    <thead><tr>
      <th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span></label></th>
      <th>设备名称</th><th>状态</th><th class="ms-table-num">信号强度</th><th>最后上报</th><th class="ms-table-ops">操作</th>
    </tr></thead>
    <tbody>
      <tr class="ms-table-row--active">
        <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span></label></td>
        <td>云谷工厂 3 号</td><td><span class="ms-tag ms-tag--error"><i class="ms-tag-dot"></i>告警</span></td>
        <td class="ms-table-num">-78 dBm</td><td>2026-08-31 14:02</td>
        <td class="ms-table-ops"><button class="ms-btn ms-btn--link">详情</button><button class="ms-btn ms-btn--link ms-btn--danger">删除</button></td>
      </tr>
      <tr>
        <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span></label></td>
        <td>临江仓库 2 号</td><td><span class="ms-tag ms-tag--success"><i class="ms-tag-dot"></i>在线</span></td>
        <td class="ms-table-num">-65 dBm</td><td>2026-08-31 13:58</td>
        <td class="ms-table-ops"><button class="ms-btn ms-btn--link">详情</button><button class="ms-btn ms-btn--link ms-btn--danger">删除</button></td>
      </tr>
    </tbody>
  </table>
</div>
"""

DEMOS['tag'] = """
<div class="ms-space ms-space--8">
  <span class="ms-tag ms-tag--primary"><i class="ms-tag-dot"></i>升级中</span>
  <span class="ms-tag ms-tag--success"><i class="ms-tag-dot"></i>在线</span>
  <span class="ms-tag ms-tag--error"><i class="ms-tag-dot"></i>告警</span>
  <span class="ms-tag ms-tag--warm"><i class="ms-tag-dot"></i>处理中</span>
  <span class="ms-tag ms-tag--remind"><i class="ms-tag-dot"></i>待确认</span>
  <span class="ms-tag"><i class="ms-tag-dot"></i>离线</span>
</div>
<div class="ms-divider"></div>
<div class="ms-space ms-space--8">
  <span class="ms-tag ms-tag--round">默认分组</span>
  <span class="ms-tag ms-tag--outline">生产车间</span>
  <span class="ms-tag ms-tag--primary ms-tag--round">可关闭 <span class="ms-tag-close">×</span></span>
</div>
"""

DEMOS['timeline'] = """
<div class="ms-timeline" style="max-width:520px">
  <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--error"></i>
    <div class="ms-timeline-title">触发告警<span class="ms-timeline-time">2026-08-31 14:02</span></div>
    <div class="ms-timeline-desc">温度 46.2℃ 超过阈值 45℃，持续 3 个采样点。</div></div>
  <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--warm"></i>
    <div class="ms-timeline-title">系统派单<span class="ms-timeline-time">2026-08-31 14:05</span></div>
    <div class="ms-timeline-desc">按规则自动指派至运维组 · 林见川。</div></div>
  <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--muted"></i>
    <div class="ms-timeline-title">待处理<span class="ms-timeline-time">—</span></div></div>
</div>
"""

DEMOS['tooltip'] = """
<div class="ms-space ms-space--24" style="padding:40px 0 0">
  <span class="ms-tip"><button class="ms-btn">悬停查看提示</button><span class="ms-tip-bubble">无权限时按钮置灰并给出原因</span></span>
  <span class="ms-text ms-text--secondary ms-text--sm">Tooltip 为轻量提示，不承载操作；需要承载操作请用 Popover。</span>
</div>
"""

DEMOS['tree'] = """
<div class="ms-tree" style="max-width:320px">
  <div class="ms-tree-node"><span class="ms-tree-arrow">%(chevron)s</span>全部分组<span class="ms-tree-count">12.8k</span></div>
  <div class="ms-tree-node ms-tree-node--active" style="padding-left:24px"><span class="ms-tree-arrow"></span>生产车间<span class="ms-tree-count">4.2k</span></div>
  <div class="ms-tree-node" style="padding-left:24px"><span class="ms-tree-arrow">%(chevron)s</span>仓储物流<span class="ms-tree-count">3.1k</span></div>
  <div class="ms-tree-node" style="padding-left:40px"><span class="ms-tree-arrow"></span>临江仓库<span class="ms-tree-count">820</span></div>
  <div class="ms-tree-node" style="padding-left:40px"><span class="ms-tree-arrow"></span>南山基站<span class="ms-tree-count">316</span></div>
</div>
""" % {'chevron': '<span class="ms-ico ms-ico--14">' + I['chevron'] + '</span>'}

DEMOS['watermark'] = """
<div class="ms-watermark">
  <div class="ms-card">
    <div class="ms-card-body" style="min-height:180px">
      <div class="ms-text--strong">敏感数据区</div>
      <div class="ms-text ms-text--secondary ms-text--sm">水印为纯视觉层：pointer-events:none，不拦截任何交互，内容通常为「用户名 + 时间戳」。</div>
    </div>
  </div>
  <div class="ms-watermark-layer">
    %(wm)s%(wm)s%(wm)s%(wm)s%(wm)s%(wm)s%(wm)s%(wm)s
  </div>
</div>
""" % {'wm': '<span class="ms-watermark-item">陈亦然 2026-08-31</span>'}

DEMOS['alert'] = """
<div class="ms-stack ms-stack--tight" style="max-width:560px">
  <div class="ms-alert">%(infoicon)s<div class="ms-alert-body"><div class="ms-alert-title">已选 1,208 台设备</div><div class="ms-alert-desc">其中 86 台上次升级失败，建议勾选失败重试策略。</div></div></div>
  <div class="ms-alert ms-alert--success">%(checkicon)s<div class="ms-alert-body"><div class="ms-alert-title">升级任务已提交</div></div></div>
  <div class="ms-alert ms-alert--warn">%(warnicon)s<div class="ms-alert-body"><div class="ms-alert-title">阈值校验</div><div class="ms-alert-desc">当前条件预计影响 1,284 台设备。</div></div></div>
  <div class="ms-alert ms-alert--error">%(warnicon)s<div class="ms-alert-body"><div class="ms-alert-title">3 台设备升级失败</div><div class="ms-alert-desc">失败原因：固件校验不通过。</div></div></div>
</div>
""" % {'infoicon': '<span class="ms-alert-icon"><span class="ms-ico ms-ico--16">' + I['info'] + '</span></span>',
        'checkicon': '<span class="ms-alert-icon"><span class="ms-ico ms-ico--16">' + I['check'] + '</span></span>',
        'warnicon': '<span class="ms-alert-icon"><span class="ms-ico ms-ico--16">' + I['warn'] + '</span></span>'}

DEMOS['message'] = """
<div class="ms-space ms-space--12">
  <div class="ms-message">%(checkicon)s设备已添加</div>
  <div class="ms-message">%(warnicon)s部分设备离线，配置将在其上线后生效</div>
</div>
<div class="ms-divider"></div>
<div class="ms-notification">
  %(alarmicon)s
  <div><div class="ms-notification-title">紧急告警</div><div class="ms-notification-desc">云谷工厂 3 号 温度 46.2℃ 超过阈值。</div></div>
</div>
""" % {'checkicon': '<span class="ms-ico ms-ico--16">' + I['check'] + '</span>',
        'warnicon': '<span class="ms-ico ms-ico--16">' + I['warn'] + '</span>',
        'alarmicon': '<span class="ms-ico ms-ico--20">' + I['alarm'] + '</span>'}

DEMOS['notification'] = """
<div class="ms-stack ms-stack--tight" style="max-width:360px">
  <div class="ms-notification">
    %(alarmicon)s
    <div><div class="ms-notification-title">紧急告警</div><div class="ms-notification-desc">云谷工厂 3 号 温度 46.2℃ 超过阈值 45℃。</div>
      <div class="ms-space ms-space--8" style="margin-top:12px"><button class="ms-btn ms-btn--sm">忽略</button><button class="ms-btn ms-btn--sm ms-btn--filled">去处理</button></div>
    </div>
  </div>
  <div class="ms-notification">
    %(checkicon)s
    <div><div class="ms-notification-title">升级任务完成</div><div class="ms-notification-desc">1,208 台设备中有 1,122 台升级成功。</div></div>
  </div>
</div>
""" % {'alarmicon': '<span class="ms-ico ms-ico--20">' + I['alarm'] + '</span>',
        'checkicon': '<span class="ms-ico ms-ico--20">' + I['check'] + '</span>'}

DEMOS['modal'] = """
<div class="ms-modal" style="max-width:520px">
  <div class="ms-modal-head"><div class="ms-modal-title">批量固件升级</div><span class="ms-modal-close">%(closeicon)s</span></div>
  <div class="ms-modal-body">
    <div class="ms-alert ms-alert--info">%(infoicon)s<div class="ms-alert-body"><div class="ms-alert-title">已选 1,208 台设备</div><div class="ms-alert-desc">其中 86 台上次升级失败。</div></div></div>
    <div class="ms-form" style="margin-top:16px">
      <div class="ms-form-item ms-form-item--inline"><label class="ms-form-label">目标版本</label><div class="ms-form-control"><span class="ms-select"><select><option>v2.4.1（推荐）</option></select></span></div></div>
      <div class="ms-form-item ms-form-item--inline"><label class="ms-form-label">灰度批次</label><div class="ms-form-control"><span class="ms-select"><select><option>分批灰度</option></select></span></div></div>
    </div>
  </div>
  <div class="ms-modal-foot"><button class="ms-btn">取消</button><button class="ms-btn ms-btn--filled">开始升级</button></div>
</div>
""" % {'closeicon': '<span class="ms-ico ms-ico--16">' + I['close'] + '</span>',
        'infoicon': '<span class="ms-alert-icon"><span class="ms-ico ms-ico--16">' + I['info'] + '</span></span>'}

DEMOS['drawer'] = """
<div class="ms-drawer" style="max-width:480px;box-shadow:var(--shadow-2);border:1px solid var(--color-border-base);border-radius:12px">
  <div class="ms-drawer-head">
    <div><div class="ms-h4">告警详情</div><div class="ms-text--sm ms-text--auxiliary">24E1A2B30001C7D5</div></div>
    <span class="ms-modal-close">%(closeicon)s</span>
  </div>
  <div class="ms-drawer-body">
    <div class="ms-space ms-space--8"><span class="ms-tag ms-tag--error"><i class="ms-tag-dot"></i>未处理</span></div>
    <div class="ms-desc ms-desc--bordered" style="margin-top:12px">
      <div class="ms-desc-item"><div class="ms-desc-label">触发时间</div><div class="ms-desc-value">2026-08-31 14:02</div></div>
      <div class="ms-desc-item"><div class="ms-desc-label">当前温度</div><div class="ms-desc-value">46.2℃</div></div>
    </div>
  </div>
  <div class="ms-drawer-foot"><button class="ms-btn">忽略</button><button class="ms-btn ms-btn--filled">标记已处理</button></div>
</div>
""" % {'closeicon': '<span class="ms-ico ms-ico--16">' + I['close'] + '</span>'}

DEMOS['popconfirm'] = """
<div class="ms-popconfirm">
  <div class="ms-popconfirm-title">%(warnicon)s确定删除这 2 台设备？</div>
  <div class="ms-popconfirm-desc">删除后设备历史数据保留 30 天，可在回收站恢复。</div>
  <div class="ms-popconfirm-foot"><button class="ms-btn ms-btn--sm">取消</button><button class="ms-btn ms-btn--sm ms-btn--filled ms-btn--danger">确定</button></div>
</div>
""" % {'warnicon': '<span class="ms-ico ms-ico--16">' + I['warn'] + '</span>'}

DEMOS['progress'] = """
<div class="ms-stack ms-stack--tight" style="max-width:460px">
  <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar" style="width:62%%"></i></div><span class="ms-progress-text">62%% · 749/1208</span></div>
  <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar ms-progress-bar--success" style="width:100%%"></i></div><span class="ms-progress-text">已完成</span></div>
  <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar ms-progress-bar--error" style="width:18%%"></i></div><span class="ms-progress-text">失败 86 台</span></div>
</div>
"""

DEMOS['result'] = """
<div class="ms-grid-2">
  <div class="ms-card"><div class="ms-result">
    <div class="ms-result-icon">%(checkicon)s</div>
    <div class="ms-result-title">升级任务已提交</div>
    <div class="ms-result-sub">预计 24 分钟内完成，可在任务列表查看进度。</div>
    <div class="ms-space ms-space--8"><button class="ms-btn">返回列表</button><button class="ms-btn ms-btn--filled">查看任务</button></div>
  </div></div>
  <div class="ms-card"><div class="ms-result">
    <div class="ms-result-icon ms-result-icon--error">%(closeicon)s</div>
    <div class="ms-result-title">提交失败</div>
    <div class="ms-result-sub">3 台设备处于离线状态，无法接收升级指令。</div>
    <div class="ms-space ms-space--8"><button class="ms-btn ms-btn--filled">重试</button></div>
  </div></div>
</div>
""" % {'checkicon': '<span class="ms-ico ms-ico--24">' + I['check'] + '</span>',
        'closeicon': '<span class="ms-ico ms-ico--24">' + I['close'] + '</span>'}

DEMOS['skeleton'] = """
<div class="ms-card" style="max-width:420px"><div class="ms-card-body">
  <div class="ms-skeleton">
    <div class="ms-skeleton-bar ms-skeleton-bar--title"></div>
    <div class="ms-skeleton-bar"></div>
    <div class="ms-skeleton-bar ms-skeleton-bar--short"></div>
    <div class="ms-skeleton-bar"></div>
  </div>
</div></div>
"""

DEMOS['spin'] = """
<div class="ms-space ms-space--24">
  <span class="ms-spin ms-spin--sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9" stroke-opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg></span>
  <span class="ms-spin ms-spin--md"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9" stroke-opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg></span>
  <span class="ms-spin ms-spin--lg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9" stroke-opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg></span>
</div>
"""
