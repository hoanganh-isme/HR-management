USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ NẾU CÓ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetReport');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetReport';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetReport';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetReport';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ BÁO CÁO MỚI (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_TimeSheetReport',
    'EDIT',
    N'Báo cáo chấm công tổng hợp',
    'Timesheet Summary Report',
    'HR_TimeSheetTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetReport', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetReport', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 4. KHỞI TẠO CẤU HÌNH CỘT GIAO DIỆN (SY_FormatFields) BẰNG LỆNH INSERT
-- Thể hiện chính xác thứ tự cột (OrderNo) như giao diện phần mềm Desktop
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
-- Các thông tin nhân viên cơ bản
('WA_TimeSheetReport', 'STT', N'STT', 'No.', 't', 0, 'grid', 1, 1, 0, 0, 1, 0),
('WA_TimeSheetReport', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 0, 0, 2, 1),
('WA_TimeSheetReport', 'PersonName', N'Họ và Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 3, 1),
('WA_TimeSheetReport', 'ChucDanh', N'Chức danh chuyên môn', 'Title', 't', 0, 'grid', 1, 1, 0, 0, 4, 0),

-- Cột tổng hợp phép & ngày công
('WA_TimeSheetReport', 'TongCong', N'Tổng cộng', 'Total Days', 'n', 0, 'grid', 1, 1, 0, 0, 5, 0),
('WA_TimeSheetReport', 'SoNgayCongThang', N'Số ngày công tháng', 'Month Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetReport', 'TongNgayDiLam', N'Tổng ngày đi làm', 'Total Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetReport', 'SoNgayPhepTet', N'Số ngày phép tết', 'Tet Leave', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetReport', 'PhepConLaiNam', N'Phép còn lại năm', 'Remaining Annual Leave', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetReport', 'PhepPhatSinh', N'Phép phát sinh', 'Accrued Leave', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetReport', 'HieuHi', N'Hiếu/Hỉ', 'Compassionate Leave', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetReport', 'PhepBuLe', N'Phép bù lễ', 'Compensatory Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetReport', 'PhepSuDungTrongThang', N'Phép sử dụng trong tháng', 'Leave Used in Month', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetReport', 'PhepDaDungLuyKe', N'Phép đã dùng lũy kế', 'Cumulative Leave Used', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetReport', 'TonPhepHienTai', N'Tồn phép hiện tại', 'Current Leave Balance', 'n', 0, 'grid', 1, 1, 0, 0, 15, 0),
('WA_TimeSheetReport', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 16, 0),

-- Các cột bổ sung
('WA_TimeSheetReport', 'ThangTitle', N'Kỳ báo cáo', 'Month Title', 't', 0, 'grid', 1, 1, 0, 0, 17, 0),
('WA_TimeSheetReport', 'SoNgayLe', N'Ngày công lễ', 'Holiday Days', 'n', 0, 'grid', 1, 1, 0, 0, 18, 0),

-- Chi tiết các ngày từ 1 đến 31
('WA_TimeSheetReport', '1', N'1', '1', 't', 0, 'grid', 1, 1, 0, 0, 19, 0),
('WA_TimeSheetReport', '2', N'2', '2', 't', 0, 'grid', 1, 1, 0, 0, 20, 0),
('WA_TimeSheetReport', '3', N'3', '3', 't', 0, 'grid', 1, 1, 0, 0, 21, 0),
('WA_TimeSheetReport', '4', N'4', '4', 't', 0, 'grid', 1, 1, 0, 0, 22, 0),
('WA_TimeSheetReport', '5', N'5', '5', 't', 0, 'grid', 1, 1, 0, 0, 23, 0),
('WA_TimeSheetReport', '6', N'6', '6', 't', 0, 'grid', 1, 1, 0, 0, 24, 0),
('WA_TimeSheetReport', '7', N'7', '7', 't', 0, 'grid', 1, 1, 0, 0, 25, 0),
('WA_TimeSheetReport', '8', N'8', '8', 't', 0, 'grid', 1, 1, 0, 0, 26, 0),
('WA_TimeSheetReport', '9', N'9', '9', 't', 0, 'grid', 1, 1, 0, 0, 27, 0),
('WA_TimeSheetReport', '10', N'10', '10', 't', 0, 'grid', 1, 1, 0, 0, 28, 0),
('WA_TimeSheetReport', '11', N'11', '11', 't', 0, 'grid', 1, 1, 0, 0, 29, 0),
('WA_TimeSheetReport', '12', N'12', '12', 't', 0, 'grid', 1, 1, 0, 0, 30, 0),
('WA_TimeSheetReport', '13', N'13', '13', 't', 0, 'grid', 1, 1, 0, 0, 31, 0),
('WA_TimeSheetReport', '14', N'14', '14', 't', 0, 'grid', 1, 1, 0, 0, 32, 0),
('WA_TimeSheetReport', '15', N'15', '15', 't', 0, 'grid', 1, 1, 0, 0, 33, 0),
('WA_TimeSheetReport', '16', N'16', '16', 't', 0, 'grid', 1, 1, 0, 0, 34, 0),
('WA_TimeSheetReport', '17', N'17', '17', 't', 0, 'grid', 1, 1, 0, 0, 35, 0),
('WA_TimeSheetReport', '18', N'18', '18', 't', 0, 'grid', 1, 1, 0, 0, 36, 0),
('WA_TimeSheetReport', '19', N'19', '19', 't', 0, 'grid', 1, 1, 0, 0, 37, 0),
('WA_TimeSheetReport', '20', N'20', '20', 't', 0, 'grid', 1, 1, 0, 0, 38, 0),
('WA_TimeSheetReport', '21', N'21', '21', 't', 0, 'grid', 1, 1, 0, 0, 39, 0),
('WA_TimeSheetReport', '22', N'22', '22', 't', 0, 'grid', 1, 1, 0, 0, 40, 0),
('WA_TimeSheetReport', '23', N'23', '23', 't', 0, 'grid', 1, 1, 0, 0, 41, 0),
('WA_TimeSheetReport', '24', N'24', '24', 't', 0, 'grid', 1, 1, 0, 0, 42, 0),
('WA_TimeSheetReport', '25', N'25', '25', 't', 0, 'grid', 1, 1, 0, 0, 43, 0),
('WA_TimeSheetReport', '26', N'26', '26', 't', 0, 'grid', 1, 1, 0, 0, 44, 0),
('WA_TimeSheetReport', '27', N'27', '27', 't', 0, 'grid', 1, 1, 0, 0, 45, 0),
('WA_TimeSheetReport', '28', N'28', '28', 't', 0, 'grid', 1, 1, 0, 0, 46, 0),
('WA_TimeSheetReport', '29', N'29', '29', 't', 0, 'grid', 1, 1, 0, 0, 47, 0),
('WA_TimeSheetReport', '30', N'30', '30', 't', 0, 'grid', 1, 1, 0, 0, 48, 0),
('WA_TimeSheetReport', '31', N'31', '31', 't', 0, 'grid', 1, 1, 0, 0, 49, 0),

-- Cột lương khoán cuối cùng
('WA_TimeSheetReport', 'IsLuongKhoan', N'Lương khoán', 'Is Fixed Salary', 'b', 0, 'grid', 1, 1, 0, 0, 50, 0),
('WA_TimeSheetReport', 'SoTienKhoan', N'Số tiền khoán', 'Fixed Salary Amount', 'n', 0, 'grid', 1, 1, 0, 0, 51, 0),

-- Cột lọc ẩn/không hiển thị trên grid nhưng cần để bind filter
('WA_TimeSheetReport', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 0, 0, 0, 0, 100, 1),
('WA_TimeSheetReport', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 0, 0, 0, 0, 101, 1);
GO

-- =========================================================================
-- 5. THIẾT LẬP CẤU HÌNH BỘ LỌC BÁO CÁO (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(
    NEWID(), N'WA_TimeSheetReport', N'0', N'PeriodID', N'Kỳ', 3, 
    N'Select Distinct PeriodID from SY_Period order by PeriodID desc', 
    N'PeriodID', N'PeriodID', 1, 4, NULL
),

-- Bộ lọc Phòng ban (PhongBan)
(
    NEWID(), N'WA_TimeSheetReport', N'001', N'PhongBan', N'Bộ phận', 3, 
    N'Select * from HR_DepartmentListTbl', 
    N'PhongBan', N'PhongBan', 1, 4, NULL
);
GO

-- =========================================================================
-- 6. THIẾT LẬP ĐỊNH TUYẾN GATEWAY (WA_API)
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetReport',
    'View',
    'API_BaoCaoChamCongTongHop', 
    '@PeriodID=''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}'''
);
GO

PRINT 'Da thiet lap cau hinh giup menu Bao Cao Cham Cong show full 62 cot chi tiet nhu Desktop App!';
GO
