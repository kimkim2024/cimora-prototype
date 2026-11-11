/**
 * One-off: screenshot the React app at several widths so the wide-screen layout
 * can be eyeballed. Same headless-Chrome trick as tools/shots.js.
 *
 *   node tools/web-shots.cjs 1440 1920 2560
 *   ROUTE=product node tools/web-shots.cjs 1920
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const CHROME = CANDIDATES.find((p) => p && fs.existsSync(p));
if (!CHROME) {
  console.error('web-shots: no Chrome/Edge found. Set CHROME_PATH.');
  process.exit(1);
}

const ROUTE = process.env.ROUTE || '';
const slug = ROUTE.replace(/[^a-z0-9]/gi, '') || 'home';
const out = path.resolve(__dirname, '..', 'shots');
fs.mkdirSync(out, { recursive: true });

const widths = process.argv.slice(2).map(Number).filter(Boolean);
for (const width of widths.length ? widths : [1920, 2560]) {
  const file = path.join(out, `${slug}-${width}.png`);
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},1200`,
      '--virtual-time-budget=6000',
      `--screenshot=${file}`,
      `http://localhost:5173/#/${ROUTE}`,
    ],
    { stdio: 'ignore' },
  );
  console.log('shot', path.basename(file));
}
