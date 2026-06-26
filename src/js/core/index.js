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
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    AllowDblClickToView: true,
    HideDetailTabsInModal: true,
    FilterKeywordLabel: 'Mã/Tên nhân viên',
    SearchPlaceholder: 'Nhập mã, tên nhân viên hoặc số điện thoại...',
    WizardSteps: [
      { label: 'Cơ bản', icon: 'person', description: 'Thông tin công việc', fields: ['PersonID', 'NewPersonID', 'PersonName', 'BranchID', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon', 'NgayVaoLam', 'NgayThuViec', 'PersonStatus', 'ShiftID'] },
      { label: 'Cá nhân', icon: 'badge', description: 'Thông tin cá nhân', fields: ['GioiTinh', 'NgaySinh', 'NoiSinh', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'PeoplesName', 'ReligionName', 'Nationality', 'DienThoai', 'Email', 'DiaChiThuongTru', 'EducationName', 'CareerName'] },
      { label: 'Hợp đồng & BHXH', icon: 'description', description: 'Hợp đồng và Bảo hiểm', fields: ['BankHolder', 'BankAccountNo', 'BankName', 'BankLocation', 'SocialID', 'SocialDate', 'NgayKetThucBH', 'SoTheBHYT', 'ThoiGianHuongBHYT', 'SoHopDong', 'LoaiHopDong'] },
      { label: 'Xác nhận', icon: 'fact_check', description: 'Kiểm tra thông tin trước khi lưu', fields: [] }
    ],

    DetailTabs: [
      {
        label: 'Sơ yếu lý lịch',
        type: 'form',
        fields: [
          'PersonID', 'NewPersonID', 'PersonName', 'GioiTinh',
          'NgaySinh', 'NoiSinh', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'PeoplesName',
          'ReligionName', 'Nationality', 'DienThoai', 'Email', 'DiaChiThuongTru', 'EducationName', 'CareerName',
          'NgayVaoLam', 'BranchID', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon',
          'NgayThuViec', 'PersonStatus', 'BankHolder', 'BankAccountNo', 'BankName',
          'BankLocation', 'SocialID', 'SocialDate', 'NgayKetThucBH', 'ShiftID',
          'SoTheBHYT', 'ThoiGianHuongBHYT', 'SoHopDong', 'LoaiHopDong'
        ],
        headers: {
          PersonID: 'Mã nhân viên',
          NewPersonID: 'Mã NV cũ',
          PersonName: 'Họ tên',
          GioiTinh: 'Giới tính',
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
          EducationName: 'Học vấn',
          CareerName: 'Nghề nghiệp',
          NgayVaoLam: 'Ngày vào làm',
          BranchID: 'Chi nhánh',
          PhongBan: 'Bộ phận',
          TitleName: 'Chức vụ',
          ChucDanhChuyenMon: 'Chức danh',
          NgayThuViec: 'Ngày thử việc',
          PersonStatus: 'Trạng thái',
          BankHolder: 'Chủ tài khoản NH',
          BankAccountNo: 'Số tài khoản NH',
          BankName: 'Tên ngân hàng',
          BankLocation: 'Chi nhánh NH',
          SocialID: 'Số thẻ BHXH',
          SocialDate: 'Ngày bắt đầu BH',
          NgayKetThucBH: 'Ngày kết thúc BH',
          ShiftID: 'Ca làm việc',
          SoTheBHYT: 'Số thẻ BHYT',
          ThoiGianHuongBHYT: 'Thời gian hưởng BHYT',
          SoHopDong: 'Số hợp đồng',
          LoaiHopDong: 'Loại hợp đồng'
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

  window.APP_MODULES['WA_PERSONINFRM'] = Object.assign({}, window.APP_MODULES['WA_PERSONFULLFRM'], {
    FormName: 'WA_PersonInFrm',
    HideAddBtn: false,
    HideEditBtn: false,
    HideDeleteBtn: false,
    AllowDblClickToView: false,
    HideDetailTabsInModal: false
  });

  window.APP_MODULES['WA_PERSONQUITFRM'] = Object.assign({}, window.APP_MODULES['WA_PERSONFULLFRM'], {
    FormName: 'WA_PersonQuitFrm',
    HideAddBtn: false,
    HideEditBtn: false,
    HideDeleteBtn: false,
    AllowDblClickToView: false,
    HideDetailTabsInModal: false,
    SplitLayoutSelectText: 'Vui lòng chọn nhân viên đã nghỉ việc để xem chi tiết',
    SplitLayoutEmptyText: 'Không có chi tiết hồ sơ',
    DetailTabs: [
      window.APP_MODULES['WA_PERSONFULLFRM'].DetailTabs[0],
      window.APP_MODULES['WA_PERSONFULLFRM'].DetailTabs[1],
      window.APP_MODULES['WA_PERSONFULLFRM'].DetailTabs[3],
      window.APP_MODULES['WA_PERSONFULLFRM'].DetailTabs[4]
    ]
  });

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

  window.APP_MODULES['WA_BAOHIEMFRM'] = {
    FormName: 'WA_BaoHiemFrm',
    PrimaryKey: 'DocumentID',
    UseSplitLayout: true,
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
      { name: 'Notes', label: 'Ghi chú', required: false, showInAdd: true, showInEdit: true, isReadOnlyEdit: false, position: 'grid', orderNo: 5 }
    ],
    DetailTabs: [
      {
        label: 'Chi tiết đóng bảo hiểm',
        api: 'API_BaoHiem_Detail',
        filterField: 'DocumentID',
        editable: true,
        fields: ['PersonID', 'PersonName', 'ChucDanhChuyenMon', 'PhongBan', 'MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD', 'GhiChu'],
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

  window.APP_MODULES['WA_HOPDONGLAODONGFRM'] = {
    FormName: 'WA_HopDongLaoDongFrm',
    PrimaryKey: 'MaHopDong',
    UseSplitLayout: true,
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
      { name: 'PersonStatus', label: 'Trạng thái NV' },
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
        fields: ['MaPhuCap', 'TenPhuCap', 'TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'GhiChu'],
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
