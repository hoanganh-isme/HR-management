# Hướng dẫn cài đặt và kiểm thử database Phase 3

## Phạm vi an toàn

Chỉ chạy đầu tiên trên database clone/staging có backup và tài khoản test. Không chạy đăng ký route trên production khi chưa có kết quả PASS cho audit, quyền/branch, transaction Save, session, mobile và rollback.

Bộ script Phase 3 không được:

- xóa hoặc truncate dữ liệu nghiệp vụ;
- xóa `SY_FormatFields` hoặc sửa `SY_FrmCfg`;
- tạo metadata mirror;
- nhận tên bảng từ client;
- tự thêm cột nghiệp vụ lúc runtime;
- suy chế độ xóa theo tên form hoặc nhận chế độ xóa từ client.

## Chuẩn bị

1. Xác nhận đúng server/database:

   ```sql
   SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DatabaseName, SUSER_SNAME() AS LoginName;
   ```

2. Chụp backup/snapshot theo quy trình DBA.
3. Chuẩn bị một tài khoản admin test và ít nhất một tài khoản thường có quyền/branch xác định. Không dùng tài khoản production thật.
4. Ghi baseline route, không sửa dữ liệu:

   ```sql
   SELECT [list], [func], [SQL], Para
   FROM dbo.WA_API
   WHERE [list] IN ('WA_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'WA_TitleListFrm', 'WA_ShiftListFrm')
     AND [func] IN ('View', 'Save', 'Delete')
   ORDER BY [list], [func], [SQL];
   ```

5. Lưu output baseline cùng timestamp. Nếu một cặp `[list]+[func]` không có đúng một row thì dừng; không tự sửa bằng tay.

## Thứ tự script

| Bước | File | Chế độ | Kỳ vọng |
|---|---|---|---|
| 1 | `00_AUDIT_CANDIDATES.sql` | Read-only | Xác nhận form/table/PK, unique, deny-list, branch/soft-delete, registration count; không tự kết luận từ source code |
| 2 | `01_CREATE_GENERIC_VIEW_V2.sql` | Cài procedure | Idempotent; allow-list; table/PK khớp registry; permission/branch fail-closed; sort/filter/keyword parameterized |
| 3 | `05A_REPAIR_VIEW_V2_ALL_FORMS.sql` | Sửa/cutover View | Chạy sau file 01; sửa đồng bộ bốn row View về V2 và đặt đủ `@List/@UserName/@BranchID`; không đổi Save/Delete |
| 4 | `02_UPDATE_UNIFIED_FIELD_CONTRACT.sql` | Cài procedure | Contract lấy result-set/sys.columns + `SY_FmtFldTbl`/`SY_FmatTbl`/`SY_FrmDrdwTbl`; không đọc `SY_FormatFields` làm runtime source |
| 5 | `03_UPDATE_SAVE_V2.sql` | Cài procedure | Fail-closed; transaction; reject unknown/duplicate/audit spoof; không DDL runtime |
| 6 | `04_UPDATE_DELETE_V2.sql` | Cài procedure | `AUTO_SCHEMA`: `IsDeleted bit` không computed → `SOFT`, không có `IsDeleted` → `HARD`, sai kiểu/computed → block; ID là JSON array |
| 7 | `05_REGISTER_PHASE3_FORMS.sql` | Thay route có gate | Chạy theo từng form/action; Delete chỉ đổi khi mode schema hợp lệ |
| 8 | `06_VERIFY_PHASE3_FORMS.sql` | Read-only | Gate procedure và `Para` riêng cho View/Save/Delete; xác nhận mode `SOFT/HARD`, chặn kiểu sai |
| 9 | `07_RUNTIME_TEST_READONLY.sql` | Read-only | View/search/sort/filter/paging, result-set và parity không làm thay đổi dữ liệu |
| 10 | `08_ROLLBACK_PHASE3_REGISTRATION.sql` | Rollback drill | Chỉ đổi route đang là V2 về expected old route; giữ nguyên route đã legacy; báo review riêng route duplicate/missing/unexpected |

File 05 mặc định preview-only. Khi người kiểm thử đã có bằng chứng live gate, phải chạy trong cùng SSMS connection và đặt rõ `PHASE3_TARGET_FORM`, `PHASE3_LIVE_GATES_PASSED=1`, cùng đúng **một** cờ action `PHASE3_APPLY_VIEW`, `PHASE3_APPLY_SAVE` hoặc `PHASE3_APPLY_DELETE`. Ba stage bắt buộc theo thứ tự View → Save → Delete; các action chưa đến lượt phải đặt `0`. Không dùng `PHASE3_APPLY_ALL_FORMS` ở lần test đầu.

File 05A không phải read-only và không dùng session context của file 05. Nó dành cho trạng thái bốn View đang bị lệch route/`Para`, điển hình response “expects parameter `@List`” hoặc `PHASE3_ACTOR_REQUIRED`. Trước khi chạy phải lưu snapshot `WA_API`; script tự kiểm tra allow-list, mapping TableName/PK, route count và rollback toàn bộ nếu một form không hợp lệ.

File 08 cũng mặc định preview-only. Rollback chỉ thực thi khi cùng connection có `PHASE3_ROLLBACK_APPLY=1`, `PHASE3_ROLLBACK_CONFIRMED=1` và một scope duy nhất: `PHASE3_ROLLBACK_TARGET_FORM` hoặc `PHASE3_ROLLBACK_ALL_FORMS=1`. Lần test đầu chỉ dùng target một form.

Không chạy bước 6 nếu bước 1 còn `REVIEW/FAIL`, hoặc procedure ở bước 2–5 chưa qua syntax/static test. Sau rollback drill, chỉ đăng ký lại form đã đạt toàn bộ gate.

## Gate trước đăng ký cho từng form

Xác nhận tất cả điều kiện sau:

- `SY_FrmLstTbl` có đúng một mapping và khớp `ExpectedTableName`/`ExpectedPrimaryKey` trong registry.
- Bảng và PK vật lý tồn tại; PK không null và unique trên dữ liệu hiện hữu.
- Không có JOIN/detail/attachment/custom multi-table transaction.
- Không có field/type thuộc deny-list lọt vào result-set client.
- `WA_API` có đúng một row cho action sẽ đổi và đang trỏ `oldView`/`oldSave` dự kiến hoặc đã là đúng V2 (idempotent).
- Tài khoản test có menu/quyền/branch rõ; trường hợp global reference table được chứng minh.
- Registry Delete phải là `enableDelete=true`, `deletePolicy=AUTO_SCHEMA`.
- Nếu có cột `IsDeleted`, cột vật lý bắt buộc là `bit` không computed để dùng `SOFT`; nếu hoàn toàn không có cột này thì dùng `HARD`; kiểu khác hoặc computed phải block.
- Hard delete chỉ được kiểm thử với bản ghi QA có thể hủy trên clone/staging, sau khi đã kiểm tra FK và có snapshot phục hồi.

## Kiểm thử runtime read-only

Với từng form, chạy `07_RUNTIME_TEST_READONLY.sql` bằng user/branch test và lưu các result set:

1. Số cột View V2, tên/type/nullable và duplicate name.
2. PK uniqueness/nullability.
3. Search rỗng và có keyword.
4. Sort tăng/giảm trên field được phép; field lạ phải bị từ chối.
5. Filter theo text/number/date/boolean/lookup phù hợp type.
6. Paging ổn định, không lặp/mất row do sort không xác định.
7. Chuỗi thử SQL injection chỉ được xem là value hoặc bị validate reject; không đổi cấu trúc câu SQL.

Lỗi `sp_describe_first_result_set` 11514 do dynamic SQL phải được ghi nhận như diagnostic. Chỉ cho phép tiếp tục khi fallback `sys.columns` và result-set runtime đã được chứng minh khớp; không tự đổi lỗi thành PASS.

## Kiểm thử field mới

Chỉ thực hiện trên database clone hoặc khi DBA đã phê duyệt một cột nghiệp vụ thật:

1. Thêm một cột nullable thuộc type an toàn vào đúng bảng chính bằng migration DBA riêng; ứng dụng không được tự chạy DDL.
2. Nếu cần caption/format/lookup, khai báo qua quy trình ERP hiện có trong `SY_FmtFldTbl`, `SY_FmatTbl`, `SY_FrmDrdwTbl`; không thêm vào `SY_FormatFields` cho form đã cutover.
3. Gọi lại View V2 và metadata endpoint; field phải xuất hiện theo capability.
4. Trên web, dùng nút refresh/focus lại trang để yêu cầu contract ngay; polling chỉ là safety net.
5. Xác nhận Grid/Add/Edit/Filter, mobile class/reasonCodes và Save của field mới.
6. Hoàn nguyên database clone hoặc hoàn tất migration nghiệp vụ theo quy trình DBA. Không dùng script Phase 3 để xóa cột.

## Kiểm thử Save có rollback dữ liệu

- Dùng dữ liệu và khóa dành riêng cho QA.
- Bao toàn bộ insert/update trong transaction kiểm thử và `ROLLBACK`; sau đó so sánh row count/checksum trước-sau.
- Bắt buộc thử: insert hợp lệ, update đúng một row, duplicate PK, unknown field, duplicate JSON key, identity/computed/server-managed, audit spoof, permission deny, branch deny và payload injection.
- Nếu procedure tác động quá một row, nhận tên bảng từ payload hoặc ghi audit từ client thì FAIL ngay.

## Kiểm thử Delete theo `AUTO_SCHEMA`

1. Chạy file 06 và lưu `SoftDeleteState`, `ResolvedDeleteMode`, `DeleteGate`, route cùng `CurrentDeletePara`.
2. Với bảng có `IsDeleted bit` không computed, kỳ vọng mode `SOFT`; xóa bản ghi QA phải chỉ cập nhật cờ và audit nếu có.
3. Với bảng không có bất kỳ cột `IsDeleted` nào, kỳ vọng mode `HARD`; chỉ xóa bản ghi QA trên clone/staging và xác nhận `rowsAffected` đúng.
4. Với `IsDeleted` khác `bit` hoặc computed, kỳ vọng `BLOCK_INVALID_ISDELETED_TYPE`; không được hiện/cho chạy nút Xóa.
5. Request `Ids` bắt buộc là JSON array (`JSON.stringify(ids)` từ frontend), không nhận CSV; thử thêm khóa text chứa dấu phẩy để chứng minh không bị tách sai.
6. Thử thiếu quyền, branch sai, ID sai kiểu, ID không tồn tại và lỗi FK; mọi trường hợp lỗi phải rollback toàn bộ, không xóa một phần.
7. Lưu ảnh Web, Console, Network URL, request payload, HTTP status, response body, before/after row và lỗi SQL.

## Kết quả cần đạt

Một form chỉ được đánh dấu `PHASE3_ACTIVE` sau khi `06_VERIFY_PHASE3_FORMS.sql`, runtime read-only, Save transaction, session/fallback, mobile và rollback thật đều PASS. Tối thiểu ba form đạt đủ gate mới được kết luận Phase 3 READY.

Trạng thái tại thời điểm lập hướng dẫn: **chưa chạy DB live, NOT READY**.
