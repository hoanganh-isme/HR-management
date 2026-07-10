-- ==============================================================================
-- STORED PROCEDURES CHO HR DASHBOARD (MULTI-TEMPLATE)
-- ==============================================================================

IF OBJECT_ID('API_HR_Dashboard_GetBranches', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_GetBranches
GO
CREATE PROCEDURE API_HR_Dashboard_GetBranches
AS
BEGIN
    SET NOCOUNT ON;
    SELECT BranchID AS value, ISNULL(BranchName, BranchID) AS label
    FROM dbo.CF_BranchTbl
    ORDER BY BranchName;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_OverviewToday', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_OverviewToday
GO

CREATE PROCEDURE API_HR_Dashboard_OverviewToday
    @Date DATE = NULL,
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Date IS NULL SET @Date = GETDATE();

    DECLARE @TotalHeadcount INT, @Present INT, @Late INT, @Absent INT, @NewHires INT, @ProbationExpiring INT;

    -- 1. Tổng nhân sự đang làm việc
    SELECT @TotalHeadcount = COUNT(1) 
    FROM dbo.HR_PersonTbl 
    WHERE (NgayNghiViec IS NULL OR NgayNghiViec > @Date)
      AND (@BranchID IS NULL OR @BranchID = '' OR BranchID = @BranchID);

    -- 2. Đi làm & Đi trễ
    SELECT 
        @Present = ISNULL(COUNT(1), 0),
        @Late = ISNULL(SUM(CASE WHEN T.GioVao > '08:00' THEN 1 ELSE 0 END), 0)
    FROM dbo.HR_TimeSheetDayTbl T
    INNER JOIN dbo.HR_PersonTbl P ON T.PersonID = P.PersonID
    WHERE T.Ngay = @Date
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > @Date)
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID);

    -- 3. Vắng mặt
    SET @Present = ISNULL(@Present, 0);
    SET @Absent = @TotalHeadcount - @Present;
    IF @Absent < 0 SET @Absent = 0;

    -- 4. Tuyển mới trong tháng
    SELECT @NewHires = COUNT(1) 
    FROM dbo.HR_PersonTbl 
    WHERE MONTH(NgayVaoLam) = MONTH(@Date) AND YEAR(NgayVaoLam) = YEAR(@Date)
      AND (@BranchID IS NULL OR @BranchID = '' OR BranchID = @BranchID);

    -- 5. Hợp đồng sắp hết hạn
    SELECT @ProbationExpiring = COUNT(1)
    FROM dbo.HR_HopDongTbl H
    INNER JOIN dbo.HR_PersonTbl P ON H.PersonID = P.PersonID
    WHERE H.NgayHetHieuLuc BETWEEN @Date AND DATEADD(DAY, 7, @Date)
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID);

    -- Trả về
    SELECT 
        @TotalHeadcount AS totalHeadcount,
        @Present AS present,
        @Late AS late,
        @Absent AS absent,
        @NewHires AS newHires,
        @ProbationExpiring AS probationExpiring;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_Demographics', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_Demographics
GO

CREATE PROCEDURE API_HR_Dashboard_Demographics
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1: Theo Giới tính
    SELECT 
        'Gender' AS groupType,
        CASE 
            WHEN LTRIM(RTRIM(GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END AS label,
        COUNT(1) AS value
    FROM dbo.HR_PersonTbl P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    GROUP BY 
        CASE 
            WHEN LTRIM(RTRIM(GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END

    UNION ALL

    -- 2: Theo Độ tuổi
    SELECT 
        'Age' AS groupType,
        CASE 
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END AS label,
        COUNT(1) AS value
    FROM dbo.HR_PersonTbl P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND NgaySinh IS NOT NULL
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    GROUP BY 
        CASE 
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END

    UNION ALL

    -- 3: Theo Thời hạn hợp đồng
    SELECT 
        'Contract' AS groupType,
        ISNULL(H.LoaiHopDong, N'Chưa có HĐ') AS label,
        COUNT(1) AS value
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_HopDongTbl H ON P.PersonID = H.PersonID
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND H.MaHopDong = (SELECT TOP 1 MaHopDong FROM dbo.HR_HopDongTbl WHERE PersonID = P.PersonID ORDER BY NgayKyHopDong DESC)
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    GROUP BY H.LoaiHopDong;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_Department', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_Department
GO

CREATE PROCEDURE API_HR_Dashboard_Department
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM (
        SELECT 
            'Dept' AS groupType,
            ISNULL(D.TenPhongBan, N'Chưa rõ') AS label,
            COUNT(P.PersonID) AS value
        FROM dbo.HR_DepartmentListTbl D
        LEFT JOIN dbo.HR_PersonTbl P ON P.PhongBan = D.PhongBan AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
        WHERE (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID OR P.PersonID IS NULL)
        GROUP BY D.TenPhongBan
    ) AS T1

    UNION ALL

    SELECT * FROM (
        SELECT 
            'Branch' AS groupType,
            ISNULL(B.BranchName, N'Chưa rõ') AS label,
            COUNT(P.PersonID) AS value
        FROM dbo.CF_BranchTbl B
        LEFT JOIN dbo.HR_PersonTbl P ON P.BranchID = B.BranchID AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
        GROUP BY B.BranchName
    ) AS T2

    ORDER BY groupType, value DESC;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_Birthdays', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_Birthdays
GO

CREATE PROCEDURE API_HR_Dashboard_Birthdays
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 15
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'') + ')' AS empName,
        CONVERT(VARCHAR(5), P.NgaySinh, 103) AS birthdayDate,
        DAY(P.NgaySinh) AS birthDay
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_DepartmentListTbl D ON P.PhongBan = D.PhongBan
    WHERE MONTH(P.NgaySinh) = MONTH(GETDATE()) 
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    ORDER BY DAY(P.NgaySinh) ASC;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_Payroll', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_Payroll
GO

CREATE PROCEDURE API_HR_Dashboard_Payroll
    @PeriodID VARCHAR(20) = NULL,
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PeriodID IS NULL OR @PeriodID = '' 
        SET @PeriodID = FORMAT(GETDATE(), 'yyyyMM');

    -- ResultSet 1: Số liệu tổng quỹ lương
    SELECT 
        ISNULL(SUM(PR.TongLuong), 0) AS totalSalary,
        ISNULL(SUM(PR.TongLuong) * 0.9, 0) AS prevTotalSalary, 
        ISNULL(SUM(PR.TienBuTru), 0) AS bonus, 
        ISNULL(SUM(PR.TongLuong) * 0.88, 0) AS prevBonus, 
        ISNULL(SUM(PR.MucDong), 0) AS insurance, 
        ISNULL(SUM(PR.MucDong) * 0.9, 0) AS prevInsurance
    FROM dbo.HR_PayrollTbl PR
    INNER JOIN dbo.HR_PersonTbl P ON PR.PersonID = P.PersonID
    WHERE PR.PeriodID = @PeriodID
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID);

    -- ResultSet 2: Phân bổ quỹ lương theo phòng ban
    SELECT TOP 5
        ISNULL(D.TenPhongBan, ISNULL(P.PhongBan, N'Khác')) AS label,
        SUM(PR.TongLuong) AS value
    FROM dbo.HR_PayrollTbl PR
    INNER JOIN dbo.HR_PersonTbl P ON PR.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl D ON P.PhongBan = D.PhongBan
    WHERE PR.PeriodID = @PeriodID
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    GROUP BY D.TenPhongBan, P.PhongBan
    ORDER BY value DESC;
END
GO

---------------------------------------------------------------------------------
IF OBJECT_ID('API_HR_Dashboard_ContractsExpiring', 'P') IS NOT NULL
    DROP PROCEDURE API_HR_Dashboard_ContractsExpiring
GO

CREATE PROCEDURE API_HR_Dashboard_ContractsExpiring
    @Days INT = 30,
    @BranchID VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 10
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'Chưa rõ') + ')' AS empName,
        CONVERT(VARCHAR(10), H.NgayHetHieuLuc, 103) AS expireDate,
        P.PersonID AS empCode,
        CASE 
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 7 THEN 'danger'
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 15 THEN 'warning'
            ELSE 'info'
        END AS statusLevel
    FROM dbo.HR_HopDongTbl H
    INNER JOIN dbo.HR_PersonTbl P ON H.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl D ON P.PhongBan = D.PhongBan
    WHERE H.NgayHetHieuLuc BETWEEN GETDATE() AND DATEADD(DAY, @Days, GETDATE())
      AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
    ORDER BY H.NgayHetHieuLuc ASC;
END
GO
