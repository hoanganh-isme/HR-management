USE [X26DIMTUTAC]
GO

-- =========================================================================================
-- 1. CẬP NHẬT CẤU HÌNH CAPTION CHO BÁO CÁO NHÂN SỰ (FormName = 'HR_BaoCaoNhanSuReport')
-- Điền việt hóa cho các cột thuộc tính của nhân viên từ dữ liệu thô sang hiển thị tiếng Việt.
-- =========================================================================================

-- Các cột có trong ảnh chụp (Trang 3/11)
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày cập nhật' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DateUpdate';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa chỉ hiện nay' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DiaChiHienNay';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa chỉ tạm trú' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DiaChiTamTru';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa chỉ thường trú' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DiaChiThuongTru';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số điện thoại' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DienThoai';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Dụng cụ làm việc' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DungCuLamViec';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Trình độ học vấn' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'EducationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Email' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'Email';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã chấm công' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'EnrollNumber';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Dữ liệu vân tay 1' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'FingerData';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Dữ liệu vân tay 2' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'FingerData2';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giới tính' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'GioiTinh';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tình trạng hôn nhân' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'HonNhan';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Nơi đăng ký KCB' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'HospitalName';

-- Các cột thông dụng khác của hồ sơ nhân sự (Phục vụ hiển thị đầy đủ các trang còn lại)
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã nhân viên' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'PersonID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Họ và tên' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'PersonName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày sinh' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'BirthDate';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Nơi sinh' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'BirthPlace';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số CMND/CCCD' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'IDCard';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày cấp' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'IDCardDate';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Nơi cấp' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'IDCardPlace';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày vào làm' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'JoinDate';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngày nghỉ việc' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'LeftDate';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên phòng ban' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'DepartmentName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên chức vụ' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'PositionName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên chi nhánh' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'BranchName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số tài khoản' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'BankAccount';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên ngân hàng' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'BankName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số sổ BHXH' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'SocialInsuranceNo';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã số thuế' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'TaxNo';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Dân tộc' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'NationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tôn giáo' WHERE FormName = 'HR_BaoCaoNhanSuReport' AND FieldName = 'ReligionName';

PRINT 'Da cap nhat tieu de cho HR_BaoCaoNhanSuReport!';


-- =========================================================================================
-- 2. CẬP NHẬT CẤU HÌNH CAPTION CHO BÁO CÁO LƯƠNG (30 cột tương ứng với ảnh lưới cột)
-- Do chưa biết rõ FormName của Báo cáo lương là gì, script chạy update cho cả 3 tên phổ biến:
-- 'HR_BaoCaoLuongReport', 'WA_BaoCaoLuong', 'API_HR_BaoCaoLuong'
-- =========================================================================================
DECLARE @FormNames TABLE (FormName VARCHAR(100));
INSERT INTO @FormNames VALUES ('HR_BaoCaoLuongReport'), ('WA_BaoCaoLuong'), ('API_HR_BaoCaoLuong'), ('HR_BaoCaoLuong');

-- Cập nhật đồng loạt cho các FormName nghi vấn:
UPDATE F
SET F.CaptionVN = U.NewCaption
FROM dbo.SY_FormatFields F
INNER JOIN @FormNames N ON F.FormName = N.FormName
INNER JOIN (
    VALUES
        ('SoTT', N'Số TT'),
        ('PersonName', N'Họ và Tên'),
        ('ChucVu', N'Chức Vụ'),
        ('NgayCongThucTe', N'Ngày công thực tế'),
        ('NgayCongLe', N'Ngày công lễ'),
        ('NgayCongTangCa', N'Ngày công tăng ca'),
        ('NghiPhep', N'Nghỉ phép'),
        ('TongNgayCong', N'Tổng ngày công thực tế'),
        ('LuongTong', N'Lương tổng'),
        ('MucDongBHXH', N'Mức lương đóng BHXH'),
        ('LuongCoBanCoCau', N'Lương cơ bản cơ cấu'),
        ('HoTroAnCaCoCau', N'Hỗ trợ ăn ca cơ cấu'),
        ('HoTroDongPhucCoCau', N'Hỗ trợ đồng phục cơ cấu'),
        ('HoTroXangXeCoCau', N'Hỗ trợ xăng xe cơ cấu'),
        ('HoTroDienThoaiCoCau', N'Hỗ trợ điện thoại cơ cấu'),
        ('ThuongHieuSuatCoCau', N'Thưởng hiệu suất cơ cấu'),
        ('LuongCoBan', N'Lương cơ bản'),
        ('HoTroAnCa', N'Hỗ trợ ăn ca'),
        ('HoTroXangXe', N'Hỗ trợ xăng xe'),
        ('ThuongHieuSuatCongViec', N'Thưởng hiệu suất công việc'),
        ('TinhBuLuong', N'Tính bù lương'),
        ('TongThuNhap', N'Tổng thu nhập trong tháng theo ngày công'),
        ('NguoiPhuThuoc', N'Người phụ thuộc'),
        ('ThuNhapChiuThue', N'Thu nhập chịu thuế'),
        ('ThuNhapTinhThue', N'Thu nhập tính thuế'),
        ('BHXH_BHYT_BHTN', N'BHXH, BHYT, BHTN'),
        ('ThueTNCN', N'Thuế TNCN'),
        ('TongGiamTru', N'Tổng các khoản giảm trừ'),
        ('TamUng', N'Tạm ứng'),
        ('ThucLinh', N'Thực lĩnh')
) AS U(ColName, NewCaption) ON F.FieldName = U.ColName;

PRINT 'Da cap nhat tieu de cho Bao Cao Luong!';
GO
