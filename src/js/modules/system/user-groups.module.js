(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_NguoiDungNhomFrm',
    base: 'dynamic-crud',
    config: {
    FormName: 'WA_NguoiDungNhomFrm',
    PrimaryKey: 'UserGroupID',
    TitleAdd: 'Thêm nhóm',
    TitleEdit: 'Sửa nhóm',
    TitleView: 'Chi tiết nhóm'
    }
  }));
})();

