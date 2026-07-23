# Hướng dẫn rollback đăng ký Phase 3

## Mục tiêu

Rollback chỉ khôi phục route `WA_API` của **một form tại một thời điểm** về contract legacy đã biết. Rollback không:

- drop procedure V2;
- xóa hoặc sửa dữ liệu nghiệp vụ;
- khôi phục dữ liệu đã được Save hoặc hard-delete trước đó; trường hợp này phải dùng backup/DB restore phù hợp;
- xóa `SY_FormatFields`;
- sửa `SY_FrmCfg`;
- xóa mapping form;
- tự thay policy Delete.

## Route đích theo registry

| Form | View legacy | Save legacy | Delete legacy | Ghi chú Delete |
|---|---|---|---|---|
| `WA_BangThueTNCNFrm` | `API_TruyVanDong` | `API_LuuDong` | `API_XoaDong` | Route rollback legacy; V2 dùng `AUTO_SCHEMA` |
| `WA_ChucDanhFrm` | `API_DanhSachChucDanh` | `API_LuuDong` | `API_XoaDong` | Route rollback legacy; V2 dùng `AUTO_SCHEMA` |
| `WA_TitleListFrm` | `API_TruyVanDong` | `API_LuuDong` | `API_XoaDong` | Route rollback legacy; V2 dùng `AUTO_SCHEMA` |
| `WA_ShiftListFrm` | `API_TruyVanDong` | `API_LuuDong` | `API_XoaDong` | Route rollback legacy; V2 dùng `AUTO_SCHEMA` |

Nếu baseline database không khớp bảng này, dừng rollback và đối chiếu bằng chứng trước migration. Không ép route theo suy đoán.

## Điều kiện trước rollback

1. Tạm ngừng thao tác Add/Edit/Delete trên form mục tiêu; bảo đảm không có modal dirty đang mở.
2. Xác nhận đúng server/database và có backup.
3. Chụp trạng thái hiện tại:

   ```sql
   SELECT [list], [func], [SQL], Para
   FROM dbo.WA_API
   WHERE [list] = '<TARGET_FORM>'
     AND [func] IN ('View', 'Save', 'Delete')
   ORDER BY [func], [SQL];
   ```

4. Mỗi action cần rollback phải có đúng một row và đang là expected V2 hoặc đã là expected legacy. Lưu nguyên giá trị `Para` baseline để đối chiếu; nếu baseline khác contract legacy đã biết thì dừng và review trước khi đặt cờ apply.

## Thực hiện

1. Mở `sql/Phase3SimpleCrud/08_ROLLBACK_PHASE3_REGISTRATION.sql`.
2. Trong đúng connection/SPID sẽ chạy file 08, đặt `PHASE3_ROLLBACK_APPLY=1`, `PHASE3_ROLLBACK_CONFIRMED=1`, `PHASE3_ROLLBACK_ALL_FORMS=0` và `PHASE3_ROLLBACK_TARGET_FORM='<TARGET_FORM>'`. Không sửa script thành UPDATE hàng loạt.
3. Chạy toàn bộ file 08 trong cùng connection. Nếu thiếu apply/confirm/scope, kết quả phải chỉ là preview và không row nào đổi. Nếu preview trả `PREVIEW_ROUTE_REVIEW_REQUIRED`, dừng để xử lý route thiếu/trùng/unexpected trước khi apply. Khi đủ cờ, script chỉ đổi route đang trỏ đúng V2; route đã legacy được giữ nguyên cả `SQL` và `Para`.
4. Nếu snapshot trước cutover vẫn dùng Delete legacy, script phải khôi phục nguyên row Delete legacy; không coi “0 row changed” ở action không áp dụng là lỗi dữ liệu.
5. Nếu kết quả là `PREVIEW_ROUTE_REVIEW_REQUIRED`, `PARTIAL_ROLLBACK_REVIEW` hoặc `ROLLBACK_REVIEW_REQUIRED`, lưu output và dừng đăng ký lại. Script có thể đã rollback các route hợp lệ nhưng không tự sửa route duplicate/missing/unexpected.
6. Lưu toàn bộ output và timestamp.

Không thực hiện rollback bằng cách xóa row `WA_API` hoặc chạy script đăng ký legacy cũ có ghi/xóa `SY_FormatFields`.

## Xác minh sau rollback

Chạy lại truy vấn snapshot và kiểm tra:

- View/Save trở về đúng procedure legacy của form.
- `Para` khớp baseline đã chụp. Riêng `WA_ChucDanhFrm` dùng literal legacy `@List=N'WA_ChucDanhFrm'`; ba form generic dùng `{List}`.
- Delete vẫn đúng policy/route trước migration.
- Mỗi `[list]+[func]` có đúng một row.
- `SY_FrmLstTbl`, `SY_FormatFields`, `SY_FrmCfg` và dữ liệu bảng chính không bị thay đổi bởi rollback.
- Frontend nhận state `LEGACY_FULL`; Grid/Add/Edit/Filter/Save/Delete dùng legacy toàn bộ, không trộn schema V2.
- Mở lại trang không trắng, không mất token và không redirect login do lỗi metadata.

Thực hiện smoke test read-only trước. Chỉ thử ghi legacy bằng dữ liệu QA và transaction rollback.

## Rollback drill bắt buộc

Trước khi kích hoạt chính thức, với từng form:

1. Lưu baseline legacy.
2. Đăng ký V2 bằng `05_REGISTER_PHASE3_FORMS.sql` và xác minh.
3. Chạy rollback riêng form bằng `08_ROLLBACK_PHASE3_REGISTRATION.sql`.
4. Xác nhận runtime trở về legacy và dữ liệu không đổi.
5. Chỉ khi drill PASS mới được đăng ký lại V2.

Rollback một form không được làm đổi route của ba form còn lại. Lưu before/after matrix làm bằng chứng.

## Khôi phục V2 sau xử lý sự cố

Không sửa tay `WA_API`. Sau khi nguyên nhân đã được khắc phục, chạy lại audit và toàn bộ gate; sau đó dùng `05_REGISTER_PHASE3_FORMS.sql` cho đúng một form. Registry source code chỉ là allow-list, không phải bằng chứng DB đã an toàn.

## Trạng thái hiện tại

**PENDING — chưa có bằng chứng rollback drill trên database thật.** Vì rollback là gate bắt buộc, cả bốn form vẫn `NOT ACTIVE` và Phase 3 vẫn `NOT READY`.
