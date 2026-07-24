/*
  Phase 4A:
  Metadata cho result-set JOIN của detail tab chỉ đọc.

  Nguồn dữ liệu:
  - Membership và thứ tự field: result-set của View procedure.
  - Caption: SY_FmtFldTbl.
  - Format: SY_FmatTbl.
  - Lookup: SY_FrmDrdwTbl.
  - Physical-column: sys.columns của bảng chính.

  Không sử dụng SY_FormatFields.
*/

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(
    N'dbo.API_Phase4JoinRegistry',
    N'IF'
) IS NULL
BEGIN
    THROW 53400,
        N'PHASE4_JOIN_REGISTRY_NOT_INSTALLED',
        1;
END;
GO

IF OBJECT_ID(
    N'dbo.API_Web_JoinFieldSchemaV2',
    N'P'
) IS NULL
BEGIN
    EXEC
    (
        N'CREATE PROCEDURE dbo.API_Web_JoinFieldSchemaV2
          AS
          BEGIN
              SET NOCOUNT ON;
          END;'
    );
END;
GO

ALTER PROCEDURE dbo.API_Web_JoinFieldSchemaV2
    @WebFormName varchar(100),
    @DetailKey varchar(80),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName =
        LTRIM(RTRIM(ISNULL(@WebFormName, '')));

    SET @DetailKey =
        LTRIM(RTRIM(ISNULL(@DetailKey, '')));

    SET @UserName =
        LTRIM(RTRIM(ISNULL(@UserName, '')));

    SET @BranchID =
        LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = ''
       OR @DetailKey = ''
       OR @UserName = ''
    BEGIN
        THROW 53401,
            N'PHASE4_JOIN_CONTEXT_REQUIRED',
            1;
    END;

    /*
      Resolve contract duy nhất từ allow-list.
    */
    DECLARE
        @ApiList varchar(100),
        @ExpectedProcedure sysname,
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @ReadOnly bit,
        @RegistryCount int;

    SELECT
        @RegistryCount = COUNT(*),

        @ApiList =
            MIN(R.ApiList),

        @ExpectedProcedure =
            MIN(CONVERT(sysname, R.ExpectedProcedure)),

        @ExpectedTable =
            MIN(CONVERT(sysname, R.ExpectedTableName)),

        @ExpectedPrimaryKey =
            MIN(CONVERT(sysname, R.ExpectedPrimaryKey)),

        @ReadOnly =
            CONVERT(
                bit,
                MIN(CONVERT(tinyint, R.IsReadOnly))
            )
    FROM dbo.API_Phase4JoinRegistry() AS R
    WHERE
        R.WebFormName COLLATE DATABASE_DEFAULT =
            @WebFormName COLLATE DATABASE_DEFAULT

        AND R.DetailKey COLLATE DATABASE_DEFAULT =
            @DetailKey COLLATE DATABASE_DEFAULT

        AND R.EnableMetadata = 1;

    IF ISNULL(@RegistryCount, 0) <> 1
    BEGIN
        THROW 53402,
            N'PHASE4_JOIN_CONTRACT_NOT_ALLOWLISTED',
            1;
    END;

    /*
      Actor và branch policy dùng cùng cấu trúc đã chạy ở Phase 3.
    */
    DECLARE
        @UserGroupID varchar(50),
        @UserBranches varchar(max);

    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE
        U.UserName COLLATE DATABASE_DEFAULT =
            @UserName COLLATE DATABASE_DEFAULT

        AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        THROW 53403,
            N'PHASE4_JOIN_ACTOR_INVALID',
            1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT
       <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(
            RTRIM(
                ISNULL(@UserBranches, '')
            )
        ) = ''
        OR @BranchID = ''
        BEGIN
            THROW 53406,
                N'PHASE4_JOIN_BRANCH_REQUIRED',
                1;
        END;

        IF EXISTS
        (
            SELECT 1
            FROM STRING_SPLIT(
                @BranchID,
                ','
            ) AS Requested
            WHERE
                LTRIM(RTRIM(Requested.[value])) <> ''

                AND NOT EXISTS
                (
                    SELECT 1
                    FROM STRING_SPLIT(
                        @UserBranches,
                        ','
                    ) AS Allowed
                    WHERE
                        LTRIM(RTRIM(Allowed.[value]))
                            COLLATE DATABASE_DEFAULT
                        =
                        LTRIM(RTRIM(Requested.[value]))
                            COLLATE DATABASE_DEFAULT
                )
        )
        BEGIN
            THROW 53407,
                N'PHASE4_JOIN_BRANCH_DENIED',
                1;
        END;
    END;

    /*
      Menu và permission dùng MenuID, IsRun và user override group.
    */
    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0;

    SELECT TOP (1)
        @MenuID = M.MenuID,

        @SkipPermission =
            ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE
        M.FormName COLLATE DATABASE_DEFAULT =
            @WebFormName COLLATE DATABASE_DEFAULT

        AND ISNULL(M.isDisable, 0) = 0
    ORDER BY
        M.MenuID;

    IF @MenuID IS NULL
    BEGIN
        THROW 53404,
            N'PHASE4_JOIN_ACTIVE_MENU_REQUIRED',
            1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT
       <> 'admin' COLLATE DATABASE_DEFAULT

       AND @SkipPermission = 0
    BEGIN
        DECLARE
            @GroupCanRun bit,
            @UserCanRun bit;

        SELECT
            @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE
            P.UserGroupID COLLATE DATABASE_DEFAULT =
                @UserGroupID COLLATE DATABASE_DEFAULT

            AND P.MenuID COLLATE DATABASE_DEFAULT =
                @MenuID COLLATE DATABASE_DEFAULT;

        SELECT
            @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE
            P.UserName COLLATE DATABASE_DEFAULT =
                @UserName COLLATE DATABASE_DEFAULT

            AND P.MenuID COLLATE DATABASE_DEFAULT =
                @MenuID COLLATE DATABASE_DEFAULT;

        IF ISNULL(
            @UserCanRun,
            ISNULL(@GroupCanRun, 0)
        ) <> 1
        BEGIN
            THROW 53405,
                N'PHASE4_JOIN_PERMISSION_DENIED',
                1;
        END;
    END;

    /*
      Route nghiệp vụ phải tồn tại đúng một lần.
    */
    DECLARE
        @RouteCount int,
        @RegisteredProcedure sysname;

    SELECT
        @RouteCount = COUNT(*),

        @RegisteredProcedure =
            MIN
            (
                CONVERT
                (
                    sysname,
                    PARSENAME(
                        LTRIM(RTRIM(A.[SQL])),
                        1
                    )
                )
            )
    FROM dbo.WA_API AS A
    WHERE
        A.[list] COLLATE DATABASE_DEFAULT =
            @ApiList COLLATE DATABASE_DEFAULT

        AND A.[func] COLLATE DATABASE_DEFAULT =
            'View' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR @RegisteredProcedure IS NULL
       OR @RegisteredProcedure COLLATE DATABASE_DEFAULT
          <> @ExpectedProcedure COLLATE DATABASE_DEFAULT
    BEGIN
        THROW 53408,
            N'PHASE4_JOIN_VIEW_ROUTE_INVALID',
            1;
    END;

    DECLARE @ProcedureObjectID int =
        COALESCE
        (
            OBJECT_ID(
                @ExpectedProcedure,
                N'P'
            ),

            OBJECT_ID(
                N'dbo.' + @ExpectedProcedure,
                N'P'
            )
        );

    IF @ProcedureObjectID IS NULL
    BEGIN
        THROW 53409,
            N'PHASE4_JOIN_PROCEDURE_NOT_FOUND',
            1;
    END;

    DECLARE @TableObjectID int =
        COALESCE
        (
            OBJECT_ID(
                @ExpectedTable,
                N'U'
            ),

            OBJECT_ID(
                N'dbo.' + @ExpectedTable,
                N'U'
            )
        );

    IF @TableObjectID IS NULL
    BEGIN
        THROW 53410,
            N'PHASE4_JOIN_MAIN_TABLE_NOT_FOUND',
            1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.columns AS C
        WHERE
            C.object_id = @TableObjectID

            AND C.name COLLATE DATABASE_DEFAULT =
                @ExpectedPrimaryKey
                    COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53411,
            N'PHASE4_JOIN_PRIMARY_KEY_NOT_FOUND',
            1;
    END;

    /*
      Result-set là nguồn membership chính.
      Không fallback sang sys.columns khi describe lỗi.
    */
    DECLARE @Fields TABLE
(
    FieldOrdinal int NOT NULL,
    FieldName sysname NOT NULL,
    SqlType nvarchar(256) NULL,
    IsNullable bit NULL,
    MaxLength int NULL,

    /*
      Lineage của field trong result-set.
      Dùng để phân biệt cột bảng chính và cột JOIN.
    */
    SourceSchema sysname NULL,
    SourceTable sysname NULL,
    SourceColumn sysname NULL
);

    BEGIN TRY
        IF EXISTS
        (
            SELECT 1
            FROM sys.dm_exec_describe_first_result_set_for_object
            (
                @ProcedureObjectID,
                1
            ) AS D
            WHERE
                D.error_number IS NOT NULL
        )
        BEGIN
            THROW 53412,
                N'PHASE4_JOIN_RESULTSET_METADATA_ERROR',
                1;
        END;

        INSERT INTO @Fields
(
    FieldOrdinal,
    FieldName,
    SqlType,
    IsNullable,
    MaxLength,
    SourceSchema,
    SourceTable,
    SourceColumn
)
SELECT
    D.column_ordinal,
    D.name,
    D.system_type_name,
    D.is_nullable,
    D.max_length,
    D.source_schema,
    D.source_table,
    D.source_column
        FROM sys.dm_exec_describe_first_result_set_for_object
        (
            @ProcedureObjectID,
            1
        ) AS D
        WHERE
            ISNULL(D.is_hidden, 0) = 0

            AND D.error_number IS NULL

            AND D.name IS NOT NULL

            AND LTRIM(RTRIM(D.name)) <> '';
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER()
           BETWEEN 53400 AND 53499
        BEGIN
            THROW;
        END;

        THROW 53412,
            N'PHASE4_JOIN_RESULTSET_METADATA_ERROR',
            1;
    END CATCH;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Fields
    )
    BEGIN
        THROW 53413,
            N'PHASE4_JOIN_RESULTSET_EMPTY',
            1;
    END;

    IF EXISTS
    (
        SELECT
            LOWER(F.FieldName)
                COLLATE DATABASE_DEFAULT
        FROM @Fields AS F
        GROUP BY
            LOWER(F.FieldName)
                COLLATE DATABASE_DEFAULT
        HAVING
            COUNT(*) > 1
    )
    BEGIN
        THROW 53414,
            N'PHASE4_JOIN_DUPLICATE_FIELD',
            1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE
            F.FieldName COLLATE DATABASE_DEFAULT =
                @ExpectedPrimaryKey
                    COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53415,
            N'PHASE4_JOIN_PRIMARY_KEY_NOT_IN_RESULT',
            1;
    END;

    /*
      Không phát metadata cho field nhạy cảm hoặc kiểu dữ liệu không an toàn.
    */
    IF EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE
            LOWER(F.FieldName)
                COLLATE DATABASE_DEFAULT
                IN
                (
                    '__proto__',
                    'prototype',
                    'constructor',
                    'content',
                    'base64content',
                    'filecontent',
                    'binarydata',
                    'password',
                    'passwordhash',
                    'token',
                    'refreshtoken',
                    'secret',
                    'rawsql',
                    'commandtext'
                )

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'binary%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'varbinary%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'image%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'rowversion%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'timestamp%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'xml%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'sql_variant%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'geography%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'geometry%'

            OR LOWER(ISNULL(F.SqlType, ''))
                LIKE 'hierarchyid%'
    )
    BEGIN
        THROW 53416,
            N'PHASE4_JOIN_UNSAFE_RESULT_FIELD',
            1;
    END;

    SELECT
        CAST('2.0' AS varchar(10))
            AS SchemaVersion,

        CAST('1.0' AS varchar(10))
            AS ContractVersion,

        @WebFormName
            AS WebFormName,

        @DetailKey
            AS DetailKey,

        @ApiList
            AS ApiList,

        @ExpectedTable
            AS TableName,

        @ExpectedPrimaryKey
            AS PrimaryKey,

        @RegisteredProcedure
            AS RegisteredViewProcedure,

        CONVERT(bit, @ReadOnly)
            AS [ReadOnly],

        CAST(
            'JOIN_RESULT_SET'
            AS varchar(40)
        ) AS SourceKind,

        RF.FieldOrdinal,

        CONVERT(
            varchar(128),
            RF.FieldName
        ) AS FieldName,

        RF.SqlType,
        RF.IsNullable,
        RF.SourceSchema,
        RF.SourceTable,
        RF.SourceColumn,
        CONVERT
        (
            bit,
            CASE
                WHEN C.column_id IS NULL
                    THEN 0
                ELSE 1
            END
        ) AS IsPhysicalColumn,

        CONVERT
        (
            bit,
            CASE
                WHEN RF.FieldName
                     COLLATE DATABASE_DEFAULT
                     =
                     @ExpectedPrimaryKey
                     COLLATE DATABASE_DEFAULT
                    THEN 1
                ELSE 0
            END
        ) AS IsPrimaryKey,

        CONVERT
        (
            bit,
            CASE
                WHEN @ReadOnly = 1
                  OR C.column_id IS NULL
                    THEN 1
                ELSE 0
            END
        ) AS IsReadOnly,

        COALESCE
        (
            NULLIF(M.CaptionVN, N''),
            NULLIF(M.CaptionEN, N''),
            CONVERT(
                nvarchar(200),
                RF.FieldName
            )
        ) AS Caption,

        M.FormatID,
        F.[Type] AS FormatType,

        CASE
            WHEN D.UserAutoID IS NOT NULL
                THEN 'lookup'

            WHEN LOWER(ISNULL(RF.SqlType, ''))
                 LIKE 'bit%'
                THEN 'boolean'

            WHEN UPPER(ISNULL(M.FormatID, '')) = 'D'
                THEN 'date'

            WHEN UPPER(ISNULL(M.FormatID, '')) = 'DT'
                THEN 'datetime'

            WHEN UPPER(ISNULL(M.FormatID, '')) = 'H'
                THEN 'time'

            WHEN UPPER(ISNULL(M.FormatID, ''))
                 IN
                 (
                    'B',
                    'Q',
                    'N',
                    'N0',
                    'N3'
                 )
                THEN 'number'

            WHEN LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%date%'
                THEN 'date'

            WHEN LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%time%'
                THEN 'time'

            WHEN LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%int%'

              OR LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%decimal%'

              OR LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%numeric%'

              OR LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%money%'

              OR LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%float%'

              OR LOWER(ISNULL(RF.SqlType, ''))
                 LIKE '%real%'
                THEN 'number'

            ELSE 'text'
        END AS RenderType,

        F.NumberDecimal,
        F.FormatString,
        F.MaskString,

        COALESCE(
            F.MaxLength,
            RF.MaxLength
        ) AS MaxLength,

        F.MinValue,
        F.MaxValue,

        COALESCE(
            NULLIF(M.AlignX, ''),
            F.Align
        ) AS Align,

        M.MinWidth,
        M.MaxWidth,

        CASE
            WHEN D.UserAutoID IS NULL
                THEN NULL

            ELSE
                CONVERT
                (
                    varchar(64),

                    HASHBYTES
                    (
                        'SHA2_256',

                        CONCAT
                        (
                            D.UserAutoID,
                            '|',
                            D.FormID,
                            '|',
                            D.ColumnID
                        )
                    ),

                    2
                )
        END AS LookupKey,

        D.[Type]
            AS LookupType,

        D.ValueColumn
            AS LookupValueColumn,

        D.DisplayColumn
            AS LookupDisplayColumn,

        D.ColumnArr
            AS LookupColumns,

        D.WidthArr
            AS LookupWidths,

        D.ParaRequireArr
            AS LookupDependsOn,

        CONVERT
        (
            bit,
            ISNULL(D.IsMultiSelect, 0)
        ) AS LookupMultiSelect,

        D.ReloadType
            AS LookupReloadMode,

        CONVERT
        (
            bit,
            ISNULL(D.IsDisable, 0)
        ) AS LookupDisabled,

        CAST(NULL AS varchar(80))
            AS DiagnosticCode

    FROM @Fields AS RF

    LEFT JOIN sys.columns AS C
  ON C.object_id = @TableObjectID

 AND C.name COLLATE DATABASE_DEFAULT =
     COALESCE(
         NULLIF(RF.SourceColumn, ''),
         RF.FieldName
     ) COLLATE DATABASE_DEFAULT

 /*
   Field chỉ được coi là physical của main table khi:
   - SQL Server xác định nó đến từ main table;
   - hoặc source lineage không có nhưng tên field khớp main table.
 */
 AND
 (
     RF.SourceTable IS NULL

     OR RF.SourceTable COLLATE DATABASE_DEFAULT =
        @ExpectedTable COLLATE DATABASE_DEFAULT
 )

    /*
      TOP 1 tránh nhân bản field khi metadata có nhiều dòng.
    */
    OUTER APPLY
    (
        SELECT TOP (1)
            X.FormatID,
            X.CaptionVN,
            X.CaptionEN,
            X.AlignX,
            X.MinWidth,
            X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE
            X.FieldName COLLATE DATABASE_DEFAULT =
                RF.FieldName COLLATE DATABASE_DEFAULT

            AND
            (
                X.FormName COLLATE DATABASE_DEFAULT =
                    @WebFormName COLLATE DATABASE_DEFAULT

                OR X.FormName COLLATE DATABASE_DEFAULT =
                    @ApiList COLLATE DATABASE_DEFAULT

                OR X.FormName IS NULL

                OR LTRIM(RTRIM(X.FormName)) = ''
            )
        ORDER BY
            CASE
                WHEN X.FormName COLLATE DATABASE_DEFAULT =
                     @WebFormName COLLATE DATABASE_DEFAULT
                    THEN 1

                WHEN X.FormName COLLATE DATABASE_DEFAULT =
                     @ApiList COLLATE DATABASE_DEFAULT
                    THEN 2

                ELSE 3
            END,

            X.AutoID
    ) AS M

    LEFT JOIN dbo.SY_FmatTbl AS F
      ON F.FormatID COLLATE DATABASE_DEFAULT =
         M.FormatID COLLATE DATABASE_DEFAULT

    /*
      Lookup dùng đúng schema SY_FrmDrdwTbl của hệ thống.
    */
    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID,
            X.FormID,
            X.ColumnID,
            X.[Type],
            X.ValueColumn,
            X.DisplayColumn,
            X.ColumnArr,
            X.WidthArr,
            X.ParaRequireArr,
            X.IsMultiSelect,
            X.ReloadType,
            X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE
            X.ColumnID COLLATE DATABASE_DEFAULT =
                RF.FieldName COLLATE DATABASE_DEFAULT

            AND X.FormID COLLATE DATABASE_DEFAULT
                IN
                (
                    @WebFormName,
                    @ApiList
                )

            AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY
            CASE
                WHEN X.FormID COLLATE DATABASE_DEFAULT =
                     @WebFormName COLLATE DATABASE_DEFAULT
                    THEN 1

                ELSE 2
            END,

            X.UserAutoID
    ) AS D

    ORDER BY
        RF.FieldOrdinal;
END;
GO