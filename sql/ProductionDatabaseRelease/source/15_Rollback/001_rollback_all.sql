
/*
  ROLLBACK_ALL phục hồi route/snapshot và definition gốc; không xóa business data,
  không drop bảng mới và không restore toàn database.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ReleaseID varchar(100)='HRM_DB_CLEANUP_20260729';
DECLARE @Actor varchar(100)=LEFT(COALESCE(NULLIF(CONVERT(varchar(128),SUSER_SNAME()),''),'PRODUCTION_DATABASE_ROLLBACK'),100);
DECLARE @MetadataBatchID uniqueidentifier;
DECLARE @FieldBatchID uniqueidentifier;
SELECT @MetadataBatchID=MetadataRouteBatchID,@FieldBatchID=FieldRouteBatchID
FROM dbo.WA_DatabaseReleaseHistory
WHERE ReleaseID=@ReleaseID AND Status='INSTALLED';

IF @FieldBatchID IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.WA_FieldContractRouteBackup WHERE BackupBatchID=@FieldBatchID AND RestoredAt IS NULL)
    EXEC dbo.API_Web_RollbackFieldContractV2
        @WebFormName=NULL,@BatchID=@FieldBatchID,@TargetStatus='SHADOW',@UserName=@Actor;

IF @MetadataBatchID IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.WA_FieldContractRouteBackup WHERE BackupBatchID=@MetadataBatchID AND RestoredAt IS NULL)
    EXEC dbo.API_Web_RollbackFieldContractV2
        @WebFormName=NULL,@BatchID=@MetadataBatchID,@TargetStatus='SHADOW',@UserName=@Actor;
GO

PRINT N'Không có module gốc cần khôi phục definition.';
GO

UPDATE dbo.WA_DatabaseReleaseHistory
SET Status='ROLLED_BACK',RolledBackAt=SYSUTCDATETIME(),RolledBackBy=SUSER_SNAME()
WHERE ReleaseID='HRM_DB_CLEANUP_20260729' AND Status='INSTALLED';
GO

PRINT N'MANUAL_CLEANUP_OPTIONAL: giữ các bảng/control object mới và mọi dữ liệu đã phát sinh; không DROP tự động.';
GO
