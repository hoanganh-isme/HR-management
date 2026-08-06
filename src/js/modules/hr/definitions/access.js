(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.access = definitions.access || {};
  definitions.access['WA_NGUOIDUNGNHOMFRM'] = {
    FormName: 'WA_NguoiDungNhomFrm',
    PrimaryKey: 'UserGroupID',
    PageTitle: 'Danh sách nhóm người dùng',
    TitleAdd: 'Thêm nhóm',
    TitleEdit: 'Sửa nhóm',
    TitleView: 'Chi tiết nhóm',
    FormFields: [
      { name: 'UserGroupID', title: 'Mã nhóm', width: 140, hozAlign: 'left', required: true, showInGrid: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: true },
      { name: 'UserGroupName', title: 'Tên nhóm', width: 220, hozAlign: 'left', required: true, showInGrid: true, showInAdd: true, showInEdit: true },
      { name: 'IsDisable', title: 'Ngưng dùng', width: 110, hozAlign: 'center', formatter: 'tickCross', showInGrid: true, showInAdd: true, showInEdit: true }
    ]
  };
  definitions.access['WA_NGUOIDUNGFRM'] = {
    FormName: 'WA_NguoiDungFrm',
    PrimaryKey: 'UserName',
    PageTitle: 'Danh sách người dùng',
    TitleAdd: 'Thêm người dùng',
    TitleEdit: 'Sửa người dùng',
    TitleView: 'Chi tiết người dùng',
    FormFields: [
      { name: 'UserName', title: 'Tên đăng nhập', width: 150, hozAlign: 'left', required: true, showInGrid: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: true },
      { name: 'HoTen', title: 'Họ và tên', width: 200, hozAlign: 'left', required: true, showInGrid: true, showInAdd: true, showInEdit: true },
      { name: 'TenNgan', title: 'Tên ngắn', width: 120, hozAlign: 'left', showInGrid: true, showInAdd: true, showInEdit: true },
      { name: 'UserGroupID', title: 'Nhóm quyền', width: 160, hozAlign: 'left', required: true, showInGrid: true, showInAdd: true, showInEdit: true, dataSource: 'SY_UserGroup', formatID: 'sl' },
      { name: 'BranchID', title: 'Chi nhánh', width: 150, hozAlign: 'left', showInGrid: true, showInAdd: true, showInEdit: true, dataSource: 'CF_BranchListFrm', formatID: 'sl' },
      { name: 'EmployeeID', title: 'Mã nhân viên', width: 140, hozAlign: 'left', showInGrid: true, showInAdd: true, showInEdit: true, dataSource: 'HR_PersonTbl', formatID: 'sl' },
      { name: 'Disable', title: 'Khóa tài khoản', width: 120, hozAlign: 'center', formatter: 'tickCross', showInGrid: true, showInAdd: true, showInEdit: true },
      { name: 'Manager', title: 'Quản lý', width: 100, hozAlign: 'center', formatter: 'tickCross', showInGrid: true, showInAdd: true, showInEdit: true }
    ]
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

