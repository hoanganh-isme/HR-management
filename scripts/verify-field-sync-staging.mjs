const REQUIRED_ENV = [
  'FIELD_SYNC_METADATA_BASE_URL',
  'FIELD_SYNC_BEARER_TOKEN',
  'FIELD_SYNC_USERNAME',
  'FIELD_SYNC_BRANCH_ID'
];

const SAFE_USER = /^[A-Za-z0-9_.@-]{1,50}$/;
const SAFE_BRANCH_ITEM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_FIELD = /^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/;
const RESERVED_FIELD_NAMES = new Set(['__proto__', 'prototype', 'constructor']);
const PHASE2_VIEW_ONLY_V2_FORMS = new Set(['wa_bangthuetncnfrm']);

const FORBIDDEN_RESPONSE_KEYS = new Set([
  'source',
  'rawsql',
  'sql',
  'query',
  'statement',
  'commandtext',
  'datasource',
  'lookupsource',
  'defaultvaluesql',
  'para'
]);

const SQL_VALUE_PATTERNS = [
  /\bselect\b[\s\S]{0,500}\bfrom\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\b[\s\S]{0,300}\bset\b/i,
  /\bdelete\s+from\b/i,
  /\bexec(?:ute)?\b/i,
  /\b(?:drop|alter|create)\s+(?:table|procedure|proc|view|function|trigger)\b/i
];

function fail(message) {
  throw new Error(message);
}

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) fail(`Thiếu biến môi trường bắt buộc: ${name}`);
  return value;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizedBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail('FIELD_SYNC_METADATA_BASE_URL không phải URL hợp lệ.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) fail('Metadata URL chỉ được dùng HTTP(S).');
  if (url.username || url.password) fail('Metadata URL không được chứa username/password.');
  const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localHost && process.env.FIELD_SYNC_ALLOW_INSECURE_HTTP !== 'true') {
    fail('Từ chối gửi token qua HTTP. Chỉ staging cô lập mới được đặt FIELD_SYNC_ALLOW_INSECURE_HTTP=true.');
  }
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url;
}

function normalizeAuthorization(token) {
  if (/\r|\n/.test(token)) fail('Bearer token chứa ký tự không hợp lệ.');
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

function validateRequestContext(userName, branchId, formName, erpFormId) {
  if (!SAFE_USER.test(userName)) fail('FIELD_SYNC_USERNAME không hợp lệ.');
  if (branchId.length > 1000) fail('FIELD_SYNC_BRANCH_ID quá dài.');
  const branches = branchId.split(',').map((item) => item.trim()).filter(Boolean);
  if (!branches.length || branches.some((item) => !SAFE_BRANCH_ITEM.test(item))) {
    fail('FIELD_SYNC_BRANCH_ID không hợp lệ.');
  }
  if (!SAFE_FORM.test(formName)) fail('FIELD_SYNC_FORM không hợp lệ.');
  if (!SAFE_FORM.test(erpFormId)) fail('FIELD_SYNC_ERP_FORM không hợp lệ.');
}

function isSafeFieldName(value) {
  return SAFE_FIELD.test(value) && !RESERVED_FIELD_NAMES.has(String(value).toLowerCase());
}

function maskedUser(value) {
  if (value.length <= 2) return '*'.repeat(value.length);
  return `${value[0]}${'*'.repeat(Math.min(6, value.length - 2))}${value[value.length - 1]}`;
}

function collectRawSqlFindings(value, path = '$', findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRawSqlFindings(item, `${path}[${index}]`, findings));
    return findings;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      const nextPath = `${path}.${key}`;
      if (FORBIDDEN_RESPONSE_KEYS.has(key.toLowerCase())) findings.push(`${nextPath} (forbidden key)`);
      collectRawSqlFindings(item, nextPath, findings);
    });
    return findings;
  }
  if (typeof value === 'string' && SQL_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
    findings.push(`${path} (SQL-like value)`);
  }
  return findings;
}

function assertNoRawSql(label, body) {
  const findings = collectRawSqlFindings(body);
  if (findings.length) fail(`${label} có dấu hiệu lộ SQL tại: ${findings.slice(0, 5).join(', ')}`);
}

function assertNoStore(label, response) {
  const cacheControl = response.headers.get('cache-control') || '';
  if (!/\bno-store\b/i.test(cacheControl)) fail(`${label} thiếu Cache-Control: no-store.`);
}

async function requestJson(label, url, options, allowedStatuses) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    fail(`${label} không kết nối được (${error && error.name ? error.name : 'network error'}).`);
  }

  if (!allowedStatuses.includes(response.status)) fail(`${label} trả HTTP ${response.status}.`);
  assertNoStore(label, response);

  let body;
  try {
    body = await response.json();
  } catch {
    fail(`${label} không trả JSON hợp lệ.`);
  }
  assertNoRawSql(label, body);
  return { response, body };
}

function assertFormIdentity(label, payload, formName, erpFormId) {
  if (String(payload.formName || '').toLowerCase() !== formName.toLowerCase()) {
    fail(`${label} trả sai formName.`);
  }
  if (String(payload.erpFormId || '').toLowerCase() !== erpFormId.toLowerCase()) {
    fail(`${label} trả sai erpFormId.`);
  }
}

function primaryKeyParts(value) {
  return String(value || '')
    .split(/[,;+]/)
    .map((part) => part.trim().replace(/^\[|\]$/g, ''))
    .filter(Boolean);
}

function validateSchema(schema, formName, erpFormId) {
  if (!schema || typeof schema !== 'object') fail('Schema payload bị thiếu.');
  if (String(schema.schemaVersion || '') !== '2.0') fail('Schema không đúng schemaVersion 2.0.');
  assertFormIdentity('Schema', schema, formName, erpFormId);
  if (!String(schema.primaryKey || '').trim()) fail('Schema không có primaryKey.');
  if (!Array.isArray(schema.gridFields) || schema.gridFields.length === 0) fail('Schema không có gridFields.');
  if (!Array.isArray(schema.lookups)) fail('Schema không có mảng lookups hợp lệ.');

  const seen = new Set();
  let previousOrder = -Infinity;
  schema.gridFields.forEach((field, index) => {
    const name = String(field && field.name || '').trim();
    if (!isSafeFieldName(name)) fail(`Field thứ ${index + 1} có name không hợp lệ.`);
    const key = name.toLowerCase();
    if (seen.has(key)) fail(`Schema có field trùng (không phân biệt hoa/thường): ${name}`);
    seen.add(key);
    const orderNo = Number(field.orderNo);
    if (!Number.isInteger(orderNo) || orderNo < 1) fail(`Field ${name} không có orderNo dương hợp lệ.`);
    if (orderNo <= previousOrder) fail(`Thứ tự field không tăng nghiêm ngặt tại ${name}.`);
    previousOrder = orderNo;
  });

  const primaryKeys = primaryKeyParts(schema.primaryKey);
  if (!primaryKeys.length || primaryKeys.some((key) => !isSafeFieldName(key))) {
    fail('Schema primaryKey không phải identifier hợp lệ.');
  }
  const fieldNames = new Set(schema.gridFields.map((field) => String(field.name).toLowerCase()));
  if (primaryKeys.some((key) => !fieldNames.has(key.toLowerCase()))) {
    fail('Schema primaryKey không xuất hiện trong gridFields.');
  }

  const blockingDiagnostics = (Array.isArray(schema.diagnostics) ? schema.diagnostics : []).filter((item) => {
    const severity = String(item && item.severity || '').toLowerCase();
    const code = String(item && item.code || '').toUpperCase();
    return severity === 'critical' || severity === 'error'
      || code === 'RESULTSET_FALLBACK_TO_TABLE'
      || code === 'SHADOW_VIEW_NOT_REGISTERED';
  });
  if (blockingDiagnostics.length) fail(`Schema có ${blockingDiagnostics.length} diagnostic chặn pilot.`);
  if (!['RESULT_SET'].includes(String(schema.sourceKind || '').toUpperCase())) {
    fail('Schema không đến từ result-set authoritative.');
  }
  return schema;
}

function validateComparison(comparison, schema, formName, erpFormId) {
  if (!comparison || typeof comparison !== 'object') fail('Compare payload bị thiếu.');
  if (String(comparison.schemaVersion || '') !== '2.0') fail('Compare không đúng schemaVersion 2.0.');
  assertFormIdentity('Compare', comparison, formName, erpFormId);
  const primaryKey = comparison.primaryKey || {};
  if (String(primaryKey.status || '').toUpperCase() !== 'MATCH') fail('Primary-key parity chưa MATCH.');
  if (!String(primaryKey.legacy || '').trim() || !String(primaryKey.v2 || '').trim()) {
    fail('Compare thiếu cả hai primary key.');
  }
  if (String(primaryKey.legacy).toLowerCase() !== String(primaryKey.v2).toLowerCase()) {
    fail('Primary key legacy và V2 không khớp.');
  }
  if (String(primaryKey.v2 || '').toLowerCase() !== String(schema.primaryKey || '').toLowerCase()) {
    fail('Primary key giữa schema và compare không khớp.');
  }

  const items = Array.isArray(comparison.items) ? comparison.items : [];
  const blockingStatuses = new Set(['CRITICAL', 'ONLY_V2', 'ONLY_LEGACY']);
  const allowedStatuses = new Set(['MATCH', 'CAPTION_DIFF', 'FORMAT_DIFF', 'LOOKUP_DIFF', 'CRITICAL', 'ONLY_V2', 'ONLY_LEGACY']);
  const seenFields = new Set();
  items.forEach((item) => {
    const fieldName = String(item && item.fieldName || '').trim();
    const status = String(item && item.status || '').toUpperCase();
    if (!isSafeFieldName(fieldName) || seenFields.has(fieldName.toLowerCase())) fail('Compare có fieldName thiếu, không an toàn hoặc trùng.');
    if (!allowedStatuses.has(status)) fail(`Compare có status không được phép: ${status || 'EMPTY'}.`);
    seenFields.add(fieldName.toLowerCase());
  });
  const gridFieldNames = schema.gridFields.map((field) => String(field.name).toLowerCase());
  if (gridFieldNames.some((fieldName) => !seenFields.has(fieldName))) fail('Compare không bao phủ đủ gridFields.');
  if (items.some((item) => !gridFieldNames.includes(String(item.fieldName).toLowerCase()))) fail('Compare co field khong xuat hien trong schema grid.');
  const blocking = items.filter((item) => {
    const status = String(item && (item.severity || item.status) || '').toUpperCase();
    return blockingStatuses.has(status)
      && !(status === 'ONLY_V2' && PHASE2_VIEW_ONLY_V2_FORMS.has(formName.toLowerCase()));
  });
  if (blocking.length) fail(`Compare có ${blocking.length} khác biệt cấu trúc chặn pilot.`);
  return items.filter((item) => String(item && item.status || '').toUpperCase() !== 'MATCH');
}

function endpoint(pathname) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${baseUrl.pathname}${pathname}`;
  return url;
}

const missing = REQUIRED_ENV.filter((name) => !String(process.env[name] || '').trim());
if (missing.length) {
  console.error(`FIELD SYNC STAGING VERIFY: FAIL\nThiếu: ${missing.join(', ')}`);
  console.error('Đặt secret bằng biến môi trường/secret manager; không truyền token qua argv và không lưu vào repo.');
  process.exitCode = 1;
} else {
  var bearerToken = '';
  var authorization = '';
  var userName = '';
  var branchId = '';
  var formName = '';
  var erpFormId = '';
  var timeoutMs = 15_000;
  var baseUrl;
  try {
    bearerToken = required('FIELD_SYNC_BEARER_TOKEN');
    authorization = normalizeAuthorization(bearerToken);
    userName = required('FIELD_SYNC_USERNAME');
    branchId = required('FIELD_SYNC_BRANCH_ID');
    formName = String(process.env.FIELD_SYNC_FORM || 'WA_BangThueTNCNFrm').trim();
    erpFormId = String(process.env.FIELD_SYNC_ERP_FORM || 'HR_BangThueTNCNFrm').trim();
    validateRequestContext(userName, branchId, formName, erpFormId);
    timeoutMs = positiveInteger(process.env.FIELD_SYNC_TIMEOUT_MS, 15_000);
    baseUrl = normalizedBaseUrl(required('FIELD_SYNC_METADATA_BASE_URL'));
    const headers = { Authorization: authorization, Username: userName, BranchID: branchId };

    const schemaUrl = endpoint(`/grid-schema/${encodeURIComponent(formName)}`);
    schemaUrl.searchParams.set('erpFormId', erpFormId);
    const schemaResult = await requestJson('Grid schema', schemaUrl, { headers }, [200]);
    if (schemaResult.body.success !== true) fail('Grid schema trả success khác true.');
    const schema = validateSchema(schemaResult.body.schema, formName, erpFormId);

    const compareUrl = endpoint(`/grid-schema/${encodeURIComponent(formName)}/compare`);
    compareUrl.searchParams.set('erpFormId', erpFormId);
    const compareResult = await requestJson('Grid compare', compareUrl, { headers }, [200]);
    if (compareResult.body.success !== true) fail('Grid compare trả success khác true.');
    const nonMatchItems = validateComparison(compareResult.body.comparison, schema, formName, erpFormId);

    const unauthenticated = await requestJson('Negative auth check', schemaUrl, {
      headers: { Username: userName, BranchID: branchId }
    }, [401]);
    if (unauthenticated.body.success !== false) fail('Negative auth check không fail-closed.');

    const wrongAliasUrl = endpoint(`/grid-schema/${encodeURIComponent(formName)}`);
    const wrongAlias = erpFormId.toLowerCase() === 'verify_alias_mismatch' ? 'VERIFY_ALIAS_MISMATCH_2' : 'VERIFY_ALIAS_MISMATCH';
    wrongAliasUrl.searchParams.set('erpFormId', wrongAlias);
    const aliasMismatch = await requestJson('Negative alias check', wrongAliasUrl, { headers }, [409]);
    if (aliasMismatch.body.success !== false) fail('Negative alias check không bị chặn.');

    const configuredLookupKey = String(process.env.FIELD_SYNC_LOOKUP_KEY || '').trim();
    if (configuredLookupKey && !/^[A-Fa-f0-9]{64}$/.test(configuredLookupKey)) fail('FIELD_SYNC_LOOKUP_KEY không hợp lệ.');
    const lookupKeys = [];
    const seenLookupKeys = new Set();
    const gridFieldNames = new Set(schema.gridFields.map((field) => String(field.name).toLowerCase()));
    schema.lookups.forEach((lookup) => {
      if (lookup && lookup.disabled === true) return;
      const key = String(lookup && lookup.key || '');
      const fieldName = String(lookup && lookup.fieldName || '').toLowerCase();
      if (!/^[A-Fa-f0-9]{64}$/.test(key)) fail('Schema có lookup đang bật nhưng key không hợp lệ.');
      if (!fieldName || !gridFieldNames.has(fieldName)) fail('Schema có lookup không gắn với grid field hợp lệ.');
      if (seenLookupKeys.has(key.toLowerCase())) fail('Schema có lookup key trùng.');
      seenLookupKeys.add(key.toLowerCase());
      lookupKeys.push(key);
    });
    if (configuredLookupKey && !seenLookupKeys.has(configuredLookupKey.toLowerCase())) lookupKeys.push(configuredLookupKey);
    if (lookupKeys.length > 50) fail('Schema công bố quá nhiều lookup; cần review trước khi verify.');
    let lookupOptions = 0;
    for (const lookupKey of lookupKeys) {
      const lookupUrl = endpoint(`/lookups/${encodeURIComponent(lookupKey)}/search`);
      const result = await requestJson('Lookup safety', lookupUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ formName, erpFormId, keyword: '', page: 1, pageSize: 5 })
      }, [200, 409]);
      if (result.response.status !== 200) {
        if (result.body.success === false && String(result.body.code || '').trim()) {
          fail(`Lookup ${lookupOptions + 1}/${lookupKeys.length} chưa sẵn sàng (${result.body.code}).`);
        }
        fail('Lookup blocked có contract không hợp lệ.');
      }
      if (result.body.success !== true || !Array.isArray(result.body.options)) fail('Lookup success có contract không hợp lệ.');
      result.body.options.forEach((option) => {
        if (!option || typeof option !== 'object' || !Object.prototype.hasOwnProperty.call(option, 'value') || !Object.prototype.hasOwnProperty.call(option, 'label')) {
          fail('Lookup option không đúng contract value/label.');
        }
      });
      lookupOptions += 1;
    }
    const lookupResult = lookupKeys.length
      ? `${lookupOptions}/${lookupKeys.length} lookup hoạt động`
      : 'không có lookup để kiểm tra';

    console.log('FIELD SYNC STAGING VERIFY: PASS');
    console.log(`- Endpoint: ${baseUrl.origin}${baseUrl.pathname}`);
    console.log(`- Form: ${formName} -> ${erpFormId}`);
    console.log(`- Context: user ${maskedUser(userName)}, branch ${branchId}`);
    console.log(`- Grid: ${schema.gridFields.length} field, PK ${schema.primaryKey}, parity MATCH`);
    console.log(`- Khác biệt không chặn: ${nonMatchItems.length}`);
    console.log(`- Lookup: ${lookupResult}`);
    console.log('- Negative checks: thiếu auth=401, alias sai=409, response không có raw SQL');
  } catch (error) {
    const rawMessage = String(error && error.message || 'Lỗi không xác định.');
    let safeMessage = rawMessage;
    if (bearerToken) safeMessage = safeMessage.split(bearerToken).join('[REDACTED]');
    if (authorization) safeMessage = safeMessage.split(authorization).join('[REDACTED]');
    console.error(`FIELD SYNC STAGING VERIFY: FAIL\n${safeMessage.slice(0, 1000)}`);
    process.exitCode = 1;
  }
}
