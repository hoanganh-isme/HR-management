# Kích hoạt Form Contract V2 cho Bảng mức thuế TNCN

## Luồng sau thay đổi

`WA_BangThueTNCNFrm` không còn lấy schema runtime từ `API_LayCacTruongGiaoDien`/`SY_FormatFields`.

Nguồn duy nhất của field contract:

- Membership, thứ tự, kiểu và nullable: bảng vật lý đăng ký trong `SY_FrmLstTbl`, đọc qua `sys.columns`/`sys.types`.
- TableName và PrimaryKey: `SY_FrmLstTbl`.
- Caption/format: `SY_FmtFldTbl` + `SY_FmatTbl`.
- Dropdown: `SY_FrmDrdwTbl`.
- View: `API_BangThueTNCN_V2`.
- Save: `API_LuuDong_V2`, chỉ nhận field writable trong cùng contract.
- Delete: `API_XoaDong_V2`, chỉ nhận PrimaryKey. Nếu bảng có `IsDeleted bit` thì tự xóa mềm; nếu không có `IsDeleted` thì tự xóa cứng trong transaction. FK/constraint của DB vẫn được tôn trọng và lỗi sẽ rollback.

`SY_FormatFields` chỉ còn phục vụ form legacy khác và màn hình audit compare; nó không tham gia runtime của form pilot.

## Thứ tự cài đặt SQL

Chạy đúng database đích, theo thứ tự:

1. `sql/Phase2ApiMigration/01_CREATE_VIEW_V2_PILOT.sql`
2. `sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql`
3. `sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql`
4. `sql/Triggers/TRG_AutoSync_WA_API.sql` (một lần, để không ghi đè route View curated)
5. `sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql`
6. `sql/FieldSyncPhase1/02_API_WEB_LOOKUP_SCHEMA_V2.sql`
7. `sql/FieldSyncPhase1/03_API_WEB_GRID_FIELD_COMPARE_V2.sql`
8. `sql/FieldSyncPhase1/04_DANG_KY_API_READONLY.sql`
9. `sql/FieldSyncPhase1/05_KIEM_TRA_SAU_CAI_DAT.sql`
10. `sql/Phase2RuntimeTests/02_GATEWAY_METADATA_SMOKE_READONLY.sql`
11. `sql/Phase2ApiMigration/05_VERIFY_PILOT_V2.sql`

File 11 phải chạy hết không có `THROW`. File smoke Gateway phải trả bốn dòng metadata; nếu trả `error_number=201` thì sửa Para, nếu `229` thì cấp EXECUTE trực tiếp cho principal của SQL API. `VIEW_CONTRACT` phải là `PASS_UNIFIED_CONTRACT_STATIC`; `SAVE_V2` vẫn nhắc `REQUIRES_TRANSACTION_TEST` và `RUNTIME_SMOKE` nhắc `REQUIRES_WEB_GATEWAY_TEST`. Đây là kiểm tra cấu trúc, chưa tự cho phép ghi dữ liệu.

## Đăng ký ba route V2

Chỉ thực hiện sau khi View và Save đã được test bằng tài khoản thật qua gateway. Trong cùng một cửa sổ SSMS/connection:

```sql
EXEC sys.sp_set_session_context @key=N'PHASE2_APPLY_VIEW', @value=1;
EXEC sys.sp_set_session_context @key=N'PHASE2_APPLY_SAVE', @value=1;
EXEC sys.sp_set_session_context @key=N'PHASE2_APPLY_DELETE', @value=1;

EXEC sys.sp_set_session_context @key=N'PHASE2_VIEW_GATE', @value=1;
EXEC sys.sp_set_session_context @key=N'PHASE2_SAVE_GATE', @value=1;
EXEC sys.sp_set_session_context @key=N'PHASE2_DELETE_GATE', @value=1;
EXEC sys.sp_set_session_context @key=N'PHASE2_ACTOR_VERIFIED', @value=1;
```

Sau đó chạy `sql/Phase2ApiMigration/04_REGISTER_PILOT_V2.sql` trong chính connection đó.

Kỳ vọng `WA_API`:

| Func | SQL |
|---|---|
| View | `API_BangThueTNCN_V2` |
| Save | `API_LuuDong_V2` |
| Delete | `API_XoaDong_V2` |

Đăng ký Delete V2 bật chính sách `AUTO_SOFT_OR_HARD`. Metadata trả `DeleteMode=SOFT` hoặc `DeleteMode=HARD` từ schema vật lý để frontend tự hiện nút Xóa; `IsDeleted` tồn tại nhưng không phải `bit` sẽ bị chặn.

Frontend mở form và polling metadata với `refresh=1`, nên cache backend được làm mới ngay và sau đó kiểm tra lại mỗi `pollSeconds` (hiện là 30 giây). Sau khi đổi `WA_API`, chỉ cần bảo đảm backend mới đã được restart/deploy rồi chạy `scripts/verify-field-sync-staging.mjs`. Verifier phải báo `capabilityVersion=1.0` và ba `runtimeRoutes` đúng V2 trước khi bật frontend.

Sau khi chạy xong, xóa các context trên hoặc đóng cửa sổ SSMS.

## Bật frontend

`env.js` trong source đã bật mặc định đúng một pilot và trỏ metadata qua document service:

```javascript
window.HRM_RUNTIME_CONFIG = Object.assign({}, window.HRM_RUNTIME_CONFIG, {
  FIELD_SYNC: {
    enabled: true,
    shadowMode: false,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 30,
    metadataBaseUrl: '/docserver/api/metadata'
  }
});
```

Deploy đồng thời `env.js`, `index.html` và `src/js/app.bundle.js`. `index.html` dùng version query mới để tránh trình duyệt giữ config/bundle cũ. Cấu hình được inject từ môi trường vẫn có thể đặt `enabled:false` để rollback khẩn cấp; nếu có override thì `metadataBaseUrl` phải trỏ đúng backend-app đang mount router metadata. Sau khi deploy, hard reload trình duyệt.

## Kỳ vọng kiểm thử trên web

1. Network không còn request `API_LayCacTruongGiaoDien` cho `WA_BangThueTNCNFrm`.
2. Metadata chỉ có một request `/api/metadata/grid-schema/WA_BangThueTNCNFrm`; runtime không gọi `/compare`.
3. Grid hiển thị toàn bộ cột vật lý an toàn của bảng theo đúng `column_id`; caption ưu tiên `CaptionVN`, rồi `CaptionEN` trong `SY_FmtFldTbl`, cuối cùng mới fallback về tên cột.
4. Add gửi các field writable và `IsEdit=0`; JSON không có `OrderNo`, `UserName`, `UserCreate` hoặc audit field.
5. Edit gửi PrimaryKey + các field thay đổi và `IsEdit=1`.
6. UserName lấy từ session ở top-level; BranchID và FormName/ERPFormID nằm trong `JsonData` theo đúng wire contract của `API_Gateway_Router`.
7. Delete hoạt động theo `DeleteMode`: `SOFT` khi bảng có `IsDeleted bit`, `HARD` khi bảng không có cột này; `INVALID_ISDELETED_TYPE` phải khóa Delete.
8. Thêm một cột nullable, kiểu an toàn vào bảng vật lý, khai báo cùng `FieldName` trong `SY_FmtFldTbl`, rồi mở lại form hoặc chờ tối đa 30 giây: field mới tự xuất hiện trên Grid/Add/Edit/Filter, có dữ liệu từ View V2 và caption tiếng Việt. Không sửa JavaScript, procedure theo tên field hoặc `SY_FormatFields`.

Ví dụ kiểm tra sau khi thêm `PersonName`:

```sql
SELECT C.column_id, C.name, T.name AS SqlType
FROM sys.columns AS C
JOIN sys.types AS T ON T.user_type_id = C.user_type_id
WHERE C.object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
ORDER BY C.column_id;

SELECT FormName, FieldName, CaptionVN, CaptionEN, FormatID
FROM dbo.SY_FmtFldTbl
WHERE FieldName = 'PersonName';

EXEC dbo.API_Web_GridFieldSchemaV2
    @WebFormName = 'WA_BangThueTNCNFrm',
    @ERPFormID = 'HR_BangThueTNCNFrm',
    @UserName = 'admin',
    @BranchID = '';
```

Kỳ vọng result cuối có dòng `FieldName=PersonName`, `Caption` lấy từ `CaptionVN`, `ShowInGrid=1`, `SupportsInsert=1`, `SupportsUpdate=1` (nếu cột không phải identity/computed/server-managed và không thuộc deny-list).

## Rollback

Tắt frontend trước bằng `enabled:false`, `shadowMode:true`, rồi chạy `sql/Phase2ApiMigration/06_ROLLBACK_PILOT_REGISTRATION.sql` với các rollback gate theo hướng dẫn trong `09_HUONG_DAN_ROLLBACK.md`.
