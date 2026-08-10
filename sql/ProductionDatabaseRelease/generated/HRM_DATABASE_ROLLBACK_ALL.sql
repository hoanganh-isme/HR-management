
/*
  ROLLBACK_ALL - HRM_DB_CLEANUP_20260729
  FILE SINH TỰ ĐỘNG. KHÔNG SỬA TRỰC TIẾP.
  Build: node ./scripts/db-release/build-production-database-release.mjs
  Package manifest SHA-256: 4e594fe8ca7978f795ada71b45044019c79cee25ec9b060a83c7a5e2bd79fbe0
*/
:on error exit
:setvar TargetDatabase "X26DIMTUTAC"
:setvar ReleaseMode "PRODUCTION"

USE [$(TargetDatabase)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/15_Rollback/001_rollback_all.sql | SHA-256: e88745a666c80e89bcaa807333df826b5e28a8de11f8afb90d9de5b312115cd8 ===== */

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
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/15_Rollback/001_rollback_all.sql ===== */
