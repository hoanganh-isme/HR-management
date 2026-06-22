[ignoring loop detection]
USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_QuanLyNghiLeFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_QuanLyNghiLeFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_QuanLyNghiLeFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_QuanLyNghiLeFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_QuanLyNghiLeFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_QuanLyNghiLeFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_QuanLyNghiLeFrm', N'EDIT', N'Quản lý nghỉ lễ', N'Holiday Management', N'HR_HolidayTbl', N'HolidayID', N'Quản lý nghỉ lễ');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(NEWID(), N'WA_QuanLyNghiLeFrm', N'T0', N'TN', N'HR_HolidayTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiLeFrm', N'T0', N'PK', N'HolidayID', N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiLeFrm', N'DPR', N'', N'NL', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_QuanLyNghiLeFrm', 'View', 'API_QuanLyNghiLe', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_QuanLyNghiLe)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_QuanLyNghiLeFrm',
    @ObjectName = 'API_QuanLyNghiLe';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'HolidayID' THEN N'Mã nghỉ lễ'
        WHEN 'HolidayDate' THEN N'Ngày nghỉ lễ'
        WHEN 'HolidayName' THEN N'Tên lễ'
        WHEN 'SoCong' THEN N'Số công'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'HolidayID' THEN 'Holiday ID'
        WHEN 'HolidayDate' THEN 'Holiday Date'
        WHEN 'HolidayName' THEN 'Holiday Name'
        WHEN 'SoCong' THEN 'Workday Coefficient'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName = 'HolidayDate' THEN 'd'
        WHEN FieldName = 'SoCong' THEN 'n'
        ELSE 't'
    END,
    FormPosition = CASE WHEN FieldName = 'UserAutoID' THEN 'none' ELSE 'grid' END,
    ShowInAdd = CASE WHEN FieldName = 'UserAutoID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserAutoID', 'HolidayID') THEN 0 ELSE 1 END,
    IsReadOnlyAdd = 0,
    IsReadOnlyEdit = CASE WHEN FieldName = 'HolidayID' THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('HolidayID', 'HolidayDate', 'HolidayName') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('HolidayID', 'HolidayName') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'HolidayID' THEN 1
        WHEN 'HolidayDate' THEN 2
        WHEN 'HolidayName' THEN 3
        WHEN 'SoCong' THEN 4
        ELSE 99
    END
WHERE FormName = 'WA_QuanLyNghiLeFrm';
GO

-- =========================================================================
-- 7. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2028',
    '202',
    N'Quản lý nghỉ lễ',
    'Holiday Management',
    'WA_QuanLyNghiLeFrm',
    '',
    '#/2028',
    'calendar_today',
    0
);
GO

PRINT 'Da thiet lap WA_QuanLyNghiLeFrm (Quan ly nghi le) voi MenuID 2107 thanh cong!';
GO
