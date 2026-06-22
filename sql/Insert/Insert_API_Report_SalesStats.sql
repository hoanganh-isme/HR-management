USE [QLTiec]
GO

-- Xóa các record lỗi (sai cấu trúc)
DELETE FROM WA_API WHERE list = 'api' AND func = 'API_Report_SalesStats';

-- Xóa record cũ nếu có để tạo lại cho chuẩn
DELETE FROM WA_API WHERE list = 'API_Report_SalesStats' AND func = 'Execute';

-- Đăng ký API theo đúng Format của Gateway Router
INSERT INTO WA_API (list, func, SQL, Para)
VALUES (
    'API_Report_SalesStats',
    'Execute',
    'API_Report_SalesStats',
    '@TuNgay=''{TuNgay}'', @DenNgay=''{DenNgay}'''
);
GO
