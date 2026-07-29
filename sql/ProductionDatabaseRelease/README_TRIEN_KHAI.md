
# Triển khai Production Database Release

## Phạm vi và nguồn so sánh

Package được audit từ DB gốc `X26DIMTUTAC` trong `SchemaDataGoc.sql` và DB test `X26DIM_TT` trong `Schemadatatest.sql`. Parser đọc ZIP/UTF-16 LE theo stream, không chạy dump và không copy business data.

Canonical source được chọn theo thứ tự trách nhiệm: repository cho Unified Field Contract, CRUD V2, API_Web, Dashboard và dependency backend; DB gốc cho ERP/business/custom/report/legacy; DB test chỉ khi có caller/dependency hiện tại và không có canonical repository. Mỗi object deploy chỉ có một source trong manifest.

## Kết quả audit

- DB gốc: 57 table, 139 view, 165 stored procedure (87 API_).
- DB test: 63 table, 140 view, 217 stored procedure (139 API_).
- Object canonical deploy: 49 table/function/procedure; build manifest ghi 50 canonical DDL definition khi tính thêm index control.
- Decision count: COMPATIBILITY_KEEP=3, DEPRECATE_NOT_DEPLOY=1, KEEP_ORIGINAL=55, KEEP_REPOSITORY=45, KEEP_TEST=5, MERGE_REQUIRED=29, REVIEW_REQUIRED=16.
- Compatibility giữ nguyên: API_TruyVanDong, API_LuuDong, API_XoaDong.
- Business API original-only, report và form complex/deferred không bị cutover.
- VNPT eContract test-only không deploy/không seed secret do chưa có caller runtime trực tiếp.
- Cần review: API_BangPhuCap_Detail, API_BaoHiem_Detail, API_CaLamViec, API_CaLamViec_ChiTiet, API_CaLamViec_NhanVien, API_ComboFormatID, API_ComboFormPosition, API_DangKyFormWeb, API_DanhSachChiNhanh, API_DanhSachTruongGiaoDien, API_DongBoQuyenTruyCap, API_DongBoTruongGiaoDien, API_Gateway_Router, API_HopDongLaoDong_Attach_File, API_HopDongLaoDong_Attach_Metadata, API_HopDongLaoDong_NhanVienChuaCoHD, API_HoSoNhanVienIn, API_HoSoNhanVienQuit, API_HR_DropdownShifts, API_HR_NghiPhep_Attach_File, API_HR_NghiPhep_Attach_Metadata, API_KinhPhiCongDoan_PersonList, API_LayCacTruongGiaoDien, API_LayDanhSachMenuTatCa, API_LayDanhSachNhom, API_LayGiaTriSetup, API_LayMenuTheoNhomQuyen, API_LayPhienBanQuyen, API_LayQuyenNhomDayDu, API_LuuCauHinhForm, API_LuuHopDong, API_LuuMenu, API_LuuQuyenCuaNhom, API_LuuQuyenToan, API_LuuTaiKhoan, API_LuuTruongGiaoDien, API_Payroll_Detail, API_PersonFull_T1_Salary, API_QuanLyNghiPhepNam_ChiTiet, API_QuanLyUngVien_ChungChi, API_QuanLyUngVien_HocVan, API_QuanLyUngVien_KinhNghiem, API_QuanLyUngVien_PhongVan, API_TheoDoiTaiNguyenFormWeb, API_XoaMenu.

## Nhóm object triển khai

- Object control mới: `WA_FieldContractRegistry`, `WA_FieldDatasetRegistry`, `WA_FieldContractRouteBackup`, `WA_DatabaseReleaseHistory`; chỉ tạo khi chưa tồn tại và không chứa business data.
- Framework/repository: generic CRUD V2, Unified Field Contract/API_Web, Dashboard và các dependency hiện được backend/frontend gọi. Danh sách cùng hash nằm trong `object-manifest.json`.
- Nguồn DB test được duyệt: `API_HR_NghiPhep`, `API_HR_NghiPhep_Attach`, `API_HR_NghiPhep_Attach_Save`, `API_HR_NghiPhep_ChiTiet`, `API_HopDongLaoDong_Attach_Save`.
- DB gốc giữ nguyên 55 API business/ERP/report; đặc biệt `API_BaoHiem_PersonLookup` không bị thay bằng object gần tên. Chi tiết ở `API_DECISION_MATRIX.md`.
- Không deploy: `API_BangThueTNCN_V2`, prototype/test-only chưa có caller, và VNPT eContract chưa có bằng chứng runtime trực tiếp. Không object nào bị DROP trong INSTALL_ALL.

## Backup và chạy

1. Tạo full backup và kiểm tra khả năng restore của DB production trước rollout.
2. Mở SQL Server Management Studio, bật **Query > SQLCMD Mode**.
3. Mở `generated/HRM_DATABASE_INSTALL_ALL.sql`; đổi `:setvar TargetDatabase "X26DIMTUTAC"` nếu clone dùng tên khác.
4. Giữ `:setvar ReleaseMode "PRODUCTION"` cho production; chạy toàn file. Precheck sẽ dừng nếu sai DB/system DB/core baseline/route duplicate/dependency.
5. Chạy `generated/HRM_DATABASE_VERIFY_ALL.sql`. Kết quả cuối là PASS, PASS_WITH_REVIEW hoặc FAIL.
6. Nếu cần rollback route/object, chạy `generated/HRM_DATABASE_ROLLBACK_ALL.sql` trên đúng DB. Rollback không xóa business data, không drop bảng registry có dữ liệu và không restore database.
7. Không chạy `HRM_DATABASE_DROP_CANDIDATES.sql` trong cùng ngày rollout. File mặc định chỉ SELECT/PRINT; DROP đều comment.

## WA_API, backend và môi trường

Kiểm tra result set route theo List + Func, duplicate, procedure target và Para trong VERIFY_ALL. Cutover chỉ áp dụng contract SHADOW đã audit, backup trước, transaction/idempotent và từ chối custom route không thuộc known legacy/V2.

Sau verify thành công, restart backend. Backend direct SQL cần `SQL_SERVER`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD`; tùy môi trường có `SQL_PORT`, `SQL_ENCRYPT`, `SQL_TRUST_SERVER_CERTIFICATE`, `SQL_POOL_MAX`, `SQL_CONNECT_TIMEOUT_MS`, `SQL_REQUEST_TIMEOUT_MS`. Contract document gateway cần `SQL_API_BASE` và production cần `DRAFT_SIGNING_SECRET`; không đưa secret vào installer.

## Checklist monitoring

- Theo dõi lỗi gateway/backend và SQL timeout/deadlock.
- Kiểm tra Dashboard, metadata, Bulk Import, Unified Contract, lookup/filter/master-detail.
- Kiểm tra Bảo hiểm, Hồ sơ nhân viên, Hợp đồng lao động vẫn dùng business/legacy route.
- So sánh row count bảng nhân sự/lương/hợp đồng/bảo hiểm/chấm công trước và sau.
- Kiểm tra attachment/document và quyền theo chi nhánh.
- Giữ snapshot route cho đến hết thời gian monitoring; chỉ xem xét DROP sau phê duyệt thủ công.
