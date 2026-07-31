/*
    Phase 3 - khôi phục lookup V2 cho các cột ca của WA_CaLamViecFrm.

    Mục đích:
      - Unified Field Contract đọc lookup từ SY_FrmDrdwTbl, không đọc
        SY_FormatFields.
      - Nguồn lookup phải là API đã đăng ký trong WA_API; không dùng SQL
        tùy ý trong Source.
      - Chạy idempotent: chạy lại sẽ cập nhật đúng một dòng hiện có, không
        xóa cấu hình khác.

    Chạy sau khi đã cài API_HR_DropdownShifts và các procedure Field Contract
    V2. Không chạy lại installer legacy có lệnh DELETE toàn bộ cấu hình form.
    File này chỉ chuẩn bị metadata; không tự kích hoạt/cutover form.
*/
USE X26DIMTUTAC;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    IF OBJECT_ID(N'dbo.SY_FrmDrdwTbl', N'U') IS NULL
        THROW 52601, N'Thiếu bảng dbo.SY_FrmDrdwTbl.', 1;

    IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
        THROW 52602, N'Thiếu bảng dbo.WA_API.', 1;

    IF OBJECT_ID(N'dbo.HR_ShiftListTbl', N'U') IS NULL
        THROW 52603, N'Thiếu bảng dbo.HR_ShiftListTbl.', 1;

    IF OBJECT_ID(N'dbo.API_HR_DropdownShifts', N'P') IS NULL
        THROW 52604, N'Chưa cài procedure dbo.API_HR_DropdownShifts.', 1;

    DECLARE @ShiftColumns TABLE
    (
        RowNo int NOT NULL PRIMARY KEY,
        ColumnID sysname NOT NULL
    );

    INSERT INTO @ShiftColumns (RowNo, ColumnID)
    VALUES
        (1, N'ShiftIDThu2'),
        (2, N'ShiftIDThu3'),
        (3, N'ShiftIDThu4'),
        (4, N'ShiftIDThu5'),
        (5, N'ShiftIDThu6'),
        (6, N'ShiftIDThu7'),
        (7, N'ShiftIDChuNhat');

    DECLARE
        @RowNo int = 1,
        @ColumnID sysname,
        @ExistingCount int,
        @ErrorMessage nvarchar(2048);

    /* Kiểm tra route lookup trước khi ghi metadata. */
    SELECT @ExistingCount = COUNT(*)
    FROM dbo.WA_API
    WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), [list])))) =
              LOWER(N'API_HR_DropdownShifts')
      AND LOWER(LTRIM(RTRIM(CONVERT(nvarchar(50), [func])))) = LOWER(N'View');

    IF @ExistingCount > 1
    BEGIN
        SET @ErrorMessage =
            N'WA_API có nhiều hơn một route View cho API_HR_DropdownShifts; '
            + N'cần xử lý trùng trước khi sửa metadata.';
        THROW 52605, @ErrorMessage, 1;
    END;

    BEGIN TRANSACTION;

    IF @ExistingCount = 0
    BEGIN
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES
        (
            N'API_HR_DropdownShifts',
            N'View',
            N'API_HR_DropdownShifts',
            N''
        );
    END
    ELSE
    BEGIN
        UPDATE A
        SET
            A.[SQL] = N'API_HR_DropdownShifts',
            A.[Para] = N''
        FROM dbo.WA_API AS A
        WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), A.[list])))) =
                  LOWER(N'API_HR_DropdownShifts')
          AND LOWER(LTRIM(RTRIM(CONVERT(nvarchar(50), A.[func])))) = LOWER(N'View');
    END;

    WHILE @RowNo <= 7
    BEGIN
        SELECT @ColumnID = ColumnID
        FROM @ShiftColumns
        WHERE RowNo = @RowNo;

        /* Không tạo metadata cho cột không tồn tại trên bảng master. */
        IF COL_LENGTH(N'dbo.HR_SapCaTbl', @ColumnID) IS NULL
        BEGIN
            SET @ErrorMessage =
                N'Cột ' + @ColumnID
                + N' không tồn tại trên dbo.HR_SapCaTbl.';
            THROW 52606, @ErrorMessage, 1;
        END;

        SELECT @ExistingCount = COUNT(*)
        FROM dbo.SY_FrmDrdwTbl
        WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), FormID)))) =
                  LOWER(N'WA_CaLamViecFrm')
          AND LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), ColumnID)))) =
                  LOWER(@ColumnID);

        IF @ExistingCount > 1
        BEGIN
            SET @ErrorMessage =
                N'SY_FrmDrdwTbl có nhiều dòng cho WA_CaLamViecFrm/'
                + @ColumnID
                + N'; cần xử lý trùng trước khi sửa metadata.';
            THROW 52607, @ErrorMessage, 1;
        END;

        IF @ExistingCount = 0
        BEGIN
            INSERT INTO dbo.SY_FrmDrdwTbl
            (
                [UserAutoID],
                [FormID],
                [ColumnID],
                [ValueColumn],
                [DisplayColumn],
                [ColumnArr],
                [Source],
                [Type],
                [ParaRequireArr],
                [IsDisable]
            )
            VALUES
            (
                NEWID(),
                N'WA_CaLamViecFrm',
                @ColumnID,
                N'ShiftID',
                N'ShiftName',
                N'ShiftID;ShiftName',
                N'API_HR_DropdownShifts',
                N'API',
                NULL,
                0
            );
        END
        ELSE
        BEGIN
            UPDATE D
            SET
                D.[ValueColumn] = N'ShiftID',
                D.[DisplayColumn] = N'ShiftName',
                D.[ColumnArr] = N'ShiftID;ShiftName',
                D.[Source] = N'API_HR_DropdownShifts',
                D.[Type] = N'API',
                D.[ParaRequireArr] = NULL,
                D.[IsDisable] = 0
            FROM dbo.SY_FrmDrdwTbl AS D
            WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), D.[FormID])))) =
                      LOWER(N'WA_CaLamViecFrm')
              AND LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), D.[ColumnID])))) =
                      LOWER(@ColumnID);
        END;

        SET @RowNo += 1;
    END;

    COMMIT TRANSACTION;

    SELECT
        D.[FormID],
        D.[ColumnID],
        D.[ValueColumn],
        D.[DisplayColumn],
        D.[ColumnArr],
        D.[Source],
        D.[Type],
        D.[IsDisable],
        CASE
            WHEN A.[list] IS NULL THEN N'MISSING_API_ROUTE'
            ELSE N'OK'
        END AS [RegistrationStatus]
    FROM dbo.SY_FrmDrdwTbl AS D
    OUTER APPLY
    (
        SELECT TOP (1) X.[list]
        FROM dbo.WA_API AS X
        WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), X.[list])))) =
                  LOWER(N'API_HR_DropdownShifts')
          AND LOWER(LTRIM(RTRIM(CONVERT(nvarchar(50), X.[func])))) = LOWER(N'View')
    ) AS A
    WHERE LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), D.[FormID])))) =
              LOWER(N'WA_CaLamViecFrm')
      AND EXISTS
      (
          SELECT 1
          FROM @ShiftColumns AS C
          WHERE LOWER(C.ColumnID) =
                LOWER(LTRIM(RTRIM(CONVERT(nvarchar(200), D.[ColumnID]))))
      )
    ORDER BY D.[ColumnID];
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

