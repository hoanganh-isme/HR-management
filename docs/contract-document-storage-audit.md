# Báo cáo kiểm tra lưu trữ tài liệu hợp đồng

Ngày kiểm tra: 15/07/2026  
Cơ sở dữ liệu kiểm tra: `X26DIM_TT` trên SQL Server `13.0.1601.5` (SQL Server 2016 RTM)  
Script kiểm tra: [`inspect_ContractDocumentStorage.sql`](/D:/ForWork/HR/HR-management/sql/Modules/Contract/inspect_ContractDocumentStorage.sql)

## 1. Schema thật `HR_HopDongAttachTbl`

| Cột | Kiểu dữ liệu | Nullable | Ghi nhận |
|---|---|---:|---|
| `UserAutoID` | `varchar(50)` | Không | Khóa chính, không phải identity |
| `MaHopDong` | `nvarchar(100)` | Có | Khóa ngoại đến `HR_HopDongTbl(MaHopDong)`, cascade update/delete |
| `FileName` | `nvarchar(500)` | Có | Tên file |
| `FileType` | `int` | Có | Dữ liệu hiện có là `0` |
| `STT` | `nvarchar(100)` | Có | Thứ tự hiển thị; dữ liệu hiện chỉ có `1` và `2` |
| `Content` | `image` | Có | Nội dung nhị phân chính |
| `Content2` | `image` | Có | Chưa có dữ liệu trong mẫu kiểm tra |
| `FileSize` | `decimal(18,0)` | Có | Kích thước file |
| `Base64Content` | `varchar(max)` | Có | Bản mã Base64, chỉ có ở một phần bản ghi |
| `Base64Content2` | `varchar(max)` | Có | Chưa có dữ liệu trong mẫu kiểm tra |

Ràng buộc chính là `PK_HR_HopDongAttachTbl` trên `UserAutoID` và khóa ngoại `FK_HR_HopDongAttachTbl_HR_HopDongTbl`.

## 2. Dữ liệu thật

- Có `513` dòng trong `HR_HopDongAttachTbl`.
- Cả `513/513` dòng có `Content`.
- `396/513` dòng có cả `Content` và `Base64Content`.
- `117/513` dòng chỉ có `Content`.
- Không có dòng nào chỉ có `Base64Content`.
- Tổng `Content`: `556,137,198` byte.
- Tổng `Base64Content`: `555,538,768` byte.
- `Content2` và `Base64Content2`: tổng kích thước bằng `0` byte.
- File lớn nhất: `Content` `6,502,413` byte; Base64 lớn nhất `7,770,060` byte.
- Tất cả file kiểm tra có phần mở rộng `pdf`.

Chưa có bằng chứng từ schema hoặc dữ liệu cho thấy `Content2`/`Base64Content2` là version, backup hay draft. Vì vậy code mới không sử dụng hai cột này.

## 3. SP, route và hành vi Save hiện tại

Đã kiểm tra:

- `API_HopDongLaoDong_Attach`: View theo `MaHopDong`, trả `Content` và không trả `Base64Content`.
- `API_LuuDong`: Save tổng quát, hiện chỉ trả `code/msg`, không trả `UserAutoID`.
- `API_XoaDong`: Delete tổng quát theo `UserAutoID`.
- `WA_API` hiện ánh xạ `View` vào `API_HopDongLaoDong_Attach`, `Save` vào `API_LuuDong`, `Delete` vào `API_XoaDong`.

Một lần Save thử trong transaction rồi rollback cho thấy `API_LuuDong` trả `code = 0`, `msg = Lưu thành công!`, nhưng ID mới chỉ có thể đọc riêng từ bảng sau khi insert. Đây là lý do luồng finalize mới cần SP Save chuyên biệt trả `UserAutoID`.

## 4. `HR_Documents`

- Object tồn tại dưới dạng bảng `dbo.HR_Documents`.
- Bảng được tạo ngày 10/07/2026.
- Có `0` dòng.
- Schema có `DocumentID uniqueidentifier`, `RefID`, `DocType`, `VersionNo`, `FilePath`, `FileHash`, `TemplateVersion`, `Status`, `GeneratedBy`, `GeneratedAt`, `DeletedBy`, `DeletedAt`.
- Không tìm thấy trigger trên `HR_HopDongAttachTbl` hoặc `HR_Documents`.
- Tra cứu nội dung module/stored procedure chỉ tìm thấy `API_HopDongLaoDong_Attach` tham chiếu trực tiếp `HR_HopDongAttachTbl`; route `HR_Documents` chỉ tồn tại trong `WA_API`, không có dữ liệu nghiệp vụ.

Quyết định: không dùng `HR_Documents` trong luồng hợp đồng mới. Code ghi audit cũ vẫn được giữ để tương thích nhưng đặt sau `USE_LEGACY_HR_DOCUMENTS=false`; khi bật mà ghi lỗi, request không còn báo thành công giả.

## 5. Quyết định triển khai

Đã thêm nhưng **chưa chạy trên DB thật**:

- `API_HopDongLaoDong_Attach_Metadata`: chỉ trả metadata, không trả blob.
- `API_HopDongLaoDong_Attach_File`: đọc nội dung một file theo `UserAutoID`.
- `API_HopDongLaoDong_Attach_Save`: Save idempotent, giữ `UserAutoID` của draft và trả ID.
- `register_ContractDocumentStorage.sql`: đăng ký route mới và đổi route Save của attachment sang SP chuyên biệt.

Các script đã được parse trên SQL Server thật bằng `SET PARSEONLY ON`. Do DB là SQL Server 2016 RTM, các SP mới dùng mẫu tương thích `CREATE stub` rồi `ALTER`, không dùng `CREATE OR ALTER`.

`API_HopDongLaoDong_Attach_Save` cũng đã được chạy trong database tạm local với schema cột giống DB thật. Hai lần gọi cùng `UserAutoID = draft-fixed-id` chỉ tạo một dòng; lần đầu và lần retry đều trả đúng ID. Kết quả kiểm tra nội dung là `Content = 2` byte và `Base64Content = 4` byte. Database tạm được xóa sau test.

## 6. Luồng mới

1. Người dùng chọn hợp đồng và mẫu được đọc từ `HR_HopDongAddfile`.
2. Backend xác minh mẫu, quyền user và quyền chi nhánh.
3. Backend lấy dữ liệu hợp đồng qua SQL Gateway, render DOCX và lưu vào `backend-app/storage/drafts`.
4. OnlyOffice nhận editor config do backend trả về.
5. Callback ký token lưu đúng draft; callback lỗi không xóa draft.
6. Finalize đọc đúng buffer draft, gửi `Content` dạng HEX và `Base64Content` dạng Base64 vào SQL Gateway.
7. Chỉ khi Save trả `UserAutoID` mới đánh dấu finalize và xóa draft.
8. Frontend phát sự kiện refresh tab **Tài liệu đính kèm**.

## 7. Phần chưa thể xác minh hoặc chưa thực hiện

- Chưa chạy migration trên DB thật vì chưa được yêu cầu deploy.
- Chưa kiểm tra callback thực tế với OnlyOffice Document Server cổng `8000`.
- Ý nghĩa nghiệp vụ của `Content2`, `Base64Content2` chưa được xác định từ dữ liệu/SP nên vẫn giữ nguyên, không tái sử dụng.
- `CreatedAt`/`UpdatedAt` không tồn tại trên bảng attachment nên API metadata không thể trả hai trường này.
- `FileType = 0` được xác nhận từ 513 dòng dữ liệu PDF; chưa có quy ước chính thức cho các định dạng khác.
