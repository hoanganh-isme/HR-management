SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Save chuyên biệt cho file đính kèm nghỉ phép.
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep_Attach_Save
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @UserAutoID VARCHAR(50) = NULLIF(JSON_VALUE(@Data, '$.UserAutoID'), '');
        DECLARE @DocumentID NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.DocumentID'), N'');
        DECLARE @FileName NVARCHAR(500) = NULLIF(JSON_VALUE(@Data, '$.FileName'), N'');
        DECLARE @FileType INT = TRY_CONVERT(INT, JSON_VALUE(@Data, '$.FileType'));
        DECLARE @STT NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.STT'), N'');
        DECLARE @FileSize DECIMAL(18, 0) = TRY_CONVERT(DECIMAL(18, 0), JSON_VALUE(@Data, '$.FileSize'));
        DECLARE @ContentText NVARCHAR(MAX) = (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Content');
        DECLARE @Base64Content VARCHAR(MAX) = TRY_CONVERT(VARCHAR(MAX), (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Base64Content'));
        DECLARE @Content VARBINARY(MAX) = NULL;
        DECLARE @BranchID VARCHAR(50);
        DECLARE @UserBranchID VARCHAR(500);
        DECLARE @UserGroupID VARCHAR(50);
        DECLARE @MenuID NVARCHAR(50);

        IF @DocumentID IS NULL OR @FileName IS NULL OR ISJSON(@Data) <> 1
            THROW 51800, N'Dữ liệu file đính kèm không hợp lệ.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.HR_NghiPhepTbl WHERE DocumentID = @DocumentID)
            THROW 51801, N'Đơn nghỉ phép không tồn tại.', 1;

        SELECT @BranchID = P.BranchID
        FROM dbo.HR_NghiPhepTbl H
        LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = H.PersonID
        WHERE H.DocumentID = @DocumentID;

        SELECT
            @UserBranchID = U.BranchID,
            @UserGroupID = U.UserGroupID
        FROM dbo.SY_User U
        WHERE U.UserName = @UserName;

        IF UPPER(ISNULL(@UserName, '')) <> 'ADMIN'
        BEGIN
            IF @UserGroupID IS NULL
                THROW 51802, N'Không xác định được quyền người dùng.', 1;

            SELECT TOP (1) @MenuID = MenuID
            FROM dbo.WA_Menu
            WHERE FormName = 'WA_DonXinNghiPhepFrm';

            IF @MenuID IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM dbo.WA_UserGroupPermisstion
                WHERE UserGroupID = @UserGroupID
                  AND MenuID = @MenuID
                  AND (ISNULL(IsAdd, 0) = 1 OR ISNULL(IsUpdate, 0) = 1)
            )
                THROW 51803, N'Bạn không có quyền lưu tài liệu đơn xin nghỉ phép.', 1;

            IF NULLIF(LTRIM(RTRIM(@UserBranchID)), '') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM STRING_SPLIT(@UserBranchID, ',')
                   WHERE UPPER(LTRIM(RTRIM(value))) = UPPER(ISNULL(@BranchID, ''))
               )
                THROW 51804, N'Bạn không có quyền lưu tài liệu của chi nhánh này.', 1;
        END;

        IF @UserAutoID IS NULL
            SET @UserAutoID = LOWER(CONVERT(VARCHAR(36), NEWID()));

        IF @STT IS NULL
            SELECT @STT = CONVERT(NVARCHAR(100), ISNULL(MAX(TRY_CONVERT(INT, STT)), 0) + 1)
            FROM dbo.HR_NghiPhepAttachTbl WITH (UPDLOCK, HOLDLOCK)
            WHERE DocumentID = @DocumentID;

        IF @ContentText IS NOT NULL AND LTRIM(RTRIM(@ContentText)) <> N''
        BEGIN
            IF LOWER(LEFT(@ContentText, 2)) = N'0x'
                SET @Content = CONVERT(VARBINARY(MAX), @ContentText, 1);
            ELSE
                SET @Content = CAST(N'' AS XML).value('xs:base64Binary(sql:variable("@ContentText"))', 'varbinary(max)');
        END;

        IF EXISTS (SELECT 1 FROM dbo.HR_NghiPhepAttachTbl WHERE UserAutoID = @UserAutoID)
        BEGIN
            IF EXISTS (
                SELECT 1 FROM dbo.HR_NghiPhepAttachTbl
                WHERE UserAutoID = @UserAutoID AND DocumentID = @DocumentID
            )
            BEGIN
                SELECT 0 AS code, N'File đính kèm đã được lưu trước đó.' AS msg, @UserAutoID AS UserAutoID;
                RETURN;
            END;
            THROW 51805, N'UserAutoID đã tồn tại ở đơn nghỉ phép khác.', 1;
        END;

        INSERT INTO dbo.HR_NghiPhepAttachTbl (
            UserAutoID, DocumentID, FileName, FileType, STT, Content, FileSize, Base64Content
        )
        VALUES (
            @UserAutoID, @DocumentID, @FileName, ISNULL(@FileType, 0), @STT, @Content, @FileSize, @Base64Content
        );

        SELECT 0 AS code, N'Lưu file đính kèm thành công.' AS msg, @UserAutoID AS UserAutoID;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg, NULL AS UserAutoID;
    END CATCH;
END;
GO
