/*
  Giữ nguyên public function cũ nhưng chuyển nguồn sang DB registry.
  Không còn VALUES hard-code trong API_Phase3SimpleCrudRegistry/API_Phase4JoinRegistry.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
    THROW 54000, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    EXEC(N'CREATE FUNCTION dbo.API_Phase3SimpleCrudRegistry()
        RETURNS TABLE AS RETURN
        (SELECT CAST(NULL AS varchar(100)) AS WebFormName WHERE 1 = 0);');
GO

ALTER FUNCTION dbo.API_Phase3SimpleCrudRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
                        AND A.[func] = 'View'), R.ViewProcedure)
            ELSE R.ViewProcedure END) AS OldView,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
                        AND A.[func] = 'View'), R.ViewProcedure)
            ELSE R.ViewProcedure END) AS ViewV2,
        CONVERT(sysname, N'API_LuuDong') AS OldSave,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = R.WebFormName AND A.[func] = 'Save'), R.SaveProcedure)
            ELSE R.SaveProcedure END) AS SaveV2,
        CONVERT(sysname, N'API_XoaDong') AS OldDelete,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = R.WebFormName AND A.[func] = 'Delete'), R.DeleteProcedure)
            ELSE R.DeleteProcedure END) AS DeleteV2,
        R.PermissionFormName,
        R.WritePolicy,
        CASE
            WHEN R.BranchPolicy <> 'AUTO_SCHEMA' THEN R.BranchPolicy
            WHEN EXISTS
            (
                SELECT 1
                FROM sys.columns AS C
                WHERE C.object_id = OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U')
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT
                      IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ) THEN CONVERT(varchar(40), 'BRANCH_SCOPED')
            ELSE CONVERT(varchar(40), 'GLOBAL_REFERENCE')
        END AS BranchPolicy,
        CONVERT(bit, CASE WHEN R.ViewProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableView,
        CONVERT(bit, CASE WHEN R.SaveProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableSave,
        CONVERT(bit, CASE WHEN R.DeleteProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, CASE WHEN R.BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' THEN 1 ELSE 0 END)
            AS GlobalReferenceOnly
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND R.ContractType IN
          ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY')
      AND R.ExpectedTableName IS NOT NULL
      AND R.ExpectedPrimaryKey IS NOT NULL

    UNION ALL

    SELECT
        D.ApiList AS WebFormName,
        R.ERPFormID,
        D.ExpectedTableName,
        D.ExpectedPrimaryKey,
        CONVERT(sysname, D.ViewProcedure) AS OldView,
        CONVERT(sysname, D.ViewProcedure) AS ViewV2,
        CONVERT(sysname, N'API_LuuDong') AS OldSave,
        CONVERT(sysname, D.SaveProcedure) AS SaveV2,
        CONVERT(sysname, N'API_XoaDong') AS OldDelete,
        CONVERT(sysname, D.DeleteProcedure) AS DeleteV2,
        R.PermissionFormName,
        D.WritePolicy,
        D.BranchPolicy,
        CONVERT(bit, 0) AS EnableView,
        CONVERT(bit, CASE WHEN D.IsReadOnly = 0 AND D.SaveProcedure IS NOT NULL THEN 1 ELSE 0 END)
            AS EnableSave,
        CONVERT(bit, CASE WHEN D.IsReadOnly = 0 AND D.DeleteProcedure IS NOT NULL THEN 1 ELSE 0 END)
            AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, 0) AS GlobalReferenceOnly
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN dbo.WA_FieldContractRegistry AS R
      ON R.WebFormName = D.WebFormName
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.ExpectedTableName IS NOT NULL
      AND D.ExpectedPrimaryKey IS NOT NULL
);
GO

IF OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
    EXEC(N'CREATE FUNCTION dbo.API_Phase4JoinRegistry()
        RETURNS TABLE AS RETURN
        (SELECT CAST(NULL AS varchar(100)) AS WebFormName WHERE 1 = 0);');
GO

ALTER FUNCTION dbo.API_Phase4JoinRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        D.WebFormName,
        D.DatasetKey AS DetailKey,
        D.ApiList,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'View'), D.ViewProcedure)
            ELSE D.ViewProcedure END) AS ExpectedProcedure,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'Save'), D.SaveProcedure)
            ELSE D.SaveProcedure END) AS ExpectedSaveProcedure,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'Delete'), D.DeleteProcedure)
            ELSE D.DeleteProcedure END) AS ExpectedDeleteProcedure,
        D.ExpectedTableName,
        D.ExpectedPrimaryKey,
        D.IsReadOnly,
        CONVERT(bit, 1) AS EnableMetadata
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN dbo.WA_FieldContractRegistry AS R
      ON R.WebFormName = D.WebFormName
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.ExpectedTableName IS NOT NULL
      AND D.ExpectedPrimaryKey IS NOT NULL
      AND D.ViewProcedure IS NOT NULL
);
GO

IF OBJECT_ID(N'dbo.API_Web_FieldContractResolveV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_FieldContractResolveV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_FieldContractResolveV2
    @FormName varchar(100),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @FormName = LTRIM(RTRIM(ISNULL(@FormName, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @FormName = '' OR @UserName = ''
        THROW 54001, N'FIELD_CONTRACT_CONTEXT_REQUIRED', 1;

    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.PermissionFormName,
        R.ContractType,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        R.ViewList,
        R.ViewProcedure,
        R.SaveProcedure,
        R.DeleteProcedure,
        R.WritePolicy,
        R.BranchPolicy,
        R.DeletePolicy,
        R.RolloutStatus,
        R.RolloutReason,
        R.SchemaVersion,
        R.IsEnabled,
        D.DatasetKey,
        D.ApiList,
        D.ViewProcedure AS DatasetViewProcedure,
        D.ExpectedTableName AS DatasetExpectedTableName,
        D.ExpectedPrimaryKey AS DatasetExpectedPrimaryKey,
        D.ParentField,
        D.ChildField,
        D.IsReadOnly,
        D.SaveProcedure AS DatasetSaveProcedure,
        D.DeleteProcedure AS DatasetDeleteProcedure,
        D.WritePolicy AS DatasetWritePolicy,
        D.BranchPolicy AS DatasetBranchPolicy,
        D.RolloutStatus AS DatasetRolloutStatus,
        D.RolloutReason AS DatasetRolloutReason,
        D.SchemaVersion AS DatasetSchemaVersion
    FROM dbo.WA_FieldContractRegistry AS R
    LEFT JOIN dbo.WA_FieldDatasetRegistry AS D
      ON D.WebFormName = R.WebFormName
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @FormName COLLATE DATABASE_DEFAULT
    ORDER BY D.DatasetKey;
END;
GO

/*
  Đăng ký resolver vào gateway bằng đúng một route; không xóa các route khác.
*/
IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
    THROW 54003, N'WA_API_NOT_FOUND', 1;
GO

BEGIN TRANSACTION;
BEGIN TRY
    IF (SELECT COUNT(*) FROM dbo.WA_API
        WHERE [list] = 'API_Web_FieldContractResolveV2' AND [func] = 'View') > 1
        THROW 54004, N'FIELD_CONTRACT_RESOLVE_ROUTE_DUPLICATE', 1;

    IF EXISTS
    (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = 'API_Web_FieldContractResolveV2' AND [func] = 'View'
    )
        UPDATE dbo.WA_API
        SET [SQL] = N'API_Web_FieldContractResolveV2',
            Para = N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = 'API_Web_FieldContractResolveV2' AND [func] = 'View';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
        VALUES
        (
            'API_Web_FieldContractResolveV2',
            'View',
            N'API_Web_FieldContractResolveV2',
            N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
