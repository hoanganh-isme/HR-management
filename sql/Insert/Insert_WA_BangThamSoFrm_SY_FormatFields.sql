USE [X26DIMTUTAC]
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
    ShowInFilter = CASE WHEN FieldName = 'PeriodID' THEN 1 ELSE 0 END,
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
