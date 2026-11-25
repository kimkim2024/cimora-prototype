#!/usr/bin/env node
/* ===========================================================================
   preview — a static server so the prototype runs from http:// instead of
   file://. Same pages, but closer to what a reviewer will see, and it makes
   font loading, fetch-free assets and hash routing behave identically.
   ---------------------------------------------------------------------------
     node tools/preview.js            http://127.0.0.1:4173/  (opens nothing)
     node tools/preview.js --port=8080
   =========================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = process.argv.find((a) => a.startsWith('--port='));
const PORT = arg ? parseInt(arg.split('=')[1], 10) : 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    let file = path.join(ROOT, url === '/' ? 'index.html' : url);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 ' + url);
      return;
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log('preview  http://127.0.0.1:' + PORT + '/');
    console.log('routes   /#/  /#/app  /#/app/projects  /#/styleguide  /#/pricing');
  });
