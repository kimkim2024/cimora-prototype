'use strict';
// Regression guard for the wheel-scrolling workaround.
//
// Two bugs are easy to reintroduce and invisible until someone tries to scroll:
//  1. an injected <script src="cimora-scroll-guard.js"> with the wrong relative
//     path 404s in every sub-folder, so the guard never runs;
//  2. the guard going back to a one-shot "already installed" boolean, which
//     survives the imported build's document.open()/document.write() while the
//     window listeners do not.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const imported = path.join(root, 'prototype-20261116');
const skipDirs = new Set(['node_modules', '.git', 'dist', 'web', 'shots']);

function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      htmlFiles(path.join(dir, entry.name), acc);
    } else if (entry.name.toLowerCase().endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

function guardRefs(file) {
  const src = fs.readFileSync(file, 'utf8');
  const refs = [];
  const pattern = /src="([^"]*cimora-scroll-guard\.js)"/g;
  let match;
  while ((match = pattern.exec(src)) !== null) refs.push(match[1]);
  return refs;
}

test('every injected scroll-guard reference resolves next to the page', () => {
  const files = [...htmlFiles(root), ...htmlFiles(imported)].filter((file) => file.startsWith(root));
  const broken = [];
  let refs = 0;
  for (const file of files) {
    for (const ref of guardRefs(file)) {
      refs += 1;
      const target = path.resolve(path.dirname(file), ref);
      if (!fs.existsSync(target)) broken.push(`${path.relative(root, file)} -> ${ref}`);
    }
  }
  assert.ok(refs >= 50, `expected the guard to be injected widely, found ${refs} references`);
  assert.deepEqual(broken, [], 'scroll-guard script paths that 404');
});

test('both copies of the guard are the same file', () => {
  const a = fs.readFileSync(path.join(root, 'cimora-scroll-guard.js'), 'utf8');
  const b = fs.readFileSync(path.join(imported, 'cimora-scroll-guard.js'), 'utf8');
  assert.equal(a, b);
});

test('the guard re-attaches instead of trusting a one-shot flag', () => {
  const source = fs.readFileSync(path.join(root, 'cimora-scroll-guard.js'), 'utf8');
  assert.match(source, /__cimoraScrollState/, 'handlers and state must live on window');
  assert.match(source, /function attach\(/, 'attach() must exist so it can be re-run');
  assert.match(source, /Document\.prototype\[name\]/, 'document.open()/close() must trigger a re-attach');
  assert.match(source, /setTimeout\(run, 60\)/, 'a setTimeout watchdog must cover paused animation frames');
  assert.match(source, /behavior: 'instant'/, 'scrolling must bypass CSS scroll-behavior: smooth');
  assert.match(source, /scrollTarget\(/, 'inner scroll panes must be supported, not just the document');
  assert.equal(/__cimoraScrollGuard\b/.test(source), false, 'the one-shot boolean guard flag must stay gone');
});
