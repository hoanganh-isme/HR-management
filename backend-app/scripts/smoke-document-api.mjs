const baseUrl = String(process.env.DOCUMENT_API_BASE || 'http://127.0.0.1:8081').replace(/\/+$/, '');
const token = String(process.env.AUTH_TOKEN || '').trim();

async function check(name, path, requiresAuth) {
  const headers = requiresAuth && token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await fetch(baseUrl + path, { headers });
    const body = await response.json();
    if (!response.ok) throw Object.assign(new Error(body.message || `HTTP ${response.status}`), { status: response.status, body });
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(`status=${error.status || 'NETWORK'} code=${error.body?.code || error.code || 'UNKNOWN'} requestId=${error.body?.details?.requestId || '-'}`);
    process.exitCode = 1;
  }
}

await check('health', '/health', false);
await check('ready', '/ready', false);
if (!token) {
  console.error('FAIL authenticated checks: AUTH_TOKEN is not configured.');
  process.exitCode = 1;
} else {
  await check('contract templates', '/api/contract-templates', true);
  await check('contract attachments', '/api/contract-attachments', true);
}
