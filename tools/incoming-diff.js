#!/usr/bin/env node
/* ===========================================================================
   incoming-diff — compare a dropped zip/folder against this repository
   ---------------------------------------------------------------------------
   Use it whenever somebody hands over a new build of the prototype: it tells
   you, file by file, what is new, what is missing, and which overlapping files
   would delete work that only exists here (design tokens, the styleguide, the
   render-time fixes).

     node tools/incoming-diff.js <path-to.zip | path-to-folder>
     node tools/incoming-diff.js <zip> --extract        also extract to .incoming/
     node tools/incoming-diff.js <zip> --only=css,js    filter the file list

   It never writes to the repository. The extraction target is .incoming/,
   which is git-ignored.
   =========================================================================== */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STAGE = path.join(ROOT, '.incoming');
const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith('--'));
const arg = (n) => {
  const hit = argv.find((a) => a.startsWith('--' + n + '='));
  return hit ? hit.split('=').slice(1).join('=') : null;
};
const ONLY = (arg('only') || '').split(',').filter(Boolean).map((e) => '.' + e.replace(/^\./, ''));

if (!target) {
  console.error('usage: node tools/incoming-diff.js <path-to.zip | path-to-folder> [--extract]');
  process.exit(2);
}

/* ------------------------------------------------------------------ staging */
function extract(zip) {
  fs.rmSync(STAGE, { recursive: true, force: true });
  fs.mkdirSync(STAGE, { recursive: true });
  const isWin = process.platform === 'win32';
  const cmd = isWin
    ? ['powershell', ['-NoProfile', '-Command', 'Expand-Archive -LiteralPath ' + JSON.stringify(zip) + ' -DestinationPath ' + JSON.stringify(STAGE) + ' -Force']]
    : ['unzip', ['-q', zip, '-d', STAGE]];
  const r = spawnSync(cmd[0], cmd[1], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error('extract failed:', (r.stderr || '').split('\n')[0]);
    process.exit(1);
  }
  // a single top folder is the usual packaging: flatten it
  const entries = fs.readdirSync(STAGE, { withFileTypes: true });
  if (entries.length === 1 && entries[0].isDirectory()) return path.join(STAGE, entries[0].name);
  return STAGE;
}

let INCOMING = path.resolve(target);
if (!fs.existsSync(INCOMING)) {
  console.error('not found:', INCOMING);
  process.exit(1);
}
if (fs.statSync(INCOMING).isFile()) {
  const zipArg = argv.includes('--keep-zip') ? INCOMING : INCOMING;
  INCOMING = extract(zipArg);
  console.log('extracted to', path.relative(ROOT, INCOMING));
}

/* --------------------------------------------------------------------- walk */
function walk(dir, base = dir, out = new Map()) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.incoming', 'node_modules', 'shots', 'dist'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else out.set(path.relative(base, p).split(path.sep).join('/'), p);
  }
  return out;
}

const theirs = walk(INCOMING);
const ours = walk(ROOT);
const lines = (p) => {
  try {
    const s = fs.readFileSync(p, 'utf8');
    if (s.includes('\u0000')) return -1;
    return s.split('\n').length;
  } catch (e) {
    return -1;
  }
};
const same = (a, b) => {
  const sa = fs.statSync(a).size;
  const sb = fs.statSync(b).size;
  if (sa !== sb) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
};
const keep = (f) => !ONLY.length || ONLY.includes(path.extname(f).toLowerCase());

/* markers: things that exist only in this repository and would be lost by a
   naive "take theirs" merge */
const MARKERS = [
  { file: 'index.html', needle: 'design/tokens.css', label: 'design tokens link' },
  { file: 'index.html', needle: 'cimora-folder-cards.js', label: 'glass folder cards' },
  { file: 'index.html', needle: 'cimora-styleguide.js', label: 'styleguide route' },
  { file: 'site-core.js', needle: '\u21b6', label: 'extended arrow set' },
  { file: 'site-core.js', needle: 'stripArrowsIn(document.getElementById("site"));}', label: 'arrow strip on first load' },
  { file: 'cimora-workspace-dash.js', needle: 'fitBandType', label: 'dead fitBandType call (should stay removed)' },
  { file: 'cimora-studio-skin.css', needle: '.public-header .cm-logo img', label: 'logo sizing fix' },
];

const added = [];
const missing = [];
const changed = [];

for (const [f, p] of theirs) {
  if (!keep(f)) continue;
  if (!ours.has(f)) { added.push(f); continue; }
  if (!same(p, ours.get(f))) changed.push(f);
}
for (const f of ours.keys()) if (!theirs.has(f) && keep(f)) missing.push(f);

const regressions = [];
for (const f of changed) {
  const mine = fs.readFileSync(ours.get(f), 'utf8');
  const incoming = fs.readFileSync(theirs.get(f), 'utf8');
  for (const m of MARKERS) {
    if (m.file !== f) continue;
    if (mine.includes(m.needle) && !incoming.includes(m.needle)) {
      regressions.push([f, 'would lose: ' + m.label]);
    }
  }
}

/* ------------------------------------------------------------------- report */
const pad = (s, n) => String(s).padEnd(n);
console.log('');
console.log('incoming : ' + theirs.size + ' file(s)  ' + path.relative(ROOT, INCOMING));
console.log('current  : ' + ours.size + ' file(s)');
console.log('');
console.log('ADDED    ' + added.length + '   only in the new build');
console.log('CHANGED  ' + changed.length + '   differ in both');
console.log('MISSING  ' + missing.length + '   only here (the new build does not have them)');
console.log('');

if (added.length) {
  console.log('ADDED');
  for (const f of added.slice(0, 40)) console.log('  + ' + f);
  if (added.length > 40) console.log('  ... ' + (added.length - 40) + ' more');
  console.log('');
}

if (changed.length) {
  console.log('CHANGED  ' + pad('file', 44) + pad('ours', 8) + pad('theirs', 8) + 'note');
  for (const f of changed.slice(0, 60)) {
    const a = lines(ours.get(f));
    const b = lines(theirs.get(f));
    const note = regressions.find((r) => r[0] === f);
    console.log('  ~ ' + pad(f.length > 42 ? '...' + f.slice(-41) : f, 44) + pad(a < 0 ? 'binary' : a, 8) + pad(b < 0 ? 'binary' : b, 8) + (note ? note[1] : ''));
  }
  if (changed.length > 60) console.log('  ... ' + (changed.length - 60) + ' more');
  console.log('');
}

if (missing.length) {
  console.log('MISSING  (keep these)');
  for (const f of missing.slice(0, 40)) console.log('  - ' + f);
  if (missing.length > 40) console.log('  ... ' + (missing.length - 40) + ' more');
  console.log('');
}

if (regressions.length) {
  console.log('REGRESSIONS - taking the new build for these files would delete work:');
  for (const [f, why] of regressions) console.log('  ! ' + f + '  ->  ' + why);
  console.log('');
}

console.log('next: copy the added files, review each changed file by hand (see note column),');
console.log('      never delete the MISSING list, then run:  npm run lint && npm run shots');
