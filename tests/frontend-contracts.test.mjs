import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function loadBrowserScript(relativePath, extras = {}) {
  const window = {};
  const context = vm.createContext({ window, console, Promise, ...extras });
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { filename: relativePath });
  return { window, context };
}

test('ModuleDefinition keeps form contract and adds mobile metadata', () => {
  const { window } = loadBrowserScript('src/js/core/ModuleDefinition.js');
  const result = window.ModuleDefinition.create({ FormName: 'WA_PersonFullFrm', PrimaryKey: 'PersonID', FormFields: [{ name: 'PersonID', label: 'Mã nhân sự', orderNo: 1 }] });
  assert.equal(result.FormName, 'WA_PersonFullFrm');
  assert.equal(result.PrimaryKey, 'PersonID');
  assert.deepEqual(Array.from(result.capabilities), ['responsive']);
  assert.equal(result.FormFields[0].MobileVisible, true);
  assert.equal(result.FormFields[0].MobileOrder, 1);
});

test('HR module registry keeps the original 13 modules and adds the leave-request slice', () => {
  const files = [
    'src/js/core/ModuleDefinition.js',
    'src/js/modules/hr/definitions/access.js',
    'src/js/modules/hr/definitions/employee.js',
    'src/js/modules/hr/definitions/attendance.js',
    'src/js/modules/hr/definitions/leave.js',
    'src/js/modules/hr/definitions/payroll.js',
    'src/js/modules/hr/definitions/contract.js',
    'src/js/modules/hr/HRModuleRegistry.js'
  ];
  const window = {};
  const context = vm.createContext({ window, console, Promise });
  files.forEach((file) => vm.runInContext(
    fs.readFileSync(path.join(root, file), 'utf8'),
    context,
    { filename: file }
  ));
  const keys = window.HRModuleRegistry.keys().sort();
  assert.equal(keys.length, 14);
  assert.equal(window.APP_MODULES.WA_PERSONFULLFRM.FormName, 'WA_PersonFullFrm');
  assert.equal(window.APP_MODULES.WA_PAYROLLFRM.PrimaryKey, 'DocumentID');
  assert.equal(window.APP_MODULES.WA_CALAMVIECFRM.PrimaryKey, 'SapCaID');
  assert.equal(window.APP_MODULES.WA_DONXINNGHIPHEPFRM.PrimaryKey, 'DocumentID');
  assert.equal(window.APP_MODULES.WA_DONXINNGHIPHEPFRM.DetailTabs[0].api, 'API_HR_NghiPhep_ChiTiet');
  assert.equal(window.APP_MODULES.WA_DONXINNGHIPHEPFRM.DetailTabs[0].primaryKey, 'DetailID');
  assert.equal(window.APP_MODULES.WA_DONXINNGHIPHEPFRM.DetailTabs[1].saveApi, 'API_HR_NghiPhep_Attach_Save');
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/js/core/index.js'), 'utf8'), /APP_MODULES\[/);
});

test('Router resolves HR modules by FormKey and FormName', () => {
  const window = { location: { hash: '#/dashboard' }, APP_MODULES: {} };
  const context = vm.createContext({ window, console, Promise, setTimeout });
  [
    'src/js/core/ModuleDefinition.js',
    'src/js/modules/hr/definitions/employee.js',
    'src/js/modules/hr/HRModuleRegistry.js',
    'src/js/core/router.js'
  ].forEach((file) => vm.runInContext(
    fs.readFileSync(path.join(root, file), 'utf8'),
    context,
    { filename: file }
  ));

  context.Router.addDynamicRoutes([
    { URLPara: 'hr-person', FormKey: 'WA_PERSONFULLFRM', FormName: 'WA_PersonFullFrm', VN: 'Hồ sơ nhân viên' },
    { URLPara: 'hr-candidate', FormName: 'WA_DanhSachUngVienFrm', VN: 'Danh sách ứng viên' }
  ]);

  const personRoute = context.Router.ROUTES.find((route) => route.path === '/hr-person');
  const candidateRoute = context.Router.ROUTES.find((route) => route.path === '/hr-candidate');
  assert.equal(personRoute.config.PrimaryKey, 'PersonID');
  assert.equal(candidateRoute.config.PrimaryKey, 'CandidateID');
  assert.equal(personRoute.pageFn, 'DynamicFormEngine');
  assert.equal(candidateRoute.config.FormName, 'WA_DanhSachUngVienFrm');
});

test('HR action contracts remain callable after registry extraction', () => {
  const files = [
    'src/js/modules/hr/definitions/attendance.js',
    'src/js/modules/hr/definitions/payroll.js',
    'src/js/modules/hr/HRModuleRegistry.js'
  ];
  const window = {};
  const context = vm.createContext({ window, console, Promise });
  files.forEach((file) => vm.runInContext(
    fs.readFileSync(path.join(root, file), 'utf8'),
    context,
    { filename: file }
  ));
  const shift = window.APP_MODULES.WA_CALAMVIECFRM;
  const payroll = window.APP_MODULES.WA_BAOHIEMFRM;
  assert.equal(typeof shift.customFooterButtons[0].onClick, 'function');
  assert.equal(typeof payroll.DetailTabs[0].customButtons[0].onClick, 'function');
  assert.equal(payroll.DetailTabs[0].filterField, 'DocumentID');
});

test('HR metadata adapter applies per-form, form dictionary, global dictionary, then fallback', () => {
  const { window } = loadBrowserScript('src/js/modules/hr/HRMetadataAdapter.js');
  const result = window.HRMetadataAdapter.resolve({
    list: [{ FieldName: 'Name', CaptionVN: 'Riêng', FormatID: 't' }],
    formDictionary: [{ FieldName: 'Name', CaptionVN: 'Từ form' }, { FieldName: 'Code', FormatID: 't' }],
    globalDictionary: [{ FieldName: 'Code', FormatID: 'n' }, { FieldName: 'GlobalOnly', FormatID: 't' }]
  }, 'WA_TestFrm', { FormFields: [{ name: 'FallbackOnly', label: 'Cục bộ' }] });
  assert.deepEqual(Array.from(result.fields, (row) => row.FieldName || row.name), ['Name', 'Code', 'GlobalOnly', 'FallbackOnly']);
  assert.equal(result.fields[0].CaptionVN, 'Riêng');
  assert.equal(result.fields[1].FormatID, 't');
  assert.equal(result.source, 'SY_FormatFields');
});

test('FormActionRegistry always returns a Promise', async () => {
  const { window } = loadBrowserScript('src/js/core/FormActionRegistry.js');
  window.FormActionRegistry.register('test-action', (ctx) => ({ id: ctx.id }));
  assert.deepEqual(await window.FormActionRegistry.execute('test-action', { id: 'NV0001' }), { id: 'NV0001' });
  await assert.rejects(window.FormActionRegistry.execute('missing-action'), /Unknown form action/);
});

test('SafeFormula evaluates arithmetic only and rejects code', () => {
  const { window } = loadBrowserScript('src/js/core/SafeFormula.js');
  assert.equal(window.SafeFormula.evaluate('({base} + 5) * 2'.replace('{base}', '10')), 30);
  assert.throws(() => window.SafeFormula.evaluate('globalThis.process.exit()'), /Unsupported formula/);
});

test('ApiClient response normalizer accepts existing envelopes', () => {
  const { window } = loadBrowserScript('src/js/utils/apiClient.js', {
    document: { cookie: '', },
    fetch: async () => { throw new Error('not called'); },
    localStorage: { removeItem() {} }
  });
  const normalize = window.ApiClient.normalizeResponse;
  assert.deepEqual(normalize({ records: [{ id: 1 }] }).records, [{ id: 1 }]);
  assert.deepEqual(normalize({ list: [{ id: 2 }] }).records, [{ id: 2 }]);
  assert.deepEqual(normalize({ data: [{ id: 3 }] }).records, [{ id: 3 }]);
  assert.deepEqual(normalize([{ id: 4 }]).records, [{ id: 4 }]);
});

test('DocumentExportPlugin carries the HR-neutral id and compatibility alias', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/utils/DocumentExportPlugin.js'), 'utf8');
  assert.match(source, /documentId:\s*docId/);
  assert.match(source, /customerId:\s*docId/);
});

test('Attachment upload uses each tab business key and optional dedicated save API', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  assert.match(source, /attachmentData\[tabDef\.filterField \|\| pkField\] = pkVal/);
  assert.match(source, /List:\s*tabDef\.saveApi \|\| tabDef\.api/);
  assert.match(source, /Func:\s*tabDef\.saveFunc \|\| 'Save'/);
  assert.doesNotMatch(source, /MaHopDong:\s*pkVal/);
});

test('Editable detail tabs use their configured primary key and preserve the legacy default', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  assert.match(source, /var detailPrimaryKey = tabDef\.primaryKey \|\| 'UserAutoID'/);
  assert.match(source, /r\[detailPrimaryKey\]/);
  assert.match(source, /currRow\[detailPrimaryKey\]/);
});

test('HRM release SQL is add-only, dry-run safe, and has a unique FormatFields allow-list', () => {
  const source = fs.readFileSync(path.join(root, 'sql/Deploy/HRM_Web_Install.sql'), 'utf8');
  const formatKeys = Array.from(
    source.matchAll(/^INSERT INTO #FormatManifest .* VALUES \(N'([^']+)', N'([^']+)'/gmi),
    (match) => `${match[1]}|${match[2]}`.toLowerCase()
  );

  assert.equal(formatKeys.length, 464);
  assert.equal(new Set(formatKeys).size, formatKeys.length);
  assert.match(source, /PRIMARY KEY \(FormName, FieldName\)/);
  assert.match(source, /DECLARE @DryRun bit = 1/);
  assert.match(source, /IF @DryRun = 0/);
  assert.match(source, /#AppliedChanges/);
  assert.match(source, /API_HR_NghiPhep_Attach_Save', 'Execute'/);
  assert.doesNotMatch(source, /CREATE\s+OR\s+ALTER/i);
  assert.doesNotMatch(source, /\b(?:DELETE\s+FROM|TRUNCATE\s+TABLE|IDENTITY_INSERT)\b/i);
  assert.doesNotMatch(source, /\bUPDATE\s+(?:dbo\.)?(?:SY_FormatFields|SY_FmtFldTbl|WA_API|WA_Menu|SY_FrmLstTbl)\b/i);
});
