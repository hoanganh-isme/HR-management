import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');

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
    clearInterval() {}
  });
  files.forEach((file) => vm.runInContext(read(file), context, { filename: file }));
  return window;
}

function contractSchema(overrides = {}) {
  const fields = [
    {
      name: 'Bac', label: 'Bậc', orderNo: 1, sqlType: 'int', mobileClass: 'CORE', reasonCodes: ['PRIMARY_KEY'],
      showInGrid: true, showInAdd: true, showInEdit: true, showInFilter: true,
      supportsInsert: true, supportsUpdate: false, supportsFilter: true, supportsSort: true,
      supportsKeyword: false, isPrimaryKey: true, requiredOnInsert: true
    },
    {
      name: 'PersonName', label: 'Tên hiển thị mới', orderNo: 2, sqlType: 'nvarchar(200)',
      mobileClass: 'CORE', reasonCodes: ['NAME_OR_CAPTION'],
      showInGrid: true, showInAdd: true, showInEdit: true, showInFilter: true,
      supportsInsert: true, supportsUpdate: true, supportsFilter: true, supportsSort: true,
      supportsKeyword: true, isPrimaryKey: false, requiredOnInsert: false
    }
  ];
  const schema = {
    schemaVersion: '2.0', capabilityVersion: '1.0',
    formName: 'WA_BangThueTNCNFrm', erpFormId: 'HR_BangThueTNCNFrm',
    tableName: 'HR_BangThueTNCNTbl', primaryKey: 'Bac', sourceKind: 'RESULT_SET',
    fields,
    gridFields: fields.slice(),
    addFields: fields.slice(),
    editFields: fields.slice(),
    filterFields: fields.slice(),
    lookups: [], diagnostics: [],
    runtimeRoutes: {
      view: { registeredProcedure: 'API_TruyVanDong_V2' },
      save: { registeredProcedure: 'API_LuuDong_V2' },
      delete: { registeredProcedure: 'API_XoaDong_V2', mode: 'HARD' }
    }
  };
  return Object.assign(schema, overrides);
}

function createManagedWindow(get, extra = {}) {
  return runBrowserFiles([
    'src/js/config/FieldContractMigrationRegistry.js',
    'src/js/config/Phase2MigrationRegistry.js',
    'src/js/config/ErpFormAliases.js',
    'src/js/services/FieldSyncService.js'
  ], {
    ERP_FIELD_SYNC_CONFIG: {
      enabled: true,
      shadowMode: false,
      pilotForms: ['WA_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'WA_TitleListFrm', 'WA_ShiftListFrm'],
      pollSeconds: 120,
      metadataBaseUrl: '/api/metadata'
    },
    ApiClient: { get, post: async () => ({ options: [] }) },
    AppSession: { getUserName: () => 'admin', getBranchId: () => 'CN01' },
    sessionStorage: { setItem() {} },
    localStorage: { removeItem() {} },
    location: { href: '' },
    ...extra
  });
}

test('Phase 3 có đủ SQL và tài liệu bắt buộc', () => {
  const sqlExpected = [
    '00_AUDIT_CANDIDATES.sql',
    '01_CREATE_GENERIC_VIEW_V2.sql',
    '02_UPDATE_UNIFIED_FIELD_CONTRACT.sql',
    '03_UPDATE_SAVE_V2.sql',
    '04_UPDATE_DELETE_V2.sql',
    '05_REGISTER_PHASE3_FORMS.sql',
    '05A_REPAIR_VIEW_V2_ALL_FORMS.sql',
    '06_VERIFY_PHASE3_FORMS.sql',
    '07_RUNTIME_TEST_READONLY.sql',
    '08_ROLLBACK_PHASE3_REGISTRATION.sql'
  ];
  const docsExpected = [
    '00_BAO_CAO_COMMIT_NEN.md',
    '01_FORM_CANDIDATES.csv',
    '02_FORM_CONTRACT_MATRIX.csv',
    '03_CRUD_ROUTE_MATRIX.csv',
    '04_SY_FORMATFIELDS_REFERENCES.csv',
    '05_SESSION_FALLBACK_TEST.md',
    '06_MOBILE_UX_POLICY.md',
    '07_KET_QUA_TEST.md',
    '08_HUONG_DAN_DB_TEST.md',
    '09_HUONG_DAN_ROLLBACK.md',
    'BAO_CAO_TONG_KET.md'
  ];
  assert.deepEqual(fs.readdirSync(path.join(root, 'sql', 'Phase3SimpleCrud')).sort(), sqlExpected.sort());
  docsExpected.forEach((file) => assert.ok(fs.existsSync(path.join(root, 'docs', 'phase3-simple-crud', file)), `thiếu ${file}`));
  assert.match(read('docs/phase3-simple-crud/BAO_CAO_TONG_KET.md'), /NOT READY/i);
});

test('registry frontend/backend parity đúng bốn form và không chứa field metadata', () => {
  const window = runBrowserFiles(['src/js/config/FieldContractMigrationRegistry.js']);
  const frontend = window.FieldContractMigrationRegistry.list();
  const backendSource = read('backend-app/src/field-sync/field-contract.registry.js');
  assert.deepEqual(frontend.map((item) => item.webFormName), [
    'WA_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'WA_TitleListFrm', 'WA_ShiftListFrm'
  ]);
  frontend.forEach((entry) => {
    assert.match(backendSource, new RegExp(`webFormName:\\s*'${entry.webFormName}'`));
    assert.match(backendSource, new RegExp(`expectedTableName:\\s*'${entry.expectedTableName}'`));
    assert.match(backendSource, new RegExp(`expectedPrimaryKey:\\s*'${entry.expectedPrimaryKey}'`));
    assert.equal(entry.deletePolicy, 'AUTO_SCHEMA');
    assert.equal(entry.enableDelete, true);
    assert.equal(Object.hasOwn(entry, 'fields'), false);
    assert.equal(Object.hasOwn(entry, 'caption'), false);
  });
});

test('View cũ chưa cutover giữ nguyên LEGACY_FULL thay vì trang trắng', async () => {
  const schema = contractSchema();
  schema.runtimeRoutes.view.registeredProcedure = 'API_TruyVanDong';
  const window = createManagedWindow(async () => ({ schema }));
  const state = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', [{ name: 'LegacyField' }]);
  assert.equal(state.status, 'legacy-view-not-cutover');
  assert.equal(state.runtimeMode, 'LEGACY_FULL');
  assert.equal(state.active, false);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid, (field) => field.name), ['LegacyField']);
});

test('View V2 đạt gate dùng cùng contract cho Grid/Add/Edit/Filter và nhận field mới', async () => {
  const schema = contractSchema();
  const window = createManagedWindow(async () => ({ schema }));
  const state = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', [{ name: 'LegacyMustNotLeak' }]);
  assert.equal(state.runtimeMode, 'V2_FULL');
  assert.equal(state.active, true);
  for (const context of ['grid', 'add', 'edit', 'filters']) {
    assert.deepEqual(Array.from(state.runtimeSchemas[context], (field) => field.name), ['Bac', 'PersonName']);
    assert.equal(state.runtimeSchemas[context][1].label, 'Tên hiển thị mới');
    assert.equal(state.runtimeSchemas[context][1].mobileClass, 'CORE');
  }
  assert.equal(state.runtimeSchemas.edit[0].isReadOnlyEdit, true);
  assert.equal(state.writeActive, true);
  assert.equal(state.deleteActive, true);
});

test('View đã cutover nhưng contract sai trả mã lỗi ổn định, không trộn legacy', async () => {
  const schema = contractSchema({ primaryKey: 'WrongKey' });
  const window = createManagedWindow(async () => ({ schema }));
  const state = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', [{ name: 'LegacyField' }]);
  assert.equal(state.runtimeMode, 'CUTOVER_CONTRACT_ERROR');
  assert.equal(state.errorCode, 'FIELD_CONTRACT_INVALID_AFTER_CUTOVER');
  assert.equal(state.active, false);
  assert.deepEqual(Array.from(state.runtimeSchemas.grid), []);
});

test('metadata 502 không logout; last-known V2 chuyển read-only', async () => {
  let fail = false;
  let logoutCalls = 0;
  const window = createManagedWindow(async () => {
    if (fail) throw Object.assign(new Error('bad gateway'), { status: 502 });
    return { schema: contractSchema() };
  }, { logoutApp() { logoutCalls += 1; } });
  const active = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', []);
  assert.equal(active.runtimeMode, 'V2_FULL');
  fail = true;
  const fallback = await window.FieldSyncService.refreshForm('WA_BangThueTNCNFrm', []);
  assert.equal(fallback.runtimeMode, 'V2_READONLY');
  assert.equal(fallback.writeActive, false);
  assert.equal(logoutCalls, 0);
});

test('metadata 403 là lỗi quyền form và không logout toàn hệ thống', async () => {
  let logoutCalls = 0;
  const window = createManagedWindow(async () => {
    throw Object.assign(new Error('forbidden'), { status: 403 });
  }, { logoutApp() { logoutCalls += 1; } });
  const state = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', []);
  assert.equal(state.status, 'metadata-permission-error');
  assert.equal(state.errorCode, 'METADATA_FORBIDDEN');
  assert.equal(logoutCalls, 0);
});

test('metadata 401 chỉ logout sau khi userinfo cũng xác nhận 401', async () => {
  let userInfoExpired = false;
  let logoutCalls = 0;
  const window = createManagedWindow(async (url) => {
    if (url === '/api/userinfo') {
      if (userInfoExpired) throw Object.assign(new Error('expired'), { status: 401 });
      return { userName: 'admin' };
    }
    throw Object.assign(new Error('metadata unauthorized'), { status: 401 });
  }, {
    API_CONFIG: { ENDPOINTS: { AUTH: { USER_INFO: '/api/userinfo' } } },
    logoutApp() { logoutCalls += 1; }
  });
  const stillValid = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', []);
  assert.equal(stillValid.errorCode, 'METADATA_UNAUTHORIZED');
  assert.equal(logoutCalls, 0);
  userInfoExpired = true;
  const expired = await window.FieldSyncService.refreshForm('WA_BangThueTNCNFrm', []);
  assert.equal(expired.errorCode, 'PRIMARY_SESSION_EXPIRED');
  assert.equal(logoutCalls, 1);
});

test('frontend làm mới metadata ngay khi refresh/focus và bảo vệ modal đang nhập', () => {
  const engine = read('src/js/core/DynamicFormEngine.js');
  const service = read('src/js/services/FieldSyncService.js');
  assert.match(service, /function refreshForm\([\s\S]*fetchState\([\s\S]*true/);
  assert.match(engine, /onRefresh:[\s\S]*_refreshFieldContract\(true\)/);
  assert.match(engine, /visibilitychange[\s\S]*_refreshFieldContract\(false\)/);
  assert.match(engine, /addEventListener\('focus'[\s\S]*_refreshFieldContract\(false\)/);
  assert.match(engine, /_isUserEditing\(\)[\s\S]*Metadata sẽ được làm mới sau/);
});

test('mobile contract có classification, reasonCodes và hai khu vực thu gọn', () => {
  const resolver = read('backend-app/src/field-sync/field-sync.resolver.js');
  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(resolver, /CORE[\s\S]*OPTIONAL[\s\S]*ADVANCED[\s\S]*HIDDEN/);
  assert.match(resolver, /reasonCodes/);
  assert.match(engine, /Thông tin bổ sung/);
  assert.match(engine, /Nâng cao/);
  assert.match(engine, /field\.mobileClass === 'CORE'/);
});

test('SQL Phase 3 không runtime DDL, không xóa SY_FormatFields và Delete theo AUTO_SCHEMA fail-closed', () => {
  const directory = path.join(root, 'sql', 'Phase3SimpleCrud');
  const sources = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).map((file) => read(`sql/Phase3SimpleCrud/${file}`));
  const combined = sources.join('\n');
  assert.doesNotMatch(combined, /^\s*(?:DROP\s+(?:TABLE|PROCEDURE)|TRUNCATE\s+TABLE|ALTER\s+TABLE)\b/im);
  assert.doesNotMatch(combined, /DELETE\s+FROM\s+(?:dbo\.)?SY_FormatFields/i);
  assert.doesNotMatch(combined, /(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|MERGE\s+INTO)\s+(?:dbo\.)?SY_FrmCfg/i);
  const deleteSql = read('sql/Phase3SimpleCrud/04_UPDATE_DELETE_V2.sql');
  assert.match(deleteSql, /AUTO_SCHEMA/);
  assert.match(deleteSql, /PHASE3_INVALID_ISDELETED_TYPE/);
  assert.match(deleteSql, /PHASE3_DELETE_IDS_JSON_ARRAY_REQUIRED/);
  assert.match(deleteSql, /@IsDeletedIsComputed[\s\S]*is_computed/);
  assert.match(deleteSql, /SET\s+@DeleteMode\s*=\s*CASE\s+WHEN\s+@IsDeletedColumn\s+IS\s+NULL\s+THEN\s+'HARD'\s+ELSE\s+'SOFT'\s+END/i);
  assert.match(read('sql/Phase3SimpleCrud/05_REGISTER_PHASE3_FORMS.sql'), /AUTO_SCHEMA[\s\S]*SOFT[\s\S]*HARD/);
  assert.match(read('sql/Phase3SimpleCrud/05A_REPAIR_VIEW_V2_ALL_FORMS.sql'), /@List[\s\S]*@UserName[\s\S]*@BranchID/);
  assert.match(read('src/js/core/DynamicFormEngine.js'), /Ids:\s*JSON\.stringify\(ids\)/);
  assert.match(read('sql/Phase3SimpleCrud/00_AUDIT_CANDIDATES.sql'), /HARD_READY[\s\S]*SOFT_READY[\s\S]*INVALID_TYPE/);
  assert.match(read('sql/Phase3SimpleCrud/06_VERIFY_PHASE3_FORMS.sql'), /PASS_SOFT[\s\S]*PASS_HARD[\s\S]*BLOCK_INVALID_ISDELETED_TYPE/);
  assert.match(combined, /COLLATE\s+DATABASE_DEFAULT/i);
});

test('Form Builder của registry chỉ xem diagnostics và khóa mọi write legacy', () => {
  const plugin = read('src/js/utils/FormBuilderPlugin.js');
  assert.match(plugin, /FieldContractMigrationRegistry/);
  assert.match(plugin, /FieldSyncService\.inspectForm/);
  assert.match(plugin, /mobileClass/);
  assert.match(plugin, /runtimeRoutes/);
  assert.match(plugin, /FORM_BUILDER_WRITE_BLOCKED_PHASE2/);
  assert.match(plugin, /Không được ghi SY_FormatFields/);
});
