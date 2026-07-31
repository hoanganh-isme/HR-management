(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.attendance = definitions.attendance || {};

  var branchShiftLookup = {
    renderRule: 'sl',
    dataSource: 'HR_ShiftListCNFrm|3',
    dependsOn: 'BranchID',
    headers: ['Mã ca', 'Tên ca', 'Loại ca'],
    sourceFields: ['ShiftID', 'ShiftName', 'LoaiCa'],
    valueField: 'ShiftID',
    displayField: 'ShiftID',
    valueIndex: 0,
    displayIndex: 0
  };

  function branchShiftField(name, label, orderNo) {
    return Object.assign({
      name: name,
      label: label,
      position: 'grid|1-7',
      orderNo: orderNo
    }, branchShiftLookup);
  }

  definitions.attendance['WA_TIMESHEETDAYFRM'] = {
    FormName: 'WA_TimeSheetDayFrm',
    PrimaryKey: 'UserAutoID',
    ProcessAction: 'hr.timesheet.process',
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    HidePrintBtn: true
  };

  definitions.attendance['WA_CALAMVIECFRM'] = {
    FormName: 'WA_CaLamViecFrm',
    PrimaryKey: 'SapCaID',
    ShiftAction: 'hr.shift.auto',
    ModalWidth: '860px',
    customFooterButtons: [
      {
        label: 'Sắp ca tự động',
        icon: 'auto_fix_high',
        className: 'btn-outline-primary',
        showInAdd: false,
        action: 'hr.shift.auto',
        actionConfig: {
          func: 'HR_CaLamViec_SapCaStp',
          idField: 'SapCaID'
        }
      }
    ],
    DetailTabs: [
      {
        label: 'Nhân viên',
        api: 'API_CaLamViec_NhanVien',
        metadataMode: 'JOIN_RESULT_SET_EDITABLE',
        joinContractKey: 'SHIFT_EMPLOYEES',
        primaryKey: 'UserAutoID',
        hiddenFields: ['UserAutoID', 'SapCaID'],
        filterField: 'SapCaID',
        editable: true,
        duplicateField: 'PersonID',
        readOnlyFields: ['PersonName', 'PhongBan', 'TitleName', 'BranchID'],
        customButtons: [
          {
            id: 'btn-chon-nhanvien',
            label: 'Chọn nhiều nhân viên',
            icon: 'group_add',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách nhân viên...', 'info', 0);

              var _closeMsg = function (msg) {
                if (!msg) return;
                if (typeof msg.close === 'function') msg.close();
                else if (typeof UIToast !== 'undefined' && typeof UIToast.hide === 'function') UIToast.hide(msg);
                else if (typeof Alert !== 'undefined' && typeof Alert.hide === 'function') Alert.hide(msg);
                else if (typeof msg.remove === 'function') msg.remove();
              };

              var uName = (window.AppSession && typeof AppSession.getUserName === 'function' && AppSession.getUserName())
                || (window.Auth && typeof window.Auth.getUser === 'function' && window.Auth.getUser() && window.Auth.getUser().username)
                || localStorage.getItem('username') || sessionStorage.getItem('username') || 'admin';

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || AppConfig.apiGateway, {
                List: 'HR_PersonTbl',
                Func: 'View',
                Keyword: '',
                UserName: uName,
                User: uName
              }).then(function (res) {
                _closeMsg(loadingMsg);
                var rawList = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                var dataList = rawList.map(function (r) {
                  if (Array.isArray(r)) {
                    return { PersonID: r[0] || '', PersonName: r[1] || '', PhongBan: r[2] || '', TitleName: r[3] || '' };
                  }
                  return r;
                });
                _showNhanVienModal(dataList, ctx);
              }).catch(function () {
                _closeMsg(loadingMsg);
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
                      newRow['TitleName'] = rowData.TitleName || '';
                      newRow['BranchID'] = rowData.BranchID || '';
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
            valueFields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID'],
            getPayload: function () {
              return {};
            },
            mapData: function (d) {
              if (Array.isArray(d)) {
                return [
                  d[0] || '',
                  d[1] || '',
                  d[2] || '',
                  d[3] || '',
                  d[4] || ''
                ];
              }
              return [
                d.PersonID || '',
                d.PersonName || '',
                d.PhongBan || d.BoPhan || '',
                d.TitleName || d.ChucVu || '',
                d.BranchID || ''
              ];
            }
          }
        },
        fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', 'GhiChu'],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ Tên',
          PhongBan: 'Bộ phận',
          TitleName: 'Chức vụ',
          TitleName: 'Chức vụ',
          BranchID: 'Chi nhánh',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Bảng ca chi tiết',
        api: 'API_CaLamViec_ChiTiet',
        filterField: 'SapCaID',
        metadataMode: 'JOIN_RESULT_SET_READONLY',
        joinContractKey: 'SHIFT_DETAIL',
        fields: ['PersonID', 'PersonName', 'NgayLamViec', 'ShiftID', 'ShiftName', 'TrangThaiThucTe'],
        headers: {
          PersonID: 'Mã NV',
          PersonName: 'Họ Tên',
          NgayLamViec: 'Ngày làm việc',
          TitleName: 'Chức vụ',
          ShiftID: 'Ca',
          ShiftName: 'Tên ca',
          TrangThaiThucTe: 'Trạng thái'
        }
      }
    ],
    FormFields: [
      // Dòng 1: Tên bảng ca. Nút nghiệp vụ được render từ customFooterButtons.
      { name: 'TenBangCa', position: 'grid|12' },
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

  /*
   * Hồ sơ hành vi cho form do Master Table sinh ra.
   *
   * Menu/DB vẫn quyết định API, khóa nối, nhãn và thứ tự tab. Khai báo này
   * chỉ nói cho engine biết control nào là lookup, bit nào là checkbox và
   * action nghiệp vụ nào cần chạy. Khi chuyển DB không phải tạo lại UI.
   */
  definitions.attendance['WA_CALAMVIECCNFRM'] = {
    FormName: 'WA_CaLamViecCNFrm',
    PrimaryKey: 'SapCaID',
    BranchPolicy: 'BRANCH_SCOPED',
    BranchColumn: 'BranchID',
    HideAddNewInDropdowns: true,
    StrictLookupFields: [
      'BranchID',
      'ShiftIDThu2',
      'ShiftIDThu3',
      'ShiftIDThu4',
      'ShiftIDThu5',
      'ShiftIDThu6',
      'ShiftIDThu7',
      'ShiftIDChuNhat'
    ],
    ShiftAction: 'hr.shift.auto',
    customFooterButtons: [
      {
        label: 'Sắp ca tự động',
        icon: 'auto_fix_high',
        className: 'btn-primary',
        showInAdd: false,
        action: 'hr.shift.auto',
        actionConfig: {
          list: 'WA_CaLamViecCNFrm',
          func: 'HR_SapCaChiNhanh_Process_Stp',
          idField: 'SapCaID',
          leaveMessage: 'Đơn nghỉ phép đã duyệt, chưa hủy sẽ được procedure hiện có đưa vào bảng ca.'
        }
      }
    ],
    DetailTabs: [
      {
        label: 'Nhân viên',
        api: 'API_CaLamViecChiNhanh_NhanVien',
        metadataMode: 'JOIN_RESULT_SET_EDITABLE',
        joinContractKey: 'SHIFT_EMPLOYEES',
        primaryKey: 'UserAutoID',
        hiddenFields: ['UserAutoID', 'SapCaID', 'SapCa'],
        filterField: 'SapCaID',
        editable: true,
        duplicateField: 'PersonID',
        readOnlyFields: ['PersonName', 'PhongBan', 'TitleName', 'BranchID'],
        customButtons: [
          {
            id: 'btn-chon-nhanvien-cn',
            label: 'Chọn nhiều nhân viên',
            icon: 'group_add',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách nhân viên...', 'info', 0);

              var _closeMsg = function (msg) {
                if (!msg) return;
                if (typeof msg.close === 'function') msg.close();
                else if (typeof UIToast !== 'undefined' && typeof UIToast.hide === 'function') UIToast.hide(msg);
                else if (typeof Alert !== 'undefined' && typeof Alert.hide === 'function') Alert.hide(msg);
                else if (typeof msg.remove === 'function') msg.remove();
              };

              var branchFilter = (ctx.row && ctx.row.BranchID) || (ctx.MODULE_CONFIG && ctx.MODULE_CONFIG.currentBranch) || '';
              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || AppConfig.apiGateway, {
                List: 'HR_PersonTbl',
                Func: 'View',
                Keyword: '',
                BranchID: branchFilter
              }).then(function (res) {
                _closeMsg(loadingMsg);
                var rawList = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                var dataList = rawList.map(function (r) {
                  if (Array.isArray(r)) {
                    return { PersonID: r[0] || '', PersonName: r[1] || '', PhongBan: r[2] || '', TitleName: r[3] || '', BranchID: r[4] || '' };
                  }
                  return r;
                });
                _showNhanVienModal(dataList, ctx);
              }).catch(function () {
                _closeMsg(loadingMsg);
                if (typeof UIToast !== 'undefined') UIToast.show('Lỗi khi tải danh sách nhân viên', 'error');
              });

              function _showNhanVienModal(dataList, ctx) {
                UIControls.utils.showMultiSelectGridModal({
                  title: 'Chọn nhân viên chi nhánh',
                  dataList: dataList,
                  ctx: ctx,
                  keyField: 'PersonID',
                  headers: ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ', 'Chi nhánh', 'Cảnh báo'],
                  fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', '_warning_'],
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
                      newRow['TitleName'] = rowData.TitleName || '';
                      newRow['BranchID'] = rowData.BranchID || ctx.row['BranchID'] || '';
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
            headers: ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ', 'Chi nhánh'],
            colFilterIndex: 0,
            apiList: 'HR_PersonTbl',
            valueFields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID'],
            getPayload: function () {
              return {};
            },
            mapData: function (d) {
              if (Array.isArray(d)) {
                return [d[0] || '', d[1] || '', d[2] || '', d[3] || '', d[4] || ''];
              }
              return [d.PersonID || '', d.PersonName || '', d.PhongBan || d.BoPhan || '', d.TitleName || d.ChucVu || '', d.BranchID || ''];
            }
          }
        },
        fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', 'GhiChu'],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ tên',
          PhongBan: 'Bộ phận',
          TitleName: 'Chức vụ',
          BranchID: 'Chi nhánh',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Bảng ca chi tiết',
        api: 'API_CaLamViecChiNhanh_ChiTiet',
        filterField: 'SapCaID',
        metadataMode: 'JOIN_RESULT_SET_READONLY',
        joinContractKey: 'SHIFT_DETAIL',
        fields: ['PersonID', 'PersonName', 'NgayLamViec', 'ShiftID', 'TrangThaiThucTe', 'HinhThucNghi', 'PhongBan', 'BranchID', 'GhiChu'],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ tên',
          NgayLamViec: 'Ngày làm việc',
          TrangThaiThucTe: 'Trạng thái thực tế',
          ShiftID: 'Ca',
          HinhThucNghi: 'Hình thức nghỉ',
          PhongBan: 'Bộ phận',
          BranchID: 'Chi nhánh',
          GhiChu: 'Ghi chú'
        }
      }
    ],
    FormFields: [
      {
        name: 'SapCaID',
        label: 'Mã bảng ca',
        showInAdd: false,
        showInEdit: false,
        isReadOnlyAdd: true,
        isReadOnlyEdit: true,
        orderNo: 1
      },
      { name: 'SapCa', label: 'Sắp ca', required: true, position: 'grid|3', orderNo: 2 },
      { name: 'TenBangCa', label: 'Tên bảng ca', required: true, position: 'grid|3', orderNo: 3 },
      { name: 'TuNgay', label: 'Từ ngày', required: true, renderRule: 'd', position: 'grid|3', orderNo: 4 },
      { name: 'DenNgay', label: 'Đến ngày', required: true, renderRule: 'd', position: 'grid|3', orderNo: 5 },
      {
        name: 'BranchID',
        label: 'Chi nhánh',
        required: true,
        renderRule: 'sl',
        dataSource: 'CF_BranchListFrm',
        position: 'grid|4',
        orderNo: 6
      },
      { name: 'GhiChu', label: 'Ghi chú', position: 'grid|4', orderNo: 7 },
      { name: 'IsActive', label: 'Đang hoạt động', renderRule: 'c', position: 'grid|4', orderNo: 8 },
      { name: 'Thu2', label: 'T2', renderRule: 'sw', position: 'grid|1-7', orderNo: 9 },
      { name: 'Thu3', label: 'T3', renderRule: 'sw', position: 'grid|1-7', orderNo: 10 },
      { name: 'Thu4', label: 'T4', renderRule: 'sw', position: 'grid|1-7', orderNo: 11 },
      { name: 'Thu5', label: 'T5', renderRule: 'sw', position: 'grid|1-7', orderNo: 12 },
      { name: 'Thu6', label: 'T6', renderRule: 'sw', position: 'grid|1-7', orderNo: 13 },
      { name: 'Thu7', label: 'T7', renderRule: 'sw', position: 'grid|1-7', orderNo: 14 },
      { name: 'ChuNhat', label: 'CN', renderRule: 'sw', position: 'grid|1-7', orderNo: 15 },
      branchShiftField('ShiftIDThu2', 'Ca T2', 16),
      branchShiftField('ShiftIDThu3', 'Ca T3', 17),
      branchShiftField('ShiftIDThu4', 'Ca T4', 18),
      branchShiftField('ShiftIDThu5', 'Ca T5', 19),
      branchShiftField('ShiftIDThu6', 'Ca T6', 20),
      branchShiftField('ShiftIDThu7', 'Ca T7', 21),
      branchShiftField('ShiftIDChuNhat', 'Ca CN', 22)
    ],
    DetailTabBehaviors: [
      {
        matchIndex: 1,
        matchTableName: 'HR_SapCaNhanVienChiNhanhTbl',
        matchDatasetKey: 'SHIFT_EMPLOYEES',
        requiredField: 'PersonID',
        duplicateField: 'PersonID',
        defaultsFromMaster: {
          SapCa: 'SapCa',
          BranchID: 'BranchID'
        },
        readOnlyFields: ['PersonName', 'PhongBan', 'TitleName', 'BranchID'],
        customButtons: [
          {
            id: 'btn-chon-nhanvien-cn-beh',
            label: 'Chọn nhiều nhân viên',
            icon: 'group_add',
            className: 'btn-outline-success',
            onClick: function (ctx) {
              var loadingMsg = null;
              if (typeof UIToast !== 'undefined') loadingMsg = UIToast.show('Đang tải danh sách nhân viên...', 'info', 0);

              var _closeMsg = function (msg) {
                if (!msg) return;
                if (typeof msg.close === 'function') msg.close();
                else if (typeof UIToast !== 'undefined' && typeof UIToast.hide === 'function') UIToast.hide(msg);
                else if (typeof Alert !== 'undefined' && typeof Alert.hide === 'function') Alert.hide(msg);
                else if (typeof msg.remove === 'function') msg.remove();
              };

              var branchFilter = (ctx.row && ctx.row.BranchID) || (ctx.MODULE_CONFIG && ctx.MODULE_CONFIG.currentBranch) || '';
              var uName = (window.AppSession && typeof AppSession.getUserName === 'function' && AppSession.getUserName())
                || (window.Auth && typeof window.Auth.getUser === 'function' && window.Auth.getUser() && window.Auth.getUser().username)
                || localStorage.getItem('username') || sessionStorage.getItem('username') || 'admin';

              ApiClient.post(ctx.MODULE_CONFIG.ApiSearch || AppConfig.apiGateway, {
                List: 'HR_PersonTbl',
                Func: 'View',
                Keyword: '',
                UserName: uName,
                User: uName
              }).then(function (res) {
                _closeMsg(loadingMsg);
                var rawList = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                var dataList = rawList.map(function (r) {
                  if (!r) return { PersonID: '', PersonName: '', PhongBan: '', TitleName: '', BranchID: '' };
                  if (Array.isArray(r)) {
                    return { PersonID: r[0] || '', PersonName: r[1] || '', PhongBan: r[2] || '', TitleName: r[3] || '', BranchID: r[4] || '' };
                  }
                  function _g(obj, keys) {
                    for (var i = 0; i < keys.length; i++) {
                      var k = keys[i];
                      if (obj[k] !== undefined && obj[k] !== null) return obj[k];
                      var lk = String(k).toLowerCase();
                      for (var p in obj) {
                        if (p.toLowerCase() === lk && obj[p] !== undefined && obj[p] !== null) return obj[p];
                      }
                    }
                    return '';
                  }
                  return {
                    PersonID: _g(r, ['PersonID', 'personID', 'personid', 'ID', 'MaNV']),
                    PersonName: _g(r, ['PersonName', 'personName', 'personname', 'HoTen', 'ObjectName']),
                    PhongBan: _g(r, ['PhongBan', 'phongBan', 'phongban', 'BoPhan', 'Department']),
                    TitleName: _g(r, ['TitleName', 'titleName', 'titlename', 'ChucVu', 'Position']),
                    BranchID: _g(r, ['BranchID', 'branchID', 'branchid', 'ChiNhanh'])
                  };
                });
                _showNhanVienModal(dataList, ctx);
              }).catch(function () {
                _closeMsg(loadingMsg);
                if (typeof UIToast !== 'undefined') UIToast.show('Lỗi khi tải danh sách nhân viên', 'error');
              });

              function _showNhanVienModal(dataList, ctx) {
                UIControls.utils.showMultiSelectGridModal({
                  title: 'Chọn nhân viên chi nhánh',
                  dataList: dataList,
                  ctx: ctx,
                  keyField: 'PersonID',
                  headers: ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ', 'Chi nhánh', 'Cảnh báo'],
                  fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', '_warning_'],
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
                      newRow['TitleName'] = rowData.TitleName || '';
                      newRow['BranchID'] = rowData.BranchID || ctx.row['BranchID'] || '';
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
            apiList: 'HR_PersonTbl',
            headers: ['Mã nhân viên', 'Họ tên', 'Bộ phận', 'Chi nhánh'],
            sourceFields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID'],
            valueFields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID'],
            valueIndex: 0,
            displayIndex: 0,
            strictSelection: true,
            masterFilters: { BranchID: 'BranchID' }
          },
          ShiftID: {
            apiList: 'HR_ShiftListCNFrm',
            headers: ['Chi nhánh', 'Mã ca', 'Tên ca', 'Loại ca'],
            sourceFields: ['BranchID', 'ShiftID', 'ShiftName', 'LoaiCa'],
            valueFields: ['BranchID', 'ShiftID'],
            valueIndex: 1,
            displayIndex: 1,
            strictSelection: true,
            masterFilters: { BranchID: 'BranchID' }
          }
        },
        fieldLinks: {
          PersonName: {
            apiList: 'WA_DonXinNghiPhepFrm',
            targetModule: 'WA_DonXinNghiPhepFrm',
            primaryKey: 'DocumentID',
            editable: true,
            allowAdd: true,
            keywordSource: 'PersonID',
            filterMap: { PersonID: 'PersonID', BranchID: 'BranchID' },
            defaultMap: { PersonID: 'PersonID', PersonName: 'PersonName', BranchID: 'BranchID' },
            title: 'Đơn xin nghỉ phép của nhân viên',
            buttonTitle: 'Xem / sửa đơn nghỉ phép',
            addButtonTitle: 'Tạo đơn nghỉ phép',
            editButtonTitle: 'Sửa',
            emptyText: 'Chưa có đơn nghỉ phép phù hợp. Bạn có thể tạo mới cho nhân viên này.',
            icon: 'event_note',
            columns: [
              { name: 'DocumentID', label: 'Số chứng từ' },
              { name: 'DocumentDate', label: 'Ngày chứng từ' },
              { name: 'PersonID', label: 'Mã nhân viên' },
              { name: 'PersonName', label: 'Họ tên' },
              { name: 'LyDo', label: 'Lý do' },
              { name: 'StatusName', label: 'Trạng thái' }
            ]
          }
        },
        fieldTypes: {
          Thu2: 'boolean',
          Thu3: 'boolean',
          Thu4: 'boolean',
          Thu5: 'boolean',
          Thu6: 'boolean',
          Thu7: 'boolean',
          ChuNhat: 'boolean'
        },
        fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', 'BranchID', 'GhiChu'],
        headers: {
          SapCa: 'Sắp ca',
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ tên',
          PhongBan: 'Bộ phận',
          BranchID: 'Chi nhánh',
          ShiftID: 'Ca',
          Thu2: 'T2',
          Thu3: 'T3',
          Thu4: 'T4',
          Thu5: 'T5',
          Thu6: 'T6',
          Thu7: 'T7',
          ChuNhat: 'CN',
          GhiChu: 'Ghi chú'
        }
      },
      {
        matchTableName: 'HR_SapCaChiNhanhChiTietTbl',
        matchDatasetKey: 'SHIFT_DETAIL',
        forceReadOnly: true,
        fields: [
          'PersonID', 'PersonName', 'NgayLamViec', 'TrangThaiThucTe',
          'ShiftID', 'HinhThucNghi', 'PhongBan', 'BranchID', 'GhiChu'
        ],
        headers: {
          PersonID: 'Mã nhân viên',
          PersonName: 'Họ tên',
          NgayLamViec: 'Ngày làm việc',
          TrangThaiThucTe: 'Trạng thái thực tế',
          ShiftID: 'Ca',
          HinhThucNghi: 'Hình thức nghỉ',
          PhongBan: 'Bộ phận',
          BranchID: 'Chi nhánh',
          GhiChu: 'Ghi chú'
        }
      }
    ]
  };
})(window);
