(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.payroll = definitions.payroll || {};
    definitions.payroll['WA_KINHPHICONGDOANFRM'] = {
    FormName: 'WA_KinhPhiCongDoanFrm',
    PrimaryKey: 'UserAutoID'
  };
  definitions.payroll['WA_LUONGKHOANFRM'] = {
    FormName: 'WA_LuongKhoanFrm',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã hoặc tên nhân viên...'
  };

  definitions.payroll['WA_BANGPHUCAPFRM'] = {
    FormName: 'WA_BangPhuCapFrm',
    PrimaryKey: 'MaPhuCap',
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn loại phụ cấp để xem danh sách nhân viên',
    SplitLayoutEmptyText: 'Không có nhân viên nào được hưởng loại phụ cấp này',
    SplitLayoutDetailWidth: '800px',
    ModalWidth: '960px',
    FilterKeywordLabel: 'Mã/Tên phụ cấp',
    SearchPlaceholder: 'Nhập mã hoặc tên phụ cấp...',
    DetailTabs: [
      {
        label: 'Nhân viên hưởng phụ cấp',
        api: 'API_BangPhuCap_Detail',
        filterField: 'MaPhuCap',
        editable: true,
        fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'GhiChu', 'NoiDungPhuCap'],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ Tên',
          PhongBan: 'Bộ phận',
          TitleName: 'Chức vụ',
          GhiChu: 'Ghi chú',
          NoiDungPhuCap: 'Nội dung phụ cấp'
        }
      }
    ]
  };
  definitions.payroll['WA_BAOHIEMFRM'] = {
    FormName: 'WA_BaoHiemFrm',
    PrimaryKey: 'DocumentID',
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn chứng từ đóng bảo hiểm để xem chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết bảo hiểm nào cho chứng từ này',
    SplitLayoutDetailWidth: '960px',
    ModalWidth: '1020px',
    FilterKeywordLabel: 'Tìm nhanh',
    SearchPlaceholder: 'Nhập số chứng từ hoặc ghi chú...',
    RowNameField: 'DocumentID',
    Filters: [
      {
        id: 'BranchID',
        label: 'Chi nhánh',
        type: 'select',
        dataSource: 'CF_BranchListFrm'
      }
    ],
    LocalFormSchema: [
      { name: 'DocumentID', label: 'Số chứng từ', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: true, position: 'grid', orderNo: 1 },
      { name: 'DocumentDate', label: 'Ngày lập', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 2, renderRule: 'dt' },
      { name: 'BranchID', label: 'Chi nhánh', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 3, renderRule: 'sl', dataSource: 'CF_BranchListFrm' },
      { name: 'PeriodKeyID', label: 'Kỳ đóng bảo hiểm', required: true, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 4, renderRule: 'sl', dataSource: 'HR_BangThamSoTbl' },
      { name: 'LoaiBaoHiem', label: 'Loại bảo hiểm', required: false, showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'form', orderNo: 5 },
      { name: 'PeriodID', label: 'Kỳ', required: false, showInAdd: true, showInEdit: true, isReadOnlyAdd: true, isReadOnlyEdit: true, position: 'form', orderNo: 6 },
      { name: 'Notes', label: 'Ghi chú', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 7 }
    ],
    DetailTabs: [
      {
        label: 'Chi tiết đóng bảo hiểm',
        api: 'API_BaoHiem_Detail',
        filterField: 'DocumentID',
        editable: true,
        customButtons: [
          {
            id: 'btn-multi-select',
            label: 'Chọn nhiều nhân viên',
            icon: 'checklist',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var bNode = document.querySelector('.df-master-wrapper input[name="BranchID"], .split-master-detail-container input[name="BranchID"]');
              var branchID = bNode ? bNode.value : '';
              var pkNode = document.querySelector('.df-master-wrapper input[name="PeriodKeyID"], .split-master-detail-container input[name="PeriodKeyID"]');
              var loaiBaoHiem = (pkNode && pkNode.value && pkNode.value.indexOf('_') > -1) ? pkNode.value.split('_')[1] : '';
              var dNode = document.querySelector('.df-master-wrapper input[name="DocumentID"], .split-master-detail-container input[name="DocumentID"]');
              var docID = dNode ? dNode.value : (ctx.row[ctx.MODULE_CONFIG.PrimaryKey] || '');

              if (!branchID || !loaiBaoHiem) {
                if (typeof UIToast !== 'undefined') UIToast.show('Vui lòng chọn Chi nhánh và Mã số (Kỳ/Loại BH) trước.', 'warning');
                else alert('Vui lòng chọn Chi nhánh và Mã số (Kỳ/Loại BH) trước.');
                return;
              }

              var lookupPayload = {
                List: 'WA_BaoHiemFrm_PersonID',
                Func: 'View',
                Keyword: '',
                JsonData: JSON.stringify({ BranchID: branchID, LoaiBaoHiem: loaiBaoHiem, DocumentID: docID })
              };
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách nhân viên...', 'info', 0);

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', lookupPayload).then(function (res) {
                if (loadingMsg) loadingMsg.close();
                var dataList = res.list || res.records || [];
                _showMultiSelectModal(dataList, ctx);
              }).catch(function (err) {
                if (loadingMsg) loadingMsg.close();
                if (typeof UIToast !== 'undefined') UIToast.show('Lỗi khi tải danh sách', 'error');
                else alert('Lỗi khi tải danh sách');
              });

              function _showMultiSelectModal(dataList, ctx) {
                var pNode = document.querySelector('.df-master-wrapper input[name="PeriodID"], .split-master-detail-container input[name="PeriodID"]');
                var lNode = document.querySelector('.df-master-wrapper input[name="LoaiBaoHiem"], .split-master-detail-container input[name="LoaiBaoHiem"]');
                var masterPeriodID = pNode ? pNode.value : (ctx.row.PeriodID || '');
                var masterLoaiBaoHiem = lNode ? lNode.value : (ctx.row.LoaiBaoHiem || '');

                UIControls.utils.showMultiSelectGridModal({
                  title: 'Chọn nhân viên tham gia bảo hiểm',
                  dataList: dataList,
                  ctx: ctx,
                  keyField: 'PersonID',
                  headers: ['Mã NV', 'Họ Tên', 'Chức danh', 'Bộ phận', 'Mức đóng', 'Cảnh báo'],
                  fields: ['PersonID', 'PersonName', 'ChucDanhChuyenMon', 'PhongBan', 'MucDong', '_warning_'],
                  onRowRender: function (rData, isDuplicate) {
                    var warningText = rData.CanhBao || (isDuplicate ? 'Đã có trên form' : '');
                    return {
                      warningText: warningText,
                      warningStyle: warningText ? 'color: red;' : ''
                    };
                  },
                  onConfirm: function (selectedRows) {
                    var added = 0;
                    var calcCache = {};
                    var promises = [];
                    var tempRows = [];

                    selectedRows.forEach(function (rowData) {
                      var newRow = {};
                      newRow[ctx.tabDef.filterField] = ctx.row[ctx.MODULE_CONFIG.PrimaryKey] || '';
                      newRow['PersonID'] = rowData.PersonID;
                      newRow['PersonName'] = rowData.PersonName;
                      newRow['ChucDanhChuyenMon'] = rowData.ChucDanhChuyenMon;
                      newRow['PhongBan'] = rowData.PhongBan;
                      var mDong = parseFloat(rowData.MucDong) || 0;
                      newRow['MucDong'] = mDong;
                      newRow['PeriodID'] = masterPeriodID;
                      newRow['LoaiBaoHiem'] = masterLoaiBaoHiem;

                      tempRows.push(newRow);

                      if (mDong > 0) {
                        if (!calcCache[mDong]) {
                          calcCache[mDong] = 'pending';
                          var p = ApiClient.post('/api/API_Gateway_Router', {
                            List: 'WA_BaoHiemFrm_Calculate',
                            Func: 'View',
                            JsonData: JSON.stringify({ PeriodID: masterPeriodID, LoaiBaoHiem: masterLoaiBaoHiem, MucDong: mDong })
                          }).then(function (res) {
                            var data = res.list || res.records || [];
                            if (data && data.length > 0) {
                              var resRow = data[0];
                              calcCache[mDong] = {
                                MucDongBHXHNLD: resRow.MucDongBHXHNLD || 0,
                                MucDongBHXHNSDLD: resRow.MucDongBHXHNSDLD || 0,
                                MucDongBHYTNLD: resRow.MucDongBHYTNLD || 0,
                                MucDongBHYTNSDLD: resRow.MucDongBHYTNSDLD || 0,
                                MucDongBHTNNLD: resRow.MucDongBHTNNLD || 0,
                                MucDongBHTNNSDLD: resRow.MucDongBHTNNSDLD || 0
                              };
                            } else {
                              calcCache[mDong] = null;
                            }
                          }).catch(function () {
                            calcCache[mDong] = null;
                          });
                          promises.push(p);
                        }
                      }
                    });

                    var finalizeAdd = function () {
                      tempRows.forEach(function (row) {
                        if (row.MucDong > 0 && calcCache[row.MucDong] && calcCache[row.MucDong] !== 'pending') {
                          Object.assign(row, calcCache[row.MucDong]);
                        }
                        ctx.panel._currentRows.push(row);
                        added++;
                      });

                      if (added > 0) {
                        if (typeof ctx.renderGrid === 'function') ctx.renderGrid(ctx.tabDef, ctx.panel);
                        if (typeof UIToast !== 'undefined') UIToast.show('Đã thêm ' + added + ' nhân viên', 'success');
                      }
                    };

                    if (promises.length > 0) {
                      if (typeof UIToast !== 'undefined') UIToast.show('Đang tính toán...', 'info');
                      Promise.all(promises).then(finalizeAdd).catch(finalizeAdd);
                    } else {
                      finalizeAdd();
                    }
                  }
                });
              }
            }
          }
        ],
        fields: ['PersonID', 'PersonName', 'ChucDanhChuyenMon', 'PhongBan', 'MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD', 'GhiChu'],
        lookupConfig: {
          PersonID: {
            headers: ['STT', 'Mã NV', 'Họ Tên', 'Bộ phận', 'Mức đóng', 'Cảnh báo'],
            colFilterIndex: 1,
            apiList: 'WA_BaoHiemFrm_PersonID',
            getPayload: function () {
              var bNode = document.querySelector('.df-master-wrapper input[name="BranchID"], .split-master-detail-container input[name="BranchID"]');
              var pkNode = document.querySelector('.df-master-wrapper input[name="PeriodKeyID"], .split-master-detail-container input[name="PeriodKeyID"]');
              var dNode = document.querySelector('.df-master-wrapper input[name="DocumentID"], .split-master-detail-container input[name="DocumentID"]');

              var branchID = bNode ? bNode.value : '';
              var loaiBaoHiem = (pkNode && pkNode.value && pkNode.value.indexOf('_') > -1) ? pkNode.value.split('_')[1] : '';
              var docID = dNode ? dNode.value : '';

              return {
                JsonData: JSON.stringify({ BranchID: branchID, LoaiBaoHiem: loaiBaoHiem, DocumentID: docID })
              };
            },
            mapData: function (d) {
              return [String(d.STT || ''), d.PersonID || '', d.PersonName || '', d.PhongBan || '', String(d.MucDong || 0), d.CanhBao || ''];
            }
          }
        },
        fieldEvents: {
          MucDong: {
            onChange: function (val, currRow, row, tr) {
              var v = parseFloat(val) || 0;
              currRow['MucDong'] = v;
              var pNode = document.querySelector('.df-master-wrapper input[name="PeriodID"], .split-master-detail-container input[name="PeriodID"]');
              var lNode = document.querySelector('.df-master-wrapper input[name="LoaiBaoHiem"], .split-master-detail-container input[name="LoaiBaoHiem"]');
              var masterPeriodID = pNode ? pNode.value : (row.PeriodID || '');
              var masterLoaiBaoHiem = lNode ? lNode.value : (row.LoaiBaoHiem || '');
              var payload = {
                List: 'WA_BaoHiemFrm_Calculate',
                Func: 'View',
                JsonData: JSON.stringify({ PeriodID: masterPeriodID, LoaiBaoHiem: masterLoaiBaoHiem, MucDong: v })
              };
              ApiClient.post('/api/API_Gateway_Router', payload).then(function (res) {
                var data = res.list || res.records || [];
                if (data && data.length > 0) {
                  var resRow = data[0];
                  var cols = ['MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD'];
                  cols.forEach(function (col) {
                    currRow[col] = resRow[col] !== undefined ? resRow[col] : 0;
                    var colTd = tr.querySelector('td[data-field="' + col + '"]');
                    if (colTd) {
                      var colInp = colTd.querySelector('input');
                      if (colInp) colInp.value = currRow[col];
                    }
                  });
                }
              });
            }
          }
        },
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ Tên',
          ChucDanhChuyenMon: 'Chuyên môn',
          PhongBan: 'Bộ phận',
          MucDong: 'Mức đóng',
          MucDongBHXHNLD: 'BHXH Người LD',
          MucDongBHXHNSDLD: 'BHXH Công Ty',
          MucDongBHYTNLD: 'BHYT Người LD',
          MucDongBHYTNSDLD: 'BHYT Công Ty',
          MucDongBHTNNLD: 'BHTN Người LD',
          MucDongBHTNNSDLD: 'BHTN Công Ty',
          GhiChu: 'Ghi chú'
        }
      }
    ]
  };
  definitions.payroll['WA_PAYROLLFRM'] = {
    FormName: 'WA_PayrollFrm',
    PrimaryKey: 'DocumentID',
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn chứng từ lương để xem chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết bảng lương nào cho nhân viên này',
    SplitLayoutDetailWidth: '950px',
    ModalWidth: '960px',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã/tên nhân viên hoặc số chứng từ...',
    DetailFormFields: [
      { name: 'DocumentID', label: 'Số chứng từ' },
      { name: 'PeriodID', label: 'Kỳ' },
      { name: 'PersonID', label: 'Mã nhân viên' },
      { name: 'PersonName', label: 'Họ Tên' },
      { name: 'PhongBan', label: 'Bộ phận' },
      { name: 'LuongCoBan', label: 'Lương cơ bản', format: 'money' },
      { name: 'LuongTong', label: 'Lương Tổng', format: 'money' },
      { name: 'TienBuTru', label: 'Tiền trừ', format: 'money' },
      { name: 'SoNguoiPhuThuoc', label: 'Số người phụ' },
      { name: 'MucDong', label: 'Mức đóng', format: 'money' },
      { name: 'TongLuong', label: 'Tổng Lương', format: 'money' },
      { name: 'IsBH', label: 'Đóng BH', format: 'boolean' },
      { name: 'IsHuuTri', label: 'Hưu trí', format: 'boolean' }
    ],
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
  };
})(window);

