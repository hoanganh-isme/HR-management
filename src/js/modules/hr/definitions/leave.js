(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.leave = definitions.leave || {};
  definitions.leave['WA_QUANLYNGHIPHEPNAMFRM'] = {
    FormName: 'WA_QuanLyNghiPhepNamFrm',
    PrimaryKey: 'PersonID',
    ModalWidth: '960px',
    hideDetailTabsInEditMode: true,
    UseSplitLayout: true,
    SplitLayoutSelectText: 'Vui lòng chọn nhân viên để xem chi tiết',
    DetailTabs: [
      {
        label: 'Chi tiết phép năm',
        api: 'API_QuanLyNghiPhepNam_ChiTiet',
        filterField: 'PersonID',
        fields: [
          'Nam', 'SoNgay', 'GhiChu', 'PhepThamNien', 'SoNgayDaSuDung',
          'SoNgayConLai', 'PhepTonNamTruoc', 'SoNgayPhepTet', 'SoNgayPhepOm', 'NgayCapNhat'
        ],
        headers: {
          Nam: 'Năm',
          SoNgay: 'Số ngày',
          GhiChu: 'Ghi chú',
          PhepThamNien: 'Phép thâm niên',
          SoNgayDaSuDung: 'Số ngày đã sử dụng',
          SoNgayConLai: 'Số ngày còn lại',
          PhepTonNamTruoc: 'Phép tồn năm trước',
          SoNgayPhepTet: 'Số ngày phép tết',
          SoNgayPhepOm: 'Số ngày phép ốm',
          NgayCapNhat: 'Ngày cập nhật'
        }
      }
    ]
  };

  definitions.leave['WA_DONXINNGHIPHEPFRM'] = {
    FormName: 'WA_DonXinNghiPhepFrm',
    PrimaryKey: 'DocumentID',
    RowNameField: 'DocumentID',
    ModalWidth: '980px',
    FilterKeywordLabel: 'Số chứng từ / nhân viên',
    SearchPlaceholder: 'Nhập số chứng từ, mã hoặc tên nhân viên...',
    Filters: [
      {
        id: 'BranchID',
        label: 'Chi nhánh',
        type: 'select',
        dataSource: 'CF_BranchListFrm'
      }
    ],
    // Fallback cục bộ chỉ dùng khi API metadata không trả SY_FormatFields.
    // HRMetadataAdapter luôn ưu tiên contract trong DB trước các khai báo này.
    FormFields: [
      { name: 'DocumentID', label: 'Số chứng từ', required: true, isReadOnlyEdit: true, position: 'grid', orderNo: 1 },
      { name: 'DocumentDate', label: 'Ngày chứng từ', required: true, renderRule: 'd', position: 'grid', orderNo: 2 },
      { name: 'PersonID', label: 'Mã nhân viên', required: true, renderRule: 'sl', dataSource: 'WA_PersonFullFrm|4', position: 'grid', orderNo: 3 },
      { name: 'PersonName', label: 'Họ tên', isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid', orderNo: 4 },
      { name: 'LyDo', label: 'Lý do nghỉ', required: true, position: 'grid', orderNo: 5 },
      { name: 'Notes', label: 'Ghi chú', position: 'grid', orderNo: 6 },
      { name: 'StatusID', label: 'Trạng thái duyệt', renderRule: 'sl', dataSource: 'SELECT StatusID as ID, StatusName as Name FROM HR_StatusTbl', isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid', orderNo: 7 },
      { name: 'StatusName', label: 'Trạng thái', isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid', orderNo: 8 },
      { name: 'NgayXinPhep', label: 'Ngày xin phép', renderRule: 'd', isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid', orderNo: 9 },
      { name: 'NguoiXinPhep', label: 'Người xin phép', isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'grid', orderNo: 10 },
      { name: 'IsAnCom', label: 'Có ăn cơm', renderRule: 'c', position: 'grid', orderNo: 11 },
      { name: 'IsXinHuy', label: 'Xin hủy đơn', renderRule: 'c', position: 'grid', orderNo: 12 }
    ],
    DetailTabs: [
      {
        label: 'Chi tiết ngày nghỉ',
        api: 'API_HR_NghiPhep_ChiTiet',
        primaryKey: 'DetailID',
        filterField: 'DocumentID',
        editable: true,
        fields: ['HinhThucNghi', 'NghiTuNgay', 'DenNgay', 'SoNgayNghi', 'Notes'],
        headers: {
          HinhThucNghi: 'Hình thức nghỉ',
          NghiTuNgay: 'Từ ngày',
          DenNgay: 'Đến ngày',
          SoNgayNghi: 'Số ngày nghỉ',
          Notes: 'Ghi chú'
        }
      },
      {
        label: 'Tài liệu đính kèm',
        type: 'attachments',
        api: 'API_HR_NghiPhep_Attach',
        saveApi: 'API_HR_NghiPhep_Attach_Save',
        saveFunc: 'Execute',
        filterField: 'DocumentID',
        fields: ['FileName', 'FileType', 'STT', 'FileSize', 'Content'],
        headers: {
          FileName: 'Tên tệp',
          FileType: 'Loại tệp',
          STT: 'Số thứ tự',
          FileSize: 'Kích thước'
        }
      }
    ]
  };
})(window);
