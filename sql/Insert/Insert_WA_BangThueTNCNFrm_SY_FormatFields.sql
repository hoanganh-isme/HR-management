USE [X26DIMTUTAC]
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
