(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.contract = definitions.contract || {};
    definitions.contract['WA_HOPDONGLAODONGFRM'] = {
    FormName: 'WA_HopDongLaoDongFrm',
    PrimaryKey: 'MaHopDong',
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn hợp đồng lao động để xem chi tiết',
    SplitLayoutEmptyText: 'Không có phụ cấp nào trong hợp đồng này',
    SplitLayoutDetailWidth: '960px',
    ModalWidth: '1020px',
    FilterKeywordLabel: 'Tìm nhanh',
    SearchPlaceholder: 'Nhập mã hợp đồng hoặc tên nhân viên...',
    AllowDblClickToView: true,
    HideDetailTabsInModal: false,
    HideBulkAddBtn: true,
    RowNameField: 'MaHopDong',

    // ── Bộ lọc thanh toolbar ─────────────────────────────────
    Filters: [
      {
        id: 'NamLap',
        label: 'Năm lập',
        type: 'select',
        dataSource: 'API_HopDongLaoDong_NamLap'
      },
      {
        id: 'BranchID',
        label: 'Chi nhánh',
        type: 'select',
        dataSource: 'CF_BranchListFrm'
      },
      {
        id: 'LoaiHD',
        label: 'Loại HD',
        type: 'select',
        dataSource: 'API_HopDongLaoDong_LoaiHD'
      }
    ],

    // ── Schema cục bộ (fallback khi backend chưa config UI dictionary) ───
    // Format field: { name, label, required, showInAdd, showInEdit, isReadOnlyEdit, position, orderNo, renderRule, dataSource }
    LocalFormSchema: [
      // --- Thông tin tiêu đề (Hiển thị trong list) ---
      { name: 'MaHopDong', label: 'Mã hợp đồng', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: true, position: 'grid', orderNo: 1 },
      { name: 'NamLap', label: 'Năm lập', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 2 },
      { name: 'PersonID', label: 'Mã nhân viên', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: true, position: 'grid', orderNo: 3, renderRule: 'sl', dataSource: 'HR_PersonTbl' },
      { name: 'PersonName', label: 'Họ tên', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 4 },
      { name: 'LoaiHopDong', label: 'Loại hợp đồng', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 5, renderRule: 'sl', dataSource: 'STATIC:Không thời hạn|Không thời hạn,Có thời hạn|Có thời hạn' },
      { name: 'LoaiHD', label: 'Loại HD', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 6 },
      { name: 'NgayKyHopDong', label: 'Ngày ký HĐ', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 7, renderRule: 'dt' },
      { name: 'NgayCoHieuLuc', label: 'Ngày có hiệu lực', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 8, renderRule: 'dt' },
      { name: 'NgayHetHieuLuc', label: 'Ngày hết hiệu lực', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 9, renderRule: 'dt' },
      // --- Thông tin chi tiết HĐ ---
      { name: 'ThoiGianLamViec', label: 'Thời gian làm việc', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 10 },
      { name: 'ThoiGianThuViec', label: 'Thử việc (tháng)', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 11 },
      { name: 'NguoiKy', label: 'Người ký', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 12 },
      { name: 'ChucVuNguoiKy', label: 'Chức vụ người ký', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 13 },
      { name: 'ChucDanhChuyenMonHD', label: 'Chức danh chuyên môn', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 14 },
      // --- Lương & Phụ cấp ---
      { name: 'LuongCoBan', label: 'Lương cơ bản', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 15, renderRule: 'n' },
      { name: 'MucDong', label: 'Mức đóng BH', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 16, renderRule: 'n' },
      { name: 'LoaiTien', label: 'Loại tiền', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 17 },
      { name: 'HinhThucTraLuong', label: 'Hình thức trả lương', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 18 },
      // --- Điều kiện làm việc ---
      { name: 'DiaDiemLamViec', label: 'Địa điểm làm việc', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 19 },
      { name: 'PhuongTien', label: 'Phương tiện đi làm', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 20 },
      { name: 'PersonStatus', label: 'Trạng thái nhân viên', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 21, renderRule: 'sl', dataSource: 'API_ComboPersonStatus' },
      // --- CCCD / Địa chỉ ---
      { name: 'CMND', label: 'Số CCCD/CMND', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 22 },
      { name: 'CMNDNgayCap', label: 'Ngày cấp CCCD', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 23, renderRule: 'dt' },
      { name: 'CMNDNoiCap', label: 'Nơi cấp CCCD', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 24 },
      { name: 'DiaChiThuongTru', label: 'Địa chỉ thường trú', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 25 },
      // --- Nội dung ---
      { name: 'NoiDung', label: 'Nội dung hợp đồng', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'form', orderNo: 26 },
      // --- Audit fields (chỉ grid, ẩn form) ---
      { name: 'UserCreate', label: 'Người tạo', required: false, showInAdd: false, showInEdit: false, isReadOnlyEdit: true, position: 'grid', orderNo: 27 },
      { name: 'DateCreate', label: 'Ngày tạo', required: false, showInAdd: false, showInEdit: false, isReadOnlyEdit: true, position: 'grid', orderNo: 28, renderRule: 'dt' }
    ],

    // Cấu hình ghi đè lên SY_FormatFields từ Database
    fieldOverrides: {
      PersonStatus: { renderRule: 'sl', dataSource: 'API_ComboPersonStatus' }
    },

    // ── DetailFormFields: hiển thị trong panel split-detail bên phải ─────
    DetailFormFields: [
      { name: 'MaHopDong', label: 'Mã hợp đồng' },
      { name: 'NamLap', label: 'Năm lập' },
      { name: 'PersonID', label: 'Mã nhân viên' },
      { name: 'PersonName', label: 'Họ tên' },
      { name: 'LoaiHopDong', label: 'Loại hợp đồng' },
      { name: 'LoaiHD', label: 'Loại HD' },
      { name: 'NgayKyHopDong', label: 'Ngày ký HĐ', format: 'date' },
      { name: 'NgayCoHieuLuc', label: 'Ngày có hiệu lực', format: 'date' },
      { name: 'NgayHetHieuLuc', label: 'Ngày hết hiệu lực', format: 'date' },
      { name: 'ThoiGianLamViec', label: 'Thời gian làm việc' },
      { name: 'ThoiGianThuViec', label: 'Thử việc (tháng)' },
      { name: 'NguoiKy', label: 'Người ký' },
      { name: 'ChucVuNguoiKy', label: 'Chức vụ người ký' },
      { name: 'ChucDanhChuyenMonHD', label: 'Chức danh chuyên môn' },
      { name: 'LuongCoBan', label: 'Lương cơ bản', format: 'money' },
      { name: 'MucDong', label: 'Mức đóng BH', format: 'money' },
      { name: 'LoaiTien', label: 'Loại tiền' },
      { name: 'HinhThucTraLuong', label: 'Hình thức trả lương' },
      { name: 'DiaDiemLamViec', label: 'Địa điểm làm việc' },
      { name: 'PhuongTien', label: 'Phương tiện đi làm' },
      { name: 'PersonStatusName', label: 'Trạng thái NV' },
      { name: 'CMND', label: 'Số CCCD/CMND' },
      { name: 'CMNDNgayCap', label: 'Ngày cấp CCCD', format: 'date' },
      { name: 'CMNDNoiCap', label: 'Nơi cấp CCCD' },
      { name: 'DiaChiThuongTru', label: 'Địa chỉ thường trú' },
      { name: 'NoiDung', label: 'Nội dung hợp đồng' }
    ],

    // ── Tab chi tiết phụ cấp trong hợp đồng ─────────────────────────────
    DetailTabs: [
      {
        label: 'Phụ cấp trong hợp đồng',
        api: 'API_HopDongLaoDong_ChiTiet',
        filterField: 'MaHopDong',
        editable: true,
        duplicateField: 'MaPhuCap',
        readOnlyFields: ['TenPhuCap'],
        customButtons: [
          {
            id: 'btn-multi-select-phucap',
            label: 'Chọn nhiều phụ cấp',
            icon: 'checklist',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var lookupPayload = { List: 'WA_BangPhuCapFrm', Func: 'View', Keyword: '' };
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách phụ cấp...', 'info', 0);

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || AppConfig.apiGateway, lookupPayload).then(function (res) {
                if (loadingMsg) loadingMsg.close();
                var dataList = res.list || res.records || [];
                UIControls.utils.showMultiSelectGridModal({
                  title: 'Chọn phụ cấp',
                  dataList: dataList,
                  ctx: ctx,
                  keyField: 'MaPhuCap',
                  headers: ['Mã phụ cấp', 'Tên phụ cấp', 'Tiền PC', 'PC Ngày', 'PC Tháng', 'Ghi chú'],
                  fields: ['MaPhuCap', 'TenPhuCap', 'TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'GhiChu'],
                  mapRow: function (rowData) {
                    var newRow = {};
                    newRow[ctx.tabDef.filterField] = ctx.row[ctx.MODULE_CONFIG.PrimaryKey] || '';
                    newRow['MaPhuCap'] = rowData.MaPhuCap;
                    newRow['TenPhuCap'] = rowData.TenPhuCap;
                    newRow['TienPhuCap'] = rowData.TienPhuCap;
                    newRow['TienPhuCapNgay'] = rowData.TienPhuCapNgay;
                    newRow['TienPhuCapThang'] = rowData.TienPhuCapThang;
                    newRow['GhiChu'] = rowData.GhiChu || '';
                    return newRow;
                  }
                });
              }).catch(function (err) {
                if (loadingMsg) loadingMsg.close();
                if (typeof UIToast !== 'undefined') UIToast.show('Lỗi khi tải danh sách', 'error');
                else alert('Lỗi khi tải danh sách');
              });
            }
          }
        ],
        fields: ['MaPhuCap', 'TenPhuCap', 'TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'GhiChu'],
        lookupConfig: {
          MaPhuCap: {
            headers: ['Mã PC', 'Tên phụ cấp', 'PC ngày', 'PC tháng'],
            colFilterIndex: 0,
            apiList: 'WA_BangPhuCapFrm',
            getPayload: function () { return { List: 'WA_BangPhuCapFrm', Func: 'View' }; },
            mapData: function (rowData, gridRow, isSearch) {
              var getV = function (keys, idx) {
                if (Array.isArray(rowData)) return rowData[idx] != null ? rowData[idx] : '';
                for (var i = 0; i < keys.length; i++) {
                  if (rowData[keys[i]] !== undefined && rowData[keys[i]] !== null) return rowData[keys[i]];
                }
                for (var k in rowData) {
                  var lk = k.toLowerCase();
                  for (var j = 0; j < keys.length; j++) {
                    if (lk === keys[j].toLowerCase() && rowData[k] !== null) return rowData[k];
                  }
                }
                return '';
              };

              if (isSearch) {
                return [
                  getV(['MaPhuCap'], 0),
                  getV(['TenPhuCap'], 1),
                  getV(['TienPhuCapNgay'], 3),
                  getV(['TienPhuCapThang'], 4),
                  getV(['TienPhuCap'], -1) || 0
                ];
              }

              gridRow.TenPhuCap = getV(['TenPhuCap'], 1);
              gridRow.TienPhuCapNgay = getV(['TienPhuCapNgay'], 2) || 0; // Notice index 2 in returned array
              gridRow.TienPhuCapThang = getV(['TienPhuCapThang'], 3) || 0;
              gridRow.TienPhuCap = getV(['TienPhuCap'], 4) || 0;

              ['TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'TienPhuCap'].forEach(function (fName) {
                if (!gridRow._tr) return;
                var td = gridRow._tr.querySelector('td[data-field="' + fName + '"]');
                if (td) {
                  var inp = td.querySelector('input');
                  if (inp) inp.value = gridRow[fName];
                }
              });
            }
          }
        },
        headers: {
          MaPhuCap: 'Mã phụ cấp',
          TenPhuCap: 'Tên phụ cấp',
          TienPhuCap: 'Tiền phụ cấp',
          TienPhuCapNgay: 'PC theo ngày',
          TienPhuCapThang: 'PC theo tháng',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Tài liệu đính kèm',
        type: 'attachments',
        api: 'API_HopDongLaoDong_Attach',
        primaryKey: 'UserAutoID',
        filterField: 'MaHopDong',
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
