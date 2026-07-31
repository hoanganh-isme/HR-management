/*
  Default constraint cho UserAutoID trong HR_SapCaNhanVienTbl
  Đảm bảo khi INSERT không truyền UserAutoID, SQL Server sẽ tự sinh NEWID() dạng GUID string.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.columns AS C
    WHERE C.object_id = OBJECT_ID(N'dbo.HR_SapCaNhanVienTbl', N'U')
      AND C.name = N'UserAutoID'
      AND C.default_object_id <> 0
)
BEGIN
    ALTER TABLE dbo.HR_SapCaNhanVienTbl
    ADD CONSTRAINT DF_HR_SapCaNhanVienTbl_UserAutoID
    DEFAULT (CONVERT(varchar(50), NEWID()))
    FOR UserAutoID;
    
    PRINT N'Đã thêm DEFAULT (CONVERT(varchar(50), NEWID())) cho HR_SapCaNhanVienTbl.UserAutoID!';
END
ELSE
BEGIN
    PRINT N'Cột HR_SapCaNhanVienTbl.UserAutoID đã có DEFAULT constraint.';
END;
GO
