# Báo cáo commit nền và phạm vi thay đổi Phase 2

## Trạng thái kiểm tra

- Nhánh làm việc: `refactor/hr-cleanup`.
- Commit nền thực tế: `d94782e4e084692ca9f2e916485f73ffc43c1837` (`add shadow ERP grid field sync phase 1`).
- `origin/refactor/hr-cleanup` đang cùng commit với nhánh local tại thời điểm bắt đầu.
- Nhánh backup được tạo trước khi sửa: `backup/refactor-hr-cleanup-before-phase2-20260720`, trỏ cùng commit nền.
- Không commit và không push trong lượt Phase 2 này.

Working tree hiện tại cố ý **dirty** vì chứa các thay đổi Phase 2 chưa commit (SQL song song, frontend dual-schema, verifier, audit script, fixture và báo cáo). Không ghi đè các thay đổi Phase 1 đã có trong commit nền. Audit không tìm thấy `sql/install-order.txt`; thứ tự cài pilot được ghi trong `08_HUONG_DAN_DB_TEST.md`.

## Phạm vi đã thực hiện

1. Audit các procedure/API trong các thư mục SQL được yêu cầu và sinh inventory, phân tích JOIN, ngoại lệ `SELECT *`, cùng reference `SY_FormatFields`.
2. Chọn đúng một pilot đơn giản: `WA_BangThueTNCNFrm` (ERP `HR_BangThueTNCNFrm`, bảng `HR_BangThueTNCNTbl`, khóa `Bac`).
3. Tạo View/Save/Delete V2 song song và script đăng ký/kiểm tra/rollback idempotent.
4. Cho resolver metadata dùng allow-list shadow để tải/đối chiếu result-set V2; diagnostic `SHADOW_VIEW_NOT_REGISTERED` giữ Grid hiển thị và Add/Edit ở schema legacy cho tới khi gate active.
5. Chặn Form Builder ghi `SY_FormatFields` cho pilot; không sửa sâu `SY_FrmCfg`, không drop/xóa dữ liệu metadata.
6. Giữ cờ đăng ký mặc định tắt và thêm gate session cho View/Save/Delete/actor.

## Điều chưa được suy diễn

Snapshot kiểu dữ liệu, nullability, row count, uniqueness dữ liệu, branch isolation và actor của DB thật chưa được coi là đạt chỉ từ mã nguồn. Cần chạy `00_CAPTURE_VIEW_CONTRACT.sql`, `05_VERIFY_PILOT_V2.sql` và harness trên staging trước mọi đăng ký `WA_API`.

## Kết luận nền

Commit nền và backup đã được bảo toàn. Mọi thay đổi hiện tại có thể đối chiếu về commit trên và rollback registration bằng script `06_ROLLBACK_PILOT_REGISTRATION.sql`.
