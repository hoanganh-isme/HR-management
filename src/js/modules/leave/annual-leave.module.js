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
      fieldOverrides: {
        PersonID: {
          label: 'Mã nhân viên', required: true, showInAdd: true, showInEdit: true,
          isReadOnlyAdd: false, isReadOnlyEdit: true, renderRule: 'sl',
          dataSource: 'WA_PersonFullFrm|4', valueField: 'PersonID', labelField: 'PersonName',
          allowCustomValue: false, position: 'grid|3'
        },
        PersonName: { label: 'Họ tên', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3' },
        PhongBan: { label: 'Bộ phận', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3' },
        TitleName: { label: 'Chức vụ', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3' }
      },
      FormFields: [
        { name: 'PersonID', label: 'Mã nhân viên', required: true, showInAdd: true, showInEdit: true, isReadOnlyAdd: false, isReadOnlyEdit: true, renderRule: 'sl', dataSource: 'WA_PersonFullFrm|4', valueField: 'PersonID', labelField: 'PersonName', allowCustomValue: false, position: 'grid|3', orderNo: 1 },
        { name: 'PersonName', label: 'Họ tên', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3', orderNo: 2 },
        { name: 'PhongBan', label: 'Bộ phận', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3', orderNo: 3 },
        { name: 'TitleName', label: 'Chức vụ', showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid|3', orderNo: 4 },
        { name: 'Nam', position: 'grid|3', orderNo: 5 },
        { name: 'SoNgay', position: 'grid|3', orderNo: 6 },
        { name: 'PhepThamNien', position: 'grid|3', orderNo: 7 },
        { name: 'PhepTonNamTruoc', position: 'grid|3', orderNo: 8 },
        { name: 'SoNgayDaSuDung', position: 'grid|3', orderNo: 9 },
        { name: 'SoNgayConLai', position: 'grid|3', orderNo: 10 },
        { name: 'SoNgayPhepTet', position: 'grid|3', orderNo: 11 },
        { name: 'SoNgayPhepOm', position: 'grid|3', orderNo: 12 },
        { name: 'GhiChu', position: 'grid|6', orderNo: 13 }
      ],
      WizardSteps: [
        { label: 'Thông tin nhân viên', icon: 'badge', fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName'] },
        { label: 'Phép năm', icon: 'calendar_month', fields: ['Nam', 'SoNgay', 'PhepThamNien', 'PhepTonNamTruoc', 'SoNgayDaSuDung', 'SoNgayConLai', 'SoNgayPhepTet', 'SoNgayPhepOm', 'GhiChu'] }
      ]
    }
  }));
})();
