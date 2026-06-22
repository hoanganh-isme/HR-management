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

    localStorage.removeItem('pmql_user');
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
  // 1. Khởi tạo trình quản lý phím tắt
  if (typeof KeyboardManager !== 'undefined') {
    KeyboardManager.init();
  }

  // 2. Khởi tạo Router
  // Cấu hình các form có DetailTabs (Master-Detail)
  window.APP_MODULES = window.APP_MODULES || {};
  window.APP_MODULES['WA_CALAMVIECFRM'] = {
    FormName: 'WA_CaLamViecFrm',
    PrimaryKey: 'SapCaID',
    ModalWidth: '860px',
    DetailTabs: [
      {
        label: 'Nhân viên',
        api: 'API_CaLamViec_NhanVien',
        filterField: 'SapCaID',
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
    ]
  };

  window.APP_MODULES['WA_QUANLYNGHIPHEPNAMFRM'] = {
    FormName: 'WA_QuanLyNghiPhepNamFrm',
    PrimaryKey: 'PersonID',
    ModalWidth: '960px',
    DetailTabs: [
      {
        label: 'Phép năm',
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

  window.APP_MODULES['WA_PERSONFULLFRM'] = {
    FormName: 'WA_PersonFullFrm',
    PrimaryKey: 'PersonID',
    UseSplitLayout: true,
    SplitLayoutSelectText: 'Vui lòng chọn nhân viên để xem hồ sơ chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết hồ sơ nhân viên',
    SplitLayoutDetailWidth: '950px',
    ModalWidth: '960px',
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã, tên nhân viên hoặc số điện thoại...',
    DetailFormFields: [
      { name: 'PersonID', label: 'Mã nhân viên' },
      { name: 'NewPersonID', label: 'Mã nhân viên mới' },
      { name: 'CardNo', label: 'Mã số thẻ' },
      { name: 'PersonName', label: 'Họ Tên' },
      { name: 'DienThoai', label: 'Điện thoại' },
      { name: 'ProvineName', label: 'Tỉnh thành' },
      { name: 'BranchID', label: 'Chi nhánh' },
      { name: 'DiaChiHienNay', label: 'Địa chỉ hiện nay' },
      { name: 'DiaChiThuongTru', label: 'Địa chỉ thường trú' },
      { name: 'PhongBan', label: 'Bộ phận' },
      { name: 'TitleName', label: 'Chức vụ' },
      { name: 'ChucDanhChuyenMon', label: 'Chức danh' },
      { name: 'Quanly', label: 'Quản lý' },
      { name: 'NgayThuViec', label: 'Ngày thử việc', format: 'date' },
      { name: 'NgayVaoLam', label: 'Ngày nhận việc', format: 'date' },
      { name: 'PersonStatus', label: 'Trạng thái' },
      { name: 'BankHolder', label: 'Chủ tài khoản NH' },
      { name: 'BankAccountNo', label: 'Số tài khoản NH' },
      { name: 'BankName', label: 'Tên ngân hàng' },
      { name: 'BankLocation', label: 'Chi nhánh NH' },
      { name: 'SocialID', label: 'Số thẻ BHXH' },
      { name: 'SocialDate', label: 'Ngày bắt đầu BH', format: 'date' },
      { name: 'NgayKetThucBH', label: 'Ngày kết thúc BH', format: 'date' },
      { name: 'ShiftID', label: 'Ca làm việc' },
      { name: 'ChamCong', label: 'Chấm công', format: 'boolean' },
      { name: 'SoTheBHYT', label: 'Số thẻ BHYT' },
      { name: 'ThoiGianHuongBHYT', label: 'Thời gian hưởng', format: 'date' },
      { name: 'NoiDangKyBHYT', label: 'Nơi ĐK KCB ban đầu' },
      { name: 'SoHopDong', label: 'Số hợp đồng' },
      { name: 'LoaiHopDong', label: 'Loại hợp đồng' },
      { name: 'NgayHopDong', label: 'Ngày hợp đồng', format: 'date' },
      { name: 'NgayHetHopDong', label: 'Ngày hết hiệu lực HĐ', format: 'date' },
      { name: 'NguoiLienHe', label: 'Người liên hệ' },
      { name: 'MoiQuanHe', label: 'Mối quan hệ' },
      { name: 'NguoiLienHeSoDT', label: 'Số ĐT người liên hệ' }
    ],
    DetailTabs: [
      {
        label: 'Sơ yếu lý lịch',
        type: 'form',
        fields: [
          'PersonID', 'NewPersonID', 'CardNo', 'PersonName', 'GioiTinh', 'HonNhan', 
          'NgaySinh', 'NoiSinh', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'PeoplesName', 
          'ReligionName', 'Nationality', 'DienThoai', 'Email', 'DiaChiThuongTru', 
          'DiaChiHienNay', 'EducationName', 'JobName', 'CareerName', 'HospitalName', 
          'NgayVaoLam', 'BranchID'
        ],
        headers: {
          PersonID: 'Mã nhân viên',
          NewPersonID: 'Mã NV mới',
          CardNo: 'Mã số thẻ',
          PersonName: 'Họ tên',
          GioiTinh: 'Giới tính',
          HonNhan: 'Hôn nhân',
          NgaySinh: 'Ngày sinh',
          NoiSinh: 'Nơi sinh',
          CMND: 'Số CCCD/CMND',
          CMNDNgayCap: 'Ngày cấp CCCD',
          CMNDNoiCap: 'Nơi cấp CCCD',
          PeoplesName: 'Dân tộc',
          ReligionName: 'Tôn giáo',
          Nationality: 'Quốc tịch',
          DienThoai: 'Điện thoại',
          Email: 'Email',
          DiaChiThuongTru: 'Địa chỉ thường trú',
          DiaChiHienNay: 'Địa chỉ hiện nay',
          EducationName: 'Học vấn',
          JobName: 'Công việc',
          CareerName: 'Nghề nghiệp',
          HospitalName: 'Nơi KCB ban đầu',
          NgayVaoLam: 'Ngày vào làm',
          BranchID: 'Chi nhánh'
        }
      },
      {
        label: 'Quá trình làm việc và lương, phụ cấp',
        api: 'API_PersonFull_T1_Salary',
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
        label: 'Lương & Phụ cấp',
        api: 'API_PersonFull_T2_Allowance',
        filterField: 'PersonID',
        fields: ['MaPhuCap', 'NoiDungPhuCap', 'FromDate', 'ToDate', 'GhiChu'],
        headers: {
          MaPhuCap: 'Mã phụ cấp',
          NoiDungPhuCap: 'Nội dung',
          FromDate: 'Từ ngày',
          ToDate: 'Đến ngày',
          GhiChu: 'Ghi chú'
        }
      },
      {
        label: 'Khen thưởng - Kỷ luật',
        api: 'API_PersonFull_T3_KTKL',
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
    UseSplitLayout: true,
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

  window.APP_MODULES['WA_PAYROLLFRM'] = {
    FormName: 'WA_PayrollFrm',
    PrimaryKey: 'DocumentID',
    UseSplitLayout: true,
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

  // Cấu hình Plugin Button "Tạo bảng lương tháng" (Tạm thời bỏ)
  if (!window.FormActionPlugins) window.FormActionPlugins = [];
  window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'payroll_plugin'; });

  if (typeof Router !== 'undefined') {
    Router.init();
  }

  // 3. Khởi tạo Navbar (chỉ render nếu đã đăng nhập)
  var currentUser = localStorage.getItem('pmql_user');
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
  var savedFont = localStorage.getItem('pmql_font_family');
  if (savedFont) {
    document.documentElement.style.setProperty('--font-family', '"' + savedFont + '", sans-serif');
  }

  var savedTheme = localStorage.getItem('pmql_theme') || 'auto';
  if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Lắng nghe sự thay đổi giao diện từ hệ thống (khi chuyển qua chế độ tiết kiệm pin hoặc Dark Mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var currentTheme = localStorage.getItem('pmql_theme') || 'auto';
    if (currentTheme === 'auto') {
      if (e.matches) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  });

  var savedColor = localStorage.getItem('pmql_color');
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
