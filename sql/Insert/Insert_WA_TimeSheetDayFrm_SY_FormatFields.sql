USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDayEditFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetDayFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetDayFrm';
DELETE FROM dbo.WA_API WHERE list IN ('WA_TimeSheetDayFrm', 'WA_TimeSheetDay_Process_Stp', 'WA_DanhSachLoaiHD');
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_TimeSheetDayFrm' OR MenuID IN ('2106');
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_TimeSheetDayFrm', N'EDIT', N'Xử lý chấm công hàng ngày', N'Daily Timesheet Processing', N'HR_TimeSheetDayTbl', N'UserAutoID', N'每日报时');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- API danh sách chấm công hàng ngày
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetDayFrm', 'View', 'API_XuLyChamCongHangNgay', '@Keyword=N''{Keyword}'', @Data=N''{Data}''');

-- API chạy xử lý chấm công hàng ngày
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetDay_Process_Stp', 'View', 'WA_TimeSheetDay_Process_Stp', '@PeriodID=N''{PeriodID}'', @BranchID=N''{BranchID}''');

-- API danh sách loại hợp đồng phục vụ bộ lọc
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_DanhSachLoaiHD', 'View', 'API_DanhSachLoaiHD', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_XuLyChamCongHangNgay)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_TimeSheetDayFrm',
    @ObjectName = 'API_XuLyChamCongHangNgay';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ Tên'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'LoaiHD' THEN N'Loại HD'
        WHEN 'PeriodID' THEN N'Kỳ'
        WHEN 'Ngay' THEN N'Ngày'
        WHEN 'ThoiGianVao' THEN N'Thời gian vào'
        WHEN 'ThoiGianRa' THEN N'Thời gian ra'
        WHEN 'GioVao' THEN N'Giờ vào'
        WHEN 'GioRa' THEN N'Giờ ra'
        WHEN 'SoGio' THEN N'Số giờ'
        WHEN 'SoPhut' THEN N'Số phút'
        WHEN 'SoCong' THEN N'Số công'
        WHEN 'GhiChu' THEN N'Ghi chú'
        WHEN 'LyDo' THEN N'Lý do'
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Employee Name'
        WHEN 'PhongBan' THEN 'Department'
        WHEN 'BranchID' THEN 'Branch'
        WHEN 'PeriodID' THEN 'Period'
        WHEN 'Ngay' THEN 'Date'
        WHEN 'ThoiGianVao' THEN 'Time In'
        WHEN 'ThoiGianRa' THEN 'Time Out'
        WHEN 'GioVao' THEN 'Hour In'
        WHEN 'GioRa' THEN 'Hour Out'
        WHEN 'SoGio' THEN 'Hours'
        WHEN 'SoPhut' THEN 'Minutes'
        WHEN 'SoCong' THEN 'Workday Units'
        WHEN 'GhiChu' THEN 'Notes'
        WHEN 'LyDo' THEN 'Reason'
    END,
    FormatID = CASE 
        WHEN FieldName IN ('ThoiGianVao', 'ThoiGianRa') THEN 'dt'
        WHEN FieldName = 'Ngay' THEN 'd'
        WHEN FieldName IN ('SoGio', 'SoPhut', 'SoCong') THEN 'n'
        ELSE 't'
    END,
    FormPosition = 'grid',
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'PeriodID' THEN 3
        WHEN 'Ngay' THEN 4
        WHEN 'ThoiGianVao' THEN 5
        WHEN 'ThoiGianRa' THEN 6
        WHEN 'GioVao' THEN 7
        WHEN 'GioRa' THEN 8
        WHEN 'SoGio' THEN 9
        WHEN 'SoPhut' THEN 10
        WHEN 'SoCong' THEN 11
        WHEN 'GhiChu' THEN 12
        WHEN 'LyDo' THEN 13
        WHEN 'PhongBan' THEN 14
        WHEN 'BranchID' THEN 15
        ELSE 99
    END,
    ShowInAdd = 0,
    ShowInEdit = 0,
    IsReadOnlyAdd = 1,
    IsReadOnlyEdit = 1
WHERE FormName = 'WA_TimeSheetDayFrm';
GO

-- Kích hoạt bộ lọc nhanh cho các cột trên Giao diện Web (chỉ để Chọn tháng và Chi nhánh như desktop app)
UPDATE dbo.SY_FormatFields 
SET ShowInFilter = CASE WHEN FieldName IN ('PeriodID', 'BranchID', 'LoaiHD') THEN 1 ELSE 0 END,
    FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 'sl' 
        WHEN FieldName = 'BranchID' THEN 'sl' 
        WHEN FieldName = 'LoaiHD' THEN 'sl' 
        ELSE FormatID 
    END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period' 
        WHEN FieldName = 'BranchID' THEN 'API_DanhSachChiNhanh' 
        WHEN FieldName = 'LoaiHD' THEN 'WA_DanhSachLoaiHD' 
        ELSE DataSource 
    END
WHERE FormName = 'WA_TimeSheetDayFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2106',
    '21',
    N'Xử lý chấm công hàng ngày',
    'Daily Timesheet Processing',
    'WA_TimeSheetDayFrm',
    '',
    '#/2101',
    'today',
    0
);
GO

PRINT 'Da thiet la' + 'p WA_TimeSheetDayFrm (Cham cong hang ngay) thanh cong!';
GO
