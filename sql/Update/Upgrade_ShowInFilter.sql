USE [QLTiec]
GO

-- 1. Thêm cột ShowInFilter vào bảng SY_FormatFields
IF COL_LENGTH('SY_FormatFields', 'ShowInFilter') IS NULL
BEGIN
    ALTER TABLE SY_FormatFields ADD ShowInFilter BIT NOT NULL DEFAULT 0;
END
GO

-- 2. Đã sửa các file API_LayCacTruongGiaoDien.sql, API_DanhSachTruongGiaoDien.sql, API_LuuTruongGiaoDien.sql trực tiếp trong thư mục sql/
-- Vui lòng chạy (Execute) lại nội dung của 3 file đó trong SQL Server Management Studio để áp dụng.
