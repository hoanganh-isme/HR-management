-- ==============================================================================
-- SCRIPT ĐĂNG KÝ ROUTER CHO DASHBOARD VÀO BẢNG [WA_API]
-- Chạy script này để API_Gateway_Router có thể gọi được các Stored Procedure mới
-- ==============================================================================

-- 1. Đăng ký API Tổng quan hôm nay
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_OverviewToday' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_OverviewToday', 'View', 'API_HR_Dashboard_OverviewToday', '')
END
GO

-- 2. Đăng ký API Cơ cấu nhân sự
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Demographics' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Demographics', 'View', 'API_HR_Dashboard_Demographics', '')
END
GO

-- 3. Đăng ký API Quỹ lương & Phúc lợi
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Payroll' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Payroll', 'View', 'API_HR_Dashboard_Payroll', '@PeriodID=''{PeriodID}''')
END
GO

-- 4. Đăng ký API Hợp đồng sắp hết hạn
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_ContractsExpiring' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_ContractsExpiring', 'View', 'API_HR_Dashboard_ContractsExpiring', '@Days={Days}')
END
GO

-- 5. Đăng ký API Phân bổ theo Phòng Ban
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Department' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Department', 'View', 'API_HR_Dashboard_Department', '')
END
GO

-- 6. Đăng ký API Sinh nhật trong tháng
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Birthdays' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Birthdays', 'View', 'API_HR_Dashboard_Birthdays', '')
END
GO

-- 7. Đăng ký API Lấy danh sách Chi nhánh (Filter)
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_GetBranches' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_GetBranches', 'View', 'API_HR_Dashboard_GetBranches', '')
END
GO
