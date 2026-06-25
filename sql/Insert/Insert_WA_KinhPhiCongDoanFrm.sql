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
