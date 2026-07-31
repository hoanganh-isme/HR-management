# Manual review required

- Không có BLOCKING_MISSING_DEPENDENCY sau khi loại reference từ file test và phân biệt function nội bộ với WA_API route.

- API_BaoHiem_PersonLookup và WA_BaoHiem_PersonLookup phải so sánh contract/caller/permission; release giữ API production và không merge theo tên.
- VNPT eContract test-only không deploy vì source hiện tại không có caller trực tiếp; không seed secret/config test.

| ObjectName | Decision | CanonicalSource | ManualReviewReason | Reason |
| --- | --- | --- | --- | --- |
| API_BangChamCongTongHop | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BangPhuCap | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BangPhuCap_Detail | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_BangThamSo | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BangThueTNCN | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BangThueTNCN_V2 | DEPRECATE_NOT_DEPLOY | NONE | MONITOR_BEFORE_DROP | Prototype V2 đã được generic API_TruyVanDong_V2 thay thế; không deploy và chưa drop. |
| API_BaoCaoChamCong | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoCaoChamCongChiTiet | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoCaoChamCongTongHop | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoCaoLuong | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoCaoNghiPhepReportStp | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoCaoNhanSuReportStp | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoHiem | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_BaoHiem_Detail | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_BaoHiem_PersonLookup | KEEP_ORIGINAL | DB_ORIGINAL | COMPARE_WITH_WA_BaoHiem_PersonLookup_BEFORE_ANY_MERGE | API bảo hiểm original-only thuộc nghiệp vụ deferred; không suy diễn thay thế theo tên gần giống. |
| API_CaLamViec | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_CaLamViec_ChiTiet | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_CaLamViec_NhanVien | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_ComboFormatID | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_ComboFormPosition | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_DangKyFormWeb | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_DanhSachBangCap | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachBenhVien | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachBoPhan | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachCaLamViec | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachChiNhanh | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_DanhSachCongViec | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachDanToc | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachHocVan | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachLoaiHD | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachMenu | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachNganHang | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachNgheNghiep | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachQuocGia | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachTinhThanh | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachTonGiao | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachToNhom | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DanhSachTruongGiaoDien | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_DanhSachViTri | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_DongBoQuyenTruyCap | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_DongBoTruongGiaoDien | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_Gateway_Router | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_HopDongLaoDong_Attach_File | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HopDongLaoDong_Attach_Metadata | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HopDongLaoDong_Attach_Save | KEEP_TEST | DB_TEST | NO_REPOSITORY_CANONICAL_DEFINITION | Backend contract document gọi route Save; dependency đã được lấy từ DB test. |
| API_HopDongLaoDong_NhanVienChuaCoHD | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_HoSoNhanVien | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T1_Luong | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T2_PhuCap | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T3_KTKL | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T4_NghiPhep | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T5_GiaCanh | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T7_CongTac | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T8_CongViec | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVien_T9_GiayTo | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_HoSoNhanVienIn | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HoSoNhanVienQuit | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HR_DropdownShifts | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_HR_NghiPhep | KEEP_TEST | DB_TEST | NO_REPOSITORY_CANONICAL_DEFINITION | WA_DonXinNghiPhepFrm gọi procedure qua route test-only; package giữ nguồn test rõ ràng. |
| API_HR_NghiPhep_Attach | KEEP_TEST | DB_TEST | NO_REPOSITORY_CANONICAL_DEFINITION | Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng. |
| API_HR_NghiPhep_Attach_File | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HR_NghiPhep_Attach_Metadata | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_HR_NghiPhep_Attach_Save | KEEP_TEST | DB_TEST | NO_REPOSITORY_CANONICAL_DEFINITION | Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng. |
| API_HR_NghiPhep_ChiTiet | KEEP_TEST | DB_TEST | NO_REPOSITORY_CANONICAL_DEFINITION | Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng. |
| API_KinhPhiCongDoan_PersonList | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_LayCacTruongGiaoDien | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayDanhSachMenuTatCa | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayDanhSachNhom | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayGiaTriSetup | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayMenuTheoNhomQuyen | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayPhienBanQuyen | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LayQuyenNhomDayDu | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LuongKhoan | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_LuuCauHinhForm | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_LuuHopDong | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_LuuMenu | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LuuQuyenCuaNhom | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_LuuQuyenToan | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_LuuTaiKhoan | REVIEW_REQUIRED | REPOSITORY | REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER | Repository có definition nhưng không có bằng chứng runtime active. |
| API_LuuTruongGiaoDien | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_Payroll | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_Payroll_Detail | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_PersonFull_T1_Salary | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_QuanLyNghiLe | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_QuanLyNghiPhepNam | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_QuanLyNghiPhepNam_ChiTiet | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_QuanLyUngVien | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
| API_QuanLyUngVien_ChungChi | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_QuanLyUngVien_HocVan | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_QuanLyUngVien_KinhNghiem | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_QuanLyUngVien_PhongVan | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_TheoDoiTaiNguyenFormWeb | REVIEW_REQUIRED | DB_TEST | TEST_ONLY_WITHOUT_ACTIVE_CALLER | Object test-only chưa có đủ bằng chứng để đưa vào production. |
| API_XoaMenu | MERGE_REQUIRED | DB_ORIGINAL | CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED | Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER. |
| API_XuLyChamCongHangNgay | KEEP_ORIGINAL | DB_ORIGINAL | TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL | Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review. |
