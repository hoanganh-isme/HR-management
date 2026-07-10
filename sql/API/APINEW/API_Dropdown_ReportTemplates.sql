
-- =========================================================================
-- TẠO STORED PROCEDURE CHO DROPDOWN LẤY CÁC TÙY CHỌN BÁO CÁO (FILTER PRESETS)
-- =========================================================================
-- Giải pháp: Trả về danh sách ảo (Virtual Table) từ SP thay vì tạo bảng vật lý.
-- Web App sẽ gọi API này để build Dropdown, không bị hardcode dưới React.
CREATE OR ALTER PROCEDURE dbo.API_Dropdown_ReportTemplates
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Trả về định dạng [value], [label] cho UI Web App (Dropdown)
    SELECT 'HR_BaoCaoNhansu2Report' AS [value], N'Báo cáo nhân sự tổng hợp' AS [label]
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuNVNReport', N'Báo cáo nhân sự NVN'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuNNNReport', N'Báo cáo nhân sự NNN'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuThieuHDReport', N'Báo cáo nhân sự thiếu HĐLĐ'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuThieuBHReport', N'Báo cáo nhân sự thiếu BH';
END
GO

PRINT 'Da tao SP API_Dropdown_ReportTemplates thanh cong!';
GO

-- =========================================================================
-- Đăng ký API Dropdown vào WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'API_Dropdown_ReportTemplates';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_Dropdown_ReportTemplates', 'View', 'API_Dropdown_ReportTemplates', '');
GO

PRINT 'Da dang ky WA_API [API_Dropdown_ReportTemplates / View] thanh cong!';
GO
