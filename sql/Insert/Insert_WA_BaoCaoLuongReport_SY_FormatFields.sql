USE [X26DIMTUTAC]
GO

-- 1. Xóa cấu hình cũ của Form WA_BaoCaoLuongReport nếu có để tránh trùng lặp
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoLuongReport';
GO

-- 2. Chèn cấu hình cột cho Báo cáo Lương (WA_BaoCaoLuongReport)
INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
('WA_BaoCaoLuongReport', 'DocumentID', N'ID Chứng từ', 'Document ID', 't', 0, 'grid', 0, 1, 1, 1, 1, 0),
('WA_BaoCaoLuongReport', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 0, 1, 1, 1, 2, 0),
('WA_BaoCaoLuongReport', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 0, 1, 1, 1, 3, 0),
('WA_BaoCaoLuongReport', 'ChucVu', N'Chức Vụ', 'Position', 't', 0, 'grid', 0, 1, 1, 1, 4, 0),
('WA_BaoCaoLuongReport', 'NgayCongThucTe', N'Ngày công thực tế', 'Actual Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 5, 0),
('WA_BaoCaoLuongReport', 'NgayCongLe', N'Ngày công lễ', 'Holiday Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 6, 0),
('WA_BaoCaoLuongReport', 'NgayCongTangCa', N'Ngày công tăng ca', 'Overtime Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 7, 0),
('WA_BaoCaoLuongReport', 'NghiPhep', N'Nghỉ phép', 'Paid Leave', 'n', 0, 'grid', 0, 1, 1, 1, 8, 0),
('WA_BaoCaoLuongReport', 'TongNgayCong', N'Tổng ngày công thực tế', 'Total Workdays', 'n', 0, 'grid', 0, 1, 1, 1, 9, 0),
('WA_BaoCaoLuongReport', 'LuongTong', N'Lương tổng', 'Total Gross Salary', 'n', 0, 'grid', 0, 1, 1, 1, 10, 0),
('WA_BaoCaoLuongReport', 'MucLuongDongBHXH', N'Mức lương đóng BHXH', 'SI Base Salary', 'n', 0, 'grid', 0, 1, 1, 1, 11, 0),
('WA_BaoCaoLuongReport', 'LuongCoBanCoCau', N'Lương cơ bản cơ cấu', 'Base Salary Struct', 'n', 0, 'grid', 0, 1, 1, 1, 12, 0),
('WA_BaoCaoLuongReport', 'HoTroAnCaCoCau', N'Hỗ trợ ăn ca cơ cấu', 'Meal Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 13, 0),
('WA_BaoCaoLuongReport', 'HoTroDongPhucCoCau', N'Hỗ trợ đồng phục cơ cấu', 'Uniform Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 14, 0),
('WA_BaoCaoLuongReport', 'HoTroXangXeCoCau', N'Hỗ trợ xăng xe cơ cấu', 'Travel Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 15, 0),
('WA_BaoCaoLuongReport', 'HoTroDienThoaiCoCau', N'Hỗ trợ điện thoại cơ cấu', 'Phone Allowance Struct', 'n', 0, 'grid', 0, 1, 1, 1, 16, 0),
('WA_BaoCaoLuongReport', 'ThuongHieuSuatCoCau', N'Thưởng hiệu suất cơ cấu', 'Performance Bonus Struct', 'n', 0, 'grid', 0, 1, 1, 1, 17, 0),
('WA_BaoCaoLuongReport', 'LuongCoBan', N'Lương cơ bản', 'Base Salary', 'n', 0, 'grid', 0, 1, 1, 1, 18, 0),
('WA_BaoCaoLuongReport', 'HoTroAnCa', N'Hỗ trợ ăn ca', 'Meal Allowance', 'n', 0, 'grid', 0, 1, 1, 1, 19, 0),
('WA_BaoCaoLuongReport', 'HoTroXangXe', N'Hỗ trợ xăng xe', 'Travel Allowance', 'n', 0, 'grid', 0, 1, 1, 1, 20, 0),
('WA_BaoCaoLuongReport', 'ThuongHieuSuat', N'Thưởng hiệu suất', 'Performance Bonus', 'n', 0, 'grid', 0, 1, 1, 1, 21, 0),
('WA_BaoCaoLuongReport', 'TienBuTru', N'Tính bù lương', 'Salary Adjustments', 'n', 0, 'grid', 0, 1, 1, 1, 22, 0),
('WA_BaoCaoLuongReport', 'TongLuong', N'Tổng thu nhập thực tế', 'Actual Income', 'n', 0, 'grid', 0, 1, 1, 1, 23, 0),
('WA_BaoCaoLuongReport', 'SoNguoiPhuThuoc', N'Người phụ thuộc', 'Dependents', 'n', 0, 'grid', 0, 1, 1, 1, 24, 0),
('WA_BaoCaoLuongReport', 'ThuNhapChiuThue', N'Thu nhập chịu thuế', 'Taxable Income', 'n', 0, 'grid', 0, 1, 1, 1, 25, 0),
('WA_BaoCaoLuongReport', 'ThuNhapTinhThue', N'Thu nhập tính thuế', 'Assessed Income', 'n', 0, 'grid', 0, 1, 1, 1, 26, 0),
('WA_BaoCaoLuongReport', 'BaoHiem', N'BHXH, BHYT, BHTN', 'Social Insurance Deductions', 'n', 0, 'grid', 0, 1, 1, 1, 27, 0),
('WA_BaoCaoLuongReport', 'ThueTNCN', N'Thuế TNCN', 'PIT', 'n', 0, 'grid', 0, 1, 1, 1, 28, 0),
('WA_BaoCaoLuongReport', 'TongGiamTru', N'Tổng các khoản giảm trừ', 'Total Deductions', 'n', 0, 'grid', 0, 1, 1, 1, 29, 0),
('WA_BaoCaoLuongReport', 'TamUng', N'Tạm ứng', 'Advance Payment', 'n', 0, 'grid', 0, 1, 1, 1, 30, 0),
('WA_BaoCaoLuongReport', 'ThucLinh', N'Thực lĩnh', 'Net Take-Home', 'n', 0, 'grid', 0, 1, 1, 1, 31, 0),
('WA_BaoCaoLuongReport', 'PeriodID', N'Kỳ', 'Period', 'sl', 0, 'none', 0, 0, 0, 0, 32, 1),
('WA_BaoCaoLuongReport', 'BranchID1', N'Chi nhánh', 'Branch', 'sl', 0, 'none', 0, 0, 0, 0, 33, 1),
('WA_BaoCaoLuongReport', 'PhongBan', N'Chọn bộ phận', 'Department', 'sl', 0, 'none', 0, 0, 0, 0, 34, 1);
GO

-- Cập nhật DataSource cho Kỳ, Chi nhánh, Bộ phận để load dropdown
UPDATE dbo.SY_FormatFields
SET DataSource = 'SY_Period'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields
SET DataSource = 'CF_BranchListFrm'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'BranchID1';

UPDATE dbo.SY_FormatFields
SET DataSource = 'HR_DepartmentListTbl'
WHERE FormName = 'WA_BaoCaoLuongReport' AND FieldName = 'PhongBan';
GO

-- 3. ĐĂNG KÝ ĐỊNH TUYẾN GATEWAY (WA_API) CHO BÁO CÁO LƯƠNG
DELETE FROM dbo.WA_API WHERE list = 'WA_BaoCaoLuongReport';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES
('WA_BaoCaoLuongReport', 'View', 'API_BaoCaoLuong', '@PeriodID=''{PeriodID}'', @BranchID1=''{BranchID1}'', @Keyword=''{Keyword}'', @PhongBan=N''{PhongBan}''');
GO

PRINT 'Da insert tat ca cac cot va WA_API cho WA_BaoCaoLuongReport thanh cong!';
GO
