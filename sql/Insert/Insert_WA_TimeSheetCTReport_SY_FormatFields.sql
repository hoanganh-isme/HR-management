USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ NẾU CÓ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetCTReport');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetCTReport');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetCTReport');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetCTReport');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetCTReport';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetCTReport';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetCTReport';
DELETE FROM dbo.WA_Menu WHERE MenuID IN ('2012', '2203');
GO

-- =========================================================================
-- 2. ĐĂNG KÝ BÁO CÁO MỚI (SY_FrmLstTbl) - THEO BƯỚC 2 CỦA QUY TRÌNH
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetCTReport',
    'EDIT',
    N'Báo cáo chấm công chi tiết',
    'Detailed Timesheet Report',
    'HR_TimeSheetDayTbl',
    '_UserAutoID'
);
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetCTReport', N'T0', N'TN', N'HR_TimeSheetDayTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetCTReport', N'T0', N'PK', N'_UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (HR_TimeSheetCTReportStp) - BƯỚC 3 CỦA QUY TRÌNH
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_TimeSheetCTReport',
    @ObjectName = 'API_BaoCaoChamCongChiTiet';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields SET CaptionVN = N'UserAutoID', CaptionEN = 'UserAutoID', OrderNo = 1 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'UserAutoID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Kỳ', CaptionEN = 'Period', OrderNo = 2 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'PeriodID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã nhân viên', CaptionEN = 'Employee ID', OrderNo = 3 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'PersonID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Họ Tên', CaptionEN = 'Employee Name', OrderNo = 4 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'PersonName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Bộ phận', CaptionEN = 'Department', OrderNo = 5 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'PhongBan';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Chi nhánh', CaptionEN = 'Branch', OrderNo = 6 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'BranchID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày', CaptionEN = 'Date', OrderNo = 7 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'Ngay';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Chức danh', CaptionEN = 'Position', OrderNo = 8 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'ChucDanh';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ vào', CaptionEN = 'Time In', OrderNo = 9 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'GioVao';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ ra', CaptionEN = 'Time Out', OrderNo = 10 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'GioRa';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số giờ', CaptionEN = 'Hours Worked', OrderNo = 11 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'SoGio';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số công', CaptionEN = 'Workday Units', OrderNo = 12 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'SoCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số phút', CaptionEN = 'Minutes', OrderNo = 13 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'SoPhut';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Trễ (phút)', CaptionEN = 'Late (min)', OrderNo = 14 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'Tre';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Lý do', CaptionEN = 'Reason', OrderNo = 15 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'LyDo';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Notes', OrderNo = 16 WHERE FormName = 'WA_TimeSheetCTReport' AND FieldName = 'GhiChu';
GO

-- Kích hoạt bộ lọc nhanh cho các cột trên Giao diện Web
UPDATE dbo.SY_FormatFields 
SET ShowInFilter = 1,
    FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 'sl' 
        WHEN FieldName = 'BranchID' THEN 'sl' 
        ELSE FormatID 
    END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period' 
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm' 
        ELSE DataSource 
    END
WHERE FormName = 'WA_TimeSheetCTReport' 
  AND FieldName IN ('PeriodID', 'PersonID', 'BranchID', 'Ngay');
GO

-- =========================================================================
-- 6. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Chọn mẫu (Template) - Dropdown danh sách tĩnh
(
    NEWID(), N'WA_TimeSheetCTReport', N'0', N'Template', N'Chọn mẫu', 3, 
    N'SELECT ''HR_TimeSheetCTReport'' AS Template, N''Báo cáo chấm công chi tiết'' AS TemplateName UNION ALL SELECT ''HR_TimeSheetCT2Report'', N''Báo cáo chấm Thanh đa'' UNION ALL SELECT ''HR_TimeSheetCT3Report'', N''Báo cáo chấm Nam Vinh'' UNION ALL SELECT ''HR_TimeSheetCT4Report'', N''Báo cáo chấm Hoàng Hải''', 
    N'Template', N'TemplateName', 1, 4, NULL
),

-- Bộ lọc Kỳ lương (PeriodID) - Dropdown lấy động từ hệ thống
(
    NEWID(), N'WA_TimeSheetCTReport', N'001', N'PeriodID', N'Kỳ', 3, 
    N'Select Distinct PeriodID from SY_Period order by PeriodID desc', 
    N'PeriodID', N'PeriodID', 1, 4, NULL
),

-- Bộ lọc Chi nhánh (BranchID) - Dropdown lấy động từ CF_BranchTbl
(
    NEWID(), N'WA_TimeSheetCTReport', N'002', N'BranchID', N'Chi nhánh', 3, 
    N'Select BranchID, BranchName from CF_BranchTbl order by BranchID', 
    N'BranchID', N'BranchName', 1, 4, NULL
),

-- Bộ lọc Ngày (Ngay) - Date picker
(
    NEWID(), N'WA_TimeSheetCTReport', N'003', N'Ngay', N'Ngày', 5, 
    NULL, NULL, NULL, 0, 4, NULL
);
GO

-- =========================================================================
-- 7. THIẾT LẬP ĐỊNH TUYẾN GATEWAY (WA_API) - THEO BƯỚC 4 CỦA QUY TRÌNH
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetCTReport',
    'View',
    'API_BaoCaoChamCongChiTiet',
    '@Template=''{Template}'', @Ngay=''{Ngay}'', @PeriodID=''{PeriodID}'', @BranchID=''{BranchID}'', @Keyword=N''{Keyword}'''
);
GO
-- =========================================================================
-- 8. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2203',
    '22',
    N'Báo cáo chấm công chi tiết',
    'Detailed Timesheet Report',
    'WA_TimeSheetCTReport',
    '',
    '#/2203',
    'article',
    0
);
GO

PRINT 'Da thiet lap WA_TimeSheetCTReport (Bao cao cham cong chi tiet) voi MenuID 2203 thanh cong!';
GO
