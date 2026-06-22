USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_LuuQuyenCuaNhom] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LuuQuyenCuaNhom]
    @NhomNguoiDangThaoTac NVARCHAR(50), -- BẮT BUỘC THÊM: Truyền Session Nhóm của người ĐANG BẤM NÚT LƯU
    @UserGroupID NVARCHAR(50),          -- Nhóm BỊ gán quyền
    @MenuID NVARCHAR(50),               -- Form BỊ gán quyền
    @IsRun BIT,                         
    @IsAdd BIT,                         
    @IsUpdate BIT,                      
    @IsDelete BIT,
    @isManager BIT,
    @isAdmin BIT,
    @isAutoLock BIT,
    @isHideAmount BIT,
    @isLockDoc BIT,
    @isUnLockDoc BIT,
    @isExportExcel BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- =======================================================
    -- BƯỚC 1: CẢNH VỆ HỆ THỐNG - CHỈ SUPER ADMIN MỚI ĐƯỢC CHẠY
    -- Khoá cứng điều kiện: Mã nhóm thao tác bắt buộc phải là 'Admin'
    -- =======================================================
    IF (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        RAISERROR (N'Lỗi Bảo Mật: Bạn không phải Giám đốc Server, cấm sửa Phân Quyền!', 16, 1);
        RETURN; 
    END

    -- =======================================================
    -- BƯỚC 2: CẬP NHẬT DATABASE
    -- =======================================================
    UPDATE WA_UserGroupPermisstion
    SET 
        IsRun = @IsRun,
        IsAdd = @IsAdd,
        IsUpdate = @IsUpdate,
        IsDelete = @IsDelete,
        isManager = @isManager,
        isAdmin = @isAdmin,
        isAutoLock = @isAutoLock,
        isHideAmount = @isHideAmount,
        isLockDoc = @isLockDoc,
        isUnLockDoc = @isUnLockDoc,
        isExportExcel = @isExportExcel
    WHERE UserGroupID = @UserGroupID 
      AND MenuID = @MenuID;

    -- =======================================================
    -- BƯỚC 3: KÍCH HOẠT CÒI BÁO ĐỘNG CHO CÁC TRANG WEB KHÁC TỰ F5 QUYỀN
    -- =======================================================
    IF EXISTS (SELECT 1 FROM SY_Setup WHERE CodeID = 'menu_sync_ver')
        UPDATE SY_Setup SET CodeValue = CONVERT(NVARCHAR(50), GETDATE(), 126) WHERE CodeID = 'menu_sync_ver';
    ELSE
        INSERT INTO SY_Setup (CodeID, CodeName, CodeValue, GroupID) VALUES ('menu_sync_ver', N'Phiên bản đồng bộ Menu', CONVERT(NVARCHAR(50), GETDATE(), 126), 'SY');

END
GO
