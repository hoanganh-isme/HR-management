USE [X26DIMTUTAC]
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
