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

test('Phase 2 có đủ bảy script, không DDL runtime hoặc sửa SY_FrmCfg', () => {
  const directory = path.join(root, 'sql', 'Phase2ApiMigration');
  const expected = [
    '00_CAPTURE_VIEW_CONTRACT.sql',
    '01_CREATE_VIEW_V2_PILOT.sql',
    '02_CREATE_SAVE_V2.sql',
    '03_CREATE_DELETE_V2.sql',
    '04_REGISTER_PILOT_V2.sql',
    '05_VERIFY_PILOT_V2.sql',
    '06_ROLLBACK_PILOT_REGISTRATION.sql'
  ];
  assert.deepEqual(fs.readdirSync(directory).sort(), expected.sort());
  const source = expected.map((file) => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /SY_FrmCfg/i);
  assert.doesNotMatch(source, /ALTER\s+TABLE|TRUNCATE\s+TABLE/i);
  assert.doesNotMatch(source, /DELETE\s+FROM\s+(?:dbo\.)?SY_FormatFields/i);
  assert.doesNotMatch(source, /SELECT\s+\*/i);
});

test('View V2 chỉ dùng MainAlias.* sau deny-list, scope và permission gate', () => {
  const source = read('sql/Phase2ApiMigration/01_CREATE_VIEW_V2_PILOT.sql');
  assert.match(source, /MAIN_TABLE_STAR_APPROVED/);
  assert.match(source, /SELECT\s+T\.\*/i);
  const approvedSelect = source.slice(source.indexOf('/* MAIN_TABLE_STAR_APPROVED'));
  assert.doesNotMatch(approvedSelect, /\bJOIN\b/i);
  assert.match(source, /WA_UserGroupPermisstion/);
  assert.match(source, /WA_UserPermisstion/);
  assert.match(source, /branchid.*tenantid.*companyid.*donviid/is);
  assert.match(source, /chưa được gán chi nhánh.*fail-closed/is);
  assert.match(source, /'keyword', 'branchid'/i);
  assert.match(source, /BranchID trong JsonData vượt ngữ cảnh request/);
  assert.match(source, /PHASE2_NEW_FIELDS_DISPLAY_ONLY/);
  assert.match(source, /Cột sắp xếp chưa nằm trong contract pilot/);
  assert.match(source, /base64content.*passwordhash.*refreshtoken.*rawsql/is);
  assert.match(source, /HR_BangThueTNCNTbl/);
  assert.match(source, /Bac.*Tu.*Den.*ThueSuat/is);
  assert.match(source, /@List\s+varchar\(50\)\s*,/i);
  assert.doesNotMatch(source, /SY_FormatFields/i);
});

test('metadata shadow mô tả đúng View V2 nhưng chặn active trước khi WA_API đổi', () => {
  const resolver = read('sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql');
  const service = read('src/js/services/FieldSyncService.js');
  const verifier = read('scripts/verify-field-sync-staging.mjs');
  const dbVerify = read('sql/Phase2ApiMigration/05_VERIFY_PILOT_V2.sql');
  assert.match(resolver, /PHASE2_SHADOW_VIEW_OVERRIDE/);
  assert.match(resolver, /API_BangThueTNCN_V2/);
  assert.match(resolver, /SHADOW_VIEW_NOT_REGISTERED/);
  assert.match(resolver, /RESULTSET_METADATA_ERROR/);
  assert.match(resolver, /RESULTSET_UNSAFE_FIELD/);
  assert.match(resolver, /timestamp.*rowversion.*sql_variant.*geography.*geometry.*hierarchyid/is);
  assert.match(dbVerify, /RESULTSET_METADATA_ERROR/);
  assert.match(dbVerify, /RESULTSET_UNSAFE_FIELD/);
  assert.match(resolver, /WA_UserPermisstion/);
  assert.match(resolver, /PHASE2_BRANCH_FAIL_CLOSED/);
  assert.match(service, /shadow_view_not_registered/);
  assert.match(verifier, /SHADOW_VIEW_NOT_REGISTERED/);
});

test('Save V2 fail-closed và chỉ nhận cột vật lý an toàn', () => {
  const source = read('sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql');
  assert.match(source, /ISJSON\(@Data\)/);
  assert.match(source, /sys\.columns/);
  assert.match(source, /is_identity\s*=\s*0/);
  assert.match(source, /is_computed\s*=\s*0/);
  assert.match(source, /default_object_id\s*=\s*0/);
  assert.match(source, /BEGIN TRANSACTION/);
  assert.match(source, /SET XACT_ABORT ON/);
  assert.match(source, /WA_UserGroupPermisstion/);
  assert.match(source, /WA_UserPermisstion/);
  assert.match(source, /@GroupCanRun\s*=\s*P\.IsRun/);
  assert.match(source, /chưa được gán chi nhánh.*fail-closed/is);
  assert.match(source, /UserName trong JsonData không khớp actor/);
  assert.match(source, /'username', 'branchid'/i);
  assert.match(source, /JSON chứa field không tồn tại hoặc bị chặn/);
  assert.match(source, /Thiếu khóa chính khi cập nhật/);
  assert.match(source, /IsPrimaryKey\s*=\s*0/);
  assert.match(source, /sp_executesql/);
  assert.doesNotMatch(source, /ALTER\s+TABLE|SY_FormatFields/i);
  assert.doesNotMatch(source, /N'Lỗi SQL:|@Sql\s*\+/i);
});

test('Delete V2 chỉ xóa mềm và hard-delete mặc định bị chặn', () => {
  const source = read('sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql');
  assert.match(source, /HARD_DELETE_BLOCKED/);
  assert.match(source, /isdeleted/i);
  assert.match(source, /TRY_CONVERT/);
  assert.match(source, /STRING_SPLIT/);
  assert.match(source, /JsonData Delete phải là JSON object hợp lệ/);
  assert.match(source, /BEGIN TRANSACTION/);
  assert.match(source, /WA_UserGroupPermisstion/);
  assert.match(source, /WA_UserPermisstion/);
  assert.match(source, /@GroupCanRun\s*=\s*P\.IsRun/);
  assert.match(source, /chưa được gán chi nhánh.*fail-closed/is);
  assert.match(source, /UserName trong JsonData không khớp actor/);
  assert.doesNotMatch(source, /^\s*DELETE\s+FROM\s+(?!#)/im);
  assert.doesNotMatch(source, /ALTER\s+TABLE|SY_FormatFields/i);
});

test('registration và rollback mặc định preview-only, không DELETE/INSERT WA_API', () => {
  const registration = read('sql/Phase2ApiMigration/04_REGISTER_PILOT_V2.sql');
  const rollback = read('sql/Phase2ApiMigration/06_ROLLBACK_PILOT_REGISTRATION.sql');
  assert.match(registration, /@ApplyView\s+bit\s*=\s*0/);
  assert.match(registration, /@ApplySave\s+bit\s*=\s*0/);
  assert.match(registration, /@ApplyDelete\s+bit\s*=\s*0/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_VIEW_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_SAVE_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_DELETE_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_ACTOR_VERIFIED'\)/);
  assert.doesNotMatch(registration, /(?:DELETE\s+FROM|INSERT\s+INTO)\s+dbo\.WA_API/i);
  assert.match(rollback, /@RollbackView\s+bit\s*=\s*0/);
  assert.match(rollback, /API_TruyVanDong/);
  assert.match(rollback, /API_LuuDong/);
  assert.match(rollback, /API_XoaDong/);
  assert.doesNotMatch(rollback, /(?:DELETE\s+FROM|INSERT\s+INTO)\s+dbo\.WA_API/i);
});

test('Gateway escape moi placeholder chuoi truoc khi ghep EXEC dong', () => {
  for (const file of ['sql/API/API_Gateway_Router.sql', 'sql/API/Combined_API.sql']) {
    const source = read(file);
    for (const placeholder of ['User', 'UserName', 'UserGroup', 'BranchID', 'ManagerID', 'EmployeeID', 'List', 'SortColumn', 'SortDir']) {
      const escaped = new RegExp(`\\{${placeholder}\\}'\\s*,\\s*REPLACE\\(ISNULL\\(`, 'i');
      assert.match(source, escaped, `${file} chua escape ${placeholder}`);
    }
    assert.doesNotMatch(source, /\{(?:User|UserName|UserGroup|BranchID|ManagerID|EmployeeID|List|SortColumn|SortDir)\}'\s*,\s*ISNULL\(/i);
  }
});

test('Form Builder chặn mọi write pilot và có màn hình compare read-only', () => {
  const plugin = read('src/js/utils/FormBuilderPlugin.js');
  const syncSql = read('sql/API/API_DongBoTruongGiaoDien.sql');
  const saveFieldSql = read('sql/API/API_LuuTruongGiaoDien.sql');
  const deleteFieldSql = read('sql/API/API_XoaTruongGiaoDien.sql');
  assert.match(plugin, /_isPhase2Managed/);
  assert.match(plugin, /FieldSyncService\.inspectForm/);
  assert.match(plugin, /FORM_BUILDER_WRITE_BLOCKED_PHASE2/);
  assert.match(plugin, /Compatibility mode/);
  assert.match(plugin, /Diagnostic:/);
  assert.match(plugin, /Legacy dropdown/);
  assert.match(plugin, /V2 dropdown/);
  assert.match(syncSql, /FORM_BUILDER_WRITE_BLOCKED_PHASE2/);
  assert.match(saveFieldSql, /FORM_BUILDER_WRITE_BLOCKED_PHASE2/);
  assert.match(deleteFieldSql, /FORM_BUILDER_WRITE_BLOCKED_PHASE2/);
});

test('dual schema dùng object độc lập và rollback Grid được re-render', () => {
  const service = runBrowserFiles(['src/js/services/FieldSyncService.js']);
  const legacy = [{ name: 'Bac', nested: { value: 1 } }];
  const schemas = service.FieldSyncService.createRuntimeSchemas(legacy, [], false);
  assert.notEqual(schemas.grid[0], schemas.add[0]);
  assert.notEqual(schemas.add[0], schemas.edit[0]);
  assert.notEqual(schemas.edit[0], schemas.filters[0]);
  schemas.add[0].nested.value = 2;
  assert.equal(schemas.edit[0].nested.value, 1);

  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(engine, /_gridSchemaSignature/);
  assert.match(engine, /_applyFieldSyncState/);
  assert.match(engine, /previousSignature\s*===\s*nextSignature/);
  assert.doesNotMatch(engine, /if\s*\(detail\.state\.active[^)]*\)[^{]*_renderTable/);
});

test('inline edit chỉ gửi PK và field vừa sửa, không forward toàn bộ row V2', () => {
  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(engine, /payloadObj\[MODULE_CONFIG\.PrimaryKey\]\s*=\s*rowData\[MODULE_CONFIG\.PrimaryKey\]/);
  assert.match(engine, /payloadObj\[field\]\s*=\s*newVal/);
  assert.match(engine, /_isPhase2ManagedForm\(\)/);
  assert.match(engine, /Object\.keys\(rowData \|\| \{\}\)\.forEach/);
  const cellEditStart = engine.indexOf('window.tabulatorInstance.on("cellEdited"');
  const cellEditEnd = engine.indexOf('window.tabulatorInstance.on("headerClick"', cellEditStart);
  assert.ok(cellEditStart > -1 && cellEditEnd > cellEditStart);
  assert.doesNotMatch(engine.slice(cellEditStart, cellEditEnd), /Object\.assign\(\{\},\s*rowData\)/);
});

test('pilot khong cho Delete legacy va gateway Save nhan actor/branch top-level', () => {
  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(engine, /action === 'DELETE' && _isPhase2ManagedForm\(\)\) return false/);
  assert.match(engine, /Delete pilot Phase 2/);
  assert.match(engine, /UserName: _currentUser\(\),\s*BranchID: _currentBranchId\(\)/);
});

test('registry Phase 2 cố định đúng một pilot và không tự bật runtime', async () => {
  let calls = 0;
  const window = runBrowserFiles([
    'src/js/config/Phase2MigrationRegistry.js',
    'src/js/services/FieldSyncService.js'
  ], {
    ERP_FIELD_SYNC_CONFIG: { enabled: false, shadowMode: true, pilotForms: [], pollSeconds: 120, metadataBaseUrl: '/api/metadata' },
    ApiClient: {
      get: async (url) => {
        calls += 1;
        return url.includes('/compare?')
          ? { comparison: { schemaVersion: '2.0', items: [] } }
          : { schema: { schemaVersion: '2.0', gridFields: [] } };
      }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => 'CN01' }
  });
  assert.deepEqual(Object.keys(window.Phase2MigrationRegistry.forms), ['WA_BangThueTNCNFrm']);
  assert.equal(window.FieldSyncService.isPilot('WA_BangThueTNCNFrm'), false);
  const state = await window.FieldSyncService.inspectForm('WA_BangThueTNCNFrm');
  assert.equal(state.status, 'compare-only');
  assert.equal(state.active, false);
  assert.equal(calls, 2);
  await assert.rejects(window.FieldSyncService.inspectForm('WA_PayrollFrm'), /registry Phase 2/);
});

test('pilot Phase 2 cho phep field moi ONLY_V2 nhung van fail-closed voi ONLY_LEGACY', async () => {
  const baseSchema = {
    schemaVersion: '2.0',
    formName: 'WA_BangThueTNCNFrm',
    erpFormId: 'HR_BangThueTNCNFrm',
    sourceKind: 'RESULT_SET',
    primaryKey: 'Bac',
    diagnostics: [],
    lookups: [],
    gridFields: [
      { name: 'Bac', label: 'Bac', orderNo: 1 },
      { name: 'GhiChuMoi', label: 'Ghi chu moi', orderNo: 2 }
    ]
  };
  let comparisonStatus = 'ONLY_V2';
  let branchId = 'CN01';
  const window = runBrowserFiles([
    'src/js/config/Phase2MigrationRegistry.js',
    'src/js/services/FieldSyncService.js'
  ], {
    ErpFormAliases: { resolve: () => 'HR_BangThueTNCNFrm' },
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_BangThueTNCNFrm'], pollSeconds: 120, metadataBaseUrl: '/api/metadata' },
    ApiClient: {
      get: async (url) => url.includes('/compare?')
        ? { comparison: {
          schemaVersion: '2.0',
          formName: 'WA_BangThueTNCNFrm',
          erpFormId: 'HR_BangThueTNCNFrm',
          primaryKey: { legacy: 'Bac', v2: 'Bac', status: 'MATCH' },
          items: [
            { fieldName: 'Bac', status: 'MATCH' },
            { fieldName: 'GhiChuMoi', status: comparisonStatus }
          ]
        } }
        : { schema: baseSchema }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => branchId },
    sessionStorage: { setItem() {} }
  });

  const legacy = [{ name: 'Bac' }];
  const active = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', legacy);
  assert.equal(active.status, 'pilot-active');
  assert.deepEqual(Array.from(active.runtimeSchemas.grid, (field) => field.name), ['Bac', 'GhiChuMoi']);

  comparisonStatus = 'ONLY_LEGACY';
  branchId = 'CN02';
  const blocked = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', legacy);
  assert.equal(blocked.status, 'pilot-blocked-critical');
  assert.deepEqual(Array.from(blocked.runtimeSchemas.grid, (field) => field.name), ['Bac']);
});

test('fixture contract không chứa dữ liệu nhân sự thật', () => {
  for (const side of ['before', 'after']) {
    const fixture = JSON.parse(read(`tests/fixtures/phase2/view-contract-${side}/WA_BangThueTNCNFrm.json`));
    assert.equal(fixture.containsProductionData, false);
    assert.equal(fixture.formName, 'WA_BangThueTNCNFrm');
    assert.deepEqual(fixture.columns.slice(0, 4).map((column) => column.name), ['Bac', 'Tu', 'Den', 'ThueSuat']);
    assert.equal(JSON.stringify(fixture).match(/Person|CCCD|Salary|Password|Token/i), null);
  }
});

test('inventory audit có đủ cột bắt buộc và ghi nhận star pilot duy nhất', () => {
  const inventory = read('docs/phase2-api-migration/01_API_VIEW_INVENTORY.csv');
  const joins = read('docs/phase2-api-migration/02_JOIN_ANALYSIS.csv');
  const stars = read('docs/phase2-api-migration/03_SELECT_STAR_EXCEPTIONS.csv');
  const references = read('docs/phase2-api-migration/06_SY_FORMATFIELDS_REMAINING_REFERENCES.csv');
  assert.match(inventory.split(/\r?\n/)[0], /File,Procedure,WAApiList,WAApiFunc,MainTable,PrimaryAlias,JoinTables,JoinType,JoinCondition,JoinCardinality,CurrentColumns,HasSelectStar,HasAggregate,HasUnion,HasBlob,HasSensitiveData,BranchFilter,PermissionFilter,FrontendConsumers,Category,Decision,Risk/);
  assert.ok(inventory.split(/\r?\n/).length > 100);
  assert.match(joins.split(/\r?\n/)[0], /Procedure,MainTable,JoinTable,JoinType,JoinCondition,ExpectedCardinality,ActualDuplicateRisk,JoinedColumns,AliasCompatibility,Decision/);
  assert.match(stars, /API_BangThueTNCN_V2,T\.\*,MAIN_TABLE_STAR_APPROVED/);
  assert.equal((stars.match(/MAIN_TABLE_STAR_APPROVED/g) || []).length, 1);
  assert.match(stars, /API_NguoiDungFrm,U\.\*,UNSAFE_STAR/);
  assert.match(references, /FORM_BUILDER_WRITE/);
});

test('báo cáo Phase 2 có đủ artifact bắt buộc và ghi rõ trạng thái chưa kích hoạt', () => {
  const directory = path.join(root, 'docs', 'phase2-api-migration');
  const required = [
    '00_BAO_CAO_COMMIT_NEN.md',
    '01_API_VIEW_INVENTORY.csv',
    '02_JOIN_ANALYSIS.csv',
    '03_SELECT_STAR_EXCEPTIONS.csv',
    '04_VIEW_CONTRACT_PARITY.csv',
    '05_CRUD_MIGRATION_MATRIX.csv',
    '06_SY_FORMATFIELDS_REMAINING_REFERENCES.csv',
    '07_KET_QUA_TEST.md',
    '08_HUONG_DAN_DB_TEST.md',
    '09_HUONG_DAN_ROLLBACK.md',
    '10_DANH_SACH_FILE_TEST_VA_KY_VONG.md',
    'BAO_CAO_TONG_KET.md'
  ];
  required.forEach((file) => assert.ok(fs.existsSync(path.join(directory, file)), `thiếu ${file}`));
  const summary = read('docs/phase2-api-migration/BAO_CAO_TONG_KET.md');
  assert.match(summary, /NOT READY|CHƯA SẴN SÀNG/i);
  assert.match(summary, /WA_BangThueTNCNFrm/);
  assert.match(read('docs/phase2-api-migration/05_CRUD_MIGRATION_MATRIX.csv'), /FormName,ViewOld,ViewV2,SaveOld,SaveV2,DeleteOld,DeleteV2/);
});
