# Kiểm thử session và fallback Phase 3

## Trạng thái

**PENDING — chưa có bằng chứng chạy trình duyệt/live backend.** Tài liệu này là checklist nghiệm thu, không phải kết quả PASS. Không được đổi trạng thái Phase 3 thành READY chỉ dựa trên unit test hoặc mock.

## Nguyên tắc bắt buộc

- Quyết định logout dựa trên HTTP status và kết quả xác minh `/api/userinfo`, không dựa trên nội dung chuỗi lỗi.
- Lỗi metadata chỉ được ảnh hưởng form đang mở; không tự xóa token hoặc làm mất phiên toàn ứng dụng.
- Form chưa cutover phải chạy **legacy toàn bộ** (`LEGACY_FULL`), không trộn schema V2 với route ghi legacy.
- Form đã cutover nhưng contract không hợp lệ phải fail-safe với mã ổn định (`CUTOVER_CONTRACT_ERROR`), không âm thầm quay về schema legacy.
- Nếu đang mở modal có dữ liệu chưa lưu, không tự refresh contract và không làm mất unsaved state.

## Ma trận kiểm thử

| ID | Tình huống | Thiết lập | Kỳ vọng bắt buộc | Token/redirect | Trạng thái |
|---|---|---|---|---|---|
| SF-01 | Metadata trả 500 | Mock/gateway trả 500 cho `grid-schema` | Nếu đã có V2 cuối cùng: dùng last-known schema ở read-only; nếu đang legacy: giữ legacy; nếu chưa có state: hiện error shell có Retry | Giữ token, không về login | PENDING |
| SF-02 | Metadata trả 502 | Mock/gateway trả 502 | Giống SF-01; lỗi hiển thị theo status, không parse message | Giữ token, không về login | PENDING |
| SF-03 | Metadata trả 503 | Mock/gateway trả 503 | Giống SF-01; retry không tạo vòng lặp request | Giữ token, không về login | PENDING |
| SF-04 | Metadata 401, `/api/userinfo` 200 | Chỉ endpoint metadata trả 401 | Xác minh session; giữ phiên; hiện lỗi form/metadata có Retry | Giữ token, không về login | PENDING |
| SF-05 | Metadata 401, `/api/userinfo` 401 | Cả metadata và session verifier trả 401 | Thực hiện đúng luồng hết phiên hiện có, một lần | Cho phép xóa token và về login | PENDING |
| SF-06 | Metadata 403 | User còn phiên nhưng không có quyền form | Hiện lỗi quyền của form; menu/trang khác vẫn dùng được | Giữ token, không về login | PENDING |
| SF-07 | Registry có form nhưng View còn legacy | `WA_API.View` chưa chuyển V2 | State `LEGACY_FULL`; Grid/Add/Edit/Filter/Save/Delete đều theo legacy | Giữ phiên, không trang trắng | PENDING |
| SF-08 | View đã V2 nhưng contract sai table/PK hoặc thiếu capability | Cố ý làm gate contract fail trên QA | State `CUTOVER_CONTRACT_ERROR`; chặn thao tác ghi; mã lỗi ổn định | Giữ phiên, không fallback hỗn hợp | PENDING |
| SF-09 | Metadata hồi phục sau 502 | Trả 502 rồi 200 | Retry/focus refresh lấy contract mới đúng một lần; bỏ read-only khi state hợp lệ | Giữ phiên | PENDING |
| SF-10 | Modal Add/Edit đang dirty khi poll/focus | Mở modal, nhập dữ liệu rồi kích hoạt refresh | Hoãn áp dụng schema mới đến khi modal đóng/lưu/hủy; dữ liệu nhập không mất | Giữ phiên | PENDING |

## Cách chạy

1. Chạy backend và frontend bằng cấu hình QA; đăng nhập bằng tài khoản test đang hoạt động.
2. Mở DevTools, bật `Preserve log`; ghi lại token trước test nhưng phải che giá trị khi lưu bằng chứng.
3. Dùng test double/gateway QA để ép từng status 500, 502, 503, 401 và 403 cho duy nhất endpoint metadata. Không sửa dữ liệu nghiệp vụ.
4. Với case 401, ghi riêng request `/api/userinfo` và kết quả 200/401.
5. Với SF-07, dùng một form registry mà `WA_API.View` vẫn là `oldView`; xác nhận toàn bộ route vẫn legacy.
6. Với SF-08, chỉ tạo sai lệch có kiểm soát trên QA và hoàn nguyên ngay; không thử trên production.
7. Chạy regression tự động:

   ```powershell
   node --test tests/phase3-simple-crud.test.mjs
   ```

8. Lưu bằng chứng cho mỗi case: thời điểm, form, HTTP status, state runtime, số lần `/api/userinfo`, token còn/mất, URL cuối và ảnh Network/Console đã che thông tin nhạy cảm.

## Gate nghiệm thu

Một form chỉ đạt gate session/fallback khi SF-01 đến SF-10 đều PASS trên build sẽ triển khai. Unit test mock không thay thế smoke test trình duyệt. Chỉ một case làm mất token sai hoặc redirect login sai cũng làm form đó không được `PHASE3_ACTIVE`.

