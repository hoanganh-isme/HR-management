import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { SqlGatewayClient } from '../src/gateway/sql-gateway-client.js';

async function createMock(handler) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    server,
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

function client(origin, options = {}) {
  return new SqlGatewayClient({
    baseUrl: origin,
    defaultUser: 'admin',
    timeoutMs: options.timeoutMs || 200,
    retryCount: options.retryCount ?? 1,
    retryBaseDelayMs: 1,
    maxGetUrlLength: options.maxGetUrlLength || 7000,
    keepAlive: options.keepAlive,
    production: options.production,
    random: () => 0,
    logger: options.logger || { warn() {} }
  });
}

test('View keeps the Gateway payload and forwards Authorization', async (t) => {
  let received;
  const mock = await createMock((request, response) => {
    received = { url: request.url, authorization: request.headers.authorization };
    sendJson(response, 200, { code: 0, records: [{ ok: true }] });
  });
  t.after(() => mock.close());
  const gateway = client(mock.origin);
  t.after(() => gateway.close());
  const result = await gateway.xem('HR_HopDongAddfile', {
    UserName: 'tester', Keyword: 'contract', Page: 2, Limit: 15, JsonData: { BranchID: 'COBI' }
  }, 'Bearer secret');
  assert.equal(result.records[0].ok, true);
  const payload = JSON.parse(decodeURIComponent(new URL(received.url, mock.origin).searchParams.get('q')));
  assert.deepEqual(payload, {
    List: 'HR_HopDongAddfile', Func: 'View', UserName: 'tester', Keyword: 'contract',
    Page: 2, Limit: 15, JsonData: JSON.stringify({ BranchID: 'COBI' })
  });
  assert.equal(received.authorization, 'Bearer secret');
});

test('View retries one socket reset and succeeds', async (t) => {
  let attempts = 0;
  const mock = await createMock((request, response) => {
    attempts += 1;
    if (attempts === 1) return request.socket.destroy();
    sendJson(response, 200, { code: 0, records: [] });
  });
  t.after(() => mock.close());
  const gateway = client(mock.origin);
  t.after(() => gateway.close());
  await gateway.xem('HR_HopDongAddfile');
  assert.equal(attempts, 2);
});

test('Repeated socket reset becomes SQL_GATEWAY_UNAVAILABLE', async (t) => {
  let attempts = 0;
  const mock = await createMock((request) => { attempts += 1; request.socket.destroy(); });
  t.after(() => mock.close());
  const gateway = client(mock.origin);
  t.after(() => gateway.close());
  await assert.rejects(gateway.xem('HR_HopDongAddfile'), (error) => {
    assert.equal(error.status, 503);
    assert.equal(error.code, 'SQL_GATEWAY_UNAVAILABLE');
    assert.equal(error.details.causeCode, 'ECONNRESET');
    return true;
  });
  assert.equal(attempts, 2);
});

test('HTTP 503 retries but HTTP 401 and 403 do not', async (t) => {
  for (const status of [503, 401, 403]) {
    let attempts = 0;
    const mock = await createMock((request, response) => { attempts += 1; sendJson(response, status, {}); });
    const gateway = client(mock.origin);
    await assert.rejects(gateway.xem('List'));
    assert.equal(attempts, status === 503 ? 2 : 1);
    gateway.close();
    await mock.close();
  }
});

test('Timeout retries and write operation never retries', async (t) => {
  let readAttempts = 0;
  const slow = await createMock(() => { readAttempts += 1; });
  const readClient = client(slow.origin, { timeoutMs: 20 });
  await assert.rejects(readClient.xem('SlowList'), { code: 'SQL_GATEWAY_UNAVAILABLE' });
  assert.equal(readAttempts, 2);
  readClient.close();
  await slow.close();

  let writeAttempts = 0;
  const reset = await createMock((request) => { writeAttempts += 1; request.socket.destroy(); });
  const writeClient = client(reset.origin);
  await assert.rejects(writeClient.thaoTac('WriteList', 'Save', { id: 1 }), { code: 'SQL_GATEWAY_ACTION_FAILED' });
  assert.equal(writeAttempts, 1);
  writeClient.close();
  await reset.close();
});

test('URL limit, keep-alive switch and production redaction are enforced', async () => {
  const tooSmall = client('http://127.0.0.1:9', { maxGetUrlLength: 30 });
  await assert.rejects(tooSmall.xem('List', { Keyword: 'large' }), { code: 'SQL_GATEWAY_QUERY_TOO_LARGE' });
  tooSmall.close();

  const keepAlive = client('http://127.0.0.1:9', { keepAlive: true });
  const noKeepAlive = client('http://127.0.0.1:9', { keepAlive: false });
  assert.equal(keepAlive.httpAgent.options.keepAlive, true);
  assert.equal(noKeepAlive.httpAgent.options.keepAlive, false);
  keepAlive.close();
  noKeepAlive.close();

  const production = client('http://127.0.0.1:9', { production: true, retryCount: 0 });
  await assert.rejects(production.xem('List'), (error) => {
    assert.equal(error.details.upstreamOrigin, undefined);
    assert.equal(error.stack.includes('Authorization'), false);
    return true;
  });
  production.close();
});

test('Readiness probe treats Gateway session code as authentication required', async (t) => {
  const mock = await createMock((request, response) => sendJson(response, 200, { code: 2, msg: 'Session expired' }));
  t.after(() => mock.close());
  const gateway = client(mock.origin);
  t.after(() => gateway.close());
  await assert.rejects(gateway.probe(), (error) => {
    assert.equal(error.status, 401);
    assert.equal(error.code, 'SQL_GATEWAY_AUTH_FAILED');
    return true;
  });
});
