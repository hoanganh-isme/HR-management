/**
 * Bootstraps the application layout & interactions
 */
document.addEventListener('DOMContentLoaded', function () {
  // 0. Global Auth Logic
  window.logoutApp = function () {
    // Gọi API đăng xuất (background)
    if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
      ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).catch(function () { });
    }

    if (window.APP_SETTINGS) APP_SETTINGS.removeStored('user'); else localStorage.removeItem('pmql_user');
    if (typeof ApiClient !== 'undefined' && ApiClient.deleteCookie) {
      ApiClient.deleteCookie('auth_token');
    }

    window.location.href = 'login.html';
  };

  // 0.5 Kiểm tra đăng nhập (Auth Guard)
  var token = typeof ApiClient !== 'undefined' && ApiClient.getCookie ? ApiClient.getCookie('auth_token') : null;
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 0.6 Khởi tạo hệ thống Phân quyền (RBAC)
  window.AppPermissions = {
    _cache: null,

    _init: function () {
      try {
        var navCache = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem('pmql_nav_cache')) || 'null');
        var userCache = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', 'null') : localStorage.getItem('pmql_user')) || 'null');

        var isAdmin = (userCache && (userCache.UserGroupID === 'Admin' || userCache.userGroupID === 'Admin'));

        this._cache = {
          isAdmin: isAdmin,
          dict: {}
        };

        if (navCache && navCache.rawRecords) {
          navCache.rawRecords.forEach(function (r) {
            if (r.formName) {
              this._cache.dict[r.formName.toLowerCase()] = r;
            }
          }.bind(this));
        }
      } catch (e) {
        console.error('Error init AppPermissions', e);
      }
    },

    hasPermission: function (formName, action) {
      if (!this._cache) this._init();
      if (!this._cache) return false;

      if (this._cache.isAdmin) return true; // Admin bypass

      if (!formName) return true; // Các module ko định danh thì cho phép qua
      var perm = this._cache.dict[formName.toLowerCase()];
      if (!perm) return false; // Không có trong phân quyền thì tịt

      // action có thể là 'IsAdd', 'IsUpdate', 'IsDelete', 'IsRun', v.v.
      return (perm[action] == 1 || perm[action] === true);
    }
  };
  // 1. Khởi tạo trình quản lý phím tắt
  if (typeof KeyboardManager !== 'undefined') {
    KeyboardManager.init();
  }

  // 2. Khởi tạo Router
  // Cấu hình các form có DetailTabs (Master-Detail)
  window.APP_MODULES = window.APP_MODULES || {};
  window.APP_MODULES['WA_NGUOIDUNGNHOMFRM'] = {
    FormName: 'WA_NguoiDungNhomFrm',
    PrimaryKey: 'UserGroupID',
    TitleAdd: 'Thêm nhóm',
    TitleEdit: 'Sửa nhóm',
    TitleView: 'Chi tiết nhóm'
  };
  window.APP_MODULES['WA_NGUOIDUNGFRM'] = {
    FormName: 'WA_NguoiDungFrm',
    PrimaryKey: 'UserID',
    TitleAdd: 'Thêm người dùng',
    TitleEdit: 'Sửa người dùng',
    TitleView: 'Chi tiết người dùng'
  };
  window.APP_MODULES['WA_TIMESHEETDAYFRM'] = {
    FormName: 'WA_TimeSheetDayFrm',
    PrimaryKey: 'UserAutoID',
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    HidePrintBtn: true
  };
  window.APP_MODULES['WA_CALAMVIECFRM'] = {
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

  window.APP_MODULES['WA_QUANLYNGHIPHEPNAMFRM'] = {
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
  window.APP_MODULES['WA_KINHPHICONGDOANFRM'] = {
    FormName: 'WA_KinhPhiCongDoanFrm',
    PrimaryKey: 'UserAutoID'
  };

  window.APP_MODULES['WA_PERSONFULLFRM'] = {
    FormName: 'WA_PersonFullFrm',
    PrimaryKey: 'PersonID',
    IsFullPageDetail: false,
    isPersonForm: true,
    AttachmentApi: 'API_PersonAttach',
    HideAddNewInDropdowns: true,
    fieldOverrides: {
      PersonID: { isReadOnlyEdit: true, isReadOnlyAdd: true },
      NewPersonID: { isReadOnlyEdit: true, isReadOnlyAdd: true },
      PersonName: { required: true, IsRequired: true },
      PersonStatus: { required: true, IsRequired: true }
    },
    wizardHooks: {
      resolveAutoId: function (branchId, apiUrl, currentUser, cb) {
        var BRANCH_PREFIX_MAP = {
          'COBI': 'COBI', 'DONGDU': 'DD', 'ESTELLA': 'ETL', 'HOANGHAI': 'HH',
          'HUNGVUONG': 'HV', 'NAMVINH': 'NV', 'SGCENTER': 'SGCT',
          'THANHDA': 'TD', 'TRANHUNGDAO': 'THD', 'VANPHONG': 'VP'
        };
        var prefix = BRANCH_PREFIX_MAP[branchId.toUpperCase()] || branchId;
        ApiClient.post(apiUrl, {
          List: 'WA_PersonFullFrm',
          FormName: 'WA_PersonFullFrm',
          Func: 'View',
          Limit: 9999,
          UserName: currentUser,
          JsonData: JSON.stringify({ PersonIDPrefix: prefix })
        }).then(function (res) {
          var list = res.list || res.records || res.data || [];
          var nums = [];
          list.forEach(function (r) {
            var pid = (r.PersonID || r.personID || '').toUpperCase();
            if (!pid.startsWith(prefix.toUpperCase())) return;
            var numStr = pid.substring(prefix.length);
            var n = parseInt(numStr, 10);
            if (!isNaN(n) && n > 0) nums.push(n);
          });
          nums.sort(function (a, b) { return a - b; });
          var next = 1;
          for (var i = 0; i < nums.length; i++) {
            if (nums[i] === next) { next++; }
            else if (nums[i] > next) { break; }
          }
          var nextCode = prefix + String(next).padStart(3, '0');
          cb(nextCode, prefix, null);
        }).catch(function (e) {
          cb(null, prefix, e);
        });
      }
    },
    UseSplitLayout: false,
    SplitLayoutSelectText: 'Vui lòng chọn nhân viên để xem hồ sơ chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết hồ sơ nhân viên',
    SplitLayoutDetailWidth: '950px',
    ModalWidth: '960px',
    HideAddBtn: false,
    HideEditBtn: false,
    HideDeleteBtn: false,
    AllowDblClickToView: true,
    HideDetailTabsInModal: true,
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Tìm kiếm',
    WizardSteps: [
      { label: 'Thông tin công việc', icon: 'work', description: 'Vị trí và phòng ban', fields: ['PersonID', 'PersonName', 'PersonStatus', 'BranchID', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon', 'NgayVaoLam', 'NgayThuViec', 'ShiftID'] },
      { label: 'Thông tin cá nhân', icon: 'contact_page', description: 'Sơ yếu lý lịch & Liên hệ', fields: ['GioiTinh', 'NgaySinh', 'NoiSinh', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'HonNhan', 'PeoplesName', 'ReligionName', 'Nationality', 'DienThoai', 'Email', 'DiaChiThuongTru', 'DiaChiHienNay', 'EducationName', 'CareerName', 'NguoiLienHe', 'MoiQuanHe', 'NguoiLienHeSoDT'] },
      { label: 'Hợp đồng & BHXH', icon: 'description', description: 'Hợp đồng và Bảo hiểm', fields: ['SocialID', 'SocialDate', 'NgayKetThucBH', 'ChamCong', 'SoTheBHYT', 'ThoiGianHuongBHYT', 'HospitalName', 'SoHopDong', 'LoaiHopDong', 'NgayHopDong', 'NgayHetHopDong', 'MaNVChamCong'] },
      { label: 'Tài chính & Khác', icon: 'account_balance', description: 'Ngân hàng & Thông tin phụ', fields: ['BankHolder', 'BankAccountNo', 'BankName', 'BankLocation', 'NewPersonID', 'CardNo', 'ProvineName', 'NgayNghiViec'] },
      { label: 'Xác nhận', icon: 'fact_check', description: 'Kiểm tra thông tin trước khi lưu', fields: [] }
    ],
    Filters: [
      {
        id: 'PersonStatus',
        label: 'Trạng thái nhân sự',
        type: 'select',
        dataSource: 'API_ComboPersonStatus'
      }
    ],
    DetailTabs: [
      {
        label: 'Quá trình làm việc và lương, phụ cấp',
        api: 'API_PersonFull_T1_Salary',
        editable: false,
        filterField: 'PersonID',
        fields: ['TrangThai', 'TuNgay', 'DenNgay', 'MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'GhiChu'],
        headers: {
          TrangThai: 'Trạng thái',
          TuNgay: 'Từ ngày',
          DenNgay: 'Đến ngày',
          MucLuong: 'Mức lương',
          LuongBaoHiem: 'Lương đóng BH',
          PCCongTac: 'PC Công tác',
          PCTrachNhiem: 'PC Trách nhiệm',
          PCKhac: 'Phụ cấp khác',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Khen thưởng - Kỷ luật',
        api: 'API_PersonFull_T3_KTKL',
        editable: false,
        filterField: 'PersonID',
        fields: ['NoiDungKTKL', 'SoNgay', 'GhiChu'],
        headers: {
          NoiDungKTKL: 'Nội dung KTKL',
          SoNgay: 'Số ngày',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Khai báo phép năm',
        api: 'API_PersonFull_T4_NghiPhep',
        editable: false,
        filterField: 'PersonID',
        fields: ['Nam', 'SoNgay', 'PhepThamNien', 'SoNgayDaSuDung', 'SoNgayConLai', 'PhepTonNamTruoc', 'SoNgayPhepTet', 'SoNgayPhepOm', 'NgayCapNhat', 'GhiChu'],
        headers: {
          Nam: 'Năm',
          SoNgay: 'Số ngày',
          PhepThamNien: 'Phép thâm niên',
          SoNgayDaSuDung: 'Đã dùng',
          SoNgayConLai: 'Còn lại',
          PhepTonNamTruoc: 'Phép tồn',
          SoNgayPhepTet: 'Phép Tết',
          SoNgayPhepOm: 'Phép ốm',
          NgayCapNhat: 'Cập nhật',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Gia cảnh & Liên hệ',
        api: 'API_PersonFull_T5_Relation',
        editable: false,
        filterField: 'PersonID',
        fields: ['RelationID', 'PersonRelationName', 'NgaySinh', 'DiaChiThuongTru', 'DiaChiHienNay', 'IsNguoiPhuThuoc', 'GiamTruTuThang', 'GiamTruDenThang'],
        headers: {
          RelationID: 'Mã gia cảnh',
          PersonRelationName: 'Tên thân nhân',
          NgaySinh: 'Ngày sinh',
          DiaChiThuongTru: 'Địa chỉ thường trú',
          DiaChiHienNay: 'Địa chỉ hiện nay',
          IsNguoiPhuThuoc: 'Phụ thuộc',
          GiamTruTuThang: 'Giảm từ',
          GiamTruDenThang: 'Giảm đến'
        }
      },
      {
        label: 'Lịch sử hợp đồng',
        api: 'API_PersonFull_T6_HopDong',
        editable: false,
        filterField: 'PersonID',
        fields: ['MaHopDong', 'PersonName', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'LoaiHopDong', 'LuongCoBan', 'MucDong', 'NoiDung'],
        headers: {
          MaHopDong: 'Mã HĐ',
          PersonName: 'Họ tên',
          NgayKyHopDong: 'Ngày ký',
          NgayCoHieuLuc: 'Ngày hiệu lực',
          NgayHetHieuLuc: 'Ngày hết hạn',
          LoaiHopDong: 'Loại HĐ',
          LuongCoBan: 'Lương cơ bản',
          MucDong: 'Mức đóng',
          NoiDung: 'Nội dung'
        }
      },
      {
        label: 'Lịch sử công tác',
        api: 'API_PersonFull_T7_CongTac',
        editable: false,
        filterField: 'PersonID',
        fields: ['PhongBan', 'TitleName', 'PostionName', 'Quanly', 'ShiftID', 'NgayThayDoi', 'UserName'],
        headers: {
          PhongBan: 'Bộ phận',
          TitleName: 'Chức danh',
          PostionName: 'Vị trí',
          Quanly: 'Quản lý',
          ShiftID: 'Ca làm việc',
          NgayThayDoi: 'Ngày thay đổi',
          UserName: 'Người cập nhật'
        }
      },
      {
        label: 'Lịch sử công việc',
        api: 'API_PersonFull_T8_Log',
        editable: false,
        filterField: 'PersonID',
        fields: ['UserName', 'LogDate', 'BranchID', 'StatusID', 'Notes'],
        headers: {
          UserName: 'Tài khoản',
          LogDate: 'Ngày log',
          BranchID: 'Chi nhánh',
          StatusID: 'Trạng thái',
          Notes: 'Ghi chú'
        }
      },
      {
        label: 'Giấy tờ',
        api: 'API_PersonFull_T9_GiayTo',
        editable: false,
        filterField: 'PersonID',
        fields: ['DocumentID', 'LoaiGiayTo', 'TuNgay', 'DenNgay', 'Notes'],
        headers: {
          DocumentID: 'Mã tài liệu',
          LoaiGiayTo: 'Loại giấy tờ',
          TuNgay: 'Từ ngày',
          DenNgay: 'Đến ngày',
          Notes: 'Ghi chú'
        }
      }
    ]
  };



  window.APP_MODULES['WA_DANHSACHUNGVIENFRM'] = {
    FormName: 'WA_DanhSachUngVienFrm',
    PrimaryKey: 'CandidateID',
    ModalWidth: '960px',
    isCandidateForm: true,
    AttachmentApi: 'API_CandidateAttach',
    useCandidateAttachmentApi: true,
    HideBranchStep: true,
    wizardHooks: {
      resolveAutoId: function (branchId, apiUrl, currentUser, cb) {
        // Sinh mã ứng viên: UV + 6 số ngẫu nhiên theo thời gian
        var candidateId = 'UV' + new Date().getTime().toString().slice(-6);
        cb(candidateId, 'UV', null);
      }
    },
    WizardSteps: [
      { label: 'Thông tin cá nhân', icon: 'contact_page', description: 'Sơ yếu lý lịch', fields: ['CandidateID', 'FullName', 'GioiTinh', 'NgaySinh', 'SoCCCD', 'NgayCap', 'NoiCap', 'TinhTrangHonNhan', 'SoDienThoai', 'Email', 'DiaChiThuongTru', 'DiaChiHienTai', 'LinkedIn'] },
      { label: 'Thông tin ứng tuyển', icon: 'work', description: 'Vị trí và phòng ban', fields: ['ViTriUngTuyen', 'PhongBan', 'NguonUngTuyen', 'NgayUngTuyen', 'MucLuongMongMuon', 'NgayCoTheDiLam'] },
      { label: 'Kỹ năng', icon: 'star', description: 'Chuyên môn & Mềm', fields: ['KyNangChuyenMon', 'KyNangMem', 'NgoaiNgu', 'TinHoc'] },
      { label: 'Đánh giá & Kết quả', icon: 'fact_check', description: 'Nhận xét của HR', fields: ['TrangThaiHR', 'NguoiPhuTrach', 'DiemDanhGia', 'NhanXetHR', 'MucLuongDeXuat', 'KetQuaCuoiCung', 'NgayOnboard', 'GhiChuChung'] }
    ],
    DetailTabs: [
      {
        label: 'Phỏng vấn',
        api: 'API_QuanLyUngVien_PhongVan',
        filterField: 'CandidateID',
        fields: ['VongPhongVan', 'NgayPhongVan', 'NguoiPhongVan', 'KetQuaVong', 'NhanXetChiTiet'],
        headers: {
          VongPhongVan: 'Vòng phỏng vấn',
          NgayPhongVan: 'Ngày Phỏng Vấn',
          NguoiPhongVan: 'Người phỏng vấn',
          KetQuaVong: 'Kết quả phỏng vấn',
          NhanXetChiTiet: 'Nhận xét chi tiết'
        }
      },
      {
        label: 'Kinh nghiệm',
        api: 'API_QuanLyUngVien_KinhNghiem',
        filterField: 'CandidateID',
        fields: ['CongTyCu', 'ViTriCongTac', 'TuThangNam', 'DenThangNam', 'MoTaCongViec'],
        headers: {
          CongTyCu: 'Công ty cũ',
          ViTriCongTac: 'Vị trí công tác',
          TuThangNam: 'Từ ngày',
          DenThangNam: 'Đến ngày',
          MoTaCongViec: 'Mô tả công việc'
        }
      },
      {
        label: 'Học vấn',
        api: 'API_QuanLyUngVien_HocVan',
        filterField: 'CandidateID',
        fields: ['TruongDaoTao', 'ChuyenNganh', 'TuNam', 'DenNam', 'BangCap'],
        headers: {
          TruongDaoTao: 'Trường đào tạo',
          ChuyenNganh: 'Chuyên ngành',
          TuNam: 'Từ năm',
          DenNam: 'Đến năm',
          BangCap: 'Bằng cấp'
        }
      },
      {
        label: 'Chứng chỉ',
        api: 'API_QuanLyUngVien_ChungChi',
        filterField: 'CandidateID',
        fields: ['TenChungChi', 'ToChucCap', 'NgayCap'],
        headers: {
          TenChungChi: 'Tên chứng chỉ',
          ToChucCap: 'Tổ chức cấp',
          NgayCap: 'Ngày cấp'
        }
      }
    ]
  };

  window.APP_MODULES['WA_LUONGKHOANFRM'] = {
    FormName: 'WA_LuongKhoanFrm',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã hoặc tên nhân viên...'
  };

  window.APP_MODULES['WA_BANGPHUCAPFRM'] = {
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

  window.APP_MODULES['WA_BAOHIEMFRM'] = {
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

  window.APP_MODULES['WA_PAYROLLFRM'] = {
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

  window.APP_MODULES['WA_HOPDONGLAODONGFRM'] = {
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
  };


  // Cấu hình Plugin Button "Tạo bảng lương tháng"
  if (!window.FormActionPlugins) window.FormActionPlugins = [];
  window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'payroll_plugin'; });
  window.FormActionPlugins.push({
    id: 'payroll_plugin',
    getExtraButtons: function (formName, getSelected, config, onReload) {
      if (formName !== 'WA_PayrollFrm') return [];
      return [
        {
          text: 'Tạo bảng lương tháng',
          icon: 'calculate',
          type: 'primary',
          onClick: function () {
            if (typeof ApiClient === 'undefined') return;

            var loadingToast = typeof UIToast !== 'undefined' ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;

            ApiClient.post('/api/API_Gateway_Router', {
              List: 'SY_Period',
              Func: 'View',
              Limit: 1000
            }).then(function (res) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);

              var records = res.records || (Array.isArray(res) ? res : []);
              if (records.length === 0) {
                if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Không tìm thấy kỳ lương nào trong hệ thống!');
                return;
              }

              // Sắp xếp kỳ giảm dần
              records.sort(function (a, b) {
                return String(b.PeriodID).localeCompare(String(a.PeriodID));
              });

              var selectOptions = records.map(function (p) {
                return '<option value="' + p.PeriodID + '">' + p.PeriodID + ' (' + (p.PeriodName || p.PeriodID) + ')</option>';
              }).join('');

              var selectHtml =
                '<div style="text-align: left; margin-top: 10px;">' +
                '  <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn kỳ lương cần tính toán:</label>' +
                '  <select id="payroll-process-period" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                selectOptions +
                '  </select>' +
                '</div>';

              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: 'Tạo Bảng Lương Tháng',
                  message: selectHtml,
                  confirmText: 'Tính Lương',
                  confirmClass: 'btn-primary',
                  onConfirm: function () {
                    var selectedPeriod = document.getElementById('payroll-process-period').value;
                    if (!selectedPeriod) return;

                    if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.show(true, 'Đang tính toán bảng lương kỳ ' + selectedPeriod + '...');

                    ApiClient.post('/api/API_Gateway_Router', {
                      List: 'WA_PayRoll_Process_Stp',
                      Func: 'View',
                      JsonData: JSON.stringify({ PeriodID: selectedPeriod })
                    }).then(function (result) {
                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();

                      var resData = Array.isArray(result) ? result[0] : (result.records && result.records[0] ? result.records[0] : result);
                      var code = resData.code !== undefined ? resData.code : (resData.Code !== undefined ? resData.Code : 0);
                      var msg = resData.msg || resData.Msg || resData.message || 'Thành công';

                      if (code == 0) {
                        if (typeof Alert !== 'undefined') Alert.success('Thành công', msg);
                        if (window.currentFilters) {
                          window.currentFilters['PeriodID'] = selectedPeriod;
                        } else {
                          window.currentFilters = { PeriodID: selectedPeriod };
                        }
                        if (typeof onReload === 'function') onReload();
                      } else {
                        if (typeof Alert !== 'undefined') Alert.error('Lỗi tính lương', msg);
                      }
                    }).catch(function (err) {
                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();
                      console.error('Lỗi tính lương:', err);
                      if (typeof Alert !== 'undefined') Alert.error('Lỗi kết nối', err.message || 'Không thể kết nối đến máy chủ.');
                    });
                  }
                });
              }
            }).catch(function (err) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
              console.error('Lỗi tải kỳ lương:', err);
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách kỳ lương.');
            });
          }
        }
      ];
    }
  });

  // Cấu hình Plugin Button "Tạo bảng chấm công" cho trang WA_TimeSheetDayFrm
  if (!window.FormActionPlugins) window.FormActionPlugins = [];
  window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'timesheet_day_plugin'; });
  window.FormActionPlugins.push({
    id: 'timesheet_day_plugin',
    getExtraButtons: function (formName, getSelected, config, onReload) {
      if (formName !== 'WA_TimeSheetDayFrm') return [];
      return [
        {
          text: 'Tạo bảng chấm công',
          icon: 'today',
          type: 'primary',
          onClick: function () {
            if (typeof ApiClient === 'undefined') return;

            var loadingToast = typeof UIToast !== 'undefined' ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;

            ApiClient.post('/api/API_Gateway_Router', {
              List: 'SY_Period',
              Func: 'View',
              Limit: 1000
            }).then(function (res) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);

              var records = res.records || (Array.isArray(res) ? res : []);
              if (records.length === 0) {
                if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Không tìm thấy kỳ chấm công nào trong hệ thống!');
                return;
              }

              // Sắp xếp kỳ giảm dần
              records.sort(function (a, b) {
                return String(b.PeriodID).localeCompare(String(a.PeriodID));
              });

              var selectOptions = records.map(function (p) {
                return '<option value="' + p.PeriodID + '">' + p.PeriodID + ' (' + (p.PeriodName || p.PeriodID) + ')</option>';
              }).join('');

              // Tải thêm danh sách chi nhánh phục vụ việc chọn chi nhánh khi tạo
              ApiClient.post('/api/API_Gateway_Router', {
                List: 'API_DanhSachChiNhanh',
                Func: 'View',
                Limit: 1000
              }).then(function (branchRes) {
                var branches = branchRes.list || branchRes.records || [];
                var branchOptions = '<option value="">-- Tất cả Chi nhánh --</option>';
                if (branches && branches.length > 0) {
                  branchOptions += branches.map(function (b) {
                    return '<option value="' + b.BranchID + '">' + (b.BranchName || b.BranchID) + '</option>';
                  }).join('');
                }

                var selectHtml =
                  '<div style="text-align: left; margin-top: 10px;">' +
                  '  <div class="mb-3">' +
                  '    <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn kỳ chấm công:</label>' +
                  '    <select id="timesheet-process-period" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                  selectOptions +
                  '    </select>' +
                  '  </div>' +
                  '  <div class="mb-2">' +
                  '    <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn chi nhánh:</label>' +
                  '    <select id="timesheet-process-branch" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                  branchOptions +
                  '    </select>' +
                  '  </div>' +
                  '</div>';

                if (typeof ConfirmModal !== 'undefined') {
                  ConfirmModal.show({
                    title: 'Tạo Bảng Chấm Công Hàng Ngày',
                    message: selectHtml,
                    confirmText: 'Tạo Bảng',
                    confirmClass: 'btn-primary',
                    onConfirm: function () {
                      var selectedPeriod = document.getElementById('timesheet-process-period').value;
                      var selectedBranch = document.getElementById('timesheet-process-branch').value;
                      if (!selectedPeriod) return;

                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.show(true, 'Đang tạo bảng chấm công kỳ ' + selectedPeriod + '...');

                      ApiClient.post('/api/API_Gateway_Router', {
                        List: 'WA_TimeSheetDay_Process_Stp',
                        Func: 'View',
                        JsonData: JSON.stringify({ PeriodID: selectedPeriod, BranchID: selectedBranch })
                      }).then(function (result) {
                        if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();

                        var resData = Array.isArray(result) ? result[0] : (result.records && result.records[0] ? result.records[0] : result);
                        var code = resData.code !== undefined ? resData.code : (resData.Code !== undefined ? resData.Code : 0);
                        var msg = resData.msg || resData.Msg || resData.message || 'Thành công';

                        if (code == 0) {
                          if (typeof Alert !== 'undefined') Alert.success('Thành công', msg);
                          if (window.currentFilters) {
                            window.currentFilters['PeriodID'] = selectedPeriod;
                            window.currentFilters['BranchID'] = selectedBranch;
                          } else {
                            window.currentFilters = { PeriodID: selectedPeriod, BranchID: selectedBranch };
                          }
                          if (typeof onReload === 'function') onReload();
                        } else {
                          if (typeof Alert !== 'undefined') Alert.error('Lỗi tạo bảng', msg);
                        }
                      }).catch(function (err) {
                        if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();
                        console.error('Lỗi tạo bảng chấm công:', err);
                        if (typeof Alert !== 'undefined') Alert.error('Lỗi kết nối', err.message || 'Không thể kết nối đến máy chủ.');
                      });
                    }
                  });
                }
              }).catch(function (err) {
                if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
                console.error('Lỗi tải danh sách chi nhánh:', err);
                if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách chi nhánh.');
              });
            }).catch(function (err) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
              console.error('Lỗi tải kỳ chấm công:', err);
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách kỳ.');
            });
          }
        }
      ];
    }
  });

  if (typeof Router !== 'undefined') {
    var currentUser = window.APP_SETTINGS ? APP_SETTINGS.getStored('user', null) : localStorage.getItem('pmql_user');
    if (currentUser && typeof ApiClient !== 'undefined') {
      ApiClient.post('/api/API_Gateway_Router', {
        List: 'CF_BranchListFrm',
        FormName: 'CF_BranchListFrm',
        Func: 'View',
        Limit: 1000
      }).then(function (res) {
        var branchList = Array.isArray(res) ? res : (res.data || res.list || res.records || []);
        if (window.APP_SETTINGS) APP_SETTINGS.setStored('sys_branches', JSON.stringify(branchList)); else localStorage.setItem('pmql_sys_branches', JSON.stringify(branchList));
        Router.init();
      }).catch(function () {
        Router.init();
      });
    } else {
      Router.init();
    }
  }

  // 3. Khởi tạo Navbar (chỉ render nếu đã đăng nhập)
  var currentUser = window.APP_SETTINGS ? APP_SETTINGS.getStored('user', null) : localStorage.getItem('pmql_user');
  if (currentUser && typeof Navbar !== 'undefined') {
    Navbar.render('navbar-container');

    // Nếu mode là vertical, chuyển #app-content vào vertical-main
    if (Navbar.getLayout() === 'vertical') {
      var $vertMain = document.getElementById('vertical-main');
      var $content = document.getElementById('app-content');
      if ($vertMain && $content && !$vertMain.contains($content)) {
        $vertMain.appendChild($content);
      }
    }
  }

  // 4. Khởi tạo cấu hình giao diện
  var savedFont = window.APP_SETTINGS ? APP_SETTINGS.getStored('font_family', null) : localStorage.getItem('pmql_font_family');
  if (savedFont) {
    document.documentElement.style.setProperty('--font-family', '"' + savedFont + '", sans-serif');
  }

  var savedTheme = (window.APP_SETTINGS ? APP_SETTINGS.getStored('theme', null) : localStorage.getItem('pmql_theme')) || 'auto';
  if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Lắng nghe sự thay đổi giao diện từ hệ thống (khi chuyển qua chế độ tiết kiệm pin hoặc Dark Mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var currentTheme = (window.APP_SETTINGS ? APP_SETTINGS.getStored('theme', null) : localStorage.getItem('pmql_theme')) || 'auto';
    if (currentTheme === 'auto') {
      if (e.matches) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  });

  var savedColor = window.APP_SETTINGS ? APP_SETTINGS.getStored('color', null) : localStorage.getItem('pmql_color');
  if (savedColor) {
    var COLORS = [
      { id: 'indigo', primary: '#4F46E5', hover: '#4338CA', dark: '#3730A3', light: 'rgba(79, 70, 229, 0.1)' },
      { id: 'emerald', primary: '#10B981', hover: '#059669', dark: '#047857', light: 'rgba(16, 185, 129, 0.1)' },
      { id: 'rose', primary: '#E11D48', hover: '#BE123C', dark: '#9F1239', light: 'rgba(225, 29, 72, 0.1)' },
      { id: 'amber', primary: '#F59E0B', hover: '#D97706', dark: '#B45309', light: 'rgba(245, 158, 11, 0.1)' },
      { id: 'sky', primary: '#0EA5E9', hover: '#0284C7', dark: '#0369A1', light: 'rgba(14, 165, 233, 0.1)' }
    ];
    var colorDef = COLORS.find(function (c) { return c.id === savedColor; });
    if (colorDef) {
      document.documentElement.style.setProperty('--color-primary', colorDef.primary);
      document.documentElement.style.setProperty('--color-primary-hover', colorDef.hover);
      document.documentElement.style.setProperty('--color-primary-dark', colorDef.dark);
      document.documentElement.style.setProperty('--color-primary-light', colorDef.light);
    }
  }

});

// --- CUSTOM FUNCTIONS FOR WA_CaLamViecFrm ---

// Hàm lõi: nhận SapCaID trực tiếp, không cần query DOM
window.SapCaTuDong_ByID = function (sapCaID, callerBtn) {
  if (!sapCaID) {
    if (typeof Alert !== 'undefined') Alert.warning('Chưa lưu', 'Vui lòng Lưu thay đổi trước khi chạy Sắp ca tự động');
    return;
  }

  var originalHtml = callerBtn ? callerBtn.innerHTML : '';
  if (callerBtn) {
    callerBtn.disabled = true;
    callerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
  }

  var payload = {
    SapCaID: sapCaID
  };

  ApiClient.post('/api/HR_CaLamViec_SapCaStp', payload)
    .then(function (res) {
      if (res && res.code === 0) {
        if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã sắp ca tự động thành công');
        // Reload detail grid (Bảng ca chi tiết)
        var refreshBtn = document.querySelector('.btn-refresh-tab');
        if (refreshBtn) {
          refreshBtn.click();
        } else if (typeof window.DynamicFormEngine !== 'undefined' && typeof window.DynamicFormEngine.reloadDetailTabs === 'function') {
          window.DynamicFormEngine.reloadDetailTabs();
        }
      } else {
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', res && res.msg ? res.msg : 'Chạy sắp ca thất bại');
      }
    })
    .catch(function (err) {
      if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi hệ thống khi gọi API sắp ca');
    })
    .finally(function () {
      if (callerBtn) {
        callerBtn.disabled = false;
        callerBtn.innerHTML = originalHtml;
      }
    });
};

// Backward compat: nút "Sắp ca tự động" cũ trong FormFields vẫn hoạt động
window.SapCaTuDong = function () {
  var form = document.querySelector('.df-master-wrapper, .split-master-detail-container');
  if (!form) { if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không tìm thấy form'); return; }
  var sapCaInput = form.querySelector('[name="SapCaID"]');
  var btn = form.querySelector('button[onclick="window.SapCaTuDong()"]');
  window.SapCaTuDong_ByID(sapCaInput ? sapCaInput.value : '', btn);
};
