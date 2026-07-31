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
    '01_CREATE_VIEW_V2.sql',
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

test('View V2 tự nhận field bảng chính sau deny-list, scope và permission gate', () => {
  const source = read('sql/Phase2ApiMigration/01_CREATE_VIEW_V2.sql');
  assert.match(source, /MAIN_TABLE_STAR_APPROVED/);
  assert.match(source, /SELECT\s+T\.\*/i);
  assert.match(source, /SY_FrmLstTbl/);
  assert.match(source, /sys\.tables/);
  assert.match(source, /sys\.schemas/);
  assert.match(source, /OBJECT_NAME\(@@PROCID\)/);
  assert.match(source, /QUOTENAME\(@PhysicalSchema\)/);
  assert.match(source, /QUOTENAME\(@PhysicalTable\)/);
  assert.match(source, /WA_UserGroupPermisstion/);
  assert.match(source, /WA_UserPermisstion/);
  assert.match(source, /branchid.*tenantid.*companyid.*donviid/is);
  assert.match(source, /chưa được gán chi nhánh.*fail-closed/is);
  assert.match(source, /'keyword', 'branchid'/i);
  assert.match(source, /BranchID trong JsonData vượt ngữ cảnh request/);
  assert.match(source, /PHASE2_UNIFIED_FIELD_CONTRACT/);
  assert.match(source, /PHASE2_SOFT_DELETE_FILTER/);
  assert.match(source, /Cột sắp xếp không thuộc Form Contract V2/);
  assert.match(source, /OPENJSON\(R\.RowJson\)/);
  assert.match(source, /sys\.columns/);
  assert.match(source, /SELECT \(SELECT T\.\* FOR JSON PATH/);
  assert.match(source, /base64content.*passwordhash.*refreshtoken.*rawsql/is);
  assert.match(source, /@List\s+varchar\(50\)\s*,/i);
  assert.doesNotMatch(source, /SY_FormatFields/i);
  assert.doesNotMatch(source, /@FilterBac|@FilterTu|@FilterDen|@FilterThueSuat/);
  assert.match(source, /sp_executesql/i);
  assert.doesNotMatch(source, /WA_BangThueTNCNFrm|HR_BangThueTNCNTbl|\bBac\b|\bTu\b|\bDen\b|ThueSuat|PersonName/);
});

test('metadata V2 lấy field/caption động từ registry và vẫn giữ diagnostic tương thích', () => {
  const resolver = read('sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql');
  const service = read('src/js/services/FieldSyncService.js');
  const verifier = read('scripts/verify-field-sync-staging.mjs');
  const dbVerify = read('sql/Phase2ApiMigration/05_VERIFY_PILOT_V2.sql');
  assert.match(resolver, /PHASE2_UNIFIED_FIELD_CONTRACT/);
  assert.match(resolver, /sys\.sql_modules/);
  assert.match(resolver, /sys\.columns/);
  assert.match(resolver, /SY_FmtFldTbl/);
  assert.match(resolver, /CaptionVN/);
  assert.match(resolver, /COALESCE\(NULLIF\(M\.CaptionVN/);
  assert.match(resolver, /AliasForm\.TableName[^\r\n]*LOWER\(@TableName\)/);
  assert.match(resolver, /SHADOW_VIEW_NOT_REGISTERED/);
  assert.match(resolver, /RESULTSET_METADATA_ERROR/);
  assert.match(resolver, /RESULTSET_UNSAFE_FIELD/);
  assert.match(resolver, /timestamp.*rowversion.*sql_variant.*geography.*geometry.*hierarchyid/is);
  assert.match(dbVerify, /PHASE2_UNIFIED_FIELD_CONTRACT/);
  assert.match(dbVerify, /PHASE2_AUTO_DELETE_MODE/);
  assert.match(dbVerify, /M\.definition LIKE N'%UserName trong JsonData không khớp actor%'/);
  assert.match(resolver, /WA_UserPermisstion/);
  assert.match(resolver, /PHASE2_BRANCH_FAIL_CLOSED/);
  assert.match(resolver, /WHERE LOWER\(L\.FormID\) = LOWER\(@WebFormName\)[\s\S]*WHERE LOWER\(L\.FormID\) = LOWER\(@ERPFormID\)/);
  assert.match(resolver, /CapabilityVersion/);
  assert.match(service, /shadow_view_not_registered/);
  assert.match(verifier, /SHADOW_VIEW_NOT_REGISTERED/);
  assert.match(service, /refresh=1/);
  assert.doesNotMatch(resolver, /WA_BangThueTNCNFrm|HR_BangThueTNCNTbl|\bBac\b|\bTu\b|\bDen\b|ThueSuat|PersonName/);
});

test('Save V2 fail-closed và chỉ nhận cột vật lý an toàn', () => {
  const source = read('sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql');
  assert.match(source, /OBJECT_NAME\(@@PROCID\)/);
  assert.match(source, /WA_API AS A/);
  assert.match(source, /SY_FrmLstTbl/);
  assert.match(source, /sys\.tables/);
  assert.match(source, /sys\.schemas/);
  assert.match(source, /QUOTENAME\(@PhysicalSchema\)/);
  assert.match(source, /QUOTENAME\(@PhysicalTable\)/);
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
  assert.ok((source.match(/LOWER\(J\.\[key\]\)\s+COLLATE\s+DATABASE_DEFAULT/gi) || []).length >= 4);
  assert.doesNotMatch(source, /LOWER\(J\.\[key\]\)\s*=\s*LOWER\(C\.(?:name|ColumnName)\)/i);
  assert.doesNotMatch(source, /LOWER\(C\.ColumnName\)\s*=\s*LOWER\(J\.\[key\]\)(?!\s+COLLATE)/i);
  assert.match(source, /sp_executesql/);
  assert.doesNotMatch(source, /ALTER\s+TABLE|(?:FROM|JOIN)\s+(?:dbo\.)?SY_FormatFields/i);
  assert.doesNotMatch(source, /N'Lỗi SQL:|@Sql\s*\+/i);
  assert.doesNotMatch(source, /WA_BangThueTNCNFrm|HR_BangThueTNCNTbl|\bBac\b|\bTu\b|\bDen\b|ThueSuat|PersonName/);
});

test('Delete V2 tự chọn soft-delete khi có IsDeleted và hard-delete khi không có', () => {
  const source = read('sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql');
  assert.match(source, /PHASE2_AUTO_DELETE_MODE/);
  assert.match(source, /CASE WHEN @IsDeletedColumn IS NOT NULL THEN 'SOFT' ELSE 'HARD' END/);
  assert.match(source, /sys\.tables/);
  assert.match(source, /sys\.schemas/);
  assert.match(source, /QUOTENAME\(@PhysicalSchema\)/);
  assert.match(source, /QUOTENAME\(@PhysicalTable\)/);
  assert.match(source, /isdeleted/i);
  assert.match(source, /TRY_CONVERT/);
  assert.match(source, /STRING_SPLIT/);
  assert.match(source, /LOWER\(J\.\[key\]\)\s+COLLATE\s+DATABASE_DEFAULT\s*=\s*LOWER\(@PrimaryKey\)\s+COLLATE\s+DATABASE_DEFAULT/);
  assert.match(source, /JsonData Delete phải là JSON object hợp lệ/);
  assert.match(source, /BEGIN TRANSACTION/);
  assert.match(source, /WA_UserGroupPermisstion/);
  assert.match(source, /WA_UserPermisstion/);
  assert.match(source, /@GroupCanRun\s*=\s*P\.IsRun/);
  assert.match(source, /chưa được gán chi nhánh.*fail-closed/is);
  assert.match(source, /UserName trong JsonData không khớp actor/);
  assert.match(source, /UPDATE T/);
  assert.match(source, /DELETE T/);
  assert.match(source, /@RowsAffected\s*<>\s*@RequestedCount/);
  assert.match(source, /ROLLBACK TRANSACTION/);
  assert.doesNotMatch(source, /ALTER\s+TABLE|SY_FormatFields/i);
  assert.doesNotMatch(source, /HARD_DELETE_BLOCKED/);
  assert.doesNotMatch(source, /WA_BangThueTNCNFrm|HR_BangThueTNCNTbl|\bBac\b|\bTu\b|\bDen\b|ThueSuat|PersonName/);
});

test('View runtime harness chỉ đọc và kiểm tra contract/caption động không hard-code field', () => {
  const source = read('sql/Phase2RuntimeTests/01_VIEW_PARITY_READONLY.sql');
  assert.match(source, /REPLACE_WITH_ACTIVE_TEST_USER/);
  assert.match(source, /API_Web_GridFieldSchemaV2/);
  assert.match(source, /SY_FrmLstTbl/);
  assert.match(source, /sys\.columns/);
  assert.match(source, /SY_FmtFldTbl/);
  assert.match(source, /PHASE2_UNIFIED_FIELD_CONTRACT/);
  assert.match(source, /PASS_READ_ONLY_EVIDENCE/);
  assert.doesNotMatch(source, /HR_BangThueTNCNTbl|\bBac\b|\bTu\b|\bDen\b|ThueSuat|PersonName/);
  assert.doesNotMatch(source, /(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|MERGE\s+INTO)\s+dbo\.WA_API/i);
});

test('registration và rollback mặc định preview-only, không DELETE/INSERT WA_API', () => {
  const registration = read('sql/Phase2ApiMigration/04_REGISTER_PILOT_V2.sql');
  const rollback = read('sql/Phase2ApiMigration/06_ROLLBACK_PILOT_REGISTRATION.sql');
  assert.match(registration, /@ApplyView\s+bit\s*=\s*ISNULL\(TRY_CONVERT\(bit, SESSION_CONTEXT\(N'PHASE2_APPLY_VIEW'\)\), 0\)/);
  assert.match(registration, /@ApplySave\s+bit\s*=\s*ISNULL\(TRY_CONVERT\(bit, SESSION_CONTEXT\(N'PHASE2_APPLY_SAVE'\)\), 0\)/);
  assert.match(registration, /@ApplyDelete\s+bit\s*=\s*ISNULL\(TRY_CONVERT\(bit, SESSION_CONTEXT\(N'PHASE2_APPLY_DELETE'\)\), 0\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_VIEW_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_SAVE_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_DELETE_GATE'\)/);
  assert.match(registration, /SESSION_CONTEXT\(N'PHASE2_ACTOR_VERIFIED'\)/);
  assert.match(registration, /IF\s+@ApplyDelete\s*=\s*1\s+AND\s+@ApplyView\s*=\s*0\s+AND\s+NOT\s+EXISTS/i);
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
  assert.match(engine, /Schema\/caption mới phải đi kèm dữ liệu mới[\s\S]*_loadData\(\)/);
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

test('pilot điều khiển Delete theo capability, chỉ gửi PK và Save nhận actor/branch top-level', () => {
  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(engine, /action === 'DELETE' && !_contractDeleteActive\(\)/);
  assert.match(engine, /Delete V2 đang bị khóa/);
  assert.match(engine, /Ids: ids\.join\(','\)/);
  assert.match(engine, /deleteData\[primaryKey\] = ids\.join\(','\)/);
  assert.match(engine, /UserName: _currentUser\(\),\s*BranchID: _currentBranchId\(\)/);
});

test('registry Phase 2 cố định đúng một pilot và không tự bật runtime', async () => {
  let calls = 0;
  const window = runBrowserFiles([
    'src/js/config/FieldContractMigrationRegistry.js',
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
  assert.equal(Object.keys(window.Phase2MigrationRegistry.forms).includes('WA_BangThueTNCNFrm'), true);
  const pilotForm = window.Phase2MigrationRegistry.forms.WA_BangThueTNCNFrm;
  assert.equal(pilotForm.enableGrid, true);
  assert.equal(pilotForm.saveV2, 'API_LuuDong_V2');
  assert.equal(pilotForm.deleteV2, 'API_XoaDong_V2');
  assert.equal(pilotForm.deletePolicy, 'BLOCKED_NO_SOFT_DELETE');
  assert.equal(window.FieldSyncService.isPilot('WA_BangThueTNCNFrm'), false);
  const state = await window.FieldSyncService.inspectForm('WA_BangThueTNCNFrm');
  assert.equal(state.status, 'compare-only');
  assert.equal(state.active, false);
  assert.equal(calls, 2);
  await assert.rejects(window.FieldSyncService.inspectForm('WA_PayrollFrm'), /Unified Field Contract registry/);
});

test('cấu hình deploy bật đúng pilot unified và trỏ metadata backend', () => {
  const env = read('env.js');
  const index = read('index.html');
  assert.match(env, /FIELD_SYNC\s*=\s*Object\.assign\(\{[\s\S]*enabled:\s*true/);
  assert.match(env, /shadowMode:\s*false/);
  assert.match(env, /pilotForms:\s*\['WA_BangThueTNCNFrm',\s*'WA_ChucDanhFrm',\s*'WA_TitleListFrm',\s*'WA_ShiftListFrm'\]/);
  assert.match(env, /metadataBaseUrl:[\s\S]*\/api\/metadata/);
  assert.match(index, /env\.js\?v=15/);
  assert.match(index, /app\.bundle\.js\?v=17/);
});

test('metadata V2 không tự xóa phiên chính khi backend local trả 401', () => {
  const apiClient = read('src/js/utils/apiClient.js');
  const fieldSync = read('src/js/services/FieldSyncService.js');
  assert.match(apiClient, /logoutOnUnauthorized\s*=\s*options\.logoutOnUnauthorized\s*!==\s*false/);
  assert.match(apiClient, /response\.status\s*===\s*401\s*&&\s*logoutOnUnauthorized/);
  assert.match(fieldSync, /metadataRequestOptions\s*=\s*\{\s*headers:\s*headers,\s*logoutOnUnauthorized:\s*false\s*\}/);
  assert.match(fieldSync, /searchLookup[\s\S]*logoutOnUnauthorized:\s*false/);
});

test('backend xác minh phiên qua endpoint userinfo đúng contract API gốc', () => {
  const config = read('backend-app/src/field-sync/field-sync.config.js');
  const env = read('env.js');
  assert.match(config, /authVerifyUrl:\s*`\$\{sqlApiBase\}\/api\/userinfo`/);
  assert.match(env, /USER_INFO:\s*'\/api\/userinfo'/);
  assert.doesNotMatch(config, /API_UserInfo/);
});

test('backend tuân thủ wire contract Gateway và giữ placeholder trong JsonData', () => {
  const gateway = read('backend-app/src/field-sync/field-sync.gateway.js');
  assert.match(gateway, /API_Gateway_Router has a fixed wire contract/);
  assert.match(gateway, /Limit:\s*pageSize/);
  assert.doesNotMatch(gateway, /\n\s*FormName:\s*formName/);
  assert.doesNotMatch(gateway, /\n\s*ERPFormID:\s*erpFormId/);
  assert.doesNotMatch(gateway, /\n\s*PageSize:\s*pageSize/);
  assert.match(gateway, /JsonData:\s*JSON\.stringify\(\{\s*\.\.\.jsonData,\s*BranchID:\s*context\.branchId\s*\}\)/);
});

test('pilot Phase 2 tạo Grid/Add/Edit/Filter từ một Form Contract và không gọi compare legacy', async () => {
  const baseSchema = {
    schemaVersion: '2.0',
    capabilityVersion: '1.0',
    formName: 'WA_BangThueTNCNFrm',
    erpFormId: 'HR_BangThueTNCNFrm',
    tableName: 'HR_BangThueTNCNTbl',
    sourceKind: 'MAIN_TABLE',
    primaryKey: 'Bac',
    diagnostics: [],
    lookups: [],
    runtimeRoutes: {
      view: { registeredProcedure: 'API_TruyVanDong_V2' },
      save: { registeredProcedure: 'API_LuuDong_V2' },
      delete: { registeredProcedure: 'API_XoaDong_V2', mode: 'HARD' }
    },
    fields: [
      {
        name: 'Bac', label: 'Bậc', orderNo: 1, showInGrid: true, showInAdd: true, showInEdit: true,
        showInFilter: true, supportsInsert: true, supportsUpdate: false, supportsFilter: true,
        supportsSort: true, supportsKeyword: true, isPrimaryKey: true, requiredOnInsert: true
      },
      {
        name: 'GhiChuMoi', label: 'Ghi chú mới', orderNo: 2, showInGrid: true, showInAdd: true, showInEdit: true,
        showInFilter: true, supportsInsert: true, supportsUpdate: true, supportsFilter: true,
        supportsSort: true, supportsKeyword: true, isPrimaryKey: false, requiredOnInsert: false
      }
    ],
    gridFields: [
      { name: 'Bac', label: 'Bậc', orderNo: 1 },
      { name: 'GhiChuMoi', label: 'Ghi chú mới', orderNo: 2 }
    ],
    addFields: [],
    editFields: [],
    filterFields: []
  };
  baseSchema.addFields = baseSchema.fields.filter((field) => field.showInAdd);
  baseSchema.editFields = baseSchema.fields.filter((field) => field.showInEdit);
  baseSchema.filterFields = baseSchema.fields.filter((field) => field.showInFilter && field.supportsFilter);
  let branchId = 'CN01';
  let calls = 0;
  const window = runBrowserFiles([
    'src/js/config/FieldContractMigrationRegistry.js',
    'src/js/config/Phase2MigrationRegistry.js',
    'src/js/services/FieldSyncService.js'
  ], {
    ErpFormAliases: { resolve: () => 'HR_BangThueTNCNFrm' },
    ERP_FIELD_SYNC_CONFIG: { enabled: true, shadowMode: false, pilotForms: ['WA_BangThueTNCNFrm'], pollSeconds: 120, metadataBaseUrl: '/api/metadata' },
    ApiClient: {
      get: async (url) => {
        calls += 1;
        assert.doesNotMatch(url, /\/compare/);
        assert.match(url, /refresh=1/);
        return { schema: baseSchema };
      }
    },
    AppSession: { getUserName: () => 'Admin', getBranchId: () => branchId },
    sessionStorage: { setItem() {} }
  });

  const active = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', [{ name: 'LegacyMustNotLeak' }]);
  assert.equal(active.status, 'unified-active');
  assert.deepEqual(Array.from(active.runtimeSchemas.grid, (field) => field.name), ['Bac', 'GhiChuMoi']);
  assert.deepEqual(Array.from(active.runtimeSchemas.add, (field) => field.name), ['Bac', 'GhiChuMoi']);
  assert.deepEqual(Array.from(active.runtimeSchemas.edit, (field) => field.name), ['Bac', 'GhiChuMoi']);
  assert.deepEqual(Array.from(active.runtimeSchemas.filters, (field) => field.name), ['Bac', 'GhiChuMoi']);
  assert.equal(active.runtimeSchemas.edit[0].isReadOnlyEdit, true);
  assert.equal(active.runtimeSchemas.edit[1].isReadOnlyEdit, false);
  assert.equal(active.deleteActive, false);
  assert.equal(calls, 1);

  baseSchema.runtimeRoutes.view.registeredProcedure = 'API_TruyVanDong';
  branchId = 'CN02';
  const blocked = await window.FieldSyncService.observeForm('WA_BangThueTNCNFrm', []);
  assert.equal(blocked.status, 'legacy-view-not-cutover');
  assert.equal(blocked.runtimeMode, 'LEGACY_FULL');
  assert.deepEqual(Array.from(blocked.runtimeSchemas.grid), []);
});

test('DynamicFormEngine unified bỏ API dictionary legacy và sanitizer không gửi OrderNo/audit', () => {
  const engine = read('src/js/core/DynamicFormEngine.js');
  assert.match(engine, /if \(managedContract\)[\s\S]*FieldSyncService\.observeForm/);
  assert.match(engine, /!isUnifiedMetadata && window\.HRMetadataAdapter/);
  assert.match(engine, /_buildContractWritePayload/);
  assert.match(engine, /field\.supportsInsert === true/);
  assert.match(engine, /field\.supportsUpdate === true/);
  assert.match(engine, /if \(!_usesUnifiedFieldContract\(\)\) singlePayload\.OrderNo/);
  const contractBuilder = engine.slice(engine.indexOf('function _buildContractWritePayload'), engine.indexOf('function _isPhase2ManagedForm'));
  assert.doesNotMatch(contractBuilder, /UserName|UserCreate|OrderNo/);
  const cellEditStart = engine.indexOf('window.tabulatorInstance.on("cellEdited"');
  const cellEditEnd = engine.indexOf('window.tabulatorInstance.on("headerClick"', cellEditStart);
  assert.match(engine.slice(cellEditStart, cellEditEnd), /_usesUnifiedFieldContract\(\) \? _gateway\(\)/);
});

test('verifier staging nhận Form Contract V2 và bỏ compare runtime legacy', () => {
  const verifier = read('scripts/verify-field-sync-staging.mjs');
  assert.match(verifier, /schema\.capabilityVersion[\s\S]*=== '1\.0'/);
  assert.match(verifier, /unified \? \['RESULT_SET', 'MAIN_TABLE'\]/);
  assert.match(verifier, /if \(!unified\) \{[\s\S]*\/compare/);
  assert.match(verifier, /runtimeRoutes\.view[\s\S]*runtimeRoutes\.save[\s\S]*runtimeRoutes\.delete/);
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
    '11_KICH_HOAT_UNIFIED_FIELD_CONTRACT.md',
    'BAO_CAO_TONG_KET.md'
  ];
  required.forEach((file) => assert.ok(fs.existsSync(path.join(directory, file)), `thiếu ${file}`));
  const summary = read('docs/phase2-api-migration/BAO_CAO_TONG_KET.md');
  assert.match(summary, /NOT READY|CHƯA SẴN SÀNG/i);
  assert.match(summary, /WA_BangThueTNCNFrm/);
  assert.match(read('docs/phase2-api-migration/05_CRUD_MIGRATION_MATRIX.csv'), /FormName,ViewOld,ViewV2,SaveOld,SaveV2,DeleteOld,DeleteV2/);
});
