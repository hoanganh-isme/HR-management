# Kịch bản kiểm thử thủ công Phase 3 cho người dùng

## 1. Mục đích và phạm vi

Tài liệu này dành cho người dùng/QA tự kiểm thử trên môi trường clone hoặc staging. Không chạy lần đầu trên production. Mục tiêu là chứng minh bốn form sau có thể chuyển dần từ legacy sang Unified Field Contract V2 mà không làm mất phiên, mất dữ liệu hoặc trộn route:

| Mã test | Web form | ERP form | Bảng chính dự kiến | Primary key dự kiến | View legacy |
|---|---|---|---|---|---|
| F1 | `WA_BangThueTNCNFrm` | `HR_BangThueTNCNFrm` | `HR_BangThueTNCNTbl` | `Bac` | `API_TruyVanDong` |
| F2 | `WA_ChucDanhFrm` | `WA_ChucDanhFrm` | `HR_ChucDanhTbl` | `ChucDanhChuyenMon` | `API_DanhSachChucDanh` |
| F3 | `WA_TitleListFrm` | `WA_TitleListFrm` | `HR_TitleListTbl` | `TitleName` | `API_TruyVanDong` |
| F4 | `WA_ShiftListFrm` | `WA_ShiftListFrm` | `HR_ShiftListTbl` | `ShiftID` | `API_TruyVanDong` |

Route V2 dự kiến:

- View: `API_TruyVanDong_V2`.
- Save: `API_LuuDong_V2`.
- Delete: `API_XoaDong_V2`, policy `AUTO_SCHEMA`: bảng có `IsDeleted bit` không computed dùng `SOFT`, bảng không có `IsDeleted` dùng `HARD`, còn `IsDeleted` sai kiểu hoặc computed phải bị chặn.

Mỗi test case dưới đây phải chạy lần lượt cho F1, F2, F3 và F4, trừ khi case ghi rõ chỉ áp dụng có điều kiện.

## 2. Quy tắc an toàn trước khi test

1. Chỉ dùng database clone/staging có backup hoặc snapshot khôi phục được.
2. Ghi lại tên server, database, phiên bản web/backend và thời điểm test.
3. Không chạy script đăng ký route nếu audit còn `FAIL`, `REVIEW_REQUIRED`, duplicate registration hoặc sai TableName/PK.
4. Không sửa tay `WA_API`, không xóa `SY_FormatFields`, không sửa `SY_FrmCfg` và không chạy installer legacy trong quá trình test Phase 3.
5. Không nhập TableName từ Web/API; tên bảng phải được lấy từ registry và được backend kiểm tra.
6. Mọi test Add/Edit phải dùng bản ghi QA riêng. Nếu có thể, bọc test ghi trong transaction và rollback theo hướng dẫn của DBA.
7. Không test hard delete trên dữ liệu thật. Chỉ dùng bản ghi QA có thể hủy trên clone/staging và phải chụp baseline trước khi xóa.
8. Khi chụp Network, phải che token, cookie, mật khẩu, connection string và dữ liệu cá nhân.
9. Trước mỗi bước cutover, lưu snapshot `WA_API` để rollback độc lập từng form.

## 3. Chuẩn bị môi trường

### PRE-01 — Xác nhận đúng môi trường

- **Chuẩn bị:** Có URL Web staging, URL metadata backend, SQL Server/database clone, tài khoản admin test và tài khoản thường test.
- **Thao tác Web:** Đăng nhập, mở một trang legacy không thuộc bốn form, sau đó mở DevTools > Network và Console.
- **Kỳ vọng:** Trang legacy hoạt động; Network không có lỗi session; URL Web/backend đúng môi trường staging.
- **Nếu lỗi cần lưu:** Ảnh toàn màn hình; Console; URL request; request payload; HTTP status; response body; SQL error nếu backend trả lỗi SQL.

### PRE-02 — Ghi baseline database và route

- **Chuẩn bị:** Mở SSMS đúng database, chưa chạy script Phase 3.
- **Thao tác Web:** Không thao tác ghi. Ghi lại dữ liệu hiện tại của bốn trang: số dòng, các cột đang thấy, một vài giá trị kiểm chứng không nhạy cảm.
- **Kỳ vọng:** Có baseline trước migration cho cả bốn form và snapshot route View/Save/Delete trong `WA_API`.
- **Nếu lỗi cần lưu:** Ảnh trang; query đã chạy; toàn bộ result set liên quan; SQL error number/message/line/procedure.

### PRE-03 — Kiểm tra cấu hình frontend/backend

- **Chuẩn bị:** Xác nhận cấu hình field sync có `enabled`, `shadowMode`, `pilotForms`, `metadataBaseUrl`; bốn form có registry frontend/backend giống nhau.
- **Thao tác Web:** Mở Console và đọc state/config công khai của ứng dụng nếu build cung cấp diagnostics. Không sửa config trực tiếp trong Console.
- **Kỳ vọng:** Bốn form được nhận diện là managed; managed không đồng nghĩa active. Khi chưa cutover, runtime phải là legacy đầy đủ.
- **Nếu lỗi cần lưu:** Ảnh Console diagnostics; tên form; giá trị config đã che dữ liệu nhạy cảm; phiên bản file/bundle đang phục vụ.

## 4. Các SQL người dùng tự chạy

Chạy theo đúng thứ tự dưới đây. Sau mỗi file, đọc tất cả result set và Messages; không chỉ nhìn dòng “Query executed successfully”.

> Khi Phase 3 đang được dùng, `sql/Phase3SimpleCrud/01_CREATE_GENERIC_VIEW_V2.sql` là source hiện hành của `dbo.API_TruyVanDong_V2`. Không chạy lại `sql/Phase2ApiMigration/01_CREATE_VIEW_V2.sql` sau file này vì hai file cùng `ALTER` một procedure và bản chạy sau sẽ ghi đè implementation Phase 3.

| Thứ tự | File | Mục đích | Điều kiện để đi tiếp |
|---|---|---|---|
| 1 | `00_AUDIT_CANDIDATES.sql` | Audit mapping, PK, table, uniqueness, deny-list, branch, soft delete, WA_API | Form mục tiêu không còn lỗi/blocker |
| 2 | `01_CREATE_GENERIC_VIEW_V2.sql` | Cài/cập nhật View V2 generic | Procedure tồn tại; không đăng ký route tự động |
| 3 | `05A_REPAIR_VIEW_V2_ALL_FORMS.sql` | Sửa/cutover đồng bộ View V2 cho bốn form | Mỗi View có đủ `@List`, `@UserName`, `@BranchID`; hết lỗi thiếu `@List`/`PHASE3_ACTOR_REQUIRED` |
| 4 | `02_UPDATE_UNIFIED_FIELD_CONTRACT.sql` | Cài/cập nhật contract V2 | Contract trả field/capability hợp lệ |
| 5 | `03_UPDATE_SAVE_V2.sql` | Cài/cập nhật Save V2 | Procedure tồn tại; chưa đổi route Save |
| 6 | `04_UPDATE_DELETE_V2.sql` | Cài/cập nhật Delete V2 fail-closed | `SOFT`/`HARD` được suy ra từ schema; `IsDeleted` sai kiểu/computed bị chặn; `@Ids` phải là JSON array |
| 7 | `05_REGISTER_PHASE3_FORMS.sql` | Cutover có gate theo từng form/action | Chỉ chạy action đang test; đúng một row WA_API được đổi |
| 8 | `06_VERIFY_PHASE3_FORMS.sql` | Xác minh route, `Para`, contract và gate | Action đang test khớp procedure và đủ tham số bắt buộc |
| 9 | `07_RUNTIME_TEST_READONLY.sql` | Test read-only result-set/search/sort/filter | Không thay đổi dữ liệu; không có lỗi security/parity |
| 10 | `08_ROLLBACK_PHASE3_REGISTRATION.sql` | Rollback drill từng form | Route trở về expected legacy, các form khác không đổi |

`05A_REPAIR_VIEW_V2_ALL_FORMS.sql` là bước sửa đồng bộ dành cho trạng thái các route View đã/đang chuyển sang V2 nhưng `Para` còn thiếu. File này cập nhật đúng bốn row `WA_API.View` trong allow-list, đặt procedure `API_TruyVanDong_V2` và chuỗi tham số đầy đủ. Phải chạy sau file 01; lưu snapshot `WA_API` trước khi chạy vì đây là thay đổi route View cho cả bốn form, không phải script read-only.

### Cách chạy `05_REGISTER_PHASE3_FORMS.sql` theo đúng thứ tự action

`05_REGISTER_PHASE3_FORMS.sql` mặc định chỉ preview. Các cờ bên dưới phải được chạy trong **cùng một SSMS connection/SPID** với nội dung file 05. Thay `<TARGET_FORM>` bằng đúng một trong bốn Web form F1–F4. Không dùng `PHASE3_APPLY_ALL_FORMS` trong lần test đầu.

Trước mỗi stage, chạy preview với cả ba action tắt, sau đó chạy toàn bộ file 05 và đọc cột `ApplyMode`:

```sql
EXEC sys.sp_set_session_context N'PHASE3_TARGET_FORM', N'<TARGET_FORM>';
EXEC sys.sp_set_session_context N'PHASE3_APPLY_ALL_FORMS', 0;
EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', 0;
```

Kỳ vọng preview: không row `WA_API` nào đổi và `ApplyMode` là `PREVIEW_ONLY_DEFAULT` hoặc trạng thái preview tương ứng.

Chỉ bật **View** sau khi audit/read-only gate của form đã được người kiểm thử xác nhận:

```sql
EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', 1;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', 1;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', 0;
```

Chạy toàn bộ file 05, rồi chạy file 06 và test nhóm `VIEW-*` trên Web. Chỉ khi View/Contract/Grid/Add/Edit/Filter đạt kỳ vọng mới chuyển sang Save.

Chỉ bật **Save** ở stage kế tiếp:

```sql
EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', 1;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', 1;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', 0;
```

Chạy toàn bộ file 05, rồi chạy file 06 và test nhóm `SAVE-*`. Không bật Delete cùng batch với Save.

Chỉ bật **Delete** sau cùng, sau khi file 06 xác nhận schema vật lý cho chế độ xóa và người kiểm thử đã chuẩn bị bản ghi QA:

```sql
EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', 1;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', 0;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', 1;
```

Với source hiện tại, cả bốn form dùng `enableDelete=true`, `deletePolicy=AUTO_SCHEMA`. Sau cutover Delete, contract trả `SOFT` nếu có `IsDeleted bit` không computed, trả `HARD` nếu hoàn toàn không có cột `IsDeleted`, và trả `INVALID_ISDELETED_TYPE` để chặn nếu cột này có kiểu khác `bit` hoặc là computed. Nút Xóa chỉ xuất hiện khi route Delete là `API_XoaDong_V2` và mode contract là `SOFT` hoặc `HARD`.

Sau khi xong một stage, có thể xóa context để tránh áp nhầm trong query sau:

```sql
EXEC sys.sp_set_session_context N'PHASE3_TARGET_FORM', NULL;
EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', NULL;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', NULL;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', NULL;
EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', NULL;
```

### SQL-01 — Audit bốn form

- **Chuẩn bị:** Backup đã có; chạy `00_AUDIT_CANDIDATES.sql` trên đúng database.
- **Thao tác Web:** Chưa cần refresh Web.
- **Kỳ vọng:** Mỗi form có đúng mapping TableName/PK dự kiến; PK vật lý tồn tại, không null, unique; `WA_API` không duplicate; branch policy rõ; không có cột deny-list lọt ra client.
- **Nếu lỗi cần lưu:** Toàn bộ result set; SQL error number, level, state, procedure, line và message; form/table/PK gây lỗi.

### SQL-02 — Cài procedure nhưng chưa cutover

- **Chuẩn bị:** SQL-01 đạt; chạy file 01, sau đó file 02 đến 04; chưa chạy file 05/05A.
- **Thao tác Web:** Mở lại bốn form trước khi đăng ký route.
- **Kỳ vọng:** Bốn form vẫn chạy legacy như baseline; chỉ việc cài procedure không được tự đổi route hoặc làm trang trắng.
- **Nếu lỗi cần lưu:** Ảnh Web; Network View/layout requests; snapshot WA_API trước/sau; SQL Messages.

### SQL-03 — Sửa đồng bộ route/Para View V2

- **Chuẩn bị:** File 01 đã chạy; đã lưu snapshot `WA_API` cho bốn form; mỗi form có đúng một row View và mapping TableName/PK hợp lệ.
- **Thao tác Web:** Người dùng tự chạy toàn bộ `05A_REPAIR_VIEW_V2_ALL_FORMS.sql`, sau đó refresh từng form.
- **Kỳ vọng:** Cả bốn row View trỏ `API_TruyVanDong_V2`; `Para` có đủ `@List`, `@Keyword`, `@SortColumn`, `@SortDir`, `@Data`, `@UserName`, `@BranchID`; không còn lỗi “expects parameter `@List`” hoặc `PHASE3_ACTOR_REQUIRED`.
- **Nếu lỗi cần lưu:** Snapshot `WA_API` trước/sau; toàn bộ result set/Messages; ảnh Web; Network URL, request payload, HTTP status, response body và lỗi SQL.

## 5. Cutover View trước

### VIEW-01 — Chưa active phải fallback legacy toàn bộ

- **Chuẩn bị:** Procedure V2 đã cài nhưng `WA_API.View` của form vẫn là View legacy.
- **Thao tác Web:** Mở form, search, sort, đổi trang, mở Add/Edit rồi hủy.
- **Kỳ vọng:** Trang chạy đầy đủ bằng legacy; không báo “Form Contract V2 chưa active”; không trộn schema V2 với Save legacy; không mất phiên.
- **Nếu lỗi cần lưu:** Ảnh; Console; tất cả Network request của form gồm URL/payload/status/body; state runtime nếu có diagnostics.

### VIEW-02 — Đăng ký View V2 theo từng form

- **Chuẩn bị:** Snapshot `WA_API`; chọn duy nhất một form; trong `05_REGISTER_PHASE3_FORMS.sql` chỉ bật/thi hành gate View của form đó theo hướng dẫn trong script.
- **Thao tác Web:** Sau khi SQL thành công, quay lại tab form và dùng nút Refresh hoặc chuyển focus ra/vào trang. Không cần chờ polling.
- **Kỳ vọng:** `WA_API.View` đổi đúng một row từ expected old View sang `API_TruyVanDong_V2`; metadata nhận trạng thái V2; danh sách hiện ngay; ba form chưa cutover vẫn không đổi.
- **Nếu lỗi cần lưu:** Before/after WA_API; SQL row count/Messages; ảnh Web; Console; metadata URL/query string; View request payload/status/body.

### VIEW-03 — Danh sách và parity dữ liệu

- **Chuẩn bị:** View V2 active cho form; có baseline PRE-02.
- **Thao tác Web:** Mở trang, đối chiếu số dòng và các giá trị chính với baseline; tải lại trang một lần.
- **Kỳ vọng:** Không mất/nhân đôi bản ghi; PK đúng; field bị deny không xuất hiện; reload không làm thay đổi dữ liệu.
- **Nếu lỗi cần lưu:** Ảnh trước/sau; row count; bản ghi mẫu; Network response; SQL runtime error.

### VIEW-04 — Search

- **Chuẩn bị:** Chọn một giá trị text/number hiện có và một chuỗi không tồn tại.
- **Thao tác Web:** Search lần lượt chuỗi đầy đủ, một phần, không tồn tại và chuỗi chứa ký tự `'`, `%`, `_`, `--`.
- **Kỳ vọng:** Kết quả đúng; chuỗi đặc biệt được coi là value hoặc reject hợp lệ; không có SQL injection, lỗi 500 hoặc thay đổi dữ liệu.
- **Nếu lỗi cần lưu:** Từ khóa; ảnh kết quả; request URL/payload/status/body; SQL error đầy đủ.

### VIEW-05 — Sort

- **Chuẩn bị:** Chọn ít nhất một cột text, một cột số/ngày nếu form có.
- **Thao tác Web:** Sort ASC, DESC, bỏ sort; thử gửi tên cột không hợp lệ qua UI nếu UI cho phép.
- **Kỳ vọng:** Thứ tự đúng và ổn định; chỉ field `supportsSort` được dùng; field lạ bị chặn, không ghép vào SQL.
- **Nếu lỗi cần lưu:** Cột/chiều sort; ảnh; payload; response; SQL error.

### VIEW-06 — Paging

- **Chuẩn bị:** Form có đủ dữ liệu cho ít nhất hai trang; nếu không, ghi rõ `NOT ENOUGH DATA`, không tự bịa PASS.
- **Thao tác Web:** Đổi page size, đi Next/Previous/First/Last, kết hợp search và sort.
- **Kỳ vọng:** Không lặp/mất row giữa trang; tổng số dòng và số trang đúng; filter/search reset page hợp lý.
- **Nếu lỗi cần lưu:** Ảnh từng trang; page/pageSize/total; request/response; PK các dòng bị lặp hoặc mất.

## 6. Cột mới, caption, format và bốn context

### FIELD-01 — Thêm cột vật lý an toàn

- **Chuẩn bị:** Chỉ trên database clone hoặc migration nghiệp vụ đã được DBA duyệt. DBA thêm một cột nullable type an toàn vào bảng chính; ứng dụng không tự chạy DDL.
- **Thao tác Web:** Mở lại form hoặc bấm Refresh/chuyển focus để lấy contract mới ngay.
- **Kỳ vọng:** View V2 và metadata tự thấy field; không sửa JavaScript, View theo tên field hoặc `SY_FormatFields`; trang không cần đợi 30 giây mới thấy.
- **Nếu lỗi cần lưu:** DDL/migration được duyệt; metadata response; ảnh Grid/Add/Edit/Filter; Console/Network/SQL error.

### FIELD-02 — Caption tiếng Việt

- **Chuẩn bị:** ERP đã có row `SY_FmtFldTbl` đúng ERPFormID/FieldName cho cột mới theo quy trình cấu hình hiện có.
- **Thao tác Web:** Refresh contract và mở Grid, Add, Edit, Filter.
- **Kỳ vọng:** Nhãn tiếng Việt lấy từ `SY_FmtFldTbl`; không cần thêm row `SY_FormatFields`; cùng một caption được dùng nhất quán theo context.
- **Nếu lỗi cần lưu:** Giá trị ERPFormID/FieldName/Caption không nhạy cảm; metadata response; ảnh bốn context.

### FIELD-03 — Format

- **Chuẩn bị:** Field có `FormatID` liên kết hợp lệ trong `SY_FmatTbl`, ví dụ number/date/time theo dữ liệu thật.
- **Thao tác Web:** Xem giá trị trong Grid, mở Add/Edit, nhập giá trị hợp lệ và không hợp lệ.
- **Kỳ vọng:** Hiển thị/editor/validation đúng format; payload gửi giá trị theo contract; không mất precision hoặc đổi ngày do timezone ngoài mong đợi.
- **Nếu lỗi cần lưu:** Giá trị input; format metadata; ảnh; payload/status/body; SQL conversion error.

### FIELD-04 — Context Grid/Add/Edit/Filter

- **Chuẩn bị:** Chọn field vật lý an toàn có đủ capability.
- **Thao tác Web:** Kiểm tra field trong Grid, Add, Edit và Filter.
- **Kỳ vọng:** Field chỉ xuất hiện ở context có cờ `showIn...`/`supports...`; không lấy required/read-only từ legacy sau cutover; field hidden không được render hay gửi payload.
- **Nếu lỗi cần lưu:** Metadata field đầy đủ; ảnh từng context; payload Save/Filter; Console.

### FIELD-05 — Required và read-only

- **Chuẩn bị:** Chọn một field `requiredOnInsert=1`, một field nullable, PK và field identity/computed/server-managed nếu có.
- **Thao tác Web:** Add bỏ trống required; nhập optional; Edit PK/audit/computed; thử sửa read-only bằng DevTools chỉ trên QA.
- **Kỳ vọng:** Required bị chặn trước Save; optional được phép trống; PK/identity/computed/server-managed không update trái phép; backend vẫn reject payload giả mạo.
- **Nếu lỗi cần lưu:** Metadata capability; validation message; request payload/status/body; SQL error.

### FIELD-06 — Dropdown/lookup

- **Chuẩn bị:** Chọn field có mapping `SY_FrmDrdwTbl`; có dữ liệu lookup và dependency parent nếu dùng cascading.
- **Thao tác Web:** Mở Add/Edit/Filter, mở dropdown, tìm/chọn giá trị, đổi field cha, lưu rồi mở lại.
- **Kỳ vọng:** Options đúng quyền/branch; label và value đúng; dependency refresh đúng; giá trị cũ hiển thị lại; không dùng SQL/lookup từ `SY_FormatFields`.
- **Nếu lỗi cần lưu:** Lookup metadata; URL/payload/status/body của lookup; ảnh options; selected label/value; Console/SQL error.

### FIELD-07 — Cột mới có ký tự NUL trong response

- **Chuẩn bị:** Dùng bản ghi QA có field text mới; chụp `SqlType`, base type `TYPE_NAME(system_type_id)`, `is_user_defined` và `is_assembly_type`. Không tự sửa dữ liệu production.
- **Thao tác Web:** Mở Grid, xem Network Response, sau đó mở Add/Edit và tải lại danh sách.
- **Kỳ vọng:** JSON có NUL thô hoặc `\u0000` vẫn được parse; client chỉ loại ký tự NUL khỏi chuỗi hiển thị, không trim khoảng trắng/tab/newline; Grid giữ đúng số dòng và không về `0/0`. Binary/varbinary/UDT/CLR không được contract quảng bá là field CRUD.
- **Nếu lỗi cần lưu:** Ảnh Grid; Console cảnh báo số NUL; Network URL/payload/status/response body; declared/base SQL type; HTTP `Content-Type`; lỗi SQL.

## 7. Cutover Save sau khi View đạt

### SAVE-01 — Save vẫn legacy trước cutover

- **Chuẩn bị:** View V2 đã PASS nhưng `WA_API.Save` vẫn là `API_LuuDong`.
- **Thao tác Web:** Không ghi dữ liệu nếu hệ thống chưa hỗ trợ compatibility được phê duyệt; kiểm tra diagnostics/runtime route.
- **Kỳ vọng:** Hệ thống không âm thầm trộn contract V2 với Save legacy. Nếu policy yêu cầu V2_FULL thì Add/Edit phải bị chặn an toàn cho tới khi Save cutover.
- **Nếu lỗi cần lưu:** Runtime routes; ảnh trạng thái nút; Network; Console.

### SAVE-02 — Đăng ký Save V2 theo từng form

- **Chuẩn bị:** View/contract/Grid/Add/Edit/Filter đã PASS; snapshot WA_API; chạy gate Save của đúng một form trong `05_REGISTER_PHASE3_FORMS.sql`.
- **Thao tác Web:** Refresh form; mở Add/Edit.
- **Kỳ vọng:** Đúng một row Save đổi sang `API_LuuDong_V2`; runtime V2_FULL chỉ khi contract hợp lệ; form khác không đổi.
- **Nếu lỗi cần lưu:** Before/after route; SQL Messages; metadata/runtime route; ảnh; Network.

### SAVE-03 — Add hợp lệ

- **Chuẩn bị:** Dữ liệu QA với PK chưa tồn tại; user có quyền Add và branch hợp lệ.
- **Thao tác Web:** Nhập required, optional, lookup và field mới; bấm Lưu một lần.
- **Kỳ vọng:** Insert đúng một row; response contract giữ tương thích; audit do server gán; danh sách refresh và thấy bản ghi.
- **Nếu lỗi cần lưu:** Ảnh form/danh sách; request URL/payload đã che dữ liệu; status/body; SQL error; bản ghi DB trước/sau.

### SAVE-04 — Duplicate PK

- **Chuẩn bị:** Dùng PK đã tồn tại theo mode Add.
- **Thao tác Web:** Nhập dữ liệu và Lưu.
- **Kỳ vọng:** Bị reject rõ ràng; không update nhầm row hiện có; transaction rollback.
- **Nếu lỗi cần lưu:** Payload/status/body; SQL error number/procedure/line; snapshot row trước/sau.

### SAVE-05 — Edit hợp lệ

- **Chuẩn bị:** Bản ghi QA tồn tại; user có quyền Edit.
- **Thao tác Web:** Sửa một field writable và field mới rồi Lưu.
- **Kỳ vọng:** Update đúng một row; PK/audit không đổi từ client; mở lại thấy giá trị mới.
- **Nếu lỗi cần lưu:** Ảnh trước/sau; payload/status/body; SQL row count/error.

### SAVE-06 — Unknown field, duplicate JSON key và audit spoof

- **Chuẩn bị:** QA có công cụ gửi request được kiểm soát; không dùng production.
- **Thao tác Web:** Gửi lần lượt field không có trong contract, duplicate key khác casing, audit/user/branch giả, identity/computed/server-managed.
- **Kỳ vọng:** Backend/SQL reject fail-closed; không có row nào đổi; không DDL runtime.
- **Nếu lỗi cần lưu:** Payload nguyên bản đã che bí mật; status/body; SQL error; before/after dữ liệu.

### SAVE-07 — Bảng không có cột audit

- **Chuẩn bị:** Form QA trỏ tới bảng nghiệp vụ không có các cột `UserCreate/DateCreate/UserUpdate/DateUpdate`; Save V2 đã được đăng ký.
- **Thao tác Web:** Thêm mới một bản ghi hợp lệ, sau đó sửa một field writable của chính bản ghi đó.
- **Kỳ vọng:** INSERT và UPDATE đều thành công đúng một row; SQL động không sinh dấu phẩy thừa khi danh sách audit rỗng; response trả đúng `primaryKey`, `primaryValue` và `rowsAffected=1`.
- **Nếu lỗi cần lưu:** Ảnh modal; Console; Network URL/payload/status/response; SQL error number/line/message; schema các cột audit của bảng.

## 8. Delete theo policy

### DELETE-01 — Contract tự xác định chế độ xóa

- **Chuẩn bị:** Registry `enableDelete=true`, `deletePolicy=AUTO_SCHEMA`; đã chạy metadata contract và file 06.
- **Thao tác Web:** Chưa xóa dữ liệu; mở form và quan sát mode Delete trong response metadata cùng toolbar.
- **Kỳ vọng:** User có quyền Delete luôn nhìn thấy nút `Xóa` và hộp xác nhận dùng nội dung chung, không để lộ chế độ xóa cho người dùng; `IsDeleted bit` không computed → backend tự chọn xóa mềm; không có cột `IsDeleted` → backend tự chọn xóa cứng; `IsDeleted` sai kiểu hoặc computed → `INVALID_ISDELETED_TYPE` và thao tác bị chặn. Không suy mode theo tên form.
- **Nếu lỗi cần lưu:** Schema cột `IsDeleted`; output file 06; metadata response; ảnh toolbar; Console và Network.

### DELETE-02 — Soft delete theo schema

- **Chuẩn bị:** Bảng có đúng `IsDeleted bit` không computed; contract trả `SOFT`; Delete V2 đã cutover; có bản ghi QA riêng.
- **Thao tác Web:** Cutover riêng Delete, chọn bản ghi QA và xác nhận xóa.
- **Kỳ vọng:** Nút và hộp xác nhận chỉ hiển thị `Xóa`; backend tự chọn soft delete, update `IsDeleted=1` đúng số dòng yêu cầu; bản ghi biến mất khỏi View V2 nhưng còn trong DB; cột audit được cập nhật nếu bảng có hỗ trợ.
- **Nếu lỗi cần lưu:** Before/after WA_API; payload/status/body; DB row trước/sau; SQL error.

### DELETE-03 — Hard delete khi không có `IsDeleted`

- **Chuẩn bị:** Bảng hoàn toàn không có cột tên `IsDeleted`; contract trả `HARD`; dùng bản ghi QA có thể hủy trên clone/staging, đã chụp backup/baseline và kiểm tra ràng buộc FK.
- **Thao tác Web:** Chọn đúng bản ghi QA, bấm Xóa và xác nhận; trong Network xác nhận `Ids` là JSON array do frontend gửi bằng `JSON.stringify(ids)`.
- **Kỳ vọng:** Nút và hộp xác nhận chỉ hiển thị `Xóa`; backend tự chọn hard delete và xóa vật lý bản ghi đúng một lần; `rowsAffected` khớp số phần tử của JSON array; khóa text chứa dấu phẩy vẫn là một giá trị, không bị tách; lỗi FK hoặc thiếu quyền phải rollback toàn bộ, không xóa một phần.
- **Nếu lỗi cần lưu:** Before/after row count và bản ghi; request payload; HTTP status; response body; `deleteMode`; SQL error/FK.

### DELETE-04 — `IsDeleted` sai kiểu/computed phải fail-closed

- **Chuẩn bị:** Chỉ mô phỏng trên clone bằng bảng test có cột tên `IsDeleted` nhưng kiểu khác `bit` hoặc là computed; không sửa schema production.
- **Thao tác Web:** Refresh metadata, quan sát toolbar và không cố xóa dữ liệu thật.
- **Kỳ vọng:** Contract trả `INVALID_ISDELETED_TYPE`; file 05/06 chặn cutover hoặc verifier báo block; nút Xóa không hoạt động; dữ liệu không đổi.
- **Nếu lỗi cần lưu:** Kiểu cột; output file 05/06; metadata response; ảnh; Console; Network và SQL error.

## 9. Quyền user, group và branch

### SEC-01 — Admin test

- **Chuẩn bị:** Tài khoản admin test active.
- **Thao tác Web:** Mở danh sách, search/sort/paging, Add/Edit theo phạm vi test.
- **Kỳ vọng:** Thao tác được theo policy; request vẫn gửi UserName/BranchID hợp lệ; không bỏ qua contract safety.
- **Nếu lỗi cần lưu:** User/group/branch đã che; Network; SQL error.

### SEC-02 — User/group có quyền

- **Chuẩn bị:** Tài khoản thường active, group có View/Add/Edit tương ứng, branch hợp lệ.
- **Thao tác Web:** Chạy lại View và Save cases.
- **Kỳ vọng:** Chỉ action được cấp quyền hoạt động; dữ liệu nằm đúng scope.
- **Nếu lỗi cần lưu:** Permission matrix; ảnh; payload/status/body; SQL error.

### SEC-03 — User/group bị từ chối

- **Chuẩn bị:** Tài khoản active nhưng thiếu View hoặc Add/Edit.
- **Thao tác Web:** Mở form và thử action bị cấm.
- **Kỳ vọng:** HTTP 403 hoặc lỗi quyền form ổn định; không logout toàn hệ thống; không có data change.
- **Nếu lỗi cần lưu:** Ảnh; Console; URL/payload/status/body; URL hiện tại sau lỗi.

### SEC-04 — Branch hợp lệ và không hợp lệ

- **Chuẩn bị:** User thường có danh sách branch rõ; chuẩn bị một BranchID được phép và một BranchID ngoài scope.
- **Thao tác Web:** Test View/Save với branch hợp lệ; sau đó gửi branch ngoài scope bằng request QA có kiểm soát.
- **Kỳ vọng:** Branch hợp lệ hoạt động; branch ngoài scope bị reject fail-closed; không dùng BranchID trong payload để vượt context request.
- **Nếu lỗi cần lưu:** Branch context đã che; payload/status/body; SQL error; dữ liệu trước/sau.

## 10. Mobile

### MOB-01 — Viewport 360 px

- **Chuẩn bị:** DevTools responsive 360 px hoặc thiết bị thật.
- **Thao tác Web:** Mở Grid, search/filter, Add/Edit; mở “Thông tin bổ sung” và accordion advanced.
- **Kỳ vọng:** CORE hiện trước; OPTIONAL/ADVANCED thu gọn; HIDDEN không render; không tràn toolbar/modal; Save/Cancel dùng được.
- **Nếu lỗi cần lưu:** Ảnh toàn màn hình từng context; viewport/device; Console/Network.

### MOB-02 — Viewport 390 px

- **Chuẩn bị:** 390 px; có field required, lookup và long text.
- **Thao tác Web:** Nhập dữ liệu, mở/đóng accordion, xoay orientation nếu thiết bị hỗ trợ.
- **Kỳ vọng:** Không mất dữ liệu nhập; validation/lookup đúng; không refresh contract khi modal dirty.
- **Nếu lỗi cần lưu:** Ảnh/video; field bị mất; Console/Network.

### MOB-03 — Viewport 768 px

- **Chuẩn bị:** Tablet 768 px.
- **Thao tác Web:** Test Grid/Add/Edit/Filter và bộ chọn cột.
- **Kỳ vọng:** Capability giống desktop; thứ tự class ổn định; HIDDEN không xuất hiện trong bộ chọn cột.
- **Nếu lỗi cần lưu:** Ảnh; metadata `mobileClass`/`reasonCodes`; Console/Network.

## 11. Session và fallback

### SES-01 — Metadata 500/502/503

- **Chuẩn bị:** QA operator/mocking gateway làm metadata lần lượt trả 500, 502, 503; user đang đăng nhập.
- **Thao tác Web:** Mở/refresh form ở từng trạng thái.
- **Kỳ vọng:** Không xóa token, không redirect login. Last-known V2 chỉ read-only; legacy giữ legacy; chưa có state thì hiện error shell có Retry.
- **Nếu lỗi cần lưu:** Ảnh; URL cuối; token còn/mất nhưng che giá trị; Console; request URL/payload/status/body.

### SES-02 — Metadata 401 nhưng session còn hạn

- **Chuẩn bị:** Metadata trả 401, `/api/userinfo` trả 200.
- **Thao tác Web:** Mở form.
- **Kỳ vọng:** App gọi `/api/userinfo`, giữ phiên, hiện lỗi form; không về login.
- **Nếu lỗi cần lưu:** Hai request theo thứ tự, status/body, ảnh URL cuối, Console.

### SES-03 — Session thật sự hết hạn

- **Chuẩn bị:** Metadata và `/api/userinfo` cùng trả 401.
- **Thao tác Web:** Mở/refresh form.
- **Kỳ vọng:** Chỉ khi verifier 401 mới chạy luồng logout một lần và về login.
- **Nếu lỗi cần lưu:** Network timeline; URL cuối; Console; không chụp token thật.

### SES-04 — Metadata 403

- **Chuẩn bị:** User còn phiên nhưng không có quyền form.
- **Thao tác Web:** Mở form.
- **Kỳ vọng:** Hiện lỗi quyền form; menu/trang khác vẫn dùng được; không logout.
- **Nếu lỗi cần lưu:** Ảnh; URL; status/body; Console.

### SES-05 — Cutover contract lỗi

- **Chuẩn bị:** Trên QA, operator tạo mismatch TableName/PK có kiểm soát rồi hoàn nguyên.
- **Thao tác Web:** Mở form đã trỏ View V2.
- **Kỳ vọng:** `CUTOVER_CONTRACT_ERROR`; chặn ghi; không âm thầm dùng required/read-only legacy; không mất phiên.
- **Nếu lỗi cần lưu:** Diagnostic code; metadata response; ảnh; Console; SQL error.

## 12. Rollback

File 08 chỉ đổi route đang trỏ đúng V2 và giữ nguyên route đã legacy. Nếu preview nhận `PREVIEW_ROUTE_REVIEW_REQUIRED`, không đặt cờ apply. Nếu nhận `PARTIAL_ROLLBACK_REVIEW` hoặc `ROLLBACK_REVIEW_REQUIRED`, dừng đăng ký lại, lưu toàn bộ result set và đối chiếu route duplicate/missing/unexpected với snapshot baseline.

### RB-01 — Rollback View riêng một form

- **Chuẩn bị:** Một form đã cutover View; lưu before snapshot; ba form còn lại có route đã biết.
- **Thao tác Web:** Trong cùng SSMS connection, đặt `PHASE3_ROLLBACK_APPLY=1`, `PHASE3_ROLLBACK_CONFIRMED=1`, `PHASE3_ROLLBACK_ALL_FORMS=0`, `PHASE3_ROLLBACK_TARGET_FORM=<TARGET_FORM>`; chạy toàn bộ file 08 rồi Refresh trang.
- **Kỳ vọng:** Chỉ View của form mục tiêu về expected legacy; runtime thành `LEGACY_FULL`; form khác không đổi; dữ liệu không đổi.
- **Nếu lỗi cần lưu:** Before/after WA_API của cả bốn form; SQL Messages/error; ảnh Web; Network.

### RB-02 — Rollback Save riêng một form

- **Chuẩn bị:** Save V2 đã cutover và không có transaction đang mở.
- **Thao tác Web:** Sau stage Save, chạy rollback theo đúng target form, refresh và kiểm tra cả ba runtime routes.
- **Kỳ vọng:** File 08 phục hồi toàn bộ route của **một form** về expected legacy; View về old View và Save về `API_LuuDong`; không drop V2, không xóa dữ liệu và không tác động form khác.
- **Nếu lỗi cần lưu:** Before/after route; runtime state; SQL error; ảnh.

### RB-03 — Rollback Delete có điều kiện

- **Chuẩn bị:** Chỉ khi DELETE-02 từng được phê duyệt/cutover.
- **Thao tác Web:** Rollback Delete của form và refresh.
- **Kỳ vọng:** Delete trở về route/policy baseline; không khôi phục record nghiệp vụ bằng script route; không ảnh hưởng form khác.
- **Nếu lỗi cần lưu:** Policy/baseline; before/after route; DB row; SQL error.

### RB-04 — Rollback drill và đăng ký lại

- **Chuẩn bị:** Toàn bộ cases của form đã PASS và có backup.
- **Thao tác Web:** Cutover → verify → rollback → verify legacy → đăng ký lại → verify V2.
- **Kỳ vọng:** Chu trình idempotent; mỗi lần chỉ đúng một row/action; không duplicate WA_API; không đổi `SY_FormatFields`, `SY_FrmCfg` hoặc dữ liệu nghiệp vụ.
- **Nếu lỗi cần lưu:** Timeline, tất cả snapshots/result sets, ảnh/Network ở mỗi trạng thái.

## 13. Phiếu ghi lỗi bắt buộc

Mỗi lỗi tạo một phiếu theo mẫu sau:

```text
Test ID:
Form: F1/F2/F3/F4
Môi trường / DB / thời điểm:
Tài khoản test / group / branch (đã che dữ liệu nhạy cảm):
Trạng thái route View/Save/Delete:
Các bước tái hiện:
Kỳ vọng:
Thực tế:
Ảnh hoặc video:
Console error/warning:
Network Request URL:
Network method và payload (đã che token/dữ liệu nhạy cảm):
HTTP status:
Response body:
SQL error number / level / state / procedure / line / message:
Before/after dữ liệu hoặc WA_API:
Có mất token/redirect login không:
Có thay đổi dữ liệu ngoài ý muốn không:
```

Không chỉ gửi ảnh thông báo đỏ trên Web. Thiếu URL, payload, status, response body hoặc SQL error sẽ khó xác định lỗi nằm ở frontend, gateway, metadata contract hay stored procedure.

## 14. Bảng chốt kết quả theo form

| Gate | F1 | F2 | F3 | F4 |
|---|---|---|---|---|
| Audit TableName/PK/unique | PENDING | PENDING | PENDING | PENDING |
| View V2/list/parity | PENDING | PENDING | PENDING | PENDING |
| Field mới/caption/format/lookup | PENDING | PENDING | PENDING | PENDING |
| Search/sort/paging/filter | PENDING | PENDING | PENDING | PENDING |
| Add/Edit/required/read-only/security | PENDING | PENDING | PENDING | PENDING |
| User/group/branch | PENDING | PENDING | PENDING | PENDING |
| Delete policy | PENDING | PENDING | PENDING | PENDING |
| Mobile 360/390/768 | PENDING | PENDING | PENDING | PENDING |
| Session/fallback | PENDING | PENDING | PENDING | PENDING |
| Rollback thật | PENDING | PENDING | PENDING | PENDING |
| Kết luận form | NOT ACTIVE | NOT ACTIVE | NOT ACTIVE | NOT ACTIVE |

Chỉ đánh dấu form `PHASE3_ACTIVE` khi tất cả gate của form đó PASS và có bằng chứng. Chỉ kết luận Phase 3 READY khi ít nhất ba form đạt toàn bộ gate.

IMPLEMENTED_WAITING_USER_TEST
