(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_LuongKhoanFrm',
    base: 'dynamic-crud',
    config: {
    FormName: 'WA_LuongKhoanFrm',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã hoặc tên nhân viên...'
    }
  }));
})();

