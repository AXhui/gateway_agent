#!/usr/bin/env node
// verify-import.js — 转录验收仪：scene.json（HTML 真源）↔ 已导入 Figma 画板（get_metadata dump）五轮验收。
//
// 用法:
//   node verify-import.js --scene ~/Desktop/scene.json --board <metadata-dump> [--tol 2]
//
// board 输入格式自适应：①MCP get_metadata 落盘文件（[{"type":"text","text":"<canvas…>"}]）
// ②裸 JSON {"text":XML} ③裸 XML 文本。
//
// 五轮（用户令「验收5次，按照设计师，html 用户场景」）：
//   P1 设计师·库引用    —— 库实例配额（scene lib 命中 → board instance 落图率）、关键壳映射存在
//   P2 设计师·文案卫生  —— 主档默认文案（Label/Button/Tab/Title 裸文本层）不泄漏
//   P3 HTML·几何        —— 具名帧宽高逐一比对（蒙版/壳/主体，±tol px）+ 蒙版提升位 y=24
//   P4 HTML·文本        —— scene 文本集合 ⊆ board 文本集合（同 cell，缺失率 ≤5%）
//   P5 用户场景·可交互  —— 蒙版全幅盖 cell、按钮热区 ≥24 高、无 300×300 失管 svg、同级文本不重叠
//
// 局限（如实声明）：metadata 的 instance 是叶子，实例内层泄漏（Label 藏否/字样覆写）不可见——
// 由 figma-mock.test.js 纯图标钮/字样覆写靶覆盖；本仪管画板级证据。

const fs = require('fs');

function arg(k, d) { const i = process.argv.indexOf('--' + k); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; }

// ---------- board 解析 ----------
function loadBoardXML(p) {
  let raw = fs.readFileSync(p, 'utf8');
  raw = raw.trim();
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j)) { const hit = j.find(b => b && b.type === 'text' && /<canvas/.test(String(b.text))); raw = hit ? hit.text : (j[0].text || ''); }
    else if (j && typeof j.text === 'string') raw = j.text;
  } catch (e) { /* 裸 XML */ }
  if (!/^<canvas/.test(raw.trim())) throw new Error('无法识别 board 输入（既非 MCP dump 也非裸 XML）: ' + p);
  return raw.trim();
}

function parseTree(xml) {
  const tokenRe = /<(\/?)([a-zA-Z]+)\b((?:[^>"']|"[^"]*")*?)(\/?)>|([^<]+)/g;
  const attr = (s, k) => { const m = s.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : null; };
  const root = { tag: 'root', name: '', kids: [] };
  const stack = [root];
  let m;
  while ((m = tokenRe.exec(xml))) {
    if (m[5] !== undefined) continue; // 文本节点（metadata 中文本走 name 属性，忽略）
    const closing = m[1] === '/', tag = m[2], a = m[3] || '', selfClose = m[4] === '/';
    if (closing) { while (stack.length > 1 && stack[stack.length - 1].tag !== tag) stack.pop(); if (stack.length > 1) stack.pop(); continue; }
    if (tag === 'canvas' && stack.length === 1) {
      const cv = { tag: 'canvas', name: attr(a, 'name') || '', kids: [] }; root.kids.push(cv); stack.push(cv); continue;
    }
    const nd = {
      tag, id: attr(a, 'id'), name: attr(a, 'name') || '',
      x: parseFloat(attr(a, 'x') || 0), y: parseFloat(attr(a, 'y') || 0),
      w: parseFloat(attr(a, 'width') || 0), h: parseFloat(attr(a, 'height') || 0),
      kids: [],
    };
    stack[stack.length - 1].kids.push(nd);
    nd.parent = stack[stack.length - 1];
    if (!selfClose) stack.push(nd);
  }
  return root;
}

// ---------- scene 工具 ----------
// 带「是否在库实例块内」标记的遍历：库命中块整块换实例，其内部帧/文本在 metadata 不可见（instance 是叶子）
const walkSceneLib = (n, inLib, fn) => { const il = inLib || !!n.lib; fn(n, il); (n.ch || []).forEach(c => walkSceneLib(c, il, fn)); };
const sceneTextsOf = root => { const out = []; walkSceneLib(root, false, (n, il) => { if (n.t === 't' && n.text != null && !il) out.push(String(n.text).trim()); }); return out; };
const sceneNamedFrames = root => { const out = []; walkSceneLib(root, false, (n, il) => { if (!il && n.t === 'f' && n.n && /[a-z]/.test(n.n)) out.push(n); }); return out; };

// ---------- 主流程 ----------
(function main() {
  const scenePath = arg('scene', process.env.HOME + '/Desktop/scene.json');
  const boardPath = arg('board');
  const TOL = parseFloat(arg('tol', '2'));
  if (!boardPath) { console.error('用法: verify-import.js --scene <scene.json> --board <metadata-dump>'); process.exit(2); }
  const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
  const xml = loadBoardXML(boardPath);
  const tree = parseTree(xml);

  // board 顶层：canvas → 画板（找 REQ 名或最大 frame）→ cells（名为 "N. …"）
  const canvas = tree.kids.find(k => k.tag === 'canvas') || tree;
  const board = canvas.kids.filter(k => k.tag === 'frame').sort((a, b) => b.w * b.h - a.w * a.h)[0];
  if (!board) { console.error('✗ board 画板未找到'); process.exit(2); }
  const boardCells = board.kids.filter(k => k.tag === 'frame' && /^\d+\.\s/.test(k.name));
  console.log('board: ' + board.name + '（' + boardCells.length + ' cells）');
  console.log('scene: ' + scene.name + '（' + scene.cells.length + ' cells）');

  const all = []; (function flat(nd, cell) { nd.cell = cell; all.push(nd); (nd.kids || []).forEach(k => flat(k, cell)); })(board, null);
  const boardTexts = nd => { const out = []; (function w2(x) { (x.kids || []).forEach(k => { if (k.tag === 'text') out.push(String(k.name).trim()); w2(k); }); })(nd); return out; };

  const D = { p1: [], p2: [], p3: [], p4: [], p5: [] };
  const nSceneLib = (function cntLib() { let c = 0; scene.cells.forEach(cl => walkSceneLib(cl.root, false, n => { if (n.lib) c++; })); return c; })();
  const boardInsts = all.filter(n => n.tag === 'instance');
  const classInsts = boardInsts.filter(n => /^(ms-|bc-)/.test(n.name));

  // P1 设计师·库引用
  {
    const rate = nSceneLib ? boardInsts.length / nSceneLib : 1;
    if (nSceneLib > 0 && boardInsts.length === 0) D.p1.push('库实例 0 —— ' + nSceneLib + ' 个 lib 命中全灭（查 key/订阅，figma-asset-libs §4.4）');
    else if (rate < 0.5) D.p1.push('库实例落图率 ' + Math.round(rate * 100) + '%（board ' + boardInsts.length + ' / scene lib ' + nSceneLib + '）—— 低于 50%，查回退原因');
    const shellInst = boardInsts.find(n => /sidenav|sidebar/.test(n.name));
    if (!shellInst) D.p1.push('壳侧边栏库实例缺失（bc-eg71-sidenav → 业务库完整侧边栏未命中）');
    console.log('P1 库引用: scene lib ' + nSceneLib + ' → board instances ' + boardInsts.length + '（类名实例 ' + classInsts.length + '，落图率 ' + Math.round(rate * 100) + '%）');
  }

  // P2 设计师·文案卫生（metadata 只见实例外文本；实例内层泄漏由 mock 靶覆盖）
  {
    const LEAK = /^(Label|Button|Tab|Title|标题|弹窗)$/;
    const leaks = all.filter(n => n.tag === 'text' && LEAK.test(String(n.name).trim()));
    leaks.slice(0, 8).forEach(t => D.p2.push('主档默认文案泄漏: text "' + t.name + '" @' + t.id + '（cell ' + (t.cell ? t.cell.name : '?') + '）'));
    console.log('P2 文案卫生: 裸默认文案 ' + leaks.length + ' 处');
  }

  // P3 HTML·几何（具名帧宽高 + 蒙版提升位）
  {
    let checked = 0;
    scene.cells.forEach((cl, i) => {
      const bc = boardCells[i];
      if (!bc) { D.p3.push('cell 缺失: scene[' + i + '] ' + (cl.label || '') + ' 无对应 board cell'); return; }
      const targets = sceneNamedFrames(cl.root).filter(n => /ms-(mask|shell|main|header|modal)|bc-eg71-lib/.test(String(n.n)));
      // 同名取首个（同名帧——多蒙版同 cell 只查尺寸集合）
      const byName = {};
      targets.forEach(n => { (byName[n.n] = byName[n.n] || []).push(n); });
      Object.entries(byName).forEach(([nm, list]) => {
        const wset = list.map(n => Math.round(n.w)), hset = list.map(n => Math.round(n.h));
        const boardHits = (function find(bc2, re) { const out = []; (function w3(x) { (x.kids || []).forEach(k => { if (re.test(String(k.name))) out.push(k); w3(k); }); })(bc2); return out; })(bc, new RegExp('^' + nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\s+\\d+)?$'));
        if (!boardHits.length) { if (/ms-mask|bc-eg71-lib/.test(nm)) D.p3.push('帧缺失: "' + nm + '"（cell ' + bc.name + '）—— scene 有 board 无'); return; }
        boardHits.forEach(bh => {
          checked++;
          if (Math.abs(bh.w - wset[0]) > TOL && !wset.some(w => Math.abs(bh.w - w) <= TOL))
            D.p3.push('宽度偏差: "' + nm + '" @' + bh.id + ' board ' + bh.w + ' ≠ scene ' + wset.join('/') + '（cell ' + bc.name + '）');
          if (Math.abs(bh.h - hset[0]) > TOL && !hset.some(h => Math.abs(bh.h - h) <= TOL))
            D.p3.push('高度偏差: "' + nm + '" @' + bh.id + ' board ' + bh.h + ' ≠ scene ' + hset.join('/') + '（cell ' + bc.name + '）');
          if (/ms-mask|bc-eg71-lib/.test(nm) && bh.parent === bc && Math.abs(bh.y - 24) > 1)
            D.p3.push('蒙版提升位: "' + nm + '" @' + bh.id + ' y=' + bh.y + ' ≠ 24（lift 双重补偿形态，cell ' + bc.name + '）');
        });
      });
    });
    console.log('P3 几何: 比对 ' + checked + ' 帧（tol ±' + TOL + 'px）');
  }

  // P4 HTML·文本（get_metadata 对 TEXT 名硬截 20 字符——907 节点实测 max=20，frame 到 59；按 20 前缀模糊匹配）
  {
    let miss = 0, total = 0;
    const PREFIX = 20;
    scene.cells.forEach((cl, i) => {
      const bc = boardCells[i]; if (!bc) return;
      const st = new Set(sceneTextsOf(cl.root));
      const bt = [...new Set(boardTexts(bc))];
      st.forEach(t => { total++; const hit = bt.some(b => t === b || (t.startsWith(b.trim()) && b.trim().length >= Math.min(t.length, PREFIX) - 1)); if (!hit) { miss++; if (D.p4.length < 10) D.p4.push('文本缺失: "' + (t.length > 24 ? t.slice(0, 24) + '…' : t) + '"（cell ' + bc.name + '）—— 可能在实例内部（metadata 叶子局限）'); } });
    });
    const rate = total ? miss / total : 0;
    if (rate > 0.05) D.p4.push('文本缺失率 ' + (rate * 100).toFixed(1) + '% 超阈值 5%');
    console.log('P4 文本: ' + total + ' 段，缺失 ' + miss + '（' + (total ? (100 * miss / total).toFixed(1) : '0') + '%，阈值 5%）');
  }

  // P5 用户场景·可交互
  {
    boardCells.forEach(bc => {
      // 蒙版全幅
      (function w4(x) {
        (x.kids || []).forEach(k => {
          if (/ms-mask|bc-eg71-lib-(progress|upload|result)/.test(k.name) && k.parent === bc && Math.abs(k.w - bc.w) > TOL)
            D.p5.push('蒙版未全幅: "' + k.name + '" @' + k.id + ' ' + k.w + 'px ≠ cell ' + bc.w + 'px（盖不满整屏，cell ' + bc.name + '）');
          w4(k);
        });
      })(bc);
    });
    // 失管 svg（300×300）与按钮热区
    // 塌缩判定以 scene 实测高度为准：demo 原生矮链钮（REQ-015 表格链钮 16px、REQ-020 链钮 22px）不算塌缩，
    // 只有板高 <20 且与同名 scene 高度对不上（AL-hug 压扁形态）才报缺陷。
    const sceneBtnH = {};
    scene.cells.forEach(cl => walkSceneLib(cl.root, false, n => { if (/ms-btn/.test(String(n.n || ''))) (sceneBtnH[n.n] = sceneBtnH[n.n] || []).push(n.h || 0); }));
    all.forEach(n => {
      if (Math.abs(n.w - 300) < 2 && Math.abs(n.h - 300) < 2) D.p5.push('300×300 失管 svg @' + n.id + ' "' + n.name + '"（约束缺失形态）');
      if (/ms-btn/.test(n.name) && n.h > 0 && n.h < 20) {
        const native = (sceneBtnH[n.name] || []).some(h => h > 0 && Math.abs(h - n.h) <= TOL);
        if (!native) D.p5.push('按钮热区塌缩: "' + n.name + '" @' + n.id + ' h=' + n.h + (sceneBtnH[n.name] ? '（scene ' + Math.max(...sceneBtnH[n.name].filter(x => x > 0)).toFixed(0) + '）' : ''));
      }
    });
    // 同级文本重叠
    (function overlap(x, cn) {
      const texts = (x.kids || []).filter(k => k.tag === 'text' && k.w > 0 && k.h > 0);
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        if (ix * iy > 0.3 * Math.min(a.w * a.h, b.w * b.h))
          D.p5.push('同级文本重叠: "' + a.name + '" × "' + b.name + '" @' + a.id + '/' + b.id + '（' + cn + '）');
      }
      (x.kids || []).forEach(k => overlap(k, cn));
    })(board, '');
    console.log('P5 用户场景: 蒙版全幅/热区/失管svg/文本重叠 检查完毕');
  }

  // ---------- 汇总 ----------
  const passes = [['P1 设计师·库引用', D.p1], ['P2 设计师·文案卫生', D.p2], ['P3 HTML·几何', D.p3], ['P4 HTML·文本', D.p4], ['P5 用户场景·可交互', D.p5]];
  let fail = 0;
  console.log('');
  passes.forEach(([nm, list]) => {
    const ok = list.length === 0;
    if (!ok) fail++;
    console.log((ok ? '✓ ' : '✗ ') + nm + ' —— ' + (ok ? '通过' : list.length + ' 条缺陷'));
    list.slice(0, 12).forEach(d => console.log('    · ' + d));
    if (list.length > 12) console.log('    · …另 ' + (list.length - 12) + ' 条');
  });
  console.log('');
  console.log('=== verify-import: ' + (5 - fail) + '/5 轮通过' + (fail ? '，' + fail + ' 轮待修' : ' ✓'));
  process.exit(fail ? 1 : 0);
})();
