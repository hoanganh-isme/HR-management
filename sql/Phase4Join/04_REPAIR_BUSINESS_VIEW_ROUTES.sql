/*
  Phase 4B:
  Chỉ repair View route.
  Không được xóa Save/Delete đã cutover sang V2.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @ViewRoutes table
    (
        ListName varchar(50) NOT NULL,
        ProcedureName sysname NOT NULL,
        Para nvarchar(max) NOT NULL
    );

    INSERT INTO @ViewRoutes
    (
        ListName,
        ProcedureName,
        Para
    )
    VALUES
    (
        'API_CaLamViec_NhanVien',
        N'API_CaLamViec_NhanVien',
        N'@SapCaID=N''{SapCaID}'''
    ),
    (
        'API_CaLamViec_ChiTiet',
        N'API_CaLamViec_ChiTiet',
        N'@SapCaID=N''{SapCaID}'''
    );

    IF EXISTS
    (
        SELECT 1

        FROM @ViewRoutes AS R

        CROSS APPLY
        (
            SELECT COUNT(*) AS RouteCount

            FROM dbo.WA_API AS A

            WHERE
                A.[list] COLLATE DATABASE_DEFAULT =
                    R.ListName COLLATE DATABASE_DEFAULT

                AND A.[func] COLLATE DATABASE_DEFAULT =
                    'View' COLLATE DATABASE_DEFAULT
        ) AS C

        WHERE C.RouteCount > 1
    )
    BEGIN
        THROW 53620,
            N'PHASE4_BUSINESS_VIEW_ROUTE_DUPLICATE',
            1;
    END;

    IF EXISTS
    (
        SELECT 1

        FROM @ViewRoutes AS R

        INNER JOIN dbo.WA_API AS A
          ON A.[list] COLLATE DATABASE_DEFAULT =
             R.ListName COLLATE DATABASE_DEFAULT

         AND A.[func] COLLATE DATABASE_DEFAULT =
             'View' COLLATE DATABASE_DEFAULT

        WHERE
            PARSENAME(
                LTRIM(RTRIM(A.[SQL])),
                1
            ) COLLATE DATABASE_DEFAULT
            <>
            R.ProcedureName
                COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53621,
            N'PHASE4_BUSINESS_VIEW_ROUTE_CONFLICT',
            1;
    END;

    UPDATE A
    SET
        A.[SQL] = R.ProcedureName,
        A.[Para] = R.Para

    FROM dbo.WA_API AS A

    INNER JOIN @ViewRoutes AS R
      ON R.ListName COLLATE DATABASE_DEFAULT =
         A.[list] COLLATE DATABASE_DEFAULT

    WHERE
        A.[func] COLLATE DATABASE_DEFAULT =
            'View' COLLATE DATABASE_DEFAULT;

    INSERT INTO dbo.WA_API
    (
        [list],
        [func],
        [SQL],
        [Para]
    )
    SELECT
        R.ListName,
        'View',
        R.ProcedureName,
        R.Para

    FROM @ViewRoutes AS R

    WHERE NOT EXISTS
    (
        SELECT 1

        FROM dbo.WA_API AS A

        WHERE
            A.[list] COLLATE DATABASE_DEFAULT =
                R.ListName COLLATE DATABASE_DEFAULT

            AND A.[func] COLLATE DATABASE_DEFAULT =
                'View' COLLATE DATABASE_DEFAULT
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;
GO

SELECT
    [list],
    [func],
    [SQL],
    [Para]
FROM dbo.WA_API
WHERE [list] IN ('API_CaLamViec_NhanVien', 'API_CaLamViec_ChiTiet')
ORDER BY [list], CASE [func] WHEN 'View' THEN 1 WHEN 'Save' THEN 2 WHEN 'Delete' THEN 3 ELSE 4 END;
GO
