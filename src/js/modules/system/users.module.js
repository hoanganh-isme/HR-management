(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_NguoiDungFrm',
    base: 'dynamic-crud',
    config: {
    FormName: 'WA_NguoiDungFrm',
    PrimaryKey: 'UserName',
    TitleAdd: 'Thêm người dùng',
    TitleEdit: 'Sửa người dùng',
    TitleView: 'Chi tiết người dùng'
    }
  }));
})();

