# Hướng dẫn rollback pilot Phase 2

## Nguyên tắc

Rollback chỉ khôi phục registration của đúng `WA_BangThueTNCNFrm`; không drop procedure V2, không xóa dữ liệu nghiệp vụ và không xóa `SY_FormatFields`. Script có khóa `UPDLOCK/HOLDLOCK`, kiểm tra đúng một dòng thay đổi và rollback transaction khi điều kiện không khớp.

## Rollback WA_API

1. Dừng traffic/đặt kill-switch frontend về `SHADOW_PREPARED` và tắt Form Builder write cho pilot.
2. Mở connection staging riêng và đặt context actor đã được phê duyệt nếu chính sách DB yêu cầu.
3. Mở `06_ROLLBACK_PILOT_REGISTRATION.sql`. Các cờ `@RollbackView`, `@RollbackSave`, `@RollbackDelete` mặc định bằng `0`.
4. Chỉ bật cờ tương ứng với registration đang là V2, chạy trong một transaction và lưu result-set trước/sau.
5. Xác nhận `WA_API` trở lại lần lượt:
   - View: `API_TruyVanDong`;
   - Save: `API_LuuDong`;
   - Delete: `API_XoaDong`.
6. Xóa cache metadata/restart `backend-app` và chờ quá TTL frontend trước khi mở lại traffic; diagnostic `SHADOW_VIEW_NOT_REGISTERED` phải xuất hiện.
7. Chạy `05_VERIFY_PILOT_V2.sql` để ghi nhận V2 vẫn tồn tại nhưng không còn được đăng ký; kiểm tra smoke test bằng legacy.

Nếu script phát hiện procedure hiện tại không phải old/V2 đã biết, hoặc số dòng cập nhật khác một, **không cưỡng ép**; dừng và điều tra thủ công với DBA.

## Rollback frontend/shadow

Giữ `Phase2MigrationRegistry` ở `SHADOW_PREPARED`, `formBuilderWriteEnabled: false`, không bật cờ runtime. Rebuild bundle từ source nếu cần phát hành kill-switch; không sửa trực tiếp `src/js/app.bundle.js` ngoài quy trình build. Xóa cache trình duyệt/service worker sau khi đổi version bundle.

## Sau rollback

- Chụp lại `WA_API`, log lỗi và thời điểm rollback.
- Kiểm tra không có DDL/xóa dữ liệu ngoài dự kiến; đối chiếu backup branch `backup/refactor-hr-cleanup-before-phase2-20260720` khi cần so sánh source.
- Giữ các procedure V2 và báo cáo để điều tra/retest; chỉ xóa chúng theo change request riêng có phê duyệt DBA.
- Không commit/push tự động. Mọi thay đổi source chưa commit phải được review hoặc bỏ theo quy trình quản lý mã nguồn của nhóm.
