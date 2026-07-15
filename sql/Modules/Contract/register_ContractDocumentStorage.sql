SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.API_HopDongLaoDong_Attach_Metadata', 'P') IS NULL
        THROW 51810, 'Chua cai dat API_HopDongLaoDong_Attach_Metadata.', 1;
    IF OBJECT_ID('dbo.API_HopDongLaoDong_Attach_File', 'P') IS NULL
        THROW 51811, 'Chua cai dat API_HopDongLaoDong_Attach_File.', 1;
    IF OBJECT_ID('dbo.API_HopDongLaoDong_Attach_Save', 'P') IS NULL
        THROW 51812, 'Chua cai dat API_HopDongLaoDong_Attach_Save.', 1;

    UPDATE dbo.WA_API
       SET [SQL] = 'API_HopDongLaoDong_Attach_Save',
           Para = N'@Data=N''{JsonData}'', @UserName=N''{User}'''
     WHERE list = 'API_HopDongLaoDong_Attach' AND func = 'Save';

    IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_HopDongLaoDong_Attach' AND func = 'Save')
        THROW 51813, 'Khong tim thay route Save API_HopDongLaoDong_Attach.', 1;

    UPDATE dbo.WA_API
       SET [SQL] = 'API_HopDongLaoDong_Attach_Metadata',
           Para = N'@MaHopDong=N''{MaHopDong}'', @UserAutoID=N''{UserAutoID}'', @BranchID=N''{BranchID}'''
     WHERE list = 'API_HopDongLaoDong_Attach_Metadata' AND func = 'View';

    IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_HopDongLaoDong_Attach_Metadata' AND func = 'View')
        INSERT INTO dbo.WA_API (list, func, [SQL], Para)
        VALUES ('API_HopDongLaoDong_Attach_Metadata', 'View', 'API_HopDongLaoDong_Attach_Metadata', N'@MaHopDong=N''{MaHopDong}'', @UserAutoID=N''{UserAutoID}'', @BranchID=N''{BranchID}''');

    UPDATE dbo.WA_API
       SET [SQL] = 'API_HopDongLaoDong_Attach_File',
           Para = N'@UserAutoID=N''{UserAutoID}'''
     WHERE list = 'API_HopDongLaoDong_Attach_File' AND func = 'View';

    IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_HopDongLaoDong_Attach_File' AND func = 'View')
        INSERT INTO dbo.WA_API (list, func, [SQL], Para)
        VALUES ('API_HopDongLaoDong_Attach_File', 'View', 'API_HopDongLaoDong_Attach_File', N'@UserAutoID=N''{UserAutoID}''');

    COMMIT TRANSACTION;
    SELECT 0 AS code, N'Đăng ký API tài liệu hợp đồng thành công.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

