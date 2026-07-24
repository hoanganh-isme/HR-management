/*
  Phase 4A SQL Registry: Inline Table-Valued Function dbo.API_Phase4JoinRegistry()
  Bảo mật allow-list và khai báo hợp đồng metadata cho các bảng detail chứa câu lệnh JOIN.
  Mỗi entry định nghĩa mối quan hệ giữa WebFormName + DetailKey và Stored Procedure/Bảng chính/Primary Key.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
BEGIN
    EXEC(N'CREATE FUNCTION dbo.API_Phase4JoinRegistry() RETURNS TABLE AS RETURN (SELECT CAST(1 AS int) AS Stub)');
END;
GO

ALTER FUNCTION dbo.API_Phase4JoinRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CAST('WA_CaLamViecFrm' AS varchar(100)) AS WebFormName,
        CAST('SHIFT_DETAIL' AS varchar(80)) AS DetailKey,
        CAST('API_CaLamViec_ChiTiet' AS varchar(100)) AS ApiList,
        CAST('API_CaLamViec_ChiTiet' AS varchar(128)) AS ExpectedProcedure,
        CAST('HR_SapCaChiTietTbl' AS varchar(128)) AS ExpectedTableName,
        CAST('UserAutoID' AS varchar(128)) AS ExpectedPrimaryKey,
        CAST(1 AS bit) AS IsReadOnly,
        CAST(1 AS bit) AS EnableMetadata
);
GO

PRINT N'✅ Đã khởi tạo thành công TVF dbo.API_Phase4JoinRegistry cho Phase 4A!';
GO
