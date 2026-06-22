USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_PayrollFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_PayrollFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_PayrollFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_PayrollFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_PayrollFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_PayrollFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_PayrollFrm', N'LIST', N'Bảng tính lương tháng', N'Monthly Payroll', N'HR_PayrollTbl', N'DocumentID', N'每月工资表');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_PayrollFrm', 'View', 'API_Payroll', '@PeriodID=N''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}''');
GO

-- Đăng ký API phụ cho Detail tab
DELETE FROM dbo.WA_API WHERE list = 'API_Payroll_Detail';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_Payroll_Detail', 'View', 'API_Payroll_Detail', '@DocumentID=N''{DocumentID}''');
GO

-- Đăng ký API cho xử lý tạo bảng lương tháng
DELETE FROM dbo.WA_API WHERE list = 'HR_PayRoll_Process_Stp';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('HR_PayRoll_Process_Stp', 'View', 'HR_PayRoll_Process_Stp', '@PeriodID=N''{PeriodID}''');
GO

-- Đăng ký API danh sách bộ phận phục vụ bộ lọc
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_DanhSachBoPhan' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('API_DanhSachBoPhan', 'View', 'API_DanhSachBoPhan', '@Keyword=N''{Keyword}''');
END
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_Payroll)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_PayrollFrm',
    @ObjectName = 'API_Payroll';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'DocumentID' THEN N'Số chứng từ'
        WHEN 'DocumentDate' THEN N'Ngày lập'
        WHEN 'PeriodID' THEN N'Kỳ lương'
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ Tên'
        WHEN 'LuongCoBan' THEN N'Lương cơ bản'
        WHEN 'LuongTong' THEN N'Lương Tổng'
        WHEN 'TienBuTru' THEN N'Tiền bù trừ'
        WHEN 'SoNguoiPhuThuoc' THEN N'Số người phụ thuộc'
        WHEN 'MucDong' THEN N'Mức đóng'
        WHEN 'TongLuong' THEN N'Tổng Lương'
        WHEN 'IsBH' THEN N'Đóng BH'
        WHEN 'IsHuuTri' THEN N'Hưu trí'
        WHEN 'PhongBan' THEN N'Bộ phận'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'DocumentID' THEN 'Document ID'
        WHEN 'DocumentDate' THEN 'Document Date'
        WHEN 'PeriodID' THEN 'Period'
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Full Name'
        WHEN 'LuongCoBan' THEN 'Basic Salary'
        WHEN 'LuongTong' THEN 'Gross Salary'
        WHEN 'TienBuTru' THEN 'Adjustments'
        WHEN 'SoNguoiPhuThuoc' THEN 'Dependents'
        WHEN 'MucDong' THEN 'Insurance Base'
        WHEN 'TongLuong' THEN 'Net Salary'
        WHEN 'IsBH' THEN 'Insurance'
        WHEN 'IsHuuTri' THEN 'Retirement'
        WHEN 'PhongBan' THEN 'Department'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('LuongCoBan', 'LuongTong', 'TienBuTru', 'MucDong', 'TongLuong') THEN 'n' -- Định dạng số
        WHEN FieldName IN ('IsBH', 'IsHuuTri') THEN 'c' -- Checkbox
        WHEN FieldName = 'DocumentDate' THEN 'd' -- Date
        WHEN FieldName IN ('PeriodID', 'PhongBan') THEN 'sl' -- Dropdown select list
        ELSE 't'
    END,
    FormPosition = CASE 
        WHEN FieldName IN ('PersonID', 'PersonName', 'TongLuong', 'LuongTong', 'TienBuTru', 'SoNguoiPhuThuoc', 'MucDong', 'LuongCoBan', 'IsBH', 'IsHuuTri') THEN 'grid'
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('DocumentID', 'PeriodID', 'PersonID', 'PersonName', 'LuongCoBan', 'LuongTong', 'TienBuTru', 'SoNguoiPhuThuoc', 'MucDong', 'TongLuong', 'IsBH', 'IsHuuTri') THEN 1 ELSE 0 END,
    ShowInEdit = CASE WHEN FieldName IN ('DocumentID', 'PeriodID', 'PersonID', 'PersonName', 'LuongCoBan', 'LuongTong', 'TienBuTru', 'SoNguoiPhuThuoc', 'MucDong', 'TongLuong', 'IsBH', 'IsHuuTri') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PeriodID', 'PersonID') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('PeriodID', 'PhongBan') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period'
        WHEN FieldName = 'PhongBan' THEN 'API_DanhSachBoPhan'
        ELSE NULL
    END,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'TongLuong' THEN 3
        WHEN 'LuongTong' THEN 4
        WHEN 'TienBuTru' THEN 5
        WHEN 'SoNguoiPhuThuoc' THEN 6
        WHEN 'MucDong' THEN 7
        WHEN 'LuongCoBan' THEN 8
        WHEN 'IsBH' THEN 9
        WHEN 'IsHuuTri' THEN 10
        WHEN 'DocumentID' THEN 11
        WHEN 'PeriodID' THEN 12
        WHEN 'PhongBan' THEN 13
        WHEN 'DocumentDate' THEN 14
        ELSE 99
    END
WHERE FormName = 'WA_PayrollFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu) — MenuID 2405, Parent 24
-- =========================================================================
DELETE FROM dbo.WA_Menu WHERE MenuID = '2405';

INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2405',
    '24', -- Parent 24 cho Tính lương
    N'Bảng tính lương tháng',
    'Monthly Payroll',
    'WA_PayrollFrm',
    'WA_PAYROLLFRM',
    '#/2405',
    'calculate',
    0
);
GO

-- Đồng bộ phân quyền truy cập
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da thiet lạp WA_PayrollFrm thanh cong!';
GO
