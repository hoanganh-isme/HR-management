/*
  Contract chỉ đọc cho Grid Schema V2.
  Nguồn: result-set của WA_API View; fallback sys.columns của TableName.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_GridFieldSchemaV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_GridFieldSchemaV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_GridFieldSchemaV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = '' OR @UserName = ''
        THROW 51001, N'Thiếu ngữ cảnh đọc metadata.', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51002, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND NOT EXISTS (
            SELECT 1
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS P
              ON P.MenuID = M.MenuID
             AND P.UserGroupID = @UserGroupID
            WHERE M.FormName = @WebFormName
              AND ISNULL(M.isDisable, 0) = 0
              AND (ISNULL(M.isNotCheckPermission, 0) = 1 OR ISNULL(P.IsRun, 0) = 1)
       )
        THROW 51003, N'Không có quyền đọc metadata của form.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND LTRIM(RTRIM(ISNULL(@UserBranches, ''))) <> ''
    BEGIN
        IF @BranchID = ''
            THROW 51004, N'Thiếu ngữ cảnh chi nhánh.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                    WHERE LTRIM(RTRIM(Allowed.[value])) = LTRIM(RTRIM(Requested.[value]))
              )
        )
            THROW 51005, N'Chi nhánh nằm ngoài phạm vi được cấp.', 1;
    END;

    DECLARE @ApiCount int, @ViewProcedure varchar(50);
    SELECT
        @ApiCount = COUNT(*),
        @ViewProcedure = MIN(LTRIM(RTRIM(A.[SQL])))
    FROM dbo.WA_API AS A
    WHERE A.[list] = @WebFormName
      AND A.[func] = 'View';

    IF ISNULL(@ApiCount, 0) <> 1 OR ISNULL(@ViewProcedure, '') = ''
        THROW 51006, N'WA_API View chưa có duy nhất một đăng ký hợp lệ.', 1;

    DECLARE @TableName varchar(100), @PrimaryKey varchar(100);
    SELECT
        @TableName = L.TableName,
        @PrimaryKey = L.PrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @ERPFormID;

    IF ISNULL(@TableName, '') = ''
        THROW 51007, N'ERP Form chưa có TableName hợp lệ.', 1;

    DECLARE @Fields table (
        FieldOrdinal int NOT NULL,
        FieldName sysname NOT NULL,
        SqlType nvarchar(256) NULL,
        IsNullable bit NULL,
        SourceKind varchar(30) NOT NULL
    );

    DECLARE @ProcedureObjectID int = COALESCE(
        OBJECT_ID(@ViewProcedure, N'P'),
        OBJECT_ID(N'dbo.' + @ViewProcedure, N'P')
    );

    IF @ProcedureObjectID IS NOT NULL
    BEGIN
        BEGIN TRY
            INSERT INTO @Fields (FieldOrdinal, FieldName, SqlType, IsNullable, SourceKind)
            SELECT
                D.column_ordinal,
                D.name,
                D.system_type_name,
                D.is_nullable,
                'RESULT_SET'
            FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 0) AS D
            WHERE ISNULL(D.is_hidden, 0) = 0
              AND D.name IS NOT NULL;
        END TRY
        BEGIN CATCH
            -- Procedure dùng SQL động sẽ được xử lý bằng fallback có kiểm soát bên dưới.
            SET @ProcedureObjectID = @ProcedureObjectID;
        END CATCH;
    END;

    IF NOT EXISTS (SELECT 1 FROM @Fields)
    BEGIN
        DECLARE @TableObjectID int = COALESCE(
            OBJECT_ID(@TableName),
            OBJECT_ID(N'dbo.' + @TableName)
        );

        IF @TableObjectID IS NULL
            THROW 51008, N'Không mô tả được result-set và không tìm thấy bảng/view fallback.', 1;

        INSERT INTO @Fields (FieldOrdinal, FieldName, SqlType, IsNullable, SourceKind)
        SELECT
            C.column_id,
            C.name,
            TYPE_NAME(C.user_type_id)
                + CASE
                    WHEN TYPE_NAME(C.user_type_id) IN ('varchar', 'char', 'varbinary', 'binary')
                        THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
                    WHEN TYPE_NAME(C.user_type_id) IN ('nvarchar', 'nchar')
                        THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
                    WHEN TYPE_NAME(C.user_type_id) IN ('decimal', 'numeric')
                        THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
                    ELSE ''
                  END,
            C.is_nullable,
            'TABLE_FALLBACK'
        FROM sys.columns AS C
        WHERE C.object_id = @TableObjectID
        ORDER BY C.column_id;
    END;

    SELECT
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        @WebFormName AS WebFormName,
        @ERPFormID AS ERPFormName,
        @TableName AS TableName,
        @PrimaryKey AS PrimaryKey,
        F.SourceKind,
        F.FieldOrdinal,
        CONVERT(varchar(128), F.FieldName) AS FieldName,
        F.SqlType,
        F.IsNullable,
        COALESCE(NULLIF(M.CaptionVN, ''), NULLIF(M.CaptionEN, ''), CONVERT(nvarchar(200), F.FieldName)) AS Caption,
        M.FormatID,
        R.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN F.SqlType = 'bit' OR F.SqlType LIKE 'bit(%' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('D') THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('DT') THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('H') THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B') THEN 'money'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('Q') THEN 'decimal'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            WHEN F.SqlType LIKE '%date%' OR F.SqlType LIKE '%time%' THEN 'date'
            WHEN F.SqlType LIKE '%int%' OR F.SqlType LIKE '%decimal%' OR F.SqlType LIKE '%numeric%' OR F.SqlType LIKE '%money%' OR F.SqlType LIKE '%float%' THEN 'number'
            ELSE 'text'
        END AS RenderType,
        R.NumberDecimal,
        R.FormatString,
        R.MaskString,
        R.MaxLength,
        R.MinValue,
        R.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), R.Align) AS Align,
        M.MinWidth,
        M.MaxWidth,
        CASE WHEN D.UserAutoID IS NULL THEN NULL ELSE
            CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2)
        END AS LookupKey,
        D.[Type] AS LookupType,
        D.ValueColumn AS LookupValueColumn,
        D.DisplayColumn AS LookupDisplayColumn,
        D.ColumnArr AS LookupColumns,
        D.WidthArr AS LookupWidths,
        D.ParaRequireArr AS LookupDependsOn,
        CONVERT(bit, ISNULL(D.IsMultiSelect, 0)) AS LookupMultiSelect,
        D.ReloadType AS LookupReloadMode,
        CONVERT(bit, ISNULL(D.IsDisable, 0)) AS LookupDisabled,
        CASE WHEN F.SourceKind = 'TABLE_FALLBACK' THEN 'RESULTSET_FALLBACK_TO_TABLE' ELSE 'OK' END AS DiagnosticCode
    FROM @Fields AS F
    OUTER APPLY (
        SELECT TOP (1)
            X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE LOWER(X.FieldName) = LOWER(CONVERT(varchar(128), F.FieldName))
          AND (
                LOWER(ISNULL(X.FormName, '')) = LOWER(@ERPFormID)
             OR LOWER(ISNULL(X.FormName, '')) = LOWER(@WebFormName)
             OR X.FormName IS NULL
             OR LTRIM(RTRIM(X.FormName)) = ''
          )
        ORDER BY
            CASE
                WHEN LOWER(ISNULL(X.FormName, '')) = LOWER(@ERPFormID) THEN 1
                WHEN LOWER(ISNULL(X.FormName, '')) = LOWER(@WebFormName) THEN 2
                WHEN X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '' THEN 3
                ELSE 4
            END,
            X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS R
      ON R.FormatID = M.FormatID
    OUTER APPLY (
        SELECT TOP (1)
            X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn,
            X.DisplayColumn, X.ColumnArr, X.WidthArr, X.ParaRequireArr,
            X.IsMultiSelect, X.ReloadType, X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE LOWER(X.ColumnID) = LOWER(CONVERT(varchar(128), F.FieldName))
          AND LOWER(ISNULL(X.FormID, '')) IN (LOWER(@ERPFormID), LOWER(@WebFormName))
          AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY CASE WHEN LOWER(ISNULL(X.FormID, '')) = LOWER(@ERPFormID) THEN 1 ELSE 2 END, X.UserAutoID
    ) AS D
    ORDER BY F.FieldOrdinal;
END;
GO
