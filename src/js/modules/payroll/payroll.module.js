(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_PayrollFrm',
    base: 'dynamic-crud',
    config: {
    FormName: 'WA_PayrollFrm',
    PrimaryKey: 'DocumentID',
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn chứng từ lương để xem chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết bảng lương nào cho nhân viên này',
    SplitLayoutDetailWidth: '950px',
    ModalWidth: '960px',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã/tên nhân viên hoặc số chứng từ...',
    DetailTabs: [
      {
        label: 'Chi tiết bảng lương',
        api: 'API_Payroll_Detail',
        filterField: 'DocumentID',
        fields: ['Code', 'Mota', 'SoTien', 'Notes'],
        headers: {
          Code: 'Mã',
          Mota: 'Khoản mục',
          SoTien: 'Số tiền',
          Notes: 'Ghi chú'
        }
      }
    ]
    }
  }));
})();

