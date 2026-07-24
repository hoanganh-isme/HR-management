/*
  Phase 4B:
  Cutover detail Nhân viên sang generic mutation V2.

  Không sửa View route.
  Không xóa route bằng DELETE hàng loạt.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE
    @ListName varchar(50) =
        'API_CaLamViec_NhanVien',

    @SaveFunc varchar(20) =
        'Save',

    @DeleteFunc varchar(20) =
        'Delete',

    @SaveProcedure sysname =
        N'API_LuuDong_V2',

    @DeleteProcedure sysname =
        N'API_XoaDong_V2',

    @SavePara nvarchar(max) =
        N'@List=N''{List}'', '
        + N'@Data=N''{JsonData}'', '
        + N'@UserName=N''{User}'', '
        + N'@BranchID=N''{BranchID}''',

    @DeletePara nvarchar(max) =
        N'@List=N''{List}'', '
        + N'@Ids=N''{Ids}'', '
        + N'@UserName=N''{User}'', '
        + N'@Data=N''{JsonData}'', '
        + N'@BranchID=N''{BranchID}''';

IF OBJECT_ID(
    N'dbo.API_LuuDong_V2',
    N'P'
) IS NULL
BEGIN
    THROW 53600,
        N'PHASE4_SAVE_V2_NOT_INSTALLED',
        1;
END;

IF OBJECT_ID(
    N'dbo.API_XoaDong_V2',
    N'P'
) IS NULL
BEGIN
    THROW 53601,
        N'PHASE4_DELETE_V2_NOT_INSTALLED',
        1;
END;

/*
  V2 bắt buộc List phải có đúng một đăng ký
  bảng và khóa chính.
*/
DECLARE
    @RegistrationCount int,
    @RegisteredTable sysname,
    @RegisteredPrimaryKey sysname;

SELECT
    @RegistrationCount = COUNT(*),

    @RegisteredTable =
        MIN(
            CONVERT(
                sysname,
                LTRIM(RTRIM(F.TableName))
            )
        ),

    @RegisteredPrimaryKey =
        MIN(
            CONVERT(
                sysname,
                LTRIM(RTRIM(F.PrimaryKey))
            )
        )

FROM dbo.SY_FrmLstTbl AS F

WHERE
    F.FormID COLLATE DATABASE_DEFAULT =
        @ListName COLLATE DATABASE_DEFAULT;

IF ISNULL(@RegistrationCount, 0) <> 1
   OR @RegisteredTable COLLATE DATABASE_DEFAULT
      <> N'HR_SapCaNhanVienTbl'
            COLLATE DATABASE_DEFAULT
   OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT
      <> N'UserAutoID'
            COLLATE DATABASE_DEFAULT
BEGIN
    THROW 53602,
        N'PHASE4_SHIFT_EMPLOYEE_FORM_REGISTRATION_INVALID',
        1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    /*
      SAVE
    */
    DECLARE
        @SaveRouteCount int,
        @CurrentSaveProcedure sysname;

    SELECT
        @SaveRouteCount = COUNT(*),

        @CurrentSaveProcedure =
            MIN(
                CONVERT(
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
            @SaveFunc COLLATE DATABASE_DEFAULT;

    IF ISNULL(@SaveRouteCount, 0) > 1
    BEGIN
        THROW 53603,
            N'PHASE4_SHIFT_EMPLOYEE_SAVE_ROUTE_DUPLICATE',
            1;
    END;

    IF ISNULL(@SaveRouteCount, 0) = 1
       AND @CurrentSaveProcedure
            COLLATE DATABASE_DEFAULT
           NOT IN
           (
               N'API_LuuDong'
                    COLLATE DATABASE_DEFAULT,

               N'API_LuuDong_V2'
                    COLLATE DATABASE_DEFAULT
           )
    BEGIN
        THROW 53604,
            N'PHASE4_SHIFT_EMPLOYEE_SAVE_ROUTE_CONFLICT',
            1;
    END;

    IF ISNULL(@SaveRouteCount, 0) = 0
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
            @SaveFunc,
            @SaveProcedure,
            @SavePara
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.WA_API
        SET
            [SQL] = @SaveProcedure,
            [Para] = @SavePara

        WHERE
            [list] COLLATE DATABASE_DEFAULT =
                @ListName COLLATE DATABASE_DEFAULT

            AND [func] COLLATE DATABASE_DEFAULT =
                @SaveFunc COLLATE DATABASE_DEFAULT;

        IF @@ROWCOUNT <> 1
        BEGIN
            THROW 53605,
                N'PHASE4_SHIFT_EMPLOYEE_SAVE_UPDATE_INVALID',
                1;
        END;
    END;

    /*
      DELETE
    */
    DECLARE
        @DeleteRouteCount int,
        @CurrentDeleteProcedure sysname;

    SELECT
        @DeleteRouteCount = COUNT(*),

        @CurrentDeleteProcedure =
            MIN(
                CONVERT(
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
            @DeleteFunc COLLATE DATABASE_DEFAULT;

    IF ISNULL(@DeleteRouteCount, 0) > 1
    BEGIN
        THROW 53606,
            N'PHASE4_SHIFT_EMPLOYEE_DELETE_ROUTE_DUPLICATE',
            1;
    END;

    IF ISNULL(@DeleteRouteCount, 0) = 1
       AND @CurrentDeleteProcedure
            COLLATE DATABASE_DEFAULT
           NOT IN
           (
               N'API_XoaDong'
                    COLLATE DATABASE_DEFAULT,

               N'API_XoaDong_V2'
                    COLLATE DATABASE_DEFAULT
           )
    BEGIN
        THROW 53607,
            N'PHASE4_SHIFT_EMPLOYEE_DELETE_ROUTE_CONFLICT',
            1;
    END;

    IF ISNULL(@DeleteRouteCount, 0) = 0
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
            @DeleteFunc,
            @DeleteProcedure,
            @DeletePara
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.WA_API
        SET
            [SQL] = @DeleteProcedure,
            [Para] = @DeletePara

        WHERE
            [list] COLLATE DATABASE_DEFAULT =
                @ListName COLLATE DATABASE_DEFAULT

            AND [func] COLLATE DATABASE_DEFAULT =
                @DeleteFunc COLLATE DATABASE_DEFAULT;

        IF @@ROWCOUNT <> 1
        BEGIN
            THROW 53608,
                N'PHASE4_SHIFT_EMPLOYEE_DELETE_UPDATE_INVALID',
                1;
        END;
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
    [list] = @ListName

ORDER BY
    CASE [func]
        WHEN 'View' THEN 1
        WHEN 'Save' THEN 2
        WHEN 'Delete' THEN 3
        ELSE 4
    END;
