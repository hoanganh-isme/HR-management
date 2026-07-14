(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_QuanLyNghiPhepNamFrm',
    base: 'dynamic-crud',
    config: {
      FormName: 'WA_QuanLyNghiPhepNamFrm',
      PrimaryKey: 'UserAutoID',
      SchemaVersion: 2,
      FormTitle: 'Quản lý nghỉ phép năm',
      TitleAdd: 'Thêm khai báo phép năm',
      TitleEdit: 'Cập nhật khai báo phép năm',
      ModalWidth: '960px',
      HideAddNewInDropdowns: true,
      HideBranchStep: true,
      fieldOverrides: {
        PersonID: {
          label: 'Mã nhân viên', required: true, showInAdd: true, showInEdit: true,
          isReadOnlyAdd: false, isReadOnlyEdit: true, renderRule: 'sl',
          dataSource: 'WA_PersonFullFrm|4', valueField: 'PersonID', labelField: 'PersonID',
          allowCustomValue: false, position: 'grid|3'
        },
        PersonName: { label: 'Họ tên', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3' },
        PhongBan: { label: 'Bộ phận', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3' },
        TitleName: { label: 'Chức vụ', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3' }
      },
      FormFields: [
        { name: 'PersonID', label: 'Mã nhân viên', required: true, showInAdd: true, showInEdit: true, isReadOnlyAdd: false, isReadOnlyEdit: true, renderRule: 'sl', dataSource: 'WA_PersonFullFrm|4', valueField: 'PersonID', labelField: 'PersonID', allowCustomValue: false, position: 'grid|3', orderNo: 1 },
        { name: 'PersonName', label: 'Họ tên', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3', orderNo: 2 },
        { name: 'PhongBan', label: 'Bộ phận', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3', orderNo: 3 },
        { name: 'TitleName', label: 'Chức vụ', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, isReadOnly: true, disabled: true, renderRule: 'text', position: 'grid|3', orderNo: 4 },
        { name: 'BranchID', label: 'Chi nhánh', showInGrid: true, showInAdd: false, showInEdit: false, orderNo: 4.5 },
        { name: 'Nam', position: 'grid|3', orderNo: 5, showInGrid: false },
        { name: 'SoNgay', position: 'grid|3', orderNo: 6, showInGrid: false },
        { name: 'PhepThamNien', position: 'grid|3', orderNo: 7, showInGrid: false },
        { name: 'PhepTonNamTruoc', position: 'grid|3', orderNo: 8, showInGrid: false },
        { name: 'SoNgayDaSuDung', position: 'grid|3', orderNo: 9, showInGrid: false },
        { name: 'SoNgayConLai', position: 'grid|3', orderNo: 10, showInGrid: false },
        { name: 'SoNgayPhepTet', position: 'grid|3', orderNo: 11, showInGrid: false },
        { name: 'SoNgayPhepOm', position: 'grid|3', orderNo: 12, showInGrid: false },
        { name: 'GhiChu', position: 'grid|6', orderNo: 13, showInGrid: false }
      ]
    }
  }));
})();
