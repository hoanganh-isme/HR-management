/* --- mockData.js --- */
/**
 * Mock Data
 * Dữ liệu mẫu dùng chung cho toàn bộ hệ thống trong lúc chờ tích hợp API thật
 */
var MockData = {
  // Dữ liệu Nhóm Quyền & Người dùng 
  groups: [
    { id: 'G01', name: 'Admin', icon: 'shield_person', selected: true },
    { id: 'G02', name: 'Quản lý', icon: 'manage_accounts', selected: false },
    { id: 'G03', name: 'Nhân viên lễ tân', icon: 'support_agent', selected: false },
    { id: 'G04', name: 'Kế toán', icon: 'account_balance', selected: false },
    { id: 'G05', name: 'Bếp trưởng', icon: 'restaurant_menu', selected: false }
  ],
  groupDataSimple: [
    ['G01', 'Admin'],
    ['G02', 'Quản lý'],
    ['G03', 'Nhân viên lễ tân'],
    ['G04', 'Kế toán'],
    ['G05', 'Bếp trưởng']
  ],
  usersData: [
    { id: 'NV0000', name: 'Trương Nguyễn Administrator', username: 'admin', group: 'Admin', disabled: false },
    { id: 'NV0001', name: 'Trương Du Kỳ', username: 'duky123', group: 'Quản lý', disabled: false },
    { id: 'NV0002', name: 'Triệu Quách Minh', username: 'minh.trieu', group: 'Nhân viên lễ tân', disabled: true },
    { id: 'NV0003', name: 'Châu Chỉ Nhược', username: 'nhuoc.cc', group: 'Kế toán', disabled: false }
  ],

  // Dữ liệu Phân quyền
  permissionModules: [
    'Hệ thống (Tài khoản & Phân quyền)',
    'Danh mục Hàng hóa',
    'Danh mục Khách hàng',
    'Phiếu Khách Tham Quan',
    'Biên nhận Cọc chỗ',
    'Hợp đồng Tiệc',
    'Thông tin Bổ sung Tiệc',
    'Quyết toán Tiệc',
    'Báo cáo Doanh thu',
    'Báo cáo Kho'
  ],

  // Dữ liệu Demo (Hàng hóa, Nhân sự)
  demoEmployees: [
    ['NV0000', 'Administrator', '0909123456'],
    ['NV0001', 'Trương Du Kỳ', '123456789'],
    ['NV0002', 'Triệu Minh', '23654789']
  ],
  demoItems: [
    ['CO-FAN-CAM-1-300', 'Coca++Fanta-Cam-chai-300', 'K24', 24, 150, 0, '3,600'],
    ['PE-7UP-ZZZ-1-285', 'Pepsi++7up-chai-285', 'K24', 24, '1,000', 5, '24,005'],
    ['SG-BIA-EXP-1-355', 'Sài gòn++Export-chai-355', 'K20', 20, '2,935', 10, '58,710'],
    ['SG-BIA-LAG-1-450', 'Sài gòn++Lager beer-chai', 'K20', 20, 300, 0, '6,000'],
    ['A4', 'Giấy A4', 'KG', 1, '', '', ''],
    ['A55', 'Giấy A55', 'KG', 1, '', '', '']
  ],

  // Dữ liệu Demo Báo cáo Doanh thu (12 tháng)
  demoRevenue: [
    { month: 'Tháng 1', revenue: 125000000, count: 5 },
    { month: 'Tháng 2', revenue: 85000000, count: 3 },
    { month: 'Tháng 3', revenue: 210000000, count: 8 },
    { month: 'Tháng 4', revenue: 150000000, count: 6 },
    { month: 'Tháng 5', revenue: 320000000, count: 12 },
    { month: 'Tháng 6', revenue: 280000000, count: 10 },
    { month: 'Tháng 7', revenue: 190000000, count: 7 },
    { month: 'Tháng 8', revenue: 160000000, count: 5 },
    { month: 'Tháng 9', revenue: 410000000, count: 15 },
    { month: 'Tháng 10', revenue: 550000000, count: 20 },
    { month: 'Tháng 11', revenue: 620000000, count: 22 },
    { month: 'Tháng 12', revenue: 750000000, count: 28 }
  ],

  // Dữ liệu Demo Chi phí
  demoCost: [
    { id: 'HD001', customer: 'Nguyễn Văn A', date: '25/11/2026', foodCost: 50000000, serviceCost: 10000000, staffCost: 5000000, totalCost: 65000000 },
    { id: 'HD002', customer: 'Trần Thị B', date: '28/11/2026', foodCost: 30000000, serviceCost: 5000000, staffCost: 3000000, totalCost: 38000000 },
    { id: 'HD003', customer: 'Lê C', date: '02/12/2026', foodCost: 80000000, serviceCost: 15000000, staffCost: 8000000, totalCost: 103000000 }
  ],

  // Dữ liệu Demo Khảo sát - Yếu tố đặt tiệc
  demoSurveyFactors: [
    { label: 'Không gian sảnh', value: 35 },
    { label: 'Thực đơn ngon', value: 25 },
    { label: 'Giá cả hợp lý', value: 20 },
    { label: 'Khuyến mãi tốt', value: 15 },
    { label: 'Phục vụ', value: 5 }
  ],

  // Dữ liệu Demo Khảo sát - Kênh thông tin
  demoSurveyChannels: [
    { label: 'Facebook', value: 45 },
    { label: 'Người quen giới thiệu', value: 30 },
    { label: 'Tiktok', value: 15 },
    { label: 'Website', value: 10 }
  ],

  // Dữ liệu Demo Khách Hàng (Hồ sơ)
  khachHang: [
    { id: 1, MaKH: 'KH2026-001', TenKhach: 'Nguyễn Văn A - Lê Thị B', DienThoai: '0909123456', Email: 'a.b@gmail.com', DiaChi: 'Quận 1, TP.HCM', SoLanThamQuan: 2, SoHopDong: 1 },
    { id: 2, MaKH: 'KH2026-002', TenKhach: 'Trần Hữu C - Đinh Bích D', DienThoai: '0988765432', Email: 'c.d@gmail.com', DiaChi: 'Quận 3, TP.HCM', SoLanThamQuan: 1, SoHopDong: 1 },
    { id: 3, MaKH: 'KH2026-003', TenKhach: 'Hoàng Hữu E - Ngô F', DienThoai: '0912345678', Email: 'e.f@gmail.com', DiaChi: 'Quận 7, TP.HCM', SoLanThamQuan: 3, SoHopDong: 2 },
    { id: 4, MaKH: 'KH2026-004', TenKhach: 'Lý Mạc Sầu', DienThoai: '0944555666', Email: 'sau.lm@gmail.com', DiaChi: 'Bình Thạnh, TP.HCM', SoLanThamQuan: 1, SoHopDong: 1 },
    { id: 5, MaKH: 'KH2026-005', TenKhach: 'Lệnh Hồ Xung - Nhậm Doanh Doanh', DienThoai: '0933444555', Email: 'xung.doanh@gmail.com', DiaChi: 'Tân Bình, TP.HCM', SoLanThamQuan: 4, SoHopDong: 1 }
  ],

  // Dữ liệu Demo Sảnh Tiệc
  sanhTiec: [
    { id: 'S01', name: 'Diamond Hall', status: 'TRONG', capacity: 60 },
    { id: 'S02', name: 'Ruby Hall', status: 'DA_COC', capacity: 40, customer: 'Trần Hữu C', session: 'Trưa' },
    { id: 'S03', name: 'Sapphire Hall', status: 'DA_KY', capacity: 50, customer: 'Hoàng Hữu E', session: 'Tối' },
    { id: 'S04', name: 'Emerald Hall', status: 'TRONG', capacity: 35 },
    { id: 'S05', name: 'Gold Hall', status: 'BAO_TRI', capacity: 45 },
    { id: 'S06', name: 'Silver Hall', status: 'DA_KY', capacity: 30, customer: 'Lý Mạc Sầu', session: 'Trưa' }
  ],

  // Dữ liệu Demo Nhân sự phục vụ
  nhanVienPhucVu: [
    { id: 1, MaNV: 'PV001', HoTen: 'Nguyễn Văn Tèo', GioiTinh: 'Nam', DienThoai: '0901234567', LoaiHopDong: 'Thời vụ', MucLuong: 200000, DanhGia: '8.5' },
    { id: 2, MaNV: 'PV002', HoTen: 'Trần Thị Nở', GioiTinh: 'Nữ', DienThoai: '0912345678', LoaiHopDong: 'Bán thời gian', MucLuong: 4000000, DanhGia: '9.0' },
    { id: 3, MaNV: 'PV003', HoTen: 'Lê Chí Phèo', GioiTinh: 'Nam', DienThoai: '0923456789', LoaiHopDong: 'Fulltime', MucLuong: 6000000, DanhGia: '7.5' },
    { id: 4, MaNV: 'PV004', HoTen: 'Thị Kính', GioiTinh: 'Nữ', DienThoai: '0988888888', LoaiHopDong: 'Thời vụ', MucLuong: 250000, DanhGia: '9.5' },
    { id: 5, MaNV: 'PV005', HoTen: 'Lý Thông', GioiTinh: 'Nam', DienThoai: '0977665544', LoaiHopDong: 'Fulltime', MucLuong: 6500000, DanhGia: '6.0' }
  ]
};


/* --- apiClient.js --- */
/**
 * API Client Helper
 * Gói gọn logic gọi Fetch API, tự động gắn Base URL, Token, và xử lý lỗi chung.
 * Yêu cầu: Phải load sau env.js đ\u1ec3 s\u1eed d\u1ee5ng \u0111\u01b0\u1ee3c window.API_CONFIG
 */

const ApiClient = (function () {
    // Lấy Base URL từ env.js
    const getBaseUrl = () => {
        return window.API_CONFIG ? window.API_CONFIG.BASE_URL : '';
    };

    /**
     * Cookie helpers (Tương tự Medstand)
     */
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict${isSecure ? ';Secure' : ''}`;
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : '';
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }

    /**
     * Lấy auth token từ Cookie
     */
    function getAuthToken() {
        return getCookie('auth_token') || null;
    }

    /**
     * Hàm gọi API cốt lõi
     */
    async function request(endpoint, options = {}) {
        const baseUrl = getBaseUrl();
        // Nếu endpoint đã là URL đầy đủ thì không nối BaseUrl nữa
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

        // Thiết lập Headers mặc định
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        // Gắn Bearer Token nếu có
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            // Xử lý status 401 (Hết hạn token / Chưa đăng nhập)
            if (response.status === 401) {
                console.warn('[ApiClient] 401 Unauthorized. Token expired?');
                if (typeof window.logoutApp === 'function') {
                    window.logoutApp();
                } else {
                    deleteCookie('auth_token');
                    localStorage.removeItem('pmql_user');
                    window.location.href = 'login.html';
                }
            }

            // Nếu response code không phải 2xx (Tức là bị lỗi Backend trả về)
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText || 'Lỗi kết nối Server' };
                }
                const error = new Error(errorData.message || 'Lỗi Server');
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            // Parse k\u1ebft qu\u1ea3
            const textResponse = await response.text();
            try {
                // Trả về Object nếu JSON hợp lệ
                return textResponse ? JSON.parse(textResponse) : {};
            } catch (err) {
                // Trả về text nguyên bản nếu trả v\u1ec1 \u0111\u1ecbnh d\u1ea1ng kh\u00e1c (plain text)
                return textResponse;
            }

        } catch (error) {
            // Catch error network hoặc error tự throw ở trên
            console.error(`[API Error] ${options.method || 'GET'} ${url} :`, error);
            throw error; // Ném lỗi ra ngoài cho component/page xử lý hiện Toast báo lỗi
        }
    }

    return {
        /**
         * G\u1eedi request GET
         */
        get: function (endpoint, options = {}) {
            return request(endpoint, { ...options, method: 'GET' });
        },

        /**
         * G\u1eedi request POST (Dữ liệu truyền vào th\u00f4ng qua body)
         */
        post: function (endpoint, data, options = {}) {
            return request(endpoint, {
                ...options,
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        /**
         * G\u1eedi request PUT (Th\u01b0\u1eddng d\u00f9ng \u0111\u1ec3 update)
         */
        put: function (endpoint, data, options = {}) {
            return request(endpoint, {
                ...options,
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        /**
         * G\u1eedi request DELETE
         */
        delete: function (endpoint, options = {}) {
            return request(endpoint, { ...options, method: 'DELETE' });
        },

        // Expose cookie helpers to be used globally (e.g., in login and logout)
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie
    };
})();

// Xuất ra để có thể dùng toàn cục trong file JS khác
window.ApiClient = ApiClient;


/* --- permission.js --- */
/**
 * Permission Utility
 * Quản lý phân quyền hiển thị UI
 */
var Permission = (function () {
  function _get(module) {
    var legacyPerms = JSON.parse(localStorage.getItem('app_permissions') || '{}');
    var newPerms = JSON.parse(localStorage.getItem('pmql_permissions') || '{}');
    var perms = Object.keys(newPerms).length > 0 ? newPerms : legacyPerms;
    
    if (Object.keys(perms).length === 0) {
      return { xem: true, them: true, sua: true, xoa: true };
    }
    
    var p = perms[module];
    if (!p) {
      var target = (module || '').toLowerCase();
      for (var key in perms) {
        if (key.toLowerCase() === target) {
          p = perms[key];
          break;
        }
      }
    }
    p = p || {};
    
    return {
        xem: p.CanView == 1 || p.CanView === '1' || p.CanView === true || p.CanView === 'true' || p.xem == 1 || p.xem === '1' || p.xem === true || p.xem === 'true',
        them: p.CanAdd == 1 || p.CanAdd === '1' || p.CanAdd === true || p.CanAdd === 'true' || p.them == 1 || p.them === '1' || p.them === true || p.them === 'true',
        sua: p.CanEdit == 1 || p.CanEdit === '1' || p.CanEdit === true || p.CanEdit === 'true' || p.sua == 1 || p.sua === '1' || p.sua === true || p.sua === 'true',
        xoa: p.CanDelete == 1 || p.CanDelete === '1' || p.CanDelete === true || p.CanDelete === 'true' || p.xoa == 1 || p.xoa === '1' || p.xoa === true || p.xoa === 'true'
    };
  }

  return {
    canView:   function (module) { return _get(module).xem; },
    canAdd:    function (module) { return _get(module).them; },
    canEdit:   function (module) { return _get(module).sua; },
    canDelete: function (module) { return _get(module).xoa; }
  };
})();


/* --- DocumentExportPlugin.js --- */
/**
 * DocumentExportPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin cấu hình nút "Xuất tài liệu" cho các form:
 *   frmHopDong   → Hợp đồng tiệc     (PK: Sohopdong)
 *   frmBiennhancoccho    → Biên nhận đặt cọc (PK: MaChungTu)
 *   frmQuyetToan → Quyết toán        (PK: Sohopdong)
 */
var DocumentExportPlugin = (function () {
  var DOC_API_BASE = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.BASE_API;

  var FORM_CONFIG = {
    'frmHopDong': {
      docType: 'hop_dong',
      label: 'Xuất Hợp Đồng',
      icon: 'description',
      altKeys: ['Sohopdong', 'sohopdong', 'SoHopDong']
    },
    'frmBiennhancoccho': {
      docType: 'dat_coc',
      label: 'Xuất Biên Nhận Cọc',
      icon: 'receipt_long',
      altKeys: ['MaChungTu', 'maChungTu', 'DocumentID', 'SoPhieu']
    },
    'frmQuyetToan': {
      docType: 'quyet_toan',
      label: 'Xuất Quyết Toán',
      icon: 'receipt',
      altKeys: ['Sohopdong', 'sohopdong', 'SoHopDong']
    }
  };

  function _getPrimaryKey(row, config) {
    if (!row) return null;
    for (var i = 0; i < config.altKeys.length; i++) {
      var v = row[config.altKeys[i]];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return null;
  }

  function _generateDocument(row, config) {
    var docId = _getPrimaryKey(row, config);
    if (!docId) {
      if (typeof Alert !== 'undefined') {
        Alert.error('Lỗi', 'Không tìm thấy mã chứng từ của dòng này. Kiểm tra lại cấu hình primaryKey.');
      } else {
        alert('Không tìm thấy ID của dòng này!');
      }
      return;
    }

    var btn = document.getElementById('btn-export-doc-' + config.docType);
    var originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;animation:spin 1s linear infinite;">autorenew</span><span class="d-none d-md-inline">Đang xuất...</span>';
    }

    if (!document.getElementById('__dep_spin__')) {
      var ks = document.createElement('style');
      ks.id = '__dep_spin__';
      ks.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
      document.head.appendChild(ks);
    }

    fetch(DOC_API_BASE + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: config.docType,
        customerId: docId,
        outputFileName: config.docType + '_' + docId,
        rowData: row
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          if (typeof Toast !== 'undefined') {
            Toast.show({ message: 'Đã tạo tài liệu: ' + json.fileName, type: 'success' });
          }
          sessionStorage.setItem('docmgr_open_file', json.fileName);
          window.location.hash = '#/document-manager';
        } else {
          if (typeof Alert !== 'undefined') {
            Alert.error('Lỗi xuất tài liệu', json.message || 'Không xác định');
          }
        }
      })
      .catch(function (err) {
        if (typeof Alert !== 'undefined') {
          Alert.error('Lỗi kết nối', 'Không thể kết nối tới Document Server.');
        }
        console.error('[DocumentExportPlugin]', err);
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
        }
      });
  }

  function getExtraButtons(formName, getSelectedRows) {
    var config = FORM_CONFIG[formName];
    if (!config) return [];

    return [{
      id: 'btn-export-doc-' + config.docType,
      text: config.label,
      icon: config.icon,
      type: 'tool',
      onClick: function () {
        var selectedRows = getSelectedRows();
        if (!selectedRows || selectedRows.length !== 1) {
          if (typeof Alert !== 'undefined') {
            Alert.warning('Chưa chọn dữ liệu', 'Vui lòng chọn 1 dòng duy nhất để xuất tài liệu.');
          } else {
            alert('Vui lòng chọn 1 dòng để xuất tài liệu!');
          }
          return;
        }

        var row = selectedRows[0];
        var st = (row.Status || row.TrangThai || '').toString().toLowerCase();
        if (st.includes('đã ký')) {
          if (typeof Alert !== 'undefined') {
            Alert.warning('Bị khóa', 'Không thể xuất lại file cho Hợp đồng/Phiếu đã chốt (Đã ký).');
          } else {
            alert('Không thể xuất lại file cho Hợp đồng/Phiếu đã chốt (Đã ký).');
          }
          return;
        }

        _generateDocument(row, config);
      }
    }];
  }

  // Đăng ký Plugin vào hệ thống
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return { getExtraButtons: getExtraButtons };
})();


/* --- FormBuilderPlugin.js --- */
/**
 * FormBuilderPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin dành riêng cho trang Thiết kế Giao diện (Form Builder).
 * Chứa logic của nút "Thiết kế Layout" (Visual Drag & Drop) và "Đồng bộ từ DB".
 */
var FormBuilderPlugin = (function () {

  // ── Helper: Set Loading State ────────────────────────────────────────────
  function _setBtnLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
      if (!btn.hasAttribute('data-original-html')) {
        btn.setAttribute('data-original-html', btn.innerHTML);
      }
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
      btn.disabled = true;
    } else {
      if (btn.hasAttribute('data-original-html')) {
        btn.innerHTML = btn.getAttribute('data-original-html');
        btn.removeAttribute('data-original-html');
      }
      btn.disabled = false;
    }
  }

  // ── Lấy Nút Cấu Hình Toolbar ──────────────────────────────────────────────
  function getExtraButtons(formName, getSelectedRows, moduleConfig, onReloadFormEngine) {
    if ((window.location.hash || '').indexOf('/system/form-builder') === -1) return [];

    return [
      {
        id: 'btn-form-builder-layout',
        text: 'Thiết kế Layout',
        icon: 'design_services',
        type: 'tool',
        onClick: function() { _promptLayoutBuilder(moduleConfig, onReloadFormEngine); }
      },
      {
        id: 'btn-form-builder-sync',
        text: 'Đồng bộ từ DB',
        icon: 'sync',
        type: 'tool',
        onClick: function () {
          _openSyncModal(moduleConfig, onReloadFormEngine);
        }
      }
    ];
  }

  // ── Logic Đồng Bộ DB ─────────────────────────────────────────────────────
  function _openSyncModal(moduleConfig, onReloadFormEngine) {
    var body = document.createElement('div');
    body.className = 'p-3';
    body.innerHTML = `
      <div class="form-group mb-3">
        <label class="form-label fw-bold">Tên Form (FormName):</label>
        <input type="text" id="syncFormName" class="ui-input" placeholder="Ví dụ: frmCustomer">
        <small class="text-muted d-block mt-1">Form giao diện mà bạn muốn đồng bộ cấu hình.</small>
      </div>
      <div class="form-group mb-3">
        <label class="form-label fw-bold">Tên Bảng/View trong DB (ObjectName):</label>
        <input type="text" id="syncTableName" class="ui-input" placeholder="Ví dụ: v_DanhSachKhachHang">
        <small class="text-muted d-block mt-1">Tên bảng hoặc View thực tế dưới Database.</small>
      </div>
    `;

    var modal = UIModal.show({
      title: 'Đồng bộ cấu hình từ Database',
      width: '500px',
      content: body,
      footer: UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-outline', onclick: 'this.closest(\'.modal-overlay\').remove()' }) +
        UIButton.createHTML({ text: 'Chạy Đồng Bộ', type: 'primary', className: 'btn-run-sync', icon: 'play_arrow' })
    });

    var btnRun = modal.node.querySelector('.btn-run-sync');
    btnRun.onclick = function () {
      var fName = document.getElementById('syncFormName').value.trim();
      var tName = document.getElementById('syncTableName').value.trim();

      if (!fName || !tName) {
        return Alert.warning('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên Form và tên Bảng!');
      }

      _setBtnLoading(btnRun, true);
      var payload = {
        FormName: fName,
        ObjectName: tName
      };

      ApiClient.post('/api/API_DongBoTruongGiaoDien', payload).then(function (res) {
        if (res && res.code === 0) {
          Alert.success('Thành công', 'Đồng bộ trường giao diện hoàn tất!');
          modal.closeNow();
          if (typeof onReloadFormEngine === 'function') onReloadFormEngine();
        } else {
          Alert.error('Lỗi', res.msg || 'Đồng bộ thất bại');
          _setBtnLoading(btnRun, false);
        }
      }).catch(function (err) {
        Alert.error('Lỗi mạng', err.message || 'Không thể kết nối đến server');
        _setBtnLoading(btnRun, false);
      });
    };
  }

  // ── Logic Thiết Kế Layout ────────────────────────────────────────────────
  function _promptLayoutBuilder(moduleConfig, onReloadFormEngine) {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var targetFormInput = UIInput.createText({
      label: 'Nhập Tên Form cần thiết kế layout (*)',
      required: true,
      placeholder: 'Ví dụ: frmCustomer'
    });
    body.appendChild(targetFormInput);

    var footerNode = document.createElement('div');
    footerNode.style.cssText = 'display: flex; gap: 12px;';
    footerNode.innerHTML =
      UIButton.createHTML({ text: 'Hủy', className: 'btn-close-prompt', type: 'secondary' }) +
      UIButton.createHTML({ text: 'Mở thiết kế', className: 'btn-submit-prompt', type: 'primary' });

    var modalPrompt = UIModal.show({
      title: 'Thiết kế Layout trực quan',
      content: body,
      footer: footerNode
    });

    footerNode.querySelector('.btn-close-prompt').onclick = function () {
      modalPrompt.closeNow();
    };

    footerNode.querySelector('.btn-submit-prompt').onclick = function () {
      var formName = targetFormInput.querySelector('input').value.trim();
      if (!formName) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form');
      modalPrompt.closeNow();
      _openVisualLayoutBuilder(formName, moduleConfig, onReloadFormEngine);
    };

    // Bắt sự kiện phím Enter
    var inputEl = targetFormInput.querySelector('input');
    if (inputEl) {
      setTimeout(function () { inputEl.focus(); }, 100);
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var formName = inputEl.value.trim();
          if (!formName) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form');
          modalPrompt.closeNow();
          _openVisualLayoutBuilder(formName, moduleConfig, onReloadFormEngine);
        }
      });
    }
  }

  function _openVisualLayoutBuilder(targetFormName, moduleConfig, onReloadFormEngine) {
    var loadingModal = UIModal.show({ title: 'Đang tải layout...', content: '<div class="text-center p-4">Đang tải cấu hình form...</div>', buttons: [] });

    var payload = {
      List: 'frmFormBuilder',
      Func: 'View',
      Keyword: targetFormName,
      Limit: 1000,
      JsonData: JSON.stringify({ FormName: targetFormName })
    };

    var fetchEndpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.SYSTEM && window.API_CONFIG.ENDPOINTS.SYSTEM.GET_FIELDS_LIST) || moduleConfig.ApiSearch || '/api/API_Gateway_Router';

    ApiClient.post(fetchEndpoint, payload)
      .then(function (res) {
        loadingModal.closeNow();
        var fields = res.list || res.records || [];
        if (fields.length === 0) {
          return Alert.warning('Cảnh báo', 'Không tìm thấy trường nào cho form ' + targetFormName);
        }

        // Sắp xếp
        fields.sort(function (a, b) { return (a.OrderNo || 0) - (b.OrderNo || 0); });

        var body = document.createElement('div');
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        body.style.gap = '12px';

        var help = document.createElement('div');
        help.className = 'alert alert-info py-2 mb-0 d-flex align-items-center gap-2';
        help.innerHTML = '<span class="material-symbols-outlined">info</span> Kéo thả các khối để sắp xếp thứ tự. Bấm các nút phần trăm để chỉnh độ rộng. Layout hiển thị đúng tỷ lệ khung màn hình.';
        body.appendChild(help);

        var dropZone = document.createElement('div');
        dropZone.style.display = 'flex';
        dropZone.style.flexWrap = 'wrap';
        dropZone.style.gap = '10px 10px';
        dropZone.style.padding = '15px';
        dropZone.style.border = '2px dashed var(--color-border)';
        dropZone.style.borderRadius = '8px';
        dropZone.style.background = 'var(--color-background)';
        dropZone.style.minHeight = '300px';
        dropZone.style.position = 'relative';

        var draggedEl = null;

        fields.forEach(function (f) {
          var card = document.createElement('div');
          var span = f.FormPosition || 'body';
          if (span === 'grid') span = '6';
          if (span === 'body') span = '12';
          if (!['12', '8', '6', '4', '3'].includes(span)) span = '12';

          card.className = 'layout-card';
          card.draggable = true;
          card.dataset.id = f.FieldName;
          card.dataset.span = span;
          card.dataset.orig = JSON.stringify(f);

          card.style.border = '1px solid var(--color-border)';
          card.style.borderRadius = '6px';
          card.style.background = 'var(--color-surface)';
          card.style.padding = '12px';
          card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          card.style.cursor = 'grab';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '10px';
          card.style.transition = 'width 0.2s ease, opacity 0.2s ease, transform 0.1s ease';

          var fieldNameStr = f.FieldName || f.fieldname || f.FIELDNAME || f.name || '';
          var captionStr = f.CaptionVN || f.captionvn || f.CAPTIONVN || f.label || fieldNameStr;

          var _bool = function(camel, pascal) {
            return String(camel) === '1' || camel === true || String(pascal) === '1' || pascal === true;
          };

          var showAdd = _bool(f.showInAdd, f.ShowInAdd);
          var showEdit = _bool(f.showInEdit, f.ShowInEdit);
          var isReq = _bool(f.required, f.IsRequired);

          card.innerHTML = `
             <div style="font-weight:600; font-size:14px; color:var(--color-primary); pointer-events:none; display:flex; align-items:center; gap:6px;">
               <span class="material-symbols-outlined" style="font-size:18px; color:#888;">drag_indicator</span> 
               <span class="text-truncate">${captionStr}</span>
               <small style="color:#aaa; font-weight:400;">(${fieldNameStr})</small>
             </div>
             
             <div style="display:flex; gap:10px; font-size:11px; color:#555; margin-top:2px;">
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-add" ${showAdd ? 'checked' : ''}> Hiện khi Thêm</label>
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-edit" ${showEdit ? 'checked' : ''}> Hiện khi Sửa</label>
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-req" ${isReq ? 'checked' : ''}> Bắt buộc</label>
             </div>

             <div class="d-flex gap-1 mt-auto">
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="3">25%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="4">33%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="6">50%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="12">100%</button>
             </div>
           `;

          function applyWidth(sp) {
            card.dataset.span = sp;
            card.className = card.className.replace(/df-col-\d+/g, '').trim() + ' df-col-' + sp;

            var btns = card.querySelectorAll('.btn-span');
            var label = sp === '12' ? '100%' : sp === '6' ? '50%' : sp === '4' ? '33%' : '25%';
            btns.forEach(function (b) {
              if (b.innerText.includes(label)) {
                b.classList.remove('btn-outline-secondary');
                b.classList.add('btn-primary');
                b.style.color = '#fff';
              } else {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
                b.style.color = '';
              }
            });
          }

          applyWidth(span);

          card.querySelectorAll('.btn-span').forEach(function (b) {
            b.onclick = function () { applyWidth(b.dataset.val); };
          });

          card.addEventListener('dragstart', function (e) {
            draggedEl = card;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', card.innerHTML);
            setTimeout(function () { card.style.opacity = '0.4'; card.style.transform = 'scale(0.98)'; }, 0);
          });
          card.addEventListener('dragend', function (e) {
            draggedEl = null;
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            dropZone.querySelectorAll('.layout-card').forEach(function (c) { c.style.border = '1px solid var(--color-border)'; });
          });
          card.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedEl && draggedEl !== card) {
              var rect = card.getBoundingClientRect();
              var midY = rect.top + rect.height / 2;
              var midX = rect.left + rect.width / 2;
              var isAfter = e.clientY > midY || (Math.abs(e.clientY - midY) < 30 && e.clientX > midX);
              if (isAfter) dropZone.insertBefore(draggedEl, card.nextSibling);
              else dropZone.insertBefore(draggedEl, card);
            }
          });

          dropZone.appendChild(card);
        });

        body.appendChild(dropZone);

        var footerNode = document.createElement('div');
        footerNode.style.cssText = 'display: flex; gap: 12px;';
        footerNode.innerHTML =
          UIButton.createHTML({ text: 'Đóng', className: 'btn-close-layout', type: 'secondary' }) +
          UIButton.createHTML({ text: 'Lưu Layout', className: 'btn-save-layout', type: 'primary', icon: 'save' });

        var modalLayout = UIModal.show({
          title: 'Thiết kế Layout: ' + targetFormName,
          content: body,
          width: '900px',
          footer: footerNode
        });

        footerNode.querySelector('.btn-close-layout').onclick = function () {
          modalLayout.closeNow();
        };

        footerNode.querySelector('.btn-save-layout').onclick = function () {
          var cards = dropZone.querySelectorAll('.layout-card');
          var payloads = [];

          cards.forEach(function (c, index) {
            var fieldName = c.dataset.id;
            var orig = fields.find(function (item) {
              return (item.name || item.FieldName || item.FIELDNAME || item.fieldname) === fieldName;
            });
            if (!orig) orig = {};

            var savedSpan = c.dataset.span;
            if (savedSpan === '12') savedSpan = 'body';
            if (savedSpan === '6') savedSpan = 'grid';

            var isAddChecked = c.querySelector('.chk-add') ? c.querySelector('.chk-add').checked : true;
            var isEditChecked = c.querySelector('.chk-edit') ? c.querySelector('.chk-edit').checked : true;
            var isReqChecked = c.querySelector('.chk-req') ? c.querySelector('.chk-req').checked : false;

            payloads.push({
              FormName: targetFormName,
              FieldName: fieldName,
              FormPosition: savedSpan,
              OrderNo: index + 1,
              CaptionVN: orig.label || orig.CaptionVN || orig.CAPTIONVN || orig.captionvn || fieldName,
              FormatID: orig.renderRule || orig.FormatID || orig.FORMATID || orig.formatid || '',
              DataSource: orig.dataSource || orig.DataSource || orig.DATASOURCE || orig.datasource || '',
              IsRequired: isReqChecked ? 1 : 0,
              ShowInAdd: isAddChecked ? 1 : 0,
              ShowInEdit: isEditChecked ? 1 : 0,
              ShowInFilter: orig.showInFilter !== undefined ? orig.showInFilter : (orig.ShowInFilter !== undefined ? orig.ShowInFilter : 0),
              IsReadOnlyAdd: orig.isReadOnlyAdd !== undefined ? orig.isReadOnlyAdd : (orig.IsReadOnlyAdd !== undefined ? orig.IsReadOnlyAdd : 0),
              IsReadOnlyEdit: orig.isReadOnlyEdit !== undefined ? orig.isReadOnlyEdit : (orig.IsReadOnlyEdit !== undefined ? orig.IsReadOnlyEdit : 0),
              ValidateRule: orig.validateRule || orig.ValidateRule || orig.VALIDATERULE || '',
              DependsOn: orig.dependsOn || orig.DependsOn || orig.DEPENDSON || '',
              VisibleRule: orig.visibleRule || orig.VisibleRule || orig.VISIBLERULE || ''
            });
          });

          if (payloads.length === 0) return;

          var btn = this;
          var origTxt = btn.innerHTML;
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';
          btn.disabled = true;

          var saveEndpoint = window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.SYSTEM
            ? window.API_CONFIG.ENDPOINTS.SYSTEM.SAVE_FIELD
            : moduleConfig.ApiSave;

          if (!saveEndpoint) {
            Alert.error('Lỗi', 'Chưa cấu hình API Save endpoint');
            btn.innerHTML = origTxt;
            btn.disabled = false;
            return;
          }

          _sendSequentialToDB(saveEndpoint, payloads)
            .then(function() {
              modalLayout.closeNow();
              Alert.success('Thành công', 'Đã cập nhật xong cấu hình Layout!');
              if (typeof onReloadFormEngine === 'function') onReloadFormEngine();
            })
            .catch(function(err) {
              console.error(err);
              btn.innerHTML = origTxt;
              btn.disabled = false;
            });
        };

      })
      .catch(function (e) {
        if (loadingModal) loadingModal.closeNow();
        Alert.error('Lỗi', 'Không thể tải cấu hình form: ' + e.message);
      });
  }

  // Chạy tuần tự các promises
  function _sendSequentialToDB(endpoint, payloads) {
    return payloads.reduce(function(promise, payload) {
      return promise.then(function() {
        var finalPayload = payload;
        if (endpoint === '/api/API_Gateway_Router') {
          finalPayload = {
            List: payload.FormName,
            Func: 'Save',
            JsonData: JSON.stringify(payload)
          };
        }
        return ApiClient.post(endpoint, finalPayload).then(function(res) {
            if (res && res.code !== 0) throw new Error(res.msg || 'Lỗi lưu trường ' + payload.FieldName);
        });
      });
    }, Promise.resolve());
  }

  // Đăng ký Plugin vào hệ thống
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return {
    getExtraButtons: getExtraButtons
  };

})();


/* --- WorkflowTransferPlugin.js --- */
/**
 * WorkflowTransferPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin dùng để chuyển dữ liệu từ các màn hình này sang màn hình khác.
 * Ví dụ: Khách tham quan -> Biên nhận cọc (Auto-fill)
 */
var WorkflowTransferPlugin = (function () {

    function _autoClickAdd() {
        setTimeout(function () {
            var btnAdd = document.querySelector('button[title*="Thêm bản ghi mới"], button[title="Thêm"], .btn-primary:not(.btn-tool)');
            if (btnAdd) btnAdd.click();
        }, 800);
    }

    // --- CẤU HÌNH CÁC NÚT TRANSFER ---
    var FORM_CONFIG = {
        'frmKhachThamQuan': {
            id: 'btn-transfer-booking',
            text: 'Tạo Cọc',
            icon: 'monetization_on',
            targetHash: '#/booking',
            storageKey: 'transfer_VisitorToBooking',
            getTransferData: function (row) {
                var data = Object.assign({}, row);
                delete data.Id; delete data.AutoID; delete data.Sohopdong;
                return data;
            }
        },
        'frmHopDong': {
            id: 'btn-transfer-checkout',
            text: 'Quyết Toán',
            icon: 'receipt_long',
            targetHash: '#/checkout',
            storageKey: 'transfer_ContractToCheckout',
            getTransferData: function (row) {
                var data = Object.assign({}, row);
                delete data.Id; delete data.AutoID;
                return data;
            }
        }
    };

    function getExtraButtons(formName, getSelectedRows) {
        var config = FORM_CONFIG[formName];
        if (!config) return [];

        return [{
            id: config.id,
            text: config.text,
            icon: config.icon,
            type: 'tool',
            onClick: function () {
                var selectedRows = getSelectedRows();
                if (!selectedRows || selectedRows.length !== 1) {
                    if (window.Alert) Alert.warning('Chưa chọn dữ liệu', 'Vui lòng chọn 1 dòng duy nhất để ' + config.text + '.');
                    else alert('Vui lòng chọn 1 dòng!');
                    return;
                }

                var transferData = config.getTransferData(selectedRows[0]);
                sessionStorage.setItem(config.storageKey, JSON.stringify(transferData));
                window.location.hash = config.targetHash;
                _autoClickAdd();
            }
        }];
    }

    // --- XỬ LÝ AUTO-FILL KHI MỞ FORM THÊM MỚI ---
    var _observer = null;

    function _handleAutoFill() {
        var modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        var modalTitle = modalContent.querySelector('.modal-title');
        if (!modalTitle || modalTitle.innerText.indexOf('Thêm') === -1) return;

        var dataV2B = sessionStorage.getItem('transfer_VisitorToBooking');
        if (dataV2B) {
            _fillData(JSON.parse(dataV2B), 'Khách Tham Quan');
            sessionStorage.removeItem('transfer_VisitorToBooking');
            return;
        }

        var dataC2C = sessionStorage.getItem('transfer_ContractToCheckout');
        if (dataC2C) {
            _fillData(JSON.parse(dataC2C), 'Hợp Đồng Tiệc');
            sessionStorage.removeItem('transfer_ContractToCheckout');
            return;
        }
    }

    function _fillData(data, sourceName) {
        setTimeout(function () {
            var modalContent = document.querySelector('.modal-content');
            if (!modalContent) return;
            var filled = false;

            var tryFill = function (selectors, value) {
                if (!value) return;
                var els = modalContent.querySelectorAll(selectors);
                if (els.length > 0) {
                    els.forEach(function (el) {
                        el.value = value;
                        el.style.backgroundColor = '#f0fdf4';
                        el.style.borderColor = '#10b981';
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    filled = true;
                }
            };

            // Duyệt qua mapping động từ JSON data (keys chính là tên trường của form đích)
            Object.keys(data).forEach(function (fieldName) {
                var value = data[fieldName];
                if (!value) return; // Bỏ qua nếu không có giá trị

                // Tự động tạo selector thông minh bao phủ input, select, textarea
                var selector = 'input[name="' + fieldName + '"], ' +
                    'select[name="' + fieldName + '"], ' +
                    'textarea[name="' + fieldName + '"]';

                tryFill(selector, value);
            });

            if (filled && window.Toast) {
                Toast.success('Đã tự động điền thông tin từ ' + sourceName + '!');
            }
        }, 300);
    }

    function init() {
        if (_observer) _observer.disconnect();

        // Chỉ observe để auto-fill (chờ modal xuất hiện)
        _observer = new MutationObserver(function () {
            _handleAutoFill();
        });

        _observer.observe(document.body, { childList: true, subtree: true });
    }

    // Đăng ký Plugin vào hệ thống
    window.FormActionPlugins = window.FormActionPlugins || [];
    window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

    // Tự khởi động MutationObserver khi load (giống DocumentExportPlugin)
    init();

    return { getExtraButtons: getExtraButtons };
})();


/* --- EventBus.js --- */
/**
 * Global Event Bus - Lõi Pub/Sub để các component giao tiếp với nhau
 * Giúp đồng bộ dữ liệu toàn hệ thống mà không cần truyền biến phức tạp
 */
var EventBus = (function() {
  var listeners = {};

  return {
    // Đăng ký lắng nghe sự kiện
    on: function(event, callback) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    // Bỏ đăng ký lắng nghe
    off: function(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(function(cb) {
        return cb !== callback;
      });
    },

    // Phát sự kiện toàn cục kèm theo dữ liệu (nếu có)
    emit: function(event, data) {
      console.debug('[EventBus] emit:', event, data ? data : '');
      if (listeners[event]) {
        listeners[event].forEach(function(callback) {
          callback(data);
        });
      }
    }
  };
})();


/* --- KeyboardManager.js --- */
/**
 * KeyboardManager — Quản lý phím tắt tập trung
 * Hỗ trợ các phím chuyên dụng: F2, F3, F4, Space, Enter, Esc
 */
var KeyboardManager = (function () {

  function init() {
    document.addEventListener('keydown', function (e) {
      var target = document.activeElement;
      if (!target || target.tagName === 'BODY') return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          _dispatch(target, 'kb:new');       // Thêm mới danh mục
          break;
        case 'F3':
          e.preventDefault();
          _dispatch(target, 'kb:lookup');    // Mở danh sách tra cứu
          break;
        case 'F4':
          e.preventDefault();
          _dispatch(target, 'kb:open');      // Mở dropdown
          break;
        case ' ': // Space bar
          if (target.type === 'checkbox') {
            e.preventDefault();
            target.checked = !target.checked;
            target.dispatchEvent(new Event('change', { bubbles: true }));
          }
          break;
        case 'Escape':
          _dispatch(target, 'kb:close');
          break;
      }
    });

    // Support trigger by right-clicking checkboxes
    document.addEventListener('contextmenu', function (e) {
      if (e.target && e.target.type === 'checkbox') {
        e.preventDefault();
        e.target.checked = !e.target.checked;
        e.target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  // Bubble custom event lên DOM để component tự lắng nghe
  function _dispatch(el, eventName) {
    el.dispatchEvent(new CustomEvent(eventName, { bubbles: true, cancelable: true }));
  }

  return { init: init };
})();


/* --- FormatUtils.js --- */
/**
 * Format Utility
 * Các hàm tiện ích dùng chung (Tiền tệ, Thời gian, Số)
 */
var FormatUtils = (function () {

  /**
   * Định dạng tiền tệ VNĐ (VD: 1500000 -> 1.500.000 VNĐ)
   */
  function currency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 VNĐ';
    return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
  }

  /**
   * Định dạng số có dấy tách thập phân (VD: 1500 -> 1.500)
   */
  function number(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString('vi-VN');
  }

  /**
   * Định dạng ngày tháng VN (VD: YYYY-MM-DD -> DD/MM/YYYY)
   */
  function date(dateString) {
    if (!dateString) return '';
    var d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    var day = ('0' + d.getDate()).slice(-2);
    var month = ('0' + (d.getMonth() + 1)).slice(-2);
    return day + '/' + month + '/' + d.getFullYear();
  }

  return {
    currency: currency,
    number: number,
    date: date
  };
})();


/* --- UITooltip.js --- */
/**
 * UITooltip — JS-driven tooltip dùng position: fixed
 * Không bị clip bởi overflow:hidden/auto của bất kỳ container nào.
 * Tự động gắn vào mọi [data-tooltip] khi DOM thay đổi.
 */
var UITooltip = (function () {
  var _el = null;
  var _hideTimer = null;

  function _getEl() {
    if (!_el) {
      _el = document.createElement('div');
      _el.id = 'ui-tooltip';
      document.body.appendChild(_el);
    }
    return _el;
  }

  function show(text, anchorEl) {
    clearTimeout(_hideTimer);
    var tip = _getEl();
    tip.textContent = text;
    tip.classList.remove('visible');

    // Tính vị trí: bên dưới anchor
    var rect = anchorEl.getBoundingClientRect();
    var tipLeft = rect.left + rect.width / 2;
    var tipTop = rect.bottom + 8;

    tip.style.left = tipLeft + 'px';
    tip.style.top = tipTop + 'px';
    tip.style.transform = 'translateX(-50%)';

    // Kiểm tra có tràn ra phải màn hình không
    requestAnimationFrame(function () {
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.right > window.innerWidth - 8) {
        tip.style.left = (window.innerWidth - tipRect.width - 8) + 'px';
        tip.style.transform = 'none';
      }
      tip.classList.add('visible');
    });
  }

  function hide() {
    _hideTimer = setTimeout(function () {
      var tip = _getEl();
      tip.classList.remove('visible');
    }, 100);
  }

  function init() {
    // Dùng event delegation trên document để bắt tất cả [data-tooltip]
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('[data-tooltip]');
      if (target) {
        show(target.getAttribute('data-tooltip'), target);
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('[data-tooltip]');
      if (target) {
        hide();
      }
    });

    document.addEventListener('scroll', hide, true);
    document.addEventListener('click', hide, true);
  }

  // Tự khởi động khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { show: show, hide: hide };
})();


/* --- PrintUtils.js --- */
/**
 * Print Utility
 * Phục vụ nghiệp vụ IN phiếu và IN lưới từ ứng dụng CSR (Client Side Render)
 */
var PrintUtils = (function () {

  /**
   * Mở cửa sổ in một vùng giao diện (DOM Node)
   * @param {Node} element - DOM Node cần in
   * @param {string} title - Tiêu đề trang in
   */
  function printElement(element, title) {
    var win = window.open('', '', 'height=700,width=900');
    if (!win) {
      Alert.error('Lỗi', 'Trình duyệt bị chặn mở cửa sổ (Popup blocked). Vui lòng cho phép!');
      return;
    }

    win.document.write('<html><head><title>' + (title || 'In tài liệu') + '</title>');
    
    // Nạp toàn bộ style hiện tại vào bản in
    var styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(function(s) {
      win.document.write(s.outerHTML);
    });

    win.document.write('<style> @media print { body { padding: 20px; background: var(--color-surface); } .btn-tool { display: none; } } </style>');
    win.document.write('</head><body >');
    win.document.write(element.outerHTML);
    win.document.write('</body></html>');

    win.document.close();
    win.focus();

    setTimeout(function() {
      win.print();
      win.close();
    }, 500); // Đợi CSS load
  }

  return {
    printElement: printElement
  };
})();


/* --- CalendarService.js --- */
/**
 * Lớp Dịch vụ Quản lý Dữ liệu Lịch (Calendar Service)
 * Đảm nhiệm việc fetch dữ liệu API, quản lý In-memory Cache, và format dữ liệu
 */
var CalendarService = (function () {
  var _calendarCache = {};
  var _isFetching = false;

  // Lắng nghe sự kiện toàn cục để tự động quét dọn Cache
  if (typeof EventBus !== 'undefined') {
    EventBus.on('BANQUET_MUTATED', function () {
      console.debug('[CalendarService] BANQUET_MUTATED — quét sạch cache lịch.');
      invalidateCache();
    });
  }

  var _legendCache = null;

  function getLegend() {
    return new Promise(function(resolve, reject) {
      if (_legendCache) {
        return resolve(_legendCache);
      }
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CALENDAR || !API_CONFIG.ENDPOINTS.CALENDAR.LEGEND) {
        return reject('Missing API_CONFIG.ENDPOINTS.CALENDAR.LEGEND');
      }
      ApiClient.get(API_CONFIG.ENDPOINTS.CALENDAR.LEGEND)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _legendCache = records;
          resolve(records);
        })
        .catch(function(err) {
          console.warn('[CalendarService] Lỗi lấy Legend', err);
          resolve([]); // Trả về mảng rỗng nếu API lỗi để không bị crash FE
        });
    });
  }

  function invalidateCache() {
    console.debug('[CalendarService] invalidateCache — đã xóa cache lịch.');
    _calendarCache = {};
  }

  // Chuyển logic format từ page vào service luôn để tái sử dụng
  function formatData(data) {
    var eventsData = {};
    data.forEach(function (row) {
      var ngay = row.NgayToChuc || row.ngayToChuc || row.Ngaytochuc || row.ngaytochuc;
      if (!ngay) return;
      var d = new Date(ngay);
      var day = d.getDate();

      if (!eventsData[day]) eventsData[day] = [];

      var loaiPhieu = row.LoaiPhieu !== undefined ? row.LoaiPhieu : row.loaiPhieu;
      var laSanhChinh = row.LaSanhChinh !== undefined ? row.LaSanhChinh : row.laSanhChinh;
      if (laSanhChinh === 0) return; // Bỏ qua sảnh phụ

      var tenSanh = row.TenSanh || row.tenSanh || '';
      var soBan = row.SoBan || row.soBan || 0;

      // LoaiPhieu = 1 -> Xanh (Mới cọc), 2 -> Đỏ (Đã HĐ)
      var type = loaiPhieu === 1 ? 'success' : 'danger';

      var label = tenSanh + ' (' + soBan + ')';

      eventsData[day].push({
        type: type,
        label: label,
        rawData: row
      });
    });
    return eventsData;
  }

  var _pendingResolvers = [];

  function fetchEvents(year, month, forceRefresh) {
    forceRefresh = forceRefresh || false;
    var cacheKey = year + '-' + (month + 1).toString().padStart(2, '0');

    return new Promise(function (resolve, reject) {
      if (!forceRefresh && _calendarCache[cacheKey]) {
        console.debug('[CalendarService] Cache hit:', cacheKey);
        return resolve(_calendarCache[cacheKey]);
      }

      // Nếu đang fetch cùng tháng đó rồi, xếp vào queue chờ
      if (_isFetching) {
        _pendingResolvers.push({ resolve: resolve, reject: reject, cacheKey: cacheKey });
        return;
      }

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CALENDAR || !API_CONFIG.ENDPOINTS.CALENDAR.LIST) {
        console.warn('Chưa cấu hình API_CONFIG.ENDPOINTS.CALENDAR.LIST.');
        return reject('Missing API_CONFIG');
      }

      console.debug('[CalendarService] Fetching:', cacheKey);
      _isFetching = true;

      var payloadString = encodeURIComponent(JSON.stringify({ Thang: month + 1, Nam: year }));
      var endpoint = API_CONFIG.ENDPOINTS.CALENDAR.LIST + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = res.records || res.data || res || [];
          var eventsData = formatData(data);
          _calendarCache[cacheKey] = eventsData;
          resolve(eventsData);
          // Flush pending resolvers
          _pendingResolvers.forEach(function(p) {
            var cached = _calendarCache[p.cacheKey];
            if (cached) p.resolve(cached); else p.reject('No data');
          });
          _pendingResolvers = [];
        })
        .catch(function (err) {
          console.error('[CalendarService] Lỗi khi tải lịch:', err);
          reject(err);
          _pendingResolvers.forEach(function(p) { p.reject(err); });
          _pendingResolvers = [];
        })
        .finally(function () {
          _isFetching = false;
        });
    });
  }

  /**
   * Lưu lịch tiệc (đặt cọc lịch)
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CALENDAR || !API_CONFIG.ENDPOINTS.CALENDAR.SAVE) {
        return reject('Chưa cấu hình API CALENDAR.SAVE');
      }
      ApiClient.post(API_CONFIG.ENDPOINTS.CALENDAR.SAVE, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[CalendarService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy tóm tắt lịch theo năm: tháng nào có sự kiện
   * @param {number} year
   * @returns {Promise<Object>} { 0: count, 1: count, ... } (0-indexed month)
   */
  var _yearlySummaryCache = {};
  function getYearlySummary(year) {
    if (_yearlySummaryCache[year]) return Promise.resolve(_yearlySummaryCache[year]);
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CALENDAR || !API_CONFIG.ENDPOINTS.CALENDAR.LIST) {
      return Promise.resolve({});
    }
    var endpoint = API_CONFIG.ENDPOINTS.CALENDAR.LIST + '?q=' + encodeURIComponent(JSON.stringify({ Nam: year }));
    return ApiClient.get(endpoint)
      .then(function (res) {
        var data = res.records || res.data || res || [];
        var summary = {};
        data.forEach(function (row) {
          var ngay = row.NgayToChuc || row.ngayToChuc || row.Ngaytochuc || row.ngaytochuc;
          if (!ngay) return;
          var m = new Date(ngay).getMonth(); // 0-indexed
          summary[m] = (summary[m] || 0) + 1;
        });
        _yearlySummaryCache[year] = summary;
        return summary;
      })
      .catch(function () { return {}; });
  }

  return {
    fetchEvents: fetchEvents,
    getLegend: getLegend,
    invalidateCache: invalidateCache,
    getYearlySummary: getYearlySummary,
    save: save
  };
})();


/* --- SystemDataService.js --- */
/**
 * Lớp Dịch vụ lấy dữ liệu Danh mục dùng chung (Sảnh, Ca Tiệc...)
 * Đảm nhiệm việc fetch dữ liệu API, quản lý In-memory Cache để tái sử dụng
 */
var SystemDataService = (function() {
  var _hallsCache = null;
  var _shiftsCache = null;
  var _isFetchingHalls = false;
  var _isFetchingShifts = false;

  function getHalls(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (!forceRefresh && _hallsCache) {
        return resolve(_hallsCache);
      }
      if (_isFetchingHalls) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.HALLS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.HALLS');
      }

      _isFetchingHalls = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.HALLS)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _hallsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function() {
          _isFetchingHalls = false;
        });
    });
  }

  function getShifts(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (!forceRefresh && _shiftsCache) {
        return resolve(_shiftsCache);
      }
      if (_isFetchingShifts) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS');
      }

      _isFetchingShifts = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _shiftsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function() {
          _isFetchingShifts = false;
        });
    });
  }

  function getBanquetTypes(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES');
      }

      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          resolve(records);
        })
        .catch(reject);
    });
  }

  function getSetupValue(codeId) {
    return new Promise(function(resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE');
      }
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          // Tìm đúng CodeID được yêu cầu
          var found = records.find(function(r) { return r.CodeID === codeId; });
          resolve(found ? found.CodeValue : null);
        })
        .catch(reject);
    });
  }

  /**
   * Lấy version đồng bộ menu từ SY_Setup (key: menu_sync_ver)
   * Dùng cho Navbar để detect cache cũ trên các máy khác
   */
  function getMenuSyncVersion() {
    return getSetupValue('menu_sync_ver');
  }

  function invalidateCache() {
    _hallsCache = null;
    _shiftsCache = null;
  }

  return {
    getHalls: getHalls,
    getShifts: getShifts,
    getBanquetTypes: getBanquetTypes,
    getSetupValue: getSetupValue,
    getMenuSyncVersion: getMenuSyncVersion,
    invalidateCache: invalidateCache
  };
})();


/* --- BookingService.js --- */
/**
 * BookingService
 * Quản lý toàn bộ API call liên quan đến Biên nhận Cọc chỗ (Booking).
 */
var BookingService = (function () {

  /**
   * Lấy danh sách biên nhận cọc
   * @param {Object} filterParams - { Keyword, TuNgay, DenNgay }
   * @returns {Promise<Array>}
   */
  function getList(filterParams) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.BOOKING || !API_CONFIG.ENDPOINTS.BOOKING.LIST) {
        console.warn('[BookingService] Thiếu cấu hình API BOOKING.LIST');
        return resolve([]);
      }
      var payloadString = encodeURIComponent(JSON.stringify(filterParams || {}));
      var endpoint = API_CONFIG.ENDPOINTS.BOOKING.LIST + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records)      data = res.records;
          else if (res && res.data)    data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[BookingService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  /**
   * Hủy phiếu cọc
   * @param {Object} payload - { DocumentID, Lydohuy }
   * @returns {Promise}
   */
  function cancel(payload) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.BOOKING || !API_CONFIG.ENDPOINTS.BOOKING.CANCEL) {
        return reject('Chưa cấu hình API BOOKING.CANCEL');
      }
      ApiClient.post(API_CONFIG.ENDPOINTS.BOOKING.CANCEL, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[BookingService] Lỗi cancel:', err);
          reject(err);
        });
    });
  }

  /**
   * Tìm kiếm khách hàng theo từ khóa
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  function searchCustomer(keyword, sortCol, sortDir, page, limit) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CUSTOMER || !API_CONFIG.ENDPOINTS.CUSTOMER.SEARCH) {
        return resolve({ list: [], total: 0 });
      }
      var payloadObj = { Keyword: keyword || '' };
      var payload = JSON.stringify(payloadObj);
      
      var queryParams = [
        'q=' + encodeURIComponent(payload),
        'limit=' + (limit || 20),
        'page=' + (page || 1)
      ];

      if (sortCol) {
        var sortValue = sortCol + (sortDir && sortDir.toUpperCase() === 'DESC' ? ' desc' : '');
        queryParams.push('sort=' + encodeURIComponent(sortValue));
      } else {
        queryParams.push('sort=DateCreate desc'); // Mặc định sắp xếp theo ngày tạo
      }

      var url = API_CONFIG.ENDPOINTS.CUSTOMER.SEARCH + '?' + queryParams.join('&');

      ApiClient.get(url)
        .then(function (res) {
          var list = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          var total = res ? (res._recordtotal || res.total || list.length) : 0;
          resolve({ list: list, total: total });
        })
        .catch(function (err) {
          console.error('[BookingService] Lỗi searchCustomer:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu biên nhận cọc (thêm mới hoặc cập nhật)
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.BOOKING || !API_CONFIG.ENDPOINTS.BOOKING.SAVE) {
        return reject('Thiếu cấu hình API BOOKING.SAVE');
      }
      ApiClient.post(API_CONFIG.ENDPOINTS.BOOKING.SAVE, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[BookingService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Xóa biên nhận cọc qua Gateway (Batch)
   * @param {Object} payload - { DocumentIDs: 'ID1,ID2' }
   * @returns {Promise}
   */
  function remove(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER)
        ? API_CONFIG.ENDPOINTS.ROUTER
        : '/api/API_Gateway_Router';

      var routerPayload = {
        List: 'frmBiennhancoccho',
        Func: 'Delete',
        JsonData: JSON.stringify(payload) // Truyền { DocumentIDs: 'ID1,ID2' }
      };

      ApiClient.post(endpoint, routerPayload)
        .then(resolve)
        .catch(function (err) {
          console.error('[BookingService] Lỗi remove:', err);
          reject(err);
        });
    });
  }

  return {
    getList: getList,
    cancel: cancel,
    remove: remove,
    searchCustomer: searchCustomer,
    save: save
  };
})();


/* --- VisitorService.js --- */
/**
 * VisitorService
 * Quản lý toàn bộ API call liên quan đến Khách Tham Quan.
 */
var VisitorService = (function () {

  /**
   * Lấy danh sách khách tham quan
   * @param {Object} filterParams - { Keyword, TuNgay, DenNgay, ... }
   * @returns {Promise<Array>}
   */
  function getList(filterParams) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.VISITOR || !API_CONFIG.ENDPOINTS.VISITOR.LIST) {
        console.warn('[VisitorService] Thiếu cấu hình API VISITOR.LIST — trả về mảng rỗng');
        return resolve([]);
      }

      var payloadString = encodeURIComponent(JSON.stringify(filterParams || {}));
      var endpoint = API_CONFIG.ENDPOINTS.VISITOR.LIST + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records)      data = res.records;
          else if (res && res.data)    data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[VisitorService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  return {
    getList: getList
  };
})();


/* --- ContractService.js --- */
/**
 * ContractService
 * Quản lý toàn bộ API call liên quan đến Hợp Đồng Tiệc.
 */
var ContractService = (function () {

  /**
   * Lấy danh sách hợp đồng
   * @param {Object} filterParams
   * @returns {Promise<Array>}
   */
  function getList(filterParams) {
    return new Promise(function (resolve, reject) {
      var base = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.CONTRACT && API_CONFIG.ENDPOINTS.CONTRACT.LIST)
        ? API_CONFIG.ENDPOINTS.CONTRACT.LIST
        : '/api/API_Contract_List';

      var payloadString = encodeURIComponent(JSON.stringify(filterParams || {}));
      var endpoint = base + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy thông tin booking để tự điền form Hợp Đồng
   * @param {string} bookingId
   * @returns {Promise<Object|null>}
   */
  function getBookingById(bookingId) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.BOOKING && API_CONFIG.ENDPOINTS.BOOKING.LIST)
        ? API_CONFIG.ENDPOINTS.BOOKING.LIST
        : '/api/API_Booking_List';
      var payloadString = encodeURIComponent(JSON.stringify({ Keyword: bookingId }));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          var booking = records.find(function (b) { return (b.MaChungTu || b.id) == bookingId; });
          resolve(booking || null);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getBookingById:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy danh sách thực đơn
   * @param {Object} params - { Keyword, PhanLoai, IsChay }
   * @returns {Promise<Array>}
   */
  function getFoods(params) {
    return new Promise(function (resolve, reject) {
      var endpoint = API_CONFIG.ENDPOINTS.FOODS.LIST;

      var payloadString = encodeURIComponent(JSON.stringify(params || { Keyword: '', PhanLoai: '', IsChay: -1 }));
      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getFoods:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu hợp đồng
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.CONTRACT && API_CONFIG.ENDPOINTS.CONTRACT.SAVE)
        ? API_CONFIG.ENDPOINTS.CONTRACT.SAVE
        : '/api/API_LuuHopDong';

      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[ContractService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy lịch sử phụ lục hợp đồng
   * @param {string} sohopdong
   * @returns {Promise<Array>}
   */
  function getPhuLucHistory(sohopdong) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER)
        ? API_CONFIG.ENDPOINTS.ROUTER
        : '/api/API_Gateway_Router';
      
      var payload = {
        List: 'tbmk_Thaydoi',
        Func: 'View',
        Keyword: sohopdong || ''
      };

      ApiClient.post(endpoint, payload)
        .then(function (res) {
          var records = (res && res.records) ? res.records : ((res && res.data) ? res.data : (Array.isArray(res) ? res : []));
          resolve(records);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getPhuLucHistory:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu phụ lục thay đổi bổ sung
   * @param {Object} payload
   * @returns {Promise}
   */
  function savePhuLuc(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER)
        ? API_CONFIG.ENDPOINTS.ROUTER
        : '/api/API_Gateway_Router';

      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[ContractService] Lỗi savePhuLuc:', err);
          reject(err);
        });
    });
  }

  return {
    getList: getList,
    getBookingById: getBookingById,
    getFoods: getFoods,
    save: save,
    getPhuLucHistory: getPhuLucHistory,
    savePhuLuc: savePhuLuc
  };
})();


/* --- CheckoutService.js --- */
/**
 * CheckoutService
 * Quản lý toàn bộ API call liên quan đến Quyết Toán Tiệc.
 * Join: tbmk_Phieuthu ← tbmk_Hopdong ← dmkhachhang
 */
var CheckoutService = (function () {

  /**
   * Lấy danh sách phiếu quyết toán (API_DanhSachQuyetToan)
   * @param {Object} params - { Keyword, DocumentID, Sohopdong }
   * @returns {Promise<Array>}
   */
  function getList(params) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.LIST;
      var payloadString = encodeURIComponent(JSON.stringify(params || {}));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records)       data = res.records;
          else if (res && res.data)     data = res.data;
          else if (Array.isArray(res))  data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  /**
   * Tìm kiếm hợp đồng chưa quyết toán (API_DanhSachHopDong)
   * Lọc TrangThai = 'Đã Ký' để chỉ trả về HĐ chưa quyết toán
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  function searchContracts(keyword) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.CONTRACT_LIST;
      var payload = { Keyword: keyword || '' };
      var payloadString = encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records)       data = res.records;
          else if (res && res.data)     data = res.data;
          else if (Array.isArray(res))  data = res;
          // Chỉ lấy hợp đồng chưa quyết toán (IsKetthuc = 0 / TrangThai = 'Đã Ký')
          var filtered = data.filter(function (item) {
            return item.TrangThai !== 'Đã Quyết Toán' && item.TrangThai !== 'Đã Hủy';
          });
          resolve(filtered);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi searchContracts:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu phiếu quyết toán (API_LuuQuyenToan)
   * @param {Object} payload - { DocumentID?, DocumentDate, Sohopdong, Nguoinop,
   *                             Tongtiencoc, TongtienHoaDon, Thanhtoan,
   *                             Conlai, IsKetthuc, Ghichu }
   * @returns {Promise<Object>} - Record vừa lưu
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.SAVE;

      ApiClient.post(endpoint, payload)
        .then(function (res) {
          var record = null;
          if (res && res.records && res.records.length > 0)  record = res.records[0];
          else if (res && res.data && res.data.length > 0)   record = res.data[0];
          else if (Array.isArray(res) && res.length > 0)     record = res[0];
          else record = res;
          resolve(record);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  return {
    getList:         getList,
    searchContracts: searchContracts,
    save:            save
  };
})();


/* --- PermissionsService.js --- */
/**
 * PermissionsService
 * Quản lý toàn bộ API call liên quan đến Phân Quyền Người Dùng.
 */
var PermissionsService = (function () {

  function _ep(key) {
    return (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS[key]
      : null;
  }

  function _currentGroupId() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';
  }

  /**
   * Lấy danh sách nhóm quyền
   * @returns {Promise<Array>}
   */
  function getGroups() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_GROUP_LIST');
      ApiClient.get(endpoint)
        .then(function (res) {
          if (res && res.code === 0 && res.records) {
            resolve(res.records);
          } else {
            resolve([]);
          }
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getGroups:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy danh sách menu theo nhóm quyền
   * @param {string} groupId - ID nhóm cần lấy quyền
   * @returns {Promise<Array>}
   */
  function getMenusByGroup(groupId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_MENU_BY_GROUP');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        UserGroupID: groupId
      })
        .then(function (res) {
          var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
          resolve(records);
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getMenusByGroup:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy TẤT CẢ menu + quyền của nhóm (kể cả menu đang bị IsRun=0)
   * Dùng cho trang Phân Quyền để admin có thể bật/tắt bất kỳ menu nào
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  function getFullMenusByGroup(groupId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_ALL_MENUS_FOR_GROUP');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        UserGroupID: groupId
      })
        .then(function (res) {
          var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
          resolve(records);
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getFullMenusByGroup:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu quyền cho một menu thuộc nhóm
   * @param {Object} payload
   * @returns {Promise}
   */
  function savePermission(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SAVE_GROUP_PERMISSIONS');
      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi savePermission:', err);
          reject(err);
        });
    });
  }

  /**
   * Đồng bộ quyền truy cập toàn hệ thống
   * @returns {Promise}
   */
  function sync() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SYNC');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId() })
        .then(resolve)
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi sync:', err);
          reject(err);
        });
    });
  }

  return {
    getGroups: getGroups,
    getMenusByGroup: getMenusByGroup,
    getFullMenusByGroup: getFullMenusByGroup,
    savePermission: savePermission,
    sync: sync
  };
})();


/* --- MenusService.js --- */
/**
 * MenusService
 * Quản lý toàn bộ API call liên quan đến Quản lý Menu Hệ thống.
 */
var MenusService = (function () {

  function _ep(key) {
    return (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.MENUS)
      ? window.API_CONFIG.ENDPOINTS.MENUS[key]
      : null;
  }

  function _currentGroupId() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';
  }

  /**
   * Lấy toàn bộ danh sách menu
   * @returns {Promise<Array>}
   */
  function getAll() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_ALL');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId() })
        .then(function (res) {
          if (res && res.code === 0) {
            resolve(res.records || []);
          } else {
            console.warn('[MenusService] getAll — code != 0:', res && res.msg);
            resolve([]);
          }
        })
        .catch(function (err) {
          console.error('[MenusService] Lỗi getAll:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu menu (thêm mới hoặc cập nhật)
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SAVE');
      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Xóa menu
   * @param {string} menuId
   * @returns {Promise}
   */
  function deleteMenu(menuId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('DELETE');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId(), MenuID: menuId })
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi deleteMenu:', err);
          reject(err);
        });
    });
  }

  /**
   * Cập nhật thứ tự hiển thị các menu
   * @param {Object} params - { type, orderedIds, parentId }
   * @returns {Promise}
   */
  function updateOrder(params) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('UPDATE_ORDER');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        Type: params.type,
        OrderedIDs: params.orderedIds.join(','),
        ParentID: params.parentId
      })
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi updateOrder:', err);
          reject(err);
        });
    });
  }

  return {
    getAll: getAll,
    save: save,
    deleteMenu: deleteMenu,
    updateOrder: updateOrder,
    currentGroupId: _currentGroupId
  };
})();


/* --- ReportService.js --- */
/**
 * Dịch vụ Báo cáo (ReportService)
 */
var ReportService = (function () {

  function getRevenue(fromDate, toDate) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.REPORTS || !API_CONFIG.ENDPOINTS.REPORTS.REVENUE) {
        return reject('Missing API_CONFIG.ENDPOINTS.REPORTS.REVENUE');
      }
      
      var payload = {};
      if (fromDate) payload.TuNgay = fromDate;
      if (toDate) payload.DenNgay = toDate;
      
      var endpoint = API_CONFIG.ENDPOINTS.REPORTS.REVENUE + '?q=' + encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ReportService] Lỗi tải báo cáo doanh thu:', err);
          reject(err);
        });
    });
  }

  function getCost(fromDate, toDate) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.REPORTS || !API_CONFIG.ENDPOINTS.REPORTS.COST) {
        return reject('Missing API_CONFIG.ENDPOINTS.REPORTS.COST');
      }
      
      var payload = {};
      if (fromDate) payload.TuNgay = fromDate;
      if (toDate) payload.DenNgay = toDate;
      
      var endpoint = API_CONFIG.ENDPOINTS.REPORTS.COST + '?q=' + encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ReportService] Lỗi tải báo cáo chi phí:', err);
          reject(err);
        });
    });
  }

  return {
    getRevenue: getRevenue,
    getCost: getCost
  };
})();


/* --- PeriodManager.js --- */
// Quản lý Kỳ kế toán (Period Manager) - Tích hợp Real DB (SY_Period)
(function() {
  window.PeriodManager = {
    _cache: {},
    init: function() {
      var _this = this;
      if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.ROUTER) {
        ApiClient.post(API_CONFIG.ENDPOINTS.ROUTER, {
          List: 'SY_Period',
          Func: 'View'
        }).then(function(res) {
          var records = res.records || (Array.isArray(res) ? res : []);
          records.forEach(function(r) {
            var m = parseInt(r.PeriodNo);
            var y = parseInt(r.YearID);
            var isLocked = (r.isLock === true || r.isLock === 1 || r.isLock === '1' || r.isLock === 'True');
            if (m && y) _this._cache[m + '/' + y] = isLocked;
          });
        }).catch(function(e) { console.error('Lỗi tải SY_Period:', e); });
      }
    },
    getLockedPeriods: function() {
      return this._cache;
    },
    setLockedPeriod: function(month, year, isLocked) {
      var m = parseInt(month);
      var y = parseInt(year);
      this._cache[m + '/' + y] = isLocked;

      if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS.ROUTER) {
        var periodId = String(y) + (m < 10 ? '0' + m : m); // YYYYMM format, vd: 201801
        ApiClient.post(API_CONFIG.ENDPOINTS.ROUTER, {
          List: 'SY_Period',
          Func: 'Edit', // hoặc Update tùy cấu hình router DB
          Data: {
            PeriodID: periodId,
            isLock: isLocked ? 1 : 0
          }
        }).catch(function(e) { console.error('Lỗi update Khóa Kỳ:', e); });
      }
    },
    isDateLocked: function(dateString) {
      if (!dateString) return false;
      var dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        var parts = dateString.split('/');
        if (parts.length === 3) dateObj = new Date(parts[2], parts[1]-1, parts[0]);
      }
      if (isNaN(dateObj.getTime())) return false;
      var month = dateObj.getMonth() + 1;
      var year = dateObj.getFullYear();
      return this._cache[month + '/' + year] === true;
    }
  };

  // Khởi động load data từ API ngay khi script được nạp
  window.PeriodManager.init();
})();


/* --- CompareBadge.js --- */
/**
 * CompareBadge Component
 * ─────────────────────────────────────────────
 * Hiển thị badge so sánh kỳ trước: +12.5% ▲ / -3.2% ▼
 *
 * Usage:
 *   CompareBadge.create(12.5)                      // HTMLElement, green ▲
 *   CompareBadge.create(-3.2)                       // HTMLElement, red ▼
 *   CompareBadge.create(5.0, { reverse: true })     // tăng = xấu (chi phí)
 *   CompareBadge.create(12.5, { size: 'sm' })       // size nhỏ
 *   CompareBadge.createHTML(-3.2, { size: 'sm' })   // HTML string
 *   CompareBadge.update(el, -5.0)                   // cập nhật element
 */
var CompareBadge = (function () {

  /**
   * Tính trạng thái badge (up/down/neutral) từ phần trăm và reverse flag
   * @param {number} pct
   * @param {boolean} reverse - true = tăng là xấu (vd: chi phí)
   * @returns {'up'|'down'|'neutral'}
   */
  function _getDirection(pct, reverse) {
    if (pct === 0 || isNaN(pct)) return 'neutral';
    var isPositive = pct > 0;
    return (isPositive !== reverse) ? 'up' : 'down';
  }

  /**
   * Build nội dung badge
   * @param {number} pct
   * @param {Object} opts - { reverse, size, showSign, decimalPlaces }
   * @returns {{ direction, className, html }}
   */
  function _build(pct, opts) {
    opts = opts || {};
    var reverse = !!opts.reverse;
    var size = opts.size || 'md'; // 'sm' | 'md'
    var places = opts.decimalPlaces !== undefined ? opts.decimalPlaces : 1;
    var direction = _getDirection(pct, reverse);

    var icon = direction === 'up'
      ? '<span class="material-symbols-outlined cb-icon">arrow_upward</span>'
      : direction === 'down'
        ? '<span class="material-symbols-outlined cb-icon">arrow_downward</span>'
        : '<span class="material-symbols-outlined cb-icon">remove</span>';

    var sign = pct > 0 ? '+' : '';
    var absVal = Math.abs(pct);
    var text = sign + (isNaN(pct) ? '--' : pct.toFixed(places)) + '%';

    var cls = 'compare-badge compare-badge--' + direction + ' compare-badge--' + size;

    return {
      direction: direction,
      className: cls,
      contentHTML: icon + '<span class="cb-text">' + text + '</span>'
    };
  }

  /**
   * Tạo HTMLElement badge
   * @param {number} pct - Phần trăm thay đổi (vd: 12.5, -3.2)
   * @param {Object} [opts]
   * @param {boolean} [opts.reverse=false] - Nếu true, tăng = xấu
   * @param {'sm'|'md'} [opts.size='md']
   * @param {number} [opts.decimalPlaces=1]
   * @returns {HTMLElement}
   */
  function create(pct, opts) {
    var b = _build(pct, opts);
    var el = document.createElement('span');
    el.className = b.className;
    el.innerHTML = b.contentHTML;
    return el;
  }

  /**
   * Tạo HTML string badge
   * @param {number} pct
   * @param {Object} [opts]
   * @returns {string}
   */
  function createHTML(pct, opts) {
    var b = _build(pct, opts);
    return '<span class="' + b.className + '">' + b.contentHTML + '</span>';
  }

  /**
   * Cập nhật element badge đã tồn tại (không re-render toàn bộ DOM)
   * @param {HTMLElement} el - element được tạo bởi create()
   * @param {number} pct
   * @param {Object} [opts]
   */
  function update(el, pct, opts) {
    if (!el) return;
    var b = _build(pct, opts);
    el.className = b.className;
    el.innerHTML = b.contentHTML;
  }

  return {
    create: create,
    createHTML: createHTML,
    update: update
  };
})();


/* --- MetricCard.js --- */
/**
 * MetricCard Component
 * ─────────────────────────────────────────────
 * Thẻ số liệu KPI với icon + label + value lớn + sub text
 * Dùng cho: Dashboard "Hoạt động trong ngày", trang báo cáo, KPI panels
 *
 * Usage:
 *   var el = MetricCard.create({
 *     icon: 'payments',
 *     iconColor: '#4F46E5',
 *     iconBg: 'rgba(79,70,229,0.08)',
 *     label: 'Doanh thu ước tính',
 *     value: '185M',
 *     subValue: '₫185.000.000',     // optional
 *     size: 'large',                // 'large' | 'normal' (default)
 *     onClick: function() { ... }   // optional
 *   });
 *
 *   MetricCard.update(el, { value: '192M', subValue: '₫192.000.000' });
 */
var MetricCard = (function () {

  /**
   * Tạo MetricCard element
   * @param {Object} opts
   * @param {string}   opts.icon       - Material Symbol icon name
   * @param {string}   [opts.iconColor]  - CSS color string
   * @param {string}   [opts.iconBg]    - CSS background string cho icon wrapper
   * @param {string}   opts.label      - Nhãn mô tả (nhỏ, trên value)
   * @param {string|number} opts.value - Giá trị chính (to, đậm)
   * @param {string}   [opts.subValue]  - Giá trị phụ (nhỏ hơn, bên dưới)
   * @param {'large'|'normal'} [opts.size='normal'] - 'large' tăng cỡ value
   * @param {Function} [opts.onClick]  - click handler
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var size = opts.size || 'normal';

    var card = document.createElement('div');
    card.className = 'metric-card metric-card--' + size;
    if (typeof opts.onClick === 'function') {
      card.classList.add('metric-card--clickable');
      card.addEventListener('click', opts.onClick);
    }

    // Icon wrapper
    var iconWrap = document.createElement('div');
    iconWrap.className = 'metric-card__icon';
    if (opts.iconColor) iconWrap.style.color = opts.iconColor;
    if (opts.iconBg)    iconWrap.style.background = opts.iconBg;

    var iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-outlined';
    iconEl.textContent = opts.icon || 'info';
    iconWrap.appendChild(iconEl);

    // Content wrapper
    var content = document.createElement('div');
    content.className = 'metric-card__content';

    var label = document.createElement('div');
    label.className = 'metric-card__label';
    label.textContent = opts.label || '';

    var valueEl = document.createElement('div');
    valueEl.className = 'metric-card__value';
    valueEl.dataset.metricValue = '1'; // selector hook for update()
    valueEl.textContent = opts.value !== undefined ? String(opts.value) : '--';

    content.appendChild(label);
    content.appendChild(valueEl);

    if (opts.subValue !== undefined) {
      var sub = document.createElement('div');
      sub.className = 'metric-card__sub';
      sub.dataset.metricSub = '1';
      sub.textContent = String(opts.subValue);
      content.appendChild(sub);
    }

    card.appendChild(iconWrap);
    card.appendChild(content);
    return card;
  }

  /**
   * Cập nhật giá trị của MetricCard mà không re-render
   * @param {HTMLElement} el - element tạo bởi create()
   * @param {Object} patch - { value, subValue, icon, iconColor, iconBg }
   */
  function update(el, patch) {
    if (!el || !patch) return;
    if (patch.value !== undefined) {
      var v = el.querySelector('[data-metric-value]');
      if (v) v.textContent = String(patch.value);
    }
    if (patch.subValue !== undefined) {
      var s = el.querySelector('[data-metric-sub]');
      if (s) {
        s.textContent = String(patch.subValue);
      } else {
        // Tạo mới nếu ban đầu không có subValue
        var content = el.querySelector('.metric-card__content');
        if (content) {
          var newSub = document.createElement('div');
          newSub.className = 'metric-card__sub';
          newSub.dataset.metricSub = '1';
          newSub.textContent = String(patch.subValue);
          content.appendChild(newSub);
        }
      }
    }
    if (patch.icon !== undefined) {
      var iconEl = el.querySelector('.metric-card__icon .material-symbols-outlined');
      if (iconEl) iconEl.textContent = patch.icon;
    }
    if (patch.iconColor !== undefined) {
      var iconWrap = el.querySelector('.metric-card__icon');
      if (iconWrap) iconWrap.style.color = patch.iconColor;
    }
    if (patch.iconBg !== undefined) {
      var iconWrap2 = el.querySelector('.metric-card__icon');
      if (iconWrap2) iconWrap2.style.background = patch.iconBg;
    }
  }

  /**
   * Mount MetricCard vào container (helper tiện lợi)
   * @param {string|HTMLElement} target - selector string hoặc element
   * @param {Object} opts - như create()
   * @returns {HTMLElement} card element
   */
  function mount(target, opts) {
    var container = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!container) return null;
    var card = create(opts);
    container.innerHTML = '';
    container.appendChild(card);
    return card;
  }

  return {
    create: create,
    update: update,
    mount: mount
  };
})();


/* --- SparklineChart.js --- */
/**
 * SparklineChart Component
 * ─────────────────────────────────────────────
 * Vẽ mini sparkline chart trên Canvas (không cần Chart.js)
 * Nhẹ, tự động responsive, hỗ trợ animation
 *
 * Usage:
 *   // Option 1: Vẽ vào canvas có sẵn
 *   SparklineChart.draw({
 *     canvas: document.getElementById('my-canvas'),
 *     data: [40, 55, 48, 70, 65, 80, 75],
 *     color: '#4F46E5'   // optional, default = --color-primary
 *   });
 *
 *   // Option 2: Tạo canvas mới + container
 *   var el = SparklineChart.create({
 *     data: [40, 55, 48, 70, 65],
 *     color: '#10B981',
 *     width: 160,
 *     height: 48
 *   });
 *   document.getElementById('chart-wrap').appendChild(el);
 */
var SparklineChart = (function () {

  var _dpr = window.devicePixelRatio || 1;

  /**
   * Lấy màu primary từ CSS variable
   */
  function _getPrimaryColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim() || '#4F46E5';
  }

  /**
   * Core render function — vẽ sparkline lên canvas context
   * @param {CanvasRenderingContext2D} ctx
   * @param {number[]} data
   * @param {number} W - logical width
   * @param {number} H - logical height
   * @param {string} color
   */
  function _render(ctx, data, W, H, color) {
    if (!data || data.length < 2) return;
    ctx.clearRect(0, 0, W, H);

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var pad = 4;
    var stepX = (W - pad * 2) / (data.length - 1);

    // Helper: data[i] → canvas y
    function yOf(v) {
      return pad + (1 - (v - min) / range) * (H - pad * 2);
    }

    // Gradient fill
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    var hex = color.trim();
    // Convert hex / named color → rgba với opacity
    grad.addColorStop(0, _hexToRgba(hex, 0.18));
    grad.addColorStop(1, _hexToRgba(hex, 0.0));

    // Draw fill path
    ctx.beginPath();
    data.forEach(function (v, i) {
      var x = pad + i * stepX;
      var y = yOf(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(pad + (data.length - 1) * stepX, H);
    ctx.lineTo(pad, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach(function (v, i) {
      var x = pad + i * stepX;
      var y = yOf(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = _hexToRgba(hex, 0.9);
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    var lastX = pad + (data.length - 1) * stepX;
    var lastY = yOf(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /**
   * Chuyển hex color → rgba string
   * Hỗ trợ: #RGB, #RRGGBB, rgba(...) trực tiếp
   */
  function _hexToRgba(hex, alpha) {
    if (!hex) return 'rgba(79,70,229,' + alpha + ')';
    hex = hex.trim();
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
      // Đã là rgba, chỉ cần thêm alpha
      return hex.replace(/[\d.]+\)$/, alpha + ')').replace(/^rgb\(/, 'rgba(');
    }
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /**
   * Setup canvas size theo DPR để sharp trên Retina
   * @param {HTMLCanvasElement} canvas
   * @param {number} W - logical width
   * @param {number} H - logical height
   */
  function _setupCanvas(canvas, W, H) {
    canvas.width  = W * _dpr;
    canvas.height = H * _dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(_dpr, _dpr);
    return ctx;
  }

  /**
   * Vẽ sparkline vào canvas có sẵn
   * @param {Object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {number[]} opts.data
   * @param {string} [opts.color]
   * @param {number} [opts.width=220]
   * @param {number} [opts.height=60]
   */
  function draw(opts) {
    var canvas = opts.canvas;
    if (!canvas || !canvas.getContext) return;

    var W = opts.width || parseInt(canvas.style.width) || 220;
    var H = opts.height || parseInt(canvas.style.height) || 60;
    var color = opts.color || _getPrimaryColor();
    var ctx = _setupCanvas(canvas, W, H);
    _render(ctx, opts.data || [], W, H, color);
  }

  /**
   * Tạo canvas element mới với sparkline đã vẽ
   * @param {Object} opts
   * @param {number[]} opts.data
   * @param {string} [opts.color]
   * @param {number} [opts.width=220]
   * @param {number} [opts.height=60]
   * @param {string} [opts.className]   - thêm CSS class vào canvas
   * @returns {HTMLCanvasElement}
   */
  function create(opts) {
    var canvas = document.createElement('canvas');
    if (opts.className) canvas.className = opts.className;
    else canvas.className = 'sparkline-canvas';

    var W = opts.width || 220;
    var H = opts.height || 60;
    var color = opts.color || _getPrimaryColor();
    var ctx = _setupCanvas(canvas, W, H);
    _render(ctx, opts.data || [], W, H, color);
    return canvas;
  }

  /**
   * Redraw sparkline trên canvas — dùng khi data thay đổi
   * @param {HTMLCanvasElement} canvas
   * @param {number[]} data
   * @param {string} [color]
   */
  function redraw(canvas, data, color) {
    if (!canvas || !canvas.getContext) return;
    var W = Math.round(parseInt(canvas.style.width) || 220);
    var H = Math.round(parseInt(canvas.style.height) || 60);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
    _render(ctx, data || [], W, H, color || _getPrimaryColor());
  }

  return {
    draw: draw,
    create: create,
    redraw: redraw
  };
})();


/* --- KVTable.js --- */
/**
 * KVTable Component (Key-Value Table)
 * ─────────────────────────────────────────────
 * Bảng 2 cột: label ↔ value — dùng cho tóm tắt tài chính, báo cáo
 *
 * Usage:
 *   var el = KVTable.create({
 *     rows: [
 *       { label: 'Doanh thu', value: '2.1 tỷ' },
 *       { label: 'Chi phí', value: '798M', color: 'danger' },
 *       { label: 'Khuyến mãi', value: '42M', color: 'warning',
 *         dot: '#F59E0B' },           // dot màu trước label
 *       { label: 'Lợi nhuận', value: '1.26 tỷ', color: 'success',
 *         isTotal: true }             // highlight row tổng
 *     ]
 *   });
 *
 *   // Cập nhật 1 row không re-render toàn bộ
 *   KVTable.updateRow(el, 2, { value: '1.30 tỷ' });
 */
var KVTable = (function () {

  var _COLOR_MAP = {
    success: 'var(--color-success)',
    danger:  'var(--color-danger)',
    warning: 'var(--color-warning)',
    info:    'var(--color-info)',
    primary: 'var(--color-primary)'
  };

  /**
   * Tạo 1 row element
   */
  function _buildRow(row, index) {
    var div = document.createElement('div');
    div.className = 'kvtable__row'
      + (row.isHeader ? ' kvtable__row--header' : '')
      + (row.isTotal  ? ' kvtable__row--total'  : '');
    div.dataset.kvRowIndex = index;

    // Label side
    var labelEl = document.createElement('span');
    labelEl.className = 'kvtable__label';

    if (row.dot) {
      var dot = document.createElement('span');
      dot.className = 'kvtable__dot';
      dot.style.background = row.dot;
      labelEl.appendChild(dot);
    }

    var labelText = document.createTextNode(row.label || '');
    labelEl.appendChild(labelText);

    // Value side
    var valueEl = document.createElement('span');
    valueEl.className = 'kvtable__value';
    valueEl.dataset.kvValue = '1';
    valueEl.textContent = row.value !== undefined ? String(row.value) : '--';

    if (row.color && _COLOR_MAP[row.color]) {
      valueEl.style.color = _COLOR_MAP[row.color];
    }

    div.appendChild(labelEl);
    div.appendChild(valueEl);
    return div;
  }

  /**
   * Tạo KVTable element
   * @param {Object} opts
   * @param {Array}  opts.rows - mảng row objects
   * @param {string} [opts.className] - thêm class vào wrapper
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var rows = opts.rows || [];

    var wrapper = document.createElement('div');
    wrapper.className = 'kvtable' + (opts.className ? ' ' + opts.className : '');

    rows.forEach(function (row, i) {
      wrapper.appendChild(_buildRow(row, i));
    });

    return wrapper;
  }

  /**
   * Cập nhật value của 1 row theo index
   * @param {HTMLElement} tableEl - element tạo bởi create()
   * @param {number} rowIndex
   * @param {Object} patch - { value, color }
   */
  function updateRow(tableEl, rowIndex, patch) {
    if (!tableEl || !patch) return;
    var row = tableEl.querySelector('[data-kv-row-index="' + rowIndex + '"]');
    if (!row) return;
    if (patch.value !== undefined) {
      var valEl = row.querySelector('[data-kv-value]');
      if (valEl) valEl.textContent = String(patch.value);
    }
    if (patch.color !== undefined) {
      var valEl2 = row.querySelector('[data-kv-value]');
      if (valEl2) valEl2.style.color = _COLOR_MAP[patch.color] || patch.color;
    }
  }

  /**
   * Re-render toàn bộ table với rows mới
   * @param {HTMLElement} tableEl
   * @param {Array} rows
   */
  function setRows(tableEl, rows) {
    if (!tableEl) return;
    tableEl.innerHTML = '';
    (rows || []).forEach(function (row, i) {
      tableEl.appendChild(_buildRow(row, i));
    });
  }

  return {
    create: create,
    updateRow: updateRow,
    setRows: setRows
  };
})();


/* --- HallGauge.js --- */
/**
 * HallGauge Component
 * ─────────────────────────────────────────────
 * Hiển thị tình trạng sảnh/phòng với progress bar + số liệu
 * Dùng cho: Dashboard "Hoạt động trong ngày", trang Hall Status
 *
 * Usage:
 *   var el = HallGauge.create({
 *     total: 5,
 *     done: 2,
 *     ongoing: 3,
 *     label: 'sảnh hoạt động',
 *     doneLabel: 'Đã phục vụ xong',    // optional
 *     ongoingLabel: 'Đang phục vụ',    // optional
 *     color: '#4F46E5'                  // optional
 *   });
 *
 *   // Cập nhật không re-render
 *   HallGauge.update(el, { done: 3, ongoing: 2 });
 */
var HallGauge = (function () {

  /**
   * Tính phần trăm và đảm bảo [0, 100]
   */
  function _pct(part, total) {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((part / total) * 100));
  }

  /**
   * Tạo HallGauge element
   * @param {Object} opts
   * @param {number} opts.total
   * @param {number} opts.done
   * @param {number} opts.ongoing
   * @param {string} [opts.label='sảnh hoạt động']
   * @param {string} [opts.doneLabel='Đã phục vụ xong']
   * @param {string} [opts.ongoingLabel='Đang phục vụ']
   * @param {string} [opts.color] - CSS color, default = --color-primary
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var total   = opts.total   || 0;
    var done    = opts.done    || 0;
    var ongoing = opts.ongoing || 0;
    var label       = opts.label       || 'đang hoạt động';
    var doneLabel    = opts.doneLabel    || 'Đã phục vụ xong';
    var ongoingLabel = opts.ongoingLabel || 'Đang phục vụ';
    var color = opts.color || 'var(--color-primary)';

    var activePct = _pct(ongoing, total);

    var wrap = document.createElement('div');
    wrap.className = 'hall-gauge';

    wrap.innerHTML =
      '<div class="hall-gauge__title">' +
        '<span class="material-symbols-outlined hall-gauge__icon">location_city</span>' +
        (opts.titleText || 'Sảnh tiệc hôm nay') +
      '</div>' +
      '<div class="hall-gauge__count">' +
        '<span class="hall-gauge__count-num" data-hg-total>' + total + '</span>' +
        '<span class="hall-gauge__count-label">' + label + '</span>' +
      '</div>' +
      '<div class="hall-gauge__bar-row">' +
        '<div class="hall-gauge__bar">' +
          '<div class="hall-gauge__fill" data-hg-fill' +
            ' style="width:0%; background:' + color + '"></div>' +
        '</div>' +
        '<span class="hall-gauge__pct" data-hg-pct style="color:' + color + '">0%</span>' +
      '</div>' +
      '<div class="hall-gauge__sub">' +
        '<span>' + doneLabel + ': <strong data-hg-done>' + done + '</strong></span>' +
        '<span>' + ongoingLabel + ': <strong data-hg-ongoing>' + ongoing + '</strong></span>' +
      '</div>';

    // Animate fill sau 1 frame để CSS transition hoạt động
    setTimeout(function () {
      var fill = wrap.querySelector('[data-hg-fill]');
      var pctEl = wrap.querySelector('[data-hg-pct]');
      if (fill) fill.style.width = activePct + '%';
      if (pctEl) pctEl.textContent = activePct + '%';
    }, 80);

    return wrap;
  }

  /**
   * Cập nhật HallGauge không re-render
   * @param {HTMLElement} el - element tạo bởi create()
   * @param {Object} patch - { total, done, ongoing }
   */
  function update(el, patch) {
    if (!el || !patch) return;

    var total   = parseInt(el.querySelector('[data-hg-total]').textContent)   || 0;
    var done    = parseInt(el.querySelector('[data-hg-done]').textContent)    || 0;
    var ongoing = parseInt(el.querySelector('[data-hg-ongoing]').textContent) || 0;

    if (patch.total   !== undefined) total   = patch.total;
    if (patch.done    !== undefined) done    = patch.done;
    if (patch.ongoing !== undefined) ongoing = patch.ongoing;

    var activePct = _pct(ongoing, total);

    var totalEl   = el.querySelector('[data-hg-total]');
    var doneEl    = el.querySelector('[data-hg-done]');
    var ongoingEl = el.querySelector('[data-hg-ongoing]');
    var fillEl    = el.querySelector('[data-hg-fill]');
    var pctEl     = el.querySelector('[data-hg-pct]');

    if (totalEl)   totalEl.textContent   = total;
    if (doneEl)    doneEl.textContent    = done;
    if (ongoingEl) ongoingEl.textContent = ongoing;
    if (fillEl)    fillEl.style.width    = activePct + '%';
    if (pctEl)     pctEl.textContent     = activePct + '%';
  }

  return {
    create: create,
    update: update
  };
})();


/* --- SectionPanel.js --- */
/**
 * SectionPanel Component
 * ─────────────────────────────────────────────
 * Wrapper card có header: icon + tiêu đề + actions (period select, refresh)
 * Dùng cho: Mọi section trên dashboard, báo cáo, bảng tóm tắt
 *
 * Usage:
 *   var result = SectionPanel.create({
 *     icon: 'calendar_today',
 *     title: 'HOẠT ĐỘNG TRONG NGÀY',
 *     trailing: '(22/05/2026 - 10:28)',   // optional
 *     actions: [
 *       {
 *         type: 'select',
 *         id: 'period-revenue',
 *         options: [
 *           { value: 'week', label: 'Tuần này' },
 *           { value: 'month', label: 'Tháng này' }
 *         ],
 *         defaultValue: 'week',
 *         onChange: function(val) { ... }
 *       },
 *       {
 *         type: 'refresh',
 *         onClick: function() { ... }
 *       },
 *       {
 *         type: 'custom',
 *         element: HTMLElement    // bất kỳ element nào
 *       }
 *     ]
 *   });
 *
 *   // result.panel  = toàn bộ wrapper (để appendChild vào container)
 *   // result.body   = nơi để append nội dung bên trong
 *
 *   result.body.appendChild(myContent);
 *   document.getElementById('some-wrap').appendChild(result.panel);
 *
 *   // Cập nhật trailing text (vd: timestamp)
 *   SectionPanel.setTrailing(result.panel, '(22/05/2026 - 10:30)');
 */
var SectionPanel = (function () {

  /**
   * Build 1 action element từ config
   */
  function _buildAction(action) {
    if (!action) return null;

    if (action.type === 'refresh') {
      var btn = document.createElement('button');
      // Kế thừa .btn (cursor, transition, font) + .btn-tool (compact, transparent)
      btn.className = 'btn btn-tool section-panel__refresh-btn';
      btn.title = 'Làm mới';
      if (action.id) btn.id = action.id;
      btn.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
      if (typeof action.onClick === 'function') {
        btn.addEventListener('click', action.onClick);
      }
      return btn;
    }

    if (action.type === 'select') {
      var sel = document.createElement('select');
      sel.className = 'section-panel__period-select';
      if (action.id) sel.id = action.id;
      (action.options || []).forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === action.defaultValue) o.selected = true;
        sel.appendChild(o);
      });
      if (typeof action.onChange === 'function') {
        sel.addEventListener('change', function () {
          action.onChange(sel.value);
        });
      }
      return sel;
    }

    if (action.type === 'custom' && action.element) {
      return action.element;
    }

    return null;
  }

  /**
   * Tạo SectionPanel
   * @param {Object} opts
   * @param {string}  [opts.icon]       - Material Symbol name
   * @param {string}  opts.title        - Tiêu đề (uppercase)
   * @param {string}  [opts.trailing]   - text sau tiêu đề (vd: timestamp)
   * @param {Array}   [opts.actions]    - mảng action objects
   * @param {string}  [opts.id]         - id cho wrapper panel
   * @param {string}  [opts.className]  - thêm class vào wrapper
   * @returns {{ panel: HTMLElement, body: HTMLElement, header: HTMLElement }}
   */
  function create(opts) {
    opts = opts || {};

    // Wrapper
    var panel = document.createElement('div');
    // Kế thừa .card (background, border, shadow, border-radius, overflow)
    panel.className = 'card section-panel' + (opts.className ? ' ' + opts.className : '');
    if (opts.id) panel.id = opts.id;

    // ── Header ──
    var header = document.createElement('div');
    // Kế thừa .card-header (border-bottom, flex, align-items)
    header.className = 'card-header section-panel__header';

    // Title group (icon + title + trailing)
    var titleGroup = document.createElement('span');
    titleGroup.className = 'section-panel__title';

    if (opts.icon) {
      var iconEl = document.createElement('span');
      iconEl.className = 'material-symbols-outlined section-panel__icon';
      iconEl.textContent = opts.icon;
      titleGroup.appendChild(iconEl);
    }

    var titleText = document.createElement('span');
    titleText.className = 'section-panel__title-text';
    titleText.textContent = opts.title || '';
    titleGroup.appendChild(titleText);

    if (opts.trailing) {
      var trailing = document.createElement('span');
      trailing.className = 'section-panel__trailing';
      trailing.dataset.spTrailing = '1';
      trailing.textContent = opts.trailing;
      titleGroup.appendChild(trailing);
    }

    header.appendChild(titleGroup);

    // Actions group
    if (opts.actions && opts.actions.length > 0) {
      var actionsGroup = document.createElement('div');
      actionsGroup.className = 'section-panel__actions';
      opts.actions.forEach(function (action) {
        var el = _buildAction(action);
        if (el) actionsGroup.appendChild(el);
      });
      header.appendChild(actionsGroup);
    }

    // ── Body ──
    var body = document.createElement('div');
    body.className = 'section-panel__body';

    panel.appendChild(header);
    panel.appendChild(body);

    return { panel: panel, body: body, header: header };
  }

  /**
   * Cập nhật trailing text (vd: timestamp thay đổi)
   * @param {HTMLElement} panelEl - panel element từ create()
   * @param {string} text
   */
  function setTrailing(panelEl, text) {
    if (!panelEl) return;
    var el = panelEl.querySelector('[data-sp-trailing]');
    if (el) {
      el.textContent = text;
    } else {
      // Tạo mới nếu chưa có
      var titleGroup = panelEl.querySelector('.section-panel__title');
      if (titleGroup) {
        var trailing = document.createElement('span');
        trailing.className = 'section-panel__trailing';
        trailing.dataset.spTrailing = '1';
        trailing.textContent = text;
        titleGroup.appendChild(trailing);
      }
    }
  }

  return {
    create: create,
    setTrailing: setTrailing
  };
})();


/* --- ReportFilterDialog.js --- */
/**
 * ReportFilterDialog Component
 * ─────────────────────────────────────────────
 * Dialog "Chọn báo cáo / Lọc" — các field được fetch động từ API
 * theo cùng pattern với DynamicFormEngine (API_LayCacTruongGiaoDien)
 *
 * Usage:
 *   ReportFilterDialog.open({
 *     formName: 'frmReportFilter',       // Tên form trong SY_FormatFields
 *     title: 'Chọn báo cáo',             // optional
 *     onConfirm: function(values) {      // values = { fieldName: value, ... }
 *       console.log(values);
 *     }
 *   });
 *
 * Schema field (từ API_LayCacTruongGiaoDien):
 *   renderRule = ''   → text input
 *   renderRule = 'dt' → date input
 *   renderRule = 'nm' → number input
 *   renderRule = 'sl' → select (dataSource = API path hoặc STATIC:v1=Nhãn 1,v2=Nhãn 2)
 *   renderRule = 'sr' → select + search (SearchDropdown)
 *   renderRule = 'dr' → date range (Từ ngày + Đến ngày trên cùng dòng)
 */
var ReportFilterDialog = (function () {

  var _apiDictionary = '/api/API_LayCacTruongGiaoDien';
  var _activeModal = null;

  // ── Helpers ──────────────────────────────────────────────────

  function _currentUser() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Username || u.UserName || u.username || 'Admin';
  }

  /**
   * Fetch field schema từ API (có cache RAM giống DynamicFormEngine)
   */
  function _fetchSchema(formName) {
    var cacheKey = 'ReportFilterSchema_' + formName;
    var cached = window._reportFilterSchemaCache && window._reportFilterSchemaCache[cacheKey];
    if (cached) return Promise.resolve(JSON.parse(cached));

    return ApiClient.post(_apiDictionary, {
      FormName: formName,
      UserName: _currentUser()
    }).then(function (res) {
      if (res && res.code === 0 && (res.list || res.records)) {
        window._reportFilterSchemaCache = window._reportFilterSchemaCache || {};
        window._reportFilterSchemaCache[cacheKey] = JSON.stringify(res);
      }
      return res;
    });
  }

  /**
   * Fetch datasource cho select field
   * dataSource format:
   *   '/api/API_DanhSachKhuVuc'       → gọi API, lấy [{ value, label }]
   *   'STATIC:--Tất cả--=,value1=Nhãn 1,value2=Nhãn 2'
   */
  function _fetchOptions(dataSource, valueField, labelField) {
    if (!dataSource) return Promise.resolve([]);

    // STATIC: prefix
    if (dataSource.indexOf('STATIC:') === 0) {
      var raw = dataSource.substring(7);
      var opts = raw.split(',').map(function (item) {
        var parts = item.split('=');
        return { value: parts[1] !== undefined ? parts[1] : parts[0], label: parts[0] };
      });
      return Promise.resolve(opts);
    }

    // API call
    return ApiClient.post(dataSource, { UserName: _currentUser() })
      .then(function (res) {
        var list = (res && (res.list || res.records)) || [];
        return list.map(function (item) {
          return {
            value: item[valueField || 'Value'] || item.value || item.ID || item.id || '',
            label: item[labelField || 'Label'] || item.label || item.Name || item.Ten || ''
          };
        });
      })
      .catch(function () { return []; });
  }

  // ── Field Builders ────────────────────────────────────────────

  /**
   * Tạo 1 row wrapper label + input
   * @param {string} label
   * @param {boolean} required
   * @param {HTMLElement} inputEl
   * @param {string} [visibleRule] - lưu vào data-attribute để _applyVisibleRules đọc
   */
  function _buildRow(label, required, inputEl, visibleRule) {
    var row = document.createElement('div');
    row.className = 'rfd-row';
    if (visibleRule) row.dataset.visibleRule = visibleRule;

    var lbl = document.createElement('label');
    lbl.className = 'rfd-label';
    lbl.textContent = label + (required ? ' (*)' : '');

    row.appendChild(lbl);
    row.appendChild(inputEl);
    return row;
  }

  /**
   * Render field theo renderRule
   * Trả về { row: HTMLElement, getValue: fn, setValue: fn }
   */
  function _buildField(field) {
    var rule = (field.renderRule || '').toLowerCase().trim();
    var name = field.name;
    var label = field.label;
    var required = field.required;
    var defaultVal = field.defaultValue || '';
    var visibleRule = field.visibleRule || '';

    // ── Date range (dr): Từ ngày + Đến ngày trên cùng hàng ──
    if (rule === 'dr') {
      var row = document.createElement('div');
      row.className = 'rfd-row';

      var lbl = document.createElement('label');
      lbl.className = 'rfd-label';
      lbl.textContent = label;
      row.appendChild(lbl);

      var rangeWrap = document.createElement('div');
      rangeWrap.className = 'rfd-date-range';

      var fromInput = document.createElement('input');
      fromInput.type = 'date';
      fromInput.className = 'ui-input rfd-input';
      fromInput.dataset.fieldName = name + '_From';
      if (defaultVal) fromInput.value = defaultVal;

      var sep = document.createElement('span');
      sep.className = 'rfd-date-sep';
      sep.textContent = 'Đến';

      var toInput = document.createElement('input');
      toInput.type = 'date';
      toInput.className = 'ui-input rfd-input';
      toInput.dataset.fieldName = name + '_To';

      rangeWrap.appendChild(fromInput);
      rangeWrap.appendChild(sep);
      rangeWrap.appendChild(toInput);
      row.appendChild(rangeWrap);
      if (visibleRule) row.dataset.visibleRule = visibleRule;

      return {
        row: row,
        getValue: function () {
          var obj = {};
          obj[name + '_From'] = fromInput.value;
          obj[name + '_To'] = toInput.value;
          return obj;
        },
        setValue: function (v) {
          if (v && v[name + '_From']) fromInput.value = v[name + '_From'];
          if (v && v[name + '_To']) toInput.value = v[name + '_To'];
        }
      };
    }

    // ── Date (dt) ──
    if (rule === 'dt') {
      var input = document.createElement('input');
      input.type = 'date';
      input.className = 'ui-input rfd-input';
      input.dataset.fieldName = name;
      input.required = required;
      if (defaultVal) input.value = defaultVal;

      return {
        row: _buildRow(label, required, input, visibleRule),
        getValue: function () { var o = {}; o[name] = input.value; return o; },
        setValue: function (v) { input.value = v || ''; }
      };
    }

    // ── Number (nm) ──
    if (rule === 'nm') {
      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'ui-input rfd-input';
      input.dataset.fieldName = name;
      input.required = required;
      if (defaultVal) input.value = defaultVal;

      return {
        row: _buildRow(label, required, input, visibleRule),
        getValue: function () { var o = {}; o[name] = input.value; return o; },
        setValue: function (v) { input.value = v || ''; }
      };
    }

    // ── Select (sl hoặc sr) ──
    if (rule === 'sl' || rule === 'sr') {
      var sel = document.createElement('select');
      sel.className = 'ui-input rfd-input rfd-select';
      sel.dataset.fieldName = name;
      sel.required = required;

      // Placeholder option
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '--Tất cả--';
      sel.appendChild(placeholder);

      // Load options async
      _fetchOptions(field.dataSource, field.valueField, field.labelField)
        .then(function (opts) {
          opts.forEach(function (opt) {
            var o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === defaultVal) o.selected = true;
            sel.appendChild(o);
          });
          if (defaultVal) sel.value = defaultVal;
        });

      // sr = select + search icon (dùng SearchDropdown nếu có)
      var wrap = sel;
      if (rule === 'sr' && typeof SearchDropdown !== 'undefined') {
        // SearchDropdown sẽ wrap select thành combobox có tìm kiếm
        // (SearchDropdown.attachTo pattern)
        // Giữ nguyên select để đơn giản, tích hợp sau
      }

      return {
        row: _buildRow(label, required, wrap, visibleRule),
        getValue: function () { var o = {}; o[name] = sel.value; return o; },
        setValue: function (v) { sel.value = v || ''; }
      };
    }

    // ── Default: text input ──
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'ui-input rfd-input';
    input.dataset.fieldName = name;
    input.required = required;
    input.placeholder = field.placeholder || '';
    if (defaultVal) input.value = defaultVal;

    return {
      row: _buildRow(label, required, input, visibleRule),
      getValue: function () { var o = {}; o[name] = input.value; return o; },
      setValue: function (v) { input.value = v || ''; }
    };
  }

  // ── VisibleRule Engine ────────────────────────────────────────

  /**
   * Parse và áp VisibleRule cho toàn bộ fields trong body
   *
   * VisibleRule syntax (lưu trong SY_FormatFields.VisibleRule):
   *   "KyBaoCao=custom"         → hiện khi KyBaoCao = 'custom'
   *   "KyBaoCao=custom|today"   → hiện khi KyBaoCao = 'custom' HOẶC 'today'
   *   "HinhThucPV!=online"      → hiện khi HinhThucPV KHÁC 'online'
   *   "field1=v1&field2=v2"     → hiện khi CẢ HAI điều kiện đúng (AND)
   *
   * @param {HTMLElement} body - container chứa các .rfd-row
   */
  function _applyVisibleRules(body) {
    var rows = Array.from(body.querySelectorAll('.rfd-row[data-visible-rule]'));
    if (!rows.length) return;

    /**
     * Parse 1 rule string thành mảng điều kiện AND
     * Mỗi điều kiện: { field, op: '='|'!=', values: [] }
     */
    function _parseRule(ruleStr) {
      return ruleStr.split('&').map(function (part) {
        part = part.trim();
        var op = part.indexOf('!=') !== -1 ? '!=' : '=';
        var sides = part.split(op === '!=' ? '!=' : '=');
        return {
          field: sides[0].trim(),
          op: op,
          values: (sides[1] || '').split('|').map(function (v) { return v.trim().toLowerCase(); })
        };
      });
    }

    /**
     * Lấy giá trị hiện tại của 1 input trong body theo fieldName
     */
    function _getFieldValue(fieldName) {
      var el = body.querySelector('[data-field-name="' + fieldName + '"]');
      return el ? (el.value || '').toLowerCase() : '';
    }

    /**
     * Đánh giá 1 rule string → true/false
     */
    function _evaluate(ruleStr) {
      var conditions = _parseRule(ruleStr);
      return conditions.every(function (cond) {
        var current = _getFieldValue(cond.field);
        var match = cond.values.indexOf(current) !== -1;
        return cond.op === '=' ? match : !match;
      });
    }

    /**
     * Áp visibility cho 1 row
     */
    function _applyRow(row) {
      var rule = row.dataset.visibleRule;
      if (!rule) return;
      var visible = _evaluate(rule);
      row.style.display = visible ? '' : 'none';
      // Disable required validation cho field ẩn
      var inputs = row.querySelectorAll('input, select');
      inputs.forEach(function (inp) {
        inp.disabled = !visible;
      });
    }

    // Áp trạng thái ban đầu
    rows.forEach(function (row) { _applyRow(row); });

    // Tìm tất cả trigger fields (fields được tham chiếu trong VisibleRule)
    var triggerFields = {};
    rows.forEach(function (row) {
      var rule = row.dataset.visibleRule || '';
      _parseRule(rule).forEach(function (cond) {
        if (!triggerFields[cond.field]) triggerFields[cond.field] = [];
        triggerFields[cond.field].push(row);
      });
    });

    // Đăng ký change listener trên trigger inputs
    Object.keys(triggerFields).forEach(function (fieldName) {
      var triggerEl = body.querySelector('[data-field-name="' + fieldName + '"]');
      if (!triggerEl) return;
      triggerEl.addEventListener('change', function () {
        triggerFields[fieldName].forEach(function (row) { _applyRow(row); });
      });
      // input event cho text fields
      triggerEl.addEventListener('input', function () {
        triggerFields[fieldName].forEach(function (row) { _applyRow(row); });
      });
    });
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Mở dialog filter
   * @param {Object} opts
   * @param {string} opts.formName         - FormName trong SY_FormatFields
   * @param {string} [opts.title]          - Tiêu đề dialog, mặc định 'Chọn báo cáo'
   * @param {string} [opts.apiDictionary]  - Override API endpoint
   * @param {Object} [opts.defaultValues]  - Giá trị mặc định { fieldName: value }
   * @param {Function} opts.onConfirm      - Callback khi bấm Đồng ý, nhận (values)
   * @param {Function} [opts.onCancel]     - Callback khi bấm Hủy
   */
  function open(opts) {
    opts = opts || {};
    if (!opts.formName) { console.error('ReportFilterDialog: formName is required'); return; }
    if (opts.apiDictionary) _apiDictionary = opts.apiDictionary;

    var title = opts.title || 'Chọn báo cáo';

    // ── Build modal body ──
    var body = document.createElement('div');
    body.className = 'rfd-body';
    body.innerHTML = '<div class="rfd-loading"><span class="material-symbols-outlined rfd-spin">progress_activity</span> Đang tải...</div>';

    // Footer
    var footer = document.createElement('div');
    footer.className = 'rfd-footer';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-secondary';
    btnCancel.textContent = 'Hủy bỏ';

    var btnOk = document.createElement('button');
    btnOk.className = 'btn btn-primary';
    btnOk.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">check</span> Đồng ý';

    footer.appendChild(btnCancel);
    footer.appendChild(btnOk);

    // Show modal
    _activeModal = UIModal.show({
      title: title,
      content: body,
      footer: footer,
      width: opts.width || '480px'
    });

    btnCancel.onclick = function () {
      if (_activeModal) _activeModal.closeNow();
      if (typeof opts.onCancel === 'function') opts.onCancel();
    };

    // ── Fetch schema & render fields ──
    var _fields = []; // { getValue, setValue }

    _fetchSchema(opts.formName)
      .then(function (res) {
        body.innerHTML = '';
        var dataList = (res && (res.list || res.records)) || [];

        if (!dataList.length) {
          body.innerHTML = '<div style="color:var(--color-text-secondary);padding:16px;">Không tìm thấy cấu hình filter cho form: ' + opts.formName + '</div>';
          return;
        }

        // Sort theo OrderNo
        dataList.sort(function (a, b) { return (a.OrderNo || a.orderNo || 0) - (b.OrderNo || b.orderNo || 0); });

        dataList.forEach(function (item) {
          var fieldDef = {
            name: item.name || item.FieldName,
            label: item.label || item.CaptionVN,
            required: String(item.required || item.IsRequired) === '1',
            renderRule: (item.renderRule || item.FormatID || '').toLowerCase().trim(),
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            valueField: item.valueField || item.ValueField || 'Value',
            labelField: item.labelField || item.LabelField || 'Label',
            defaultValue: item.defaultValue || item.DefaultValue || '',
            placeholder: item.placeholder || '',
            visibleRule: (item.visibleRule || item.VisibleRule || '').trim()  // ← mới
          };

          var built = _buildField(fieldDef);
          _fields.push({ name: fieldDef.name, field: built });

          // Áp defaultValues nếu có
          if (opts.defaultValues && opts.defaultValues[fieldDef.name] !== undefined) {
            built.setValue(opts.defaultValues[fieldDef.name]);
          }

          body.appendChild(built.row);
        });

        // Áp VisibleRule sau khi tất cả fields đã vào DOM
        if (typeof UIControls !== 'undefined' && UIControls.utils) {
          UIControls.utils.applyVisibleRules(body);
        }
      })
      .catch(function (err) {
        body.innerHTML = '<div style="color:var(--color-danger);padding:16px;">Lỗi tải cấu hình: ' + (err.message || '') + '</div>';
      });

    // ── Confirm ──
    btnOk.onclick = function () {
      // Validate required
      var hasError = false;
      var values = {};

      _fields.forEach(function (f) {
        var v = f.field.getValue();
        Object.assign(values, v);
      });

      // Simple required check
      _fields.forEach(function (f) {
        var v = values[f.name];
        if (f.field.row && f.field.row.querySelector('[required]')) {
          var inp = f.field.row.querySelector('[required]');
          if (inp && !inp.value) {
            inp.style.borderColor = 'var(--color-danger)';
            hasError = true;
          } else if (inp) {
            inp.style.borderColor = '';
          }
        }
      });

      if (hasError) {
        if (typeof Toast !== 'undefined') Toast.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
        return;
      }

      if (_activeModal) _activeModal.closeNow();
      if (typeof opts.onConfirm === 'function') opts.onConfirm(values);
    };
  }

  /**
   * Xóa cache schema (dùng khi cấu hình thay đổi)
   * @param {string} [formName] - Nếu không truyền, xóa tất cả
   */
  function clearCache(formName) {
    if (!window._reportFilterSchemaCache) return;
    if (formName) {
      delete window._reportFilterSchemaCache['ReportFilterSchema_' + formName];
    } else {
      window._reportFilterSchemaCache = {};
    }
  }

  return {
    open: open,
    clearCache: clearCache
  };
})();


/* --- UIUtils.js --- */
/**
 * Shared UI Utilities for Components
 */
var UIControls = window.UIControls || {};

UIControls.utils = (function() {
  /**
   * Tính toán vụ trí Dropdown thông minh (Tránh tràn màn hình)
   */
  function computeDropdownPosition(inputElement, dropdownElement) {
    var rect = inputElement.getBoundingClientRect();

    // Navbar: giới hạn top khi mở lên trên
    var navbarBottom = 0;
    var navbar = document.querySelector('.app-navbar');
    if (navbar) navbarBottom = navbar.getBoundingClientRect().bottom;

    // position:fixed — tọa độ viewport, không bị ảnh hưởng bởi overflow:hidden
    dropdownElement.style.position   = 'fixed';
    dropdownElement.style.zIndex     = '10000000';
    dropdownElement.style.transition = 'opacity 0.15s ease, visibility 0.15s ease';
    dropdownElement.style.minWidth   = rect.width + 'px';

    var isActive = dropdownElement.classList.contains('active');
    if (!isActive) {
      dropdownElement.style.maxHeight  = '300px';
      dropdownElement.style.visibility = 'hidden';
      dropdownElement.classList.add('active');
    }

    var dropWidth  = dropdownElement.offsetWidth;
    var dropHeight = dropdownElement.offsetHeight;

    // --- Tính toán Left ---
    var leftPos = rect.left;
    if (leftPos + dropWidth > window.innerWidth - 10) {
      // Nếu tràn phải -> Căn lề phải với input
      leftPos = rect.right - dropWidth;
    }
    // Đảm bảo không tràn trái
    leftPos = Math.max(10, leftPos);
    dropdownElement.style.left = leftPos + 'px';

    // --- Tính toán Top ---
    var spaceBelow = window.innerHeight - rect.bottom;
    var spaceAbove = rect.top - navbarBottom;

    if (spaceBelow < dropHeight && spaceAbove > spaceBelow) {
      if (spaceAbove < dropHeight) {
        dropdownElement.style.maxHeight = (spaceAbove - 4) + 'px';
        dropHeight = dropdownElement.offsetHeight;
      }
      var topPos = Math.max(rect.top - dropHeight, navbarBottom + 4);
      dropdownElement.style.top = topPos + 'px';
    } else {
      if (spaceBelow < dropHeight) {
        dropdownElement.style.maxHeight = (spaceBelow - 4) + 'px';
      }
      dropdownElement.style.top = rect.bottom + 'px';
    }

    if (!isActive) {
      dropdownElement.classList.remove('active');
      dropdownElement.style.visibility = '';
    }
  }

  /**
   * Tìm tất cả scrollable ancestors từ một element
   */
  function getScrollableAncestors(el) {
    var ancestors = [];
    var node = el.parentElement;
    while (node && node !== document.documentElement) {
      var style = window.getComputedStyle(node);
      var ov = style.overflow + style.overflowY + style.overflowX;
      if (/auto|scroll/.test(ov)) {
        ancestors.push(node);
      }
      node = node.parentElement;
    }
    ancestors.push(window);
    return ancestors;
  }




  /**
   * Sinh HTML cho Dropdown Table List
   */
  function createDropdownTableHTML(headers, data, colHighlightIndex) {
    var theadHTML = headers.map(h => `<th>${h}</th>`).join('');
    var tbodyHTML = data.map(function(row, rIdx) {
      // Chỉ render số lượng cột bằng với số lượng headers, các cột thừa sẽ bị ẩn (để dùng cho Auto-fill)
      var displayRow = row.slice(0, headers.length);
      var cells = displayRow.map(function(cell, cIdx) {
        var cls = (cIdx === colHighlightIndex) ? 'highlight-col' : '';
        return `<td class="${cls}">${cell}</td>`;
      }).join('');
      return `<tr data-index="${rIdx}">${cells}</tr>`;
    }).join('');

    return `
      <table class="dropdown-table">
        <thead><tr>${theadHTML}</tr></thead>
        <tbody>${tbodyHTML}</tbody>
      </table>
    `;
  }

  return {
    computeDropdownPosition: computeDropdownPosition,
    getScrollableAncestors: getScrollableAncestors,
    createDropdownTableHTML: createDropdownTableHTML,
    /**
     * Setup single row selection for a table
     */
    setupTableSelection: function(tableBody, onSelect) {
      if (!tableBody) return;
      tableBody.addEventListener('click', function(e) {
        var tr = e.target.closest('tr');
        if (!tr) return;
        
        var isAlreadyActive = tr.classList.contains('active');
        
        // Remove active from all rows
        Array.from(tableBody.querySelectorAll('tr')).forEach(r => r.classList.remove('active'));
        
        // If it wasn't active, make it active
        if (!isAlreadyActive) {
          tr.classList.add('active');
          if (typeof onSelect === 'function') onSelect(tr);
        } else {
          // If it was already active, we just removed it above, so we pass null to onSelect
          if (typeof onSelect === 'function') onSelect(null);
        }
      });
    },

    /**
     * Áp VisibleRule cho các field trong một container (form modal hoặc filter dialog)
     *
     * Syntax (lưu trong SY_FormatFields.VisibleRule):
     *   "fieldA=val"           → hiện khi fieldA = val
     *   "fieldA=v1|v2"         → hiện khi fieldA = v1 HOẶC v2
     *   "fieldA!=val"          → hiện khi fieldA KHÁC val
     *   "fieldA=v1&fieldB=v2"  → hiện khi CẢ HAI đúng (AND)
     *
     * @param {HTMLElement} container  - Phần tử chứa các field (form body, dialog body)
     * @param {string} [rowSelector]   - CSS selector của "row" cần show/hide
     *                                   Mặc định '[data-visible-rule]'
     * @param {string} [fieldSelector] - Cách tìm input theo fieldName
     *                                   'data'  → dùng [data-field-name="x"]  (ReportFilterDialog)
     *                                   'name'  → dùng [name="x"]             (DynamicFormEngine)
     *                                   Mặc định: thử data-field-name trước, fallback name
     */
    applyVisibleRules: function(container, rowSelector, fieldSelector) {
      rowSelector = rowSelector || '[data-visible-rule]';
      var rows = Array.from(container.querySelectorAll(rowSelector));
      if (!rows.length) return;

      function _parseRule(ruleStr) {
        return ruleStr.split('&').map(function(part) {
          part = part.trim();
          var op = part.indexOf('!=') !== -1 ? '!=' : '=';
          var sides = part.split(op === '!=' ? '!=' : '=');
          return {
            field: sides[0].trim(),
            op: op,
            values: (sides[1] || '').split('|').map(function(v) { return v.trim().toLowerCase(); })
          };
        });
      }

      function _getFieldValue(fieldName) {
        // Thử data-field-name trước (ReportFilterDialog), fallback sang name (DynamicFormEngine)
        var el = container.querySelector('[data-field-name="' + fieldName + '"]')
               || container.querySelector('[name="' + fieldName + '"]');
        return el ? (el.value || '').toLowerCase() : '';
      }

      function _evaluate(ruleStr) {
        return _parseRule(ruleStr).every(function(cond) {
          var current = _getFieldValue(cond.field);
          var match = cond.values.indexOf(current) !== -1;
          return cond.op === '=' ? match : !match;
        });
      }

      function _applyRow(row) {
        var rule = row.dataset.visibleRule;
        if (!rule) return;
        var visible = _evaluate(rule);
        row.style.display = visible ? '' : 'none';
        // Disable input ẩn để không bị validate và không serialize vào payload
        row.querySelectorAll('input, select, textarea').forEach(function(inp) {
          inp.disabled = !visible;
        });
      }

      // Áp trạng thái ban đầu
      rows.forEach(function(row) { _applyRow(row); });

      // Tìm trigger fields và đăng ký change listener
      var triggerMap = {};
      rows.forEach(function(row) {
        _parseRule(row.dataset.visibleRule || '').forEach(function(cond) {
          if (!triggerMap[cond.field]) triggerMap[cond.field] = [];
          triggerMap[cond.field].push(row);
        });
      });

      Object.keys(triggerMap).forEach(function(fieldName) {
        var triggerEl = container.querySelector('[data-field-name="' + fieldName + '"]')
                      || container.querySelector('[name="' + fieldName + '"]');
        if (!triggerEl) return;
        var handler = function() {
          triggerMap[fieldName].forEach(function(row) { _applyRow(row); });
        };
        triggerEl.addEventListener('change', handler);
        triggerEl.addEventListener('input', handler);
      });
    }
  };
})();



/* --- Navbar.js --- */
/**
 * Navbar Component
 * Thanh điều hướng ngang trên cùng — thay thế sidebar dọc.
 * Có dropdown xổ xuống cho từng nhóm menu.
 * Hỗ trợ chuyển đổi layout ngang ↔ dọc (sidebar mode).
 */
var Navbar = (function () {

  /* ─────────────────────────────────────────
     Layout Mode (lưu vào localStorage)
  ───────────────────────────────────────── */
  var LAYOUT_KEY = 'pmql_layout_mode';
  var LAYOUT_HORIZONTAL = 'horizontal';
  var LAYOUT_VERTICAL = 'vertical';

  function getLayout() {
    return localStorage.getItem(LAYOUT_KEY) || LAYOUT_HORIZONTAL;
  }

  function setLayout(mode) {
    localStorage.setItem(LAYOUT_KEY, mode);
  }

  /* Áp dụng layout lên <body> */
  function applyLayout(mode) {
    document.body.setAttribute('data-layout', mode);

    var $app = document.getElementById('app');
    if (!$app) return;

    if (mode === LAYOUT_VERTICAL) {
      $app.classList.add('layout-vertical');
      $app.classList.remove('layout-horizontal');
    } else {
      $app.classList.add('layout-horizontal');
      $app.classList.remove('layout-vertical');
    }
  }

  /* ─────────────────────────────────────────
     Cấu hình menu — load từ DB (100% dynamic)
  ───────────────────────────────────────── */
  var NAV_CONFIG = [];

  function _buildConfigFromDB(dbMenus) {
    var config = [];
    // API trả về: id, parent, label, icon, URLPara
    var parents = dbMenus.filter(function (m) { return !m.parent || String(m.parent).trim() === ''; });
    parents.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });

    parents.forEach(function (p) {
      var children = dbMenus.filter(function (m) { return m.parent === p.id; });
      if (children.length > 0) {
        children.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
        var items = children.map(function (c) {
          return {
            href: c.URLPara || c.urlPara || c.FormKey || '',
            icon: c.icon || c.IconClass || 'circle',
            label: c.label || c.TenMenu || c.VN || ''
          };
        });
        config.push({
          type: 'group',
          icon: p.icon || p.IconClass || 'folder',
          label: p.label || p.TenMenu || p.VN || '',
          items: items
        });
      } else {
        config.push({
          type: 'link',
          href: p.URLPara || p.urlPara || p.FormKey || '',
          icon: p.icon || p.IconClass || 'link',
          label: p.label || p.TenMenu || p.VN || ''
        });
      }
    });
    return config;
  }

  /* ─────────────────────────────────────────
     Build HTML helpers
  ───────────────────────────────────────── */
  function _buildMenuHTML() {
    return NAV_CONFIG.map(function (item) {
      if (item.type === 'link') {
        return `
          <a href="${item.href}" class="nav-link" data-href="${item.href}">
            <span class="material-symbols-outlined nav-icon">${item.icon}</span>
            ${item.label}
          </a>`;
      }

      var dropdownItems = item.items.map(function (di) {
        return `
          <a href="${di.href}" class="dropdown-item" data-href="${di.href}">
            <span class="material-symbols-outlined drop-icon">${di.icon}</span>
            ${di.label}
          </a>`;
      }).join('');

      return `
        <div class="nav-group" data-group>
          <button class="nav-group-btn">
            <span class="material-symbols-outlined nav-icon">${item.icon}</span>
            ${item.label}
            <span class="material-symbols-outlined chevron">expand_more</span>
          </button>
          <div class="nav-dropdown">
            ${dropdownItems}
          </div>
        </div>`;
    }).join('');
  }

  /* Sidebar nav items (for vertical mode) */
  function _buildSidebarNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="nav-item" data-href="${item.href}">
            <span class="material-symbols-outlined icon">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="nav-group-title">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="nav-item" data-href="${di.href}">
            <span class="material-symbols-outlined icon">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  /* Mobile drawer nav */
  function _buildMobileNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="mobile-nav-item" data-href="${item.href}">
            <span class="material-symbols-outlined">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="mobile-nav-divider"></div>
               <div class="mobile-nav-section-label">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="mobile-nav-item" data-href="${di.href}">
            <span class="material-symbols-outlined">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  /* ── Layout switcher buttons HTML ── */

  /* ─────────────────────────────────────────
     Render — Horizontal (Navbar) mode
  ───────────────────────────────────────── */
  function _renderHorizontal(container) {
    var layout = getLayout();
    var html = `
      <!-- ═══ TOP NAVBAR ═══ -->
      <nav class="app-navbar" id="app-navbar">

        <!-- Hamburger (mobile only) -->
        <button class="navbar-hamburger" id="navbar-hamburger">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Brand / Logo -->
        <div class="navbar-brand" onclick="window.location.hash='#/'" style="display:flex; align-items:center;">
          <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Tiệc Cưới Logo" style="width: 150px; height: auto; margin-left: 16px;">
          <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Tiệc Cưới Logo" style="width: 150px; height: auto; margin-left: 16px;">
        </div>

        <!-- Desktop Menu with scroll arrows -->
        <div class="navbar-menu-wrapper" id="navbar-menu-wrapper">
          <button class="navbar-scroll-arrow navbar-scroll-left" id="navbar-scroll-left" title="Cuộn trái">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <ul class="navbar-menu" id="navbar-menu">
            ${_buildMenuHTML()}
          </ul>
          <button class="navbar-scroll-arrow navbar-scroll-right" id="navbar-scroll-right" title="Cuộn phải">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- Right Actions -->
        <div class="navbar-right">
          <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
            <span class="material-symbols-outlined" id="header-theme-icon-horizontal">dark_mode</span>
          </div>
          <div class="navbar-icon-btn" id="navbar-btn-notif" title="Thông báo">
            <span class="material-symbols-outlined">notifications</span>
            <span class="badge-dot"></span>
          </div>
          <div class="navbar-user" id="navbar-user">
            <div class="user-avatar-nav">
              <img src="https://ui-avatars.com/api/?name=Admin&background=3C50E0&color=fff" alt="User">
            </div>
            <div class="user-info-nav">
              <div class="user-name-nav">Admin</div>
              <div class="user-role-nav">Quản trị hệ thống</div>
            </div>
            <span class="material-symbols-outlined expand-icon">expand_more</span>

            <!-- User dropdown -->
            <div class="user-dropdown" id="user-dropdown">
              <!-- No Header (Admin/Role removed) -->

              <div class="user-dropdown-item">
                <span class="material-symbols-outlined">person</span>
                Hồ sơ cá nhân
              </div>
              <a href="#/appearance" class="user-dropdown-item" style="text-decoration: none;">
                <span class="material-symbols-outlined">palette</span>
                Cài đặt Giao diện
              </a>

              <div class="dropdown-divider"></div>

              <div class="user-dropdown-item danger" onclick="ConfirmModal.show({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất khỏi hệ thống?', onConfirm: window.logoutApp })">
                <span class="material-symbols-outlined">logout</span>
                Đăng xuất
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- ═══ MOBILE DRAWER ═══ -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay"></div>
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-header">
          <div class="mobile-drawer-brand" style="display:flex; align-items:center; justify-content:center; width:100%; margin: 12px 0;">
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Tiệc Cưới Logo" style="width: 150px; height: auto; border-radius: 6px;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Tiệc Cưới Logo" style="width: 150px; height: auto;">
          </div>
          <button class="mobile-drawer-close" id="mobile-drawer-close">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <nav class="mobile-drawer-nav" id="mobile-drawer-nav">
          ${_buildMobileNavHTML()}
        </nav>
      </div>
    `;
    container.innerHTML = html;
    _attachHorizontalEvents();
  }

  /* ─────────────────────────────────────────
     Render — Vertical (Sidebar) mode
  ───────────────────────────────────────── */
  function _renderVertical(container) {
    var layout = getLayout();
    var html = `
      <!-- ════ VERTICAL LAYOUT: Sidebar + Header ════ -->
      <div class="vertical-layout-shell" id="vertical-layout-shell">

        <!-- Sidebar -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-header">
            <div style="display:flex; align-items:center; justify-content:flex-start; width:100%; margin: 16px 0; padding-left: 16px;">
              <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Tiệc Cưới Logo" style="width: 150px; height: auto; border-radius: 6px;">
              <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Tiệc Cưới Logo" style="width: 150px; height: auto;">
            </div>
            <button class="btn-close-sidebar" id="btn-close-sidebar">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          <nav class="sidebar-nav" id="sidebar-nav">
            ${_buildSidebarNavHTML()}
          </nav>
        </aside>

        <!-- Sidebar overlay (mobile) -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <!-- Main area (header + content) -->
        <div class="vertical-main" id="vertical-main">

          <!-- Vertical Header -->
          <header class="app-header" id="app-header">
            <div class="header-left">
              <button class="btn-hamburger" id="btn-hamburger">
                <span class="material-symbols-outlined">menu</span>
              </button>
              <div class="search-box">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Type to search...">
              </div>
            </div>

            <div class="header-right">
              <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
                <span class="material-symbols-outlined" id="header-theme-icon-vertical">dark_mode</span>
              </div>
              <div class="navbar-icon-btn" onclick="Alert.info('Thông báo', 'Bạn không có thông báo mới')">
                <span class="material-symbols-outlined">notifications</span>
                <span class="badge-dot"></span>
              </div>
              <div class="navbar-user" id="vertical-user-profile">
                <div class="user-avatar-nav">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=3C50E0&color=fff" alt="User">
                </div>
                <div class="user-info-nav">
                  <div class="user-name-nav">Admin</div>
                  <div class="user-role-nav">Quản trị hệ thống</div>
                </div>
                <span class="material-symbols-outlined expand-icon">expand_more</span>

                <!-- Vertical user dropdown -->
                <div class="user-dropdown" id="vertical-user-dropdown">
                  <!-- No Header (Admin/Role removed) -->
                  <div class="user-dropdown-item">
                    <span class="material-symbols-outlined">person</span>
                    Hồ sơ cá nhân
                  </div>
                  <a href="#/appearance" class="user-dropdown-item" style="text-decoration: none;">
                    <span class="material-symbols-outlined">palette</span>
                    Cài đặt Giao diện
                  </a>

                  <div class="dropdown-divider"></div>

                  <div class="user-dropdown-item danger" onclick="ConfirmModal.show({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất?', onConfirm: window.logoutApp })">
                    <span class="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </div>
                </div>
              </div>
            </div>
          </header>

        </div><!-- /vertical-main -->
      </div><!-- /vertical-layout-shell -->
    `;
    container.innerHTML = html;
    _attachVerticalEvents();
  }

  var CACHE_KEY = 'pmql_nav_cache';

  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    var groupId = u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';

    // Check version server trước — nếu khác cache thì tự clear (bắt được thay đổi từ máy Admin)
    if (window.SystemDataService && SystemDataService.getMenuSyncVersion) {
      SystemDataService.getMenuSyncVersion().then(function(serverVer) {
        try {
          var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
          var cacheVer = cached && cached.syncVer ? cached.syncVer : null;
          // Nếu server version khác với cache version → xóa cache, fetch lại
          if (serverVer && cacheVer && serverVer !== cacheVer) {
            sessionStorage.removeItem(CACHE_KEY);
            cached = null;
          }
          if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
            NAV_CONFIG = cached.config;
            if (cached.rawRecords && window.Router && typeof Router.addDynamicRoutes === 'function') {
              Router.addDynamicRoutes(cached.rawRecords);
            }
            _doRender(container);
            return;
          }
        } catch (e) { }
        _fetchAndRender(container, groupId, serverVer);
      }).catch(function() {
        // Lỗi API → dùng cache nếu có, không thì fetch nav
        _fetchAndRender(container, groupId, null);
      });
    } else {
      // Fallback: không có SystemDataService → dùng cache như cũ
      try {
        var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
        if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
          NAV_CONFIG = cached.config;
          if (cached.rawRecords && window.Router && typeof Router.addDynamicRoutes === 'function') {
            Router.addDynamicRoutes(cached.rawRecords);
          }
          _doRender(container);
          return;
        }
      } catch (e) { }
      _fetchAndRender(container, groupId, null);
    }
  }

  function _fetchAndRender(container, groupId, syncVer) {
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MENU_BY_GROUP : null;

    if (endpoint && window.ApiClient) {
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: groupId,
        UserGroupID: groupId
      }).then(function (res) {
        var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
        if (records && records.length > 0) {
          NAV_CONFIG = _buildConfigFromDB(records);
          if (window.Router && typeof Router.addDynamicRoutes === 'function') {
            Router.addDynamicRoutes(records);
          }
          // Lưu cache kèm syncVer để lần sau so sánh
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records,
              syncVer: syncVer || ''
            }));
          } catch (e) { }
        }
        _doRender(container);
      }).catch(function (err) {
        console.error('[Navbar] Lỗi tải menu từ DB:', err);
        _doRender(container);
      });
    } else {
      _doRender(container);
    }
  }

  /* Xóa cache khi logout hoặc đổi nhóm quyền */
  function clearMenuCache() {
    sessionStorage.removeItem(CACHE_KEY);
    NAV_CONFIG = [];
  }

  /* Lắng nghe EventBus để tự động clear cache */
  if (window.EventBus) {
    EventBus.on('user:logout', clearMenuCache); // khi đăng xuất
    EventBus.on('permissions:changed', clearMenuCache); // khi admin đổi quyền
    EventBus.on('menu:changed', clearMenuCache); // khi menu được chỉnh sửa
  }

  function _doRender(container) {
    var mode = getLayout();
    applyLayout(mode);
    _adjustAppLayout(mode);

    if (mode === LAYOUT_VERTICAL) {
      _renderVertical(container);
    } else {
      _renderHorizontal(container);
    }

    // Fetch and update Com1 setup value for user roles (outer nav only)
    if (window.SystemDataService && window.SystemDataService.getSetupValue) {
      SystemDataService.getSetupValue('Com1').then(function(val) {
        if (val) {
          document.querySelectorAll('.user-role-nav').forEach(function(el) {
            el.innerText = val;
          });
        }
      }).catch(function(err) {
        console.error('[Navbar] Lỗi tải SetupValue Com1:', err);
      });
    }
  }

  /* Adjust #app and #app-content structure per mode */
  function _adjustAppLayout(mode) {
    var $app = document.getElementById('app');
    var $content = document.getElementById('app-content');
    if (!$app) return;

    // Reset any inline styles that might interfere
    $app.style.flexDirection = '';
  }

  /* ─────────────────────────────────────────
     Move #app-content into vertical-main
     (only for vertical mode)
  ───────────────────────────────────────── */
  function _moveContentToVerticalMain() {
    var $vertMain = document.getElementById('vertical-main');
    var $content = document.getElementById('app-content');
    if ($vertMain && $content && !$vertMain.contains($content)) {
      $vertMain.appendChild($content);
    }
  }

  /* Move #app-content back to #app (horizontal mode) */
  function _moveContentToApp() {
    var $app = document.getElementById('app');
    var $content = document.getElementById('app-content');
    if ($app && $content && $content.parentNode !== $app) {
      $app.appendChild($content);
    }
  }

  /* ─────────────────────────────────────────
     Events — Horizontal mode
  ───────────────────────────────────────── */
  function _attachHorizontalEvents() {
    var groups = document.querySelectorAll('.nav-group[data-group]');

    function _positionDropdown(group) {
      var btn = group.querySelector('.nav-group-btn');
      var dropdown = group.querySelector('.nav-dropdown');
      if (!btn || !dropdown) return;
      var rect = btn.getBoundingClientRect();
      var left = rect.left;
      var top = rect.bottom + 8;
      // Đảm bảo không tràn phải
      var dropW = dropdown.offsetWidth || 220;
      if (left + dropW > window.innerWidth - 10) {
        left = window.innerWidth - dropW - 10;
      }
      if (left < 5) left = 5;
      dropdown.style.left = left + 'px';
      dropdown.style.top = top + 'px';
    }

    groups.forEach(function (group) {
      var btn = group.querySelector('.nav-group-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = group.classList.contains('open');
          groups.forEach(function (g) { g.classList.remove('open'); });
          _closeUserDropdown();
          if (!isOpen) {
            group.classList.add('open');
            _positionDropdown(group);
          }
        });
      }
    });

    var $user = document.getElementById('navbar-user');
    if ($user) {
      $user.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = $user.classList.contains('open');
        groups.forEach(function (g) { g.classList.remove('open'); });
        if (isOpen) {
          _closeUserDropdown();
        } else {
          $user.classList.add('open');
        }
      });
    }

    var $notif = document.getElementById('navbar-btn-notif');
    if ($notif) {
      $notif.addEventListener('click', function () {
        Alert.info('Thông báo', 'Bạn không có thông báo mới');
      });
    }

    document.addEventListener('click', function () {
      groups.forEach(function (g) { g.classList.remove('open'); });
      _closeUserDropdown();
    });

    // Mobile drawer
    var $hamburger = document.getElementById('navbar-hamburger');
    var $overlay = document.getElementById('mobile-drawer-overlay');
    var $drawer = document.getElementById('mobile-drawer');
    var $drawerClose = document.getElementById('mobile-drawer-close');

    function openDrawer() { if ($drawer) $drawer.classList.add('open'); if ($overlay) $overlay.classList.add('active'); }
    function closeDrawer() { if ($drawer) $drawer.classList.remove('open'); if ($overlay) $overlay.classList.remove('active'); }

    if ($hamburger) $hamburger.addEventListener('click', openDrawer);
    if ($drawerClose) $drawerClose.addEventListener('click', closeDrawer);
    if ($overlay) $overlay.addEventListener('click', closeDrawer);

    document.querySelectorAll('.mobile-nav-item').forEach(function (item) {
      item.addEventListener('click', function () { setTimeout(closeDrawer, 150); });
    });

    // ── Scroll arrows cho navbar-menu ──
    var $menu = document.getElementById('navbar-menu');
    var $scrollLeft = document.getElementById('navbar-scroll-left');
    var $scrollRight = document.getElementById('navbar-scroll-right');

    function updateScrollArrows() {
      if (!$menu || !$scrollLeft || !$scrollRight) return;
      var scrollable = $menu.scrollWidth > $menu.clientWidth + 2;
      $scrollLeft.style.display = (scrollable && $menu.scrollLeft > 5) ? 'flex' : 'none';
      $scrollRight.style.display = (scrollable && $menu.scrollLeft < $menu.scrollWidth - $menu.clientWidth - 5) ? 'flex' : 'none';
    }

    if ($menu && $scrollLeft && $scrollRight) {
      $scrollLeft.addEventListener('click', function(e) {
        e.stopPropagation();
        $menu.scrollBy({ left: -200, behavior: 'smooth' });
      });
      $scrollRight.addEventListener('click', function(e) {
        e.stopPropagation();
        $menu.scrollBy({ left: 200, behavior: 'smooth' });
      });
      $menu.addEventListener('scroll', updateScrollArrows);
      window.addEventListener('resize', updateScrollArrows);
      setTimeout(updateScrollArrows, 100);
    }

    _highlightActive();
    window.addEventListener('hashchange', _highlightActive);
  }

  /* ─────────────────────────────────────────
     Events — Vertical mode
  ───────────────────────────────────────── */
  function _attachVerticalEvents() {
    // Move content into vertical-main
    _moveContentToVerticalMain();

    // Sidebar toggle
    var $sidebar = document.getElementById('app-sidebar');
    var $overlay = document.getElementById('sidebar-overlay');
    var $btnOpen = document.getElementById('btn-hamburger');
    var $btnClose = document.getElementById('btn-close-sidebar');

    function openSidebar() { if ($sidebar) $sidebar.classList.add('open'); if ($overlay) $overlay.classList.add('active'); }
    function closeSidebar() { if ($sidebar) $sidebar.classList.remove('open'); if ($overlay) $overlay.classList.remove('active'); }

    if ($btnOpen) $btnOpen.addEventListener('click', openSidebar);
    if ($btnClose) $btnClose.addEventListener('click', closeSidebar);
    if ($overlay) $overlay.addEventListener('click', closeSidebar);

    // Auto-close sidebar on mobile when a nav item is clicked
    if ($sidebar) {
      $sidebar.querySelectorAll('.nav-item').forEach(function (item) {
        item.addEventListener('click', function () {
          if (window.innerWidth <= 768) {
            setTimeout(closeSidebar, 150);
          }
        });
      });
    }

    // User dropdown in vertical header
    var $uProf = document.getElementById('vertical-user-profile');
    var $uDrop = document.getElementById('vertical-user-dropdown');
    if ($uProf && $uDrop) {
      $uProf.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = $uProf.classList.contains('open');
        $uProf.classList.toggle('open', !isOpen);

        // Also toggle 'open' on dropdown if needed by other CSS
        $uDrop.classList.toggle('open', !isOpen);

        var expandIcon = $uProf.querySelector('.expand-icon');
        if (expandIcon) {
          expandIcon.textContent = isOpen ? 'expand_more' : 'expand_less';
        }
      });
    }

    document.addEventListener('click', function () {
      if ($uDrop) $uDrop.classList.remove('open');
      if ($uProf) $uProf.classList.remove('open');
    });

    _highlightActive();
    window.addEventListener('hashchange', _highlightActive);
  }

  /* ─────────────────────────────────────────
     Helpers
  ───────────────────────────────────────── */
  function _closeUserDropdown() {
    var $user = document.getElementById('navbar-user');
    if ($user) $user.classList.remove('open');
  }

  function _highlightActive() {
    var hash = window.location.hash || '#/dashboard';

    // Horizontal: nav-links & dropdown items
    document.querySelectorAll('.navbar-menu .nav-link').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
    document.querySelectorAll('.navbar-menu .dropdown-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });

    // Vertical: sidebar items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
  }

  return {
    render: render,
    getLayout: getLayout,
    setLayout: setLayout,
    applyLayout: applyLayout,
    clearMenuCache: clearMenuCache,
    moveContentToApp: _moveContentToApp,
    moveContentToVerticalMain: _moveContentToVerticalMain
  };
})();


/* --- Checkbox.js --- */
/**
 * Custom Checkbox Component
 */
var UIControls = window.UIControls || {};

UIControls.createCheckbox = function(options) {
  var wrapper = document.createElement('label');
  wrapper.className = 'modern-checkbox-wrapper';

  var input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'modern-checkbox';
  if (options.checked) input.checked = true;

  input.addEventListener('change', function(e) {
    if (typeof options.onChange === 'function') {
      options.onChange(e.target.checked);
    }
  });

  var span = document.createElement('span');
  span.innerText = options.label || '';

  wrapper.appendChild(input);
  wrapper.appendChild(span);

  return wrapper;
};


/* --- Radio.js --- */
/**
 * Custom Radio Component
 */
var UIControls = window.UIControls || {};

UIControls.createRadio = function(options) {
  var wrapper = document.createElement('label');
  wrapper.className = 'modern-radio-wrapper';

  var input = document.createElement('input');
  input.type = 'radio';
  input.className = 'modern-radio';
  
  if (options.name) input.name = options.name;
  if (options.value) input.value = options.value;
  if (options.checked) input.checked = true;

  input.addEventListener('change', function(e) {
    if (e.target.checked && typeof options.onChange === 'function') {
      options.onChange(e.target.value);
    }
  });

  var span = document.createElement('span');
  if (options.label) {
     span.innerHTML = options.label; // Use innerHTML to support elements like <span class="count">(51)</span>
  }

  wrapper.appendChild(input);
  wrapper.appendChild(span);

  return wrapper;
};

UIControls.createRadioGroup = function(options) {
  var group = document.createElement('div');
  group.className = 'modern-radio-group';
  
  var name = options.name || 'radio-group-' + Math.random().toString(36).substr(2, 9);
  
  options.items.forEach(function(item) {
    var radio = UIControls.createRadio({
      name: name,
      label: item.label,
      value: item.value,
      checked: item.checked || (options.value === item.value),
      onChange: options.onChange
    });
    group.appendChild(radio);
  });
  
  return group;
};


/* --- DataComboBox.js --- */
/**
 * Data ComboBox Component
 */
var UIControls = window.UIControls || {};

UIControls.createDataComboBox = function (options) {
  var container = document.createElement('div');
  container.className = 'combo-box-container';

  // Input
  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'ui-input';
  input.placeholder = options.placeholder || '';
  if (options.id) input.id = options.id;

  // Actions block – chỉ giữ nút mũi tên
  var actions = document.createElement('div');
  actions.className = 'combo-box-actions';

  var btnArrow = document.createElement('button');
  btnArrow.className = 'combo-action-btn';
  btnArrow.innerHTML = '<span class="material-symbols-outlined">arrow_drop_down</span>';
  btnArrow.title = 'Mở danh sách (F4)';
  btnArrow.type = 'button';

  if (options.disabled) {
    input.disabled = true;
    btnArrow.disabled = true;
    container.classList.add('ui-input-disabled');
    btnArrow.innerHTML = '<span class="material-symbols-outlined">lock</span>';
  } else if (options.readonlyInput) {
    input.readOnly = true;
    input.style.cursor = 'pointer';
    input.style.background = 'var(--color-background)'; // slight gray background to indicate read-only
    input.style.caretColor = 'transparent';
    input.style.userSelect = 'none';
  }

  actions.appendChild(btnArrow);

  // ── Dropdown Panel ──────────────────────────────────────────────
  var dropdown = document.createElement('div');
  dropdown.className = 'data-dropdown-menu';

  // Search bar bên trong dropdown
  var searchWrapper = document.createElement('div');
  searchWrapper.className = 'dd-search-wrapper';

  var searchIcon = document.createElement('span');
  searchIcon.className = 'material-symbols-outlined dd-search-icon';
  searchIcon.textContent = 'search';

  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'dd-search-input';
  searchInput.placeholder = 'Tìm kiếm...';

  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(searchInput);

  // Table wrapper (scrollable)
  var tableWrapper = document.createElement('div');
  tableWrapper.className = 'dd-table-wrapper';

  // Footer "+ Thêm mới" & Phân trang
  var footer = document.createElement('div');
  footer.className = 'dd-footer';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';

  var btnAddNew = document.createElement('button');
  btnAddNew.type = 'button';
  btnAddNew.className = 'dd-footer-add-btn';
  btnAddNew.innerHTML = '<span class="material-symbols-outlined">add</span> Thêm mới';
  
  // Mặc định là ẩn, chỉ hiện khi có yêu cầu từ options
  btnAddNew.style.display = options.showAddNew ? 'flex' : 'none';

  btnAddNew.addEventListener('click', function (e) {
    e.stopPropagation();
    hideDropdown();
    if (typeof options.onF2 === 'function') options.onF2();
  });

  var leftFooter = document.createElement('div');
  leftFooter.appendChild(btnAddNew);

  // Pagination Elements
  var currentPage = 1;
  var currentQuery = '';
  
  var paginationWrapper = document.createElement('div');
  paginationWrapper.className = 'dd-pagination';
  paginationWrapper.style.display = 'none';
  paginationWrapper.style.gap = '12px';
  paginationWrapper.style.alignItems = 'center';
  paginationWrapper.style.padding = '2px 8px';

  var btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.className = 'btn-icon-sm';
  btnPrev.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span>';
  btnPrev.style.cssText = 'border:1px solid var(--color-border); background:var(--color-surface); cursor:pointer; border-radius:6px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; color:var(--color-text-secondary); transition:all 0.2s;';

  var lblPage = document.createElement('span');
  lblPage.textContent = 'Trang 1';
  lblPage.style.cssText = 'font-size:13px; font-weight:600; color:var(--color-text); min-width:60px; text-align:center;';

  var btnNext = document.createElement('button');
  btnNext.type = 'button';
  btnNext.className = 'btn-icon-sm';
  btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>';
  btnNext.style.cssText = 'border:1px solid var(--color-border); background:var(--color-surface); cursor:pointer; border-radius:6px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; color:var(--color-text-secondary); transition:all 0.2s;';

  // Hover effects
  [btnPrev, btnNext].forEach(function(btn) {
    btn.onmouseover = function() { this.style.borderColor = 'var(--color-primary)'; this.style.color = 'var(--color-primary)'; this.style.background = 'rgba(251, 191, 36, 0.05)'; };
    btn.onmouseout = function() { this.style.borderColor = 'var(--color-border)'; this.style.color = 'var(--color-text-secondary)'; this.style.background = 'var(--color-surface)'; };
  });

  btnPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentPage > 1) {
      currentPage--;
      loadData(currentQuery, currentPage);
    }
  });

  btnNext.addEventListener('click', function(e) {
    e.stopPropagation();
    currentPage++;
    loadData(currentQuery, currentPage);
  });

  paginationWrapper.appendChild(btnPrev);
  paginationWrapper.appendChild(lblPage);
  paginationWrapper.appendChild(btnNext);

  footer.appendChild(leftFooter);
  footer.appendChild(paginationWrapper);

  dropdown.appendChild(searchWrapper);
  dropdown.appendChild(tableWrapper);
  dropdown.appendChild(footer);

  // ── Data & Render ───────────────────────────────────────────────
  var fullData = options.data || [];

  function renderTable(displayData) {
    if (UIControls.utils) {
      tableWrapper.innerHTML = UIControls.utils.createDropdownTableHTML(
        options.headers || [], displayData, options.colHighlightIndex !== undefined ? options.colHighlightIndex : (options.colFilterIndex || 0), options.colGroupIndex
      );
      var rows = tableWrapper.querySelectorAll('tbody tr');
      var currentInputVal = input.value.trim().toLowerCase();

      rows.forEach(function (row) {
        var dataRow = displayData[row.getAttribute('data-index')];
        var rowVal = (dataRow[options.colFilterIndex || 0] || '').toString().toLowerCase();

        if (currentInputVal && rowVal === currentInputVal) {
          row.classList.add('active');
        }

        row.addEventListener('click', function () {
          input.value = dataRow[options.colFilterIndex || 0];
          hideDropdown();
          if (typeof options.onSelect === 'function') {
            options.onSelect(dataRow);
          }
        });
      });
    }
  }

  // ── Scroll listeners trên đúng container đang scroll ───────────
  var _scrollTargets = [];
  var _scrollHandler = null;

  function attachScrollListeners() {
    if (_scrollHandler) return;
    _scrollHandler = function () {
      if (UIControls.utils) {
        UIControls.utils.computeDropdownPosition(container, dropdown);
      }
    };
    _scrollTargets = UIControls.utils
      ? UIControls.utils.getScrollableAncestors(container)
      : [window];
    _scrollTargets.forEach(function (target) {
      target.addEventListener('scroll', _scrollHandler, { passive: true, capture: false });
    });
    window.addEventListener('resize', _scrollHandler, { passive: true });
  }

  function detachScrollListeners() {
    if (!_scrollHandler) return;
    _scrollTargets.forEach(function (target) {
      target.removeEventListener('scroll', _scrollHandler, { capture: false });
    });
    window.removeEventListener('resize', _scrollHandler);
    _scrollHandler = null;
    _scrollTargets = [];
  }

  function loadData(q, page) {
    currentQuery = q;
    currentPage = page;
    if (typeof options.onSearch === 'function') {
      tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:var(--muted,#94a3b8);font-size:13px">Đang tải...</div>';
      Promise.resolve(options.onSearch(q, page)).then(function (result) {
        if (result && !Array.isArray(result) && result.data) {
          if (result.headers) options.headers = result.headers;
          if (result.colFilterIndex !== undefined) options.colFilterIndex = result.colFilterIndex;
          result = result.data;
        }
        if (Array.isArray(result)) {
          fullData = result;
          renderTable(fullData);
          if (options.enablePagination) {
            paginationWrapper.style.display = 'flex';
            lblPage.textContent = 'Trang ' + page + ' (' + result.length + ')';
            btnPrev.disabled = (page <= 1);
            btnPrev.style.opacity = (page <= 1) ? '0.5' : '1';
            btnNext.disabled = (result.length < 200);
            btnNext.style.opacity = (result.length < 200) ? '0.5' : '1';
          }
          if (UIControls.utils) {
            UIControls.utils.computeDropdownPosition(container, dropdown);
          }
        }
      }).catch(function () {
        tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:#ef4444;font-size:13px">Lỗi tải dữ liệu</div>';
      });
    } else {
      var lval = q.toLowerCase();
      var filtered = lval ? fullData.filter(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(lval);
      }) : fullData;
      renderTable(filtered);
      if (UIControls.utils) {
        UIControls.utils.computeDropdownPosition(container, dropdown);
      }
    }
  }

  function showDropdown() {
    // Đóng các dropdown khác trước khi mở
    document.dispatchEvent(new CustomEvent('close-other-comboboxes', { detail: dropdown }));

    if (dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }
    searchInput.value = '';

    loadData('', 1);

    if (UIControls.utils) {
      UIControls.utils.computeDropdownPosition(container, dropdown);
    }
    dropdown.classList.add('active');
    attachScrollListeners();
    setTimeout(function () { 
      if (document.activeElement !== input) {
        searchInput.focus(); 
      }
    }, 50);
  }

  function hideDropdown() {
    detachScrollListeners();
    dropdown.classList.remove('active');
    if (dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
  }

  // ── Search bên trong dropdown ───────────────────────────────────
  var _searchDebounce = null;

  searchInput.addEventListener('input', function () {
    var val = searchInput.value;

    if (typeof options.onSearch === 'function') {
      // Server-side: debounce 300ms rồi gọi API
      clearTimeout(_searchDebounce);
      tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:var(--muted,#94a3b8);font-size:13px">Đang tìm...</div>';
      _searchDebounce = setTimeout(function () {
        loadData(val, 1);
      }, 300);
    } else {
      // Client-side: filter local fullData
      var lval = val.toLowerCase();
      if (!lval) { renderTable(fullData); return; }
      var filtered = fullData.filter(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(lval);
      });
      renderTable(filtered);
    }
  });

  searchInput.addEventListener('click', function (e) { e.stopPropagation(); });

  // ── Events ──────────────────────────────────────────────────────
  btnArrow.addEventListener('click', function (e) {
    e.preventDefault();
    dropdown.classList.contains('active') ? hideDropdown() : showDropdown();
  });

  input.addEventListener('click', function (e) {
    if (options.readonlyInput) {
      e.preventDefault();
      dropdown.classList.contains('active') ? hideDropdown() : showDropdown();
    }
  });

  input.addEventListener('mousedown', function (e) {
    if (options.readonlyInput) {
      e.preventDefault(); // Prevent focus and blinking cursor
    }
  });

  input.addEventListener('input', function (e) {
    var val = e.target.value;
    if (typeof options.onChange === 'function') {
      options.onChange(val);
    }

    if (!options.hideDropdownOnInput && !dropdown.classList.contains('active')) {
      showDropdown();
    }
    // Ghi chú: Đã bỏ logic filter và onSearch ở đây theo yêu cầu của user. 
    // Chỉ ô tìm kiếm bên trong dropdown (searchInput) mới thực hiện filter.
  });

  function _onDocClick(e) {
    if (!document.body.contains(container)) {
      _cleanupListeners();
      return;
    }
    if (!container.contains(e.target) && !dropdown.contains(e.target)) hideDropdown();
  }

  function _onCloseOthers(e) {
    if (!document.body.contains(container)) {
      _cleanupListeners();
      return;
    }
    if (e.detail !== dropdown) hideDropdown();
  }

  function _cleanupListeners() {
    document.removeEventListener('click', _onDocClick);
    document.removeEventListener('close-other-comboboxes', _onCloseOthers);
    hideDropdown();
  }

  document.addEventListener('click', _onDocClick);
  document.addEventListener('close-other-comboboxes', _onCloseOthers);


  input.addEventListener('blur', function () {
    var val = input.value.trim().toLowerCase();
    if (val && fullData.length > 0) {
      var exactMatch = fullData.find(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase() === val;
      });
      if (exactMatch) {
        input.value = exactMatch[options.colFilterIndex || 0];
        if (typeof options.onSelect === 'function') {
          options.onSelect(exactMatch);
        }
      }
    }
  });

  input.addEventListener('kb:open', function () { dropdown.classList.contains('active') ? hideDropdown() : showDropdown(); });
  input.addEventListener('kb:new', function () { if (options.onF2) options.onF2(); });
  input.addEventListener('kb:lookup', function () { if (options.onF3) options.onF3(); });
  input.addEventListener('kb:close', function () { hideDropdown(); });

  container.appendChild(input);
  container.appendChild(actions);

  return container;
};


/* --- GridDropdown.js --- */
/**
 * Grid Dropdown Component
 */
var UIControls = window.UIControls || {};

UIControls.createGridDropdown = function(options) {
  var wrapper = document.createElement('div');
  wrapper.className = 'grid-cell-dropdown-wrapper';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'grid-cell-input';
  input.placeholder = options.placeholder || '';
  if(options.value) input.value = options.value;

  var dropdown = document.createElement('div');
  dropdown.className = 'data-dropdown-menu';
  dropdown.style.left = '-1px';
  dropdown.style.width = 'max-content';
  dropdown.style.minWidth = '300px';

  var fullData = options.data || [];

  function renderTable(displayData) {
    if (UIControls.utils) {
      dropdown.innerHTML = UIControls.utils.createDropdownTableHTML(options.headers || [], displayData, options.colHighlightIndex || 0);
      var rows = dropdown.querySelectorAll('tbody tr');
      rows.forEach(row => {
        row.addEventListener('click', function(e) {
          e.stopPropagation();
          var dataRow = displayData[row.getAttribute('data-index')];
          input.value = dataRow[options.colFilterIndex || 0];
          hideDropdown();
          if(typeof options.onSelect === 'function') {
            options.onSelect(dataRow);
          }
        });
      });
    }
  }

  function showDropdown() {
    if (dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }
    renderTable(fullData);
    if (UIControls.utils) {
      UIControls.utils.computeDropdownPosition(input, dropdown);
    }
    dropdown.classList.add('active');
  }
  
  function hideDropdown() {
    dropdown.classList.remove('active');
    if (dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
  }

  input.addEventListener('focus', showDropdown);
  
  input.addEventListener('input', function(e) {
    var val = e.target.value.toLowerCase();
    dropdown.classList.add('active');
    if(!val) return renderTable(fullData);
    var filtered = fullData.filter(function(row) {
      return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(val);
    });
    renderTable(filtered);
  });

  document.addEventListener('click', function(e) {
    if(!wrapper.contains(e.target) && !dropdown.contains(e.target)) hideDropdown();
  });

  window.addEventListener('scroll', function(e) {
      if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
          hideDropdown();
      }
  }, true);

  wrapper.appendChild(input);
  return wrapper;
};


/* --- LoadingSpinner.js --- */
/**
 * Loading Spinner Component
 * Hiện vòng xoay tải trang toàn màn hình
 */
var LoadingSpinner = (function () {
  var overlay = null;
  var textElement = null;

  function init() {
    if (document.getElementById('loading-spinner-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'loading-spinner-overlay';
    overlay.className = 'loading-overlay';

    var spinner = document.createElement('div');
    spinner.className = 'spinner';

    textElement = document.createElement('div');
    textElement.className = 'loading-text';
    textElement.innerText = 'Đang tải dữ liệu...';

    overlay.appendChild(spinner);
    overlay.appendChild(textElement);
    document.body.appendChild(overlay);
  }

  function show(message) {
    if (!overlay) init();
    if (message) textElement.innerText = message;
    else textElement.innerText = 'Đang tải dữ liệu...';
    overlay.classList.add('active');
  }

  function hide() {
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  return {
    show: show,
    hide: hide
  };
})();


/* --- Alert.js --- */
/**
 * Alert (Toast) Component
 * Hiển thị thông báo trượt góc phải màn hình
 */
var Alert = (function () {
  var container = null;

  function init() {
    if (!document.getElementById('toast-container')) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    } else {
      container = document.getElementById('toast-container');
    }
  }

  /**
   * Hiển thị thông báo
   * @param {string} type - 'success', 'danger', 'warning', 'info'
   * @param {string} title - Tiêu đề
   * @param {string} message - Nội dung
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  function show(type, title, message, duration) {
    if (!container) init();
    duration = duration || 3000;

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;

    var iconMap = {
      'success': 'check_circle',
      'danger': 'error',
      'warning': 'warning',
      'info': 'info'
    };

    var html = `
      <div class="toast-icon">
        <span class="material-symbols-outlined">${iconMap[type] || 'info'}</span>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <span class="material-symbols-outlined" style="font-size:18px;">close</span>
      </button>
      <div class="toast-timer" style="animation-duration:${duration}ms"></div>
    `;

    toast.innerHTML = html;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', function() {
      removeToast(toast);
    });

    // Trigger animation
    setTimeout(function() {
      toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(function() {
      removeToast(toast);
    }, duration);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400); // Wait for transition
  }

  return {
    success: function(title, message, duration) { show('success', title, message, duration); },
    error: function(title, message, duration) { show('danger', title, message, duration); },
    warning: function(title, message, duration) { show('warning', title, message, duration); },
    info: function(title, message, duration) { show('info', title, message, duration); }
  };
})();


/* --- ConfirmModal.js --- */
/**
 * Confirm Modal Component
 * Hộp thoại hỏi ý kiến (Xóa/Lưu dữ liệu)
 */
var ConfirmModal = (function () {
  var modalOverlay = null;

  function init() {
    if (document.getElementById('confirm-modal-overlay')) return;

    modalOverlay = document.createElement('div');
    modalOverlay.id = 'confirm-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';

    var html = `
      <div class="modal-content" style="width: 400px;">
        <div class="modal-header">
          <h3 id="confirm-modal-title">Xác nhận</h3>
          <button class="btn-close-modal" id="confirm-modal-btn-close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="card-body">
          <p id="confirm-modal-message" style="margin-bottom: 24px; color: var(--color-text-secondary);"></p>
          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button class="btn btn-secondary" id="confirm-modal-btn-cancel">Hủy bỏ</button>
            <button class="btn btn-primary" id="confirm-modal-btn-confirm">Đồng ý</button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.innerHTML = html;
    document.body.appendChild(modalOverlay);
  }

  /**
   * Mở hộp thoại xác nhận
   * @param {Object} options - { title, message, confirmText, confirmClass, onConfirm }
   */
  function show(options) {
    if (!modalOverlay) init();

    document.getElementById('confirm-modal-title').innerText = options.title || 'Xác nhận';
    document.getElementById('confirm-modal-message').innerHTML = options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?';

    var btnConfirm = document.getElementById('confirm-modal-btn-confirm');
    btnConfirm.innerText = options.confirmText || 'Đồng ý';
    btnConfirm.className = 'btn ' + (options.confirmClass || 'btn-primary');

    var btnCancel = document.getElementById('confirm-modal-btn-cancel');
    var btnClose = document.getElementById('confirm-modal-btn-close');

    // Remove old listeners using clone node trick
    var newBtnConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

    var newBtnCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

    var newBtnClose = btnClose.cloneNode(true);
    btnClose.parentNode.replaceChild(newBtnClose, btnClose);

    // Add new listeners
    newBtnConfirm.addEventListener('click', function () {
      hide();
      if (typeof options.onConfirm === 'function') options.onConfirm();
    });

    newBtnCancel.addEventListener('click', hide);
    newBtnClose.addEventListener('click', hide);

    modalOverlay.style.display = 'flex';
    history.pushState({ modalId: 'confirm-modal' }, null, "");
  }

  function hide() {
    if (modalOverlay && modalOverlay.style.display !== 'none') {
      modalOverlay.style.display = 'none';
      if (history.state && history.state.modalId === 'confirm-modal') {
        history.back();
      }
    }
  }

  return {
    show: show,
    hide: hide
  };
})();

// Xử lý nút Back của trình duyệt/điện thoại
window.addEventListener('popstate', function (e) {
  var overlay = document.getElementById('confirm-modal-overlay');
  if (overlay && overlay.style.display !== 'none') {
    overlay.style.display = 'none';
  }
});


/* --- Modal.js --- */
/**
 * Generic Modal Builder
 * Mở các Pop-up Window Nhập liệu / Báo cáo không cần code cứng HTML
 */
var UIModal = (function () {
  
  /**
   * Mở một form Modal bất kỳ
   * @param {Object} config - { id, title, width, content (Node/String), footer (Node), onClose }
   */
  function show(config) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    if (config.id) overlay.id = config.id;

    var contentWidth = config.width || '600px';

    var html = `
      <div class="modal-content" style="width: ${contentWidth}; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; animation: fadeIn 0.2s ease;">
        <div class="modal-header" style="flex-shrink: 0;">
          <h3>${config.title || 'Tiêu đề'}</h3>
          <button class="btn-close-modal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="card-body ui-modal-body" style="overflow-y: auto; padding: 16px;"></div>
        <div class="modal-footer" style="flex-shrink: 0; padding: 16px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 12px; background: var(--color-surface); border-radius: 0 0 var(--radius-lg) var(--radius-lg);"></div>
      </div>
    `;
    overlay.innerHTML = html;

    var bodyWrapper = overlay.querySelector('.ui-modal-body');
    if (typeof config.content === 'string') {
      bodyWrapper.innerHTML = config.content;
    } else if (config.content instanceof Node) {
      bodyWrapper.appendChild(config.content);
    }

    var footerWrapper = overlay.querySelector('.modal-footer');
    if (typeof config.footer === 'string') {
      footerWrapper.innerHTML = config.footer;
    } else if (config.footer instanceof Node) {
      footerWrapper.appendChild(config.footer);
    } else {
      footerWrapper.style.display = 'none';
    }

    document.getElementById('modal-container').appendChild(overlay);

    var modalId = config.id || 'modal-' + Date.now();
    // Dùng URL hiện tại (giữ nguyên hash) để không làm mất route
    history.pushState({ modalId: modalId }, null, window.location.href);

    var _closed = false;

    // Đóng modal VÀ gọi history.back() (dùng cho nút X, nút Hủy)
    function close() {
      if (_closed) return;
      _closed = true;
      overlay.remove();
      if (history.state && history.state.modalId === modalId) {
        history.back();
      }
      if (typeof config.onClose === 'function') config.onClose();
    }

    // Đóng modal KHÔNG gọi history.back() (dùng khi lưu thành công)
    function closeNow() {
      if (_closed) return;
      _closed = true;
      overlay.remove();
      if (typeof config.onClose === 'function') config.onClose();
    }

    overlay.querySelector('.btn-close-modal').addEventListener('click', close);

    return {
      close: close,
      closeNow: closeNow,
      node: overlay
    };
  }

  return {
    show: show
  };
})();

// Xử lý nút Back của trình duyệt/điện thoại
window.addEventListener('popstate', function (e) {
  // Chỉ đóng modal nếu state KHÔNG phải là modal (tránh xóa khi router hashchange)
  if (!e.state || !e.state.modalId) {
    document.querySelectorAll('#modal-container .modal-overlay').forEach(function(m) {
      m.remove();
    });
  }
});



/* --- Pagination.js --- */
/**
 * Pagination Component
 * Trình phân trang cho DataGrid
 */
var Pagination = (function () {
  /**
   * Tạo component phân trang
   * @param {Object} options - { totalItems, itemsPerPage, currentPage, onPageChange }
   * @returns {HTMLElement} wrapper
   */
  function create(options) {
    var wrapper = document.createElement('div');
    wrapper.className = 'pagination-wrapper datagrid-pager';

    var totalPages = Math.ceil(options.totalItems / (options.itemsPerPage || 10));
    var currentPage = options.currentPage || 1;

    var startItem = (currentPage - 1) * options.itemsPerPage + 1;
    var endItem = Math.min(currentPage * options.itemsPerPage, options.totalItems);
    if (options.totalItems === 0) { startItem = 0; endItem = 0; }

    // 1. Cụm Page Size Dropdown
    var sizeSelector = document.createElement('div');
    sizeSelector.className = 'pager-size-selector';
    var select = document.createElement('select');
    [10, 15, 20, 50, 100].forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.text = val;
      if (val === options.itemsPerPage) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = function (e) {
      if (typeof options.onLimitChange === 'function') {
        options.onLimitChange(parseInt(e.target.value, 10));
      }
    };
    sizeSelector.appendChild(select);

    // 2. Cụm Điều Hướng (Navigation)
    var controls = document.createElement('div');
    controls.className = 'pager-controls';

    function createBtn(icon, disabled, onClick) {
      var btn = document.createElement('button');
      btn.className = 'pager-btn';
      btn.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
      btn.disabled = disabled;
      if (!disabled && typeof onClick === 'function') {
        btn.onclick = onClick;
      }
      return btn;
    }

    var btnFirst = createBtn('first_page', currentPage === 1, function () { options.onPageChange(1); });
    var btnPrev = createBtn('chevron_left', currentPage === 1, function () { options.onPageChange(currentPage - 1); });
    var btnNext = createBtn('chevron_right', currentPage === totalPages || totalPages === 0, function () { options.onPageChange(currentPage + 1); });
    var btnLast = createBtn('last_page', currentPage === totalPages || totalPages === 0, function () { options.onPageChange(totalPages); });
    var btnRefresh = createBtn('refresh', false, function () {
      if (typeof options.onRefresh === 'function') options.onRefresh();
      else if (typeof options.onPageChange === 'function') options.onPageChange(currentPage);
    });
    var btnCapture = createBtn('photo_camera', false, function () {
      if (typeof ScreenCapture !== 'undefined') {
        ScreenCapture.start();
      } else {
        if (typeof UIToast !== 'undefined') UIToast.show('Công cụ chụp ảnh chưa sẵn sàng!', 'warning');
      }
    });
    btnCapture.title = "Chụp vùng màn hình";
    btnCapture.style.color = "var(--color-primary)";
    btnCapture.classList.add('pager-btn-capture');

    var pageInputWrapper = document.createElement('span');
    pageInputWrapper.className = 'pager-input-wrapper';
    pageInputWrapper.innerHTML = 'Trang ';
    var pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.className = 'pager-input';
    pageInput.value = currentPage;
    pageInput.min = 1;
    pageInput.max = totalPages || 1;
    pageInput.onkeydown = function (e) {
      if (e.key === 'Enter') {
        var p = parseInt(pageInput.value, 10);
        if (p >= 1 && p <= totalPages && p !== currentPage) {
          options.onPageChange(p);
        } else {
          pageInput.value = currentPage; // reset if invalid
        }
      }
    };
    pageInputWrapper.appendChild(pageInput);
    pageInputWrapper.appendChild(document.createTextNode(` / ${totalPages}`));

    // Vách ngăn
    function createSeparator() {
      var sep = document.createElement('div');
      sep.className = 'pager-separator';
      return sep;
    }

    controls.appendChild(btnFirst);
    controls.appendChild(btnPrev);
    controls.appendChild(createSeparator());
    controls.appendChild(pageInputWrapper);
    controls.appendChild(createSeparator());
    controls.appendChild(btnNext);
    controls.appendChild(btnLast);
    controls.appendChild(createSeparator());
    controls.appendChild(btnRefresh);
    controls.appendChild(btnCapture);

    // 3. Cụm Info
    var info = document.createElement('div');
    info.className = 'pager-info';
    info.innerText = `Hiển thị ${startItem} - ${endItem} / ${options.totalItems} dòng`;

    // Lắp ráp
    wrapper.appendChild(sizeSelector);
    wrapper.appendChild(createSeparator());
    wrapper.appendChild(controls);
    wrapper.appendChild(info);

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- FilterComponent.js --- */
/**
 * Filter Component
 * Thanh công cụ lọc dữ liệu
 */
var FilterComponent = (function () {
  /**
   * Tạo component bộ lọc đè lên UI (Overlay Panel gắn vào document.body để chống vỡ layout)
   */
  function create(filters, onSearch) {
    // Xóa các panel lọc cũ tránh bị trùng lặp ID phần tử trên DOM khi chuyển trang SPA
    document.querySelectorAll('.filter-overlay-panel').forEach(function (el) {
      el.remove();
    });

    // 1. Tạo Panel thực sự và gắn thẳng vào body (Tránh bị cắt bởi thẻ cha có overflow: hidden hoặc transform)
    var wrapper = document.createElement('div');
    wrapper.className = 'filter-overlay-panel';
    // Chỉnh lại bóng đổ (box-shadow) mỏng, mịn và sang trọng hơn
    wrapper.style.cssText = 'position: fixed; left: -9999px; top: -9999px; z-index: 999999; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 12px); box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05); padding: 20px; min-width: 250px; max-width: calc(100vw - 20px); display: none; flex-direction: column; gap: 16px; opacity: 0; transform: translateY(-10px); transition: opacity 0.2s ease, transform 0.2s ease;';
    document.body.appendChild(wrapper);

    // Tiêu đề popup
    var title = document.createElement('div');
    title.innerText = 'Lọc dữ liệu';
    title.style.cssText = 'font-size: 16px; font-weight: 600; color: var(--color-text, #1e293b); margin: 0; padding-bottom: 12px; border-bottom: 1px solid var(--color-border, #f1f5f9);';
    wrapper.appendChild(title);

    // Grid Container cho Filters
    var gridContainer = document.createElement('div');
    // Nếu có nhiều hơn 2 filter thì dùng 2 cột, ngược lại 1 cột
    var cols = filters.length > 2 ? 2 : 1;
    gridContainer.style.cssText = 'display: grid; grid-template-columns: repeat(' + cols + ', 1fr); gap: 16px;';
    wrapper.appendChild(gridContainer);

    var inputs = {};

    filters.forEach(function (f) {
      var controlWrapper;
      var config = { id: f.id, label: f.label, placeholder: f.placeholder };

      if (f.type === 'select') {
        if (f.dataSource) {
          controlWrapper = document.createElement('div');
          controlWrapper.className = 'form-group';

          if (config.label) {
            var lbl = document.createElement('label');
            lbl.innerText = config.label;
            controlWrapper.appendChild(lbl);
          }

          var hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.id = f.id;
          hiddenInput.name = f.id;

          if (typeof window !== 'undefined' && window.currentFilters && window.currentFilters[f.id] !== undefined) {
            hiddenInput.value = window.currentFilters[f.id];
          } else {
            hiddenInput.value = '';
          }
          controlWrapper.appendChild(hiddenInput);

          var comboLoading = UIControls.createDataComboBox({ placeholder: 'Đang tải...' });
          controlWrapper.appendChild(comboLoading);

          var collectedOptions = [];
          var rebuildTimeout = null;

          var valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

          function rebuildCombo() {
            var comboData = collectedOptions.map(function (opt) {
              return [opt.value, opt.label];
            });

            var newCombo = UIControls.createDataComboBox({
              placeholder: f.placeholder || '-- Tất cả --',
              headers: ['Mã', 'Tên'],
              data: comboData,
              colFilterIndex: 1,
              onSelect: function (r) {
                valueDescriptor.set.call(hiddenInput, r[0]);
              },
              onChange: function (val) {
                valueDescriptor.set.call(hiddenInput, val);
              }
            });

            var currentCombo = controlWrapper.querySelector('.combo-box-container');
            if (currentCombo) {
              controlWrapper.replaceChild(newCombo, currentCombo);
            } else {
              var currentLoading = controlWrapper.querySelector('.combo-box-container') || controlWrapper.lastChild;
              if (currentLoading && currentLoading !== hiddenInput && currentLoading !== controlWrapper.querySelector('label')) {
                controlWrapper.replaceChild(newCombo, currentLoading);
              } else {
                controlWrapper.appendChild(newCombo);
              }
            }

            var currentVal = valueDescriptor.get.call(hiddenInput);
            var matched = comboData.find(function (r) { return r[0] == currentVal; });
            var displayInput = newCombo.querySelector('input.ui-input');
            if (matched && displayInput) {
              displayInput.value = matched[1];
            } else if (displayInput) {
              displayInput.value = currentVal;
            }
          }

          Object.defineProperty(hiddenInput, 'innerHTML', {
            get: function () { return ''; },
            set: function (val) { collectedOptions = []; }
          });

          hiddenInput.appendChild = function (node) {
            if (node.tagName === 'OPTION') {
              collectedOptions.push({ value: node.value, label: node.innerText });
              clearTimeout(rebuildTimeout);
              rebuildTimeout = setTimeout(rebuildCombo, 50);
            }
            return node;
          };

          Object.defineProperty(hiddenInput, 'value', {
            get: function () {
              return valueDescriptor.get.call(hiddenInput);
            },
            set: function (val) {
              valueDescriptor.set.call(hiddenInput, val);
              var displayInput = controlWrapper.querySelector('.combo-box-container input.ui-input');
              if (displayInput) {
                var displayVal = val;
                if (collectedOptions && collectedOptions.length > 0) {
                  var matched = collectedOptions.find(function (opt) { return opt.value == val; });
                  if (matched) displayVal = matched.label;
                }
                displayInput.value = displayVal;
              }
            }
          });

        } else {
          var opts = f.options ? f.options.map(function (o) { return { value: o.value !== undefined ? o.value : o, label: o.label || o }; }) : [];
          controlWrapper = UIInput.createSelect(config, opts);
        }
      } else if (f.type === 'date') {
        controlWrapper = UIInput.createDate(config);
      } else if (f.type === 'number') {
        controlWrapper = UIInput.createNumber(config);
      } else {
        controlWrapper = UIInput.createText(config);
      }

      controlWrapper.className = '';

      // Thiết kế lại Control theo dạng Stacked (Label nằm trên Input)
      controlWrapper.style.display = 'flex';
      controlWrapper.style.flexDirection = 'column';
      controlWrapper.style.alignItems = 'flex-start';
      controlWrapper.style.margin = '0';
      controlWrapper.style.gap = '6px';

      var lbl = controlWrapper.querySelector('label');
      if (lbl) {
        lbl.style.width = '100%';
        lbl.style.margin = '0';
        lbl.style.fontSize = '13px';
        lbl.style.fontWeight = '600';
        lbl.style.color = 'var(--color-text-secondary, #475569)';
        lbl.style.display = 'block';
        lbl.style.textAlign = 'left';
      }

      var inp = controlWrapper.querySelector('input, select');
      if (inp) {
        if (inp.type !== 'hidden') {
          inp.style.width = '100%';
          inp.style.minWidth = '0';
          inp.style.padding = '8px 12px';
          inp.style.fontSize = '14px';
          inp.style.border = '1px solid var(--color-border, #cbd5e1)';
          inp.style.background = 'var(--color-surface, #fff)';
          inp.style.color = 'var(--color-text, #1e293b)';
          inp.style.borderRadius = '6px';
          inp.style.outline = 'none';
          inp.style.transition = 'border-color 0.2s, box-shadow 0.2s';
          
          // Hiệu ứng focus
          inp.addEventListener('focus', function() {
              this.style.borderColor = 'var(--color-primary, #3b82f6)';
              this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          });
          inp.addEventListener('blur', function() {
              this.style.borderColor = 'var(--color-border, #cbd5e1)';
              this.style.boxShadow = 'none';
          });
        }

        if (typeof window !== 'undefined' && window.currentFilters && window.currentFilters[f.id] !== undefined) {
          inp.value = window.currentFilters[f.id];
        }

        inputs[f.id] = inp;
      }

      gridContainer.appendChild(controlWrapper);
    });

    // ── Lọc live khi gõ vào ô Từ khóa ──────────────────────────────────
    // Chỉ áp dụng cho ô có id='keyword'; các ô khác vẫn dùng nút bấm
    var keywordInput = inputs['keyword'];
    if (keywordInput && typeof onSearch === 'function') {
      var _liveTimer = null;
      keywordInput.addEventListener('input', function () {
        clearTimeout(_liveTimer);
        _liveTimer = setTimeout(function () {
          var values = {};
          for (var k in inputs) { values[k] = inputs[k].value; }
          onSearch(values);
          // KHÔNG đóng panel — để người dùng tiếp tục tinh chỉnh
        }, 400);
      });
      // Enter → tìm ngay không chờ debounce
      keywordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          clearTimeout(_liveTimer);
          var values = {};
          for (var k in inputs) { values[k] = inputs[k].value; }
          onSearch(values);
        }
      });
    }

    var actions = document.createElement('div');
    actions.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--color-border, #f1f5f9);';

    var btnReset = document.createElement('button');
    btnReset.className = 'btn btn-light';
    btnReset.innerText = 'Xóa bộ lọc';
    btnReset.style.cssText = 'font-weight: 500; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; padding: 8px 16px; background: var(--color-surface, #fff); color: var(--color-text-secondary, #64748b); cursor: pointer; transition: all 0.2s;';
    btnReset.onmouseover = function() { this.style.background = 'var(--color-surface-elevated, #f8fafc)'; this.style.color = 'var(--color-text, #0f172a)'; };
    btnReset.onmouseout = function() { this.style.background = 'var(--color-surface, #fff)'; this.style.color = 'var(--color-text-secondary, #64748b)'; };
    btnReset.onclick = function () {
      for (var key in inputs) {
        inputs[key].value = '';
        var wrapper = inputs[key].closest('.form-group') || inputs[key].parentElement;
        if (wrapper) {
          var displayInput = wrapper.querySelector('.combo-box-container input.ui-input');
          if (displayInput) {
            displayInput.value = '';
          }
        }
      }
      if (typeof onSearch === 'function') onSearch({});
    };

    var btnSearch = document.createElement('button');
    btnSearch.className = 'btn btn-primary d-flex align-items-center gap-2';
    btnSearch.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">search</span> Lọc dữ liệu';
    btnSearch.style.cssText = 'font-weight: 600; border-radius: 6px; padding: 8px 16px; border: none; cursor: pointer; transition: all 0.2s;';
    btnSearch.onclick = function () {
      if (typeof onSearch === 'function') {
        var values = {};
        for (var key in inputs) {
          values[key] = inputs[key].value;
        }
        console.log('[FilterComponent] Submitting values:', values);
        onSearch(values);

        // Đóng popup sau khi Lọc
        if (dummyContainer.parentElement) {
          dummyContainer.parentElement.style.display = 'none';
        }
      }
    };

    actions.appendChild(btnReset);
    actions.appendChild(btnSearch);
    wrapper.appendChild(actions);

    // Mũi tên (Caret) nối lên trên
    var arrowBorder = document.createElement('div');
    arrowBorder.style.cssText = 'position: absolute; top: -9px; left: 30px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 9px solid var(--color-border, #e2e8f0); pointer-events: none;';

    var arrowBg = document.createElement('div');
    arrowBg.style.cssText = 'position: absolute; top: -8px; left: 31px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid var(--color-surface, #fff); pointer-events: none;';

    wrapper.appendChild(arrowBorder);
    wrapper.appendChild(arrowBg);

    // 2. Dummy Container trả về cho hệ thống cũ (DynamicFormEngine) để không làm vỡ code cũ
    var dummyContainer = document.createElement('div');
    dummyContainer.style.display = 'none';

    // Căn chỉnh vị trí
    function alignPopup() {
      var btns = document.querySelectorAll('button');
      var btnLoc = null;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
          btnLoc = btns[i];
          break;
        }
      }

      if (btnLoc) {
        var btnRect = btnLoc.getBoundingClientRect();

        // Cập nhật vị trí Top
        wrapper.style.top = (btnRect.bottom + 10) + 'px';

        var centerBtnX = btnRect.left + (btnRect.width / 2);
        var panelWidth = wrapper.offsetWidth || 250;
        var panelLeft = centerBtnX - 40; // Default offset

        // Lấy chính xác chiều rộng hiển thị của trình duyệt (trừ đi scrollbar)
        var clientWidth = document.documentElement.clientWidth || window.innerWidth;

        // Chống tràn màn hình bên phải
        var maxLeft = clientWidth - panelWidth - 10; 
        if (panelLeft > maxLeft) panelLeft = maxLeft;

        // Chống tràn màn hình bên trái
        if (panelLeft < 10) panelLeft = 10;

        wrapper.style.left = panelLeft + 'px';

        // Căn mũi tên chĩa đúng tâm nút bấm
        var arrowPos = centerBtnX - panelLeft;
        
        // Chặn không cho mũi tên bay ra khỏi ranh giới của popup
        if (arrowPos < 20) arrowPos = 20;
        if (arrowPos > panelWidth - 20) arrowPos = panelWidth - 20;

        arrowBorder.style.left = (arrowPos - 9) + 'px';
        arrowBg.style.left = (arrowPos - 8) + 'px';
      }
    }

    // Theo dõi trạng thái của Container gốc để đồng bộ hiển thị
    setTimeout(function () {
      var parent = dummyContainer.parentElement; // Đây chính là #dynamic-filter-container
      if (parent) {
        // Tiêu diệt không gian của thẻ cha để không đẩy lưới xuống
        parent.style.marginBottom = '0';
        parent.style.padding = '0';
        parent.style.height = '0';

        var observer = new MutationObserver(function () {
          if (parent.style.display !== 'none') {
            wrapper.style.display = 'flex';
            setTimeout(function() {
              wrapper.style.opacity = '1';
              wrapper.style.transform = 'translateY(0)';
            }, 10);
            alignPopup();

            // Focus vào ô đầu tiên
            var firstInput = wrapper.querySelector('input');
            if (firstInput) firstInput.focus();
          } else {
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(-10px)';
            setTimeout(function() {
              if (parent.style.display === 'none') {
                wrapper.style.display = 'none';
              }
            }, 200);
          }
        });
        observer.observe(parent, { attributes: true, attributeFilter: ['style'] });
      }
    }, 50);

    // Auto dóng lại khi Resize
    window.addEventListener('resize', function () {
      if (wrapper.style.display !== 'none') alignPopup();
    });

    // Click bên ngoài thì tự đóng Panel
    document.addEventListener('click', function (e) {
      if (wrapper.style.display !== 'none') {
        var isInsidePanel = wrapper.contains(e.target);
        var isDropdownClick = e.target.closest('.data-dropdown-menu'); // allow clicking combobox dropdown
        var btnLoc = null;
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
            btnLoc = btns[i]; break;
          }
        }
        var isClickOnButton = btnLoc && btnLoc.contains(e.target);

        if (!isInsidePanel && !isClickOnButton && !isDropdownClick && dummyContainer.parentElement) {
          dummyContainer.parentElement.style.display = 'none'; // Ẩn cha đi thì Observer sẽ ẩn Panel
        }
      }
    });

    return dummyContainer; // Trả về thẻ rỗng để lừa DynamicFormEngine
  }

  return {
    create: create
  };
})();


/* --- Input.js --- */
/**
 * Input Component
 * Sinh ra các ô nhập liệu (Text, Number, Date...) kèm Label bằng DOM Node chuẩn.
 * An toàn XSS, tiện lợi khi build Form hoàn toàn bằng JavaScript.
 */
var UIInput = (function () {

  /**
   * Sinh cấu trúc Label + DOM Input
   */
  function _createBaseWrapper(config, inputType) {
    var wrapper = document.createElement('div');
    wrapper.className = 'form-group ' + (config.className || '');

    if (config.label) {
      var lbl = document.createElement('label');
      lbl.innerText = config.label;
      if (config.required) {
        var req = document.createElement('span');
        req.innerText = ' *';
        req.style.color = 'var(--color-danger)';
        lbl.appendChild(req);
      }
      wrapper.appendChild(lbl);
    }

    var input = document.createElement('input');
    input.type = inputType;
    input.className = 'ui-input';
    if (config.id) input.id = config.id;
    if (config.name) input.name = config.name;
    
    var finalPlaceholder = config.placeholder;
    if (!finalPlaceholder && config.label && inputType !== 'checkbox' && inputType !== 'radio' && inputType !== 'date') {
      finalPlaceholder = 'Nhập ' + config.label.toLowerCase() + '...';
    }
    if (finalPlaceholder) input.placeholder = finalPlaceholder;
    
    if (config.value !== undefined) input.value = config.value;
    if (config.disabled) input.disabled = true;
    if (config.readonly) input.readOnly = true;

    wrapper.appendChild(input);

    return { wrapper: wrapper, input: input };
  }

  /**
   * Ô nhập Text thông thường
   */
  function createText(config) {
    return _createBaseWrapper(config, 'text').wrapper;
  }

  /**
   * Ô nhập Số
   */
  function createNumber(config) {
    var obj = _createBaseWrapper(config, 'number');
    if (config.min !== undefined) obj.input.min = config.min;
    if (config.max !== undefined) obj.input.max = config.max;
    if (config.step !== undefined) obj.input.step = config.step;
    return obj.wrapper;
  }

  /**
   * Ô chọn Ngày
   */
  function createDate(config) {
    if (config.value) {
      var rawVal = String(config.value).trim();
      if (rawVal.indexOf('T') !== -1) {
        config.value = rawVal.split('T')[0];
      } else if (rawVal.indexOf('/') !== -1) {
        var parts = rawVal.split(' ')[0].split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) { // YYYY/MM/DD
            config.value = parts[0] + '-' + parts[1] + '-' + parts[2];
          } else { // DD/MM/YYYY
            config.value = parts[2] + '-' + parts[1] + '-' + parts[0];
          }
        }
      } else if (rawVal.indexOf(' ') !== -1) {
        config.value = rawVal.split(' ')[0];
      }
    }
    return _createBaseWrapper(config, 'date').wrapper;
  }

  /**
   * Ô chọn Giờ
   */
  function createTime(config) {
    return _createBaseWrapper(config, 'time').wrapper;
  }

  /**
   * Ô Switch (Công tắc bật/tắt cho boolean)
   */
  function createSwitch(config) {
    var obj = _createBaseWrapper(config, 'checkbox');
    obj.wrapper.classList.remove('form-group');
    obj.wrapper.classList.add('modern-checkbox-wrapper');
    obj.input.className = 'modern-checkbox';
    obj.input.style.cursor = 'pointer';
    
    // Checkbox uses checked instead of value
    if (config.value === '1' || config.value === 1 || config.value === true || String(config.value).toLowerCase() === 'true') {
        obj.input.checked = true;
    }
    
    // Thêm giá trị thực vào dataset để tự động serialize thành 1/0
    obj.input.value = obj.input.checked ? 1 : 0;
    obj.input.onchange = function() {
        this.value = this.checked ? 1 : 0;
    };
    
    // Đảo ngược thứ tự input và label cho đẹp
    var label = obj.wrapper.querySelector('label');
    if (label) {
        // Xóa class cũ
        label.className = '';
        label.style.cursor = 'pointer';
        // Đảo ngược thứ tự: input trước, label sau
        obj.wrapper.insertBefore(obj.input, label);
    }
    
    return obj.wrapper;
  }

  /**
   * Ô nhập Mật Khẩu (có nút mắt ẩn/hiện)
   */
  function createPassword(config) {
    var obj = _createBaseWrapper(config, 'password');
    var input = obj.input;

    // Wrapper cho input + nút mắt
    var inputWrap = document.createElement('div');
    inputWrap.style.position = 'relative';
    inputWrap.style.display = 'flex';
    inputWrap.style.alignItems = 'center';

    // Thay thế input bằng inputWrap TRƯỚC (input vẫn còn là child của wrapper)
    obj.wrapper.replaceChild(inputWrap, input);

    // Rồi mới chuyển input vào inputWrap
    input.style.paddingRight = '40px';
    inputWrap.appendChild(input);

    // Nút mắt
    var eyeBtn = document.createElement('button');
    eyeBtn.type = 'button';
    eyeBtn.tabIndex = -1;
    eyeBtn.className = 'password-eye-btn';
    eyeBtn.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; justify-content:center; color:var(--color-text-secondary); border-radius:4px; transition: color 0.2s;';
    eyeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">visibility_off</span>';
    eyeBtn.title = 'Hiện mật khẩu';

    var isVisible = false;
    eyeBtn.addEventListener('click', function() {
      isVisible = !isVisible;
      input.type = isVisible ? 'text' : 'password';
      eyeBtn.querySelector('.material-symbols-outlined').textContent = isVisible ? 'visibility' : 'visibility_off';
      eyeBtn.title = isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
      input.focus();
    });

    // Hover effect
    eyeBtn.addEventListener('mouseenter', function() { this.style.color = 'var(--color-text)'; });
    eyeBtn.addEventListener('mouseleave', function() { this.style.color = 'var(--color-text-secondary)'; });

    inputWrap.appendChild(eyeBtn);

    return obj.wrapper;
  }

  /**
   * Ô Select (Combobox thả xuống)
   */
  function createSelect(config, options) {
    var wrapper = document.createElement('div');
    wrapper.className = 'form-group ' + (config.className || '');

    if (config.label) {
      var lbl = document.createElement('label');
      lbl.innerText = config.label;
      if (config.required) {
        var req = document.createElement('span');
        req.innerText = ' *';
        req.style.color = 'var(--color-danger)';
        lbl.appendChild(req);
      }
      wrapper.appendChild(lbl);
    }

    var select = document.createElement('select');
    select.className = 'ui-input'; // Xài chung style với thẻ input
    if (config.id) select.id = config.id;
    if (config.name) select.name = config.name;
    if (config.disabled) select.disabled = true;

    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.innerText = '-- Vui lòng chọn --';
    select.appendChild(defaultOpt);

    (options || []).forEach(function(opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.innerText = opt.label;
        if (config.value == opt.value) o.selected = true;
        select.appendChild(o);
    });

    wrapper.appendChild(select);
    return wrapper;
  }

  /**
   * Sinh HTML chuỗi cho Bộ chọn số lượng (Quantity Selector)
   * Dùng cho các Grid/Table sử dụng innerHTML thay vì DOM Nodes.
   */
  function createQuantityHTML(config) {
    var value = config.value || 1;
    var onDecrease = config.onDecrease || '';
    var onIncrease = config.onIncrease || '';
    var onChange = config.onChange || '';
    var stopPropagation = config.stopPropagation ? 'event.stopPropagation(); ' : '';
    
    var h = config.height || 32;
    var w = config.width || 96;
    var btnW = config.btnWidth || 30;
    var inpW = w - (btnW * 2);

    return `
      <div class="d-flex align-items-center justify-content-center mx-auto" style="width: ${w}px; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; background: var(--color-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <button class="btn btn-light d-flex align-items-center justify-content-center p-0" style="width: ${btnW}px; height: ${h}px; border: none; border-radius: 0; background: #f8f9fa; color: #475569;" onclick="${stopPropagation}${onDecrease}" title="Giảm">
          <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
        </button>
        <input type="text" class="form-control text-center p-0 border-0" style="width: ${inpW}px; height: ${h}px; font-weight: 600; font-size: 13px; background: transparent; box-shadow: none;" value="${value}" onchange="${stopPropagation}${onChange}" title="Nhập số lượng">
        <button class="btn btn-light d-flex align-items-center justify-content-center p-0" style="width: ${btnW}px; height: ${h}px; border: none; border-radius: 0; background: #f8f9fa; color: #475569;" onclick="${stopPropagation}${onIncrease}" title="Tăng">
          <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
        </button>
      </div>
    `;
  }

  /**
   * Hàm đọc số thành chữ tiếng Việt
   */
  function docSoTienVN(n) {
    if (!n || n === 0) return 'Không đồng';
    var dvDoc = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];
    var soDoc = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    function docNhom(so) {
      var tram = Math.floor(so / 100);
      var chuc = Math.floor((so % 100) / 10);
      var dv = so % 10;
      var kq = '';
      if (tram > 0) kq += soDoc[tram] + ' trăm ';
      if (chuc === 1) kq += 'mười ';
      else if (chuc > 1) kq += soDoc[chuc] + ' mươi ';
      if (dv === 1 && chuc > 1) kq += 'mốt ';
      else if (dv === 5 && chuc > 0) kq += 'lăm ';
      else if (dv > 0) kq += soDoc[dv] + ' ';
      return kq.trim();
    }
    var str = Math.round(n).toString();
    var groups = [];
    while (str.length > 0) {
      groups.unshift(str.slice(-3));
      str = str.slice(0, -3);
    }
    var result = '';
    groups.forEach(function (g, i) {
      var val = parseInt(g, 10);
      if (val > 0) {
        result += docNhom(val) + ' ' + dvDoc[groups.length - 1 - i] + ' ';
      }
    });
    return result.trim() + ' đồng';
  }

  /**
   * Cài đặt tự động format số tiền + hiển thị text cho một ô input có sẵn
   */
  function setupMoneyInput(inputEl, textEl) {
    if (!inputEl) return;
    
    function refresh() {
      var raw = parseInt(inputEl.value.replace(/\D/g, ''), 10) || 0;
      inputEl.value = raw === 0 ? '' : raw.toLocaleString('vi-VN');
      if (textEl) textEl.innerText = raw === 0 ? '' : docSoTienVN(raw);
    }

    inputEl.addEventListener('input', function () {
      var pos = this.selectionStart;
      var oldLen = this.value.length;
      var raw = parseInt(this.value.replace(/\D/g, ''), 10) || 0;
      
      this.value = raw === 0 ? '' : raw.toLocaleString('vi-VN');
      
      var diff = this.value.length - oldLen;
      if (pos !== null) {
        this.setSelectionRange(pos + diff, pos + diff);
      }
      
      if (textEl) textEl.innerText = raw === 0 ? '' : docSoTienVN(raw);
    });

    inputEl.addEventListener('blur', function () {
      refresh();
    });

    refresh();
  }

  return {
    createText: createText,
    createNumber: createNumber,
    createDate: createDate,
    createTime: createTime,
    createPassword: createPassword,
    createSwitch: createSwitch,
    createSelect: createSelect,
    createQuantityHTML: createQuantityHTML,
    docSoTienVN: docSoTienVN,
    setupMoneyInput: setupMoneyInput
  };
})();


/* --- Button.js --- */
/**
 * Button Component
 * Sinh Nút bấm (Button) bằng DOM manipulation.
 */
var UIButton = (function () {

  /**
   * Tạo Nút bấm mới
   * @param {Object} config - { id, text, icon, type, className, onClick, disabled, tooltip }
   */
  function create(config) {
    var btn = document.createElement('button');
    btn.type = 'button'; // Prevent form submission
    
    // Base class
    var typeClass = config.type ? 'btn-' + config.type : 'btn-primary';
    if (config.type === 'tool') typeClass = 'btn-tool'; // Special case for toolbar
    
    btn.className = 'btn ' + typeClass + (config.className ? ' ' + config.className : '');
    
    if (config.id) btn.id = config.id;
    if (config.disabled) btn.disabled = true;
    if (config.tooltip) btn.title = config.tooltip;

    // Raw attribute string support (e.g. 'data-tooltip="..."')
    if (config.attrs) {
      var tempEl = document.createElement('div');
      tempEl.innerHTML = '<span ' + config.attrs + '></span>';
      var tempSpan = tempEl.firstChild;
      if (tempSpan && tempSpan.attributes) {
        for (var i = 0; i < tempSpan.attributes.length; i++) {
          btn.setAttribute(tempSpan.attributes[i].name, tempSpan.attributes[i].value);
        }
      }
    }

    // Build nội dung
    var innerHTML = '';
    if (config.icon) {
      innerHTML += '<span class="material-symbols-outlined">' + config.icon + '</span>';
    }
    if (config.text) {
      innerHTML += '<span>' + config.text + '</span>';
    }
    btn.innerHTML = innerHTML;

    // Gắn sự kiện
    if (typeof config.onClick === 'function') {
      btn.addEventListener('click', function(e) {
        if (!btn.disabled) {
          config.onClick(e);
        }
      });
    }

    return btn;
  }

  /**
   * Tạo Bar chứa danh sách các nút
   * @param {Array} buttonsConfig - Mảng config của các nút
   */
  function createBar(buttonsConfig) {
    var bar = document.createElement('div');
    bar.className = 'button-bar';

    buttonsConfig.forEach(function(cfg) {
      if (cfg === '|') {
        var div = document.createElement('div');
        div.className = 'divider';
        bar.appendChild(div);
      } else {
        bar.appendChild(create(cfg));
      }
    });

    return bar;
  }

  /**
   * Sinh HTML chuỗi cho Button
   */
  function createHTML(config) {
    var typeClass = config.type ? 'btn-' + config.type : 'btn-primary';
    if (config.type === 'tool') typeClass = 'btn-tool';
    
    var className = 'btn ' + typeClass + (config.className ? ' ' + config.className : '');
    var idAttr = config.id ? ` id="${config.id}"` : '';
    var disabledAttr = config.disabled ? ' disabled' : '';
    var titleAttr = config.tooltip ? ` title="${config.tooltip}"` : '';
    var onClickAttr = config.onClick ? ` onclick="${config.onClick}"` : '';
    var styleAttr = config.style ? ` style="${config.style}"` : '';
    
    var dataAttrs = '';
    if (config.data) {
      for (var key in config.data) {
        dataAttrs += ` data-${key}="${config.data[key]}"`;
      }
    }
    
    var innerHTML = '';
    if (config.icon) {
      var iconStyle = config.iconStyle ? ` style="${config.iconStyle}"` : '';
      innerHTML += `<span class="material-symbols-outlined"${iconStyle}>${config.icon}</span>`;
    }
    if (config.text) {
      var textStyle = config.textStyle ? ` style="${config.textStyle}"` : '';
      innerHTML += config.icon ? ` <span${textStyle}>${config.text}</span>` : `<span${textStyle}>${config.text}</span>`;
    }

    return `<button type="button" class="${className}"${idAttr}${disabledAttr}${titleAttr}${onClickAttr}${styleAttr}${dataAttrs}>${innerHTML}</button>`;
  }

  return {
    create: create,
    createBar: createBar,
    createHTML: createHTML
  };
})();


/* --- Icon.js --- */
/**
 * Icon Component
 * Quản lý và render Icon (Hỗ trợ cả Material Symbols và Icon font riêng biệt)
 */
var UIIcon = (function () {
  
  /**
   * Sinh ra mã HTML của Icon
   * @param {string} iconName - Tên icon (VD: 'home', 'bar_chart', 'icon-grid')
   * @param {string} style - (Tùy chọn) Style inline bổ sung (VD: 'font-size: 18px;')
   * @param {string} className - (Tùy chọn) Class name bổ sung (VD: 'nav-icon')
   */
  function createHTML(iconName, style, className, onClick) {
    if (!iconName) return '';
    var styleAttr = style ? ' style="' + style + '"' : '';
    var extraClass = className ? ' ' + className : '';
    var onClickAttr = onClick ? ' onclick="' + onClick + '"' : '';
    
    // Nếu có chứa "icon-" hoặc dấu cách, hoặc dấu gạch ngang -> Dùng thẻ <i> cho Icon font
    if (iconName.indexOf('icon-') >= 0 || iconName.indexOf(' ') >= 0 || iconName.indexOf('-') > 0) {
      return '<i class="' + iconName + extraClass + '"' + styleAttr + onClickAttr + '></i>';
    } else {
      // Mặc định: Google Material Symbols Outlined
      return '<span class="material-symbols-outlined' + extraClass + '"' + styleAttr + onClickAttr + '>' + iconName + '</span>';
    }
  }

  /**
   * Tạo DOM Element của Icon
   * @param {string} iconName 
   * @param {string} className 
   */
  function create(iconName, className) {
    if (!iconName) return null;
    var el;
    if (iconName.indexOf('icon-') >= 0 || iconName.indexOf(' ') >= 0 || iconName.indexOf('-') > 0) {
      el = document.createElement('i');
      el.className = iconName + (className ? ' ' + className : '');
    } else {
      el = document.createElement('span');
      el.className = 'material-symbols-outlined' + (className ? ' ' + className : '');
      el.innerText = iconName;
    }
    return el;
  }

  return {
    createHTML: createHTML,
    renderHtml: createHTML, // Keep for backward compatibility
    create: create
  };
})();


/* --- ActionToolbar.js --- */
/**
 * Action Toolbar Component
 * Thanh công cụ chuẩn 6 nút: Thêm, Sửa, Xóa, Lọc, In, Đóng theo REQUIREMENT.md
 */
var UIActionToolbar = (function () {

  /**
   * Sinh thanh Toolbar nghiệp vụ
   * @param {Object} actions - { onAdd, onEdit, onDelete, onFilter, onPrint, onClose }
   */
  function create(actions) {
    actions = actions || {};
    
    var buttons = [
      { text: 'Thêm',  icon: 'add',        type: 'tool', onClick: actions.onAdd,    attrs: 'data-tooltip="Thêm bản ghi mới (Ins)"' },
      { text: 'Sửa',   icon: 'edit',       type: 'tool', onClick: actions.onEdit,   attrs: 'data-tooltip="Sửa bản ghi đã chọn (F2)"' },
      { text: 'Xóa',   icon: 'delete',     type: 'tool', onClick: actions.onDelete, attrs: 'data-tooltip="Xóa bản ghi đã chọn (Del)"' },
      { text: 'Lọc',   icon: 'filter_alt', type: 'tool', onClick: actions.onFilter, attrs: 'data-tooltip="Lọc / Tìm kiếm dữ liệu"' },
      { text: 'In',    icon: 'print',      type: 'tool', onClick: actions.onPrint,  attrs: 'data-tooltip="In danh sách (Ctrl+P)"' },
      { text: 'Đóng',  icon: 'close',      type: 'tool', onClick: actions.onClose,  attrs: 'data-tooltip="Đóng trang hiện tại"' }
    ];

    if (actions.extras && Array.isArray(actions.extras)) {
      actions.extras.forEach(function (btn) {
        buttons.push(btn);
      });
    }

    var filteredButtons = [];
    buttons.forEach(function(b) {
      if (b.onClick === false) return; // Hide button
      if (b.onClick === 'DISABLED' || b.onClick === 'disabled') {
        b.disabled = true;
        b.onClick = function() {
          if (typeof Alert !== 'undefined') Alert.warning('Từ chối', 'Bạn không có quyền thao tác chức năng này!');
        };
      }
      filteredButtons.push(b);
    });

    return UIButton.createBar(filteredButtons);
  }

  return {
    create: create
  };
})();


/* --- Card.js --- */
/**
 * Card Component
 * Sinh khối bao bọc Card chuẩn xác bằng JS.
 */
var UICard = (function () {

  /**
   * Tạo Card
   * @param {Object} config - { title, rightElement (DOM), bodyContent (DOM/HTML), className }
   */
  function create(config) {
    var card = document.createElement('div');
    card.className = 'card ' + (config.className || '');

    // Header
    if (config.title || config.rightElement) {
      var header = document.createElement('div');
      header.className = 'card-header';
      
      var titleSpan = document.createElement('span');
      titleSpan.innerText = config.title || '';
      header.appendChild(titleSpan);

      if (config.rightElement) {
        header.appendChild(config.rightElement);
      }
      card.appendChild(header);
    }

    // Body
    var body = document.createElement('div');
    body.className = 'card-body';
    
    if (config.bodyContent) {
      if (typeof config.bodyContent === 'string') {
        body.innerHTML = config.bodyContent;
      } else {
        body.appendChild(config.bodyContent);
      }
    }

    card.appendChild(body);

    return card;
  }

  return {
    create: create
  };
})();


/* --- Table.js --- */
/**
 * Table Component
 * Sinh ra DataGrid Table với JS.
 */
var UITable = (function () {

  /**
   * Tạo Datagrid Table
   * @param {Object} config - { headers (Array), data (Array), columns (Array of mappings), className }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper ' + (config.className || '');
    // Bỏ viền 2 bên
    wrapper.style.borderRadius = '0';
    wrapper.style.borderTop = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderBottom = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderLeft = 'none';
    wrapper.style.borderRight = 'none';
    wrapper.style.overflow = 'auto'; // Cho phép scroll ngang nếu bị tràn

    var table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = 'max-content'; // Chống kéo giãn, các cột sẽ nằm gần nhau
    table.style.whiteSpace = 'nowrap'; // Đảm bảo nội dung không bị rớt dòng làm cột bị giãn
    table.style.tableLayout = 'auto';

    // Tbody & Thead
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Ép style thu gọn khoảng cách (Compact Density)
    var styleDensity = document.createElement('style');
    styleDensity.innerHTML = `
      .table-wrapper .data-table th,
      .table-wrapper .data-table td {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
      }
      @media (max-width: 768px) {
        .dynamic-grid-card .table-wrapper {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
        }
        .table-wrapper .data-table th:first-child,
        .table-wrapper .data-table td:first-child {
          padding-left: 16px !important;
        }
      }
    `;
    wrapper.appendChild(styleDensity);

    var currentData = config.data ? config.data.slice() : [];
    var currentSort = config.currentSort ? { field: config.currentSort.field, dir: config.currentSort.dir } : { field: null, dir: 'asc' };

    function renderBody() {
      tbody.innerHTML = '';
      if (currentData && currentData.length > 0) {
        currentData.forEach(function (row) {
          var tr = document.createElement('tr');

          if (config.columns) {
            config.columns.forEach(function (col, idx) {
              var td = document.createElement('td');
              if (col.align) td.style.textAlign = col.align;

              if (config.headers && config.headers[idx] && config.headers[idx].label) {
                td.setAttribute('data-label', config.headers[idx].label);
              }

              var val = row[col.field];
              if (col.render) {
                var rendered = col.render(val, row);
                if (typeof rendered === 'string') td.innerHTML = rendered;
                else if (rendered instanceof Node) td.appendChild(rendered);
              } else {
                td.innerText = val !== undefined && val !== null ? val : '';
              }
              tr.appendChild(td);
            });
          } else {
            row.forEach(function (cellStr) {
              var td = document.createElement('td');
              if (typeof cellStr === 'string' && cellStr.indexOf('<') > -1) {
                td.innerHTML = cellStr;
              } else {
                td.innerText = cellStr;
              }
              tr.appendChild(td);
            });
          }

          tbody.appendChild(tr);
        });
      } else {
        var trEmpty = document.createElement('tr');
        trEmpty.className = 'empty-row';
        trEmpty.style.border = 'none';
        trEmpty.style.background = 'transparent';
        trEmpty.style.boxShadow = 'none';

        var tdEmpty = document.createElement('td');
        tdEmpty.colSpan = config.headers ? config.headers.length : 1;
        tdEmpty.style.display = 'block';
        tdEmpty.style.textAlign = 'center';
        tdEmpty.style.padding = '32px 16px';
        tdEmpty.style.color = 'var(--color-text-secondary)';
        tdEmpty.style.borderBottom = 'none';
        tdEmpty.innerText = 'Không có dữ liệu';

        trEmpty.appendChild(tdEmpty);
        tbody.appendChild(trEmpty);
      }
    }

    // Thead
    function renderHead() {
      thead.innerHTML = '';
      if (config.headers && config.headers.length > 0) {
        var trHead = document.createElement('tr');

        config.headers.forEach(function (h, idx) {
          var th = document.createElement('th');
          th.draggable = true; // Enable drag
          th.style.cursor = 'grab'; // Add grab cursor to indicate draggable
          th.style.userSelect = 'none'; // Prevent text selection during drag

          // Drag and Drop Logic
          th.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(idx));
            setTimeout(function () { th.style.opacity = '0.5'; }, 0);
          });
          th.addEventListener('dragend', function (e) {
            th.style.opacity = '1';
            th.style.cursor = 'grab';
          });
          th.addEventListener('dragenter', function (e) {
            e.preventDefault();
          });
          th.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            th.style.borderLeft = '2px solid var(--color-primary)';
          });
          th.addEventListener('dragleave', function (e) {
            th.style.borderLeft = '';
          });
          th.addEventListener('drop', function (e) {
            e.preventDefault();
            th.style.borderLeft = '';
            var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            var toIdx = idx;
            if (!isNaN(fromIdx) && fromIdx !== toIdx) {
              // Swap headers
              var movedHeader = config.headers.splice(fromIdx, 1)[0];
              config.headers.splice(toIdx, 0, movedHeader);
              // Swap columns
              if (config.columns) {
                var movedCol = config.columns.splice(fromIdx, 1)[0];
                config.columns.splice(toIdx, 0, movedCol);
              }
              renderAll(); // Re-render head and body
            }
          });

          var spanTxt = document.createElement('span');
          var labelText = h.label || h;
          if (typeof labelText === 'string') {
            labelText = labelText.replace(/\s*:\s*$/, '');
          }
          spanTxt.innerText = labelText;
          spanTxt.style.pointerEvents = 'none'; // Prevent child interference
          th.appendChild(spanTxt);

          if (h.width) {
            th.style.width = h.width;
            th.style.minWidth = h.width; // Ép cứng chiều rộng ban đầu
          }
          if (h.align) th.style.textAlign = h.align;

          // --- COLUMN RESIZING LOGIC ---
          th.style.position = 'relative'; // Cần thiết để neo resizer

          var resizer = document.createElement('div');
          resizer.className = 'col-resizer';
          resizer.style.cssText = 'position: absolute; right: -8px; top: 0; bottom: 0; width: 16px; cursor: col-resize; z-index: 10; display: flex; justify-content: center; touch-action: none;';

          var resizerLine = document.createElement('div');
          resizerLine.style.cssText = 'width: 2px; height: 100%; background: transparent; transition: background 0.2s;';
          resizer.appendChild(resizerLine);

          resizer.addEventListener('mouseenter', function () { resizerLine.style.background = 'var(--color-primary, #4361ee)'; });
          resizer.addEventListener('mouseleave', function () { resizerLine.style.background = 'transparent'; });

          resizer.addEventListener('pointerdown', function (e) {
            e.stopPropagation(); // Ngăn sự kiện drag and drop cột
            e.preventDefault();

            var startX = e.clientX;
            var startWidth = th.offsetWidth;

            document.body.style.cursor = 'col-resize';
            window._isResizingColumn = true;

            function onPointerMove(ev) {
              var newWidth = startWidth + (ev.clientX - startX);
              if (newWidth > 40) { // Giới hạn nhỏ nhất là 40px
                th.style.width = newWidth + 'px';
                th.style.minWidth = newWidth + 'px';
                h.width = newWidth + 'px'; // Lưu lại config để khi re-render (sort/drag) không bị mất
              }
            }

            function onPointerUp(ev) {
              document.body.style.cursor = '';
              document.removeEventListener('pointermove', onPointerMove);
              document.removeEventListener('pointerup', onPointerUp);
              setTimeout(function () { window._isResizingColumn = false; }, 100);
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
          });

          // Cực kỳ quan trọng: Ngăn event click bong bóng lên <th> sau khi thả chuột (nếu không sẽ bị kích hoạt Sort)
          resizer.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
          });

          // Tự động điều chỉnh độ rộng cột khi double click vào viền
          resizer.addEventListener('dblclick', function (e) {
            e.stopPropagation();
            e.preventDefault();

            var maxWidth = spanTxt.scrollWidth + 36; // Căn chỉnh cho icon sort và padding header

            var rows = tbody.querySelectorAll('tr');
            for (var i = 0; i < rows.length; i++) {
              var cell = rows[i].children[idx];
              if (cell) {
                var originalWs = cell.style.whiteSpace;
                cell.style.whiteSpace = 'nowrap';
                var cellWidth = cell.scrollWidth;

                // Thêm khoảng đệm tương ứng (khoảng 20px - padding td: 6px 10px)
                if (cellWidth + 20 > maxWidth) {
                  maxWidth = cellWidth + 20;
                }
                cell.style.whiteSpace = originalWs;
              }
            }

            maxWidth = Math.min(maxWidth, 800); // Giới hạn không cho cột bị giãn to vô lý

            th.style.width = maxWidth + 'px';
            th.style.minWidth = maxWidth + 'px';
            h.width = maxWidth + 'px'; // Cập nhật config để giữ lại kích thước
          });

          th.appendChild(resizer);

          // Nếu header có sortable
          if (h.sortable && h.field) {

            var icon = document.createElement('span');
            icon.className = 'material-symbols-outlined sort-icon';
            icon.style.pointerEvents = 'none'; // Prevent child interference

            if (currentSort.field === h.field) {
              icon.innerText = currentSort.dir === 'asc' ? 'expand_less' : 'expand_more';
              icon.style.color = 'var(--color-primary)';
            } else {
              icon.innerText = 'unfold_more';
              icon.style.color = 'var(--color-text-secondary)';
            }

            icon.style.fontSize = '14px';
            icon.style.verticalAlign = 'middle';
            icon.style.marginLeft = '4px';
            th.appendChild(icon);

            th.addEventListener('click', function (e) {
              if (window._isResizingColumn) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }

              // Reset all icons
              trHead.querySelectorAll('.sort-icon').forEach(function (i) {
                i.innerText = 'unfold_more';
                i.style.color = 'var(--color-text-secondary)';
              });

              if (currentSort.field === h.field) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.field = h.field;
                currentSort.dir = 'asc';
              }

              icon.innerText = currentSort.dir === 'asc' ? 'expand_less' : 'expand_more';
              icon.style.color = 'var(--color-primary)';

              if (typeof config.onSort === 'function') {
                // Server-side sort callback
                config.onSort(currentSort.field, currentSort.dir);
              } else {
                // Client-side sort
                currentData.sort(function (a, b) {
                  var v1 = a[h.field];
                  var v2 = b[h.field];
                  if (v1 === v2) return 0;
                  if (v1 == null) return currentSort.dir === 'asc' ? -1 : 1;
                  if (v2 == null) return currentSort.dir === 'asc' ? 1 : -1;

                  if (typeof v1 === 'string') v1 = v1.toLowerCase();
                  if (typeof v2 === 'string') v2 = v2.toLowerCase();

                  if (v1 < v2) return currentSort.dir === 'asc' ? -1 : 1;
                  return currentSort.dir === 'asc' ? 1 : -1;
                });
                renderBody();
              }
              // Re-trigger re-selection logic if needed (handled by external click listener on tbody)
            });
          }

          trHead.appendChild(th);
        });
        thead.appendChild(trHead);
      }
    }

    function renderAll() {
      renderHead();
      renderBody();
    }

    renderAll();
    wrapper.appendChild(table);

    wrapper.updateData = function (newData) {
      currentData = newData ? newData.slice() : [];
      renderBody();
      wrapper.hideLoading();
    };

    wrapper.showLoading = function (text) {
      wrapper.style.position = 'relative';
      var loader = wrapper.querySelector('.table-loader');
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'table-loader';
        loader.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;z-index:10;font-weight:600;color:var(--color-primary);border-radius:8px;backdrop-filter:blur(2px);';
        wrapper.appendChild(loader);
      }
      loader.innerText = text || 'Đang tải dữ liệu...';
      loader.style.display = 'flex';
    };

    wrapper.hideLoading = function () {
      var loader = wrapper.querySelector('.table-loader');
      if (loader) loader.style.display = 'none';
    };

    return wrapper;
  }

  /**
   * Tạo Datagrid Table động từ dữ liệu SQL
   * @param {Array} data - Dữ liệu thô từ API
   * @param {Object} dictionary - Map tên cột { 'Makh': 'Mã KH' }
   * @param {Object} options - { onSort, currentSort, actionRenderers }
   */
  function createDynamic(data, dictionary, options) {
    dictionary = dictionary || {};
    options = options || {};

    var dynamicHeaders = [];
    var dynamicColumns = [];

    // Lấy keys từ data hoặc orderedFields, nếu data rỗng thì lấy từ dictionary
    var keys = [];
    if (options.orderedFields && options.orderedFields.length > 0) {
      var rowKeys = data && data.length > 0 ? Object.keys(data[0]) : [];
      keys = options.orderedFields.filter(function (k) {
        return rowKeys.indexOf(k) >= 0 || (dictionary && dictionary[k] !== undefined);
      });
    } else if (data && data.length > 0) {
      keys = Object.keys(data[0]);
    } else if (dictionary && Object.keys(dictionary).length > 0) {
      keys = Object.keys(dictionary);
    }


    if (keys.length > 0) {
      keys.forEach(function (key) {
        if (key === 'id' || key === 'Id') return;
        if (key.startsWith('_')) return;

        var headerLabel = dictionary[key] || key;
        var header = { label: headerLabel, sortable: true, field: key };
        var col = { field: key };

        // Default render: Tooltip
        col.render = function (v) {
          if (v == null || v === '') return '';
          var safeVal = String(v).replace(/"/g, '&quot;');
          return '<span title="' + safeVal + '">' + safeVal + '</span>';
        };

        // Heuristic Width
        var keyLower = key.toLowerCase();
        if (keyLower.indexOf('dt') >= 0 || keyLower.indexOf('dienthoai') >= 0 || keyLower.indexOf('date') >= 0 || keyLower.indexOf('user') >= 0 || keyLower.indexOf('ma') === 0) {
          header.width = '120px';
        } else if (keyLower.indexOf('so') === 0 || keyLower.indexOf('sl') === 0 || keyLower.indexOf('số') === 0) {
          header.width = '90px';
        } else if (keyLower.indexOf('mail') >= 0) {
          header.width = '160px';
        } else if (keyLower.indexOf('diachi') >= 0 || keyLower.indexOf('địa chỉ') >= 0) {
          header.width = '200px';
        } else {
          header.width = '150px';
        }

        // Heuristic Format
        if (keyLower.indexOf('date') >= 0 || keyLower.indexOf('ngày') >= 0) {
          header.align = 'center';
          col.align = 'center';
          col.render = function (v) { return typeof FormatUtils !== 'undefined' ? FormatUtils.date(v) : v; };
        } else if (keyLower.startsWith('is') || keyLower.indexOf('trangthai') >= 0 || keyLower.indexOf('trạng thái') >= 0) {
          header.align = 'center';
          col.align = 'center';
        } else if (keyLower.indexOf('tien') >= 0 || keyLower.indexOf('tiền') >= 0 || keyLower.indexOf('luong') >= 0 || keyLower.indexOf('lương') >= 0 || keyLower.indexOf('mucdong') >= 0 || keyLower.indexOf('mức đóng') >= 0 || keyLower.indexOf('sotien') >= 0) {
          header.align = 'right';
          col.align = 'right';
        }

        // Custom renderer (nếu truyền vào)
        if (options.actionRenderers && options.actionRenderers[key]) {
          var customRender = options.actionRenderers[key];
          col.render = function (v) { return customRender(v, key); };
        } else if (options.actionRenderers && options.actionRenderers[headerLabel]) {
          // Hoặc kiểm tra theo label tiếng Việt nếu dev truyền key là label
          var customRenderLabel = options.actionRenderers[headerLabel];
          col.render = function (v) { return customRenderLabel(v, key); };
        }

        dynamicHeaders.push(header);
        dynamicColumns.push(col);
      });
    }

    var tableConfig = {
      headers: dynamicHeaders,
      columns: dynamicColumns,
      data: data,
      currentSort: options.currentSort,
      onSort: options.onSort,
      className: options.className
    };

    return create(tableConfig);
  }

  // =========================================================================
  // GLOBAL ADVANCED FEATURES (Drag Select & Context Menu)
  // Tự động áp dụng cho TẤT CẢ các thẻ table trong toàn hệ thống
  // =========================================================================
  (function setupGlobalTableFeatures() {
    if (typeof window === 'undefined') return;

    function showContextMenuForEvent(e, triggerTd, triggerTr) {
      if (typeof UIContextMenu === 'undefined') return;
      var getRowText = function (rowEl) {
        if (!rowEl) return '';
        var cells = rowEl.querySelectorAll('td');
        var textArr = [];
        for (var i = 0; i < cells.length; i++) {
          var clone = cells[i].cloneNode(true);
          var btns = clone.querySelectorAll('button, .btn, .material-symbols-outlined, .material-icons');
          btns.forEach(function (b) { b.remove(); });
          var text = clone.innerText.trim();
          if (text) textArr.push(text);
        }
        return textArr.join(' | ');
      };

      var tbody = triggerTr ? triggerTr.closest('tbody') : null;
      var activeRows = tbody ? Array.from(tbody.querySelectorAll('tr.active')) : [];
      var isMultiple = activeRows.length > 1;

      var menuItems = [];

      if (triggerTd) {
        menuItems.push({
          icon: 'content_copy',
          label: 'Copy ô (Cell)',
          onClick: function () {
            navigator.clipboard.writeText(triggerTd.innerText.trim());
            if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ô', 'success');
          }
        });
      }

      if (isMultiple) {
        menuItems.push({
          icon: 'library_books',
          label: 'Copy ' + activeRows.length + ' dòng đã chọn',
          onClick: function () {
            var allText = activeRows.map(function (r) { return getRowText(r); }).join('\n');
            navigator.clipboard.writeText(allText);
            if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ' + activeRows.length + ' dòng', 'success');
          }
        });
      }

      if (triggerTr && !isMultiple) {
        menuItems.push({
          icon: 'file_copy',
          label: 'Copy dòng (Row)',
          onClick: function () {
            if (triggerTr) {
              navigator.clipboard.writeText(getRowText(triggerTr));
              if (typeof UIToast !== 'undefined') UIToast.show('Đã copy dữ liệu dòng', 'success');
            }
          }
        });
      }

      UIContextMenu.show(e, menuItems);
    }

    // 1. GLOBAL CONTEXT MENU
    document.addEventListener('contextmenu', function (e) {
      if ((typeof isDragSelecting !== 'undefined' && isDragSelecting) || (typeof lastDragEndTime !== 'undefined' && Date.now() - lastDragEndTime < 500)) {
        e.preventDefault();
        return;
      }

      var table = e.target.closest('table');
      if (!table || table.classList.contains('no-advanced-features')) return;

      var td = e.target.closest('td');
      var tr = e.target.closest('tr');
      if (!td && !tr) return;
      if (td && (td.querySelector('.btn') || td.querySelector('button'))) return;

      e.preventDefault();
      showContextMenuForEvent(e, td, tr);
    });

    // 2. GLOBAL DRAG SELECT
    var isDragSelecting = false;
    var dragAction = null;
    var dragTimer = null;
    var lastDragRowIdx = -1;
    var lastPointerX = -1;
    var lastPointerY = -1;
    var autoScrollFrame = null;
    var activeTbody = null;
    var lastDragEndTime = 0;

    document.addEventListener('touchmove', function (e) {
      if (isDragSelecting) e.preventDefault();
    }, { passive: false });

    function toggleGlobalRow(tr, tbody, forceAction) {
      var isActive = tr.classList.contains('active');
      var changed = false;
      if (forceAction === 'add' && !isActive) {
        tr.classList.add('active');
        changed = true;
      } else if (forceAction === 'remove' && isActive) {
        tr.classList.remove('active');
        changed = true;
      }

      if (changed) {
        var idx = Array.from(tbody.children).indexOf(tr);
        // Dispatch custom event for frameworks (like DynamicFormEngine) to catch
        tbody.dispatchEvent(new CustomEvent('rowSelectionToggled', {
          bubbles: true,
          detail: { tr: tr, rowIndex: idx, action: forceAction }
        }));
      }
    }

    function updateGlobalSelectionAtPoint(x, y) {
      var el = document.elementFromPoint(x, y);
      if (el && activeTbody) {
        var moveTr = el.closest('tr');
        if (moveTr && moveTr.parentNode === activeTbody) {
          var moveIdx = Array.from(activeTbody.children).indexOf(moveTr);
          if (moveIdx !== lastDragRowIdx) {
            toggleGlobalRow(moveTr, activeTbody, dragAction);
            lastDragRowIdx = moveIdx;
          }
        }
      }
    }

    function handleGlobalAutoScroll() {
      if (!isDragSelecting) return;
      var scrollArea = document.querySelector('.app-content') || document.documentElement;
      var rect = scrollArea.getBoundingClientRect ? scrollArea.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      var edgeSize = 80;
      var scrollAmount = 0;

      if (lastPointerY > 0 && lastPointerY < rect.top + edgeSize) {
        scrollAmount = -15;
      } else if (lastPointerY > 0 && lastPointerY > rect.bottom - edgeSize) {
        scrollAmount = 15;
      }

      if (scrollAmount !== 0) {
        scrollArea.scrollTop += scrollAmount;
        updateGlobalSelectionAtPoint(lastPointerX, lastPointerY);
      }
      autoScrollFrame = requestAnimationFrame(handleGlobalAutoScroll);
    }

    document.addEventListener('pointerdown', function (e) {
      var tr = e.target.closest('tr');
      var table = e.target.closest('table');

      if (!table || table.classList.contains('no-advanced-features') || table.classList.contains('no-drag-select')) return;
      if (!tr || tr.closest('thead') || tr.children.length <= 1 || e.button !== 0 || e.target.closest('.btn') || e.target.closest('button')) return;

      var tbody = tr.closest('tbody');
      if (!tbody) return;

      var startX = e.clientX, startY = e.clientY;
      var idx = Array.from(tbody.children).indexOf(tr);

      lastDragRowIdx = idx;
      activeTbody = tbody;
      isDragSelecting = false;

      dragTimer = setTimeout(function () {
        isDragSelecting = true;
        activeTbody.isDragSelectingFlag = true;
        var isActive = tr.classList.contains('active');
        dragAction = isActive ? 'remove' : 'add';

        document.body.style.userSelect = 'none';
        activeTbody.style.touchAction = 'none';

        if (navigator.vibrate) navigator.vibrate(50);

        lastPointerX = startX;
        lastPointerY = startY;
        autoScrollFrame = requestAnimationFrame(handleGlobalAutoScroll);

        toggleGlobalRow(tr, activeTbody, dragAction);
      }, 350);

      function onPointerMove(ev) {
        if (!isDragSelecting) {
          if (Math.abs(ev.clientX - startX) > 10 || Math.abs(ev.clientY - startY) > 10) {
            clearTimeout(dragTimer);
          }
        } else {
          ev.preventDefault();
          lastPointerX = ev.clientX;
          lastPointerY = ev.clientY;
          updateGlobalSelectionAtPoint(lastPointerX, lastPointerY);
        }
      }

      function onPointerUp(ev) {
        clearTimeout(dragTimer);
        if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
        document.body.style.userSelect = '';
        if (activeTbody) activeTbody.style.touchAction = '';

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);

        if (isDragSelecting) {
          lastDragEndTime = Date.now();
          var cachedTbody = activeTbody;
          var preventClick = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            document.removeEventListener('click', preventClick, true);
          };
          document.addEventListener('click', preventClick, true);
          setTimeout(function () {
            document.removeEventListener('click', preventClick, true);
            if (cachedTbody) cachedTbody.isDragSelectingFlag = false;
          }, 50);

          // Tự động bật menu copy sau khi kéo chọn xong (hoặc nhấn giữ lâu)
          if (tr) {
            // Chỉ hiển thị menu copy nếu thao tác vừa rồi không phải là bỏ chọn (hoặc vẫn còn dòng đang được chọn)
            var hasSelected = activeTbody && activeTbody.querySelectorAll('tr.active').length > 0;
            if (hasSelected) {
              // Fake event type thành contextmenu để UIContextMenu dùng tọa độ thay vì fallback
              var finalPageX = ev.pageX || (lastPointerX + window.scrollX);
              var finalPageY = ev.pageY || (lastPointerY + window.scrollY);
              var fakeEvent = {
                type: 'contextmenu',
                pageX: finalPageX,
                pageY: finalPageY,
                target: ev.target,
                preventDefault: function () { },
                stopPropagation: function () { }
              };
              showContextMenuForEvent(fakeEvent, tr.querySelector('td') || tr.children[0], tr);
            }
          }

          isDragSelecting = false;
        }
      }

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    });
  })();

  return {
    create: create,
    createDynamic: createDynamic
  };
})();


/* --- Tabs.js --- */
/**
 * Tabs Component
 * Quản lý chuyển đổi các Tab (Ví dụ: Tab Bàn tiệc, Tab Khác...)
 */
var UITabs = (function () {

  /**
   * Tạo bộ Tabs
   * @param {Array} tabsConfig - [{ id, title, content (DOM) }]
   */
  function create(tabsConfig) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-tabs';

    var header = document.createElement('div');
    header.className = 'ui-tabs-header';

    var body = document.createElement('div');
    body.className = 'ui-tabs-body';

    tabsConfig.forEach(function (tab, index) {
      // Header Button
      var btn = document.createElement('button');
      btn.className = 'ui-tab-btn' + (index === 0 ? ' active' : '');
      btn.innerText = tab.title;
      btn.dataset.target = tab.id;
      header.appendChild(btn);

      // Panel Body
      var panel = document.createElement('div');
      panel.className = 'ui-tab-panel' + (index === 0 ? ' active' : '');
      panel.id = 'panel-' + tab.id;

      if (typeof tab.content === 'string') {
        panel.innerHTML = tab.content;
      } else if (tab.content instanceof Node) {
        panel.appendChild(tab.content);
      }

      body.appendChild(panel);

      // Event listener
      btn.addEventListener('click', function () {
        // Gỡ active toàn bộ
        var allBtns = header.querySelectorAll('.ui-tab-btn');
        var allPanels = body.querySelectorAll('.ui-tab-panel');

        allBtns.forEach(b => b.classList.remove('active'));
        allPanels.forEach(p => p.classList.remove('active'));

        // Set active cho nút được bấm
        btn.classList.add('active');
        panel.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- NestedTabs.js --- */
/**
 * UINestedTabs — Tab phân cấp 2 cấp (Cha → Con) + Kéo thả sắp xếp
 * ──────────────────────────────────────────────────────────────────
 * Nhận vào một mảng flat từ DB (giống WA_Menu):
 *   [{ id, parent, label, [icon], [formName] }]
 *
 * Quy tắc xác định cha/con:
 *   - parent === '' hoặc null/undefined → Tab CHA (root)
 *   - parent !== ''                     → Tab CON (thuộc parent đó)
 *
 * API:
 *   UINestedTabs.create(records, options?) → DOM Element
 *   UINestedTabs.createFromDB(dbRows, options?) → DOM Element
 *
 * Options:
 *   onTabChange(parentId, childId)            - callback khi đổi tab
 *   onReorder(type, orderedIds, parentId?)    - callback khi kéo thả xong
 *                                               type = 'parent' | 'child'
 *   renderContent(item)                       - trả về Node | string cho panel
 *   defaultParentId                           - tab cha active ban đầu
 *   defaultChildId                            - tab con active ban đầu
 *   draggable                                 - true (mặc định) để bật kéo thả
 */
var UINestedTabs = (function () {

  // ════════════════════════════════════════════════════════════
  //  PUBLIC: create
  // ════════════════════════════════════════════════════════════
  function create(records, options) {
    options = options || {};
    var isDraggable = options.draggable !== false; // bật mặc định

    // ── 1. Phân loại cha / con ──────────────────────────────────
    var parents = records.filter(function (r) {
      return !r.parent || r.parent.trim() === '';
    });

    var childrenMap = {}; // { parentId: [child, ...] }
    records.forEach(function (r) {
      if (r.parent && r.parent.trim() !== '') {
        if (!childrenMap[r.parent]) childrenMap[r.parent] = [];
        childrenMap[r.parent].push(r);
      }
    });

    if (parents.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'ui-nested-tabs-empty';
      empty.textContent = 'Không có dữ liệu Tab';
      return empty;
    }

    // ── Phân nhánh: Vertical vs Horizontal ──────────────────
    if (options.vertical) {
      return _createVertical(parents, childrenMap, options);
    }

    // ── 2. Active mặc định ──────────────────────────────────────
    var defaultParentId = options.defaultParentId || parents[0].id;
    var activeParent    = parents.find(function (p) { return p.id === defaultParentId; }) || parents[0];

    // ── 3. Wrapper ───────────────────────────────────────────────
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-nested-tabs';

    // ── 4. Parent Tab Bar ────────────────────────────────────────
    var parentBar = document.createElement('div');
    parentBar.className = 'ui-nested-tabs__parent-bar';

    // ── 5. Child Area ────────────────────────────────────────────
    var childArea = document.createElement('div');
    childArea.className = 'ui-nested-tabs__child-area';

    // ── 6. Render mỗi parent ────────────────────────────────────
    parents.forEach(function (parentItem) {
      var isParentActive = (parentItem.id === activeParent.id);
      var children       = childrenMap[parentItem.id] || [];

      // ─ Parent button ─
      var pBtn = _buildParentBtn(parentItem, isParentActive, children.length, isDraggable);
      parentBar.appendChild(pBtn);

      // ─ Child section ─
      var childSection = document.createElement('div');
      childSection.className = 'ui-nested-tabs__section' + (isParentActive ? ' active' : '');
      childSection.dataset.sectionId = parentItem.id;

      if (children.length > 0) {
        var defaultChildId  = isParentActive ? (options.defaultChildId || children[0].id) : children[0].id;

        var childBar        = document.createElement('div');
        childBar.className  = 'ui-nested-tabs__child-bar';

        var panelArea       = document.createElement('div');
        panelArea.className = 'ui-nested-tabs__panel-area';

        children.forEach(function (childItem) {
          var isChildActive = (childItem.id === defaultChildId);

          // Child btn
          var cBtn = _buildChildBtn(childItem, parentItem, isChildActive, isDraggable);
          childBar.appendChild(cBtn);

          // Panel
          var panel = _buildPanel(childItem, parentItem, isChildActive, options);
          panelArea.appendChild(panel);

          // Click: activate child tab
          cBtn.addEventListener('click', function () {
            _activateChildTab(childBar, panelArea, cBtn, panel);
            cBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            if (typeof options.onTabChange === 'function') {
              options.onTabChange(parentItem.id, childItem.id);
            }
          });
        });

        // Drag-and-drop cho child bar
        if (isDraggable) {
          _attachDragToBar(childBar, panelArea, 'child', parentItem.id, options);
        }

        childSection.appendChild(childBar);
        childSection.appendChild(panelArea);

      } else {
        // Không có con → panel trực tiếp
        var soloPanel = _buildPanel(parentItem, null, true, options);
        childSection.appendChild(soloPanel);
      }

      childArea.appendChild(childSection);

      // Click: activate parent tab
      pBtn.addEventListener('click', function () {
        _activateParentTab(parentBar, childArea, pBtn, childSection);
        pBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        if (typeof options.onTabChange === 'function') {
          var activeChild = childSection.querySelector('.ui-nested-tab-child-btn.active');
          options.onTabChange(parentItem.id, activeChild ? activeChild.dataset.childId : null);
        }
      });
    });

    // Drag-and-drop cho parent bar
    if (isDraggable) {
      _attachDragToBar(parentBar, null, 'parent', null, options);
    }

    wrapper.appendChild(parentBar);
    wrapper.appendChild(childArea);
    return wrapper;
  }

  // ════════════════════════════════════════════════════════════
  //  PUBLIC: createFromDB
  // ════════════════════════════════════════════════════════════
  function createFromDB(dbRows, options) {
    var records = (dbRows || []).map(function (row) {
      return {
        id:       row.MenuID   || row.id       || row.menuId,
        parent:   row.Parent   || row.parent   || row.parentId || '',
        label:    row.VN       || row.label    || row.name || row.Label || '(Không tên)',
        labelEN:  row.EN       || row.en       || '',
        icon:     row.IconClass || row.icon    || '',
        formName: row.FormName  || row.formName || ''
      };
    });
    return create(records, options);
  }

  // ════════════════════════════════════════════════════════════
  //  PRIVATE: builders
  // ════════════════════════════════════════════════════════════

  function _buildParentBtn(item, isActive, childCount, isDraggable) {
    var btn = document.createElement('button');
    btn.className = 'ui-nested-tab-parent-btn' + (isActive ? ' active' : '');
    btn.dataset.parentId = item.id;

    // Drag handle icon (chỉ hiện khi hover nhờ CSS)
    if (isDraggable) {
      var handle = UIIcon.create('drag_indicator', 'ui-nested-drag-handle');
      btn.appendChild(handle);
      btn.draggable = true;
      btn.dataset.dragType = 'parent';
    }

    if (item.icon) {
      var iconEl = UIIcon.create(item.icon);
      if (iconEl) { iconEl.style.fontSize = '18px'; btn.appendChild(iconEl); }
    }

    var labelSpan = document.createElement('span');
    labelSpan.textContent = item.label || item.id;
    btn.appendChild(labelSpan);

    if (childCount > 0) {
      var badge = document.createElement('span');
      badge.className = 'ui-nested-tab-badge';
      badge.textContent = childCount;
      btn.appendChild(badge);
    }

    return btn;
  }

  function _buildChildBtn(childItem, parentItem, isActive, isDraggable) {
    var btn = document.createElement('button');
    btn.className = 'ui-nested-tab-child-btn' + (isActive ? ' active' : '');
    btn.dataset.childId  = childItem.id;
    btn.dataset.parentId = parentItem.id;

    if (isDraggable) {
      var handle = UIIcon.create('drag_indicator', 'ui-nested-drag-handle ui-nested-drag-handle--child');
      btn.appendChild(handle);

      btn.draggable = true;
      btn.dataset.dragType = 'child';
    }

    var labelSpan = document.createElement('span');
    labelSpan.textContent = childItem.label || childItem.id;
    btn.appendChild(labelSpan);

    return btn;
  }

  function _buildPanel(item, parentItem, isActive, options) {
    var panel = document.createElement('div');
    panel.className = 'ui-nested-tab-panel' + (isActive ? ' active' : '');
    panel.id = 'nested-panel-' + item.id;

    if (typeof options.renderContent === 'function') {
      var content = options.renderContent(item);
      if (typeof content === 'string') {
        panel.innerHTML = content;
      } else if (content instanceof Node) {
        panel.appendChild(content);
      }
    } else {
      panel.innerHTML = _defaultPanelHTML(item, parentItem);
    }

    return panel;
  }

  // ════════════════════════════════════════════════════════════
  //  PRIVATE: activate helpers
  // ════════════════════════════════════════════════════════════

  function _activateParentTab(parentBar, childArea, activeBtn, activeSection) {
    parentBar.querySelectorAll('.ui-nested-tab-parent-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    childArea.querySelectorAll('.ui-nested-tabs__section').forEach(function (s) {
      s.classList.remove('active');
    });
    activeBtn.classList.add('active');
    activeSection.classList.add('active');
  }

  function _activateChildTab(childBar, panelArea, activeBtn, activePanel) {
    childBar.querySelectorAll('.ui-nested-tab-child-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    panelArea.querySelectorAll('.ui-nested-tab-panel').forEach(function (p) {
      p.classList.remove('active');
    });
    activeBtn.classList.add('active');
    activePanel.classList.add('active');
  }

  // ════════════════════════════════════════════════════════════
  //  PRIVATE: Drag-and-drop
  // ════════════════════════════════════════════════════════════

  /**
   * Gắn drag-and-drop vào một tab bar (parent hoặc child)
   * @param {Element} bar          - thanh tab chứa các btn có thể kéo
   * @param {Element|null} panelArea - vùng panel tương ứng (dùng để sync thứ tự panel)
   * @param {string}  type         - 'parent' | 'child'
   * @param {string|null} parentId - id của tab cha (chỉ dùng khi type='child')
   * @param {Object}  options      - options của component
   */
  function _attachDragToBar(bar, panelArea, type, parentId, options) {
    var dragging    = null;  // phần tử đang kéo
    var placeholder = null;  // dải chỉ vị trí thả

    // Selector của các btn trong bar
    var btnSelector = (type === 'parent')
      ? '.ui-nested-tab-parent-btn'
      : '.ui-nested-tab-child-btn';

    // ── dragstart ──
    bar.addEventListener('dragstart', function (e) {
      var btn = e.target.closest(btnSelector);
      if (!btn) return;

      dragging = btn;
      dragging.classList.add('ui-nested-dragging');

      // Tạo ghost image sạch
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', btn.dataset.parentId || btn.dataset.childId || '');

      // Tạo placeholder
      placeholder = document.createElement('div');
      placeholder.className = 'ui-nested-drop-placeholder';
      if (type === 'child') placeholder.classList.add('ui-nested-drop-placeholder--child');
    });

    // ── dragover ──
    bar.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      var target = e.target.closest(btnSelector);
      if (!target || target === dragging) {
        return;
      }

      // Xác định thả vào trước hay sau
      var rect   = target.getBoundingClientRect();
      var offset = (type === 'parent')
        ? e.clientX - rect.left    // ngang
        : e.clientX - rect.left;   // ngang (child bar cũng ngang)
      var half = (type === 'parent') ? rect.width / 2 : rect.width / 2;

      // Xóa placeholder cũ nếu có
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);

      if (offset < half) {
        bar.insertBefore(placeholder, target);
      } else {
        var next = target.nextSibling;
        if (next) bar.insertBefore(placeholder, next);
        else bar.appendChild(placeholder);
      }
    });

    // ── dragleave ──
    bar.addEventListener('dragleave', function (e) {
      // Chỉ xóa placeholder khi ra ngoài bar
      if (!bar.contains(e.relatedTarget) && placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    });

    // ── drop ──
    bar.addEventListener('drop', function (e) {
      e.preventDefault();
      if (!dragging || !placeholder || !placeholder.parentNode) return;

      // Đặt btn vào vị trí placeholder
      bar.insertBefore(dragging, placeholder);
      placeholder.parentNode.removeChild(placeholder);

      // Sync thứ tự panel nếu là child bar
      if (panelArea) {
        _syncPanelOrder(bar, panelArea, btnSelector);
      }

      // Gọi onReorder callback
      if (typeof options.onReorder === 'function') {
        var orderedIds = Array.from(bar.querySelectorAll(btnSelector)).map(function (b) {
          return type === 'parent' ? b.dataset.parentId : b.dataset.childId;
        });
        options.onReorder(type, orderedIds, parentId);
      }

      _cleanup();
    });

    // ── dragend ──
    bar.addEventListener('dragend', function () {
      _cleanup();
    });

    // ─ cleanup local state ─
    function _cleanup() {
      if (dragging) {
        dragging.classList.remove('ui-nested-dragging');
        dragging = null;
      }
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
    }
  }

  /**
   * Sau khi kéo thả child btn, sắp xếp lại các panel theo thứ tự btn mới
   */
  function _syncPanelOrder(childBar, panelArea, btnSelector) {
    var btns = Array.from(childBar.querySelectorAll(btnSelector));
    btns.forEach(function (btn) {
      var childId = btn.dataset.childId;
      var panel   = panelArea.querySelector('#nested-panel-' + childId);
      if (panel) panelArea.appendChild(panel); // appendChild tự move về cuối → đúng thứ tự
    });
  }

  // ════════════════════════════════════════════════════════════
  //  PRIVATE: default panel content
  // ════════════════════════════════════════════════════════════

  function _defaultPanelHTML(item, parentItem) {
    return [
      '<div class="ui-nested-tab-default-content">',
        UIIcon.renderHtml(item.icon || 'folder_open', 'font-size:40px;opacity:0.2;display:block;margin-bottom:12px'),
        '<div style="font-weight:600;font-size:15px;margin-bottom:6px">', item.label || item.id, '</div>',
        parentItem
          ? '<div style="font-size:12px;opacity:0.5">Thuộc nhóm: ' + parentItem.label + ' (' + parentItem.id + ')</div>'
          : '',
        item.formName
          ? '<code style="font-size:11px;opacity:0.5;display:block;margin-top:8px">' + item.formName + '</code>'
          : '',
      '</div>'
    ].join('');
  }

  // ════════════════════════════════════════════════════════════
  //  PRIVATE: Vertical layout
  // ════════════════════════════════════════════════════════════

  function _createVertical(parents, childrenMap, options) {
    var isDraggable = options.draggable !== false;

    var defaultParentId = options.defaultParentId || parents[0].id;
    var activeParent    = parents.find(function (p) { return p.id === defaultParentId; }) || parents[0];
    var defaultChildId  = options.defaultChildId  || null;

    var initChildren = childrenMap[activeParent.id] || [];
    var activeChildId = defaultChildId || (initChildren.length > 0 ? initChildren[0].id : null);

    var allContentPanels = [];
    var allSidebarBtns = [];

    var wrapper = document.createElement('div');
    wrapper.className = 'ui-nested-tabs ui-nested-tabs--vertical';

    var sidebar = document.createElement('div');
    sidebar.className = 'ui-nested-tabs__sidebar';

    var contentArea = document.createElement('div');
    contentArea.className = 'ui-nested-tabs__vertical-content';

    function _buildSidebarNode(node, level, isNodeActive, shouldOpen) {
      var children = childrenMap[node.id] || [];
      var isRoot = level === 0;

      var parentGroup = document.createElement('div');
      parentGroup.className = 'ui-nested-tabs__sidebar-parent level-' + level;
      if (isDraggable) {
        parentGroup.draggable = true;
        parentGroup.dataset.dragParentId = node.id;
      }

      var pBtn = document.createElement('button');
      pBtn.className = (isRoot ? 'ui-nested-tab-parent-btn--v' : 'ui-nested-tab-child-btn--v') + (isNodeActive ? ' active' : '');
      pBtn.dataset.nodeId = node.id;
      pBtn.dataset.parentId = node.parent || '';
      if (!isRoot) {
          pBtn.dataset.childId = node.id; 
      }
      
      if (level > 0) {
        pBtn.style.paddingLeft = (16 + level * 20) + 'px';
      }

      if (isDraggable) {
        var handle = UIIcon.create('drag_indicator', 'ui-nested-drag-handle' + (isRoot ? '' : ' ui-nested-drag-handle--child'));
        pBtn.appendChild(handle);
        if (!isRoot) {
            pBtn.draggable = true;
            pBtn.dataset.dragType = 'child';
        }
      }

      var iconWrap = document.createElement('div');
      iconWrap.style.cssText = 'width: 20px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;';
      if (!isRoot) iconWrap.style.marginRight = '8px';

      var actualIcon = node.icon;
      if (!actualIcon || actualIcon.indexOf('icon-') === 0) actualIcon = (isRoot ? 'folder_open' : 'horizontal_rule');

      var iconEl = UIIcon.create(actualIcon);
      if (iconEl) {
        iconEl.style.fontSize = isRoot ? '18px' : '16px';
        if (!node.icon || node.icon.indexOf('icon-') === 0) {
          iconEl.style.opacity = '0.3';
        }
        iconWrap.appendChild(iconEl);
      }
      pBtn.appendChild(iconWrap);

      var lbl = document.createElement('span');
      lbl.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;';
      lbl.textContent = node.label || node.id;
      pBtn.appendChild(lbl);

      if (children.length > 0) {
        var badge = document.createElement('span');
        badge.className = 'ui-nested-tab-badge';
        badge.style.cssText = 'min-width:18px;height:18px;font-size:10px; margin-right: 4px;';
        badge.textContent = children.length;
        pBtn.appendChild(badge);

        var chevron = UIIcon.create('expand_more', 'ui-nested-parent-chevron');
        pBtn.appendChild(chevron);
      }

      parentGroup.appendChild(pBtn);
      allSidebarBtns.push(pBtn);

      var childList = null;
      if (children.length > 0) {
        childList = document.createElement('div');
        childList.className = 'ui-nested-tabs__child-list' + (shouldOpen ? ' open' : '');

        children.forEach(function (childItem) {
           var childIsActive = isNodeActive && (childItem.id === activeChildId);
           var childShouldOpen = childIsActive;
           var cRes = _buildSidebarNode(childItem, level + 1, childIsActive, childShouldOpen);
           childList.appendChild(cRes.group);
        });

        parentGroup.appendChild(childList);

        if (isDraggable) {
          _attachVerticalDrag(childList, contentArea, node.id, options);
        }
      }

      var parentPanel = document.createElement('div');
      parentPanel.className = 'ui-nested-tab-panel--v' + (isNodeActive && (!activeChildId || activeChildId === '') ? ' active' : '');
      parentPanel.id = 'nested-panel-' + node.id;
      if (typeof options.renderContent === 'function') {
        var sc = options.renderContent(node);
        if (typeof sc === 'string') { parentPanel.innerHTML = sc; }
        else if (sc instanceof Node) { parentPanel.appendChild(sc); }
      } else { parentPanel.innerHTML = _defaultPanelHTML(node, null); }
      contentArea.appendChild(parentPanel);
      allContentPanels.push(parentPanel);

      pBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        var isPanelActive = parentPanel.classList.contains('active');

        allSidebarBtns.forEach(function(b) { b.classList.remove('active'); });
        allContentPanels.forEach(function(p) { p.classList.remove('active'); });

        pBtn.classList.add('active');

        if (!isPanelActive) {
          parentPanel.classList.add('active');
          if (childList) childList.classList.add('open');
          
          var curr = parentGroup.parentElement;
          while(curr && curr.classList.contains('ui-nested-tabs__child-list')) {
            curr.classList.add('open');
            curr = curr.parentElement.parentElement;
          }

          if (typeof options.onTabChange === 'function') {
            options.onTabChange(node.id, null);
          }
        } else {
          parentPanel.classList.add('active');
          if (childList) {
            childList.classList.toggle('open');
          }
        }
      });

      return { group: parentGroup };
    }

    parents.forEach(function (parentItem) {
      var isParentActive = (parentItem.id === activeParent.id);
      var res = _buildSidebarNode(parentItem, 0, isParentActive, isParentActive);
      sidebar.appendChild(res.group);
    });

    if (isDraggable) {
      // NOTE: attach to sidebar directly
      _attachVerticalDragParent(sidebar, options);
    }

    var resizer = document.createElement('div');
    resizer.className = 'ui-nested-resizer';
    sidebar.appendChild(resizer);
    _initSidebarResizer(resizer, sidebar);

    wrapper.appendChild(sidebar);
    wrapper.appendChild(contentArea);
    return wrapper;
  }

  /**
   * Khởi tạo tính năng kéo giãn sidebar
   */
  function _initSidebarResizer(resizer, sidebar) {
    var isResizing = false;

    resizer.addEventListener('mousedown', function (e) {
      isResizing = true;
      resizer.classList.add('is-resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      var onMouseMove = function (e) {
        if (!isResizing) return;
        
        // Tính toán độ rộng mới dựa trên vị trí chuột
        var containerRect = sidebar.parentElement.getBoundingClientRect();
        var newWidth = e.clientX - containerRect.left;
        
        // Giới hạn width từ 180px đến 600px
        if (newWidth < 180) newWidth = 180;
        if (newWidth > 600) newWidth = 600;
        
        sidebar.style.width = newWidth + 'px';
      };

      var onMouseUp = function () {
        isResizing = false;
        resizer.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // ── Drag dọc cho child list ──────────────────────────────
  function _attachVerticalDrag(childList, contentArea, parentId, options) {
    var dragging    = null;
    var placeholder = null;

    childList.addEventListener('dragstart', function (e) {
      var grp = e.target.closest('.ui-nested-tabs__sidebar-parent');
      if (!grp || grp.parentElement !== childList) return;
      dragging = grp;
      dragging.classList.add('ui-nested-dragging');
      e.dataTransfer.effectAllowed = 'move';
      placeholder = document.createElement('div');
      placeholder.className = 'ui-nested-drop-placeholder--v';
      e.stopPropagation();
    });

    childList.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      var target = e.target.closest('.ui-nested-tabs__sidebar-parent');
      if (!target || target === dragging || target.parentElement !== childList) return;
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      var rect   = target.getBoundingClientRect();
      var isUpper = (e.clientY - rect.top) < rect.height / 2;
      if (isUpper) childList.insertBefore(placeholder, target);
      else { var nx = target.nextSibling; if (nx) childList.insertBefore(placeholder, nx); else childList.appendChild(placeholder); }
    });

    childList.addEventListener('dragleave', function (e) {
      if (!childList.contains(e.relatedTarget) && placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    });

    childList.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dragging || !placeholder || !placeholder.parentNode) return;
      childList.insertBefore(dragging, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      
      // Sync panel order for UI (if needed, but panels are all flat in contentArea)
      // Array.from(childList.children).forEach(...) is possible, but contentArea order doesn't break CSS rendering.
      
      if (typeof options.onReorder === 'function') {
        var ids = Array.from(childList.querySelectorAll(':scope > .ui-nested-tabs__sidebar-parent > .ui-nested-tab-child-btn--v')).map(function (b) { return b.dataset.childId || b.dataset.nodeId; });
        options.onReorder('child', ids, parentId);
      }
      _vCleanup();
    });

    childList.addEventListener('dragend', function(e) { e.stopPropagation(); _vCleanup(); });

    function _vCleanup() {
      if (dragging) { dragging.classList.remove('ui-nested-dragging'); dragging = null; }
      if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    }
  }

  // ── Drag dọc cho parent groups ───────────────────────────
  function _attachVerticalDragParent(sidebar, options) {
    var dragging    = null;
    var placeholder = null;

    sidebar.addEventListener('dragstart', function (e) {
      var grp = e.target.closest('.ui-nested-tabs__sidebar-parent');
      if (!grp || grp.parentElement !== sidebar) return;
      dragging = grp;
      dragging.classList.add('ui-nested-dragging');
      e.dataTransfer.effectAllowed = 'move';
      placeholder = document.createElement('div');
      placeholder.className = 'ui-nested-drop-placeholder--v';
      placeholder.style.margin = '2px 0';
      e.stopPropagation();
    });

    sidebar.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      var target = e.target.closest('.ui-nested-tabs__sidebar-parent');
      if (!target || target === dragging || target.parentElement !== sidebar) return;
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      var rect   = target.getBoundingClientRect();
      var isUpper = (e.clientY - rect.top) < rect.height / 2;
      if (isUpper) sidebar.insertBefore(placeholder, target);
      else { var nx = target.nextSibling; if (nx) sidebar.insertBefore(placeholder, nx); else sidebar.appendChild(placeholder); }
    });

    sidebar.addEventListener('dragleave', function (e) {
      if (!sidebar.contains(e.relatedTarget) && placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    });

    sidebar.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dragging || !placeholder || !placeholder.parentNode) return;
      sidebar.insertBefore(dragging, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      if (typeof options.onReorder === 'function') {
        var ids = Array.from(sidebar.querySelectorAll(':scope > .ui-nested-tabs__sidebar-parent > .ui-nested-tab-parent-btn--v')).map(function (b) {
          return b.dataset.parentId || b.dataset.nodeId;
        });
        options.onReorder('parent', ids, null);
      }
      _vpCleanup();
    });

    sidebar.addEventListener('dragend', function(e) { e.stopPropagation(); _vpCleanup(); });

    function _vpCleanup() {
      if (dragging) { dragging.classList.remove('ui-nested-dragging'); dragging = null; }
      if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  EXPORTS
  // ════════════════════════════════════════════════════════════
  return {
    create:       create,
    createFromDB: createFromDB
  };

})();


/* --- TotalBar.js --- */
/**
 * Total Bar Component
 * Thanh tổng cộng ở cuối bảng / trang (Ví dụ: Tổng chi phí, Tổng doanh thu)
 */
var UITotalBar = (function () {

  /**
   * Sinh thanh TotalBar
   * @param {Object} config - { label, valueStr, className }
   */
  function create(config) {
    var bar = document.createElement('div');
    bar.className = 'total-bar ' + (config.className || '');
    
    var label = document.createElement('div');
    label.className = 'total-bar-label';
    label.innerText = config.label || 'Tổng cộng';

    var val = document.createElement('div');
    val.className = 'total-bar-value';
    val.innerText = config.valueStr || '0';

    bar.appendChild(label);
    bar.appendChild(val);

    return bar;
  }

  return {
    create: create
  };
})();


/* --- Badge.js --- */
/**
 * Badge Component
 * Sinh ra các nhãn trạng thái (Ví dụ: Đã Thanh Toán, Còn trống, Hủy)
 */
var UIBadge = (function () {

  /**
   * Sinh Badge
   * @param {string} text - Nội dung hiển thị
   * @param {string} type - success | danger | warning | primary
   */
  function create(text, type) {
    var badge = document.createElement('span');
    badge.className = 'status-badge ' + (type || 'primary');
    badge.innerText = text;
    return badge;
  }

  /**
   * Sinh HTML chuỗi cho Badge
   */
  function createHTML(text, type, extraStyle) {
    var styleAttr = extraStyle ? ` style="${extraStyle}"` : '';
    return `<span class="status-badge ${type || 'primary'}"${styleAttr}>${text}</span>`;
  }

  return {
    create: create,
    createHTML: createHTML
  };
})();


/* --- Chart.js --- */
/**
 * Chart.js Wrapper Component 
 * Cần nạp Chart.js CDN trong index.html
 */
var UIChart = (function () {

  /**
   * Sinh một khối thẻ chứa Chart
   * @param {Object} config - { title, type, data, options }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';

    if (config.title) {
      var header = document.createElement('div');
      header.className = 'chart-header';
      header.innerHTML = '<div class="chart-title">' + config.title + '</div>';
      wrapper.appendChild(header);
    }

    var chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    var canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    wrapper.appendChild(chartContainer);

    // Kích hoạt chart mượt sau khi insert vào DOM
    setTimeout(function() {
      if (typeof Chart !== 'undefined') {
        new Chart(canvas, {
          type: config.type || 'bar',
          data: config.data || {},
          options: Object.assign({
            responsive: true,
            maintainAspectRatio: false
          }, config.options || {})
        });
      }
    }, 100);

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- Stepper.js --- */
/**
 * Stepper Component
 * Sinh thanh điều hướng tiến trình nhiều bước (VD: Step 1 -> Step 2 -> Step 3)
 */
var UIStepper = (function () {

  /**
   * Tạo Thanh Trình Tự
   * @param {Array} steps - [{ label: 'Chọn Sảnh' }, { label: 'Chọn Món' }]
   * @param {number} currentStepIndex - Bắt đầu từ 0
   */
  function create(steps, currentStepIndex) {
    currentStepIndex = currentStepIndex || 0;
    
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-stepper';

    steps.forEach(function(step, index) {
      var stepDiv = document.createElement('div');
      stepDiv.className = 'ui-step';
      
      if (index < currentStepIndex) {
        stepDiv.classList.add('completed');
      } else if (index === currentStepIndex) {
        stepDiv.classList.add('active');
      }

      var circle = document.createElement('div');
      circle.className = 'ui-step-circle';
      if (index < currentStepIndex) {
        circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">check</span>';
      } else {
        circle.innerText = (index + 1);
      }

      var label = document.createElement('div');
      label.className = 'ui-step-label';
      label.innerText = step.label;

      stepDiv.appendChild(circle);
      stepDiv.appendChild(label);
      wrapper.appendChild(stepDiv);
    });

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- Timeline.js --- */
/**
 * Timeline Component
 * Sinh ra Danh sách Lịch sử thao tác (VD: Cọc lần 1 -> Đổi cọc -> Cọc lần 2 -> Ký Hợp Đồng)
 */
var UITimeline = (function () {

  /**
   * Tạo Timeline
   * @param {Array} events - [{ title, time, desc, type: 'success'|'primary'|'' }]
   */
  function create(events) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-timeline';

    events.forEach(function(ev) {
      var item = document.createElement('div');
      item.className = 'timeline-item ' + (ev.type || '');

      var marker = document.createElement('div');
      marker.className = 'timeline-marker';

      var content = document.createElement('div');
      content.className = 'timeline-content';

      var title = document.createElement('div');
      title.className = 'timeline-title';
      title.innerText = ev.title;

      var time = document.createElement('div');
      time.className = 'timeline-time';
      time.innerText = ev.time || '';

      content.appendChild(title);
      content.appendChild(time);

      if (ev.desc) {
        var desc = document.createElement('div');
        desc.className = 'timeline-desc';
        desc.innerText = ev.desc;
        content.appendChild(desc);
      }

      item.appendChild(marker);
      item.appendChild(content);
      wrapper.appendChild(item);
    });

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- EmptyState.js --- */
/**
 * EmptyState Component
 * Trạng thái trống (VD: Chưa có khách hàng, chưa có hợp đồng)
 */
var UIEmptyState = (function () {

  /**
   * Tạo màn hình rỗng
   * @param {Object} config - { icon, title, desc, action (DOM Node) }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-empty-state';

    var iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined ui-empty-icon';
    iconSpan.innerText = config.icon || 'inbox';
    wrapper.appendChild(iconSpan);

    var titleDiv = document.createElement('div');
    titleDiv.className = 'ui-empty-title';
    titleDiv.innerText = config.title || 'Không có dữ liệu';
    wrapper.appendChild(titleDiv);

    if (config.desc) {
      var descDiv = document.createElement('div');
      descDiv.className = 'ui-empty-desc';
      descDiv.innerText = config.desc;
      wrapper.appendChild(descDiv);
    }

    if (config.action instanceof Node) {
      wrapper.appendChild(config.action);
    }

    return wrapper;
  }

  /**
   * Sinh chuỗi HTML trạng thái trống (Dùng cho innerHTML)
   * @param {Object} config - { icon, title, desc, actionHtml }
   */
  function createHTML(config) {
    var icon = config.icon || 'inbox';
    var title = config.title || 'Không có dữ liệu';
    var descHtml = config.desc ? `<div class="ui-empty-desc">${config.desc}</div>` : '';
    var actionHtml = config.actionHtml ? config.actionHtml : '';

    return `
      <div class="ui-empty-state">
        <span class="material-symbols-outlined ui-empty-icon">${icon}</span>
        <div class="ui-empty-title">${title}</div>
        ${descHtml}
        ${actionHtml}
      </div>
    `;
  }

  /**
   * Sinh chuỗi HTML trạng thái trống cho Table Row
   * @param {Object} config - { colspan, text, actionHtml }
   */
  function createTableRowHTML(config) {
    var colspan = config.colspan || 1;
    var text = config.text || 'Chưa có dữ liệu';
    var actionHtml = config.actionHtml ? ` <span class="ms-1">${config.actionHtml}</span>` : '';

    return `
      <tr>
        <td colspan="${colspan}" class="text-center py-4 text-muted">
          ${text}${actionHtml}
        </td>
      </tr>
    `;
  }

  return {
    create: create,
    createHTML: createHTML,
    createTableRowHTML: createTableRowHTML
  };
})();


/* --- FileUpload.js --- */
/**
 * File Upload Component
 * Cung cấp vùng Drag & Drop để upload Ảnh Món Ăn, Logo...
 */
var UIFileUpload = (function () {

  /**
   * Sinh vùng Dropzone
   * @param {Object} config - { id, text, hint, accept, onChange }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-file-upload';

    var input = document.createElement('input');
    input.type = 'file';
    if (config.id) input.id = config.id;
    if (config.accept) input.accept = config.accept;

    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined ui-upload-icon';
    icon.innerText = 'cloud_upload';

    var text = document.createElement('div');
    text.className = 'ui-upload-text';
    text.innerText = config.text || 'Kéo thả file hoặc Click để tải lên';

    var hint = document.createElement('div');
    hint.className = 'ui-upload-hint';
    hint.innerText = config.hint || 'Hỗ trợ: JPG, PNG... Tối đa 5MB';

    wrapper.appendChild(input);
    wrapper.appendChild(icon);
    wrapper.appendChild(text);
    wrapper.appendChild(hint);

    // Xử lý sự kiện Drag & Drop css ảo diệu
    wrapper.addEventListener('dragover', function(e) {
      wrapper.classList.add('dragover');
    });

    wrapper.addEventListener('dragleave', function(e) {
      wrapper.classList.remove('dragover');
    });

    wrapper.addEventListener('drop', function(e) {
      wrapper.classList.remove('dragover');
    });

    if (typeof config.onChange === 'function') {
      input.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
          config.onChange(e.target.files[0]);
        }
      });
    }

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- ContextMenu.js --- */
/**
 * Context Menu Component
 * Bắt sự kiện Click Chuột Phải -> Hiện Menu thả xuống tùy chỉnh (Ví dụ: Tick/Bỏ Tick dòng, Đổi trạng thái)
 */
var UIContextMenu = (function () {
  
  var currentMenu = null;
  var activeTrigger = null;

  /**
   * Khởi tạo Menu 
   * @param {Event} e - Sự kiện chuột phải (Dùng để lấy toạ độ X, Y)
   * @param {Array} items - [{ label, icon, onClick }, '|' ]
   */
  function show(e, items) {
    var trigger = e ? (e.currentTarget || e.target) : null;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Toggle: Nếu bấm lại chính nút đang mở menu -> chỉ cần đóng menu
    if (currentMenu && activeTrigger && trigger && (activeTrigger === trigger || activeTrigger.contains(trigger))) {
      hide();
      return;
    }

    hide();
    activeTrigger = trigger;

    var menu = document.createElement('div');
    menu.className = 'ui-context-menu';
    
    // Đặt visibility hidden và vị trí 0 để đo kích thước chuẩn, tránh bị trình duyệt ép nhỏ khi đặt ở sát mép phải
    menu.style.visibility = 'hidden';
    menu.style.top = '0px';
    menu.style.left = '0px';

    items.forEach(function(item) {
      if (item === '|') {
        var div = document.createElement('div');
        div.className = 'context-menu-divider';
        menu.appendChild(div);
      } else {
        var btn = document.createElement('div');
        btn.className = 'context-menu-item';
        
        var iconHtml = item.icon ? '<span class="material-symbols-outlined">' + item.icon + '</span>' : '';
        btn.innerHTML = iconHtml + '<span style="white-space: nowrap;">' + item.label + '</span>';
        
        btn.onclick = function() {
          hide();
          if (typeof item.onClick === 'function') item.onClick();
        };

        menu.appendChild(btn);
      }
    });

    document.body.appendChild(menu);
    currentMenu = menu;

    // Tính toán và điều chỉnh vị trí để không bị khuất màn hình (Edge detection)
    requestAnimationFrame(function() {
      var rect = menu.getBoundingClientRect();
      var left, top;

      var isMobile = window.innerWidth <= 768;

      // Nếu là click chuột phải (contextmenu) trên Desktop, luôn mở tại vị trí chuột
      // Trên Mobile hoặc khi click nút, mở dưới nút/phần tử để không bị ngón tay che khuất
      if (e && e.type === 'contextmenu' && !isMobile) {
        left = e.pageX;
        top = e.pageY;
      } else if (activeTrigger) {
        var triggerRect = activeTrigger.getBoundingClientRect();
        top = triggerRect.bottom + window.scrollY + 8; // Cách nút 8px
        left = triggerRect.right + window.scrollX - rect.width; // Căn phải với nút
      } else if (e) {
        // Fallback: Mở theo vị trí con trỏ chuột
        left = e.pageX;
        top = e.pageY + 12;
      } else {
        left = 10;
        top = 10;
      }

      // Tràn lề phải (dùng viewport-relative để check)
      var viewLeft = left - window.scrollX;
      if (viewLeft < 10) {
        left = window.scrollX + 10;
      } else if (viewLeft + rect.width > window.innerWidth) {
        left = window.scrollX + window.innerWidth - rect.width - 10;
      }

      // Tràn lề dưới (trừ khi trang rất dài, thì tính theo scroll)
      if (top - window.scrollY + rect.height > window.innerHeight) {
        if (e && e.type === 'contextmenu') {
           top = e.pageY - rect.height; // Lật lên trên con trỏ chuột
        } else if (activeTrigger) {
           var triggerRect = activeTrigger.getBoundingClientRect();
           top = triggerRect.top + window.scrollY - rect.height - 8; // Lật lên trên nút
        } else if (e) {
           top = e.pageY - rect.height - 8; // Lật lên trên con trỏ chuột
        }
      }

      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.visibility = 'visible';
    });

    // Nghe sự kiện click và pointerdown ngoài -> Đóng menu
    document.addEventListener('click', hideOnOutsideClick);
    document.addEventListener('pointerdown', hideOnOutsideClick);
  }

  function hide() {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
      activeTrigger = null;
    }
  }

  function hideOnOutsideClick(e) {
    if (currentMenu && !currentMenu.contains(e.target)) {
      hide();
      document.removeEventListener('click', hideOnOutsideClick);
      document.removeEventListener('pointerdown', hideOnOutsideClick);
    }
  }

  return {
    show: show,
    hide: hide
  };
})();


/* --- Accordion.js --- */
/**
 * Accordion Component (Mở rộng / Thu gọn)
 * Áp dụng cho các Form quá dài cần gom nhóm lại
 */
var UIAccordion = (function () {

  /**
   * Tạo khối thu gọn Accordion
   * @param {Object} config - { title, content (Node/String), isOpen }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-accordion';
    if (config.isOpen) wrapper.classList.add('open');

    var header = document.createElement('div');
    header.className = 'ui-accordion-header';

    var titleSpan = document.createElement('span');
    titleSpan.innerText = config.title;

    var iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined ui-accordion-icon';
    iconSpan.innerText = 'keyboard_arrow_down';

    header.appendChild(titleSpan);
    header.appendChild(iconSpan);

    var body = document.createElement('div');
    body.className = 'ui-accordion-body';

    if (typeof config.content === 'string') {
      body.innerHTML = config.content;
    } else if (config.content instanceof Node) {
      body.appendChild(config.content);
    }

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    header.addEventListener('click', function() {
      wrapper.classList.toggle('open');
    });

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- TreeView.js --- */
/**
 * TreeView Component
 * Hiển thị dạng hình cây thư mục (Dùng cho Phân Quyền, Danh mục nhóm)
 */
var UITreeView = (function () {

  /**
   * Đệ quy build node
   */
  function buildNodes(nodes) {
    var ul = document.createElement('ul');

    nodes.forEach(function(node) {
      var li = document.createElement('li');
      
      var nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'ui-tree-node';

      var toggle = document.createElement('span');
      toggle.className = 'material-symbols-outlined ui-tree-toggle';
      if (node.children && node.children.length > 0) {
        toggle.innerText = 'chevron_right';
      } else {
        toggle.classList.add('empty');
      }

      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined ui-tree-icon';
      icon.innerText = node.icon || (node.children ? 'folder' : 'draft');

      var text = document.createElement('span');
      text.innerText = node.label;

      nodeWrapper.appendChild(toggle);
      nodeWrapper.appendChild(icon);
      nodeWrapper.appendChild(text);
      li.appendChild(nodeWrapper);

      if (node.children && node.children.length > 0) {
        var childUl = buildNodes(node.children);
        li.appendChild(childUl);

        // Click to toggle
        nodeWrapper.addEventListener('click', function() {
          childUl.classList.toggle('open');
          toggle.innerText = childUl.classList.contains('open') ? 'expand_more' : 'chevron_right';
          icon.innerText = childUl.classList.contains('open') ? 'folder_open' : 'folder';
        });
      }

      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Tạo Tree
   * @param {Array} data - Data dạng Node: [{ label, icon, children: [...] }]
   */
  function create(data) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-tree';
    
    var rootUl = buildNodes(data);
    rootUl.style.display = 'block'; // Root luôn mở
    rootUl.style.paddingLeft = '0'; // Xoá padding thừa của root
    wrapper.appendChild(rootUl);

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- Calendar.js --- */
/**
 * Calendar Component
 * Sinh Lịch Tiệc cơ bản bằng JS. Không dùng thư viện nặng.
 */
var UICalendar = (function () {

  /**
   * Khởi tạo Lịch
   * @param {Object} config - { year, month, events (danh sách chấm đỏ/xanh) }
   */
  function create(config) {
    config = config || {};
    var today = new Date();
    var currentYear = (config.year !== undefined && !isNaN(config.year)) ? Number(config.year) : today.getFullYear();
    var currentMonth = (config.month !== undefined && !isNaN(config.month)) ? Number(config.month) : today.getMonth();

    var wrapper = document.createElement('div');
    wrapper.className = 'ui-calendar-wrapper';

    function render(year, month) {
      wrapper.innerHTML = '';

      // Header
      var header = document.createElement('div');
      header.className = 'calendar-header';
      
      var titleContainer = document.createElement('div');
      titleContainer.className = 'calendar-month-picker';

      var titleText = document.createElement('span');
      titleText.innerText = 'Tháng ' + (month + 1) + ', ' + year;
      titleContainer.appendChild(titleText);

      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.innerText = 'expand_more';
      icon.style.fontSize = '24px';
      icon.style.color = 'var(--color-text-secondary)';
      titleContainer.appendChild(icon);

      titleContainer.onclick = function() {
        if (document.getElementById('custom-month-picker-overlay')) return;
        
        var overlay = document.createElement('div');
        overlay.id = 'custom-month-picker-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '9999';
        
        var dropdown = document.createElement('div');
        dropdown.className = 'calendar-dropdown-picker';
        var rect = titleContainer.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.onclick = function(ev) { ev.stopPropagation(); };
        
        var yearHeader = document.createElement('div');
        yearHeader.className = 'calendar-dropdown-header';
        
        var btnPrevYear = document.createElement('button');
        btnPrevYear.className = 'btn btn-outline d-flex align-items-center justify-content-center p-0 rounded-circle';
        btnPrevYear.style.width = '32px'; btnPrevYear.style.height = '32px';
        btnPrevYear.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span>';
        
        var yearLabel = document.createElement('div');
        yearLabel.className = 'calendar-dropdown-year-label';
        yearLabel.innerText = year;
        
        var btnNextYear = document.createElement('button');
        btnNextYear.className = 'btn btn-outline d-flex align-items-center justify-content-center p-0 rounded-circle';
        btnNextYear.style.width = '32px'; btnNextYear.style.height = '32px';
        btnNextYear.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>';
        
        var tempYear = year;
        
        btnPrevYear.onclick = function() { tempYear--; yearLabel.innerText = tempYear; loadSummaryAndRender(); };
        btnNextYear.onclick = function() { tempYear++; yearLabel.innerText = tempYear; loadSummaryAndRender(); };
        
        yearHeader.appendChild(btnPrevYear);
        yearHeader.appendChild(yearLabel);
        yearHeader.appendChild(btnNextYear);
        dropdown.appendChild(yearHeader);
        
        var monthsGrid = document.createElement('div');
        monthsGrid.className = 'calendar-dropdown-months-grid';
        
        function renderMonths() {
          monthsGrid.innerHTML = '';
          var monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
          var summary = (config.monthSummary && config.monthSummary[tempYear]) ? config.monthSummary[tempYear] : {};
          for (let m = 0; m < 12; m++) {
            var mBtn = document.createElement('button');
            mBtn.className = 'calendar-dropdown-month-btn' + (tempYear === year && m === month ? ' active' : '');
            mBtn.innerText = monthNames[m];
            if (summary[m] && summary[m] > 0) {
              mBtn.classList.add('has-events');
              var dot = document.createElement('span');
              dot.className = 'month-event-dot';
              mBtn.appendChild(dot);
            }
            mBtn.onclick = function() {
              document.body.removeChild(overlay);
              currentYear = tempYear;
              currentMonth = m;
              if (typeof config.onChangeMonth === 'function') config.onChangeMonth(currentYear, currentMonth);
              else render(currentYear, currentMonth);
            };
            monthsGrid.appendChild(mBtn);
          }
        }

        // Load summary for current tempYear when navigating years
        function loadSummaryAndRender() {
          if (config.monthSummary && !config.monthSummary[tempYear] && typeof config.onLoadYearSummary === 'function') {
            config.onLoadYearSummary(tempYear).then(function(s) {
              config.monthSummary[tempYear] = s;
              renderMonths();
            });
          } else {
            renderMonths();
          }
        }
        
        loadSummaryAndRender();
        dropdown.appendChild(monthsGrid);
        overlay.appendChild(dropdown);
        overlay.onclick = function() { document.body.removeChild(overlay); };
        document.body.appendChild(overlay);
      };

      header.appendChild(titleContainer);
      
      var controls = document.createElement('div');
      controls.className = 'd-flex align-items-center gap-2';
      
      var btnPrev = document.createElement('button');
      btnPrev.className = 'btn btn-outline d-flex align-items-center justify-content-center p-0 rounded-circle';
      btnPrev.style.width = '36px';
      btnPrev.style.height = '36px';
      btnPrev.title = 'Tháng trước';
      btnPrev.innerHTML = '<span class="material-symbols-outlined fs-5">chevron_left</span>';
      btnPrev.onclick = function() {
        var m = month - 1;
        var y = year;
        if (m < 0) { m = 11; y--; }
        currentYear = y; currentMonth = m;
        if (typeof config.onChangeMonth === 'function') config.onChangeMonth(y, m);
        else render(y, m);
      };

      var btnToday = document.createElement('button');
      btnToday.className = 'btn btn-outline px-3 py-1 fw-bold rounded-pill';
      btnToday.innerText = 'Hôm nay';
      btnToday.onclick = function() {
        var y = today.getFullYear();
        var m = today.getMonth();
        currentYear = y; currentMonth = m;
        if (typeof config.onChangeMonth === 'function') config.onChangeMonth(y, m);
        else render(y, m);
      };

      var btnNext = document.createElement('button');
      btnNext.className = 'btn btn-outline d-flex align-items-center justify-content-center p-0 rounded-circle';
      btnNext.style.width = '36px';
      btnNext.style.height = '36px';
      btnNext.title = 'Tháng sau';
      btnNext.innerHTML = '<span class="material-symbols-outlined fs-5">chevron_right</span>';
      btnNext.onclick = function() {
        var m = month + 1;
        var y = year;
        if (m > 11) { m = 0; y++; }
        currentYear = y; currentMonth = m;
        if (typeof config.onChangeMonth === 'function') config.onChangeMonth(y, m);
        else render(y, m);
      };

      controls.appendChild(btnPrev);
      controls.appendChild(btnToday);
      controls.appendChild(btnNext);

      header.appendChild(controls);
      wrapper.appendChild(header);

      var daysHeader = document.createElement('div');
      daysHeader.className = 'calendar-days-header';

      ['TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7', 'CN'].forEach(function(d) {
        var dDiv = document.createElement('div');
        dDiv.className = 'calendar-day-header';
        if (d === 'CN') dDiv.classList.add('sunday');
        dDiv.innerText = d;
        daysHeader.appendChild(dDiv);
      });
      wrapper.appendChild(daysHeader);

      // Days Header -> Days Grid
      var grid = document.createElement('div');
      grid.className = 'calendar-grid';

      // Date calculations
      var jsFirstDay = new Date(year, month, 1).getDay();
      var firstDay = jsFirstDay === 0 ? 6 : jsFirstDay - 1;
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var daysInPrevMonth = new Date(year, month, 0).getDate();
      
      var cellIndex = 0;

      // Helper function to generate Lunar date HTML using native Intl API
      function _getLunarDateHTML(y, m, d) {
        try {
          var formatter = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', { day: 'numeric', month: 'numeric' });
          var parts = formatter.formatToParts(new Date(y, m, d));
          var lDay = '', lMonth = '';
          parts.forEach(function(p) {
            if (p.type === 'day') lDay = p.value;
            if (p.type === 'month') lMonth = p.value;
          });
          var str = formatter.format(new Date(y, m, d));
          var isLeap = str.toLowerCase().indexOf('nhuận') !== -1 || str.toLowerCase().indexOf('bis') !== -1;
          var displayStr = lDay;
          if (lDay === '1' || d === 1) {
            displayStr = lDay + '/' + lMonth + (isLeap ? ' Nhuận' : '');
          }
          var isHighlight = (lDay === '1' || lDay === '15');
          var highlightClass = isHighlight ? ' highlight' : '';
          return '<span class="lunar-date' + highlightClass + '" title="Ngày âm lịch">' + displayStr + '</span>';
        } catch (e) {
          return '';
        }
      }

      // ô trước ngày 1 (ngày tháng trước)
      for (let i = 0; i < firstDay; i++) {
        var empty = document.createElement('div');
        empty.className = 'calendar-day empty-day animate-pop';
        empty.style.animationDelay = (cellIndex * 0.015) + 's';
        
        var dNum = document.createElement('div');
        dNum.className = 'calendar-day-number';
        var prevDateNum = daysInPrevMonth - firstDay + i + 1;
        var prevM = month - 1;
        var prevY = year;
        if (prevM < 0) { prevM = 11; prevY--; }
        dNum.innerHTML = '<span class="solar-date">' + prevDateNum + '</span>' + _getLunarDateHTML(prevY, prevM, prevDateNum);
        empty.appendChild(dNum);
        
        empty.onclick = (function(d, pY, pM) {
          return function() {
            if (typeof config.onSelect === 'function') {
              var dateStr = pY + '-' + (pM + 1).toString().padStart(2, '0') + '-' + d.toString().padStart(2, '0');
              config.onSelect(dateStr, null);
            }
          };
        })(prevDateNum, prevY, prevM);

        grid.appendChild(empty);
        cellIndex++;
      }

      // Các ngày trong tháng
      for (let i = 1; i <= daysInMonth; i++) {
        var dayCell = document.createElement('div');
        dayCell.className = 'calendar-day animate-pop';
        dayCell.style.animationDelay = (cellIndex * 0.015) + 's';
        
        if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === i) {
          dayCell.classList.add('today');
        }

        var dayNum = document.createElement('div');
        dayNum.className = 'calendar-day-number';
        dayNum.innerHTML = '<span class="solar-date">' + i + '</span>' + _getLunarDateHTML(year, month, i);
        dayCell.appendChild(dayNum);

        // Thêm events
        var evtDiv = document.createElement('div');
        evtDiv.className = 'calendar-events';
        
        var dayEvents = config.events ? config.events[i] : null;
        
        if (dayEvents && dayEvents.length > 0) {
           var cocCount = 0;
           var hdCount = 0;
           
           dayEvents.forEach(function(e) {
              if (e.rawData) {
                 var lp = e.rawData.LoaiPhieu !== undefined ? e.rawData.LoaiPhieu : e.rawData.loaiPhieu;
                 if (lp === 1) cocCount++;
                 else hdCount++;
              }
           });

           // Render Desktop Summary Labels với chấm tròn chỉ thị
           if (cocCount > 0) {
              var cocLabel = document.createElement('div');
              cocLabel.className = 'calendar-event-label success';
              cocLabel.title = 'Có ' + cocCount + ' Biên nhận cọc chỗ';
              cocLabel.innerHTML = '<span class="dot"></span><span>' + cocCount + ' Cọc Chỗ</span>';
              evtDiv.appendChild(cocLabel);
           }
           if (hdCount > 0) {
              var hdLabel = document.createElement('div');
              hdLabel.className = 'calendar-event-label primary';
              hdLabel.title = 'Có ' + hdCount + ' Hợp đồng';
              hdLabel.innerHTML = '<span class="dot"></span><span>' + hdCount + ' Hợp Đồng</span>';
              evtDiv.appendChild(hdLabel);
           }

           // Render Mobile Dots
           if (cocCount > 0) {
              var dotCoc = document.createElement('div');
              dotCoc.className = 'calendar-event-dot success';
              dayCell.appendChild(dotCoc);
           }
           if (hdCount > 0) {
              var dotHd = document.createElement('div');
              dotHd.className = 'calendar-event-dot primary';
              dayCell.appendChild(dotHd);
           }
        }
        dayCell.appendChild(evtDiv);

        dayCell.onclick = (function(d, evts) {
          return function() {
            if (typeof config.onSelect === 'function') {
              var dateStr = year + '-' + (month + 1).toString().padStart(2, '0') + '-' + d.toString().padStart(2, '0');
              config.onSelect(dateStr, evts);
            }
          };
        })(i, dayEvents);

        grid.appendChild(dayCell);
        cellIndex++;
      }

      // ô sau ngày cuối cùng (ngày tháng sau)
      var totalCells = firstDay + daysInMonth;
      var remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let i = 0; i < remainingCells; i++) {
        var emptyEnd = document.createElement('div');
        emptyEnd.className = 'calendar-day empty-day animate-pop';
        emptyEnd.style.animationDelay = (cellIndex * 0.015) + 's';
        
        var dNumEnd = document.createElement('div');
        dNumEnd.className = 'calendar-day-number';
        var nextDateNum = i + 1;
        var nextM = month + 1;
        var nextY = year;
        if (nextM > 11) { nextM = 0; nextY++; }
        dNumEnd.innerHTML = '<span class="solar-date">' + nextDateNum + '</span>' + _getLunarDateHTML(nextY, nextM, nextDateNum);
        emptyEnd.appendChild(dNumEnd);
        
        emptyEnd.onclick = (function(d, nY, nM) {
          return function() {
            if (typeof config.onSelect === 'function') {
              var dateStr = nY + '-' + (nM + 1).toString().padStart(2, '0') + '-' + d.toString().padStart(2, '0');
              config.onSelect(dateStr, null);
            }
          };
        })(nextDateNum, nextY, nextM);

        grid.appendChild(emptyEnd);
        cellIndex++;
      }

      wrapper.appendChild(grid);
    }

    render(currentYear, currentMonth);
    
    wrapper.updateEvents = function(newEvents) {
      config.events = newEvents;
      render(currentYear, currentMonth);
    };
    
    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- Slider.js --- */
/**
 * Slider Component
 * Thanh kéo trượt chọn giá trị (Ví dụ: Khoảng giá, Phần trăm giảm giá)
 */
var UISlider = (function () {

  /**
   * Sinh thanh Slider
   * @param {Object} config - { min, max, value, step, onChange, formatValue }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-slider-container';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'ui-slider';
    slider.min = config.min || 0;
    slider.max = config.max || 100;
    slider.step = config.step || 1;
    slider.value = config.value || 0;

    var valDisplay = document.createElement('div');
    valDisplay.className = 'ui-slider-value';
    
    function updateDisplay(val) {
      if (typeof config.formatValue === 'function') {
        valDisplay.innerText = config.formatValue(val);
      } else {
        valDisplay.innerText = val;
      }
    }
    updateDisplay(slider.value);

    wrapper.appendChild(slider);
    wrapper.appendChild(valDisplay);

    slider.addEventListener('input', function(e) {
      updateDisplay(e.target.value);
    });

    if (typeof config.onChange === 'function') {
      slider.addEventListener('change', function(e) {
        config.onChange(e.target.value);
      });
    }

    return wrapper;
  }

  return {
    create: create
  };
})();


/* --- Toast.js --- */
/**
 * Toast Component
 * Khác với Alert (Gây gián đoạn), Toast hiện lên lặng lẽ ở góc và tự biến mất sau 3s
 */
var UIToast = (function () {

  // Auto-init container
  var container = null;
  document.addEventListener('DOMContentLoaded', function() {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  });

  /**
   * Gọi thông báo
   * @param {string} msg - Nội dung thông báo
   * @param {string} type - 'success', 'error', 'warning', 'info'
   */
  function show(msg, type) {
    if (!container) return; // Fallback

    var toast = document.createElement('div');
    toast.className = 'ui-toast ' + (type || 'success');

    var iconMap = {
      'success': 'check_circle',
      'error': 'error',
      'warning': 'warning',
      'info': 'info'
    };

    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined ui-toast-icon';
    icon.innerText = iconMap[type || 'success'] || 'info';

    var txt = document.createElement('div');
    txt.className = 'ui-toast-content';
    txt.innerText = msg;

    toast.appendChild(icon);
    toast.appendChild(txt);
    container.appendChild(toast);

    // Trigger animate in
    requestAnimationFrame(function() {
      toast.classList.add('show');
    });

    // Tự động tắt sau 3 giây
    setTimeout(function() {
      toast.classList.remove('show');
      // Đợi animation chạy xong rồi xóa node
      setTimeout(function() {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, 3000);
  }

  return {
    show: show
  };
})();


/* --- Popover.js --- */
/**
 * Popover Component
 * Một khung form nổi lên nhỏ gọn nằm cạnh Nút được bấm (Ví dụ: Form nhập nhanh số lượng)
 */
var UIPopover = (function () {
  
  var currentPopover = null;

  /**
   * Mở popover ngay dưới 1 trigger element
   * @param {Node} triggerNode - DOM Node vừa được click (hoặc hover)
   * @param {Object} config - { title, content (Node) }
   */
  function show(triggerNode, config) {
    hide(); // Đóng popover cũ nếu có

    var popover = document.createElement('div');
    popover.className = 'ui-popover';

    if (config.title) {
      var header = document.createElement('div');
      header.className = 'ui-popover-header';
      header.innerText = config.title;
      popover.appendChild(header);
    }

    var body = document.createElement('div');
    body.className = 'ui-popover-body';
    if (config.content instanceof Node) {
      body.appendChild(config.content);
    } else if (typeof config.content === 'string') {
      body.innerHTML = config.content;
    }
    popover.appendChild(body);

    document.body.appendChild(popover);

    // Tính toán position
    var rect = triggerNode.getBoundingClientRect();
    popover.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    // Căn giữa theo trigger
    var pWidth = popover.offsetWidth || 250;
    var left = rect.left + window.scrollX + (rect.width / 2) - (pWidth / 2);
    // Tránh tràn viền
    if (left < 10) left = 10;
    if (left + pWidth > window.innerWidth - 10) left = window.innerWidth - pWidth - 10;
    
    popover.style.left = left + 'px';

    // Show animation
    requestAnimationFrame(function() {
      popover.classList.add('show');
    });

    currentPopover = popover;

    // Click outside to hide
    setTimeout(function() { // Delay xíu để không bắt nhầm sự kiện click hiện tại
      document.addEventListener('click', hideOnOutsideClick);
    }, 10);
  }

  function hide() {
    if (currentPopover) {
      currentPopover.remove();
      currentPopover = null;
    }
  }

  function hideOnOutsideClick(e) {
    if (currentPopover && !currentPopover.contains(e.target)) {
      hide();
      document.removeEventListener('click', hideOnOutsideClick);
    }
  }

  return {
    show: show,
    hide: hide
  };
})();


/* --- Header.js --- */
/**
 * Header Component
 * Cấu trúc thanh Header trên cùng
 */
var Header = (function () {
  
  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = `
      <header class="app-header">
        <div class="header-left">
          <!-- Nút Hamburger Mở Sidebar (Chỉ hiện trên Mobile) -->
          <button class="btn-hamburger" id="btn-hamburger">
            <span class="material-symbols-outlined">menu</span>
          </button>

          <!-- Thanh tìm kiếm kiểu Tailadmin -->
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" placeholder="Type to search...">
          </div>
        </div>

        <div class="header-right">
          <!-- Các nút Notification / Chat -->
          <div class="icon-btn" onclick="Alert.info('Thông báo', 'Bạn không có thông báo mới')">
            <span class="material-symbols-outlined" style="font-size:20px;">notifications</span>
            <span class="badge"></span>
          </div>


          <!-- Thông tin User -->
          <div class="user-profile">
            <div class="user-text">
              <div class="user-name">Admin</div>
              <div class="user-role">Quản trị hệ thống</div>
            </div>
            <div class="user-avatar">
              <img src="https://ui-avatars.com/api/?name=Admin&background=3C50E0&color=fff" alt="User">
            </div>
            <span class="material-symbols-outlined" style="color:var(--color-text-secondary)">expand_more</span>
          </div>
        </div>
      </header>
    `;

    container.innerHTML = html;

    _attachEvents();
  }

  function _attachEvents() {
    var $btnHamburger = document.getElementById('btn-hamburger');
    var $sidebar = document.getElementById('app-sidebar');
    var $sidebarOverlay = document.getElementById('sidebar-overlay');

    if ($btnHamburger) {
      $btnHamburger.addEventListener('click', function() {
        if ($sidebar) $sidebar.classList.add('open');
        if ($sidebarOverlay) $sidebarOverlay.classList.add('active');
      });
    }
  }

  return {
    render: render
  };
})();


/* --- Sidebar.js --- */
/**
 * Sidebar Component
 * Cấu trúc thanh điều hướng bên trái
 * Đã được nâng cấp để lấy Menu động từ Database giống Navbar
 */
var Sidebar = (function () {

  var CACHE_KEY = 'pmql_nav_cache';
  var NAV_CONFIG = [];

  function _buildConfigFromDB(dbMenus) {
    var config = [];
    var parents = dbMenus.filter(function (m) { return !m.parent || String(m.parent).trim() === ''; });
    parents.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });

    parents.forEach(function (p) {
      var children = dbMenus.filter(function (m) { return m.parent === p.id; });
      if (children.length > 0) {
        children.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
        var items = children.map(function (c) {
          return {
            href: c.URLPara || c.urlPara || c.FormKey || '',
            icon: c.icon || c.IconClass || 'circle',
            label: c.label || c.TenMenu || c.VN || ''
          };
        });
        config.push({
          type: 'group',
          icon: p.icon || p.IconClass || 'folder',
          label: p.label || p.TenMenu || p.VN || '',
          items: items
        });
      } else {
        config.push({
          type: 'link',
          href: p.URLPara || p.urlPara || p.FormKey || '',
          icon: p.icon || p.IconClass || 'link',
          label: p.label || p.TenMenu || p.VN || ''
        });
      }
    });
    return config;
  }

  function _buildSidebarNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="nav-item">
            <span class="material-symbols-outlined icon">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="nav-group-title">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="nav-item">
            <span class="material-symbols-outlined icon">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    var groupId = u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';

    // Thử load từ cache giống Navbar
    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
        NAV_CONFIG = cached.config;
        _doRender(container);
        return;
      }
    } catch (e) {}

    // Nếu không có cache, gọi API fetch
    _fetchAndRender(container, groupId);
  }

  function _fetchAndRender(container, groupId) {
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MENU_BY_GROUP : null;

    if (endpoint && window.ApiClient) {
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: groupId,
        UserGroupID: groupId
      }).then(function (res) {
        var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
        if (records && records.length > 0) {
          NAV_CONFIG = _buildConfigFromDB(records);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records
            }));
          } catch (e) { }
        }
        _doRender(container);
      }).catch(function (err) {
        console.error('[Sidebar] Lỗi tải menu từ DB:', err);
        _doRender(container); // Fallback render empty
      });
    } else {
      _doRender(container);
    }
  }

  function _doRender(container) {
    var navHtml = _buildSidebarNavHTML();

    // Fallback HTML nếu DB rỗng
    if (!navHtml) {
      navHtml = `
        <div class="nav-group-title">Hệ Thống</div>
        <a href="#/dashboard" class="nav-item active">
          <span class="material-symbols-outlined icon">dashboard</span>
          Tổng quan
        </a>
      `;
    }

    var html = `
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div style="display:flex; align-items:center; justify-content:flex-start; width:100%; margin: 16px 0; padding-left: 16px;">
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Tiệc Cưới Logo" style="width: 150px; height: auto;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Tiệc Cưới Logo" style="width: 150px; height: auto;">
          </div>
          <!-- Nút đóng Sidebar trên Mobile -->
          <button class="btn-close-sidebar" id="btn-close-sidebar">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav">
          ${navHtml}
        </nav>
      </aside>

      <!-- Overlay mờ khi mở Sidebar trên Mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    container.innerHTML = html;
    _attachEvents();
  }

  function _attachEvents() {
    var $sidebar = document.getElementById('app-sidebar');
    var $btnCloseSidebar = document.getElementById('btn-close-sidebar');
    var $sidebarOverlay = document.getElementById('sidebar-overlay');

    function closeSidebar() {
      if ($sidebar) $sidebar.classList.remove('open');
      if ($sidebarOverlay) $sidebarOverlay.classList.remove('active');
    }

    if ($btnCloseSidebar) {
      $btnCloseSidebar.addEventListener('click', closeSidebar);
    }

    if ($sidebarOverlay) {
      $sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Auto highlight active nav item based on hash
    _highlightActiveNav();
    window.addEventListener('hashchange', _highlightActiveNav);
  }

  function _highlightActiveNav() {
    var currentHash = window.location.hash || '#/dashboard';
    var navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('href') === currentHash) {
        item.classList.add('active');
      }
    });
  }

  return {
    render: render
  };
})();


/* --- SearchDropdown.js --- */
/**
 * Search Dropdown Component
 * Autocomplete / Custom search results list with input and search button
 */
var UIControls = window.UIControls || {};

UIControls.createSearchDropdown = function (options) {
  var wrapper = document.createElement('div');
  wrapper.className = 'ui-search-dropdown-wrapper d-flex gap-2 align-items-center';
  wrapper.style.position = 'relative';
  wrapper.style.zIndex = '100'; // To avoid overlap issues in cards
  if (options.width) wrapper.style.width = options.width;

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'ui-input flex-grow-1';
  input.placeholder = options.placeholder || 'Tìm kiếm...';
  input.style.height = '32px';
  input.style.fontSize = '13px';

  var btn = document.createElement('button');
  btn.className = 'btn btn-outline-primary d-flex align-items-center gap-1';
  btn.style.height = '32px';
  btn.style.padding = '0 12px';
  btn.style.fontSize = '13px';
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">search</span>' + (options.btnText || 'Tìm');

  var dropdown = document.createElement('div');
  dropdown.className = 'ui-search-dropdown-menu';
  
  wrapper.appendChild(input);
  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);

  function showDropdown() {
    dropdown.classList.add('show');
  }

  function hideDropdown() {
    dropdown.classList.remove('show');
  }

  function renderResults(results) {
    dropdown.innerHTML = '';
    if (!results || results.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-center text-secondary">Không tìm thấy kết quả!</div>';
    } else {
      results.forEach(function (item) {
        var div = document.createElement('a');
        div.className = 'ui-search-dropdown-item border-bottom';
        div.style.cursor = 'pointer';
        div.innerHTML = options.renderItem ? options.renderItem(item) : item.toString();
        div.addEventListener('click', function () {
          hideDropdown();
          if (typeof options.onSelect === 'function') {
            options.onSelect(item);
          }
        });
        dropdown.appendChild(div);
      });
    }
    showDropdown();
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var keyword = input.value.trim();
    if (!keyword && options.requireKeyword) {
      if (window.UIToast) UIToast.show('Vui lòng nhập từ khóa', 'warning');
      return;
    }
    dropdown.innerHTML = '<div class="p-3 text-center text-secondary">Đang tìm kiếm...</div>';
    showDropdown();
    
    if (typeof options.onSearch === 'function') {
      options.onSearch(keyword, renderResults, hideDropdown);
    }
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      btn.click();
    }
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) hideDropdown();
  });

  return wrapper;
};


/* --- SidePanel.js --- */
/**
 * SidePanel Component (Right Drawer)
 * Automatically handles overlays, sliding animations, and shadow-safe hiding.
 */
var UISidePanel = (function () {
  function SidePanel(selectorOrElement) {
    this.panel = typeof selectorOrElement === 'string' 
      ? document.querySelector(selectorOrElement) 
      : selectorOrElement;
      
    if (!this.panel) return;

    this.panel.classList.add('ui-side-panel');
    
    // Ensure initial state is off-screen and display:none
    this.panel.style.display = 'none';
    this.panel.style.right = '-1000px';

    // Automatically find or create an overlay
    this.overlay = document.querySelector('.ui-side-panel-overlay');
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ui-side-panel-overlay';
      document.body.appendChild(this.overlay);
    }

    var self = this;
    
    // Bind close buttons
    var closeBtns = this.panel.querySelectorAll('[data-dismiss="side-panel"]');
    closeBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        self.hide();
      });
    });

    this.overlay.addEventListener('click', function() {
      self.hide();
    });
  }

  SidePanel.prototype.show = function() {
    var self = this;
    this.panel.style.display = 'flex';
    this.overlay.classList.add('show');
    // Tiny delay to allow display:flex to register before animation
    setTimeout(function() {
      self.panel.classList.add('show');
    }, 10);
  };

  SidePanel.prototype.hide = function() {
    var self = this;
    this.overlay.classList.remove('show');
    this.panel.classList.remove('show');
    // Wait for transition to finish before display:none
    setTimeout(function() {
      if (!self.panel.classList.contains('show')) {
        self.panel.style.display = 'none';
        self.panel.style.right = '-1000px';
      }
    }, 300);
  };

  return SidePanel;
})();


/* --- ScreenCapture.js --- */
/* ═══════════════════════════════════════════
   SCREEN CAPTURE COMPONENT (Canvas-based)
   ═══════════════════════════════════════════ */
var ScreenCapture = (function () {

  var overlayCanvas = null;
  var ctx = null;
  var startX = 0, startY = 0;
  var isDrawing = false;
  var currentRect = null;
  var currentCallback = null;
  var ww = 0, wh = 0;
  
  var mode = 'select'; // 'select' | 'draw'
  var shapes = []; // {left, top, width, height}
  var shapeStartX = 0, shapeStartY = 0;
  var currentShape = null;

  var toolbar = null;
  var isShapeModeActive = false; // Bắt buộc click nút mới được vẽ

  function initOverlay() {
    if (overlayCanvas) return;
    
    ww = window.innerWidth;
    wh = window.innerHeight;
    
    mode = 'select';
    shapes = [];
    currentRect = null;
    currentShape = null;
    isDrawing = false;
    isShapeModeActive = false;

    overlayCanvas = document.createElement('canvas');
    overlayCanvas.className = 'screen-capture-canvas';
    overlayCanvas.width = ww;
    overlayCanvas.height = wh;
    
    overlayCanvas.style.position = 'fixed';
    overlayCanvas.style.top = '0';
    overlayCanvas.style.left = '0';
    overlayCanvas.style.zIndex = '999990';
    overlayCanvas.style.cursor = 'crosshair';
    
    ctx = overlayCanvas.getContext('2d');
    
    document.body.appendChild(overlayCanvas);
    
    drawMask(0, 0, 0, 0); 
    
    overlayCanvas.addEventListener('mousedown', onMouseDown);
    overlayCanvas.addEventListener('mousemove', onMouseMove);
    overlayCanvas.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
  }

  function destroyOverlay() {
    if (overlayCanvas) {
      overlayCanvas.removeEventListener('mousedown', onMouseDown);
      overlayCanvas.removeEventListener('mousemove', onMouseMove);
      overlayCanvas.removeEventListener('mouseup', onMouseUp);
      if (overlayCanvas.parentNode) {
        document.body.removeChild(overlayCanvas);
      }
      overlayCanvas = null;
      ctx = null;
    }
    if (toolbar) {
      if (toolbar.parentNode) document.body.removeChild(toolbar);
      toolbar = null;
    }
    document.removeEventListener('keydown', onKeyDown);
  }

  function createToolbarBtn(icon, title, onClick) {
    var btn = document.createElement('button');
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">' + icon + '</span>';
    btn.title = title;
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.padding = '6px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.color = '#374151';
    btn.style.borderRadius = '4px';
    btn.onmouseover = function() { if(!btn.classList.contains('active')) btn.style.background = '#F3F4F6'; };
    btn.onmouseout = function() { if(!btn.classList.contains('active')) btn.style.background = 'transparent'; };
    btn.onclick = onClick;
    return btn;
  }

  function showToolbar() {
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.style.position = 'fixed';
      toolbar.style.zIndex = '999995';
      toolbar.style.background = '#ffffff';
      toolbar.style.border = '1px solid #E5E7EB';
      toolbar.style.borderRadius = '6px';
      toolbar.style.padding = '4px';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '2px';
      toolbar.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
      
      var btnRect = createToolbarBtn('crop_square', 'Vẽ khung đỏ', function() {
        isShapeModeActive = true;
        btnRect.style.background = '#E0E7FF';
        btnRect.style.color = '#4F46E5';
        btnRect.classList.add('active');
        overlayCanvas.style.cursor = 'crosshair';
      });
      
      var btnCopy = createToolbarBtn('content_copy', 'Copy (Ctrl+C)', function() {
        captureAndAction();
      });
      btnCopy.style.color = '#10B981';

      var btnClose = createToolbarBtn('close', 'Hủy (ESC)', function() {
        destroyOverlay();
      });
      btnClose.style.color = '#F43F5E';
      
      toolbar.appendChild(btnRect);
      var divider = document.createElement('div');
      divider.style.width = '1px';
      divider.style.background = '#E5E7EB';
      divider.style.margin = '4px';
      toolbar.appendChild(divider);
      toolbar.appendChild(btnCopy);
      toolbar.appendChild(btnClose);
      
      document.body.appendChild(toolbar);
    }
    
    toolbar.style.display = 'flex';
    
    // Position toolbar at bottom right of the selection
    var tLeft = currentRect.left + currentRect.width - 120;
    var tTop = currentRect.top + currentRect.height + 10;
    if (tLeft < 10) tLeft = 10;
    if (tTop + 50 > wh) tTop = currentRect.top - 50;
    
    toolbar.style.left = tLeft + 'px';
    toolbar.style.top = tTop + 'px';
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      destroyOverlay();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      if (mode === 'draw' && currentRect) {
        e.preventDefault();
        captureAndAction();
      }
    }
  }

  function drawMask(x, y, w, h) {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, ww, wh); // Xóa sạch canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, ww, wh);

    if (mode === 'select') {
      if (w > 0 && h > 0) {
        ctx.clearRect(x, y, w, h);
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
      }
      
      if (!isDrawing && w === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(ww/2 - 150, 20, 300, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn và kéo chuột để chọn vùng', ww/2, 45);
      }
    } else if (mode === 'draw') {
      ctx.clearRect(currentRect.left, currentRect.top, currentRect.width, currentRect.height);
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(currentRect.left, currentRect.top, currentRect.width, currentRect.height);
      
      ctx.strokeStyle = '#EF4444'; // Red
      ctx.lineWidth = 3;
      
      shapes.forEach(function(s) {
        ctx.strokeRect(s.left, s.top, s.width, s.height);
      });
      
      if (isDrawing && currentShape && isShapeModeActive) {
        ctx.strokeRect(currentShape.left, currentShape.top, currentShape.width, currentShape.height);
      }
    }
  }

  function onMouseDown(e) {
    if (mode === 'select') {
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      drawMask(startX, startY, 0, 0);
    } else if (mode === 'draw') {
      if (!isShapeModeActive) return; // Không cho vẽ nếu chưa click nút hình
      
      var cx = e.clientX;
      var cy = e.clientY;
      
      // Chỉ cho phép vẽ bên trong vùng đã chọn
      if (cx >= currentRect.left && cx <= currentRect.left + currentRect.width &&
          cy >= currentRect.top && cy <= currentRect.top + currentRect.height) {
        isDrawing = true;
        shapeStartX = cx;
        shapeStartY = cy;
        currentShape = { left: shapeStartX, top: shapeStartY, width: 0, height: 0 };
        if (toolbar) toolbar.style.display = 'none'; // Ẩn toolbar khi đang vẽ cho đỡ vướng
      }
    }
  }

  var rafId = null;
  function onMouseMove(e) {
    if (!isDrawing) return;
    var currentX = e.clientX;
    var currentY = e.clientY;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function() {
      if (mode === 'select') {
        var left = Math.min(startX, currentX);
        var top = Math.min(startY, currentY);
        var width = Math.abs(currentX - startX);
        var height = Math.abs(currentY - startY);
        drawMask(left, top, width, height);
      } else if (mode === 'draw') {
        if (!isShapeModeActive) return;
        
        // Giới hạn trong currentRect
        var limitedX = Math.max(currentRect.left, Math.min(currentX, currentRect.left + currentRect.width));
        var limitedY = Math.max(currentRect.top, Math.min(currentY, currentRect.top + currentRect.height));
        
        var sLeft = Math.min(shapeStartX, limitedX);
        var sTop = Math.min(shapeStartY, limitedY);
        var sWidth = Math.abs(limitedX - shapeStartX);
        var sHeight = Math.abs(limitedY - shapeStartY);
        
        currentShape = { left: sLeft, top: sTop, width: sWidth, height: sHeight };
        drawMask();
      }
    });
  }

  function onMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (mode === 'select') {
      var endX = e.clientX;
      var endY = e.clientY;
      var left = Math.min(startX, endX);
      var top = Math.min(startY, endY);
      var width = Math.abs(endX - startX);
      var height = Math.abs(endY - startY);

      if (width > 20 && height > 20) {
        currentRect = { left: left, top: top, width: width, height: height };
        mode = 'draw';
        overlayCanvas.style.cursor = 'default';
        drawMask();
        showToolbar();
      } else {
        destroyOverlay(); 
      }
    } else if (mode === 'draw') {
      if (currentShape && currentShape.width > 5 && currentShape.height > 5) {
        shapes.push(currentShape);
      }
      currentShape = null;
      drawMask();
      if (toolbar) toolbar.style.display = 'flex';
    }
  }

  function captureAndAction() {
    if (typeof html2canvas === 'undefined') {
      if (typeof UIToast !== 'undefined') UIToast.show('Thư viện html2canvas chưa load!', 'error');
      destroyOverlay();
      return;
    }

    // Ẩn UI
    if (toolbar) toolbar.style.display = 'none';

    var shapeContainer = document.createElement('div');
    shapeContainer.style.position = 'absolute';
    shapeContainer.style.left = '0';
    shapeContainer.style.top = '0';
    shapeContainer.style.width = '100%';
    shapeContainer.style.height = '100%';
    shapeContainer.style.pointerEvents = 'none';
    shapeContainer.style.zIndex = '999998';

    shapes.forEach(function(s) {
      var div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = (s.left + window.scrollX) + 'px';
      div.style.top = (s.top + window.scrollY) + 'px';
      div.style.width = s.width + 'px';
      div.style.height = s.height + 'px';
      div.style.border = '3px solid #EF4444';
      div.style.boxSizing = 'border-box';
      shapeContainer.appendChild(div);
    });
    document.body.appendChild(shapeContainer);

    destroyOverlay(); // Xóa canvas
    
    if (typeof UIToast !== 'undefined') UIToast.show('Đang xử lý ảnh...', 'info');

    var isDone = false;
    var timeoutId = setTimeout(function() {
      if (!isDone) {
        if (typeof UIToast !== 'undefined') UIToast.show('Xử lý ảnh quá lâu!', 'error');
        if (shapeContainer.parentNode) document.body.removeChild(shapeContainer);
        isDone = true;
      }
    }, 5000);

    try {
      html2canvas(document.body, {
        x: currentRect.left + window.scrollX,
        y: currentRect.top + window.scrollY,
        width: currentRect.width,
        height: currentRect.height,
        useCORS: true,
        scale: 1,
        logging: false,
        backgroundColor: null
      }).then(function(canvas) {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeoutId);
        
        if (shapeContainer.parentNode) document.body.removeChild(shapeContainer);

        if (currentCallback) {
          currentCallback(canvas);
          return;
        }

        function fallbackDownload() {
          var imgData = canvas.toDataURL('image/png');
          var a = document.createElement('a');
          a.href = imgData;
          a.download = 'screenshot_' + new Date().getTime() + '.png';
          a.click();
          if (typeof UIToast !== 'undefined') UIToast.show('Đã lưu ảnh về máy!', 'success');
        }

        canvas.toBlob(function(blob) {
          if (!blob) return fallbackDownload();
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
              if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ảnh!', 'success');
            }).catch(function() { fallbackDownload(); });
          } else {
            fallbackDownload();
          }
        });
      }).catch(function() {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeoutId);
        if (shapeContainer.parentNode) document.body.removeChild(shapeContainer);
      });
    } catch(err) {
      if (isDone) return;
      isDone = true;
      clearTimeout(timeoutId);
      if (shapeContainer.parentNode) document.body.removeChild(shapeContainer);
    }
  }

  function start(onCaptureCallback) {
    currentCallback = onCaptureCallback || null;
    initOverlay();
  }

  return {
    start: start
  };
})();


/* --- RuleBuilderDialog.js --- */
(function (global) {
  'use strict';

  var RuleBuilderDialog = {
    open: function (options) {
      // options = { currentRule, targetFormName, onSave }
      var currentRule = options.currentRule || '';
      var targetFormName = options.targetFormName || '';
      var onSave = options.onSave;

      // Body container
      var body = document.createElement('div');
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.gap = '15px';

      // Khung nhập FormName (Hiển thị nếu hệ thống không tự lấy được form đích)
      var formNameContainer = document.createElement('div');
      formNameContainer.style.display = 'flex';
      formNameContainer.style.gap = '10px';
      formNameContainer.style.alignItems = 'center';
      
      var lblForm = document.createElement('label');
      lblForm.innerText = 'Lấy danh sách cột từ Form:';
      lblForm.style.fontWeight = '500';
      lblForm.style.whiteSpace = 'nowrap';
      
      var txtFormName = document.createElement('input');
      txtFormName.className = 'ui-input';
      txtFormName.placeholder = 'Ví dụ: frmCustomer';
      txtFormName.value = targetFormName;
      txtFormName.style.flex = '1';
      
      var btnLoadFieldsWrapper = document.createElement('div');
      btnLoadFieldsWrapper.innerHTML = UIButton.createHTML({ text: 'Tải Cột', type: 'secondary', icon: 'sync' });
      var btnLoadFields = btnLoadFieldsWrapper.firstElementChild;

      formNameContainer.appendChild(lblForm);
      formNameContainer.appendChild(txtFormName);
      formNameContainer.appendChild(btnLoadFields);
      body.appendChild(formNameContainer);

      var conditionsList = document.createElement('div');
      conditionsList.style.display = 'flex';
      conditionsList.style.flexDirection = 'column';
      conditionsList.style.gap = '10px';
      body.appendChild(conditionsList);

      var fields = []; // Tên các cột của form đích

      var fetchFields = function(formName) {
        if (!formName) return;
        if (typeof ApiClient !== 'undefined') {
          btnLoadFields.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang tải...';
          ApiClient.post('/api/API_DanhSachTruongGiaoDien', { FormName: formName, Username: 'admin', Limit: 1000 })
            .then(function(res) {
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              fields = res.list || res.records || res.data || res || [];
              if (Array.isArray(fields) && fields.length > 0) {
                var allSelects = conditionsList.querySelectorAll('select.field-select');
                allSelects.forEach(function(sel) { populateFieldSelect(sel, fields); });
                txtFormName.style.borderColor = 'var(--color-success)';
              } else {
                txtFormName.style.borderColor = 'var(--color-danger)';
                Alert.warning('Lỗi', 'Không tìm thấy cột nào cho form: ' + formName);
              }
            }).catch(function(e) { 
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              console.error('Lỗi load cột', e); 
            });
        }
      };

      btnLoadFields.onclick = function() { fetchFields(txtFormName.value.trim()); };

      // Phân tích cú pháp rule hiện tại
      var parseRule = function(ruleStr) {
        if (!ruleStr) return [];
        var isOr = ruleStr.includes('|');
        var parts = ruleStr.split(isOr ? '|' : '&');
        return parts.map(function(p) {
          var operator = p.includes('!=') ? '!=' : '=';
          var kv = p.split(operator);
          return { field: kv[0], operator: operator, value: kv[1] || '' };
        }).filter(function(r) { return r.field !== ''; });
      };

      var rules = parseRule(currentRule);
      if (rules.length === 0) rules.push({ field: '', operator: '=', value: '' });

      var renderRow = function(r) {
        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';
        row.style.background = 'var(--color-surface)';
        row.style.padding = '12px';
        row.style.borderRadius = '8px';
        row.style.border = '1px solid var(--color-border)';

        // Field Select
        var fieldSelect = document.createElement('select');
        fieldSelect.className = 'ui-input field-select';
        fieldSelect.style.flex = '5';
        fieldSelect.innerHTML = '<option value="' + r.field + '">' + (r.field || '-- Chọn cột --') + '</option>';
        fieldSelect.dataset.val = r.field;

        // Operator
        var opSelect = document.createElement('select');
        opSelect.className = 'ui-input';
        opSelect.style.flex = '3';
        opSelect.innerHTML = '<option value="=" ' + (r.operator === '=' ? 'selected' : '') + '>Bằng (=)</option>' +
                             '<option value="!=" ' + (r.operator === '!=' ? 'selected' : '') + '>Khác (!=)</option>';

        // Value
        var valInput = document.createElement('input');
        valInput.className = 'ui-input';
        valInput.style.flex = '4';
        valInput.type = 'text';
        valInput.value = r.value;
        valInput.placeholder = 'Giá trị...';

        // Delete Btn
        var delBtnWrapper = document.createElement('div');
        delBtnWrapper.innerHTML = UIButton.createHTML({ text: '', type: 'danger', icon: 'delete', className: 'btn-icon-only' });
        var delBtn = delBtnWrapper.firstElementChild;
        delBtn.onclick = function() { conditionsList.removeChild(row); };

        row.appendChild(fieldSelect);
        row.appendChild(opSelect);
        row.appendChild(valInput);
        row.appendChild(delBtn);

        conditionsList.appendChild(row);
        return fieldSelect;
      };

      rules.forEach(function(r) { renderRow(r); });

      var addBtnWrapper = document.createElement('div');
      addBtnWrapper.innerHTML = UIButton.createHTML({ text: 'Thêm điều kiện', type: 'secondary', icon: 'add' });
      var addBtn = addBtnWrapper.firstElementChild;
      addBtn.style.width = '100%';
      addBtn.onclick = function() {
        var fs = renderRow({ field: '', operator: '=', value: '' });
        populateFieldSelect(fs, fields);
      };
      body.appendChild(addBtn);

      var populateFieldSelect = function(selectEl, fieldData) {
        selectEl.innerHTML = '<option value="">-- Chọn cột --</option>';
        fieldData.forEach(function(f) {
          var selected = (selectEl.dataset.val === f.FieldName) ? 'selected' : '';
          selectEl.innerHTML += '<option value="' + f.FieldName + '" ' + selected + '>' + f.FieldName + ' (' + f.CaptionVN + ')</option>';
        });
      };

      // Tự động load nếu có sẵn tên form
      if (targetFormName) {
         fetchFields(targetFormName);
      }

      // Footer
      var footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.alignItems = 'center';
      footer.style.width = '100%';

      var logicSelectWrapper = document.createElement('div');
      logicSelectWrapper.style.display = 'flex';
      logicSelectWrapper.style.alignItems = 'center';
      logicSelectWrapper.style.gap = '10px';
      logicSelectWrapper.innerHTML = '<span style="font-weight: 500;">Nối bằng:</span>';
      
      var logicSelect = document.createElement('select');
      logicSelect.className = 'ui-input';
      logicSelect.style.width = '140px';
      logicSelect.innerHTML = '<option value="&">VÀ (AND)</option><option value="|">HOẶC (OR)</option>';
      if (currentRule.includes('|')) logicSelect.value = '|';
      logicSelectWrapper.appendChild(logicSelect);
      
      var actionGroup = document.createElement('div');
      actionGroup.style.display = 'flex';
      actionGroup.style.gap = '10px';
      actionGroup.innerHTML = 
        UIButton.createHTML({ text: 'Hủy', type: 'secondary', className: 'btn-cancel-rule' }) +
        UIButton.createHTML({ text: 'Lưu Quy Tắc', type: 'primary', icon: 'save', className: 'btn-save-rule' });

      footer.appendChild(logicSelectWrapper);
      footer.appendChild(actionGroup);

      // Mở Modal bằng UIModal
      var ruleModal = UIModal.show({
        title: '🛠 Thiết lập Quy tắc hiển thị',
        content: body,
        footer: footer,
        width: '700px'
      });

      // Gắn sự kiện cho các nút footer
      footer.querySelector('.btn-cancel-rule').onclick = function() {
        ruleModal.closeNow();
      };

      footer.querySelector('.btn-save-rule').onclick = function() {
        var finalRules = [];
        var rows = conditionsList.children;
        for(var i=0; i<rows.length; i++) {
          var fld = rows[i].children[0].value;
          var op = rows[i].children[1].value;
          var val = rows[i].children[2].value;
          if (fld) { // Bỏ qua nếu chưa chọn cột
            finalRules.push(fld + op + val);
          }
        }
        var joiner = logicSelect.value;
        var resultString = finalRules.join(joiner);
        
        if (onSave) onSave(resultString);
        ruleModal.closeNow();
      };
    }
  };

  global.RuleBuilderDialog = RuleBuilderDialog;
})(window);


