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
    MenuDefinition: window.MenuDefinition,
    MenusService: window.MenusService,
    FieldSyncService: window.FieldSyncService,
    console,
    Promise,
    Date,
    Object,
    Array,
    Number,
    String,
    localStorage: window.localStorage || { getItem: () => null, setItem: () => {} },
    JSON,
    RegExp,
    Set,
    Map
  });
  files.forEach((file) => vm.runInContext(read(file), context, { filename: file }));
  return window;
}

test('MenuDefinition: normalizeMenu correctly normalizes simple and master-detail menus', () => {
  const window = runBrowserFiles(['src/js/core/MenuDefinition.js']);
  const { MenuDefinition } = window;

  assert.ok(MenuDefinition, 'MenuDefinition must be exported on window');

  // Simple table menu
  const rawSimple = {
    id: '1501',
    label: ' Bảng thuế TNCN ',
    formName: 'WA_BangThueTNCNFrm',
    contractType: 'SIMPLE_TABLE',
    tableName: 'HR_BangThueTNCNTbl',
    primaryKey: 'Bac'
  };

  const normSimple = MenuDefinition.normalizeMenu(rawSimple);
  assert.equal(normSimple.MenuID, '1501');
  assert.equal(normSimple.Label, 'Bảng thuế TNCN');
  assert.equal(normSimple.FormName, 'WA_BangThueTNCNFrm');
  assert.equal(normSimple.ContractType, 'SIMPLE_TABLE');
  assert.equal(normSimple.TableName, 'HR_BangThueTNCNTbl');
  assert.equal(normSimple.PrimaryKey, 'Bac');
  assert.equal(normSimple.datasets.length, 0);

  // Master detail menu with datasetsJson string
  const rawMaster = {
    MenuID: '0205',
    Label: 'Bảo hiểm nhân viên',
    FormName: 'WA_BaoHiemFrm',
    ContractType: 'MASTER_DETAIL',
    TableName: 'HR_BaoHiemTbl',
    PrimaryKey: 'DocumentID',
    DatasetsJson: JSON.stringify([
      {
        datasetKey: 'detail_tab_1',
        label: 'Mức đóng BHXH',
        tableName: 'HR_BaoHiemChiTietTbl',
        primaryKey: 'UserAutoID',
        parentField: 'DocumentID',
        childField: 'DocumentID',
        viewProcedure: 'API_BaoHiem_Detail',
        isReadOnly: false,
        saveProcedure: 'API_LuuDong_V2',
        deleteProcedure: 'API_XoaDong_V2'
      }
    ])
  };

  const normMaster = MenuDefinition.normalizeMenu(rawMaster);
  assert.equal(normMaster.ContractType, 'MASTER_DETAIL');
  assert.equal(normMaster.datasets.length, 1);
  assert.equal(normMaster.datasets[0].datasetKey, 'DETAIL_TAB_1');
  assert.equal(normMaster.datasets[0].apiList, 'DETAIL_TAB_1');
  assert.equal(normMaster.datasets[0].label, 'Mức đóng BHXH');
  assert.equal(normMaster.datasets[0].sortOrder, 1);
  assert.equal(normMaster.datasets[0].isReadOnly, false);
  assert.equal(normMaster.datasets[0].saveProcedure, 'API_LuuDong_V2');
  assert.equal(normMaster.datasets[0].deleteProcedure, 'API_XoaDong_V2');
});

test('MenuDefinition: validate enforces required fields and master-detail subdataset integrity', () => {
  const window = runBrowserFiles(['src/js/core/MenuDefinition.js']);
  const { MenuDefinition } = window;

  // Missing formName
  const invalid1 = MenuDefinition.validate({ MenuID: '101', Label: 'Test', FormName: '' });
  assert.equal(invalid1.isValid, false);
  assert.ok(invalid1.errors.some(e => e.includes('Tên Form')));

  // Master detail missing datasets
  const invalidMaster = MenuDefinition.validate({
    MenuID: '102',
    Label: 'Master Test',
    FormName: 'WD_TestFrm',
    ContractType: 'MASTER_DETAIL',
    TableName: 'MasterTbl',
    PrimaryKey: 'ID',
    datasets: []
  });
  assert.equal(invalidMaster.isValid, false);
  assert.ok(invalidMaster.errors.some(e => e.includes('ít nhất một Tab con')));

  // Subdataset writable but missing saveProcedure
  const invalidSubDs = MenuDefinition.validate({
    MenuID: '103',
    Label: 'Master Test 2',
    FormName: 'WD_TestFrm2',
    ContractType: 'MASTER_DETAIL',
    TableName: 'MasterTbl',
    PrimaryKey: 'ID',
    datasets: [
      {
        datasetKey: 'SUB_1',
        label: 'Tab 1',
        tableName: 'SubTbl',
        primaryKey: 'SubID',
        parentField: 'ID',
        childField: 'ID',
        viewProcedure: 'API_Sub_View',
        isReadOnly: false,
        saveProcedure: '', // Missing
        deleteProcedure: 'API_Sub_Delete'
      }
    ]
  });
  assert.equal(invalidSubDs.isValid, false);
  assert.ok(invalidSubDs.errors.some(e => e.includes('SUB_1') && e.includes('SaveProcedure')));
});

test('MenuDefinition: toSavePayload creates exact API_LuuMenu payload', () => {
  const window = runBrowserFiles(['src/js/core/MenuDefinition.js']);
  const { MenuDefinition } = window;

  const menu = {
    MenuID: '1501',
    OldMenuID: '1501',
    ParentID: '15',
    Label: 'Bảng thuế',
    FormName: 'WA_BangThueTNCNFrm',
    ContractType: 'SIMPLE_TABLE',
    TableName: 'HR_BangThueTNCNTbl',
    PrimaryKey: 'Bac'
  };

  const payload = MenuDefinition.toSavePayload(menu, 'admin');
  assert.equal(payload.NhomNguoiDangThaoTac, 'admin');
  assert.equal(payload.MenuID, '1501');
  assert.equal(payload.Label, 'Bảng thuế');
  assert.equal(payload.FormName, 'WA_BangThueTNCNFrm');
  assert.equal(payload.ContractType, 'SIMPLE_TABLE');
  assert.equal(payload.TableName, 'HR_BangThueTNCNTbl');
  assert.equal(payload.PrimaryKey, 'Bac');
  assert.equal(payload.DatasetsJson, '');
});

test('MenusService: saveDefinition validates, calls API and syncs metadata for dynamic forms', async () => {
  let postPayload = null;
  let cacheClearedForm = null;
  let refreshFormCalled = null;

  const window = runBrowserFiles([
    'src/js/core/MenuDefinition.js',
    'src/js/services/MenusService.js'
  ], {
    API_CONFIG: {
      ENDPOINTS: {
        MENUS: {
          SAVE: '/api/API_LuuMenu',
          GET_ALL: '/api/API_LayTatCaMenu',
          DELETE: '/api/API_XoaMenu'
        }
      }
    },
    ApiClient: {
      post: async (url, data) => {
        postPayload = data;
        return { code: 0, msg: 'Thành công' };
      }
    },
    FieldSyncService: {
      clearCache: (formName) => { cacheClearedForm = formName; },
      refreshForm: async (formName) => {
        refreshFormCalled = formName;
        return { status: 'READY' };
      }
    },
    localStorage: {
      getItem: () => JSON.stringify({ UserGroupID: 'admin' })
    }
  });

  const { MenusService } = window;

  const res = await MenusService.saveDefinition({
    MenuID: '1501',
    Label: 'Bảng thuế TNCN',
    FormName: 'WA_BangThueTNCNFrm',
    ContractType: 'SIMPLE_TABLE',
    TableName: 'HR_BangThueTNCNTbl',
    PrimaryKey: 'Bac'
  });

  assert.equal(res.menuSaved, true);
  assert.equal(res.metadataReady, true);
  assert.equal(postPayload.MenuID, '1501');
  assert.equal(postPayload.FormName, 'WA_BangThueTNCNFrm');
  assert.equal(cacheClearedForm, 'WA_BangThueTNCNFrm');
  assert.equal(refreshFormCalled, 'WA_BangThueTNCNFrm');
});

test('MenusService: saveDefinition throws error if backend returns code 1 (failure)', async () => {
  const window = runBrowserFiles([
    'src/js/core/MenuDefinition.js',
    'src/js/services/MenusService.js'
  ], {
    API_CONFIG: {
      ENDPOINTS: {
        MENUS: {
          SAVE: '/api/API_LuuMenu'
        }
      }
    },
    ApiClient: {
      post: async () => ({ code: 1, msg: 'Trùng mã MenuID' })
    },
    localStorage: {
      getItem: () => JSON.stringify({ UserGroupID: 'admin' })
    }
  });

  const { MenusService } = window;

  await assert.rejects(
    async () => {
      await MenusService.saveDefinition({
        MenuID: '1501',
        Label: 'Bảng thuế TNCN',
        FormName: 'WA_BangThueTNCNFrm'
      });
    },
    {
      message: 'Trùng mã MenuID'
    }
  );
});
