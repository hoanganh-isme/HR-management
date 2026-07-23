/**
 * Unified Field Contract migration registry.
 * Entries describe cutover mechanics only; field metadata stays in ERP.
 */
window.FieldContractMigrationRegistry = (function () {
  var forms = Object.freeze({
    WA_BangThueTNCNFrm: Object.freeze({
      webFormName: 'WA_BangThueTNCNFrm', erpFormId: 'HR_BangThueTNCNFrm',
      expectedTableName: 'HR_BangThueTNCNTbl', expectedPrimaryKey: 'Bac',
      oldView: 'API_TruyVanDong', viewV2: 'API_TruyVanDong_V2',
      oldSave: 'API_LuuDong', saveV2: 'API_LuuDong_V2',
      oldDelete: 'API_XoaDong', deleteV2: 'API_XoaDong_V2',
      enableGrid: true, enableAdd: true, enableEdit: true, enableFilter: true,
      enableSave: true, enableDelete: true, deletePolicy: 'AUTO_SCHEMA'
    }),
    WA_ChucDanhFrm: Object.freeze({
      webFormName: 'WA_ChucDanhFrm', erpFormId: 'WA_ChucDanhFrm',
      expectedTableName: 'HR_ChucDanhTbl', expectedPrimaryKey: 'ChucDanhChuyenMon',
      oldView: 'API_DanhSachChucDanh', viewV2: 'API_TruyVanDong_V2',
      oldSave: 'API_LuuDong', saveV2: 'API_LuuDong_V2',
      oldDelete: 'API_XoaDong', deleteV2: 'API_XoaDong_V2',
      enableGrid: true, enableAdd: true, enableEdit: true, enableFilter: true,
      enableSave: true, enableDelete: true, deletePolicy: 'AUTO_SCHEMA'
    }),
    WA_TitleListFrm: Object.freeze({
      webFormName: 'WA_TitleListFrm', erpFormId: 'WA_TitleListFrm',
      expectedTableName: 'HR_TitleListTbl', expectedPrimaryKey: 'TitleName',
      oldView: 'API_TruyVanDong', viewV2: 'API_TruyVanDong_V2',
      oldSave: 'API_LuuDong', saveV2: 'API_LuuDong_V2',
      oldDelete: 'API_XoaDong', deleteV2: 'API_XoaDong_V2',
      enableGrid: true, enableAdd: true, enableEdit: true, enableFilter: true,
      enableSave: true, enableDelete: true, deletePolicy: 'AUTO_SCHEMA'
    }),
    WA_ShiftListFrm: Object.freeze({
      webFormName: 'WA_ShiftListFrm', erpFormId: 'WA_ShiftListFrm',
      expectedTableName: 'HR_ShiftListTbl', expectedPrimaryKey: 'ShiftID',
      oldView: 'API_TruyVanDong', viewV2: 'API_TruyVanDong_V2',
      oldSave: 'API_LuuDong', saveV2: 'API_LuuDong_V2',
      oldDelete: 'API_XoaDong', deleteV2: 'API_XoaDong_V2',
      enableGrid: true, enableAdd: true, enableEdit: true, enableFilter: true,
      enableSave: true, enableDelete: true, deletePolicy: 'AUTO_SCHEMA'
    })
  });

  function keyOf(formName) {
    var target = String(formName || '').trim().toLowerCase();
    return Object.keys(forms).find(function (key) { return key.toLowerCase() === target; }) || '';
  }

  function get(formName) {
    var key = keyOf(formName);
    return key ? forms[key] : null;
  }

  function list() {
    return Object.keys(forms).map(function (key) { return forms[key]; });
  }

  function isManagedForm(formName) {
    return Boolean(get(formName));
  }

  function usesUnifiedSchema(formName) {
    var entry = get(formName);
    return Boolean(entry && entry.enableGrid === true);
  }

  function resolveErpFormId(formName) {
    var entry = get(formName);
    return entry ? entry.erpFormId : formName;
  }

  var aliases = Object.freeze(list().reduce(function (result, entry) {
    if (entry.erpFormId !== entry.webFormName) result[entry.webFormName] = entry.erpFormId;
    return result;
  }, {}));

  return Object.freeze({
    forms: forms,
    aliases: aliases,
    get: get,
    list: list,
    isManagedForm: isManagedForm,
    usesUnifiedSchema: usesUnifiedSchema,
    resolveErpFormId: resolveErpFormId
  });
})();
