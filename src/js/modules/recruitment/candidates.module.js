(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_DanhSachUngVienFrm',
    base: 'dynamic-crud',
    config: {
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
    }
  }));
})();

