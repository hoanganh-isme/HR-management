
-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_BangPhuCapFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_BangPhuCapFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangPhuCapFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BangPhuCapFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_BangPhuCapFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_BangPhuCapFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_BangPhuCapFrm', N'LIST', N'Bảng phụ cấp hàng tháng', N'Monthly Allowance', N'HR_BangPhuCapTbl', N'MaPhuCap', N'每月津贴表');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_BangPhuCapFrm', 'View', 'API_BangPhuCap', '@Keyword=N''{Keyword}''');
GO

-- Đăng ký API phụ cho Detail tab
DELETE FROM dbo.WA_API WHERE list = 'API_BangPhuCap_Detail';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_BangPhuCap_Detail', 'View', 'API_BangPhuCap_Detail', '@MaPhuCap=N''{MaPhuCap}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_BangPhuCap)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangPhuCapFrm',
    @ObjectName = 'API_BangPhuCap';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'MaPhuCap' THEN N'Loại phụ cấp'
        WHEN 'TenPhuCap' THEN N'Mô tả'
        WHEN 'NhomPhuCap' THEN N'Nhóm phụ cấp'
        WHEN 'TienPhuCapNgay' THEN N'Tiền phụ cấp ngày'
        WHEN 'TienPhuCapThang' THEN N'Tiền phụ cấp tháng'
        WHEN 'DVT' THEN N'Unit'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'MaPhuCap' THEN 'Allowance Type'
        WHEN 'TenPhuCap' THEN 'Description'
        WHEN 'NhomPhuCap' THEN 'Allowance Group'
        WHEN 'TienPhuCapNgay' THEN 'Daily Allowance'
        WHEN 'TienPhuCapThang' THEN 'Monthly Allowance'
        WHEN 'DVT' THEN 'Unit'
        WHEN 'GhiChu' THEN 'Notes'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('TienPhuCapNgay', 'TienPhuCapThang') THEN 'n' -- Định dạng số
        ELSE 't'
    END,
    FormPosition = CASE 
        WHEN FieldName IN ('MaPhuCap', 'TenPhuCap', 'NhomPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'DVT') THEN 'grid'
        WHEN FieldName = 'GhiChu' THEN '12'
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate') THEN 0 ELSE 1 END,
    IsRequired = CASE WHEN FieldName IN ('MaPhuCap') THEN 1 ELSE 0 END,
    ShowInFilter = 0, -- Dùng ô search chung
    OrderNo = CASE FieldName
        WHEN 'MaPhuCap' THEN 1
        WHEN 'TenPhuCap' THEN 2
        WHEN 'NhomPhuCap' THEN 3
        WHEN 'TienPhuCapNgay' THEN 4
        WHEN 'TienPhuCapThang' THEN 5
        WHEN 'DVT' THEN 6
        WHEN 'GhiChu' THEN 7
        ELSE 99
    END
WHERE FormName = 'WA_BangPhuCapFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu) — MenuID 4020, Parent 20
-- =========================================================================
DELETE FROM dbo.WA_Menu WHERE MenuID = '2402';

INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2402',
    '24', -- Parent 20 cho Nhân sự / Tiền lương
    N'Bảng phụ cấp hàng tháng',
    'Monthly Allowance',
    'WA_BangPhuCapFrm',
    '',
    '#/2402',
    'featured_play_list',
    0
);
GO

PRINT 'Da thiet lap WA_BangPhuCapFrm thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_BangThamSoFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_BangThamSoFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThamSoFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BangThamSoFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThamSoFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_BangThamSoFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_BangThamSoFrm', N'LIST', N'Bảng tham số tính lương', N'Payroll Insurance Parameters', N'HR_BangThamSoTbl', N'UserAutoID', N'表参数工资');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_BangThamSoFrm', 'View', 'API_BangThamSo', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_BangThamSo)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangThamSoFrm',
    @ObjectName = 'API_BangThamSo';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'PeriodID' THEN N'Kỳ'
        WHEN 'LoaiBaoHiem' THEN N'Loại bảo hiểm'
        WHEN 'BHXHNLD' THEN N'BHXH NLĐ (%)'
        WHEN 'BHXHCTY' THEN N'BHXH Cty (%)'
        WHEN 'BHYTNLD' THEN N'BHYT NLĐ (%)'
        WHEN 'BHYTCTY' THEN N'BHYT Cty (%)'
        WHEN 'BHTNNLD' THEN N'BHTN NLĐ (%)'
        WHEN 'BHTNCTY' THEN N'BHTN Cty (%)'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PeriodID' THEN 'Period'
        WHEN 'LoaiBaoHiem' THEN 'Insurance Type'
        WHEN 'BHXHNLD' THEN 'SI EE (%)'
        WHEN 'BHXHCTY' THEN 'SI ER (%)'
        WHEN 'BHYTNLD' THEN 'HI EE (%)'
        WHEN 'BHYTCTY' THEN 'HI ER (%)'
        WHEN 'BHTNNLD' THEN 'UI EE (%)'
        WHEN 'BHTNCTY' THEN 'UI ER (%)'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 't'
        WHEN FieldName = 'LoaiBaoHiem' THEN 'sl'
        ELSE 'n'
    END,
    DataSource = CASE
        WHEN FieldName = 'PeriodID' THEN 'SY_Period'
        WHEN FieldName = 'LoaiBaoHiem' THEN 'STATIC:NVN|Trong nước,NNN|Nước ngoài'
        ELSE NULL
    END,
    FormPosition = CASE 
        WHEN FieldName IN ('PeriodID', 'LoaiBaoHiem', 'BHXHNLD', 'BHXHCTY', 'BHYTNLD', 'BHYTCTY', 'BHTNNLD', 'BHTNCTY') THEN 'grid'
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName = 'UserAutoID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'UserAutoID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd = 0,
    IsReadOnlyEdit = 0,
    IsRequired = CASE WHEN FieldName IN ('PeriodID', 'LoaiBaoHiem') THEN 1 ELSE 0 END,
    ShowInFilter = 0,
    OrderNo = CASE FieldName
        WHEN 'PeriodID' THEN 1
        WHEN 'LoaiBaoHiem' THEN 2
        WHEN 'BHXHNLD' THEN 3
        WHEN 'BHXHCTY' THEN 4
        WHEN 'BHYTNLD' THEN 5
        WHEN 'BHYTCTY' THEN 6
        WHEN 'BHTNNLD' THEN 7
        WHEN 'BHTNCTY' THEN 8
        ELSE 99
    END
WHERE FormName = 'WA_BangThamSoFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu) — MenuID 240102, Parent 24
-- =========================================================================
DELETE FROM dbo.WA_Menu WHERE MenuID = '240102';

INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '240102',
    '24', -- Chèn cùng nhóm 24 với Bảng mức thuế TNCN
    N'Bảng tham số tính lương',
    'Payroll Insurance Parameters',
    'WA_BangThamSoFrm',
    '',
    '#/240102',
    'tune',
    0
);
GO

PRINT 'Da thiet lap WA_BangThamSoFrm (Bang tham so tinh luong) voi MenuID 240102 thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_BangThueTNCNFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_BangThueTNCNFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThueTNCNFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BangThueTNCNFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThueTNCNFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_BangThueTNCNFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_BangThueTNCNFrm', N'LIST', N'Bảng mức thuế TNCN', N'PIT Tax Bracket', N'HR_BangThueTNCNTbl', N'Bac', N'资费表');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_BangThueTNCNFrm', 'View', 'API_BangThueTNCN', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_BangThueTNCN)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangThueTNCNFrm',
    @ObjectName = 'API_BangThueTNCN';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'Bac' THEN N'Bậc'
        WHEN 'Tu' THEN N'Từ'
        WHEN 'Den' THEN N'Đến'
        WHEN 'ThueSuat' THEN N'Thuế suất (%)'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'Bac' THEN 'Level'
        WHEN 'Tu' THEN 'From (M)'
        WHEN 'Den' THEN 'To (M)'
        WHEN 'ThueSuat' THEN 'Tax Rate (%)'
        ELSE FieldName
    END,
    FormatID = 'n', -- Tất cả là số
    FormPosition = 'grid', -- Hiện trên bảng chính và form
    ShowInAdd = 1,
    ShowInEdit = CASE WHEN FieldName = 'Bac' THEN 0 ELSE 1 END, -- Bậc làm khoá chính nên không cho sửa ở edit
    IsReadOnlyAdd = 0,
    IsReadOnlyEdit = 0,
    IsRequired = 1,
    ShowInFilter = 0,
    OrderNo = CASE FieldName
        WHEN 'Bac' THEN 1
        WHEN 'Tu' THEN 2
        WHEN 'Den' THEN 3
        WHEN 'ThueSuat' THEN 4
        ELSE 99
    END
WHERE FormName = 'WA_BangThueTNCNFrm';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu) — MenuID 400504, Parent 20 (hoặc cha lương nếu có)
-- =========================================================================
-- Đảm bảo xóa nếu trùng trước khi chèn
DELETE FROM dbo.WA_Menu WHERE MenuID = '400504';

INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '240101',
    '24', -- Chèn vào mục Quản lý nhân sự/tiền lương
    N'Bảng mức thuế TNCN',
    'PIT Tax Bracket',
    'WA_BangThueTNCNFrm',
    '',
    '#/240101',
    'receipt_long',
    0
);
GO

PRINT 'Da thiet lap WA_BangThueTNCNFrm (Bang muc thue TNCN) voi MenuID 400504 thanh cong!';
GO


-- 1. Xóa cấu hình cũ của Form WA_BaoCaoLuongReport nếu có để tránh trùng lặp
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoLuongReport';
GO

-- 2. Chèn cấu hình cột cho Báo cáo Lương (WA_BaoCaoLuongReport)
INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
('WA_BaoCaoLuongReport', 'DocumentID', N'ID Chứng từ', 'Document ID', 't', 0, 'grid', 0, 1, 1, 1, 1, 0),
('WA_BaoCaoLuongReport', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 0, 1, 1, 1, 2, 0),
('WA_BaoCaoLuongReport', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 0, 1, 1, 1, 3, 0),
('WA_BaoCaoLuongReport', 'ChucVu', N'Chức Vụ', 'Position', 't', 0, 'grid', 0, 1, 1, 1, 4, 0),
('WA_BaoCaoLuongReport', 'NgayCongThucTe', N'Ngày công thực tế', 'Actual Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 5, 0),
('WA_BaoCaoLuongReport', 'NgayCongLe', N'Ngày công lễ', 'Holiday Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 6, 0),
('WA_BaoCaoLuongReport', 'NgayCongTangCa', N'Ngày công tăng ca', 'Overtime Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 7, 0),
('WA_BaoCaoLuongReport', 'NghiPhep', N'Nghỉ phép', 'Paid Leave', 'n', 0, 'grid', 0, 1, 1, 1, 8, 0),
('WA_BaoCaoLuongReport', 'TongNgayCong', N'Tổng ngày công thực tế', 'Total Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 9, 0),
('WA_BaoCaoLuongReport', 'LuongTong', N'Lương tổng', 'Total Gross Salary', 'n', 0, 'grid', 0, 1, 1, 1, 10, 0),
('WA_BaoCaoLuongReport', 'MucLuongDongBHXH', N'Mức lương đóng BHXH', 'SI Base Salary', 'n', 0, 'grid', 0, 1, 1, 1, 11, 0),
('WA_BaoCaoLuongReport', 'LuongCoBanCoCau', N'Lương cơ bản cơ cấu', 'Base Salary Struct', 'n', 0, 'grid', 0, 1, 1, 1, 12, 0),
('WA_BaoCaoLuongReport', 'HoTroAnCaCoCau', N'Hỗ trợ ăn ca cơ cấu', 'Meal Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 13, 0),
('WA_BaoCaoLuongReport', 'HoTroDongPhucCoCau', N'Hỗ trợ đồng phục cơ cấu', 'Uniform Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 14, 0),
('WA_BaoCaoLuongReport', 'HoTroXangXeCoCau', N'Hỗ trợ xăng xe cơ cấu', 'Travel Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 15, 0),
('WA_BaoCaoLuongReport', 'HoTroDienThoaiCoCau', N'Hỗ trợ điện thoại cơ cấu', 'Phone Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 16, 0),
('WA_BaoCaoLuongReport', 'ThuongHieuSuatCoCau', N'Thưởng hiệu suất cơ cấu', 'Performance Bonus Struct', 'n', 0, 'grid', 0, 1, 1, 1, 17, 0),
('WA_BaoCaoLuongReport', 'LuongCoBan', N'Lương cơ bản', 'Base Salary', 'n', 0, 'grid', 0, 1, 1, 1, 18, 0),
('WA_BaoCaoLuongReport', 'HoTroAnCa', N'Hỗ trợ ăn ca', 'Meal Allowance', 'n', 0, 'grid', 0, 1, 1, 1, 19, 0),
('WA_BaoCaoLuongReport', 'HoTroXangXe', N'Hỗ trợ xăng xe', 'Travel Allowance', 'n', 0, 'grid', 0, 1, 1, 1, 20, 0),
('WA_BaoCaoLuongReport', 'ThuongHieuSuat', N'Thưởng hiệu suất', 'Performance Bonus', 'n', 0, 'grid', 0, 1, 1, 1, 21, 0),
('WA_BaoCaoLuongReport', 'TienBuTru', N'Tính bù lương', 'Salary Adjustments', 'n', 0, 'grid', 0, 1, 1, 1, 22, 0),
('WA_BaoCaoLuongReport', 'TongLuong', N'Tổng thu nhập thực tế', 'Actual Income', 'n', 0, 'grid', 0, 1, 1, 1, 23, 0),
('WA_BaoCaoLuongReport', 'SoNguoiPhuThuoc', N'Người phụ thuộc', 'Dependents', 'n', 0, 'grid', 0, 1, 1, 1, 24, 0),
('WA_BaoCaoLuongReport', 'ThuNhapChiuThue', N'Thu nhập chịu thuế', 'Taxable Income', 'n', 0, 'grid', 0, 1, 1, 1, 25, 0),
('WA_BaoCaoLuongReport', 'ThuNhapTinhThue', N'Thu nhập tính thuế', 'Assessed Income', 'n', 0, 'grid', 0, 1, 1, 1, 26, 0),
('WA_BaoCaoLuongReport', 'BaoHiem', N'BHXH, BHYT, BHTN', 'Social Insurance Deductions', 'n', 0, 'grid', 0, 1, 1, 1, 27, 0),
('WA_BaoCaoLuongReport', 'ThueTNCN', N'Thuế TNCN', 'PIT', 'n', 0, 'grid', 0, 1, 1, 1, 28, 0),
('WA_BaoCaoLuongReport', 'TongGiamTru', N'Tổng các khoản giảm trừ', 'Total Deductions', 'n', 0, 'grid', 0, 1, 1, 1, 29, 0),
('WA_BaoCaoLuongReport', 'TamUng', N'Tạm ứng', 'Advance Payment', 'n', 0, 'grid', 0, 1, 1, 1, 30, 0),
('WA_BaoCaoLuongReport', 'ThucLinh', N'Thực lĩnh', 'Net Take-Home', 'n', 0, 'grid', 0, 1, 1, 1, 31, 0),
('WA_BaoCaoLuongReport', 'PeriodID', N'Kỳ', 'Period', 'sl', 0, 'none', 0, 0, 0, 0, 32, 1),
('WA_BaoCaoLuongReport', 'BranchID1', N'Chi nhánh', 'Branch', 'sl', 0, 'none', 0, 0, 0, 0, 33, 1),
('WA_BaoCaoLuongReport', 'PhongBan', N'Chọn bộ phận', 'Department', 'sl', 0, 'none', 0, 0, 0, 0, 34, 1);
GO

-- Cập nhật DataSource cho Kỳ, Chi nhánh, Bộ phận để load dropdown
UPDATE dbo.SY_FormatFields
SET DataSource = 'SY_Period'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields
SET DataSource = 'CF_BranchListFrm'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'BranchID1';

UPDATE dbo.SY_FormatFields
SET DataSource = 'HR_DepartmentListTbl'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'PhongBan';
GO

-- 3. ĐĂNG KÝ ĐỊNH TUYẾN GATEWAY (WA_API) CHO BÁO CÁO LƯƠNG
DELETE FROM dbo.WA_API WHERE list = 'WA_BaoCaoLuongReport';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES
('WA_BaoCaoLuongReport', 'View', 'API_BaoCaoLuong', '@PeriodID=''{PeriodID}'', @BranchID1=''{BranchID1}'', @Keyword=''{Keyword}'', @PhongBan=N''{PhongBan}''');
GO

PRINT 'Da insert tat ca cac cot va WA_API cho WA_BaoCaoLuongReport thanh cong!';
GO


-- 1. Xóa cấu hình cũ của Form WA_BaoCaoNghiPhepReport nếu có để tránh trùng lặp
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoNghiPhepReport';
GO

-- 2. Chèn cấu hình cột cho Báo cáo Nghỉ Phép (WA_BaoCaoNghiPhepReport)
INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
('WA_BaoCaoNghiPhepReport', 'TT', N'Số thứ tự', 'No.', 'n', 0, 'grid', 0, 1, 1, 1, 1, 0),
('WA_BaoCaoNghiPhepReport', 'HoVaTen', N'Họ và Tên', 'Full Name', 't', 0, 'grid', 0, 1, 1, 1, 2, 0),
('WA_BaoCaoNghiPhepReport', 'ChucDanh', N'Chức danh', 'Job Title', 't', 0, 'grid', 0, 1, 1, 1, 3, 0),
('WA_BaoCaoNghiPhepReport', 'M1', N'Tháng 1', 'Jan', 'n', 0, 'grid', 0, 1, 1, 1, 4, 0),
('WA_BaoCaoNghiPhepReport', 'M2', N'Tháng 2', 'Feb', 'n', 0, 'grid', 0, 1, 1, 1, 5, 0),
('WA_BaoCaoNghiPhepReport', 'M3', N'Tháng 3', 'Mar', 'n', 0, 'grid', 0, 1, 1, 1, 6, 0),
('WA_BaoCaoNghiPhepReport', 'M4', N'Tháng 4', 'Apr', 'n', 0, 'grid', 0, 1, 1, 1, 7, 0),
('WA_BaoCaoNghiPhepReport', 'M5', N'Tháng 5', 'May', 'n', 0, 'grid', 0, 1, 1, 1, 8, 0),
('WA_BaoCaoNghiPhepReport', 'M6', N'Tháng 6', 'Jun', 'n', 0, 'grid', 0, 1, 1, 1, 9, 0),
('WA_BaoCaoNghiPhepReport', 'M7', N'Tháng 7', 'Jul', 'n', 0, 'grid', 0, 1, 1, 1, 10, 0),
('WA_BaoCaoNghiPhepReport', 'M8', N'Tháng 8', 'Aug', 'n', 0, 'grid', 0, 1, 1, 1, 11, 0),
('WA_BaoCaoNghiPhepReport', 'M9', N'Tháng 9', 'Sep', 'n', 0, 'grid', 0, 1, 1, 1, 12, 0),
('WA_BaoCaoNghiPhepReport', 'M10', N'Tháng 10', 'Oct', 'n', 0, 'grid', 0, 1, 1, 1, 13, 0),
('WA_BaoCaoNghiPhepReport', 'M11', N'Tháng 11', 'Nov', 'n', 0, 'grid', 0, 1, 1, 1, 14, 0),
('WA_BaoCaoNghiPhepReport', 'M12', N'Tháng 12', 'Dec', 'n', 0, 'grid', 0, 1, 1, 1, 15, 0),
('WA_BaoCaoNghiPhepReport', 'PhepTonNamTruoc', N'Phép tồn năm trước', 'Leave Carried Forward', 'n', 0, 'grid', 0, 1, 1, 1, 16, 0),
('WA_BaoCaoNghiPhepReport', 'PhepThamNien', N'Phép thâm niên', 'Seniority Leave', 'n', 0, 'grid', 0, 1, 1, 1, 17, 0),
('WA_BaoCaoNghiPhepReport', 'PhepTetAmLichDiLam', N'Phép Tết đi làm', 'Holiday Work Leave', 'n', 0, 'grid', 0, 1, 1, 1, 18, 0),
('WA_BaoCaoNghiPhepReport', 'HieuHi', N'Nghỉ hiếu hỷ', 'Compassionate Leave', 'n', 0, 'grid', 0, 1, 1, 1, 19, 0),
('WA_BaoCaoNghiPhepReport', 'TongPhep', N'Tổng quỹ phép', 'Total Leave Pool', 'n', 0, 'grid', 0, 1, 1, 1, 20, 0),
('WA_BaoCaoNghiPhepReport', 'PhepDaSuDungDenThang', N'Phép đã sử dụng', 'Used Leave', 'n', 0, 'grid', 0, 1, 1, 1, 21, 0),
('WA_BaoCaoNghiPhepReport', 'PhepConLai', N'Phép còn lại', 'Remaining Leave', 'n', 0, 'grid', 0, 1, 1, 1, 22, 0),
('WA_BaoCaoNghiPhepReport', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 0, 1, 1, 1, 23, 0),
('WA_BaoCaoNghiPhepReport', 'PeriodID', N'Kỳ', 'Period', 'sl', 0, 'none', 0, 0, 0, 0, 24, 1),
('WA_BaoCaoNghiPhepReport', 'BranchID1', N'Chi nhánh', 'Branch', 'sl', 0, 'none', 0, 0, 0, 0, 25, 1);
GO

-- Cập nhật DataSource cho Kỳ và Chi nhánh để load dropdown
UPDATE dbo.SY_FormatFields
SET DataSource = 'SY_Period'
WHERE FormName = 'WA_BaoCaoNghiPhepReport' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields
SET DataSource = 'CF_BranchListFrm'
WHERE FormName = 'WA_BaoCaoNghiPhepReport' AND FieldName = 'BranchID1';
GO

-- 3. ĐĂNG KÝ ĐỊNH TUYẾN GATEWAY (WA_API) CHO BÁO CÁO NGHỈ PHÉP
DELETE FROM dbo.WA_API WHERE list = 'WA_BaoCaoNghiPhepReport';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES
('WA_BaoCaoNghiPhepReport', 'View', 'API_BaoCaoNghiPhepReportStp', '@PeriodID=''{PeriodID}'', @BranchID1=''{BranchID1}'', @Keyword=''{Keyword}''');
GO

PRINT 'Da insert tat ca cac cot va WA_API cho WA_BaoCaoNghiPhepReport thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_BaoCaoNhanSuReport
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID    IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID  = 'WA_BaoCaoNhanSuReport';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoNhanSuReport';
DELETE FROM dbo.WA_API          WHERE list     = 'WA_BaoCaoNhanSuReport';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
--    FormType = 'LIST'  →  Chỉ xem, không cho thêm/sửa/xóa trực tiếp
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES
    (N'WA_BaoCaoNhanSuReport', N'LIST', N'Báo cáo nhân sự',
     N'HR Personnel Report', N'HR_PersonTbl', N'PersonID', N'人事报告');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BaoCaoNhanSuReport';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BaoCaoNhanSuReport',
    'View',
    'API_BaoCaoNhanSuReportStp',
    '@BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @Keyword=N''{Keyword}'''
);
GO

PRINT 'Da dang ky WA_API [WA_BaoCaoNhanSuReport / View] thanh cong!';
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_BaoCaoNhanSuReportStp)
--    Lệnh này tự động quét metadata của SP và INSERT vào SY_FormatFields
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_BaoCaoNhanSuReport',
    @ObjectName = 'API_BaoCaoNhanSuReportStp';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
--    Chỉ bao gồm các cột thực tế được SELECT trong API_BaoCaoNhanSuReportStp
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET
    -- ── Nhãn tiếng Việt ────────────────────────────────────────────────
    CaptionVN = CASE FieldName
        -- Định danh
        WHEN 'PersonID'          THEN N'Mã nhân viên'
        WHEN 'NewPersonID'       THEN N'Mã NV cũ'
        WHEN 'PersonName'        THEN N'Họ Tên'
        WHEN 'PersonName2'       THEN N'Tên tiếng Anh'
        WHEN 'GioiTinh'          THEN N'Giới tính'
        WHEN 'NgaySinh'          THEN N'Ngày sinh'
        WHEN 'Tuoi'              THEN N'Tuổi'
        -- CCCD/CMND
        WHEN 'CMND'              THEN N'Số CCCD/CMND'
        WHEN 'CMNDNgayCap'       THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap'        THEN N'Nơi cấp CCCD'
        -- Liên hệ & địa chỉ
        WHEN 'DienThoai'         THEN N'Điện thoại'
        WHEN 'DiaChiThuongTru'   THEN N'Địa chỉ thường trú'
        WHEN 'DiaChiTamTru'      THEN N'Địa chỉ tạm trú'
        -- Tổ chức
        WHEN 'BranchID'          THEN N'Chi nhánh'
        WHEN 'PhongBan'          THEN N'Mã bộ phận'
        WHEN 'TitleName'         THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        -- Thời gian làm việc
        WHEN 'PersonStatus'      THEN N'Mã trạng thái'
        WHEN 'PersonStatusName'  THEN N'Trạng thái'
        WHEN 'isTaiTuyen'        THEN N'Tái tuyển'
        -- Hợp đồng
        WHEN 'SoHopDong'         THEN N'Số hợp đồng'
        WHEN 'LoaiHopDong'       THEN N'Loại hợp đồng'
        WHEN 'NgayHopDong'       THEN N'Ngày ký HĐ'
        WHEN 'LuongCoBanHD'      THEN N'Lương cơ bản HĐ'
        -- Ngân hàng
        WHEN 'BankName'          THEN N'Tên ngân hàng'
        WHEN 'BankAccountNo'     THEN N'Số tài khoản'
        WHEN 'BankHolder'        THEN N'Chủ tài khoản'
        WHEN 'BankLocation'      THEN N'Chi nhánh NH'
        -- Học vấn / nghề nghiệp / nhân khẩu
        WHEN 'EducationName'     THEN N'Học vấn'
        WHEN 'NationName'        THEN N'Quốc gia'
        WHEN 'Nationality'       THEN N'Quốc tịch'
        WHEN 'PeoplesName'       THEN N'Dân tộc'
        WHEN 'ReligionName'      THEN N'Tôn giáo'
        -- Chấm công
        WHEN 'ChamCong'          THEN N'Chấm công'
        WHEN 'UserID'            THEN N'Mã MCC'
        WHEN 'STT'               THEN N'STT hệ thống'
        -- Audit
        WHEN 'UserCreate'        THEN N'Người tạo'
        WHEN 'UserUpdate'        THEN N'Người sửa'
        WHEN 'DateCreate'        THEN N'Ngày tạo'
        WHEN 'DateUpdate'        THEN N'Ngày sửa'
        ELSE FieldName
    END,

    -- ── Nhãn tiếng Anh ────────────────────────────────────────────────
    CaptionEN = CASE FieldName
        WHEN 'PersonID'          THEN 'Employee ID'
        WHEN 'NewPersonID'       THEN 'Old Employee ID'
        WHEN 'PersonName'        THEN 'Full Name'
        WHEN 'PersonName2'       THEN 'English Name'
        WHEN 'GioiTinh'          THEN 'Gender'
        WHEN 'NgaySinh'          THEN 'Date of Birth'
        WHEN 'Tuoi'              THEN 'Age'
        WHEN 'CMND'              THEN 'ID Card No.'
        WHEN 'CMNDNgayCap'       THEN 'ID Issue Date'
        WHEN 'CMNDNoiCap'        THEN 'ID Issue Place'
        WHEN 'DienThoai'         THEN 'Phone'
        WHEN 'DiaChiThuongTru'   THEN 'Permanent Address'
        WHEN 'DiaChiTamTru'      THEN 'Temporary Address'
        WHEN 'BranchID'          THEN 'Branch'
        WHEN 'PhongBan'          THEN 'Dept. Code'
        WHEN 'TitleName'         THEN 'Title'
        WHEN 'ChucDanhChuyenMon' THEN 'Professional Title'
        WHEN 'PersonStatus'      THEN 'Status Code'
        WHEN 'PersonStatusName'  THEN 'Status'
        WHEN 'isTaiTuyen'        THEN 'Re-hired'
        WHEN 'SoHopDong'         THEN 'Contract No.'
        WHEN 'LoaiHopDong'       THEN 'Contract Type'
        WHEN 'NgayHopDong'       THEN 'Contract Date'
        WHEN 'LuongCoBanHD'      THEN 'Base Salary (Contract)'
        WHEN 'BankName'          THEN 'Bank Name'
        WHEN 'BankAccountNo'     THEN 'Bank Account No.'
        WHEN 'BankHolder'        THEN 'Account Holder'
        WHEN 'BankLocation'      THEN 'Bank Branch'
        WHEN 'EducationName'     THEN 'Education'
        WHEN 'NationName'        THEN 'Country'
        WHEN 'Nationality'       THEN 'Nationality'
        WHEN 'PeoplesName'       THEN 'Ethnicity'
        WHEN 'ReligionName'      THEN 'Religion'
        WHEN 'ChamCong'          THEN 'Timekeeping'
        WHEN 'UserID'            THEN 'User ID'
        WHEN 'STT'               THEN 'System No.'
        WHEN 'UserCreate'        THEN 'Created By'
        WHEN 'UserUpdate'        THEN 'Updated By'
        WHEN 'DateCreate'        THEN 'Created Date'
        WHEN 'DateUpdate'        THEN 'Updated Date'
        ELSE FieldName
    END,

    -- ── Định dạng hiển thị ────────────────────────────────────────────
    FormatID = CASE FieldName
        WHEN 'NgaySinh'       THEN 'dt'
        WHEN 'CMNDNgayCap'    THEN 'dt'
        WHEN 'NgayHopDong'    THEN 'dt'
        WHEN 'DateCreate'     THEN 'dt'
        WHEN 'DateUpdate'     THEN 'dt'
        WHEN 'LuongCoBanHD'   THEN 'n2'  -- Tiền: 2 chữ số thập phân
        WHEN 'Tuoi'           THEN 'n0'
        WHEN 'BranchID'       THEN 'sl'
        ELSE NULL
    END,

    -- ── Báo cáo chỉ đọc → hiện ở grid, không cho thêm/sửa ────────────
    FormPosition   = 'grid',
    ShowInAdd      = 0,
    ShowInEdit     = 0,
    IsReadOnlyAdd  = 1,
    IsReadOnlyEdit = 1,
    IsRequired     = 0,
    ShowInFilter   = CASE WHEN FieldName = 'BranchID' THEN 1 ELSE 0 END,
    DataSource     = CASE WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm' ELSE NULL END,

    -- ── Thứ tự cột hiển thị ───────────────────────────────────────────
    OrderNo = CASE FieldName
        -- Nhóm 1: Định danh cơ bản
        WHEN 'PersonID'          THEN 1
        WHEN 'PersonName'        THEN 2
        WHEN 'PhongBan'          THEN 3
        WHEN 'TitleName'         THEN 4
        WHEN 'BranchID'          THEN 6
        WHEN 'GioiTinh'          THEN 7
        WHEN 'NgaySinh'          THEN 8
        WHEN 'Tuoi'              THEN 9
        -- Nhóm 2: Liên hệ
        WHEN 'DienThoai'         THEN 10
        -- Nhóm 3: Thời gian làm việc
        WHEN 'PersonStatus'      THEN 12
        WHEN 'PersonStatusName'  THEN 13
        -- Nhóm 4: CCCD/CMND
        WHEN 'CMND'              THEN 15
        WHEN 'CMNDNgayCap'       THEN 16
        WHEN 'CMNDNoiCap'        THEN 17
        -- Nhóm 5: Địa chỉ
        WHEN 'DiaChiThuongTru'   THEN 18
        WHEN 'DiaChiTamTru'      THEN 19
        -- Nhóm 6: Hợp đồng
        WHEN 'SoHopDong'         THEN 21
        WHEN 'LoaiHopDong'       THEN 22
        WHEN 'NgayHopDong'       THEN 23
        WHEN 'LuongCoBanHD'      THEN 25
        -- Nhóm 7: Ngân hàng
        WHEN 'BankName'          THEN 26
        WHEN 'BankAccountNo'     THEN 27
        WHEN 'BankHolder'        THEN 28
        WHEN 'BankLocation'      THEN 29
        -- Nhóm 8: Học vấn / nhân khẩu
        WHEN 'EducationName'     THEN 30
        WHEN 'NationName'        THEN 32
        WHEN 'Nationality'       THEN 34
        WHEN 'PeoplesName'       THEN 35
        WHEN 'ReligionName'      THEN 36
        -- Nhóm 9: Tổ chức mở rộng
        WHEN 'ChucDanhChuyenMon' THEN 38
        -- Nhóm 10: Chấm công
        WHEN 'ChamCong'          THEN 43
        WHEN 'UserID'            THEN 45
        -- Nhóm 11: Liên hệ khẩn cấp
        WHEN 'isTaiTuyen'        THEN 51
        WHEN 'NewPersonID'       THEN 52
        WHEN 'PersonName2'       THEN 53
        WHEN 'STT'               THEN 54
        -- Audit (cuối cùng)
        WHEN 'UserCreate'        THEN 90
        WHEN 'UserUpdate'        THEN 91
        WHEN 'DateCreate'        THEN 92
        WHEN 'DateUpdate'        THEN 93
        ELSE 99
    END

WHERE FormName = 'WA_BaoCaoNhanSuReport';
GO

PRINT 'Da cap nhat SY_FormatFields cho WA_BaoCaoNhanSuReport thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA MODULE BẢO HIỂM
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail') 
    OR UserAutoID IN ('2605151335120250506765678', '2605151333483083261637386', '2605151331213073242096744', '2605221051073133364212249', '2603121542586526686875168', '2603121542586366525246585', '2605151341536616824066742', '2603121542586686834862302', '2605151340253573798143738', '2605151620182032296531464', '2605210910464674816414727', '2605151615223383547169332', '2606171405325105364451601', '2603121541474484793805443', '2603121541474794959849522', '2603121553134214341049328', '2605191014501321424390303', '2603121553134354524588463', '2605191014501421582715453', '2603121541552763082783666', '2605131542142592801449621', '2605191015073443567375608', '2603121541553083235686747', '2603121553134524683929664', '2605191013463333524497194', '2605131542473924125695167', '2605131540321081333682254', '2605131540347958185451586', '2605131540371962141228410', '2605131549531231442946667', '2605131540395155283139277', '2605131549595765875999234');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID IN ('2603121547508699001442177', '2605151346256396592323415', '2605221051164454657930559');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID = '2606171113062582698736665';
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID = '2605151458489119305475685';
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail') OR UserAutoID LIKE 'WA_BaoHiemFrm%' OR UserAutoID LIKE 'HR_BaoHiemFrm%';
DELETE FROM dbo.SY_StTbl WHERE StringID LIKE 'WA_BaoHiemFrm%' OR StringID LIKE 'API_BaoHiem_Detail%';
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.WA_API WHERE list IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail', 'WA_BaoHiemFrm_PersonID', 'WA_BaoHiemFrm_Calculate');
DELETE FROM dbo.WA_Menu WHERE MenuID = '2022' OR FormName = 'WA_BaoHiemFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ MENU (WA_Menu) & QUYỀN TRUY CẬP
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2022',
    '20', -- Parent 20 cho Quản lý Nhân sự
    N'Bảo hiểm',
    'Insurance',
    'WA_BaoHiemFrm',
    'WA_BAOHIEMFRM',
    '#/2022',
    'security', -- Icon Class cho Bảo hiểm
    0
);
GO

-- Cập nhật phân quyền tự động cho tất cả nhóm người dùng
INSERT INTO dbo.SY_UserGroupPermisstion (UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete, isManager, isAdmin) 
SELECT UserGroupID, MenuID, 1, 1, 1, 1, 0, 0  
FROM (
    SELECT UserGroupID, MenuID FROM dbo.SY_UserGroup, dbo.WA_Menu WHERE COALESCE(FormName, '') <> ''
) A 
LEFT JOIN (
    SELECT DISTINCT UserGroupID + MenuID AS Key01 FROM dbo.SY_UserGroupPermisstion  
) B ON A.UserGroupID + A.MenuID = B.Key01 
WHERE B.Key01 IS NULL;
GO

-- =========================================================================
-- 3. ĐĂNG KÝ BẢNG CẤU HÌNH FORM (SY_FrmLstTbl)
-- =========================================================================
-- Master Form: Chứng từ Bảo Hiểm
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BaoHiemFrm';
INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'WA_BaoHiemFrm', N'EDIT', N'Bảo Hiểm', N'Insurance', N'HR_BaoHiemTbl', N'DocumentID', N'保险');

-- Detail Grid: Chi tiết đóng bảo hiểm
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_BaoHiem_Detail';
INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'API_BaoHiem_Detail', N'EDIT', N'Chi tiết đóng bảo hiểm', N'Insurance Details', N'HR_BaoHiemChiTietTbl', N'UserAutoID', N'保险明细');
GO

-- =========================================================================
-- 4. KHAI BÁO ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- Routing cho Master Form (WA_BaoHiemFrm)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BaoHiemFrm', 'View', 'API_BaoHiem', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'''),
('WA_BaoHiemFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BaoHiemFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Form (API_BaoHiem_Detail)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_BaoHiem_Detail', 'View', 'API_BaoHiem_Detail', '@DocumentID=N''{DocumentID}'''),
('API_BaoHiem_Detail', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_BaoHiem_Detail', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Lookups và Calculations
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BaoHiemFrm_PersonID', 'View', 'API_BaoHiem_PersonLookup', '@BranchID=N''{BranchID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @Keyword=N''{Keyword}'''),
('WA_BaoHiemFrm_Calculate', 'View', 'TinhBHStp', '@PeriodID=N''{PeriodID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @MucDong={MucDong}');
GO

-- =========================================================================
-- 5. CẤU HÌNH BỘ LỌC TOOLBAR (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [ControlWidth], [Type], [Source], [ValueColumn], [DisplayColumn], [ColumnArr], [IsSetDefaultValue], [RememberLastValue], [isLockWhenEditData], [UseLikeOperator], [IsDisable], [IsReload], [IsPrimaryKeyCombine], [Operator])  
VALUES (N'2606171113062582698736665', N'WA_BaoHiemFrm', N'0', N'BranchID', N'Chi nhánh', 200, 3, N'HR_GetBrachIDByUserStp N''{User}''', N'BranchID', N'BranchID', N'BranchID', 1, 0, 0, 0, 0, 0, 0, 4);
GO

-- =========================================================================
-- 6. CẤU HÌNH LAYOUT TỪ ĐIỂN FIELD (SY_FrmCfg)
-- =========================================================================
-- Master Layout Configs
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2605151335120250506765678', N'WA_BaoHiemFrm', N'DFP', N'', N'DocumentDate', N'', GETDATE(), N''),
(N'2605151333483083261637386', N'WA_BaoHiemFrm', N'DMK', N'', N'{P}{YY}{MM}/{3}', N'', GETDATE(), N''),
(N'2605151331213073242096744', N'WA_BaoHiemFrm', N'DPR', N'', N'BH', N'', GETDATE(), N''),
(N'2605221051073133364212249', N'WA_BaoHiemFrm', N'LYT1', N'BranchID', N'2;8;1;1;;;;;;;;;;;;;;;;0;0', N'004', GETDATE(), N''),
(N'2603121542586526686875168', N'WA_BaoHiemFrm', N'LYT1', N'DocumentDate', N'1;4;1;1;;;;;;;;;;;;;;;;0;0', N'002', GETDATE(), N''),
(N'2603121542586366525246585', N'WA_BaoHiemFrm', N'LYT1', N'DocumentID', N'1;4;1;;;;;;;;;;;;;;;;;0;0', N'001', GETDATE(), N''),
(N'2605151341536616824066742', N'WA_BaoHiemFrm', N'LYT1', N'LoaiBaoHiem', N'1;4;1;;1;;;;;;;;;;;;;;;0;0', N'007', GETDATE(), N''),
(N'2603121542586686834862302', N'WA_BaoHiemFrm', N'LYT1', N'Notes', N'1;8;1;1;;;;;;;;;;;;;;;;0;0', N'003', GETDATE(), N''),
(N'2605151340253573798143738', N'WA_BaoHiemFrm', N'LYT1', N'PeriodID', N'1;4;1;;1;;;;;;;;;;;;;;;0;0', N'006', GETDATE(), N''),
(N'2605151620182032296531464', N'WA_BaoHiemFrm', N'LYT1', N'PeriodKeyID', N'2;4;1;1;;;;;;;;;;;;;;;;0;0', N'005', GETDATE(), N''),
(N'2605210910464674816414727', N'WA_BaoHiemFrm', N'SPA2', N'', N'1', N'', GETDATE(), N''),
(N'2605151615223383547169332', N'WA_BaoHiemFrm', N'T0', N'EX', N'(PeriodID + LoaiBaoHiem) as PeriodKeyID', N'', GETDATE(), N''),
(N'2606171405325105364451601', N'WA_BaoHiemFrm', N'T0', N'FTR', N'(N''{BranchID}'' IS NULL OR N''{BranchID}'' = '''') OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(N''{BranchID}'', '',''))', N'', GETDATE(), N''),
(N'2603121541474484793805443', N'WA_BaoHiemFrm', N'T0', N'PK', N'DocumentID', N'', GETDATE(), N''),
(N'2603121541474794959849522', N'WA_BaoHiemFrm', N'T0', N'TN', N'HR_BaoHiemTbl', N'', GETDATE(), N'');

-- Detail Layout Configs (T1)
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2603121553134214341049328', N'WA_BaoHiemFrm', N'T1', N'FKA1', N'PersonID', N'', GETDATE(), N''),
(N'2605191014501321424390303', N'WA_BaoHiemFrm', N'T1', N'FKA2', N'PersonID', N'', GETDATE(), N''),
(N'2603121553134354524588463', N'WA_BaoHiemFrm', N'T1', N'FKB1', N'PersonID', N'', GETDATE(), N''),
(N'2605191014501421582715453', N'WA_BaoHiemFrm', N'T1', N'FKB2', N'PersonID', N'', GETDATE(), N''),
(N'2603121541552763082783666', N'WA_BaoHiemFrm', N'T1', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(N'2605131542142592801449621', N'WA_BaoHiemFrm', N'T1', N'SE1', N'A.PersonName, A.PhongBan, A.TitleName, A.ChucDanhChuyenMon', N'', GETDATE(), N''),
(N'2605191015073443567375608', N'WA_BaoHiemFrm', N'T1', N'SE2', N'B.ChucDanhChuyenMon', N'', GETDATE(), N''),
(N'2603121541553083235686747', N'WA_BaoHiemFrm', N'T1', N'TN', N'HR_BaoHiemChiTietTbl', N'', GETDATE(), N''),
(N'2603121553134524683929664', N'WA_BaoHiemFrm', N'T1', N'TN1', N'HR_PersonTbl', N'', GETDATE(), N''),
(N'2605191013463333524497194', N'WA_BaoHiemFrm', N'T2', N'SE', N'HR_HopDongTbl.ChucDanhChuyenMon', N'', GETDATE(), N'');

-- Detail Columns & Header Groups
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2605131542473924125695167', N'WA_BaoHiemFrm', N'T1CS', N'12', N'PersonID;PersonName;ChucDanhChuyenMon;PhongBan;MucDong', N'', GETDATE(), N''),
(N'2605131540321081333682254', N'WA_BaoHiemFrm', N'T1CS', N'41', N'BHXH', N'', GETDATE(), N''),
(N'2605131540347958185451586', N'WA_BaoHiemFrm', N'T1CS', N'42', N'MucDongBHXHNLD;MucDongBHXHNSDLD', N'', GETDATE(), N''),
(N'2605131540371962141228410', N'WA_BaoHiemFrm', N'T1CS', N'51', N'BHYT', N'', GETDATE(), N''),
(N'2605131549531231442946667', N'WA_BaoHiemFrm', N'T1CS', N'52', N'MucDongBHYTNLD;MucDongBHYTNSDLD', N'', GETDATE(), N''),
(N'2605131540395155283139277', N'WA_BaoHiemFrm', N'T1CS', N'61', N'BHTN', N'', GETDATE(), N''),
(N'2605131549595765875999234', N'WA_BaoHiemFrm', N'T1CS', N'62', N'MucDongBHTNNLD;MucDongBHTNNSDLD', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 7. CẤU HÌNH GRID ACTIONS (SY_FrmGrdActTbl) & GRID TIÊU ĐỀ NHÓM (SY_FrmCtrTbl)
-- =========================================================================
-- Grid Action khi MucDong thay đổi
INSERT INTO dbo.SY_FrmGrdActTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [Action], [Source], [Para], [TargetValue], [TargetValue2], [TargetColumn], [TargetColumn2], [MsgID], [IsDisable], [ActType], [Oderby] )  
VALUES (N'2605151458489119305475685', N'WA_BaoHiemFrm', N'grdChitiet', N'MucDong', N'UpdateColumn', N'TinhBHStp ''{0}'', ''{1}'' , {2}', N'Master.PeriodID;Master.LoaiBaoHiem;MucDong', NULL, NULL, N'MucDongBHXHNLD;MucDongBHXHNSDLD;MucDongBHYTNLD;MucDongBHYTNSDLD;MucDongBHTNNLD;MucDongBHTNNSDLD', NULL, NULL, 0, N'ExecSQL', NULL);

-- Grid Group Headers
INSERT INTO dbo.SY_FrmCtrTbl ([UserAutoID], [FormID], [ParentCtlName], [CtlName], [CaptionVN], [CaptionEN], [CtlTop], [CtlLeft], [CaptionWidth], [Width], [Height], [OrderBy], [IsDisable], [CaptionCH] )  
VALUES 
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHXHNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHXHNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHXHNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHXHNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHYTNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHYTNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHYTNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHYTNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHTNNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHTNNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHTNNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHTNNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N'');
GO

-- =========================================================================
-- 8. CẤU HÌNH DROPDOWNS (SY_FrmDrdwTbl)
-- =========================================================================
-- 8.1. Dropdown chọn Nhân viên trong Grid chi tiết (PersonID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2603121547508699001442177', N'WA_BaoHiemFrm', N'grdChitiet', N'PersonID', N'PersonID', N'PersonID', N'STT;PersonID;PersonName;PhongBan;MucDong;CanhBao', NULL, 
N'SELECT 
    ROW_NUMBER() OVER (ORDER BY P.PersonID DESC) AS STT,
    P.PersonID, 
    P.PersonName, 
    P.PhongBan, -- Đã sửa đổi thẳng về PhongBan để khớp khớp hiển thị
    ISNULL(BH.MucDong, 0) AS MucDong, 
    CASE 
        WHEN BH.PersonID IS NOT NULL 
        THEN N''!!! ĐÃ CÓ BH TẠI KỲ: '' + CAST(BH.PeriodID AS VARCHAR) + N'' (Chứng từ: '' + BH.DocumentID + '')''
        ELSE '''' 
    END AS CanhBao,
    BH.DocumentID,
    BH.PeriodID
FROM HR_PersonTbl P
LEFT JOIN (
    SELECT 
        CT.PersonID, 
        SUM(CT.MucDong) AS MucDong, 
        MAX(H.DocumentID) AS DocumentID, 
        MAX(H.PeriodID) AS PeriodID
    FROM HR_BaoHiemChiTietTbl CT
    INNER JOIN HR_BaoHiemTbl H ON H.DocumentID = CT.DocumentID
    GROUP BY CT.PersonID
) BH ON P.PersonID = BH.PersonID
WHERE P.BranchID = ''{0}''
  AND (''{1}'' = '''' OR 1=1);', N'PersonID;PersonName;MucDong', 1, N'Master.BranchID;Master.LoaiBaoHiem', NULL, N'DropSelect', 0, NULL, 1, 1, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, N'PhongBan', N'PersonName', NULL, NULL, 0, NULL, NULL, 0);

-- 8.2. Dropdown chọn Kỳ & Loại bảo hiểm (PeriodKeyID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2605151346256396592323415', N'WA_BaoHiemFrm', NULL, N'PeriodKeyID', N'PeriodKeyID', N'PeriodID;LoaiBaoHiem', N'PeriodID;LoaiBaoHiem', N'80;200', N'SELECT PeriodID, LoaiBaoHiem, (PeriodID + LoaiBaoHiem) AS PeriodKeyID FROM HR_BangThamSoTbl', N'PeriodID;LoaiBaoHiem', 1, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- 8.3. Dropdown chọn Chi nhánh (BranchID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2605221051164454657930559', N'WA_BaoHiemFrm', NULL, N'BranchID', N'BranchID', N'BranchID', N'BranchID;BranchName', NULL, N'SELECT * FROM CF_BranchTbl', NULL, 1, NULL, NULL, N'Dropdown', 0, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, N'BranchName', NULL, NULL, NULL, NULL, NULL, 0);
GO

-- =========================================================================
-- 9. ĐĂNG KÝ VÀ VIỆT HÓA TỪ ĐIỂN CỘT (SY_FmtFldTbl)
-- =========================================================================
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'PeriodKeyID', NULL, N'Kỳ đóng bảo hiểm', N'Period Key', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'PeriodKeyID');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHXHNLD', NULL, N'BHXH Người lao động', N'SI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHXHNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHXHNSDLD', NULL, N'BHXH Công ty đóng', N'SI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHXHNSDLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHYTNLD', NULL, N'BHYT Người lao động', N'HI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHYTNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHYTNSDLD', NULL, N'BHYT Công ty đóng', N'HI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHYTNSDLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHTNNLD', NULL, N'BHTN Người lao động', N'UI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHTNNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHTNNSDLD', NULL, N'BHTN Công ty đóng', N'UI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHTNNSDLD');
GO

-- =========================================================================
-- 10. ĐỒNG BỘ TRƯỜNG TỪ TABLE VÀO SY_FormatFields
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BaoHiemFrm', @ObjectName = 'HR_BaoHiemTbl';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_BaoHiem_Detail', @ObjectName = 'HR_BaoHiemChiTietTbl';
GO

-- =========================================================================
-- 11. CẬP NHẬT THUỘC TÍNH FORM FIELDS (SY_FormatFields)
-- =========================================================================
-- Master Form Fields (WA_BaoHiemFrm)
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'DocumentID' THEN N'Số chứng từ'
        WHEN 'DocumentDate' THEN N'Ngày lập'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'PeriodID' THEN N'Kỳ'
        WHEN 'LoaiBaoHiem' THEN N'Loại bảo hiểm'
        WHEN 'Notes' THEN N'Ghi chú'
        WHEN 'PeriodKeyID' THEN N'Kỳ đóng bảo hiểm'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName = 'DocumentDate' THEN 'd'
        WHEN FieldName IN ('BranchID', 'PeriodKeyID') THEN 'sl'
        ELSE 't'
    END,
    FormPosition = CASE
        WHEN FieldName IN ('DocumentID', 'DocumentDate', 'BranchID', 'PeriodKeyID', 'Notes') THEN 'grid'
        ELSE 'form'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PeriodID', 'LoaiBaoHiem') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PeriodID', 'LoaiBaoHiem') THEN 0 ELSE 1 END,
    IsReadOnlyEdit = CASE WHEN FieldName = 'DocumentID' THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('DocumentID', 'DocumentDate', 'BranchID', 'PeriodKeyID') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PeriodKeyID' THEN 'HR_BangThamSoTbl' -- link PeriodKeyID
        ELSE NULL
    END,
    OrderNo = CASE FieldName
        WHEN 'DocumentID' THEN 1
        WHEN 'DocumentDate' THEN 2
        WHEN 'BranchID' THEN 3
        WHEN 'PeriodKeyID' THEN 4
        WHEN 'Notes' THEN 5
        ELSE 99
    END
WHERE FormName = 'WA_BaoHiemFrm';

-- Detail Grid Fields (API_BaoHiem_Detail)
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'TitleName' THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chuyên môn'
        WHEN 'MucDong' THEN N'Mức đóng'
        WHEN 'MucDongBHXHNLD' THEN N'BHXH Người lao động'
        WHEN 'MucDongBHXHNSDLD' THEN N'BHXH Công ty đóng'
        WHEN 'MucDongBHYTNLD' THEN N'BHYT Người lao động'
        WHEN 'MucDongBHYTNSDLD' THEN N'BHYT Công ty đóng'
        WHEN 'MucDongBHTNNLD' THEN N'BHTN Người lao động'
        WHEN 'MucDongBHTNNSDLD' THEN N'BHTN Công ty đóng'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 'n'
        WHEN FieldName = 'PersonID' THEN 'sl'
        ELSE 't'
    END,
    FormPosition = 'grid',
    ShowInAdd = 1,
    ShowInEdit = 1,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PersonID', 'MucDong') THEN 1 ELSE 0 END,
    DataSource = CASE WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl' ELSE NULL END,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'PhongBan' THEN 3
        WHEN 'TitleName' THEN 4
        WHEN 'ChucDanhChuyenMon' THEN 5
        WHEN 'MucDong' THEN 6
        WHEN 'MucDongBHXHNLD' THEN 7
        WHEN 'MucDongBHXHNSDLD' THEN 8
        WHEN 'MucDongBHYTNLD' THEN 9
        WHEN 'MucDongBHYTNSDLD' THEN 10
        WHEN 'MucDongBHTNNLD' THEN 11
        WHEN 'MucDongBHTNNSDLD' THEN 12
        WHEN 'GhiChu' THEN 13
        ELSE 99
    END
WHERE FormName = 'API_BaoHiem_Detail';
GO

PRINT 'Successfully configured WA_BaoHiemFrm configuration metadata!';
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
[ignoring loop detection]


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_DanhSachUngVienFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_PhongVan';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_KinhNghiem';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_HocVan';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_ChungChi';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_DanhSachUngVienFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_DanhSachUngVienFrm', N'EDIT', N'Danh sách ứng viên', N'Candidate List', N'HR_UngVienTbl', N'CandidateID', N'Danh sách ứng viên');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
-- Master Table
(NEWID(), N'WA_DanhSachUngVienFrm', N'T0', N'TN', N'HR_UngVienTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T0', N'PK', N'CandidateID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'DPR', N'', N'UV', N'', GETDATE(), N''),

-- Detail Table 1: Phỏng vấn (HR_UngVienPhongVanTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'TN', N'HR_UngVienPhongVanTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'DCP', N'Phỏng vấn', N'', GETDATE(), N''),

-- Detail Table 2: Kinh nghiệm (HR_UngVienKinhNghiemTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'TN', N'HR_UngVienKinhNghiemTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'DCP', N'Kinh nghiệm', N'', GETDATE(), N''),

-- Detail Table 3: Học vấn (HR_UngVienHocVanTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'TN', N'HR_UngVienHocVanTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'DCP', N'Học vấn', N'', GETDATE(), N''),

-- Detail Table 4: Chứng chỉ (HR_UngVienChungChiTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'TN', N'HR_UngVienChungChiTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'DCP', N'Chứng chỉ', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- API View chính (danh sách ứng viên)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_DanhSachUngVienFrm', 'View', 'API_QuanLyUngVien', '@Keyword=N''{Keyword}''');

-- API Detail tab 1: Phỏng vấn
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_PhongVan', 'View', 'API_QuanLyUngVien_PhongVan', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 2: Kinh nghiệm
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_KinhNghiem', 'View', 'API_QuanLyUngVien_KinhNghiem', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 3: Học vấn
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_HocVan', 'View', 'API_QuanLyUngVien_HocVan', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 4: Chứng chỉ
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_ChungChi', 'View', 'API_QuanLyUngVien_ChungChi', '@CandidateID=N''{CandidateID}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_QuanLyUngVien)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_DanhSachUngVienFrm',
    @ObjectName = 'API_QuanLyUngVien';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'CandidateID' THEN N'Mã ứng viên'
        WHEN 'FullName' THEN N'Họ tên ứng viên'
        WHEN 'NgaySinh' THEN N'Ngày sinh'
        WHEN 'GioiTinh' THEN N'Giới tính'
        WHEN 'SoCCCD' THEN N'Số CCCD/CMND'
        WHEN 'NgayCap' THEN N'Ngày cấp'
        WHEN 'NoiCap' THEN N'Nơi cấp'
        WHEN 'TinhTrangHonNhan' THEN N'Tình trạng hôn nhân'
        WHEN 'SoDienThoai' THEN N'Số điện thoại'
        WHEN 'Email' THEN N'Email'
        WHEN 'DiaChiThuongTru' THEN N'Địa chỉ thường trú'
        WHEN 'DiaChiHienTai' THEN N'Địa chỉ hiện tại'
        WHEN 'LinkedIn' THEN N'LinkedIn'
        WHEN 'ViTriUngTuyen' THEN N'Vị trí ứng tuyển'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'NguonUngTuyen' THEN N'Kênh ứng tuyển'
        WHEN 'NgayUngTuyen' THEN N'Ngày ứng tuyển'
        WHEN 'MucLuongMongMuon' THEN N'Lương mong muốn'
        WHEN 'NgayCoTheDiLam' THEN N'Ngày đi làm'
        WHEN 'KyNangChuyenMon' THEN N'Kỹ năng chuyên môn'
        WHEN 'KyNangMem' THEN N'Kỹ năng mềm'
        WHEN 'NgoaiNgu' THEN N'Ngoại ngữ'
        WHEN 'TinHoc' THEN N'Tin học'
        WHEN 'TrangThaiHR' THEN N'Trạng thái HR'
        WHEN 'DiemDanhGia' THEN N'Điểm đánh giá'
        WHEN 'NhanXetHR' THEN N'Nhận xét HR'
        WHEN 'NguoiPhuTrach' THEN N'Người phụ trách'
        WHEN 'KetQuaCuoiCung' THEN N'Kết quả cuối cùng'
        WHEN 'MucLuongDeXuat' THEN N'Lương đề xuất'
        WHEN 'NgayOnboard' THEN N'Ngày onboard'
        WHEN 'GhiChuChung' THEN N'Ghi chú chung'
        WHEN 'UserCreate' THEN N'Người tạo'
        WHEN 'DateCreate' THEN N'Ngày tạo'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'CandidateID' THEN 'Candidate ID'
        WHEN 'FullName' THEN 'Full Name'
        WHEN 'NgaySinh' THEN 'Date of Birth'
        WHEN 'GioiTinh' THEN 'Gender'
        WHEN 'SoCCCD' THEN 'ID No.'
        WHEN 'NgayCap' THEN 'Issue Date'
        WHEN 'NoiCap' THEN 'Issue Place'
        WHEN 'TinhTrangHonNhan' THEN 'Marital Status'
        WHEN 'SoDienThoai' THEN 'Phone Number'
        WHEN 'Email' THEN 'Email'
        WHEN 'DiaChiThuongTru' THEN 'Permanent Address'
        WHEN 'DiaChiHienTai' THEN 'Current Address'
        WHEN 'LinkedIn' THEN 'LinkedIn'
        WHEN 'ViTriUngTuyen' THEN 'Applied Position'
        WHEN 'PhongBan' THEN 'Department'
        WHEN 'NguonUngTuyen' THEN 'Source'
        WHEN 'NgayUngTuyen' THEN 'Applied Date'
        WHEN 'MucLuongMongMuon' THEN 'Desired Salary'
        WHEN 'NgayCoTheDiLam' THEN 'Available Date'
        WHEN 'KyNangChuyenMon' THEN 'Technical Skills'
        WHEN 'KyNangMem' THEN 'Soft Skills'
        WHEN 'NgoaiNgu' THEN 'Languages'
        WHEN 'TinHoc' THEN 'IT Skills'
        WHEN 'TrangThaiHR' THEN 'HR Status'
        WHEN 'DiemDanhGia' THEN 'Score'
        WHEN 'NhanXetHR' THEN 'HR Evaluation'
        WHEN 'NguoiPhuTrach' THEN 'Assignee'
        WHEN 'KetQuaCuoiCung' THEN 'Final Result'
        WHEN 'MucLuongDeXuat' THEN 'Offered Salary'
        WHEN 'NgayOnboard' THEN 'Onboard Date'
        WHEN 'GhiChuChung' THEN 'General Notes'
        WHEN 'UserCreate' THEN 'Creator'
        WHEN 'DateCreate' THEN 'Created Date'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('NgaySinh', 'NgayCap', 'NgayUngTuyen', 'NgayCoTheDiLam', 'NgayOnboard', 'DateCreate') THEN 'd'
        WHEN FieldName IN ('DiemDanhGia', 'MucLuongMongMuon', 'MucLuongDeXuat') THEN 'n'
        WHEN FieldName IN ('GioiTinh', 'TinhTrangHonNhan', 'KetQuaCuoiCung', 'PhongBan') THEN 'sl'
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'GioiTinh' THEN 'STATIC:Nam|Nam,Nữ|Nữ'
        WHEN FieldName = 'TinhTrangHonNhan' THEN N'STATIC:Độc thân|Độc thân,Đã kết hôn|Đã kết hôn'
        WHEN FieldName = 'KetQuaCuoiCung' THEN N'STATIC:Đạt|Đạt,Không đạt|Không đạt'
        WHEN FieldName = 'PhongBan' THEN 'HR_DepartmentListTbl'
        ELSE NULL
    END,
    FormPosition = CASE 
        -- Các cột hiện trên lưới
        WHEN FieldName IN ('CandidateID', 'FullName', 'NgaySinh', 'GioiTinh', 'SoCCCD', 'NgayCap', 'NoiCap', 'TinhTrangHonNhan', 'SoDienThoai', 'Email') THEN 'grid'
        -- Các trường ghi chú dài hiện rộng 12
        WHEN FieldName IN ('DiaChiThuongTru', 'DiaChiHienTai', 'KyNangChuyenMon', 'KyNangMem', 'NhanXetHR', 'GhiChuChung') THEN '12'
        -- Các trường còn lại hiện rộng 6
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('CandidateID', 'UserCreate', 'DateCreate') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('CandidateID', 'UserCreate', 'DateCreate') THEN 0 ELSE 1 END,
    IsReadOnlyAdd = 0,
    IsReadOnlyEdit = 0,
    IsRequired = CASE WHEN FieldName IN ('FullName', 'SoDienThoai', 'ViTriUngTuyen') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('FullName', 'SoDienThoai', 'ViTriUngTuyen', 'PhongBan') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'CandidateID' THEN 1
        WHEN 'FullName' THEN 2
        WHEN 'NgaySinh' THEN 3
        WHEN 'GioiTinh' THEN 4
        WHEN 'SoCCCD' THEN 5
        WHEN 'NgayCap' THEN 6
        WHEN 'NoiCap' THEN 7
        WHEN 'TinhTrangHonNhan' THEN 8
        WHEN 'SoDienThoai' THEN 9
        WHEN 'Email' THEN 10
        WHEN 'DiaChiThuongTru' THEN 11
        WHEN 'DiaChiHienTai' THEN 12
        WHEN 'LinkedIn' THEN 13
        WHEN 'ViTriUngTuyen' THEN 14
        WHEN 'PhongBan' THEN 15
        WHEN 'NguonUngTuyen' THEN 16
        WHEN 'NgayUngTuyen' THEN 17
        WHEN 'MucLuongMongMuon' THEN 18
        WHEN 'NgayCoTheDiLam' THEN 19
        WHEN 'KyNangChuyenMon' THEN 20
        WHEN 'KyNangMem' THEN 21
        WHEN 'NgoaiNgu' THEN 22
        WHEN 'TinHoc' THEN 23
        WHEN 'TrangThaiHR' THEN 24
        WHEN 'DiemDanhGia' THEN 25
        WHEN 'NhanXetHR' THEN 26
        WHEN 'NguoiPhuTrach' THEN 27
        WHEN 'KetQuaCuoiCung' THEN 28
        WHEN 'MucLuongDeXuat' THEN 29
        WHEN 'NgayOnboard' THEN 30
        WHEN 'GhiChuChung' THEN 31
        ELSE 99
    END
WHERE FormName = 'WA_DanhSachUngVienFrm';
GO

PRINT 'Da thiet lap WA_DanhSachUngVienFrm (Danh sach ung vien) voi MenuID 2027 thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.WA_API WHERE list IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach', 'API_HopDongLaoDong_NamLap', 'API_HopDongLaoDong_LoaiHD');
DELETE FROM dbo.WA_Menu WHERE MenuID = '2021' OR FormName = 'WA_HopDongLaoDongFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM TRONG CSDL (SY_FrmLstTbl)
-- =========================================================================
-- Master Form: Hợp đồng lao động
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_HopDongLaoDongFrm', 'LIST', N'Hợp đồng lao động', 'Labor Contracts', 'HR_HopDongTbl', 'MaHopDong');

-- Detail Grid: Phụ cấp trong hợp đồng
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_HopDongLaoDong_ChiTiet', 'LIST', N'Phụ cấp trong hợp đồng', 'Contract Allowances', 'HR_HopDongDetailTbl', 'UserAutoID');

-- Detail Grid: Tài liệu đính kèm
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_HopDongLaoDong_Attach', 'LIST', N'Tài liệu đính kèm', 'Contract Attachments', 'HR_HopDongAttachTbl', 'UserAutoID');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- Routing cho Master Form
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HopDongLaoDongFrm', 'View', 'API_HopDongLaoDong', '@Keyword=N''{Keyword}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @BranchID=N''{BranchID}'''),
('WA_HopDongLaoDongFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HopDongLaoDongFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Form
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_ChiTiet', 'View', 'API_HopDongLaoDong_ChiTiet', '@MaHopDong=N''{MaHopDong}'''),
('API_HopDongLaoDong_ChiTiet', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_HopDongLaoDong_ChiTiet', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Attach
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_Attach', 'View', 'API_HopDongLaoDong_Attach', '@MaHopDong=N''{MaHopDong}'''),
('API_HopDongLaoDong_Attach', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_HopDongLaoDong_Attach', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Dropdowns
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_NamLap', 'View', 'API_HopDongLaoDong_NamLap', '@Keyword=N''{Keyword}'''),
('API_HopDongLaoDong_LoaiHD', 'View', 'API_HopDongLaoDong_LoaiHD', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ TRƯỜNG GIAO DIỆN TỪ DATABASE (API_DongBoTruongGiaoDien)
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HopDongLaoDongFrm', @ObjectName = 'API_HopDongLaoDong';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_HopDongLaoDong_ChiTiet', @ObjectName = 'API_HopDongLaoDong_ChiTiet';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_HopDongLaoDong_Attach', @ObjectName = 'API_HopDongLaoDong_Attach';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN, VỊ TRÍ, ĐỊNH DẠNG (SY_FormatFields)
-- =========================================================================
-- Cấu hình các trường của Master Form
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'MaHopDong' THEN N'Mã hợp đồng'
        WHEN 'NamLap' THEN N'Năm lập'
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên nhân viên'
        WHEN 'LoaiHopDong' THEN N'Loại hợp đồng'
        WHEN 'LoaiHD' THEN N'Loại HD'
        WHEN 'NgayKyHopDong' THEN N'Ngày ký HĐ'
        WHEN 'NgayCoHieuLuc' THEN N'Ngày có hiệu lực'
        WHEN 'NgayHetHieuLuc' THEN N'Ngày hết hiệu lực'
        WHEN 'ThoiGianLamViec' THEN N'Thời gian làm việc'
        WHEN 'ThoiGianThuViec' THEN N'Thử việc (tháng)'
        WHEN 'NguoiKy' THEN N'Người ký'
        WHEN 'ChucVuNguoiKy' THEN N'Chức vụ người ký'
        WHEN 'ChucDanhChuyenMonHD' THEN N'Chức danh chuyên môn'
        WHEN 'LuongCoBan' THEN N'Lương cơ bản'
        WHEN 'MucDong' THEN N'Mức đóng BH'
        WHEN 'LoaiTien' THEN N'Loại tiền'
        WHEN 'HinhThucTraLuong' THEN N'Hình thức trả lương'
        WHEN 'DiaDiemLamViec' THEN N'Địa điểm làm việc'
        WHEN 'PhuongTien' THEN N'Phương tiện đi làm'
        WHEN 'PersonStatus' THEN N'Trạng thái NV'
        WHEN 'CMND' THEN N'Số CCCD/CMND'
        WHEN 'CMNDNgayCap' THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap' THEN N'Nơi cấp CCCD'
        WHEN 'DiaChiThuongTru' THEN N'Địa chỉ thường trú'
        WHEN 'NoiDung' THEN N'Nội dung hợp đồng'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'UserCreate' THEN N'Người tạo'
        WHEN 'DateCreate' THEN N'Ngày tạo'
        WHEN 'UserUpdate' THEN N'Người cập nhật'
        WHEN 'DateUpdate' THEN N'Ngày cập nhật'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'MaHopDong' THEN 'Contract Code'
        WHEN 'NamLap' THEN 'Year Created'
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Employee Name'
        WHEN 'LoaiHopDong' THEN 'Contract Type'
        WHEN 'LoaiHD' THEN 'Contract Group'
        WHEN 'NgayKyHopDong' THEN 'Date Signed'
        WHEN 'NgayCoHieuLuc' THEN 'Effective Date'
        WHEN 'NgayHetHieuLuc' THEN 'Expiry Date'
        WHEN 'ThoiGianLamViec' THEN 'Working Hours'
        WHEN 'ThoiGianThuViec' THEN 'Probation (months)'
        WHEN 'NguoiKy' THEN 'Signatory'
        WHEN 'ChucVuNguoiKy' THEN 'Signatory Position'
        WHEN 'ChucDanhChuyenMonHD' THEN 'Professional Title'
        WHEN 'LuongCoBan' THEN 'Basic Salary'
        WHEN 'MucDong' THEN 'Insurance Contribution'
        WHEN 'LoaiTien' THEN 'Currency'
        WHEN 'HinhThucTraLuong' THEN 'Payment Method'
        WHEN 'DiaDiemLamViec' THEN 'Working Location'
        WHEN 'PhuongTien' THEN 'Transport'
        WHEN 'PersonStatus' THEN 'Employee Status'
        WHEN 'CMND' THEN 'National ID'
        WHEN 'CMNDNgayCap' THEN 'ID Issued Date'
        WHEN 'CMNDNoiCap' THEN 'ID Issued Place'
        WHEN 'DiaChiThuongTru' THEN 'Permanent Address'
        WHEN 'NoiDung' THEN 'Contract Content'
        WHEN 'BranchID' THEN 'Branch'
        WHEN 'UserCreate' THEN 'Creator'
        WHEN 'DateCreate' THEN 'Created Date'
        WHEN 'UserUpdate' THEN 'Updater'
        WHEN 'DateUpdate' THEN 'Updated Date'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'CMNDNgayCap', 'DateCreate', 'DateUpdate') THEN 'd' -- Date format
        WHEN FieldName IN ('LuongCoBan', 'MucDong', 'ThoiGianThuViec') THEN 'n' -- Numeric/Money format
        WHEN FieldName IN ('PersonID', 'LoaiHopDong', 'BranchID', 'NamLap', 'LoaiHD') THEN 'sl' -- Select List (Dropdown)
        ELSE 't' -- Text format
    END,
    FormPosition = CASE
        WHEN FieldName IN ('MaHopDong', 'NamLap', 'PersonID', 'PersonName', 'LoaiHopDong', 'LoaiHD', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'UserCreate', 'DateCreate') THEN 'grid'
        WHEN FieldName IN ('NoiDung') THEN '12' -- full row text area in form
        ELSE '6' -- normal two-column layout input
    END,
    ShowInAdd = CASE WHEN FieldName IN ('BranchID', 'PersonName', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'DiaChiThuongTru', 'UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PersonStatus') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('BranchID', 'PersonName', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'DiaChiThuongTru', 'UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate') THEN 0 ELSE 1 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('MaHopDong', 'PersonID', 'PersonStatus') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('MaHopDong', 'PersonID') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('NamLap', 'BranchID', 'LoaiHD') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl'
        WHEN FieldName = 'LoaiHopDong' THEN N'STATIC:Không thời hạn|Không thời hạn,Có thời hạn|Có thời hạn'
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'NamLap' THEN 'API_HopDongLaoDong_NamLap'
        WHEN FieldName = 'LoaiHD' THEN 'API_HopDongLaoDong_LoaiHD'
        ELSE NULL
    END,
    OrderNo = CASE FieldName
        WHEN 'MaHopDong' THEN 1
        WHEN 'NamLap' THEN 2
        WHEN 'PersonID' THEN 3
        WHEN 'PersonName' THEN 4
        WHEN 'LoaiHopDong' THEN 5
        WHEN 'LoaiHD' THEN 6
        WHEN 'NgayKyHopDong' THEN 7
        WHEN 'NgayCoHieuLuc' THEN 8
        WHEN 'NgayHetHieuLuc' THEN 9
        WHEN 'ThoiGianLamViec' THEN 10
        WHEN 'ThoiGianThuViec' THEN 11
        WHEN 'NguoiKy' THEN 12
        WHEN 'ChucVuNguoiKy' THEN 13
        WHEN 'ChucDanhChuyenMonHD' THEN 14
        WHEN 'LuongCoBan' THEN 15
        WHEN 'MucDong' THEN 16
        WHEN 'LoaiTien' THEN 17
        WHEN 'HinhThucTraLuong' THEN 18
        WHEN 'DiaDiemLamViec' THEN 19
        WHEN 'PhuongTien' THEN 20
        WHEN 'PersonStatus' THEN 21
        WHEN 'CMND' THEN 22
        WHEN 'CMNDNgayCap' THEN 23
        WHEN 'CMNDNoiCap' THEN 24
        WHEN 'DiaChiThuongTru' THEN 25
        WHEN 'NoiDung' THEN 26
        WHEN 'UserCreate' THEN 27
        WHEN 'DateCreate' THEN 28
        ELSE 99
    END
WHERE FormName = 'WA_HopDongLaoDongFrm';

-- Cấu hình các trường cho Detail Grid
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'MaPhuCap' THEN N'Mã phụ cấp'
        WHEN 'TenPhuCap' THEN N'Tên phụ cấp'
        WHEN 'TienPhuCap' THEN N'Tiền phụ cấp'
        WHEN 'TienPhuCapNgay' THEN N'PC theo ngày'
        WHEN 'TienPhuCapThang' THEN N'PC theo tháng'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'MaPhuCap' THEN 'Allowance Code'
        WHEN 'TenPhuCap' THEN 'Allowance Name'
        WHEN 'TienPhuCap' THEN 'Allowance Value'
        WHEN 'TienPhuCapNgay' THEN 'Daily Allowance'
        WHEN 'TienPhuCapThang' THEN 'Monthly Allowance'
        WHEN 'GhiChu' THEN 'Notes'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 'n' -- number/money
        WHEN FieldName = 'MaPhuCap' THEN 'sl' -- select list
        ELSE 't'
    END,
    FormPosition = 'grid',
    ShowInAdd = CASE WHEN FieldName IN ('TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 0 ELSE 1 END,
    IsRequired = CASE WHEN FieldName = 'MaPhuCap' THEN 1 ELSE 0 END,
    DataSource = CASE WHEN FieldName = 'MaPhuCap' THEN 'WA_BangPhuCapFrm' ELSE NULL END, -- Chọn phụ cấp từ bảng phụ cấp
    OrderNo = CASE FieldName
        WHEN 'MaPhuCap' THEN 1
        WHEN 'TenPhuCap' THEN 2
        WHEN 'TienPhuCap' THEN 3
        WHEN 'TienPhuCapNgay' THEN 4
        WHEN 'TienPhuCapThang' THEN 5
        WHEN 'GhiChu' THEN 6
        ELSE 99
    END
WHERE FormName = 'API_HopDongLaoDong_ChiTiet';
GO

-- Cấu hình các trường cho Detail Attach
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'FileName' THEN N'Tên tệp'
        WHEN 'FileType' THEN N'Loại tệp'
        WHEN 'STT' THEN N'Số thứ tự'
        WHEN 'FileSize' THEN N'Kích thước'
        WHEN 'Content' THEN N'Nội dung tệp nhị phân'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'FileName' THEN 'File Name'
        WHEN 'FileType' THEN 'File Type'
        WHEN 'STT' THEN 'Order No'
        WHEN 'FileSize' THEN 'File Size'
        WHEN 'Content' THEN 'Binary Content'
        ELSE FieldName
    END,
    FormatID = 't',
    FormPosition = 'grid',
    ShowInAdd = 1,
    ShowInEdit = 1,
    IsRequired = 0,
    OrderNo = CASE FieldName
        WHEN 'FileName' THEN 1
        WHEN 'FileType' THEN 2
        WHEN 'STT' THEN 3
        WHEN 'FileSize' THEN 4
        ELSE 99
    END
WHERE FormName = 'API_HopDongLaoDong_Attach';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2021',
    '20', -- Parent 20 cho Quản lý Nhân sự
    N'Hợp đồng lao động',
    'Labor Contracts',
    'WA_HopDongLaoDongFrm',
    'WA_HOPDONGLAODONGFRM',
    '#/2021',
    'assignment', -- Icon Class cho Hợp đồng
    0
);
GO

-- Đồng bộ quyền truy cập
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Thanh cong: Da dang ky WA_HopDongLaoDongFrm, API_HopDongLaoDong_ChiTiet va WA_Menu!';
GO
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_KinhPhiCongDoanFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_KinhPhiCongDoanFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_KinhPhiCongDoanFrm';
DELETE FROM dbo.WA_API WHERE list IN ('WA_KinhPhiCongDoanFrm', 'API_KinhPhiCongDoan_PersonList');
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_KinhPhiCongDoanFrm', N'EDIT', N'Kinh phí công đoàn', N'Trade Union Fees', N'HR_KinhPhiCongDoanTbl', N'UserAutoID', N'Kinh phí công đoàn');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER VÀ CÔNG THỨC (SY_FrmCfg / SY_FrmExpTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'T0', N'TN', N'HR_KinhPhiCongDoanTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'T0', N'PK', N'UserAutoID', N'', GETDATE(), N''),
-- Cấu hình điều kiện lọc ngầm định theo chi nhánh được truyền từ Client Web
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'T0', N'FTR', N'(N''{BranchID}'' IS NULL OR N''{BranchID}'' = '''') OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(N''{BranchID}'', '',''))', N'', GETDATE(), N'');
GO

-- Đồng bộ công thức tính toán tự động trên giao diện Web khi sửa đổi Mức Đóng
INSERT INTO dbo.SY_FrmExpTbl ([UserAutoID], [FormID], [DataName], [Oderby], [ColumnID], [Expression], [RefColumn], [IsDisable])
VALUES
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'Master', 1, N'KinhPhiNopCongDoanVN', N'MucDong*0.02', N'MucDong', 0),
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'Master', 2, N'CongDoanVN', N'KinhPhiNopCongDoanVN*0.25', N'KinhPhiNopCongDoanVN;MucDong', 0),
(NEWID(), N'WA_KinhPhiCongDoanFrm', N'Master', 3, N'CongDoanCTY', N'KinhPhiNopCongDoanVN*0.75', N'KinhPhiNopCongDoanVN;MucDong', 0);
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_KinhPhiCongDoanFrm', 'View',   'API_KinhPhiCongDoan', '@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'''),
('WA_KinhPhiCongDoanFrm', 'Save',   'API_LuuDong',         '@List=N''WA_KinhPhiCongDoanFrm'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_KinhPhiCongDoanFrm', 'Delete', 'API_XoaDong',          '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_KinhPhiCongDoan_PersonList', 'View', 'API_KinhPhiCongDoan_PersonList', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_KinhPhiCongDoan)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_KinhPhiCongDoanFrm',
    @ObjectName = 'API_KinhPhiCongDoan';
GO

-- =========================================================================
-- 6. CẤU HÌNH ĐỊNH DẠNG, SEARCH DROPDOWN VÀ NHÃN HIỂN THỊ (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'UserAutoID' THEN N'Mã hệ thống'
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên nhân viên'
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        WHEN 'MucDong' THEN N'Mức đóng BH'
        WHEN 'KinhPhiNopCongDoanVN' THEN N'Kinh phí nộp CĐ VN (2%)'
        WHEN 'CongDoanVN' THEN N'Công đoàn VN giữ (25%)'
        WHEN 'CongDoanCTY' THEN N'Công đoàn CTY giữ (75%)'
        WHEN 'BranchID' THEN N'Mã chi nhánh'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'UserAutoID' THEN 'System ID'
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Full Name'
        WHEN 'ChucDanhChuyenMon' THEN 'Professional Title'
        WHEN 'MucDong' THEN 'Insurance Base Salary'
        WHEN 'KinhPhiNopCongDoanVN' THEN 'Union Fee Total (2%)'
        WHEN 'CongDoanVN' THEN 'Union VN Retained (25%)'
        WHEN 'CongDoanCTY' THEN 'Union Company Retained (75%)'
        WHEN 'BranchID' THEN 'Branch ID'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('MucDong', 'KinhPhiNopCongDoanVN', 'CongDoanVN', 'CongDoanCTY') THEN 'n' -- Định dạng số (Numeric)
        WHEN FieldName IN ('PersonID') THEN 'sl' -- Tìm kiếm Dropdown chọn nhân viên
        ELSE 't' -- Định dạng Text
    END,
    DataSource = CASE
        WHEN FieldName = 'PersonID' THEN N'API_KinhPhiCongDoan_PersonList'
        ELSE NULL
    END,
    FormPosition = CASE 
        -- Các trường hiện trên danh sách Grid lưới Web
        WHEN FieldName IN ('PersonID', 'PersonName', 'ChucDanhChuyenMon', 'MucDong', 'KinhPhiNopCongDoanVN', 'CongDoanVN', 'CongDoanCTY') THEN 'grid'
        ELSE '6'
    END,
    ValidateRule = CASE FieldName
        WHEN 'KinhPhiNopCongDoanVN' THEN N'formula:{MucDong}*0.02'
        WHEN 'CongDoanVN' THEN N'formula:{KinhPhiNopCongDoanVN}*0.25'
        WHEN 'CongDoanCTY' THEN N'formula:{KinhPhiNopCongDoanVN}*0.75'
        ELSE NULL
    END,
    ShowInAdd = CASE WHEN FieldName IN ('UserAutoID') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserAutoID', 'PersonID') THEN 0 ELSE 1 END,
    IsReadOnlyAdd = CASE WHEN FieldName IN ('KinhPhiNopCongDoanVN', 'CongDoanVN', 'CongDoanCTY') THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('KinhPhiNopCongDoanVN', 'CongDoanVN', 'CongDoanCTY') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PersonID') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('PersonID', 'PersonName', 'BranchID') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'ChucDanhChuyenMon' THEN 3
        WHEN 'MucDong' THEN 4
        WHEN 'KinhPhiNopCongDoanVN' THEN 5
        WHEN 'CongDoanVN' THEN 6
        WHEN 'CongDoanCTY' THEN 7
        ELSE 99
    END
WHERE FormName = 'WA_KinhPhiCongDoanFrm';
GO

PRINT 'Da thiet lap cau hinh WEB cho WA_KinhPhiCongDoanFrm thanh cong!';
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
DELETE FROM dbo.WA_API WHERE list = 'WA_LuongKhoanFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_LuongKhoanFrm', 'View', 'API_LuongKhoan', '@Keyword=N''{Keyword}'''),
('WA_LuongKhoanFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_LuongKhoanFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
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
DELETE FROM dbo.WA_API WHERE list = 'WA_PayRoll_Process_Stp';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PayRoll_Process_Stp', 'View', 'WA_PayRoll_Process_Stp', '@PeriodID=N''{PeriodID}''');
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

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID  IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID = 'WA_PersonFullFrm';
DELETE FROM dbo.SY_FormatFields  WHERE FormName = 'WA_PersonFullFrm';
DELETE FROM dbo.WA_Menu          WHERE FormName = 'WA_PersonFullFrm' OR MenuID = '2010';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES 
    (N'WA_PersonFullFrm', N'EDIT', N'Hồ sơ nhân viên tổng hợp', N'General Employee Profile', N'HR_PersonTbl', N'PersonID', N'Hồ sơ nhân viên tổng hợp');
GO

-- =========================================================================
-- 3. CẤU HÌNH LIÊN KẾT MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])
VALUES
-- Master (T0)
(NEWID(), N'WA_PersonFullFrm', N'T0', N'TN', N'HR_PersonTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T0', N'PK', N'PersonID',              N'', GETDATE(), N''),

-- Detail Tab 1: Sơ yếu lý lịch (HR_PersonSalaryTbl)
(NEWID(), N'WA_PersonFullFrm', N'T1', N'TN', N'HR_PersonSalaryTbl',   N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T1', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T1', N'DCP', N'Sơ yếu lý lịch',       N'', GETDATE(), N''),

-- Detail Tab 2: Lương & Phụ cấp (HR_PersonAllowanceTbl)
(NEWID(), N'WA_PersonFullFrm', N'T2', N'TN', N'HR_PersonAllowanceTbl',N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T2', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T2', N'DCP', N'Lương & Phụ cấp',      N'', GETDATE(), N''),

-- Detail Tab 3: Khen thưởng - Kỷ luật (HR_PersonKTKLTbl)
(NEWID(), N'WA_PersonFullFrm', N'T3', N'TN', N'HR_PersonKTKLTbl',     N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T3', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T3', N'DCP', N'Khen thưởng - Kỷ luật',N'', GETDATE(), N''),

-- Detail Tab 4: Khai báo phép năm (HR_PersonNghiPhepTbl)
(NEWID(), N'WA_PersonFullFrm', N'T4', N'TN', N'HR_PersonNghiPhepTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T4', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T4', N'DCP', N'Khai báo phép năm',    N'', GETDATE(), N''),

-- Detail Tab 5: Gia cảnh & Mối liên hệ (HR_PersonRelationTbl)
(NEWID(), N'WA_PersonFullFrm', N'T5', N'TN', N'HR_PersonRelationTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T5', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T5', N'DCP', N'Gia cảnh & Liên hệ',   N'', GETDATE(), N''),

-- Detail Tab 6: Lịch sử hợp đồng (HR_HopDongTbl)
(NEWID(), N'WA_PersonFullFrm', N'T6', N'TN', N'HR_HopDongTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T6', N'PK', N'MaHopDong',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T6', N'DCP', N'Lịch sử hợp đồng',     N'', GETDATE(), N''),

-- Detail Tab 7: Lịch sử công tác (HR_LichSuCongTacTbl)
(NEWID(), N'WA_PersonFullFrm', N'T7', N'TN', N'HR_LichSuCongTacTbl',   N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T7', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T7', N'DCP', N'Lịch sử công tác',     N'', GETDATE(), N''),

-- Detail Tab 8: Lịch sử công việc (HR_PersonLogTbl)
(NEWID(), N'WA_PersonFullFrm', N'T8', N'TN', N'HR_PersonLogTbl',       N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T8', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T8', N'DCP', N'Lịch sử công việc',     N'', GETDATE(), N''),

-- Detail Tab 9: Giấy tờ (HR_PersonGiayToTbl)
(NEWID(), N'WA_PersonFullFrm', N'T9', N'TN', N'HR_PersonGiayToTbl',    N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T9', N'PK', N'DocumentID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T9', N'DCP', N'Giấy tờ',              N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ SP API_HoSoNhanVien
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_PersonFullFrm',
    @ObjectName = 'API_HoSoNhanVien';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN + HIỂN THỊ CỘT TRÊN LƯỚI MASTER (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID'                  THEN N'Mã nhân viên'
        WHEN 'PersonName'                THEN N'Họ tên'
        WHEN 'GioiTinh'                  THEN N'Giới tính'
        WHEN 'PhongBan'                  THEN N'Bộ phận'
        WHEN 'TitleName'                 THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon'         THEN N'Chức danh chuyên môn'
        WHEN 'NgaySinh'                  THEN N'Ngày sinh'
        WHEN 'CMND'                      THEN N'CCCD'
        WHEN 'DiaChiThuongTru'           THEN N'Địa chỉ thường trú'
        WHEN 'NgayVaoLam'                THEN N'Ngày nhận việc'
        WHEN 'BranchID'                  THEN N'Chi nhánh'
        WHEN 'NgayHopDong'               THEN N'Ngày hợp đồng'
        WHEN 'NationName'                THEN N'Quốc gia'
        WHEN 'SoHopDong'                 THEN N'Số hợp đồng'
        WHEN 'DienThoai'                 THEN N'Điện thoại'
        WHEN 'NewPersonID'               THEN N'Mã NV cũ'
        WHEN 'CardNo'                    THEN N'Mã số thẻ'
        WHEN 'ProvineName'               THEN N'Tỉnh thành'
        WHEN 'DiaChiHienNay'             THEN N'Địa chỉ hiện nay'
        WHEN 'Quanly'                    THEN N'Người quản lý'
        WHEN 'NgayThuViec'               THEN N'Ngày thử việc'
        WHEN 'BankHolder'                THEN N'Chủ tài khoản NH'
        WHEN 'BankAccountNo'             THEN N'Số tài khoản NH'
        WHEN 'BankName'                  THEN N'Tên ngân hàng'
        WHEN 'BankLocation'              THEN N'Chi nhánh NH'
        WHEN 'SocialID'                  THEN N'Số thẻ BHXH'
        WHEN 'SocialDate'                THEN N'Ngày BĐ đóng BHXH'
        WHEN 'NgayKetThucBH'             THEN N'Ngày kết thúc BHXH'
        WHEN 'ShiftID'                   THEN N'Ca làm việc'
        WHEN 'SoTheBHYT'                 THEN N'Số thẻ BHYT'
        WHEN 'ThoiGianHuongBHYT'         THEN N'Thời gian hưởng BHYT'
        WHEN 'NoiDangKyBHYT'             THEN N'Nơi ĐK KCB ban đầu'
        WHEN 'ChamCong'                  THEN N'Có chấm công'
        WHEN 'LoaiHopDong'               THEN N'Loại hợp đồng'
        WHEN 'NgayHetHopDong'            THEN N'Ngày hết hiệu lực HĐ'
        WHEN 'NguoiLienHe'               THEN N'Người liên hệ khẩn cấp'
        WHEN 'MoiQuanHe'                 THEN N'Mối quan hệ người LH'
        WHEN 'NguoiLienHeSoDT'           THEN N'Số ĐT người liên hệ'
        WHEN 'FileName'                  THEN N'Tên file ảnh'
        WHEN 'Base64Content'             THEN N'Ảnh 3x4'
        WHEN 'MaNVChamCong'              THEN N'Mã NV chấm công'
        WHEN 'PersonName2'               THEN N'Tên gọi khác'
        WHEN 'PostionName'               THEN N'Vị trí công việc'
        WHEN 'NgayNghiViec'              THEN N'Ngày nghỉ việc'
        WHEN 'WorkingGroupName'          THEN N'Tổ/nhóm làm việc'
        WHEN 'DungCuLamViec'             THEN N'Dụng cụ làm việc'
        WHEN 'GhiChu'                    THEN N'Ghi chú'
        WHEN 'LocationID'                THEN N'Địa điểm làm việc'
        WHEN 'NgayDuKienTV'              THEN N'Ngày DK thử việc'
        WHEN 'UserCreate'                THEN N'Người tạo'
        WHEN 'UserUpdate'                THEN N'Người cập nhật'
        WHEN 'DateUpdate'                THEN N'Ngày cập nhật'
        WHEN 'DateCreate'                THEN N'Ngày tạo'
        WHEN 'DiaChiTamTru'              THEN N'Địa chỉ tạm trú'
        WHEN 'isTaiTuyen'                THEN N'Đã tái tuyển'
        WHEN 'PersonStatusName'          THEN N'Trạng thái'
        WHEN 'HonNhan'                   THEN N'Tình trạng hôn nhân'
        WHEN 'CMNDNgayCap'               THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap'                THEN N'Nơi cấp CCCD'
        WHEN 'NoiSinh'                   THEN N'Nơi sinh'
        WHEN 'PeoplesName'               THEN N'Dân tộc'
        WHEN 'ReligionName'              THEN N'Tôn giáo'
        WHEN 'Email'                     THEN N'Email'
        WHEN 'EducationName'             THEN N'Trình độ học vấn'
        WHEN 'Nationality'               THEN N'Quốc tịch'
        WHEN 'JobName'                   THEN N'Nghề nghiệp'
        WHEN 'CareerName'                THEN N'Chuyên ngành'
        WHEN 'HospitalName'              THEN N'Nơi KCB'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID'                  THEN 'Employee ID'
        WHEN 'PersonName'                THEN 'Full Name'
        WHEN 'GioiTinh'                  THEN 'Gender'
        WHEN 'PhongBan'                  THEN 'Department'
        WHEN 'TitleName'                 THEN 'Title'
        WHEN 'ChucDanhChuyenMon'         THEN 'Professional Title'
        WHEN 'NgaySinh'                  THEN 'Date of Birth'
        WHEN 'CMND'                      THEN 'ID/Passport'
        WHEN 'DiaChiThuongTru'           THEN 'Permanent Address'
        WHEN 'NgayVaoLam'                THEN 'Hire Date'
        WHEN 'BranchID'                  THEN 'Branch'
        WHEN 'NgayHopDong'               THEN 'Contract Date'
        WHEN 'NationName'                THEN 'Country'
        WHEN 'SoHopDong'                 THEN 'Contract No'
        WHEN 'DienThoai'                 THEN 'Phone'
        WHEN 'NewPersonID'               THEN 'Old Employee ID'
        WHEN 'CardNo'                    THEN 'Card No'
        WHEN 'ProvineName'               THEN 'City/Province'
        WHEN 'DiaChiHienNay'             THEN 'Current Address'
        WHEN 'Quanly'                    THEN 'Manager'
        WHEN 'NgayThuViec'               THEN 'Probation Date'
        WHEN 'BankHolder'                THEN 'Bank Acc Holder'
        WHEN 'BankAccountNo'             THEN 'Bank Acc No'
        WHEN 'BankName'                  THEN 'Bank Name'
        WHEN 'BankLocation'              THEN 'Bank Branch'
        WHEN 'SocialID'                  THEN 'Social Insurance No'
        WHEN 'SocialDate'                THEN 'SI Start Date'
        WHEN 'NgayKetThucBH'             THEN 'SI End Date'
        WHEN 'ShiftID'                   THEN 'Default Shift'
        WHEN 'SoTheBHYT'                 THEN 'Health Insurance No'
        WHEN 'ThoiGianHuongBHYT'         THEN 'HI Effective Date'
        WHEN 'NoiDangKyBHYT'             THEN 'KCB Initial Place'
        WHEN 'ChamCong'                  THEN 'Has Timekeeping'
        WHEN 'LoaiHopDong'               THEN 'Contract Type'
        WHEN 'NgayHetHopDong'            THEN 'Contract Expiry'
        WHEN 'NguoiLienHe'               THEN 'Emergency Contact'
        WHEN 'MoiQuanHe'                 THEN 'Relationship'
        WHEN 'NguoiLienHeSoDT'           THEN 'Contact Phone'
        WHEN 'FileName'                  THEN 'File Name'
        WHEN 'Base64Content'             THEN '3x4 Photo'
        WHEN 'MaNVChamCong'              THEN 'Timekeeping ID'
        WHEN 'PersonName2'               THEN 'Alias/Other Name'
        WHEN 'PostionName'               THEN 'Position'
        WHEN 'NgayNghiViec'              THEN 'Resignation Date'
        WHEN 'WorkingGroupName'          THEN 'Working Group'
        WHEN 'DungCuLamViec'             THEN 'Working Tools'
        WHEN 'GhiChu'                    THEN 'Notes'
        WHEN 'LocationID'                THEN 'Work Location'
        WHEN 'NgayDuKienTV'              THEN 'Expected Probation Date'
        WHEN 'UserCreate'                THEN 'Created By'
        WHEN 'UserUpdate'                THEN 'Updated By'
        WHEN 'DateUpdate'                THEN 'Updated Date'
        WHEN 'DateCreate'                THEN 'Created Date'
        WHEN 'DiaChiTamTru'              THEN 'Temporary Address'
        WHEN 'isTaiTuyen'                THEN 'Re-hired'
        WHEN 'PersonStatusName'          THEN 'Status Name'
        WHEN 'HonNhan'                   THEN 'Marital Status'
        WHEN 'CMNDNgayCap'               THEN 'ID Issue Date'
        WHEN 'CMNDNoiCap'                THEN 'ID Issue Place'
        WHEN 'NoiSinh'                   THEN 'Place of Birth'
        WHEN 'PeoplesName'               THEN 'Ethnicity'
        WHEN 'ReligionName'              THEN 'Religion'
        WHEN 'Email'                     THEN 'Email'
        WHEN 'EducationName'             THEN 'Education'
        WHEN 'Nationality'               THEN 'Nationality'
        WHEN 'JobName'                   THEN 'Job'
        WHEN 'CareerName'                THEN 'Career'
        WHEN 'HospitalName'              THEN 'Hospital'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayHetHopDong', 'NgayNghiViec', 'NgayDuKienTV', 'DateCreate', 'DateUpdate', 'CMNDNgayCap') THEN 'd'
        WHEN FieldName IN ('BranchID', 'PhongBan', 'ShiftID', 'GioiTinh') THEN 'sl'
        WHEN FieldName IN ('ChamCong', 'isTaiTuyen') THEN 'sw'
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'BranchID'      THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PhongBan'      THEN 'HR_DepartmentListTbl'
        WHEN FieldName = 'ShiftID'       THEN 'API_HR_DropdownShifts'
        WHEN FieldName = 'GioiTinh'      THEN N'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác'
        ELSE NULL
    END,
    FormPosition = CASE 
        -- CÁC TRƯỜNG QUAN TRỌNG: Hiển thị trên Danh sách (Grid) VÀ trên Form chia 2 cột ('grid|6')
        WHEN FieldName IN (
            'PersonID', 'PersonName', 'GioiTinh', 'NgaySinh', 'CMND', 'DienThoai', 
            'BranchID', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon', 
            'NgayVaoLam', 'PersonStatus', 'SoHopDong', 'BankAccountNo', 'BankName', 'PeoplesName', 'ReligionName', 'Nationality'
        ) THEN 'grid|6'
        -- CÁC TRƯỜNG CHI TIẾT CHUYÊN SÂU: Ẩn khỏi Danh sách, CHỈ hiển thị trên Form chia 2 cột ('6')
        ELSE '6'
    END,
    ShowInAdd  = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 0 ELSE 1 END,
    IsReadOnlyAdd  = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 1 ELSE 0 END,
    IsRequired     = 0,
    ShowInFilter   = 0,
    OrderNo = CASE FieldName
        WHEN 'PersonID'                  THEN 1
        WHEN 'PersonName'                THEN 2
        WHEN 'GioiTinh'                  THEN 3
        WHEN 'PhongBan'                  THEN 4
        WHEN 'TitleName'                 THEN 5
        WHEN 'ChucDanhChuyenMon'         THEN 6
        WHEN 'NgaySinh'                  THEN 7
        WHEN 'CMND'                      THEN 8
        WHEN 'DiaChiThuongTru'           THEN 9
        WHEN 'NgayVaoLam'                THEN 10
        WHEN 'BranchID'                  THEN 11
        WHEN 'NgayHopDong'               THEN 12
        WHEN 'NationName'                THEN 13
        WHEN 'SoHopDong'                 THEN 14
        WHEN 'DienThoai'                 THEN 15
        WHEN 'NewPersonID'               THEN 17
        WHEN 'CardNo'                    THEN 18
        WHEN 'ProvineName'               THEN 19
        WHEN 'DiaChiHienNay'             THEN 20
        WHEN 'Quanly'                    THEN 21
        WHEN 'NgayThuViec'               THEN 22
        WHEN 'BankHolder'                THEN 23
        WHEN 'BankAccountNo'             THEN 24
        WHEN 'BankName'                  THEN 25
        WHEN 'BankLocation'              THEN 26
        WHEN 'SocialID'                  THEN 27
        WHEN 'SocialDate'                THEN 28
        WHEN 'NgayKetThucBH'             THEN 29
        WHEN 'ShiftID'                   THEN 30
        WHEN 'SoTheBHYT'                 THEN 31
        WHEN 'ThoiGianHuongBHYT'         THEN 32
        WHEN 'NoiDangKyBHYT'             THEN 33
        WHEN 'ChamCong'                  THEN 34
        WHEN 'LoaiHopDong'               THEN 35
        WHEN 'NgayHetHopDong'            THEN 36
        WHEN 'NguoiLienHe'               THEN 37
        WHEN 'MoiQuanHe'                 THEN 38
        WHEN 'NguoiLienHeSoDT'           THEN 39
        WHEN 'MaNVChamCong'              THEN 40
        WHEN 'PersonName2'               THEN 41
        WHEN 'PostionName'               THEN 42
        WHEN 'WorkingGroupName'          THEN 43
        WHEN 'LocationID'                THEN 44
        WHEN 'DiaChiTamTru'              THEN 45
        WHEN 'NgayNghiViec'              THEN 46
        WHEN 'DungCuLamViec'             THEN 47
        WHEN 'GhiChu'                    THEN 48
        WHEN 'NgayDuKienTV'              THEN 49
        WHEN 'isTaiTuyen'                THEN 50
        WHEN 'PersonStatusName'          THEN 16
        WHEN 'UserCreate'                THEN 52
        WHEN 'DateCreate'                THEN 53
        WHEN 'UserUpdate'                THEN 54
        WHEN 'DateUpdate'                THEN 55
        WHEN 'FileName'                  THEN 57
        WHEN 'Base64Content'             THEN 58
        ELSE 99
    END
WHERE FormName = 'WA_PersonFullFrm';
GO

-- =========================================================================
-- 6. THÊM MENU VÀO HỆ THỐNG WEB (WA_Menu) — MenuID 2010
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2010',
    '20',
    N'Hồ sơ nhân viên tổng hợp',
    'General Employee Profile',
    'WA_PersonFullFrm',
    'WA_PERSONFULLFRM',
    '#/2010',
    'assignment_ind',
    0
);
GO

EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da thiet lap WA_PersonFullFrm (Ho so nhan vien tong hop) voi MenuID 2010 thanh cong!';
GO

-- Thêm các cột ảo dùng cho bộ lọc
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'LoaiHD')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonFullFrm', 'LoaiHD', N'Loại HĐ', 'Contract Type', 'sl', 0, 'grid', 0, 0, 0, 0, 100, 1, 'API_DanhSachLoaiHD')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_DanhSachLoaiHD' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'LoaiHD'
END

IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'NamLap')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonFullFrm', 'NamLap', N'Năm Lập', 'Year', 'sl', 0, 'grid', 0, 0, 0, 0, 101, 1, 'API_HopDongLaoDong_NamLap')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_HopDongLaoDong_NamLap' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'NamLap'
END

-- Đảm bảo Chi nhánh hiện bộ lọc
UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'CF_BranchListFrm' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'BranchID'

-- Đảm bảo PersonStatus hiện bộ lọc
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'PersonStatus')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonFullFrm', 'PersonStatus', N'Trạng thái', 'Status', 'sl', 0, 'grid', 0, 0, 0, 0, 102, 1, 'API_ComboPersonStatus')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET CaptionVN = N'Trạng thái', CaptionEN = 'Status', ShowInFilter = 1, DataSource = 'API_ComboPersonStatus', FormatID = 'sl' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'PersonStatus'
END




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
    '2040',
    '20',
    N'Quản lý nghỉ lễ',
    'Holiday Management',
    'WA_QuanLyNghiLeFrm',
    '',
    '#/2040',
    'calendar_today',
    0
);
GO

PRINT 'Da thiet lap WA_QuanLyNghiLeFrm (Quan ly nghi le) voi MenuID 2107 thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID  IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.SY_FormatFields  WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.WA_API           WHERE list = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.WA_API           WHERE list = 'API_QuanLyNghiPhepNam_ChiTiet';
DELETE FROM dbo.WA_Menu          WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- Master: HR_PersonTbl (Thông tin nhân viên)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES 
    (N'WA_QuanLyNghiPhepNamFrm', N'EDIT', N'Quản lý nghỉ phép năm', N'Annual Leave Management', N'HR_PersonTbl', N'PersonID', N'Quản lý nghỉ phép năm');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])
VALUES
-- Master
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T0', N'TN', N'HR_PersonTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T0', N'PK', N'PersonID',              N'', GETDATE(), N''),
-- Detail: Phép năm
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'TN', N'HR_PersonNghiPhepTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'DCP', N'Phép năm',             N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. ĐĂNG KÝ CẤU HÌNH API (WA_API)
-- =========================================================================
-- API View chính (danh sách nhân viên)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_QuanLyNghiPhepNamFrm', 'View', 'API_QuanLyNghiPhepNam',
        '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @PersonName=N''{PersonName}''');

-- API Detail tab: Lịch sử phép năm theo PersonID
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyNghiPhepNam_ChiTiet', 'View', 'API_QuanLyNghiPhepNam_ChiTiet', '@PersonID=N''{PersonID}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ SP API_QuanLyNghiPhepNam
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_QuanLyNghiPhepNamFrm',
    @ObjectName = 'API_QuanLyNghiPhepNam';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN + HIỂN THỊ CỘT TRÊN LƯỚI MASTER (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID'          THEN N'Mã nhân viên'
        WHEN 'PersonName'        THEN N'Họ tên'
        WHEN 'PhongBan'          THEN N'Bộ phận'
        WHEN 'TitleName'         THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        WHEN 'NgaySinh'          THEN N'Ngày sinh'
        WHEN 'CMND'              THEN N'CCCD'
        WHEN 'DiaChiThuongTru'   THEN N'Địa chỉ thường trú'
        WHEN 'NationName'        THEN N'Quốc gia'
        WHEN 'NgayVaoLam'        THEN N'Ngày nhận việc'
        WHEN 'SoHopDong'         THEN N'Số hợp đồng'
        WHEN 'NgayHopDong'       THEN N'Ngày hợp đồng'
        WHEN 'BranchID'          THEN N'Chi nhánh'
        WHEN 'DienThoai'         THEN N'Điện thoại'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID'          THEN 'Employee ID'
        WHEN 'PersonName'        THEN 'Full Name'
        WHEN 'PhongBan'          THEN 'Department'
        WHEN 'TitleName'         THEN 'Title'
        WHEN 'ChucDanhChuyenMon' THEN 'Professional title'
        WHEN 'NgaySinh'          THEN 'Date of Birth'
        WHEN 'CMND'              THEN 'ID/Passport'
        WHEN 'DiaChiThuongTru'   THEN 'Permanent Address'
        WHEN 'NationName'        THEN 'Country'
        WHEN 'NgayVaoLam'        THEN 'Hire Date'
        WHEN 'SoHopDong'         THEN 'Contract No'
        WHEN 'NgayHopDong'       THEN 'Contract Date'
        WHEN 'BranchID'          THEN 'Branch'
        WHEN 'DienThoai'         THEN 'Phone'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgaySinh', 'NgayVaoLam', 'NgayHopDong') THEN 'd'
        WHEN FieldName IN ('BranchID')  THEN 'sl'   -- Filter dropdown Chi nhánh
        WHEN FieldName IN ('PhongBan')  THEN 'sl'   -- Filter dropdown Bộ phận
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PhongBan' THEN 'HR_DepartmentListTbl'
        ELSE NULL
    END,
    FormPosition = 'grid',
    ShowInAdd  = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd  = 1,
    IsReadOnlyEdit = 1,
    IsRequired     = 0,
    ShowInFilter   = CASE WHEN FieldName IN ('BranchID', 'PhongBan', 'PersonName') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'PersonID'          THEN 1
        WHEN 'PersonName'        THEN 2
        WHEN 'PhongBan'          THEN 3
        WHEN 'TitleName'         THEN 4
        WHEN 'ChucDanhChuyenMon' THEN 5
        WHEN 'NgaySinh'          THEN 6
        WHEN 'CMND'              THEN 7
        WHEN 'DiaChiThuongTru'   THEN 8
        WHEN 'NationName'        THEN 9
        WHEN 'NgayVaoLam'        THEN 10
        WHEN 'SoHopDong'         THEN 11
        WHEN 'NgayHopDong'       THEN 12
        WHEN 'BranchID'          THEN 13
        WHEN 'DienThoai'         THEN 14
        ELSE 99
    END
WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
GO

-- =========================================================================
-- 7. THÊM MENU (WA_Menu) — MenuID 2054
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2106',
    '21',
    N'Quản lý nghỉ phép năm',
    'Annual Leave Management',
    'WA_QuanLyNghiPhepNamFrm',
    '',
    '#/2106',
    'event_available',
    0
);
GO

PRINT 'Da thiet lap WA_QuanLyNghiPhepNamFrm (Quan ly nghi phep nam - Master/Detail) voi MenuID 2106 thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_ShiftListCNFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_ShiftListCNFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ShiftListCNFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_ShiftListCNFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_ShiftListCNFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_ShiftListCNFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_ShiftListCNFrm', N'EDIT', N'Danh mục Ca làm việc chi nhánh', N'Branch Shift List', N'HR_ShiftListCNTbl', N'ShiftID', N'Danh mục Ca làm việc chi nhánh');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
-- Master Table
(NEWID(), N'WA_ShiftListCNFrm', N'T0', N'TN', N'HR_ShiftListCNTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_ShiftListCNFrm', N'T0', N'PK', N'ShiftID', N'', GETDATE(), N''),
(NEWID(), N'WA_ShiftListCNFrm', N'T0', N'PK2', N'BranchID', N'', GETDATE(), N''),
(NEWID(), N'WA_ShiftListCNFrm', N'DPR', N'', N'SFTCN', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- API View
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_ShiftListCNFrm', 'View', 'API_DanhSachCaLamViecChiNhanh', '@Keyword=N''{Keyword}'', @UserBranchID=N''{BranchID}''');

-- Đăng ký Dropdown (Drdw) Loại ca
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [Source], [Type])
VALUES (NEWID(), N'WA_ShiftListCNFrm', N'LoaiCa', N'LoaiCa', N'TenLoaiCa', N'TenLoaiCa;LoaiCa', N'Ca gãy;0;Ca thẳng;1;Ca hành chánh;2', N'ValueLstCb');

-- Đăng ký Dropdown (Drdw) Cách chấm công
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [Source], [Type])
VALUES (NEWID(), N'WA_ShiftListCNFrm', N'CachChamCong', N'CachChamCong', N'TenCachChamCong', N'TenCachChamCong;CachChamCong', N'Vào đầu - Ra cuối;0;Theo mỗi lần vào ra;1', N'ValueLstCb');

-- Đăng ký Dropdown (Drdw) Chi nhánh
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [Source], [Type])
VALUES (NEWID(), N'WA_ShiftListCNFrm', N'BranchID', N'BranchID', N'BranchID', N'BranchID;BranchName', N'API_DanhSachChiNhanh', N'API');

GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_DanhSachCaLamViecChiNhanh)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ShiftListCNFrm',
    @ObjectName = 'API_DanhSachCaLamViecChiNhanh';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
-- Đặt các trường hiển thị và bắt buộc
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'ShiftID' THEN N'Mã ca'
        WHEN 'ShiftName' THEN N'Tên Ca'
        WHEN 'LoaiCa' THEN N'Loại ca'
        WHEN 'GioVaoDoan1' THEN N'Giờ vào ca 1'
        WHEN 'GioRaDoan1' THEN N'Giờ ra ca 1'
        WHEN 'GioVaoDoan2' THEN N'Giờ vào ca 2'
        WHEN 'GioRaDoan2' THEN N'Giờ ra ca 2'
        WHEN 'GioVaoThang' THEN N'Giờ vào HC'
        WHEN 'GioRaThang' THEN N'Giờ ra HC'
        WHEN 'CachChamCong' THEN N'Cách chấm công'
        WHEN 'SoGioCong' THEN N'Tổng số giờ công'
        WHEN 'SoCong' THEN N'Số công'
        WHEN 'IsCaDem' THEN N'Ca đêm'
        WHEN 'IsActive' THEN N'Kích hoạt'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE CaptionVN
    END,
    CaptionEN = CASE FieldName
        WHEN 'BranchID' THEN 'BranchID'
        WHEN 'ShiftID' THEN 'ShiftID'
        WHEN 'ShiftName' THEN 'ShiftName'
        WHEN 'LoaiCa' THEN 'Shift Type'
        WHEN 'GioVaoDoan1' THEN 'In 1'
        WHEN 'GioRaDoan1' THEN 'Out 1'
        WHEN 'GioVaoDoan2' THEN 'In 2'
        WHEN 'GioRaDoan2' THEN 'Out 2'
        WHEN 'GioVaoThang' THEN 'In Admin'
        WHEN 'GioRaThang' THEN 'Out Admin'
        WHEN 'CachChamCong' THEN 'In out type'
        WHEN 'SoGioCong' THEN 'Main hour'
        WHEN 'SoCong' THEN 'Workdays'
        WHEN 'IsCaDem' THEN 'Night Shift'
        WHEN 'IsActive' THEN 'Active'
        WHEN 'GhiChu' THEN 'Note'
        ELSE CaptionEN
    END,
    FormatID = CASE 
        WHEN FieldName IN ('GioVaoDoan1', 'GioRaDoan1', 'GioVaoDoan2', 'GioRaDoan2', 'GioVaoThang', 'GioRaThang') THEN 'H'
        WHEN FieldName IN ('IsCaDem', 'IsActive') THEN 'b'
        WHEN FieldName IN ('LoaiCa', 'CachChamCong', 'BranchID') THEN 'sl'
        ELSE 't'
    END,
    FormPosition = 'grid',  -- Tất cả cột đều hiện trên lưới
    ShowInAdd = CASE WHEN FieldName IN ('UserCreate', 'UserUpdate', 'DateCreate', 'DateUpdate') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserCreate', 'UserUpdate', 'DateCreate', 'DateUpdate') THEN 0 ELSE 1 END,
    IsReadOnlyAdd = CASE WHEN FieldName IN ('UserCreate', 'UserUpdate', 'DateCreate', 'DateUpdate') THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('ShiftID', 'UserCreate', 'UserUpdate', 'DateCreate', 'DateUpdate') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('ShiftID', 'ShiftName', 'BranchID') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('ShiftID', 'ShiftName', 'BranchID') THEN 1 ELSE 0 END
WHERE FormName = 'WA_ShiftListCNFrm';
GO

-- =========================================================================
-- 7. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Chi nhánh
(NEWID(), N'WA_ShiftListCNFrm', N'001', N'BranchID', N'Chi nhánh', 1, 'API_DanhSachChiNhanh', 'BranchID', 'BranchName', 0, 4, NULL);
GO

-- =========================================================================
-- 8. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '7019',
    '70',
    N'Danh mục Ca làm việc chi nhánh',
    'Danh mục Ca làm việc chi nhánh',
    'WA_ShiftListCNFrm',
    '',
    '#/7019',
    'schedule',
    0
);
GO

PRINT 'Da thiet lap WA_ShiftListCNFrm (Danh mục Ca làm việc chi nhánh) voi MenuID 7019 thanh cong!';
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


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_TimeSheetFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetFrm';
GO

-- Xóa bỏ View ảo cũ nếu đã lỡ tạo để dọn dẹp hệ thống sạch sẽ
IF OBJECT_ID('dbo.v_WA_TimeSheetTbl', 'V') IS NOT NULL
    DROP VIEW dbo.v_WA_TimeSheetTbl;
GO

-- =========================================================================
-- 3. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl) - TRỎ DỮ LIỆU VỀ BẢNG GỐC HR_TimeSheetTbl
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_TimeSheetFrm', N'EDIT', N'Chấm công tổng hợp tháng', N'Monthly Timesheet Summary', N'HR_TimeSheetTbl', N'UserAutoID', N'月度报时');
GO

-- =========================================================================
-- 4. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetFrm', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetFrm', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 5. CẤU HÌNH CÁC BỘ LỌC VÀ NÚT TÍNH CÔNG (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(NEWID(), N'WA_TimeSheetFrm', N'0', N'PeriodID', N'Kỳ', 3, N'Select Distinct PeriodID from SY_Period order by PeriodID desc', N'PeriodID', N'PeriodID', 1, 4, NULL),

-- Bộ lọc Phòng ban
(NEWID(), N'WA_TimeSheetFrm', N'004', N'PhongBan', N'Phòng ban', 3, N'Select * from HR_DepartmentListTbl', N'PhongBan', N'PhongBan', 1, 4, NULL),

-- Nút "Tính công tháng" (Trực tiếp gọi SP HR_PayRoll_Process_Stp)
(NEWID(), N'WA_TimeSheetFrm', N'900', N'PersonID', N'Tính công tháng', 16, N'HR_PayRoll_Process_Stp ''{1}''', NULL, NULL, 1, 4, NULL);
GO

-- =========================================================================
-- 6. CẤU HÌNH ĐỊNH VỊ CỘT TRONG GRID (SY_FormatFields)
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
('WA_TimeSheetFrm', 'UserAutoID', N'UserAutoID', 'UserAutoID', 't', 0, 'grid', 0, 0, 1, 1, 1, 0),
('WA_TimeSheetFrm', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 1, 1, 1, 1, 2, 1),
('WA_TimeSheetFrm', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 1, 1, 3, 1),
('WA_TimeSheetFrm', 'PersonName', N'Họ Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 4, 1),
('WA_TimeSheetFrm', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 1, 1, 0, 0, 5, 1),
('WA_TimeSheetFrm', 'DocumentDate', N'Ngày', 'Date', 'd', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetFrm', 'SoNgayThang', N'Tổng ngày công trong tháng', 'Total Month Days', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetFrm', 'SoNgayDiLam', N'Số ngày đi làm', 'Actual Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetFrm', 'SoNgayLe', N'SoNgayLe', 'Holiday Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetFrm', 'TangCa', N'Tăng ca', 'Overtime', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetFrm', 'SoNgayCongTac', N'Số ngày công tác', 'Business Trip Days', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetFrm', 'CongPhep', N'Cộng phép', 'Add Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetFrm', 'NghiPhep', N'Nghỉ phép', 'Paid Leave', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetFrm', 'NghiKhongPhep', N'Nghỉ không phép', 'Unpaid Leave', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetFrm', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 15, 0);
GO

-- Kích hoạt bộ lọc nhanh cho các cột trên Giao diện Web cho WA_TimeSheetFrm
UPDATE dbo.SY_FormatFields 
SET ShowInFilter = 1,
    FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 'sl' 
        ELSE FormatID 
    END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period' 
        ELSE DataSource 
    END
WHERE FormName = 'WA_TimeSheetFrm' 
  AND FieldName IN ('PeriodID');
GO

-- =========================================================================
-- 7. CẤU HÌNH DROPDOWN TRONG GRID (SY_FrmDrdwTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmDrdwTbl 
    ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [Source], [DisableAddNew], [IsDisable])  
VALUES 
(NEWID(), N'WA_TimeSheetFrm', NULL, N'PersonID', N'PersonID', N'PersonID', N'PersonID;PersonName;PhongBan', N'Select * from HR_PersonTbl', 1, 0);
GO

-- =========================================================================
-- 8. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- 8.1. API View: Truy vấn dữ liệu qua Stored Procedure API_BangChamCongTongHop mới tạo
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetFrm', 'View', 'API_BangChamCongTongHop', '@Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');

-- 8.2. API Execute: Cho nút bấm "Tính công tháng"
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetFrm', 'HR_PayRoll_Process_Stp', 'HR_PayRoll_Process_Stp', '@PeriodID=N''{PeriodID}''');
GO

PRINT 'Da tao cau hinh WA_TimeSheetFrm su dung Stored Procedure API_BangChamCongTongHop thanh cong!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ NẾU CÓ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetReport';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetReport';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetReport';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ BÁO CÁO MỚI (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetReport',
    'EDIT',
    N'Báo cáo chấm công tổng hợp',
    'Timesheet Summary Report',
    'HR_TimeSheetTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetReport', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetReport', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 4. KHỞI TẠO CẤU HÌNH CỘT GIAO DIỆN (SY_FormatFields) BẰNG LỆNH INSERT
-- Thể hiện chính xác thứ tự cột (OrderNo) như giao diện phần mềm Desktop
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
-- Các thông tin nhân viên cơ bản
('WA_TimeSheetReport', 'STT', N'STT', 'No.', 't', 0, 'grid', 1, 1, 0, 0, 1, 0),
('WA_TimeSheetReport', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 0, 0, 2, 1),
('WA_TimeSheetReport', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 3, 1),
('WA_TimeSheetReport', 'ChucDanh', N'Chức danh chuyên môn', 'Title', 't', 0, 'grid', 1, 1, 0, 0, 4, 0),

-- Cột tổng hợp phép & ngày công
('WA_TimeSheetReport', 'TongCong', N'Tổng cộng', 'Total Days', 'n', 0, 'grid', 1, 1, 0, 0, 5, 0),
('WA_TimeSheetReport', 'SoNgayCongThang', N'Số ngày công tháng', 'Month Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetReport', 'TongNgayDiLam', N'Tổng ngày đi làm', 'Total Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetReport', 'SoNgayPhepTet', N'Số ngày phép tết', 'Tet Leave', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetReport', 'PhepConLaiNam', N'Phép còn lại năm', 'Remaining Annual Leave', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetReport', 'PhepPhatSinh', N'Phép phát sinh', 'Accrued Leave', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetReport', 'HieuHi', N'Hiếu/Hỉ', 'Compassionate Leave', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetReport', 'PhepBuLe', N'Phép bù lễ', 'Compensatory Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetReport', 'PhepSuDungTrongThang', N'Phép sử dụng trong tháng', 'Leave Used in Month', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetReport', 'PhepDaDungLuyKe', N'Phép đã dùng lũy kế', 'Cumulative Leave Used', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetReport', 'TonPhepHienTai', N'Tồn phép hiện tại', 'Current Leave Balance', 'n', 0, 'grid', 1, 1, 0, 0, 15, 0),
('WA_TimeSheetReport', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 16, 0),

-- Các cột bổ sung
('WA_TimeSheetReport', 'ThangTitle', N'Kỳ báo cáo', 'Month Title', 't', 0, 'grid', 1, 1, 0, 0, 17, 0),
('WA_TimeSheetReport', 'SoNgayLe', N'Ngày công lễ', 'Holiday Days', 'n', 0, 'grid', 1, 1, 0, 0, 18, 0),

-- Chi tiết các ngày từ 1 đến 31
('WA_TimeSheetReport', '1', N'1', '1', 't', 0, 'grid', 1, 1, 0, 0, 19, 0),
('WA_TimeSheetReport', '2', N'2', '2', 't', 0, 'grid', 1, 1, 0, 0, 20, 0),
('WA_TimeSheetReport', '3', N'3', '3', 't', 0, 'grid', 1, 1, 0, 0, 21, 0),
('WA_TimeSheetReport', '4', N'4', '4', 't', 0, 'grid', 1, 1, 0, 0, 22, 0),
('WA_TimeSheetReport', '5', N'5', '5', 't', 0, 'grid', 1, 1, 0, 0, 23, 0),
('WA_TimeSheetReport', '6', N'6', '6', 't', 0, 'grid', 1, 1, 0, 0, 24, 0),
('WA_TimeSheetReport', '7', N'7', '7', 't', 0, 'grid', 1, 1, 0, 0, 25, 0),
('WA_TimeSheetReport', '8', N'8', '8', 't', 0, 'grid', 1, 1, 0, 0, 26, 0),
('WA_TimeSheetReport', '9', N'9', '9', 't', 0, 'grid', 1, 1, 0, 0, 27, 0),
('WA_TimeSheetReport', '10', N'10', '10', 't', 0, 'grid', 1, 1, 0, 0, 28, 0),
('WA_TimeSheetReport', '11', N'11', '11', 't', 0, 'grid', 1, 1, 0, 0, 29, 0),
('WA_TimeSheetReport', '12', N'12', '12', 't', 0, 'grid', 1, 1, 0, 0, 30, 0),
('WA_TimeSheetReport', '13', N'13', '13', 't', 0, 'grid', 1, 1, 0, 0, 31, 0),
('WA_TimeSheetReport', '14', N'14', '14', 't', 0, 'grid', 1, 1, 0, 0, 32, 0),
('WA_TimeSheetReport', '15', N'15', '15', 't', 0, 'grid', 1, 1, 0, 0, 33, 0),
('WA_TimeSheetReport', '16', N'16', '16', 't', 0, 'grid', 1, 1, 0, 0, 34, 0),
('WA_TimeSheetReport', '17', N'17', '17', 't', 0, 'grid', 1, 1, 0, 0, 35, 0),
('WA_TimeSheetReport', '18', N'18', '18', 't', 0, 'grid', 1, 1, 0, 0, 36, 0),
('WA_TimeSheetReport', '19', N'19', '19', 't', 0, 'grid', 1, 1, 0, 0, 37, 0),
('WA_TimeSheetReport', '20', N'20', '20', 't', 0, 'grid', 1, 1, 0, 0, 38, 0),
('WA_TimeSheetReport', '21', N'21', '21', 't', 0, 'grid', 1, 1, 0, 0, 39, 0),
('WA_TimeSheetReport', '22', N'22', '22', 't', 0, 'grid', 1, 1, 0, 0, 40, 0),
('WA_TimeSheetReport', '23', N'23', '23', 't', 0, 'grid', 1, 1, 0, 0, 41, 0),
('WA_TimeSheetReport', '24', N'24', '24', 't', 0, 'grid', 1, 1, 0, 0, 42, 0),
('WA_TimeSheetReport', '25', N'25', '25', 't', 0, 'grid', 1, 1, 0, 0, 43, 0),
('WA_TimeSheetReport', '26', N'26', '26', 't', 0, 'grid', 1, 1, 0, 0, 44, 0),
('WA_TimeSheetReport', '27', N'27', '27', 't', 0, 'grid', 1, 1, 0, 0, 45, 0),
('WA_TimeSheetReport', '28', N'28', '28', 't', 0, 'grid', 1, 1, 0, 0, 46, 0),
('WA_TimeSheetReport', '29', N'29', '29', 't', 0, 'grid', 1, 1, 0, 0, 47, 0),
('WA_TimeSheetReport', '30', N'30', '30', 't', 0, 'grid', 1, 1, 0, 0, 48, 0),
('WA_TimeSheetReport', '31', N'31', '31', 't', 0, 'grid', 1, 1, 0, 0, 49, 0),

-- Cột lương khoán cuối cùng
('WA_TimeSheetReport', 'IsLuongKhoan', N'Lương khoán', 'Is Fixed Salary', 'b', 0, 'grid', 1, 1, 0, 0, 50, 0),
('WA_TimeSheetReport', 'SoTienKhoan', N'Số tiền khoán', 'Fixed Salary Amount', 'n', 0, 'grid', 1, 1, 0, 0, 51, 0),

-- Cột lọc ẩn/không hiển thị trên grid nhưng cần để bind filter
('WA_TimeSheetReport', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 0, 0, 0, 0, 100, 1),
('WA_TimeSheetReport', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 0, 0, 0, 0, 101, 1);
GO

-- =========================================================================
-- 5. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(
    NEWID(), N'WA_TimeSheetReport', N'0', N'PeriodID', N'Kỳ', 3, 
    N'Select Distinct PeriodID from SY_Period order by PeriodID desc', 
    N'PeriodID', N'PeriodID', 1, 4, NULL
),

-- Bộ lọc Phòng ban (PhongBan)
(
    NEWID(), N'WA_TimeSheetReport', N'001', N'PhongBan', N'Bộ phận', 3, 
    N'Select * from HR_DepartmentListTbl', 
    N'PhongBan', N'PhongBan', 1, 4, NULL
);
GO

-- =========================================================================
-- 6. THIẾT LẬP ĐỊNH TUYẾN GATEWAY (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetReport',
    'View',
    'API_BaoCaoChamCongTongHop', 
    '@PeriodID=''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}'''
);
GO

PRINT 'Da thiet lap cau hinh giup menu Bao Cao Cham Cong show full 62 cot chi tiet nhu Desktop App!';
GO


-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ NẾU CÓ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetTH2Report';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetTH2Report';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetTH2Report';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ BÁO CÁO MỚI (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetTH2Report',
    'EDIT',
    N'Báo cáo công tổng hợp',
    'Timesheet Model 2',
    'HR_TimeSheetTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetTH2Report', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetTH2Report', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 4. KHỞI TẠO CẤU HÌNH CỘT GIAO DIỆN (SY_FormatFields) BẰNG LỆNH INSERT
-- Thể hiện chính xác thứ tự cột (OrderNo) như giao diện phần mềm Desktop
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
-- Các thông tin nhân viên cơ bản
('WA_TimeSheetTH2Report', 'STT', N'STT', 'No.', 't', 0, 'grid', 1, 1, 0, 0, 1, 0),
('WA_TimeSheetTH2Report', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 0, 0, 2, 1),
('WA_TimeSheetTH2Report', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 3, 1),
('WA_TimeSheetTH2Report', 'ChucDanh', N'Chức danh chuyên môn', 'Title', 't', 0, 'grid', 1, 1, 0, 0, 4, 0),
('WA_TimeSheetTH2Report', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 0, 0, 0, 0, 5, 1),
-- Cột tổng hợp phép & ngày công
('WA_TimeSheetTH2Report', 'TongCong', N'Tổng cộng', 'Total Days', 'n', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetTH2Report', 'SoNgayCongThang', N'Số ngày công tháng', 'Month Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetTH2Report', 'TongNgayDiLam', N'Tổng ngày đi làm', 'Total Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetTH2Report', 'SoNgayPhepTet', N'Số ngày phép tết', 'Tet Leave', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetTH2Report', 'PhepConLaiNam', N'Phép còn lại năm', 'Remaining Annual Leave', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetTH2Report', 'PhepPhatSinh', N'Phép phát sinh', 'Accrued Leave', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetTH2Report', 'HieuHi', N'Hiếu/Hỉ', 'Compassionate Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetTH2Report', 'PhepBuLe', N'Phép bù lễ', 'Compensatory Leave', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetTH2Report', 'PhepSuDungTrongThang', N'Phép sử dụng trong tháng', 'Leave Used in Month', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetTH2Report', 'PhepDaDungLuyKe', N'Phép đã dùng lũy kế', 'Cumulative Leave Used', 'n', 0, 'grid', 1, 1, 0, 0, 15, 0),
('WA_TimeSheetTH2Report', 'TonPhepHienTai', N'Tồn phép hiện tại', 'Current Leave Balance', 'n', 0, 'grid', 1, 1, 0, 0, 16, 0),


-- Các cột bổ sung
('WA_TimeSheetTH2Report', 'ThangTitle', N'Kỳ báo cáo', 'Month Title', 't', 0, 'grid', 1, 1, 0, 0, 17, 0),
('WA_TimeSheetTH2Report', 'SoNgayLe', N'Ngày công lễ', 'Holiday Days', 'n', 0, 'grid', 1, 1, 0, 0, 18, 0),


-- Cột lương khoán cuối cùng
('WA_TimeSheetTH2Report', 'IsLuongKhoan', N'Lương khoán', 'Is Fixed Salary', 'b', 0, 'grid', 1, 1, 0, 0, 50, 0),
('WA_TimeSheetTH2Report', 'SoTienKhoan', N'Số tiền khoán', 'Fixed Salary Amount', 'n', 0, 'grid', 1, 1, 0, 0, 51, 0),

-- Cột lọc ẩn/không hiển thị trên grid nhưng cần để bind filter
('WA_TimeSheetTH2Report', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 0, 0, 0, 0, 100, 1),
('WA_TimeSheetTH2Report', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 101, 0);
GO

-- =========================================================================
-- 5. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(
    NEWID(), N'WA_TimeSheetTH2Report', N'0', N'PeriodID', N'Kỳ', 3, 
    N'Select Distinct PeriodID from SY_Period order by PeriodID desc', 
    N'PeriodID', N'PeriodID', 1, 4, NULL
),

-- Bộ lọc Phòng ban (PhongBan)
(
    NEWID(), N'WA_TimeSheetTH2Report', N'001', N'PhongBan', N'Bộ phận', 3, 
    N'Select * from HR_DepartmentListTbl', 
    N'PhongBan', N'PhongBan', 1, 4, NULL
);
GO

-- =========================================================================
-- 6. THIẾT LẬP ĐỊNH TUYẾN GATEWAY (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetTH2Report',
    'View',
    'API_BaoCaoChamCongTongHop', 
    '@PeriodID=''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}'''
);
GO

-- =========================================================================
-- 7. CẤU HÌNH DROPDOWN CHO BỘ LỌC (KỲ VÀ BỘ PHẬN)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET FormatID = 'sl',
    DataSource = 'SY_Period'
WHERE FormName = 'WA_TimeSheetTH2Report' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields
SET FormatID = 'sl',
    DataSource = 'HR_DepartmentListTbl'
WHERE FormName = 'WA_TimeSheetTH2Report' AND FieldName = 'PhongBan';
GO

-- ĐĂNG KÝ API VIEW CHO DANH SÁCH BỘ PHẬN NẾU CHƯA CÓ
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'HR_DepartmentListTbl' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('HR_DepartmentListTbl', 'View', 'API_DanhSachBoPhan', '@Keyword=N''{Keyword}''');
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_DanhSachBoPhan',
        Para = '@Keyword=N''{Keyword}'''
    WHERE list = 'HR_DepartmentListTbl' AND func = 'View';
END
GO

PRINT 'Da thiet lap cau hinh giup menu WA_TimeSheetTH2Report show full 62 cot chi tiet qua Store API_BaoCaoChamCongTongHop thanh cong!';
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


-- =========================================================================
-- 1. ĐĂNG KÝ CRUD CHO: Danh mục Ca Làm Việc (WA_ShiftListFrm)
-- Phù hợp với phiên bản stored procedure API_LuuDong và API_XoaDong mới
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ShiftListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ShiftListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT 'Da dang ky va cap nhat API [View, Save, Delete] cho form WA_ShiftListFrm!';
GO


-- =========================================================================
-- 2. ĐĂNG KÝ CRUD CHO: Danh mục Kỳ Lương (SY_Period)
-- =========================================================================
-- Đảm bảo có cả 'Edit' (tương thích ngược) và 'Save' (chuẩn Frontend DynamicFormEngine)
DELETE FROM dbo.WA_API WHERE list = 'SY_Period' AND func IN ('Save', 'Delete', 'Edit');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('SY_Period', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('SY_Period', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('SY_Period', 'Edit', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('SY_Period', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT 'Da dang ky va cap nhat API [View, Save, Edit, Delete] cho form SY_Period!';
GO

-- =========================================================================
-- 3. ĐỒNG BỘ LẠI PHÂN QUYỀN
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da hoan tat dang ky tat ca API CRUD dynamic!';
GO
DELETE FROM dbo.WA_API WHERE [list] = 'API_DoiMaNhanVien';
INSERT INTO dbo.WA_API ([list], [func], [sys], [StoredProcedure], [Para])
VALUES ('API_DoiMaNhanVien', 'Update', 1, 'API_DoiMaNhanVien', '@OldPersonID=N''{OldPersonID}'',@NewPersonID=N''{NewPersonID}''');
GO
-- 1. Đăng ký các Detail API làm danh sách (List) trong SY_FrmLstTbl
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (
    'API_PersonFull_T1_Salary',
    'API_PersonFull_T3_KTKL',
    'API_PersonFull_T4_NghiPhep',
    'API_PersonFull_T5_Relation',
    'API_PersonFull_T6_HopDong',
    'API_PersonFull_T7_CongTac',
    'API_PersonFull_T8_Log',
    'API_PersonFull_T9_GiayTo'
);

INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey])
VALUES 
    ('API_PersonFull_T1_Salary', 'LIST', N'Quá trình làm việc, lương và phụ cấp', 'Salary', 'HR_PersonSalaryTbl', 'UserAutoID'),
    ('API_PersonFull_T3_KTKL', 'LIST', N'Khen thưởng kỷ luật', 'KTKL', 'HR_PersonKTKLTbl', 'UserAutoID'),
    ('API_PersonFull_T4_NghiPhep', 'LIST', N'Nghỉ phép', 'Leave', 'HR_PersonNghiPhepTbl', 'UserAutoID'),
    ('API_PersonFull_T5_Relation', 'LIST', N'Gia cảnh', 'Relation', 'HR_PersonRelationTbl', 'UserAutoID'),
    ('API_PersonFull_T6_HopDong', 'LIST', N'Hợp đồng', 'Contract', 'HR_HopDongTbl', 'MaHopDong'),
    ('API_PersonFull_T7_CongTac', 'LIST', N'Công tác', 'Work history', 'HR_LichSuCongTacTbl', 'UserAutoID'),
    ('API_PersonFull_T8_Log', 'LIST', N'Log', 'Log', 'HR_LichSuCongViecTbl', 'UserAutoID'),
    ('API_PersonFull_T9_GiayTo', 'LIST', N'Giấy tờ', 'Document', 'HR_GiayToTbl', 'UserAutoID');

-- 2. Đăng ký Save/Delete trong WA_API
DELETE FROM dbo.WA_API WHERE list LIKE 'API_PersonFull_T%' AND func IN ('Save', 'Delete');

INSERT INTO dbo.WA_API (list, func, [SQL], Para) 
VALUES 
    ('WA_PersonFullFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('WA_PersonFullFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T1_Salary', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T1_Salary', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T3_KTKL', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T3_KTKL', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T4_NghiPhep', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T4_NghiPhep', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T5_Relation', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T5_Relation', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T6_HopDong', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T6_HopDong', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T7_CongTac', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T7_CongTac', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T8_Log', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T8_Log', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T9_GiayTo', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T9_GiayTo', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' );

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'CF_BranchListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'CF_BranchListFrm',
    'EDIT',
    N'Danh mục Chi nhánh',
    'Branch List',
    'CF_BranchTbl',
    'BranchID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'CF_BranchListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('CF_BranchListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('CF_BranchListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('CF_BranchListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'CF_BranchListFrm', @ObjectName = 'CF_BranchTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã chi nhánh', CaptionEN = 'Branch ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên chi nhánh', CaptionEN = 'Branch Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form CF_BranchListFrm (Danh muc Chi nhanh)!';
GO


PRINT '========================================================================';
PRINT 'BAT DAU DANG KY TOAN BO 12 DANH MUC CUOI CUNG CON LAI';
PRINT '========================================================================';
GO

-- =========================================================================
-- 1. WA_BankListFrm (Ngân hàng)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BankListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BankListFrm', 'EDIT', N'Danh mục Ngân hàng', 'Bank List', 'HR_BankListTbl', 'BankName');

DELETE FROM dbo.WA_API WHERE list = 'WA_BankListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BankListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BankListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BankListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BankListFrm', @ObjectName = 'HR_BankListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên ngân hàng', CaptionEN = 'Bank Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'BankName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa chỉ chi nhánh', CaptionEN = 'Address', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'Address';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_BankListFrm (Danh muc Ngan hang)';
GO

-- =========================================================================
-- 2. WA_NationListFrm (Quốc gia)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_NationListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_NationListFrm', 'EDIT', N'Danh mục Quốc gia', 'Nation List', 'HR_NationListTbl', 'NationName');

DELETE FROM dbo.WA_API WHERE list = 'WA_NationListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_NationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_NationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_NationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_NationListFrm', @ObjectName = 'HR_NationListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên quốc gia', CaptionEN = 'Nation Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'NationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'isDefault';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_NationListFrm (Danh muc Quoc gia)';
GO

-- =========================================================================
-- 3. WA_ProvinceListFrm (Tỉnh thành)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ProvinceListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_ProvinceListFrm', 'EDIT', N'Danh mục Tỉnh thành', 'Province List', 'HR_ProvineListTbl', 'ProvineName');

DELETE FROM dbo.WA_API WHERE list = 'WA_ProvinceListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ProvinceListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ProvinceListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ProvinceListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ProvinceListFrm', @ObjectName = 'HR_ProvineListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên tỉnh / thành', CaptionEN = 'Province Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Quận / huyện / TX', CaptionEN = 'Township', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_ProvinceListFrm (Danh muc Tinh thanh)';
GO

-- =========================================================================
-- 4. WA_PeopleListFrm (Dân tộc)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_PeopleListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_PeopleListFrm', 'EDIT', N'Danh mục Dân tộc', 'People List', 'HR_PeoplesListTbl', 'PeoplesName');

DELETE FROM dbo.WA_API WHERE list = 'WA_PeopleListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PeopleListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_PeopleListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PeopleListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_PeopleListFrm', @ObjectName = 'HR_PeoplesListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên dân tộc', CaptionEN = 'Ethnicity Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên khác', CaptionEN = 'Alternative Name', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName2';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa bàn cư trú', CaptionEN = 'Primary Region', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesPlace';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'isDefault';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_PeopleListFrm (Danh muc Dan toc)';
GO

-- =========================================================================
-- 5. WA_ReligionListFrm (Tôn giáo)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ReligionListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_ReligionListFrm', 'EDIT', N'Danh mục Tôn giáo', 'Religion List', 'HR_ReligionListTbl', 'ReligionName');

DELETE FROM dbo.WA_API WHERE list = 'WA_ReligionListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ReligionListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ReligionListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ReligionListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ReligionListFrm', @ObjectName = 'HR_ReligionListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên tôn giáo', CaptionEN = 'Religion Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'ReligionName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_ReligionListFrm (Danh muc Ton giao)';
GO

-- =========================================================================
-- 6. WA_EducationListFrm (Học vấn)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_EducationListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_EducationListFrm', 'EDIT', N'Danh mục Học vấn', 'Education List', 'HR_EducationListTbl', 'EducationName');

DELETE FROM dbo.WA_API WHERE list = 'WA_EducationListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_EducationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_EducationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_EducationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_EducationListFrm', @ObjectName = 'HR_EducationListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Trình độ học vấn', CaptionEN = 'Education Level', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'EducationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_EducationListFrm (Danh muc Hoc van)';
GO

-- =========================================================================
-- 7. WA_BangCapListFrm (Bằng cấp)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangCapListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangCapListFrm', 'EDIT', N'Danh mục Bằng cấp', 'Certificate List', 'HR_BangCapTbl', 'MaBangCap');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangCapListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangCapListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangCapListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangCapListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangCapListFrm', @ObjectName = 'HR_BangCapTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã bằng cấp', CaptionEN = 'Certificate ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên bằng cấp', CaptionEN = 'Certificate Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'TenBangCap';
GO
PRINT '--> Da dang ky WA_BangCapListFrm (Danh muc Bang cap)';
GO

-- =========================================================================
-- 8. WA_CareerlListFrm (Nghề nghiệp)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_CareerlListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_CareerlListFrm', 'EDIT', N'Danh mục Nghề nghiệp', 'Career List', 'HR_CareerListTbl', 'CareerName');

DELETE FROM dbo.WA_API WHERE list = 'WA_CareerlListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_CareerlListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_CareerlListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_CareerlListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_CareerlListFrm', @ObjectName = 'HR_CareerListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngành nghề / Nghề nghiệp', CaptionEN = 'Career Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'CareerName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_CareerlListFrm (Danh muc Nghe nghiep)';
GO

-- =========================================================================
-- 9. WA_HinhThucNghiListFrm (Hình thức nghỉ)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HinhThucNghiListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_HinhThucNghiListFrm', 'EDIT', N'Danh mục Hình thức nghỉ', 'Leave Type List', 'HR_HinhThucNghiListTbl', 'HinhThucNghi');

DELETE FROM dbo.WA_API WHERE list = 'WA_HinhThucNghiListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HinhThucNghiListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HinhThucNghiListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HinhThucNghiListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HinhThucNghiListFrm', @ObjectName = 'HR_HinhThucNghiListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã hình thức nghỉ', CaptionEN = 'Leave Type Code', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên hình thức nghỉ', CaptionEN = 'Leave Type Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Có hưởng lương', CaptionEN = 'With Pay', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO
PRINT '--> Da dang ky WA_HinhThucNghiListFrm (Danh muc Hinh thuc nghi)';
GO

-- =========================================================================
-- 10. CF_BranchListFrm (Chi nhánh)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'CF_BranchListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('CF_BranchListFrm', 'EDIT', N'Danh mục Chi nhánh', 'Branch List', 'CF_BranchTbl', 'BranchID');

DELETE FROM dbo.WA_API WHERE list = 'CF_BranchListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('CF_BranchListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('CF_BranchListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('CF_BranchListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'CF_BranchListFrm', @ObjectName = 'CF_BranchTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã chi nhánh', CaptionEN = 'Branch ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên chi nhánh', CaptionEN = 'Branch Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO
PRINT '--> Da dang ky CF_BranchListFrm (Danh muc Chi nhanh)';
GO

-- =========================================================================
-- 11. WA_BangThueTNCNFrm (Bảng thuế TNCN)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThueTNCNFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangThueTNCNFrm', 'EDIT', N'Bảng mức thuế TNCN', 'PIT Tax Bracket', 'HR_BangThueTNCNTbl', 'Bac');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangThueTNCNFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThueTNCNFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThueTNCNFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThueTNCNFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThueTNCNFrm', @ObjectName = 'HR_BangThueTNCNTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Bậc', CaptionEN = 'Level', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Bac';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Từ', CaptionEN = 'From', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Tu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Đến', CaptionEN = 'To', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Den';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Thuế suất (%)', CaptionEN = 'Tax Rate (%)', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'ThueSuat';
GO
PRINT '--> Da dang ky WA_BangThueTNCNFrm (Bang thue TNCN)';
GO

-- =========================================================================
-- 12. WA_BangThamSoFrm (Bảng tham số tính lương)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThamSoFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangThamSoFrm', 'EDIT', N'Bảng tham số tính lương', 'Payroll Insurance Parameters', 'HR_BangThamSoTbl', 'UserAutoID');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangThamSoFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThamSoFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThamSoFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThamSoFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThamSoFrm', @ObjectName = 'HR_BangThamSoTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Kỳ', CaptionEN = 'Period', FormatID = 't', DataSource = 'SY_Period', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'PeriodID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Loại bảo hiểm', CaptionEN = 'Insurance Type', FormatID = 'sl', DataSource = N'STATIC:NVN|Trong nước,NNN|Nước ngoài', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'LoaiBaoHiem';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHXH NLĐ (%)', CaptionEN = 'SI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHXH Cty (%)', CaptionEN = 'SI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHCTY';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHYT NLĐ (%)', CaptionEN = 'HI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHYT Cty (%)', CaptionEN = 'HI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTCTY';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHTN NLĐ (%)', CaptionEN = 'UI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHTN Cty (%)', CaptionEN = 'UI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 8 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNCTY';
GO
PRINT '--> Da dang ky WA_BangThamSoFrm (Bang tham so tinh luong)';
GO

-- =========================================================================
-- ĐỒNG BỘ PHÂN QUYỀN TOÀN CỤC CHO TẤT CẢ CÁC FORM MỚI
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT '========================================================================';
PRINT 'DA DANG KY THANH CONG TOAN BO DANG KY CHO 12 DANH MUC TRENE!';
PRINT '========================================================================';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM SY_Period TRONG SY_FrmLstTbl
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = 'SY_Period')
BEGIN
    INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
    VALUES ('SY_Period', 'EDIT', N'Kỳ lương', 'Payroll Period', 'SY_Period', 'PeriodID');
    PRINT 'Da dang ky SY_Period vao SY_FrmLstTbl';
END
ELSE
BEGIN
    UPDATE dbo.SY_FrmLstTbl
    SET TableName = 'SY_Period', PrimaryKey = 'PeriodID'
    WHERE FormID = 'SY_Period';
    PRINT 'Da cap nhat SY_Period trong SY_FrmLstTbl';
END
GO

-- =========================================================================
-- 2. ĐĂNG KÝ API VIEW (TRA CỨU) CHO SY_Period QUA API_TruyVanDong
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'SY_Period' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('SY_Period', 'View', 'API_TruyVanDong', '@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''');
    PRINT 'Da dang ky API SY_Period [View]';
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_TruyVanDong', Para = '@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}'''
    WHERE list = 'SY_Period' AND func = 'View';
    PRINT 'Da cap nhat API SY_Period [View]';
END
GO

-- =========================================================================
-- 3. ĐĂNG KÝ API EDIT (CẬP NHẬT/LƯU KHÓA KỲ) CHO SY_Period QUA API_LuuDong
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'SY_Period' AND func = 'Edit')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('SY_Period', 'Edit', 'API_LuuDong', '@List=''{List}'', @Data=N''{JsonData}''');
    PRINT 'Da dang ky API SY_Period [Edit]';
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_LuuDong', Para = '@List=''{List}'', @Data=N''{JsonData}'''
    WHERE list = 'SY_Period' AND func = 'Edit';
    PRINT 'Da cap nhat API SY_Period [Edit]';
END
GO

-- Đồng bộ lại phân quyền truy cập
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da hoan tat dang ky SY_Period API!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangCapListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangCapListFrm',
    'EDIT',
    N'Danh mục Bằng cấp',
    'Certificate List',
    'HR_BangCapTbl',
    'MaBangCap'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangCapListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangCapListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangCapListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangCapListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangCapListFrm', @ObjectName = 'HR_BangCapTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã bằng cấp', CaptionEN = 'Certificate ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên bằng cấp', CaptionEN = 'Certificate Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'TenBangCap';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangCapListFrm (Danh muc Bang cap)!';
GO


-- =========================================================================
-- 1. REGISTER CRUD FOR MASTER FORM (WA_BangPhuCapFrm)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangPhuCapFrm' AND func IN ('Save', 'Delete');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangPhuCapFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangPhuCapFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 2. REGISTER DROPDOWN API FOR EMPLOYEE LOOKUP (HR_PersonTbl)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'HR_PersonTbl' AND func = 'View';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('HR_PersonTbl', 'View', 'API_HoSoNhanVien', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 3. REGISTER TABLE AND CRUD FOR DETAIL TAB (API_BangPhuCap_Detail)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_BangPhuCap_Detail';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_BangPhuCap_Detail', 'LIST', N'Nhân viên hưởng phụ cấp', 'Employees receiving allowance', 'HR_PersonAllowanceTbl', 'UserAutoID');
GO

DELETE FROM dbo.WA_API WHERE list = 'API_BangPhuCap_Detail' AND func IN ('Save', 'Delete');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_BangPhuCap_Detail', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_BangPhuCap_Detail', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 4. SYNCHRONIZE ACCESS PERMISSIONS
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Successfully configured WA_BangPhuCapFrm CRUD, HR_PersonTbl, and API_BangPhuCap_Detail CRUD!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThamSoFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangThamSoFrm',
    'EDIT',
    N'Bảng tham số tính lương',
    'Payroll Insurance Parameters',
    'HR_BangThamSoTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThamSoFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThamSoFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThamSoFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThamSoFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThamSoFrm', @ObjectName = 'HR_BangThamSoTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Kỳ', CaptionEN = 'Period', FormatID = 't', DataSource = 'SY_Period', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Loại bảo hiểm', CaptionEN = 'Insurance Type', FormatID = 'sl', DataSource = N'STATIC:NVN|Trong nước,NNN|Nước ngoài', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'LoaiBaoHiem';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHXH NLĐ (%)', CaptionEN = 'SI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHXH Cty (%)', CaptionEN = 'SI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHCTY';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHYT NLĐ (%)', CaptionEN = 'HI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHYT Cty (%)', CaptionEN = 'HI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTCTY';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHTN NLĐ (%)', CaptionEN = 'UI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHTN Cty (%)', CaptionEN = 'UI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 8 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNCTY';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangThamSoFrm (Bang tham so tinh luong)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThueTNCNFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangThueTNCNFrm',
    'EDIT',
    N'Bảng mức thuế TNCN',
    'PIT Tax Bracket',
    'HR_BangThueTNCNTbl',
    'Bac'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThueTNCNFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThueTNCNFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThueTNCNFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThueTNCNFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThueTNCNFrm', @ObjectName = 'HR_BangThueTNCNTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Bậc', CaptionEN = 'Level', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Bac';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Từ', CaptionEN = 'From', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Tu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Đến', CaptionEN = 'To', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Den';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Thuế suất (%)', CaptionEN = 'Tax Rate (%)', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'ThueSuat';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangThueTNCNFrm (Bang muc thue TNCN)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BankListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BankListFrm',
    'EDIT',
    N'Danh mục Ngân hàng',
    'Bank List',
    'HR_BankListTbl',
    'BankName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BankListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BankListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BankListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BankListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BankListFrm', @ObjectName = 'HR_BankListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên ngân hàng', CaptionEN = 'Bank Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BankListFrm' AND FieldName = 'BankName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Địa chỉ chi nhánh', CaptionEN = 'Address', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BankListFrm' AND FieldName = 'Address';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_BankListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_BankListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BankListFrm (Danh muc Ngan hang)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_CareerlListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_CareerlListFrm',
    'EDIT',
    N'Danh mục Nghề nghiệp',
    'Career List',
    'HR_CareerListTbl',
    'CareerName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_CareerlListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_CareerlListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_CareerlListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_CareerlListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_CareerlListFrm', @ObjectName = 'HR_CareerListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ngành nghề / Nghề nghiệp', CaptionEN = 'Career Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'CareerName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_CareerlListFrm (Danh muc Nghe nghiep)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_DepartmentListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_DepartmentListFrm',
    'EDIT',
    N'Danh mục Phòng ban',
    'Department List',
    'HR_DepartmentListTbl',
    'PhongBan'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_DepartmentListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_DepartmentListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_DepartmentListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_DepartmentListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_DepartmentListFrm', @ObjectName = 'HR_DepartmentListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã phòng ban', CaptionEN = 'Department ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_DepartmentListFrm' AND FieldName = 'PhongBan';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên phòng ban', CaptionEN = 'Department Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_DepartmentListFrm' AND FieldName = 'TenPhongBan';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_DepartmentListFrm (Danh muc Phong ban)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_EducationListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_EducationListFrm',
    'EDIT',
    N'Danh mục Học vấn',
    'Education List',
    'HR_EducationListTbl',
    'EducationName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_EducationListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_EducationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_EducationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_EducationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_EducationListFrm', @ObjectName = 'HR_EducationListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Trình độ học vấn', CaptionEN = 'Education Level', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'EducationName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_EducationListFrm (Danh muc Hoc van)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HinhThucNghiListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_HinhThucNghiListFrm',
    'EDIT',
    N'Danh mục Hình thức nghỉ',
    'Leave Type List',
    'HR_HinhThucNghiListTbl',
    'HinhThucNghi'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_HinhThucNghiListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HinhThucNghiListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HinhThucNghiListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HinhThucNghiListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HinhThucNghiListFrm', @ObjectName = 'HR_HinhThucNghiListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã hình thức nghỉ', CaptionEN = 'Leave Type Code', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên hình thức nghỉ', CaptionEN = 'Leave Type Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Có hưởng lương', CaptionEN = 'With Pay', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_HinhThucNghiListFrm (Danh muc Hinh thuc nghi)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HospitalListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_HospitalListFrm',
    'EDIT',
    N'Danh mục Bệnh viện',
    'Hospital List',
    'HR_HospitalListTbl',
    'HospitalName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_HospitalListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HospitalListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HospitalListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HospitalListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HospitalListFrm', @ObjectName = 'HR_HospitalListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên bệnh viện', CaptionEN = 'Hospital Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'HospitalName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Địa chỉ', CaptionEN = 'Address', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'Address';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_HospitalListFrm (Danh muc Binh vien)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_JobListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_JobListFrm',
    'EDIT',
    N'Danh mục Công việc',
    'Job List',
    'HR_JobListTbl',
    'JobName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_JobListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_JobListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_JobListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_JobListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_JobListFrm', @ObjectName = 'HR_JobListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên công việc', CaptionEN = 'Job Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_JobListFrm' AND FieldName = 'JobName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_JobListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_JobListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_JobListFrm (Danh muc Cong viec)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_NationListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_NationListFrm',
    'EDIT',
    N'Danh mục Quốc gia',
    'Nation List',
    'HR_NationListTbl',
    'NationName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_NationListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_NationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_NationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_NationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_NationListFrm', @ObjectName = 'HR_NationListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên quốc gia', CaptionEN = 'Nation Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_NationListFrm' AND FieldName = 'NationName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_NationListFrm' AND FieldName = 'isDefault';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_NationListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_NationListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_NationListFrm (Danh muc Quoc gia)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_PeopleListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_PeopleListFrm',
    'EDIT',
    N'Danh mục Dân tộc',
    'People List',
    'HR_PeoplesListTbl',
    'PeoplesName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_PeopleListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PeopleListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_PeopleListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PeopleListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_PeopleListFrm', @ObjectName = 'HR_PeoplesListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên dân tộc', CaptionEN = 'Ethnicity Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên khác', CaptionEN = 'Alternative Name', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName2';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Địa bàn cư trú', CaptionEN = 'Primary Region', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesPlace';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'isDefault';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 
WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_PeopleListFrm (Danh muc Dan toc)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_PositionListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_PositionListFrm',
    'EDIT',
    N'Danh mục Vị trí',
    'Job Position List',
    'HR_PostionListTbl',
    'PostionName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_PositionListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PositionListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_PositionListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PositionListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_PositionListFrm', @ObjectName = 'HR_PostionListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên vị trí', CaptionEN = 'Position Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_PositionListFrm' AND FieldName = 'PostionName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_PositionListFrm' AND FieldName = 'GhiChu';

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_PositionListFrm (Danh muc Vi tri)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ProvinceListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_ProvinceListFrm',
    'EDIT',
    N'Danh mục Tỉnh thành',
    'Province List',
    'HR_ProvineListTbl',
    'ProvineName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ProvinceListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ProvinceListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ProvinceListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ProvinceListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ProvinceListFrm', @ObjectName = 'HR_ProvineListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên tỉnh / thành', CaptionEN = 'Province Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Quận / huyện / TX', CaptionEN = 'Township', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_ProvinceListFrm (Danh muc Tinh thanh)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ReligionListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_ReligionListFrm',
    'EDIT',
    N'Danh mục Tôn giáo',
    'Religion List',
    'HR_ReligionListTbl',
    'ReligionName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ReligionListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ReligionListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ReligionListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ReligionListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ReligionListFrm', @ObjectName = 'HR_ReligionListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên tôn giáo', CaptionEN = 'Religion Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'ReligionName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_ReligionListFrm (Danh muc Ton giao)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_ShiftListFrm',
    'EDIT',
    N'Danh mục Ca làm việc',
    'Shift List',
    'HR_ShiftListTbl',
    'ShiftID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ShiftListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ShiftListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ShiftListFrm', @ObjectName = 'HR_ShiftListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã ca', CaptionEN = 'Shift ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên ca', CaptionEN = 'Shift Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ bắt đầu', CaptionEN = 'Start Time', FormatID = 'tm', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioBatDau';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ kết thúc', CaptionEN = 'End Time', FormatID = 'tm', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioKetThuc';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số giờ công', CaptionEN = 'Work Hours', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoGioCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ ca đêm', CaptionEN = 'Night Shift Hours', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioCaDem';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Index', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'STT';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ca tự động', CaptionEN = 'Auto Shift', FormatID = 'sw', IsRequired = 1, FormPosition = 'grid', OrderNo = 8 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CaTuDong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Loại ca', CaptionEN = 'Shift Type', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 9 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftType';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Cách chấm công', CaptionEN = 'Timekeeping Method', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 10 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CachChamCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Màu hiển thị', CaptionEN = 'Display Color', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 11 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'Color';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số công', CaptionEN = 'Shift Weight', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 12 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoCong';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_ShiftListFrm (Danh muc Ca lam viec)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TitleListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TitleListFrm',
    'EDIT',
    N'Danh mục Chức vụ',
    'Job Title List',
    'HR_TitleListTbl',
    'TitleName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_TitleListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_TitleListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_TitleListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_TitleListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_TitleListFrm', @ObjectName = 'HR_TitleListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên chức vụ', CaptionEN = 'Title Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_TitleListFrm' AND FieldName = 'TitleName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_TitleListFrm' AND FieldName = 'GhiChu';
-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_TitleListFrm (Danh muc Chuc vu)!';
GO


-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_WorkingGroupListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_WorkingGroupListFrm',
    'EDIT',
    N'Danh mục Tổ nhóm',
    'Working Group List',
    'HR_WorkingGroupListTbl',
    'WorkingGroupName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_WorkingGroupListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_WorkingGroupListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_WorkingGroupListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_WorkingGroupListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_WorkingGroupListFrm', @ObjectName = 'HR_WorkingGroupListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên tổ nhóm', CaptionEN = 'Working Group Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'WorkingGroupName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_WorkingGroupListFrm (Danh muc To nhom)!';
GO
