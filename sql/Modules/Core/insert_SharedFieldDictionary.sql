SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.SY_FmtFldTbl', 'U') IS NULL
        THROW 51200, 'SY_FmtFldTbl does not exist.', 1;

    DECLARE @SharedFields TABLE (
        FieldName VARCHAR(128) NOT NULL PRIMARY KEY,
        FormatID VARCHAR(10) NULL,
        CaptionVN NVARCHAR(255) NOT NULL,
        CaptionEN NVARCHAR(255) NULL,
        AlignX VARCHAR(20) NULL
    );

    INSERT INTO @SharedFields (FieldName, FormatID, CaptionVN, CaptionEN, AlignX)
    VALUES
        ('DocumentID', 't', N'Mã chứng từ', N'Document ID', NULL),
        ('DocumentDate', 'd', N'Ngày chứng từ', N'Document Date', NULL),
        ('PeriodID', 'sl', N'Kỳ', N'Period', NULL),
        ('BranchID', 'sl', N'Chi nhánh', N'Branch', NULL),
        ('PersonID', 'sl', N'Mã nhân viên', N'Employee ID', NULL),
        ('UserAutoID', 't', N'Mã hệ thống', N'System ID', NULL),
        ('UserCreate', 't', N'Người tạo', N'Created By', NULL),
        ('UserUpdate', 't', N'Người cập nhật', N'Updated By', NULL),
        ('DateCreate', 'd', N'Ngày tạo', N'Created At', NULL),
        ('DateUpdate', 'd', N'Ngày cập nhật', N'Updated At', NULL),
        ('GhiChu', 't', N'Ghi chú', N'Notes', NULL),
        ('Notes', 't', N'Ghi chú', N'Notes', NULL);

    IF EXISTS (
        SELECT dictionary.FieldName
        FROM dbo.SY_FmtFldTbl dictionary
        INNER JOIN @SharedFields seed ON seed.FieldName = dictionary.FieldName
        WHERE ISNULL(dictionary.FormName, '') = ''
        GROUP BY dictionary.FieldName
        HAVING COUNT(*) > 1
    )
        THROW 51201, 'Duplicate global field dictionary rows must be reviewed before seeding.', 1;

    UPDATE dictionary WITH (UPDLOCK, HOLDLOCK)
       SET FormatID = seed.FormatID,
           CaptionVN = seed.CaptionVN,
           CaptionEN = seed.CaptionEN,
           AlignX = seed.AlignX
    FROM dbo.SY_FmtFldTbl dictionary
    INNER JOIN @SharedFields seed ON seed.FieldName = dictionary.FieldName
    WHERE ISNULL(dictionary.FormName, '') = '';

    DECLARE @UpdatedCount INT = @@ROWCOUNT;

    INSERT INTO dbo.SY_FmtFldTbl
        (FormatID, FieldName, FormName, CaptionVN, CaptionEN, AlignX)
    SELECT
        seed.FormatID,
        seed.FieldName,
        NULL,
        seed.CaptionVN,
        seed.CaptionEN,
        seed.AlignX
    FROM @SharedFields seed
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.SY_FmtFldTbl dictionary WITH (UPDLOCK, HOLDLOCK)
        WHERE dictionary.FieldName = seed.FieldName
          AND ISNULL(dictionary.FormName, '') = ''
    );

    DECLARE @InsertedCount INT = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT
        0 AS code,
        @InsertedCount AS InsertedCount,
        @UpdatedCount AS UpdatedCount,
        N'Shared field dictionary seed completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
