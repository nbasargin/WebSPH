const http = require('http'),
  fs = require('fs'),
  path = require('path');
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
http
  .createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(root)) return res.writeHead(403).end();
    fs.readFile(p, (err, data) => {
      if (err) return res.writeHead(404).end('not found');
      res
        .writeHead(200, {
          'Content-Type': types[path.extname(p)] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
        .end(data);
    });
  })
  .listen(4300, '127.0.0.1', () => console.log('http://localhost:4300/mockup.html'));
