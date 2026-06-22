USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_TimeSheetFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_TimeSheetFrm', 'WA_TimeSheetEditFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_TimeSheetFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_TimeSheetFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetFrm';
GO

-- Xóa bỏ View ảo cũ nếu đã lỡ tạo để dọn dẹp hệ thống sạch sẽ
IF OBJECT_ID('dbo.v_WA_TimeSheetTbl', 'V') IS NOT NULL
    DROP VIEW dbo.v_WA_TimeSheetTbl;
GO

-- =========================================================================
-- 3. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl) - TRỎ DỮ LIỆU VỀ BẢNG GỐC HR_TimeSheetTbl
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_TimeSheetFrm', N'EDIT', N'Chấm công tổng hợp tháng', N'Monthly Timesheet Summary', N'HR_TimeSheetTbl', N'UserAutoID', N'月度报时');
GO

-- =========================================================================
-- 4. CẤU HÌNH THUỘC TÍNH FORM (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate])  
VALUES 
(NEWID(), N'WA_TimeSheetFrm', N'T0', N'TN', N'HR_TimeSheetTbl', N'', GETDATE()),
(NEWID(), N'WA_TimeSheetFrm', N'T0', N'PK', N'UserAutoID', N'', GETDATE());
GO

-- =========================================================================
-- 5. CẤU HÌNH CÁC BỘ LỌC VÀ NÚT TÍNH CÔNG (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl 
    ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [Type], [Source], [ValueColumn], [DisplayColumn], [IsSetDefaultValue], [Operator], [DefaultValueSQL])  
VALUES 
-- Bộ lọc Kỳ lương (PeriodID)
(NEWID(), N'WA_TimeSheetFrm', N'0', N'PeriodID', N'Kỳ', 3, N'Select Distinct PeriodID from SY_Period order by PeriodID desc', N'PeriodID', N'PeriodID', 1, 4, NULL),

-- Bộ lọc Phòng ban
(NEWID(), N'WA_TimeSheetFrm', N'004', N'PhongBan', N'Phòng ban', 3, N'Select * from HR_DepartmentListTbl', N'PhongBan', N'PhongBan', 1, 4, NULL),

-- Nút "Tính công tháng" (Trực tiếp gọi SP HR_PayRoll_Process_Stp)
(NEWID(), N'WA_TimeSheetFrm', N'900', N'PersonID', N'Tính công tháng', 16, N'HR_PayRoll_Process_Stp ''{1}''', NULL, NULL, 1, 4, NULL);
GO

-- =========================================================================
-- 6. CẤU HÌNH ĐỊNH VỊ CỘT TRONG GRID (SY_FormatFields)
-- =========================================================================
INSERT INTO dbo.SY_FormatFields 
    (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
('WA_TimeSheetFrm', 'UserAutoID', N'UserAutoID', 'UserAutoID', 't', 0, 'grid', 0, 0, 1, 1, 1, 0),
('WA_TimeSheetFrm', 'PeriodID', N'Kỳ', 'Period', 't', 0, 'grid', 1, 1, 1, 1, 2, 1),
('WA_TimeSheetFrm', 'PersonID', N'Mã nhân viên', 'Employee ID', 't', 0, 'grid', 1, 1, 1, 1, 3, 1),
('WA_TimeSheetFrm', 'PersonName', N'Họ Tên', 'Employee Name', 't', 0, 'grid', 1, 1, 0, 0, 4, 1),
('WA_TimeSheetFrm', 'PhongBan', N'Bộ phận', 'Department', 't', 0, 'grid', 1, 1, 0, 0, 5, 1),
('WA_TimeSheetFrm', 'DocumentDate', N'Ngày', 'Date', 'd', 0, 'grid', 1, 1, 0, 0, 6, 0),
('WA_TimeSheetFrm', 'SoNgayThang', N'Tổng ngày công trong tháng', 'Total Month Days', 'n', 0, 'grid', 1, 1, 0, 0, 7, 0),
('WA_TimeSheetFrm', 'SoNgayDiLam', N'Số ngày đi làm', 'Actual Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 8, 0),
('WA_TimeSheetFrm', 'SoNgayLe', N'SoNgayLe', 'Holiday Workdays', 'n', 0, 'grid', 1, 1, 0, 0, 9, 0),
('WA_TimeSheetFrm', 'TangCa', N'Tăng ca', 'Overtime', 'n', 0, 'grid', 1, 1, 0, 0, 10, 0),
('WA_TimeSheetFrm', 'SoNgayCongTac', N'Số ngày công tác', 'Business Trip Days', 'n', 0, 'grid', 1, 1, 0, 0, 11, 0),
('WA_TimeSheetFrm', 'CongPhep', N'Cộng phép', 'Add Leave', 'n', 0, 'grid', 1, 1, 0, 0, 12, 0),
('WA_TimeSheetFrm', 'NghiPhep', N'Nghỉ phép', 'Paid Leave', 'n', 0, 'grid', 1, 1, 0, 0, 13, 0),
('WA_TimeSheetFrm', 'NghiKhongPhep', N'Nghỉ không phép', 'Unpaid Leave', 'n', 0, 'grid', 1, 1, 0, 0, 14, 0),
('WA_TimeSheetFrm', 'GhiChu', N'Ghi chú', 'Notes', 't', 0, 'grid', 1, 1, 0, 0, 15, 0);
GO

-- Kích hoạt bộ lọc nhanh cho các cột trên Giao diện Web cho WA_TimeSheetFrm
UPDATE dbo.SY_FormatFields 
SET ShowInFilter = 1,
    FormatID = CASE 
        WHEN FieldName = 'PeriodID' THEN 'sl' 
        ELSE FormatID 
    END,
    DataSource = CASE 
        WHEN FieldName = 'PeriodID' THEN 'SY_Period' 
        ELSE DataSource 
    END
WHERE FormName = 'WA_TimeSheetFrm' 
  AND FieldName IN ('PeriodID');
GO

-- =========================================================================
-- 7. CẤU HÌNH DROPDOWN TRONG GRID (SY_FrmDrdwTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmDrdwTbl 
    ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [Source], [DisableAddNew], [IsDisable])  
VALUES 
(NEWID(), N'WA_TimeSheetFrm', NULL, N'PersonID', N'PersonID', N'PersonID', N'PersonID;PersonName;PhongBan', N'Select * from HR_PersonTbl', 1, 0);
GO

-- =========================================================================
-- 8. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- 8.1. API View: Truy vấn dữ liệu qua Stored Procedure API_BangChamCongTongHop mới tạo
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetFrm', 'View', 'API_BangChamCongTongHop', '@Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');

-- 8.2. API Execute: Cho nút bấm "Tính công tháng"
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_TimeSheetFrm', 'HR_PayRoll_Process_Stp', 'HR_PayRoll_Process_Stp', '@PeriodID=N''{PeriodID}''');
GO

PRINT 'Da tao cau hinh WA_TimeSheetFrm su dung Stored Procedure API_BangChamCongTongHop thanh cong!';
GO
