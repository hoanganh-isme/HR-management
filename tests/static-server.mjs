import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.cwd());
const port = Number(process.env.TEST_STATIC_PORT || 4173);
const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
};

http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const target = path.resolve(root, `.${requestPath === '/' ? '/index.html' : requestPath}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
    }
    fs.stat(target, (statError, stat) => {
        if (statError || !stat.isFile()) {
            response.writeHead(404).end('Not found');
            return;
        }
        response.setHeader('Content-Type', contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream');
        fs.createReadStream(target).pipe(response);
    });
}).listen(port, '127.0.0.1', () => {
    console.info(`Static test server listening on http://127.0.0.1:${port}`);
});
