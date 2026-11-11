#!/usr/bin/env node
/* ===========================================================================
   shots — screenshot every route, then read the rendered text back
   ---------------------------------------------------------------------------
   Usage
     node tools/shots.js                     all routes, 1440 + 1920
     node tools/shots.js --width=1440        one width
     node tools/shots.js --only=home,styleguide
     node tools/shots.js --no-shots          text checks only (fast)

   No dependencies: it drives the Chrome/Edge that is already installed through
   the headless screenshot + dump-dom flags. If a Chromium is not found, set
   CHROME_PATH.

   Output
     shots/<route>-<width>.png   full-page screenshots (git-ignored)
     shots/report.json           per-route text findings (CJK, arrows, height)
   =========================================================================== */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'shots');
const ENTRY = path.join(ROOT, 'index.html');

const argv = process.argv.slice(2);
const arg = (name) => {
  const hit = argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : null;
};
const flag = (name) => argv.includes('--' + name);

const WIDTHS = (arg('width') || '1440,1920').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
const ONLY = (arg('only') || '').split(',').filter(Boolean);
const DO_SHOTS = !flag('no-shots');

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'styleguide', path: '/styleguide' },
  { name: 'studio-dashboard', path: '/app' },
  { name: 'projects', path: '/app/projects' },
  { name: 'project-detail', path: '/app/projects/rain' },
  { name: 'assets', path: '/app/assets' },
  { name: 'tasks', path: '/app/tasks' },
  { name: 'new-project', path: '/app/new' },
  { name: 'exports', path: '/app/exports' },
  { name: 'settings', path: '/app/settings' },
  { name: 'pricing', path: '/pricing' },
  { name: 'tools', path: '/tools' },
  { name: 'auth', path: '/auth' },
  { name: 'showcase', path: '/showcase' },
];

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const ARROWS = /[\u2190-\u2193\u2195-\u2199\u21b6\u21bb\u27a1]/g;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

const CHROME = findChrome();
if (!CHROME) {
  console.error('shots: no Chrome or Edge found. Set CHROME_PATH to a Chromium binary.');
  process.exit(1);
}

const profile = path.join(require('os').tmpdir(), 'cimora-shots-profile');
if (!DO_SHOTS) fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

function chrome(args) {
  return spawnSync(CHROME, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64, timeout: 120000 });
}

function fileUrl(routePath) {
  const p = ENTRY.replace(/\\/g, '/');
  return 'file:///' + p.replace(/^\//, '') + '#' + routePath;
}

const baseArgs = [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--disable-background-networking',
  '--user-data-dir=' + profile,
];

const report = [];
const routes = ONLY.length ? ROUTES.filter((r) => ONLY.includes(r.name)) : ROUTES;

for (const route of routes) {
  const url = fileUrl(route.path);

  // rendered text: what a visitor actually sees, not what the source says
  const dump = chrome([...baseArgs, '--virtual-time-budget=6000', '--dump-dom', url]);
  const dom = dump.stdout || '';
  const text = dom
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const cjk = (text.match(CJK) || []).length;
  const arrows = (text.match(ARROWS) || []).length;
  const empty = text.trim().length < 40;

  const row = { route: route.path, name: route.name, chars: text.trim().length, cjk, arrows, empty, shots: [] };

  if (DO_SHOTS) {
    for (const w of WIDTHS) {
      const file = path.join(OUT, route.name + '-' + w + '.png');
      const res = chrome([...baseArgs, '--window-size=' + w + ',1000', '--virtual-time-budget=6000', '--screenshot=' + file, url]);
      const ok = fs.existsSync(file) && fs.statSync(file).size > 2000;
      row.shots.push({ width: w, file: path.relative(ROOT, file).split(path.sep).join('/'), ok, bytes: ok ? fs.statSync(file).size : 0 });
      if (!ok && res.stderr && res.stderr.trim()) row.error = res.stderr.trim().split('\n')[0];
    }
  }

  report.push(row);
  const status = row.empty ? 'EMPTY' : (row.cjk ? 'CJK' : 'ok');
  const shotsTxt = row.shots.map((s) => s.width + 'px:' + (s.ok ? Math.round(s.bytes / 1024) + 'KB' : 'FAIL')).join(' ');
  console.log(
    (status === 'ok' ? '  ok  ' : '  !!  ') +
    route.path.padEnd(24) +
    String(row.chars).padStart(6) + ' chars ' +
    String(row.cjk).padStart(3) + ' cjk ' +
    String(row.arrows).padStart(3) + ' arrow  ' + shotsTxt
  );
}

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ generated: new Date().toISOString(), report }, null, 2));

const bad = report.filter((r) => r.empty || r.cjk || r.arrows || r.shots.some((s) => !s.ok));
console.log('');
console.log('shots: ' + routes.length + ' route(s), ' + (DO_SHOTS ? WIDTHS.length + ' width(s), ' : '') + bad.length + ' problem(s)');
console.log('report: ' + path.relative(ROOT, path.join(OUT, 'report.json')));
process.exit(bad.length ? 1 : 0);
