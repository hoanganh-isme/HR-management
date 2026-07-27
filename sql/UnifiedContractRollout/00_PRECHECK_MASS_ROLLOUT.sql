/*
  Precheck chỉ đọc. Không cutover, không ghi registry và không chạm dữ liệu nghiệp vụ.
*/
SET NOCOUNT ON;

SELECT
    X.ObjectName,
    X.ObjectType,
    CONVERT(bit, CASE WHEN OBJECT_ID(N'dbo.' + X.ObjectName, X.ObjectType) IS NOT NULL THEN 1 ELSE 0 END) AS IsPresent
FROM (VALUES
    (CONVERT(sysname, N'WA_API'), N'U'),
    (CONVERT(sysname, N'WA_Menu'), N'U'),
    (CONVERT(sysname, N'SY_FrmLstTbl'), N'U'),
    (CONVERT(sysname, N'SY_FrmFltTbl'), N'U'),
    (CONVERT(sysname, N'SY_FrmDrdwTbl'), N'U'),
    (CONVERT(sysname, N'SY_FmtFldTbl'), N'U'),
    (CONVERT(sysname, N'SY_FmatTbl'), N'U')
) AS X(ObjectName, ObjectType)
ORDER BY X.ObjectName;

IF OBJECT_ID(N'dbo.WA_Menu', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.WA_API', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NOT NULL
BEGIN
    SELECT
        M.FormName AS WebFormName,
        COUNT(DISTINCT M.MenuID) AS MenuCount,
        COUNT(DISTINCT CASE WHEN A.[func] = 'View' THEN A.[SQL] END) AS ViewRouteCount,
        COUNT(DISTINCT CASE WHEN A.[func] = 'Save' THEN A.[SQL] END) AS SaveRouteCount,
        COUNT(DISTINCT CASE WHEN A.[func] = 'Delete' THEN A.[SQL] END) AS DeleteRouteCount,
        COUNT(DISTINCT L.FormID) AS FormRegistrationCount,
        MIN(L.TableName) AS TableName,
        MIN(L.PrimaryKey) AS PrimaryKey
    FROM dbo.WA_Menu AS M
    LEFT JOIN dbo.WA_API AS A
      ON A.[list] COLLATE DATABASE_DEFAULT = M.FormName COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SY_FrmLstTbl AS L
      ON L.FormID COLLATE DATABASE_DEFAULT = M.FormName COLLATE DATABASE_DEFAULT
    WHERE NULLIF(LTRIM(RTRIM(M.FormName)), '') IS NOT NULL
      AND LTRIM(RTRIM(M.FormName)) LIKE '%Frm'
    GROUP BY M.FormName
    ORDER BY M.FormName;
END;

/* Danh sách được audit từ frontend: luôn giữ legacy nếu discovery gặp các form này. */
SELECT
    V.WebFormName,
    V.SourceReason,
    CONVERT(varchar(40), 'COMPLEX_DEFERRED') AS SuggestedContractType,
    CONVERT(varchar(20), 'DEFERRED') AS SuggestedRolloutStatus
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
) AS V(WebFormName, SourceReason)
ORDER BY V.WebFormName;

IF OBJECT_ID(N'dbo.API_Web_DiscoverFieldContractCandidatesV2', N'P') IS NOT NULL
    EXEC dbo.API_Web_DiscoverFieldContractCandidatesV2;
ELSE
    SELECT N'DISCOVERY_PROCEDURE_NOT_INSTALLED_YET' AS PrecheckNotice;
