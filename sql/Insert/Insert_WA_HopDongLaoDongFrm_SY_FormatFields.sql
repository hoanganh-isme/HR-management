USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach');
DELETE FROM dbo.WA_API WHERE list IN ('WA_HopDongLaoDongFrm', 'API_HopDongLaoDong_ChiTiet', 'API_HopDongLaoDong_Attach', 'API_HopDongLaoDong_NamLap', 'API_HopDongLaoDong_LoaiHD');
DELETE FROM dbo.WA_Menu WHERE MenuID = '2021' OR FormName = 'WA_HopDongLaoDongFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM TRONG CSDL (SY_FrmLstTbl)
-- =========================================================================
-- Master Form: Hợp đồng lao động
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_HopDongLaoDongFrm', 'LIST', N'Hợp đồng lao động', 'Labor Contracts', 'HR_HopDongTbl', 'MaHopDong');

-- Detail Grid: Phụ cấp trong hợp đồng
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_HopDongLaoDong_ChiTiet', 'LIST', N'Phụ cấp trong hợp đồng', 'Contract Allowances', 'HR_HopDongDetailTbl', 'UserAutoID');

-- Detail Grid: Tài liệu đính kèm
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_HopDongLaoDong_Attach', 'LIST', N'Tài liệu đính kèm', 'Contract Attachments', 'HR_HopDongAttachTbl', 'UserAutoID');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- Routing cho Master Form
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HopDongLaoDongFrm', 'View', 'API_HopDongLaoDong', '@Keyword=N''{Keyword}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @BranchID=N''{BranchID}'''),
('WA_HopDongLaoDongFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HopDongLaoDongFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Form
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_ChiTiet', 'View', 'API_HopDongLaoDong_ChiTiet', '@MaHopDong=N''{MaHopDong}'''),
('API_HopDongLaoDong_ChiTiet', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_HopDongLaoDong_ChiTiet', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Attach
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_Attach', 'View', 'API_HopDongLaoDong_Attach', '@MaHopDong=N''{MaHopDong}'''),
('API_HopDongLaoDong_Attach', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_HopDongLaoDong_Attach', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Dropdowns
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_HopDongLaoDong_NamLap', 'View', 'API_HopDongLaoDong_NamLap', '@Keyword=N''{Keyword}'''),
('API_HopDongLaoDong_LoaiHD', 'View', 'API_HopDongLaoDong_LoaiHD', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ TRƯỜNG GIAO DIỆN TỪ DATABASE (API_DongBoTruongGiaoDien)
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HopDongLaoDongFrm', @ObjectName = 'API_HopDongLaoDong';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_HopDongLaoDong_ChiTiet', @ObjectName = 'API_HopDongLaoDong_ChiTiet';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_HopDongLaoDong_Attach', @ObjectName = 'API_HopDongLaoDong_Attach';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN, VỊ TRÍ, ĐỊNH DẠNG (SY_FormatFields)
-- =========================================================================
-- Cấu hình các trường của Master Form
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'MaHopDong' THEN N'Mã hợp đồng'
        WHEN 'NamLap' THEN N'Năm lập'
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên nhân viên'
        WHEN 'LoaiHopDong' THEN N'Loại hợp đồng'
        WHEN 'LoaiHD' THEN N'Loại HD'
        WHEN 'NgayKyHopDong' THEN N'Ngày ký HĐ'
        WHEN 'NgayCoHieuLuc' THEN N'Ngày có hiệu lực'
        WHEN 'NgayHetHieuLuc' THEN N'Ngày hết hiệu lực'
        WHEN 'ThoiGianLamViec' THEN N'Thời gian làm việc'
        WHEN 'ThoiGianThuViec' THEN N'Thử việc (tháng)'
        WHEN 'NguoiKy' THEN N'Người ký'
        WHEN 'ChucVuNguoiKy' THEN N'Chức vụ người ký'
        WHEN 'ChucDanhChuyenMonHD' THEN N'Chức danh chuyên môn'
        WHEN 'LuongCoBan' THEN N'Lương cơ bản'
        WHEN 'MucDong' THEN N'Mức đóng BH'
        WHEN 'LoaiTien' THEN N'Loại tiền'
        WHEN 'HinhThucTraLuong' THEN N'Hình thức trả lương'
        WHEN 'DiaDiemLamViec' THEN N'Địa điểm làm việc'
        WHEN 'PhuongTien' THEN N'Phương tiện đi làm'
        WHEN 'PersonStatus' THEN N'Trạng thái NV'
        WHEN 'CMND' THEN N'Số CCCD/CMND'
        WHEN 'CMNDNgayCap' THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap' THEN N'Nơi cấp CCCD'
        WHEN 'DiaChiThuongTru' THEN N'Địa chỉ thường trú'
        WHEN 'NoiDung' THEN N'Nội dung hợp đồng'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'UserCreate' THEN N'Người tạo'
        WHEN 'DateCreate' THEN N'Ngày tạo'
        WHEN 'UserUpdate' THEN N'Người cập nhật'
        WHEN 'DateUpdate' THEN N'Ngày cập nhật'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'MaHopDong' THEN 'Contract Code'
        WHEN 'NamLap' THEN 'Year Created'
        WHEN 'PersonID' THEN 'Employee ID'
        WHEN 'PersonName' THEN 'Employee Name'
        WHEN 'LoaiHopDong' THEN 'Contract Type'
        WHEN 'LoaiHD' THEN 'Contract Group'
        WHEN 'NgayKyHopDong' THEN 'Date Signed'
        WHEN 'NgayCoHieuLuc' THEN 'Effective Date'
        WHEN 'NgayHetHieuLuc' THEN 'Expiry Date'
        WHEN 'ThoiGianLamViec' THEN 'Working Hours'
        WHEN 'ThoiGianThuViec' THEN 'Probation (months)'
        WHEN 'NguoiKy' THEN 'Signatory'
        WHEN 'ChucVuNguoiKy' THEN 'Signatory Position'
        WHEN 'ChucDanhChuyenMonHD' THEN 'Professional Title'
        WHEN 'LuongCoBan' THEN 'Basic Salary'
        WHEN 'MucDong' THEN 'Insurance Contribution'
        WHEN 'LoaiTien' THEN 'Currency'
        WHEN 'HinhThucTraLuong' THEN 'Payment Method'
        WHEN 'DiaDiemLamViec' THEN 'Working Location'
        WHEN 'PhuongTien' THEN 'Transport'
        WHEN 'PersonStatus' THEN 'Employee Status'
        WHEN 'CMND' THEN 'National ID'
        WHEN 'CMNDNgayCap' THEN 'ID Issued Date'
        WHEN 'CMNDNoiCap' THEN 'ID Issued Place'
        WHEN 'DiaChiThuongTru' THEN 'Permanent Address'
        WHEN 'NoiDung' THEN 'Contract Content'
        WHEN 'BranchID' THEN 'Branch'
        WHEN 'UserCreate' THEN 'Creator'
        WHEN 'DateCreate' THEN 'Created Date'
        WHEN 'UserUpdate' THEN 'Updater'
        WHEN 'DateUpdate' THEN 'Updated Date'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'CMNDNgayCap', 'DateCreate', 'DateUpdate') THEN 'd' -- Date format
        WHEN FieldName IN ('LuongCoBan', 'MucDong', 'ThoiGianThuViec') THEN 'n' -- Numeric/Money format
        WHEN FieldName IN ('PersonID', 'LoaiHopDong', 'BranchID', 'NamLap', 'LoaiHD') THEN 'sl' -- Select List (Dropdown)
        ELSE 't' -- Text format
    END,
    FormPosition = CASE
        WHEN FieldName IN ('MaHopDong', 'NamLap', 'PersonID', 'PersonName', 'LoaiHopDong', 'LoaiHD', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'UserCreate', 'DateCreate') THEN 'grid'
        WHEN FieldName IN ('NoiDung') THEN '12' -- full row text area in form
        ELSE '6' -- normal two-column layout input
    END,
    ShowInAdd = CASE WHEN FieldName IN ('BranchID', 'PersonName', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'DiaChiThuongTru', 'UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PersonStatus') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('BranchID', 'PersonName', 'CMND', 'CMNDNgayCap', 'CMNDNoiCap', 'DiaChiThuongTru', 'UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate') THEN 0 ELSE 1 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('MaHopDong', 'PersonID', 'PersonStatus') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('MaHopDong', 'PersonID') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('NamLap', 'BranchID', 'LoaiHD') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl'
        WHEN FieldName = 'LoaiHopDong' THEN N'STATIC:Không thời hạn|Không thời hạn,Có thời hạn|Có thời hạn'
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'NamLap' THEN 'API_HopDongLaoDong_NamLap'
        WHEN FieldName = 'LoaiHD' THEN 'API_HopDongLaoDong_LoaiHD'
        ELSE NULL
    END,
    OrderNo = CASE FieldName
        WHEN 'MaHopDong' THEN 1
        WHEN 'NamLap' THEN 2
        WHEN 'PersonID' THEN 3
        WHEN 'PersonName' THEN 4
        WHEN 'LoaiHopDong' THEN 5
        WHEN 'LoaiHD' THEN 6
        WHEN 'NgayKyHopDong' THEN 7
        WHEN 'NgayCoHieuLuc' THEN 8
        WHEN 'NgayHetHieuLuc' THEN 9
        WHEN 'ThoiGianLamViec' THEN 10
        WHEN 'ThoiGianThuViec' THEN 11
        WHEN 'NguoiKy' THEN 12
        WHEN 'ChucVuNguoiKy' THEN 13
        WHEN 'ChucDanhChuyenMonHD' THEN 14
        WHEN 'LuongCoBan' THEN 15
        WHEN 'MucDong' THEN 16
        WHEN 'LoaiTien' THEN 17
        WHEN 'HinhThucTraLuong' THEN 18
        WHEN 'DiaDiemLamViec' THEN 19
        WHEN 'PhuongTien' THEN 20
        WHEN 'PersonStatus' THEN 21
        WHEN 'CMND' THEN 22
        WHEN 'CMNDNgayCap' THEN 23
        WHEN 'CMNDNoiCap' THEN 24
        WHEN 'DiaChiThuongTru' THEN 25
        WHEN 'NoiDung' THEN 26
        WHEN 'UserCreate' THEN 27
        WHEN 'DateCreate' THEN 28
        ELSE 99
    END
WHERE FormName = 'WA_HopDongLaoDongFrm';

-- Cấu hình các trường cho Detail Grid
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'MaPhuCap' THEN N'Mã phụ cấp'
        WHEN 'TenPhuCap' THEN N'Tên phụ cấp'
        WHEN 'TienPhuCap' THEN N'Tiền phụ cấp'
        WHEN 'TienPhuCapNgay' THEN N'PC theo ngày'
        WHEN 'TienPhuCapThang' THEN N'PC theo tháng'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'MaPhuCap' THEN 'Allowance Code'
        WHEN 'TenPhuCap' THEN 'Allowance Name'
        WHEN 'TienPhuCap' THEN 'Allowance Value'
        WHEN 'TienPhuCapNgay' THEN 'Daily Allowance'
        WHEN 'TienPhuCapThang' THEN 'Monthly Allowance'
        WHEN 'GhiChu' THEN 'Notes'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 'n' -- number/money
        WHEN FieldName = 'MaPhuCap' THEN 'sl' -- select list
        ELSE 't'
    END,
    FormPosition = 'grid',
    ShowInAdd = CASE WHEN FieldName IN ('TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang') THEN 0 ELSE 1 END,
    IsRequired = CASE WHEN FieldName = 'MaPhuCap' THEN 1 ELSE 0 END,
    DataSource = CASE WHEN FieldName = 'MaPhuCap' THEN 'WA_BangPhuCapFrm' ELSE NULL END, -- Chọn phụ cấp từ bảng phụ cấp
    OrderNo = CASE FieldName
        WHEN 'MaPhuCap' THEN 1
        WHEN 'TenPhuCap' THEN 2
        WHEN 'TienPhuCap' THEN 3
        WHEN 'TienPhuCapNgay' THEN 4
        WHEN 'TienPhuCapThang' THEN 5
        WHEN 'GhiChu' THEN 6
        ELSE 99
    END
WHERE FormName = 'API_HopDongLaoDong_ChiTiet';
GO

-- Cấu hình các trường cho Detail Attach
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'FileName' THEN N'Tên tệp'
        WHEN 'FileType' THEN N'Loại tệp'
        WHEN 'STT' THEN N'Số thứ tự'
        WHEN 'FileSize' THEN N'Kích thước'
        WHEN 'Content' THEN N'Nội dung tệp nhị phân'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'FileName' THEN 'File Name'
        WHEN 'FileType' THEN 'File Type'
        WHEN 'STT' THEN 'Order No'
        WHEN 'FileSize' THEN 'File Size'
        WHEN 'Content' THEN 'Binary Content'
        ELSE FieldName
    END,
    FormatID = 't',
    FormPosition = 'grid',
    ShowInAdd = 1,
    ShowInEdit = 1,
    IsRequired = 0,
    OrderNo = CASE FieldName
        WHEN 'FileName' THEN 1
        WHEN 'FileType' THEN 2
        WHEN 'STT' THEN 3
        WHEN 'FileSize' THEN 4
        ELSE 99
    END
WHERE FormName = 'API_HopDongLaoDong_Attach';
GO

-- =========================================================================
-- 6. THÊM MENU TRÊN WEB (WA_Menu)
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2021',
    '20', -- Parent 20 cho Quản lý Nhân sự
    N'Hợp đồng lao động',
    'Labor Contracts',
    'WA_HopDongLaoDongFrm',
    'WA_HOPDONGLAODONGFRM',
    '#/2021',
    'assignment', -- Icon Class cho Hợp đồng
    0
);
GO

-- Đồng bộ quyền truy cập
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Thanh cong: Da dang ky WA_HopDongLaoDongFrm, API_HopDongLaoDong_ChiTiet va WA_Menu!';
GO
