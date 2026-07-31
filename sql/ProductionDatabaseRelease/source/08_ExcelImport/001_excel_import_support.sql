
/* Bulk Import dùng #temp table trong transaction; không tạo staging table lâu dài. */
SET NOCOUNT ON;
SELECT N'EXCEL_IMPORT_SUPPORT' AS SupportName,
       N'DIRECT_SQL_WITH_TEMP_TABLE_NO_PERSISTENT_OBJECT' AS Decision;
GO
