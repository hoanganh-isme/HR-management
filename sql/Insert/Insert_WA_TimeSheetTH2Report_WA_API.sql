USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ BÁO CÁO MỚI VÀO BẢNG DANH SÁCH FORM (SY_FrmLstTbl)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetTH2Report';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetTH2Report',
    'EDIT',
    N'Bảng chấm công tổng hợp mẫu 2',
    'Timesheet Summary Report Model 2',
    'HR_TimeSheetTbl', -- Tên bảng vật lý chứa dữ liệu (mặc định lấy từ HR_TimeSheetTbl)
    'UserAutoID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ ĐỊNH TUYẾN GATEWAY (WA_API) CHO WA_TimeSheetTH2Report
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetTH2Report' AND func = 'View';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetTH2Report',
    'View',
    'API_TruyVanDong',
    '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
);
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CỘT GIAO DIỆN TỪ OBJECT GỐC
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_TimeSheetTH2Report',
    @ObjectName = 'HR_TimeSheetTbl';
GO

PRINT 'Da dang ky Form, TableName, API va Dong bo cot giao dien cho WA_TimeSheetTH2Report thanh cong!';
GO
