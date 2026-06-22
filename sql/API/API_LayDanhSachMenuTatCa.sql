USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_LayDanhSachMenuTatCa] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LayDanhSachMenuTatCa]
    @NhomNguoiDangThaoTac NVARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MenuID AS [id],
        COALESCE(Parent, '') AS [parent],
        COALESCE(VN, '') AS [label],
        COALESCE(SubTitle, '') AS [subTitle],
        COALESCE(EN, '') AS [en],
        COALESCE(FormName, '') AS [formName],
        COALESCE(FormKey, '') AS [formKey],
        COALESCE(URLPara, '') AS [urlPara],
        COALESCE(IconClass, '') AS [icon],
        COALESCE(isDisable, 0) AS [isDisable]
    FROM WA_Menu
    ORDER BY MenuID ASC;
END
GO
