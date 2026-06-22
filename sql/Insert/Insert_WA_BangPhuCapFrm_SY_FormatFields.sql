USE [X26DIMTUTAC]
GO

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
    IsRequired = CASE WHEN FieldName IN ('MaPhuCap', 'TenPhuCap') THEN 1 ELSE 0 END,
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
