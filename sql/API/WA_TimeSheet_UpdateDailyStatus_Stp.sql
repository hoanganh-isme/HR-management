USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [HR_TimeSheet_UpdateDailyStatus_Stp] - Định tuyến Gateway API cho Stored Procedure Xử lý chấm công
-- =========================================================================

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'HR_TimeSheet_UpdateDailyStatus_Stp' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'HR_TimeSheet_UpdateDailyStatus_Stp', 
        'View', 
        'HR_TimeSheet_UpdateDailyStatus_Stp', 
        '@Period=N''{Period}'''
    );
END
ELSE
BEGIN
    UPDATE dbo.WA_API 
    SET [SQL] = 'HR_TimeSheet_UpdateDailyStatus_Stp', 
        Para = '@Period=N''{Period}''' 
    WHERE list = 'HR_TimeSheet_UpdateDailyStatus_Stp' AND func = 'View';
END
GO
