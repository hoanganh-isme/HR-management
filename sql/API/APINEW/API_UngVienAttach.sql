-- 1. Create the HR_CandidateAttachTbl table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'HR_CandidateAttachTbl')
BEGIN
    CREATE TABLE [dbo].[HR_CandidateAttachTbl](
        [UserAutoID] [varchar](50) NOT NULL,
        [CandidateID] [varchar](50) NULL,
        [FileName] [nvarchar](250) NULL,
        [FileType] [int] NULL,
        [STT] [int] NULL,
        [FileSize] [int] NULL,
        [Base64Content] [nvarchar](max) NULL,
        [Content] [varbinary](max) NULL,
        [Notes] [nvarchar](500) NULL,
     CONSTRAINT [PK_HR_CandidateAttachTbl] PRIMARY KEY CLUSTERED 
    (
        [UserAutoID] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

    ALTER TABLE [dbo].[HR_CandidateAttachTbl]  WITH CHECK ADD  CONSTRAINT [FK_HR_CandidateAttachTbl_HR_DanhSachUngVienTbl] FOREIGN KEY([CandidateID])
    REFERENCES [dbo].[HR_DanhSachUngVienTbl] ([CandidateID])
    ON DELETE CASCADE

    ALTER TABLE [dbo].[HR_CandidateAttachTbl] CHECK CONSTRAINT [FK_HR_CandidateAttachTbl_HR_DanhSachUngVienTbl]
END
GO

-- 2. Create the procedure API_CandidateAttach_SaveAvatar
CREATE OR ALTER PROCEDURE [dbo].[API_CandidateAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Extract CandidateID from JSON
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        
        IF @CandidateID IS NULL OR @CandidateID = ''
        BEGIN
            SELECT -1 AS code, N'Lỗi: Không tìm thấy mã ứng viên!' AS msg;
            RETURN;
        END

        -- If uploading Avatar (FileType = 1) -> Find old Avatar to overwrite (UPDATE)
        IF @FileType = 1 
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP 1 @ExistingID = UserAutoID 
            FROM HR_CandidateAttachTbl 
            WHERE (CandidateID = @CandidateID) AND FileType = 1;

            IF @ExistingID IS NOT NULL
            BEGIN
                -- If Avatar exists -> Inject UserAutoID into JSON and change IsEdit = 1
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END
        END
        
        -- Delegate to API_LuuDong
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;
        
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO

-- 3. Register Procedure in WA_API
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_CandidateAttach' AND func = 'SaveAvatar')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('API_CandidateAttach', 'SaveAvatar', 'API_CandidateAttach_SaveAvatar', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
END
GO

-- 4. Register Mapping in SY_FrmLstTbl
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_CandidateAttach')
BEGIN
    INSERT INTO dbo.SY_FrmLstTbl (FormID, TableName, PrimaryKey)
    VALUES ('API_CandidateAttach', 'HR_CandidateAttachTbl', 'UserAutoID');
END
GO
