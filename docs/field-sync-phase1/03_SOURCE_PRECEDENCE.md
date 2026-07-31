# Thứ tự nguồn Grid Field Schema V2

## 1. Resolve operation

Tìm đúng một dòng `WA_API` với `list = WebFormName` và `func = View`, sau đó lấy tên stored procedure. `Para` chỉ được dùng trong tầng gateway hiện hữu và không được đưa vào response browser. Thiếu hoặc trùng đăng ký là lỗi fail-closed.

## 2. Resolve field/order

1. Ưu tiên mô tả result-set của View stored procedure bằng `sys.dm_exec_describe_first_result_set_for_object`.
2. Nếu SP dùng SQL động hoặc không mô tả được, lấy `TableName` từ ERP form trong `SY_FrmLstTbl` và đọc `sys.columns` theo thứ tự `column_id`.
3. Chỉ `FormID`, `TableName`, `PrimaryKey` được dùng từ `SY_FrmLstTbl`. Không đọc các layout array.
4. Không chạy `SELECT *` để dò schema.

## 3. Caption

Với mỗi field, so sánh tên không phân biệt hoa/thường nhưng giữ casing của result-set. Thứ tự:

1. `SY_FmtFldTbl.FormName = ERPFormID`.
2. `SY_FmtFldTbl.FormName = WebFormName` để tương thích migration.
3. `SY_FmtFldTbl.FormName` NULL/rỗng.
4. Alias/caption từ result-set.
5. `FieldName`.

Các cột dùng từ `SY_FmtFldTbl`: `FieldName`, `FormName`, `CaptionVN`, `CaptionEN`, `FormatID`, `AlignX`, `MinWidth`, `MaxWidth`.

## 4. Format

`SY_FmatTbl` là catalog format. Các cột dùng: `FormatID`, `FormatString`, `MaskString`, `NumberDecimal`, `Type`, `Align`, `MinValue`, `MaxValue`, `MaxLength`.

Registry Phase 1:

| Format/SQL | Render type |
|---|---|
| `D` | `date` |
| `DT` | `datetime` |
| `H` | `time` |
| `B` | `money` |
| `Q` | `decimal` |
| `N`, `N0`, `N3` | `number` |
| SQL `bit` | `boolean` |
| Có dropdown | `lookup` |
| Không khớp | suy luận SQL type, cuối cùng `text` |

Không lấy `FormatID` trong `SY_FormatFields` làm nguồn chính cho Grid V2.

## 5. Dropdown

Thứ tự chọn dòng `SY_FrmDrdwTbl`:

1. `FormID = ERPFormID`.
2. `FormID = WebFormName` chỉ để tương thích.

Frontend chỉ nhận `lookupKey`, `valueField`, `displayField`, `displayColumns`, `dependsOn`, `multiSelect`, `reloadMode`. Backend lọc identifier trước khi trả. `Source`, `DefaultValueSQL` và parameter raw không xuất hiện trong contract browser.

Lookup search chỉ hỗ trợ:

- `ValueList`: tách danh sách tĩnh, không thực thi SQL.
- Tên `WA_API View` đã đăng ký duy nhất: backend gọi qua gateway và sanitize kết quả.
- Mọi dạng khác, đặc biệt câu lệnh nằm trong `Source`: trả `409 LOOKUP_SOURCE_NOT_REGISTERED`.

## 6. Quyền và cách ly

Mỗi request cần Bearer token, username chuẩn và branch context. Backend gọi `API_UserInfo` để buộc username vào phiên upstream; SQL contract tiếp tục kiểm tra `SY_User.Disable`, quyền chạy form qua `WA_Menu`/`WA_UserGroupPermisstion` và tập branch phải nằm trong `SY_User.BranchID`. Cache key gồm loại schema, form, user và branch đã chuẩn hóa.

## 7. Ngoài phạm vi

Layout Add/Edit, master-detail, `LYT*`, `PFID` và nguồn cấu hình layout chưa được đọc hay sửa trong Phase 1. Add/Edit/Filter tiếp tục dùng `SY_FormatFields` legacy.
