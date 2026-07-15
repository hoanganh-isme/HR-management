/**
 * Trách nhiệm: biểu diễn lỗi nghiệp vụ có HTTP status rõ ràng.
 * Đầu vào: status, mã lỗi và thông báo.
 * Đầu ra: HttpError cho controller chuẩn hóa response.
 * Nơi gọi: service và controller tài liệu hợp đồng.
 */
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

