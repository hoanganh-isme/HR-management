USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachLoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        LoaiHD 
    FROM dbo.HR_PersonView 
    WHERE ISNULL(LoaiHD, '') <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO
