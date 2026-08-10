/*
  Khôi phục nguyên bản đăng ký cho WA_PersonFullFrm trỏ về bảng vật lý HR_PersonTbl.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- 1. Khôi phục TableName của WA_PersonFullFrm trong SY_FrmLstTbl về HR_PersonTbl
    UPDATE dbo.SY_FrmLstTbl
    SET TableName = 'HR_PersonTbl',
        PrimaryKey = 'PersonID'
    WHERE FormID = 'WA_PersonFullFrm';

    -- 2. Khôi phục ExpectedTableName trong WA_FieldContractRegistry về HR_PersonTbl
    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
    BEGIN
        UPDATE dbo.WA_FieldContractRegistry
        SET ExpectedTableName = N'HR_PersonTbl',
            ExpectedPrimaryKey = N'PersonID',
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = 'SYSTEM_REVERT_TO_TABLE'
        WHERE WebFormName = 'WA_PersonFullFrm';
    END;

    COMMIT TRANSACTION;
    PRINT N'✅ Đã khôi phục thành công schema WA_PersonFullFrm về HR_PersonTbl!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
