(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.attendance = definitions.attendance || {};
    definitions.attendance['WA_TIMESHEETDAYFRM'] = {
    FormName: 'WA_TimeSheetDayFrm',
    PrimaryKey: 'UserAutoID',
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    HidePrintBtn: true
  };
  definitions.attendance['WA_CALAMVIECFRM'] = {
    FormName: 'WA_CaLamViecFrm',
    PrimaryKey: 'SapCaID',
    ModalWidth: '860px',
    // Nút Sắp ca tự động nằm trên thanh thao tác (cạnh Lưu thay đổi/Sửa)
    // Hoạt động ở cả chế độ Xem và Sửa
    customFooterButtons: [
      {
        label: 'Sắp ca tự động',
        icon: 'auto_fix_high',
        className: 'btn-outline-primary',
        onClick: function (ctx) {
          var tuNgay = '';
          var denNgay = '';
          
          if (ctx.isEdit) {
            var elTu = ctx.body ? ctx.body.querySelector('[name="TuNgay"]') : null;
            var elDen = ctx.body ? ctx.body.querySelector('[name="DenNgay"]') : null;
            tuNgay = elTu ? elTu.value : '';
            denNgay = elDen ? elDen.value : '';
          } else {
            tuNgay = ctx.row && ctx.row.TuNgay ? (typeof UIUtils !== 'undefined' ? UIUtils.formatDate(ctx.row.TuNgay) : ctx.row.TuNgay) : '';
            denNgay = ctx.row && ctx.row.DenNgay ? (typeof UIUtils !== 'undefined' ? UIUtils.formatDate(ctx.row.DenNgay) : ctx.row.DenNgay) : '';
          }

          var msg = 'Bạn có chắc chắn muốn chạy sắp ca tự động';
          if (tuNgay && denNgay) {
            msg += ' từ ngày <b>' + tuNgay + '</b> đến ngày <b>' + denNgay + '</b>?';
          } else {
            msg += '?';
          }

          if (ctx.isEdit) {
            msg += '<br><br><span style="color: #d97706;"><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">info</span> <i>Lưu ý: Dữ liệu chưa lưu (bao gồm cả nhân viên chi tiết) sẽ tự động được lưu trước khi chạy sắp ca.</i></span>';
          }

          if (typeof window.ConfirmModal !== 'undefined') {
            window.ConfirmModal.show({
              title: 'Xác nhận Sắp ca tự động',
              message: msg,
              confirmText: 'Xác nhận',
              confirmClass: 'btn-primary',
              onConfirm: function() {
                 _proceedSapCa();
              }
            });
          } else {
            // Fallback nếu ConfirmModal không tồn tại
            var plainMsg = msg.replace(/<[^>]*>?/gm, '');
            if (confirm(plainMsg)) _proceedSapCa();
          }

          function _proceedSapCa() {
            if (ctx.isEdit) {
              // Lắng nghe sự kiện lưu thành công để chạy SP
              var saveHandler = function(e) {
                if (e.detail && e.detail.formName === 'WA_CaLamViecFrm') {
                  document.removeEventListener('dynamicFormSaved', saveHandler);
                  // Lấy ID mới sau khi lưu (nếu là thêm mới) hoặc ID cũ
                  var newSapCaID = e.detail.data ? e.detail.data.SapCaID : (ctx.row ? ctx.row.SapCaID : '');
                  window.SapCaTuDong_ByID(newSapCaID, ctx.btnSave); // ctx.btnSave có thể truyền null nếu muốn
                }
              };
              document.addEventListener('dynamicFormSaved', saveHandler);
              
              // Tự động gọi hàm lưu của Engine
              if (ctx.btnSave) {
                ctx.btnSave.click();
              } else {
                 if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không tìm thấy nút Lưu để lưu dữ liệu');
              }
            } else {
               // Đang ở chế độ xem, chạy SP luôn
               var currentID = ctx.row ? ctx.row.SapCaID : '';
               window.SapCaTuDong_ByID(currentID, null);
            }
          }
        }
      }
    ],
    DetailTabs: [
      {
        label: 'Nhân viên',
        api: 'API_CaLamViec_NhanVien',
        filterField: 'SapCaID',
        editable: true,
        customButtons: [
          {
            id: 'btn-chon-nhanvien',
            label: 'Chọn nhiều nhân viên',
            icon: 'group_add',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách nhân viên...', 'info', 0);

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', {
                List: 'HR_PersonTbl',
                Func: 'View',
                Keyword: ''
              }).then(function (res) {
                if (loadingMsg) loadingMsg.close();
                var rawList = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                // Chuẩn hóa thành object nếu API trả về mảng phẳng
                var dataList = rawList.map(function (r) {
                  if (Array.isArray(r)) {
                    return { PersonID: r[0] || '', PersonName: r[1] || '', PhongBan: r[2] || '', TitleName: r[3] || '' };
                  }
                  return r;
                });
                _showNhanVienModal(dataList, ctx);
              }).catch(function () {
                if (loadingMsg) loadingMsg.close();
                if (typeof UIToast !== 'undefined') UIToast.show('Lỗi khi tải danh sách nhân viên', 'error');
              });

              function _showNhanVienModal(dataList, ctx) {
                UIControls.utils.showMultiSelectGridModal({
                  title: 'Chọn nhân viên',
                  dataList: dataList,
                  ctx: ctx,
                  keyField: 'PersonID',
                  headers: ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ', 'Cảnh báo'],
                  fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', '_warning_'],
                  onRowRender: function (rData, isDuplicate) {
                    var warningText = isDuplicate ? 'Đã có trên form' : '';
                    return {
                      warningText: warningText,
                      warningStyle: warningText ? 'color: red;' : ''
                    };
                  },
                  onConfirm: function (selectedRows) {
                    var added = 0;
                    selectedRows.forEach(function (rowData) {
                      var newRow = {};
                      newRow[ctx.tabDef.filterField] = ctx.row[ctx.MODULE_CONFIG.PrimaryKey] || '';
                      newRow['PersonID'] = rowData.PersonID || '';
                      newRow['PersonName'] = rowData.PersonName || '';
                      newRow['PhongBan'] = rowData.PhongBan || '';
                      newRow['GhiChu'] = '';
                      ctx.panel._currentRows.push(newRow);
                      added++;
                    });
                    if (added > 0) {
                      if (typeof ctx.renderGrid === 'function') ctx.renderGrid(ctx.tabDef, ctx.panel);
                      if (typeof UIToast !== 'undefined') UIToast.show('Đã thêm ' + added + ' nhân viên', 'success');
                    }
                  }
                });
              }
            }
          }
        ],
        lookupConfig: {
          PersonID: {
            headers: ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ'],
            colFilterIndex: 0,
            apiList: 'HR_PersonTbl',
            getPayload: function () {
              return {};
            },
            mapData: function (d) {
              return [d.PersonID || '', d.PersonName || '', d.PhongBan || '', d.TitleName || ''];
            }
          }
        },
        fields: ['PersonID', 'PersonName', 'PhongBan', 'GhiChu'],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ Tên',
          PhongBan: 'Bộ phận',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Bảng ca chi tiết',
        api: 'API_CaLamViec_ChiTiet',
        filterField: 'SapCaID',
        fields: ['PersonID', 'PersonName', 'NgayLamViec', 'ShiftID', 'ShiftName', 'TrangThaiThucTe'],
        headers: {
          PersonID: 'Mã NV',
          PersonName: 'Họ Tên',
          NgayLamViec: 'Ngày làm việc',
          ShiftID: 'Ca',
          ShiftName: 'Tên ca',
          TrangThaiThucTe: 'Trạng thái'
        }
      }
    ],
    FormFields: [
      // Dòng 1: Tên bảng ca, Sắp ca, Nút
      { name: 'TenBangCa', position: 'grid|4' },
      { name: 'SapCaID', position: 'grid|4' },
      { name: 'btnSapCaTuDong', position: 'grid|4', renderRule: 'html', html: '<button type="button" class="btn btn-outline-primary" style="margin-top:28px;width:100%;" onclick="window.SapCaTuDong()"><span class="material-symbols-outlined" style="vertical-align:middle;">auto_fix_high</span> Sắp ca tự động</button>' },
      // Dòng 2: Từ ngày, Đến ngày
      { name: 'TuNgay', position: 'grid|6' },
      { name: 'DenNgay', position: 'grid|6' },
      // Dòng 3: Thứ 2 -> Chủ nhật (Checkboxes)
      { name: 'Thu2', position: 'grid|1-7' },
      { name: 'Thu3', position: 'grid|1-7' },
      { name: 'Thu4', position: 'grid|1-7' },
      { name: 'Thu5', position: 'grid|1-7' },
      { name: 'Thu6', position: 'grid|1-7' },
      { name: 'Thu7', position: 'grid|1-7' },
      { name: 'ChuNhat', position: 'grid|1-7' },
      // Dòng 4: Shift Comboboxes
      { name: 'ShiftIDThu2', position: 'grid|1-7' },
      { name: 'ShiftIDThu3', position: 'grid|1-7' },
      { name: 'ShiftIDThu4', position: 'grid|1-7' },
      { name: 'ShiftIDThu5', position: 'grid|1-7' },
      { name: 'ShiftIDThu6', position: 'grid|1-7' },
      { name: 'ShiftIDThu7', position: 'grid|1-7' },
      { name: 'ShiftIDChuNhat', position: 'grid|1-7' }
    ]
  };
})(window);

