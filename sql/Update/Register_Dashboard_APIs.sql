-- ==============================================================================
-- SCRIPT ĐĂNG KÝ ROUTER CHO DASHBOARD VÀO BẢNG [WA_API]
-- Chạy script này để API_Gateway_Router có thể gọi được các Stored Procedure mới
-- ==============================================================================

-- 1. Đăng ký API Tổng quan hôm nay
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_OverviewToday' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_OverviewToday', 'View', 'API_HR_Dashboard_OverviewToday', '@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_OverviewToday' AND [func] = 'View'
GO

-- 2. Đăng ký API Cơ cấu nhân sự
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Demographics' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Demographics', 'View', 'API_HR_Dashboard_Demographics', '@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_Demographics' AND [func] = 'View'
GO

-- 3. Đăng ký API Quỹ lương & Phúc lợi
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Payroll' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Payroll', 'View', 'API_HR_Dashboard_Payroll', '@PeriodID=''{PeriodID}'',@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@PeriodID=''{PeriodID}'',@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_Payroll' AND [func] = 'View'
GO

-- 4. Đăng ký API Hợp đồng sắp hết hạn
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_ContractsExpiring' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_ContractsExpiring', 'View', 'API_HR_Dashboard_ContractsExpiring', '@Days={Days},@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@Days={Days},@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_ContractsExpiring' AND [func] = 'View'
GO

-- 5. Đăng ký API Phân bổ theo Phòng Ban
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Department' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Department', 'View', 'API_HR_Dashboard_Department', '@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_Department' AND [func] = 'View'
GO

-- 6. Đăng ký API Sinh nhật trong tháng
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_Birthdays' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_Birthdays', 'View', 'API_HR_Dashboard_Birthdays', '@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_Birthdays' AND [func] = 'View'
GO

-- 7. Đăng ký API Lấy danh sách Chi nhánh (Filter)
IF NOT EXISTS (SELECT 1 FROM [dbo].[WA_API] WHERE [list] = 'API_HR_Dashboard_GetBranches' AND [func] = 'View')
BEGIN
    INSERT INTO [dbo].[WA_API] ([list], [func], [SQL], [Para])
    VALUES ('API_HR_Dashboard_GetBranches', 'View', 'API_HR_Dashboard_GetBranches', '@BranchID=''{BranchID}''')
END
ELSE UPDATE [dbo].[WA_API] SET [Para] = '@BranchID=''{BranchID}''' WHERE [list] = 'API_HR_Dashboard_GetBranches' AND [func] = 'View'
GO
