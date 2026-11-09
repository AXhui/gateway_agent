// DOM↔scene 逐元素审计内核（verify-scene.js 注入 demo 页，与 BOOTSTRAP 同页执行）。
// 思路：BOOTSTRAP 开 __MS_AUDIT__ 时给节点带 p（DOM 路径 '0/j/k'），每态序列化完当场调
// __MS_AUDIT_FN__(cell, i)——此刻 DOM 还是该态，逐元素比对 computed style vs scene 节点。
// 只验序列化器（raw scene）；flatten/lib/组件化在 build-scene.js Node 侧，插件落图由 figma-mock.test.js 验。

const AUDIT_MAIN = function (cell, idx) {
  var rep = { idx: idx, label: cell.label, pass: 0, fail: 0, els: 0, cats: {}, items: [] };
  function fail(cat, path, msg) {
    rep.fail++;
    rep.cats[cat] = (rep.cats[cat] || 0) + 1;
    if (rep.items.length < 300) rep.items.push({ cat: cat, path: path, msg: msg });
  }
  function ok() { rep.pass++; }
  function near(a, b, t) { return Math.abs(a - b) <= (t || 1); }
  function parseRgba(s) {
    var m = (s || '').match(/rgba?\(([^)]+)\)/); if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return { c: [p[0] / 255, p[1] / 255, p[2] / 255], a: p.length > 3 ? p[3] : 1 };
  }
  function splitTop(s) {
    var out = [], d = 0, c = '';
    for (var i = 0; i < s.length; i++) { var ch = s[i]; if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(c); c = '' } else c += ch }
    out.push(c); return out;
  }
  var byPath = {};
  (function collect(n) { if (n.p) byPath[n.p] = n; (n.ch || []).forEach(collect); })(cell.root);
  var hook = window.MS_FIGMA_EXPORT || {};
  var rootEl = document.querySelector(hook.rootSelector || '#app') || document.body;
  // 根提升（对齐 scene-bootstrap 2026-10-31 缺陷 A 修复）：审计根与序列化根必须一致
  try { var sh = (rootEl && rootEl.closest) ? rootEl.closest('.ms-shell') : null; if (sh && sh !== rootEl) rootEl = sh } catch (e8) {}
  var rootRect = rootEl.getBoundingClientRect();

  function directText(el) {
    var t = '';
    for (var i = 0; i < el.childNodes.length; i++) { if (el.childNodes[i].nodeType === 3) t += el.childNodes[i].data; }
    return t.replace(/\s+/g, ' ').trim();
  }
  function applyTT(txt, tt) {
    if (tt === 'uppercase') return txt.toUpperCase();
    if (tt === 'lowercase') return txt.toLowerCase();
    if (tt === 'capitalize') return txt.toLowerCase().replace(/(^|\s)([a-z])/g, function (m0, s1, s2) { return s1 + s2.toUpperCase() });
    return txt;
  }
  function anyDescVisible(el) {
    // 空壳容器不算可见（2026-10-31：空 <td><span class=bc-num></span> 曾误报覆盖缺口）——
    // 后代须自带视觉（文本/底色/边框/阴影/背景图/img/svg）或自身非空子树，才证明父容器该进 scene
    for (var q = 0; q < el.children.length; q++) {
      var c2 = el.children[q], s2 = getComputedStyle(c2);
      if (s2.display === 'none' || s2.visibility === 'hidden') continue;
      if (/^(script|style|link|meta)$/i.test(c2.tagName)) continue;
      var bg2 = parseRgba(s2.backgroundColor);
      var bw2 = [s2.borderTopWidth, s2.borderRightWidth, s2.borderBottomWidth, s2.borderLeftWidth];
      var bc2 = [s2.borderTopColor, s2.borderRightColor, s2.borderBottomColor, s2.borderLeftColor];
      var vb2 = false;
      for (var b2 = 0; b2 < 4; b2++) { var w2 = parseFloat(bw2[b2]) || 0, cl2 = parseRgba(bc2[b2]); if (w2 > 0 && cl2 && cl2.a > 0) vb2 = true; }
      if (directText(c2) || (bg2 && bg2.a > 0) || vb2 || (s2.boxShadow && s2.boxShadow !== 'none')
        || (s2.backgroundImage && s2.backgroundImage !== 'none') || /^(img|svg|canvas)$/i.test(c2.tagName)) return true;
      if (anyDescVisible(c2)) return true;
    }
    return false;
  }

  function walk(el, path, parentRect) {
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    var tag = (el.tagName || '').toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'link' || tag === 'meta') return;
    rep.els++;
    var n = byPath[path];
    var rect = el.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    var bgc = parseRgba(cs.backgroundColor);
    var bw = [parseFloat(cs.borderTopWidth) || 0, parseFloat(cs.borderRightWidth) || 0, parseFloat(cs.borderBottomWidth) || 0, parseFloat(cs.borderLeftWidth) || 0];
    var bc = [parseRgba(cs.borderTopColor), parseRgba(cs.borderRightColor), parseRgba(cs.borderBottomColor), parseRgba(cs.borderLeftColor)];
    var hasSh = cs.boxShadow && cs.boxShadow !== 'none';
    var hasBi = cs.backgroundImage && cs.backgroundImage !== 'none';
    var txt = directText(el);
    // 可见边框 = 有宽度且颜色不透明为 0（transparent 边框不渲染，序列化器合法丢弃）
    var visBorder = false;
    for (var bi = 0; bi < 4; bi++) if (bw[bi] > 0 && bc[bi] && bc[bi].a > 0) visBorder = true;
    var vis = (bgc && bgc.a > 0) || visBorder || hasSh || hasBi || !!txt || tag === 'img' || tag === 'svg' || tag === 'canvas';

    if (!n) {
      // 序列化器合法丢弃 = 无视觉且无可见后代（或 0 尺寸）；否则记覆盖缺口
      if (w >= 0.5 && h >= 0.5 && (vis || anyDescVisible(el))) fail('coverage', path, tag + '.' + String(el.className).slice(0, 40) + ' 未入 scene');
      return;
    }

    // 几何（跳过 transform 元素——序列化器用布局盒重建，audit 直接比会误报）
    if (cs.transform === 'none') {
      var dx = rect.left - parentRect.left, dy = rect.top - parentRect.top;
      if (!near(dx, n.x, 1) || !near(dy, n.y, 1)) fail('geometry', path, 'xy (' + dx.toFixed(1) + ',' + dy.toFixed(1) + ') vs scene (' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')');
      else ok();
      if (!near(w, n.w, 1) || !near(h, n.h, 1)) fail('geometry', path, 'wh (' + w.toFixed(1) + ',' + h.toFixed(1) + ') vs scene (' + n.w.toFixed(1) + ',' + n.h.toFixed(1) + ')');
      else ok();
    } else ok();

    // 文本（svg/img/canvas 无可渲染文本；pseudo-* 文本是伪元素产物，不算元素正文）
    if (txt && tag !== 'svg' && tag !== 'img' && tag !== 'canvas') {
      var want = applyTT(txt, cs.textTransform || 'none');
      var tns = (n.ch || []).filter(function (c) { return c.t === 't' && c.n !== 'pseudo-before' && c.n !== 'pseudo-after' });
      // 直接文本 run 分组（2026-10-31 八轮镜像）：只测文本节点、按连续段分组，元素子节点不进 run——
      // 序列化侧同款（selectNodeContents 整 union 会把 svg 图标并进来：w 撑大误判 right/文本盒压图标；
      // 混排行「已选<b>2</b>项」整盒与 b 子层重叠）。单段走 run 对齐裁决，多段逐段盒精确比对
      var runsA = [];
      try {
        var grpA = [];
        for (var ciA = 0; ciA < el.childNodes.length; ciA++) {
          var cnA = el.childNodes[ciA];
          if (cnA.nodeType === 3 && cnA.data.replace(/\s+/g, '')) grpA.push(cnA);
          else if (grpA.length) { runsA.push(grpA); grpA = []; }
        }
        if (grpA.length) runsA.push(grpA);
        runsA = runsA.map(function (g) {
          var rA = document.createRange();
          rA.setStart(g[0], 0); rA.setEnd(g[g.length - 1], g[g.length - 1].data.length);
          var bA = rA.getBoundingClientRect();
          if (bA.height <= 0) return null;
          var tA = ''; g.forEach(function (x) { tA += x.data; });
          return { txt: applyTT(tA.replace(/\s+/g, ' ').trim(), cs.textTransform || 'none'), r: { tx: bA.left - rect.left, ty: bA.top - rect.top, w: bA.width, h: bA.height } };
        }).filter(Boolean);
      } catch (eR) { runsA = []; }
      var fs = parseFloat(cs.fontSize) || 14;
      var lh = cs.lineHeight === 'normal' ? fs * 1.4 : (parseFloat(cs.lineHeight) || fs * 1.4);
      var fw = parseInt(cs.fontWeight) || 400;
      var col = parseRgba(cs.color) || { c: [0, 0, 0] };
      function styleChecks(tn) {
        if (!near(tn.fs, fs, 0.6)) fail('text', path, 'fontSize ' + tn.fs + ' vs ' + fs);
        else if (tn.fw !== fw) fail('text', path, 'fontWeight ' + tn.fw + ' vs ' + fw);
        else if (!near(tn.lh, lh, 1.5)) fail('text', path, 'lineHeight ' + tn.lh + ' vs ' + lh);
        else {
          ok();
          if (!near(tn.col[0] * 255, col.c[0] * 255, 2) || !near(tn.col[1] * 255, col.c[1] * 255, 2) || !near(tn.col[2] * 255, col.c[2] * 255, 2)) fail('text', path, '字色 ' + tn.col.join(',') + ' vs ' + col.c.join(','));
          else ok();
        }
        var lsp = parseFloat(cs.letterSpacing) || 0;
        if (!near(tn.ls || 0, lsp, 0.15)) fail('text', path, '字距 ' + (tn.ls || 0) + ' vs ' + lsp); else ok();
        var dl2 = cs.textDecorationLine || 'none';
        var wantTd = /underline/.test(dl2) ? 'u' : (/line-through/.test(dl2) ? 's' : null);
        if ((tn.td || null) !== wantTd) fail('text', path, '装饰线 ' + (tn.td || '无') + ' vs ' + (wantTd || '无')); else ok();
        var wantTr = (cs.textOverflow === 'ellipsis' && cs.overflowX !== 'visible' && cs.whiteSpace === 'nowrap') ? 1 : null;
        if ((tn.tr || null) !== wantTr) fail('text', path, '截断标记 ' + (tn.tr ? '有' : '无') + ' vs ' + (wantTr ? '应有' : '无')); else ok();
        if (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') { if (!tn.it) fail('text', path, '斜体未标记 it'); else ok(); }
      }
      if (!tns.length) fail('text', path, '有直接文本但无文本节点: "' + want.slice(0, 24) + '"');
      else if (runsA.length > 1) {
        // 混排行：序列化侧应逐段落位（段数一致、每段盒 = run 盒、对齐 left——盒已精确无需裁决）
        if (tns.length !== runsA.length) fail('text', path, '混排行文本段数 ' + tns.length + ' vs DOM ' + runsA.length + ': "' + want.slice(0, 24) + '"');
        else runsA.forEach(function (rn, i2) {
          var tn = tns[i2];
          if (tn.text !== rn.txt) fail('text', path, '段' + i2 + ' 文本不符: "' + String(tn.text).slice(0, 16) + '" vs "' + rn.txt.slice(0, 16) + '"');
          else ok();
          if (!near(tn.x, rn.r.tx, 1) || !near(tn.w, rn.r.w, 1)) fail('geometry', path, '段' + i2 + ' 盒 x/w (' + tn.x.toFixed(1) + ',' + tn.w.toFixed(1) + ') vs run (' + rn.r.tx.toFixed(1) + ',' + rn.r.w.toFixed(1) + ')');
          else ok();
          if ((tn.al || 'left') !== 'left') fail('text', path, '段' + i2 + ' 混排盒已精确，对齐应为 left 而非 ' + (tn.al || 'left'));
          else ok();
        });
        styleChecks(tns[0]);
      } else {
        var tn = tns[0];
        if (tn.text !== want) fail('text', path, '文本不符: "' + tn.text.slice(0, 24) + '" vs "' + want.slice(0, 24) + '"');
        else ok();
        styleChecks(tn);
        // R6 硬化：对齐——几何对齐镜像（四轮）+ 八轮纯文本 run：computed 是书写意图（button UA 默认
        // center），视觉对齐以单行字形 run 实测为准；run 只测直接文本节点，元素子节点不进
        var als = cs.textAlign === 'center' ? 'center' : (cs.textAlign === 'right' || cs.textAlign === 'end') ? 'right' : 'left';
        if (runsA.length === 1) {
          var rA0 = runsA[0].r;
          if (rA0.h <= lh * 1.7 && rA0.w < w - 1) {
            var glA = rA0.tx, grA = w - rA0.tx - rA0.w;
            if (Math.abs(glA - grA) <= 1.5) als = 'center';
            else if (grA <= 1.5) als = 'right';
            else als = 'left';
          }
        }
        if ((tn.al || 'left') !== als) fail('text', path, '对齐 ' + (tn.al || 'left') + ' vs ' + als); else ok();
      }
    }

    // 表单值/占位镜像（2026-10-31 七轮，input 转化根因）：序列化侧从 value/placeholder 属性合成 t:'t'
    // 节点（DOM 无文本节点，上方正文检查永远跳过 input）——此处单独核对合成节点存在性与字符一致，
    // 防合成逻辑回归丢失（库 Input 实例会退回主档 Example）。空输入无合成节点合法。
    // select 选中项同款镜像（2026-11-01 十二轮）：闭合 select 的选中文案浏览器绘制，核对
    // selectedOptions[0].label 已入 scene（库 Select 实例值层空白 = 板上下拉全空根因）。
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      var itypA = (el.getAttribute && el.getAttribute('type')) || 'text';
      if (tag === 'select' || !/^(checkbox|radio|button|submit|reset|file|hidden|image|range|color)$/i.test(itypA)) {
        var avv, app;
        if (tag === 'select') {
          var soA = (el.selectedOptions && el.selectedOptions[0]) || (el.options && el.options[el.selectedIndex]);
          avv = soA ? String(soA.label || soA.text || '').replace(/\s+/g, ' ').trim() : '';
          app = '';
        } else {
          avv = String(el.value || '').replace(/\s+/g, ' ').trim();
          app = String((el.getAttribute && el.getAttribute('placeholder')) || '').replace(/\s+/g, ' ').trim();
        }
        var ashow = avv || app;
        if (ashow) {
          var atn = (n.ch || []).filter(function (c) { return c.t === 't'; })[0];
          if (!atn) fail('text', path, 'input/select 值未入 scene: "' + ashow.slice(0, 24) + '"');
          else if (atn.text !== ashow) fail('text', path, 'input/select 文本不符: "' + String(atn.text).slice(0, 24) + '" vs "' + ashow.slice(0, 24) + '"');
          else ok();
        }
      }
    }

    // 填充
    if (bgc && bgc.a > 0) {
      var hit = (n.f || []).some(function (p) { return p && p.c && near(p.c[0], bgc.c[0], 0.01) && near(p.c[1], bgc.c[1], 0.01) && near(p.c[2], bgc.c[2], 0.01) && near(p.a == null ? 1 : p.a, bgc.a, 0.02) });
      if (!hit) fail('fill', path, '背景色 rgba(' + bgc.c.join(',') + ',' + bgc.a + ') 未在 scene fills');
      else ok();
    }
    // 背景图层
    if (hasBi) {
      if (!(n.bg && n.bg.length)) fail('fill', path, 'backgroundImage 未入 scene.bg');
      else ok();
    }
    // 边框：条带 / stk（虚线）/ al.bw（AL 转描边）三形态任一；条带按名逐边比对
    // （top/bottom 条带宽=容器宽、高=边宽；left/right 反之——比对应维度；透明边框不要求表达）
    if (visBorder) {
      var strips = (n.ch || []).filter(function (c) { return c.n && c.n.indexOf('border-') === 0 });
      if (n.stk) {
        ok();
        if (!near(n.stk.w, bw[0], 0.6) && n.stk.w !== Math.max.apply(null, bw)) fail('border', path, 'stk 宽 ' + n.stk.w + ' vs ' + bw.join(','));
        else ok();
      } else if (n.al && n.al.bw) { ok(); ok(); }
      else if (strips.length) {
        ok();
        var sideNames = ['border-top', 'border-right', 'border-bottom', 'border-left'];
        var matched = 0;
        for (var si = 0; si < 4; si++) {
          if (!(bw[si] > 0 && bc[si] && bc[si].a > 0)) continue;
          var st = null;
          for (var qi = 0; qi < strips.length; qi++) if (strips[qi].n === sideNames[si]) st = strips[qi];
          if (!st) { fail('border', path, sideNames[si] + ' 有边框但无条带'); continue; }
          matched++;
          var isH = si === 0 || si === 2;
          var got = isH ? st.h : st.w;
          if (!near(got, bw[si], 0.6)) fail('border', path, sideNames[si] + ' 条宽 ' + got + ' vs ' + bw[si]);
          else ok();
          var sc = st.f && st.f[0];
          if (sc && (!near(sc.c[0], bc[si].c[0], 0.01) || !near(sc.c[1], bc[si].c[1], 0.01) || !near(sc.c[2], bc[si].c[2], 0.01))) fail('border', path, sideNames[si] + ' 边框色不符');
          else ok();
        }
        if (strips.length > matched) fail('border', path, '多余边框条带 ×' + (strips.length - matched));
      } else fail('border', path, '有边框但无边框表达（条带/stk/al）');
    }
    // 圆角（仅全 px 单位可比；% 序列化器做了均值，逐角比对会误报，跳过）
    var brs = cs.borderRadius || '0';
    if (brs && brs !== 'none' && brs.indexOf('%') < 0) {
      var parts = brs.split(/[\s\/,]+/).filter(Boolean);
      if (parts.length && parts.some(function (p) { return parseFloat(p) > 0 })) {
        var tl = parseFloat(parts[0]) || 0, tr = parseFloat(parts[1] != null ? parts[1] : parts[0]) || 0;
        var br = parseFloat(parts[2] != null ? parts[2] : parts[0]) || 0, bl = parseFloat(parts[3] != null ? parts[3] : (parts[1] != null ? parts[1] : parts[0])) || 0;
        if (!near(n.r.tl, tl, 1) || !near(n.r.tr, tr, 1) || !near(n.r.br, br, 1) || !near(n.r.bl, bl, 1))
          fail('radius', path, '圆角 [' + [tl, tr, br, bl].join(',') + '] vs scene [' + [n.r.tl, n.r.tr, n.r.br, n.r.bl].map(function (v) { return v.toFixed ? v.toFixed(1) : v }).join(',') + ']');
        else ok();
      }
    }
    // 阴影
    if (hasSh) {
      var wantSh = splitTop(cs.boxShadow).filter(function (x) { return x.trim() && x.trim() !== 'none' }).length;
      if (!(n.e && n.e.length)) fail('shadow', path, 'boxShadow 未入 scene.effects');
      else { ok(); if (n.e.length < wantSh) fail('shadow', path, '阴影数 ' + n.e.length + ' < ' + wantSh); else ok(); }
    }
    // 不透明度
    var op = parseFloat(cs.opacity); op = isNaN(op) ? 1 : op;
    if (!near(n.o == null ? 1 : n.o, op, 0.02)) fail('opacity', path, 'opacity ' + (n.o == null ? 1 : n.o) + ' vs ' + op); else ok();
    // R7 硬化：AL 容器不得含可见绝对定位子元素（Figma AL 会把它们重排进 flex 流）
    if (n.al) {
      var absBad = false;
      for (var aq = 0; aq < el.children.length; aq++) {
        var acs = getComputedStyle(el.children[aq]);
        if ((acs.position === 'absolute' || acs.position === 'fixed') && acs.display !== 'none' && acs.visibility !== 'hidden') { absBad = true; break }
      }
      if (absBad) fail('al', path, '含可见绝对定位子元素却应用了 AL'); else ok();
    }
    // 旋转
    if (cs.transform !== 'none') {
      var mm = cs.transform.match(/^matrix\(([^)]+)\)/);
      var pureRot = false, ang = 0;
      if (mm) {
        var tv = mm[1].split(',').map(parseFloat), a0 = tv[0], b0 = tv[1], c0 = tv[2], d0 = tv[3];
        if (Math.abs(a0 * d0 - b0 * c0 - 1) < 0.02 && Math.abs(a0 - d0) < 0.02 && Math.abs(b0 + c0) < 0.02) {
          pureRot = true; ang = Math.atan2(b0, a0) * 180 / Math.PI;
        }
      }
      if (pureRot && Math.abs(ang) > 0.05) { if (!(n.rot && near(n.rot, ang, 0.2))) fail('rotation', path, '旋转 ' + ang.toFixed(2) + '° 未入 scene.rot'); else ok(); }
    }
    // 伪元素覆盖：可见 ::before/::after 必有序列化产物（装饰帧 / 文本 / 三角矢量）
    for (var pi = 0; pi < 2; pi++) {
      var pwhich = pi ? ':after' : ':before';
      var pcs2 = getComputedStyle(el, pwhich);
      var pc2 = pcs2.content;
      if (!pc2 || pc2 === 'none' || pc2 === 'normal' || pcs2.display === 'none' || pcs2.visibility === 'hidden') continue;
      var praw = pc2.replace(/^['"]|['"]$/g, '');
      var pbg2 = parseRgba(pcs2.backgroundColor);
      var pbi2 = pcs2.backgroundImage && pcs2.backgroundImage !== 'none';
      var psh2 = pcs2.boxShadow && pcs2.boxShadow !== 'none';
      var ptri2 = [pcs2.borderTopColor, pcs2.borderBottomColor, pcs2.borderLeftColor, pcs2.borderRightColor].some(function (cc, ci) {
        var v = parseRgba(cc);
        return v && v.a > 0 && (parseFloat([pcs2.borderTopWidth, pcs2.borderBottomWidth, pcs2.borderLeftWidth, pcs2.borderRightWidth][ci]) || 0) > 0;
      });
      var pvis2 = !!praw || (pbg2 && pbg2.a > 0) || pbi2 || psh2 || ptri2;
      if (!pvis2) continue;
      var pnode = (n.ch || []).filter(function (cn) { return cn.n === 'pseudo-' + (pi ? 'after' : 'before') })[0];
      if (!pnode) fail('pseudo', path, pwhich + ' 可见（content:' + pc2.slice(0, 12) + '）但未序列化');
      else {
        ok();
        // 绝对定位伪元素坐标：镜像包含块换算（含 transform 平移），只查原点不查内容
        if (pcs2.position === 'absolute') {
          var cb = null, cbEl = el;
          while (cbEl && cbEl.nodeType === 1) {
            var cc3 = getComputedStyle(cbEl);
            if (cc3.position !== 'static' || (cc3.transform && cc3.transform !== 'none') || (cc3.filter && cc3.filter !== 'none')) { cb = cbEl; break }
            cbEl = cbEl.parentElement;
          }
          var ex, ey;
          if (cb === el) {
            var ebc = getComputedStyle(el);
            ex = (parseFloat(pcs2.left) || 0) + (parseFloat(ebc.borderLeftWidth) || 0);
            ey = (parseFloat(pcs2.top) || 0) + (parseFloat(ebc.borderTopWidth) || 0);
          } else if (cb) {
            var cbr = cb.getBoundingClientRect(), cbc = getComputedStyle(cb);
            ex = cbr.left + (parseFloat(cbc.borderLeftWidth) || 0) + (parseFloat(pcs2.left) || 0) - rect.left;
            ey = cbr.top + (parseFloat(cbc.borderTopWidth) || 0) + (parseFloat(pcs2.top) || 0) - rect.top;
          } else { ex = parseFloat(pcs2.left) || 0; ey = parseFloat(pcs2.top) || 0; }
          var ptm = (pcs2.transform || 'none').match(/matrix\(([^)]+)\)/);
          if (ptm) { var ptv = ptm[1].split(',').map(parseFloat); ex += ptv[4] || 0; ey += ptv[5] || 0 }
          if (!near(pnode.x, ex, 2) || !near(pnode.y, ey, 2)) fail('pseudo', path, pwhich + ' 坐标 (' + pnode.x.toFixed(1) + ',' + pnode.y.toFixed(1) + ') vs 期望 (' + ex.toFixed(1) + ',' + ey.toFixed(1) + ')');
          else ok();
        }
      }
    }

    // 媒体节点形态；svg 内部不递归（序列化器整体克隆，svg 内文本不渲染）
    if (tag === 'img') { if (n.t !== 'img') fail('media', path, 'img 未入 scene 为 img 节点（t=' + n.t + '）'); else ok(); return; }
    if (tag === 'canvas') { if (n.t !== 'img') fail('media', path, 'canvas 未入 scene 为 img 节点'); else ok(); return; }
    if (tag === 'svg') { if (n.t !== 's' && n.t !== 'ic') fail('media', path, 'svg 未入 scene（t=' + n.t + '）'); else ok(); return; }

    // R8 硬化：overflow hidden → clip（Figma clipsContent；svg 的 UA 默认 hidden 无意义不查）
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
      if (!n.clip) fail('clip', path, 'overflow hidden 但 scene.clip 缺失'); else ok();
    }

    for (var j = 0; j < el.children.length; j++) walk(el.children[j], path + '/' + j, rect);
  }
  walk(rootEl, '0', rootRect);
  return rep;
};

const AUDIT_JS = 'window.__MS_AUDIT__=1;window.__MS_AUDIT_FN__=' + AUDIT_MAIN.toString() + ';';

module.exports = { AUDIT_JS };
