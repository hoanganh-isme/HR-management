import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function freePort() {
  const server = http.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitFor(url, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Document API exited with ${child.exitCode}.`);
    try { const response = await fetch(url); if (response.ok) return; } catch (error) { /* startup */ }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Timed out waiting for Document API.');
}

test('Document API recovers from reset and maps persistent upstream errors', async (t) => {
  let mode = 'success';
  let gatewayAttempts = 0;
  const sql = http.createServer((request, response) => {
    if (request.url === '/api/API_LayQuyenCuaToi' && request.method === 'POST') {
      request.resume();
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ records: mode === 'forbidden' ? [] : [{ FormName: 'WA_HopDongLaoDongFrm', CanView: 1, CanAdd: 1, CanEdit: 1 }] }));
      return;
    }
    if (request.url.startsWith('/api/API_Gateway_Router')) {
      gatewayAttempts += 1;
      if (mode === 'reset-always' || (mode === 'reset-once' && gatewayAttempts === 1)) return request.socket.destroy();
      const records = mode === 'empty' ? [] : [{ FormName: 'WA_HopDongLaoDongFrm', TemplateFile: 'HopDong.docx', GhiChu: 'Hop dong lao dong' }];
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ code: 0, records }));
      return;
    }
    response.writeHead(404).end();
  });
  sql.listen(0, '127.0.0.1');
  await once(sql, 'listening');
  t.after(() => new Promise((resolve) => sql.close(resolve)));

  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: 'development', PORT: String(port),
      SQL_API_BASE: `http://127.0.0.1:${sql.address().port}`,
      SQL_API_TIMEOUT_MS: '100', SQL_API_RETRY_COUNT: '1', SQL_API_RETRY_BASE_DELAY_MS: '1',
      DOCUMENT_PUBLIC_BASE_URL: origin, DOCUMENT_INTERNAL_BASE_URL: origin,
      ONLYOFFICE_PUBLIC_URL: 'http://127.0.0.1:8000', DRAFT_SIGNING_SECRET: 'integration-secret'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  await waitFor(origin + '/health', child);
  const authHeaders = { Authorization: 'Bearer fake-token', Username: 'tester' };

  let response = await fetch(origin + '/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');

  response = await fetch(origin + '/api/contract-templates', { headers: authHeaders });
  assert.equal(response.status, 200, stderr);
  assert.equal((await response.json()).data.length, 1);

  mode = 'reset-once';
  gatewayAttempts = 0;
  response = await fetch(origin + '/api/contract-templates', { headers: authHeaders });
  assert.equal(response.status, 200, stderr);
  assert.equal(gatewayAttempts, 2);

  mode = 'empty';
  response = await fetch(origin + '/api/contract-templates', { headers: authHeaders });
  assert.deepEqual((await response.json()).data, []);

  response = await fetch(origin + '/api/contract-templates');
  assert.equal(response.status, 401);

  mode = 'forbidden';
  response = await fetch(origin + '/api/contract-templates', { headers: authHeaders });
  assert.equal(response.status, 403);

  mode = 'reset-always';
  gatewayAttempts = 0;
  response = await fetch(origin + '/api/contract-templates', { headers: authHeaders });
  const unavailable = await response.json();
  assert.equal(response.status, 503, stderr);
  assert.equal(unavailable.code, 'SQL_GATEWAY_UNAVAILABLE');

  response = await fetch(origin + '/ready');
  const notReady = await response.json();
  assert.equal(response.status, 503, JSON.stringify(notReady));
  assert.equal(notReady.status, 'not-ready');

  mode = 'success';
  response = await fetch(origin + '/ready');
  assert.equal(response.status, 200, stderr);
  assert.equal((await response.json()).status, 'ready');
});
