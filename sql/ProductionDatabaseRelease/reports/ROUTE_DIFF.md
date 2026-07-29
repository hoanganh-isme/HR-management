# So sánh WA_API theo List + Func

Route phức tạp giữ nguyên. Route framework/caller test-only chỉ cutover khi procedure hiện tại thuộc known original/repository và luôn backup trước.

| List | Func | OriginalCount | TestCount | OriginalProcedure | TestProcedure | ParaChanged | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API_BangPhuCap | Execute | 1 | 1 | API_BangPhuCap | API_BangPhuCap | false | UNCHANGED |
| API_BangPhuCap_Detail | Delete | 1 | 1 | API_XoaDong | API_XoaDong | true | CHANGED |
| API_BangPhuCap_Detail | Save | 1 | 1 | API_LuuDong | API_LuuDong | false | UNCHANGED |
| API_BangPhuCap_Detail | View | 1 | 1 | API_BangPhuCap_Detail | API_BangPhuCap_Detail | false | UNCHANGED |
| API_BangThamSo | Execute | 1 | 1 | API_BangThamSo | API_BangThamSo | false | UNCHANGED |
| API_BangThueTNCN | Execute | 0 | 1 |  | API_BangThueTNCN | false | TEST_ONLY |
| API_BangThueTNCN_V2 | Execute | 0 | 1 |  | API_BangThueTNCN_V2 | false | TEST_ONLY |
| API_BaoCaoChamCong | Execute | 1 | 1 | API_BaoCaoChamCong | API_BaoCaoChamCong | false | UNCHANGED |
| API_BaoCaoChamCongTongHop | Execute | 1 | 1 | API_BaoCaoChamCongTongHop | API_BaoCaoChamCongTongHop | false | UNCHANGED |
| API_BaoHiem_Detail | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_BaoHiem_Detail | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_BaoHiem_Detail | View | 0 | 1 |  | API_BaoHiem_Detail | false | TEST_ONLY |
| API_CaLamViec | Execute | 0 | 1 |  | API_CaLamViec | false | TEST_ONLY |
| API_CaLamViec_ChiTiet | Execute | 0 | 1 |  | API_CaLamViec_ChiTiet | false | TEST_ONLY |
| API_CaLamViec_ChiTiet | View | 1 | 1 | API_CaLamViec_ChiTiet | API_CaLamViec_ChiTiet | false | UNCHANGED |
| API_CaLamViec_NhanVien | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| API_CaLamViec_NhanVien | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| API_CaLamViec_NhanVien | View | 1 | 1 | API_CaLamViec_NhanVien | API_CaLamViec_NhanVien | false | UNCHANGED |
| API_Calculate_MucDong_CongDoan | View | 0 | 1 |  | API_Calculate_MucDong_CongDoan | false | TEST_ONLY |
| API_CandidateAttach | SaveAvatar | 0 | 1 |  | API_CandidateAttach_SaveAvatar | false | TEST_ONLY |
| API_CandidateAttach | View | 0 | 1 |  | API_TruyVanDong | false | TEST_ONLY |
| API_ComboPersonStatus | Execute | 0 | 1 |  | API_ComboPersonStatus | false | TEST_ONLY |
| API_ComboPersonStatus | View | 0 | 1 |  | API_ComboPersonStatus | false | TEST_ONLY |
| API_DangKyFormWeb | Execute | 0 | 1 |  | API_DangKyFormWeb | false | TEST_ONLY |
| API_DanhSachBangCap | Execute | 0 | 1 |  | API_DanhSachBangCap | false | TEST_ONLY |
| API_DanhSachBenhVien | Execute | 1 | 1 | API_DanhSachBenhVien | API_DanhSachBenhVien | false | UNCHANGED |
| API_DanhSachBoPhan | View | 1 | 1 | API_DanhSachBoPhan | API_DanhSachBoPhan | false | UNCHANGED |
| API_DanhSachCaLamViec | Execute | 1 | 1 | API_DanhSachCaLamViec | API_DanhSachCaLamViec | false | UNCHANGED |
| API_DanhSachCaLamViecChiNhanh | Execute | 1 | 1 | API_DanhSachCaLamViecChiNhanh | API_DanhSachCaLamViecChiNhanh | false | UNCHANGED |
| API_DanhSachChiNhanh | Execute | 1 | 1 | API_DanhSachChiNhanh | API_DanhSachChiNhanh | true | CHANGED |
| API_DanhSachChiNhanh | View | 1 | 1 | API_DanhSachChiNhanh | API_DanhSachChiNhanh | true | CHANGED |
| API_DanhSachChucDanh | Execute | 0 | 1 |  | API_DanhSachChucDanh | false | TEST_ONLY |
| API_DanhSachChucDanh | View | 0 | 1 |  | API_DanhSachChucDanh | false | TEST_ONLY |
| API_DanhSachChucVu | Execute | 1 | 1 | API_DanhSachChucVu | API_DanhSachChucVu | false | UNCHANGED |
| API_DanhSachChucVu | View | 0 | 1 |  | API_DanhSachChucVu | false | TEST_ONLY |
| API_DanhSachCongViec | Execute | 1 | 1 | API_DanhSachCongViec | API_DanhSachCongViec | false | UNCHANGED |
| API_DanhSachDanToc | Execute | 1 | 1 | API_DanhSachDanToc | API_DanhSachDanToc | false | UNCHANGED |
| API_DanhSachHinhThucNghi | Execute | 1 | 1 | API_DanhSachHinhThucNghi | API_DanhSachHinhThucNghi | false | UNCHANGED |
| API_DanhSachHocVan | Execute | 1 | 1 | API_DanhSachHocVan | API_DanhSachHocVan | false | UNCHANGED |
| API_DanhSachLoaiHD | Execute | 1 | 1 | API_DanhSachLoaiHD | API_DanhSachLoaiHD | false | UNCHANGED |
| API_DanhSachMenu | Execute | 0 | 1 |  | API_DanhSachMenu | false | TEST_ONLY |
| API_DanhSachNganHang | Execute | 1 | 1 | API_DanhSachNganHang | API_DanhSachNganHang | false | UNCHANGED |
| API_DanhSachNgheNghiep | Execute | 1 | 1 | API_DanhSachNgheNghiep | API_DanhSachNgheNghiep | false | UNCHANGED |
| API_DanhSachQuocGia | Execute | 1 | 1 | API_DanhSachQuocGia | API_DanhSachQuocGia | false | UNCHANGED |
| API_DanhSachTaiKhoan | Execute | 0 | 1 |  | API_DanhSachTaiKhoan | false | TEST_ONLY |
| API_DanhSachTinhThanh | Execute | 1 | 1 | API_DanhSachTinhThanh | API_DanhSachTinhThanh | false | UNCHANGED |
| API_DanhSachTonGiao | Execute | 1 | 1 | API_DanhSachTonGiao | API_DanhSachTonGiao | false | UNCHANGED |
| API_DanhSachToNhom | Execute | 1 | 1 | API_DanhSachToNhom | API_DanhSachToNhom | false | UNCHANGED |
| API_DanhSachViTri | Execute | 1 | 1 | API_DanhSachViTri | API_DanhSachViTri | false | UNCHANGED |
| API_DongBoQuyenTruyCap | Execute | 1 | 1 | API_DongBoQuyenTruyCap | API_DongBoQuyenTruyCap | false | UNCHANGED |
| API_DongBoTruongGiaoDien | Execute | 1 | 1 | API_DongBoTruongGiaoDien | API_DongBoTruongGiaoDien | true | CHANGED |
| API_Dropdown_ReportTemplates | View | 0 | 1 |  | API_Dropdown_ReportTemplates | false | TEST_ONLY |
| API_HopDongLaoDong | Execute | 0 | 1 |  | API_HopDongLaoDong | false | TEST_ONLY |
| API_HopDongLaoDong_Attach | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_HopDongLaoDong_Attach | Save | 0 | 1 |  | API_HopDongLaoDong_Attach_Save | false | TEST_ONLY |
| API_HopDongLaoDong_Attach | View | 0 | 1 |  | API_HopDongLaoDong_Attach | false | TEST_ONLY |
| API_HopDongLaoDong_Attach_File | Execute | 0 | 1 |  | API_HopDongLaoDong_Attach_File | false | TEST_ONLY |
| API_HopDongLaoDong_Attach_File | View | 0 | 1 |  | API_HopDongLaoDong_Attach_File | false | TEST_ONLY |
| API_HopDongLaoDong_Attach_Metadata | Execute | 0 | 1 |  | API_HopDongLaoDong_Attach_Metadata | false | TEST_ONLY |
| API_HopDongLaoDong_Attach_Metadata | View | 0 | 1 |  | API_HopDongLaoDong_Attach_Metadata | false | TEST_ONLY |
| API_HopDongLaoDong_Attach_Save | Execute | 0 | 1 |  | API_HopDongLaoDong_Attach_Save | false | TEST_ONLY |
| API_HopDongLaoDong_ChiTiet | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_HopDongLaoDong_ChiTiet | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_HopDongLaoDong_ChiTiet | View | 0 | 1 |  | API_HopDongLaoDong_ChiTiet | false | TEST_ONLY |
| API_HopDongLaoDong_LoaiHD | View | 0 | 1 |  | API_HopDongLaoDong_LoaiHD | false | TEST_ONLY |
| API_HopDongLaoDong_NamLap | View | 0 | 1 |  | API_HopDongLaoDong_NamLap | false | TEST_ONLY |
| API_HoSoNhanVien | Execute | 1 | 1 | API_HoSoNhanVien | API_HoSoNhanVien | true | CHANGED |
| API_HoSoNhanVien_T1_Luong | View | 1 | 1 | API_HoSoNhanVien_T1_Luong | API_HoSoNhanVien_T1_Luong | false | UNCHANGED |
| API_HoSoNhanVien_T2_PhuCap | View | 1 | 1 | API_HoSoNhanVien_T2_PhuCap | API_HoSoNhanVien_T2_PhuCap | false | UNCHANGED |
| API_HoSoNhanVien_T3_KTKL | View | 1 | 1 | API_HoSoNhanVien_T3_KTKL | API_HoSoNhanVien_T3_KTKL | false | UNCHANGED |
| API_HoSoNhanVien_T4_NghiPhep | View | 1 | 1 | API_HoSoNhanVien_T4_NghiPhep | API_HoSoNhanVien_T4_NghiPhep | false | UNCHANGED |
| API_HoSoNhanVien_T5_GiaCanh | View | 1 | 1 | API_HoSoNhanVien_T5_GiaCanh | API_HoSoNhanVien_T5_GiaCanh | false | UNCHANGED |
| API_HoSoNhanVien_T6_HopDong | View | 1 | 1 | API_HoSoNhanVien_T6_HopDong | API_HoSoNhanVien_T6_HopDong | false | UNCHANGED |
| API_HoSoNhanVien_T7_CongTac | View | 1 | 1 | API_HoSoNhanVien_T7_CongTac | API_HoSoNhanVien_T7_CongTac | false | UNCHANGED |
| API_HoSoNhanVien_T8_CongViec | View | 1 | 1 | API_HoSoNhanVien_T8_CongViec | API_HoSoNhanVien_T8_CongViec | false | UNCHANGED |
| API_HoSoNhanVien_T9_GiayTo | View | 1 | 1 | API_HoSoNhanVien_T9_GiayTo | API_HoSoNhanVien_T9_GiayTo | false | UNCHANGED |
| API_HoSoNhanVienIn | Execute | 0 | 1 |  | API_HoSoNhanVienIn | false | TEST_ONLY |
| API_HoSoNhanVienQuit | Execute | 0 | 1 |  | API_HoSoNhanVienQuit | false | TEST_ONLY |
| API_HR_Dashboard_Birthdays | Execute | 0 | 1 |  | API_HR_Dashboard_Birthdays | false | TEST_ONLY |
| API_HR_Dashboard_ContractsExpiring | Execute | 0 | 1 |  | API_HR_Dashboard_ContractsExpiring | false | TEST_ONLY |
| API_HR_Dashboard_Demographics | Execute | 0 | 1 |  | API_HR_Dashboard_Demographics | false | TEST_ONLY |
| API_HR_Dashboard_Department | Execute | 0 | 1 |  | API_HR_Dashboard_Department | false | TEST_ONLY |
| API_HR_Dashboard_GetBranches | Execute | 0 | 1 |  | API_HR_Dashboard_GetBranches | false | TEST_ONLY |
| API_HR_Dashboard_OverviewToday | Execute | 0 | 1 |  | API_HR_Dashboard_OverviewToday | false | TEST_ONLY |
| API_HR_Dashboard_Payroll | Execute | 0 | 1 |  | API_HR_Dashboard_Payroll | false | TEST_ONLY |
| API_HR_DropdownShifts | View | 1 | 1 | API_HR_DropdownShifts | API_HR_DropdownShifts | false | UNCHANGED |
| API_HR_GetForm | Execute | 0 | 1 |  | API_HR_GetForm | false | TEST_ONLY |
| API_HR_NghiPhep | Execute | 0 | 1 |  | API_HR_NghiPhep | false | TEST_ONLY |
| API_HR_NghiPhep_Attach | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_HR_NghiPhep_Attach | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_HR_NghiPhep_Attach | View | 0 | 1 |  | API_HR_NghiPhep_Attach | false | TEST_ONLY |
| API_HR_NghiPhep_Attach_File | Execute | 0 | 1 |  | API_HR_NghiPhep_Attach_File | false | TEST_ONLY |
| API_HR_NghiPhep_Attach_Metadata | Execute | 0 | 1 |  | API_HR_NghiPhep_Attach_Metadata | false | TEST_ONLY |
| API_HR_NghiPhep_Attach_Save | Execute | 0 | 1 |  | API_HR_NghiPhep_Attach_Save | false | TEST_ONLY |
| API_HR_NghiPhep_ChiTiet | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_HR_NghiPhep_ChiTiet | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_HR_NghiPhep_ChiTiet | View | 0 | 1 |  | API_HR_NghiPhep_ChiTiet | false | TEST_ONLY |
| API_KinhPhiCongDoan | Execute | 0 | 1 |  | API_KinhPhiCongDoan | false | TEST_ONLY |
| API_KinhPhiCongDoan_PersonList | Execute | 0 | 1 |  | API_KinhPhiCongDoan_PersonList | false | TEST_ONLY |
| API_LayCacTruongGiaoDien | Execute | 0 | 1 |  | API_LayCacTruongGiaoDien | false | TEST_ONLY |
| API_LayDanhSachMenuTatCa | Execute | 0 | 1 |  | API_LayDanhSachMenuTatCa | false | TEST_ONLY |
| API_LayDanhSachNhom | Execute | 0 | 1 |  | API_LayDanhSachNhom | false | TEST_ONLY |
| API_LayGiaTriSetup | Execute | 0 | 1 |  | API_LayGiaTriSetup | false | TEST_ONLY |
| API_LayMenuTheoNhomQuyen | Execute | 0 | 1 |  | API_LayMenuTheoNhomQuyen | false | TEST_ONLY |
| API_LayPhienBanQuyen | Execute | 0 | 1 |  | API_LayPhienBanQuyen | false | TEST_ONLY |
| API_LayQuyenCuaToi | Execute | 0 | 1 |  | API_LayQuyenCuaToi | false | TEST_ONLY |
| API_LayQuyenNhomDayDu | Execute | 0 | 1 |  | API_LayQuyenNhomDayDu | false | TEST_ONLY |
| API_LuongKhoan | Execute | 1 | 1 | API_LuongKhoan | API_LuongKhoan | false | UNCHANGED |
| API_LuuDong_V2 | Execute | 0 | 1 |  | API_LuuDong_V2 | false | TEST_ONLY |
| API_LuuMenu | Execute | 0 | 1 |  | API_LuuMenu | false | TEST_ONLY |
| API_LuuQuyenCuaNhom | Execute | 0 | 1 |  | API_LuuQuyenCuaNhom | false | TEST_ONLY |
| API_NguoiDungNhomFrm | Execute | 0 | 1 |  | API_NguoiDungNhomFrm | false | TEST_ONLY |
| API_Payroll | Execute | 1 | 1 | API_Payroll | API_Payroll | false | UNCHANGED |
| API_Payroll_Detail | View | 1 | 1 | API_Payroll_Detail | API_Payroll_Detail | false | UNCHANGED |
| API_PersonAttach | SaveAvatar | 0 | 1 |  | API_PersonAttach_SaveAvatar | false | TEST_ONLY |
| API_PersonAttach | View | 0 | 1 |  | API_TruyVanDong | false | TEST_ONLY |
| API_PersonAttach_SaveAvatar | Execute | 0 | 1 |  | API_PersonAttach_SaveAvatar | false | TEST_ONLY |
| API_PersonFull_T1_Salary | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T1_Salary | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T1_Salary | View | 1 | 1 | API_PersonFull_T1_Salary | API_PersonFull_T1_Salary | false | UNCHANGED |
| API_PersonFull_T2_Allowance | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T2_Allowance | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T2_Allowance | View | 1 | 1 | API_PersonFull_T2_Allowance | API_PersonFull_T2_Allowance | false | UNCHANGED |
| API_PersonFull_T3_KTKL | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T3_KTKL | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T3_KTKL | View | 1 | 1 | API_PersonFull_T3_KTKL | API_PersonFull_T3_KTKL | false | UNCHANGED |
| API_PersonFull_T4_NghiPhep | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T4_NghiPhep | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T4_NghiPhep | View | 1 | 1 | API_PersonFull_T4_NghiPhep | API_PersonFull_T4_NghiPhep | false | UNCHANGED |
| API_PersonFull_T5_Relation | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T5_Relation | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T5_Relation | View | 1 | 1 | API_PersonFull_T5_Relation | API_PersonFull_T5_Relation | false | UNCHANGED |
| API_PersonFull_T6_HopDong | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T6_HopDong | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T6_HopDong | View | 1 | 1 | API_PersonFull_T6_HopDong | API_PersonFull_T6_HopDong | false | UNCHANGED |
| API_PersonFull_T7_CongTac | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T7_CongTac | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T7_CongTac | View | 1 | 1 | API_PersonFull_T7_CongTac | API_PersonFull_T7_CongTac | false | UNCHANGED |
| API_PersonFull_T8_Log | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T8_Log | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T8_Log | View | 1 | 1 | API_PersonFull_T8_Log | API_PersonFull_T8_Log | false | UNCHANGED |
| API_PersonFull_T9_GiayTo | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| API_PersonFull_T9_GiayTo | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| API_PersonFull_T9_GiayTo | View | 1 | 1 | API_PersonFull_T9_GiayTo | API_PersonFull_T9_GiayTo | false | UNCHANGED |
| API_QuanLyNghiPhepNam_ChiTiet | View | 1 | 1 | API_QuanLyNghiPhepNam_ChiTiet | API_QuanLyNghiPhepNam_ChiTiet | false | UNCHANGED |
| API_QuanLyUngVien | Execute | 1 | 1 | API_QuanLyUngVien | API_QuanLyUngVien | false | UNCHANGED |
| API_QuanLyUngVien_ChungChi | View | 1 | 1 | API_QuanLyUngVien_ChungChi | API_QuanLyUngVien_ChungChi | false | UNCHANGED |
| API_QuanLyUngVien_HocVan | View | 1 | 1 | API_QuanLyUngVien_HocVan | API_QuanLyUngVien_HocVan | false | UNCHANGED |
| API_QuanLyUngVien_KinhNghiem | View | 1 | 1 | API_QuanLyUngVien_KinhNghiem | API_QuanLyUngVien_KinhNghiem | false | UNCHANGED |
| API_QuanLyUngVien_PhongVan | View | 1 | 1 | API_QuanLyUngVien_PhongVan | API_QuanLyUngVien_PhongVan | false | UNCHANGED |
| API_TheoDoiTaiNguyenFormWeb | Execute | 0 | 1 |  | API_TheoDoiTaiNguyenFormWeb | false | TEST_ONLY |
| API_TruyVanDong_V2 | Execute | 0 | 1 |  | API_TruyVanDong_V2 | false | TEST_ONLY |
| API_Web_CutoverSafeFieldContractsV2 | Execute | 0 | 1 |  | API_Web_CutoverSafeFieldContractsV2 | false | TEST_ONLY |
| API_Web_DiscoverFieldContractCandidatesV2 | Execute | 0 | 1 |  | API_Web_DiscoverFieldContractCandidatesV2 | false | TEST_ONLY |
| API_Web_FieldContractResolveV2 | Execute | 0 | 1 |  | API_Web_FieldContractResolveV2 | false | TEST_ONLY |
| API_Web_FieldContractResolveV2 | View | 0 | 1 |  | API_Web_FieldContractResolveV2 | false | TEST_ONLY |
| API_Web_GridFieldCompareV2 | Execute | 0 | 1 |  | API_Web_GridFieldCompareV2 | false | TEST_ONLY |
| API_Web_GridFieldCompareV2 | View | 0 | 1 |  | API_Web_GridFieldCompareV2 | false | TEST_ONLY |
| API_Web_GridFieldSchemaV2 | Execute | 0 | 1 |  | API_Web_GridFieldSchemaV2 | false | TEST_ONLY |
| API_Web_GridFieldSchemaV2 | View | 0 | 1 |  | API_Web_GridFieldSchemaV2 | false | TEST_ONLY |
| API_Web_JoinFieldSchemaV2 | Execute | 0 | 1 |  | API_Web_JoinFieldSchemaV2 | false | TEST_ONLY |
| API_Web_JoinFieldSchemaV2 | View | 0 | 1 |  | API_Web_JoinFieldSchemaV2 | false | TEST_ONLY |
| API_Web_LookupSchemaV2 | Execute | 0 | 1 |  | API_Web_LookupSchemaV2 | false | TEST_ONLY |
| API_Web_LookupSchemaV2 | View | 0 | 1 |  | API_Web_LookupSchemaV2 | false | TEST_ONLY |
| API_Web_RollbackFieldContractV2 | Execute | 0 | 1 |  | API_Web_RollbackFieldContractV2 | false | TEST_ONLY |
| API_Web_SeedSafeFieldContractsV2 | Execute | 0 | 1 |  | API_Web_SeedSafeFieldContractsV2 | false | TEST_ONLY |
| API_Web_UpdateFieldFormat | Execute | 0 | 1 |  | API_Web_UpdateFieldFormat | false | TEST_ONLY |
| API_Web_UpdateFieldFormat | Save | 0 | 1 |  | API_Web_UpdateFieldFormat | false | TEST_ONLY |
| API_Web_UpdateFieldFormat | View | 0 | 1 |  | API_Web_UpdateFieldFormat | false | TEST_ONLY |
| API_XoaDong | Execute | 1 | 1 | API_XoaDong | API_XoaDong | false | UNCHANGED |
| API_XoaDong_V2 | Execute | 0 | 1 |  | API_XoaDong_V2 | false | TEST_ONLY |
| API_XoaMenu | Execute | 1 | 1 | API_XoaMenu | API_XoaMenu | false | UNCHANGED |
| CF_BranchListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| CF_BranchListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| CF_BranchListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| frmformbuilder | Delete | 1 | 1 | API_XoaTruongGiaoDien | API_XoaTruongGiaoDien | false | UNCHANGED |
| frmformbuilder | Save | 1 | 1 | API_LuuTruongGiaoDien | API_LuuTruongGiaoDien | true | CHANGED |
| frmformbuilder | View | 1 | 1 | API_DanhSachTruongGiaoDien | API_DanhSachTruongGiaoDien | true | CHANGED |
| HR_BangThamSoTbl | View | 0 | 1 |  | API_HR_BangThamSo_Lookup | false | TEST_ONLY |
| HR_BaoCaoNhanSuReport | View | 1 | 1 | HR_BaoCaoNhanSuReportStp | HR_BaoCaoNhanSuReportStp | false | UNCHANGED |
| HR_DepartmentListTbl | View | 1 | 1 | API_DanhSachBoPhan | API_DanhSachBoPhan | false | UNCHANGED |
| HR_Documents | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| HR_Documents | Edit | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| HR_Documents | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| HR_GetForm | View | 0 | 1 |  | API_HR_GetForm | false | TEST_ONLY |
| HR_HopDongAddfile | View | 0 | 1 |  | API_TruyVanDong | false | TEST_ONLY |
| HR_PayRoll_Process_Stp | View | 1 | 1 | HR_PayRoll_Process_Stp | HR_PayRoll_Process_Stp | false | UNCHANGED |
| HR_PersonTbl | View | 1 | 1 | API_HoSoNhanVien | API_HoSoNhanVien | true | CHANGED |
| HR_ShiftListCNFrm | View | 1 | 1 | API_DanhSachCaLamViecChiNhanh | API_DanhSachCaLamViecChiNhanh | false | UNCHANGED |
| SY_Period | Edit | 1 | 1 | API_LuuDong | API_LuuDong | false | UNCHANGED |
| SY_Period | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong | false | UNCHANGED |
| WA_BangCapListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_BangCapListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_BangCapListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_BangPhuCapFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong | true | CHANGED |
| WA_BangPhuCapFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong | false | UNCHANGED |
| WA_BangPhuCapFrm | View | 1 | 1 | API_BangPhuCap | API_BangPhuCap | false | UNCHANGED |
| WA_BangThamSoFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_BangThamSoFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_BangThamSoFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_BangThueTNCNFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_BangThueTNCNFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_BangThueTNCNFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_BankListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_BankListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_BankListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_BaoCaoLuongReport | View | 1 | 1 | API_BaoCaoLuong | API_BaoCaoLuong | false | UNCHANGED |
| WA_BaoCaoNghiPhepReport | View | 1 | 1 | API_BaoCaoNghiPhepReportStp | API_BaoCaoNghiPhepReportStp | true | CHANGED |
| WA_BaoCaoNhanSuReport | View | 1 | 1 | API_BaoCaoNhanSuReportStp | API_BaoCaoNhanSuReportStp | true | CHANGED |
| WA_BaoHiemFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong | true | CHANGED |
| WA_BaoHiemFrm | Save | 1 | 1 | API_LuuDong | WA_BaoHiemFrm_Save | false | CHANGED |
| WA_BaoHiemFrm | View | 1 | 1 | API_BaoHiem | API_BaoHiem | false | UNCHANGED |
| WA_BaoHiemFrm_Calculate | View | 1 | 1 | TinhBHStp | TinhBHStp | false | UNCHANGED |
| WA_BaoHiemFrm_PersonID | View | 1 | 1 | HR_BaoHiem_PersonLookup | WA_BaoHiem_PersonLookup | true | CHANGED |
| WA_CaLamViecFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_CaLamViecFrm | HR_CaLamViec_SapCaStp | 1 | 0 | HR_CaLamViec_SapCaStp |  | false | ORIGINAL_ONLY |
| WA_CaLamViecFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_CaLamViecFrm | View | 1 | 1 | API_CaLamViec | API_TruyVanDong_V2 | true | CHANGED |
| WA_CareerlListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_CareerlListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_CareerlListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_ChucDanhFrm | Delete | 0 | 1 |  | API_XoaDong_V2 | false | TEST_ONLY |
| WA_ChucDanhFrm | Save | 0 | 1 |  | API_LuuDong_V2 | false | TEST_ONLY |
| WA_ChucDanhFrm | View | 0 | 1 |  | API_TruyVanDong_V2 | false | TEST_ONLY |
| WA_DanhSachLoaiHD | View | 1 | 1 | API_DanhSachLoaiHD | API_DanhSachLoaiHD | false | UNCHANGED |
| WA_DanhSachUngVienFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_DanhSachUngVienFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_DanhSachUngVienFrm | View | 1 | 1 | API_QuanLyUngVien | API_QuanLyUngVien | false | UNCHANGED |
| WA_DepartmentListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_DepartmentListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_DepartmentListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_DonXinNghiPhepF | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_DonXinNghiPhepF | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_DonXinNghiPhepF | View | 0 | 1 |  | API_HR_NghiPhep | false | TEST_ONLY |
| WA_DonXinNghiPhepFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_DonXinNghiPhepFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_DonXinNghiPhepFrm | View | 0 | 1 |  | API_HR_NghiPhep | false | TEST_ONLY |
| WA_EducationListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_EducationListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_EducationListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_HinhThucNghiListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_HinhThucNghiListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_HinhThucNghiListFrm | View | 1 | 1 | API_TruyVanDong | API_DanhSachHinhThucNghi | true | CHANGED |
| WA_HopDongLaoDongFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_HopDongLaoDongFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_HopDongLaoDongFrm | View | 0 | 1 |  | API_HopDongLaoDong | false | TEST_ONLY |
| WA_HospitalListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_HospitalListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_HospitalListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_HR_NghiPhepFrm | Delete | 0 | 1 |  | API_XoaDong_V2 | false | TEST_ONLY |
| WA_HR_NghiPhepFrm | Save | 0 | 1 |  | API_LuuDong_V2 | false | TEST_ONLY |
| WA_HR_NghiPhepFrm | View | 0 | 1 |  | API_HR_NghiPhep | false | TEST_ONLY |
| WA_JobListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_JobListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_JobListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_KinhPhiCongDoanFrm | Delete | 0 | 1 |  | API_XoaDong_V2 | false | TEST_ONLY |
| WA_KinhPhiCongDoanFrm | Save | 0 | 1 |  | API_LuuDong_V2 | false | TEST_ONLY |
| WA_KinhPhiCongDoanFrm | View | 0 | 1 |  | API_KinhPhiCongDoan | false | TEST_ONLY |
| WA_LuongKhoanFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_LuongKhoanFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_LuongKhoanFrm | View | 1 | 1 | API_LuongKhoan | API_LuongKhoan | false | UNCHANGED |
| WA_NationListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_NationListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_NationListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_NguoiDungFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_NguoiDungFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_NguoiDungFrm | View | 0 | 1 |  | API_NguoiDungFrm | false | TEST_ONLY |
| WA_NguoiDungNhomFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_NguoiDungNhomFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_NguoiDungNhomFrm | View | 0 | 1 |  | API_NguoiDungNhomFrm | false | TEST_ONLY |
| WA_PayRoll_Process_Stp | View | 1 | 1 | WA_PayRoll_Process_Stp | WA_PayRoll_Process_Stp | false | UNCHANGED |
| WA_PayrollFrm | View | 1 | 1 | API_Payroll | API_Payroll | false | UNCHANGED |
| WA_PeopleListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_PeopleListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_PeopleListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_PersonFullFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_PersonFullFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_PersonFullFrm | View | 1 | 1 | API_HoSoNhanVien | API_HoSoNhanVien | true | CHANGED |
| WA_PositionListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_PositionListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_PositionListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_ProvinceListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_ProvinceListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_ProvinceListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_QuanLyNghiLeFrm | View | 1 | 1 | API_QuanLyNghiLe | API_QuanLyNghiLe | false | UNCHANGED |
| WA_QuanLyNghiPhepNamFrm | Delete | 0 | 1 |  | API_XoaDong | false | TEST_ONLY |
| WA_QuanLyNghiPhepNamFrm | Save | 0 | 1 |  | API_LuuDong | false | TEST_ONLY |
| WA_QuanLyNghiPhepNamFrm | View | 1 | 1 | API_QuanLyNghiPhepNam | API_QuanLyNghiPhepNam | true | CHANGED |
| WA_ReligionListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong | false | UNCHANGED |
| WA_ReligionListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong | false | UNCHANGED |
| WA_ReligionListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong | false | UNCHANGED |
| WA_ShiftListCNFrm | View | 1 | 1 | API_DanhSachCaLamViecChiNhanh | API_DanhSachCaLamViecChiNhanh | false | UNCHANGED |
| WA_ShiftListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_ShiftListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_ShiftListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_TimeSheetCTReport | View | 1 | 1 | API_BaoCaoChamCongChiTiet | API_BaoCaoChamCongChiTiet | false | UNCHANGED |
| WA_TimeSheetDay_Process_Stp | View | 1 | 1 | WA_TimeSheetDay_Process_Stp | WA_TimeSheetDay_Process_Stp | false | UNCHANGED |
| WA_TimeSheetDayFrm | View | 1 | 1 | API_XuLyChamCongHangNgay | API_XuLyChamCongHangNgay | false | UNCHANGED |
| WA_TimeSheetFrm | HR_PayRoll_Process_Stp | 2 | 2 | HR_PayRoll_Process_Stp | HR_PayRoll_Process_Stp | false | DUPLICATE |
| WA_TimeSheetFrm | View | 2 | 2 | API_TruyVanDong | API_TruyVanDong | false | DUPLICATE |
| WA_TimeSheetTH2Report | View | 1 | 1 | API_BaoCaoChamCongTongHop | API_BaoCaoChamCongTongHop | true | CHANGED |
| WA_TitleListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_TitleListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_TitleListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
| WA_WorkingGroupListFrm | Delete | 1 | 1 | API_XoaDong | API_XoaDong_V2 | true | CHANGED |
| WA_WorkingGroupListFrm | Save | 1 | 1 | API_LuuDong | API_LuuDong_V2 | true | CHANGED |
| WA_WorkingGroupListFrm | View | 1 | 1 | API_TruyVanDong | API_TruyVanDong_V2 | true | CHANGED |
