
-- Script chỉ chứa Insert cấu hình UI, phần API đã được chuyển sang thư mục API/APINEW


-- =========================================================================
-- 2. BỔ SUNG CỘT ẨN DÙNG CHO BỘ LỌC (SY_FormatFields)
-- Do SP chỉ trả về data lưới, các tham số đầu vào cần phải được insert thủ công
-- =========================================================================
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoNhanSuReport' AND FieldName IN ('Template', 'FromDate', 'ToDate', 'BranchID', 'Keyword');

INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
VALUES
('WA_BaoCaoNhanSuReport', 'Template', N'Mẫu báo cáo', 'Report Template', 'sl', 0, 'grid', 0, 0, 0, 0, 100, 1, 'API_Dropdown_ReportTemplates'),
('WA_BaoCaoNhanSuReport', 'FromDate', N'Từ ngày', 'From Date', 'd', 0, 'grid', 0, 0, 0, 0, 101, 1, NULL),
('WA_BaoCaoNhanSuReport', 'ToDate', N'Đến ngày', 'To Date', 'd', 0, 'grid', 0, 0, 0, 0, 102, 1, NULL),
('WA_BaoCaoNhanSuReport', 'BranchID', N'Chi nhánh', 'Branch', 'sl', 0, 'grid', 0, 0, 0, 0, 103, 1, 'CF_BranchListFrm'),
('WA_BaoCaoNhanSuReport', 'Keyword', N'Từ khoá', 'Keyword', 't', 0, 'grid', 0, 0, 0, 0, 104, 1, NULL);
GO

-- =========================================================================
-- 3. CẤU HÌNH BỘ LỌC (FILTERS) CHO GIAO DIỆN WEB (SY_FrmFltTbl)
-- =========================================================================
-- Xóa cấu hình filter cũ của form WA_BaoCaoNhanSuReport
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID = 'WA_BaoCaoNhanSuReport';

INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- 1. Dropdown Chọn mẫu báo cáo (Type = 3 là Combobox/Dropdown)
(NEWID(), N'WA_BaoCaoNhanSuReport', N'001', N'Template', N'Chọn mẫu', 3, N'API_Dropdown_ReportTemplates', N'value', N'label', 0, 0, NULL),

-- 2. DatePicker Từ ngày (Type = 4 là Date/Time)
(NEWID(), N'WA_BaoCaoNhanSuReport', N'002', N'FromDate', N'Từ ngày', 4, NULL, NULL, NULL, 0, 4, NULL),

-- 3. DatePicker Đến ngày
(NEWID(), N'WA_BaoCaoNhanSuReport', N'003', N'ToDate', N'Đến ngày', 4, NULL, NULL, NULL, 0, 4, NULL),

-- 4. Dropdown Chi nhánh (Sử dụng API Dropdown chi nhánh có sẵn của hệ thống)
(NEWID(), N'WA_BaoCaoNhanSuReport', N'004', N'BranchID', N'Chi nhánh', 3, N'CF_BranchListFrm', N'BranchID', N'BranchName', 0, 0, NULL),

-- 5. TextBox Người dùng (Type = 1 là Text input - Tuỳ chọn)
(NEWID(), N'WA_BaoCaoNhanSuReport', N'005', N'Keyword', N'Từ khoá (NV/SĐT...)', 1, NULL, NULL, NULL, 0, 0, NULL);
GO

-- =========================================================================
-- 4. CẤU HÌNH MENU & FORM (SY_FrmLstTbl / WA_Menu)
-- =========================================================================
IF NOT EXISTS(SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BaoCaoNhanSuReport')
BEGIN
    INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN])  
    VALUES (N'WA_BaoCaoNhanSuReport', N'REPORT', N'Báo cáo nhân sự', N'HR Report');
END

PRINT 'Da tao cau hinh dong cho UI Bao Cao Nhan Su thanh cong!';
GO
