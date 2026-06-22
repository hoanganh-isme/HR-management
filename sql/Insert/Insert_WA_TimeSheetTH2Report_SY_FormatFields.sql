USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ NẾU CÓ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetTH2Report');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetTH2Report';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetTH2Report';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetTH2Report';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ BÁO CÁO MỚI (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetTH2Report',
    'EDIT',
    N'Báo cáo công tổng hợp',
    'Timesheet Model 2',
    'HR_TimeSheetTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetTH2Report', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetTH2Report', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 4. KHỞI TẠO CẤU HÌNH CỘT GIAO DIỆN (SY_FormatFields) BẰNG LỆNH INSERT
-- Thể hiện chính xác thứ tự cột (OrderNo) như giao diện phần mềm Desktop
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
-- Các thông tin nhân viên cơ bản
('WA_TimeSheetTH2Report', 'STT', N'STT', 'No.', 't', 0, 'grid', 1, 1, 0, 0, 1, 0),
('WA_TimeSheetTH2Report', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 0, 0, 2, 1),
('WA_TimeSheetTH2Report', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 3, 1),
('WA_TimeSheetTH2Report', 'ChucDanh', N'Chức danh chuyên môn', 'Title', 't', 0, 'grid', 1, 1, 0, 0, 4, 0),

-- Cột tổng hợp phép & ngày công
('WA_TimeSheetTH2Report', 'TongCong', N'Tổng cộng', 'Total Days', 'n', 0, 'grid', 1, 1, 0, 0, 5, 0),
('WA_TimeSheetTH2Report', 'SoNgayCongThang', N'Số ngày công tháng', 'Month Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetTH2Report', 'TongNgayDiLam', N'Tổng ngày đi làm', 'Total Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetTH2Report', 'SoNgayPhepTet', N'Số ngày phép tết', 'Tet Leave', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetTH2Report', 'PhepConLaiNam', N'Phép còn lại năm', 'Remaining Annual Leave', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetTH2Report', 'PhepPhatSinh', N'Phép phát sinh', 'Accrued Leave', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetTH2Report', 'HieuHi', N'Hiếu/Hỉ', 'Compassionate Leave', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetTH2Report', 'PhepBuLe', N'Phép bù lễ', 'Compensatory Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetTH2Report', 'PhepSuDungTrongThang', N'Phép sử dụng trong tháng', 'Leave Used in Month', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetTH2Report', 'PhepDaDungLuyKe', N'Phép đã dùng lũy kế', 'Cumulative Leave Used', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetTH2Report', 'TonPhepHienTai', N'Tồn phép hiện tại', 'Current Leave Balance', 'n', 0, 'grid', 1, 1, 0, 0, 15, 0),
('WA_TimeSheetTH2Report', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 16, 0),

-- Các cột bổ sung
('WA_TimeSheetTH2Report', 'ThangTitle', N'Kỳ báo cáo', 'Month Title', 't', 0, 'grid', 1, 1, 0, 0, 17, 0),
('WA_TimeSheetTH2Report', 'SoNgayLe', N'Ngày công lễ', 'Holiday Days', 'n', 0, 'grid', 1, 1, 0, 0, 18, 0),

-- Chi tiết các ngày từ 1 đến 31
('WA_TimeSheetTH2Report', '1', N'1', '1', 't', 0, 'grid', 1, 1, 0, 0, 19, 0),
('WA_TimeSheetTH2Report', '2', N'2', '2', 't', 0, 'grid', 1, 1, 0, 0, 20, 0),
('WA_TimeSheetTH2Report', '3', N'3', '3', 't', 0, 'grid', 1, 1, 0, 0, 21, 0),
('WA_TimeSheetTH2Report', '4', N'4', '4', 't', 0, 'grid', 1, 1, 0, 0, 22, 0),
('WA_TimeSheetTH2Report', '5', N'5', '5', 't', 0, 'grid', 1, 1, 0, 0, 23, 0),
('WA_TimeSheetTH2Report', '6', N'6', '6', 't', 0, 'grid', 1, 1, 0, 0, 24, 0),
('WA_TimeSheetTH2Report', '7', N'7', '7', 't', 0, 'grid', 1, 1, 0, 0, 25, 0),
('WA_TimeSheetTH2Report', '8', N'8', '8', 't', 0, 'grid', 1, 1, 0, 0, 26, 0),
('WA_TimeSheetTH2Report', '9', N'9', '9', 't', 0, 'grid', 1, 1, 0, 0, 27, 0),
('WA_TimeSheetTH2Report', '10', N'10', '10', 't', 0, 'grid', 1, 1, 0, 0, 28, 0),
('WA_TimeSheetTH2Report', '11', N'11', '11', 't', 0, 'grid', 1, 1, 0, 0, 29, 0),
('WA_TimeSheetTH2Report', '12', N'12', '12', 't', 0, 'grid', 1, 1, 0, 0, 30, 0),
('WA_TimeSheetTH2Report', '13', N'13', '13', 't', 0, 'grid', 1, 1, 0, 0, 31, 0),
('WA_TimeSheetTH2Report', '14', N'14', '14', 't', 0, 'grid', 1, 1, 0, 0, 32, 0),
('WA_TimeSheetTH2Report', '15', N'15', '15', 't', 0, 'grid', 1, 1, 0, 0, 33, 0),
('WA_TimeSheetTH2Report', '16', N'16', '16', 't', 0, 'grid', 1, 1, 0, 0, 34, 0),
('WA_TimeSheetTH2Report', '17', N'17', '17', 't', 0, 'grid', 1, 1, 0, 0, 35, 0),
('WA_TimeSheetTH2Report', '18', N'18', '18', 't', 0, 'grid', 1, 1, 0, 0, 36, 0),
('WA_TimeSheetTH2Report', '19', N'19', '19', 't', 0, 'grid', 1, 1, 0, 0, 37, 0),
('WA_TimeSheetTH2Report', '20', N'20', '20', 't', 0, 'grid', 1, 1, 0, 0, 38, 0),
('WA_TimeSheetTH2Report', '21', N'21', '21', 't', 0, 'grid', 1, 1, 0, 0, 39, 0),
('WA_TimeSheetTH2Report', '22', N'22', '22', 't', 0, 'grid', 1, 1, 0, 0, 40, 0),
('WA_TimeSheetTH2Report', '23', N'23', '23', 't', 0, 'grid', 1, 1, 0, 0, 41, 0),
('WA_TimeSheetTH2Report', '24', N'24', '24', 't', 0, 'grid', 1, 1, 0, 0, 42, 0),
('WA_TimeSheetTH2Report', '25', N'25', '25', 't', 0, 'grid', 1, 1, 0, 0, 43, 0),
('WA_TimeSheetTH2Report', '26', N'26', '26', 't', 0, 'grid', 1, 1, 0, 0, 44, 0),
('WA_TimeSheetTH2Report', '27', N'27', '27', 't', 0, 'grid', 1, 1, 0, 0, 45, 0),
('WA_TimeSheetTH2Report', '28', N'28', '28', 't', 0, 'grid', 1, 1, 0, 0, 46, 0),
('WA_TimeSheetTH2Report', '29', N'29', '29', 't', 0, 'grid', 1, 1, 0, 0, 47, 0),
('WA_TimeSheetTH2Report', '30', N'30', '30', 't', 0, 'grid', 1, 1, 0, 0, 48, 0),
('WA_TimeSheetTH2Report', '31', N'31', '31', 't', 0, 'grid', 1, 1, 0, 0, 49, 0),

-- Cột lương khoán cuối cùng
('WA_TimeSheetTH2Report', 'IsLuongKhoan', N'Lương khoán', 'Is Fixed Salary', 'b', 0, 'grid', 1, 1, 0, 0, 50, 0),
('WA_TimeSheetTH2Report', 'SoTienKhoan', N'Số tiền khoán', 'Fixed Salary Amount', 'n', 0, 'grid', 1, 1, 0, 0, 51, 0),

-- Cột lọc ẩn/không hiển thị trên grid nhưng cần để bind filter
('WA_TimeSheetTH2Report', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 0, 0, 0, 0, 100, 1),
('WA_TimeSheetTH2Report', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 0, 0, 0, 0, 101, 1);
GO

-- =========================================================================
-- 5. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(
    NEWID(), N'WA_TimeSheetTH2Report', N'0', N'PeriodID', N'Kỳ', 3, 
    N'Select Distinct PeriodID from SY_Period order by PeriodID desc', 
    N'PeriodID', N'PeriodID', 1, 4, NULL
),

-- Bộ lọc Phòng ban (PhongBan)
(
    NEWID(), N'WA_TimeSheetTH2Report', N'001', N'PhongBan', N'Bộ phận', 3, 
    N'Select * from HR_DepartmentListTbl', 
    N'PhongBan', N'PhongBan', 1, 4, NULL
);
GO

-- =========================================================================
-- 6. THIẾT LẬP ĐỊNH TUYẾN GATEWAY (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetTH2Report',
    'View',
    'API_BaoCaoChamCongTongHop', 
    '@PeriodID=''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}'''
);
GO

-- =========================================================================
-- 7. CẤU HÌNH DROPDOWN CHO BỘ LỌC (KỲ VÀ BỘ PHẬN)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET FormatID = 'sl',
    DataSource = 'SY_Period'
WHERE FormName = 'WA_TimeSheetTH2Report' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields
SET FormatID = 'sl',
    DataSource = 'HR_DepartmentListTbl'
WHERE FormName = 'WA_TimeSheetTH2Report' AND FieldName = 'PhongBan';
GO

-- ĐĂNG KÝ API VIEW CHO DANH SÁCH BỘ PHẬN NẾU CHƯA CÓ
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'HR_DepartmentListTbl' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('HR_DepartmentListTbl', 'View', 'API_DanhSachBoPhan', '@Keyword=N''{Keyword}''');
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_DanhSachBoPhan',
        Para = '@Keyword=N''{Keyword}'''
    WHERE list = 'HR_DepartmentListTbl' AND func = 'View';
END
GO

PRINT 'Da thiet lap cau hinh giup menu WA_TimeSheetTH2Report show full 62 cot chi tiet qua Store API_BaoCaoChamCongTongHop thanh cong!';
GO

