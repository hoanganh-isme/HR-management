/*
  Precheck read-only cho Bulk Import.
  Không tạo bảng staging vật lý và không sửa dữ liệu.
*/
SET NOCOUNT ON;

DECLARE @Contract TABLE (
    FormName sysname NOT NULL,
    TableName sysname NOT NULL,
    PrimaryKey sysname NOT NULL
);

INSERT INTO @Contract (FormName, TableName, PrimaryKey)
VALUES
    (N'WA_BangThueTNCNFrm', N'HR_BangThueTNCNTbl', N'Bac'),
    (N'WA_ChucDanhFrm', N'HR_ChucDanhTbl', N'ChucDanhChuyenMon'),
    (N'WA_TitleListFrm', N'HR_TitleListTbl', N'TitleName'),
    (N'WA_ShiftListFrm', N'HR_ShiftListTbl', N'ShiftID'),
    (N'WA_CaLamViecFrm', N'HR_SapCaTbl', N'SapCaID');

SELECT
    C.FormName,
    C.TableName,
    C.PrimaryKey,
    CASE WHEN OBJECT_ID(N'dbo.' + C.TableName, N'U') IS NULL THEN 0 ELSE 1 END AS TargetTableExists,
    (
        SELECT COUNT(*)
        FROM dbo.SY_FrmLstTbl AS F
        WHERE LOWER(LTRIM(RTRIM(F.FormID))) = LOWER(C.FormName)
          AND LOWER(LTRIM(RTRIM(F.TableName))) = LOWER(C.TableName)
          AND LOWER(LTRIM(RTRIM(F.PrimaryKey))) = LOWER(C.PrimaryKey)
    ) AS ExactContractRows,
    (
        SELECT COUNT(*)
        FROM dbo.WA_API AS A
        WHERE LOWER(LTRIM(RTRIM(A.[list]))) = LOWER(C.FormName)
          AND LOWER(LTRIM(RTRIM(A.[func]))) = N'save'
          AND LOWER(LTRIM(RTRIM(A.[SQL]))) = N'api_luudong_v2'
    ) AS SaveV2Routes
FROM @Contract AS C
ORDER BY C.FormName;

SELECT
    C.FormName,
    C.PrimaryKey,
    CASE WHEN I.object_id IS NULL THEN 0 ELSE 1 END AS PrimaryKeyIsSingleColumnUnique
FROM @Contract AS C
OUTER APPLY (
    SELECT TOP (1) I.object_id
    FROM sys.indexes AS I
    INNER JOIN sys.index_columns AS IC
      ON IC.object_id = I.object_id AND IC.index_id = I.index_id
    INNER JOIN sys.columns AS Col
      ON Col.object_id = IC.object_id AND Col.column_id = IC.column_id
    WHERE I.object_id = OBJECT_ID(N'dbo.' + C.TableName, N'U')
      AND I.is_primary_key = 1
      AND I.is_unique = 1
      AND I.is_disabled = 0
      AND IC.key_ordinal = 1
      AND Col.name = C.PrimaryKey
      AND (
          SELECT COUNT(*)
          FROM sys.index_columns AS AllKey
          WHERE AllKey.object_id = I.object_id
            AND AllKey.index_id = I.index_id
            AND AllKey.key_ordinal > 0
      ) = 1
) AS I
ORDER BY C.FormName;

SELECT
    RequiredObject,
    CASE WHEN OBJECT_ID(N'dbo.' + RequiredObject, N'U') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES
    (N'SY_FrmLstTbl'),
    (N'WA_API'),
    (N'SY_User')
) AS Objects(RequiredObject);
