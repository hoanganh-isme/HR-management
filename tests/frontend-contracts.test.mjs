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

test('HR module registry includes the reusable branch-shift behavior profile', () => {
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
  assert.equal(keys.length, 15);
  assert.equal(window.APP_MODULES.WA_PERSONFULLFRM.FormName, 'WA_PersonFullFrm');
  assert.equal(window.APP_MODULES.WA_PAYROLLFRM.PrimaryKey, 'DocumentID');
  assert.equal(window.APP_MODULES.WA_CALAMVIECFRM.PrimaryKey, 'SapCaID');
  assert.equal(window.APP_MODULES.WA_CALAMVIECCNFRM.PrimaryKey, 'SapCaID');
  assert.equal(window.APP_MODULES.WA_CALAMVIECCNFRM.FormFields.find((field) => field.name === 'BranchID').dataSource, 'CF_BranchListFrm');
  const branchShiftField = window.APP_MODULES.WA_CALAMVIECCNFRM.FormFields.find((field) => field.name === 'ShiftIDThu2');
  assert.equal(branchShiftField.dataSource, 'HR_ShiftListCNFrm|3');
  assert.equal(branchShiftField.dependsOn, 'BranchID');
  assert.equal(branchShiftField.valueField, 'ShiftID');
  assert.equal(branchShiftField.displayField, 'ShiftID');
  assert.equal(window.APP_MODULES.WA_CALAMVIECCNFRM.customFooterButtons[0].action, 'hr.shift.auto');
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

test('Router maps a dynamic master-detail menu to a full detail-page contract', () => {
  const window = { location: { hash: '#/dashboard' }, APP_MODULES: {} };
  const context = vm.createContext({ window, console, Promise, setTimeout });
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/core/router.js'), 'utf8'),
    context,
    { filename: 'src/js/core/router.js' }
  );

  context.Router.addDynamicRoutes([{
    URLPara: '#/2150',
    FormName: 'WA_CaLamViecCNFrm',
    VN: 'Ca Làm Việc Chi Nhánh',
    ContractType: 'MASTER_DETAIL',
    TableName: 'HR_SapCaChiNhanhTbl',
    PrimaryKey: 'SapCaID',
    DatasetsJson: JSON.stringify([{
      datasetKey: 'SHIFT_EMPLOYEES',
      apiList: 'API_CaLamViecChiNhanh_NhanVien',
      tableName: 'HR_SapCaNhanVienChiNhanhTbl',
      primaryKey: 'UserAutoID',
      parentField: 'SapCaID',
      childField: 'SapCaID',
      viewProcedure: 'API_CaLamViecChiNhanh_NhanVien',
      isReadOnly: false
    }])
  }]);

  const route = context.Router.ROUTES.find((item) => item.path === '/2150');
  assert.equal(route.config.ContractType, 'MASTER_DETAIL');
  assert.equal(route.config.PrimaryKey, 'SapCaID');
  assert.equal(route.config.DetailTabs.length, 1);
  assert.equal(route.config.DetailTabs[0].api, 'API_CaLamViecChiNhanh_NhanVien');
  assert.equal(route.config.DetailTabs[0].filterField, 'SapCaID');
  assert.equal(route.config.DetailTabs[0].parentField, 'SapCaID');
  assert.equal(route.config.DetailTabs[0].editable, true);
  assert.equal(context.Router.getConfigByFormName('wa_calamvieccnfrm'), route.config);

  context.Router.addDynamicRoutes([{
    URLPara: '#/2150',
    FormName: 'WA_CaLamViecCNFrm',
    VN: 'Ca Làm Việc Chi Nhánh',
    ContractType: 'MASTER_DETAIL',
    PrimaryKey: 'SapCaID',
    DatasetsJson: JSON.stringify([{
      datasetKey: 'SHIFT_DETAIL',
      apiList: 'API_CaLamViecChiNhanh_ChiTiet',
      tableName: 'HR_SapCaChiNhanhChiTietTbl',
      primaryKey: 'UserAutoID',
      parentField: 'SapCaID',
      childField: 'SapCaID',
      viewProcedure: 'API_CaLamViecChiNhanh_ChiTiet',
      isReadOnly: true
    }])
  }]);
  assert.equal(route.config.DetailTabs[0].joinContractKey, 'SHIFT_DETAIL');
  assert.equal(route.config.DetailTabs[0].editable, false);
});

test('DetailPage reuses the dynamic route config instead of falling back to a master-only modal', () => {
  let renderedConfig = null;
  const routeConfig = {
    FormName: 'WA_CaLamViecCNFrm',
    PrimaryKey: 'SapCaID',
    ContractType: 'MASTER_DETAIL',
    DetailTabs: [{ api: 'SHIFT_EMPLOYEES' }]
  };
  const sessionStorage = {
    getItem(key) {
      if (key === 'HR_Detail_Row_WA_CaLamViecCNFrm') return JSON.stringify({ SapCaID: 'SC001' });
      return null;
    }
  };
  const window = {
    location: { hash: '#/detail?module=WA_CaLamViecCNFrm&id=SC001&action=edit' },
    APP_MODULES: {},
    Router: {
      getConfigByFormName() { return routeConfig; },
      addDynamicRoutes() {}
    },
    DynamicFormEngine: {
      render(_container, config) { renderedConfig = config; }
    }
  };
  const context = vm.createContext({ window, console, JSON, sessionStorage });
  context.Router = window.Router;
  context.DynamicFormEngine = window.DynamicFormEngine;
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/pages/detail/detail.js'), 'utf8'),
    context,
    { filename: 'src/pages/detail/detail.js' }
  );

  context.DetailPage.render({ innerHTML: '' });
  assert.equal(renderedConfig.PrimaryKey, 'SapCaID');
  assert.equal(renderedConfig.DetailTabs.length, 1);
  assert.equal(renderedConfig.IsFullPageDetail, true);
  assert.equal(renderedConfig.IsDetailForceEdit, true);
  assert.equal(renderedConfig.DetailRowData.SapCaID, 'SC001');
});

test('DetailPage forwards linked add defaults to the full detail form', () => {
  let renderedConfig = null;
  let removedKey = '';
  const routeConfig = {
    FormName: 'WA_DonXinNghiPhepFrm',
    PrimaryKey: 'DocumentID',
    DetailTabs: [{ api: 'API_HR_NghiPhep_ChiTiet', editable: true }]
  };
  const sessionStorage = {
    getItem(key) {
      if (key === 'HR_Detail_Defaults_WA_DonXinNghiPhepFrm') {
        return JSON.stringify({ PersonID: 'COBI096', PersonName: 'Lư Kiến Hào', BranchID: 'COBI' });
      }
      return null;
    },
    removeItem(key) { removedKey = key; }
  };
  const window = {
    location: { hash: '#/detail?module=WA_DonXinNghiPhepFrm&action=add' },
    APP_MODULES: {},
    Router: {
      getConfigByFormName() { return routeConfig; },
      addDynamicRoutes() {}
    },
    DynamicFormEngine: {
      render(_container, config) { renderedConfig = config; }
    }
  };
  const context = vm.createContext({ window, console, JSON, sessionStorage });
  context.Router = window.Router;
  context.DynamicFormEngine = window.DynamicFormEngine;
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/pages/detail/detail.js'), 'utf8'),
    context,
    { filename: 'src/pages/detail/detail.js' }
  );

  context.DetailPage.render({ innerHTML: '' });
  assert.equal(renderedConfig.IsDetailAdd, true);
  assert.equal(renderedConfig.DetailRowData.PersonID, 'COBI096');
  assert.equal(renderedConfig.DetailRowData.BranchID, 'COBI');
  assert.equal(removedKey, 'HR_Detail_Defaults_WA_DonXinNghiPhepFrm');
});

test('Dynamic menu tabs preserve Vietnamese labels and configured order', () => {
  const window = { location: { hash: '#/dashboard' }, APP_MODULES: {} };
  const context = vm.createContext({ window, console, Promise, setTimeout });
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/core/router.js'), 'utf8'),
    context,
    { filename: 'src/js/core/router.js' }
  );

  context.Router.addDynamicRoutes([{
    URLPara: '#/2151',
    FormName: 'WA_CaLamViecCNFrm_OrderTest',
    VN: 'Ca Làm Việc Chi Nhánh',
    ContractType: 'MASTER_DETAIL',
    PrimaryKey: 'SapCaID',
    DatasetsJson: JSON.stringify([
      { datasetKey: 'SHIFT_DETAIL', label: 'Bảng ca chi tiết', sortOrder: 2, apiList: 'DETAIL_API' },
      { datasetKey: 'SHIFT_EMPLOYEES', label: 'Nhân viên', sortOrder: 1, apiList: 'EMPLOYEE_API' }
    ])
  }]);

  const route = context.Router.ROUTES.find((item) => item.path === '/2151');
  assert.deepEqual(
    Array.from(route.config.DetailTabs, (tab) => tab.label),
    ['Nhân viên', 'Bảng ca chi tiết']
  );
  assert.deepEqual(
    Array.from(route.config.DetailTabs, (tab) => tab.joinContractKey),
    ['SHIFT_EMPLOYEES', 'SHIFT_DETAIL']
  );
});

test('Branch shift behavior enriches Master Table datasets without replacing their order or labels', () => {
  const window = { location: { hash: '#/dashboard' }, APP_MODULES: {} };
  const context = vm.createContext({ window, console, Promise, setTimeout });
  [
    'src/js/core/ModuleDefinition.js',
    'src/js/modules/hr/definitions/attendance.js',
    'src/js/modules/hr/HRModuleRegistry.js',
    'src/js/core/router.js'
  ].forEach((file) => vm.runInContext(
    fs.readFileSync(path.join(root, file), 'utf8'),
    context,
    { filename: file }
  ));

  context.Router.addDynamicRoutes([{
    URLPara: '#/branch-shifts',
    FormName: 'WA_CaLamViecCNFrm',
    VN: 'Ca làm việc chi nhánh',
    ContractType: 'MASTER_DETAIL',
    TableName: 'HR_SapCaChiNhanhTbl',
    PrimaryKey: 'SapCaID',
    DatasetsJson: JSON.stringify([
      {
        datasetKey: 'DETAIL_TAB_2',
        label: 'Bảng ca chi tiết',
        sortOrder: 2,
        apiList: 'API_CaLamViecChiNhanh_ChiTiet',
        tableName: 'HR_SapCaChiNhanhChiTietTbl',
        parentField: 'SapCaID',
        childField: 'SapCaID',
        isReadOnly: false
      },
      {
        datasetKey: 'DETAIL_TAB_1',
        label: 'Nhân viên',
        sortOrder: 1,
        apiList: 'API_CaLamViecChiNhanh_NhanVien',
        tableName: 'HR_SapCaNhanVienChiNhanhTbl',
        parentField: 'SapCaID',
        childField: 'SapCaID',
        isReadOnly: false
      }
    ])
  }]);

  const route = context.Router.ROUTES.find((item) => item.path === '/branch-shifts');
  const [employees, generated] = route.config.DetailTabs;
  assert.notEqual(route.config.IsFullPageDetail, true);
  assert.deepEqual(Array.from(route.config.DetailTabs, (tab) => tab.label), ['Nhân viên', 'Bảng ca chi tiết']);
  assert.equal(employees.lookupConfig.PersonID.apiList, 'HR_PersonTbl');
  assert.equal(employees.lookupConfig.PersonID.masterFilters.BranchID, 'BranchID');
  assert.equal(employees.lookupConfig.PersonID.strictSelection, true);
  assert.equal(employees.lookupConfig.PersonID.sourceFields[3], 'TitleName');
  assert.deepEqual(Array.from(employees.fields), ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', 'GhiChu']);
  assert.equal(employees.fields.includes('ShiftID'), false);
  assert.equal(employees.fields.includes('Thu2'), false);
  assert.equal(employees.fieldLinks.PersonName.apiList, 'WA_DonXinNghiPhepFrm');
  assert.equal(employees.fieldLinks.PersonName.targetModule, 'WA_DonXinNghiPhepFrm');
  assert.equal(employees.fieldLinks.PersonName.editable, true);
  assert.equal(employees.fieldLinks.PersonName.allowAdd, true);
  assert.equal(employees.fieldLinks.PersonName.filterMap.PersonID, 'PersonID');
  assert.equal(employees.fieldLinks.PersonName.defaultMap.BranchID, 'BranchID');
  assert.equal(generated.editable, false);
  assert.equal(generated.metadataMode, 'JOIN_RESULT_SET_READONLY');
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
  const branchShift = window.APP_MODULES.WA_CALAMVIECCNFRM;
  const payroll = window.APP_MODULES.WA_BAOHIEMFRM;
  assert.equal(shift.customFooterButtons[0].action, 'hr.shift.auto');
  assert.equal(branchShift.customFooterButtons[0].actionConfig.func, 'HR_SapCaChiNhanh_Process_Stp');
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

test('Shift action routes the configured existing procedure through API Gateway', async () => {
  let request;
  let reloaded = false;
  const AppConfig = { apiGateway: '/api/API_Gateway_Router' };
  const AppSession = {
    getUserName() { return 'admin'; },
    getBranchId() { return 'HUNGVUONG'; }
  };
  const ApiClient = {
    post(endpoint, payload) {
      request = { endpoint, payload };
      return Promise.resolve({ code: 0, msg: 'OK' });
    }
  };
  const Alert = { success() {}, warning() {}, error() {} };
  const DynamicFormEngine = { reloadDetailTabs() { reloaded = true; } };
  const document = { querySelector() { return null; } };
  const window = {
    AppConfig,
    AppSession,
    ApiClient,
    Alert,
    DynamicFormEngine
  };
  const context = vm.createContext({
    window,
    AppConfig,
    AppSession,
    ApiClient,
    Alert,
    DynamicFormEngine,
    document,
    console,
    Promise,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/core/FormActionRegistry.js'), 'utf8'),
    context,
    { filename: 'src/js/core/FormActionRegistry.js' }
  );
  context.FormActionRegistry = window.FormActionRegistry;
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/modules/hr/actions/shift-actions.js'), 'utf8'),
    context,
    { filename: 'src/js/modules/hr/actions/shift-actions.js' }
  );

  const button = { innerHTML: 'Sắp ca', disabled: false };
  await window.ShiftActions.invoke({
    button,
    moduleConfig: { FormName: 'WA_CaLamViecCNFrm', PrimaryKey: 'SapCaID' }
  }, {
    list: 'WA_CaLamViecCNFrm',
    func: 'HR_SapCaChiNhanh_Process_Stp',
    idField: 'SapCaID'
  }, 'SC2607002');

  assert.equal(request.endpoint, '/api/API_Gateway_Router');
  assert.equal(request.payload.List, 'WA_CaLamViecCNFrm');
  assert.equal(request.payload.Func, 'HR_SapCaChiNhanh_Process_Stp');
  assert.equal(request.payload.SapCaID, 'SC2607002');
  assert.deepEqual(JSON.parse(request.payload.JsonData), { SapCaID: 'SC2607002' });
  assert.equal(request.payload.UserName, 'admin');
  assert.equal(request.payload.BranchID, 'HUNGVUONG');
  assert.equal(reloaded, true);
  assert.equal(button.disabled, false);
  assert.equal(button.innerHTML, 'Sắp ca');
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

test('AppSession supplies the authenticated actor when loading branches', async () => {
  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const window = { localStorage };
  const context = vm.createContext({ window, console, Promise });
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/core/AppSession.js'), 'utf8'),
    context,
    { filename: 'src/js/core/AppSession.js' }
  );

  localStorage.setItem('pmql_user', JSON.stringify({
    UserName: 'admin',
    UserGroupID: 'admin',
    BranchID: ''
  }));

  let adminPayload;
  await window.AppSession.loadSystemBranches({
    post(_endpoint, payload) {
      adminPayload = payload;
      return Promise.resolve({ records: [] });
    }
  }, '/api/API_Gateway_Router');

  assert.equal(adminPayload.UserName, 'admin');
  assert.equal(adminPayload.BranchID, '');

  localStorage.setItem('pmql_user', JSON.stringify({
    UserName: 'testweb',
    UserGroupID: 'XEM',
    BranchID: 'COBI,DONGDU'
  }));

  let limitedPayload;
  await window.AppSession.loadSystemBranches({
    post(_endpoint, payload) {
      limitedPayload = payload;
      return Promise.resolve({ records: [] });
    }
  }, '/api/API_Gateway_Router');

  assert.equal(limitedPayload.UserName, 'testweb');
  assert.equal(limitedPayload.BranchID, 'COBI,DONGDU');
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

test('Metadata-only detail tabs derive columns and parent-child keys at runtime', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/dynamic-form/DynamicDetailManager.js'), 'utf8');
  assert.match(source, /var parentKey = tabDef\.parentField \|\| masterKey/);
  assert.match(source, /schemaFields\.map\(function \(field\) \{ return field\.name; \}\)/);
  assert.match(source, /tabDef\.filterField \|\| moduleConfig\.PrimaryKey/);
});

test('Detail loader filters with the configured parent field instead of a display key', async () => {
  let request;
  const window = {};
  const AppConfig = { apiGateway: '/api/API_Gateway_Router' };
  const context = vm.createContext({
    window,
    AppConfig,
    console,
    Promise,
    JSON
  });
  vm.runInContext(
    fs.readFileSync(path.join(root, 'src/js/core/dynamic-form/DynamicDetailManager.js'), 'utf8'),
    context,
    { filename: 'src/js/core/dynamic-form/DynamicDetailManager.js' }
  );

  const manager = window.DynamicDetailManager.create({
    moduleConfig: {
      PrimaryKey: 'SapCa',
      ApiSearch: '/api/API_Gateway_Router'
    },
    apiClient: {
      post(endpoint, payload) {
        request = { endpoint, payload };
        return Promise.resolve({ code: 0, list: [] });
      }
    },
    currentUser() { return 'admin'; },
    currentBranch() { return 'HUNGVUONG'; }
  });

  await manager.load(
    {
      api: 'API_CaLamViecChiNhanh_NhanVien',
      parentField: 'SapCaID',
      filterField: 'SapCaID'
    },
    {
      SapCa: 'A',
      SapCaID: 'SC2607002'
    }
  );

  assert.equal(request.endpoint, '/api/API_Gateway_Router');
  assert.equal(request.payload.SapCaID, 'SC2607002');
  assert.deepEqual(JSON.parse(request.payload.JsonData), { SapCaID: 'SC2607002' });
});

test('Branch-scoped contract writes keep BranchID as top-level context', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  const attendanceSource = fs.readFileSync(path.join(root, 'src/js/modules/hr/definitions/attendance.js'), 'utf8');
  const detailSource = fs.readFileSync(path.join(root, 'src/js/core/dynamic-form/DynamicDetailManager.js'), 'utf8');
  assert.match(source, /function _isBranchScopedWriteContract\(\)/);
  assert.match(source, /_isBranchScopedWriteContract\(\) && _isBranchPayloadField\(field\.name\)\) return/);
  assert.match(source, /function _prepareGatewayWriteRequest\(request\)/);
  assert.match(source, /_removeBranchPayloadFields\(jsonPayload\)/);
  assert.match(source, /BranchID:\s*_writeBranchIdFrom\(formInputData, payloads\[0\], rowData\)/);
  assert.match(source, /_prepareGatewayWriteRequest\(finalPayload, formInputData, payloads\[0\], rowData\)/);
  assert.match(source, /delete p\._TopLevelBranchID/);
  assert.match(detailSource, /_branchPolicyOf\(moduleConfig, tabDef\) === 'BRANCH_SCOPED'/);
  assert.match(detailSource, /&& _isBranchPayloadField\(field\.name\)/);
  assert.match(detailSource, /BranchID:\s*branchContext\(panel, currentRow\)/);
  assert.match(attendanceSource, /BranchPolicy:\s*'BRANCH_SCOPED'/);
  assert.match(attendanceSource, /BranchColumn:\s*'BranchID'/);
});

test('Date inputs keep Vietnamese display and normalize before contract writes', () => {
  const inputSource = fs.readFileSync(path.join(root, 'src/components/input/Input.js'), 'utf8');
  const engineSource = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  assert.match(inputSource, /altFormat:\s*"d\/m\/Y"/);
  assert.match(inputSource, /dateFormat:\s*"Y-m-d"/);
  assert.match(inputSource, /obj\.input\.type = 'text'/);
  assert.match(inputSource, /placeholder = config\.placeholder \|\| 'dd\/mm\/yyyy'/);
  assert.doesNotMatch(inputSource, /obj\.input\.type = 'date'/);
  assert.match(engineSource, /function _normalizeDateFieldsForContract\(data, schema\)/);
  assert.match(engineSource, /_normalizeDateFieldsForContract\(formInputData, validationSchema\)/);
  assert.match(engineSource, /_normalizeDateFieldsForContract\(rawPayload, _schemaFor\(!isAdd \? 'edit' : 'add'\)\)/);
  assert.doesNotMatch(engineSource, /input\.type = "date"|dInput\.type = 'date'/);
});

test('Linked detail records can navigate to editable target modules with defaults', () => {
  const managerSource = fs.readFileSync(path.join(root, 'src/js/core/dynamic-form/DynamicDetailManager.js'), 'utf8');
  const attendanceSource = fs.readFileSync(path.join(root, 'src/js/modules/hr/definitions/attendance.js'), 'utf8');
  assert.match(managerSource, /function editableModuleOf\(linkDef\)/);
  assert.match(managerSource, /HR_Detail_Defaults_/);
  assert.match(managerSource, /window\.location\.hash = '#\/detail\?module='/);
  assert.match(attendanceSource, /targetModule:\s*'WA_DonXinNghiPhepFrm'/);
  assert.match(attendanceSource, /filterMap:\s*\{\s*PersonID:\s*'PersonID',\s*BranchID:\s*'BranchID'\s*\}/);
});

test('Dynamic form keeps the route primary key authoritative over inferred metadata', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  assert.match(source, /var configuredPrimaryKey = MODULE_CONFIG\.PrimaryKey \|\| MODULE_CONFIG\.primaryKey \|\| ''/);
  assert.match(source, /if \(!configuredPrimaryKey\) MODULE_CONFIG\.PrimaryKey = state\.schema\.primaryKey/);
  assert.match(source, /src === 'primaryKey' && configuredPrimaryKey/);
});

test('Menu-by-permission SQL carries master-detail metadata used by the router', () => {
  const source = fs.readFileSync(path.join(root, 'sql/API/API_LayMenuTheoNhomQuyen.sql'), 'utf8');
  assert.match(source, /AS \[contractType\]/i);
  assert.match(source, /AS \[primaryKey\]/i);
  assert.match(source, /D\.ApiList AS apiList|COALESCE\(D\.ApiList, ''\) AS apiList/i);
  assert.match(source, /JSON_VALUE\(D\.RolloutReason, '\$\.label'\)/i);
  assert.match(source, /ORDER BY D\.CreatedAt, D\.DatasetKey/i);
  assert.match(source, /FOR JSON PATH[\s\S]*AS \[datasetsJson\]/i);
});

test('Menu save stores tab labels and JSON order without adding registry columns', () => {
  const saveSource = fs.readFileSync(path.join(root, 'sql/API/API_LuuMenu.sql'), 'utf8');
  const registrySource = fs.readFileSync(path.join(root, 'sql/UnifiedContractRollout/01_CREATE_CONTROL_REGISTRY.sql'), 'utf8');
  assert.match(saveSource, /DisplayLabel NVARCHAR\(200\) NOT NULL/i);
  assert.match(saveSource, /TRY_CONVERT\(INT, DatasetItem\.\[key\]\) \+ 1/i);
  assert.match(saveSource, /D\.DisplayLabel AS \[label\]/i);
  assert.match(saveSource, /DATEADD\(MILLISECOND, D\.SortOrder, @DatasetOrderBase\)/i);
  assert.doesNotMatch(registrySource, /\bDisplayLabel\b|\bSortOrder\b/);
});

test('Branch shift SQL registers master/detail contracts and existing ERP action route', () => {
  const source = fs.readFileSync(path.join(root, 'sql/API/APINEW/API_CaLamViecChiNhanh.sql'), 'utf8');
  assert.match(source, /WA_CaLamViecCNFrm[\s\S]*HR_SapCaChiNhanh_Process_Stp/);
  assert.match(source, /@SapCaID=N''\{SapCaID\}''/);
  assert.match(source, /API_CaLamViecChiNhanh_NhanVien[\s\S]*HR_SapCaNhanVienChiNhanhTbl[\s\S]*UserAutoID/);
  assert.match(source, /WA_FieldDatasetRegistry[\s\S]*SHIFT_EMPLOYEES[\s\S]*API_LuuDong_V2/);
  assert.match(source, /WA_FieldContractRegistry[\s\S]*MASTER_DETAIL_SIMPLE[\s\S]*BRANCH_SCOPED/);
  assert.match(source, /SY_FrmLstTbl[\s\S]*API_CaLamViecChiNhanh_NhanVien/);
  assert.doesNotMatch(source, /\b(?:CREATE|ALTER)\s+TABLE\b/i);
});

test('Navigation cache is versioned so legacy master-only menu records are refreshed', () => {
  const navbarSource = fs.readFileSync(path.join(root, 'src/components/navbar/Navbar.js'), 'utf8');
  const sidebarSource = fs.readFileSync(path.join(root, 'src/components/sidebar/Sidebar.js'), 'utf8');
  const detailSource = fs.readFileSync(path.join(root, 'src/pages/detail/detail.js'), 'utf8');
  assert.match(navbarSource, /CACHE_CONTRACT_VERSION\s*=\s*2/);
  assert.match(navbarSource, /cached\.contractVersion\s*===\s*CACHE_CONTRACT_VERSION/);
  assert.match(sidebarSource, /contractVersion:\s*CACHE_CONTRACT_VERSION/);
  assert.match(detailSource, /cachedNav\.contractVersion\s*===\s*2/);
});

test('Pagination returns to a bounded page after a bulk data change', () => {
  const { context } = loadBrowserScript('src/components/pagination/Pagination.js');
  assert.equal(context.Pagination.getDefaultPageSize(), 15);
  assert.equal(context.Pagination.getRefreshPageSize(100000), 15);
  assert.equal(context.Pagination.getRefreshPageSize(50), 50);
});

test('Excel import uses user-facing action and progress messages', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/excel-import/ExcelImportModal.js'), 'utf8');
  assert.match(source, /saveAction:\s*'Lưu'/);
  assert.match(source, /readingHelp:\s*'Hệ thống đang đọc dữ liệu\. Vui lòng chờ\.'/);
  assert.match(source, /savingHelp:\s*'Hệ thống đang kiểm tra và lưu dữ liệu\. Vui lòng chờ\.'/);
  assert.doesNotMatch(source, /Backend đang đọc dữ liệu|Đang upload và đọc cấu trúc dữ liệu|Đang import dữ liệu/);
});

test('Dynamic grid always renders a readable loading state and bounds bulk refreshes', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/core/DynamicFormEngine.js'), 'utf8');
  assert.match(source, /label\.textContent = _gridLoadingText\(message\)/);
  assert.match(source, /currentLimit = _refreshPageSize\(currentLimit\)/);
  assert.match(source, /loadingMessage:\s*GRID_UI_TEXT\.refreshingAfterSave/);
  assert.doesNotMatch(source, /innerHTML\s*=.*MODULE_CONFIG\.TextLoading/);
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
