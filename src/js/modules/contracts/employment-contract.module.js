(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_HopDongLaoDongFrm',
    base: 'dynamic-crud',
    config: {
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

    // Cấu hình ghi đè lên SY_FormatFields từ Database
    fieldOverrides: {
      PersonStatus: { renderRule: 'sl', dataSource: 'API_ComboPersonStatus' }
    },

    // ── Tab chi tiết phụ cấp trong hợp đồng ─────────────────────────────
    DetailTabs: [
      {
        label: 'Phụ cấp trong hợp đồng',
        api: 'API_HopDongLaoDong_ChiTiet',
        filterField: 'MaHopDong',
        editable: true,
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

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', lookupPayload).then(function (res) {
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
    }
  }));
})();

