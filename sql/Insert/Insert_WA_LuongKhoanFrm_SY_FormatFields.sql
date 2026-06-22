USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_LuongKhoanFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_LuongKhoanFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_LuongKhoanFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_LuongKhoanFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_LuongKhoanFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_LuongKhoanFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_LuongKhoanFrm', N'LIST', N'Lương khoán', N'Contractor Salary', N'HR_LuongKhoanTbl', N'UserAutoID', N'Lương khoán');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_LuongKhoanFrm', 'View', 'API_LuongKhoan', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_LuongKhoan)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_LuongKhoanFrm',
    @ObjectName = 'API_LuongKhoan';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên nhân viên'
        WHEN 'TuNgay' THEN N'Từ ngày'
        WHEN 'DenNgay' THEN N'Đến ngày'
        WHEN 'SoTienKhoan' THEN N'Số tiền khoán'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Employee Name'
        WHEN 'TuNgay' THEN 'From Date'
        WHEN 'DenNgay' THEN 'To Date'
        WHEN 'SoTienKhoan' THEN 'Fixed Salary'
        WHEN 'GhiChu' THEN 'Notes'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName = 'PersonID' THEN 'sl' -- Combobox chọn nhân viên
        WHEN FieldName IN ('TuNgay', 'DenNgay') THEN 'd' -- Ngày
        WHEN FieldName = 'SoTienKhoan' THEN 'n' -- Số
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl'
        ELSE NULL
    END,
    FormPosition = CASE 
        WHEN FieldName IN ('PersonID', 'PersonName', 'TuNgay', 'DenNgay', 'SoTienKhoan') THEN 'grid'
        WHEN FieldName = 'GhiChu' THEN '12'
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName = 'UserAutoID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'UserAutoID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd = CASE WHEN FieldName = 'PersonName' THEN 1 ELSE 0 END, -- Tên nhân viên tự động nhảy theo Mã nên để read-only
    IsReadOnlyEdit = CASE WHEN FieldName = 'PersonName' THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PersonID', 'TuNgay', 'DenNgay', 'SoTienKhoan') THEN 1 ELSE 0 END,
    ShowInFilter = 0,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'TuNgay' THEN 3
        WHEN 'DenNgay' THEN 4
        WHEN 'SoTienKhoan' THEN 5
        WHEN 'GhiChu' THEN 6
        ELSE 99
    END
WHERE FormName = 'WA_LuongKhoanFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu) — MenuID 240103, Parent 24
-- =========================================================================
DELETE FROM dbo.WA_Menu WHERE MenuID = '240103';

INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '240103',
    '24', -- Chèn cùng nhóm 24 với Bảng mức thuế TNCN và Bảng tham số
    N'Lương khoán',
    'Contractor Salary',
    'WA_LuongKhoanFrm',
    '',
    '#/240103',
    'payments',
    0
);
GO

PRINT 'Da thiet lap WA_LuongKhoanFrm (Luong khoan) voi MenuID 240103 thanh cong!';
GO
