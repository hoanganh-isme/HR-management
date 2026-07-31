/*
  Dashboard procedures backend gọi trực tiếp
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Birthdays; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Birthdays
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (15)
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'') + ')' AS empName,
        CONVERT(varchar(5), P.NgaySinh, 103) AS birthdayDate,
        DAY(P.NgaySinh) AS birthDay
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE MONTH(P.NgaySinh) = MONTH(GETDATE())
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    ORDER BY DAY(P.NgaySinh), P.PersonName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_ContractsExpiring; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_ContractsExpiring
    @Days int = 30,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (10)
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'Chưa rõ') + ')' AS empName,
        CONVERT(varchar(10), H.NgayHetHieuLuc, 103) AS expireDate,
        P.PersonID AS empCode,
        CASE
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 7 THEN 'danger'
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 15 THEN 'warning'
            ELSE 'info'
        END AS statusLevel
    FROM dbo.HR_HopDongTbl AS H
    INNER JOIN dbo.HR_PersonTbl AS P
        ON H.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE H.NgayHetHieuLuc BETWEEN GETDATE() AND DATEADD(DAY, @Days, GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    ORDER BY H.NgayHetHieuLuc;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Demographics; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Demographics
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        'Gender' AS groupType,
        CASE
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY
        CASE
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END

    UNION ALL

    SELECT
        'Age' AS groupType,
        CASE
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND P.NgaySinh IS NOT NULL
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY
        CASE
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END

    UNION ALL

    SELECT
        'Contract' AS groupType,
        ISNULL(H.LoaiHopDong, N'Chưa có HĐ') AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_HopDongTbl AS H
        ON H.MaHopDong =
        (
            SELECT TOP (1) Latest.MaHopDong
            FROM dbo.HR_HopDongTbl AS Latest
            WHERE Latest.PersonID = P.PersonID
            ORDER BY Latest.NgayKyHopDong DESC
        )
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY H.LoaiHopDong;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Department; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Department
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        'Dept' AS groupType,
        ISNULL(D.TenPhongBan, ISNULL(P.PhongBan, N'Chưa rõ')) AS label,
        COUNT_BIG(P.PersonID) AS [value]
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON D.PhongBan = P.PhongBan
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY D.TenPhongBan, P.PhongBan

    UNION ALL

    SELECT
        'Branch' AS groupType,
        ISNULL(B.BranchName, B.BranchID) AS label,
        COUNT_BIG(P.PersonID) AS [value]
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
        ON Allowed.BranchID = B.BranchID
    LEFT JOIN dbo.HR_PersonTbl AS P
        ON P.BranchID = B.BranchID
       AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
    GROUP BY B.BranchName, B.BranchID
    ORDER BY groupType, [value] DESC;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_GetBranches; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_GetBranches
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        B.BranchID AS [value],
        ISNULL(B.BranchName, B.BranchID) AS label
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
        ON Allowed.BranchID = B.BranchID
    ORDER BY B.BranchName, B.BranchID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_OverviewToday; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_OverviewToday
    @Date date = NULL,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Date IS NULL SET @Date = GETDATE();

    DECLARE
        @TotalHeadcount int = 0,
        @Present int = 0,
        @Late int = 0,
        @Absent int = 0,
        @NewHires int = 0,
        @ProbationExpiring int = 0;

    SELECT @TotalHeadcount = COUNT_BIG(1)
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT
        @Present = COUNT_BIG(1),
        @Late = ISNULL(SUM(CASE WHEN T.GioVao > '08:00' THEN 1 ELSE 0 END), 0)
    FROM dbo.HR_TimeSheetDayTbl AS T
    INNER JOIN dbo.HR_PersonTbl AS P
        ON T.PersonID = P.PersonID
    WHERE T.Ngay = @Date
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SET @Present = ISNULL(@Present, 0);
    SET @Absent = @TotalHeadcount - @Present;
    IF @Absent < 0 SET @Absent = 0;

    SELECT @NewHires = COUNT_BIG(1)
    FROM dbo.HR_PersonTbl AS P
    WHERE MONTH(P.NgayVaoLam) = MONTH(@Date)
      AND YEAR(P.NgayVaoLam) = YEAR(@Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT @ProbationExpiring = COUNT_BIG(1)
    FROM dbo.HR_HopDongTbl AS H
    INNER JOIN dbo.HR_PersonTbl AS P
        ON H.PersonID = P.PersonID
    WHERE H.NgayHetHieuLuc BETWEEN @Date AND DATEADD(DAY, 7, @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT
        @TotalHeadcount AS totalHeadcount,
        @Present AS present,
        @Late AS late,
        @Absent AS absent,
        @NewHires AS newHires,
        @ProbationExpiring AS probationExpiring;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Payroll; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Payroll
    @PeriodID varchar(20) = NULL,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PeriodID IS NULL OR @PeriodID = ''
        SET @PeriodID = FORMAT(GETDATE(), 'yyyyMM');

    DECLARE @PreviousPeriodID varchar(20) = NULL;

    SELECT TOP (1)
        @PreviousPeriodID = PreviousPeriod.PeriodID
    FROM dbo.SY_Period AS CurrentPeriod
    INNER JOIN dbo.SY_Period AS PreviousPeriod
        ON PreviousPeriod.FromDate < CurrentPeriod.FromDate
    WHERE CurrentPeriod.PeriodID = @PeriodID
    ORDER BY PreviousPeriod.FromDate DESC;

    IF @PreviousPeriodID IS NULL
    BEGIN
        SELECT TOP (1)
            @PreviousPeriodID = PR.PeriodID
        FROM dbo.HR_PayrollTbl AS PR
        WHERE PR.PeriodID < @PeriodID
        ORDER BY PR.PeriodID DESC;
    END;

    SELECT
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.TongLuong ELSE 0 END), 0) AS totalSalary,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.TongLuong ELSE 0 END), 0) AS prevTotalSalary,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.TienBuTru ELSE 0 END), 0) AS bonus,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.TienBuTru ELSE 0 END), 0) AS prevBonus,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.MucDong ELSE 0 END), 0) AS insurance,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.MucDong ELSE 0 END), 0) AS prevInsurance,
        COUNT(DISTINCT CASE WHEN PR.PeriodID = @PeriodID THEN PR.PersonID END) AS employeeCount
    FROM dbo.HR_PayrollTbl AS PR
    INNER JOIN dbo.HR_PersonTbl AS P
        ON PR.PersonID = P.PersonID
    WHERE PR.PeriodID IN (@PeriodID, @PreviousPeriodID)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT TOP (5)
        ISNULL(D.TenPhongBan, ISNULL(P.PhongBan, N'Khác')) AS label,
        SUM(PR.TongLuong) AS [value]
    FROM dbo.HR_PayrollTbl AS PR
    INNER JOIN dbo.HR_PersonTbl AS P
        ON PR.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE PR.PeriodID = @PeriodID
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY D.TenPhongBan, P.PhongBan
    ORDER BY [value] DESC;
END;
GO
