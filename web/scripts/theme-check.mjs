#!/usr/bin/env node
/**
 * Keeps the Tailwind theme in step with design/tokens.css.
 *
 * The prototype still ships its palette in ../design/tokens.css while the new
 * React UI declares the same values inside src/styles/theme.css (Tailwind v4
 * needs them in @theme to generate utilities). Two copies is one too many, so
 * this script fails the build the moment they drift.
 *
 *   node scripts/theme-check.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = resolve(here, '../../design/tokens.css');
const THEME = resolve(here, '../src/styles/theme.css');

const readPairs = (file, block) => {
  const css = readFileSync(file, 'utf8');
  const source = block ? css.slice(css.indexOf(block)) : css;
  const pairs = new Map();
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    pairs.set(match[1], match[2].toLowerCase());
  }
  return pairs;
};

const tokens = readPairs(TOKENS);
const theme = readPairs(THEME, '@theme');

const missing = [];
const different = [];

for (const [name, value] of theme) {
  const reference = tokens.get(name);
  if (!reference) {
    missing.push(`${name} (${value}) has no counterpart in design/tokens.css`);
    continue;
  }
  if (reference !== value) different.push(`${name}: theme ${value} vs tokens ${reference}`);
}

if (missing.length || different.length) {
  console.error('theme-check failed: src/styles/theme.css is out of step with design/tokens.css');
  for (const line of [...different, ...missing]) console.error('  • ' + line);
  process.exit(1);
}

console.log(`theme-check  ${theme.size} colour tokens match design/tokens.css`);
