/*
  Phase 1 - Kiểm tra nguồn metadata, chỉ đọc.
  Chạy trên bản sao/backup trước khi cài các procedure V2.
*/
SET NOCOUNT ON;

SELECT
    X.ObjectName,
    CASE WHEN OBJECT_ID(N'dbo.' + X.ObjectName) IS NULL THEN N'MISSING' ELSE N'OK' END AS ObjectStatus
FROM (VALUES
    (N'WA_API'),
    (N'SY_FmtFldTbl'),
    (N'SY_FmatTbl'),
    (N'SY_FrmDrdwTbl'),
    (N'SY_FrmLstTbl'),
    (N'SY_User'),
    (N'WA_Menu'),
    (N'WA_UserGroupPermisstion')
) AS X(ObjectName)
ORDER BY X.ObjectName;

SELECT
    A.[list] AS FormName,
    COUNT_BIG(*) AS ViewRegistrationCount,
    MIN(A.[SQL]) AS RegisteredProcedure
FROM dbo.WA_API AS A
WHERE A.[func] = 'View'
GROUP BY A.[list]
HAVING COUNT_BIG(*) <> 1
ORDER BY A.[list];

SELECT
    L.FormID,
    L.TableName,
    L.PrimaryKey,
    A.[SQL] AS ViewProcedure,
    CASE
        WHEN A.[SQL] IS NULL THEN N'MISSING_VIEW_API'
        WHEN OBJECT_ID(N'dbo.' + A.[SQL], N'P') IS NULL THEN N'MISSING_VIEW_PROCEDURE'
        WHEN OBJECT_ID(N'dbo.' + L.TableName) IS NULL THEN N'MISSING_TABLE_OR_VIEW'
        ELSE N'OK'
    END AS DiagnosticCode
FROM dbo.SY_FrmLstTbl AS L
LEFT JOIN dbo.WA_API AS A
    ON A.[list] = L.FormID
   AND A.[func] = 'View'
WHERE L.FormID IN ('WA_BangThueTNCNFrm', 'HR_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'HR_ChucDanhFrm')
ORDER BY L.FormID;

SELECT
    F.FormName,
    COUNT_BIG(*) AS FieldCaptionCount
FROM dbo.SY_FmtFldTbl AS F
WHERE F.FormName IN ('WA_BangThueTNCNFrm', 'HR_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'HR_ChucDanhFrm')
   OR F.FormName IS NULL
   OR LTRIM(RTRIM(F.FormName)) = ''
GROUP BY F.FormName
ORDER BY F.FormName;

