[ignoring loop detection]
USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_DanhSachUngVienFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_DanhSachUngVienFrm');
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.WA_API WHERE list = 'WA_DanhSachUngVienFrm';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_PhongVan';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_KinhNghiem';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_HocVan';
DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyUngVien_ChungChi';
DELETE FROM dbo.WA_Menu WHERE FormName = 'WA_DanhSachUngVienFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES 
    (N'WA_DanhSachUngVienFrm', N'EDIT', N'Danh sách ứng viên', N'Candidate List', N'HR_UngVienTbl', N'CandidateID', N'Danh sách ứng viên');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
-- Master Table
(NEWID(), N'WA_DanhSachUngVienFrm', N'T0', N'TN', N'HR_UngVienTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T0', N'PK', N'CandidateID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'DPR', N'', N'UV', N'', GETDATE(), N''),

-- Detail Table 1: Phỏng vấn (HR_UngVienPhongVanTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'TN', N'HR_UngVienPhongVanTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T1', N'DCP', N'Phỏng vấn', N'', GETDATE(), N''),

-- Detail Table 2: Kinh nghiệm (HR_UngVienKinhNghiemTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'TN', N'HR_UngVienKinhNghiemTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T2', N'DCP', N'Kinh nghiệm', N'', GETDATE(), N''),

-- Detail Table 3: Học vấn (HR_UngVienHocVanTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'TN', N'HR_UngVienHocVanTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T3', N'DCP', N'Học vấn', N'', GETDATE(), N''),

-- Detail Table 4: Chứng chỉ (HR_UngVienChungChiTbl)
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'TN', N'HR_UngVienChungChiTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(NEWID(), N'WA_DanhSachUngVienFrm', N'T4', N'DCP', N'Chứng chỉ', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- API View chính (danh sách ứng viên)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_DanhSachUngVienFrm', 'View', 'API_QuanLyUngVien', '@Keyword=N''{Keyword}''');

-- API Detail tab 1: Phỏng vấn
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_PhongVan', 'View', 'API_QuanLyUngVien_PhongVan', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 2: Kinh nghiệm
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_KinhNghiem', 'View', 'API_QuanLyUngVien_KinhNghiem', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 3: Học vấn
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_HocVan', 'View', 'API_QuanLyUngVien_HocVan', '@CandidateID=N''{CandidateID}''');

-- API Detail tab 4: Chứng chỉ
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyUngVien_ChungChi', 'View', 'API_QuanLyUngVien_ChungChi', '@CandidateID=N''{CandidateID}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_QuanLyUngVien)
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_DanhSachUngVienFrm',
    @ObjectName = 'API_QuanLyUngVien';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN HIỂN THỊ CỘT TRÊN GIAO DIỆN (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = CASE FieldName
        WHEN 'CandidateID' THEN N'Mã ứng viên'
        WHEN 'FullName' THEN N'Họ tên ứng viên'
        WHEN 'NgaySinh' THEN N'Ngày sinh'
        WHEN 'GioiTinh' THEN N'Giới tính'
        WHEN 'SoCCCD' THEN N'Số CCCD/CMND'
        WHEN 'NgayCap' THEN N'Ngày cấp'
        WHEN 'NoiCap' THEN N'Nơi cấp'
        WHEN 'TinhTrangHonNhan' THEN N'Tình trạng hôn nhân'
        WHEN 'SoDienThoai' THEN N'Số điện thoại'
        WHEN 'Email' THEN N'Email'
        WHEN 'DiaChiThuongTru' THEN N'Địa chỉ thường trú'
        WHEN 'DiaChiHienTai' THEN N'Địa chỉ hiện tại'
        WHEN 'LinkedIn' THEN N'LinkedIn'
        WHEN 'ViTriUngTuyen' THEN N'Vị trí ứng tuyển'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'NguonUngTuyen' THEN N'Kênh ứng tuyển'
        WHEN 'NgayUngTuyen' THEN N'Ngày ứng tuyển'
        WHEN 'MucLuongMongMuon' THEN N'Lương mong muốn'
        WHEN 'NgayCoTheDiLam' THEN N'Ngày đi làm'
        WHEN 'KyNangChuyenMon' THEN N'Kỹ năng chuyên môn'
        WHEN 'KyNangMem' THEN N'Kỹ năng mềm'
        WHEN 'NgoaiNgu' THEN N'Ngoại ngữ'
        WHEN 'TinHoc' THEN N'Tin học'
        WHEN 'TrangThaiHR' THEN N'Trạng thái HR'
        WHEN 'DiemDanhGia' THEN N'Điểm đánh giá'
        WHEN 'NhanXetHR' THEN N'Nhận xét HR'
        WHEN 'NguoiPhuTrach' THEN N'Người phụ trách'
        WHEN 'KetQuaCuoiCung' THEN N'Kết quả cuối cùng'
        WHEN 'MucLuongDeXuat' THEN N'Lương đề xuất'
        WHEN 'NgayOnboard' THEN N'Ngày onboard'
        WHEN 'GhiChuChung' THEN N'Ghi chú chung'
        WHEN 'UserCreate' THEN N'Người tạo'
        WHEN 'DateCreate' THEN N'Ngày tạo'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'CandidateID' THEN 'Candidate ID'
        WHEN 'FullName' THEN 'Full Name'
        WHEN 'NgaySinh' THEN 'Date of Birth'
        WHEN 'GioiTinh' THEN 'Gender'
        WHEN 'SoCCCD' THEN 'ID No.'
        WHEN 'NgayCap' THEN 'Issue Date'
        WHEN 'NoiCap' THEN 'Issue Place'
        WHEN 'TinhTrangHonNhan' THEN 'Marital Status'
        WHEN 'SoDienThoai' THEN 'Phone Number'
        WHEN 'Email' THEN 'Email'
        WHEN 'DiaChiThuongTru' THEN 'Permanent Address'
        WHEN 'DiaChiHienTai' THEN 'Current Address'
        WHEN 'LinkedIn' THEN 'LinkedIn'
        WHEN 'ViTriUngTuyen' THEN 'Applied Position'
        WHEN 'PhongBan' THEN 'Department'
        WHEN 'NguonUngTuyen' THEN 'Source'
        WHEN 'NgayUngTuyen' THEN 'Applied Date'
        WHEN 'MucLuongMongMuon' THEN 'Desired Salary'
        WHEN 'NgayCoTheDiLam' THEN 'Available Date'
        WHEN 'KyNangChuyenMon' THEN 'Technical Skills'
        WHEN 'KyNangMem' THEN 'Soft Skills'
        WHEN 'NgoaiNgu' THEN 'Languages'
        WHEN 'TinHoc' THEN 'IT Skills'
        WHEN 'TrangThaiHR' THEN 'HR Status'
        WHEN 'DiemDanhGia' THEN 'Score'
        WHEN 'NhanXetHR' THEN 'HR Evaluation'
        WHEN 'NguoiPhuTrach' THEN 'Assignee'
        WHEN 'KetQuaCuoiCung' THEN 'Final Result'
        WHEN 'MucLuongDeXuat' THEN 'Offered Salary'
        WHEN 'NgayOnboard' THEN 'Onboard Date'
        WHEN 'GhiChuChung' THEN 'General Notes'
        WHEN 'UserCreate' THEN 'Creator'
        WHEN 'DateCreate' THEN 'Created Date'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('NgaySinh', 'NgayCap', 'NgayUngTuyen', 'NgayCoTheDiLam', 'NgayOnboard', 'DateCreate') THEN 'd'
        WHEN FieldName IN ('DiemDanhGia', 'MucLuongMongMuon', 'MucLuongDeXuat') THEN 'n'
        WHEN FieldName IN ('GioiTinh', 'TinhTrangHonNhan', 'KetQuaCuoiCung', 'PhongBan') THEN 'sl'
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'GioiTinh' THEN 'STATIC:Nam|Nam,Nữ|Nữ'
        WHEN FieldName = 'TinhTrangHonNhan' THEN N'STATIC:Độc thân|Độc thân,Đã kết hôn|Đã kết hôn'
        WHEN FieldName = 'KetQuaCuoiCung' THEN N'STATIC:Đạt|Đạt,Không đạt|Không đạt'
        WHEN FieldName = 'PhongBan' THEN 'HR_DepartmentListTbl'
        ELSE NULL
    END,
    FormPosition = CASE 
        -- Các cột hiện trên lưới
        WHEN FieldName IN ('CandidateID', 'FullName', 'NgaySinh', 'GioiTinh', 'SoCCCD', 'NgayCap', 'NoiCap', 'TinhTrangHonNhan', 'SoDienThoai', 'Email') THEN 'grid'
        -- Các trường ghi chú dài hiện rộng 12
        WHEN FieldName IN ('DiaChiThuongTru', 'DiaChiHienTai', 'KyNangChuyenMon', 'KyNangMem', 'NhanXetHR', 'GhiChuChung') THEN '12'
        -- Các trường còn lại hiện rộng 6
        ELSE '6'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('CandidateID', 'UserCreate', 'DateCreate') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('CandidateID', 'UserCreate', 'DateCreate') THEN 0 ELSE 1 END,
    IsReadOnlyAdd = 0,
    IsReadOnlyEdit = 0,
    IsRequired = CASE WHEN FieldName IN ('FullName', 'SoDienThoai', 'ViTriUngTuyen') THEN 1 ELSE 0 END,
    ShowInFilter = CASE WHEN FieldName IN ('FullName', 'SoDienThoai', 'ViTriUngTuyen', 'PhongBan') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'CandidateID' THEN 1
        WHEN 'FullName' THEN 2
        WHEN 'NgaySinh' THEN 3
        WHEN 'GioiTinh' THEN 4
        WHEN 'SoCCCD' THEN 5
        WHEN 'NgayCap' THEN 6
        WHEN 'NoiCap' THEN 7
        WHEN 'TinhTrangHonNhan' THEN 8
        WHEN 'SoDienThoai' THEN 9
        WHEN 'Email' THEN 10
        WHEN 'DiaChiThuongTru' THEN 11
        WHEN 'DiaChiHienTai' THEN 12
        WHEN 'LinkedIn' THEN 13
        WHEN 'ViTriUngTuyen' THEN 14
        WHEN 'PhongBan' THEN 15
        WHEN 'NguonUngTuyen' THEN 16
        WHEN 'NgayUngTuyen' THEN 17
        WHEN 'MucLuongMongMuon' THEN 18
        WHEN 'NgayCoTheDiLam' THEN 19
        WHEN 'KyNangChuyenMon' THEN 20
        WHEN 'KyNangMem' THEN 21
        WHEN 'NgoaiNgu' THEN 22
        WHEN 'TinHoc' THEN 23
        WHEN 'TrangThaiHR' THEN 24
        WHEN 'DiemDanhGia' THEN 25
        WHEN 'NhanXetHR' THEN 26
        WHEN 'NguoiPhuTrach' THEN 27
        WHEN 'KetQuaCuoiCung' THEN 28
        WHEN 'MucLuongDeXuat' THEN 29
        WHEN 'NgayOnboard' THEN 30
        WHEN 'GhiChuChung' THEN 31
        ELSE 99
    END
WHERE FormName = 'WA_DanhSachUngVienFrm';
GO

PRINT 'Da thiet lap WA_DanhSachUngVienFrm (Danh sach ung vien) voi MenuID 2027 thanh cong!';
GO
