
SET NOCOUNT ON;
SELECT
    N'HRM_DB_CLEANUP_20260729' AS ReleaseID,
    N'INSTALL_COMPLETED' AS InstallStatus,
    49 AS CanonicalObjectCount,
    45 AS ManualReviewCount,
    SYSUTCDATETIME() AS CompletedAtUtc;
GO
