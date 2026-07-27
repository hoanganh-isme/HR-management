/*
  Discovery chỉ đọc metadata hệ thống. Không dùng SY_FormatFields và không cutover.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_DiscoverFieldContractCandidatesV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_DiscoverFieldContractCandidatesV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_DiscoverFieldContractCandidatesV2
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
       OR OBJECT_ID(N'dbo.WA_Menu', N'U') IS NULL
       OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
        THROW 54100, N'FIELD_CONTRACT_DISCOVERY_SOURCE_MISSING', 1;

    ;WITH SourceComplex AS
    (
        SELECT V.WebFormName, V.Reason
        FROM (VALUES
            ('WA_PersonFullFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_DanhSachUngVienFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_HopDongLaoDongFrm', 'FRONTEND_DOCUMENT_ATTACHMENT_CUSTOM_DETAIL'),
            ('WA_BaoHiemFrm', 'FRONTEND_COMPLEX_DETAIL_CALCULATION'),
            ('WA_DonXinNghiPhepFrm', 'FRONTEND_WORKFLOW_ATTACHMENT'),
            ('WA_QuanLyNghiPhepNamFrm', 'FRONTEND_MULTI_DATASET'),
            ('WA_PayrollFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_TimeSheetDayFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_BangPhuCapFrm', 'FRONTEND_DETAIL_MUTATION_NOT_AUDITED'),
            ('WA_NguoiDungFrm', 'FRONTEND_PERMISSION_MANAGEMENT'),
            ('WA_NguoiDungNhomFrm', 'FRONTEND_PERMISSION_MANAGEMENT')
        ) AS V(WebFormName, Reason)
    ),
    CandidateNames AS
    (
        SELECT CONVERT(varchar(100), LTRIM(RTRIM(M.FormName))) AS WebFormName
        FROM dbo.WA_Menu AS M
        WHERE NULLIF(LTRIM(RTRIM(M.FormName)), '') IS NOT NULL
          AND LTRIM(RTRIM(M.FormName)) LIKE '%Frm'

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(L.FormID)))
        FROM dbo.SY_FrmLstTbl AS L
        WHERE NULLIF(LTRIM(RTRIM(L.FormID)), '') IS NOT NULL
          AND LTRIM(RTRIM(L.FormID)) LIKE '%Frm'

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(A.[list])))
        FROM dbo.WA_API AS A
        WHERE NULLIF(LTRIM(RTRIM(A.[list])), '') IS NOT NULL
          AND LTRIM(RTRIM(A.[list])) LIKE '%Frm'
    ),
    FormRegistration AS
    (
        SELECT
            L.FormID AS WebFormName,
            COUNT(*) AS FormRegistrationCount,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.TableName)), ''))) AS TableName,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.PrimaryKey)), ''))) AS PrimaryKey
        FROM dbo.SY_FrmLstTbl AS L
        GROUP BY L.FormID
    ),
    Routes AS
    (
        SELECT
            A.[list] AS WebFormName,
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
        GROUP BY A.[list]
    ),
    Facts AS
    (
        SELECT
            C.WebFormName,
            CONVERT(varchar(100), CASE
                WHEN C.WebFormName = 'WA_BangThueTNCNFrm' THEN 'HR_BangThueTNCNFrm'
                WHEN F.FormRegistrationCount = 1 THEN C.WebFormName
                ELSE NULL
            END) AS ERPFormID,
            ISNULL(R.ViewProcedure, N'') AS ViewProcedure,
            ISNULL(R.SaveProcedure, N'') AS SaveProcedure,
            ISNULL(R.DeleteProcedure, N'') AS DeleteProcedure,
            F.TableName,
            F.PrimaryKey,
            ISNULL(R.ViewRouteCount, 0) AS ViewRouteCount,
            ISNULL(R.SaveRouteCount, 0) AS SaveRouteCount,
            ISNULL(R.DeleteRouteCount, 0) AS DeleteRouteCount,
            ISNULL(F.FormRegistrationCount, 0) AS FormRegistrationCount,
            T.object_id AS TableObjectID,
            P.object_id AS ViewProcedureObjectID,
            SC.Reason AS SourceComplexReason
        FROM CandidateNames AS C
        LEFT JOIN FormRegistration AS F
          ON F.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN Routes AS R
          ON R.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.tables AS T
          ON T.schema_id = SCHEMA_ID(N'dbo')
         AND T.name COLLATE DATABASE_DEFAULT = F.TableName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.procedures AS P
          ON P.schema_id = SCHEMA_ID(N'dbo')
         AND P.name COLLATE DATABASE_DEFAULT = R.ViewProcedure COLLATE DATABASE_DEFAULT
        LEFT JOIN SourceComplex AS SC
          ON SC.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
    ),
    Described AS
    (
        SELECT
            F.*,
            CONVERT(bit, CASE WHEN F.TableObjectID IS NOT NULL THEN 1 ELSE 0 END) AS TableExists,
            CONVERT(bit, CASE WHEN PKC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyExists,
            CONVERT(bit, CASE WHEN UI.index_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyUnique,
            CONVERT(bit, CASE
                WHEN F.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2') THEN 1
                WHEN F.ViewProcedureObjectID IS NOT NULL AND ISNULL(D.ResultErrorCount, 0) = 0
                     AND ISNULL(D.ResultColumnCount, 0) > 0 THEN 1
                ELSE 0
            END) AS ResultSetDescribable,
            ISNULL(D.ResultColumnCount, 0) AS ResultColumnCount,
            ISNULL(D.PhysicalFieldCount, 0) AS PhysicalFieldCount,
            ISNULL(D.JoinFieldCount, 0) AS JoinFieldCount,
            CONVERT(bit, CASE WHEN BC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS HasBranchScope
        FROM Facts AS F
        LEFT JOIN sys.columns AS PKC
          ON PKC.object_id = F.TableObjectID
         AND PKC.name COLLATE DATABASE_DEFAULT = F.PrimaryKey COLLATE DATABASE_DEFAULT
        OUTER APPLY
        (
            SELECT TOP (1) I.index_id
            FROM sys.indexes AS I
            INNER JOIN sys.index_columns AS IC
              ON IC.object_id = I.object_id
             AND IC.index_id = I.index_id
             AND IC.key_ordinal > 0
            WHERE I.object_id = F.TableObjectID
              AND I.is_unique = 1
              AND I.is_disabled = 0
            GROUP BY I.index_id
            HAVING COUNT(*) = 1 AND MAX(IC.column_id) = PKC.column_id
        ) AS UI
        OUTER APPLY
        (
            SELECT TOP (1) C.column_id
            FROM sys.columns AS C
            WHERE C.object_id = F.TableObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT
                  IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ORDER BY C.column_id
        ) AS BC
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS ResultColumnCount,
                SUM(X.IsPhysical) AS PhysicalFieldCount,
                SUM(CASE WHEN X.IsPhysical = 0 THEN 1 ELSE 0 END) AS JoinFieldCount,
                SUM(X.HasError) AS ResultErrorCount
            FROM
            (
                SELECT
                    CASE
                        WHEN C.column_id IS NOT NULL
                         AND RS.source_table COLLATE DATABASE_DEFAULT
                             = OBJECT_NAME(F.TableObjectID) COLLATE DATABASE_DEFAULT
                         AND ISNULL(RS.source_schema, N'dbo') COLLATE DATABASE_DEFAULT
                             = N'dbo' COLLATE DATABASE_DEFAULT
                        THEN 1
                        ELSE 0
                    END AS IsPhysical,
                    CASE WHEN RS.error_type IS NULL THEN 0 ELSE 1 END AS HasError
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (F.ViewProcedureObjectID, 1) AS RS
                LEFT JOIN sys.columns AS C
                  ON C.object_id = F.TableObjectID
                 AND C.name COLLATE DATABASE_DEFAULT
                     = ISNULL(RS.source_column, RS.name) COLLATE DATABASE_DEFAULT
                WHERE ISNULL(RS.is_hidden, 0) = 0
            ) AS X
        ) AS D
    ),
    Classified AS
    (
        SELECT
            D.*,
            CONVERT(varchar(40), CASE
                WHEN D.SourceComplexReason IS NOT NULL THEN 'COMPLEX_DEFERRED'
                WHEN D.FormRegistrationCount <> 1
                  OR D.TableExists = 0
                  OR D.PrimaryKey IS NULL
                  OR D.PrimaryKeyExists = 0
                  OR D.PrimaryKeyUnique = 0
                  OR D.ViewRouteCount <> 1
                  OR D.ViewProcedureObjectID IS NULL
                  OR D.ERPFormID IS NULL THEN 'BLOCKED'
                WHEN D.SaveRouteCount > 1 OR D.DeleteRouteCount > 1 THEN 'BLOCKED'
                WHEN (D.SaveRouteCount = 1
                      AND D.SaveProcedure NOT IN (N'API_LuuDong', N'API_LuuDong_V2'))
                  OR (D.DeleteRouteCount = 1
                      AND D.DeleteProcedure NOT IN (N'API_XoaDong', N'API_XoaDong_V2'))
                    THEN 'COMPLEX_DEFERRED'
                WHEN D.SaveRouteCount <> 1 OR D.DeleteRouteCount <> 1
                    THEN 'BLOCKED'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'SIMPLE_TABLE'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ResultSetDescribable = 1
                     AND D.PhysicalFieldCount > 0
                     AND D.ViewProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'JOIN_VIEW_SINGLE_TABLE'
                ELSE 'BLOCKED'
            END) AS SuggestedContractType
        FROM Described AS D
    )
    SELECT
        C.WebFormName,
        C.ERPFormID,
        C.ViewProcedure AS CurrentViewProcedure,
        C.SaveProcedure AS CurrentSaveProcedure,
        C.DeleteProcedure AS CurrentDeleteProcedure,
        C.TableName,
        C.PrimaryKey,
        C.ViewRouteCount,
        C.SaveRouteCount,
        C.DeleteRouteCount,
        C.FormRegistrationCount,
        C.TableExists,
        C.PrimaryKeyExists,
        C.PrimaryKeyUnique,
        C.ResultSetDescribable,
        C.PhysicalFieldCount,
        C.JoinFieldCount,
        C.HasBranchScope,
        CONVERT(varchar(40), CASE
            WHEN C.SaveRouteCount = 0 AND C.DeleteRouteCount = 0 THEN 'MISSING'
            WHEN C.SaveProcedure IN (N'API_LuuDong', N'API_LuuDong_V2')
             AND C.DeleteProcedure IN (N'API_XoaDong', N'API_XoaDong_V2') THEN 'GENERIC'
            ELSE 'CUSTOM'
        END) AS CurrentMutationType,
        C.SuggestedContractType,
        CONVERT(varchar(20), CASE
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY') THEN 'SHADOW'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'DEFERRED'
            ELSE 'BLOCKED'
        END) AS SuggestedRolloutStatus,
        CONVERT(nvarchar(500), CASE
            WHEN C.SourceComplexReason IS NOT NULL THEN C.SourceComplexReason
            WHEN C.ERPFormID IS NULL THEN 'ERP_FORM_ALIAS_REQUIRES_REVIEW'
            WHEN C.FormRegistrationCount <> 1 THEN 'SY_FRMLSTTBL_NOT_UNIQUE'
            WHEN C.TableExists = 0 THEN 'TABLE_NOT_FOUND'
            WHEN C.PrimaryKey IS NULL OR C.PrimaryKeyExists = 0 THEN 'PRIMARY_KEY_NOT_FOUND'
            WHEN C.PrimaryKeyUnique = 0 THEN 'PRIMARY_KEY_NOT_UNIQUE'
            WHEN C.ViewRouteCount <> 1 THEN 'VIEW_ROUTE_NOT_UNIQUE'
            WHEN C.ViewProcedureObjectID IS NULL THEN 'VIEW_PROCEDURE_NOT_FOUND'
            WHEN C.SaveRouteCount > 1 OR C.DeleteRouteCount > 1 THEN 'MUTATION_ROUTE_NOT_UNIQUE'
            WHEN C.SaveRouteCount <> 1 OR C.DeleteRouteCount <> 1
                THEN 'CRUD_MUTATION_ROUTE_MISSING'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'CUSTOM_MUTATION_REQUIRES_AUDIT'
            WHEN C.SuggestedContractType = 'BLOCKED' THEN 'FIELD_LINEAGE_OR_CONTRACT_UNKNOWN'
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY')
                THEN 'DISCOVERY_READY_FOR_CUTOVER'
            ELSE NULL
        END) AS BlockingReason
    FROM Classified AS C
    ORDER BY C.WebFormName;
END;
GO

IF OBJECT_ID(N'dbo.API_Web_SeedSafeFieldContractsV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_SeedSafeFieldContractsV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_SeedSafeFieldContractsV2
    @UserName varchar(100) = 'SYSTEM_DISCOVERY'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
        THROW 54101, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;

    DECLARE @Candidates table
    (
        WebFormName varchar(100) NOT NULL,
        ERPFormID varchar(100) NULL,
        CurrentViewProcedure sysname NULL,
        CurrentSaveProcedure sysname NULL,
        CurrentDeleteProcedure sysname NULL,
        TableName sysname NULL,
        PrimaryKey sysname NULL,
        ViewRouteCount int NOT NULL,
        SaveRouteCount int NOT NULL,
        DeleteRouteCount int NOT NULL,
        FormRegistrationCount int NOT NULL,
        TableExists bit NOT NULL,
        PrimaryKeyExists bit NOT NULL,
        PrimaryKeyUnique bit NOT NULL,
        ResultSetDescribable bit NOT NULL,
        PhysicalFieldCount int NOT NULL,
        JoinFieldCount int NOT NULL,
        HasBranchScope bit NOT NULL,
        CurrentMutationType varchar(40) NOT NULL,
        SuggestedContractType varchar(40) NOT NULL,
        SuggestedRolloutStatus varchar(20) NOT NULL,
        BlockingReason nvarchar(500) NULL
    );

    INSERT INTO @Candidates
        EXEC dbo.API_Web_DiscoverFieldContractCandidatesV2;

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        SELECT
            C.WebFormName,
            COALESCE(C.ERPFormID, 'ERP_FORM_ALIAS_REQUIRES_REVIEW'),
            C.WebFormName,
            C.SuggestedContractType,
            C.TableName,
            C.PrimaryKey,
            C.WebFormName,
            CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY'
                THEN 'READ_ONLY' ELSE 'SAFE_TABLE_COLUMNS' END,
            CASE WHEN C.HasBranchScope = 1 THEN 'BRANCH_SCOPED' ELSE 'GLOBAL_REFERENCE' END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY' THEN 'NONE' ELSE 'AUTO_SCHEMA' END,
            C.SuggestedRolloutStatus,
            C.BlockingReason,
            2,
            1,
            SYSUTCDATETIME(),
            @UserName,
            SYSUTCDATETIME(),
            @UserName
        FROM @Candidates AS C
        WHERE NOT EXISTS
          (
              SELECT 1
              FROM dbo.WA_FieldContractRegistry AS R
              WHERE R.WebFormName = C.WebFormName
          );

        /*
          Chỉ làm mới bản ghi vẫn hoàn toàn do discovery sở hữu. Có thể hạ
          contract không còn an toàn, nhưng không sửa policy, không đụng bản ghi
          quản trị viên đã cập nhật và không tự nâng DEFERRED/BLOCKED.
        */
        UPDATE R
        SET ContractType = C.SuggestedContractType,
            ExpectedTableName = C.TableName,
            ExpectedPrimaryKey = C.PrimaryKey,
            ViewProcedure = CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            SaveProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            DeleteProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            RolloutStatus = C.SuggestedRolloutStatus,
            RolloutReason = C.BlockingReason,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldContractRegistry AS R
        INNER JOIN @Candidates AS C
          ON C.WebFormName = R.WebFormName
        WHERE R.CreatedBy = 'SYSTEM_DISCOVERY'
          AND R.UpdatedBy = 'SYSTEM_DISCOVERY'
          AND R.RolloutStatus NOT IN ('DEFERRED', 'BLOCKED');

        /* Report chỉ xem/in bằng runtime legacy, không thuộc Unified CRUD. */
        UPDATE dbo.WA_FieldContractRegistry
        SET RolloutStatus = 'DEFERRED',
            RolloutReason = N'REPORT_LEGACY_VIEW_PRINT_ONLY',
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        WHERE WebFormName LIKE '%Report'
          AND RolloutStatus <> 'DEFERRED';

        UPDATE D
        SET RolloutStatus = 'DEFERRED',
            RolloutReason = N'REPORT_LEGACY_VIEW_PRINT_ONLY',
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldDatasetRegistry AS D
        WHERE D.WebFormName LIKE '%Report'
          AND D.RolloutStatus <> 'DEFERRED';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT ContractType, RolloutStatus, COUNT(*) AS FormCount
    FROM dbo.WA_FieldContractRegistry
    GROUP BY ContractType, RolloutStatus
    ORDER BY ContractType, RolloutStatus;
END;
GO
