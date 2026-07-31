/*
  Đăng ký metadata API Phase 4A.

  Script fail-closed:
  - Không chấp nhận route trùng.
  - Không ghi đè route đang trỏ procedure khác.
  - Chỉ cập nhật Para khi route hợp lệ.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE
    @ListName varchar(100) =
        'API_Web_JoinFieldSchemaV2',

    @FuncName varchar(50) =
        'View',

    @ProcedureName sysname =
        N'API_Web_JoinFieldSchemaV2',

    @ParameterTemplate nvarchar(max) =
        N'@WebFormName=N''{FormName}'', '
        + N'@DetailKey=N''{DetailKey}'', '
        + N'@UserName=N''{User}'', '
        + N'@BranchID=N''{BranchID}''',

    @RouteCount int,

    @RegisteredProcedure sysname;

BEGIN TRY
    BEGIN TRANSACTION;

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
        WITH (UPDLOCK, HOLDLOCK)
    WHERE
        A.[list] COLLATE DATABASE_DEFAULT =
            @ListName COLLATE DATABASE_DEFAULT

        AND A.[func] COLLATE DATABASE_DEFAULT =
            @FuncName COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) > 1
    BEGIN
        THROW 53420,
            N'PHASE4_JOIN_METADATA_ROUTE_DUPLICATE',
            1;
    END;

    IF ISNULL(@RouteCount, 0) = 1
       AND
       (
           @RegisteredProcedure IS NULL

           OR @RegisteredProcedure
                COLLATE DATABASE_DEFAULT
              <>
              @ProcedureName
                COLLATE DATABASE_DEFAULT
       )
    BEGIN
        THROW 53421,
            N'PHASE4_JOIN_METADATA_ROUTE_CONFLICT',
            1;
    END;

    IF ISNULL(@RouteCount, 0) = 0
    BEGIN
        INSERT INTO dbo.WA_API
        (
            [list],
            [func],
            [SQL],
            [Para]
        )
        VALUES
        (
            @ListName,
            @FuncName,
            @ProcedureName,
            @ParameterTemplate
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.WA_API
        SET
            [Para] = @ParameterTemplate
        WHERE
            [list] COLLATE DATABASE_DEFAULT =
                @ListName COLLATE DATABASE_DEFAULT

            AND [func] COLLATE DATABASE_DEFAULT =
                @FuncName COLLATE DATABASE_DEFAULT

            AND PARSENAME(
                    LTRIM(RTRIM([SQL])),
                    1
                ) COLLATE DATABASE_DEFAULT
                =
                @ProcedureName COLLATE DATABASE_DEFAULT

            AND ISNULL(
                CONVERT(nvarchar(max), [Para]),
                N''
            ) <> @ParameterTemplate;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;

SELECT
    [list],
    [func],
    [SQL],
    [Para]
FROM dbo.WA_API
WHERE
    [list] COLLATE DATABASE_DEFAULT =
        @ListName COLLATE DATABASE_DEFAULT

    AND [func] COLLATE DATABASE_DEFAULT =
        @FuncName COLLATE DATABASE_DEFAULT;