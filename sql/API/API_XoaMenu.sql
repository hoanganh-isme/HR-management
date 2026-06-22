USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_XoaMenu] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_XoaMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @MenuID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Xóa phân quyền của các menu con
    DELETE FROM WA_UserGroupPermisstion WHERE MenuID IN (SELECT MenuID FROM WA_Menu WHERE Parent = @MenuID);
    DELETE FROM WA_UserPermisstion WHERE MenuID IN (SELECT MenuID FROM WA_Menu WHERE Parent = @MenuID);

    -- 2. Xóa phân quyền của menu hiện tại
    DELETE FROM WA_UserGroupPermisstion WHERE MenuID = @MenuID;
    DELETE FROM WA_UserPermisstion WHERE MenuID = @MenuID;

    -- 3. Xóa các menu con
    DELETE FROM WA_Menu WHERE Parent = @MenuID;

    -- 4. Xóa menu hiện tại
    DELETE FROM WA_Menu WHERE MenuID = @MenuID;

END
GO
