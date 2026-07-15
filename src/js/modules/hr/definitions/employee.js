(function (global) {
  var definitions = global.HRModuleDefinitions = global.HRModuleDefinitions || {};
  definitions.employee = definitions.employee || {};
    definitions.employee['WA_PERSONFULLFRM'] = {
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



  definitions.employee['WA_DANHSACHUNGVIENFRM'] = {
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
})(window);

