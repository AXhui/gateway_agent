#!/usr/bin/env node
// DOM↔scene 审计器 —— 10 轮保真验证的度量仪（R1 基线 / R2-R9 逐轮回归）。
// 链路：demo + AUDIT_JS + BOOTSTRAP 注入 → 无头 Chrome 逐态序列化（每态当场审计）→
// 提取 ms-audit-json → 汇总每类缺陷 + 保真分（pass/(pass+fail)）。
// 只验序列化层；插件落图层由 figma-mock.test.js 验。
// 用法: node verify-scene.js <demo.html> [--quiet]

const fs = require('fs'), path = require('path'), cp = require('child_process');
const { BOOTSTRAP } = require('./scene-bootstrap');
const { AUDIT_JS } = require('./scene-audit');

const args = process.argv.slice(2);
const demoPath = args.find(a => !a.startsWith('--'));
const quiet = args.includes('--quiet');
if (!demoPath || !fs.existsSync(demoPath)) {
  console.error('用法: node verify-scene.js <demo.html> [--quiet]');
  process.exit(1);
}

const html = fs.readFileSync(demoPath, 'utf8');
const inject = '\n<script>' + AUDIT_JS + '<\/script>\n<script>' + BOOTSTRAP + '<\/script>';
const built = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, inject + '\n</body>') : html + inject;
const tmp = '/tmp/ms-audit-in-' + Date.now() + '.html';
fs.writeFileSync(tmp, built);

const chrome = process.env.CHROME && fs.existsSync(process.env.CHROME) ? process.env.CHROME
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chrome)) { console.error('找不到 Chrome（可用 CHROME 环境变量指定）'); process.exit(2); }

const dump = cp.execFileSync(chrome,
  ['--headless', '--disable-gpu', '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom', 'file://' + tmp],
  { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
fs.unlinkSync(tmp);

const m = dump.match(/<script id="ms-audit-json" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error('未找到审计结果——序列化或审计脚本未执行（注入失败？）'); process.exit(3); }
const reports = JSON.parse(m[1]);

let totPass = 0, totFail = 0, totEls = 0;
const catTot = {};
const sample = [];
for (const rep of reports) {
  totPass += rep.pass; totFail += rep.fail; totEls += rep.els;
  Object.entries(rep.cats || {}).forEach(([k, v]) => catTot[k] = (catTot[k] || 0) + v);
  rep.items.slice(0, 6).forEach(it => sample.push(`  [${it.cat}] ${it.path} · ${it.msg}`));
  const score = rep.pass + rep.fail ? (100 * rep.pass / (rep.pass + rep.fail)).toFixed(2) : '100.00';
  if (!quiet) console.log(`屏 ${rep.idx + 1}「${rep.label}」: ${rep.els} 元素 · ${rep.pass} 通过 / ${rep.fail} 失败 · 保真分 ${score}%`);
}
const total = totPass + totFail;
const score = total ? (100 * totPass / total).toFixed(2) : '100.00';
console.log(`\n=== ${path.basename(demoPath)} · 总保真分 ${score}%（${totPass}/${total} 断言，${totEls} 元素×${reports.length} 态）`);
if (Object.keys(catTot).length) {
  console.log('缺陷分布: ' + Object.entries(catTot).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + '×' + v).join('  '));
  if (!quiet) { console.log('样例（每屏前 6 条）:'); sample.slice(0, 30).forEach(s => console.log(s)); }
} else console.log('缺陷分布: 零缺陷 ✓');
process.exit(totFail === 0 ? 0 : 1);
