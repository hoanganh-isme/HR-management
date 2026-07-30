var DetailPage = (function () {
  function render($container) {
    var hash = window.location.hash;
    var moduleMatch = hash.match(/[?&]module=([^&]+)/);
    var idMatch = hash.match(/[?&]id=([^&]+)/);
    
    var formName = moduleMatch ? decodeURIComponent(moduleMatch[1]) : null;
    var rowId = idMatch ? decodeURIComponent(idMatch[1]) : null;
    var isAdd = hash.indexOf('action=add') > -1;

    if (!formName || (!rowId && !isAdd)) {
      $container.innerHTML = '<div class="alert alert-danger m-4">Thiếu thông tin module hoặc ID bản ghi để hiển thị chi tiết.</div>';
      return;
    }

    var baseConfig = window.Router && typeof Router.getConfigByFormName === 'function'
      ? Router.getConfigByFormName(formName)
      : null;
    if (!baseConfig && window.APP_MODULES) {
      // Find module config by FormName
      var targetName = formName.toLowerCase();
      for (var k in window.APP_MODULES) {
        if (window.APP_MODULES[k].FormName && window.APP_MODULES[k].FormName.toLowerCase() === targetName) {
          baseConfig = window.APP_MODULES[k];
          break;
        }
      }
      if (!baseConfig && window.APP_MODULES[formName]) {
        baseConfig = window.APP_MODULES[formName];
      }
    }

    // Dynamic fallback cho deep-link khi route menu chưa kịp dựng.
    if (!baseConfig) {
      try {
        var cachedNav = JSON.parse(sessionStorage.getItem('pmql_nav_cache') || 'null');
        if (cachedNav && cachedNav.contractVersion === 2 && Array.isArray(cachedNav.rawRecords) && window.Router) {
          Router.addDynamicRoutes(cachedNav.rawRecords);
          baseConfig = Router.getConfigByFormName(formName);
        }
      } catch (e) { }
    }

    if (!baseConfig) {
      $container.innerHTML = '<div class="alert alert-danger m-4">Không tìm thấy cấu hình master-detail cho module: ' + formName + '</div>';
      return;
    }

    var rowData = null;
    try {
      var storageKey = (isAdd ? 'HR_Detail_Defaults_' : 'HR_Detail_Row_') + baseConfig.FormName;
      var rowDataStr = sessionStorage.getItem(storageKey);
      if (rowDataStr) {
        rowData = JSON.parse(rowDataStr);
        if (isAdd) sessionStorage.removeItem(storageKey);
      }
    } catch(e) {}

    var isForceEdit = hash.indexOf('action=edit') > -1;

    // Merge với cờ IsFullPageDetail để engine biết cần render thẳng ra page thay vì vẽ grid
    var config = Object.assign({}, baseConfig, {
      IsFullPageDetail: true,
      DetailRowId: rowId,
      DetailRowData: rowData,
      IsDetailAdd: isAdd,
      IsDetailForceEdit: isForceEdit,
      HideEditBtn: true
    });

    // Frontend Override: Nếu grid cấu hình IsReadOnlyEdit = 1 (khóa sửa), 
    // ta cần mở khóa nó trên trang Chi tiết (FullPageDetail)
    if (typeof globalFormSchema !== 'undefined' && Array.isArray(globalFormSchema)) {
      var systemFields = ['personid', 'usercreate', 'userupdate', 'dateupdate', 'datecreate', 'personstatusname'];
      globalFormSchema.forEach(function (f) {
        if (systemFields.indexOf(f.name.toLowerCase()) === -1) {
          f.isReadOnlyEdit = false;
          f.IsReadOnlyEdit = 0;
          f.isReadOnlyAdd = false;
          f.IsReadOnlyAdd = 0;
        }
      });
    }

    if (typeof DynamicFormEngine !== 'undefined') {
      DynamicFormEngine.render($container, config);
    } else {
      $container.innerHTML = '<div class="alert alert-danger m-4">DynamicFormEngine chưa được tải.</div>';
    }
  }

  return {
    render: render
  };
})();
