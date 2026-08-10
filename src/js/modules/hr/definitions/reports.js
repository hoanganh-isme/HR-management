(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.reports = definitions.reports || {};

  /*
   * Read-only report module definitions for HR Management:
   * 1. WA_BaoCaoNhanSuReport  - Báo cáo nhân sự
   * 2. WA_BaoCaoLuongReport   - Báo cáo lương
   * 3. WA_BaoCaoNghiPhepReport - Báo cáo nghỉ phép
   */

  var currentYear = new Date().getFullYear();
  var defaultFromDate = currentYear + '-01-01';
  var defaultToDate = new Date().toISOString().split('T')[0];

  definitions.reports['WA_BAOCAONHANSUREPORT'] = {
    FormName: 'WA_BaoCaoNhanSuReport',
    PrimaryKey: 'PersonID',
    ReadOnlyReport: true,
    DynamicResultColumns: true,
    MetadataSource: 'FIELD_SYNC_V2',
    RefreshV2MetadataOnLoad: true,
    SelectableRows: false,
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    SearchPlaceholder: 'Tìm theo Mã NV, Tên NV, CMND, Số HĐ...',
    ReportFilters: [
      {
        name: 'Template',
        label: 'Chọn mẫu báo cáo',
        renderRule: 'sl',
        options: [
          { value: '', label: 'Báo cáo nhân sự (Tất cả)' },
          { value: 'HR_BaoCaoNhanSuNVNReport', label: 'Báo cáo nhân sự NVN (Việt Nam)' },
          { value: 'HR_BaoCaoNhanSuNNNReport', label: 'Báo cáo nhân sự NNN (Nước ngoài)' },
          { value: 'HR_BaoCaoNhanSuThieuHDReport', label: 'Báo cáo nhân sự thiếu HĐLĐ' },
          { value: 'HR_BaoCaoNhanSuThieuBHReport', label: 'Báo cáo nhân sự thiếu BHXH' }
        ],
        dataSource: 'STATIC:|Báo cáo nhân sự (Tất cả),HR_BaoCaoNhanSuNVNReport|Báo cáo nhân sự NVN,HR_BaoCaoNhanSuNNNReport|Báo cáo nhân sự NNN,HR_BaoCaoNhanSuThieuHDReport|Báo cáo nhân sự thiếu HĐLĐ,HR_BaoCaoNhanSuThieuBHReport|Báo cáo nhân sự thiếu BH',
        defaultValue: '',
        submit: true
      },
      {
        name: 'FromDate',
        label: 'Từ ngày',
        renderRule: 'd',
        type: 'date',
        defaultValue: defaultFromDate,
        submit: true
      },
      {
        name: 'ToDate',
        label: 'Đến ngày',
        renderRule: 'd',
        type: 'date',
        defaultValue: defaultToDate,
        submit: true
      },
      {
        name: 'BranchID1',
        label: 'Chi nhánh',
        renderRule: 'sl',
        dataSource: 'CF_BranchListFrm',
        valueField: 'BranchID',
        displayField: 'BranchName'
      }
    ]
  };

  definitions.reports['WA_BAOCAOLUONGREPORT'] = {
    FormName: 'WA_BaoCaoLuongReport',
    PrimaryKey: 'Số TT',
    ReadOnlyReport: true,
    DynamicResultColumns: true,
    MetadataSource: 'FIELD_SYNC_V2',
    RefreshV2MetadataOnLoad: true,
    SelectableRows: false,
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    ReportFilters: [
      {
        name: 'PeriodID',
        label: 'Kỳ lương',
        renderRule: 'sl',
        dataSource: 'SY_Period',
        valueField: 'PeriodID',
        displayField: 'PeriodID',
        autoSelect: 'closest-period',
        submit: true
      },
      {
        name: 'BranchID1',
        label: 'Chi nhánh',
        renderRule: 'sl',
        dataSource: 'CF_BranchListFrm',
        valueField: 'BranchID',
        displayField: 'BranchName'
      },
      {
        name: 'PhongBan',
        label: 'Bộ phận',
        renderRule: 'sl',
        dataSource: 'HR_DepartmentListTbl',
        valueField: 'PhongBan',
        displayField: 'PhongBan'
      }
    ]
  };

  definitions.reports['WA_BAOCAONGHIPHEPREPORT'] = {
    FormName: 'WA_BaoCaoNghiPhepReport',
    PrimaryKey: 'TT',
    ReadOnlyReport: true,
    DynamicResultColumns: true,
    MetadataSource: 'FIELD_SYNC_V2',
    RefreshV2MetadataOnLoad: true,
    SelectableRows: false,
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    ReportFilters: [
      {
        name: 'PeriodID',
        label: 'Kỳ báo cáo',
        renderRule: 'sl',
        dataSource: 'SY_Period',
        valueField: 'PeriodID',
        displayField: 'PeriodID',
        autoSelect: 'closest-period',
        submit: true
      },
      {
        name: 'BranchID1',
        label: 'Chi nhánh',
        renderRule: 'sl',
        dataSource: 'CF_BranchListFrm',
        valueField: 'BranchID',
        displayField: 'BranchName'
      }
    ]
  };

})(window);
