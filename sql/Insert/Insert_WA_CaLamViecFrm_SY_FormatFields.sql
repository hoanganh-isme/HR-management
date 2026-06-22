USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_CaLamViecFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_CaLamViecFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_CaLamViecFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_CaLamViecFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_CaLamViecFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_CaLamViecFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_CaLamViecFrm', N'EDIT', N'Sắp ca làm việc', N'Shift Scheduling', N'HR_SapCaTbl', N'SapCaID', N'Sắp ca làm việc');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
-- Master Table
(NEWID(), N'WA_CaLamViecFrm', N'T0', N'TN', N'HR_SapCaTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T0', N'PK', N'SapCaID', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'DPR', N'', N'SC', N'', GETDATE(), N''),

-- Detail Table 1: Nhân viên (HR_SapCaNhanVienTbl)
(NEWID(), N'WA_CaLamViecFrm', N'T1', N'TN', N'HR_SapCaNhanVienTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T1', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T1', N'DCP', N'Nhân viên', N'', GETDATE(), N''),

-- Detail Table 2: Bảng ca chi tiết (HR_SapCaChiTietTbl)
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'TN', N'HR_SapCaChiTietTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'DCP', N'Bảng ca chi tiết', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'FKA1', N'PersonID', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'FKB1', N'PersonID', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'TN1', N'HR_PersonTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'T2', N'SE1', N'A.PersonName, A.PhongBan, A.BranchID', N'', GETDATE(), N''),

-- Custom Command Button: Sắp ca tự động
(NEWID(), N'WA_CaLamViecFrm', N'LYS1', N'CommandButtonCtl', N'Sắp ca tự động', N'BT', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'LYS1', N'CommandButtonCtl', N'HR_CaLamViec_SapCaStp ''{0}''', N'C4', GETDATE(), N''),
(NEWID(), N'WA_CaLamViecFrm', N'LYS1', N'CommandButtonCtl', N'SapCaID', N'P1', GETDATE(), N'');
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- API View
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_CaLamViecFrm', 'View', 'API_CaLamViec', '@Keyword=N''{Keyword}''');

-- API Execute cho nút bấm "Sắp ca tự động"
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_CaLamViecFrm', 'HR_CaLamViec_SapCaStp', 'HR_CaLamViec_SapCaStp', '@SapCaID=N''{SapCaID}''');

-- API Dropdowns cho Shift lists
DELETE FROM dbo.WA_API WHERE list = 'API_HR_DropdownShifts' AND func = 'View';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_HR_DropdownShifts', 'View', 'API_HR_DropdownShifts', '');

-- API Tab chi tiết: Nhân viên
DELETE FROM dbo.WA_API WHERE list = 'API_CaLamViec_NhanVien';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_CaLamViec_NhanVien', 'View', 'API_CaLamViec_NhanVien', '@SapCaID=N''{SapCaID}''');

-- API Tab chi tiết: Bảng ca chi tiết
DELETE FROM dbo.WA_API WHERE list = 'API_CaLamViec_ChiTiet';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_CaLamViec_ChiTiet', 'View', 'API_CaLamViec_ChiTiet', '@SapCaID=N''{SapCaID}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_HR_CaLamViec)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_CaLamViecFrm',
    @ObjectName = 'API_CaLamViec';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
-- Đặt các trường hiển thị và bắt buộc
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'SapCaID' THEN N'Mã sắp ca'
        WHEN 'TenBangCa' THEN N'Tên bảng ca'
        WHEN 'TuNgay' THEN N'Từ ngày'
        WHEN 'DenNgay' THEN N'Đến ngày'
        WHEN 'Thu2' THEN N'Thứ 2'
        WHEN 'Thu3' THEN N'Thứ 3'
        WHEN 'Thu4' THEN N'Thứ 4'
        WHEN 'Thu5' THEN N'Thứ 5'
        WHEN 'Thu6' THEN N'Thứ 6'
        WHEN 'Thu7' THEN N'Thứ 7'
        WHEN 'ChuNhat' THEN N'Chủ nhật'
        WHEN 'ShiftIDThu2' THEN N'Ca T2'
        WHEN 'ShiftIDThu3' THEN N'Ca T3'
        WHEN 'ShiftIDThu4' THEN N'Ca T4'
        WHEN 'ShiftIDThu5' THEN N'Ca T5'
        WHEN 'ShiftIDThu6' THEN N'Ca T6'
        WHEN 'ShiftIDThu7' THEN N'Ca T7'
        WHEN 'ShiftIDChuNhat' THEN N'Ca CN'
    END,
    CaptionEN = CASE FieldName
        WHEN 'SapCaID' THEN 'Schedule ID'
        WHEN 'TenBangCa' THEN 'Schedule Name'
        WHEN 'TuNgay' THEN 'From Date'
        WHEN 'DenNgay' THEN 'To Date'
        WHEN 'Thu2' THEN 'Monday'
        WHEN 'Thu3' THEN 'Tuesday'
        WHEN 'Thu4' THEN 'Wednesday'
        WHEN 'Thu5' THEN 'Thursday'
        WHEN 'Thu6' THEN 'Friday'
        WHEN 'Thu7' THEN 'Saturday'
        WHEN 'ChuNhat' THEN 'Sunday'
        WHEN 'ShiftIDThu2' THEN 'Shift Mon'
        WHEN 'ShiftIDThu3' THEN 'Shift Tue'
        WHEN 'ShiftIDThu4' THEN 'Shift Wed'
        WHEN 'ShiftIDThu5' THEN 'Shift Thu'
        WHEN 'ShiftIDThu6' THEN 'Shift Fri'
        WHEN 'ShiftIDThu7' THEN 'Shift Sat'
        WHEN 'ShiftIDChuNhat' THEN 'Shift Sun'
    END,
    FormatID = CASE 
        WHEN FieldName = 'SapCaID' THEN 't'
        WHEN FieldName = 'TenBangCa' THEN 't'
        WHEN FieldName IN ('TuNgay', 'DenNgay') THEN 'd'
        WHEN FieldName IN ('Thu2', 'Thu3', 'Thu4', 'Thu5', 'Thu6', 'Thu7', 'ChuNhat') THEN 'sw'
        WHEN FieldName IN ('ShiftIDThu2', 'ShiftIDThu3', 'ShiftIDThu4', 'ShiftIDThu5', 'ShiftIDThu6', 'ShiftIDThu7', 'ShiftIDChuNhat') THEN 'sl'
    END,
    DataSource = CASE 
        WHEN FieldName IN ('ShiftIDThu2', 'ShiftIDThu3', 'ShiftIDThu4', 'ShiftIDThu5', 'ShiftIDThu6', 'ShiftIDThu7', 'ShiftIDChuNhat') THEN 'API_HR_DropdownShifts'
        ELSE NULL
    END,
    FormPosition = 'grid',  -- Tất cả cột đều hiện trên lưới (giống Desktop)
    ShowInAdd = CASE WHEN FieldName = 'SapCaID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'SapCaID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd = CASE WHEN FieldName = 'SapCaID' THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName = 'SapCaID' THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('TenBangCa', 'TuNgay', 'DenNgay') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('TenBangCa', 'TuNgay', 'DenNgay') THEN 1 ELSE 0 END
WHERE FormName = 'WA_CaLamViecFrm';
GO

-- =========================================================================
-- 7. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Từ ngày
(NEWID(), N'WA_CaLamViecFrm', N'001', N'TuNgay', N'Từ ngày', 4, NULL, NULL, NULL, 0, 4, NULL),
-- Bộ lọc Đến ngày
(NEWID(), N'WA_CaLamViecFrm', N'002', N'DenNgay', N'Đến ngày', 4, NULL, NULL, NULL, 0, 4, NULL);
GO

-- =========================================================================
-- 8. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2044',
    '20',
    N'Sắp ca làm việc',
    'Shift Scheduling',
    'WA_CaLamViecFrm',
    '',
    '#/2044',
    'schedule',
    0
);
GO

PRINT 'Da thiet lap WA_CaLamViecFrm (Sap ca lam viec) voi MenuID 2044 thanh cong!';
GO
