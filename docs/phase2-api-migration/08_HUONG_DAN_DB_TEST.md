# Hướng dẫn kiểm thử DB cho pilot Phase 2

## Cảnh báo phạm vi

Chỉ chạy trên bản sao staging/QA có backup và dữ liệu đã ẩn danh. Không chạy `04_REGISTER_PILOT_V2.sql` với cờ bật trên production. Các script tạo procedure V2 không tự thay đổi `WA_API`; đăng ký và rollback là hai bước riêng.

Pilot duy nhất là `WA_BangThueTNCNFrm` / `HR_BangThueTNCNTbl` / PK `Bac`. Nếu schema thật có cột scope, blob, dữ liệu nhạy cảm hoặc `IsDeleted` chưa có policy, script phải fail-closed và dừng.

## Thứ tự chạy

1. Mở một cửa sổ SQL riêng, ghi lại database, login kiểm thử và thời điểm bắt đầu.
2. Chạy `00_CAPTURE_VIEW_CONTRACT.sql` ở chế độ read-only. Lưu toàn bộ result-set (tham số, metadata result-set đầu tiên, duplicate column, row count/PK và scope) vào hồ sơ staging.
3. Cài `01_CREATE_VIEW_V2_PILOT.sql`, sau đó chạy lại `sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql` để metadata shadow mô tả đúng View V2. Khi `WA_API.View` còn legacy, response phải có diagnostic `SHADOW_VIEW_NOT_REGISTERED` và frontend không được active.
4. Cài `02_CREATE_SAVE_V2.sql`, `03_CREATE_DELETE_V2.sql`. Các script dùng `CREATE/ALTER PROCEDURE`, không DDL bảng và không đọc/ghi `SY_FormatFields`.
5. Chạy `05_VERIFY_PILOT_V2.sql`. Kết quả `PASS_STATIC_ONLY_NOT_ACTIVATION`, `REQUIRES_TRANSACTION_TEST` hoặc `REQUIRES_DB_HARNESS` chưa phải là chấp thuận bật runtime.
6. Chỉ sau khi test trực tiếp đạt, mở phiên triển khai mới và đặt session context gate. Ví dụ:

```sql
EXEC sys.sp_set_session_context @key = N'PHASE2_ACTOR_VERIFIED', @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_VIEW_GATE',  @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_SAVE_GATE',  @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_DELETE_GATE',@value = 1;
```

Chỉ đặt khóa nào đã có biên bản test tương ứng. `PHASE2_ACTOR_VERIFIED` phải dựa trên kiểm thử đối chiếu actor phiên đăng nhập; không được coi giá trị client gửi lên là bằng chứng xác thực.

## Kiểm thử View old/V2

Với tài khoản test có quyền và một tài khoản không quyền, chạy old và V2 trong cùng snapshot dữ liệu. So sánh:

- bốn cột đầu `Bac, Tu, Den, ThueSuat`, tên/kiểu/nullability và alias;
- row count, PK `Bac` không trùng/không NULL;
- keyword, filter JSON, sort ASC/DESC và thứ tự mặc định;
- request Grid bình thường có `BranchID` trong `JsonData`; thử branch hợp lệ, branch ngoài quyền và non-admin chưa được gán branch;
- field mới của bảng chính: xác nhận hiện cột display-only; header sort/filter bị khóa cho tới khi có contract riêng, còn Gate View vẫn đóng nếu keyword hoặc parity old/V2 chưa có bằng chứng;
- quyền menu/group/user và trường hợp user bị khóa;
- không trả blob/password/token/field kỹ thuật; không vượt branch/tenant;
- field mới của bảng chính xuất hiện sau bốn field legacy mà không làm vỡ consumer.

Ghi kết quả vào `04_VIEW_CONTRACT_PARITY.csv`. Nếu bất kỳ phép so sánh nào chưa có bằng chứng DB, giữ trạng thái `PENDING_DB_SNAPSHOT`.

## Kiểm thử Save V2

Chạy trong transaction có dữ liệu test và rollback sau mỗi ca:

1. Insert hợp lệ, kiểm tra `code`, `primaryKey`, `primaryValue`, `rowsAffected`.
2. Insert thiếu field bắt buộc, field unknown, JSON không phải object, giá trị injection.
3. Edit đủ PK, edit thiếu PK, cố đổi PK, identity/computed/rowversion/blob và audit field từ client.
4. Kiểm tra permission Add/Update, user bị khóa, scope/branch và rollback khi DML lỗi.
5. Kiểm tra `IsRun=0` dù `IsAdd/IsUpdate=1` vẫn bị chặn; `UserName/BranchID` trong JSON không được lệch context phía server.
6. Xác nhận audit do server gán; không log token hay dữ liệu nhạy cảm.

Chỉ khi tất cả ca đạt mới cân nhắc `@ApplySave = 1`; View phải đã được đăng ký V2 hoặc bật đồng thời trong cùng script có gate.

## Kiểm thử Delete V2

Delete V2 chỉ cho soft-delete. Xác nhận `IsDeleted` kiểu `bit` và có ít nhất một cột audit `DeletedBy/UserDelete` hoặc `DeletedDate/DeletedAt/DateDelete`; nếu thiếu, phải nhận `HARD_DELETE_BLOCKED` và không xóa vật lý.

Kiểm tra permission Delete, branch, một/nhiều ID, ID sai kiểu, ID không tồn tại, ID đã xóa, giới hạn 100 ID, FK và rollback. Số dòng cập nhật phải đúng số ID yêu cầu; lệch số phải rollback.

## Đăng ký có kiểm soát

`04_REGISTER_PILOT_V2.sql` mặc định có `@ApplyView = 0`, `@ApplySave = 0`, `@ApplyDelete = 0`. Sao chép script thành bản review nội bộ, thay đúng từng cờ, giữ session gate trong cùng connection, chạy và lưu result-set `WA_API`. Không dùng DELETE+INSERT.

Sau đăng ký, chạy lại `05_VERIFY_PILOT_V2.sql`, smoke test web với user thật ở staging và theo dõi lỗi. Nếu có bất thường, chạy hướng dẫn rollback ngay.
