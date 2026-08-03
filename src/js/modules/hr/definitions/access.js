(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.access = definitions.access || {};
    definitions.access['WA_NGUOIDUNGNHOMFRM'] = {
    FormName: 'WA_NguoiDungNhomFrm',
    PrimaryKey: 'UserGroupID',
    TitleAdd: 'Thêm nhóm',
    TitleEdit: 'Sửa nhóm',
    TitleView: 'Chi tiết nhóm'
  };
  definitions.access['WA_NGUOIDUNGFRM'] = {
    FormName: 'WA_NguoiDungFrm',
    PrimaryKey: 'UserID',
    TitleAdd: 'Thêm người dùng',
    TitleEdit: 'Sửa người dùng',
    TitleView: 'Chi tiết người dùng'
  };
  definitions.access['SY_FORMATFLDTBL'] = {
    FormName: 'SY_FormatfldTbl',
    PrimaryKey: 'AutoID',
    PageTitle: 'Cấu hình động',
    TitleAdd: 'Thêm cấu hình động',
    TitleEdit: 'Sửa cấu hình động',
    TitleView: 'Chi tiết cấu hình động',
    FormFields: [
      { name: 'AutoID', title: 'ID', width: 80, hozAlign: 'center' },
      { name: 'FormName', title: 'Mã Form', width: 220, hozAlign: 'left' },
      { name: 'FieldName', title: 'Tên trường (FieldName)', width: 220, hozAlign: 'left' },
      { name: 'CaptionVN', title: 'Tiêu đề VN', width: 200, hozAlign: 'left' },
      { name: 'CaptionEN', title: 'Tiêu đề EN', width: 200, hozAlign: 'left' },
      { name: 'FormatID', title: 'Định dạng (FormatID)', width: 140, hozAlign: 'center' },
      { name: 'AlignX', title: 'Canh lề', width: 90, hozAlign: 'center' },
      { name: 'IsSystem', title: 'Hệ thống', width: 90, hozAlign: 'center' }
    ]
  };
  definitions.access['SY_FORMATFIELDS'] = {
    FormName: 'SY_FormatfldTbl',
    PrimaryKey: 'AutoID',
    PageTitle: 'Cấu hình động',
    TitleAdd: 'Thêm cấu hình động',
    TitleEdit: 'Sửa cấu hình động',
    TitleView: 'Chi tiết cấu hình động',
    FormFields: [
      { name: 'AutoID', title: 'ID', width: 80, hozAlign: 'center' },
      { name: 'FormName', title: 'Mã Form', width: 220, hozAlign: 'left' },
      { name: 'FieldName', title: 'Tên trường (FieldName)', width: 220, hozAlign: 'left' },
      { name: 'CaptionVN', title: 'Tiêu đề VN', width: 200, hozAlign: 'left' },
      { name: 'CaptionEN', title: 'Tiêu đề EN', width: 200, hozAlign: 'left' },
      { name: 'FormatID', title: 'Định dạng (FormatID)', width: 140, hozAlign: 'center' },
      { name: 'AlignX', title: 'Canh lề', width: 90, hozAlign: 'center' },
      { name: 'IsSystem', title: 'Hệ thống', width: 90, hozAlign: 'center' }
    ]
  };
})(window);

