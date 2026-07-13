-- =========================================================================
-- SCRIPT KHỞI TẠO CẤU HÌNH WEB CHO DANH MỤC CHỨC DANH (WA_ChucDanhFrm)
-- =========================================================================

-- 1. DỌN DẸP CẤU HÌNH CŨ
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_ChucDanhFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ChucDanhFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_ChucDanhFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_ChucDanhFrm';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_ChucDanhFrm';
GO

-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_ChucDanhFrm', N'LIST', N'Danh mục chức danh', N'Danh mục chức danh', N'HR_ChucDanhTbl', N'ChucDanhChuyenMon', N'Danh mục chức danh');
GO

-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ChucDanhFrm', 'View',   'API_DanhSachChucDanh', '@Keyword=N''{Keyword}'''),
('WA_ChucDanhFrm', 'Save',   'API_LuuDong',       '@List=N''WA_ChucDanhFrm'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ChucDanhFrm', 'Delete', 'API_XoaDong',       '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_DanhSachChucDanh)
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ChucDanhFrm',
    @ObjectName = 'API_DanhSachChucDanh';
GO

-- 5. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        WHEN 'MoTa' THEN N'Mô tả'
        ELSE CaptionVN
    END,
    ShowInAdd = 1,
    ShowInEdit = 1
WHERE FormName = 'WA_ChucDanhFrm';
GO

-- 6. MENU 
IF NOT EXISTS(SELECT * FROM WA_Menu WHERE FormName = N'WA_ChucDanhFrm') 
BEGIN
    INSERT INTO [WA_Menu] ([MenuID], [VN], [EN], [FormName], [Parent], [URLPara], [isDisable])  
    VALUES(N'2352', N'Danh mục chức danh', N'Danh mục chức danh', N'WA_ChucDanhFrm', N'23', '#/2352', 0);
END
ELSE
BEGIN
    UPDATE [WA_Menu]  
    SET [VN] = N'Danh mục chức danh', [EN] = N'Danh mục chức danh', [Parent] = N'23', [URLPara] = '#/2352' 
    WHERE FormName = 'WA_ChucDanhFrm';
END
GO
