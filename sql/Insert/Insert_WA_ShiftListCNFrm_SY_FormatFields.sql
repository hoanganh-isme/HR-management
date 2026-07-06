USE [X26DIMTUTAC]
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
