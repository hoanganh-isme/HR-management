# Báo cáo hiện trạng Phase 1

Ngày audit: 17/07/2026. Nhánh làm việc: `refactor/hr-cleanup`. Mốc trước khi sửa: `bd041d4ff9b20a5fb31f76ed3ae17bd6a655beb8`. Nhánh bảo toàn đã tạo: `backup/refactor-hr-cleanup-before-field-sync-phase1-20260717`.

## Nguồn đã kiểm tra

- Toàn bộ 189 file `.sql` trong thư mục `sql/`.
- Repo hiện không có `sql/Modules/`, `sql/install-order.txt`, file `verify*` hoặc `rollback*`; hai file `Combined_API.sql` và `Combined_Insert_Temp.sql` đã được đưa vào inventory.
- Dump UTF-16LE `scriptdataa.sql` từ `scriptdataa.zip`; SHA-256 archive: `2F93ECCF67DB05CD81A99E684E989517FDC9E168790F4122BF8DAA59783C267A`.
- Gói ERP `NhanSu2.zip`; SHA-256: `3D3BCF247B69AB5A01E532500A5A4D1F8324CBD15006CFB738A479880DB4DCE9`.
- Artifact ERP tìm thấy: `HR_ChucDanhFrm.dat` và hai bản `HR_BangThueTNCNFrm.dat` trong các profile layout.

## Hiện trạng legacy

`DynamicFormEngine` đang nhận một danh sách từ `API_LayCacTruongGiaoDien` và dùng chung cho Grid/Add/Edit/Filter. Bốn runtime SP trực tiếp đọc `SY_FormatFields` là:

1. `API_TruyVanDong`.
2. `API_LayCacTruongGiaoDien`.
3. `API_DanhSachTruongGiaoDien`.
4. `API_LuuTruongGiaoDien` (vừa đọc vừa ghi).

Scanner bảo thủ ghi nhận 38 file có đọc, 70 file có ghi và 31 file có thao tác xóa nhắm tới `SY_FormatFields`; các nhóm có thể giao nhau. Danh sách từng file và mức rủi ro nằm trong `01_SQL_DEPENDENCY_INVENTORY.csv`.

## Kết quả triển khai local

- Đã tạo 6 script SQL V2, không thay đổi SP legacy.
- Đã tạo backend metadata API với auth context, xác minh phiên trước cache hit, kiểm tra user/quyền/chi nhánh tại SQL, cache RAM và che toàn bộ lỗi SQL downstream.
- Đã tách `runtimeSchemas.grid/edit/add/filters`.
- Đã tạo shadow service, parity cache và fail-open về legacy.
- Đã thêm kênh `HRM_RUNTIME_CONFIG.FIELD_SYNC`, verifier staging và runbook kích hoạt/rollback.
- Cấu hình mặc định vẫn `enabled: false`, `shadowMode: true`, `pilotForms: []`.
- Không sửa CSS/component/menu/Save/Delete; không commit; không push.

## Trạng thái kích hoạt

**NOT READY để bật pilot/runtime.** Code local đã sẵn sàng cho bước cài thử có kiểm soát, nhưng verifier mới chỉ đạt với mock; chưa chạy 6 script trên SQL Server đích, chưa kiểm tra chạy lặp hai lần, chưa chạy ma trận token/branch thật và chưa thu parity live. `WA_ChucDanhFrm` còn lệch khóa chính với ERP candidate nên không được đưa vào alias xác nhận.
