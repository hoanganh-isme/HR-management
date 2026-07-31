/*
  Bulk Import dùng #temp table trong cùng transaction.
  Vì vậy không cần tạo object hỗ trợ lâu dài trong database.
  File này chỉ ghi nhận bước setup để pipeline triển khai có thứ tự rõ ràng.
*/
SET NOCOUNT ON;
SELECT
    N'EXCEL_IMPORT_SUPPORT' AS SupportName,
    N'Không tạo object vật lý; backend tự tạo # staging tạm trong transaction.' AS Decision,
    SYSUTCDATETIME() AS CheckedAtUtc;
