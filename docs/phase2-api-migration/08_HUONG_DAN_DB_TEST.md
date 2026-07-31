# Hướng dẫn kiểm thử DB cho pilot Phase 2

> Kiến trúc hiện hành là Form Contract V2 unified. Dùng `11_KICH_HOAT_UNIFIED_FIELD_CONTRACT.md` làm hướng dẫn kích hoạt chính; phần so sánh old/V2 bên dưới chỉ là regression tùy chọn, không còn là nguồn field hoặc gate bắt buộc.

## Cảnh báo phạm vi

Chỉ chạy trên bản sao staging/QA có backup và dữ liệu đã ẩn danh. Không chạy `04_REGISTER_PILOT_V2.sql` với cờ bật trên production. Các script tạo procedure V2 không tự thay đổi `WA_API`; đăng ký và rollback là hai bước riêng.

Pilot hiện tại là `WA_BangThueTNCNFrm`; TableName/PrimaryKey được lấy động từ `SY_FrmLstTbl`. Nếu schema thật có cột scope, blob, dữ liệu nhạy cảm hoặc `IsDeleted` tồn tại nhưng không phải `bit`, script phải fail-closed và dừng.

## Thứ tự chạy

1. Mở một cửa sổ SQL riêng, ghi lại database, login kiểm thử và thời điểm bắt đầu.
2. Chạy `00_CAPTURE_VIEW_CONTRACT.sql` ở chế độ read-only. Lưu toàn bộ result-set (tham số, metadata result-set đầu tiên, duplicate column, row count/PK và scope) vào hồ sơ staging.
3. Cài `01_CREATE_VIEW_V2_PILOT.sql`, sau đó chạy lại `sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql` để metadata shadow mô tả đúng View V2. Khi `WA_API.View` còn legacy, response phải có diagnostic `SHADOW_VIEW_NOT_REGISTERED` và frontend không được active.
4. Cài `02_CREATE_SAVE_V2.sql`, `03_CREATE_DELETE_V2.sql`. Các script dùng `CREATE/ALTER PROCEDURE`, không DDL bảng và không đọc/ghi `SY_FormatFields`.
5. Chạy `05_VERIFY_PILOT_V2.sql`. Kết quả `PASS_UNIFIED_CONTRACT_STATIC`, `REQUIRES_TRANSACTION_TEST` hoặc `REQUIRES_WEB_GATEWAY_TEST` chưa tự động là chấp thuận bật runtime.
6. Chỉ sau khi test trực tiếp đạt, mở phiên triển khai mới và đặt session context gate. Ví dụ:

```sql
EXEC sys.sp_set_session_context @key = N'PHASE2_ACTOR_VERIFIED', @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_VIEW_GATE',  @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_SAVE_GATE',  @value = 1;
EXEC sys.sp_set_session_context @key = N'PHASE2_DELETE_GATE',@value = 1;
```

Chỉ đặt khóa nào đã có biên bản test tương ứng. `PHASE2_ACTOR_VERIFIED` phải dựa trên kiểm thử đối chiếu actor phiên đăng nhập; không được coi giá trị client gửi lên là bằng chứng xác thực.

## Kiểm thử View/Form Contract V2

Harness chỉ đọc:

    sql/Phase2RuntimeTests/01_VIEW_PARITY_READONLY.sql

Thay `@UserName` và `@BranchID` ở đầu file trước khi chạy. Harness không đổi dữ liệu nghiệp vụ hoặc `WA_API`; TableName, PrimaryKey và field đều lấy động từ registry/schema. Bốn result-set lần lượt cho biết contract vật lý + caption, metadata backend/Web, dữ liệu View V2 và bằng chứng read-only.

Với tài khoản test có quyền và một tài khoản không quyền, chạy old và V2 trong cùng snapshot dữ liệu. So sánh:

- mọi cột vật lý an toàn xuất hiện theo `column_id`, đúng type/nullability và caption;
- row count, PrimaryKey đăng ký không trùng/không NULL;
- keyword, filter JSON, sort ASC/DESC và thứ tự mặc định;
- request Grid bình thường có `BranchID` trong `JsonData`; thử branch hợp lệ, branch ngoài quyền và non-admin chưa được gán branch;
- field mới an toàn của bảng chính: xác nhận tự xuất hiện trong Grid/Add/Edit/Filter, có thể sort/filter và Save mà không cần `SY_FormatFields`; caption ưu tiên `SY_FmtFldTbl.CaptionVN`;
- quyền menu/group/user và trường hợp user bị khóa;
- không trả blob/password/token/field kỹ thuật; không vượt branch/tenant;
- field mới của bảng chính xuất hiện đúng thứ tự vật lý mà không làm vỡ consumer.

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

Delete V2 tự chọn chế độ từ schema vật lý:

- Có `IsDeleted bit`: xóa mềm; `DeletedBy/UserDelete` và `DeletedDate/DeletedAt/DateDelete` được cập nhật nếu tồn tại.
- Không có `IsDeleted`: xóa cứng trong transaction.
- Có `IsDeleted` nhưng sai kiểu: chặn với `INVALID_ISDELETED_TYPE`/lỗi validation và không xóa.

Kiểm tra permission Delete, branch, một/nhiều ID, ID sai kiểu, ID không tồn tại, ID đã xóa, giới hạn 100 ID, FK và rollback. Số dòng xóa/cập nhật phải đúng số ID yêu cầu; lệch số phải rollback. Với hard-delete, FK cấm xóa phải làm transaction rollback; không được bỏ qua constraint.

## Đăng ký có kiểm soát

`04_REGISTER_PILOT_V2.sql` mặc định có `@ApplyView = 0`, `@ApplySave = 0`, `@ApplyDelete = 0`. Sao chép script thành bản review nội bộ, thay đúng từng cờ, giữ session gate trong cùng connection, chạy và lưu result-set `WA_API`. Không dùng DELETE+INSERT.

Sau đăng ký, chạy lại `05_VERIFY_PILOT_V2.sql`, smoke test web với user thật ở staging và theo dõi lỗi. Nếu có bất thường, chạy hướng dẫn rollback ngay.
