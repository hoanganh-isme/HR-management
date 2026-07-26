/*
  Phase 4 - cutover idempotent cho master Ca làm việc và detail Nhân viên.

  Script chỉ sửa đúng các route List + Func trong phạm vi Phase 4.
  Không xóa dữ liệu nghiệp vụ, không đụng SY_FormatFields và không xóa
  toàn bộ WA_API theo List. Chạy lại an toàn sau khi đã qua precheck.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE
    @MasterList varchar(100) = 'WA_CaLamViecFrm',
    @EmployeeList varchar(100) = 'API_CaLamViec_NhanVien',
    @DetailList varchar(100) = 'API_CaLamViec_ChiTiet',
    @MasterTable sysname = N'HR_SapCaTbl',
    @EmployeeTable sysname = N'HR_SapCaNhanVienTbl';

IF OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
    THROW 53700, N'PHASE4_MASTER_VIEW_V2_NOT_INSTALLED', 1;
IF OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
    THROW 53701, N'PHASE4_SAVE_V2_NOT_INSTALLED', 1;
IF OBJECT_ID(N'dbo.API_XoaDong_V2', N'P') IS NULL
    THROW 53702, N'PHASE4_DELETE_V2_NOT_INSTALLED', 1;
IF OBJECT_ID(N'dbo.API_CaLamViec', N'P') IS NULL
    THROW 53703, N'PHASE4_MASTER_LEGACY_VIEW_NOT_FOUND', 1;
IF OBJECT_ID(N'dbo.API_CaLamViec_NhanVien', N'P') IS NULL
    THROW 53704, N'PHASE4_EMPLOYEE_VIEW_NOT_FOUND', 1;
IF OBJECT_ID(N'dbo.API_CaLamViec_ChiTiet', N'P') IS NULL
    THROW 53705, N'PHASE4_DETAIL_VIEW_NOT_FOUND', 1;

IF NOT EXISTS (
    SELECT 1 FROM dbo.SY_FrmLstTbl
    WHERE FormID = @MasterList AND TableName = @MasterTable AND PrimaryKey = 'SapCaID'
)
    THROW 53706, N'PHASE4_MASTER_TABLE_REGISTRATION_INVALID', 1;
IF NOT EXISTS (
    SELECT 1 FROM dbo.SY_FrmLstTbl
    WHERE FormID = @EmployeeList AND TableName = @EmployeeTable AND PrimaryKey = 'UserAutoID'
)
    THROW 53707, N'PHASE4_EMPLOYEE_TABLE_REGISTRATION_INVALID', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    /* Không cho phép route trùng trong bất kỳ action nào đang cutover. */
    IF EXISTS (
        SELECT [list], [func]
        FROM dbo.WA_API
        WHERE [list] IN (@MasterList, @EmployeeList, @DetailList)
          AND [func] IN ('View', 'Save', 'Delete')
        GROUP BY [list], [func]
        HAVING COUNT(*) > 1
    )
        THROW 53708, N'PHASE4_WA_API_ROUTE_DUPLICATE', 1;

    /* Route master: chỉ nhận legacy hiện tại hoặc V2 đã biết. */
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @MasterList AND [func] = 'View'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) NOT IN ('API_CaLamViec', 'API_TruyVanDong_V2')
    )
        THROW 53709, N'PHASE4_MASTER_VIEW_ROUTE_CONFLICT', 1;
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @MasterList AND [func] = 'Save'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) NOT IN ('API_LuuDong', 'API_LuuDong_V2')
    )
        THROW 53710, N'PHASE4_MASTER_SAVE_ROUTE_CONFLICT', 1;
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @MasterList AND [func] = 'Delete'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) NOT IN ('API_XoaDong', 'API_XoaDong_V2')
    )
        THROW 53711, N'PHASE4_MASTER_DELETE_ROUTE_CONFLICT', 1;

    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @EmployeeList AND [func] = 'View'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) <> 'API_CaLamViec_NhanVien'
    )
        THROW 53713, N'PHASE4_EMPLOYEE_VIEW_ROUTE_CONFLICT', 1;
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @EmployeeList AND [func] = 'Save'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) NOT IN ('API_LuuDong', 'API_LuuDong_V2')
    )
        THROW 53714, N'PHASE4_EMPLOYEE_SAVE_ROUTE_CONFLICT', 1;
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @EmployeeList AND [func] = 'Delete'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) NOT IN ('API_XoaDong', 'API_XoaDong_V2')
    )
        THROW 53715, N'PHASE4_EMPLOYEE_DELETE_ROUTE_CONFLICT', 1;
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @DetailList AND [func] = 'View'
          AND PARSENAME(LTRIM(RTRIM([SQL])), 1) <> 'API_CaLamViec_ChiTiet'
    )
        THROW 53716, N'PHASE4_DETAIL_VIEW_ROUTE_CONFLICT', 1;

    /* Route detail read-only: không được phát sinh Save/Delete. */
    IF EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE [list] = @DetailList AND [func] IN ('Save', 'Delete')
    )
        THROW 53712, N'PHASE4_READONLY_DETAIL_MUTATION_ROUTE_FORBIDDEN', 1;

    /* View master dùng generic V2, giữ đầy đủ wire parameter phân trang/lọc. */
    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @MasterList AND [func] = 'View')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_TruyVanDong_V2',
            [Para] = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @MasterList AND [func] = 'View';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@MasterList, 'View', N'API_TruyVanDong_V2',
            N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');

    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @MasterList AND [func] = 'Save')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_LuuDong_V2',
            [Para] = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @MasterList AND [func] = 'Save';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@MasterList, 'Save', N'API_LuuDong_V2',
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');

    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @MasterList AND [func] = 'Delete')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_XoaDong_V2',
            [Para] = N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @MasterList AND [func] = 'Delete';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@MasterList, 'Delete', N'API_XoaDong_V2',
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''');

    /* Detail Nhân viên giữ View JOIN nghiệp vụ, mutation dùng V2. */
    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @EmployeeList AND [func] = 'View')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_CaLamViec_NhanVien', [Para] = N'@SapCaID=N''{SapCaID}'''
        WHERE [list] = @EmployeeList AND [func] = 'View';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@EmployeeList, 'View', N'API_CaLamViec_NhanVien', N'@SapCaID=N''{SapCaID}''');

    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @EmployeeList AND [func] = 'Save')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_LuuDong_V2',
            [Para] = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @EmployeeList AND [func] = 'Save';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@EmployeeList, 'Save', N'API_LuuDong_V2',
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');

    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @EmployeeList AND [func] = 'Delete')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_XoaDong_V2',
            [Para] = N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @EmployeeList AND [func] = 'Delete';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@EmployeeList, 'Delete', N'API_XoaDong_V2',
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''');

    /* Detail Bảng ca chi tiết chỉ có đúng route View. */
    IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = @DetailList AND [func] = 'View')
        UPDATE dbo.WA_API
        SET [SQL] = N'API_CaLamViec_ChiTiet', [Para] = N'@SapCaID=N''{SapCaID}'''
        WHERE [list] = @DetailList AND [func] = 'View';
    ELSE
        INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
        VALUES (@DetailList, 'View', N'API_CaLamViec_ChiTiet', N'@SapCaID=N''{SapCaID}''');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT [list], [func], [SQL], [Para]
FROM dbo.WA_API
WHERE [list] IN (@MasterList, @EmployeeList, @DetailList)
ORDER BY [list], CASE [func] WHEN 'View' THEN 1 WHEN 'Save' THEN 2 WHEN 'Delete' THEN 3 ELSE 4 END;
