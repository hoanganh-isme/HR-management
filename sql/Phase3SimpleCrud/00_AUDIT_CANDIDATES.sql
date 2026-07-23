/*
  Phase 3 - audit chỉ đọc. Chạy trước mọi script cài đặt.
  Không script nào được tự sửa SY_FrmLstTbl để làm cho gate này xanh.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Candidates table
(
    WebFormName varchar(100) NOT NULL PRIMARY KEY,
    ERPFormID varchar(100) NOT NULL,
    ExpectedTableName sysname NULL,
    ExpectedPrimaryKey sysname NULL,
    ExpectedOldView sysname NULL,
    Decision varchar(30) NOT NULL,
    StaticReason nvarchar(500) NOT NULL
);

INSERT INTO @Candidates
    (WebFormName, ERPFormID, ExpectedTableName, ExpectedPrimaryKey, ExpectedOldView, Decision, StaticReason)
VALUES
    ('WA_BangThueTNCNFrm', 'HR_BangThueTNCNFrm', N'HR_BangThueTNCNTbl', N'Bac',                  N'API_TruyVanDong',       'MIGRATE_PHASE3', N'Pilot Phase 2; một bảng và khóa đơn.'),
    ('WA_ChucDanhFrm',      'WA_ChucDanhFrm',      N'HR_ChucDanhTbl',       N'ChucDanhChuyenMon', N'API_DanhSachChucDanh', 'MIGRATE_PHASE3', N'View tĩnh một bảng; không tự suy diễn alias ERP có PK khác.'),
    ('WA_TitleListFrm',     'WA_TitleListFrm',     N'HR_TitleListTbl',       N'TitleName',          N'API_TruyVanDong',       'MIGRATE_PHASE3', N'Danh mục một bảng, khóa đơn.'),
    ('WA_ShiftListFrm',     'WA_ShiftListFrm',     N'HR_ShiftListTbl',       N'ShiftID',            N'API_TruyVanDong',       'MIGRATE_PHASE3', N'Danh mục ca một bảng; cần kiểm tra type/editor trên DB thật.'),
    ('WA_BangThamSoFrm',    'WA_BangThamSoFrm',    N'HR_BangThamSoTbl',      N'UserAutoID',          N'API_BangThamSo',        'REVIEW',          N'Tham số payroll/insurance và có khóa nghiệp vụ tính toán.'),
    ('WA_BangPhuCapFrm',    'WA_BangPhuCapFrm',    N'HR_BangPhuCapTbl',      N'MaPhuCap',            N'API_BangPhuCap',        'REJECT',          N'Có detail/join và nghiệp vụ phụ cấp nhân sự.'),
    ('WA_CaLamViecFrm',     'WA_CaLamViecFrm',     N'HR_SapCaTbl',           N'SapCaID',             N'API_CaLamViec',         'REJECT',          N'Master/detail và nghiệp vụ scheduling/timesheet.');

/* Result set 1: quyết định tĩnh có thể review trước khi kết nối DB. */
SELECT
    WebFormName, ERPFormID, ExpectedTableName, ExpectedPrimaryKey,
    ExpectedOldView, Decision, StaticReason
FROM @Candidates
ORDER BY Decision, WebFormName;

/* Result set 2: contract vật lý và route hiện tại của 4 form được chọn. */
SELECT
    C.WebFormName,
    C.ERPFormID,
    C.ExpectedTableName,
    C.ExpectedPrimaryKey,
    FR.RegistrationCount,
    FR.RegisteredTableName,
    FR.RegisteredPrimaryKey,
    O.ObjectID,
    CONVERT(bit, CASE WHEN O.ObjectID IS NULL THEN 0 ELSE 1 END) AS TableExists,
    CONVERT(bit, CASE WHEN PK.ColumnID IS NULL THEN 0 ELSE 1 END) AS PrimaryKeyColumnExists,
    CONVERT(bit, CASE WHEN UX.UniqueIndexCount > 0 THEN 1 ELSE 0 END) AS PrimaryKeyProvenUnique,
    PC.PhysicalColumnCount,
    LC.LegacyFieldCount,
    DC.DeniedColumnCount,
    SC.ScopeColumnCount,
    SD.SoftDeleteState,
    VR.ViewRowCount,
    VR.CurrentViewProcedure,
    SR.SaveRowCount,
    SR.CurrentSaveProcedure,
    DR.DeleteRowCount,
    DR.CurrentDeleteProcedure,
    MR.ActiveMenuCount,
    CASE
        WHEN FR.RegistrationCount <> 1 THEN 'BLOCK_REGISTRATION_COUNT'
        WHEN FR.RegisteredTableName COLLATE DATABASE_DEFAULT <> C.ExpectedTableName COLLATE DATABASE_DEFAULT THEN 'BLOCK_TABLE_MISMATCH'
        WHEN FR.RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> C.ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 'BLOCK_PRIMARY_KEY_MISMATCH'
        WHEN O.ObjectID IS NULL THEN 'BLOCK_TABLE_MISSING'
        WHEN PK.ColumnID IS NULL THEN 'BLOCK_PRIMARY_KEY_MISSING'
        WHEN UX.UniqueIndexCount = 0 THEN 'BLOCK_PRIMARY_KEY_NOT_UNIQUE'
        WHEN SC.ScopeColumnCount > 0 THEN 'BLOCK_BRANCH_POLICY_REVIEW'
        WHEN SD.SoftDeleteState = 'INVALID_TYPE' THEN 'BLOCK_ISDELETED_TYPE'
        WHEN VR.ViewRowCount <> 1 OR SR.SaveRowCount <> 1 OR DR.DeleteRowCount <> 1 THEN 'BLOCK_WA_API_NOT_UNIQUE'
        WHEN MR.ActiveMenuCount = 0 THEN 'BLOCK_MENU_MISSING'
        ELSE 'STATIC_DB_GATE_PASS'
    END AS AuditStatus
FROM @Candidates AS C
OUTER APPLY (
    SELECT
        COUNT(*) AS RegistrationCount,
        MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))) AS RegisteredTableName,
        MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey)))) AS RegisteredPrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
) AS FR
OUTER APPLY (
    SELECT OBJECT_ID(N'dbo.' + C.ExpectedTableName, N'U') AS ObjectID
) AS O
OUTER APPLY (
    SELECT TOP (1) C2.column_id AS ColumnID
    FROM sys.columns AS C2
    WHERE C2.object_id = O.ObjectID
      AND C2.name COLLATE DATABASE_DEFAULT = C.ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
) AS PK
OUTER APPLY (
    SELECT COUNT(*) AS UniqueIndexCount
    FROM (
        SELECT I.index_id
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id
         AND IC.index_id = I.index_id
         AND IC.key_ordinal > 0
        WHERE I.object_id = O.ObjectID
          AND I.is_unique = 1
          AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1 AND MAX(IC.column_id) = PK.ColumnID
    ) AS X
) AS UX
OUTER APPLY (
    SELECT COUNT(*) AS PhysicalColumnCount
    FROM sys.columns AS X
    WHERE X.object_id = O.ObjectID
) AS PC
OUTER APPLY (
    SELECT COUNT(*) AS LegacyFieldCount
    FROM dbo.SY_FormatFields AS X
    WHERE X.FormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
) AS LC
OUTER APPLY (
    SELECT COUNT(*) AS DeniedColumnCount
    FROM sys.columns AS X
    INNER JOIN sys.types AS T ON T.user_type_id = X.user_type_id
    WHERE X.object_id = O.ObjectID
      AND (
          LOWER(T.name) COLLATE DATABASE_DEFAULT IN
              ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
               'sql_variant', 'geography', 'geometry', 'hierarchyid')
          OR LOWER(X.name) COLLATE DATABASE_DEFAULT IN
              ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
               'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
      )
) AS DC
OUTER APPLY (
    SELECT COUNT(*) AS ScopeColumnCount
    FROM sys.columns AS X
    WHERE X.object_id = O.ObjectID
      AND LOWER(X.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
) AS SC
OUTER APPLY (
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM sys.columns AS X
            WHERE X.object_id = O.ObjectID
              AND LOWER(X.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
        ) THEN 'HARD_READY'
        WHEN EXISTS (
            SELECT 1 FROM sys.columns AS X
            INNER JOIN sys.types AS T ON T.user_type_id = X.user_type_id
            WHERE X.object_id = O.ObjectID
              AND LOWER(X.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
              AND T.name COLLATE DATABASE_DEFAULT = 'bit' COLLATE DATABASE_DEFAULT
              AND X.is_computed = 0
        ) THEN 'SOFT_READY'
        ELSE 'INVALID_TYPE'
    END AS SoftDeleteState
) AS SD
OUTER APPLY (
    SELECT COUNT(*) AS ViewRowCount, MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentViewProcedure
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT
) AS VR
OUTER APPLY (
    SELECT COUNT(*) AS SaveRowCount, MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentSaveProcedure
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT
) AS SR
OUTER APPLY (
    SELECT COUNT(*) AS DeleteRowCount, MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentDeleteProcedure
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT
) AS DR
OUTER APPLY (
    SELECT COUNT(*) AS ActiveMenuCount
    FROM dbo.WA_Menu AS M
    WHERE M.FormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
      AND ISNULL(M.isDisable, 0) = 0
) AS MR
WHERE C.Decision = 'MIGRATE_PHASE3'
ORDER BY C.WebFormName;

/* Result set 3: field deny-list để DBA review, không làm lộ giá trị dữ liệu. */
SELECT
    C.WebFormName,
    C.ExpectedTableName,
    X.column_id AS ColumnOrdinal,
    X.name AS ColumnName,
    T.name AS SqlType,
    CASE
        WHEN LOWER(T.name) COLLATE DATABASE_DEFAULT IN
             ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
              'sql_variant', 'geography', 'geometry', 'hierarchyid') THEN 'DENIED_SQL_TYPE'
        ELSE 'DENIED_FIELD_NAME'
    END AS DenyReason
FROM @Candidates AS C
INNER JOIN sys.columns AS X ON X.object_id = OBJECT_ID(N'dbo.' + C.ExpectedTableName, N'U')
INNER JOIN sys.types AS T ON T.user_type_id = X.user_type_id
WHERE C.Decision = 'MIGRATE_PHASE3'
  AND (
      LOWER(T.name) COLLATE DATABASE_DEFAULT IN
          ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
           'sql_variant', 'geography', 'geometry', 'hierarchyid')
      OR LOWER(X.name) COLLATE DATABASE_DEFAULT IN
          ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
           'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
  )
ORDER BY C.WebFormName, X.column_id;
GO
