/** Registry cố định cho các form đang được quản lý bởi Phase 2. */
window.Phase2MigrationRegistry = (function () {
  var forms = Object.freeze({
    WA_BangThueTNCNFrm: Object.freeze({
      formName: 'WA_BangThueTNCNFrm',
      erpFormId: 'HR_BangThueTNCNFrm',
      viewOld: 'API_TruyVanDong',
      viewV2: 'API_BangThueTNCN_V2',
      saveOld: 'API_LuuDong',
      saveV2: 'API_LuuDong_V2',
      deleteOld: 'API_XoaDong',
      deleteV2: 'API_XoaDong_V2',
      schemaPolicy: 'UNIFIED_V2',
      deletePolicy: 'AUTO_SOFT_OR_HARD',
      status: 'UNIFIED_V2_PREPARED',
      formBuilderWriteEnabled: false
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

  function isManagedForm(formName) {
    return Boolean(get(formName));
  }

  function usesUnifiedSchema(formName) {
    var entry = get(formName);
    return Boolean(entry && entry.schemaPolicy === 'UNIFIED_V2');
  }

  return Object.freeze({ forms: forms, get: get, isManagedForm: isManagedForm, usesUnifiedSchema: usesUnifiedSchema });
})();
