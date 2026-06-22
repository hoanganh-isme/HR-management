USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. CẬP NHẬT ĐỊNH TUYẾN GATEWAY (WA_API) CHO WA_TimeSheetDayFrm
-- =========================================================================
IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'WA_TimeSheetDayFrm' AND func = 'View')
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_XuLyChamCongHangNgay',
        Para = '@Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
    WHERE list = 'WA_TimeSheetDayFrm' AND func = 'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'WA_TimeSheetDayFrm',
        'View',
        'API_XuLyChamCongHangNgay',
        '@Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
    );
END
GO

-- =========================================================================
-- 2. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE MỚI
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_TimeSheetDayFrm',
    @ObjectName = 'API_XuLyChamCongHangNgay';
GO

-- =========================================================================
-- 3. THIẾT LẬP NHÃN TIẾNG VIỆT/TIẾNG ANH & THỨ TỰ CỘT (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields SET CaptionVN = N'UserAutoID', CaptionEN = 'UserAutoID', OrderNo = 1, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'UserAutoID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã nhân viên', CaptionEN = 'Employee ID', OrderNo = 2, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'PersonID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Họ Tên', CaptionEN = 'Employee Name', OrderNo = 3, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'PersonName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Bộ phận', CaptionEN = 'Department', OrderNo = 4, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'PhongBan';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Chi nhánh', CaptionEN = 'Branch', OrderNo = 5, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'BranchID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Kỳ', CaptionEN = 'Period', OrderNo = 6, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'PeriodID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày', CaptionEN = 'Date', OrderNo = 7, ShowInFilter = 1 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'Ngay';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Thời gian vào', CaptionEN = 'Check In Time', OrderNo = 8, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'ThoiGianVao';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Thời gian ra', CaptionEN = 'Check Out Time', OrderNo = 9, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'ThoiGianRa';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ vào', CaptionEN = 'Time In', OrderNo = 10, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'GioVao';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ ra', CaptionEN = 'Time Out', OrderNo = 11, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'GioRa';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số giờ', CaptionEN = 'Hours', OrderNo = 12, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'SoGio';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số phút', CaptionEN = 'Minutes', OrderNo = 13, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'SoPhut';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số công', CaptionEN = 'Workday Units', OrderNo = 14, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'SoCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Notes', OrderNo = 15, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Lý do', CaptionEN = 'Reason', OrderNo = 16, ShowInFilter = 0 WHERE FormName = 'WA_TimeSheetDayFrm' AND FieldName = 'LyDo';
GO

-- =========================================================================
-- 4. KÍCH HOẠT BỘ LỌC ĐỘNG (DROPDOWN) CHO CÁC TRƯỜNG LỌC TRÊN WEB
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 'sl' 
        WHEN FieldName = 'BranchID' THEN 'sl' 
        WHEN FieldName = 'PhongBan' THEN 'sl'
        WHEN FieldName = 'Ngay' THEN 'dt'
        ELSE FormatID 
    END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period' 
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm' 
        WHEN FieldName = 'PhongBan' THEN 'Select Distinct PhongBan from HR_PersonTbl where ISNULL(PhongBan,'''') <> '''''
        ELSE DataSource 
    END
WHERE FormName = 'WA_TimeSheetDayFrm' 
  AND FieldName IN ('PeriodID', 'BranchID', 'PhongBan', 'Ngay');
GO

PRINT 'Da thiet lap cau hinh va vietnamese captions cho WA_TimeSheetDayFrm thanh cong!';
GO
