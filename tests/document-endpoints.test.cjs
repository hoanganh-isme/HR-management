const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const envSource = fs.readFileSync(path.join(root, 'env.js'), 'utf8');
const apiSource = fs.readFileSync(path.join(root, 'src/js/modules/contracts/contract-document.api.js'), 'utf8');

function createStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function loadEnv(url, runtimeConfig) {
  const parsed = new URL(url);
  const context = vm.createContext({
    URL,
    console,
    localStorage: createStorage(),
    sessionStorage: createStorage()
  });
  context.window = context;
  context.location = {
    hostname: parsed.hostname,
    protocol: parsed.protocol,
    origin: parsed.origin
  };
  context.RUNTIME_CONFIG = runtimeConfig;
  vm.runInContext(envSource, context, { filename: 'env.js' });
  return context.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get() { return 'application/json; charset=utf-8'; } },
    json() { return Promise.resolve(body); },
    text() { return Promise.resolve(JSON.stringify(body)); }
  };
}

function loadApi(config, fetchImpl, token) {
  const context = vm.createContext({ console, Promise, fetch: fetchImpl, document: { cookie: '' } });
  context.window = context;
  context.API_CONFIG = { ENDPOINTS: { DOCUMENT_MANAGER: config } };
  context.ApiClient = { getCookie() { return token || ''; } };
  vm.runInContext(apiSource, context, { filename: 'contract-document.api.js' });
  return context.ContractDocumentApi;
}

async function main() {
  let config = loadEnv('http://127.0.0.1:5500');
  assert.equal(config.CONTRACT_API_BASE, 'http://127.0.0.1:8081/api');
  assert.equal(config.SERVICE_BASE + '/health', 'http://127.0.0.1:8081/health');
  assert.equal(config.ONLYOFFICE_API, 'http://127.0.0.1:8000/web-apps/apps/api/documents/api.js');

  config = loadEnv('http://localhost:5500');
  assert.equal(config.CONTRACT_API_BASE, 'http://127.0.0.1:8081/api');

  config = loadEnv('https://production.example.com');
  assert.equal(config.CONTRACT_API_BASE, 'https://production.example.com/docserver/api');
  assert.equal(config.UPLOADS_URL, 'https://production.example.com/docserver/uploads/');
  assert.equal(config.ONLYOFFICE_API, 'https://production.example.com/onlyoffice/web-apps/apps/api/documents/api.js');

  config = loadEnv('https://production.example.com', {
    documentApiBaseUrl: 'http://documents.local:9000/',
    onlyOfficeBaseUrl: 'http://office.local:9001/'
  });
  assert.equal(config.CONTRACT_API_BASE, 'http://documents.local:9000/api');
  assert.equal(config.ONLYOFFICE_API, 'http://office.local:9001/web-apps/apps/api/documents/api.js');

  const baseConfig = { CONTRACT_API_BASE: 'http://127.0.0.1:8081/api', SERVICE_BASE: 'http://127.0.0.1:8081' };
  let request;
  let api = loadApi(baseConfig, (url, options) => {
    request = { url, options };
    return Promise.resolve(jsonResponse(200, { success: true, data: [] }));
  }, 'secret-token');
  await api.listSavedAttachments();
  assert.equal(request.url, 'http://127.0.0.1:8081/api/contract-attachments');
  assert.equal(request.options.headers.Authorization, 'Bearer secret-token');

  api = loadApi(baseConfig, () => Promise.reject(new Error('ECONNREFUSED')), 'secret-token');
  await assert.rejects(api.listSavedAttachments(), error => {
    assert.equal(error.code, 'DOCUMENT_API_UNREACHABLE');
    assert.equal(error.message.includes('http://127.0.0.1:8081'), true);
    assert.equal(error.message.includes('secret-token'), false);
    return true;
  });

  api = loadApi(baseConfig, () => Promise.resolve({
    ok: false,
    status: 404,
    headers: { get() { return 'text/html'; } },
    text() { return Promise.resolve('<html>Not found</html>'); }
  }));
  await assert.rejects(api.listSavedAttachments(), error => {
    assert.equal(error.code, 'DOCUMENT_API_NON_JSON');
    assert.equal(error.status, 404);
    assert.equal(error.url.endsWith('/contract-attachments'), true);
    return true;
  });

  api = loadApi(baseConfig, () => Promise.resolve(jsonResponse(403, { success: false, code: 'AUTH_REQUIRED', message: 'Login required' })));
  await assert.rejects(api.listSavedAttachments(), error => {
    assert.equal(error.code, 'AUTH_REQUIRED');
    assert.equal(error.status, 403);
    assert.equal(error.message, 'Login required');
    return true;
  });

  api = loadApi(baseConfig, url => Promise.resolve(jsonResponse(200, { status: 'ok', service: 'HR Document API' })));
  assert.equal((await api.health()).status, 'ok');
  console.log('document-endpoints: OK');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
