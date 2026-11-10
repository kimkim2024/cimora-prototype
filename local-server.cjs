const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.argv[2] || 4186);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
const server = http.createServer((request, response) => {
  let target;
  try { target = path.resolve(root, '.' + decodeURIComponent(new URL(request.url,'http://localhost').pathname)); }
  catch { response.writeHead(400).end(); return; }
  if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (target === root) target = path.join(root,'开始体验.html');
  fs.stat(target, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
    let start = 0, end = stat.size - 1;
    const headers = {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    if (request.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (!match || (!match[1] && !match[2])) { response.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end(); return; }
      start = match[1] ? Number(match[1]) : Math.max(0,stat.size-Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]),end) : end;
      if (start > end || start >= stat.size) { response.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length'] = Math.max(0,end-start+1);
    response.writeHead(request.headers.range?206:200,headers);
    if (request.method === 'HEAD' || !stat.size) response.end();
    else fs.createReadStream(target,{start,end}).pipe(response);
  });
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'端口已占用，请执行 node local-server.cjs 4187':error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
  const url = `http://127.0.0.1:${port}/start.html`;
  console.log(`Cimora：${url}\n保持窗口打开；按 Ctrl+C 停止。`);
  if (process.argv.includes('--open')) {
    const {spawn} = require('node:child_process');
    const opener = process.platform === 'darwin' ? spawn('open',[url]) : process.platform === 'win32' ? spawn('rundll32',['url.dll,FileProtocolHandler',url],{windowsHide:true}) : spawn('xdg-open',[url]);
    opener.on('error',()=>console.log('请手动打开上述地址。'));
  }
});
