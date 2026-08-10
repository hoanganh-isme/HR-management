/*
  Quản lý cấu hình mẫu hợp đồng và dùng chung cho Web/Desktop.
  Chạy script trong đúng database HR mà SQL API đang sử dụng.
  Script idempotent: không xóa dữ liệu hiện có.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.HR_HopDongAddfile', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HR_HopDongAddfile
    (
        FormName NVARCHAR(100) NOT NULL,
        LoaiHD NVARCHAR(100) NOT NULL,
        TemplateFile NVARCHAR(250) NOT NULL,
        GhiChu NVARCHAR(500) NULL,
        CONSTRAINT PK_HR_HopDongAddfile PRIMARY KEY (FormName, LoaiHD)
    );
END;
GO

IF OBJECT_ID(N'dbo.API_HopDongTemplate_Manage', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_HopDongTemplate_Manage AS RETURN 0;');
GO

ALTER PROCEDURE dbo.API_HopDongTemplate_Manage
    @Data NVARCHAR(MAX),
    @UserName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Action NVARCHAR(20) = UPPER(LTRIM(RTRIM(JSON_VALUE(@Data, '$.action'))));
    DECLARE @FormName NVARCHAR(100) = LTRIM(RTRIM(JSON_VALUE(@Data, '$.formName')));
    DECLARE @LoaiHD NVARCHAR(100) = LTRIM(RTRIM(JSON_VALUE(@Data, '$.loaiHD')));
    DECLARE @OriginalLoaiHD NVARCHAR(100) = LTRIM(RTRIM(JSON_VALUE(@Data, '$.originalLoaiHD')));
    DECLARE @TemplateFile NVARCHAR(250) = LTRIM(RTRIM(JSON_VALUE(@Data, '$.templateFile')));
    DECLARE @GhiChu NVARCHAR(500) = NULLIF(LTRIM(RTRIM(JSON_VALUE(@Data, '$.description'))), N'');

    IF NULLIF(@FormName, N'') IS NULL
        THROW 51000, N'Thiếu FormName của cấu hình mẫu hợp đồng.', 1;

    IF @Action = N'LIST'
    BEGIN
        SELECT FormName, LoaiHD, TemplateFile, GhiChu
        FROM dbo.HR_HopDongAddfile
        WHERE FormName = @FormName
        ORDER BY LoaiHD, TemplateFile;
        RETURN;
    END;

    IF @Action = N'GET'
    BEGIN
        SELECT TOP (1) FormName, LoaiHD, TemplateFile, GhiChu
        FROM dbo.HR_HopDongAddfile
        WHERE FormName = @FormName AND LoaiHD = @LoaiHD;
        RETURN;
    END;

    IF @Action = N'COUNT_FILE'
    BEGIN
        SELECT COUNT_BIG(1) AS ReferenceCount
        FROM dbo.HR_HopDongAddfile
        WHERE FormName = @FormName AND LOWER(TemplateFile) = LOWER(@TemplateFile);
        RETURN;
    END;

    IF NULLIF(@Action, N'') IS NULL OR @Action NOT IN (N'CREATE', N'UPDATE', N'DELETE')
        THROW 51000, N'Thao tác quản lý mẫu hợp đồng không hợp lệ.', 1;

    DECLARE @UserGroupID NVARCHAR(100);
    SELECT @UserGroupID = UserGroupID
    FROM dbo.SY_User
    WHERE UserName = @UserName;

    IF NULLIF(@UserGroupID, N'') IS NULL
        THROW 51005, N'Không xác định được nhóm quyền của người đang quản lý mẫu hợp đồng.', 1;

    IF LOWER(@UserGroupID) <> N'admin'
       AND NOT EXISTS (
           SELECT 1
           FROM dbo.WA_UserGroupPermisstion AS P
           INNER JOIN dbo.WA_Menu AS M ON M.MenuID = P.MenuID
           WHERE P.UserGroupID = @UserGroupID
             AND M.FormName = @FormName
             AND ISNULL(P.isAdmin, 0) = 1
       )
        THROW 51006, N'Người dùng chưa được cấp quyền Admin trên form hợp đồng.', 1;

    IF NULLIF(@LoaiHD, N'') IS NULL
        THROW 51000, N'Loại hợp đồng là bắt buộc.', 1;

    IF @Action <> N'DELETE'
    BEGIN
        IF NULLIF(@TemplateFile, N'') IS NULL OR LOWER(RIGHT(@TemplateFile, 5)) <> N'.docx'
            THROW 51000, N'Tệp mẫu phải có định dạng DOCX.', 1;
        IF CHARINDEX(N'/', @TemplateFile) > 0 OR CHARINDEX(N'\', @TemplateFile) > 0
            THROW 51000, N'Tên tệp mẫu không được chứa đường dẫn.', 1;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @Action = N'CREATE'
        BEGIN
            IF EXISTS (
                SELECT 1 FROM dbo.HR_HopDongAddfile
                WHERE FormName = @FormName AND LoaiHD = @LoaiHD
            )
                THROW 51001, N'Loại hợp đồng đã tồn tại.', 1;

            IF EXISTS (
                SELECT 1 FROM dbo.HR_HopDongAddfile
                WHERE FormName = @FormName AND LOWER(TemplateFile) = LOWER(@TemplateFile)
            )
                THROW 51001, N'Tệp mẫu đã được đăng ký.', 1;

            INSERT dbo.HR_HopDongAddfile (FormName, LoaiHD, TemplateFile, GhiChu)
            VALUES (@FormName, @LoaiHD, @TemplateFile, @GhiChu);
        END;

        IF @Action = N'UPDATE'
        BEGIN
            SET @OriginalLoaiHD = COALESCE(NULLIF(@OriginalLoaiHD, N''), @LoaiHD);

            IF NOT EXISTS (
                SELECT 1 FROM dbo.HR_HopDongAddfile
                WHERE FormName = @FormName AND LoaiHD = @OriginalLoaiHD
            )
                THROW 51004, N'Cấu hình mẫu hợp đồng không tồn tại.', 1;

            IF @LoaiHD <> @OriginalLoaiHD AND EXISTS (
                SELECT 1 FROM dbo.HR_HopDongAddfile
                WHERE FormName = @FormName AND LoaiHD = @LoaiHD
            )
                THROW 51001, N'Loại hợp đồng đã tồn tại.', 1;

            IF EXISTS (
                SELECT 1 FROM dbo.HR_HopDongAddfile
                WHERE FormName = @FormName
                  AND LoaiHD <> @OriginalLoaiHD
                  AND LOWER(TemplateFile) = LOWER(@TemplateFile)
            )
                THROW 51001, N'Tệp mẫu đã được đăng ký cho loại hợp đồng khác.', 1;

            UPDATE dbo.HR_HopDongAddfile
            SET LoaiHD = @LoaiHD,
                TemplateFile = @TemplateFile,
                GhiChu = @GhiChu
            WHERE FormName = @FormName AND LoaiHD = @OriginalLoaiHD;
        END;

        IF @Action = N'DELETE'
        BEGIN
            SELECT @TemplateFile = TemplateFile,
                   @GhiChu = GhiChu
            FROM dbo.HR_HopDongAddfile
            WHERE FormName = @FormName AND LoaiHD = @LoaiHD;

            IF NULLIF(@TemplateFile, N'') IS NULL
                THROW 51004, N'Cấu hình mẫu hợp đồng không tồn tại.', 1;

            DELETE dbo.HR_HopDongAddfile
            WHERE FormName = @FormName AND LoaiHD = @LoaiHD;
        END;

        COMMIT TRANSACTION;

        SELECT @FormName AS FormName,
               @LoaiHD AS LoaiHD,
               CASE WHEN @Action = N'DELETE' THEN @TemplateFile ELSE TemplateFile END AS TemplateFile,
               CASE WHEN @Action = N'DELETE' THEN @GhiChu ELSE GhiChu END AS GhiChu
        FROM dbo.HR_HopDongAddfile
        WHERE @Action <> N'DELETE' AND FormName = @FormName AND LoaiHD = @LoaiHD
        UNION ALL
        SELECT @FormName, @LoaiHD, @TemplateFile, @GhiChu
        WHERE @Action = N'DELETE';
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
    THROW 51000, N'Không tìm thấy bảng dbo.WA_API để đăng ký API quản lý mẫu hợp đồng.', 1;
GO

UPDATE dbo.WA_API
SET [SQL] = N'API_HopDongTemplate_Manage',
    Para = N'@Data=N''{JsonData}'', @UserName=N''{User}'''
WHERE [list] = N'API_HopDongTemplate_Manage' AND [func] = N'Execute';

IF @@ROWCOUNT = 0
BEGIN
    INSERT dbo.WA_API ([list], [func], [SQL], Para)
    VALUES (
        N'API_HopDongTemplate_Manage',
        N'Execute',
        N'API_HopDongTemplate_Manage',
        N'@Data=N''{JsonData}'', @UserName=N''{User}'''
    );
END;
GO

PRINT N'Đã cài đặt API quản lý mẫu hợp đồng.';
GO
