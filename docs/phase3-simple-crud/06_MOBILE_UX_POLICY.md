# Chính sách UX mobile cho Unified Field Contract

## Mục tiêu

Phân loại field tại runtime thành `CORE`, `OPTIONAL`, `ADVANCED` hoặc `HIDDEN` từ capability và metadata đã có. Không tạo bảng metadata mới, không lưu kết quả phân loại vào database và không hard-code danh sách field theo từng form.

## Thứ tự quyết định

Áp dụng theo thứ tự ưu tiên sau; kết quả phải kèm `reasonCodes`:

1. **An toàn trước:** sensitive/deny-list, binary/blob, password/token/secret, computed hoặc server-managed không dành cho client → `HIDDEN`.
2. **Required hợp lệ:** field `requiredOnInsert=1`, có editor và không bị chặn an toàn → `CORE`.
3. **Nhận diện nghiệp vụ:** primary key hiển thị, business identifier, tên/caption chính, trạng thái, lookup dependency parent, ngày hiệu lực → `CORE`.
4. **Nội dung phức tạp:** long text, JSON/XML được phép đọc, ghi chú dài hoặc editor nâng cao → `ADVANCED`.
5. **Còn lại:** field an toàn, không bắt buộc → `OPTIONAL`.

Nếu field vừa required vừa thuộc deny-list thì **không render**; contract phải sinh diagnostic chặn Add thay vì làm lộ field. `CORE` không đồng nghĩa `requiredOnInsert`.

## Reason codes chuẩn

| Class | Reason code | Ý nghĩa |
|---|---|---|
| HIDDEN | `SENSITIVE_OR_DENIED` | Tên/type nằm deny-list hoặc bị policy chặn |
| HIDDEN | `BINARY_OR_BLOB` | Kiểu binary/blob không có editor an toàn |
| HIDDEN | `COMPUTED_FIELD` | Cột computed |
| HIDDEN | `SERVER_MANAGED` | Audit/system/identity do server quản lý |
| CORE | `REQUIRED_ON_INSERT` | Bắt buộc khi insert theo nullable/default/identity/computed |
| CORE | `PRIMARY_KEY` | Khóa chính cần nhận diện record; Add/Edit có thể read-only tùy capability |
| CORE | `BUSINESS_IDENTIFIER` | Mã định danh nghiệp vụ |
| CORE | `DISPLAY_NAME_OR_CAPTION` | Tên/caption chính của record |
| CORE | `STATUS_FIELD` | Trạng thái nghiệp vụ |
| CORE | `LOOKUP_PARENT` | Field cha của dependency lookup |
| CORE | `EFFECTIVE_DATE` | Ngày bắt đầu/kết thúc/hiệu lực |
| ADVANCED | `LONG_TEXT` | Nội dung dài, textarea hoặc editor nâng cao |
| ADVANCED | `COMPLEX_EDITOR` | Editor hợp lệ nhưng không phù hợp vùng chính mobile |
| OPTIONAL | `OPTIONAL_SAFE_FIELD` | Field an toàn còn lại |

Có thể trả nhiều reason code cho một field. Không dùng reason code chứa tên form hoặc tên bảng cụ thể.

## Hiển thị theo context

### Grid

- Mobile ưu tiên cột định danh/tên/trạng thái thuộc `CORE`.
- Cột `OPTIONAL` và `ADVANCED` đi vào bảng chi tiết/tùy chọn cột, không ép mọi cột lên viewport.
- `HIDDEN` không xuất hiện trong grid, bộ chọn cột, search hay filter.
- Khả năng sort/filter vẫn phải lấy từ `supportsSort`/`supportsFilter`, không suy diễn từ class mobile.

### Add/Edit

- `CORE` hiển thị trước theo field order ổn định.
- `OPTIONAL` nằm trong nhóm “Thông tin bổ sung”.
- `ADVANCED` nằm trong accordion đóng mặc định.
- `HIDDEN` không tạo control và không được gửi trong payload.
- Field primary key/immutable có thể hiển thị read-only trong Edit; capability ghi vẫn là nguồn quyết định.
- Validation và giá trị người dùng đã nhập phải được giữ khi mở/đóng accordion hoặc đổi orientation.

### Filter

- Chỉ field có `showInFilter=1` và `supportsFilter=1` mới được render.
- `CORE` hiển thị trước; `OPTIONAL`/`ADVANCED` trong “Bộ lọc khác”.
- Lookup dùng contract `lookup`; không đọc `SY_FormatFields` làm nguồn chính.

## Breakpoint nghiệm thu

| Viewport | Kỳ vọng |
|---|---|
| 360 px | Không tràn ngang toolbar/modal; label và editor dùng được; CORE xuất hiện trước |
| 390 px | Nhóm bổ sung/accordion đóng mở không mất dữ liệu; nút Save/Cancel luôn thao tác được |
| 768 px | Tablet giữ đúng thứ tự class; grid và modal không đổi capability so với desktop |

Ngoài ba breakpoint bắt buộc, phải thử bàn phím ảo, zoom 200%, chuỗi caption tiếng Việt dài và orientation landscape.

## Gate và trạng thái hiện tại

- Cần kiểm tra `mobileClass` và `reasonCodes` bằng unit test cho cả bốn form.
- Cần smoke test thật ở 360/390/768 cho Grid/Add/Edit/Filter, validation, lookup và unsaved state.
- **Trạng thái hiện tại: PENDING; chưa có bằng chứng visual QA nên chưa đạt gate mobile.**

