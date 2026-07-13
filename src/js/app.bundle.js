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
    { label: 'Môi trường tốt', value: 25 },
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
          if (window.APP_SETTINGS) APP_SETTINGS.removeStored('user'); else localStorage.removeItem('pmql_user');
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
    var newPerms = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('permissions', '{}') : localStorage.getItem('pmql_permissions')) || '{}');
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
    canView: function (module) { return _get(module).xem; },
    canAdd: function (module) { return _get(module).them; },
    canEdit: function (module) { return _get(module).sua; },
    canDelete: function (module) { return _get(module).xoa; }
  };
})();


/* --- DocumentExportPlugin.js --- */
/**
 * DocumentExportPlugin (HR-management Version)
 * ─────────────────────────────────────────────────────────────────────
 * Plugin cấu hình nút "Xuất tài liệu" cho các form quản lý nhân sự:
 *   WA_HopDongLaoDongFrm → Hợp đồng lao động & Thử việc (PK: MaHopDong)
 */
var DocumentExportPlugin = (function () {
  var DOC_API_BASE = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.BASE_API;

  var FORM_CONFIG = {
    'WA_HopDongLaoDongFrm': {
      docType: 'HR_HopDongLaoDongReport',
      label: 'Xuất Hợp Đồng',
      icon: 'description',
      altKeys: ['MaHopDong', 'maHopDong'],
      sqlListName: 'WA_HopDongLaoDongFrm',
      convertFields: []
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

  function _showTemplateSelectModal(row, config, onConfirm) {
    // Gọi API Gateway để lấy danh sách file mẫu cấu hình dưới CSDL
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.ROUTER)
      ? window.API_CONFIG.ENDPOINTS.ROUTER
      : '/api/API_Gateway_Router';

    var payload = {
      List: 'HR_HopDongAddfile',
      Func: 'View',
      Keyword: config.sqlListName || 'WA_HopDongLaoDongFrm'
    };

    // Tạo overlay nền mờ chờ tải dữ liệu (loading overlay)
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.45)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';

    var loadingText = document.createElement('div');
    loadingText.style.color = '#ffffff';
    loadingText.style.fontSize = '16px';
    loadingText.style.fontWeight = '600';
    loadingText.innerText = 'Đang tải danh sách mẫu...';
    overlay.appendChild(loadingText);
    document.body.appendChild(overlay);

    // Dùng ApiClient hoặc Fetch để lấy data
    var headers = { 'Content-Type': 'application/json' };
    var token = '';
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') {
      token = ApiClient.getCookie('auth_token');
    } else {
      var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    var fetchUrl = endpoint.startsWith('http') ? endpoint : (window.API_CONFIG.BASE_URL + endpoint);

    fetch(fetchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        // Gỡ loading text
        overlay.removeChild(loadingText);

        var records = [];
        if (res && res.records) records = res.records;
        else if (res && res.data) records = res.data;
        else if (Array.isArray(res)) records = res;

        var templates = [];
        if (records.length > 0) {
          templates = records.map(function (r) {
            return {
              id: r.TemplateFile || r.templateFile || r.templatefile,
              name: r.GhiChu || r.ghiChu || r.ghichu || r.TemplateFile || r.templateFile || r.templatefile,
              loaiHD: r.LoaiHD || r.loaiHD || r.loaihd
            };
          });
        } else {
          // Không có mẫu cấu hình dưới CSDL, hiển thị thông báo lỗi
          var errBox = document.createElement('div');
          errBox.style.backgroundColor = '#ffffff';
          errBox.style.padding = '24px';
          errBox.style.borderRadius = '12px';
          errBox.style.textAlign = 'center';
          errBox.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
          errBox.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

          var errMsg = document.createElement('p');
          errMsg.innerText = 'Không tìm thấy mẫu hợp đồng nào được cấu hình trong CSDL (bảng HR_HopDongAddfile).';
          errMsg.style.color = '#ef4444';
          errMsg.style.fontSize = '14px';
          errMsg.style.fontWeight = '500';
          errMsg.style.margin = '0 0 16px 0';
          errBox.appendChild(errMsg);

          var btnClose = document.createElement('button');
          btnClose.innerText = 'Đóng';
          btnClose.style.padding = '8px 18px';
          btnClose.style.borderRadius = '8px';
          btnClose.style.border = 'none';
          btnClose.style.backgroundColor = '#64748b';
          btnClose.style.color = '#ffffff';
          btnClose.style.fontSize = '14px';
          btnClose.style.fontWeight = '600';
          btnClose.style.cursor = 'pointer';
          btnClose.addEventListener('click', function () {
            document.body.removeChild(overlay);
          });
          errBox.appendChild(btnClose);
          overlay.appendChild(errBox);
          return;
        }

        // --- XÂY DỰNG MODAL GIAO DIỆN CHỌN MẪU ---
        var container = document.createElement('div');
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '28px';
        container.style.borderRadius = '12px';
        container.style.width = '460px';
        container.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        container.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

        var title = document.createElement('h3');
        title.innerText = 'Chọn mẫu in Hợp đồng';
        title.style.margin = '0 0 8px 0';
        title.style.fontSize = '18px';
        title.style.fontWeight = '600';
        title.style.color = '#0f172a';
        container.appendChild(title);

        var desc = document.createElement('p');
        desc.innerText = 'Chọn một trong các mẫu hợp đồng dưới đây để xuất file:';
        desc.style.margin = '0 0 20px 0';
        desc.style.fontSize = '14px';
        desc.style.color = '#64748b';
        container.appendChild(desc);

        var radioGroup = document.createElement('div');
        radioGroup.style.display = 'flex';
        radioGroup.style.flexDirection = 'column';
        radioGroup.style.gap = '10px';
        radioGroup.style.margin = '0 0 24px 0';

        // Xác định mẫu được đề xuất dựa trên LoaiHD / LoaiHopDong từ dòng dữ liệu
        var rowLoaiHD = (row.LoaiHD || row.LoaiHopDong || '').toString().toLowerCase();

        var selectedId = templates[0].id;
        var matched = null;

        // Ưu tiên khớp chính xác theo LoaiHD/LoaiHopDong cấu hình CSDL
        for (var i = 0; i < templates.length; i++) {
          var tLoai = (templates[i].loaiHD || '').toLowerCase();
          if (tLoai && (rowLoaiHD.includes(tLoai) || tLoai.includes(rowLoaiHD))) {
            matched = templates[i];
            break;
          }
        }

        if (matched) {
          selectedId = matched.id;
        }

        templates.forEach(function (tpl) {
          var label = document.createElement('label');
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.gap = '12px';
          label.style.cursor = 'pointer';
          label.style.fontSize = '14px';
          label.style.color = '#334155';
          label.style.padding = '12px 14px';
          label.style.borderRadius = '8px';
          label.style.border = '1px solid #e2e8f0';
          label.style.transition = 'all 0.15s ease';

          var radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'tplSelect';
          radio.value = tpl.id;
          radio.style.cursor = 'pointer';
          radio.style.margin = '0';

          var textSpan = document.createElement('span');
          textSpan.innerText = tpl.name;
          textSpan.style.fontWeight = '500';

          if (tpl.id === selectedId) {
            radio.checked = true;
            label.style.borderColor = '#3b82f6';
            label.style.backgroundColor = '#eff6ff';
            textSpan.style.color = '#1d4ed8';

            var badge = document.createElement('span');
            badge.innerText = 'Đề xuất';
            badge.style.marginLeft = 'auto';
            badge.style.fontSize = '11px';
            badge.style.backgroundColor = '#dbeafe';
            badge.style.color = '#1e40af';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '9999px';
            badge.style.fontWeight = '600';

            label.appendChild(radio);
            label.appendChild(textSpan);
            label.appendChild(badge);
          } else {
            label.appendChild(radio);
            label.appendChild(textSpan);
          }

          radio.addEventListener('change', function () {
            var labels = radioGroup.querySelectorAll('label');
            labels.forEach(function (l) {
              l.style.borderColor = '#e2e8f0';
              l.style.backgroundColor = 'transparent';
              var span = l.querySelector('span:not([style*="margin-left"])');
              if (span) span.style.color = '#334155';
              var bg = l.querySelector('span[style*="margin-left"]');
              if (bg) l.removeChild(bg);
            });

            if (radio.checked) {
              label.style.borderColor = '#3b82f6';
              label.style.backgroundColor = '#eff6ff';
              textSpan.style.color = '#1d4ed8';
            }
          });

          radioGroup.appendChild(label);
        });
        container.appendChild(radioGroup);

        var actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '12px';

        var btnCancel = document.createElement('button');
        btnCancel.innerText = 'Hủy';
        btnCancel.style.padding = '10px 18px';
        btnCancel.style.borderRadius = '8px';
        btnCancel.style.border = '1px solid #cbd5e1';
        btnCancel.style.backgroundColor = '#ffffff';
        btnCancel.style.cursor = 'pointer';
        btnCancel.style.fontSize = '14px';
        btnCancel.style.fontWeight = '600';
        btnCancel.style.color = '#475569';
        btnCancel.addEventListener('click', function () {
          document.body.removeChild(overlay);
        });

        var btnConfirm = document.createElement('button');
        btnConfirm.innerText = 'Xuất Hợp Đồng';
        btnConfirm.style.padding = '10px 18px';
        btnConfirm.style.borderRadius = '8px';
        btnConfirm.style.border = 'none';
        btnConfirm.style.backgroundColor = '#3b82f6';
        btnConfirm.style.cursor = 'pointer';
        btnConfirm.style.fontSize = '14px';
        btnConfirm.style.fontWeight = '600';
        btnConfirm.style.color = '#ffffff';
        btnConfirm.addEventListener('click', function () {
          var selectedRadio = radioGroup.querySelector('input[name="tplSelect"]:checked');
          if (selectedRadio) {
            onConfirm(selectedRadio.value);
          }
          document.body.removeChild(overlay);
        });

        actions.appendChild(btnCancel);
        actions.appendChild(btnConfirm);
        container.appendChild(actions);

        overlay.appendChild(container);
      })
      .catch(function (err) {
        console.error('[DocumentExportPlugin] Lỗi tải mẫu CSDL:', err);
        overlay.removeChild(loadingText);

        // Hiện thông báo lỗi và tự động gỡ overlay
        var errBox = document.createElement('div');
        errBox.style.backgroundColor = '#ffffff';
        errBox.style.padding = '24px';
        errBox.style.borderRadius = '8px';
        errBox.style.textAlign = 'center';

        var errMsg = document.createElement('p');
        errMsg.innerText = 'Không thể kết nối đến máy chủ hoặc tải danh sách mẫu từ CSDL.';
        errMsg.style.color = '#ef4444';
        errMsg.style.margin = '0 0 16px 0';
        errBox.appendChild(errMsg);

        var btnClose = document.createElement('button');
        btnClose.innerText = 'Đóng';
        btnClose.style.padding = '8px 16px';
        btnClose.style.borderRadius = '6px';
        btnClose.style.border = 'none';
        btnClose.style.backgroundColor = '#6b7280';
        btnClose.style.color = '#ffffff';
        btnClose.style.cursor = 'pointer';
        btnClose.addEventListener('click', function () {
          document.body.removeChild(overlay);
        });
        errBox.appendChild(btnClose);
        overlay.appendChild(errBox);
      });
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

    // Đọc tên file mẫu từ dữ liệu dòng hoặc cấu hình
    var actualDocType = config.docType;
    if (row.TemplateFile && !config.ignoreTemplateFile) {
      actualDocType = row.TemplateFile;
    } else if (typeof config.getDocType === 'function') {
      actualDocType = config.getDocType(row);
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

    var headers = { 'Content-Type': 'application/json' };
    var token = '';
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') {
      token = ApiClient.getCookie('auth_token');
    } else {
      var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    fetch(DOC_API_BASE + '/generate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        templateType: actualDocType,
        customerId: docId,
        outputFileName: actualDocType + '_' + docId,
        rowData: row,
        sqlListName: config.sqlListName,
        convertFields: config.convertFields || [],
        // branchId từ localStorage (backend sẽ tự xác thực lại bằng SY_User)
        branchId: (function () {
          try { return (JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}')).BranchID || null; } catch (e) { return null; }
        })()
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

    var buttons = [{
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
        _showTemplateSelectModal(row, config, function (selectedTemplate) {
          var customConfig = Object.assign({}, config, {
            docType: selectedTemplate,
            ignoreTemplateFile: true
          });
          _generateDocument(row, customConfig);
        });
      }
    }];

    // Thêm nút xem kho lưu trữ hợp đồng
    buttons.push({
      id: 'btn-view-docmgr',
      text: 'Quản lý Hợp Đồng',
      icon: 'folder_open',
      type: 'tool',
      onClick: function () {
        window.location.hash = '#/document-manager';
      }
    });

    return buttons;
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
        onClick: function () { _promptLayoutBuilder(moduleConfig, onReloadFormEngine); }
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

          var _bool = function (camel, pascal) {
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
            .then(function () {
              modalLayout.closeNow();
              Alert.success('Thành công', 'Đã cập nhật xong cấu hình Layout!');
              if (typeof onReloadFormEngine === 'function') onReloadFormEngine();
            })
            .catch(function (err) {
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
    return payloads.reduce(function (promise, payload) {
      return promise.then(function () {
        var finalPayload = payload;
        if (endpoint === '/api/API_Gateway_Router') {
          finalPayload = {
            List: payload.FormName,
            Func: 'Save',
            JsonData: JSON.stringify(payload)
          };
        }
        return ApiClient.post(endpoint, finalPayload).then(function (res) {
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
var EventBus = (function () {
  var listeners = {};

  return {
    // Đăng ký lắng nghe sự kiện
    on: function (event, callback) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    // Bỏ đăng ký lắng nghe
    off: function (event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(function (cb) {
        return cb !== callback;
      });
    },

    // Phát sự kiện toàn cục kèm theo dữ liệu (nếu có)
    emit: function (event, data) {
      console.debug('[EventBus] emit:', event, data ? data : '');
      if (listeners[event]) {
        listeners[event].forEach(function (callback) {
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
    styles.forEach(function (s) {
      win.document.write(s.outerHTML);
    });

    win.document.write('<style> @media print { body { padding: 20px; background: var(--color-surface); } .btn-tool { display: none; } } </style>');
    win.document.write('</head><body >');
    win.document.write(element.outerHTML);
    win.document.write('</body></html>');

    win.document.close();
    win.focus();

    setTimeout(function () {
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
    return new Promise(function (resolve, reject) {
      if (_legendCache) {
        return resolve(_legendCache);
      }
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CALENDAR || !API_CONFIG.ENDPOINTS.CALENDAR.LEGEND) {
        return reject('Missing API_CONFIG.ENDPOINTS.CALENDAR.LEGEND');
      }
      ApiClient.get(API_CONFIG.ENDPOINTS.CALENDAR.LEGEND)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _legendCache = records;
          resolve(records);
        })
        .catch(function (err) {
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
          _pendingResolvers.forEach(function (p) {
            var cached = _calendarCache[p.cacheKey];
            if (cached) p.resolve(cached); else p.reject('No data');
          });
          _pendingResolvers = [];
        })
        .catch(function (err) {
          console.error('[CalendarService] Lỗi khi tải lịch:', err);
          reject(err);
          _pendingResolvers.forEach(function (p) { p.reject(err); });
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
var SystemDataService = (function () {
  var _hallsCache = null;
  var _shiftsCache = null;
  var _isFetchingHalls = false;
  var _isFetchingShifts = false;

  function getHalls(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function (resolve, reject) {
      if (!forceRefresh && _hallsCache) {
        return resolve(_hallsCache);
      }
      if (_isFetchingHalls) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.HALLS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.HALLS');
      }

      _isFetchingHalls = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.HALLS)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _hallsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function () {
          _isFetchingHalls = false;
        });
    });
  }

  function getShifts(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function (resolve, reject) {
      if (!forceRefresh && _shiftsCache) {
        return resolve(_shiftsCache);
      }
      if (_isFetchingShifts) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS');
      }

      _isFetchingShifts = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _shiftsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function () {
          _isFetchingShifts = false;
        });
    });
  }

  function getBanquetTypes(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES');
      }

      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          resolve(records);
        })
        .catch(reject);
    });
  }

  function getSetupValue(codeId) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE');
      }
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          // Tìm đúng CodeID được yêu cầu
          var found = records.find(function (r) { return r.CodeID === codeId; });
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
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
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
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
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
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
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
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
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
          if (res && res.records && res.records.length > 0) record = res.records[0];
          else if (res && res.data && res.data.length > 0) record = res.data[0];
          else if (Array.isArray(res) && res.length > 0) record = res[0];
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
    getList: getList,
    searchContracts: searchContracts,
    save: save
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
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    return MetadataModuleConfig.getUserGroupId(u);
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
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
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
(function () {
  window.PeriodManager = {
    _cache: {},
    init: function () {
      var _this = this;
      if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.ROUTER) {
        ApiClient.post(API_CONFIG.ENDPOINTS.ROUTER, {
          List: 'SY_Period',
          Func: 'View'
        }).then(function (res) {
          var records = res.records || (Array.isArray(res) ? res : []);
          records.forEach(function (r) {
            var m = parseInt(r.PeriodNo);
            var y = parseInt(r.YearID);
            var isLocked = (r.isLock === true || r.isLock === 1 || r.isLock === '1' || r.isLock === 'True');
            if (m && y) _this._cache[m + '/' + y] = isLocked;
          });
        }).catch(function (e) { console.error('Lỗi tải SY_Period:', e); });
      }
    },
    getLockedPeriods: function () {
      return this._cache;
    },
    setLockedPeriod: function (month, year, isLocked) {
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
        }).catch(function (e) { console.error('Lỗi update Khóa Kỳ:', e); });
      }
    },
    isDateLocked: function (dateString) {
      if (!dateString) return false;
      var dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        var parts = dateString.split('/');
        if (parts.length === 3) dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
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
    if (opts.iconBg) iconWrap.style.background = opts.iconBg;

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
    canvas.width = W * _dpr;
    canvas.height = H * _dpr;
    canvas.style.width = W + 'px';
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
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
    primary: 'var(--color-primary)'
  };

  /**
   * Tạo 1 row element
   */
  function _buildRow(row, index) {
    var div = document.createElement('div');
    div.className = 'kvtable__row'
      + (row.isHeader ? ' kvtable__row--header' : '')
      + (row.isTotal ? ' kvtable__row--total' : '');
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
    var total = opts.total || 0;
    var done = opts.done || 0;
    var ongoing = opts.ongoing || 0;
    var label = opts.label || 'đang hoạt động';
    var doneLabel = opts.doneLabel || 'Đã phục vụ xong';
    var ongoingLabel = opts.ongoingLabel || 'Đang phục vụ';
    var color = opts.color || 'var(--color-primary)';

    var activePct = _pct(ongoing, total);

    var wrap = document.createElement('div');
    wrap.className = 'hall-gauge';

    wrap.innerHTML =
      '<div class="hall-gauge__title">' +
      '<span class="material-symbols-outlined hall-gauge__icon">location_city</span>' +
      (opts.titleText || 'Trạng thái nhân sự hôm nay') +
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

    var total = parseInt(el.querySelector('[data-hg-total]').textContent) || 0;
    var done = parseInt(el.querySelector('[data-hg-done]').textContent) || 0;
    var ongoing = parseInt(el.querySelector('[data-hg-ongoing]').textContent) || 0;

    if (patch.total !== undefined) total = patch.total;
    if (patch.done !== undefined) done = patch.done;
    if (patch.ongoing !== undefined) ongoing = patch.ongoing;

    var activePct = _pct(ongoing, total);

    var totalEl = el.querySelector('[data-hg-total]');
    var doneEl = el.querySelector('[data-hg-done]');
    var ongoingEl = el.querySelector('[data-hg-ongoing]');
    var fillEl = el.querySelector('[data-hg-fill]');
    var pctEl = el.querySelector('[data-hg-pct]');

    if (totalEl) totalEl.textContent = total;
    if (doneEl) doneEl.textContent = done;
    if (ongoingEl) ongoingEl.textContent = ongoing;
    if (fillEl) fillEl.style.width = activePct + '%';
    if (pctEl) pctEl.textContent = activePct + '%';
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
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
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

UIControls.utils = (function () {
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
    dropdownElement.style.position = 'fixed';
    dropdownElement.style.zIndex = '10000000';
    dropdownElement.style.transition = 'opacity 0.15s ease, visibility 0.15s ease';
    dropdownElement.style.minWidth = rect.width + 'px';

    var isActive = dropdownElement.classList.contains('active');
    if (!isActive) {
      dropdownElement.style.maxHeight = '300px';
      dropdownElement.style.visibility = 'hidden';
      dropdownElement.classList.add('active');
    }

    var dropWidth = dropdownElement.offsetWidth;
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
  function createDropdownTableHTML(headers, data, colHighlightIndex, options) {
    options = options || {};
    var visibleIndexes = [];
    var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;

    // Bước 1: Lọc bỏ tất cả các cột rác (ghi chú, mô tả...)
    headers.forEach(function (h, idx) {
      if (hideRegex.test(h)) return;
      visibleIndexes.push(idx);
    });

    // Bước 2: Ép về giao diện 1 cột chuẩn Mobile List (Trừ khi cấu hình yêu cầu giữ nguyên bảng nhiều cột)
    if (visibleIndexes.length > 1 && !options.forceMultiColumn) {
      // Cố gắng giữ lại cột Highlight (do DynamicFormEngine.js chọn) nếu nó không bị loại
      var highlightValid = visibleIndexes.indexOf(colHighlightIndex) !== -1;

      if (highlightValid && colHighlightIndex !== 0) {
        // Nếu Highlight hợp lệ và không phải cột Mã (0)
        visibleIndexes = [colHighlightIndex];
      } else {
        // Mặc định bỏ cột Mã (index 0) đi nếu còn cột khác
        var withoutZero = visibleIndexes.filter(function (i) { return i !== 0; });
        if (withoutZero.length > 0) {
          visibleIndexes = [withoutZero[0]];
        } else {
          visibleIndexes = [visibleIndexes[0]];
        }
      }
    }

    // Bước 3: Fallback an toàn nếu tất cả bị loại
    if (visibleIndexes.length === 0) {
      var firstValid = headers.findIndex(function (h) { return !hideRegex.test(h); });
      visibleIndexes.push(firstValid !== -1 ? firstValid : 0);
    }

    var theadHTML = visibleIndexes.map(idx => `<th>${headers[idx]}</th>`).join('');
    var tbodyHTML = data.map(function (row, rIdx) {
      var cells = visibleIndexes.map(function (idx) {
        var cls = (idx === colHighlightIndex && visibleIndexes.length > 1) ? 'highlight-col' : '';
        return `<td class="${cls}">${row[idx] || ''}</td>`;
      }).join('');
      return `<tr data-index="${rIdx}">${cells}</tr>`;
    }).join('');

    var isSingleCol = visibleIndexes.length <= 1;
    var headerStyle = isSingleCol ? ' style="display:none;"' : '';
    var tblClass = isSingleCol ? 'dropdown-table single-column' : 'dropdown-table';

    return `
      <table class="${tblClass}">
        <thead${headerStyle}><tr>${theadHTML}</tr></thead>
        <tbody>${tbodyHTML}</tbody>
      </table>
    `;
  }

  /**
   * Hiển thị modal chọn nhiều dòng cho grid
   * @param {Object} options 
   * - title: Tiêu đề modal
   * - dataList: Mảng dữ liệu
   * - headers: Mảng tiêu đề cột ['Mã', 'Tên', ...]
   * - fields: Mảng key tương ứng ['PersonID', 'PersonName', ...]
   * - keyField: Field dùng để check trùng (ví dụ 'PersonID')
   * - ctx: Context của detail grid (ctx.panel, ctx.row, ctx.tabDef, ctx.MODULE_CONFIG)
   * - onRowRender(rData, isDuplicate): Callback (tùy chọn) trả về { styleClass, warningText, warningStyle }
   * - mapRow(rData): Hàm trả về object chứa dữ liệu dòng mới để add vào lưới
   * - onConfirm(selectedRows): Callback (tùy chọn) chạy trước khi đóng modal
   */
  function showMultiSelectGridModal(options) {
    var dataList = options.dataList || [];
    var ctx = options.ctx;

    var mWrap = document.createElement('div');
    mWrap.className = 'ui-modal-overlay';
    mWrap.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center;';

    var mBox = document.createElement('div');
    mBox.className = 'ui-modal-content';
    mBox.style.cssText = 'background: #fff; width: 900px; max-width: 95%; max-height: 90%; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 4px 24px rgba(0,0,0,0.2);';

    var mHeader = document.createElement('div');
    mHeader.style.cssText = 'padding: 16px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: var(--color-surface); border-radius: 8px 8px 0 0;';
    mHeader.innerHTML = '<h3 style="margin: 0; font-size: 16px;">' + (options.title || 'Chọn dữ liệu') + '</h3><button type="button" class="btn-close" style="background: transparent; border: none; font-size: 20px; cursor: pointer;">&times;</button>';
    mHeader.querySelector('.btn-close').onclick = function () { document.body.removeChild(mWrap); };

    var mBody = document.createElement('div');
    mBody.style.cssText = 'padding: 16px; overflow-y: auto; flex: 1;';

    var tableHTML = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    tableHTML += '<thead style="background: var(--color-surface-elevated);"><tr style="border-bottom: 2px solid var(--color-border);">';
    tableHTML += '<th style="padding: 10px; text-align: center; width: 40px;"><input type="checkbox" id="chkAllMulti" /></th>';
    options.headers.forEach(function (h) {
      tableHTML += '<th style="padding: 10px; text-align: left;">' + h + '</th>';
    });
    tableHTML += '</tr></thead><tbody>';

    dataList.forEach(function (rData, idx) {
      var isDuplicate = ctx.panel._currentRows.some(function (r) { return r[options.keyField] === rData[options.keyField]; });
      var chkDisabled = isDuplicate ? 'disabled' : '';
      var styleClass = isDuplicate ? 'opacity: 0.5; background: #f9f9f9;' : '';
      var warningText = isDuplicate ? 'Đã có trên form' : '';
      var warningStyle = isDuplicate ? 'color: red;' : '';

      if (typeof options.onRowRender === 'function') {
        var rowRender = options.onRowRender(rData, isDuplicate);
        if (rowRender) {
          if (rowRender.styleClass) styleClass = rowRender.styleClass;
          if (rowRender.warningText) warningText = rowRender.warningText;
          if (rowRender.warningStyle) warningStyle = rowRender.warningStyle;
        }
      }

      tableHTML += '<tr style="border-bottom: 1px solid var(--color-border); ' + styleClass + '">';
      tableHTML += '<td style="padding: 8px; text-align: center;"><input type="checkbox" class="chk-item-multi" data-idx="' + idx + '" ' + chkDisabled + ' /></td>';
      options.fields.forEach(function (f) {
        if (f === '_warning_') {
          tableHTML += '<td style="padding: 8px; ' + warningStyle + '">' + warningText + '</td>';
        } else {
          tableHTML += '<td style="padding: 8px;">' + (rData[f] || '') + '</td>';
        }
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    mBody.innerHTML = tableHTML;

    var mFooter = document.createElement('div');
    mFooter.style.cssText = 'padding: 16px; border-top: 1px solid var(--color-border); text-align: right; background: var(--color-surface); border-radius: 0 0 8px 8px;';

    var btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'btn btn-light';
    btnCancel.textContent = 'Đóng';
    btnCancel.style.marginRight = '8px';
    btnCancel.onclick = function () { document.body.removeChild(mWrap); };

    var btnSelect = document.createElement('button');
    btnSelect.type = 'button';
    btnSelect.className = 'btn btn-primary';
    btnSelect.textContent = 'Chọn & tiếp tục';
    btnSelect.onclick = function () {
      var chks = mBody.querySelectorAll('.chk-item-multi:checked');
      var selectedRows = [];
      chks.forEach(function (chk) {
        var idx = parseInt(chk.getAttribute('data-idx'));
        var rowData = dataList[idx];
        if (rowData) selectedRows.push(rowData);
      });

      if (typeof options.onConfirm === 'function') {
        options.onConfirm(selectedRows);
      } else {
        var added = false;
        selectedRows.forEach(function (rowData) {
          if (typeof options.mapRow === 'function') {
            var newRow = options.mapRow(rowData);
            ctx.panel._currentRows.push(newRow);
            added = true;
          }
        });
        if (added && typeof ctx.renderGrid === 'function') {
          ctx.renderGrid(options.ctx.tabDef, options.ctx.panel);
        }
      }
      document.body.removeChild(mWrap);
    };

    mFooter.appendChild(btnCancel);
    mFooter.appendChild(btnSelect);

    mBox.appendChild(mHeader);
    mBox.appendChild(mBody);
    mBox.appendChild(mFooter);
    mWrap.appendChild(mBox);

    document.body.appendChild(mWrap);

    var chkAll = mBody.querySelector('#chkAllMulti');
    if (chkAll) {
      chkAll.onclick = function () {
        var chks = mBody.querySelectorAll('.chk-item-multi:not([disabled])');
        var isChecked = this.checked;
        chks.forEach(function (chk) { chk.checked = isChecked; });
      };
    }
  }

  return {
    showMultiSelectGridModal: showMultiSelectGridModal,
    computeDropdownPosition: computeDropdownPosition,
    getScrollableAncestors: getScrollableAncestors,
    createDropdownTableHTML: createDropdownTableHTML,
    /**
     * Setup single row selection for a table
     */
    setupTableSelection: function (tableBody, onSelect) {
      if (!tableBody) return;
      tableBody.addEventListener('click', function (e) {
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
    applyVisibleRules: function (container, rowSelector, fieldSelector) {
      rowSelector = rowSelector || '[data-visible-rule]';
      var rows = Array.from(container.querySelectorAll(rowSelector));
      if (!rows.length) return;

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

      function _getFieldValue(fieldName) {
        // Thử data-field-name trước (ReportFilterDialog), fallback sang name (DynamicFormEngine)
        var el = container.querySelector('[data-field-name="' + fieldName + '"]')
          || container.querySelector('[name="' + fieldName + '"]');
        return el ? (el.value || '').toLowerCase() : '';
      }

      function _evaluate(ruleStr) {
        return _parseRule(ruleStr).every(function (cond) {
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
        row.querySelectorAll('input, select, textarea').forEach(function (inp) {
          inp.disabled = !visible;
        });
      }

      // Áp trạng thái ban đầu
      rows.forEach(function (row) { _applyRow(row); });

      // Tìm trigger fields và đăng ký change listener
      var triggerMap = {};
      rows.forEach(function (row) {
        _parseRule(row.dataset.visibleRule || '').forEach(function (cond) {
          if (!triggerMap[cond.field]) triggerMap[cond.field] = [];
          triggerMap[cond.field].push(row);
        });
      });

      Object.keys(triggerMap).forEach(function (fieldName) {
        var triggerEl = container.querySelector('[data-field-name="' + fieldName + '"]')
          || container.querySelector('[name="' + fieldName + '"]');
        if (!triggerEl) return;
        var handler = function () {
          triggerMap[fieldName].forEach(function (row) { _applyRow(row); });
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
  var LAYOUT_KEY = window.APP_SETTINGS ? APP_SETTINGS.storageKey('layout_mode') : 'pmql_layout_mode';
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
        <div class="navbar-brand" onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; cursor: pointer;">
          <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; margin-left: 16px;">
          <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px; margin-left: 16px;">
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
          <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); if (window.APP_SETTINGS) { APP_SETTINGS.setStored('theme', isDark ? 'dark' : 'light'); } else { localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); } this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
            <span class="material-symbols-outlined" id="header-theme-icon-horizontal">dark_mode</span>
          </div>
          <div class="navbar-icon-btn" id="navbar-btn-notif" title="Thông báo">
            <span class="material-symbols-outlined">notifications</span>
            <span class="badge-dot"></span>
          </div>
          <div class="navbar-user" id="navbar-user">
            <div class="user-avatar-nav">
              <img id="nav-avatar-img" src="https://ui-avatars.com/api/?name=User&background=3C50E0&color=fff" alt="User">
            </div>
            <div class="user-info-nav">
              <div class="user-name-nav" id="nav-user-name">Người dùng</div>
              <div class="user-role-nav" id="nav-user-role">Nhân viên</div>
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
          <div class="mobile-drawer-brand" onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; justify-content:center; width:100%; margin: 12px 0; cursor: pointer;">
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; border-radius: 6px;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
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
            <div onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; justify-content:flex-start; width:100%; margin: 16px 0; padding-left: 16px; cursor: pointer;">
              <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; border-radius: 6px;">
              <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
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
              <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); if (window.APP_SETTINGS) { APP_SETTINGS.setStored('theme', isDark ? 'dark' : 'light'); } else { localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); } this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
                <span class="material-symbols-outlined" id="header-theme-icon-vertical">dark_mode</span>
              </div>
              <div class="navbar-icon-btn" onclick="Alert.info('Thông báo', 'Bạn không có thông báo mới')">
                <span class="material-symbols-outlined">notifications</span>
                <span class="badge-dot"></span>
              </div>
              <div class="navbar-user" id="vertical-user-profile">
                <div class="user-avatar-nav">
                  <img id="vert-nav-avatar-img" src="https://ui-avatars.com/api/?name=User&background=3C50E0&color=fff" alt="User">
                </div>
                <div class="user-info-nav">
                  <div class="user-name-nav" id="vert-nav-user-name">Người dùng</div>
                  <div class="user-role-nav" id="vert-nav-user-role">Nhân viên</div>
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

  var CACHE_KEY = window.APP_SETTINGS ? APP_SETTINGS.storageKey('nav_cache') : 'pmql_nav_cache';

  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var currentUser = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    var groupId = MetadataModuleConfig.getUserGroupId(currentUser);
    var userName = currentUser.HoTen || currentUser.FullName || currentUser.UserName || currentUser.username || currentUser.TaiKhoan || 'Người dùng';

    // Check version server trước — nếu khác cache thì tự clear (bắt được thay đổi từ máy Admin)
    if (window.SystemDataService && SystemDataService.getMenuSyncVersion) {
      SystemDataService.getMenuSyncVersion().then(function (serverVer) {
        try {
          var cached = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem(CACHE_KEY)) || 'null');
          var cacheVer = cached && cached.syncVer ? cached.syncVer : null;
          // Nếu server version khác với cache version → xóa cache, fetch lại
          if (serverVer && cacheVer && serverVer !== cacheVer) {
            if (window.APP_SETTINGS) APP_SETTINGS.removeSession('nav_cache'); else sessionStorage.removeItem(CACHE_KEY);
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
      }).catch(function () {
        // Lỗi API → dùng cache nếu có, không thì fetch nav
        _fetchAndRender(container, groupId, null);
      });
    } else {
      // Fallback: không có SystemDataService → dùng cache như cũ
      try {
        var cached = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem(CACHE_KEY)) || 'null');
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
            var cachePayload = JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records,
              syncVer: syncVer || ''
            });
            if (window.APP_SETTINGS) APP_SETTINGS.setSession('nav_cache', cachePayload); else sessionStorage.setItem(CACHE_KEY, cachePayload);
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
    if (window.APP_SETTINGS) APP_SETTINGS.removeSession('nav_cache'); else sessionStorage.removeItem(CACHE_KEY);
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

    // UPDATE USER INFO IN DOM AFTER RENDER
    var currentUser = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    var userName = currentUser.HoTen || currentUser.FullName || currentUser.UserName || currentUser.username || currentUser.TaiKhoan || 'Người dùng';
    var navUserName = document.getElementById('nav-user-name');
    var vertNavUserName = document.getElementById('vert-nav-user-name');
    var navAvatar = document.getElementById('nav-avatar-img');
    var vertNavAvatar = document.getElementById('vert-nav-avatar-img');

    if (navUserName) navUserName.textContent = userName;
    if (vertNavUserName) vertNavUserName.textContent = userName;
    if (navAvatar) navAvatar.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=3C50E0&color=fff";
    if (vertNavAvatar) vertNavAvatar.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=3C50E0&color=fff";

    // Fetch and update Com1 setup value for user roles (outer nav only)
    if (window.SystemDataService && window.SystemDataService.getSetupValue) {
      SystemDataService.getSetupValue('Com1').then(function (val) {
        if (val) {
          document.querySelectorAll('.user-role-nav').forEach(function (el) {
            el.innerText = val;
          });
        }
      }).catch(function (err) {
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
      $scrollLeft.addEventListener('click', function (e) {
        e.stopPropagation();
        $menu.scrollBy({ left: -200, behavior: 'smooth' });
      });
      $scrollRight.addEventListener('click', function (e) {
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

UIControls.createCheckbox = function (options) {
  var wrapper = document.createElement('label');
  wrapper.className = 'modern-checkbox-wrapper';

  var input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'modern-checkbox';
  if (options.checked) input.checked = true;

  input.addEventListener('change', function (e) {
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

UIControls.createRadio = function (options) {
  var wrapper = document.createElement('label');
  wrapper.className = 'modern-radio-wrapper';

  var input = document.createElement('input');
  input.type = 'radio';
  input.className = 'modern-radio';

  if (options.name) input.name = options.name;
  if (options.value) input.value = options.value;
  if (options.checked) input.checked = true;

  input.addEventListener('change', function (e) {
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

UIControls.createRadioGroup = function (options) {
  var group = document.createElement('div');
  group.className = 'modern-radio-group';

  var name = options.name || 'radio-group-' + Math.random().toString(36).substr(2, 9);

  options.items.forEach(function (item) {
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
  input.placeholder = (options.placeholder !== undefined) ? options.placeholder : 'Tìm kiếm...';
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
  [btnPrev, btnNext].forEach(function (btn) {
    btn.onmouseover = function () { this.style.borderColor = 'var(--color-primary)'; this.style.color = 'var(--color-primary)'; this.style.background = 'rgba(251, 191, 36, 0.05)'; };
    btn.onmouseout = function () { this.style.borderColor = 'var(--color-border)'; this.style.color = 'var(--color-text-secondary)'; this.style.background = 'var(--color-surface)'; };
  });

  btnPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentPage > 1) {
      currentPage--;
      loadData(currentQuery, currentPage);
    }
  });

  btnNext.addEventListener('click', function (e) {
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
        options.headers || [], displayData, options.colHighlightIndex !== undefined ? options.colHighlightIndex : (options.colFilterIndex || 0), options
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
          if (result.forceMultiColumn !== undefined) options.forceMultiColumn = result.forceMultiColumn;
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

UIControls.createGridDropdown = function (options) {
  var wrapper = document.createElement('div');
  wrapper.className = 'grid-cell-dropdown-wrapper';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'grid-cell-input';
  input.placeholder = options.placeholder || '';
  if (options.value) input.value = options.value;

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
        row.addEventListener('click', function (e) {
          e.stopPropagation();
          var dataRow = displayData[row.getAttribute('data-index')];
          input.value = dataRow[options.colFilterIndex || 0];
          hideDropdown();
          if (typeof options.onSelect === 'function') {
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

  input.addEventListener('input', function (e) {
    var val = e.target.value.toLowerCase();
    dropdown.classList.add('active');
    if (!val) return renderTable(fullData);
    var filtered = fullData.filter(function (row) {
      return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(val);
    });
    renderTable(filtered);
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) hideDropdown();
  });

  window.addEventListener('scroll', function (e) {
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

    toast.querySelector('.toast-close').addEventListener('click', function () {
      removeToast(toast);
    });

    // Trigger animation
    setTimeout(function () {
      toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(function () {
      removeToast(toast);
    }, duration);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400); // Wait for transition
  }

  return {
    success: function (title, message, duration) { show('success', title, message, duration); },
    error: function (title, message, duration) { show('danger', title, message, duration); },
    warning: function (title, message, duration) { show('warning', title, message, duration); },
    info: function (title, message, duration) { show('info', title, message, duration); }
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

window.ConfirmModal = ConfirmModal;

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
    document.querySelectorAll('#modal-container .modal-overlay').forEach(function (m) {
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
    var pageSizes = [10, 15, 20, 50, 100, 200, 500, 1000, { label: "Tất cả", value: 100000 }];
    pageSizes.forEach(function (valObj) {
      var val = typeof valObj === 'object' ? valObj.value : valObj;
      var label = typeof valObj === 'object' ? valObj.label : val;
      var opt = document.createElement('option');
      opt.value = val;
      opt.text = label;
      if (val === options.itemsPerPage || (val === 100000 && options.itemsPerPage >= 100000)) {
        opt.selected = true;
      }
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
    document.querySelectorAll('.filter-backdrop').forEach(function (el) {
      el.remove();
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'filter-backdrop';
    backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 999998; display: none; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);';
    document.body.appendChild(backdrop);


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
    // Dùng CSS class để tự động responsive (1 cột trên mobile, 2 cột trên desktop)
    gridContainer.className = 'filter-grid' + (filters.length > 2 ? ' multi-col' : '');
    gridContainer.style.cssText = 'display: grid; gap: 16px;';
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
          inp.addEventListener('focus', function () {
            this.style.borderColor = 'var(--color-primary, #3b82f6)';
            this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          });
          inp.addEventListener('blur', function () {
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
    btnReset.onmouseover = function () { this.style.background = 'var(--color-surface-elevated, #f8fafc)'; this.style.color = 'var(--color-text, #0f172a)'; };
    btnReset.onmouseout = function () { this.style.background = 'var(--color-surface, #fff)'; this.style.color = 'var(--color-text-secondary, #64748b)'; };
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
            backdrop.style.display = 'block';
            wrapper.style.display = 'flex';
            setTimeout(function () {
              backdrop.style.opacity = '1';
              wrapper.style.opacity = '1';
              wrapper.style.transform = 'translateY(0)';
            }, 10);
            alignPopup();

            // Focus vào ô đầu tiên
            var firstInput = wrapper.querySelector('input');
            if (firstInput) firstInput.focus();
          } else {
            backdrop.style.opacity = '0';
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(-10px)';
            setTimeout(function () {
              if (parent.style.display === 'none') {
                backdrop.style.display = 'none';
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
        var isClickOnButton = false;
        var clickedBtn = e.target.closest('button');
        if (clickedBtn && (clickedBtn.innerHTML.indexOf('filter_alt') !== -1 || clickedBtn.innerText.trim() === 'Lọc' || clickedBtn.getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu')) {
          isClickOnButton = true;
        }

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
    // Removed auto-placeholder generation to clean up UI as requested by user
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
    var obj = _createBaseWrapper(config, 'text');
    if (config.value) {
      obj.input.value = config.value;
    }

    // Thêm icon lịch (tùy chọn)
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.innerText = 'calendar_today';
    icon.style.position = 'absolute';
    icon.style.right = '10px';
    icon.style.top = '36px'; // canh giữa theo height của input
    icon.style.color = 'var(--color-text-secondary)';
    icon.style.pointerEvents = 'none';
    icon.style.fontSize = '18px';

    // Đảm bảo wrapper là relative để canh vị trí icon
    obj.wrapper.style.position = 'relative';

    // Ẩn icon nếu đang dùng label inline hoặc config khác
    if (!config.label) icon.style.top = '10px';
    obj.wrapper.appendChild(icon);

    if (typeof window.flatpickr !== 'undefined') {
      window.flatpickr(obj.input, {
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        defaultDate: config.value ? new Date(config.value) : null,
        locale: "vn",
        allowInput: true
      });
    } else {
      // Fallback nếu không có flatpickr
      obj.input.type = 'date';
      if (config.value) obj.input.value = config.value;
    }

    return obj.wrapper;
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
    obj.input.onchange = function () {
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
    eyeBtn.addEventListener('click', function () {
      isVisible = !isVisible;
      input.type = isVisible ? 'text' : 'password';
      eyeBtn.querySelector('.material-symbols-outlined').textContent = isVisible ? 'visibility' : 'visibility_off';
      eyeBtn.title = isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
      input.focus();
    });

    // Hover effect
    eyeBtn.addEventListener('mouseenter', function () { this.style.color = 'var(--color-text)'; });
    eyeBtn.addEventListener('mouseleave', function () { this.style.color = 'var(--color-text-secondary)'; });

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
    defaultOpt.innerText = '';
    select.appendChild(defaultOpt);

    (options || []).forEach(function (opt) {
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
      btn.addEventListener('click', function (e) {
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
    // ===== DESKTOP BUTTON BAR =====
    var bar = document.createElement('div');
    // btn-bar-desktop: bi class CSS ẩn trên mobile
    bar.className = 'button-bar btn-bar-desktop';

    buttonsConfig.forEach(function (cfg) {
      if (cfg === '|') {
        var div = document.createElement('div');
        div.className = 'divider';
        bar.appendChild(div);
      } else {
        bar.appendChild(create(cfg));
      }
    });

    // ===== MOBILE ACTION SHEET =====
    // Panel & Overlay được gắn vào body để tránh bị nhốt bởi overflow/transform của các thần chứa
    var panel = document.createElement('div');
    panel.className = 'mobile-action-panel';

    buttonsConfig.forEach(function (cfg) {
      if (cfg === '|' || !cfg.text) return;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'mobile-action-item' + (cfg.disabled ? ' is-disabled' : '');
      if (cfg.disabled) item.disabled = true;
      item.innerHTML =
        (cfg.icon ? '<span class="material-symbols-outlined">' + cfg.icon + '</span>' : '') +
        '<span>' + cfg.text + '</span>';
      item.addEventListener('click', function (e) {
        closePanel();
        if (!cfg.disabled && typeof cfg.onClick === 'function') cfg.onClick(e);
      });
      panel.appendChild(item);
    });

    var overlay = document.createElement('div');
    overlay.className = 'mobile-action-overlay';

    // Gắn panel + overlay vào body ngay khi DOM sẵn sàng
    function mountToBody() {
      if (document.body) {
        document.body.appendChild(overlay);
        document.body.appendChild(panel);
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          document.body.appendChild(overlay);
          document.body.appendChild(panel);
        });
      }
    }
    mountToBody();

    function openPanel() {
      // Show first to get dimensions if needed
      panel.classList.add('open');
      overlay.classList.add('open');
      trigger.classList.add('active');

      var rect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();

      var top = rect.bottom + 4;
      if (top + panelRect.height > window.innerHeight && rect.top > panelRect.height) {
        top = rect.top - panelRect.height - 4; // pop upwards
        panel.style.transformOrigin = 'bottom left';
      } else {
        panel.style.transformOrigin = 'top left';
      }

      panel.style.top = top + 'px';

      // Smart positioning for left/right
      if (rect.left < window.innerWidth / 2) {
        // Button is on the left, anchor to the left
        panel.style.left = rect.left + 'px';
        panel.style.right = 'auto';
        panel.style.transformOrigin = panel.style.transformOrigin.replace('right', 'left');
      } else {
        // Button is on the right, anchor to the right
        var rightSpace = window.innerWidth - rect.right;
        panel.style.right = rightSpace + 'px';
        panel.style.left = 'auto';
        panel.style.transformOrigin = panel.style.transformOrigin.replace('left', 'right');
      }
    }
    function closePanel() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      trigger.classList.remove('active');
    }

    overlay.addEventListener('click', closePanel);

    // Nút trigger chỉ hiện trên mobile
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'btn mobile-action-trigger';
    trigger.innerHTML =
      '<span class="material-symbols-outlined">settings</span>' +
      '<span>Thao tác</span>' +
      '<span class="material-symbols-outlined mobile-action-chevron">expand_more</span>';
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.contains('open') ? closePanel() : openPanel();
    });

    // Wrapper đơn giản
    var wrapper = document.createElement('div');
    wrapper.className = 'mobile-action-wrapper';
    wrapper.appendChild(bar);
    wrapper.appendChild(trigger);

    // API công khai: cho phép thêm button config vào action sheet sau khi tạo
    wrapper.addToMobilePanel = function (cfg, insertFirst) {
      // Thêm vào desktop bar
      var btn = create(cfg);
      if (insertFirst) {
        bar.insertBefore(btn, bar.firstChild);
      } else {
        bar.appendChild(btn);
      }

      // Thêm vào mobile panel
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'mobile-action-item' + (cfg.disabled ? ' is-disabled' : '');
      if (cfg.disabled) item.disabled = true;
      item.innerHTML =
        (cfg.icon ? '<span class="material-symbols-outlined">' + cfg.icon + '</span>' : '') +
        '<span>' + cfg.text + '</span>';
      item.addEventListener('click', function (e) {
        closePanel();
        if (!cfg.disabled && typeof cfg.onClick === 'function') cfg.onClick(e);
      });
      if (insertFirst) {
        panel.insertBefore(item, panel.firstChild);
      } else {
        panel.appendChild(item);
      }
    };

    return wrapper;

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
      { text: 'Thêm', icon: 'add', type: 'primary', onClick: actions.onAdd, attrs: 'data-tooltip="Thêm bản ghi mới (Ins)"' },
      { text: 'Xem', icon: 'visibility', type: 'outline-secondary', onClick: actions.onView, attrs: 'data-tooltip="Xem chi tiết bản ghi đã chọn"' },
      { text: 'Sửa', icon: 'edit', type: 'outline-secondary', onClick: actions.onEdit, attrs: 'data-tooltip="Sửa bản ghi đã chọn (F2)"' },
      { text: 'Xóa', icon: 'delete', type: 'outline-danger', onClick: actions.onDelete, attrs: 'data-tooltip="Xóa bản ghi đã chọn (Del)"' },
      { text: 'Lọc', icon: 'filter_alt', type: 'outline-secondary', onClick: actions.onFilter, attrs: 'data-tooltip="Lọc / Tìm kiếm dữ liệu"' },
      { text: 'In', icon: 'print', type: 'outline-secondary', onClick: actions.onPrint, attrs: 'data-tooltip="In danh sách (Ctrl+P)"' },
      { text: 'Đóng', icon: 'close', type: 'outline-secondary', onClick: actions.onClose, attrs: 'data-tooltip="Đóng trang hiện tại"' }
    ];

    if (actions.extras && Array.isArray(actions.extras)) {
      actions.extras.forEach(function (btn) {
        buttons.push(btn);
      });
    }

    var filteredButtons = [];
    buttons.forEach(function (b) {
      if (b.onClick === false) return; // Hide button
      if (b.onClick === 'DISABLED' || b.onClick === 'disabled') {
        b.disabled = true;
        b.onClick = function () {
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
    var isMobile = window.innerWidth <= 768;

    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper ' + (config.className || '');
    // Bỏ viền 2 bên
    wrapper.style.borderRadius = '0';
    wrapper.style.borderTop = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderBottom = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderLeft = 'none';
    wrapper.style.borderRight = 'none';
    // Hỗ trợ scroll ngang trên cả mobile và desktop để xem toàn bộ cột
    wrapper.style.overflowX = 'auto';
    wrapper.style.overflowY = 'auto';

    var table = document.createElement('table');
    table.className = 'data-table';
    // Mobile: để bảng co lại trong viewport; Desktop: bảng rộng theo nội dung
    table.style.width = isMobile ? '100%' : 'max-content';
    table.style.whiteSpace = isMobile ? 'normal' : 'nowrap';
    table.style.tableLayout = isMobile ? 'fixed' : 'auto';

    // Tbody & Thead
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Cập nhật lại style khi resize cửa sổ (responsive)
    window.addEventListener('resize', function () {
      var nowMobile = window.innerWidth <= 768;
      wrapper.style.overflowX = 'auto';
      table.style.width = nowMobile ? '100%' : 'max-content';
      table.style.whiteSpace = nowMobile ? 'normal' : 'nowrap';
      table.style.tableLayout = nowMobile ? 'fixed' : 'auto';
    });

    // Ép style thu gọn khoảng cách (Compact Density) + Sticky Columns
    var styleDensity = document.createElement('style');
    styleDensity.innerHTML = `
      .table-wrapper .data-table th {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
         font-weight: 700 !important;
         background-color: var(--color-surface-elevated, #f1f5f9) !important;
         color: var(--color-text, #1e293b) !important;
      }
      .table-wrapper .data-table td {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
      }
      .table-wrapper .data-table.no-mobile-stack {
        width: max-content !important;
        white-space: nowrap !important;
        table-layout: auto !important;
      }
      /* ── Sticky Columns ── */
      .table-wrapper.has-sticky-cols .data-table td.sticky-col {
        position: sticky !important;
        z-index: 2 !important;
        background: var(--color-surface, #fff);
      }
      /* Header sticky-col cần z-index cao hơn th thường (z-index:10) để không bị che khuất khi scroll */
      .table-wrapper.has-sticky-cols .data-table thead th.sticky-col {
        position: sticky !important;
        z-index: 30 !important;  /* > 10 (th thường) và > resizer z-index: 10 */
        background: var(--color-surface-elevated, #f1f5f9) !important;
      }
      .table-wrapper.has-sticky-cols .data-table th.sticky-col-last,
      .table-wrapper.has-sticky-cols .data-table td.sticky-col-last {
        box-shadow: 2px 0 6px -2px rgba(0,0,0,0.12);
        border-right: 1px solid var(--color-border, #e2e8f0) !important;
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table th.sticky-col,
      body.dark-theme .table-wrapper.has-sticky-cols .data-table td.sticky-col {
        background: var(--color-surface, #1e293b);
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table tbody tr:hover td.sticky-col {
        background: rgba(255,255,255,0.05);
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table tbody tr.active td.sticky-col {
        background-color: var(--color-surface, #1e293b) !important;
        background-image: linear-gradient(var(--color-primary-light, rgba(67,97,238,0.18)), var(--color-primary-light, rgba(67,97,238,0.18))) !important;
      }
      .table-wrapper.has-sticky-cols .data-table tbody tr:hover td.sticky-col {
        background: var(--color-surface-elevated, #f8fafc);
      }
      .table-wrapper.has-sticky-cols .data-table tbody tr.active td.sticky-col {
        background-color: var(--color-surface, #fff) !important;
        background-image: linear-gradient(var(--color-primary-light, rgba(67,97,238,0.06)), var(--color-primary-light, rgba(67,97,238,0.06))) !important;
      }
      @media (max-width: 768px) {
        .table-wrapper .data-table th,
        .table-wrapper .data-table td {
          white-space: normal !important;
          word-break: break-word !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .table-wrapper .data-table.no-mobile-stack th,
        .table-wrapper .data-table.no-mobile-stack td {
          white-space: nowrap !important;
          word-break: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
        .dynamic-grid-card .table-wrapper {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          overflow-x: auto !important;
        }
        .dynamic-grid-card .datagrid-pager {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
        }
        .table-wrapper .data-table th:first-child,
        .table-wrapper .data-table td:first-child {
          padding-left: 16px !important;
        }
        /* Tắt sticky trên mobile để không bị chồng lấp */
        .table-wrapper.has-sticky-cols .data-table th.sticky-col,
        .table-wrapper.has-sticky-cols .data-table td.sticky-col {
          position: static !important;
          box-shadow: none !important;
          border-right: none !important;
        }
      }
    `;
    wrapper.appendChild(styleDensity);

    // Số cột cần sticky (mặc định 0 = tắt)
    var stickyCount = (typeof config.stickyColumns === 'number' && config.stickyColumns > 0) ? config.stickyColumns : 0;
    if (stickyCount > 0) {
      wrapper.classList.add('has-sticky-cols');
    }

    // Tính trước left offset cho từng sticky column từ config width
    // Cach này đồng bộ, không cần đo offsetWidth sau render
    var _stickyOffsets = [];
    if (stickyCount > 0 && config.headers) {
      var _acc = 0;
      for (var _si = 0; _si < Math.min(stickyCount, config.headers.length); _si++) {
        _stickyOffsets.push(_acc);
        var _hdr = config.headers[_si];
        var _w = (_hdr && _hdr.width) ? (parseInt(_hdr.width) || 150) : 150;
        _acc += _w;
      }
    }

    // Hàm cập nhật left offset khi chiều rộng cột thay đổi (VD: column resize)
    function _applyStickyOffsets() {
      if (stickyCount <= 0) return;
      var stickyThs = thead.querySelectorAll('th.sticky-col');
      // Cập nhật _stickyOffsets từ offsetWidth thực tế sau khi user resize cột
      var acc = 0;
      for (var si = 0; si < stickyThs.length; si++) {
        _stickyOffsets[si] = acc;
        stickyThs[si].style.left = acc + 'px';
        stickyThs[si].style.top = '0'; // đảm bảo top luôn có giá trị inline
        acc += stickyThs[si].offsetWidth;
      }
      // Cập nhật left cho tất cả td sticky
      var rows = tbody.querySelectorAll('tr');
      for (var ri = 0; ri < rows.length; ri++) {
        var stickyTds = rows[ri].querySelectorAll('td.sticky-col');
        for (var ci = 0; ci < stickyTds.length; ci++) {
          if (_stickyOffsets[ci] !== undefined) {
            stickyTds[ci].style.left = _stickyOffsets[ci] + 'px';
          }
        }
      }
    }

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

              // Sticky column: gắn class + left ngay khi tạo td (không cần đợi rAF)
              if (stickyCount > 0 && idx < stickyCount) {
                td.classList.add('sticky-col');
                if (idx === stickyCount - 1) td.classList.add('sticky-col-last');
                td.style.left = (_stickyOffsets[idx] || 0) + 'px';
              }

              var val = row[col.field];
              var fieldName = (col.field || '').toLowerCase();
              var headerLabel = (config.headers && config.headers[idx] && config.headers[idx].label ? config.headers[idx].label : '').toLowerCase();

              // Tự động map trạng thái nếu là PersonStatus (để tránh hiển thị số 4, 1, 8 trên lưới)
              if (fieldName === 'personstatus' || headerLabel.includes('trạng thái')) {
                var statusMap = { '1': 'Thử việc', '4': 'Chính thức', '8': 'Nghỉ việc' };
                val = statusMap[String(val)] || val;
              }

              if (fieldName.includes('cmnd') || fieldName.includes('cccd') || fieldName.includes('dienthoai') || fieldName.includes('sohopdong') || fieldName.includes('personid') || fieldName.includes('manhanvien') || fieldName === 'id' || fieldName === 'manv' || headerLabel.includes('cccd') || headerLabel.includes('mã nhân viên') || headerLabel.includes('điện thoại') || headerLabel.includes('hợp đồng')) {
                td.style.color = 'var(--color-primary)';
                td.style.fontWeight = '600';
                td.style.fontVariantNumeric = 'tabular-nums';
              } else if (fieldName.includes('ngay') || fieldName.includes('date') || headerLabel.includes('ngày') || headerLabel.includes('date')) {
                td.style.color = '#475569'; // Slate 600 - subtle and premium for dates
                td.style.fontWeight = '500';
                td.style.fontVariantNumeric = 'tabular-nums'; // Ensures numbers align vertically without looking like a typewriter
              } else if (fieldName.includes('status') || fieldName.includes('trangthai') || headerLabel.includes('trạng thái')) {
                td.style.color = '#10b981';
                td.style.fontWeight = '700';
              }
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
            row.forEach(function (cellStr, idx) {
              var td = document.createElement('td');
              if (stickyCount > 0 && idx < stickyCount) {
                td.classList.add('sticky-col');
                if (idx === stickyCount - 1) td.classList.add('sticky-col-last');
                td.style.left = (_stickyOffsets[idx] || 0) + 'px';
              }
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
          spanTxt.innerText = h.label || h;
          spanTxt.style.pointerEvents = 'none'; // Prevent child interference
          th.appendChild(spanTxt);

          if (h.width) {
            th.style.width = h.width;
            th.style.minWidth = h.width; // Ép cứng chiều rộng ban đầu
          }
          if (h.align) th.style.textAlign = h.align;

          // Sticky column: gắn class + set left và top inline ngay khi tạo th
          // left được tính từ config width (đồng bộ), không cần đợi rAF
          if (stickyCount > 0 && idx < stickyCount) {
            th.classList.add('sticky-col');
            if (idx === stickyCount - 1) th.classList.add('sticky-col-last');
            // Disable drag-to-reorder trên sticky columns
            th.draggable = false;
            th.style.cursor = 'default';
            // Set left và top inline để đảm bảo sticky hoạt động đúng, không bị CSS cascade ảnh hưởng
            th.style.left = (_stickyOffsets[idx] || 0) + 'px';
            th.style.top = '0';
          }

          // --- COLUMN RESIZING LOGIC ---
          th.style.position = 'sticky'; // Cần thiết cho sticky header & neo resizer

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
      // left đã được áp dụng đồng bộ trong renderHead/renderBody.
      // Chỉ gọi _applyStickyOffsets khi cần cập nhật sau resize cột.
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

    // Lấy keys: ưu tiên lọc theo dictionary nếu dictionary không rỗng để chỉ hiện các cột được cấu hình.
    // Nếu dictionary rỗng hoặc không khớp khóa nào, ta mới lấy toàn bộ keys từ data.
    var keys = [];
    var hasDictionary = dictionary && Object.keys(dictionary).length > 0;
    if (hasDictionary) {
      var dataKeys = (data && data.length > 0) ? Object.keys(data[0]) : [];
      Object.keys(dictionary).forEach(function (key) {
        if (dataKeys.length === 0 || dataKeys.indexOf(key) >= 0) {
          keys.push(key);
        }
      });
      if (keys.length === 0) {
        keys = dataKeys;
      }
    } else if (data && data.length > 0) {
      keys = Object.keys(data[0]);
    }

    if (keys.length > 0) {
      keys.forEach(function (key) {
        if (key === 'id' || key === 'Id') return;
        if (key.startsWith('_')) return;

        var headerLabel = dictionary[key] || key;
        var header = { label: headerLabel, sortable: true, field: key };
        var col = { field: key };

        // Default render: JSON-aware or Tooltip
        col.render = function (v) {
          if (v == null || v === '') return '';
          var str = String(v).trim();
          if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
            try {
              var parsed = JSON.parse(str);
              if (parsed && typeof parsed === 'object') {
                return (function renderParsedJson(parsed) {
                  if (Array.isArray(parsed)) {
                    if (parsed.length === 0) return '<span style="color: var(--color-text-muted, #94a3b8); font-style: italic;">Trống</span>';

                    // Check if it's a schedule (BatDau/KetThuc/NoiDung/Sanh)
                    var isSchedule = parsed.some(function (item) {
                      return item && (item.BatDau !== undefined || item.KetThuc !== undefined || item.Sanh !== undefined || item.NoiDung !== undefined);
                    });

                    // Check if it's payment (STT/SoTien/Ngay/NoiDung)
                    var isPayment = parsed.some(function (item) {
                      return item && (item.STT !== undefined || item.SoTien !== undefined || item.Ngay !== undefined || item.NoiDung !== undefined);
                    });

                    if (isSchedule) {
                      var html = '<div class="json-schedule-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; padding: 2px 0;">';
                      parsed.forEach(function (item) {
                        var timeStr = (item.BatDau || '') + (item.KetThuc ? ' - ' + item.KetThuc : '');
                        var hallStr = item.Sanh ? '<span style="background: rgba(59, 130, 246, 0.18); color: var(--color-primary, #4361ee); border-radius: 4px; padding: 1px 4px; font-weight: 600; margin-right: 4px;">' + item.Sanh + '</span>' : '';
                        var timeBadge = timeStr ? '<span style="background: rgba(16, 185, 129, 0.18); color: var(--color-success, #10b981); border-radius: 4px; padding: 1px 4px; font-weight: 600; margin-right: 4px; white-space: nowrap;">' + timeStr + '</span>' : '';
                        var contentStr = item.NoiDung ? '<span style="color: var(--color-text, inherit); font-weight: 500;">' + item.NoiDung + '</span>' : '';
                        html += '<div class="schedule-row" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">' + timeBadge + hallStr + contentStr + '</div>';
                      });
                      html += '</div>';
                      return html;
                    }

                    if (isPayment) {
                      var html = '<div class="json-payment-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; padding: 2px 0;">';
                      parsed.forEach(function (item) {
                        var sttStr = item.STT ? '<span style="background: rgba(124, 58, 237, 0.18); color: var(--color-secondary, #7c3aed); border-radius: 4px; padding: 1px 4px; font-weight: 600; margin-right: 4px;">Đợt ' + item.STT + '</span>' : '';
                        var moneyStr = item.SoTien ? '<span style="color: var(--color-danger, #ef4444); font-weight: 600; margin-right: 4px;">' + item.SoTien + '</span>' : '';
                        var dateStr = item.Ngay ? '<span style="color: var(--color-text-secondary); margin-right: 4px;">(' + item.Ngay + ')</span>' : '';
                        var contentStr = item.NoiDung ? '<span style="color: var(--color-text, inherit); font-style: italic;">' + item.NoiDung + '</span>' : '';
                        html += '<div class="payment-row" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">' + sttStr + moneyStr + dateStr + contentStr + '</div>';
                      });
                      html += '</div>';
                      return html;
                    }

                    // Generic simple array
                    var isSimpleArray = parsed.every(function (item) {
                      return typeof item !== 'object';
                    });
                    if (isSimpleArray) {
                      return parsed.join(', ');
                    }

                    // Generic complex array
                    var html = '<div class="json-generic-table" style="font-size: 11px; display: flex; flex-direction: column; gap: 2px; color: var(--color-text, inherit);">';
                    parsed.forEach(function (item) {
                      var itemHtml = [];
                      for (var k in item) {
                        if (item.hasOwnProperty(k)) {
                          itemHtml.push('<strong>' + k + ':</strong> ' + item[k]);
                        }
                      }
                      html += '<div style="border-bottom: 1px dashed var(--color-border); padding-bottom: 2px;">' + itemHtml.join(' | ') + '</div>';
                    });
                    html += '</div>';
                    return html;
                  } else {
                    // Single object
                    var html = '<div class="json-generic-object" style="font-size: 11px; display: flex; flex-direction: column; gap: 2px;">';
                    for (var k in parsed) {
                      if (parsed.hasOwnProperty(k)) {
                        html += '<div><strong>' + k + ':</strong> ' + parsed[k] + '</div>';
                      }
                    }
                    html += '</div>';
                    return html;
                  }
                })(parsed);
              }
            } catch (e) {
              // Ignore and fallback
            }
          }
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
        if ((keyLower.indexOf('date') >= 0 || keyLower.indexOf('ngày') >= 0 || keyLower.indexOf('ngay') >= 0) && keyLower.indexOf('songay') === -1 && keyLower.indexOf('so_ngay') === -1) {
          header.align = 'center';
          col.align = 'center';
          col.render = function (v) { return typeof FormatUtils !== 'undefined' ? FormatUtils.date(v) : v; };
        }

        // Custom renderer (nếu truyền vào)
        if (options.actionRenderers && options.actionRenderers[key]) {
          var customRender = options.actionRenderers[key];
          col.render = function (v, row) { return customRender(v, row, key); };
        } else if (options.actionRenderers && options.actionRenderers[headerLabel]) {
          // Hoặc kiểm tra theo label tiếng Việt nếu dev truyền key là label
          var customRenderLabel = options.actionRenderers[headerLabel];
          col.render = function (v, row) { return customRenderLabel(v, row, key); };
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
      className: options.className,
      // Mặc định sticky 2 cột đầu (Mã NV + Họ tên), có thể override qua options.stickyColumns
      stickyColumns: (typeof options.stickyColumns === 'number') ? options.stickyColumns : 2
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
        var checkbox = tr.querySelector('.df-row-checkbox');
        if (checkbox) checkbox.checked = tr.classList.contains('active');

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
      if (e.pointerType === 'touch') return; // Không vuốt chọn bằng cảm ứng để nhường cho cuộn tự nhiên trên mobile

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
    var activeParent = parents.find(function (p) { return p.id === defaultParentId; }) || parents[0];

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
      var children = childrenMap[parentItem.id] || [];

      // ─ Parent button ─
      var pBtn = _buildParentBtn(parentItem, isParentActive, children.length, isDraggable);
      parentBar.appendChild(pBtn);

      // ─ Child section ─
      var childSection = document.createElement('div');
      childSection.className = 'ui-nested-tabs__section' + (isParentActive ? ' active' : '');
      childSection.dataset.sectionId = parentItem.id;

      if (children.length > 0) {
        var defaultChildId = isParentActive ? (options.defaultChildId || children[0].id) : children[0].id;

        var childBar = document.createElement('div');
        childBar.className = 'ui-nested-tabs__child-bar';

        var panelArea = document.createElement('div');
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
        id: row.MenuID || row.id || row.menuId,
        parent: row.Parent || row.parent || row.parentId || '',
        label: row.VN || row.label || row.name || row.Label || '(Không tên)',
        labelEN: row.EN || row.en || '',
        icon: row.IconClass || row.icon || '',
        formName: row.FormName || row.formName || ''
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
    btn.dataset.childId = childItem.id;
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
    var dragging = null;  // phần tử đang kéo
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
      var rect = target.getBoundingClientRect();
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
      var panel = panelArea.querySelector('#nested-panel-' + childId);
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
    var activeParent = parents.find(function (p) { return p.id === defaultParentId; }) || parents[0];
    var defaultChildId = options.defaultChildId || null;

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

        allSidebarBtns.forEach(function (b) { b.classList.remove('active'); });
        allContentPanels.forEach(function (p) { p.classList.remove('active'); });

        pBtn.classList.add('active');

        if (!isPanelActive) {
          parentPanel.classList.add('active');
          if (childList) childList.classList.add('open');

          var curr = parentGroup.parentElement;
          while (curr && curr.classList.contains('ui-nested-tabs__child-list')) {
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
    var dragging = null;
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
      var rect = target.getBoundingClientRect();
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

    childList.addEventListener('dragend', function (e) { e.stopPropagation(); _vCleanup(); });

    function _vCleanup() {
      if (dragging) { dragging.classList.remove('ui-nested-dragging'); dragging = null; }
      if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    }
  }

  // ── Drag dọc cho parent groups ───────────────────────────
  function _attachVerticalDragParent(sidebar, options) {
    var dragging = null;
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
      var rect = target.getBoundingClientRect();
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

    sidebar.addEventListener('dragend', function (e) { e.stopPropagation(); _vpCleanup(); });

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
    create: create,
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
    setTimeout(function () {
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

    steps.forEach(function (step, index) {
      var stepDiv = document.createElement('div');
      stepDiv.className = 'ui-step';

      if (index < currentStepIndex) {
        stepDiv.classList.add('completed');
      } else if (index === currentStepIndex) {
        stepDiv.classList.add('active');
      }

      // Allow clicking if callback is provided
      if (step.onClick) {
        stepDiv.style.cursor = 'pointer';
        stepDiv.addEventListener('click', function () {
          step.onClick(index);
        });
      }

      var circle = document.createElement('div');
      circle.className = 'ui-step-circle';
      if (index < currentStepIndex) {
        circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">check</span>';
      } else {
        if (step.icon) {
          circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">' + step.icon + '</span>';
        } else {
          circle.innerText = (index + 1);
        }
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

    events.forEach(function (ev) {
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
    wrapper.addEventListener('dragover', function (e) {
      wrapper.classList.add('dragover');
    });

    wrapper.addEventListener('dragleave', function (e) {
      wrapper.classList.remove('dragover');
    });

    wrapper.addEventListener('drop', function (e) {
      wrapper.classList.remove('dragover');
    });

    if (typeof config.onChange === 'function') {
      input.addEventListener('change', function (e) {
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

    items.forEach(function (item) {
      if (item === '|') {
        var div = document.createElement('div');
        div.className = 'context-menu-divider';
        menu.appendChild(div);
      } else {
        var btn = document.createElement('div');
        btn.className = 'context-menu-item';

        var iconHtml = item.icon ? '<span class="material-symbols-outlined">' + item.icon + '</span>' : '';
        btn.innerHTML = iconHtml + '<span style="white-space: nowrap;">' + item.label + '</span>';

        btn.onclick = function () {
          hide();
          if (typeof item.onClick === 'function') item.onClick();
        };

        menu.appendChild(btn);
      }
    });

    document.body.appendChild(menu);
    currentMenu = menu;

    // Tính toán và điều chỉnh vị trí để không bị khuất màn hình (Edge detection)
    requestAnimationFrame(function () {
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

    header.addEventListener('click', function () {
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

    nodes.forEach(function (node) {
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
        nodeWrapper.addEventListener('click', function () {
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
 * Sinh lịch công việc cơ bản bằng JS. Không dùng thư viện nặng.
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

      titleContainer.onclick = function () {
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
        dropdown.onclick = function (ev) { ev.stopPropagation(); };

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

        btnPrevYear.onclick = function () { tempYear--; yearLabel.innerText = tempYear; loadSummaryAndRender(); };
        btnNextYear.onclick = function () { tempYear++; yearLabel.innerText = tempYear; loadSummaryAndRender(); };

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
            mBtn.onclick = function () {
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
            config.onLoadYearSummary(tempYear).then(function (s) {
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
        overlay.onclick = function () { document.body.removeChild(overlay); };
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
      btnPrev.onclick = function () {
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
      btnToday.onclick = function () {
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
      btnNext.onclick = function () {
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

      ['TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7', 'CN'].forEach(function (d) {
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
          parts.forEach(function (p) {
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

        empty.onclick = (function (d, pY, pM) {
          return function () {
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

          dayEvents.forEach(function (e) {
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

        dayCell.onclick = (function (d, evts) {
          return function () {
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

        emptyEnd.onclick = (function (d, nY, nM) {
          return function () {
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

    wrapper.updateEvents = function (newEvents) {
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

    slider.addEventListener('input', function (e) {
      updateDisplay(e.target.value);
    });

    if (typeof config.onChange === 'function') {
      slider.addEventListener('change', function (e) {
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
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('ui-toast-container')) {
      container = document.createElement('div');
      container.id = 'ui-toast-container';
      document.body.appendChild(container);
    } else {
      container = document.getElementById('ui-toast-container');
    }
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
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    // Tự động tắt sau 3 giây
    setTimeout(function () {
      toast.classList.remove('show');
      // Đợi animation chạy xong rồi xóa node
      setTimeout(function () {
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
    requestAnimationFrame(function () {
      popover.classList.add('show');
    });

    currentPopover = popover;

    // Click outside to hide
    setTimeout(function () { // Delay xíu để không bắt nhầm sự kiện click hiện tại
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
      $btnHamburger.addEventListener('click', function () {
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

  var CACHE_KEY = window.APP_SETTINGS ? APP_SETTINGS.storageKey('nav_cache') : 'pmql_nav_cache';
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

    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    var groupId = MetadataModuleConfig.getUserGroupId(u);

    // Thử load từ cache giống Navbar
    try {
      var cached = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem(CACHE_KEY)) || 'null');
      if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
        NAV_CONFIG = cached.config;
        _doRender(container);
        return;
      }
    } catch (e) { }

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
            var cachePayload = JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records
            });
            if (window.APP_SETTINGS) APP_SETTINGS.setSession('nav_cache', cachePayload); else sessionStorage.setItem(CACHE_KEY, cachePayload);
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
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
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

  input.addEventListener('keydown', function (e) {
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
    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        self.hide();
      });
    });

    this.overlay.addEventListener('click', function () {
      self.hide();
    });
  }

  SidePanel.prototype.show = function () {
    var self = this;
    this.panel.style.display = 'flex';
    this.overlay.classList.add('show');
    // Tiny delay to allow display:flex to register before animation
    setTimeout(function () {
      self.panel.classList.add('show');
    }, 10);
  };

  SidePanel.prototype.hide = function () {
    var self = this;
    this.overlay.classList.remove('show');
    this.panel.classList.remove('show');
    // Wait for transition to finish before display:none
    setTimeout(function () {
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
    btn.onmouseover = function () { if (!btn.classList.contains('active')) btn.style.background = '#F3F4F6'; };
    btn.onmouseout = function () { if (!btn.classList.contains('active')) btn.style.background = 'transparent'; };
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

      var btnRect = createToolbarBtn('crop_square', 'Vẽ khung đỏ', function () {
        isShapeModeActive = true;
        btnRect.style.background = '#E0E7FF';
        btnRect.style.color = '#4F46E5';
        btnRect.classList.add('active');
        overlayCanvas.style.cursor = 'crosshair';
      });

      var btnCopy = createToolbarBtn('content_copy', 'Copy (Ctrl+C)', function () {
        captureAndAction();
      });
      btnCopy.style.color = '#10B981';

      var btnClose = createToolbarBtn('close', 'Hủy (ESC)', function () {
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
        ctx.fillRect(ww / 2 - 150, 20, 300, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn và kéo chuột để chọn vùng', ww / 2, 45);
      }
    } else if (mode === 'draw') {
      ctx.clearRect(currentRect.left, currentRect.top, currentRect.width, currentRect.height);
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(currentRect.left, currentRect.top, currentRect.width, currentRect.height);

      ctx.strokeStyle = '#EF4444'; // Red
      ctx.lineWidth = 3;

      shapes.forEach(function (s) {
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
    rafId = requestAnimationFrame(function () {
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

    shapes.forEach(function (s) {
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
    var timeoutId = setTimeout(function () {
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
      }).then(function (canvas) {
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

        canvas.toBlob(function (blob) {
          if (!blob) return fallbackDownload();
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function () {
              if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ảnh!', 'success');
            }).catch(function () { fallbackDownload(); });
          } else {
            fallbackDownload();
          }
        });
      }).catch(function () {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeoutId);
        if (shapeContainer.parentNode) document.body.removeChild(shapeContainer);
      });
    } catch (err) {
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

      var fetchFields = function (formName) {
        if (!formName) return;
        if (typeof ApiClient !== 'undefined') {
          btnLoadFields.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang tải...';
          ApiClient.post('/api/API_DanhSachTruongGiaoDien', { FormName: formName, Username: 'admin', Limit: 1000 })
            .then(function (res) {
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              fields = res.list || res.records || res.data || res || [];
              if (Array.isArray(fields) && fields.length > 0) {
                var allSelects = conditionsList.querySelectorAll('select.field-select');
                allSelects.forEach(function (sel) { populateFieldSelect(sel, fields); });
                txtFormName.style.borderColor = 'var(--color-success)';
              } else {
                txtFormName.style.borderColor = 'var(--color-danger)';
                Alert.warning('Lỗi', 'Không tìm thấy cột nào cho form: ' + formName);
              }
            }).catch(function (e) {
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              console.error('Lỗi load cột', e);
            });
        }
      };

      btnLoadFields.onclick = function () { fetchFields(txtFormName.value.trim()); };

      // Phân tích cú pháp rule hiện tại
      var parseRule = function (ruleStr) {
        if (!ruleStr) return [];
        var isOr = ruleStr.includes('|');
        var parts = ruleStr.split(isOr ? '|' : '&');
        return parts.map(function (p) {
          var operator = p.includes('!=') ? '!=' : '=';
          var kv = p.split(operator);
          return { field: kv[0], operator: operator, value: kv[1] || '' };
        }).filter(function (r) { return r.field !== ''; });
      };

      var rules = parseRule(currentRule);
      if (rules.length === 0) rules.push({ field: '', operator: '=', value: '' });

      var renderRow = function (r) {
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
        delBtn.onclick = function () { conditionsList.removeChild(row); };

        row.appendChild(fieldSelect);
        row.appendChild(opSelect);
        row.appendChild(valInput);
        row.appendChild(delBtn);

        conditionsList.appendChild(row);
        return fieldSelect;
      };

      rules.forEach(function (r) { renderRow(r); });

      var addBtnWrapper = document.createElement('div');
      addBtnWrapper.innerHTML = UIButton.createHTML({ text: 'Thêm điều kiện', type: 'secondary', icon: 'add' });
      var addBtn = addBtnWrapper.firstElementChild;
      addBtn.style.width = '100%';
      addBtn.onclick = function () {
        var fs = renderRow({ field: '', operator: '=', value: '' });
        populateFieldSelect(fs, fields);
      };
      body.appendChild(addBtn);

      var populateFieldSelect = function (selectEl, fieldData) {
        selectEl.innerHTML = '<option value="">-- Chọn cột --</option>';
        fieldData.forEach(function (f) {
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
      footer.querySelector('.btn-cancel-rule').onclick = function () {
        ruleModal.closeNow();
      };

      footer.querySelector('.btn-save-rule').onclick = function () {
        var finalRules = [];
        var rows = conditionsList.children;
        for (var i = 0; i < rows.length; i++) {
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


/* --- MetadataModuleConfig.js --- */
/**
 * Shared metadata-first helpers for dynamic HR modules.
 * Business values stay in database metadata; JavaScript only supplies behavior.
 */
window.MetadataModuleConfig = (function () {
  var BRANCH_PREFIX_FIELDS = [
    'PersonIDPrefix', 'EmployeePrefix', 'BranchPrefix',
    'MaVietTat', 'ShortCode', 'BranchCode'
  ];

  var FIELD_CONFIG_FACTORIES = {
    usergroupid: function () {
      return {
        renderRule: 'sl',
        dataSource: getEndpoint('PERMISSIONS.GET_GROUP_LIST'),
        dataSourceMethod: 'GET',
        valueField: 'id',
        labelField: 'name',
        allowCustomValue: false
      };
    }
  };

  function _readStoredBranches() {
    try {
      var raw = window.APP_SETTINGS
        ? window.APP_SETTINGS.getStored('sys_branches', '[]')
        : window.localStorage.getItem('pmql_sys_branches');
      var rows = JSON.parse(raw || '[]');
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return [];
    }
  }

  function _readValueIgnoreCase(row, fieldName) {
    if (!row) return '';
    var key = Object.keys(row).find(function (candidate) {
      return candidate.toLowerCase() === fieldName.toLowerCase();
    });
    return key && row[key] != null ? String(row[key]).trim() : '';
  }

  function getEndpoint(path) {
    var value = window.API_CONFIG && window.API_CONFIG.ENDPOINTS;
    String(path || '').split('.').forEach(function (segment) {
      value = value && value[segment];
    });
    return typeof value === 'string' ? value : '';
  }

  function getFieldConfig(fieldName) {
    var factory = FIELD_CONFIG_FACTORIES[String(fieldName || '').trim().toLowerCase()];
    return factory ? factory() : {};
  }

  function getUserGroupId(user) {
    var source = user || {};
    return String(
      source.UserGroupID || source.userGroupID || source.userGroupId ||
      source.GroupID || source.Group || source.GroupUser || source.NhomQuyen || ''
    ).trim();
  }

  function isAdminUser(user) {
    var source = user || {};
    if (source.IsAdmin === true || source.IsAdmin === 1 || String(source.IsAdmin).toLowerCase() === 'true') {
      return true;
    }
    var groupId = getUserGroupId(source).toLowerCase();
    var configuredGroups = window.APP_SETTINGS && Array.isArray(window.APP_SETTINGS.adminGroupIds)
      ? window.APP_SETTINGS.adminGroupIds
      : [];
    return configuredGroups.some(function (configuredId) {
      return String(configuredId).trim().toLowerCase() === groupId;
    });
  }

  function resolveBranchPrefix(branchId) {
    var normalizedId = String(branchId || '').trim();
    if (!normalizedId) return '';

    var branch = _readStoredBranches().find(function (row) {
      return _readValueIgnoreCase(row, 'BranchID').toUpperCase() === normalizedId.toUpperCase();
    });

    for (var i = 0; branch && i < BRANCH_PREFIX_FIELDS.length; i++) {
      var prefix = _readValueIgnoreCase(branch, BRANCH_PREFIX_FIELDS[i]);
      if (prefix) return prefix;
    }

    return '';
  }

  function _derivePrefix(rows, idField) {
    var counts = {};
    (rows || []).forEach(function (row) {
      var value = _readValueIgnoreCase(row, idField).toUpperCase();
      var match = value.match(/^[^0-9]+/);
      var prefix = match ? match[0].trim() : '';
      if (prefix) counts[prefix] = (counts[prefix] || 0) + 1;
    });

    return Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    })[0] || '';
  }

  function createSequentialIdResolver(options) {
    var config = options || {};
    return function (branchId, apiUrl, currentUser, callback) {
      var metadataPrefix = typeof config.resolvePrefix === 'function'
        ? config.resolvePrefix(branchId)
        : resolveBranchPrefix(branchId);
      var normalizedBranchId = String(branchId || '').trim();

      if (!normalizedBranchId) {
        callback(null, '', new Error('Khong tim thay ma viet tat cua chi nhanh'));
        return;
      }

      var filter = {};
      if (metadataPrefix) {
        filter[config.prefixFilter || 'PersonIDPrefix'] = metadataPrefix;
      } else {
        filter[config.branchFilter || 'BranchID'] = normalizedBranchId;
      }
      window.ApiClient.post(apiUrl, {
        List: config.formName,
        FormName: config.formName,
        Func: 'View',
        Limit: config.limit || 9999,
        UserName: currentUser,
        JsonData: JSON.stringify(filter)
      }).then(function (res) {
        var list = res.list || res.records || res.data || [];
        var idField = config.idField || 'PersonID';
        var prefix = metadataPrefix || _derivePrefix(list, idField) || normalizedBranchId;
        var usedNumbers = [];

        list.forEach(function (row) {
          var value = _readValueIgnoreCase(row, idField).toUpperCase();
          if (value.indexOf(prefix.toUpperCase()) !== 0) return;
          var sequence = parseInt(value.substring(prefix.length), 10);
          if (!isNaN(sequence) && sequence > 0) usedNumbers.push(sequence);
        });

        usedNumbers.sort(function (a, b) { return a - b; });
        var next = 1;
        for (var i = 0; i < usedNumbers.length; i++) {
          if (usedNumbers[i] === next) next++;
          else if (usedNumbers[i] > next) break;
        }

        callback(prefix + String(next).padStart(config.sequenceLength || 3, '0'), prefix, null);
      }).catch(function (error) {
        callback(null, prefix, error);
      });
    };
  }

  return {
    getEndpoint: getEndpoint,
    getFieldConfig: getFieldConfig,
    getUserGroupId: getUserGroupId,
    isAdminUser: isAdminUser,
    resolveBranchPrefix: resolveBranchPrefix,
    createSequentialIdResolver: createSequentialIdResolver
  };
})();


/* --- WizardForm.js --- */
/**
 * WizardForm — Multi-Step Add Form
 * ─────────────────────────────────────────────────────────
 * Kích hoạt bằng cách thêm WizardSteps vào MODULE_CONFIG
 * khi khai báo module trong APP_MODULES hoặc qua API:
 *
 *   WizardSteps: [
 *     { label: 'Cơ bản',    icon: 'person',      description: 'Thông tin cơ bản', fields: ['HoTen','BoPhan','ChucVu','ChucDanhChuyenMon','NgayNhanViec'] },
 *     { label: 'Cá nhân',   icon: 'badge',       description: 'Thông tin cá nhân', fields: ['NgaySinh','CCCD','DienThoai','DiaChi'] },
 *     { label: 'Hợp đồng',  icon: 'description', description: 'Thông tin hợp đồng', fields: ['LoaiHD','LuongCoBan','NganHang'] },
 *     { label: 'Xác nhận',  icon: 'fact_check',  description: 'Kiểm tra & xác nhận', fields: [] }
 *   ]
 *
 * Config mới:
 *   - config.userBranches  : Array chi nhánh user được gán  [{ id:'VP', name:'Văn Phòng' }, ...]
 *   - config.moduleConfig.wizardHooks.resolveAutoId : resolver dùng metadata/dữ liệu hiện hữu
 *   - config.moduleConfig.ApiSearch       : endpoint để query PersonID list
 *
 * File này export hàm WizardForm.open(config) để DynamicFormEngine gọi.
 */
var WizardForm = (function () {

  // ── BRANCH_DISPLAY removed (moved to config if needed) ──

  // ── CSS Inject (chỉ inject 1 lần) ───────────────────────────────────────
  var _cssInjected = false;
  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    var style = document.createElement('style');
    style.id = 'wizard-form-css';
    style.textContent = [
      /* ── Animations ─────────────────────────────────────────────── */
      '@keyframes wz-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes wz-slidein { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }',
      '@keyframes wz-pop { 0%{transform:scale(0.85);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }',
      '@keyframes wz-spin { to { transform:rotate(360deg); } }',
      '@keyframes wz-badge-in { from{opacity:0;transform:scale(0.7) translateY(-4px)} to{opacity:1;transform:scale(1) translateY(0)} }',

      /* ── Overlay & Dialog ────────────────────────────────────────── */
      '.wz-overlay { position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px; animation:wz-fadein 0.2s ease; backdrop-filter:blur(2px); }',
      '.wz-dialog { background:var(--color-surface); border-radius:var(--radius-lg,16px); box-shadow:0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06); width:min(840px,95vw); max-height:90vh; display:flex; flex-direction:column; overflow:hidden; animation:wz-fadein 0.28s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Header ─────────────────────────────────────────────────── */
      '.wz-header { padding:20px 28px 16px; border-bottom:1px solid var(--color-border); flex-shrink:0; }',
      '.wz-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; gap:12px; }',
      '.wz-title { margin:0; font-size:16px; font-weight:700; color:var(--color-text); display:flex; align-items:center; gap:8px; }',
      '.wz-title-icon { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.wz-title-icon .material-symbols-outlined { font-size:18px; color:#fff; }',
      '.wz-close { background:none; border:none; cursor:pointer; color:var(--color-text-secondary); display:flex; align-items:center; padding:6px; border-radius:8px; transition:color 0.15s,background 0.15s; flex-shrink:0; }',
      '.wz-close:hover { background:var(--color-background); color:var(--color-text); }',

      /* ── Stepper ─────────────────────────────────────────────────── */
      '.wz-stepper { display:flex; align-items:flex-start; gap:0; }',
      '.wz-step-item { display:flex; align-items:flex-start; flex:1; min-width:0; }',
      '.wz-step-node { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }',
      '.wz-step-circle { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; border:2px solid var(--color-border-strong,#374151); background:var(--color-surface); color:var(--color-text-secondary); transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }',
      '.wz-step-circle.active { background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); border-color:var(--color-primary); color:#fff; box-shadow:0 4px 14px rgba(79,70,229,0.35); transform:scale(1.08); }',
      '.wz-step-circle.done { background:var(--color-success,#10b981); border-color:var(--color-success,#10b981); color:#fff; }',
      '.wz-step-label { font-size:11px; font-weight:500; color:var(--color-text-secondary); white-space:nowrap; transition:color 0.25s; }',
      '.wz-step-label.active { color:var(--color-primary); font-weight:700; }',
      '.wz-step-label.done { color:var(--color-success,#10b981); }',
      '.wz-step-line { flex:1; height:2px; margin:18px 6px 0; background:var(--color-border-strong,#374151); transition:background 0.35s; min-width:12px; }',
      '.wz-step-line.done { background:var(--color-success,#10b981); }',

      /* ── Body ────────────────────────────────────────────────────── */
      '.wz-body { flex:1; overflow-y:auto; padding:22px 28px; scrollbar-width:thin; }',
      '.wz-body::-webkit-scrollbar { width:5px; }',
      '.wz-body::-webkit-scrollbar-thumb { background:var(--color-border); border-radius:4px; }',

      /* ── Step header ─────────────────────────────────────────────── */
      '.wz-step-header { margin-bottom:18px; display:flex; align-items:center; gap:10px; }',
      '.wz-step-header-icon { width:36px; height:36px; border-radius:10px; background:rgba(79,70,229,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.wz-step-header-icon .material-symbols-outlined { font-size:20px; color:var(--color-primary); }',
      '.wz-step-title { font-size:15px; font-weight:700; color:var(--color-text); margin-bottom:2px; }',
      '.wz-step-desc { font-size:12px; color:var(--color-text-secondary); }',

      /* ── Section divider trong form ─────────────────────────────── */
      '.wz-section-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--color-text-secondary); padding:4px 0; margin-bottom:4px; border-bottom:1px solid var(--color-border); width:100%; }',

      /* ── Fields Grid Responsive ───────────────────────────────────────── */
      '.wz-fields-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px 20px; }',
      '.wz-fields-grid .df-col-12 { grid-column:1 / -1; }',
      '.wz-fields-grid .df-col-6 { grid-column:span 1; }',
      '.wz-fields-grid .df-section { grid-column:1 / -1; }',
      '@media (max-width:560px) { .wz-fields-grid { grid-template-columns:1fr; } .wz-fields-grid .df-col-6 { grid-column:1 / -1; } }',

      /* ── Branch picker ───────────────────────────────────────────── */
      '.wz-branch-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }',
      '.wz-branch-card { border:2px solid var(--color-border); border-radius:12px; padding:14px 12px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); background:var(--color-background); }',
      '.wz-branch-card:hover { border-color:var(--color-primary); background:rgba(79,70,229,0.05); transform:translateY(-2px); box-shadow:0 4px 12px rgba(79,70,229,0.15); }',
      '.wz-branch-card.selected { border-color:var(--color-primary); background:rgba(79,70,229,0.08); box-shadow:0 0 0 3px rgba(79,70,229,0.18), 0 4px 14px rgba(79,70,229,0.2); transform:translateY(-2px); }',
      '.wz-branch-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }',
      '.wz-branch-card.selected .wz-branch-icon { transform:scale(1.1); }',
      '.wz-branch-icon .material-symbols-outlined { font-size:22px; color:#fff; }',
      '.wz-branch-name { font-size:13px; font-weight:600; color:var(--color-text); text-align:center; }',
      '.wz-branch-code { font-size:11px; font-weight:500; color:var(--color-text-secondary); font-family:monospace; }',
      '.wz-branch-check { width:18px; height:18px; border-radius:50%; background:var(--color-primary); display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0); transition:all 0.2s; }',
      '.wz-branch-card.selected .wz-branch-check { opacity:1; transform:scale(1); }',
      '.wz-branch-check .material-symbols-outlined { font-size:12px; color:#fff; }',

      /* ── PersonID badge ─────────────────────────────────────────── */
      '.wz-id-box { background:var(--color-background); border:1px solid var(--color-border); border-radius:10px; padding:14px 18px; display:flex; align-items:center; gap:12px; margin-top:2px; }',
      '.wz-id-loading { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--color-text-secondary); }',
      '.wz-id-badge { animation:wz-badge-in 0.35s cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; gap:10px; }',
      '.wz-id-value { font-size:22px; font-weight:800; font-family:monospace; letter-spacing:0.04em; color:var(--color-primary); }',
      '.wz-id-tag { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:3px 8px; border-radius:20px; background:rgba(79,70,229,0.12); color:var(--color-primary); }',
      '.wz-id-hint { font-size:11px; color:var(--color-text-secondary); margin-top:4px; }',

      /* ── Review grid ─────────────────────────────────────────────── */
      '.wz-review-wrap { display:flex; flex-direction:column; gap:16px; }',
      '.wz-review-section { border:1px solid var(--color-border); border-radius:10px; overflow:hidden; }',
      '.wz-review-section-title { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:var(--color-text-secondary); padding:10px 14px; background:var(--color-background); border-bottom:1px solid var(--color-border); display:flex; align-items:center; gap:6px; }',
      '.wz-review-section-title .material-symbols-outlined { font-size:15px; color:var(--color-primary); }',
      '.wz-review-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--color-border); }',
      '.wz-review-cell { background:var(--color-surface); padding:10px 14px; display:flex; flex-direction:column; gap:3px; }',
      '.wz-review-cell.full { grid-column:1 / -1; }',
      '.wz-review-label { font-size:11px; color:var(--color-text-secondary); font-weight:500; }',
      '.wz-review-value { font-size:13px; color:var(--color-text); font-weight:600; word-break:break-word; }',
      '.wz-review-value.mono { font-family:monospace; color:var(--color-primary); font-size:14px; }',

      /* ── Footer ─────────────────────────────────────────────────── */
      '.wz-footer { padding:16px 28px; border-top:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; background:var(--color-surface); flex-shrink:0; }',
      '.wz-step-info { font-size:12px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px; }',
      '.wz-step-info-dots { display:flex; gap:5px; }',
      '.wz-step-dot { width:7px; height:7px; border-radius:50%; background:var(--color-border); transition:all 0.25s; }',
      '.wz-step-dot.active { background:var(--color-primary); width:20px; border-radius:4px; }',
      '.wz-step-dot.done { background:var(--color-success,#10b981); }',
      '.wz-btn-group { display:flex; gap:10px; }',

      /* ── Progress bar ────────────────────────────────────────────── */
      '.wz-progress { height:3px; background:var(--color-border); position:relative; flex-shrink:0; }',
      '.wz-progress-bar { height:100%; background:linear-gradient(90deg,var(--color-primary),var(--color-primary-dark,#4338ca)); transition:width 0.4s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Slide animation ─────────────────────────────────────────── */
      '.wz-body .wz-step-content { animation:wz-slidein 0.22s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Empty state ────────────────────────────────────────────── */
      '.wz-no-branch { text-align:center; padding:32px 20px; color:var(--color-text-secondary); }',
      '.wz-no-branch .material-symbols-outlined { font-size:40px; display:block; margin-bottom:8px; opacity:0.4; }',

      /* ── Form group compact ─────────────────────────────────────── */
      '.wz-fields-grid .form-group { margin-bottom:0; width:100% !important; }',
      '.wz-fields-grid > div { width:100% !important; min-width:0; }',
      '.wz-fields-grid .form-control, .wz-fields-grid input, .wz-fields-grid select, .wz-fields-grid textarea { width:100% !important; box-sizing:border-box; }',
      '.wz-fields-grid .combo-box-wrapper, .wz-fields-grid .select2-container { width:100% !important; }',

      /* ── Avatar Layout ───────────────────────────────────────────── */
      '.wz-step-body-wrapper { display:flex; gap:24px; align-items:flex-start; margin-top:16px; }',
      '.wz-avatar-col { width:120px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:14px; margin-top:4px; }',
      '.wz-avatar-frame { width:104px; height:104px; border-radius:50%; overflow:hidden; border:2px solid var(--color-primary,#4338ca); box-shadow:0 4px 12px rgba(67,56,202,0.12); display:flex; justify-content:center; align-items:center; background:#f8fafc; cursor:pointer; transition:transform 0.2s ease; }',
      '.wz-avatar-frame:hover { transform:scale(1.05); }',
      '.wz-avatar-btn { border-radius:16px; font-weight:600; font-size:12px; display:flex; align-items:center; justify-content:center; gap:4px; padding:6px 12px; transition:all 0.2s ease; }',
      '.wz-avatar-btn:hover { background-color:var(--color-primary,#4338ca); color:#fff; }',

      /* ── Mobile Responsive Overrides ────────────────────────────── */
      '@media (max-width:768px) {',
      '  .wz-header { overflow-x:auto; padding-bottom:8px; scrollbar-width:none; -ms-overflow-style:none; }',
      '  .wz-header::-webkit-scrollbar { display:none; }',
      '  .wz-stepper { min-width:560px; }',
      '  .wz-step-body-wrapper { flex-direction:column; align-items:center; gap:20px; }',
      '  .wz-avatar-col { margin-bottom:0; width:100%; max-width:140px; }',
      '  .wz-avatar-frame { width:112px; height:112px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * @param {string}   currentUser
   * @param {Object}   moduleConfig
   * @param {Function} cb          - callback(personID: string, maVietTat: string, error?)
   */
  function _resolveNextPersonID(branchId, apiUrl, currentUser, moduleConfig, cb) {
    if (moduleConfig && moduleConfig.wizardHooks && typeof moduleConfig.wizardHooks.resolveAutoId === 'function') {
      moduleConfig.wizardHooks.resolveAutoId(branchId, apiUrl, currentUser, cb);
    } else {
      // Fallback
      var timestampId = 'ID' + new Date().getTime().toString().slice(-6);
      cb(timestampId, branchId, null);
    }
  }


  // ── Hàm mở wizard ────────────────────────────────────────────────────
  function _openAddStepper(config) {
    _injectCSS();

    var steps = config.steps;
    var formSchema = config.formSchema;
    var saveData = config.saveData;
    var moduleConfig = config.moduleConfig;
    var currentUser = config.currentUser;
    var userBranches = config.userBranches || [];   // [{ id:'VP', name:'Văn Phòng' }, ...]

    // Nếu không có danh sách chi nhánh → fallback đọc từ localStorage
    if (!userBranches || userBranches.length === 0) {
      try {
        var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
        var raw = u.ChiNhanhList || u.Branches || u.BranchCodes || u.ChiNhanh || [];
        if (Array.isArray(raw)) {
          userBranches = raw.map(function (b) {
            if (typeof b === 'string') return { id: b, name: b };
            return { id: b.id || b.Code || b.BranchCode, name: b.name || b.Name || b.BranchName || b.id };
          });
        }
      } catch (e) { }
    }

    var apiUrl = moduleConfig.ApiSearch || (
      typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL + '/api/API_Gateway_Router' : '/api/API_Gateway_Router'
    );

    var totalSteps = steps.length;
    var currentStep = 0;
    var formState = {};   // tích lũy data qua các bước
    var selectedBranch = null;  // { id, name }
    var resolvedPersonID = '';

    // ── Build DOM ────────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay';

    var dialog = document.createElement('div');
    dialog.className = 'wz-dialog';
    overlay.appendChild(dialog);

    // ── Header ──────────────────────────────────────────────────────
    var header = document.createElement('div');
    header.className = 'wz-header';

    var titleRow = document.createElement('div');
    titleRow.className = 'wz-title-row';

    var titleLeft = document.createElement('div');
    titleLeft.style.cssText = 'display:flex;align-items:center;gap:10px;min-width:0;';

    var titleIconBox = document.createElement('div');
    titleIconBox.className = 'wz-title-icon';
    titleIconBox.innerHTML = '<span class="material-symbols-outlined">person_add</span>';

    var titleEl = document.createElement('h3');
    titleEl.className = 'wz-title';
    titleEl.textContent = moduleConfig.TitleAdd || 'Thêm mới';

    titleLeft.appendChild(titleIconBox);
    titleLeft.appendChild(titleEl);

    var btnClose = document.createElement('button');
    btnClose.className = 'wz-close';
    btnClose.type = 'button';
    btnClose.title = 'Đóng (Esc)';
    btnClose.innerHTML = '<span class="material-symbols-outlined" style="font-size:22px;">close</span>';
    btnClose.onclick = function () { _close(false); };

    titleRow.appendChild(titleLeft);
    titleRow.appendChild(btnClose);
    header.appendChild(titleRow);

    // Stepper
    var stepperEl = document.createElement('div');
    stepperEl.className = 'wz-stepper';

    // Thêm step "Chi Nhánh" ở đầu nếu không bị ẩn
    var hideBranch = moduleConfig.HideBranchStep === true;
    var allStepDefs = hideBranch ? steps : [
      { label: 'Chi Nhánh', icon: 'location_city', description: 'Chọn chi nhánh & mã nhân viên' }
    ].concat(steps);
    var totalUISteps = allStepDefs.length;

    allStepDefs.forEach(function (step, idx) {
      var item = document.createElement('div');
      item.className = 'wz-step-item';

      var node = document.createElement('div');
      node.className = 'wz-step-node';

      var circle = document.createElement('div');
      circle.className = 'wz-step-circle';
      circle.dataset.stepCircle = idx;
      circle.innerHTML = step.icon
        ? '<span class="material-symbols-outlined" style="font-size:17px;">' + step.icon + '</span>'
        : (idx + 1);

      var label = document.createElement('div');
      label.className = 'wz-step-label';
      label.dataset.stepLabel = idx;
      label.textContent = step.label;

      node.appendChild(circle);
      node.appendChild(label);
      item.appendChild(node);

      if (idx < totalUISteps - 1) {
        var line = document.createElement('div');
        line.className = 'wz-step-line';
        line.dataset.stepLine = idx;
        item.appendChild(line);
      }

      stepperEl.appendChild(item);
    });
    header.appendChild(stepperEl);
    dialog.appendChild(header);

    // Progress bar
    var progressWrap = document.createElement('div');
    progressWrap.className = 'wz-progress';
    var progressBar = document.createElement('div');
    progressBar.className = 'wz-progress-bar';
    progressBar.style.width = (100 / totalUISteps) + '%';
    progressWrap.appendChild(progressBar);
    dialog.appendChild(progressWrap);

    // Body
    var body = document.createElement('div');
    body.className = 'wz-body';
    dialog.appendChild(body);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'wz-footer';

    // Dot indicators
    var stepInfoEl = document.createElement('div');
    stepInfoEl.className = 'wz-step-info';
    var dotsEl = document.createElement('div');
    dotsEl.className = 'wz-step-info-dots';
    allStepDefs.forEach(function (_, idx) {
      var dot = document.createElement('div');
      dot.className = 'wz-step-dot';
      dot.dataset.dot = idx;
      dotsEl.appendChild(dot);
    });
    stepInfoEl.appendChild(dotsEl);

    var btnGroup = document.createElement('div');
    btnGroup.className = 'wz-btn-group';

    var btnBack = document.createElement('button');
    btnBack.className = 'btn btn-outline';
    btnBack.type = 'button';
    btnBack.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_back</span> Quay lại';
    btnBack.onclick = _goBack;

    var btnNext = document.createElement('button');
    btnNext.className = 'btn btn-primary';
    btnNext.type = 'button';
    btnNext.onclick = _goNext;

    btnGroup.appendChild(btnBack);
    btnGroup.appendChild(btnNext);
    footer.appendChild(stepInfoEl);
    footer.appendChild(btnGroup);
    dialog.appendChild(footer);

    // ── Helpers ──────────────────────────────────────────────────────
    function _close(force) {
      if (!force) {
        // Thu thập data hiện tại
        _collect();
        var hasData = currentStep > 0 || Object.keys(formState).length > 0;

        if (hasData) {
          if (typeof ConfirmModal !== 'undefined') {
            ConfirmModal.show({
              title: 'Xác nhận thoát',
              message: 'Bạn đang có dữ liệu chưa lưu. Bạn có chắc chắn muốn thoát và hủy bỏ toàn bộ các thay đổi này không?',
              confirmText: 'Đồng ý thoát',
              confirmClass: 'btn-danger',
              onConfirm: function () { _close(true); }
            });
            var confirmEl = document.getElementById('confirm-modal-overlay');
            if (confirmEl) confirmEl.style.zIndex = '10005';
            return; // Dừng lại chờ confirm
          } else {
            if (!confirm('Bạn đang có dữ liệu chưa lưu. Bạn có chắc chắn muốn thoát và hủy bỏ toàn bộ các thay đổi này không?')) {
              return;
            }
          }
        }
      }

      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.18s';
      if (typeof _onKeydown === 'function') document.removeEventListener('keydown', _onKeydown);
      setTimeout(function () {
        overlay.remove();
        if (history.state && history.state.wizardOpen) history.back();
      }, 180);
    }

    function _collect() {
      body.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name && el.type !== 'button') formState[el.name] = el.value;
      });
    }

    function _validate() {
      // Step 0 UI
      var uiStep = currentStep;
      if (!hideBranch && uiStep === 0) {
        return selectedBranch ? [] : ['Chi nhánh'];
      }
      var step = hideBranch ? steps[uiStep] : steps[uiStep - 1]; // map về steps gốc
      if (!step || !step.fields || !step.fields.length) return [];
      var missing = [];
      step.fields.forEach(function (fn) {
        var schema = formSchema.find(function (f) { return (f.name || '').toLowerCase() === (fn || '').toLowerCase(); });
        if (!schema || !schema.required) return;
        var show = String(schema.showInAdd) === '1' || schema.showInAdd === true;
        if (!show) return;
        var val = (formState[fn] || '').trim();
        if (!val) missing.push(schema.label || fn);
      });
      return missing;
    }

    function _updateUI() {
      // Map currentStep (0-based UI) to allStepDefs index
      allStepDefs.forEach(function (_, idx) {
        var circle = stepperEl.querySelector('[data-step-circle="' + idx + '"]');
        var lbl = stepperEl.querySelector('[data-step-label="' + idx + '"]');
        var line = stepperEl.querySelector('[data-step-line="' + idx + '"]');
        var done = idx < currentStep;
        var active = idx === currentStep;

        circle.className = 'wz-step-circle' + (done ? ' done' : active ? ' active' : '');
        if (done) {
          circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">check</span>';
        } else {
          circle.innerHTML = allStepDefs[idx].icon
            ? '<span class="material-symbols-outlined" style="font-size:17px;">' + allStepDefs[idx].icon + '</span>'
            : (idx + 1);
        }
        lbl.className = 'wz-step-label' + (done ? ' done' : active ? ' active' : '');
        if (line) line.className = 'wz-step-line' + (done ? ' done' : '');

        // Dots
        var dot = dotsEl.querySelector('[data-dot="' + idx + '"]');
        if (dot) dot.className = 'wz-step-dot' + (done ? ' done' : active ? ' active' : '');
      });

      // Progress
      progressBar.style.width = (((currentStep + 1) / totalUISteps) * 100) + '%';

      // Buttons
      btnBack.style.display = currentStep === 0 ? 'none' : '';
      var isLastUI = currentStep === totalUISteps - 1;
      if (isLastUI) {
        btnNext.className = 'btn btn-primary';
        btnNext.style.backgroundColor = 'var(--color-success, #10b981)';
        btnNext.style.borderColor = 'var(--color-success, #10b981)';
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">check_circle</span> Hoàn tất & Lưu';
      } else if (!hideBranch && currentStep === 0) {
        btnNext.className = 'btn btn-primary';
        btnNext.innerHTML = 'Tiếp theo <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_forward</span>';
        if (!selectedBranch) {
          btnNext.disabled = true;
          btnNext.title = 'Vui lòng chọn chi nhánh';
        } else {
          btnNext.disabled = false;
          btnNext.title = '';
        }
      } else {
        btnNext.className = 'btn btn-primary';
        btnNext.innerHTML = 'Tiếp theo <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_forward</span>';
        btnNext.disabled = false;
      }
    }

    // ── Render step 0: Branch picker ─────────────────────────────────
    function _renderBranchStep() {
      body.innerHTML = '';
      var content = document.createElement('div');
      content.className = 'wz-step-content';

      // Header
      var sh = document.createElement('div');
      sh.className = 'wz-step-header';
      var shIcon = document.createElement('div');
      shIcon.className = 'wz-step-header-icon';
      shIcon.innerHTML = '<span class="material-symbols-outlined">location_city</span>';
      var shText = document.createElement('div');
      var shTitle = document.createElement('div');
      shTitle.className = 'wz-step-title';
      shTitle.textContent = 'Chọn Chi Nhánh';
      var shDesc = document.createElement('div');
      shDesc.className = 'wz-step-desc';
      shDesc.textContent = 'Chọn chi nhánh để tạo mã nhân viên tự động';
      shText.appendChild(shTitle);
      shText.appendChild(shDesc);
      sh.appendChild(shIcon);
      sh.appendChild(shText);
      content.appendChild(sh);

      if (!userBranches || userBranches.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'wz-no-branch';
        empty.innerHTML = '<span class="material-symbols-outlined">store_mall_directory</span>Tài khoản của bạn chưa được gán chi nhánh.<br>Vui lòng liên hệ quản trị viên.';
        content.appendChild(empty);
        body.appendChild(content);
        return;
      }

      // Branch cards
      var grid = document.createElement('div');
      grid.className = 'wz-branch-grid';

      userBranches.forEach(function (branch) {
        var card = document.createElement('div');
        card.className = 'wz-branch-card' + (selectedBranch && selectedBranch.id === branch.id ? ' selected' : '');

        var iconEl = document.createElement('div');
        iconEl.className = 'wz-branch-icon';
        iconEl.innerHTML = '<span class="material-symbols-outlined">apartment</span>';

        var nameEl = document.createElement('div');
        nameEl.className = 'wz-branch-name';
        nameEl.textContent = branch.name || branch.id;

        var codeEl = document.createElement('div');
        codeEl.className = 'wz-branch-code';
        codeEl.textContent = branch.id;

        var checkEl = document.createElement('div');
        checkEl.className = 'wz-branch-check';
        checkEl.innerHTML = '<span class="material-symbols-outlined">check</span>';

        card.appendChild(iconEl);
        card.appendChild(nameEl);
        card.appendChild(codeEl);
        card.appendChild(checkEl);

        card.addEventListener('click', function () {
          // Bỏ chọn card cũ
          grid.querySelectorAll('.wz-branch-card').forEach(function (c) { c.classList.remove('selected'); });
          card.classList.add('selected');
          selectedBranch = branch;

          // Disable nút khi đang tính mã
          btnNext.disabled = true;
          _showIDLoading();

          // Gọi SP để lấy mã NV — BranchID truyền thẳng vào SP
          _resolveNextPersonID(
            branch.id,   // VD: 'VANPHONG', 'THANHDA', 'SGCENTER'...
            apiUrl,
            currentUser,
            moduleConfig,
            function (nextCode, maVietTat, err) {
              if (err || !nextCode) {
                _showIDError(branch);
                if (window.UIToast) UIToast.show('Không thể sinh mã nhân viên: ' + (err ? err.message : 'Không xác định'), 'error');
                return;
              }
              resolvedPersonID = nextCode;
              formState['PersonID'] = nextCode;
              formState['BranchID'] = branch.id;
              formState['ChiNhanh'] = branch.name || branch.id;
              formState['MaVietTat'] = maVietTat;
              _showIDResult(nextCode, branch, maVietTat);
              btnNext.disabled = false;
              btnNext.title = '';
            }
          );
        });

        grid.appendChild(card);
      });
      content.appendChild(grid);

      // PersonID display box
      var idSection = document.createElement('div');
      idSection.style.cssText = 'margin-top:20px;';
      var idLabel = document.createElement('div');
      idLabel.style.cssText = 'font-size:12px;font-weight:600;color:var(--color-text-secondary);margin-bottom:8px;display:flex;align-items:center;gap:6px;';
      idLabel.innerHTML = '<span class="material-symbols-outlined" style="font-size:15px;">badge</span>Mã nhân viên được cấp tự động';
      var idBox = document.createElement('div');
      idBox.className = 'wz-id-box';
      idBox.id = 'wz-id-box';

      if (selectedBranch && resolvedPersonID) {
        _buildIDBadge(idBox, resolvedPersonID, selectedBranch);
      } else {
        idBox.innerHTML = '<span style="font-size:13px;color:var(--color-text-secondary);opacity:0.6;">← Chọn chi nhánh để xem mã được cấp</span>';
      }

      idSection.appendChild(idLabel);
      idSection.appendChild(idBox);
      content.appendChild(idSection);

      body.appendChild(content);
    }

    function _showIDLoading() {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      box.innerHTML = '<div class="wz-id-loading"><span class="material-symbols-outlined" style="font-size:18px;animation:wz-spin 0.8s linear infinite;">progress_activity</span>Đang tính mã...</div>';
    }

    function _showIDResult(code, branch, maVietTat) {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      _buildIDBadge(box, code, branch, maVietTat);
    }

    function _showIDError(branch) {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--color-danger,#ef4444);font-size:13px;"><span class="material-symbols-outlined" style="font-size:18px;">error</span>Không thể sinh mã cho chi nhánh <strong>' + (branch ? branch.name || branch.id : '') + '</strong>. Vui lòng liên hệ quản trị.</div>';
    }

    function _buildIDBadge(box, code, branch, maVietTat) {
      box.innerHTML = '';
      var badge = document.createElement('div');
      badge.className = 'wz-id-badge';
      badge.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

      var row1 = document.createElement('div');
      row1.style.cssText = 'display:flex;align-items:center;gap:10px;';
      var codeEl = document.createElement('div');
      codeEl.className = 'wz-id-value';
      codeEl.textContent = code;
      var tagEl = document.createElement('div');
      tagEl.className = 'wz-id-tag';
      tagEl.textContent = (branch && branch.name) ? branch.name : (maVietTat || code);
      row1.appendChild(codeEl);
      row1.appendChild(tagEl);

      // Thêm badge prefix nếu có maVietTat khác tên chi nhánh
      if (maVietTat && maVietTat !== code) {
        var prefixTag = document.createElement('div');
        prefixTag.style.cssText = 'font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(16,185,129,0.12);color:var(--color-success,#10b981);font-weight:600;font-family:monospace;';
        prefixTag.textContent = 'prefix: ' + maVietTat;
        row1.appendChild(prefixTag);
      }

      var hint = document.createElement('div');
      hint.className = 'wz-id-hint';
      badge.appendChild(row1);
      badge.appendChild(hint);
      box.appendChild(badge);
    }

    // ── Render field steps ───────────────────────────────────────────
    function _renderStep(uiIdx) {
      body.innerHTML = '';
      if (!hideBranch && uiIdx === 0) {
        _renderBranchStep();
        return;
      }

      var step = hideBranch ? steps[uiIdx] : steps[uiIdx - 1];
      var content = document.createElement('div');
      content.className = 'wz-step-content';

      // Step header
      var sh = document.createElement('div');
      sh.className = 'wz-step-header';
      var shIcon = document.createElement('div');
      shIcon.className = 'wz-step-header-icon';
      shIcon.innerHTML = step.icon
        ? '<span class="material-symbols-outlined">' + step.icon + '</span>'
        : '<span class="material-symbols-outlined">edit_note</span>';
      var shText = document.createElement('div');
      var shTitle = document.createElement('div');
      shTitle.className = 'wz-step-title';
      shTitle.textContent = step.label;
      var shDesc = document.createElement('div');
      shDesc.className = 'wz-step-desc';
      shDesc.textContent = step.description || '';
      shText.appendChild(shTitle);
      shText.appendChild(shDesc);
      sh.appendChild(shIcon);
      sh.appendChild(shText);
      content.appendChild(sh);

      // Bỏ hiển thị mã NV đã chọn ở banner để tránh rườm rà theo yêu cầu

      var isLastWiz = !step.fields || step.fields.length === 0;
      if (isLastWiz) {
        _renderReview(content);
      } else {
        // Only show avatar on the very first data step (step 0 if no branch, step 1 if branch is present)
        var isFirstDataStep = hideBranch ? (uiIdx === 0) : (uiIdx === 1);

        if (isFirstDataStep && moduleConfig.AttachmentApi) {
          var bodyWrapper = document.createElement('div');
          bodyWrapper.className = 'wz-step-body-wrapper';

          // Render photo box on the left
          var photoArea = document.createElement('div');
          photoArea.className = 'wz-avatar-col';

          var frame = document.createElement('div');
          frame.className = 'wz-avatar-frame';

          var img = document.createElement('img');
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          var defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
          var mimeType = 'image/jpeg';
          var fileExt = formState.FileName ? formState.FileName.split('.').pop().toLowerCase() : '';
          if (fileExt === 'png') mimeType = 'image/png';
          else if (fileExt === 'gif') mimeType = 'image/gif';
          else if (fileExt === 'webp') mimeType = 'image/webp';

          var rawContent = formState.Base64Content || formState.Content || formState.HinhAnh;

          if (rawContent && typeof rawContent === 'string' && rawContent.length > 10) {
            if (/^0x/i.test(rawContent)) {
              var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
              var bytes = new Uint8Array(hexStr.length / 2);
              for (var bi = 0; bi < bytes.length; bi++) {
                bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
              }
              var blob = new Blob([bytes], { type: mimeType });
              img.src = URL.createObjectURL(blob);
            } else if (rawContent.startsWith('http') || rawContent.startsWith('/')) {
              img.src = rawContent;
            } else {
              img.src = 'data:' + mimeType + ';base64,' + rawContent;
            }
          } else {
            var pkField = formSchema.PrimaryKey || 'PersonID';
            var pkVal = formState[pkField] || formState['PersonID'] || formState['CandidateID'] || '';
            if (pkVal) {
              var subFolder = (formState['CandidateID']) ? 'UngVien' : 'NhanVien';
              img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + pkVal + '.jpg';
            } else {
              img.src = defaultAvatar;
            }
          }

          img.onerror = function () {
            var self = this;
            var pkField = formSchema.PrimaryKey || 'PersonID';
            var pkVal = formState[pkField] || formState['PersonID'] || formState['CandidateID'] || '';

            if (!pkVal || !moduleConfig.AttachmentApi) {
              self.src = defaultAvatar;
              return;
            }

            var attachApi = moduleConfig.AttachmentApi;
            var fetchPayload = {
              List: attachApi,
              Func: 'View',
              JsonData: JSON.stringify({
                CandidateID: pkVal,
                PersonID: pkVal
              }),
              UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown'
            };

            var apiUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router';
            fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fetchPayload)
            })
              .then(function (res) { return res.json(); })
              .then(function (data) {
                if (data && data.code === 0 && data.records && data.records.length > 0) {
                  var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                  if (b64 && b64.length > 10) {
                    if (b64.startsWith('data:image')) {
                      self.src = b64;
                    } else {
                      var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                      self.src = 'data:' + mimeType + ';base64,' + b64;
                    }
                  } else {
                    self.src = defaultAvatar;
                  }
                } else {
                  self.src = defaultAvatar;
                }
              })
              .catch(function (err) {
                self.src = defaultAvatar;
              });
          };
          frame.appendChild(img);

          var photoInput = document.createElement('input');
          photoInput.type = 'hidden';
          photoInput.name = 'HinhAnh';
          photoInput.value = formState.HinhAnh || '';

          var btnUpload = document.createElement('button');
          btnUpload.className = 'btn btn-outline btn-sm w-100 wz-avatar-btn';
          btnUpload.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">photo_camera</span> Tải ảnh lên';

          var handleUploadClick = function () {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function (e) {
              var file = e.target.files[0];
              if (file) {
                var reader = new FileReader();
                reader.onload = function (re) {
                  img.src = re.target.result;
                  photoInput.value = re.target.result;

                  var dataUrl = re.target.result;
                  var base64Content = dataUrl.split(',')[1] || dataUrl;

                  var abReader = new FileReader();
                  abReader.onload = function (e_ab) {
                    var arrayBuffer = e_ab.target.result;
                    var hexStr = '';
                    var bytes = new Uint8Array(arrayBuffer);
                    for (var i = 0; i < bytes.byteLength; i++) {
                      var hex = bytes[i].toString(16);
                      hexStr += (hex.length === 1 ? '0' + hex : hex);
                    }
                    formState.FileName = file.name;
                    formState.HinhAnh = '0x' + hexStr;
                    formState.Base64Content = base64Content;
                    formState.Content = '0x' + hexStr;

                    window._pendingWizardAvatar = {
                      file: file,
                      base64Content: base64Content,
                      hexStr: '0x' + hexStr
                    };
                  };
                  abReader.readAsArrayBuffer(file);
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          };

          btnUpload.onclick = handleUploadClick;
          frame.onclick = handleUploadClick;

          photoArea.appendChild(frame);
          photoArea.appendChild(photoInput);
          photoArea.appendChild(btnUpload);

          var fieldsArea = document.createElement('div');
          fieldsArea.className = 'wz-fields-col';
          fieldsArea.style.cssText = 'flex: 1; min-width: 0;';

          bodyWrapper.appendChild(photoArea);
          bodyWrapper.appendChild(fieldsArea);

          content.appendChild(bodyWrapper);

          _renderFields(fieldsArea, step.fields);
        } else {
          _renderFields(content, step.fields);
        }
      }

      body.appendChild(content);
      if (!isLastWiz) {
        setTimeout(function () {
          var first = body.querySelector('input:not([type="hidden"]):not([disabled])');
          if (first) first.focus();
        }, 80);
      }
    }

    function _renderFields(container, fieldNames) {
      var grid = document.createElement('div');
      grid.className = 'wz-fields-grid';

      fieldNames.forEach(function (fn) {
        var field = formSchema.find(function (f) { return (f.name || '').toLowerCase() === (fn || '').toLowerCase(); });
        if (!field) return;

        // Restore giá trị đã nhập ở bước trước
        field.value = formState[fn] || '';
        field.readOnly = field.isReadOnlyAdd;

        // Lắng nghe sự kiện đổi chi nhánh để cập nhật mã nhân viên (Add mode)
        if (fn === 'BranchID') {
          setTimeout(function () {
            var hiddenIn = grid.querySelector('input[type="hidden"][name="BranchID"]');
            if (hiddenIn) {
              hiddenIn.addEventListener('change', function (e) {
                var newBranch = e.target.value;
                if (!newBranch) return;

                var pidInput = grid.querySelector('input[name="PersonID"]');
                if (pidInput) pidInput.value = 'Đang tính toán...';

                var apiUrl = moduleConfig.ApiSearch || ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router');
                _resolveNextPersonID(newBranch, apiUrl, currentUser, moduleConfig, function (nextCode, maVietTat, err) {
                  if (err || !nextCode) {
                    if (window.UIToast) UIToast.show('Lỗi tính mã nhân viên mới: ' + (err ? err.message : ''), 'error');
                    if (pidInput) pidInput.value = formState['PersonID'] || '';
                    return;
                  }
                  formState['PersonID'] = nextCode;
                  formState['MaVietTat'] = maVietTat;
                  if (pidInput) {
                    pidInput.value = nextCode;
                    pidInput.style.backgroundColor = 'var(--color-primary-light, rgba(67,56,202,0.1))';
                    setTimeout(function () { pidInput.style.backgroundColor = ''; }, 1000);
                  }
                });
              });
            }
          }, 0);
        }

        // --- Custom override cho Giới Tính và Trạng Thái ---
        if (fn === 'GioiTinh') {
          field.renderRule = 'sl';
          field.dataSource = 'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác';
        }
        if (fn === 'PersonStatus') {
          field.renderRule = 'sl';
          field.dataSource = 'API_ComboPersonStatus';
        }
        // ----------------------------------------------------

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
          inputEl = _buildSelectField(field);
        } else if (field.renderRule === 'ta' || field.renderRule === 'textarea') {
          inputEl = UIInput.createTextarea ? UIInput.createTextarea(field) : UIInput.createText(field);
        } else {
          inputEl = UIInput.createText(field);
        }

        // Quyết định span: textarea/địa chỉ/mô tả → full width
        var span = String(field.position || 'body');
        var isFullWidth = span === 'body' || span === '12' ||
          fn.toLowerCase().includes('diachi') ||
          fn.toLowerCase().includes('ghichu') ||
          fn.toLowerCase().includes('mota') ||
          field.renderRule === 'ta' ||
          field.renderRule === 'textarea';

        var colClass = isFullWidth ? 'df-col-12' : 'df-col-6';

        var wrapper = document.createElement('div');
        wrapper.className = colClass;
        wrapper.style.animation = 'wz-fadein 0.16s ease';

        // Loại bỏ placeholder để UI thoáng hơn, tránh rối mắt khi form dài
        var inputs = inputEl.querySelectorAll('input, textarea');
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].removeAttribute('placeholder');
          inputs[i].placeholder = '';
        }

        wrapper.appendChild(inputEl);
        grid.appendChild(wrapper);
      });
      container.appendChild(grid);
    }

    function _buildSelectField(field) {
      var fgw = document.createElement('div');
      fgw.className = 'form-group';
      if (field.label) {
        var lbl = document.createElement('label');
        lbl.innerText = field.label;
        if (field.required) {
          var req = document.createElement('span');
          req.innerText = ' *';
          req.style.color = 'var(--color-danger)';
          lbl.appendChild(req);
        }
        fgw.appendChild(lbl);
      }
      var hiddenIn = document.createElement('input');
      hiddenIn.type = 'hidden';
      hiddenIn.name = field.name;
      hiddenIn.value = field.value || '';
      fgw.appendChild(hiddenIn);

      var ds = field.dataSource || '';
      if (field.name === 'BranchID' && userBranches && userBranches.length > 0) {
        ds = 'STATIC:' + userBranches.map(function (b) {
          return b.id + '|' + (b.name || b.id);
        }).join(',');
      }
      if (ds.toUpperCase().startsWith('STATIC:')) {
        var staticData = ds.substring(7).split(',').map(function (s) {
          var p = s.split('|');
          return [p[0], p[1] || p[0]];
        });
        var combo = UIControls.createDataComboBox({
          placeholder: '-- Vui lòng chọn --',
          headers: ['Mã', 'Tên'],
          onSearch: function (q) {
            return Promise.resolve({
              headers: ['Mã', 'Tên'],
              data: q ? staticData.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; }) : staticData,
              colFilterIndex: 1
            });
          },
          onSelect: function (row) { hiddenIn.value = row[0]; formState[field.name] = row[0]; hiddenIn.dispatchEvent(new Event('change', { bubbles: true })); }
        });
        var matched = staticData.find(function (r) { return r[0] == field.value; });
        var dIn = combo.querySelector('input.ui-input');
        if (matched && dIn) dIn.value = matched[1];
        fgw.appendChild(combo);
      } else if (ds) {
        var endpointRaw = ds.indexOf('|') > -1 ? ds.split('|')[0] : ds;
        var baseUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '');
        var finalUrl = baseUrl + '/api/API_Gateway_Router';
        var fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View', UserName: currentUser };
        var searchApiCall = function (q) {
          var pl = Object.assign({}, fetchPayload);
          if (q) pl.Keyword = q;
          return ApiClient.post(finalUrl, pl).then(function (res) {
            var list = res.list || res.records || [];
            if (!list.length) return { headers: ['Mã', 'Tên'], data: [], colFilterIndex: 1 };
            var keys = Object.keys(list[0]);

            var comboData = [];

            // Lọc bớt cột nếu field có cấu hình hiddenColumns
            var displayKeys = keys;
            if (field.hiddenColumns && Array.isArray(field.hiddenColumns)) {
              var hcols = field.hiddenColumns.map(function (c) { return c.toUpperCase(); });
              displayKeys = keys.filter(function (k) { return hcols.indexOf(k.toUpperCase()) === -1; });
            }

            list.forEach(function (d) {
              var rowData = [];
              displayKeys.forEach(function (k) { rowData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
              comboData.push(rowData);
            });

            var labelRegex = /name|tên|ten|label|desc|title/i;
            var displayKey = displayKeys.find(function (k) { return labelRegex.test(k); });
            var colFilterIndex;
            if (displayKey) {
              colFilterIndex = displayKeys.indexOf(displayKey);
            } else {
              var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;
              var validIdx = -1;
              for (var i = 1; i < displayKeys.length; i++) {
                if (!hideRegex.test(displayKeys[i])) { validIdx = i; break; }
              }
              colFilterIndex = validIdx !== -1 ? validIdx : 0;
            }

            return {
              headers: displayKeys,
              data: comboData,
              colFilterIndex: colFilterIndex,
              forceMultiColumn: displayKeys.length > 1
            };
          });
        };

        var lazyCombo = UIControls.createDataComboBox({
          placeholder: '-- Vui lòng chọn --',
          showAddNew: (typeof moduleConfig !== 'undefined' && moduleConfig.HideAddNewInDropdowns) ? false : true,
          headers: ['Mã', 'Tên'],
          disabled: field.readOnly,
          onSearch: searchApiCall,
          onSelect: function (row) {
            hiddenIn.value = row[0];
            formState[field.name] = row[0];
            hiddenIn.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        if (field.value) {
          searchApiCall('').then(function (res) {
            var displayInput = lazyCombo.querySelector('input.ui-input');
            var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
            if (matched && displayInput) {
              displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
            }
          }).catch(function (err) {
            console.error('[WizardForm] DataComboBox initial fetch error:', err);
            var displayInput = lazyCombo.querySelector('input.ui-input');
            if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
          });
        }
        fgw.appendChild(lazyCombo);
      }
      return fgw;
    }

    // ── Review step ──────────────────────────────────────────────────
    function _renderReview(container) {
      var wrap = document.createElement('div');
      wrap.className = 'wz-review-wrap';

      // Section 1: Thông tin chi nhánh & mã NV (luôn hiển thị)
      var secBranch = document.createElement('div');
      secBranch.className = 'wz-review-section';
      var secBranchTitle = document.createElement('div');
      secBranchTitle.className = 'wz-review-section-title';
      secBranchTitle.innerHTML = '<span class="material-symbols-outlined">location_city</span>Chi Nhánh & Mã Nhân Viên';
      secBranch.appendChild(secBranchTitle);
      var branchGrid = document.createElement('div');
      branchGrid.className = 'wz-review-grid';

      var cellBranch = document.createElement('div');
      cellBranch.className = 'wz-review-cell';
      cellBranch.innerHTML = '<div class="wz-review-label">Chi nhánh</div><div class="wz-review-value">' + (selectedBranch ? (selectedBranch.name || selectedBranch.id) : '—') + '</div>';

      var cellID = document.createElement('div');
      cellID.className = 'wz-review-cell';
      cellID.innerHTML = '<div class="wz-review-label">Mã nhân viên</div><div class="wz-review-value mono">' + (formState['PersonID'] || resolvedPersonID || '—') + '</div>';

      branchGrid.appendChild(cellBranch);
      branchGrid.appendChild(cellID);
      secBranch.appendChild(branchGrid);
      wrap.appendChild(secBranch);

      // Section 2+: Dữ liệu từ các step
      steps.forEach(function (step) {
        if (!step.fields || !step.fields.length) return;
        var hasAny = false;
        var cells = [];

        step.fields.forEach(function (fn) {
          var schema = formSchema.find(function (f) { return (f.name || '').toLowerCase() === (fn || '').toLowerCase(); });
          if (!schema) return;
          var val = formState[fn] || '';
          if (!val) return;
          hasAny = true;
          var cell = document.createElement('div');
          cell.className = 'wz-review-cell';
          var isLong = val.length > 40;
          if (isLong) cell.classList.add('full');
          cell.innerHTML = '<div class="wz-review-label">' + (schema.label || fn) + '</div><div class="wz-review-value">' + val + '</div>';
          cells.push(cell);
        });

        if (!hasAny) return;

        var sec = document.createElement('div');
        sec.className = 'wz-review-section';
        var secTitle = document.createElement('div');
        secTitle.className = 'wz-review-section-title';
        secTitle.innerHTML = '<span class="material-symbols-outlined">' + (step.icon || 'info') + '</span>' + step.label;
        sec.appendChild(secTitle);
        var secGrid = document.createElement('div');
        secGrid.className = 'wz-review-grid';
        cells.forEach(function (c) { secGrid.appendChild(c); });
        sec.appendChild(secGrid);
        wrap.appendChild(sec);
      });

      if (wrap.children.length === 1) {
        // Chỉ có section chi nhánh, chưa có data field
        var emptyRow = document.createElement('div');
        emptyRow.style.cssText = 'text-align:center;padding:16px;color:var(--color-text-secondary);font-size:13px;';
        emptyRow.textContent = 'Chưa có dữ liệu field nào được nhập.';
        wrap.appendChild(emptyRow);
      }

      container.appendChild(wrap);

      // Tip
      var tip = document.createElement('div');
      tip.style.cssText = 'margin-top:14px; font-size:12px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px; padding:10px 12px; background:rgba(79,70,229,0.06); border-radius:8px;';
      tip.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:var(--color-info,var(--color-primary));">info</span> Kiểm tra kỹ trước khi lưu. Bấm <strong>"Quay lại"</strong> nếu cần chỉnh sửa.';
      container.appendChild(tip);
    }

    // ── Navigation ───────────────────────────────────────────────────
    function _goBack() {
      if (currentStep > 0) {
        _collect();
        currentStep--;
        _renderStep(currentStep);
        _updateUI();
      }
    }

    function _goNext() {
      _collect();
      var missing = _validate();
      if (missing.length) {
        if (typeof Alert !== 'undefined') {
          Alert.warning('Bắt buộc', 'Vui lòng điền đầy đủ các trường sau: ' + missing.join(', '));
        } else if (window.UIToast) {
          UIToast.show('Vui lòng điền: ' + missing.join(', '), 'warning');
        } else {
          alert('Vui lòng điền: ' + missing.join(', '));
        }
        return;
      }

      if (currentStep < totalUISteps - 1) {
        currentStep++;
        _renderStep(currentStep);
        _updateUI();
        // Scroll body về đầu
        body.scrollTop = 0;
      } else {
        // ── Lưu ──
        btnNext.disabled = true;
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;animation:wz-spin 0.8s linear infinite;">progress_activity</span> Đang lưu...';

        // Build fakeBody với chỉ những trường được sửa
        var fakeBody = document.createElement('div');
        Object.keys(formState).forEach(function (key) {
          var newValue = formState[key] !== null && formState[key] !== undefined ? String(formState[key]) : '';
          // Vì là Thêm mới (Add) nên không có rowData cũ, chỉ gửi những trường có data khác rỗng
          // (hoặc cứ gửi hết đối với form Add vì trigger không crash khi Add)
          // Tuy nhiên, để nhất quán, ta gửi tất cả các trường có giá trị.
          if (newValue !== '' || key === 'PersonID' || key === 'UserAutoID') {
            var inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = key;
            inp.value = newValue;
            fakeBody.appendChild(inp);
          }
        });

        var fakeModal = {
          closeNow: function () { _close(true); },
          close: function () { _close(true); }
        };
        saveData(false, {}, fakeModal, fakeBody, btnNext);
      }
    }

    // ── Click outside to close ────────────────────────────────────────
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _close();
    });

    // ── Keyboard shortcuts ────────────────────────────────────────────
    function _onKeydown(e) {
      if (e.key === 'Escape') {
        _close();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        var active = document.activeElement;
        var isTextArea = active && active.tagName === 'TEXTAREA';
        if (!isTextArea) { e.preventDefault(); _goNext(); }
      }
    }
    document.addEventListener('keydown', _onKeydown);

    // ── Khởi tạo ──────────────────────────────────────────────────────
    document.getElementById('modal-container').appendChild(overlay);
    history.pushState({ wizardOpen: true }, null, window.location.href);

    if (hideBranch) {
      // Tự động resolve ID khi bỏ qua bước chọn chi nhánh
      var pkName = moduleConfig.PrimaryKey || 'PersonID';
      _resolveNextPersonID('', apiUrl, currentUser, moduleConfig, function (nextCode, maVietTat, err) {
        if (nextCode) {
          formState[pkName] = nextCode;
          resolvedPersonID = nextCode;
        }
      });
    }

    _renderStep(0);
    _updateUI();

    return { close: _close };
  }

  // --- HYBRID MODE LOGIC ---
  function open(config) {
    if (config.isEdit) {
      return _openEditLayout(config);
    }
    return _openAddStepper(config);
  }

  function _openEditLayout(config) {
    var _cssInjectedEdit = false;
    function _injectEditCSS() {
      if (_cssInjectedEdit) return;
      _cssInjectedEdit = true;
      var style = document.createElement('style');
      style.id = 'wizard-form-edit-css';
      style.textContent = [
        '@keyframes wz-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }',
        '.wz-overlay-edit { position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px; animation:wz-fadein 0.2s ease; backdrop-filter:blur(2px); }',
        '.wz-dialog-edit { background:var(--color-surface); border-radius:var(--radius-lg,16px); box-shadow:0 32px 80px rgba(0,0,0,0.28); width:min(1200px,98vw); height:95vh; display:flex; flex-direction:column; overflow:hidden; animation:wz-fadein 0.28s cubic-bezier(0.16,1,0.3,1); }',
        '.wz-header-edit { padding:16px 24px; border-bottom:1px solid var(--color-border); flex-shrink:0; background:var(--color-surface); display:flex; align-items:center; justify-content:space-between; }',
        '.wz-title-edit { margin:0; font-size:18px; font-weight:700; color:var(--color-text); display:flex; align-items:center; gap:8px; }',
        '.wz-close-edit { background:none; border:none; cursor:pointer; color:var(--color-text-secondary); padding:6px; border-radius:8px; transition:0.15s; display:flex; }',
        '.wz-close-edit:hover { background:var(--color-background); color:var(--color-danger); }',
        '.wz-body-edit { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f1f5f9; }',
        '.wz-top-panel { padding:16px 24px; background:var(--color-surface); border-bottom:1px solid var(--color-border); flex-shrink:0; }',
        '.wz-fields-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px 16px; }',
        '.wz-fields-grid.two-cols { grid-template-columns:1fr 1fr; }',
        '.wz-fields-grid .df-col-12 { grid-column:1 / -1; }',
        '.wz-fields-grid .df-col-6 { grid-column:span 2; }',
        '.wz-fields-grid .form-group { margin-bottom: 0; }',
        '.wz-fields-grid label { font-size: 12px; margin-bottom: 4px; font-weight: 600; color: var(--color-text-secondary); }',
        '.wz-tabs-container { display:flex; flex-direction:column; flex:1; overflow:hidden; padding:16px 24px; }',
        '.wz-tab-bar { display:flex; gap:4px; border-bottom:2px solid var(--color-border); overflow-x:auto; flex-shrink:0; margin-bottom: 16px; scrollbar-width: none; }',
        '.wz-tab-btn { background:transparent; border:none; padding:10px 16px; font-size:14px; font-weight:600; color:var(--color-text-secondary); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:0.2s; white-space:nowrap; display:flex; align-items:center; gap:6px; }',
        '.wz-tab-btn:hover { color:var(--color-text); }',
        '.wz-tab-btn.active { color:var(--color-primary); border-bottom-color:var(--color-primary); background:rgba(67,56,202,0.04); border-radius:6px 6px 0 0; }',
        '.wz-tab-content { flex:1; overflow-y:auto; background:var(--color-surface); border:1px solid var(--color-border); border-radius:8px; padding:20px; }',
        '.wz-footer { padding:16px 24px; border-top:1px solid var(--color-border); background:var(--color-surface); display:flex; justify-content:flex-end; gap:12px; flex-shrink:0; }',
        '.photo-box { display:flex; flex-direction:column; align-items:center; gap:12px; padding:16px; border:1px solid var(--color-border); border-radius:8px; width:220px; flex-shrink:0; background:#fff; }',
        '.photo-frame { width:100%; height:240px; border:1px dashed var(--color-border-strong); border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f8fafc; }',
        '.photo-frame img { width:100%; height:100%; object-fit:cover; }',
        '.resume-layout { display:flex; gap:24px; align-items:flex-start; }',
        '.resume-fields { flex:1; }',
        '@media (max-width: 768px) {',
        '  .resume-layout { flex-direction: column-reverse; align-items: center; gap: 16px; }',
        '  .resume-layout .photo-box { width: 100%; max-width: 200px; padding: 12px; }',
        '  .resume-fields { width: 100%; }',
        '  .wz-fields-grid.two-cols { grid-template-columns: 1fr; }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    _injectEditCSS();

    var steps = config.steps || [];
    var formSchema = config.formSchema || [];
    var rowData = config.rowData || {};
    var saveData = config.saveData;
    var moduleConfig = config.moduleConfig || {};
    var currentUser = config.currentUser || '';
    var userBranches = config.userBranches || [];
    var isViewMode = config.isViewMode || false;

    var formState = Object.assign({}, rowData);

    var uiTabs = [];
    steps.forEach(function (s, idx) {
      if (s.fields && s.fields.length > 0) {
        uiTabs.push({
          id: 'step_' + idx,
          label: s.label,
          icon: s.icon || 'folder',
          fields: s.fields
        });
      }
    });

    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay-edit';

    var dialog = document.createElement('div');
    dialog.className = 'wz-dialog-edit';
    overlay.appendChild(dialog);

    // --- Header ---
    var header = document.createElement('div');
    header.className = 'wz-header-edit';
    var title = document.createElement('h3');
    title.className = 'wz-title-edit';
    var titleText = isViewMode ? (moduleConfig.TitleView || 'Thông tin cá nhân') : ('Sửa hồ sơ: ' + (formState.PersonName || formState.PersonID || ''));
    var titleIcon = isViewMode ? 'person' : 'manage_accounts';
    title.innerHTML = '<span class="material-symbols-outlined" style="color:var(--color-primary)">' + titleIcon + '</span> ' + titleText;

    var btnClose = document.createElement('button');
    btnClose.className = 'wz-close-edit';
    btnClose.innerHTML = '<span class="material-symbols-outlined">close</span>';
    btnClose.onclick = function () {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); }, 200);
    };
    header.appendChild(title);
    header.appendChild(btnClose);
    dialog.appendChild(header);

    // --- Body ---
    var body = document.createElement('div');
    body.className = 'wz-body-edit';
    dialog.appendChild(body);

    // Tabs Container
    var tabsContainer = document.createElement('div');
    tabsContainer.className = 'wz-tabs-container';

    var tabBar = document.createElement('div');
    tabBar.className = 'wz-tab-bar';

    var tabContent = document.createElement('div');
    tabContent.className = 'wz-tab-content';

    tabsContainer.appendChild(tabBar);
    tabsContainer.appendChild(tabContent);
    body.appendChild(tabsContainer);

    var activeTab = uiTabs.length > 0 ? uiTabs[0].id : null;

    function _renderTabs() {
      tabBar.innerHTML = '';
      uiTabs.forEach(function (tab) {
        var btn = document.createElement('button');
        btn.className = 'wz-tab-btn' + (activeTab === tab.id ? ' active' : '');
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">' + tab.icon + '</span> ' + tab.label;
        btn.onclick = function () {
          _collectData();
          activeTab = tab.id;
          _renderTabs();
          _renderTabContent();
        };
        tabBar.appendChild(btn);
      });
    }

    function _renderTabContent() {
      tabContent.innerHTML = '';
      if (!activeTab) return;
      var tab = uiTabs.find(function (t) { return t.id === activeTab; });
      if (!tab) return;

      var wrapper = document.createElement('div');

      var lbl = tab.label ? tab.label.toLowerCase() : '';
      if (lbl.indexOf('cá nhân') > -1 || lbl.indexOf('ứng viên') > -1) {
        wrapper.className = 'resume-layout';

        var fieldsArea = document.createElement('div');
        fieldsArea.className = 'resume-fields wz-fields-grid two-cols';
        _renderFields(tab.fields, fieldsArea, formSchema, formState);

        var photoArea = document.createElement('div');
        photoArea.className = 'photo-box';

        var frame = document.createElement('div');
        frame.className = 'photo-frame';
        var img = document.createElement('img');
        var defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        var mimeType = 'image/jpeg';
        var fileExt = formState.FileName ? formState.FileName.split('.').pop().toLowerCase() : '';
        if (fileExt === 'png') mimeType = 'image/png';
        else if (fileExt === 'gif') mimeType = 'image/gif';
        else if (fileExt === 'webp') mimeType = 'image/webp';

        var rawContent = formState.Base64Content || formState.Content || formState.HinhAnh;

        if (rawContent && typeof rawContent === 'string' && rawContent.length > 10) {
          if (/^0x/i.test(rawContent)) {
            var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
            var bytes = new Uint8Array(hexStr.length / 2);
            for (var bi = 0; bi < bytes.length; bi++) {
              bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
            }
            var blob = new Blob([bytes], { type: mimeType });
            img.src = URL.createObjectURL(blob);
          } else if (rawContent.startsWith('http') || rawContent.startsWith('/')) {
            img.src = rawContent;
          } else {
            img.src = 'data:' + mimeType + ';base64,' + rawContent;
          }
        } else {
          var pkField = formSchema.PrimaryKey || 'PersonID';
          var pkVal = formState[pkField] || formState['PersonID'] || formState['CandidateID'] || '';
          if (pkVal) {
            var subFolder = (formState['CandidateID']) ? 'UngVien' : 'NhanVien';
            img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + pkVal + '.jpg';
          } else {
            img.src = defaultAvatar;
          }
        }

        img.onerror = function () {
          // Nếu ảnh tĩnh lỗi (chưa cấu hình backend /Images/), ta thử gọi API để lấy Base64 Content từ Database
          var self = this;
          var pkField = formSchema.PrimaryKey || 'PersonID';
          var pkVal = formState[pkField] || formState['PersonID'] || formState['CandidateID'] || '';

          if (!pkVal || !moduleConfig.AttachmentApi) {
            self.src = defaultAvatar;
            return;
          }

          var attachApi = moduleConfig.AttachmentApi;

          var fetchPayload = {
            List: attachApi,
            Func: 'View',
            JsonData: JSON.stringify({
              CandidateID: pkVal,
              PersonID: pkVal
            }),
            UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown'
          };

          var apiUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router';

          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fetchPayload)
          })
            .then(res => res.json())
            .then(data => {
              // API_Gateway_Router usually returns { code, msg, records: [...] }
              if (data && data.code === 0 && data.records && data.records.length > 0) {
                var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                if (b64 && b64.length > 10) {
                  if (b64.startsWith('data:image')) {
                    self.src = b64;
                  } else {
                    var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                    self.src = 'data:' + mimeType + ';base64,' + b64;
                  }
                } else {
                  self.src = defaultAvatar;
                }
              } else {
                self.src = defaultAvatar;
              }
            })
            .catch(err => {
              self.src = defaultAvatar;
            });
        };
        frame.appendChild(img);

        var photoInput = document.createElement('input');
        photoInput.type = 'hidden';
        photoInput.name = 'HinhAnh';
        photoInput.value = formState.HinhAnh || '';

        var btnUpload = document.createElement('button');
        btnUpload.className = 'btn btn-outline btn-sm w-100';
        if (isViewMode) {
          btnUpload.style.display = 'none';
        }
        btnUpload.innerHTML = '<span class="material-symbols-outlined">upload</span> Cập nhật ảnh';
        btnUpload.onclick = function () {
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
              var reader = new FileReader();
              reader.onload = function (re) {
                img.src = re.target.result;
                photoInput.value = re.target.result; // Base64

                // SYNC FOR API_PERSONATTACH
                var dataUrl = re.target.result;
                var base64Content = dataUrl.split(',')[1] || dataUrl;

                var abReader = new FileReader();
                abReader.onload = function (e_ab) {
                  var bytes = new Uint8Array(e_ab.target.result);
                  var hexArray = [];
                  for (var i = 0; i < bytes.length; i++) {
                    var hexVal = bytes[i].toString(16);
                    if (hexVal.length < 2) hexVal = '0' + hexVal;
                    hexArray.push(hexVal);
                  }
                  var hexStr = '0x' + hexArray.join('');

                  window._pendingWizardAvatar = {
                    file: file,
                    hexStr: hexStr,
                    base64Content: base64Content,
                    dataUrl: dataUrl
                  };
                };
                abReader.readAsArrayBuffer(file);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        };

        photoArea.appendChild(frame);
        photoArea.appendChild(btnUpload);
        photoArea.appendChild(photoInput);

        wrapper.appendChild(fieldsArea);
        wrapper.appendChild(photoArea);
      } else {
        wrapper.className = 'wz-fields-grid two-cols';
        _renderFields(tab.fields, wrapper, formSchema, formState);
      }

      tabContent.appendChild(wrapper);
    }

    _renderTabs();
    _renderTabContent();

    // Footer
    var footer = document.createElement('div');
    footer.className = 'wz-footer';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.innerText = 'Hủy bỏ';
    btnCancel.onclick = function () {
      if (!isViewMode && config.isViewMode) {
        // Was opened in view mode, but now in edit mode. Revert!
        isViewMode = true;
        formState = Object.assign({}, rowData); // Revert data

        var titleText = moduleConfig.TitleView || 'Thông tin cá nhân';
        title.innerHTML = '<span class="material-symbols-outlined" style="color:var(--color-primary)">person</span> ' + titleText;

        btnSave.innerHTML = '<span class="material-symbols-outlined">edit</span> Sửa';
        btnSave.onclick = function () {
          isViewMode = false;
          title.innerHTML = '<span class="material-symbols-outlined" style="color:var(--color-primary)">manage_accounts</span> ' +
            'Sửa hồ sơ: ' + (formState.PersonName || formState.PersonID || '');
          btnSave.innerHTML = '<span class="material-symbols-outlined">save</span> Lưu Thông Tin';
          btnSave.onclick = _onSaveData;
          _renderTabContent();
        };

        _renderTabContent();
      } else {
        btnClose.click();
      }
    };

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';

    var _onSaveData = function () {
      _collectData();
      if (saveData) {
        // Build fakeBody with only changed fields to prevent trigger crashes
        var fakeBody = document.createElement('div');
        Object.keys(formState).forEach(function (key) {
          var newValue = formState[key] !== null && formState[key] !== undefined ? String(formState[key]) : '';
          var oldValue = rowData && rowData[key] !== null && rowData[key] !== undefined ? String(rowData[key]) : '';

          if (newValue !== oldValue || key === 'PersonID' || key === 'UserAutoID') {
            var inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = key;
            inp.value = newValue;
            fakeBody.appendChild(inp);
          }
        });

        var fakeModal = {
          close: function () { btnClose.click(); },
          closeNow: function () { btnClose.click(); }
        };

        // _saveData signature: isEdit, rowData, modal, body, btnSave
        saveData(true, rowData, fakeModal, fakeBody, btnSave);
      }
    };

    if (isViewMode) {
      btnSave.innerHTML = '<span class="material-symbols-outlined">edit</span> Sửa';
      btnSave.onclick = function () {
        isViewMode = false;
        title.innerHTML = '<span class="material-symbols-outlined" style="color:var(--color-primary)">manage_accounts</span> ' +
          'Sửa hồ sơ: ' + (formState.PersonName || formState.PersonID || '');
        btnSave.innerHTML = '<span class="material-symbols-outlined">save</span> Lưu Thông Tin';
        btnSave.onclick = _onSaveData;
        _renderTabContent();
      };
    } else {
      btnSave.innerHTML = '<span class="material-symbols-outlined">save</span> Lưu Thông Tin';
      btnSave.onclick = _onSaveData;
    }

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);
    dialog.appendChild(footer);
    document.body.appendChild(overlay);

    function _collectData() {
      dialog.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name && el.type !== 'button' && el.type !== 'file') {
          formState[el.name] = el.value;
        }
      });
    }

    function _renderFields(fieldNames, container, schema, state) {
      fieldNames.forEach(function (fn) {
        var field = schema.find(function (f) { return f.name === fn; });
        if (!field) return;

        var fCopy = Object.assign({}, field);
        fCopy.value = state[fn] || '';
        fCopy.readOnly = isViewMode ? true : fCopy.isReadOnlyEdit;

        // Lắng nghe sự kiện đổi chi nhánh để cập nhật mã nhân viên (Edit mode)
        if (fn === 'BranchID') {
          setTimeout(function () {
            var hiddenIn = container.querySelector('input[type="hidden"][name="BranchID"]');
            if (hiddenIn) {
              hiddenIn.addEventListener('change', function (e) {
                if (isEdit) return; // Không tự động đổi Mã nhân viên khi đang Sửa hồ sơ

                var newBranch = e.target.value;
                if (!newBranch) return;

                var pidInput = container.querySelector('input[name="PersonID"]');
                if (pidInput) pidInput.value = 'Đang tính toán...';

                var apiUrl = moduleConfig.ApiSearch || ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router');
                _resolveNextPersonID(newBranch, apiUrl, currentUser, moduleConfig, function (nextCode, maVietTat, err) {
                  if (err || !nextCode) {
                    if (window.UIToast) UIToast.show('Lỗi tính mã nhân viên mới: ' + (err ? err.message : ''), 'error');
                    if (pidInput) pidInput.value = state['PersonID'] || '';
                    return;
                  }
                  state['PersonID'] = nextCode;
                  state['MaVietTat'] = maVietTat;
                  if (pidInput) {
                    pidInput.value = nextCode;
                    pidInput.style.backgroundColor = 'var(--color-primary-light, rgba(67,56,202,0.1))';
                    setTimeout(function () { pidInput.style.backgroundColor = ''; }, 1000);
                  }
                });
              });
            }
          }, 0);
        }

        if (fn === 'GioiTinh') { fCopy.renderRule = 'sl'; fCopy.dataSource = 'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác'; }
        if (fn === 'PersonStatus') { fCopy.renderRule = 'sl'; fCopy.dataSource = 'API_ComboPersonStatus'; }

        var inputEl;
        if (fCopy.renderRule === 'sw' || fCopy.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(fCopy);
        } else if (fCopy.renderRule === 'dt' || fCopy.renderRule === 'date' || fCopy.renderRule === 'd') {
          inputEl = UIInput.createDate(fCopy);
        } else if (fCopy.renderRule === 'tm' || fCopy.renderRule === 'time') {
          inputEl = UIInput.createTime(fCopy);
        } else if (fCopy.renderRule === 'sl' || fCopy.renderRule === 'select') {
          inputEl = _buildSelectFieldEdit(fCopy);
        } else if (fCopy.renderRule === 'ta' || fCopy.renderRule === 'textarea') {
          inputEl = UIInput.createTextarea ? UIInput.createTextarea(fCopy) : UIInput.createText(fCopy);
        } else {
          inputEl = UIInput.createText(fCopy);
        }

        var isFullWidth = String(fCopy.position) === 'body' || String(fCopy.position) === '12' ||
          fn.toLowerCase().includes('diachi') || fn.toLowerCase().includes('ghichu') ||
          fn.toLowerCase().includes('mota') || fCopy.renderRule === 'ta' || fCopy.renderRule === 'textarea';

        var colClass = isFullWidth ? 'df-col-12' : 'df-col-6';
        if (container.classList.contains('two-cols') && !isFullWidth) {
          colClass = '';
        }

        var wrapper = document.createElement('div');
        if (colClass) wrapper.className = colClass;
        wrapper.appendChild(inputEl);
        container.appendChild(wrapper);
      });
    }

    function _buildSelectFieldEdit(field) {
      var fgw = document.createElement('div');
      fgw.className = 'form-group';
      if (field.label) {
        var lbl = document.createElement('label');
        lbl.innerText = field.label;
        if (field.required) lbl.innerHTML += ' <span style="color:var(--color-danger)">*</span>';
        fgw.appendChild(lbl);
      }
      var hiddenIn = document.createElement('input');
      hiddenIn.type = 'hidden';
      hiddenIn.name = field.name;
      hiddenIn.value = field.value || '';
      fgw.appendChild(hiddenIn);

      var ds = field.dataSource || '';
      if (field.name === 'BranchID' && userBranches && userBranches.length > 0) {
        ds = 'STATIC:' + userBranches.map(function (b) {
          return b.id + '|' + (b.name || b.id);
        }).join(',');
      }
      if (ds.toUpperCase().startsWith('STATIC:')) {
        var staticData = ds.substring(7).split(',').map(function (s) {
          var p = s.split('|'); return [p[0], p[1] || p[0]];
        });
        var opts = {
          placeholder: '-- Vui lòng chọn --',
          headers: ['Mã', 'Tên'],
          disabled: field.readOnly,
          onSearch: function (q) {
            return Promise.resolve({
              headers: ['Mã', 'Tên'],
              data: q ? staticData.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; }) : staticData,
              colFilterIndex: 1
            });
          },
          onSelect: function (row) {
            hiddenIn.value = row[0];
            formState[field.name] = row[0];
            hiddenIn.dispatchEvent(new Event('change', { bubbles: true }));
          }
        };
        var combo = UIControls.createDataComboBox(opts);
        var matched = staticData.find(function (r) { return r[0] == field.value; });
        var dIn = combo.querySelector('input.ui-input');
        if (matched && dIn) dIn.value = matched[1];
        fgw.appendChild(combo);
      } else if (ds) {
        var endpointRaw = ds.indexOf('|') > -1 ? ds.split('|')[0] : ds;
        var baseUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '');
        var finalUrl = baseUrl + '/api/API_Gateway_Router';
        var fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View', UserName: currentUser };

        var searchApiCall = function (q) {
          var pl = Object.assign({}, fetchPayload);
          if (q) pl.Keyword = q;
          return ApiClient.post(finalUrl, pl).then(function (res) {
            var list = res.list || res.records || [];
            if (!list.length) return { headers: ['Mã', 'Tên'], data: [], colFilterIndex: 1 };
            var keys = Object.keys(list[0]);

            var comboData = [];

            var displayKeys = keys;
            if (field.hiddenColumns && Array.isArray(field.hiddenColumns)) {
              var hcols = field.hiddenColumns.map(function (c) { return c.toUpperCase(); });
              displayKeys = keys.filter(function (k) { return hcols.indexOf(k.toUpperCase()) === -1; });
            }

            list.forEach(function (d) {
              var rowData = [];
              displayKeys.forEach(function (k) { rowData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
              comboData.push(rowData);
            });

            var labelRegex = /name|tên|ten|label|desc|title/i;
            var displayKey = displayKeys.find(function (k) { return labelRegex.test(k); });
            var colFilterIndex;
            if (displayKey) {
              colFilterIndex = displayKeys.indexOf(displayKey);
            } else {
              var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;
              var validIdx = -1;
              for (var i = 1; i < displayKeys.length; i++) {
                if (!hideRegex.test(displayKeys[i])) { validIdx = i; break; }
              }
              colFilterIndex = validIdx !== -1 ? validIdx : 0;
            }

            return {
              headers: displayKeys,
              data: comboData,
              colFilterIndex: colFilterIndex,
              forceMultiColumn: displayKeys.length > 1
            };
          });
        };

        var lazyCombo = UIControls.createDataComboBox({
          placeholder: '-- Vui lòng chọn --',
          showAddNew: (typeof moduleConfig !== 'undefined' && moduleConfig.HideAddNewInDropdowns) ? false : true,
          headers: ['Mã', 'Tên'],
          disabled: field.readOnly,
          onSearch: searchApiCall,
          onSelect: function (row) {
            hiddenIn.value = row[0];
            formState[field.name] = row[0];
            hiddenIn.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        if (field.value) {
          searchApiCall('').then(function (res) {
            var displayInput = lazyCombo.querySelector('input.ui-input');
            var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
            if (matched && displayInput) {
              displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
            }
          }).catch(function (err) {
            console.error('[WizardForm] DataComboBox initial fetch error:', err);
            var displayInput = lazyCombo.querySelector('input.ui-input');
            if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
          });
        }
        fgw.appendChild(lazyCombo);
      }
      return fgw;
    }
  }

  return { open: open };
})();


/* --- DynamicFormEngine.js --- */
/**
 * Dynamic Form Engine - Generic Metadata-Driven UI Engine
 */
window.DynamicFormEngine = (function () {

  var $container = null;
  var gridData = [];
  var selectedRows = [];
  var lastSelectedIdx = -1;
  var activeDetailTabIdx = 0;
  var _inlineEditMode = false;
  var _lastDetailRowId = null;

  var currentKeyword = '';
  var currentSortCol = '';
  var currentSortDir = '';
  var currentPage = 1;
  var currentLimit = 15;
  var totalRecords = 0;
  var totalPagesFromApi = 0;
  var lastTimestamp = '';

  // Lưu trữ state (page, sort, filter) theo từng FormName để giữ vết khi chuyển lại
  var moduleStates = {};
  var currentFormName = '';

  // Dữ liệu Từ điển lấy từ API (Database)
  var globalDictionary = {};
  var globalFormSchema = [];
  var globalRenderers = {};

  var defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";

  // Khôi phục moduleStates từ sessionStorage nếu có (để giữ filter khi F5)
  try {
    var cachedStates = sessionStorage.getItem('DynamicFormEngine_States');
    if (cachedStates) moduleStates = JSON.parse(cachedStates);
  } catch (e) { }

  function _saveModuleStates() {
    try {
      sessionStorage.setItem('DynamicFormEngine_States', JSON.stringify(moduleStates));
    } catch (e) { }
  }

  var MODULE_CONFIG = {};

  // ── Helpers ──────────────────────────────────────────────
  function _currentGroup() {
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    return MetadataModuleConfig.getUserGroupId(u);
  }

  function _currentUser() {
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    return u.Username || u.UserName || u.username || '';
  }

  /**
   * Lấy danh sách chi nhánh được gán cho user hiện tại.
   * Đọc từ pmql_user.BranchID (lưu trong bảng SY_User).
   * BranchID có thể là 1 giá trị hoặc comma-separated: "COBI, DONGDU, ESTELLA".
   * Nếu BranchID = NULL/rỗng và user là admin → trả về toàn bộ chi nhánh.
   * Trả về Array<{ id: string, name: string }>
   */
  function _getUserBranches() {
    try {
      var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
      var branchRaw = (u.BranchID || u.branchID || u.branchId || u.Branch || '').toString().trim();
      var isAdmin = MetadataModuleConfig.isAdminUser(u);

      // Load ALL_BRANCHES từ local storage
      var sysBranches = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('sys_branches', '[]') : localStorage.getItem('pmql_sys_branches')) || '[]');
      var ALL_BRANCHES = sysBranches.map(function (b) {
        return {
          id: (b.BranchID || b.branchID || b.branchId || '').toString().trim(),
          name: (b.BranchName || b.branchName || b.BranchName || b.BranchID || '').toString().trim()
        };
      }).filter(function (b) { return !!b.id; });

      // Nếu là Admin, trả về toàn bộ chi nhánh.
      if (isAdmin) return ALL_BRANCHES;

      // NẾU TÀI KHOẢN KHÔNG PHẢI ADMIN MÀ BRANCH BỊ RỖNG:
      // Tức là API chưa trả về hoặc DB chưa gán. Không được phép trả về ALL_BRANCHES!
      if (!branchRaw) return [];

      // Parse BranchID: "COBI, DONGDU, ESTELLA" → [{ id, name }, ...]
      return branchRaw
        .split(',')
        .map(function (s) { return s.trim().toUpperCase(); })
        .filter(function (s) { return !!s; })
        .map(function (id) {
          var found = ALL_BRANCHES.find(function (b) { return b.id.toUpperCase() === id; });
          return found ? found : { id: id, name: id };
        });
    } catch (e) {
      return [];
    }
  }


  /**
   * Đọc giá trị boolean từ API field có thể trả về camelCase hoặc PascalCase
   * và có thể là '1'/true/1 hoặc '0'/false/0
   * @param {*} camel  - item.showInAdd, item.required ...
   * @param {*} pascal - item.ShowInAdd, item.IsRequired ...
   */
  function _bool(camel, pascal) {
    return String(camel) === '1' || camel === true || String(pascal) === '1' || pascal === true;
  }

  /**
   * Gọi API tuần tự cho mảng payload (tránh sập API khi gửi đồng loạt)
   * @param {string}   endpoint  - API URL
   * @param {Array}    payloads  - Mảng payload cần gọi lần lượt
   * @param {Function} onDone    - Gọi khi tất cả xong, nhận (successCount)
   * @param {Function} [onError] - Gọi khi 1 payload lỗi, nhận (err, payload, index)
   *                               Nếu return false → dừng chuỗi. Mặc định tiếp tục.
   */
  function _sendSequential(endpoint, payloads, onDone, onError) {
    var successCount = 0;
    function _next(i) {
      if (i >= payloads.length) { onDone(successCount); return; }
      ApiClient.post(endpoint, payloads[i])
        .then(function (res) {
          if (res && res.code === 0) successCount++;
          _next(i + 1);
        })
        .catch(function (err) {
          var stop = typeof onError === 'function' && onError(err, payloads[i], i) === false;
          if (!stop) _next(i + 1);
        });
    }
    _next(0);
  }

  /** Kiểm tra form hiện tại có phải Form Builder không */
  function _isFormBuilder() {
    return String(MODULE_CONFIG.FormName).toLowerCase() === 'frmformbuilder';
  }

  /**
   * Bật/tắt trạng thái loading trên nút bấm
   * @param {HTMLElement} btn
   * @param {boolean}     loading
   * @param {string}      [originalHTML] - HTML gốc để restore khi loading=false
   */
  function _setBtnLoading(btn, loading, originalHTML) {
    if (loading) {
      btn._originalHTML = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';
      btn.disabled = true;
    } else {
      btn.innerHTML = originalHTML || btn._originalHTML || btn.innerHTML;
      btn.disabled = false;
    }
  }

  /**
   * Áp giá trị mặc định cho object — chỉ ghi nếu chưa có (giống pattern X = X || default)
   * @param {Object} obj      - Object cần áp mặc định (ví dụ: MODULE_CONFIG)
   * @param {Object} defaults - Các giá trị mặc định { key: value }
   */
  function _setDefaults(obj, defaults) {
    Object.keys(defaults).forEach(function (k) {
      if (!obj[k]) obj[k] = defaults[k];
    });
  }

  /** Lưu selectedRows vào sessionStorage (silent fail) */
  function _saveSelectedRows() {
    try {
      sessionStorage.setItem('selectedRows_' + MODULE_CONFIG.FormName, JSON.stringify(selectedRows));
    } catch (e) { }
  }

  /** Đọc selectedRows từ sessionStorage (silent fail, trả mảng rỗng nếu lỗi) */
  function _loadSelectedRows() {
    selectedRows = [];
  }

  /**
   * Phóng to hình ảnh trong một lightbox overlay đẹp mắt
   * @param {string} imgSrc - URL hoặc Base64 của ảnh
   */
  function _showImageZoom(imgSrc) {
    if (!imgSrc || imgSrc.indexOf('data:image/svg+xml') === 0) return;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:zoom-out;opacity:0;transition:opacity 0.2s ease-out;';

    var zoomImg = document.createElement('img');
    zoomImg.src = imgSrc;
    zoomImg.style.cssText = 'max-width:88vw;max-height:88vh;object-fit:contain;border-radius:10px;box-shadow:0 16px 56px rgba(0,0,0,0.7);transform:scale(0.88);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);';

    overlay.appendChild(zoomImg);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      zoomImg.style.transform = 'scale(1)';
    });

    overlay.onclick = function () {
      overlay.style.opacity = '0';
      zoomImg.style.transform = 'scale(0.88)';
      setTimeout(function () { overlay.remove(); }, 220);
    };
  }

  function _renderAttachmentsTab(tabDef, container, isEditable, row) {
    container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải tệp đính kèm...</div>';
    var pkField = MODULE_CONFIG.PrimaryKey || 'PersonID';
    var pkVal = row[pkField] || '';
    var filterData = {};
    filterData[tabDef.filterField || pkField] = pkVal;

    function _getContentAsBlobUrl(fileItem) {
      var content = fileItem.Content || fileItem.content || fileItem.Base64Content || fileItem.base64Content || '';
      if (!content) return '';

      var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
      var mime = 'application/octet-stream';
      if (ext === 'pdf') mime = 'application/pdf';
      else if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'webp') mime = 'image/webp';

      try {
        if (/^0x/i.test(content)) {
          var hexStr = content.replace(/^0x/i, '').replace(/\s/g, '');
          var bytes = new Uint8Array(hexStr.length / 2);
          for (var bi = 0; bi < bytes.length; bi++) {
            bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        } else {
          var cleanBase64 = content.trim();
          if (cleanBase64.indexOf(';base64,') > -1) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
          }
          var binaryStr = window.atob(cleanBase64);
          var bytes = new Uint8Array(binaryStr.length);
          for (var i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.error('[ATTACHMENT ERROR] Failed to convert content to blob url:', e);
        return '';
      }
    }

    function _loadAttachments() {
      var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };
      ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
        var data = res.list || res.records || [];
        container.innerHTML = '';

        // 1. Container cho danh sách tệp đính kèm
        var listWrap = document.createElement('div');
        listWrap.className = 'attachments-list';
        listWrap.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto;';

        if (data.length === 0) {
          var empty = document.createElement('div');
          empty.style.cssText = 'color: var(--color-text-secondary); text-align: center; padding: 20px; font-size: 13px; border: 1px dashed var(--color-border); border-radius: 8px;';
          empty.textContent = 'Chưa có tệp hay ảnh đính kèm nào cho hợp đồng này.';
          listWrap.appendChild(empty);
        } else {
          data.forEach(function (fileItem) {
            var card = document.createElement('div');
            card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; background: var(--color-surface);';

            // Left: Icon/Thumbnail + Info
            var leftArea = document.createElement('div');
            leftArea.style.cssText = 'display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;';

            var iconWrap = document.createElement('div');
            iconWrap.style.cssText = 'width: 40px; height: 40px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--color-background, #f1f5f9); flex-shrink: 0;';

            var blobUrl = _getContentAsBlobUrl(fileItem);
            var isImage = parseInt(fileItem.FileType) === 1 || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileItem.FileName);
            if (isImage && blobUrl) {
              // Hiển thị ảnh thumbnail thực tế từ Blob URL
              var thumb = document.createElement('img');
              thumb.src = blobUrl;
              thumb.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: zoom-in;';
              thumb.addEventListener('click', function () { _showImageZoom(blobUrl); });
              iconWrap.appendChild(thumb);
            } else {
              var icon = document.createElement('span');
              icon.className = 'material-symbols-outlined';
              icon.style.fontSize = '24px';
              icon.style.color = isImage ? 'var(--color-success)' : 'var(--color-primary)';
              icon.innerText = isImage ? 'image' : (/\.(pdf)$/i.test(fileItem.FileName) ? 'picture_as_pdf' : 'description');
              iconWrap.appendChild(icon);
            }

            var infoArea = document.createElement('div');
            infoArea.style.cssText = 'display: flex; flex-direction: column; gap: 2px; min-width: 0;';

            var nameSpan = document.createElement('span');
            nameSpan.textContent = fileItem.FileName || 'Chưa đặt tên';
            nameSpan.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';

            var metaSpan = document.createElement('span');
            var kbSize = fileItem.FileSize ? (parseFloat(fileItem.FileSize) / 1024).toFixed(1) + ' KB' : '—';
            metaSpan.textContent = kbSize + ' | STT: ' + (fileItem.STT || '—');
            metaSpan.style.cssText = 'font-size: 11px; color: var(--color-text-secondary);';

            infoArea.appendChild(nameSpan);
            infoArea.appendChild(metaSpan);

            leftArea.appendChild(iconWrap);
            leftArea.appendChild(infoArea);

            // Right: Actions (Download & Preview & Delete)
            var actions = document.createElement('div');
            actions.style.cssText = 'display: flex; gap: 4px;';

            if (blobUrl) {
              // Icon mắt (Xem trước/Preview) cho Ảnh hoặc PDF
              var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
              var isPdf = ext === 'pdf';
              if (isImage || isPdf) {
                var btnPreview = document.createElement('button');
                btnPreview.type = 'button';
                btnPreview.className = 'btn btn-icon';
                btnPreview.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-success); display: flex; align-items: center;';
                btnPreview.title = 'Xem trực tiếp';
                btnPreview.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>';
                btnPreview.onclick = function () {
                  if (isImage) {
                    _showImageZoom(blobUrl);
                  } else if (isPdf) {
                    window.open(blobUrl, '_blank');
                  }
                };
                actions.appendChild(btnPreview);
              }

              var btnDownload = document.createElement('button');
              btnDownload.type = 'button';
              btnDownload.className = 'btn btn-icon';
              btnDownload.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-primary); display: flex; align-items: center;';
              btnDownload.title = 'Tải xuống';
              btnDownload.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">download</span>';
              btnDownload.onclick = function () {
                var a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileItem.FileName || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              };
              actions.appendChild(btnDownload);
            }

            // CHỈ HIỂN THỊ NÚT XÓA KHI ĐƯỢC PHÉP CHỈNH SỬA
            if (isEditable) {
              var btnDelete = document.createElement('button');
              btnDelete.type = 'button';
              btnDelete.className = 'btn btn-icon';
              btnDelete.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-danger); display: flex; align-items: center;';
              btnDelete.title = 'Xóa tệp';
              btnDelete.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">delete</span>';
              btnDelete.onclick = function () {
                if (typeof ConfirmModal !== 'undefined') {
                  ConfirmModal.show({
                    title: 'Xóa tệp đính kèm',
                    message: 'Bạn có chắc chắn muốn xóa tệp "' + fileItem.FileName + '" không?',
                    onConfirm: function () {
                      var delPayload = {
                        List: tabDef.api,
                        Func: 'Delete',
                        Ids: fileItem.UserAutoID,
                        JsonData: JSON.stringify({ UserAutoID: fileItem.UserAutoID })
                      };
                      ApiClient.post('/api/API_Gateway_Router', delPayload).then(function (delRes) {
                        if (delRes.code === 0 || delRes.code === '0') {
                          UIToast.show('Xóa tệp thành công!', 'success');
                          _loadAttachments();
                        } else {
                          Alert.error('Lỗi', delRes.msg || 'Không thể xóa tệp');
                        }
                      }).catch(function (err) {
                        Alert.error('Lỗi', 'Không thể kết nối máy chủ');
                      });
                    }
                  });
                }
              };
              actions.appendChild(btnDelete);
            }

            card.appendChild(leftArea);
            card.appendChild(actions);
            listWrap.appendChild(card);
          });
        }
        container.appendChild(listWrap);

        // CHỈ HIỂN THỊ VÙNG TẢI LÊN KHI ĐƯỢC PHÉP CHỈNH SỬA
        if (isEditable) {
          var uploadZoneWrap = document.createElement('div');
          uploadZoneWrap.style.cssText = 'border: 1px dashed var(--color-border-strong); border-radius: 8px; padding: 16px; background: var(--color-surface); display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;';

          if (typeof UIFileUpload !== 'undefined') {
            var fileUploadEl = UIFileUpload.create({
              id: 'attach-upload-input',
              text: 'Kéo thả tệp/ảnh hoặc click để tải lên',
              hint: 'Hỗ trợ: PDF, JPG, PNG... Tối đa 10MB',
              onChange: function (file) {
                _uploadFileToServer(file);
              }
            });
            uploadZoneWrap.appendChild(fileUploadEl);
          }
          container.appendChild(uploadZoneWrap);
        }
      }).catch(function (err) {
        container.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải danh sách tệp đính kèm</div>';
      });
    }

    function _uploadFileToServer(file) {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        Alert.error('Tệp quá lớn', 'Hệ thống chỉ hỗ trợ tệp tối đa 10MB.');
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var arrayBuffer = e.target.result;
        var bytes = new Uint8Array(arrayBuffer);
        var hexArray = [];
        for (var i = 0; i < bytes.length; i++) {
          var hexVal = bytes[i].toString(16);
          if (hexVal.length < 2) hexVal = '0' + hexVal;
          hexArray.push(hexVal);
        }
        var hexStr = '0x' + hexArray.join('');

        var base64Reader = new FileReader();
        base64Reader.onload = function (bEvent) {
          var dataUrl = bEvent.target.result;
          var base64Content = dataUrl.split(',')[1] || dataUrl;

          var ext = file.name.split('.').pop().toLowerCase();
          var isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) >= 0;
          var fileTypeNum = isImg ? 1 : 0;

          var previewHtml = '';
          if (isImg) {
            previewHtml = `
              <div style="margin: 12px 0; text-align: center;">
                <img src="${dataUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/>
              </div>
            `;
          } else {
            var iconName = ext === 'pdf' ? 'picture_as_pdf' : 'description';
            var iconColor = ext === 'pdf' ? 'var(--color-danger)' : 'var(--color-primary)';
            previewHtml = `
              <div style="margin: 12px 0; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--color-background, #f8fafc); border-radius: 6px; border: 1px solid var(--color-border);">
                <span class="material-symbols-outlined" style="font-size: 32px; color: ${iconColor};">${iconName}</span>
                <span style="font-weight: 500; font-size: 13px; color: var(--color-text); word-break: break-all;"> Định dạng: ${ext.toUpperCase()} </span>
              </div>
            `;
          }

          var kbSize = (file.size / 1024).toFixed(1) + ' KB';
          var confirmMessage = `
            <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; text-align: left;">
              Bạn có chắc chắn muốn tải tệp này lên không?
              <div style="margin-top: 10px; padding: 10px; background: var(--color-background, #f1f5f9); border-radius: 6px; border: 1px solid var(--color-border); font-family: monospace; font-size: 12px; color: var(--color-text); word-break: break-all;">
                <strong>Tên file:</strong> ${file.name}<br/>
                <strong>Dung lượng:</strong> ${kbSize}
              </div>
              ${previewHtml}
            </div>
          `;

          ConfirmModal.show({
            title: 'Xác nhận tải tệp lên',
            message: confirmMessage,
            confirmText: 'Tải lên',
            confirmClass: 'btn-primary',
            onConfirm: function () {
              _executeUpload(file, hexStr, base64Content, fileTypeNum);
            }
          });
        };
        base64Reader.readAsDataURL(file);
      };
      reader.readAsArrayBuffer(file);
    }

    function _executeUpload(file, hexStr, base64Content, fileTypeNum) {
      var payloadCount = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };
      ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payloadCount).then(function (cntRes) {
        var currentItems = cntRes.list || cntRes.records || [];
        var nextSTT = currentItems.length + 1;

        var savePayload = {
          List: tabDef.api,
          Func: 'Save',
          JsonData: JSON.stringify({
            IsEdit: 0,
            MaHopDong: pkVal,
            FileName: file.name,
            FileType: fileTypeNum,
            STT: nextSTT,
            FileSize: file.size,
            Base64Content: base64Content,
            Content: hexStr
          })
        };

        container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang lưu tài liệu lên máy chủ...</div>';
        ApiClient.post('/api/API_Gateway_Router', savePayload).then(function (saveRes) {
          if (saveRes.code === 0 || saveRes.code === '0') {
            UIToast.show('Tải tệp đính kèm lên thành công!', 'success');
            _loadAttachments();
          } else {
            Alert.error('Lỗi lưu tệp', saveRes.msg || 'Không thể lưu tệp lên CSDL.');
            _loadAttachments();
          }
        }).catch(function (err) {
          Alert.error('Lỗi', 'Không thể kết nối đến máy chủ.');
          _loadAttachments();
        });
      }).catch(function () {
        _loadAttachments();
      });
    }

    _loadAttachments();
  }

  /**
   * Khởi tạo payload chuẩn cho API: clone base, áp user + isEdit flag
   * @param {Object}  base   - Dữ liệu gốc (formInputData hoặc targetRow)
   * @param {boolean} isEdit - true = edit, false = add
   * @returns {Object} payload đã gắn UserName, UserCreate, IsEdit
   */
  function _buildPayload(base, isEdit) {
    var p = Object.assign({}, base);
    var hasBusinessUserName = globalFormSchema.some(function (field) {
      if (String(field.name || '').toLowerCase() !== 'username') return false;
      return isEdit ? _bool(field.showInEdit) : _bool(field.showInAdd);
    });
    if (!hasBusinessUserName) p.UserName = _currentUser();
    p.UserCreate = _currentUser();
    p.IsEdit = isEdit ? 1 : 0;
    return p;
  }

  function _findFieldKey(keys, configuredName) {
    if (!configuredName) return '';
    var normalized = String(configuredName).toLowerCase();
    return keys.find(function (key) { return key.toLowerCase() === normalized; }) || '';
  }

  function _normalizeRenderRule(rule) {
    var normalized = String(rule || '').toLowerCase().trim();
    var aliases = {
      cb: 'sl',
      combo: 'sl',
      dropdown: 'sl',
      dropcheck: 'sl'
    };
    return aliases[normalized] || normalized;
  }

  function _buildOptionTable(dataList, field, maxCols) {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      return { keys: [], headers: ['Mã', 'Tên'], data: [], colFilterIndex: 1 };
    }

    var keys = Object.keys(dataList[0]);
    if (field.hiddenColumns && Array.isArray(field.hiddenColumns)) {
      var hidden = field.hiddenColumns.map(function (name) { return String(name).toLowerCase(); });
      keys = keys.filter(function (key) { return hidden.indexOf(key.toLowerCase()) === -1; });
    }

    var valueKey = _findFieldKey(keys, field.valueField) || keys[0];
    var labelKey = _findFieldKey(keys, field.labelField) || keys.find(function (key) {
      return /name|tên|ten|label|desc|title/i.test(key) && key !== valueKey;
    }) || keys.find(function (key) { return key !== valueKey; }) || valueKey;

    var orderedKeys = [valueKey];
    if (labelKey !== valueKey) orderedKeys.push(labelKey);
    keys.forEach(function (key) {
      if (orderedKeys.indexOf(key) === -1) orderedKeys.push(key);
    });
    if (maxCols > 0) orderedKeys = orderedKeys.slice(0, maxCols);

    var headers = orderedKeys.map(function (key) {
      if (typeof currentDictionary !== 'undefined') {
        var dictionaryKey = Object.keys(currentDictionary).find(function (candidate) {
          return candidate.toLowerCase() === key.toLowerCase();
        });
        if (dictionaryKey && currentDictionary[dictionaryKey]) {
          return currentDictionary[dictionaryKey].CaptionVN || currentDictionary[dictionaryKey];
        }
      }
      return key;
    });

    return {
      keys: orderedKeys,
      headers: headers,
      data: dataList.map(function (row) {
        return orderedKeys.map(function (key) {
          return row[key] !== null && row[key] !== undefined ? row[key] : '';
        });
      }),
      colFilterIndex: Math.max(0, orderedKeys.indexOf(labelKey))
    };
  }

  function _hasPermission(action) {
    if (typeof window.AppPermissions !== 'undefined') {
      var module = MODULE_CONFIG.FormName;
      if (action === 'ADD') return window.AppPermissions.hasPermission(module, 'IsAdd');
      if (action === 'EDIT') return window.AppPermissions.hasPermission(module, 'IsUpdate');
      if (action === 'DELETE') return window.AppPermissions.hasPermission(module, 'IsDelete');
      if (action === 'EXPORT') return window.AppPermissions.hasPermission(module, 'isExportExcel');
    }

    if (typeof Permission !== 'undefined') {
      var module = MODULE_CONFIG.FormName;
      if (action === 'ADD') return Permission.canAdd(module);
      if (action === 'EDIT') return Permission.canEdit(module);
      if (action === 'DELETE') return Permission.canDelete(module);
    }

    return true; // Fallback an toàn nếu chưa cấu hình
  }

  // ── Render ────────────────────────────────────────────────
  function render(container, config) {
    if (!container || !config) {
      console.error('DynamicFormEngine: Missing container or config');
      return;
    }

    // 1. Lưu lại state của module hiện tại trước khi chuyển sang module mới
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
    }

    $container = container;
    MODULE_CONFIG = config;
    currentFormName = config.FormName;

    // 2. Khôi phục state của module mới (nếu đã từng vào trước đó)
    var savedState = moduleStates[currentFormName];
    if (savedState) {
      currentKeyword = savedState.keyword;
      currentSortCol = savedState.sortCol;
      currentSortDir = savedState.sortDir;
      currentPage = savedState.page;
      window.currentFilters = savedState.filters;
    } else {
      // Nếu chưa từng vào thì reset về mặc định
      currentKeyword = '';
      currentSortCol = '';
      currentSortDir = '';
      currentPage = 1;
      window.currentFilters = null;
    }

    // Reset sạch sẽ Dictionary & Schema của Form cũ để tránh lây nhiễm (ví dụ API form mới bị lỗi thì không hiện rác của form cũ)
    globalDictionary = {};
    globalFormSchema = [];
    globalRenderers = {};

    // API defaults: FormBuilder dùng API chuyên biệt, các form khác dùng generic No-Code API
    _setDefaults(MODULE_CONFIG, {
      ApiSearch: '/api/API_Gateway_Router',
      ApiSave: '/api/API_Gateway_Router',
      ApiDelete: '/api/API_Gateway_Router'
    });
    _setDefaults(MODULE_CONFIG, { ApiDictionary: '/api/API_LayCacTruongGiaoDien' });

    _loadSelectedRows();


    // 1. Lấy Từ điển UI từ Database trước (Cơ chế Caching siêu tốc)
    var configEndpoint = MODULE_CONFIG.ApiDictionary;
    var cacheKey = 'FormConfigCache_' + MODULE_CONFIG.FormName;
    var cachedData = null;

    // RAM Cache cho giao diện
    if (!_isFormBuilder()) {
      try { cachedData = window._uiConfigCache ? window._uiConfigCache[cacheKey] : null; } catch (e) { }
    }

    var pConfig;
    if (cachedData) {
      pConfig = Promise.resolve(JSON.parse(cachedData));
    } else {
      pConfig = configEndpoint ? ApiClient.post(configEndpoint, { FormName: MODULE_CONFIG.FormName }).then(function (res) {
        if (res && res.code === 0 && !_isFormBuilder()) {
          window._uiConfigCache = window._uiConfigCache || {};
          window._uiConfigCache[cacheKey] = JSON.stringify(res);
        }
        return res;
      }) : Promise.resolve(null);
    }

    pConfig.then(function (resConfig) {

      // 2. Lưu Từ điển vào biến toàn cục
      var dataList = resConfig ? (resConfig.list || resConfig.records) : null;
      if (resConfig && resConfig.code === 0 && dataList) {

        // --- NO-CODE MAGIC: Đọc cấu hình cấp Form từ Record đầu tiên ---
        if (dataList.length > 0) {
          var firstRow = dataList[0];

          // Map API fields → MODULE_CONFIG (chỉ ghi nếu API trả về giá trị)
          var _rowMap = { primaryKey: 'PrimaryKey' }; // Ngừng lấy formTitle và formSubtitle để ưu tiên router
          Object.keys(_rowMap).forEach(function (src) {
            if (firstRow[src]) MODULE_CONFIG[_rowMap[src]] = firstRow[src];
          });

          // Sinh nhãn mặc định — caller có thể override từ config
          _setDefaults(MODULE_CONFIG, {
            TitleAdd: '➕ Thêm ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || 'Mới'),
            TitleEdit: '✏️ Sửa ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || ''),
            BtnSaveAdd: 'Thêm mới',
            BtnSaveEdit: 'Lưu thay đổi',
            BtnSaveAll: 'Lưu Tất Cả',
            BtnCancel: 'Hủy bỏ',
            BtnSaveSaving: 'Đang lưu...',
            ToastAdd: 'Đã thêm mới thành công!',
            ToastEdit: 'Đã cập nhật thành công!',
            ToastDelete: 'Xóa thành công!',
            WarnMissingInfo: 'Thiếu thông tin',
            WarnMissingInput: 'Vui lòng điền đầy đủ thông tin: {0}',
            WarnSelectEdit: 'Vui lòng chọn dữ liệu cần sửa',
            WarnSelectDelete: 'Vui lòng chọn dữ liệu cần xóa',
            ConfirmDelete: 'Bạn có chắc muốn xóa {0}?',
            TextDeleteFallback: 'dòng này',
            AlertTitleConfirm: 'Xác nhận xóa',
            AlertTitleWarning: 'Cảnh báo',
            AlertTitleError: 'Lỗi',
            AlertTitleInfo: 'Thông báo',
            AlertApiMissing: 'Chưa cấu hình API lưu',
            AlertSaveFailed: 'Lưu dữ liệu thất bại',
            AlertDeleteFailed: 'Xóa dữ liệu thất bại',
            AlertNetworkError: 'Lỗi kết nối mạng',
            ModalWidth: '600px'
          });
        }

        dataList.forEach(function (item) {
          // Xây Dictionary cho Table
          globalDictionary[item.name] = item.label;


          // Xây dựng Custom Renderers Động từ cấu hình DB (FormatID hoặc renderRule)
          var format = (item.formatId || item.FormatID || item.renderRule || '').toLowerCase();
          if (format === 'n' || format === 'c' || item.renderRule) {
            globalRenderers[item.name] = function (v) {
              if (format === 'n') {
                var n = parseFloat(v);
                return isNaN(n) ? (v || '') : n.toLocaleString('vi-VN');
              }
              if (format === 'c') {
                var isChecked = (v === true || v === 1 || String(v) === '1' || String(v).toLowerCase() === 'true');
                return isChecked
                  ? '<span style="color:var(--color-success); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span></span>'
                  : '<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span></span>';
              }
              if (item.renderRule) {
                var rule = item.renderRule.toLowerCase();
                if (rule === 'sw' || rule === 'boolean') {
                  var isChecked = (String(v) === '1' || String(v).toLowerCase() === 'true');
                  return isChecked
                    ? '<span style="color:var(--color-success);"><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">check_circle</span></span>'
                    : '<span style="color:var(--color-text-tertiary);">-</span>';
                }
                if (!v || v === '0' || v === 0) return (rule.indexOf('badge:') === 0 || rule === 'bg' || rule === 'br' || rule === 'bw') ? '-' : v;
                if (rule === 'bg') return '<span class="status-badge success">' + v + '</span>';
                if (rule === 'br') return '<span class="status-badge danger">' + v + '</span>';
                if (rule === 'bw') return '<span class="status-badge warning">' + v + '</span>';
                if (rule === 'cr') return '<span style="color:var(--color-danger);font-weight:600;">' + v + '</span>';
                if (rule === 'cg') return '<span style="color:var(--color-success);font-weight:600;">' + v + '</span>';
                if (rule === 'cb') return '<span style="color:var(--color-primary);font-weight:600;">' + v + '</span>';
                if (item.renderRule.indexOf('Badge:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  return '<span class="status-badge ' + color + '">' + v + '</span>';
                } else if (item.renderRule.indexOf('Color:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  var safeVal = String(v).replace(/"/g, '&quot;');
                  return '<span title="' + safeVal + '" style="color:var(--color-' + color + ');font-weight:600;">' + safeVal + '</span>';
                }
              }
              return v;
            };
          }

          // Xây Schema cho Form (Lưu toàn bộ để lấy Khóa chính)
          var rawValidate = (item.validateRule || item.ValidateRule || '').trim();
          var rawVisible = (item.visibleRule || item.VisibleRule || '').trim();

          var formulaMatch = rawValidate.match(/formula:([^|]+)/i) || rawVisible.match(/formula:([^|]+)/i);
          var triggerMatch = rawValidate.match(/trigger:([^|]+)/i) || rawVisible.match(/trigger:([^|]+)/i);

          var fieldName = item.name || item.FieldName;
          var isReadOnlyEditVal = _bool(item.isReadOnlyEdit, item.IsReadOnlyEdit);
          var isReadOnlyAddVal = _bool(item.isReadOnlyAdd, item.IsReadOnlyAdd);
          var hiddenColsVal = [];

          var finalPosition = item.FormPosition || item.formPosition || item.position || 'grid';
          var finalRenderRule = _normalizeRenderRule(item.renderRule || item.formatId || item.FormatID);
          var finalLabel = item.label || item.CaptionVN;

          var inheritedOverrides = MetadataModuleConfig.getFieldConfig(fieldName);
          var moduleOverrides = {};
          if (MODULE_CONFIG.fieldOverrides) {
            var overrideKey = Object.keys(MODULE_CONFIG.fieldOverrides).find(function (k) {
              return k.toLowerCase() === fieldName.toLowerCase();
            });
            if (overrideKey) moduleOverrides = MODULE_CONFIG.fieldOverrides[overrideKey];
          }
          var overrides = Object.assign({}, inheritedOverrides, moduleOverrides);
          if (Object.keys(overrides).length > 0) {
            if (overrides.isReadOnlyEdit !== undefined) isReadOnlyEditVal = overrides.isReadOnlyEdit;
            if (overrides.isReadOnlyAdd !== undefined) isReadOnlyAddVal = overrides.isReadOnlyAdd;
            if (overrides.required !== undefined) item.required = overrides.required;
            if (overrides.IsRequired !== undefined) item.IsRequired = overrides.IsRequired;
            if (overrides.hiddenColumns !== undefined) hiddenColsVal = overrides.hiddenColumns;
            if (overrides.renderRule !== undefined) finalRenderRule = _normalizeRenderRule(overrides.renderRule);
            if (overrides.dataSource !== undefined) item.dataSource = overrides.dataSource;
            if (overrides.dataSourceMethod !== undefined) item.dataSourceMethod = overrides.dataSourceMethod;
            if (overrides.valueField !== undefined) item.valueField = overrides.valueField;
            if (overrides.labelField !== undefined) item.labelField = overrides.labelField;
            if (overrides.allowCustomValue !== undefined) item.allowCustomValue = overrides.allowCustomValue;
            if (overrides.position !== undefined) finalPosition = overrides.position;
            if (overrides.label !== undefined) finalLabel = overrides.label;
          }

          if (MODULE_CONFIG.FormFields && Array.isArray(MODULE_CONFIG.FormFields)) {
            var ff = MODULE_CONFIG.FormFields.find(function (f) { return f.name.toLowerCase() === fieldName.toLowerCase(); });
            if (ff) {
              if (ff.isReadOnlyEdit !== undefined) isReadOnlyEditVal = ff.isReadOnlyEdit;
              if (ff.isReadOnlyAdd !== undefined) isReadOnlyAddVal = ff.isReadOnlyAdd;
              if (ff.required !== undefined) item.required = ff.required;
              if (ff.IsRequired !== undefined) item.IsRequired = ff.IsRequired;
              if (ff.hiddenColumns !== undefined) hiddenColsVal = ff.hiddenColumns;
              if (ff.renderRule !== undefined) finalRenderRule = _normalizeRenderRule(ff.renderRule);
              if (ff.dataSource !== undefined) item.dataSource = ff.dataSource;
              if (ff.dataSourceMethod !== undefined) item.dataSourceMethod = ff.dataSourceMethod;
              if (ff.valueField !== undefined) item.valueField = ff.valueField;
              if (ff.labelField !== undefined) item.labelField = ff.labelField;
              if (ff.allowCustomValue !== undefined) item.allowCustomValue = ff.allowCustomValue;
              if (ff.position !== undefined) finalPosition = ff.position;
              if (ff.label !== undefined) finalLabel = ff.label;
              if (ff.html !== undefined) item.html = ff.html;
            }
          }

          globalFormSchema.push({
            name: fieldName,
            label: finalLabel,
            required: _bool(item.required, item.IsRequired),
            showInAdd: _bool(item.showInAdd, item.ShowInAdd),
            showInEdit: _bool(item.showInEdit, item.ShowInEdit),
            showInFilter: _bool(item.showInFilter, item.ShowInFilter),
            isReadOnlyEdit: isReadOnlyEditVal,
            isReadOnlyAdd: isReadOnlyAddVal,
            position: finalPosition,
            orderNo: item.OrderNo || item.orderNo || 0,
            renderRule: finalRenderRule,
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            dataSourceMethod: String(item.dataSourceMethod || item.DataSourceMethod || 'POST').toUpperCase(),
            valueField: item.valueField || item.ValueField || '',
            labelField: item.labelField || item.LabelField || '',
            allowCustomValue: item.allowCustomValue !== false,
            validateRule: rawValidate,
            dependsOn: (item.dependsOn || item.DependsOn || '').trim(),
            visibleRule: rawVisible,
            formulaRule: formulaMatch ? formulaMatch[1].trim() : '',
            triggerApi: triggerMatch ? triggerMatch[1].trim() : '',
            hiddenColumns: hiddenColsVal,
            html: item.html
          });
        });

        // Hỗ trợ CHÈN THÊM TRƯỜNG TỰ DO (ví dụ nút bấm) từ FormFields (Chỉ chèn những trường chưa có trong DB)
        if (MODULE_CONFIG.FormFields && Array.isArray(MODULE_CONFIG.FormFields)) {
          MODULE_CONFIG.FormFields.forEach(function (cf) {
            if (!globalFormSchema.find(function (sf) { return sf.name.toLowerCase() === cf.name.toLowerCase(); })) {
              globalFormSchema.push({
                name: cf.name,
                label: cf.label || '',
                required: cf.required || false,
                showInAdd: true,
                showInEdit: true,
                showInFilter: false,
                isReadOnlyEdit: cf.isReadOnlyEdit || false,
                isReadOnlyAdd: cf.isReadOnlyAdd || false,
                position: cf.position || 'grid',
                orderNo: 999, // Xếp cuối theo mặc định
                renderRule: (cf.renderRule || '').toLowerCase().trim(),
                dataSource: cf.dataSource || '',
                dataSourceMethod: String(cf.dataSourceMethod || 'POST').toUpperCase(),
                valueField: cf.valueField || '',
                labelField: cf.labelField || '',
                allowCustomValue: cf.allowCustomValue !== false,
                html: cf.html || ''
              });
            }
          });

          // Sắp xếp lại globalFormSchema đúng theo thứ tự khai báo trong FormFields
          globalFormSchema.sort(function (a, b) {
            var idxA = MODULE_CONFIG.FormFields.findIndex(function (f) { return f.name.toLowerCase() === a.name.toLowerCase(); });
            var idxB = MODULE_CONFIG.FormFields.findIndex(function (f) { return f.name.toLowerCase() === b.name.toLowerCase(); });
            if (idxA === -1) idxA = 9999;
            if (idxB === -1) idxB = 9999;
            return idxA - idxB;
          });
        }

        if (Object.keys(globalDictionary).length === 0) {
          console.warn('API returned no fields for FormName:', MODULE_CONFIG.FormName);
        }
      } else {
        console.warn('API Dictionary fetch failed or empty', resConfig);
      }
      // Tự động sinh mã HTML (Không cần file .html rời nữa)
      if (MODULE_CONFIG.UseSplitLayout && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
        var defaultDetailTitle = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
        var defaultSelectText = MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết';
        var detailWidth = MODULE_CONFIG.SplitLayoutDetailWidth || '450px';
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div class="split-master-detail-container form-${MODULE_CONFIG.FormName}">
                <div id="dynamic-grid-container"></div>
                <div id="dynamic-detail-container" style="width: ${detailWidth}; max-width: calc(100% - 320px); flex-shrink: 0; border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; background: var(--color-surface);">
                  <button type="button" class="detail-back-btn" style="display: none; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-primary); font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 14px; align-self: flex-start; transition: all 0.2s ease;">
                    <span class="material-symbols-outlined" style="font-size: 18px; font-weight: 600;">arrow_back</span>
                    <span>Quay lại danh sách</span>
                  </button>
                  <div class="detail-header" style="margin-bottom: 12px; font-weight: 600; font-size: 15px; color: var(--color-primary); border-bottom: 2px solid var(--color-primary-light); padding: 0 4px 8px 4px;">
                    ${defaultDetailTitle}
                  </div>
                  <div id="dynamic-detail-content" style="flex: 1; overflow-y: auto;">
                    <div class="empty-detail-state">
                      <div class="empty-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div class="empty-text-main">Chưa có thông tin</div>
                      <div class="empty-text-sub">${defaultSelectText}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>
            /* Desktop / Tablet defaults */
            .split-master-detail-container {
              display: flex;
              gap: 16px;
              align-items: stretch;
            }
            #dynamic-grid-container {
              flex: 1;
              min-width: 0;
            }
            
            /* Hide detail container by default on Desktop too */
            .split-master-detail-container:not(.show-detail) #dynamic-detail-container {
              display: none !important;
            }

            .detail-back-btn {
              display: none !important;
            }
            .detail-tabs-mobile-select-wrapper {
              display: none !important;
            }

            /* Responsive styles (Mobile < 768px) */
            @media (max-width: 768px) {
              .split-master-detail-container {
                height: auto !important;
                flex-direction: column !important;
                gap: 0 !important;
              }
              
              /* Hide detail container by default on mobile */
              .split-master-detail-container #dynamic-detail-container {
                display: none !important;
              }
              .split-master-detail-container #dynamic-grid-container {
                display: block !important;
              }

              /* When a row is selected and we show detail */
              .split-master-detail-container.show-detail #dynamic-detail-container {
                display: flex !important;
                width: 100% !important;
                max-width: none !important;
                border: none !important;
                padding: 12px 16px !important;
                box-sizing: border-box !important;
                overflow: visible !important;
              }
              .split-master-detail-container.show-detail #dynamic-detail-content {
                overflow: visible !important;
              }
              .split-master-detail-container.show-detail #dynamic-grid-container {
                display: none !important;
              }

              /* Show back button when detail is shown on mobile */
              .split-master-detail-container.show-detail .detail-back-btn {
                display: inline-flex !important;
              }

              /* Hide desktop tabs and show mobile select menu */
              .split-master-detail-container .detail-tabs-bar {
                display: none !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select-wrapper {
                display: block !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select {
                appearance: none !important;
                -webkit-appearance: none !important;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
                background-repeat: no-repeat !important;
                background-position: right 14px center !important;
                background-size: 16px !important;
                padding-right: 40px !important;
                border: 1px solid var(--color-border) !important;
                background-color: var(--color-surface) !important;
                color: var(--color-text) !important;
                font-family: inherit !important;
              }

              /* Single column layout for detail fields */
              .split-master-detail-container .detail-fields-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
                padding: 16px !important;
                width: 100% !important;
                max-width: 440px !important;
                margin: 0 auto !important;
              }

              /* Put photo box on top of form columns */
              .split-master-detail-container .detail-form-wrap {
                flex-direction: column-reverse !important;
                align-items: center !important;
                gap: 20px !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper {
                width: auto !important;
                max-width: none !important;
                margin-bottom: 0 !important;
                align-self: center !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper .detail-img-frame {
                width: 120px !important;
                height: 120px !important;
              }
            }
          </style>
        `;
      } else {
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div id="dynamic-grid-container"></div>
            </div>
          </div>
        `;
      }

      // Action Toolbar (Gắn vào Global Header thay vì cục bộ)
      var globalActions = document.getElementById('global-page-actions');
      var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');

      // Xóa các nút cũ trong global header nếu có để tránh duplicate khi re-render
      if (globalActions) globalActions.innerHTML = '';

      if (btnContainer && typeof UIActionToolbar !== 'undefined') {
        var extraBtns = [];
        if (window.FormActionPlugins) {
          window.FormActionPlugins.forEach(function (plugin) {
            if (typeof plugin.getExtraButtons === 'function') {
              var getSelected = function () { return selectedRows; };
              var onReload = function () {
                _loadData();
              };
              var btns = plugin.getExtraButtons(MODULE_CONFIG.FormName, getSelected, MODULE_CONFIG, onReload);
              if (btns && btns.length > 0) extraBtns = extraBtns.concat(btns);
            }
          });
        }

        // Menu Tùy chọn bảng
        var tabulatorActionWrapper = document.createElement('div');
        tabulatorActionWrapper.className = 'tabulator-action-wrapper';
        tabulatorActionWrapper.style.cssText = 'position: relative; display: inline-flex; margin-left: auto; align-items: center;';

        var tabulatorActionBtn = document.createElement('button');
        tabulatorActionBtn.type = 'button';
        // Giao diện mềm mại, không có viền cứng, màu nền nhạt như phong cách hiện đại
        tabulatorActionBtn.className = 'btn';
        tabulatorActionBtn.style.cssText = 'display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; height: 36px; background: rgba(79, 70, 229, 0.08); color: #4f46e5; border: none; transition: background 0.2s;';
        tabulatorActionBtn.onmouseover = function () { this.style.background = 'rgba(79, 70, 229, 0.15)'; };
        tabulatorActionBtn.onmouseout = function () { this.style.background = 'rgba(79, 70, 229, 0.08)'; };
        tabulatorActionBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">table_chart</span> <span>Tùy chọn bảng</span> <span class="material-symbols-outlined" style="font-size:18px;">expand_more</span>';

        var tabulatorActionMenu = document.createElement('div');
        tabulatorActionMenu.style.cssText = 'display: none; position: absolute; right: 0; top: calc(100% + 4px); min-width: 200px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #ccc); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-radius: 8px; z-index: 9999; padding: 8px;';

        // Helper tạo item
        function createMenuItem(icon, text, action) {
          var item = document.createElement('div');
          item.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; font-size: 14px; border-radius: 6px; color: var(--color-text); transition: background 0.2s;';
          item.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px; color:var(--color-text-secondary);">' + icon + '</span><span>' + text + '</span>';
          item.onmouseover = function () { item.style.backgroundColor = 'var(--color-background, #f1f5f9)'; };
          item.onmouseout = function () { item.style.backgroundColor = 'transparent'; };
          item.onclick = function (e) {
            tabulatorActionMenu.style.display = 'none';
            action(e);
          };
          return item;
        }


        tabulatorActionMenu.appendChild(createMenuItem('view_column', 'Tùy chọn hiển thị cột', function (e) {
          var menu = document.getElementById('tabulator-col-menu');
          if (menu) {
            menu.remove();
            return;
          }

          // Backdrop để che nền (làm mờ hoặc không tùy ý, giúp click out dễ dàng)
          var backdrop = document.createElement('div');
          backdrop.id = 'tabulator-col-backdrop';
          backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.2); z-index: 10000;';

          menu = document.createElement('div');
          menu.id = 'tabulator-col-menu';
          // Modal hiển thị chính giữa màn hình
          menu.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--color-surface, #fff); border-radius: 12px; padding: 20px; z-index: 10001; box-shadow: 0 12px 32px rgba(0,0,0,0.2); width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column;';

          var headerTop = document.createElement('div');
          headerTop.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border, #eee); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;';

          var title = document.createElement('div');
          title.textContent = 'Ẩn / Hiện Cột';
          title.style.cssText = 'font-weight: 600; font-size: 16px;';
          headerTop.appendChild(title);

          var actionBtns = document.createElement('div');
          actionBtns.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; flex: 1; justify-content: flex-end;';

          var btnSelectAll = document.createElement('button');
          btnSelectAll.type = 'button';
          btnSelectAll.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('check_box', 'font-size:16px; margin-right:4px;') : '') + 'Chọn tất cả';
          btnSelectAll.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px solid var(--color-border-strong, #e2e8f0); border-radius: 6px; background: transparent; color: var(--color-text, #1e293b); cursor: pointer; transition: all 0.2s;';
          btnSelectAll.onmouseover = function () { this.style.borderColor = 'var(--color-primary, #4338ca)'; this.style.color = 'var(--color-primary, #4338ca)'; this.style.background = 'var(--color-primary-light, rgba(79, 70, 229, 0.05))'; };
          btnSelectAll.onmouseout = function () { this.style.borderColor = 'var(--color-border-strong, #e2e8f0)'; this.style.color = 'var(--color-text, #1e293b)'; this.style.background = 'transparent'; };

          var btnDeselectAll = document.createElement('button');
          btnDeselectAll.type = 'button';
          btnDeselectAll.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('check_box_outline_blank', 'font-size:16px; margin-right:4px;') : '') + 'Bỏ chọn';
          btnDeselectAll.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px solid var(--color-border-strong, #e2e8f0); border-radius: 6px; background: transparent; color: var(--color-text-secondary, #64748b); cursor: pointer; transition: all 0.2s;';
          btnDeselectAll.onmouseover = function () { this.style.borderColor = 'var(--color-text-secondary, #64748b)'; this.style.background = 'var(--color-border, #f1f5f9)'; };
          btnDeselectAll.onmouseout = function () { this.style.borderColor = 'var(--color-border-strong, #e2e8f0)'; this.style.background = 'transparent'; };

          var btnReset = document.createElement('button');
          btnReset.type = 'button';
          btnReset.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('restart_alt', 'font-size:16px; margin-right:4px;') : '') + 'Mặc định';
          btnReset.title = 'Khôi phục cột về mặc định ban đầu';
          btnReset.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px dashed var(--color-danger, #f43f5e); border-radius: 6px; background: transparent; color: var(--color-danger, #f43f5e); cursor: pointer; transition: all 0.2s; margin-left: auto;';
          btnReset.onmouseover = function () { this.style.background = 'var(--color-danger, #f43f5e)'; this.style.color = '#fff'; };
          btnReset.onmouseout = function () { this.style.background = 'transparent'; this.style.color = 'var(--color-danger, #f43f5e)'; };

          actionBtns.appendChild(btnSelectAll);
          actionBtns.appendChild(btnDeselectAll);
          actionBtns.appendChild(btnReset);
          headerTop.appendChild(actionBtns);
          menu.appendChild(headerTop);

          var content = document.createElement('div');
          content.style.cssText = 'overflow-y: auto; flex: 1; padding-right: 8px; margin-bottom: 16px; column-width: 200px; column-gap: 16px; display: block;';
          menu.appendChild(content);

          function _saveColState() {
            if (!window.tabulatorInstance) return;
            var cols = window.tabulatorInstance.getColumns();
            var visibilityState = {};
            cols.forEach(function (c) {
              var fld = c.getField();
              if (fld && fld !== '__action__' && fld !== 'row_select') {
                visibilityState[fld] = c.isVisible();
              }
            });
            var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
            var formName = MODULE_CONFIG.FormName || 'default_form';
            localStorage.setItem('tabulator_cols_' + userName + '_' + formName, JSON.stringify(visibilityState));
          }

          btnSelectAll.onclick = function () {
            var checkboxes = content.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (cb) { cb.checked = true; });
            if (window.tabulatorInstance) {
              var columns = window.tabulatorInstance.getColumns();
              columns.forEach(function (col) {
                var field = col.getField();
                if (field && field !== '__action__' && field !== 'row_select') {
                  col.show();
                }
              });
              _saveColState();
            }
          };

          btnDeselectAll.onclick = function () {
            var checkboxes = content.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (cb) { cb.checked = false; });
            if (window.tabulatorInstance) {
              var columns = window.tabulatorInstance.getColumns();
              columns.forEach(function (col) {
                var field = col.getField();
                if (field && field !== '__action__' && field !== 'row_select') {
                  col.hide();
                }
              });
              _saveColState();
            }
          };

          btnReset.onclick = function () {
            var msg = 'Khôi phục hiển thị cột về trạng thái mặc định của hệ thống?';
            if (typeof ConfirmModal !== 'undefined') {
              ConfirmModal.show({
                title: 'Khôi phục Mặc định',
                message: msg,
                onConfirm: function () {
                  var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                  var formName = MODULE_CONFIG.FormName || 'default_form';
                  localStorage.removeItem('tabulator_cols_' + userName + '_' + formName);
                  localStorage.removeItem('tabulator_col_order_' + userName + '_' + formName);
                  _renderTable();
                  backdrop.remove();
                }
              });
            } else {
              if (confirm(msg)) {
                var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                var formName = MODULE_CONFIG.FormName || 'default_form';
                localStorage.removeItem('tabulator_cols_' + userName + '_' + formName);
                localStorage.removeItem('tabulator_col_order_' + userName + '_' + formName);
                _renderTable();
                backdrop.remove();
              }
            }
          };

          if (window.tabulatorInstance) {
            var columns = window.tabulatorInstance.getColumns();
            columns.forEach(function (col) {
              var field = col.getField();
              if (field && field !== '__action__' && field !== 'row_select') {
                var def = col.getDefinition();
                var label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; cursor: grab; font-size: 14px; padding: 4px 6px; border-radius: 6px; transition: background 0.2s; break-inside: avoid; page-break-inside: avoid; margin-bottom: 4px;';
                label.onmouseover = function () { label.style.background = 'rgba(0,0,0,0.03)'; };
                label.onmouseout = function () { label.style.background = 'transparent'; };

                // Drag & Drop cho nhãn
                label.draggable = true;
                label.dataset.field = field;

                label.ondragstart = function (e) {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', field);
                  this.style.opacity = '0.4';
                  window.__draggingColField = field;
                };

                label.ondragend = function (e) {
                  this.style.opacity = '1';
                  var labels = content.querySelectorAll('label');
                  labels.forEach(function (l) {
                    l.style.boxShadow = 'none';
                    l.style.background = 'transparent';
                  });
                  window.__draggingColField = null;
                };

                label.ondragover = function (e) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  return false;
                };

                label.ondragenter = function (e) {
                  e.preventDefault();
                  if (window.__draggingColField && window.__draggingColField !== field) {
                    this.style.boxShadow = '0 -2px 0 var(--color-primary, #4338ca)';
                    this.style.background = 'rgba(67, 56, 202, 0.05)';
                  }
                };

                label.ondragleave = function (e) {
                  this.style.boxShadow = 'none';
                  this.style.background = 'transparent';
                };

                label.ondrop = function (e) {
                  e.stopPropagation();
                  this.style.boxShadow = 'none';
                  this.style.background = 'transparent';
                  var draggingField = e.dataTransfer.getData('text/plain') || window.__draggingColField;
                  if (draggingField && draggingField !== field) {
                    var draggingNode = content.querySelector('label[data-field="' + draggingField + '"]');
                    if (draggingNode) {
                      content.insertBefore(draggingNode, this);
                      if (window.tabulatorInstance) {
                        window.tabulatorInstance.moveColumn(draggingField, field, false);
                        var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                        var formName = MODULE_CONFIG.FormName || 'default_form';
                        var currentCols = window.tabulatorInstance.getColumns();
                        var colOrder = [];
                        currentCols.forEach(function (c) {
                          var fld = c.getField();
                          if (fld) colOrder.push(fld);
                        });
                        localStorage.setItem('tabulator_col_order_' + userName + '_' + formName, JSON.stringify(colOrder));
                      }
                    }
                  }
                  return false;
                };

                // Thêm icon drag để người dùng biết có thể kéo thả
                var dragIcon = document.createElement('span');
                dragIcon.className = 'material-symbols-outlined';
                dragIcon.style.cssText = 'font-size: 16px; color: var(--color-text-secondary, #94a3b8); margin-right: 6px; cursor: grab;';
                dragIcon.innerText = 'drag_indicator';
                label.appendChild(dragIcon);

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = col.isVisible();
                checkbox.style.cssText = 'margin-right: 10px; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; pointer-events: none;';
                checkbox.onchange = function () {
                  col.toggle();
                  _saveColState();
                };

                // Cho phép click vào label để toggle checkbox do pointer-events: none
                label.onclick = function (e) {
                  if (e.target !== checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    col.toggle();
                    _saveColState();
                  }
                };

                label.appendChild(checkbox);
                var spanText = document.createElement('span');
                spanText.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;';
                spanText.textContent = def.title || field;
                spanText.title = def.title || field; // tooltip for long names
                label.appendChild(spanText);

                content.appendChild(label);
              }
            });
          }

          var closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'btn btn-primary w-100';
          closeBtn.textContent = 'Hoàn tất';
          closeBtn.onclick = function () {
            backdrop.remove();
          };
          menu.appendChild(closeBtn);

          backdrop.appendChild(menu);
          document.body.appendChild(backdrop);

          // Click ra ngoài modal để đóng
          backdrop.onclick = function (evt) {
            if (evt.target === backdrop) {
              backdrop.remove();
            }
          };
        }));

        if (_hasPermission('EXPORT')) {
          tabulatorActionMenu.appendChild(createMenuItem('download', 'Xuất dữ liệu Excel', function () {
            if (window.tabulatorInstance) {
              try {
                // Xuất Excel có style (Màu nền, chữ đậm cho tiêu đề, hiển thị đúng thứ tự kéo thả)
                var columns = window.tabulatorInstance.getColumns().filter(function (c) {
                  return c.isVisible() && c.getField();
                });
                var data = window.tabulatorInstance.getData('active');
                var title = MODULE_CONFIG.PageTitle || "Danh_sach_du_lieu";

                var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
                html += '<head><meta charset="utf-8"></head><body>';
                html += '<h3 style="font-family: Arial, sans-serif;">' + title + '</h3>';
                html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px;">';

                function escapeHtml(text) {
                  if (text == null) return '';
                  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                // Tạo dòng Header với CSS inline
                html += '<tr>';
                columns.forEach(function (col) {
                  var colTitle = col.getDefinition().title || '';
                  html += '<th style="background-color: #f1f5f9; color: #1e293b; font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">' + escapeHtml(colTitle) + '</th>';
                });
                html += '</tr>';

                // Tạo các dòng Dữ liệu
                data.forEach(function (row) {
                  html += '<tr>';
                  columns.forEach(function (col) {
                    var field = col.getField();
                    var val = row[field];

                    // Map riêng cột PersonStatus sang chữ giống như UI đã xử lý
                    if (field.toLowerCase() === 'personstatus') {
                      val = row.PersonStatusName || row.personstatusname || val;
                    }

                    // Giữ định dạng chuỗi cho các số dễ bị Excel biến dạng (VD: Số điện thoại, CCCD)
                    var valStr = escapeHtml(val);
                    var tdStyle = 'border: 1px solid #e2e8f0; vertical-align: middle;';
                    if (String(val).match(/^0[0-9]{8,11}$/)) {
                      tdStyle += ' mso-number-format:"\\@";'; // Ép kiểu text cho số 0 ở đầu
                    }

                    html += '<td style="' + tdStyle + '">' + valStr + '</td>';
                  });
                  html += '</tr>';
                });

                html += '</table></body></html>';

                var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = title + ".xls";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error("Lỗi xuất Excel tùy chỉnh:", e);
                // Fallback lại cách cũ nếu có lỗi
                window.tabulatorInstance.download("xlsx", (MODULE_CONFIG.PageTitle || "Data") + ".xlsx", { sheetName: "Du_Lieu" });
              }
            } else {
              if (typeof Alert !== 'undefined') Alert.info('Thông báo', 'Bảng chưa được tải.');
            }
          }));

          tabulatorActionMenu.appendChild(createMenuItem('picture_as_pdf', 'Xuất dữ liệu PDF', function () {
            if (window.tabulatorInstance) {
              try {
                // Dùng Native Browser Print để khắc phục triệt để lỗi Font Tiếng Việt của thư viện jsPDF
                var title = "Báo cáo " + (MODULE_CONFIG.PageTitle || "Dữ liệu");
                var columns = window.tabulatorInstance.getColumns().filter(function (c) { return c.isVisible() && c.getField() !== '__action__'; });
                var data = window.tabulatorInstance.getData("active");

                var html = '<!DOCTYPE html><html><head><title>' + title + '</title>';
                html += '<style>';
                html += '@page { size: landscape; margin: 15mm; }';
                html += 'body { font-family: "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; }';
                html += 'h2 { text-align: center; color: #0f172a; text-transform: uppercase; margin-bottom: 24px; font-size: 22px; letter-spacing: 0.5px; }';
                html += 'table { width: 100%; border-collapse: collapse; font-size: 11px; }';
                html += 'th, td { border: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; vertical-align: middle; word-wrap: break-word; }';
                html += 'th { background-color: #f8fafc; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 10px; }';
                html += 'tr:nth-child(even) { background-color: #fbfcfd; }';
                html += '</style></head><body>';
                html += '<h2>' + title + '</h2>';
                html += '<table><thead><tr>';

                function escapeHtml(text) {
                  if (text == null) return '';
                  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                columns.forEach(function (col) {
                  html += '<th>' + escapeHtml(col.getDefinition().title || '') + '</th>';
                });
                html += '</tr></thead><tbody>';

                data.forEach(function (row) {
                  html += '<tr>';
                  columns.forEach(function (col) {
                    var field = col.getField();
                    var val = row[field];
                    if (field && field.toLowerCase() === 'personstatus') {
                      val = row.PersonStatusName || row.personstatusname || val;
                    }
                    html += '<td>' + escapeHtml(val) + '</td>';
                  });
                  html += '</tr>';
                });
                html += '</tbody></table>';
                html += '</body></html>';

                // Tạo iframe ẩn để kích hoạt trình in PDF native của trình duyệt
                var iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);

                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(html);
                iframe.contentWindow.document.close();

                setTimeout(function () {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                  setTimeout(function () { document.body.removeChild(iframe); }, 1500);
                }, 500);

              } catch (e) {
                console.error("Lỗi xuất PDF tuỳ chỉnh:", e);
                // Fallback
                window.tabulatorInstance.download("pdf", (MODULE_CONFIG.PageTitle || "Data") + ".pdf", { orientation: "landscape" });
              }
            } else {
              if (typeof Alert !== 'undefined') Alert.info('Thông báo', 'Bảng chưa được tải.');
            }
          }));
        }

        tabulatorActionWrapper.appendChild(tabulatorActionBtn);
        // Append menu to body to avoid overflow hidden clipping from parents
        document.body.appendChild(tabulatorActionMenu);

        // Bật/tắt menu
        tabulatorActionBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isVisible = tabulatorActionMenu.style.display === 'block';
          document.querySelectorAll('.dropdown-menu-custom').forEach(function (el) { el.style.display = 'none'; });

          if (!isVisible) {
            var rect = tabulatorActionBtn.getBoundingClientRect();
            tabulatorActionMenu.style.top = (rect.bottom + 5) + 'px';
            // Đẩy sang trái một chút nếu nút nằm ở góc phải
            tabulatorActionMenu.style.left = (rect.right - 200) + 'px';
            // Nếu bị tràn cạnh trái màn hình thì đẩy sát lề trái
            if (parseInt(tabulatorActionMenu.style.left) < 10) {
              tabulatorActionMenu.style.left = '10px';
            }
            tabulatorActionMenu.style.display = 'block';
          } else {
            tabulatorActionMenu.style.display = 'none';
          }
        });

        // Đóng menu khi click bên ngoài
        document.addEventListener('click', function (e) {
          if (!tabulatorActionWrapper.contains(e.target) && !tabulatorActionMenu.contains(e.target)) {
            tabulatorActionMenu.style.display = 'none';
          }
        });


        var formNameLower = (MODULE_CONFIG.FormName || '').toLowerCase();
        var isReport = formNameLower.endsWith('report');
        var isFrm = formNameLower.endsWith('frm') || formNameLower.startsWith('frm');

        var toolbar = UIActionToolbar.create({
          onAdd: (isFrm && !MODULE_CONFIG.HideAddBtn) ? (_hasPermission('ADD') ? _openAddForm : 'DISABLED') : false,
          onView: (isFrm && !MODULE_CONFIG.HideViewBtn) ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Vui lòng chọn dữ liệu cần xem');
            if (selectedRows.length > 1) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Chỉ có thể xem chi tiết từng dòng một.');
            _openViewForm(selectedRows[0]);
          } : false,
          onEdit: (isFrm && !MODULE_CONFIG.HideEditBtn) ? (_hasPermission('EDIT') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectEdit);

            // CHẶN CHỈNH SỬA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký');
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Không thể sửa hợp đồng/phiếu đã chốt (Đã ký). Vui lòng dùng chức năng Phụ lục nếu muốn thay đổi!');
            }

            if (selectedRows.length > 1) {
              return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Chỉ có thể sửa chi tiết từng dòng một.');
            } else {
              _openEditForm(selectedRows[0]);
            }
          } : 'DISABLED') : false,
          onDelete: (isFrm && !MODULE_CONFIG.HideDeleteBtn) ? (_hasPermission('DELETE') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectDelete);

            // CHẶN XÓA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký') || st.includes('quyết toán') || st === 'signed' || st === 'completed';
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Tuyệt đối không được xóa hợp đồng/phiếu đã chốt (Đã ký / Đã quyết toán). Hệ thống yêu cầu lưu trữ chứng từ pháp lý!');
            }

            // Hàm thực thi xóa gọi API
            var performDelete = function () {
              if (!MODULE_CONFIG.ApiDelete) {
                return Alert.info(MODULE_CONFIG.AlertTitleInfo, MODULE_CONFIG.InfoDeleteDev);
              }

              // Xử lý từng dòng một (Vì API Gateway C# map JSON sang Model, thiếu field sẽ bị NULL update)
              var deletePromises = selectedRows.map(function (row) {
                var payload = {
                  List: MODULE_CONFIG.FormName,
                  Func: 'Delete',
                  UserName: _currentUser()
                };

                // Bơm toàn bộ dữ liệu gốc của row vào để C# binding không bị mất các cột Not Null (như Ngaytochuc)
                var rowData = Object.assign({}, row);
                rowData.IsDeleted = 1; // Flag xóa mềm

                payload.JsonData = JSON.stringify(rowData);

                return ApiClient.post(MODULE_CONFIG.ApiDelete, payload);
              });

              Promise.all(deletePromises).then(function (results) {
                var allSuccess = results.every(function (res) { return res && res.code === 0; });
                if (allSuccess) {
                  if (typeof UIToast !== 'undefined') UIToast.show(MODULE_CONFIG.ToastDelete, 'success');
                  selectedRows = [];
                  if (_isFormBuilder()) window._uiConfigCache = {};
                  _updateSelectionCounter();
                  _loadData();
                } else {
                  Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertDeleteFailed);
                }
              }).catch(function (err) {
                Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
              });
            };

            // Xóa hàng loạt
            if (selectedRows.length > 1) {
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: `Bạn có chắc muốn xóa ${selectedRows.length} dòng đã chọn?`,
                  onConfirm: performDelete
                });
              }
            } else {
              var deleteName = selectedRows[0][MODULE_CONFIG.RowNameField] || MODULE_CONFIG.TextDeleteFallback;
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: MODULE_CONFIG.ConfirmDelete.replace('{0}', deleteName),
                  onConfirm: performDelete
                });
              }
            }
          } : false) : false,
          onFilter: MODULE_CONFIG.HideFilterBtn ? false : function () {
            var filterContainer = $container.querySelector('#dynamic-filter-container');
            if (filterContainer) {
              if (filterContainer.style.display === 'none' || filterContainer.style.display === '') {
                filterContainer.style.display = 'flex';
                var inputKeyword = filterContainer.querySelector('#keyword');
                if (inputKeyword) inputKeyword.focus();
              } else {
                filterContainer.style.display = 'none';
              }
            }
          },
          onPrint: false, // Ẩn nút In theo yêu cầu UX
          onClose: false,
          extras: extraBtns
        });
        toolbar.style.display = 'inline-flex';
        toolbar.style.width = 'auto';

        // // Custom Buttons
        // var hasAdd = _hasPermission('ADD');
        // if (isFrm && !MODULE_CONFIG.HideAddBtn) {
        //   var bulkAddConfig = {
        //     text: 'Thêm nhiều',
        //     icon: 'post_add',
        //     type: 'tool',
        //     disabled: !hasAdd,
        //     onClick: function () {
        //       if (!hasAdd) return typeof Alert !== 'undefined' ? Alert.warning('Từ chối', 'Bạn không có quyền thao tác chức năng này!') : null;
        //       var emptyRows = [];
        //       for (var i = 0; i < 3; i++) emptyRows.push({});
        //       _openBulkGridEditForm(emptyRows, true);
        //     }
        //   };
        //   // Dùng API addToMobilePanel để thêm vào cả desktop bar lẫn mobile action sheet
        //   if (typeof toolbar.addToMobilePanel === 'function') {
        //     toolbar.addToMobilePanel(bulkAddConfig, true); // insertFirst = true
        //   } else {
        //     // Fallback: chèn trực tiếp vào bar (trường hợp không dùng mobile wrapper)
        //     var btnBulkAdd = UIButton.create(bulkAddConfig);
        //     toolbar.insertBefore(btnBulkAdd, toolbar.firstChild);
        //   }
        // }

        // Thanh tìm kiếm nhanh (Quick Search) trên Toolbar
        var searchWrapper = document.createElement('div');
        searchWrapper.className = 'quick-search-wrapper';
        searchWrapper.style.cssText = 'flex: 1; display: flex; justify-content: flex-end; margin: 0 16px; min-width: 200px;';

        var quickSearchInput = document.createElement('input');
        quickSearchInput.type = 'text';
        quickSearchInput.className = 'ui-input';
        quickSearchInput.id = 'toolbar-quick-search';
        quickSearchInput.placeholder = MODULE_CONFIG.SearchPlaceholder || 'Tìm kiếm...';
        quickSearchInput.style.cssText = `width: 100%; max-width: 350px; padding: 8px 16px 8px 36px; border-radius: 20px; border: 1px solid var(--color-border, #e2e8f0); outline: none; transition: all 0.2s; font-size: 14px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 12px center var(--color-surface, #fff);`;

        quickSearchInput.addEventListener('focus', function () {
          this.style.borderColor = 'var(--color-primary, #3b82f6)';
          this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });
        quickSearchInput.addEventListener('blur', function () {
          this.style.borderColor = 'var(--color-border, #e2e8f0)';
          this.style.boxShadow = 'none';
        });

        var _searchTimer = null;
        quickSearchInput.addEventListener('input', function () {
          clearTimeout(_searchTimer);
          _searchTimer = setTimeout(function () {
            currentKeyword = quickSearchInput.value;
            window.currentFilters = window.currentFilters || {};
            window.currentFilters.keyword = currentKeyword;
            currentPage = 1;
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          }, 500); // Tự động tìm sau 0.5s
        });

        searchWrapper.appendChild(quickSearchInput);

        // Để 2 nút đối xứng nhau, ta sẽ gom chúng vào chung 1 flex container
        btnContainer.style.display = 'flex';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.alignItems = 'center';

        btnContainer.appendChild(toolbar);
        btnContainer.appendChild(searchWrapper); // Nằm ở giữa, đẩy Tùy chọn bảng sang phải
        btnContainer.appendChild(tabulatorActionWrapper);
      }

      // Search bar (FilterComponent)
      var filterContainer = $container.querySelector('#dynamic-filter-container');
      if (filterContainer && typeof FilterComponent !== 'undefined') {
        filterContainer.innerHTML = ''; // Xóa placeholder nếu có

        // 1. Tự động lấy các trường cấu hình ShowInFilter từ Database
        var dynamicFilters = globalFormSchema
          .filter(function (f) { return f.showInFilter; })
          .map(function (f) {
            // Chuyển đổi định dạng từ FormEngine sang FilterComponent
            var filterType = 'text';
            if (f.renderRule === 'dt' || f.renderRule === 'd') filterType = 'date';
            if (f.renderRule === 'nm' || f.renderRule === 'n') filterType = 'number';

            var filterObj = {
              id: f.name,
              label: f.label,
              type: filterType,
              placeholder: f.label
            };

            // Parse DataSource cho trường Select/Dropdown
            if (f.renderRule === 'sl' || f.renderRule === 'sw') {
              filterObj.type = 'select';
              filterObj.options = [];
              if (f.renderRule === 'sw') {
                filterObj.options = [{ value: 1, label: 'Có' }, { value: 0, label: 'Không' }];
              } else if (f.dataSource && f.dataSource.indexOf('STATIC:') === 0) {
                var parts = f.dataSource.replace('STATIC:', '').split(',');
                parts.forEach(function (p) {
                  var kv = p.split('|');
                  filterObj.options.push({ value: kv[0], label: kv[1] || kv[0] });
                });
              } else if (f.dataSource) {
                filterObj.dataSource = f.dataSource;
                // Tải dữ liệu động từ API (ví dụ: 'CF_BranchListFrm' hoặc 'SY_Period')
                var apiSearchUrl = MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router';
                ApiClient.post(apiSearchUrl, { List: f.dataSource, FormName: f.dataSource, Func: 'View', Limit: 1000, UserName: _currentUser() }).then(function (res) {
                  var dataList = res.list || res.records || [];
                  var options = [];
                  if (dataList && dataList.length > 0) {
                    var keys = Object.keys(dataList[0]);
                    var valKey = keys[0];
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = keys.find(function (k) { return labelRegex.test(k); }) || keys[1] || keys[0];
                    dataList.forEach(function (row) {
                      options.push({ value: row[valKey], label: row[displayKey] });
                    });
                  }

                  // Tìm phần tử select tương ứng để cập nhật các option mới tải về
                  var selectEl = document.getElementById(f.name);
                  if (selectEl) {
                    var hasSavedValue = window.currentFilters && window.currentFilters[f.name] !== undefined;
                    var currentValue = hasSavedValue ? window.currentFilters[f.name] : '';

                    selectEl.innerHTML = '<option value="">-- Tất cả --</option>';
                    options.forEach(function (opt) {
                      var optionNode = document.createElement('option');
                      optionNode.value = opt.value;
                      optionNode.innerText = opt.label;
                      if (opt.value == currentValue) optionNode.selected = true;
                      selectEl.appendChild(optionNode);
                    });

                    // Tự động chọn kỳ gần nhất nếu chưa có filter được thiết lập
                    if (!hasSavedValue && options.length > 0 && (f.name.toLowerCase().indexOf('period') >= 0 || f.name.toLowerCase().indexOf('ky') >= 0)) {
                      var now = new Date();
                      var cy = now.getFullYear();
                      var cm = now.getMonth() + 1;
                      var bestOpt = null;
                      var minDiff = Infinity;

                      function parseYearMonth(str) {
                        var clean = String(str);
                        var m1 = clean.match(/(\d{4})[-_\/\s]?(\d{1,2})/);
                        if (m1) {
                          var y = parseInt(m1[1], 10);
                          var m = parseInt(m1[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        var m2 = clean.match(/(\d{1,2})[-_\/\s]?(\d{4})/);
                        if (m2) {
                          var m = parseInt(m2[1], 10);
                          var y = parseInt(m2[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        return null;
                      }

                      options.forEach(function (opt) {
                        var parsed = parseYearMonth(opt.value) || parseYearMonth(opt.label);
                        if (parsed) {
                          var diff = Math.abs((parsed.year - cy) * 12 + (parsed.month - cm));
                          if (diff < minDiff) {
                            minDiff = diff;
                            bestOpt = opt;
                          }
                        }
                      });

                      if (!bestOpt) {
                        bestOpt = options[0];
                      }

                      if (bestOpt) {
                        currentValue = bestOpt.value;
                        selectEl.value = currentValue;
                        if (!window.currentFilters) window.currentFilters = {};
                        window.currentFilters[f.name] = currentValue;
                        // Reload data với kỳ mặc định mới chọn
                        setTimeout(function () {
                          _loadData();
                        }, 50);
                      }
                    }
                  }
                  filterObj.options = options;
                }).catch(function (err) {
                  console.error('Lỗi tải dữ liệu lọc cho ' + f.name, err);
                });
              }
            }
            return filterObj;
          });

        // 2. Gom với cấu hình cứng trong AppModules.js (nếu có)
        // Lưu ý: Đã đưa 'Từ khóa' ra ngoài thanh công cụ dưới dạng Quick Search Bar
        var filters = [];

        if (dynamicFilters.length > 0) {
          filters = filters.concat(dynamicFilters);
        } else if (MODULE_CONFIG.Filters && MODULE_CONFIG.Filters.length > 0) {
          filters = filters.concat(MODULE_CONFIG.Filters);
        }

        var filterNode = FilterComponent.create(filters, function (values) {
          console.log('[DynamicFormEngine] Filter values callback received:', values);

          // Lấy giá trị keyword từ ô Quick Search Bar để tránh bị đè mất
          var quickSearch = document.getElementById('toolbar-quick-search');
          if (quickSearch) {
            values.keyword = quickSearch.value;
          }

          // Lưu lại toàn bộ các giá trị filter
          window.currentFilters = values;
          currentKeyword = values.keyword || '';
          currentPage = 1; // Reset về trang 1 khi lọc mới
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        });
        filterContainer.appendChild(filterNode);
        filterContainer.style.display = 'none'; // Ẩn mặc định, ấn Lọc mới hiện
      }

      if (!MODULE_CONFIG.NoAutoLoad) {
        if (MODULE_CONFIG.IsDetailAdd) {
          _openModal(false, null);
        } else if (MODULE_CONFIG.action === 'detail' || MODULE_CONFIG.Action === 'detail') {
          _openModal(true, MODULE_CONFIG.DetailRowData, true);
        } else {
          _loadData();
        }
      }
    })
      .catch(function (err) {
        var prefix = MODULE_CONFIG.TextLoadingError || 'Lỗi tải dữ liệu: ';
        $container.innerHTML = '<div class="p-4 text-danger">' + prefix + err.message + '</div>';
      });
  }

  // ── Load Data ─────────────────────────────────────────────
  var savedScrollY = 0; // Lưu vị trí scroll

  function _loadData() {
    // Đồng bộ state hiện tại vào cache để tránh mất filter khi F5
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
      _saveModuleStates();
    }

    if (MODULE_CONFIG.IsFullPageDetail && MODULE_CONFIG.DetailRowData) {
      _openModal(true, MODULE_CONFIG.DetailRowData, !MODULE_CONFIG.IsDetailForceEdit);
      return;
    }

    var gridContainer = $container ? $container.querySelector('#dynamic-grid-container') : null;
    var existingTable = gridContainer ? gridContainer.querySelector('.table-wrapper') : null;

    if (existingTable && typeof existingTable.showLoading === 'function') {
      savedScrollY = window.scrollY;
      existingTable.showLoading(MODULE_CONFIG.TextLoading);
    } else if (gridContainer) {
      gridContainer.innerHTML = '<div class="p-4 text-center" style="color:var(--color-text-secondary);">' + MODULE_CONFIG.TextLoading + '</div>';
    }

    if (MODULE_CONFIG.ApiSearch) {
      // Gom các bộ lọc đang active (bỏ các trường rỗng)
      var activeFilters = {};
      if (window.currentFilters) {
        for (var k in window.currentFilters) {
          if (window.currentFilters[k] !== '' && window.currentFilters[k] !== null) {
            activeFilters[k] = window.currentFilters[k];
          }
        }
      }
      // Thêm Keyword vào filter JSON
      if (currentKeyword) activeFilters['Keyword'] = currentKeyword;

      // Đổi màu nút Lọc nếu có dữ liệu lọc
      var actionsContainer = document.getElementById('global-page-actions') || $container;
      if (actionsContainer) {
        var btns = actionsContainer.querySelectorAll('button');
        var filterBtn = null;
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
            filterBtn = btns[i];
            break;
          }
        }
        if (filterBtn) {
          var hasFilter = Object.keys(activeFilters).length > 0;
          if (hasFilter) {
            filterBtn.classList.remove('btn-outline-secondary');
            filterBtn.classList.remove('text-dark');
            filterBtn.classList.add('btn-primary');
            filterBtn.classList.add('text-white');

            filterBtn.style.setProperty('color', '#fff', 'important');
            filterBtn.style.setProperty('background-color', 'var(--color-primary, #3b82f6)', 'important');
            filterBtn.style.setProperty('border-color', 'var(--color-primary, #3b82f6)', 'important');
          } else {
            filterBtn.classList.remove('btn-primary');
            filterBtn.classList.remove('text-white');
            if (filterBtn.className.indexOf('btn-') === -1) {
              filterBtn.classList.add('btn-outline-secondary');
            }
            filterBtn.style.color = '';
            filterBtn.style.backgroundColor = '';
            filterBtn.style.borderColor = '';
            // Xóa dấu chấm đỏ nếu có
            var badge = filterBtn.querySelector('.filter-badge');
            if (badge) badge.remove();
          }
        }
      }

      // Đọc BranchID từ session user (backend dùng để lọc theo chi nhánh)
      var _sessionUser = {};
      try { _sessionUser = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}'); } catch (e) { }
      var _branchID = (_sessionUser.BranchID || '').toString().trim();

      var query = {
        List: MODULE_CONFIG.FormName,
        Func: 'View',
        UserName: _currentUser(),
        User: _currentUser(),
        Page: currentPage,
        Limit: currentLimit,
        SortColumn: currentSortCol || '',
        SortDir: currentSortDir || '',
        Keyword: currentKeyword || ''
      };

      // Gửi BranchID vào JsonData để backend API Gateway mapping thành tham số SP
      if (_branchID) {
        // Chỉ thêm nếu user chưa chủ động filter chi nhánh
        if (!activeFilters.BranchID && !activeFilters.ChiNhanhID) {
          activeFilters.BranchID = _branchID;
        }
      }

      if (MODULE_CONFIG.IsFullPageDetail) {
        query.Limit = 1;
        query.Page = 1;
        // Ghi đè bộ lọc để chỉ lấy 1 bản ghi
        var detailFilter = {};
        detailFilter[MODULE_CONFIG.PrimaryKey] = MODULE_CONFIG.DetailRowId;
        query.JsonData = JSON.stringify(detailFilter);
      } else if (Object.keys(activeFilters).length > 0) {
        query.JsonData = JSON.stringify(activeFilters);
      }

      console.log('[DynamicFormEngine] Sending query to ApiSearch:', query);
      ApiClient.post(MODULE_CONFIG.ApiSearch, query).then(function (result) {
        // Trả lại quyền sinh sát (tính phân trang) cho C# Backend
        totalRecords = result._recordtotal || 0;
        totalPagesFromApi = result._pagetotal || 0;

        lastTimestamp = result._timestamp || '';
        var dataList = result.list || result.records || [];
        gridData = dataList.map(function (item) {
          // Lấy khóa chính từ cấu hình, nếu không có thì tự động lấy cột đầu tiên của dữ liệu
          var firstKey = Object.keys(item).length > 0 ? Object.keys(item)[0] : null;
          item.id = item[MODULE_CONFIG.PrimaryKey] || (firstKey ? item[firstKey] : null) || Math.random();
          return item;
        });

        // Bỏ đồng bộ Kỳ (PeriodID) tự động để tránh tự động lọc ngoài ý muốn khi lưu/cập nhật dữ liệu

        if (MODULE_CONFIG.IsFullPageDetail) {
          var row = gridData.length > 0 ? gridData[0] : {};
          _openModal(true, row, true);
        } else {
          _renderTable();
        }
      }).catch(function (err) {
        console.error('Lỗi tải danh sách:', err);
        if (typeof Alert !== 'undefined') Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        gridData = [];
        totalRecords = 0;
        totalPagesFromApi = 0;
        lastTimestamp = '';
        selectedRows = [];
        _updateSelectionCounter();
        _renderTable();
      });
    }
  }

  // ── Render Table ──────────────────────────────────────────
  function _renderTable() {
    var gridContainer = $container.querySelector('#dynamic-grid-container');
    if (!gridContainer) return;

    // Tạo wrapper cho tabulator nếu chưa có
    var tableWrapper = gridContainer.querySelector('.tabulator-wrapper');
    if (!tableWrapper) {
      gridContainer.innerHTML = '';
      gridContainer.style.display = 'flex';
      gridContainer.style.flexDirection = 'column';

      tableWrapper = document.createElement('div');
      tableWrapper.className = 'tabulator-wrapper';
      tableWrapper.style.flex = '1';
      tableWrapper.style.minHeight = '0';
      gridContainer.appendChild(tableWrapper);
    }

    lastSelectedIdx = -1;

    if (typeof Tabulator !== 'undefined') {
      var dictionary = {};
      if (globalFormSchema && globalFormSchema.length > 0) {
        globalFormSchema.forEach(function (schema) {
          var pos = (schema.position || 'grid').toLowerCase();
          if (pos.indexOf('grid') > -1) {
            dictionary[schema.name] = schema.label;
          }
        });
      } else {
        dictionary = globalDictionary; // Fallback
      }

      var customRenderers = globalRenderers;
      globalFormSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });
      var renderers = Object.assign({}, customRenderers);




      var tabulatorColumns = [];
      var isMobile = window.innerWidth <= 768;

      // Đọc cấu hình cột đã lưu từ LocalStorage
      var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
      var formName = MODULE_CONFIG.FormName || 'default_form';
      var savedVisibility = null;
      var savedOrder = null;
      try {
        var storedStr = localStorage.getItem('tabulator_cols_' + userName + '_' + formName);
        if (storedStr) savedVisibility = JSON.parse(storedStr);

        var storedOrderStr = localStorage.getItem('tabulator_col_order_' + userName + '_' + formName);
        if (storedOrderStr) savedOrder = JSON.parse(storedOrderStr);
      } catch (e) { }

      // Cột Checkbox của Tabulator
      tabulatorColumns.push({
        formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 50, resizable: false, frozen: !isMobile
      });

      var sampleRow = gridData && gridData.length > 0 ? gridData[0] : {};
      var rowKeys = Object.keys(sampleRow);

      globalFormSchema.forEach(function (f) {
        var pos = (f.position || 'grid').toLowerCase();
        if (pos.indexOf('grid') > -1) {
          var fieldName = f.name;
          // Tìm key trong data có chữ hoa/thường khớp với fieldName (case-insensitive search)
          var actualField = rowKeys.find(function (k) { return k.toLowerCase() === fieldName.toLowerCase(); }) || fieldName;

          var isDateField = actualField.toLowerCase().indexOf('ngay') >= 0 || actualField.toLowerCase().indexOf('date') >= 0 || f.renderRule === 'dt' || f.renderRule === 'date' || f.renderRule === 'd';

          var customDateEditor = function (cell, onRendered, success, cancel) {
            var cellValue = cell.getValue();
            var input = document.createElement("input");
            input.type = "text";
            input.style.padding = "4px";
            input.style.width = "100%";
            input.style.boxSizing = "border-box";
            input.style.border = "none";
            input.style.outline = "none";
            input.style.background = "transparent";

            var parsedDate = null;
            if (cellValue) {
              if (typeof cellValue === 'string' && cellValue.indexOf('/') === 2) {
                var parts = cellValue.split(/[\s/]/);
                if (parts.length >= 3) {
                  parsedDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                }
              } else if (typeof cellValue === 'string' && cellValue.length >= 10 && cellValue.indexOf('-') === 4) {
                var parts = cellValue.substring(0, 10).split('-');
                parsedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
              } else {
                var d = new Date(cellValue);
                if (!isNaN(d.getTime())) parsedDate = d;
              }
            }

            onRendered(function () {
              if (typeof window.flatpickr !== 'undefined') {
                var fp = window.flatpickr(input, {
                  defaultDate: parsedDate,
                  dateFormat: "d/m/Y",
                  allowInput: true,
                  onClose: function (selectedDates, dateStr, instance) {
                    if (dateStr !== cellValue) {
                      success(dateStr);
                    } else {
                      cancel();
                    }
                  }
                });
                setTimeout(function () { fp.open(); }, 10);
              } else {
                // Fallback
                input.type = "date";
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                  var y = parsedDate.getFullYear();
                  var m = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
                  var d = parsedDate.getDate().toString().padStart(2, '0');
                  input.value = y + '-' + m + '-' + d;
                }
                input.focus();
                input.addEventListener("blur", function () {
                  var v = input.value;
                  if (v) {
                    var p = v.split('-');
                    if (p.length === 3) v = p[2] + '/' + p[1] + '/' + p[0];
                    if (v !== cellValue) success(v); else cancel();
                  } else {
                    if (cellValue !== "") success(""); else cancel();
                  }
                });
              }
            });

            return input;
          };

          var hasCombo = f.dataSource || f.api || f.listName || f.queryName || (f.renderRule && f.renderRule.toLowerCase() === 'combo');

          var customComboEditor = function (cell, onRendered, success, cancel) {
            var cellValue = cell.getValue();
            var rowData = cell.getRow().getData();

            var endpointRaw = f.dataSource || f.api || f.listName || f.queryName || '';
            var maxCols = 4;
            if (endpointRaw.indexOf('|') > -1) {
              var dsParts = endpointRaw.split('|');
              endpointRaw = dsParts[0];
              var parsedCols = parseInt(dsParts[1], 10);
              if (!isNaN(parsedCols) && parsedCols > 0) maxCols = parsedCols;
            }
            var finalUrl;
            var fetchPayload = {};
            if (endpointRaw.indexOf('/') === -1 && !endpointRaw.startsWith('http')) {
              finalUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router';
              fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View' };
            } else {
              var endpoint = endpointRaw.startsWith('http') ? endpointRaw : ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + endpointRaw);
              finalUrl = endpoint;
              if (endpoint.indexOf('?') > -1) {
                var parts = endpoint.split('?');
                finalUrl = parts[0];
                var searchParams = new URLSearchParams(parts[1]);
                searchParams.forEach(function (value, key) { fetchPayload[key] = value; });
              }
            }
            if (!fetchPayload.UserName) fetchPayload.UserName = (typeof _currentUser === 'function' ? _currentUser() : 'default');

            var searchApiCall = function (q, page) {
              var payload = Object.assign({}, fetchPayload);
              var isGateway = finalUrl.indexOf('API_Gateway_Router') > -1;
              var dynamicFilters = {};
              if (f.dependsOn) {
                var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
                parents.forEach(function (p) {
                  if (rowData[p] !== undefined && rowData[p] !== null) {
                    dynamicFilters[p] = rowData[p];
                  }
                });
              }
              if (isGateway) dynamicFilters = Object.assign(dynamicFilters, dynamicFilters);
              else payload = Object.assign(payload, dynamicFilters);

              if (q) {
                payload.Keyword = q;
                if (isGateway) dynamicFilters.Keyword = q;
              }
              if (isGateway && Object.keys(dynamicFilters).length > 0) {
                var existingJson = {};
                try { existingJson = JSON.parse(payload.JsonData || '{}'); } catch (e) { }
                payload.JsonData = JSON.stringify(Object.assign({}, existingJson, dynamicFilters));
              }

              return ApiClient.post(finalUrl, payload).then(function (res) {
                var comboData = [];
                var dataList = res.list || res.records;
                var headers = ['Mã', 'Tên'];
                var colFilterIndex = 1;
                if (dataList && dataList.length > 0) {
                  var keys = Object.keys(dataList[0]);
                  if (keys.length > 0) {
                    var displayKeysFull = keys;
                    if (f.hiddenColumns && Array.isArray(f.hiddenColumns)) {
                      var hcols = f.hiddenColumns.map(function (c) { return c.toUpperCase(); });
                      displayKeysFull = keys.filter(function (k) { return hcols.indexOf(k.toUpperCase()) === -1; });
                    }
                    var displayKeys = displayKeysFull.slice(0, maxCols);
                    headers = displayKeys.map(function (k) {
                      if (typeof globalDictionary !== 'undefined') {
                        var kLower = k.toLowerCase();
                        var matchKey = Object.keys(globalDictionary).find(function (dk) { return dk.toLowerCase() === kLower; });
                        if (matchKey) return globalDictionary[matchKey].CaptionVN;
                      }
                      return k;
                    });
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = displayKeys.find(function (k) { return labelRegex.test(k); });
                    if (displayKey) {
                      colFilterIndex = displayKeys.indexOf(displayKey);
                    } else {
                      var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;
                      var validIdx = -1;
                      for (var i = 1; i < displayKeys.length; i++) {
                        if (!hideRegex.test(displayKeys[i])) { validIdx = i; break; }
                      }
                      colFilterIndex = validIdx !== -1 ? validIdx : 0;
                    }
                    if (f.name === 'PersonID') colFilterIndex = 0;
                    if (f.name === 'PeriodKeyID') {
                      var keyIdx = displayKeys.findIndex(function (k) { return k.toLowerCase() === 'keyid'; });
                      if (keyIdx > -1) colFilterIndex = keyIdx;
                    }
                    dataList.forEach(function (d) {
                      var rData = [];
                      displayKeysFull.forEach(function (k) { rData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
                      comboData.push(rData);
                    });
                  } else {
                    dataList.forEach(function (d) { comboData.push(['', '']); });
                  }
                }
                return { headers: headers, data: comboData, colFilterIndex: colFilterIndex };
              });
            };

            var lazyCombo = UIControls.createDataComboBox({
              placeholder: '-- Chọn --',
              headers: ['Mã', 'Tên'],
              showAddNew: false,
              onSearch: searchApiCall,
              onChange: function (val) { },
              onSelect: function (row) {
                success(lazyCombo.querySelector('.ui-input').value);
              }
            });

            lazyCombo.style.margin = "0";
            lazyCombo.style.width = "100%";
            var inputEl = lazyCombo.querySelector('.ui-input');
            inputEl.style.border = "none";
            inputEl.style.background = "transparent";
            inputEl.style.padding = "4px";
            inputEl.value = cellValue || '';

            onRendered(function () {
              inputEl.focus();
              inputEl.click();
            });

            return lazyCombo;
          };

          var isEditable = true;
          if (typeof MODULE_CONFIG !== 'undefined') {
            if ((MODULE_CONFIG.FormType || '').toUpperCase() === 'REPORT') isEditable = false;
            if ((MODULE_CONFIG.FormName || '').toUpperCase().indexOf('REPORT') > -1) isEditable = false;
          }
          if (f.ShowInEdit == 0 || f.IsReadOnlyEdit == 1) isEditable = false;

          var isNumeric = (f.formatId || f.FormatID || '').toLowerCase() === 'n';

          var colDef = {
            title: dictionary[fieldName] || fieldName,
            field: actualField,
            editor: isEditable ? (isDateField ? customDateEditor : (hasCombo ? customComboEditor : "input")) : false,
            maxWidth: 400, // UX: Giới hạn độ rộng tối đa để text dài (như Mô tả) không đẩy vỡ khung Grid
            tooltip: true  // UX: Cho phép xem đầy đủ text khi hover chuột vào ô bị cắt chữ (...)
            // Đã loại bỏ headerFilter: "input" để header gọn gàng, người dùng sẽ xài Popup lọc dữ liệu thay thế
          };

          if (isNumeric) {
            colDef.bottomCalc = "sum";
            colDef.bottomCalcFormatter = function (cell) {
              var val = cell.getValue();
              var n = parseFloat(val);
              return isNaN(n) ? (val || '') : n.toLocaleString('vi-VN');
            };
            colDef.hozAlign = "right"; // Canh lề phải cho cột số
          }

          // Apply trạng thái ẩn/hiện cột nếu đã được lưu
          if (savedVisibility && savedVisibility[actualField] !== undefined) {
            colDef.visible = savedVisibility[actualField];
          }



          // Fix: Cột PersonStatus ưu tiên hiển thị chữ (PersonStatusName) thay vì số
          if (actualField.toLowerCase() === 'personstatus') {
            colDef.formatter = function (cell) {
              var data = cell.getData();
              var val = cell.getValue();
              var text = data.PersonStatusName || data.personstatusname || val;
              if (!text && !val) return '';

              var badgeClass = 'badge-info';
              var textLower = String(text).toLowerCase();
              if (String(val) === '1' || textLower.includes('chính thức') || textLower.includes('hoạt động') || textLower.includes('thành công')) badgeClass = 'badge-active';
              else if (String(val) === '4' || String(val) === '8' || String(val) === '9' || textLower.includes('nghỉ') || textLower.includes('thôi việc') || textLower.includes('hủy') || textLower.includes('xóa')) badgeClass = 'badge-danger';
              else if (String(val) === '2' || textLower.includes('thử việc') || textLower.includes('tạm hoãn') || textLower.includes('chờ')) badgeClass = 'badge-warning';
              else if (String(val) === '3' || textLower.includes('thực tập') || textLower.includes('mới')) badgeClass = 'badge-info';

              return '<span class="badge-status ' + badgeClass + '">' + (text || '') + '</span>';
            };
          }

          // Smart UI/UX Defaults (Kế thừa cho toàn bộ lưới nếu không bị ghi đè)
          if (!colDef.formatter) {
            var fName = actualField.toLowerCase();
            var title = (colDef.title || '').toLowerCase();

            if (fName.includes('manhanvien') || fName === 'macode' || fName === 'employeeid' || fName === 'personid' || title.includes('mã nhân viên')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
            } else if (fName.includes('dienthoai') || fName.includes('phone') || fName.includes('sdt') || title.includes('điện thoại')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
            } else if (fName.includes('email') || title.includes('email')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
              colDef.formatter = function (cell) {
                var v = cell.getValue();
                if (!v) return '';
                return '<a href="mailto:' + v + '">' + v + '</a>';
              };
            } else if (fName.includes('cmnd') || fName.includes('cccd') || fName.includes('idcard') || title.includes('cmnd') || title.includes('cccd')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-danger';
            } else if (fName.includes('trangthai') || fName.includes('status') || title.includes('trạng thái')) {
              colDef.formatter = function (cell) {
                var v = cell.getValue();
                if (!v && v !== 0) return '';
                var textLower = String(v).toLowerCase();
                var badgeClass = 'badge-info';

                if (textLower.includes('chính thức') || textLower.includes('đã ký') || textLower.includes('hoàn thành') || textLower.includes('success') || textLower.includes('active') || textLower.includes('đạt') || textLower.includes('duyệt') || textLower.includes('đồng ý')) {
                  badgeClass = 'badge-active';
                } else if (textLower.includes('nghỉ') || textLower.includes('hủy') || textLower.includes('từ chối') || textLower.includes('khóa') || textLower.includes('fail') || textLower.includes('lỗi') || textLower.includes('không đạt')) {
                  badgeClass = 'badge-danger';
                } else if (textLower.includes('thử việc') || textLower.includes('chờ') || textLower.includes('pending') || textLower.includes('tạm') || textLower.includes('đang')) {
                  badgeClass = 'badge-warning';
                }

                return '<span class="badge-status ' + badgeClass + '">' + v + '</span>';
              };
            }
          }

          if (renderers[fieldName]) {
            colDef.formatter = function (cell) {
              return renderers[fieldName](cell.getValue(), cell.getData());
            };
          }
          tabulatorColumns.push(colDef);
        }
      });

      // Khôi phục vị trí cột nếu đã có dữ liệu lưu
      if (savedOrder && savedOrder.length > 0) {
        // tabulatorColumns[0] là checkbox, tách riêng ra
        var checkboxCol = tabulatorColumns.shift();
        tabulatorColumns.sort(function (a, b) {
          var idxA = savedOrder.indexOf(a.field);
          var idxB = savedOrder.indexOf(b.field);
          // Nếu cột mới không có trong danh sách lưu, đưa xuống cuối
          if (idxA === -1) idxA = 9999;
          if (idxB === -1) idxB = 9999;
          return idxA - idxB;
        });
        tabulatorColumns.unshift(checkboxCol);
      }

      // Tạo thanh Pagination trước
      var paginationEl = null;
      if (typeof Pagination !== 'undefined') {
        paginationEl = Pagination.create({
          totalItems: totalRecords,
          totalPages: totalPagesFromApi,
          timestamp: lastTimestamp,
          itemsPerPage: currentLimit,
          currentPage: currentPage,
          onPageChange: function (page) {
            currentPage = page;
            _loadData();
          },
          onLimitChange: function (newLimit) {
            currentLimit = newLimit;
            currentPage = 1;
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          },
          onRefresh: function () {
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          }
        });
      }

      if (window.tabulatorInstance) {
        window.tabulatorInstance.destroy();
      }

      var tabulatorConfig = {
        data: gridData,
        columns: tabulatorColumns,
        layout: "fitDataFill",
        selectableRows: true, // bật chọn dòng
        selectableRowsRangeMode: "click", // Shift + click range
        height: "100%", // Chiếm 100% chiều cao của flex container
        movableColumns: true, // Cho phép kéo thả cột
        editTriggerEvent: "dblclick", // Nhấp đúp để chỉnh sửa ô
        // rowHeight: 45, // Đã xóa bỏ để Tabulator tự tính lại chiều cao theo text nhỏ
      };

      // Đẩy pagination vào footer cố định của Tabulator
      if (paginationEl) {
        tabulatorConfig.footerElement = paginationEl;
      }

      window.tabulatorInstance = new Tabulator(tableWrapper, tabulatorConfig);

      // Bắt sự kiện chọn dòng để update biến selectedRows
      window.tabulatorInstance.on("rowSelectionChanged", function (data, rows) {
        selectedRows = data;
        _updateSelectionCounter();
      });

      // Bắt sự kiện kéo thả cột để lưu vị trí mới vào LocalStorage
      window.tabulatorInstance.on("columnMoved", function (column) {
        var currentCols = window.tabulatorInstance.getColumns();
        var colOrder = [];
        currentCols.forEach(function (c) {
          var field = c.getField();
          if (field) colOrder.push(field);
        });
        localStorage.setItem('tabulator_col_order_' + userName + '_' + formName, JSON.stringify(colOrder));
      });

      // Hack cho Mobile/Touch: Cho phép click vào bất kỳ đâu trên dòng để CHỌN NHIỀU (Toggle) mà không cần giữ Ctrl
      tableWrapper.addEventListener('click', function (e) {
        if (e.target.closest('.tabulator-header')) return;
        // Bỏ qua nếu click vào nút, link, hoặc input (như checkbox của Tabulator)
        if (e.target.closest('button, a, input, select, textarea')) return;

        var rowEl = e.target.closest('.tabulator-row');
        if (rowEl) {
          var row = window.tabulatorInstance.getRow(rowEl);
          if (row && typeof row.toggleSelect === 'function') {
            e.stopPropagation(); // Ngăn Tabulator clear các dòng khác
            row.toggleSelect();
          }
        }
      }, true);

      // Bắt sự kiện chỉnh sửa ô để lưu tự động vào DB
      window.tabulatorInstance.on("cellEdited", function (cell) {
        var rowData = cell.getRow().getData();
        var field = cell.getField();
        var newVal = cell.getValue();

        var endpoint = MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router';
        if (!endpoint) return;

        var schema = null;
        if (globalFormSchema) {
          schema = globalFormSchema.find(function (s) { return s.name.toLowerCase() === field.toLowerCase(); });
        }

        var isReport = false;
        if (typeof MODULE_CONFIG !== 'undefined') {
          if ((MODULE_CONFIG.FormType || '').toUpperCase() === 'REPORT') isReport = true;
          if ((MODULE_CONFIG.FormName || '').toUpperCase().indexOf('REPORT') > -1) isReport = true;
        }

        // Chặn chỉnh sửa và thông báo thân thiện đối với Form dạng REPORT
        if (isReport) {
          if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Dữ liệu trên báo cáo (REPORT) chỉ hỗ trợ xem, không được phép chỉnh sửa trực tiếp!');
          cell.restoreOldValue();
          return;
        }

        // Chặn chỉnh sửa đối với các cột được cấu hình khóa (Read-Only) hoặc cột động không có cấu hình
        if (!schema || schema.ShowInEdit == 0 || schema.IsReadOnlyEdit == 1) {
          if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Trường dữ liệu này đã được cấu hình khóa hoặc chỉ đọc, không được phép chỉnh sửa!');
          cell.restoreOldValue();
          return;
        }

        // Validate riêng cho các cột kiểu Date để chống lỗi SQL khi nhập thiếu năm (VD: "20/10")
        var isDateCol = field.toLowerCase().indexOf('ngay') >= 0;
        if (!isDateCol && globalFormSchema) {
          var schema = globalFormSchema.find(function (s) { return s.name.toLowerCase() === field.toLowerCase(); });
          if (schema && (schema.renderRule === 'dt' || schema.formatId === 'd' || schema.FormatID === 'd')) {
            isDateCol = true;
          }
        }

        if (isDateCol) {
          if (newVal && String(newVal).trim() !== '') {
            // Chỉ chấp nhận DD/MM/YYYY (đủ 4 số năm) hoặc YYYY-MM-DD
            var isValidDate = String(newVal).match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/) || String(newVal).match(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}/);
            if (!isValidDate) {
              if (typeof Alert !== 'undefined') {
                Alert.error('Lỗi nhập liệu', 'Vui lòng nhập đầy đủ ngày/tháng/năm cho cột "' + (dictionary[field] || field) + '"');
              }
              cell.restoreOldValue();
              return; // Chặn không cho gọi API
            }
          }
        }

        // Xây dựng payload để lưu
        var payloadObj = Object.assign({}, rowData);
        payloadObj.UserName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
        payloadObj.IsEdit = 1;

        // Chuẩn hóa định dạng ngày tháng từ DD/MM/YYYY sang YYYY-MM-DD để SQL Server hiểu được
        Object.keys(payloadObj).forEach(function (k) {
          var val = payloadObj[k];
          if (typeof val === 'string' && val.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/)) {
            var parts = val.substring(0, 10).replace(/-/g, '/').split('/');
            var newDateStr = parts[2] + '-' + parts[1] + '-' + parts[0];
            if (val.length > 10) newDateStr += val.substring(10);
            payloadObj[k] = newDateStr;
          }
        });

        var finalPayload = {
          List: MODULE_CONFIG.FormName,
          Func: 'Save',
          JsonData: JSON.stringify(payloadObj),
          UserName: _currentUser()
        };

        ApiClient.post(endpoint, finalPayload)
          .then(function (res) {
            if (res && res.code === 0) {
              if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã lưu giá trị mới cho cột "' + (dictionary[field] || field) + '"');
            } else {
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
              cell.restoreOldValue();
            }
          })
          .catch(function () {
            if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi kết nối khi lưu dữ liệu');
            cell.restoreOldValue();
          });
      });

      // Bắt sự kiện click header để sort
      window.tabulatorInstance.on("headerClick", function (e, column) {
        var field = column.getField();
        if (field !== "__action__" && field) {
          var currentDir = column.getDir() === "asc" ? "desc" : "asc";
          currentSortCol = field;
          currentSortDir = currentDir;
          currentPage = 1;
          selectedRows = [];
          _updateSelectionCounter();
          _loadData(); // Load lại data từ server
        }
      });

      // Xóa container cũ ở ngoài vì đã dùng footer của Tabulator
      var oldPaginationContainer = gridContainer.querySelector('.pagination-wrapper');
      if (oldPaginationContainer) {
        oldPaginationContainer.remove();
      }

      // Phục hồi vị trí cuộn trang
      if (savedScrollY > 0) {
        setTimeout(function () { window.scrollTo(0, savedScrollY); }, 10);
      }

      _updateSelectionCounter();
    }
  }

  function _clearSelection() {
    selectedRows = [];
    _updateSelectionCounter();

    if (window.tabulatorInstance) {
      window.tabulatorInstance.deselectRow();
    } else {
      var checkboxes = $container.querySelectorAll('tbody .form-check-input');
      if (checkboxes) checkboxes.forEach(function (cb) { cb.checked = false; });
      var checkAll = $container.querySelector('thead .form-check-input');
      if (checkAll) checkAll.checked = false;
      var allTrs = $container.querySelectorAll('tbody tr');
      if (allTrs) allTrs.forEach(function (tr) { tr.classList.remove('active', 'selected', 'table-active', 'table-primary'); });
    }

    var splitContainer = $container.querySelector('.split-master-detail-container');
    if (splitContainer) {
      splitContainer.classList.remove('show-detail');
    }
  }

  function _updateSelectionCounter() {
    _saveSelectedRows();

    if (!window.tabulatorInstance) {
      // Đồng bộ trạng thái checkbox
      var allTrs = $container.querySelectorAll('#dynamic-grid-container tbody tr');
      if (allTrs) {
        allTrs.forEach(function (tr) {
          var checkbox = tr.querySelector('.df-row-checkbox');
          if (checkbox) checkbox.checked = tr.classList.contains('active');
        });
      }
    }

    var globalActions = document.getElementById('global-page-actions');
    var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');
    if (!btnContainer) return;

    var actualToolbar = btnContainer.firstElementChild; // .button-bar
    if (!actualToolbar) return;

    var counter = actualToolbar.querySelector('#selection-counter');
    if (!counter) {
      // Bọc các nút bấm hiện tại vào một vùng cuộn riêng để bảo toàn background trắng của toolbar gốc
      if (!actualToolbar.querySelector('.btn-scroll-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'btn-scroll-wrapper';
        while (actualToolbar.firstChild) {
          wrapper.appendChild(actualToolbar.firstChild);
        }
        actualToolbar.appendChild(wrapper);
      }

      if (!document.getElementById('selection-counter-style')) {
        var style = document.createElement('style');
        style.id = 'selection-counter-style';
        style.innerHTML = `
          /* Toolbar gốc: Cho phép rớt dòng để chứa counter ở dưới trên mobile */
          #dynamic-btn-container .button-bar,
          .page-title-actions .button-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
          }
          /* Wrapper chứa nút bấm: Cuộn ngang, không rớt dòng */
          .btn-scroll-wrapper {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            flex: 1 1 auto;
            min-width: 0;
            gap: 8px;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding-bottom: 2px;
          }
          .btn-scroll-wrapper::-webkit-scrollbar {
            display: none;
          }
          /* Badge Đã chọn */
          #selection-counter {
            margin-left: auto;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-primary);
            background: var(--color-primary-light);
            padding: 4px 8px 4px 12px;
            border-radius: 20px;
            white-space: nowrap;
            flex-shrink: 0;
            display: none;
            align-items: center;
            gap: 4px;
          }
          @media (max-width: 768px) {
            .btn-scroll-wrapper {
              flex: 1 1 100%;
              width: 100%;
            }
            #selection-counter {
              display: none !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
      counter = document.createElement('div');
      counter.id = 'selection-counter';
      actualToolbar.appendChild(counter);
    }

    if (selectedRows.length > 0) {
      counter.style.display = 'inline-flex';
      counter.innerHTML = `
        <span>Đã chọn ${selectedRows.length} dòng</span>
        <span class="material-symbols-outlined btn-clear-selection" title="Bỏ chọn" style="font-size: 16px; cursor: pointer; border-radius: 50%; padding: 2px;">close</span>
      `;
      var btnClear = counter.querySelector('.btn-clear-selection');
      if (btnClear) {
        btnClear.onmouseover = function () { this.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
        btnClear.onmouseout = function () { this.style.backgroundColor = 'transparent'; };
        btnClear.onclick = _clearSelection;
      }
    } else {
      counter.style.display = 'none';
      counter.innerHTML = '';
    }

    if (MODULE_CONFIG.UseSplitLayout) {
      _updateDetailView();
    }
  }

  function _updateDetailView() {
    var detailContent = $container.querySelector('#dynamic-detail-content');
    if (!detailContent) return;

    var splitContainer = $container.querySelector('.split-master-detail-container');

    if (!selectedRows || selectedRows.length === 0) {
      if (splitContainer) {
        splitContainer.classList.remove('show-detail');
      }
      var selectText = MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết';
      detailContent.innerHTML = '<div class="empty-detail-state">' +
        '<div class="empty-icon-wrapper">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
        '</div>' +
        '<div class="empty-text-main">Chưa có thông tin</div>' +
        '<div class="empty-text-sub">' + selectText + '</div>' +
        '</div>';
      var detailHeader = $container.querySelector('.detail-header');
      if (detailHeader) {
        detailHeader.textContent = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
      }
      return;
    }

    if (splitContainer) {
      splitContainer.classList.add('show-detail');
    }

    // Set up mobile back button click handler
    var backBtn = $container.querySelector('.detail-back-btn');
    if (backBtn) {
      backBtn.onclick = _clearSelection;
    }

    var row = selectedRows[0];
    var currentRowId = row[MODULE_CONFIG.PrimaryKey] || '';
    if (currentRowId !== _lastDetailRowId) {
      _inlineEditMode = false;
      _lastDetailRowId = currentRowId;
    }

    detailContent.innerHTML = '';

    var detailHeader = $container.querySelector('.detail-header');
    if (detailHeader) {
      var defaultDetailTitle = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
      var nameVal = row.PersonName || row.TenPhuCap || row[MODULE_CONFIG.PrimaryKey] || '';

      detailHeader.style.display = 'flex';
      detailHeader.style.justifyContent = 'space-between';
      detailHeader.style.alignItems = 'center';

      var titleSpan = document.createElement('span');
      titleSpan.textContent = defaultDetailTitle + ': ' + nameVal;

      detailHeader.innerHTML = '';
      detailHeader.appendChild(titleSpan);

      var currentTabDef = MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0 ? MODULE_CONFIG.DetailTabs[activeDetailTabIdx || 0] : null;
      if (currentTabDef && currentTabDef.type === 'form' && !MODULE_CONFIG.HideEditBtn && (typeof _hasPermission !== 'function' || _hasPermission('EDIT'))) {
        var hdrActions = document.createElement('div');
        hdrActions.style.cssText = 'display: flex; gap: 8px; font-weight: normal; margin-right: 4px;';
        if (_inlineEditMode) {
          var btnSave = document.createElement('button');
          btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
          btnSave.style.cssText = 'padding: 6px 16px; background: var(--color-success, #10b981); color: white; border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); outline: none; transition: all 0.2s;';
          btnSave.onmouseover = function () { this.style.transform = 'translateY(-1px)'; this.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)'; };
          btnSave.onmouseout = function () { this.style.transform = 'none'; this.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'; };
          btnSave.onclick = function () { _saveInlineEdit(row, currentTabDef, btnSave); };

          var btnCancel = document.createElement('button');
          btnCancel.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">close</span> Hủy';
          btnCancel.style.cssText = 'padding: 6px 16px; background: var(--color-surface-elevated, #f1f5f9); color: var(--color-text-secondary, #64748b); border: 1px solid var(--color-border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; outline: none; transition: all 0.2s;';
          btnCancel.onmouseover = function () { this.style.background = 'var(--color-border-subtle, #e2e8f0)'; };
          btnCancel.onmouseout = function () { this.style.background = 'var(--color-surface-elevated, #f1f5f9)'; };
          btnCancel.onclick = function () { _inlineEditMode = false; _updateDetailView(); };

          hdrActions.appendChild(btnCancel);
          hdrActions.appendChild(btnSave);
        } else {
          var btnEdit = document.createElement('button');
          btnEdit.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">edit</span> Sửa';
          btnEdit.style.cssText = 'padding: 6px 16px; background: var(--color-primary-light, #e0e7ff); color: var(--color-primary, #4338ca); border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; outline: none; transition: all 0.2s;';
          btnEdit.onmouseover = function () { this.style.background = 'var(--color-primary, #4338ca)'; this.style.color = 'white'; };
          btnEdit.onmouseout = function () { this.style.background = 'var(--color-primary-light, #e0e7ff)'; this.style.color = 'var(--color-primary, #4338ca)'; };
          btnEdit.onclick = function () { _openEditForm(row); };
          hdrActions.appendChild(btnEdit);
        }
        detailHeader.appendChild(hdrActions);
      }
    }

    if (MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
      // 1. Render master fields card if DetailFormFields is defined
      var masterGrid = null;
      if (MODULE_CONFIG.DetailFormFields && (!MODULE_CONFIG.DetailTabs || MODULE_CONFIG.DetailTabs.length === 0)) {
        masterGrid = document.createElement('div');
        masterGrid.className = 'detail-master-grid';
        masterGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; margin-bottom: 20px; padding: 14px; background: var(--color-background, #f8fafc); border-radius: 8px; border: 1px solid var(--color-border, #e2e8f0);';

        MODULE_CONFIG.DetailFormFields.forEach(function (f) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';
          if (f.format === 'boolean') {
            fldDiv.style.flexDirection = 'row';
            fldDiv.style.alignItems = 'center';
            fldDiv.style.gap = '8px';
            fldDiv.style.padding = '4px 0';
          }

          var label = document.createElement('span');
          label.textContent = f.label;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[f.name];
          var valFormatted = '';
          if (rawVal === null || rawVal === undefined) {
            valFormatted = '—';
          } else if (f.format === 'money') {
            var n = parseFloat(rawVal);
            valFormatted = isNaN(n) ? rawVal : n.toLocaleString('vi-VN');
            valSpan.style.fontFamily = 'monospace';
            valSpan.style.fontWeight = '600';
          } else if (f.format === 'boolean') {
            var isTrue = (rawVal === true || rawVal === 1 || String(rawVal) === '1' || String(rawVal).toLowerCase() === 'true');
            valFormatted = isTrue
              ? `<span style="color:var(--color-success); display:inline-flex; align-items:center; gap:4px; font-weight:600;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span>Có</span>`
              : `<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span>Không</span>`;
          } else {
            valFormatted = rawVal;
          }

          if (f.format === 'boolean') {
            fldDiv.innerHTML = valFormatted + `<span style="font-size: 12px; font-weight: 500; color: var(--color-text);">${f.label}</span>`;
          } else {
            valSpan.innerHTML = valFormatted;
            valSpan.style.fontSize = '13px';
            valSpan.style.color = 'var(--color-text, #1e293b)';
            valSpan.style.fontWeight = '500';
            fldDiv.appendChild(label);
            fldDiv.appendChild(valSpan);
          }
          masterGrid.appendChild(fldDiv);
        });
        detailContent.appendChild(masterGrid);
      }

      // 2. Render Tabs Bar if there are multiple tabs
      if (MODULE_CONFIG.DetailTabs.length > 1) {
        var tabsBar = document.createElement('div');
        tabsBar.className = 'detail-tabs-bar';
        tabsBar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border);';

        if (typeof activeDetailTabIdx === 'undefined' || activeDetailTabIdx >= MODULE_CONFIG.DetailTabs.length) {
          activeDetailTabIdx = 0;
        }

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var tabBtn = document.createElement('button');
          tabBtn.type = 'button';
          tabBtn.textContent = tab.label;
          var isActive = (idx === activeDetailTabIdx);

          tabBtn.style.cssText = 'padding: 8px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; font-family: inherit;';

          if (isActive) {
            tabBtn.style.backgroundColor = 'var(--color-primary)';
            tabBtn.style.color = '#ffffff';
            tabBtn.style.fontWeight = '600';
            tabBtn.style.boxShadow = 'var(--shadow-sm)';
          } else {
            tabBtn.style.backgroundColor = 'transparent';
            tabBtn.style.color = 'var(--color-text-secondary)';

            tabBtn.onmouseover = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'var(--color-surface)';
                this.style.color = 'var(--color-text)';
              }
            };
            tabBtn.onmouseout = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'transparent';
                this.style.color = 'var(--color-text-secondary)';
              }
            };
          }

          tabBtn.onclick = function () {
            activeDetailTabIdx = idx;
            _updateDetailView();
          };
          tabsBar.appendChild(tabBtn);
        });
        detailContent.appendChild(tabsBar);

        // --- Custom Mobile Dropdown ---
        var selectWrapper = document.createElement('div');
        selectWrapper.className = 'detail-tabs-mobile-select-wrapper custom-dropdown-wrapper';
        selectWrapper.style.cssText = 'margin-bottom: 16px; width: 100%; position: relative;';

        var triggerBtn = document.createElement('button');
        triggerBtn.type = 'button';
        triggerBtn.className = 'custom-dropdown-trigger';
        triggerBtn.innerHTML = '<span>' + (MODULE_CONFIG.DetailTabs[activeDetailTabIdx] ? MODULE_CONFIG.DetailTabs[activeDetailTabIdx].label : 'Select Tab') + '</span><span class="material-symbols-outlined" style="font-size: 20px; color: var(--color-text-secondary); transition: transform 0.25s ease;">expand_more</span>';
        triggerBtn.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width: 100%; padding: 10px 14px; font-size: 14px; font-weight: 600; border: 1px solid var(--color-border); border-radius: 8px; background-color: var(--color-surface); color: var(--color-text); cursor: pointer; height: 44px; transition: all 0.2s ease; outline: none;';

        var dropdownPanel = document.createElement('div');
        dropdownPanel.className = 'custom-dropdown-panel';
        dropdownPanel.style.cssText = 'position: absolute; background: var(--color-surface); border-radius: var(--radius-md, 8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 999999; max-height: 280px; overflow-y: auto; display: none; flex-direction: column; padding: 8px 0; border: 1px solid var(--color-border);';

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var optBtn = document.createElement('button');
          optBtn.type = 'button';
          optBtn.textContent = tab.label;
          var isSelected = idx === activeDetailTabIdx;

          optBtn.style.cssText = 'width: 100%; display: flex; align-items: center; padding: 10px 16px; font-size: 14px; text-align: left; border: none; background: ' + (isSelected ? 'rgba(var(--color-primary-rgb, 60,80,224), 0.08)' : 'transparent') + '; color: ' + (isSelected ? 'var(--color-primary)' : 'var(--color-text)') + '; font-weight: ' + (isSelected ? '600' : '500') + '; cursor: pointer; transition: background 0.15s ease; font-family: inherit;';

          optBtn.onmouseover = function () {
            if (!isSelected) this.style.background = 'var(--color-surface-hover, rgba(0, 0, 0, 0.04))';
          };
          optBtn.onmouseout = function () {
            if (!isSelected) this.style.background = 'transparent';
          };

          optBtn.onclick = function (e) {
            e.stopPropagation();
            activeDetailTabIdx = idx;
            dropdownPanel.style.display = 'none';
            _updateDetailView();
          };
          dropdownPanel.appendChild(optBtn);
        });

        triggerBtn.onclick = function (e) {
          e.stopPropagation();
          var isOpen = dropdownPanel.style.display === 'flex';

          if (!isOpen) {
            dropdownPanel.style.display = 'flex';
            var rect = triggerBtn.getBoundingClientRect();
            dropdownPanel.style.top = (rect.bottom + window.scrollY + 4) + 'px';
            dropdownPanel.style.left = (rect.left + window.scrollX) + 'px';
            dropdownPanel.style.width = rect.width + 'px';

            triggerBtn.style.background = 'var(--color-primary)';
            triggerBtn.style.color = '#fff';
            triggerBtn.style.borderColor = 'var(--color-primary)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = '#fff';
              icon.style.transform = 'rotate(180deg)';
            }
          } else {
            dropdownPanel.style.display = 'none';
            triggerBtn.style.background = 'var(--color-surface)';
            triggerBtn.style.color = 'var(--color-text)';
            triggerBtn.style.borderColor = 'var(--color-border)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = 'var(--color-text-secondary)';
              icon.style.transform = 'rotate(0deg)';
            }
          }
        };

        // Click outside to close
        var clickOutsideHandler = function (e) {
          if (!selectWrapper.contains(e.target) && !dropdownPanel.contains(e.target)) {
            dropdownPanel.style.display = 'none';
            triggerBtn.style.background = 'var(--color-surface)';
            triggerBtn.style.color = 'var(--color-text)';
            triggerBtn.style.borderColor = 'var(--color-border)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = 'var(--color-text-secondary)';
              icon.style.transform = 'rotate(0deg)';
            }
          }
        };
        document.addEventListener('click', clickOutsideHandler);

        // Clean up event listener and body element when selectWrapper is removed
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            Array.from(mutation.removedNodes).forEach(function (node) {
              if (node === selectWrapper || node.contains(selectWrapper)) {
                document.removeEventListener('click', clickOutsideHandler);
                if (dropdownPanel && dropdownPanel.parentNode) {
                  dropdownPanel.parentNode.removeChild(dropdownPanel);
                }
                observer.disconnect();
              }
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        selectWrapper.appendChild(triggerBtn);
        // Append dropdownPanel to body so it completely escapes any overflow: hidden
        document.body.appendChild(dropdownPanel);
        detailContent.appendChild(selectWrapper);
      }

      // 3. Render active tab content
      var currentTabIdx = (typeof activeDetailTabIdx !== 'undefined' && activeDetailTabIdx < MODULE_CONFIG.DetailTabs.length) ? activeDetailTabIdx : 0;
      var tabDef = MODULE_CONFIG.DetailTabs[currentTabIdx];

      var tabContentContainer = document.createElement('div');
      tabContentContainer.className = 'detail-tab-content';
      detailContent.appendChild(tabContentContainer);

      if (tabDef.type === 'form') {
        // Form-type tab (personal details form next to employee photo box)
        var formWrap = document.createElement('div');
        formWrap.className = 'detail-form-wrap';
        formWrap.style.cssText = 'display: flex; gap: 16px; align-items: flex-start;';

        var fieldsGrid = document.createElement('div');
        fieldsGrid.className = 'detail-fields-grid';
        fieldsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px 24px; flex: 1; background: var(--color-surface, #fff); padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid var(--color-border, #e2e8f0);';

        if (_inlineEditMode && !document.getElementById('inline-edit-style-override')) {
          var inlineStyle = document.createElement('style');
          inlineStyle.id = 'inline-edit-style-override';
          inlineStyle.innerHTML = `
            .inline-edit-field { width: 100%; display: flex; align-items: center; position: relative; }
            .inline-edit-field .form-inline-input {
              width: 100%;
              border: 1px dashed transparent;
              border-bottom: 1px dashed var(--color-border, #cbd5e1);
              padding: 4px;
              margin-left: -4px;
              border-radius: 4px 4px 0 0;
              font-size: 14px;
              font-weight: 600;
              color: var(--color-text, #0f172a);
              background: transparent;
              outline: none;
              font-family: inherit;
              transition: all 0.2s;
            }
            .inline-edit-field .form-inline-input:hover {
              background: rgba(0,0,0,0.02);
            }
            .inline-edit-field .form-inline-input:focus {
              border-bottom: 1px solid var(--color-primary, #3c50e0);
              background: var(--color-primary-light, #e0e7ff);
            }
            .inline-edit-field .ui-input:disabled {
              border: none !important;
              background: transparent !important;
              color: var(--color-text-secondary, #64748b);
              font-weight: 600;
            }
            .inline-edit-field select.form-inline-input {
              appearance: none;
              background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 4px center;
              background-size: 16px;
            }
            .inline-edit-field input[type="date"].form-inline-input::-webkit-calendar-picker-indicator {
              cursor: pointer;
              opacity: 0.5;
              transition: 0.2s;
              padding: 4px;
            }
            .inline-edit-field input[type="date"].form-inline-input:hover::-webkit-calendar-picker-indicator {
              opacity: 1;
            }
          `;
          document.head.appendChild(inlineStyle);
        }

        var fieldsToRender = tabDef.fields || [];
        fieldsToRender.forEach(function (fName) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 2px; padding-bottom: 6px; border-bottom: 1px dashed var(--color-border-subtle, #f1f5f9);';

          var labelText = (tabDef.headers && tabDef.headers[fName]) ? tabDef.headers[fName] : (globalDictionary[fName] || fName);
          if (typeof labelText === 'string') {
            labelText = labelText.replace(/\s*:\s*$/, '');
          }

          var label = document.createElement('span');
          label.textContent = labelText;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-tertiary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[fName];
          var valFormatted = '';

          if (_inlineEditMode) {
            valSpan = document.createElement('div');
            valSpan.className = 'inline-edit-field';

            var fieldSchema = globalFormSchema.find(function (s) { return s.name === fName; });
            var isReadOnly = fieldSchema ? fieldSchema.isReadOnlyEdit : (fName === MODULE_CONFIG.PrimaryKey || fName === 'NewPersonID');
            var isDate = fName.toLowerCase().indexOf('ngay') >= 0 || (fieldSchema && fieldSchema.renderRule === 'dt');

            if (isReadOnly) {
              var roInput = document.createElement('input');
              roInput.type = 'text';
              roInput.value = rawVal || '';
              roInput.disabled = true;
              roInput.className = 'ui-input form-inline-input';
              valSpan.appendChild(roInput);
            } else if (isDate) {
              var dInput = document.createElement('input');
              dInput.type = 'date';
              dInput.name = fName;
              dInput.className = 'ui-input form-inline-input';
              if (rawVal) {
                try {
                  var d = new Date(rawVal);
                  if (!isNaN(d.getTime())) dInput.value = d.toISOString().split('T')[0];
                } catch (e) { }
              }
              valSpan.appendChild(dInput);
            } else if (fName === 'GioiTinh') {
              var sel = document.createElement('select');
              sel.name = fName;
              sel.className = 'ui-input form-inline-input';
              var opts = ['Nam', 'Nữ', 'Khác'];
              opts.forEach(function (o) {
                var option = document.createElement('option');
                option.value = o; option.textContent = o;
                if (rawVal === o) option.selected = true;
                sel.appendChild(option);
              });
              valSpan.appendChild(sel);
            } else if (fName === 'PersonStatus') {
              var selStatus = document.createElement('select');
              selStatus.name = fName;
              selStatus.className = 'ui-input form-inline-input';
              var statuses = [{ v: '1', t: 'Thử việc' }, { v: '4', t: 'Chính thức' }, { v: '8', t: 'Nghỉ việc' }];
              statuses.forEach(function (s) {
                var option = document.createElement('option');
                option.value = s.v; option.textContent = s.t;
                if (String(rawVal) === s.v) option.selected = true;
                selStatus.appendChild(option);
              });
              valSpan.appendChild(selStatus);
            } else {
              var txtInput = document.createElement('input');
              txtInput.type = 'text';
              txtInput.name = fName;
              txtInput.value = rawVal || '';
              txtInput.className = 'ui-input form-inline-input';
              valSpan.appendChild(txtInput);
            }
          } else {
            if (rawVal === null || rawVal === undefined) {
              valFormatted = '—';
            } else {
              if (fName.toLowerCase().indexOf('ngay') >= 0 && rawVal) {
                try {
                  var d = new Date(rawVal);
                  if (!isNaN(d.getTime())) {
                    valFormatted = d.toLocaleDateString('vi-VN');
                  } else {
                    valFormatted = rawVal;
                  }
                } catch (e) {
                  valFormatted = rawVal;
                }
              } else if (fName === 'PersonStatus') {
                var statusMap = {
                  '1': 'Thử việc',
                  '4': 'Chính thức',
                  '8': 'Nghỉ việc'
                };
                valFormatted = statusMap[String(rawVal)] || rawVal;
              } else {
                valFormatted = rawVal;
              }
            }

            valSpan.innerHTML = valFormatted;
            valSpan.style.fontSize = '14px';
            valSpan.style.color = 'var(--color-text, #0f172a)';
            valSpan.style.fontWeight = '600';
          }

          fldDiv.appendChild(label);
          fldDiv.appendChild(valSpan);
          fieldsGrid.appendChild(fldDiv);
        });

        formWrap.appendChild(fieldsGrid);

        var isPersonForm = !!MODULE_CONFIG.isPersonForm;
        var isCandidateForm = !!MODULE_CONFIG.isCandidateForm;
        if (isPersonForm || isCandidateForm) {
          console.log('[PHOTO DEBUG] Detail View - row:', row);
          var photoBox = document.createElement('div');
          photoBox.className = 'photo-box-wrapper';
          photoBox.style.cssText = 'width: 180px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; border: none; padding: 0; background: transparent;';

          var imgFrame = document.createElement('div');
          imgFrame.className = 'detail-img-frame';
          imgFrame.style.cssText = 'width: 160px; height: 160px; border: 4px solid var(--color-surface, #fff); border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative;';

          var img = document.createElement('img');
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

          var defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";
          var rawContent = '';
          var fileNameVal = '';
          if (row) {
            for (var key in row) {
              var keyLower = key.toLowerCase();
              if (keyLower === 'content') {
                rawContent = row[key];
              } else if (keyLower === 'filename') {
                fileNameVal = row[key];
              }
            }
          }

          var imgIdVal = row ? (isPersonForm ? (row.PersonID || '') : (row.CandidateID || '')) : '';
          var isLoadingHex = false;

          if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
            var mimeType = 'image/jpeg';
            if (fileNameVal) {
              var ext = fileNameVal.split('.').pop().toLowerCase();
              if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';
            }
            try {
              if (/^0x/i.test(rawContent)) {
                // Chuỗi hex dạng 0xFFD8FF...
                var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
                var bytes = new Uint8Array(hexStr.length / 2);
                for (var bi = 0; bi < bytes.length; bi++) {
                  bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
                }
                var blob = new Blob([bytes], { type: mimeType });
                img.src = URL.createObjectURL(blob);
              } else {
                // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
                img.src = 'data:' + mimeType + ';base64,' + rawContent;
              }
              isLoadingHex = true;
            } catch (err) {
              console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
            }
          }

          var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

          if (!isLoadingHex) {
            if (imgIdVal) {
              var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
              img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
            } else {
              img.src = defaultPhoto;
            }
          }

          img.onerror = function () {
            if (isLoadingBase64) {
              isLoadingBase64 = false;
              if (imgIdVal) {
                var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
                img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
                return;
              }
            }

            // Dynamic API fetch fallback
            if (imgIdVal) {
              var self = this;
              var attachApi = (MODULE_CONFIG && MODULE_CONFIG.isCandidateForm && MODULE_CONFIG.useCandidateAttachmentApi)
                ? 'API_CandidateAttach' : 'API_PersonAttach';

              var fetchPayload = {
                List: attachApi,
                Func: 'View',
                JsonData: JSON.stringify({
                  CandidateID: imgIdVal,
                  PersonID: imgIdVal
                }),
                UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown'
              };

              ApiClient.post('/api/API_Gateway_Router', fetchPayload)
                .then(function (data) {
                  if (data && data.code === 0 && data.records && data.records.length > 0) {
                    var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                    if (b64 && b64.length > 10) {
                      if (b64.startsWith('data:image')) {
                        self.src = b64;
                      } else {
                        var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                        self.src = 'data:' + mimeType + ';base64,' + b64;
                      }
                    } else {
                      if (self.src !== defaultPhoto) self.src = defaultPhoto;
                    }
                  } else {
                    if (self.src !== defaultPhoto) self.src = defaultPhoto;
                  }
                })
                .catch(function (err) {
                  if (self.src !== defaultPhoto) self.src = defaultPhoto;
                });
            } else {
              if (img.src !== defaultPhoto) img.src = defaultPhoto;
            }
          };

          imgFrame.appendChild(img);

          if (_inlineEditMode) {
            var avatarOverlay = document.createElement('div');
            avatarOverlay.className = 'avatar-edit-overlay';
            avatarOverlay.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; text-align: center; padding: 6px 0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; transition: 0.2s;';
            avatarOverlay.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">add_a_photo</span> Thay ảnh';
            if (isViewMode) avatarOverlay.style.display = 'none';

            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';

            fileInput.onchange = function (e) {
              var file = e.target.files[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                if (typeof Alert !== 'undefined') Alert.error('Tệp quá lớn', 'Hệ thống chỉ hỗ trợ ảnh tối đa 10MB.');
                return;
              }

              var reader = new FileReader();
              reader.onload = function (e_ab) {
                var bytes = new Uint8Array(e_ab.target.result);
                var hexArray = [];
                for (var i = 0; i < bytes.length; i++) {
                  var hexVal = bytes[i].toString(16);
                  if (hexVal.length < 2) hexVal = '0' + hexVal;
                  hexArray.push(hexVal);
                }
                var hexStr = '0x' + hexArray.join('');

                var base64Reader = new FileReader();
                base64Reader.onload = function (e_b64) {
                  var dataUrl = e_b64.target.result;
                  var base64Content = dataUrl.split(',')[1] || dataUrl;

                  // Preview immediately
                  img.src = dataUrl;

                  // Save to window for _saveInlineEdit
                  window._pendingAvatar = {
                    file: file,
                    hexStr: hexStr,
                    base64Content: base64Content,
                    dataUrl: dataUrl // Store the full dataUrl for the backend
                  };
                };
                base64Reader.readAsDataURL(file);
              };
              reader.readAsArrayBuffer(file);
            };

            avatarOverlay.onclick = function () { fileInput.click(); };

            imgFrame.appendChild(avatarOverlay);
            imgFrame.appendChild(fileInput);
          }

          photoBox.appendChild(imgFrame);
          formWrap.appendChild(photoBox);
        }

        tabContentContainer.appendChild(formWrap);
      } else if (tabDef.type === 'kv-form') {
        // KV-Form tab: gọi API riêng và hiển thị từng record dướng form nhãn-giá trị
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải dữ liệu...</div>';
        var pkFieldKV = MODULE_CONFIG.PrimaryKey || 'PersonID';
        var pkValKV = row[pkFieldKV] || '';
        var filterKV = {};
        filterKV[tabDef.filterField || pkFieldKV] = pkValKV;
        var payloadKV = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterKV) };
        var MONEY_KV = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
        var DATE_KV = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payloadKV).then(function (resKV) {
          var dataKV = resKV.list || resKV.records || [];
          tabContentContainer.innerHTML = '';
          if (dataKV.length === 0) {
            var emptyKV = document.createElement('div');
            emptyKV.style.cssText = 'color:var(--color-text-secondary);padding:24px;text-align:center;font-size:13px;';
            emptyKV.textContent = tabDef.emptyText || 'Chưa có dữ liệu';
            tabContentContainer.appendChild(emptyKV);
            return;
          }
          var fieldsKV = tabDef.fields || Object.keys(dataKV[0]).filter(function (k) { return !k.startsWith('_') && k !== 'UserAutoID' && k !== 'PersonID'; });
          dataKV.forEach(function (rec, idx) {
            var card = document.createElement('div');
            card.style.cssText = 'background:var(--color-background,#f8fafc);border:1px solid var(--color-border);border-radius:8px;padding:14px 16px;margin-bottom:12px;';
            if (dataKV.length > 1) {
              var cardHdr = document.createElement('div');
              cardHdr.style.cssText = 'font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--color-border);';
              cardHdr.textContent = (tabDef.cardTitle || 'Bản ghi') + ' ' + (idx + 1);
              card.appendChild(cardHdr);
            }
            var grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 20px;';
            fieldsKV.forEach(function (fk) {
              var fldDiv = document.createElement('div');
              fldDiv.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
              var lbl = document.createElement('span');
              var lblTxt = (tabDef.headers && tabDef.headers[fk]) ? tabDef.headers[fk] : (globalDictionary[fk] || fk);
              if (typeof lblTxt === 'string') { lblTxt = lblTxt.replace(/\s*:\s*$/, ''); }
              lbl.textContent = lblTxt;
              lbl.style.cssText = 'font-size:11px;font-weight:600;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:0.5px;';
              var val = document.createElement('span');
              var rawV = rec[fk];
              var displayV = '';
              if (rawV === null || rawV === undefined || rawV === '') {
                displayV = '—';
                val.style.color = 'var(--color-text-secondary)';
              } else if (DATE_KV.indexOf(fk) >= 0) {
                try { var dkv = new Date(rawV); displayV = !isNaN(dkv.getTime()) ? dkv.toLocaleDateString('vi-VN') : rawV; } catch (e) { displayV = rawV; }
                val.style.color = 'var(--color-text)';
              } else if (MONEY_KV.indexOf(fk) >= 0) {
                var nkv = parseFloat(rawV);
                displayV = (!isNaN(nkv) ? nkv.toLocaleString('vi-VN') : rawV) + ' đ';
                val.style.cssText = 'font-family:monospace;font-weight:600;font-size:14px;color:var(--color-primary);';
              } else {
                displayV = rawV;
                val.style.color = 'var(--color-text)';
              }
              val.textContent = displayV;
              val.style.fontSize = '13px';
              val.style.fontWeight = val.style.fontWeight || '500';
              fldDiv.appendChild(lbl);
              fldDiv.appendChild(val);
              grid.appendChild(fldDiv);
            });
            card.appendChild(grid);
            tabContentContainer.appendChild(card);
          });
        }).catch(function () {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu</div>';
        });
      } else if (tabDef.type === 'attachments') {
        _renderAttachmentsTab(tabDef, tabContentContainer, false, row);
      } else {
        // Table tab
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải chi tiết...</div>';
        var pkField = MODULE_CONFIG.PrimaryKey || 'PersonID';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
          var data = res.list || res.records || [];
          // Lọc bỏ hàng trống: nếu tất cả field hiển thị đều là null/''/'0'/0 thì bỏ qua
          if (tabDef.fields && tabDef.fields.length > 0) {
            var SKIP_KEYS = ['UserAutoID', 'PersonID', 'SapCaID', 'MaHopDong', 'RelationID', 'MaPhuCap'];
            var displayKeys = tabDef.fields.filter(function (k) { return SKIP_KEYS.indexOf(k) < 0; });
            data = data.filter(function (r) {
              return displayKeys.some(function (k) {
                var v = r[k];
                if (v === null || v === undefined || v === '') return false;
                if (String(v).trim() === '0' || String(v).trim() === '0.00') return false;
                return true;
              });
            });
          }
          tabContentContainer.innerHTML = '';

          if (data.length === 0) {
            var emptyText = tabDef.emptyText || MODULE_CONFIG.SplitLayoutEmptyText || 'Không có dữ liệu chi tiết';
            var emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'color:var(--color-text-secondary);padding:12px;text-align:center;';
            emptyDiv.textContent = emptyText;
            tabContentContainer.appendChild(emptyDiv);
            return;
          }

          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });

          // Xác định kiểu cột 1 lần duy nhất để căn chỉnh đồng nhất header & cell
          var MONEY_FIELDS = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
          var DATE_FIELDS = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'TuNgay', 'DenNgay', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];
          var NUMBER_FIELDS = ['SoNgay', 'SoNgayDaSuDung', 'SoNgayConLai', 'PhepThamNien', 'PhepTonNamTruoc', 'SoNgayPhepTet', 'SoNgayPhepOm', 'Nam', 'SoLuong', 'SoNgayNghi'];
          var TEXT_WRAP_FIELDS = ['NoiDung', 'GhiChu', 'NoiDungKTKL', 'NoiDungPhuCap', 'Notes'];
          var colType = {};
          keys.forEach(function (k) {
            if (NUMBER_FIELDS.indexOf(k) >= 0) { colType[k] = 'number'; }
            else if (DATE_FIELDS.indexOf(k) >= 0) { colType[k] = 'date'; }
            else if (MONEY_FIELDS.indexOf(k) >= 0) { colType[k] = 'money'; }
            else if (TEXT_WRAP_FIELDS.indexOf(k) >= 0) { colType[k] = 'textwrap'; }
            else {
              var kl = k.toLowerCase();
              // Tránh match SoNgay* (số ngày) thành kiểu date
              if ((kl.indexOf('ngay') >= 0 && !kl.startsWith('so')) || kl.indexOf('date') >= 0) { colType[k] = 'date'; }
              else if (kl.indexOf('tien') >= 0 || kl.indexOf('luong') >= 0 || kl === 'mucdong' || kl === 'mucluong') { colType[k] = 'money'; }
              else if (kl.indexOf('noidung') >= 0 || kl.indexOf('ghichu') >= 0 || kl === 'notes') { colType[k] = 'textwrap'; }
              else { colType[k] = 'text'; }
            }
          });

          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;table-layout:auto;';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            if (typeof label === 'string') { label = label.replace(/\s*:\s*$/, ''); }
            th.textContent = label;
            var thAlign = (colType[k] === 'money') ? 'right' : 'left';
            th.style.cssText = 'padding:8px 10px;border-bottom:2px solid var(--color-border);background:var(--color-surface-elevated);position:sticky;top:0;text-align:' + thAlign + ';white-space:nowrap;color:var(--color-text);font-weight:700;';
            if (colType[k] === 'textwrap') { th.style.minWidth = '140px'; }
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r, rIdx) {
            var tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom:1px solid var(--color-border);' + (rIdx % 2 === 1 ? 'background:var(--color-background,#f8fafc);' : '');
            keys.forEach(function (k) {
              var td = document.createElement('td');
              var val = r[k];
              var ct = colType[k];
              if (ct === 'date' && val) {
                try { var dv = new Date(val); if (!isNaN(dv.getTime())) { val = dv.toLocaleDateString('vi-VN'); } } catch (e) { }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              } else if (ct === 'money') {
                var n = parseFloat(val);
                if (!isNaN(n) && val !== '' && val != null) { val = n.toLocaleString('vi-VN'); }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;font-weight:500;color:var(--color-text);';
              } else if (ct === 'number') {
                var nv = parseFloat(val);
                if (!isNaN(nv) && val !== '' && val != null) {
                  // Hiển thị số nguyên gọn (12.00 → 12), thập phân giữ max 2 chữ số
                  val = Number.isInteger(nv) ? nv.toLocaleString('vi-VN') : nv.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
                }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;color:var(--color-text);';
              } else if (ct === 'textwrap') {
                td.style.cssText = 'padding:8px 10px;white-space:normal;word-break:break-word;min-width:140px;max-width:240px;color:var(--color-text);';
              } else {
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              }
              td.textContent = val != null ? val : '';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          tabContentContainer.appendChild(wrap);
        }).catch(function (err) {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu chi tiết</div>';
        });
      }
    }
  }

  // ── Modal Form ────────────────────────────────────────────
  function _openBulkAddForm() {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    // Form đích
    var targetFormInput = UIInput.createText({
      label: 'Nhập cho Tên Form nào? (*)',
      required: true,
      placeholder: 'Ví dụ: frmCustomer'
    });
    body.appendChild(targetFormInput);

    // Vùng cuộn chứa Table
    var tableWrap = document.createElement('div');
    tableWrap.style.overflowX = 'auto';
    tableWrap.style.border = '1px solid var(--color-border)';
    tableWrap.style.borderRadius = '8px';

    var table = document.createElement('table');
    table.className = 'table table-hover mb-0';
    table.style.minWidth = '800px';

    var thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:140px;">Tên Cột (Database) *</th>
        <th style="width:160px;">Tiêu đề (Tiếng Việt)</th>
        <th style="width:120px;">Loại Input</th>
        <th style="width:70px; text-align:center;">Bắt buộc</th>
        <th style="width:160px;">Nguồn dữ liệu (API/STATIC)</th>
        <th style="width:80px;">Vị trí</th>
        <th style="width:150px;" title="Ví dụ: TrangThai=huy|doi">VisibleRule</th>
        <th style="width:60px; text-align:center;">Thêm</th>
        <th style="width:60px; text-align:center;">Sửa</th>
        <th style="width:60px; text-align:center;">Lọc</th>
        <th style="width:40px;"></th>
      </tr>
    `;
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);

    // Nút thêm dòng
    var btnAddRow = document.createElement('button');
    btnAddRow.className = 'btn btn-outline-primary d-flex align-items-center mt-2';
    btnAddRow.style.width = 'fit-content';
    btnAddRow.innerHTML = '<span class="material-symbols-outlined me-1" style="font-size:18px;">add</span> Thêm dòng mới';

    // Logic đẻ ra dòng mới
    function addRow() {
      var tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-1"><input type="text" class="ui-input" name="FieldName" placeholder="Ví dụ: CustomerID"></td>
        <td class="p-1"><input type="text" class="ui-input" name="CaptionVN" placeholder="Tiêu đề hiển thị"></td>
        <td class="p-1">
          <select class="ui-input" name="FormatID">
            <option value="">Chữ (Text)</option>
            <option value="nm">Số (Number)</option>
            <option value="dt">Ngày tháng (Date)</option>
            <option value="sw">Công tắc (Switch)</option>
            <option value="sl">Dropdown (Select)</option>
          </select>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-ch
            
            
            eckbox" name="IsRequired" value="1" style="cursor: pointer; margin-top: 0;">
          </div>
        </td>
        <td class="p-1"><input type="text" class="ui-input" name="DataSource" placeholder="/api/... hoặc STATIC:..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="FormPosition" placeholder="grid/6/4/12..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="VisibleRule" placeholder="VD: TrangThai=huy|doi"></td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInAdd" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Thêm Mới">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInEdit" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Chỉnh Sửa">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInFilter" value="1" style="cursor: pointer; margin-top: 0;" title="Hiển thị bộ lọc">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <button class="btn btn-sm btn-tool text-danger p-1 mt-1" onclick="this.closest('tr').remove()" title="Xóa dòng">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Mặc định tạo sẵn 3 dòng
    addRow(); addRow(); addRow();

    btnAddRow.onclick = addRow;
    body.appendChild(btnAddRow);

    var footerNode = document.createElement('div');
    footerNode.style.cssText = 'display: flex; gap: 12px;';
    footerNode.innerHTML =
      UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-close-bulk', type: 'secondary' }) +
      UIButton.createHTML({ text: 'Lưu toàn bộ', className: 'btn-submit-bulk', type: 'primary', icon: 'save' });

    var modalBulk = UIModal.show({
      title: 'Thêm Nhiều Trường (Lưới nhập liệu động)',
      content: body,
      width: '1200px', // Cho modal rộng ra để chứa bảng nhiều cột hơn
      footer: footerNode
    });

    footerNode.querySelector('.btn-close-bulk').onclick = function () {
      modalBulk.closeNow();
    };

    footerNode.querySelector('.btn-submit-bulk').onclick = function () {
      var targetForm = targetFormInput.querySelector('input').value.trim();
      if (!targetForm) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form đích!');

      var rows = tbody.querySelectorAll('tr');
      var payloads = [];

      rows.forEach(function (tr) {
        var fieldName = tr.querySelector('[name="FieldName"]').value.trim();
        var captionVN = tr.querySelector('[name="CaptionVN"]').value.trim() || fieldName;
        var formatID = tr.querySelector('[name="FormatID"]').value;
        var isRequired = tr.querySelector('[name="IsRequired"]').checked ? 1 : 0;
        var dataSource = tr.querySelector('[name="DataSource"]').value.trim();
        var formPosition = tr.querySelector('[name="FormPosition"]').value.trim();
        var visibleRule = tr.querySelector('[name="VisibleRule"]').value.trim();
        var showInAdd = tr.querySelector('[name="ShowInAdd"]').checked ? 1 : 0;
        var showInEdit = tr.querySelector('[name="ShowInEdit"]').checked ? 1 : 0;

        if (fieldName) {
          payloads.push({
            AutoID: '',
            FormName: targetForm,
            FieldName: fieldName,
            CaptionVN: captionVN,
            FormatID: formatID,
            IsRequired: isRequired,
            DataSource: dataSource,
            ShowInAdd: showInAdd,
            ShowInEdit: showInEdit,
            FormPosition: formPosition,
            VisibleRule: visibleRule,
            OrderNo: 0
          });
        }
      });

      if (payloads.length === 0) return Alert.warning('Lỗi', 'Chưa có dòng dữ liệu nào hợp lệ!');

      _setBtnLoading(btn, true);

      // Gọi API tuần tự
      _sendSequential(
        MODULE_CONFIG.ApiSave,
        payloads,
        function () {                // onDone
          modalBulk.closeNow();
          Alert.success('Thành công', 'Đã lưu thành công ' + payloads.length + ' trường!');
          if (_isFormBuilder()) window._uiConfigCache = {};
          _loadData();
        },
        function (err, payload) {   // onError → return false để dừng chuỗi
          Alert.error('Lỗi ở dòng: ' + payload.FieldName, err.message);
          _setBtnLoading(btn, false);
          return false;
        }
      );
    };
  }

  function _openAddForm() {
    // Ensure AttachmentApi is configured for Wizard Add Mode
    var isPersonForm = !!MODULE_CONFIG.isPersonForm;
    var isCandidateForm = !!MODULE_CONFIG.isCandidateForm;
    if (isPersonForm || isCandidateForm) {
      MODULE_CONFIG.AttachmentApi = isCandidateForm ? 'API_CandidateAttach' : 'API_PersonAttach';
    }

    // Neu co WizardSteps -> dung Wizard multi-step, nguoc lai dung detail full page
    if (MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0 && typeof WizardForm !== 'undefined') {
      WizardForm.open({
        steps: MODULE_CONFIG.WizardSteps,
        formSchema: globalFormSchema,
        moduleConfig: MODULE_CONFIG,
        currentUser: _currentUser(),
        userBranches: _getUserBranches(),   // Danh sách chi nhánh của user
        saveData: _saveData
      });
    } else if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&action=add';
    } else {
      _openModal(false, null, false);
    }
  }



  function _openEditForm(row) {
    if (!row || !row[MODULE_CONFIG.PrimaryKey]) {
      _openModal(true, row, true);
      return;
    }

    if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      // Save row data to session storage for faster and accurate load
      sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(row));
      // Redirect to detail page
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&id=' + encodeURIComponent(row[MODULE_CONFIG.PrimaryKey]) + '&action=edit';
    } else {
      _openModal(true, row, false);
    }
  }

  function _openViewForm(row) {
    if (!row || !row[MODULE_CONFIG.PrimaryKey]) {
      _openModal(true, row, true);
      return;
    }

    if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      // Save row data to session storage for faster and accurate load
      sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(row));
      // Redirect to detail page without &action=edit to trigger View mode
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&id=' + encodeURIComponent(row[MODULE_CONFIG.PrimaryKey]);
    } else {
      _openModal(true, row, true); // true for forceDetail (view mode)
    }
  }

  function _openBulkEditForm() {
    _openBulkGridEditForm(selectedRows, false);
  }

  function _openBulkGridEditForm(rows, isAdd) {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var alertBox = document.createElement('div');
    alertBox.className = 'alert alert-info py-2 mb-0 d-flex align-items-center gap-2';
    alertBox.style.fontSize = '13px';
    var isEdit = !isAdd;

    if (isAdd) {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">playlist_add</span>' +
        '<strong>Chế độ Thêm Hàng Loạt:</strong> Nhập dữ liệu để tạo mới nhiều dòng cùng lúc. Để trống dòng nếu không muốn thêm.';
    } else {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">grid_on</span>' +
        '<strong>Chế độ Sửa Từng Dòng:</strong> Chỉnh sửa dữ liệu trực tiếp trên bảng.';
    }
    body.appendChild(alertBox);

    var tableContainer = document.createElement('div');
    tableContainer.style.overflowX = 'auto';
    tableContainer.style.maxHeight = '65vh';

    var styleNode = document.createElement('style');
    styleNode.innerHTML = `
        .table-bulk-edit { margin-bottom: 0; border-collapse: separate; border-spacing: 0; }
        .table-bulk-edit thead th { position: sticky; top: 0; z-index: 2; background: var(--color-surface); border-bottom: 2px solid var(--color-border); }
        .table-bulk-edit tbody td { padding: 0 !important; vertical-align: middle; border-bottom: 1px solid var(--color-border); border-right: 1px solid var(--color-border); position: relative; }
        .table-bulk-edit tbody td:first-child { padding: 0 8px !important; }
        .table-bulk-edit tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .table-bulk-edit .form-group { margin-bottom: 0 !important; height: 100%; display: flex; align-items: center; width: 100%; }
        .table-bulk-edit input.ui-input, .table-bulk-edit .dropdown-wrapper, .table-bulk-edit .dropdown-wrapper input {
            border: none !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
            width: 100%; height: 100%; min-height: 40px; padding: 0 12px !important; outline: none !important;
        }
        .table-bulk-edit input.ui-input:focus { background: rgba(255,255,255,0.05) !important; }
        .table-bulk-edit .switch { justify-content: center; padding: 0; margin: 0; width: 100%; height: 100%; display: flex; align-items: center; min-height: 40px; }
        .table-bulk-edit .dropdown-wrapper .material-symbols-outlined { right: 8px; }
        
        /* Custom Scrollbar cho bảng */
        .table-bulk-edit-container::-webkit-scrollbar { width: 8px; height: 8px; }
        .table-bulk-edit-container::-webkit-scrollbar-track { background: transparent; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .table-bulk-edit-container::-webkit-scrollbar-corner { background: transparent; }
    `;
    tableContainer.appendChild(styleNode);
    tableContainer.classList.add('table-bulk-edit-container');

    var table = document.createElement('table');
    table.className = 'table table-bordered table-hover table-bulk-edit';
    table.style.width = 'max-content';
    table.style.minWidth = '100%';

    var formSchema = globalFormSchema;
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    var editableFields = [];
    var thead = document.createElement('thead');
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '1';
    thead.style.background = 'var(--color-surface)';
    var trHead = document.createElement('tr');

    var thStt = document.createElement('th');
    thStt.innerText = '#';
    thStt.style.width = '50px';
    thStt.style.textAlign = 'center';
    trHead.appendChild(thStt);

    formSchema.forEach(function (field) {
      if (String(field.showInEdit) === '1' || field.showInEdit === true) {
        editableFields.push(field);
        var th = document.createElement('th');
        th.innerText = field.label || field.name;
        if (field.required) {
          var req = document.createElement('span');
          req.innerText = ' *';
          req.style.color = 'var(--color-danger)';
          th.appendChild(req);
        }
        th.style.whiteSpace = 'nowrap';
        th.style.padding = '10px';
        trHead.appendChild(th);
      }
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var currentRowCount = rows.length;

    function appendRow(row, rowIdx) {
      var tr = document.createElement('tr');

      var tdStt = document.createElement('td');
      tdStt.innerText = rowIdx + 1;
      tdStt.style.textAlign = 'center';
      tdStt.style.verticalAlign = 'middle';
      tr.appendChild(tdStt);

      // Hidden PK
      var hiddenPK = document.createElement('input');
      hiddenPK.type = 'hidden';
      hiddenPK.name = MODULE_CONFIG.PrimaryKey + '_' + rowIdx;
      hiddenPK.value = row[MODULE_CONFIG.PrimaryKey] || '';
      hiddenPK.setAttribute('data-row-index', rowIdx);
      hiddenPK.setAttribute('data-field-name', MODULE_CONFIG.PrimaryKey);
      tr.appendChild(hiddenPK);

      // Hidden OrderNo
      var hiddenOrder = document.createElement('input');
      hiddenOrder.type = 'hidden';
      hiddenOrder.name = 'OrderNo_' + rowIdx;
      hiddenOrder.value = row.OrderNo || 0;
      hiddenOrder.setAttribute('data-row-index', rowIdx);
      hiddenOrder.setAttribute('data-field-name', 'OrderNo');
      tr.appendChild(hiddenOrder);

      editableFields.forEach(function (fieldTemplate) {
        var td = document.createElement('td');
        td.style.verticalAlign = 'middle';
        td.style.minWidth = '200px';
        td.style.padding = '0'; // Đã CSS trong class

        var field = Object.assign({}, fieldTemplate);
        field.value = row[field.name] !== undefined && row[field.name] !== null ? row[field.name] : '';
        var originalName = field.name;
        field.name = originalName + '_' + rowIdx;

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
          inputEl = document.createElement('div');
          inputEl.className = 'form-group';
          inputEl.style.marginBottom = '0';

          var hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.value || '';
          hiddenInput.setAttribute('data-row-index', rowIdx);
          hiddenInput.setAttribute('data-field-name', originalName);
          inputEl.appendChild(hiddenInput);

          var comboLoading = UIControls.createDataComboBox({ placeholder: 'Đang tải...', disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) });
          inputEl.appendChild(comboLoading);

          if (field.dataSource) {
            if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
              var staticStr = field.dataSource.substring(7);
              var staticData = staticStr.split(',').map(function (s) {
                var parts = s.split('|');
                return [parts[0], parts[1] || parts[0]];
              });
              var newCombo = UIControls.createDataComboBox({
                placeholder: '-- Chọn --',
                headers: ['ID', 'Tên'],
                data: staticData,
                colFilterIndex: 1,
                onSelect: function (r) { hiddenInput.value = r[0]; }
              });
              var newDisplayInput = newCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return r[0] == field.value; });
              if (matched && newDisplayInput) newDisplayInput.value = matched[1];
              inputEl.replaceChild(newCombo, comboLoading);
            } else {
              var optionRequest;
              if (field.dataSourceMethod === 'GET') {
                optionRequest = ApiClient.get(field.dataSource);
              } else if (field.dataSource.indexOf('/') > -1 || field.dataSource.indexOf('http') === 0) {
                optionRequest = ApiClient.post(field.dataSource, { UserName: _currentUser() });
              } else {
                optionRequest = ApiClient.post(MODULE_CONFIG.ApiSearch, {
                  List: field.dataSource,
                  FormName: field.dataSource,
                  Func: 'View',
                  Limit: 1000,
                  UserName: _currentUser()
                });
              }
              optionRequest.then(function (res) {
                var dataList = res.list || res.records || [];
                var optionTable = _buildOptionTable(dataList, field, 0);
                var newCombo = UIControls.createDataComboBox({
                  placeholder: '-- Chọn --', headers: optionTable.headers, data: optionTable.data, colFilterIndex: optionTable.colFilterIndex,
                  showAddNew: field.allowCustomValue !== false && !(typeof MODULE_CONFIG !== 'undefined' && MODULE_CONFIG.HideAddNewInDropdowns),
                  readonlyInput: field.allowCustomValue === false,
                  onF2: function () {
                    newCombo.querySelector('.ui-input').focus();
                  },
                  onSelect: function (r) { hiddenInput.value = r[0]; },
                  onChange: function (val) {
                    hiddenInput.value = field.allowCustomValue === false ? '' : val;
                  }
                });
                var newDisplayInput = newCombo.querySelector('input.ui-input');
                var matched = optionTable.data.find(function (r) { return r[0] == field.value; });
                if (matched && newDisplayInput) newDisplayInput.value = matched[optionTable.colFilterIndex];
                inputEl.replaceChild(newCombo, comboLoading);
              }).catch(function (err) {
                var displayInput = comboLoading.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }
          } else {
            var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
            inputEl.replaceChild(comboEmpty, comboLoading);
          }
        } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
          inputEl = UIInput.createNumber(field);
        } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
          var wrapper = document.createElement('div');
          wrapper.className = 'form-group';
          var flexDiv = document.createElement('div');
          flexDiv.style.display = 'flex';
          flexDiv.style.gap = '8px';

          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'ui-input';
          input.name = field.name;
          input.value = field.value || '';
          input.placeholder = 'Click nút Thiết lập...';
          input.readOnly = true;
          input.style.flex = '1';

          var btnWrapper = document.createElement('div');
          btnWrapper.innerHTML = UIButton.createHTML({ text: '', type: 'secondary', icon: 'settings', className: 'btn-icon-only' });
          var btn = btnWrapper.firstElementChild;
          btn.style.height = '100%';
          btn.onclick = function (e) {
            e.preventDefault();
            if (typeof RuleBuilderDialog !== 'undefined') {
              var formNameVal = row.FormName || row.formName || row.FORMNAME || '';
              RuleBuilderDialog.open({
                currentRule: input.value,
                targetFormName: formNameVal,
                onSave: function (newRule) {
                  input.value = newRule;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            } else {
              Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
            }
          };
          flexDiv.appendChild(input);
          flexDiv.appendChild(btn);
          wrapper.appendChild(flexDiv);
          inputEl = wrapper;
        } else {
          inputEl = UIInput.createText(field);
        }

        if (inputEl) {
          var lbl = inputEl.querySelector('label');
          if (lbl && !inputEl.classList.contains('switch')) {
            lbl.style.display = 'none';
          }
          if (inputEl.classList && inputEl.classList.contains('form-group')) {
            inputEl.style.marginBottom = '0';
          }
          var allInputs = inputEl.querySelectorAll('input, select, textarea');
          allInputs.forEach(function (i) {
            i.setAttribute('data-row-index', rowIdx);
            i.setAttribute('data-field-name', originalName);
            if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) i.disabled = true;
          });
          if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) inputEl.classList.add('ui-input-disabled');
          td.appendChild(inputEl);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    rows.forEach(function (row, rowIdx) {
      appendRow(row, rowIdx);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    body.appendChild(tableContainer);

    if (isAdd) {
      var btnAddMore = document.createElement('button');
      btnAddMore.className = 'btn btn-outline-primary btn-sm';
      btnAddMore.style.alignSelf = 'flex-start';
      btnAddMore.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; vertical-align:bottom;">add</span> Thêm 1 dòng nữa';
      btnAddMore.onclick = function () {
        appendRow({}, currentRowCount);
        currentRowCount++;
        // scroll to bottom
        setTimeout(function () { tableContainer.scrollTop = tableContainer.scrollHeight; }, 50);
      };
      body.appendChild(btnAddMore);
    }

    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = MODULE_CONFIG.BtnSaveAll;

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);

    var modal = UIModal.show({
      title: isAdd ? 'Thêm hàng loạt (' + rows.length + ' dòng)' : 'Sửa hàng loạt (' + rows.length + ' dòng)',
      width: '90%',
      content: body,
      footer: footer
    });

    btnCancel.onclick = function () { modal.close(); };
    btnSave.onclick = function () { _saveGridData(rows, modal, body, btnSave, isAdd); };
  }

  function _openModal(isEdit, row, isViewMode) {
    if (isEdit && !row) return;
    if (!row) row = {};

    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var currentModalFormState = {}; // Trạng thái form để truyền cho các Combobox gọi API

    var masterWrapper = document.createElement('div');
    masterWrapper.className = 'df-master-wrapper';
    masterWrapper.style.display = 'flex';
    masterWrapper.style.gap = '16px';
    masterWrapper.style.alignItems = 'flex-start';
    body.appendChild(masterWrapper);

    var grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.flexWrap = 'wrap';
    grid.style.gap = '12px 10px'; // Dòng cách dòng 12px, ô cách ô 10px
    grid.style.flex = '1';
    masterWrapper.appendChild(grid);

    var isGrouped = MODULE_CONFIG.IsFullPageDetail && MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0;
    var groupContainers = {};
    var ungroupedGrid = grid;

    if (isGrouped) {
      grid.style.flexDirection = 'column';
      grid.style.flexWrap = 'nowrap';
      grid.style.gap = '20px';

      MODULE_CONFIG.WizardSteps.forEach(function (step) {
        if (!step.fields || step.fields.length === 0) return;

        var groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.style.cssText = 'border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; background: var(--color-surface, #fff); box-shadow: 0 1px 3px rgba(0,0,0,0.05);';

        var groupTitle = document.createElement('h6');
        groupTitle.innerHTML = (step.icon ? '<span class="material-symbols-outlined" style="vertical-align:bottom; margin-right:6px; font-size:18px;">' + step.icon + '</span>' : '') + step.label;
        groupTitle.style.cssText = 'margin-top: 0; margin-bottom: 16px; color: var(--color-primary); font-weight: 600; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;';
        groupCard.appendChild(groupTitle);

        var groupGrid = document.createElement('div');
        groupGrid.style.display = 'flex';
        groupGrid.style.flexWrap = 'wrap';
        groupGrid.style.gap = '12px 10px';
        groupCard.appendChild(groupGrid);

        grid.appendChild(groupCard);

        step.fields.forEach(function (fName) {
          groupContainers[fName.toLowerCase()] = groupGrid;
        });
      });

      // Container for fields not explicitly defined in steps
      var ungroupedCard = document.createElement('div');
      ungroupedCard.className = 'group-card-other';
      ungroupedCard.style.cssText = 'border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; background: var(--color-surface, #fff); box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
      ungroupedCard.style.display = 'none'; // hidden by default until something is added

      ungroupedGrid = document.createElement('div');
      ungroupedGrid.style.display = 'flex';
      ungroupedGrid.style.flexWrap = 'wrap';
      ungroupedGrid.style.gap = '12px 10px';
      ungroupedCard.appendChild(ungroupedGrid);

      grid.appendChild(ungroupedCard);
    }

    var isPersonForm = !!MODULE_CONFIG.isPersonForm;
    var isCandidateForm = !!MODULE_CONFIG.isCandidateForm;
    if (isPersonForm || isCandidateForm) {
      console.log('[PHOTO DEBUG] Edit Modal - row:', row);
      var photoBox = document.createElement('div');
      photoBox.className = 'photo-box-wrapper';
      photoBox.style.width = '160px';
      photoBox.style.flexShrink = '0';
      photoBox.style.display = 'flex';
      photoBox.style.flexDirection = 'column';
      photoBox.style.alignItems = 'center';
      photoBox.style.marginTop = '16px';

      var imgFrame = document.createElement('div');
      imgFrame.style.width = '120px';
      imgFrame.style.height = '120px';
      imgFrame.style.borderRadius = '50%';
      imgFrame.style.border = '3px solid var(--color-primary)';
      imgFrame.style.overflow = 'hidden';
      imgFrame.style.display = 'flex';
      imgFrame.style.alignItems = 'center';
      imgFrame.style.justifyContent = 'center';
      imgFrame.style.background = '#f1f5f9';
      imgFrame.style.position = 'relative';
      imgFrame.style.cursor = 'pointer';
      imgFrame.title = 'Bấm để thay đổi ảnh đại diện';
      imgFrame.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

      var img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';

      var rawContent = '';
      var fileNameVal = '';
      if (row) {
        for (var key in row) {
          var keyLower = key.toLowerCase();
          if (keyLower === 'content') {
            rawContent = row[key];
          } else if (keyLower === 'filename') {
            fileNameVal = row[key];
          }
        }
      }

      var imgIdVal = row ? (isPersonForm ? (row.PersonID || '') : (row.CandidateID || '')) : '';
      var isLoadingHex = false;

      if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
        var mimeType = 'image/jpeg';
        if (fileNameVal) {
          var ext = fileNameVal.split('.').pop().toLowerCase();
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }
        try {
          if (/^0x/i.test(rawContent)) {
            // Chuỗi hex dạng 0xFFD8FF...
            var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
            var bytes = new Uint8Array(hexStr.length / 2);
            for (var bi = 0; bi < bytes.length; bi++) {
              bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
            }
            var blob = new Blob([bytes], { type: mimeType });
            img.src = URL.createObjectURL(blob);
          } else {
            // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
            img.src = 'data:' + mimeType + ';base64,' + rawContent;
          }
          isLoadingHex = true;
        } catch (err) {
          console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
        }
      }

      var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

      if (!isLoadingHex) {
        if (imgIdVal) {
          var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
          img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg?t=' + new Date().getTime();
        } else {
          img.src = defaultPhoto;
        }
      }
      img.onerror = function () {
        if (isLoadingBase64) {
          isLoadingBase64 = false;
          if (imgIdVal) {
            var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
            img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg?t=' + new Date().getTime();
            return;
          }
        }

        // Dynamic API fetch fallback
        if (imgIdVal) {
          var self = this;
          var attachApi = (MODULE_CONFIG && MODULE_CONFIG.isCandidateForm && MODULE_CONFIG.useCandidateAttachmentApi)
            ? 'API_CandidateAttach' : 'API_PersonAttach';

          var fetchPayload = {
            List: attachApi,
            Func: 'View',
            JsonData: JSON.stringify({
              CandidateID: imgIdVal,
              PersonID: imgIdVal
            }),
            UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown'
          };

          ApiClient.post('/api/API_Gateway_Router', fetchPayload)
            .then(function (data) {
              if (data && data.code === 0 && data.records && data.records.length > 0) {
                var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                if (b64 && b64.length > 10) {
                  if (b64.startsWith('data:image')) {
                    self.src = b64;
                  } else {
                    var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                    self.src = 'data:' + mimeType + ';base64,' + b64;
                  }
                } else {
                  if (self.src !== defaultPhoto) self.src = defaultPhoto;
                }
              } else {
                if (self.src !== defaultPhoto) self.src = defaultPhoto;
              }
            })
            .catch(function (err) {
              if (self.src !== defaultPhoto) self.src = defaultPhoto;
            });
        } else {
          if (img.src !== defaultPhoto) img.src = defaultPhoto;
        }
      };

      imgFrame.appendChild(img);

      if (!isViewMode) {
        var overlay = document.createElement('div');
        overlay.innerHTML = '<span class="material-symbols-outlined" style="color:white; font-size: 20px;">photo_camera</span>';
        overlay.style.position = 'absolute';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.height = '36px';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'flex-start';
        overlay.style.paddingTop = '4px';
        imgFrame.appendChild(overlay);

        imgFrame.onclick = function () {
          var fileInp = document.createElement('input');
          fileInp.type = 'file';
          fileInp.accept = 'image/*';
          fileInp.onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
              var imgObj = new Image();
              imgObj.onload = function () {
                var MAX_WIDTH = 600;
                var MAX_HEIGHT = 600;
                var width = imgObj.width;
                var height = imgObj.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height = Math.round(height * MAX_WIDTH / width);
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width = Math.round(width * MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                  }
                }
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(imgObj, 0, 0, width, height);

                var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                var base64Content = dataUrl.split(',')[1];

                var binStr = atob(base64Content);
                var hexArray = [];
                for (var i = 0; i < binStr.length; i++) {
                  var hexVal = binStr.charCodeAt(i).toString(16);
                  if (hexVal.length < 2) hexVal = '0' + hexVal;
                  hexArray.push(hexVal);
                }
                var hexStr = '0x' + hexArray.join('');

                img.src = dataUrl;
                if (row) {
                  row.PhotoBase64 = dataUrl;
                }

                window._pendingWizardAvatar = {
                  file: file,
                  hexStr: hexStr,
                  base64Content: base64Content,
                  dataUrl: dataUrl
                };
              };
              imgObj.src = URL.createObjectURL(file);
            }
          };
          fileInp.click();
        };
      } // End if (!isViewMode)

      photoBox.appendChild(imgFrame);

      var targetCard = isGrouped && grid.firstChild ? grid.firstChild : null;
      if (targetCard) {
        var cardBody = targetCard.children[1]; // groupGrid
        if (cardBody) {
          var flexWrapper = document.createElement('div');
          flexWrapper.className = 'df-avatar-group-wrapper';
          flexWrapper.style.display = 'flex';
          flexWrapper.style.gap = '20px';
          flexWrapper.style.alignItems = 'flex-start';

          targetCard.insertBefore(flexWrapper, cardBody);
          photoBox.style.marginTop = '0'; // Xóa margin cũ

          flexWrapper.appendChild(photoBox);
          flexWrapper.appendChild(cardBody);
          cardBody.style.flex = '1';
        } else {
          masterWrapper.insertBefore(photoBox, grid);
        }
      } else {
        masterWrapper.insertBefore(photoBox, grid);
      }
    }

    // KHAI BÁO CẤU TRÚC FORM (SCHEMA-DRIVEN UI LẤY TỪ DB)
    var formSchema = globalFormSchema;

    // Sắp xếp lại theo OrderNo (Nếu có)
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    // ENGINE VẼ FORM TỰ ĐỘNG
    // -- TỰ ĐỘNG GỘP NHÓM CÁC TRƯỜNG CÓ LIÊN QUAN (Kinh nghiệm UI/UX Nhân sự) --
    var parentFields = {};
    var childToParent = {};
    var parentWrappers = {};

    formSchema.forEach(function (f) {
      var rule = (f.renderRule || f.formatId || f.FormatID || '').toLowerCase();
      if (rule === 'sw' || rule === 'boolean') {
        var children = formSchema.filter(function (cf) {
          return cf.name !== f.name && cf.name.indexOf(f.name) > -1;
        });
        if (children.length > 0) {
          parentFields[f.name] = children;
          children.forEach(function (c) { childToParent[c.name] = f.name; });
        }
      }
    });

    var normalAndParentFields = formSchema.filter(function (f) { return !childToParent[f.name]; });
    var childFields = formSchema.filter(function (f) { return childToParent[f.name]; });
    var orderedSchema = normalAndParentFields.concat(childFields);

    orderedSchema.forEach(function (field) {
      var isVisible = isEdit ? field.showInEdit : field.showInAdd;
      if (!(String(isVisible) === '1' || isVisible === true)) {
        // Vẽ input ẩn cho các Khóa chính (Ví dụ Makh) để Auto-Serializer thu thập được
        var hiddenEl = document.createElement('input');
        hiddenEl.type = 'hidden';
        hiddenEl.name = field.name;
        hiddenEl.value = row ? (row[field.name] || '') : '';
        body.appendChild(hiddenEl);
        return;
      }

      // Tự động gán giá trị cũ (nếu đang Sửa 1 dòng).
      field.value = (isEdit && row) ? (row[field.name] || '') : '';

      // Khởi tạo Ô nhập liệu tuỳ thuộc vào quy tắc renderRule
      var inputEl;
      if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
        inputEl = UIInput.createSwitch(field);
      } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
        inputEl = UIInput.createDate(field);
      } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
        inputEl = UIInput.createTime(field);
      } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
        var formGroupWrapper = document.createElement('div');
        formGroupWrapper.className = 'form-group';

        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          if (field.required) {
            var req = document.createElement('span');
            req.innerText = ' *';
            req.style.color = 'var(--color-danger)';
            lbl.appendChild(req);
          }
          formGroupWrapper.appendChild(lbl);
        }

        // Hidden input lưu giá trị thực (ID) để hàm Auto Serialize nhặt được
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = field.name;
        hiddenInput.value = field.value || '';
        formGroupWrapper.appendChild(hiddenInput);

        if (field.dataSource) {
          if (field.name === 'BranchID') {
            var userBranches = _getUserBranches() || [];
            if (userBranches.length > 0) {
              field.dataSource = 'STATIC:' + userBranches.map(function (b) {
                return b.id + '|' + (b.name || b.id);
              }).join(',');
            }
          }
          if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
            var staticStr = field.dataSource.substring(7);
            var staticData = staticStr.split(',').map(function (s) {
              var parts = s.split('|');
              return [parts[0], parts[1] || parts[0], parts[2] || ''];
            });

            var lazyStaticCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              onSearch: function (q, page) {
                return new Promise(function (resolve) {
                  var filtered = staticData;
                  if (field.dependsOn) {
                    var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                    filtered = staticData.filter(function (r) {
                      if (!r[2]) return true; // Ko cấu hình parent => luôn hiện
                      var parentValueNow = currentModalFormState[parents[0]] || '';
                      return String(r[2]) === String(parentValueNow);
                    });
                  }
                  if (q) {
                    filtered = filtered.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; });
                  }
                  resolve({ headers: ['Mã', 'Tên'], data: filtered, colFilterIndex: 1 });
                });
              },
              onSelect: function (row) {
                hiddenInput.value = row[0]; // Cập nhật ID
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            var displayInput = lazyStaticCombo.querySelector('input.ui-input');
            var matched = staticData.find(function (r) { return r[0] == field.value; });
            if (matched && displayInput) displayInput.value = matched[1];

            hiddenInput.fetchDataForValue = function () {
              var displayInp = lazyStaticCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
              if (matched && displayInp) displayInp.value = matched[1];
              else if (displayInp) displayInp.value = hiddenInput.value || '';
            };

            formGroupWrapper.appendChild(lazyStaticCombo);
            inputEl = formGroupWrapper;
          } else {
            // Hiển thị tạm lúc đang tải
            var comboLoading = UIControls.createDataComboBox({
              placeholder: 'Đang tải...',
              headers: ['Mã', 'Tên'],
              data: [],
              colFilterIndex: 1
            });
            formGroupWrapper.appendChild(comboLoading);
            inputEl = formGroupWrapper;

            var endpointRaw = field.dataSource;
            var maxCols = 4; // Mặc định hiển thị 4 cột
            if (endpointRaw.indexOf('|') > -1) {
              var dsParts = endpointRaw.split('|');
              endpointRaw = dsParts[0];
              var parsedCols = parseInt(dsParts[1], 10);
              if (!isNaN(parsedCols) && parsedCols > 0) maxCols = parsedCols;
            }
            var finalUrl;
            var fetchPayload = {};
            if (endpointRaw.indexOf('/') === -1 && !endpointRaw.startsWith('http')) {
              // Nếu dataSource chỉ là tên danh mục (không chứa slash), tự động dùng Gateway Router
              finalUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router';
              fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View' };
            } else {
              var endpoint = endpointRaw.startsWith('http') ? endpointRaw : ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + endpointRaw);
              finalUrl = endpoint;
              if (endpoint.indexOf('?') > -1) {
                var parts = endpoint.split('?');
                finalUrl = parts[0];
                var searchParams = new URLSearchParams(parts[1]);
                searchParams.forEach(function (value, key) { fetchPayload[key] = value; });
              }
            }
            if (!fetchPayload.UserName) fetchPayload.UserName = _currentUser();

            var searchApiCall = function (q, page) {
              var payload = Object.assign({}, fetchPayload);
              var isGateway = finalUrl.indexOf('API_Gateway_Router') > -1;
              var dynamicFilters = {};

              if (typeof currentModalFormState !== 'undefined') {
                var activeFilters = {};
                if (field.dependsOn) {
                  var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                  parents.forEach(function (p) {
                    if (currentModalFormState[p] !== undefined && currentModalFormState[p] !== null) {
                      activeFilters[p] = currentModalFormState[p];
                    }
                  });
                }
                if (isGateway) {
                  dynamicFilters = Object.assign({}, activeFilters);
                } else {
                  payload = Object.assign(payload, activeFilters);
                }
              }

              if (q) {
                payload.Keyword = q;
                if (isGateway) dynamicFilters.Keyword = q; // Nhét thêm Keyword vào JsonData dự phòng cho Gateway dễ truy vấn
              }

              if (isGateway && Object.keys(dynamicFilters).length > 0) {
                var existingJson = {};
                try { existingJson = JSON.parse(payload.JsonData || '{}'); } catch (e) { }
                payload.JsonData = JSON.stringify(Object.assign({}, existingJson, dynamicFilters));
              }

              var request = field.dataSourceMethod === 'GET'
                ? ApiClient.get(finalUrl)
                : ApiClient.post(finalUrl, payload);

              return request.then(function (res) {
                var dataList = res.list || res.records;
                var optionTable = _buildOptionTable(dataList || [], field, maxCols);
                comboLoading.dataset.lastKeys = JSON.stringify(optionTable.keys);
                optionTable.forceMultiColumn = optionTable.keys.length > 1;
                return optionTable;
              });
            };

            var lazyCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              showAddNew: field.allowCustomValue !== false && !(typeof MODULE_CONFIG !== 'undefined' && MODULE_CONFIG.HideAddNewInDropdowns),
              readonlyInput: field.allowCustomValue === false,
              onF2: function () {
                lazyCombo.querySelector('.ui-input').focus();
              },
              onSearch: searchApiCall,
              onChange: function (val) {
                hiddenInput.value = field.allowCustomValue === false ? '' : val;
              },
              onSelect: function (row) {
                hiddenInput.value = row[0];

                // === AUTO FILL LOGIC ===
                // Lấy lại danh sách keys đã lưu
                var savedKeysStr = comboLoading.dataset.lastKeys;
                if (savedKeysStr) {
                  var keys = JSON.parse(savedKeysStr);
                  // Duyệt qua các cột trả về từ API
                  keys.forEach(function (keyName, index) {
                    // Tìm xem trong Form hiện tại có Input nào tên trùng với tên Cột không (case-insensitive)
                    var form = hiddenInput.closest('.ui-modal') || hiddenInput.closest('body');
                    if (form) {
                      var targetInput = form.querySelector('[name="' + keyName + '" i]');
                      if (targetInput && targetInput !== hiddenInput) {
                        // CHẶN AUTO FILL CHO KHÓA CHÍNH (HOẶC MÃ NHÂN VIÊN) KHI ĐANG Ở CHẾ ĐỘ SỬA (EDIT)
                        if (isEdit && (
                          keyName.toUpperCase() === (MODULE_CONFIG.PrimaryKey || '').toUpperCase() ||
                          keyName.toUpperCase() === 'PERSONID' ||
                          keyName.toUpperCase() === 'NEWPERSONID'
                        )) {
                          return; // Bỏ qua không tự động ghi đè mã
                        }

                        // Điền giá trị
                        targetInput.value = row[index] || '';
                        // Kích hoạt sự kiện để UI update (nếu là ô chọn ngày, số lượng...)
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                        // Nếu trường được Auto-Fill là một Combobox khác, ta cần gọi nó tải lại text hiển thị!
                        if (typeof targetInput.fetchDataForValue === 'function') {
                          targetInput.fetchDataForValue();
                        }
                      }
                    }
                  });
                }
                // =======================

                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            if (field.value) {
              searchApiCall('', 1).then(function (res) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
                if (matched && displayInput) displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                else if (displayInput) displayInput.value = field.value; // Fallback
              }).catch(function (err) {
                console.error('[DynamicFormEngine] DataComboBox initial fetch error:', err);
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }

            // Expose hàm để Auto-Fill gọi lại nhằm cập nhật Text
            hiddenInput.fetchDataForValue = function () {
              if (hiddenInput.value) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = 'Đang tải...';
                searchApiCall('', 1).then(function (res) {
                  var displayInp = lazyCombo.querySelector('input.ui-input');
                  var matched = res.data.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
                  if (matched && displayInp) displayInp.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                  else if (displayInp) displayInp.value = hiddenInput.value; // Fallback
                });
              } else {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = '';
              }
            };

            formGroupWrapper.replaceChild(lazyCombo, comboLoading);
          }
        } else {
          var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
          formGroupWrapper.appendChild(comboEmpty);
          inputEl = formGroupWrapper;
        }
      } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
        inputEl = UIInput.createNumber(field);
      } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
        var wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          wrapper.appendChild(lbl);
        }
        var flexDiv = document.createElement('div');
        flexDiv.style.display = 'flex';
        flexDiv.style.gap = '8px';

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ui-input';
        input.name = field.name;
        input.value = field.value || '';
        input.placeholder = 'Click [Thiết lập] để chọn điều kiện';
        input.readOnly = true;
        input.style.flex = '1';

        var btnWrapper = document.createElement('div');
        btnWrapper.innerHTML = UIButton.createHTML({ text: 'Thiết lập', type: 'secondary', icon: 'settings' });
        var btn = btnWrapper.firstElementChild;
        btn.onclick = function (e) {
          e.preventDefault();
          if (typeof RuleBuilderDialog !== 'undefined') {
            var formNameVal = row ? (row.FormName || row.formName || row.FORMNAME) : '';
            if (!formNameVal && typeof currentModalFormState !== 'undefined') formNameVal = currentModalFormState['FormName'] || '';
            if (!formNameVal) {
              var fnInput = document.querySelector('input[name="FormName"], select[name="FormName"]');
              if (fnInput) formNameVal = fnInput.value;
            }

            RuleBuilderDialog.open({
              currentRule: input.value,
              targetFormName: formNameVal,
              onSave: function (newRule) {
                input.value = newRule;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          } else {
            Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
          }
        };

        flexDiv.appendChild(input);
        flexDiv.appendChild(btn);
        wrapper.appendChild(flexDiv);
        inputEl = wrapper;
      } else if (field.renderRule === 'html') {
        var htmlWrapper = document.createElement('div');
        htmlWrapper.style.width = '100%';
        htmlWrapper.innerHTML = field.html || '';
        inputEl = htmlWrapper;
      } else {
        inputEl = UIInput.createText(field);
      }

      // Áp dụng kích thước FlexBox từ field.position
      if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) {
        var innerFields = inputEl.querySelectorAll('input, select, textarea, button');
        if (innerFields.length > 0) {
          innerFields.forEach(function (el) { el.disabled = true; });
        } else if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(inputEl.tagName)) {
          inputEl.disabled = true;
        }
        inputEl.classList.add('ui-input-disabled');
      }
      var span = String(field.position || 'body');
      if (span.indexOf('|') > -1) {
        span = span.split('|')[1] || '12';
      }
      if (MODULE_CONFIG.IsFullPageDetail && (span === 'grid' || span === '6')) {
        span = '3';
      } else if (span === 'grid') {
        span = '6';
      }
      if (span === 'body') span = '12';
      if (!['12', '8', '6', '4', '3', '2', '1-7'].includes(span)) span = '12';

      var targetGrid = grid;
      if (isGrouped) {
        targetGrid = groupContainers[field.name.toLowerCase()];
        if (!targetGrid) {
          targetGrid = ungroupedGrid;
          targetGrid.parentElement.style.display = 'block'; // show the "other" card if needed
        }
      }

      if (childToParent[field.name]) {
        var parentName = childToParent[field.name];
        var parentFlexGroup = parentWrappers[parentName];
        if (parentFlexGroup) {
          var childWrapper = document.createElement('div');
          childWrapper.className = 'child-field-wrapper';
          childWrapper.style.flex = '1';
          childWrapper.style.minWidth = '0'; // Bù chiều ngang cho các Combobox
          childWrapper.style.transition = 'all 0.25s cubic-bezier(0.16,1,0.3,1)';

          // Ẩn label để form gọn gàng, đưa label vào placeholder (Không hardcode, hỗ trợ kế thừa)
          var labels = inputEl.querySelectorAll('label');
          labels.forEach(function (l) { l.style.display = 'none'; });

          var fGroups = inputEl.querySelectorAll('.form-group');
          fGroups.forEach(function (fg) { fg.style.marginBottom = '0'; });
          if (inputEl.classList && inputEl.classList.contains('form-group')) {
            inputEl.style.marginBottom = '0';
          }

          var isSelect = field.renderRule === 'sl' || field.renderRule === 'select' || field.dataSource;
          var prefix = isSelect ? 'Chọn ' : 'Nhập ';
          var inps = inputEl.querySelectorAll('input:not([type="hidden"]), select, textarea');
          inps.forEach(function (inp) {
            if (inp.placeholder === '-- Vui lòng chọn --' || inp.placeholder === 'Nhập...' || !inp.placeholder) {
              // Xóa chữ "Vui lòng chọn" thay bằng "Chọn [Tên field]"
              var lblText = (field.label || '').trim().toLowerCase();
              if (lblText) {
                inp.placeholder = prefix + lblText;
              }
            }
          });

          childWrapper.appendChild(inputEl);
          parentFlexGroup.appendChild(childWrapper);
        }
      } else if (parentFields[field.name]) {
        var wrapper = document.createElement('div');
        wrapper.className = 'df-col-' + span;
        if (field.visibleRule) wrapper.dataset.visibleRule = field.visibleRule;

        var flexGroup = document.createElement('div');
        flexGroup.style.display = 'flex';
        flexGroup.style.flexWrap = 'nowrap';
        flexGroup.style.gap = '12px';
        flexGroup.style.alignItems = 'center';
        flexGroup.style.width = '100%';
        flexGroup.style.padding = '8px 12px';
        flexGroup.style.background = 'var(--color-surface, #fff)';
        flexGroup.style.border = '1px solid var(--color-border, #e2e8f0)';
        flexGroup.style.borderRadius = '8px';

        var parentInputWrapper = document.createElement('div');
        parentInputWrapper.style.flexShrink = '0';
        parentInputWrapper.style.minWidth = '90px';
        parentInputWrapper.appendChild(inputEl);
        flexGroup.appendChild(parentInputWrapper);

        parentWrappers[field.name] = flexGroup;
        wrapper.appendChild(flexGroup);
        targetGrid.appendChild(wrapper);

        setTimeout(function () {
          var parentCb = parentInputWrapper.querySelector('input[type="checkbox"]');
          if (parentCb) {
            var toggleChildren = function (isAutoChange) {
              var isChecked = parentCb.checked;
              var childEls = flexGroup.querySelectorAll('.child-field-wrapper');
              childEls.forEach(function (ce) {
                if (isChecked) {
                  ce.style.opacity = '1';
                  ce.style.pointerEvents = 'auto';
                } else {
                  ce.style.opacity = '0.4';
                  ce.style.pointerEvents = 'none';
                  if (isAutoChange === true && !isViewMode) {
                    var select = ce.querySelector('select');
                    if (select) { select.value = ''; select.dispatchEvent(new Event('change')); }
                    var input = ce.querySelector('input:not([type="hidden"])');
                    if (input) { input.value = ''; input.dispatchEvent(new Event('change')); }
                    var select2 = ce.querySelector('.select2-hidden-accessible');
                    if (select2 && window.$) { $(select2).val('').trigger('change'); }
                  }
                }
              });
            };
            parentCb.addEventListener('change', function () { toggleChildren(true); });
            toggleChildren(false);
          }
        }, 100);

      } else {
        var wrapper = document.createElement('div');
        wrapper.className = 'df-col-' + span;
        if (field.visibleRule) wrapper.dataset.visibleRule = field.visibleRule;
        wrapper.appendChild(inputEl);
        targetGrid.appendChild(wrapper);
      }

      // Gán giá trị mặc định vào currentModalFormState
      currentModalFormState[field.name] = field.value || '';
    });

    // Áp VisibleRule: show/hide fields theo cấu hình trong SY_FormatFields.VisibleRule
    if (typeof UIControls !== 'undefined' && UIControls.utils && UIControls.utils.applyVisibleRules) {
      UIControls.utils.applyVisibleRules(body);
    }

    // Xử lý Disable ban đầu cho các trường có DependsOn nếu BẤT KỲ trường cha nào đang trống
    globalFormSchema.forEach(function (f) {
      if (f.dependsOn) {
        var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
        var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
        if (hasEmptyParent) {
          var childInput = body.querySelector('input[name="' + f.name + '"]');
          if (childInput) {
            var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
            if (comboWrap) {
              var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
              allInps.forEach(function (el) { el.disabled = true; });
              comboWrap.classList.add('ui-input-disabled');
            }
          }
        }
      }
    });

    // Lắng nghe sự kiện thay đổi để xử lý Phụ thuộc (Dependencies)
    body.addEventListener('change', function (e) {
      var changedName = e.target.name;
      if (changedName) {
        currentModalFormState[changedName] = e.target.value;

        // 1. Tính toán giá trị tự động (FormulaRule)
        globalFormSchema.forEach(function (f) {
          if (f.formulaRule) {
            var formula = f.formulaRule;
            for (var key in currentModalFormState) {
              var v = parseFloat(currentModalFormState[key]) || 0;
              formula = formula.split('{' + key + '}').join(v);
            }
            try {
              var result = new Function('return ' + formula)();
              if (!isNaN(result) && isFinite(result)) {
                var targetInput = body.querySelector('input[name="' + f.name + '"]');
                if (targetInput && targetInput.value != result) {
                  targetInput.value = result;
                  currentModalFormState[f.name] = result;
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            } catch (e) { }
          }
        });

        // 2. Trigger API (Gọi API ngoài)
        var changedSchema = globalFormSchema.find(function (s) { return s.name === changedName; });
        if (changedSchema && changedSchema.triggerApi && e.target.value) {
          var apiEndpoint = changedSchema.triggerApi;
          var payload = Object.assign({}, currentModalFormState);
          ApiClient.post(apiEndpoint, payload).then(function (res) {
            var dataList = res.list || res.records || [];
            if (dataList && dataList.length > 0) {
              var row = dataList[0];
              Object.keys(row).forEach(function (keyName) {
                var targetInput = body.querySelector('[name="' + keyName + '" i]');
                if (targetInput && targetInput.name !== changedName) {
                  targetInput.value = row[keyName] || '';
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          }).catch(function () { });
        }

        // 3. Tìm các trường phụ thuộc vào trường vừa đổi (DependsOn)
        globalFormSchema.forEach(function (f) {
          if (f.dependsOn) {
            var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
            if (parents.includes(changedName)) {
              currentModalFormState[f.name] = ''; // Reset state
              var childInput = body.querySelector('input[name="' + f.name + '"]');
              if (childInput) {
                childInput.value = ''; // Xóa value ẩn
                // Xóa luôn giá trị hiển thị trên màn hình nếu là combobox
                var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
                if (comboWrap) {
                  var displayInp = comboWrap.querySelector('input.ui-input');
                  if (displayInp) displayInp.value = '';

                  // Khóa/Mở khóa ô con dựa trên việc CÓ BẤT KỲ ô cha nào đang trống hay không
                  var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
                  var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
                  allInps.forEach(function (el) { el.disabled = hasEmptyParent; });

                  if (hasEmptyParent) comboWrap.classList.add('ui-input-disabled');
                  else comboWrap.classList.remove('ui-input-disabled');
                }
                // Kích hoạt tiếp sự kiện change của thằng con để trigger chuỗi phụ thuộc (nếu có thằng cháu)
                childInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
        });
      }
    });

    // ── DETAIL TABS (Master-Detail panel) ──────────────────────────────────
    // Khi MODULE_CONFIG.DetailTabs được cấu hình, tự động vẽ thêm tab chi tiết bên dưới form master
    var hasEditableTab = MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.some(function (t) { return t.editable; });
    if (row && !MODULE_CONFIG.hideDetailTabsInEditMode && (!MODULE_CONFIG.HideDetailTabsInModal || MODULE_CONFIG.IsFullPageDetail) && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0 && (isEdit || hasEditableTab)) {
      var tabsContainer = document.createElement('div');
      tabsContainer.className = 'detail-tabs-container';
      tabsContainer.style.marginTop = '16px';
      tabsContainer.style.borderTop = '1px solid var(--color-border)';
      tabsContainer.style.paddingTop = '12px';

      // Tab nav bar
      var tabNav = document.createElement('div');
      tabNav.className = 'hide-scrollbar';
      tabNav.style.cssText = 'display: flex; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border); overflow-x: auto; -webkit-overflow-scrolling: touch;';

      // Tab content panels
      var tabPanels = [];
      body._detailPanels = [];

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        // Tab button
        var tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.textContent = tab.label;
        tabBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; font-family: inherit;';

        var isActive = (idx === 0);
        if (isActive) {
          tabBtn.style.backgroundColor = 'var(--color-primary)';
          tabBtn.style.color = '#ffffff';
          tabBtn.style.fontWeight = '600';
          tabBtn.style.boxShadow = 'var(--shadow-sm)';
        } else {
          tabBtn.style.backgroundColor = 'transparent';
          tabBtn.style.color = 'var(--color-text-secondary)';

          tabBtn.onmouseover = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'var(--color-surface)';
            this.style.color = 'var(--color-text)';
          };
          tabBtn.onmouseout = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'transparent';
            this.style.color = 'var(--color-text-secondary)';
          };
        }

        // Tab panel
        var panel = document.createElement('div');
        panel.style.display = idx === 0 ? 'block' : 'none';
        panel.style.minHeight = '120px';
        panel.style.overflowX = 'auto';
        panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';

        tabPanels.push({ btn: tabBtn, panel: panel });
        body._detailPanels.push(panel);

        tabBtn.onclick = function () {
          tabPanels.forEach(function (t, i) {
            var isNowActive = (i === idx);
            t.panel.style.display = isNowActive ? 'block' : 'none';
            if (isNowActive) {
              t.btn.style.backgroundColor = 'var(--color-primary)';
              t.btn.style.color = '#ffffff';
              t.btn.style.fontWeight = '600';
              t.btn.style.boxShadow = 'var(--shadow-sm)';
            } else {
              t.btn.style.backgroundColor = 'transparent';
              t.btn.style.color = 'var(--color-text-secondary)';
              t.btn.style.fontWeight = '500';
              t.btn.style.boxShadow = 'none';
            }
          });
        };

        tabNav.appendChild(tabBtn);
        tabPanels[tabPanels.length - 1]._loaded = false;
      });

      tabsContainer.appendChild(tabNav);

      // Render Editable Grid inside Tab Panel
      function _renderEditableGrid(tabDef, panel) {
        panel.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.style.cssText = 'overflow-x: auto; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; background: var(--color-surface);';

        var t = document.createElement('table');
        t.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto;';

        var thead = document.createElement('thead');
        var trH = document.createElement('tr');
        trH.style.cssText = 'background: var(--color-background); border-bottom: 2px solid var(--color-border);';

        var keys = tabDef.fields;

        // Headers
        keys.forEach(function (k) {
          var th = document.createElement('th');
          var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
          th.textContent = label;
          th.style.cssText = 'padding: 10px 12px; font-weight: 700; color: var(--color-text); background-color: var(--color-surface-elevated); text-align: left; white-space: nowrap;';
          trH.appendChild(th);
        });

        // Add action header (for Delete button)
        var thAction = document.createElement('th');
        thAction.style.cssText = 'padding: 10px 12px; width: 50px; text-align: center;';
        if (!isViewMode) {
          trH.appendChild(thAction);
        }
        thead.appendChild(trH);
        t.appendChild(thead);

        var tbody = document.createElement('tbody');

        panel._currentRows.forEach(function (currRow, rIdx) {
          var tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid var(--color-border); transition: background-color 0.2s;';
          tr.onmouseover = function () { this.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'; };
          tr.onmouseout = function () { this.style.backgroundColor = ''; };

          // Pass 1: Tạo tất cả các td và lưu vào cellMap để closure onSelect có thể tham chiếu trực tiếp
          var cellMap = {};
          keys.forEach(function (k) {
            var td = document.createElement('td');
            td.style.cssText = 'padding: 6px 12px; vertical-align: middle; position: relative;';
            td.setAttribute('data-field', k);
            cellMap[k] = td;
            tr.appendChild(td);
          });

          // Pass 2: Điền nội dung vào từng td
          keys.forEach(function (fName) {
            var td = cellMap[fName];

            var lConf = (tabDef.lookupConfig && tabDef.lookupConfig[fName]) || null;

            if (lConf) {
              // isBH: BaoHiem có cột STT ở đầu nên PersonID nằm ở colFilterIndex=1.
              // Các form khác (CaLamViec, ...) PersonID nằm ở colFilterIndex=0.
              // Dùng colFilterIndex để xác định thay vì hardcode fName === 'PersonID'
              var isBH = (fName === 'PersonID' && (lConf.colFilterIndex || 0) === 1);

              var combo = UIControls.createDataComboBox({
                placeholder: 'Chọn...',
                headers: lConf.headers || ['Mã', 'Tên'],
                colFilterIndex: lConf.colFilterIndex || 0,
                forceMultiColumn: lConf.forceMultiColumn !== false,
                onSearch: function (q) {
                  var lookupPayload = {
                    List: lConf.apiList,
                    Func: 'View',
                    Keyword: q
                  };
                  if (typeof lConf.getPayload === 'function') {
                    Object.assign(lookupPayload, lConf.getPayload());
                  }

                  return ApiClient.post('/api/API_Gateway_Router', lookupPayload).then(function (res) {
                    var list = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                    var dataList = list.map(function (d) {
                      return (typeof lConf.mapData === 'function') ? lConf.mapData(d, {}, true) : [d.PersonID || '', d.PersonName || '', d.PhongBan || '', d.TitleName || ''];
                    });
                    // For legacy WA_BaoHiemFrm that didn't define mapData:
                    if (fName === 'PersonID' && typeof lConf.mapData !== 'function') {
                      dataList = list.map(function (d) {
                        return [d.PersonID || '', d.PersonName || '', d.PhongBan || '', d.TitleName || ''];
                      });
                    }

                    return {
                      headers: lConf.headers || ['Mã', 'Tên'],
                      data: dataList,
                      colFilterIndex: lConf.colFilterIndex || 0
                    };
                  });
                },
                onSelect: function (selectedData) {
                  var selectedVal = selectedData[lConf.colFilterIndex || 0];

                  // Kiểm tra trùng lặp
                  var isDuplicate = panel._currentRows.some(function (row, index) {
                    return index !== rIdx && row[fName] === selectedVal;
                  });

                  if (isDuplicate) {
                    if (typeof Alert !== 'undefined') {
                      Alert.warning('Trùng lặp', 'Dữ liệu này đã được chọn trong danh sách!');
                    } else if (typeof UIToast !== 'undefined') {
                      UIToast.show('Dữ liệu này đã được chọn!', 'warning');
                    } else {
                      alert('Dữ liệu này đã được chọn!');
                    }
                    if (displayInp) displayInp.value = '';
                    currRow[fName] = '';

                    if (typeof lConf.mapData === 'function') {
                      // Reset based on generic mapData logic if needed, simple clear for now
                    } else if (fName === 'PersonID') {
                      currRow['PersonName'] = '';
                      currRow['PhongBan'] = '';
                      if (isBH) {
                        currRow['MucDong'] = '';
                        if (cellMap['MucDong']) {
                          var mInp = cellMap['MucDong'].querySelector('input');
                          if (mInp) mInp.value = '';
                        }
                      } else {
                        currRow['TitleName'] = '';
                      }
                      if (cellMap['PersonName']) cellMap['PersonName'].textContent = '';
                      if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = '';
                      if (cellMap['TitleName']) cellMap['TitleName'].textContent = '';
                    }
                    return;
                  }

                  // Cập nhật dữ liệu hàng
                  currRow[fName] = selectedVal;

                  if (typeof lConf.mapData === 'function') {
                    var gridRow = { _tr: tr };
                    lConf.mapData(selectedData, gridRow, false);
                    for (var key in gridRow) {
                      if (key !== '_tr') currRow[key] = gridRow[key];
                    }
                  } else if (fName === 'PersonID') {
                    if (isBH) {
                      currRow['PersonID'] = selectedData[1];
                      currRow['PersonName'] = selectedData[2];
                      currRow['PhongBan'] = selectedData[3];
                      currRow['MucDong'] = parseFloat(selectedData[4]) || 0;

                      if (cellMap['PersonName']) cellMap['PersonName'].textContent = selectedData[2] || '';
                      if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = selectedData[3] || '';
                      if (cellMap['MucDong']) {
                        var mInp = cellMap['MucDong'].querySelector('input');
                        if (mInp) {
                          mInp.value = selectedData[4] || '0';
                          mInp.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }
                    } else {
                      currRow['PersonID'] = selectedData[0];
                      currRow['PersonName'] = selectedData[1];
                      currRow['PhongBan'] = selectedData[2];
                      currRow['TitleName'] = selectedData[3];
                      if (cellMap['PersonName']) cellMap['PersonName'].textContent = selectedData[1] || '';
                      if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = selectedData[2] || '';
                      if (cellMap['TitleName']) cellMap['TitleName'].textContent = selectedData[3] || '';
                    }
                  }
                }
              });

              var displayInp = combo.querySelector('input.ui-input');
              if (displayInp) {
                displayInp.value = currRow[fName] || '';
                displayInp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
                if (isViewMode) displayInp.disabled = true;
              }
              combo.style.width = '160px';
              if (isViewMode) combo.style.pointerEvents = 'none';
              td.appendChild(combo);

            } else if (['PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon'].includes(fName)) {
              // Chỉ đọc — không cho chỉnh sửa, tự động điền khi chọn nhân viên
              td.textContent = currRow[fName] != null ? currRow[fName] : '';
              td.style.cssText += 'color: var(--color-text-secondary); font-style: italic;';

            } else {
              // Input text cho các trường còn lại
              var inp = document.createElement('input');
              inp.type = 'text';
              inp.value = currRow[fName] != null ? currRow[fName] : '';
              inp.placeholder = 'Nhập...';
              inp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
              if (isViewMode) inp.disabled = true;
              inp.addEventListener('input', function () {
                currRow[fName] = this.value;
              });

              // Hỗ trợ tính toán động nếu có cấu hình fieldEvents
              if (tabDef.fieldEvents && tabDef.fieldEvents[fName] && typeof tabDef.fieldEvents[fName].onChange === 'function') {
                inp.addEventListener('change', function () {
                  tabDef.fieldEvents[fName].onChange(this.value, currRow, row, tr);
                });
              }

              td.appendChild(inp);
            }
          });

          // Cột hành động (Xóa dòng)
          var tdAction = document.createElement('td');
          tdAction.style.cssText = 'padding: 6px 12px; text-align: center; vertical-align: middle;';

          var btnDel = document.createElement('button');
          btnDel.type = 'button';
          btnDel.className = 'btn btn-sm btn-tool text-danger';
          btnDel.style.cssText = 'padding: 4px; border: none; background: transparent; cursor: pointer; border-radius: 4px;';
          btnDel.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">delete</span>';
          btnDel.onclick = function () {
            if (typeof ConfirmModal !== 'undefined') {
              ConfirmModal.show({
                title: 'Xác nhận xóa',
                message: 'Bạn có chắc muốn xóa dòng này không?',
                onConfirm: function () {
                  var detailPK = 'UserAutoID';
                  if (currRow[detailPK]) {
                    panel._deletedRows.push(currRow);
                  }
                  panel._currentRows.splice(rIdx, 1);
                  _renderEditableGrid(tabDef, panel);
                }
              });
            } else {
              var detailPK = 'UserAutoID';
              if (currRow[detailPK]) {
                panel._deletedRows.push(currRow);
              }
              panel._currentRows.splice(rIdx, 1);
              _renderEditableGrid(tabDef, panel);
            }
          };

          tdAction.appendChild(btnDel);
          if (!isViewMode) {
            tr.appendChild(tdAction);
          }
          tbody.appendChild(tr);
        });

        t.appendChild(tbody);
        wrap.appendChild(t);
        panel.appendChild(wrap);

        // Add Row Button below the grid
        if (!isViewMode) {
          var btnAddRow = document.createElement('button');
          btnAddRow.type = 'button';
          btnAddRow.className = 'btn btn-sm btn-outline-primary';
          btnAddRow.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer;';
          btnAddRow.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">add</span> Thêm dòng mới';
          btnAddRow.onclick = function () {
            var newRow = {};
            newRow[tabDef.filterField] = row[MODULE_CONFIG.PrimaryKey] || '';
            panel._currentRows.push(newRow);
            _renderEditableGrid(tabDef, panel);
          };
          panel.appendChild(btnAddRow);

          if (tabDef.customButtons && tabDef.customButtons.length > 0) {
            tabDef.customButtons.forEach(function (btnDef) {
              var cBtn = document.createElement('button');
              cBtn.type = 'button';
              cBtn.className = 'btn btn-sm ' + (btnDef.className || 'btn-outline-secondary');
              cBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer; margin-left: 10px;';
              if (btnDef.icon) {
                cBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">' + btnDef.icon + '</span> ' + (btnDef.label || '');
              } else {
                cBtn.textContent = btnDef.label || '';
              }
              cBtn.onclick = function () {
                if (typeof btnDef.onClick === 'function') {
                  btnDef.onClick({
                    panel: panel,
                    tabDef: tabDef,
                    row: row,
                    MODULE_CONFIG: MODULE_CONFIG,
                    renderGrid: _renderEditableGrid
                  });
                }
              };
              panel.appendChild(cBtn);
            });
          }
        }
      }

      // Load data function for each tab
      function _loadTabData(tabDef, panel) {
        if (tabDef.type === 'attachments') {
          _renderAttachmentsTab(tabDef, panel, true, row);
          return;
        }
        if (tabDef.editable) {
          panel._tabDef = tabDef;
          panel._initialRows = [];
          panel._currentRows = [];
          panel._deletedRows = [];

          var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
          var pkVal = row[pkField] || '';

          if (pkVal) {
            var filterData = {};
            filterData[tabDef.filterField || pkField] = pkVal;
            var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';
            ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
              var data = res.list || res.records || [];
              panel._initialRows = JSON.parse(JSON.stringify(data));
              panel._currentRows = JSON.parse(JSON.stringify(data));
              _renderEditableGrid(tabDef, panel);
            }).catch(function () {
              panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu chi tiết</div>';
            });
          } else {
            _renderEditableGrid(tabDef, panel);
          }
          return;
        }

        if (!tabDef.api) {
          panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;">(Chưa cấu hình API)</div>';
          return;
        }
        var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
          var data = res.list || res.records || [];
          if (data.length === 0) {
            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Không có dữ liệu</div>';
            return;
          }
          // Build mini table
          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });
          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.maxHeight = '260px';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.width = '100%';
          t.style.borderCollapse = 'collapse';
          t.style.fontSize = '12px';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            th.textContent = label;
            th.style.cssText = 'padding:6px 8px;border-bottom:2px solid var(--color-border);background:var(--color-surface-elevated);position:sticky;top:0;text-align:left;white-space:nowrap;color:var(--color-text);font-weight:700;';
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--color-border)';
            keys.forEach(function (k) {
              var td = document.createElement('td');
              td.textContent = r[k] != null ? r[k] : '';
              td.style.cssText = 'padding:5px 8px;white-space:nowrap;';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          panel.innerHTML = '';
          panel.appendChild(wrap);
        }).catch(function () {
          panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu</div>';
        });
      }

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        var panel = tabPanels[idx].panel;
        tabsContainer.appendChild(panel);
        // Load first tab immediately, rest lazy
        if (idx === 0) {
          _loadTabData(tab, panel);
        } else {
          // Lazy load when tab is clicked
          tabPanels[idx].btn.addEventListener('click', function () {
            if (!tabPanels[idx]._loaded) {
              tabPanels[idx]._loaded = true;
              _loadTabData(tab, panel);
            }
          }, { once: true });
        }
      });

      body.appendChild(tabsContainer);
    }
    // ── END DETAIL TABS ──────────────────────────────────────────────────────

    // Footer buttons
    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = isViewMode ? 'Quay lại' : MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = isEdit ? MODULE_CONFIG.BtnSaveEdit : MODULE_CONFIG.BtnSaveAdd;

    var hasWritableFields = globalFormSchema.some(function (field) {
      var isVisible = isEdit ? (String(field.showInEdit) === '1' || field.showInEdit === true) : (String(field.showInAdd) === '1' || field.showInAdd === true);
      var isReadOnly = isViewMode || (isEdit ? field.isReadOnlyEdit : field.isReadOnlyAdd);
      return isVisible && !isReadOnly;
    });

    if (!hasWritableFields && !isViewMode) {
      btnSave.style.display = 'none';
      btnCancel.textContent = 'Đóng';
    }

    footer.appendChild(btnCancel);

    // Render custom footer buttons (khai báo trong MODULE_CONFIG.customFooterButtons)
    // Đây là extension point cho các form muốn thêm nút vào thanh thao tác mà không sửa Engine
    if (MODULE_CONFIG.customFooterButtons && MODULE_CONFIG.customFooterButtons.length > 0) {
      MODULE_CONFIG.customFooterButtons.forEach(function (btnDef) {
        var customBtn = document.createElement('button');
        customBtn.type = 'button';
        customBtn.className = 'btn ' + (btnDef.className || 'btn-outline-secondary');
        if (btnDef.icon) {
          customBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px; vertical-align: middle;">' + btnDef.icon + '</span> ' + (btnDef.label || '');
        } else {
          customBtn.textContent = btnDef.label || '';
        }
        if (typeof btnDef.onClick === 'function') {
          customBtn.onclick = function () {
            btnDef.onClick({ row: row, body: body, btnSave: btnSave, isEdit: isEdit });
          };
        }
        footer.appendChild(customBtn);
      });
    }

    if (isViewMode) {
      var btnSwitchEdit = document.createElement('button');
      btnSwitchEdit.className = 'btn btn-primary';
      btnSwitchEdit.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px; vertical-align: middle;">edit</span> Sửa';
      footer.appendChild(btnSwitchEdit);
    } else {
      footer.appendChild(btnSave);
    }

    if (MODULE_CONFIG.IsFullPageDetail) {
      $container.innerHTML = '';

      var pageWrap = document.createElement('div');
      pageWrap.className = 'full-page-detail';
      pageWrap.style.cssText = 'padding: 24px; background: var(--color-surface, #fff); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); min-height: calc(100vh - 100px);';

      var header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);';
      var defaultTitle = 'Thông tin chi tiết';
      var baseTitle = MODULE_CONFIG.TitleView || MODULE_CONFIG.FormTitle || defaultTitle;
      var titleAddFallback = 'Thêm mới ' + baseTitle.toLowerCase();
      var titleEditFallback = 'Cập nhật ' + baseTitle.toLowerCase();

      var pageTitle = isViewMode ? baseTitle : (isEdit ? (MODULE_CONFIG.TitleEdit || titleEditFallback) : (MODULE_CONFIG.TitleAdd || titleAddFallback));
      header.innerHTML = '<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">' + pageTitle + '</h2>';

      footer.style.padding = '0';
      footer.style.border = 'none';
      header.appendChild(footer);

      pageWrap.appendChild(header);
      pageWrap.appendChild(body);
      $container.appendChild(pageWrap);

      var globalActions = document.getElementById('global-page-actions');
      if (globalActions) globalActions.style.display = 'none';

      var dummyModal = {
        close: function () {
          if (globalActions) globalActions.style.display = '';
          MODULE_CONFIG.DetailRowData = null;
          $container.innerHTML = '';
          if (window.location.hash.indexOf('#/detail') === 0) {
            window.history.back();
          } else {
            _loadData();
          }
        },
        closeNow: function (savedRowData) {
          if (globalActions) globalActions.style.display = '';
          if (savedRowData) {
            MODULE_CONFIG.DetailRowData = Object.assign({}, MODULE_CONFIG.DetailRowData || {}, savedRowData);
            try {
              sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(MODULE_CONFIG.DetailRowData));
            } catch (e) { }
          } else {
            MODULE_CONFIG.DetailRowData = null;
          }
          $container.innerHTML = '';
          _loadData();
        }
      };
      btnCancel.onclick = function () {
        if (isViewMode) {
          dummyModal.close();
        } else if (isEdit) {
          _openModal(true, row, true); // Switch back to View mode
        } else {
          dummyModal.close();
        }
      };
      btnSave.onclick = function () { _saveData(isEdit, row, dummyModal, body, btnSave); };
      if (isViewMode) {
        btnSwitchEdit.onclick = function () { _openModal(true, row, false); };
      }
    } else {
      var defaultTitle = 'Thông tin chi tiết';
      var baseTitle = MODULE_CONFIG.TitleView || MODULE_CONFIG.FormTitle || defaultTitle;
      var titleAddFallback = 'Thêm mới ' + baseTitle.toLowerCase();
      var titleEditFallback = 'Cập nhật ' + baseTitle.toLowerCase();

      var modalTitle = isViewMode ? baseTitle : (isEdit ? (MODULE_CONFIG.TitleEdit || titleEditFallback) : (MODULE_CONFIG.TitleAdd || titleAddFallback));
      var modal = UIModal.show({
        title: modalTitle,
        width: MODULE_CONFIG.ModalWidth,
        content: body,
        footer: footer
      });

      btnCancel.onclick = function () { modal.close(); };
      btnSave.onclick = function () {
        _saveData(isEdit, row, modal, body, btnSave);
      };
      if (isViewMode) {
        btnSwitchEdit.onclick = function () { modal.closeNow(); _openModal(true, row, false); };
      }
    }

    // Focus ô nhập liệu đầu tiên (không bị ẩn)
    setTimeout(function () {
      var first = body.querySelector('input:not([type="hidden"])');
      if (first) first.focus();
    }, 100);
  }

  function _saveGridData(rows, modal, body, btnSave, isAdd) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    btnSave.disabled = true;
    btnSave.textContent = MODULE_CONFIG.BtnSaveSaving;

    var payloads = [];
    rows.forEach(function (targetRow, rowIdx) {
      var payload = _buildPayload(targetRow, !isAdd);

      var inputs = body.querySelectorAll('input[data-row-index="' + rowIdx + '"], select[data-row-index="' + rowIdx + '"], textarea[data-row-index="' + rowIdx + '"]');
      var hasData = false;
      inputs.forEach(function (el) {
        var fieldName = el.getAttribute('data-field-name');
        var val = el.value.trim();
        if (fieldName) {
          payload[fieldName] = val;
          if (val && fieldName !== MODULE_CONFIG.PrimaryKey && fieldName !== 'OrderNo') {
            hasData = true;
          }
        }
      });

      if (isAdd) {
        if (hasData) payloads.push(payload);
      } else {
        payloads.push(payload);
      }
    });

    if (payloads.length === 0) {
      Alert.warning(MODULE_CONFIG.AlertTitleInfo, 'Không có dữ liệu hợp lệ để lưu.');
      _setBtnLoading(btnSave, false);
      return;
    }

    // Gọi API tuần tự
    var finalPayloads = payloads;
    if (endpoint === '/api/API_Gateway_Router') {
      finalPayloads = payloads.map(function (p) {
        return {
          List: MODULE_CONFIG.FormName,
          Func: 'Save',
          JsonData: JSON.stringify(p)
        };
      });
    }

    _sendSequential(
      endpoint,
      finalPayloads,
      function (count) {             // onDone
        modal.closeNow();
        Alert.success('Thành công', 'Đã lưu xong ' + count + ' dòng!');
        if (!isAdd) selectedRows = [];
        if (_isFormBuilder()) {
          window._uiConfigCache = {};
          $container.innerHTML = '';
          render($container, MODULE_CONFIG);
        } else {
          _updateSelectionCounter();
          _loadData();
        }
      },
      function (err) {               // onError → tiếp tục
        console.error('Grid Edit Error', err);
      }
    );
  }

  // ── Save ──────────────────────────────────────────────────
  function _saveData(isEdit, rowData, modal, body, btnSave) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    // 1.4 Kiểm tra các trường bắt buộc trong lưới chi tiết (Detail Tabs) trước khi lưu
    if (body._detailPanels) {
      var isDetailInvalid = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var tabDef = panel._tabDef;
          var keyField = tabDef.fields[0]; // Cột đầu tiên mặc định là cột định danh
          if (tabDef.fields.indexOf('PersonID') !== -1) {
            keyField = 'PersonID';
          }
          for (var r = 0; r < panel._currentRows.length; r++) {
            var val = panel._currentRows[r][keyField];
            if (val === undefined || val === null || String(val).trim() === '') {
              var label = tabDef.label || 'Danh sách chi tiết';
              var headerLabel = (tabDef.headers && tabDef.headers[keyField]) || keyField;
              if (typeof Alert !== 'undefined') {
                Alert.warning('Thiếu thông tin', 'Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              } else {
                alert('Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              }
              isDetailInvalid = true;
              break;
            }
          }
        }
        if (isDetailInvalid) break;
      }
      if (isDetailInvalid) return;
    }

    // 1.5 Kiểm tra trùng lặp trong lưới chi tiết trước khi tiến hành lưu
    if (body._detailPanels) {
      var hasDuplicate = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var seen = {};
          for (var r = 0; r < panel._currentRows.length; r++) {
            var pid = panel._currentRows[r]['PersonID'];
            if (pid && pid.trim() !== '') {
              if (seen[pid]) {
                var label = panel._tabDef.label || 'Danh sách chi tiết';
                if (typeof Alert !== 'undefined') {
                  Alert.warning('Trùng lặp dữ liệu', 'Có nhân viên bị chọn trùng lặp trong tab "' + label + '"!');
                } else {
                  alert('Có nhân viên bị chọn trùng lặp trong tab "' + label + '"!');
                }
                hasDuplicate = true;
                break;
              }
              seen[pid] = true;
            }
          }
        }
        if (hasDuplicate) break;
      }
      if (hasDuplicate) return;
    }

    // 1. Quét Form: Thu thập các giá trị người dùng vừa gõ vào, loại bỏ các input thuộc lưới chi tiết
    var formInputData = {};
    var inputs = body.querySelectorAll('input, select, textarea');
    inputs.forEach(function (el) {
      if (el.name) {
        if (el.closest('.detail-tabs-container') || el.closest('.detail-tab-content') || el.closest('table')) {
          if (!el.closest('.detail-form-wrap')) {
            return;
          }
        }
        formInputData[el.name] = el.value.trim();
      }
    });

    // 2. Validate Required và ValidateRule
    var isInvalid = false;
    for (var i = 0; i < globalFormSchema.length; i++) {
      var field = globalFormSchema[i];
      var val = formInputData[field.name];

      // Hỗ trợ Partial Update (ví dụ từ WizardForm truyền fakeBody chỉ chứa các trường thay đổi)
      // Nếu trường không có trong formInputData nhưng có trong rowData (dữ liệu cũ), ta dùng tạm để pass Validate
      if (val === undefined && isEdit && rowData && rowData[field.name] !== undefined) {
        val = rowData[field.name];
      }

      if (field.required && !val) {
        Alert.warning(MODULE_CONFIG.WarnMissingInfo, MODULE_CONFIG.WarnMissingInput.replace('{0}', field.label));
        isInvalid = true;
        break;
      }
      if (val && field.validateRule) {
        var rules = field.validateRule.split('|').map(function (r) { return r.trim(); });
        for (var j = 0; j < rules.length; j++) {
          var rawRule = rules[j];
          var rule = rawRule.toLowerCase();
          if (!rule || rule.startsWith('formula:') || rule.startsWith('trigger:')) continue;

          if (rule.startsWith('min:')) {
            var min = parseInt(rule.split(':')[1]);
            if (val.length < min) { Alert.warning('Lỗi nhập liệu', field.label + ' phải có ít nhất ' + min + ' ký tự'); isInvalid = true; break; }
          } else if (rule.startsWith('max:')) {
            var max = parseInt(rule.split(':')[1]);
            if (val.length > max) { Alert.warning('Lỗi nhập liệu', field.label + ' không được vượt quá ' + max + ' ký tự'); isInvalid = true; break; }
          } else if (rule === 'email') {
            var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng Email'); isInvalid = true; break; }
          } else if (rule === 'phone') {
            var phoneRe = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
            if (!phoneRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng số điện thoại'); isInvalid = true; break; }
          } else if (rule === 'number') {
            var numRe = /^\d+$/;
            if (!numRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' chỉ được phép nhập số'); isInvalid = true; break; }
          } else if (rule === 'cccd') {
            var cccdRe = /^\d{9}(\d{3})?$/;
            if (!cccdRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 9 hoặc 12 số (CMND/CCCD)'); isInvalid = true; break; }
          } else if (rule === 'url') {
            var urlRe = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng đường dẫn trang web'); isInvalid = true; break; }
          } else if (rule === 'taxcode') {
            var taxRe = /^\d{10}(-\d{3})?$/;
            if (!taxRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 10 hoặc 13 số (Mã số thuế)'); isInvalid = true; break; }
          } else if (rule.startsWith('minval:')) {
            var minVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) < minVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ' + minVal); isInvalid = true; break; }
          } else if (rule.startsWith('maxval:')) {
            var maxVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) > maxVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ' + maxVal); isInvalid = true; break; }
          } else if (rule.startsWith('regex:')) {
            var reStr = rawRule.substring(6); // Dùng rawRule để không bị mất chữ Hoa/Thường của Regex
            try {
              var re = new RegExp(reStr);
              if (!re.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng yêu cầu'); isInvalid = true; break; }
            } catch (e) { console.error('Lỗi Regex:', e); }
          } else if (rule.startsWith('gt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) <= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) >= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('gte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) < parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) > parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          }
        }
        if (isInvalid) break;
      }
    }
    if (isInvalid) return;

    // 3. Lưu — bật loading, tắt khi xong (dùng _setBtnLoading thóat khỏi duplicate)
    _setBtnLoading(btnSave, true);
    var _restoreSaveBtn = function () { _setBtnLoading(btnSave, false); };

    // 4. Xây dựng danh sách Payload
    var payloads = [];
    var singlePayload = _buildPayload(formInputData, isEdit);
    singlePayload.OrderNo = rowData && rowData.OrderNo ? rowData.OrderNo : 0;

    if (isEdit && rowData && MODULE_CONFIG.PrimaryKey) {
      var pkKey = MODULE_CONFIG.PrimaryKey;
      if (singlePayload[pkKey] !== undefined && singlePayload[pkKey] !== rowData[pkKey]) {
        singlePayload['Old' + pkKey] = rowData[pkKey];
      }
      if (!singlePayload[pkKey]) {
        singlePayload[pkKey] = rowData[pkKey];
      }
    }
    payloads.push(singlePayload);

    if (payloads.length === 0) { modal.closeNow(); return; }

    // Helper finalize save
    function _finalizeSave(isEdit, modal) {
      if (window._pendingWizardAvatar) {
        if (!MODULE_CONFIG.AttachmentApi) {
          Alert.success('Thành công', 'Cập nhật hồ sơ thành công (chưa cấu hình lưu ảnh)!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
          return;
        }

        var masterKeyVal = formInputData[MODULE_CONFIG.PrimaryKey] || (rowData && rowData[MODULE_CONFIG.PrimaryKey]);
        var attachApi = MODULE_CONFIG.AttachmentApi;

        var avatarPayload = {
          List: attachApi,
          Func: 'SaveAvatar',
          JsonData: JSON.stringify({
            IsEdit: 0,
            PersonID: masterKeyVal,
            CandidateID: masterKeyVal,
            FileName: window._pendingWizardAvatar.file.name,
            FileType: 1, // 1 = Avatar
            STT: 2,
            FileSize: window._pendingWizardAvatar.file.size,
            Base64Content: window._pendingWizardAvatar.base64Content,
            Content: window._pendingWizardAvatar.hexStr
          }),
          UserName: _currentUser()
        };

        ApiClient.post('/api/API_Gateway_Router', avatarPayload).then(function () {
          if (singlePayload && window._pendingWizardAvatar) {
            singlePayload.Content = window._pendingWizardAvatar.hexStr;
            singlePayload.FileName = window._pendingWizardAvatar.file.name;
          }
          window._pendingWizardAvatar = null;
          Alert.success('Thành công', 'Cập nhật hồ sơ và ảnh đại diện thành công!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
        }).catch(function () {
          window._pendingWizardAvatar = null;
          Alert.warning('Cảnh báo', 'Lưu hồ sơ thành công nhưng không lưu được ảnh!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
        });
      } else {
        Alert.success('Thành công', isEdit ? MODULE_CONFIG.ToastEdit : MODULE_CONFIG.ToastAdd);
        modal.closeNow(singlePayload);
        _postFinalizeSave();
      }

      function _postFinalizeSave() {
        // Broadcast sự kiện lưu thành công để các form có thể hook vào (ví dụ: chạy SP ngay sau khi lưu)
        document.dispatchEvent(new CustomEvent('dynamicFormSaved', {
          detail: { formName: MODULE_CONFIG.FormName, data: singlePayload, isEdit: isEdit }
        }));

        if (MODULE_CONFIG.IsFullPageDetail) return; // Không cần load lại dữ liệu nếu là trang Detail (vì nó sẽ tự navigate back về Grid)
        if (_isFormBuilder()) {
          window._uiConfigCache = {}; // Cache Invalidate
          selectedRows = [];
          $container.innerHTML = '';
          render($container, MODULE_CONFIG);
        } else {
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        }
      }
    }

    // 5. Gọi API Lưu
    var finalPayload = payloads[0];
    if (endpoint === '/api/API_Gateway_Router') {
      finalPayload = {
        List: MODULE_CONFIG.FormName,
        Func: 'Save',
        JsonData: JSON.stringify(payloads[0]),
        UserName: _currentUser()
      };
    }
    ApiClient.post(endpoint, finalPayload)
      .then(function (res) {
        if (res && res.code === 0) {
          // Master save succeeded! Now save/delete details.
          var detailApiCalls = [];

          if (body._detailPanels) {
            body._detailPanels.forEach(function (panel) {
              if (panel._tabDef && panel._tabDef.editable) {
                var tabDef = panel._tabDef;
                var masterKeyVal = formInputData[MODULE_CONFIG.PrimaryKey] || (rowData && rowData[MODULE_CONFIG.PrimaryKey]);

                // 1. Process deleted rows
                if (panel._deletedRows && panel._deletedRows.length > 0) {
                  var deletedIds = panel._deletedRows.map(function (r) { return r.UserAutoID; }).filter(Boolean).join(',');
                  if (deletedIds) {
                    var delPayload = {
                      List: tabDef.api,
                      Func: 'Delete',
                      Ids: deletedIds,
                      UserName: _currentUser()
                    };
                    if (MODULE_CONFIG.ApiSave === '/api/API_Gateway_Router' || !MODULE_CONFIG.ApiSave) {
                      delPayload = {
                        List: tabDef.api,
                        Func: 'Delete',
                        Ids: deletedIds,
                        JsonData: JSON.stringify({ Ids: deletedIds }),
                        UserName: _currentUser()
                      };
                    }
                    detailApiCalls.push(function () { return ApiClient.post(MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router', delPayload); });
                  }
                }

                // 2. Process current (added/modified) rows
                if (panel._currentRows && panel._currentRows.length > 0) {
                  panel._currentRows.forEach(function (currRow) {
                    currRow[tabDef.filterField] = masterKeyVal;
                    var isRowEdit = !!currRow.UserAutoID;
                    var rowPayload = Object.assign({}, currRow);
                    rowPayload.UserName = _currentUser();
                    rowPayload.UserCreate = _currentUser();
                    rowPayload.IsEdit = isRowEdit ? 1 : 0;

                    var savePayload = {
                      List: tabDef.api,
                      Func: 'Save',
                      JsonData: JSON.stringify(rowPayload),
                      UserName: _currentUser()
                    };

                    detailApiCalls.push(function () { return ApiClient.post(MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router', savePayload); });
                  });
                }
              }
            });
          }

          if (detailApiCalls.length > 0) {
            var detailResults = [];
            var chain = Promise.resolve();
            detailApiCalls.forEach(function (apiCall) {
              chain = chain.then(function () {
                return apiCall().then(function (res) {
                  detailResults.push(res);
                });
              });
            });
            chain.then(function () {
              var allOk = detailResults.every(function (dr) { return dr && dr.code === 0; });
              if (allOk) {
                _finalizeSave(isEdit, modal);
              } else {
                var firstErr = detailResults.find(function (dr) { return dr && dr.code !== 0; });
                var dMsg = firstErr && firstErr.msg ? firstErr.msg : 'Lưu chi tiết thất bại';
                if (dMsg.indexOf('Violation of PRIMARY KEY constraint') !== -1 || dMsg.indexOf('Cannot insert duplicate key') !== -1) {
                  dMsg = 'Lỗi: Có dữ liệu bị trùng lặp. Vui lòng kiểm tra lại mã hoặc thông tin!';
                }
                Alert.error(MODULE_CONFIG.AlertTitleError, dMsg);
                _restoreSaveBtn();
              }
            }).catch(function (err) {
              Alert.error(MODULE_CONFIG.AlertTitleError, 'Lỗi lưu thông tin chi tiết: ' + err.message);
              _restoreSaveBtn();
            });
          } else {
            _finalizeSave(isEdit, modal);
          }
        } else {
          var mMsg = res && res.msg ? res.msg : MODULE_CONFIG.AlertSaveFailed;
          if (mMsg.indexOf('Violation of PRIMARY KEY constraint') !== -1 || mMsg.indexOf('Cannot insert duplicate key') !== -1) {
            mMsg = 'Lỗi: Mã này đã tồn tại trong hệ thống. Vui lòng kiểm tra và nhập mã khác!';
          }
          Alert.error(MODULE_CONFIG.AlertTitleError, mMsg);
          _restoreSaveBtn();
        }
      })
      .catch(function () {
        Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        _restoreSaveBtn();
      });
  }

  function _saveInlineEdit(originalRow, tabDef, btnSave) {
    var detailContent = $container.querySelector('#dynamic-detail-content');
    if (!detailContent) return;

    var formInputData = {};
    var inputs = detailContent.querySelectorAll('.form-inline-input');
    inputs.forEach(function (el) {
      if (el.name) {
        formInputData[el.name] = el.value;
      }
    });

    var endpoint = MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router';
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    // Merge với original row
    var payloadObj = Object.assign({}, originalRow, formInputData);
    payloadObj.UserName = _currentUser();
    payloadObj.IsEdit = 1;

    var finalPayload = {
      List: MODULE_CONFIG.FormName,
      Func: 'Save',
      JsonData: JSON.stringify(payloadObj),
      UserName: _currentUser()
    };

    if (btnSave) {
      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';
    }

    ApiClient.post(endpoint, finalPayload)
      .then(function (res) {
        if (res && res.code === 0) {
          // Main save successful. Check if there's a pending avatar to upload.
          if (window._pendingAvatar) {
            if (!MODULE_CONFIG.AttachmentApi) {
              UIToast.show('Đã cập nhật thông tin thành công (chưa cấu hình lưu ảnh)', 'success');
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
              return;
            }

            var personId = originalRow.PersonID || originalRow.CandidateID;
            var attachApi = MODULE_CONFIG.AttachmentApi;

            var avatarPayload = {
              List: attachApi,
              Func: 'SaveAvatar',
              JsonData: JSON.stringify({
                IsEdit: 0,
                PersonID: personId,
                CandidateID: personId,
                FileName: window._pendingAvatar.file.name,
                FileType: 1, // 1 = Avatar
                STT: 2,
                FileSize: window._pendingAvatar.file.size,
                Base64Content: window._pendingAvatar.base64Content,
                Content: window._pendingAvatar.hexStr
              }),
              UserName: _currentUser()
            };

            ApiClient.post('/api/API_Gateway_Router', avatarPayload).then(function (resAvatar) {
              if (resAvatar && (resAvatar.code === 0 || resAvatar.code === "0")) {
                UIToast.show('Đã cập nhật thông tin và ảnh đại diện thành công!', 'success');
              } else {
                Alert.error('Lỗi lưu ảnh', 'Lưu thông tin thành công nhưng ảnh bị từ chối: ' + (resAvatar.msg || ''));
              }
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
            }).catch(function (errAvatar) {
              Alert.error('Lỗi mạng', 'Lưu thông tin thành công nhưng không kết nối được để lưu ảnh.');
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
            });

          } else {
            // No avatar to upload
            UIToast.show(MODULE_CONFIG.ToastEdit || 'Đã cập nhật thông tin thành công', 'success');
            _inlineEditMode = false;
            _loadData();
          }
        } else {
          Alert.error(MODULE_CONFIG.AlertTitleError, res && res.msg ? res.msg : MODULE_CONFIG.AlertSaveFailed);
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
          }
        }
      })
      .catch(function () {
        Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
        }
      });
  }

  return { render: render };
})();


/* --- index.js --- */
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

        var isAdmin = MetadataModuleConfig.isAdminUser(userCache);

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
              onConfirm: function () {
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
              var saveHandler = function (e) {
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
      resolveAutoId: MetadataModuleConfig.createSequentialIdResolver({
        formName: 'WA_PersonFullFrm',
        idField: 'PersonID'
      })
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


/* --- router.js --- */
/**
 * Router — Hash-based SPA routing cho Quản lý Nhân sự
 * ─────────────────────────────────────────────────────
 * Kiến trúc: Mảng ROUTES cấu hình → Dynamic script loading → pageFn.render()
 * Template do Page Module tự fetch (Router cung cấp cache layer)
 * Tham khảo: Medstand Router v9
 */
var Router = (function () {

  // ── Route definitions ──────────────────────────────────────────────────
  var ROUTES = [
    { path: '/dashboard', template: 'src/pages/dashboard/dashboard.html', script: 'src/pages/dashboard/dashboard.js', perm: 'tongquan', title: 'Tổng quan', pageFn: 'DashboardPage', hideHeader: true },
    { path: '/components-demo', template: 'src/pages/components-demo/components-demo.html', script: 'src/pages/components-demo/components-demo.js', perm: 'uidemo', title: 'Bản test Component', pageFn: 'ComponentsDemoPage' },
    { path: '/appearance', template: 'src/pages/appearance/appearance.html', script: 'src/pages/appearance/appearance.js', perm: '', title: 'Cấu hình Giao diện', pageFn: 'AppearancePage' },
    { path: '/document-manager', template: 'src/pages/document-manager/document-manager.html', script: 'src/pages/document-manager/document-manager.js', perm: '', title: 'Workspace Tài Liệu', pageFn: 'DocumentManagerPage', hideHeader: true },
    { path: '/menus', template: 'src/pages/menus/menus.html', script: 'src/pages/menus/menus.js?v=2', perm: '', title: '', pageFn: 'MenusPage' },
    { path: '/settings', template: 'src/pages/settings/settings.html', script: 'src/pages/settings/settings.js', perm: '', title: '', pageFn: 'SettingsPage' },
    { path: '/permissions', template: 'src/pages/permissions/permissions.html', script: 'src/pages/permissions/permissions.js', perm: '', title: '', pageFn: 'PermissionsPage' },
    { path: '/detail', template: 'src/pages/detail/detail.html', script: 'src/pages/detail/detail.js', perm: '', title: 'Chi tiết', pageFn: 'DetailPage', hideHeader: true }
  ];

  function addDynamicRoutes(menus) {
    if (!menus || !Array.isArray(menus)) return;

    var currentHash = window.location.hash.replace('#', '').split('?')[0] || '/dashboard';
    var needsReload = false;

    menus.forEach(function (m) {
      // url có thể nằm ở URLPara hoặc urlPara
      var rawUrl = m.URLPara || m.urlPara || '';
      if (!rawUrl || rawUrl.trim() === '') return;

      // Chỉnh sửa: Loại bỏ dấu '#' và '/' thừa nếu người dùng lỡ nhập vào DB (vd: '#/customers' -> 'customers')
      var url = rawUrl.trim().replace(/^#\/?/, '').replace(/^\//, '');
      if (url === '') return;

      var path = '/' + url;
      if (window.APP_SETTINGS && APP_SETTINGS.isLegacyRouteDisabled(path)) return;

      var existingRoute = ROUTES.find(function (r) { return r.path === path; });

      if (existingRoute) {
        // Cập nhật thông tin từ database nếu route custom đã được định nghĩa cứng
        existingRoute.perm = m.FormName || m.formName || existingRoute.perm;
        existingRoute.title = m.MenuName || m.VN || m.label || existingRoute.title || '';
        existingRoute.subTitle = m.SubTitle || m.subTitle || existingRoute.subTitle || '';
        if (m.HideHeader || m.hideHeader) existingRoute.hideHeader = true;

        _routeMap[path] = existingRoute;
        if (path === currentHash) needsReload = true;
        return;
      }

      var route = {
        path: path,
        perm: m.FormName || m.formName,
        title: m.MenuName || m.VN || m.label || '',
        subTitle: m.SubTitle || m.subTitle || '',
        hideHeader: m.HideHeader || m.hideHeader || false
      };

      var formKey = m.FormKey || m.formKey;
      var formName = m.FormName || m.formName || '';

      var existingConfig = null;

      // 1. Tìm config dựa vào FormKey hoặc FormName
      if (window.APP_MODULES) {
        if (formKey && window.APP_MODULES[formKey]) {
          existingConfig = window.APP_MODULES[formKey];
        } else if (formName) {
          var targetName = formName.toLowerCase();
          for (var k in window.APP_MODULES) {
            if (window.APP_MODULES[k].FormName && window.APP_MODULES[k].FormName.toLowerCase() === targetName) {
              existingConfig = window.APP_MODULES[k];
              formKey = k;
              break;
            }
          }
        }

        // 2. Fallback: tự suy luận từ urlPara (vd: form-builder -> FORM_BUILDER)
        if (!existingConfig) {
          var deducedKey = url.trim().replace(/-/g, '_').toUpperCase();
          if (window.APP_MODULES[deducedKey]) {
            existingConfig = window.APP_MODULES[deducedKey];
            formKey = deducedKey;
          }
        }
      }

      // Đã loại bỏ nhánh custom vì toàn bộ custom đã nằm trong ROUTES
      // Mặc định những route mới từ DB không nằm trong ROUTES sẽ dùng DynamicFormEngine
      route.script = 'src/js/core/DynamicFormEngine.js';
      route.pageFn = 'DynamicFormEngine';
      route.config = Object.assign({ FormName: formName, PageTitle: route.title, PageSubtitle: route.subTitle }, existingConfig || {});

      ROUTES.push(route);
      _routeMap[path] = route; // Update Map

      if (path === currentHash) {
        needsReload = true;
      }
    });

    if (needsReload) {
      if (!_currentRoute || _currentRoute.path !== currentHash) {
        // Delay slightly to allow Navbar to finish rendering before we trigger routing
        setTimeout(function () {
          _handleRoute();
        }, 50);
      }
    }
  }

  // ── State ──────────────────────────────────────────────────────────────
  var _currentRoute = null;
  var _loadedScripts = {};
  var _templateCache = {};
  var _appVersion = '2.15'; // Bump để làm mới cache html/script động
  var _navId = 0; // Token chặn race-condition

  // ── Template cache (dùng chung cho cả Router lẫn Page modules) ─────────
  function fetchTemplate(url) {
    if (_templateCache[url]) return Promise.resolve(_templateCache[url]);
    return fetch(url + '?v=' + _appVersion)
      .then(function (res) {
        if (!res.ok) throw new Error('Template not found: ' + url);
        return res.text();
      })
      .then(function (html) {
        _templateCache[url] = html;
        return html;
      });
  }

  // ── Preload templates phổ biến (tải trước nền) ─────────────────────────
  function _preloadTemplates() {
    var priority = ['/dashboard'];
    priority.forEach(function (p) {
      var r = _findRoute(p);
      if (r && r.template) fetchTemplate(r.template).catch(function () { });
    });
  }

  // ── Dynamic Script Loading ─────────────────────────────────────────────
  function _loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (_loadedScripts[src]) { resolve(); return; }
      var el = document.createElement('script');
      // Thêm cache-buster để đảm bảo luôn tải file JS mới nhất
      el.src = src + '?v=' + Date.now();
      el.onload = function () { _loadedScripts[src] = true; resolve(); };
      el.onerror = function () { reject(new Error('Script load failed: ' + src)); };
      document.body.appendChild(el);
    });
  }

  // ── Route matching (dùng Map nội bộ cho O(1) lookup) ───────────────────
  var _routeMap = {};
  ROUTES.forEach(function (r) { _routeMap[r.path] = r; });

  function _findRoute(path) {
    return _routeMap[path] || null;
  }

  // ── Page Transition ────────────────────────────────────────────────────
  function _fadeOut($el) {
    return new Promise(function (resolve) {
      $el.style.opacity = '0';
      $el.style.transition = 'opacity 120ms ease';
      setTimeout(resolve, 120);
    });
  }

  function _fadeIn($el) {
    $el.style.opacity = '1';
    $el.style.transition = 'opacity 180ms ease';
  }

  // ── Trang lỗi ──────────────────────────────────────────────────────────
  function _render404($el, path) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:48px 24px;">' +
      '<span class="material-symbols-outlined" style="font-size:72px;color:var(--color-border-strong);margin-bottom:16px;">search_off</span>' +
      '<h2 style="font-size:2rem;font-weight:700;margin:0 0 8px;">404</h2>' +
      '<p style="color:var(--color-text-secondary);margin:0 0 24px;">Trang <code style="background: rgba(148, 163, 184, 0.1);padding:2px 8px;border-radius:4px;">' + path + '</code> không tồn tại</p>' +
      '<a href="#/dashboard" class="btn btn-primary" style="text-decoration:none;">Về trang chủ</a>' +
      '</div>';
  }

  function _renderAccessDenied($el) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:48px 24px;">' +
      '<span class="material-symbols-outlined" style="font-size:72px;color:var(--color-danger);margin-bottom:16px;">lock</span>' +
      '<p style="color:var(--color-danger);font-size:1.1rem;font-weight:500;">Bạn không có quyền xem trang này</p>' +
      '</div>';
  }

  function _renderPlaceholder($el, title) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:40vh;text-align:center;padding:48px;">' +
      '<span class="material-symbols-outlined" style="font-size:64px;color:var(--color-border-strong);opacity:0.4;margin-bottom:16px;">construction</span>' +
      '<h3 style="margin:0 0 8px;font-weight:600;">' + title + '</h3>' +
      '<p style="color:var(--color-text-secondary);margin:0;">Trang này đang được phát triển...</p>' +
      '</div>';
  }

  function _renderError($el, message) {
    $el.innerHTML =
      '<div class="card"><div class="card-body" style="color:var(--color-danger);">' +
      '<span class="material-symbols-outlined" style="vertical-align:middle;margin-right:8px;">error</span>' + message +
      '</div></div>';
  }

  // ── Cập nhật navigation UI ─────────────────────────────────────────────
  function _updateNavActive(hash) {
    // Sidebar nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('href') === '#' + hash) el.classList.add('active');
    });
    // Navbar (nếu đang dùng layout ngang)
    document.querySelectorAll('.main-nav .nav-link, .sub-menu-item').forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('href') === '#' + hash) el.classList.add('active');
    });
  }

  // ── Main Route Handler ─────────────────────────────────────────────────
  function _handleRoute() {
    _navId++;
    var currentNav = _navId;

    var rawHash = window.location.hash.replace('#', '') || '/dashboard';
    var hashParts = rawHash.split('?');
    var pathOnly = hashParts[0];
    var route = _findRoute(pathOnly);

    // Kéo quyền động nếu máy khác vừa cập nhật (Đảm bảo Realtime)
    _syncPermissionsIfNeeded().then(function () {
      if (currentNav !== _navId) return;

      var $content = document.getElementById('app-content');
      var $pageTitle = document.getElementById('page-title');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Cập nhật nav UI
      _updateNavActive(pathOnly);

      // 404
      if (!route) {
        if ($pageTitle) $pageTitle.innerText = '404 — Không tìm thấy';
        document.title = '404 | Quản lý Nhân sự';
        _render404($content, rawHash);
        return;
      }

      // Kiểm tra quyền
      var targetPerm = route.perm || route.module;
      if (targetPerm && !Permission.canView(targetPerm)) {
        if ($pageTitle) $pageTitle.innerText = 'Từ chối truy cập';
        _renderAccessDenied($content);
        return;
      }

      // Cập nhật title
      if ($pageTitle) $pageTitle.innerText = route.title;
      document.title = route.title + ' | Quản lý Nhân sự';
      document.body.setAttribute('data-page', pathOnly.replace('/', ''));

      // ── Trường hợp 1: Có script → load script → pageFn.render() ──
      // (Page module tự fetch template bên trong render nếu cần)
      if (route.pageFn) {
        _fadeOut($content)
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            if (route.script && !(route.pageFn && window[route.pageFn])) {
              return _loadScript(route.script);
            }
            return Promise.resolve();
          })
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            var mod = window[route.pageFn];
            if (mod && typeof mod.render === 'function') {
              // Xóa sạch nội dung cũ
              $content.innerHTML = '';

              // 1. Dựng Global Header (Lấy Title/Subtitle từ Router/Menu)
              if (!route.hideHeader) {
                var headerHtml =
                  '<div class="page-title-bar" id="global-header">' +
                  '<div class="page-title-info">' +
                  '<h1 class="page-title-heading">' + (route.title || 'Quản lý Dữ liệu') + '</h1>' +
                  (route.subTitle ? '<span class="page-title-sub">' + route.subTitle + '</span>' : '') +
                  '</div>' +
                  '<div class="page-title-actions" id="global-page-actions"></div>' +
                  '</div>';
                $content.insertAdjacentHTML('beforeend', headerHtml);
              }

              // 2. Dựng wrapper
              var wrapper = document.createElement('div');
              wrapper.className = 'page-wrapper';
              $content.appendChild(wrapper);

              // 3. Render trang vào wrapper
              mod.render(wrapper, route.config || null);
            } else {
              _renderError($content, 'Không tìm thấy module: ' + route.pageFn);
            }
            _fadeIn($content);
            _currentRoute = route;
          })
          .catch(function (err) {
            if (err.message === 'ABORTED') return; // Bỏ qua nếu là thao tác hủy do click liên tục
            console.error('[Router]', err);
            _renderError($content, 'Lỗi tải module: ' + err.message);
            _fadeIn($content);
          });
        return;
      }

      // ── Trường hợp 2: Chỉ có template (dashboard, trang tĩnh) ──
      if (route.template) {
        _fadeOut($content)
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            return fetchTemplate(route.template);
          })
          .then(function (html) {
            if (currentNav !== _navId) throw new Error('ABORTED');
            $content.innerHTML = html;
            _fadeIn($content);
            _currentRoute = route;
          })
          .catch(function (err) {
            if (err.message === 'ABORTED') return;
            console.error('[Router]', err);
            _renderError($content, 'Lỗi tải template: ' + err.message);
            _fadeIn($content);
          });
        return;
      }

      // ── Trường hợp 3: Trang chưa code ──
      _renderPlaceholder($content, route.title);
    }); // End of _syncPermissionsIfNeeded
  }

  function _syncPermissionsIfNeeded() {
    if (typeof ApiClient === 'undefined' || typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.PERMISSIONS.GET_VERSION) {
      return Promise.resolve();
    }
    return ApiClient.get(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_VERSION, { silent: true }).then(function (res) {
      var localVer = window.APP_SETTINGS ? APP_SETTINGS.getStored('permission_ver', null) : localStorage.getItem('pmql_permission_ver');
      var records = res.list || res.records || [];
      var svVersion = records.length > 0 ? records[0].version : (res.version || '');

      if (svVersion && svVersion !== localVer) {
        var userJson = window.APP_SETTINGS ? APP_SETTINGS.getStored('user', null) : localStorage.getItem('pmql_user');
        var userObj = userJson ? JSON.parse(userJson) : {};
        return ApiClient.post(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MY_PERMISSIONS, { Username: userObj.UserName }, { silent: true }).then(function (permRes) {
          var permMap = {};
          var permList = permRes.list || permRes.records || [];
          if (permList.length > 0) { localStorage.setItem('debug_perm_row', JSON.stringify(permList[0])); }
          function _isTrue(v) { return v === 1 || v === '1' || v === true || v === 'true' || String(v).toLowerCase() === 'true'; }
          permList.forEach(function (p) {
            var fname = p.FormName || p.formName || p.formname || p.FORMNAME;
            if (fname) {
              permMap[fname] = {
                CanView: _isTrue(p.CanView) || _isTrue(p.canView) || _isTrue(p.canview) || _isTrue(p.CANVIEW),
                CanAdd: _isTrue(p.CanAdd) || _isTrue(p.canAdd) || _isTrue(p.canadd) || _isTrue(p.CANADD),
                CanEdit: _isTrue(p.CanEdit) || _isTrue(p.canEdit) || _isTrue(p.canedit) || _isTrue(p.CANEDIT),
                CanDelete: _isTrue(p.CanDelete) || _isTrue(p.canDelete) || _isTrue(p.candelete) || _isTrue(p.CANDELETE)
              };
            }
          });
          if (window.APP_SETTINGS) {
            APP_SETTINGS.setStored('permissions', JSON.stringify(permMap));
            APP_SETTINGS.setStored('permission_ver', svVersion);
          } else {
            localStorage.setItem('pmql_permissions', JSON.stringify(permMap));
            localStorage.setItem('pmql_permission_ver', svVersion);
          }
        }).catch(function (e) {
          console.error('[Router] Lỗi tải quyền mới:', e);
        });
      }
    }).catch(function (e) {
      console.error('[Router] Lỗi kiểm tra version quyền:', e);
      return Promise.resolve();
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function init() {
    window.addEventListener('hashchange', _handleRoute);

    // BẢO MẬT: Kiểm tra Version Quyền 1 lần duy nhất lúc F5 tải lại màn hình
    _syncPermissionsIfNeeded().then(function () {
      _finishInit();
    }).catch(function (e) {
      console.error(e);
      _finishInit();
    });
  }

  function _finishInit() {
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      _handleRoute();
    }
    setTimeout(_preloadTemplates, 500);
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    init: init,
    ROUTES: ROUTES,
    addDynamicRoutes: addDynamicRoutes,
    fetchTemplate: fetchTemplate   // Cho page modules dùng chung cache layer
  };
})();


