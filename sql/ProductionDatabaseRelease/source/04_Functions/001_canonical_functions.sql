/*
  Canonical functions
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_FieldMetadataContractRegistry; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_FieldMetadataContractRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        R.ContractType,
        CONVERT(sysname, CurrentRoutes.ViewProcedure) AS OldView,
        CONVERT(sysname, CurrentRoutes.ViewProcedure) AS ViewV2,
        CONVERT(sysname, CurrentRoutes.SaveProcedure) AS OldSave,
        CONVERT(sysname, CurrentRoutes.SaveProcedure) AS SaveV2,
        CONVERT(sysname, CurrentRoutes.DeleteProcedure) AS OldDelete,
        CONVERT(sysname, CurrentRoutes.DeleteProcedure) AS DeleteV2,
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
        CONVERT(bit, CASE WHEN CurrentRoutes.ViewRouteCount = 1 THEN 1 ELSE 0 END) AS EnableView,
        CONVERT(bit, CASE
            WHEN R.ContractType <> 'READ_ONLY' AND CurrentRoutes.SaveRouteCount = 1 THEN 1
            ELSE 0
        END) AS EnableSave,
        CONVERT(bit, CASE
            WHEN R.ContractType <> 'READ_ONLY' AND CurrentRoutes.DeleteRouteCount = 1 THEN 1
            ELSE 0
        END) AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, CASE WHEN R.BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' THEN 1 ELSE 0 END)
            AS GlobalReferenceOnly
    FROM dbo.WA_FieldContractRegistry AS R
    OUTER APPLY
    (
        SELECT
            SUM(CASE WHEN A.[func] = 'View' THEN 1 ELSE 0 END) AS ViewRouteCount,
            SUM(CASE WHEN A.[func] = 'Save' THEN 1 ELSE 0 END) AS SaveRouteCount,
            SUM(CASE WHEN A.[func] = 'Delete' THEN 1 ELSE 0 END) AS DeleteRouteCount,
            MIN(CASE WHEN A.[func] = 'View'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS ViewProcedure,
            MIN(CASE WHEN A.[func] = 'Save'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS SaveProcedure,
            MIN(CASE WHEN A.[func] = 'Delete'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS DeleteProcedure
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT =
              ISNULL(NULLIF(R.ViewList, ''), R.WebFormName) COLLATE DATABASE_DEFAULT
          AND A.[func] IN ('View', 'Save', 'Delete')
    ) AS CurrentRoutes
    WHERE R.IsEnabled = 1
      AND R.ExpectedTableName IS NOT NULL
      AND R.ExpectedPrimaryKey IS NOT NULL
      AND NULLIF(LTRIM(RTRIM(R.ERPFormID)), '') IS NOT NULL
      AND R.ERPFormID <> 'ERP_FORM_ALIAS_REQUIRES_REVIEW'
      AND (R.WebFormName LIKE '%Frm' OR R.WebFormName LIKE '%Report')
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_AuthorizedBranches; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER FUNCTION dbo.API_HR_Dashboard_AuthorizedBranches
(
    @UserName varchar(50),
    @RequestedBranchID nvarchar(max) = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT DISTINCT
        B.BranchID
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.SY_User AS U
        ON U.UserName = @UserName
       AND ISNULL(U.Disable, 0) = 0
    WHERE
        (
            LOWER(LTRIM(RTRIM(ISNULL(U.UserGroupID, '')))) = 'admin'
            OR EXISTS
            (
                SELECT 1
                FROM STRING_SPLIT(ISNULL(U.BranchID, ''), ',') AS Allowed
                WHERE UPPER(LTRIM(RTRIM(Allowed.[value]))) =
                      UPPER(LTRIM(RTRIM(B.BranchID)))
            )
        )
        AND
        (
            LTRIM(RTRIM(ISNULL(@RequestedBranchID, ''))) = ''
            OR EXISTS
            (
                SELECT 1
                FROM STRING_SPLIT(@RequestedBranchID, ',') AS Requested
                WHERE UPPER(LTRIM(RTRIM(Requested.[value]))) =
                      UPPER(LTRIM(RTRIM(B.BranchID)))
            )
        )
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Phase3SimpleCrudRegistry; Input: sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql */
CREATE OR ALTER FUNCTION dbo.API_Phase3SimpleCrudRegistry()
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
            WHEN EXISTS (
                SELECT 1
                FROM sys.columns AS C
                WHERE C.object_id = OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U')
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
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

/* CanonicalSource: REPOSITORY; Object: dbo.API_Phase4JoinRegistry; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_Phase4JoinRegistry()
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
        R.PermissionFormName,
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

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GroupFormPermissionV2; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_Web_GroupFormPermissionV2
(
    @UserGroupID varchar(50),
    @PermissionFormName varchar(100)
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        M.MenuID,
        CONVERT(bit, ISNULL(M.isNotCheckPermission, 0)) AS SkipPermission,
        CONVERT(bit, ISNULL(P.IsRun, 0)) AS CanView,
        CONVERT(bit, ISNULL(P.IsAdd, 0)) AS CanAdd,
        CONVERT(bit, ISNULL(P.IsUpdate, 0)) AS CanEdit,
        CONVERT(bit, ISNULL(P.IsDelete, 0)) AS CanDelete
    FROM
    (
        SELECT TOP (1)
            Menu.MenuID,
            Menu.isNotCheckPermission
        FROM dbo.WA_Menu AS Menu
        WHERE Menu.FormName COLLATE DATABASE_DEFAULT =
              @PermissionFormName COLLATE DATABASE_DEFAULT
          AND ISNULL(Menu.isDisable, 0) = 0
        ORDER BY Menu.MenuID
    ) AS M
    LEFT JOIN dbo.WA_UserGroupPermisstion AS P
      ON P.UserGroupID COLLATE DATABASE_DEFAULT =
         @UserGroupID COLLATE DATABASE_DEFAULT
     AND P.MenuID COLLATE DATABASE_DEFAULT =
         M.MenuID COLLATE DATABASE_DEFAULT
);
GO
