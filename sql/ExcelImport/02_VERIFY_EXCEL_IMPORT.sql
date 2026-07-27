/*
  Verify read-only sau khi registry/metadata đã được bật.
*/
SET NOCOUNT ON;

SELECT
    F.FormID,
    F.TableName,
    F.PrimaryKey,
    A.[SQL] AS RegisteredSaveProcedure,
    CASE WHEN A.[SQL] = N'API_LuuDong_V2' THEN 1 ELSE 0 END AS IsBulkImportReady
FROM dbo.SY_FrmLstTbl AS F
LEFT JOIN dbo.WA_API AS A
  ON LOWER(LTRIM(RTRIM(A.[list]))) = LOWER(LTRIM(RTRIM(F.FormID)))
 AND LOWER(LTRIM(RTRIM(A.[func]))) = N'save'
WHERE F.FormID IN (
    N'WA_BangThueTNCNFrm',
    N'WA_ChucDanhFrm',
    N'WA_TitleListFrm',
    N'WA_ShiftListFrm',
    N'WA_CaLamViecFrm'
)
ORDER BY F.FormID;

SELECT
    [list] AS FormID,
    COUNT(*) AS SaveRouteCount
FROM dbo.WA_API
WHERE [list] IN (
    N'WA_BangThueTNCNFrm',
    N'WA_ChucDanhFrm',
    N'WA_TitleListFrm',
    N'WA_ShiftListFrm',
    N'WA_CaLamViecFrm'
)
  AND LOWER(LTRIM(RTRIM([func]))) = N'save'
GROUP BY FormID
ORDER BY FormID;

SELECT
    U.UserName,
    U.UserGroupID,
    U.Disable,
    CASE
        WHEN LOWER(LTRIM(RTRIM(ISNULL(U.UserGroupID, N'')))) = N'admin'
         AND ISNULL(U.Disable, 0) = 0 THEN 1
        ELSE 0
    END AS CanUseExcelImport
FROM dbo.SY_User AS U
WHERE LOWER(LTRIM(RTRIM(ISNULL(U.UserGroupID, N'')))) = N'admin'
ORDER BY U.UserName;

SELECT
    ORIGINAL_LOGIN() AS SqlLogin,
    USER_NAME() AS DatabaseUser,
    HAS_PERMS_BY_NAME(N'dbo.SY_User', N'OBJECT', N'SELECT') AS CanReadUsers,
    HAS_PERMS_BY_NAME(N'dbo.SY_FrmLstTbl', N'OBJECT', N'SELECT') AS CanReadFormContract,
    HAS_PERMS_BY_NAME(N'dbo.WA_API', N'OBJECT', N'SELECT') AS CanReadApiContract;
