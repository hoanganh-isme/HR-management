import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { promisify } from 'node:util';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const execFileAsync = promisify(execFile);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function runBrowserFiles(files, suppliedWindow = {}) {
  const window = suppliedWindow;
  const context = vm.createContext({
    window,
    ApiClient: window.ApiClient,
    AppSession: window.AppSession,
    document: window.document,
    console,
    Promise,
    Date,
    Object,
    Array,
    Number,
    String,
    encodeURIComponent,
    setInterval() { return 1; },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } }
  });
  files.forEach((file) => vm.runInContext(read(file), context, { filename: file }));
  return window;
}

function validFieldSyncPayloads() {
  return {
    schema: {
      schemaVersion: '2.0',
      formName: 'WA_TestFrm',
      erpFormId: 'WA_TestFrm',
      primaryKey: 'ErpCode',
      sourceKind: 'RESULT_SET',
      gridFields: [{ name: 'ErpCode', label: 'Mã ERP', orderNo: 1, renderRule: 'text' }],
      lookups: [],
      diagnostics: []
    },
    comparison: {
      schemaVersion: '2.0',
      formName: 'WA_TestFrm',
      erpFormId: 'WA_TestFrm',
      primaryKey: { legacy: 'ErpCode', v2: 'ErpCode', status: 'MATCH' },
      items: [{ fieldName: 'ErpCode', status: 'MATCH' }]
    }
  };
}

test('feature flag Phase 1 mặc định tắt và chưa có pilot', () => {
  const window = runBrowserFiles(['src/js/config/FieldSyncConfig.js']);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.enabled, false);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.shadowMode, true);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.pollSeconds, 120);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.pilotForms.length, 0);
  assert.equal(Object.isFrozen(window.ERP_FIELD_SYNC_CONFIG), true);
  assert.equal(Object.isFrozen(window.ERP_FIELD_SYNC_CONFIG.pilotForms), true);
});

test('Field Sync đọc cấu hình runtime lồng và chuẩn hóa giá trị', () => {
  const window = runBrowserFiles(['src/js/config/FieldSyncConfig.js'], {
    HRM_RUNTIME_CONFIG: {
      FIELD_SYNC: {
        enabled: true,
        shadowMode: false,
        pilotForms: ['WA_BangThueTNCNFrm', '', 123],
        pollSeconds: 90.9,
        metadataBaseUrl: 'https://staging.example/api/metadata///'
      }
    }
  });
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.enabled, true);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.shadowMode, false);
  assert.deepEqual(Array.from(window.ERP_FIELD_SYNC_CONFIG.pilotForms), ['WA_BangThueTNCNFrm']);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.pollSeconds, 90);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.metadataBaseUrl, 'https://staging.example/api/metadata');
});

test('ERP_FIELD_SYNC_CONFIG là override toàn bộ và có thể kill-switch runtime', () => {
  const window = runBrowserFiles(['src/js/config/FieldSyncConfig.js'], {
    HRM_RUNTIME_CONFIG: {
      FIELD_SYNC: { enabled: true, shadowMode: false, pilotForms: ['WA_BangThueTNCNFrm'], pollSeconds: 30 }
    },
    ERP_FIELD_SYNC_CONFIG: { enabled: false }
  });
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.enabled, false);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.shadowMode, true);
  assert.deepEqual(Array.from(window.ERP_FIELD_SYNC_CONFIG.pilotForms), []);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.pollSeconds, 120);
});

test('cấu hình runtime sai kiểu luôn fail-safe về mặc định', () => {
  const window = runBrowserFiles(['src/js/config/FieldSyncConfig.js'], {
    HRM_RUNTIME_CONFIG: {
      FIELD_SYNC: { enabled: 'true', shadowMode: 'false', pilotForms: 'WA_TestFrm', pollSeconds: 5, metadataBaseUrl: 123 }
    }
  });
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.enabled, false);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.shadowMode, true);
  assert.deepEqual(Array.from(window.ERP_FIELD_SYNC_CONFIG.pilotForms), []);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.pollSeconds, 120);
  assert.equal(window.ERP_FIELD_SYNC_CONFIG.metadataBaseUrl, '');
});

test('runtime schema chỉ thay grid khi pilot được kích hoạt', () => {
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120 }
  });
  const legacy = [{ name: 'LegacyCode', showInAdd: true, showInEdit: true, showInFilter: true }];
  const v2 = [{ name: 'ErpCode', label: 'Mã ERP', renderRule: 'number' }];
  const schemas = window.FieldSyncService.createRuntimeSchemas(legacy, v2, true);
  assert.deepEqual(Array.from(schemas.grid, (field) => field.name), ['ErpCode']);
  assert.deepEqual(Array.from(schemas.add, (field) => field.name), ['LegacyCode']);
  assert.deepEqual(Array.from(schemas.edit, (field) => field.name), ['LegacyCode']);
  assert.deepEqual(Array.from(schemas.filters, (field) => field.name), ['LegacyCode']);
  assert.equal(schemas.grid[0].metadataSource, 'FIELD_SYNC_V2');
});

test('Grid V2 không bật lookup đã bị ERP disable', () => {
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js']);
  const schemas = window.FieldSyncService.createRuntimeSchemas([], [{
    name: 'SecretCode',
    renderRule: 'text',
    lookup: { key: 'A'.repeat(64), disabled: true, dependsOn: ['BranchID'] }
  }], true);
  assert.equal(schemas.grid[0].lookupKey, '');
  assert.equal(schemas.grid[0].dependsOn, '');
  assert.equal(schemas.grid[0].renderRule, 'text');
});

test('shadow mode giữ nguyên cả bốn runtime schema', () => {
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js']);
  const legacy = [{ name: 'LegacyCode' }];
  const v2 = [{ name: 'ErpCode' }];
  const schemas = window.FieldSyncService.createRuntimeSchemas(legacy, v2, false);
  ['grid', 'add', 'edit', 'filters'].forEach((key) => {
    assert.deepEqual(Array.from(schemas[key], (field) => field.name), ['LegacyCode']);
  });
});

test('shadow tải schema/compare, lưu parity nhưng không đổi Grid', async () => {
  const calls = [];
  const stored = {};
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: false, shadowMode: true, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: {
      get: async (url) => {
        calls.push(url);
        if (url.includes('/compare?')) return { comparison: { summary: { total: 1, matched: 1 } } };
        return { schema: { gridFields: [{ name: 'ErpCode' }] } };
      }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem: (key, value) => { stored[key] = value; } }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'shadow');
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyCode']);
  assert.equal(calls.length, 2);
  assert.ok(stored['ERP_FIELD_SYNC_PARITY:WA_TestFrm']);
});

test('endpoint V2 lỗi thì fail-open về legacy', async () => {
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: { get: async () => { throw new Error('offline'); } },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'legacy-fallback');
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyCode']);
});

test('pilot chỉ active khi toàn bộ contract runtime hợp lệ', async () => {
  const payloads = validFieldSyncPayloads();
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: { get: async (url) => url.includes('/compare?') ? { comparison: payloads.comparison } : { schema: payloads.schema } },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'pilot-active');
  assert.equal(state.active, true);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['ErpCode']);
  assert.deepEqual(Array.from(state.runtimeSchemas.edit, (field) => field.name), ['LegacyCode']);
});

test('pilot fail-closed khi compare trả status ngoài contract', async () => {
  const payloads = validFieldSyncPayloads();
  payloads.comparison.items[0].status = 'SURPRISE';
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: { get: async (url) => url.includes('/compare?') ? { comparison: payloads.comparison } : { schema: payloads.schema } },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'pilot-blocked-critical');
  assert.equal(state.active, false);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyCode']);
});

test('pilot bị chặn khi primary-key parity còn CRITICAL', async () => {
  const payloads = validFieldSyncPayloads();
  payloads.comparison.primaryKey = { legacy: 'LegacyID', v2: 'ErpCode', status: 'CRITICAL' };
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: {
      get: async (url) => url.includes('/compare?')
        ? { comparison: payloads.comparison }
        : { schema: payloads.schema }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'pilot-blocked-critical');
  assert.equal(state.active, false);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyCode']);
});

test('pilot bị chặn khi parity có field chỉ xuất hiện một phía', async () => {
  const payloads = validFieldSyncPayloads();
  payloads.comparison.items = [{ fieldName: 'ErpCode', status: 'ONLY_V2' }];
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: {
      get: async (url) => url.includes('/compare?')
        ? { comparison: payloads.comparison }
        : { schema: payloads.schema }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'pilot-blocked-critical');
  assert.equal(state.active, false);
});

test('pilot bị chặn khi resolver phải fallback về table', async () => {
  const payloads = validFieldSyncPayloads();
  payloads.schema.sourceKind = 'TABLE_FALLBACK';
  payloads.schema.diagnostics = [{ severity: 'warning', code: 'RESULTSET_FALLBACK_TO_TABLE' }];
  const window = runBrowserFiles(['src/js/services/FieldSyncService.js'], {
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_TestFrm'], pollSeconds: 120, metadataBaseUrl: 'http://metadata' },
    ApiClient: {
      get: async (url) => url.includes('/compare?')
        ? { comparison: payloads.comparison }
        : { schema: payloads.schema }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} }
  });
  const state = await window.FieldSyncService.observeForm('WA_TestFrm', [{ name: 'LegacyCode' }]);
  assert.equal(state.status, 'pilot-blocked-critical');
  assert.equal(state.active, false);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyCode']);
});

test('alias chỉ chứa mapping đã xác nhận', () => {
  const window = runBrowserFiles(['src/js/config/ErpFormAliases.js']);
  assert.equal(window.ErpFormAliases.resolve('WA_BangThueTNCNFrm'), 'HR_BangThueTNCNFrm');
  assert.equal(window.ErpFormAliases.resolve('WA_ChucDanhFrm'), 'WA_ChucDanhFrm');
  const backendConfig = read('backend-app/src/field-sync/field-sync.config.js');
  assert.match(backendConfig, /WA_BangThueTNCNFrm:\s*'HR_BangThueTNCNFrm'/);
  assert.doesNotMatch(backendConfig, /WA_ChucDanhFrm:\s*'HR_ChucDanhFrm'/);
});

test('DynamicFormEngine phân tách grid, add, edit và filters', () => {
  const source = read('src/js/core/DynamicFormEngine.js');
  assert.match(source, /runtimeSchemas\s*=\s*\{\s*grid:\s*\[\],\s*edit:\s*\[\],\s*add:\s*\[\],\s*filters:\s*\[\]/);
  assert.match(source, /_schemaFor\('grid'\)/);
  assert.match(source, /_schemaFor\('add'\)/);
  assert.match(source, /_schemaFor\('edit'\)/);
  assert.match(source, /_schemaFor\('filters'\)/);
});

test('mobile card renderer nhận field V2 mà không crash', () => {
  function element() {
    return {
      className: '',
      innerHTML: '',
      children: [],
      appendChild(child) { this.children.push(child); return child; }
    };
  }
  const document = { createElement: () => element() };
  const window = runBrowserFiles(['src/components/responsive-data-renderer/ResponsiveDataRenderer.js'], { document });
  const container = element();
  const result = window.ResponsiveDataRenderer.render(container, [{ ErpCode: 'ERP01' }], [{ name: 'ErpCode', label: 'Mã ERP' }]);
  assert.equal(result.className, 'responsive-data-renderer');
  assert.equal(container.children.length, 1);
});

test('verifier staging kiểm tra contract/negative gate mà không in token', async (t) => {
  const token = 'verifier-secret-token';
  const formName = 'WA_BangThueTNCNFrm';
  const erpFormId = 'HR_BangThueTNCNFrm';
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const respond = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
      res.end(JSON.stringify(body));
    };
    if (!req.headers.authorization) return respond(401, { success: false, message: 'unauthorized' });
    if (url.pathname.includes('/lookups/')) {
      return respond(409, { success: false, code: 'LOOKUP_KEY_NOT_FOUND', message: 'blocked' });
    }
    const formMatch = url.pathname.match(/\/grid-schema\/([^/]+)/);
    const requestedForm = formMatch ? decodeURIComponent(formMatch[1]) : formName;
    const expectedErp = requestedForm === 'WA_BadPkFrm'
      ? 'HR_BadPkFrm'
      : (requestedForm === 'WA_BadLookupFrm' ? 'HR_BadLookupFrm' : erpFormId);
    if (url.searchParams.get('erpFormId') !== expectedErp) return respond(409, { success: false, message: 'alias mismatch' });
    const badPrimaryKey = requestedForm === 'WA_BadPkFrm';
    const hasBlockedLookup = requestedForm === 'WA_BadLookupFrm';
    const primaryKey = badPrimaryKey ? 'MissingID' : 'Bac';
    if (url.pathname.endsWith('/compare')) {
      return respond(200, {
        success: true,
        comparison: {
          schemaVersion: '2.0',
          formName: requestedForm,
          erpFormId: expectedErp,
          primaryKey: { legacy: primaryKey, v2: primaryKey, status: 'MATCH' },
          summary: { total: 1, matched: 1, different: 0 },
          items: [{ fieldName: 'Bac', status: 'MATCH' }]
        }
      });
    }
    return respond(200, {
      success: true,
      schema: {
        schemaVersion: '2.0',
        formName: requestedForm,
        erpFormId: expectedErp,
        primaryKey,
        sourceKind: 'RESULT_SET',
        gridFields: [{ name: 'Bac', label: 'Bậc', orderNo: 1, sqlType: 'int' }],
        lookups: hasBlockedLookup ? [{ fieldName: 'Bac', key: 'E'.repeat(64), disabled: false }] : [],
        diagnostics: []
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  const runVerifier = (targetForm, targetErp) => execFileAsync(process.execPath, ['scripts/verify-field-sync-staging.mjs'], {
      cwd: root,
      env: {
        ...process.env,
        FIELD_SYNC_METADATA_BASE_URL: `http://127.0.0.1:${address.port}/api/metadata`,
        FIELD_SYNC_BEARER_TOKEN: token,
        FIELD_SYNC_USERNAME: 'Admin',
        FIELD_SYNC_BRANCH_ID: 'CN01',
        FIELD_SYNC_FORM: targetForm,
        FIELD_SYNC_ERP_FORM: targetErp
      },
      timeout: 15_000
    });
  const result = await runVerifier(formName, erpFormId);
  assert.match(result.stdout, /FIELD SYNC STAGING VERIFY: PASS/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, new RegExp(token));

  await assert.rejects(runVerifier('WA_BadPkFrm', 'HR_BadPkFrm'), (error) => {
    const output = `${error.stdout || ''}\n${error.stderr || ''}`;
    assert.match(output, /FIELD SYNC STAGING VERIFY: FAIL/);
    assert.match(output, /primaryKey không xuất hiện trong gridFields/i);
    assert.doesNotMatch(output, new RegExp(token));
    return true;
  });
  await assert.rejects(runVerifier('WA_BadLookupFrm', 'HR_BadLookupFrm'), (error) => {
    const output = `${error.stdout || ''}\n${error.stderr || ''}`;
    assert.match(output, /FIELD SYNC STAGING VERIFY: FAIL/);
    assert.match(output, /Lookup 1\/1 chưa sẵn sàng/);
    assert.doesNotMatch(output, new RegExp(token));
    return true;
  });
});

test('SQL Phase 1 đủ file, không tham chiếu nguồn layout cấm và không chạy Source', () => {
  const directory = path.join(root, 'sql', 'FieldSyncPhase1');
  const expected = [
    '00_KIEM_TRA_NGUON.sql',
    '01_API_WEB_GRID_FIELD_SCHEMA_V2.sql',
    '02_API_WEB_LOOKUP_SCHEMA_V2.sql',
    '03_API_WEB_GRID_FIELD_COMPARE_V2.sql',
    '04_DANG_KY_API_READONLY.sql',
    '05_KIEM_TRA_SAU_CAI_DAT.sql'
  ];
  assert.deepEqual(fs.readdirSync(directory).sort(), expected.sort());
  const source = expected.map((file) => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /SY_FrmCfg/i);
  assert.doesNotMatch(source, /EXEC\s*\(\s*@Source|sp_executesql\s+@Source/i);
  assert.doesNotMatch(source, /\bTRUNCATE\b|\bMERGE\b/i);
  assert.doesNotMatch(source, /CREATE\s+OR\s+ALTER/i);
  assert.doesNotMatch(source, /\bDELETE\s+FROM\b/i);
  assert.doesNotMatch(source, /\bUPDATE\s+(?:dbo\.)?SY_/i);
  assert.match(source, /dm_exec_describe_first_result_set_for_object/);
  assert.match(source, /RESULTSET_FALLBACK_TO_TABLE/);
  assert.match(source, /WHEN LOWER\(ISNULL\(X\.FormName, ''\)\) = LOWER\(@ERPFormID\) THEN 1[\s\S]*WHEN LOWER\(ISNULL\(X\.FormName, ''\)\) = LOWER\(@WebFormName\) THEN 2/);
});

test('backend công bố đúng ba endpoint metadata', () => {
  const routes = read('backend-app/src/field-sync/field-sync.routes.js');
  assert.match(routes, /get\('\/grid-schema\/:formName'/);
  assert.match(routes, /get\('\/grid-schema\/:formName\/compare'/);
  assert.match(routes, /post\('\/lookups\/:lookupKey\/search'/);
  assert.doesNotMatch(routes, /req\.body\?.*(?:sql|source)/i);
});
