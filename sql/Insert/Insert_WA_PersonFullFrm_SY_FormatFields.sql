
-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID  IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_PersonFullFrm');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID = 'WA_PersonFullFrm';
DELETE FROM dbo.SY_FormatFields  WHERE FormName = 'WA_PersonFullFrm';
DELETE FROM dbo.WA_Menu          WHERE FormName = 'WA_PersonFullFrm' OR MenuID = '2010';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES 
    (N'WA_PersonFullFrm', N'EDIT', N'Hồ sơ nhân viên tổng hợp', N'General Employee Profile', N'HR_PersonTbl', N'PersonID', N'Hồ sơ nhân viên tổng hợp');
GO

-- =========================================================================
-- 3. CẤU HÌNH LIÊN KẾT MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])
VALUES
-- Master (T0)
(NEWID(), N'WA_PersonFullFrm', N'T0', N'TN', N'HR_PersonTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T0', N'PK', N'PersonID',              N'', GETDATE(), N''),

-- Detail Tab 1: Sơ yếu lý lịch (HR_PersonSalaryTbl)
(NEWID(), N'WA_PersonFullFrm', N'T1', N'TN', N'HR_PersonSalaryTbl',   N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T1', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T1', N'DCP', N'Sơ yếu lý lịch',       N'', GETDATE(), N''),

-- Detail Tab 2: Lương & Phụ cấp (HR_PersonAllowanceTbl)
(NEWID(), N'WA_PersonFullFrm', N'T2', N'TN', N'HR_PersonAllowanceTbl',N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T2', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T2', N'DCP', N'Lương & Phụ cấp',      N'', GETDATE(), N''),

-- Detail Tab 3: Khen thưởng - Kỷ luật (HR_PersonKTKLTbl)
(NEWID(), N'WA_PersonFullFrm', N'T3', N'TN', N'HR_PersonKTKLTbl',     N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T3', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T3', N'DCP', N'Khen thưởng - Kỷ luật',N'', GETDATE(), N''),

-- Detail Tab 4: Khai báo phép năm (HR_PersonNghiPhepTbl)
(NEWID(), N'WA_PersonFullFrm', N'T4', N'TN', N'HR_PersonNghiPhepTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T4', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T4', N'DCP', N'Khai báo phép năm',    N'', GETDATE(), N''),

-- Detail Tab 5: Gia cảnh & Mối liên hệ (HR_PersonRelationTbl)
(NEWID(), N'WA_PersonFullFrm', N'T5', N'TN', N'HR_PersonRelationTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T5', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T5', N'DCP', N'Gia cảnh & Liên hệ',   N'', GETDATE(), N''),

-- Detail Tab 6: Lịch sử hợp đồng (HR_HopDongTbl)
(NEWID(), N'WA_PersonFullFrm', N'T6', N'TN', N'HR_HopDongTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T6', N'PK', N'MaHopDong',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T6', N'DCP', N'Lịch sử hợp đồng',     N'', GETDATE(), N''),

-- Detail Tab 7: Lịch sử công tác (HR_LichSuCongTacTbl)
(NEWID(), N'WA_PersonFullFrm', N'T7', N'TN', N'HR_LichSuCongTacTbl',   N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T7', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T7', N'DCP', N'Lịch sử công tác',     N'', GETDATE(), N''),

-- Detail Tab 8: Lịch sử công việc (HR_PersonLogTbl)
(NEWID(), N'WA_PersonFullFrm', N'T8', N'TN', N'HR_PersonLogTbl',       N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T8', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T8', N'DCP', N'Lịch sử công việc',     N'', GETDATE(), N''),

-- Detail Tab 9: Giấy tờ (HR_PersonGiayToTbl)
(NEWID(), N'WA_PersonFullFrm', N'T9', N'TN', N'HR_PersonGiayToTbl',    N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T9', N'PK', N'DocumentID',            N'', GETDATE(), N''),
(NEWID(), N'WA_PersonFullFrm', N'T9', N'DCP', N'Giấy tờ',              N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ SP API_HoSoNhanVien
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_PersonFullFrm',
    @ObjectName = 'API_HoSoNhanVien';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN + HIỂN THỊ CỘT TRÊN LƯỚI MASTER (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID'                  THEN N'Mã nhân viên'
        WHEN 'PersonName'                THEN N'Họ tên'
        WHEN 'GioiTinh'                  THEN N'Giới tính'
        WHEN 'PhongBan'                  THEN N'Bộ phận'
        WHEN 'TitleName'                 THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon'         THEN N'Chức danh chuyên môn'
        WHEN 'NgaySinh'                  THEN N'Ngày sinh'
        WHEN 'CMND'                      THEN N'CCCD'
        WHEN 'DiaChiThuongTru'           THEN N'Địa chỉ thường trú'
        WHEN 'NgayVaoLam'                THEN N'Ngày nhận việc'
        WHEN 'BranchID'                  THEN N'Chi nhánh'
        WHEN 'NgayHopDong'               THEN N'Ngày hợp đồng'
        WHEN 'NationName'                THEN N'Quốc gia'
        WHEN 'SoHopDong'                 THEN N'Số hợp đồng'
        WHEN 'DienThoai'                 THEN N'Điện thoại'
        WHEN 'PersonStatus'              THEN N'Mã trạng thái'
        WHEN 'NewPersonID'               THEN N'Mã NV cũ'
        WHEN 'CardNo'                    THEN N'Mã số thẻ'
        WHEN 'ProvineName'               THEN N'Tỉnh thành'
        WHEN 'DiaChiHienNay'             THEN N'Địa chỉ hiện nay'
        WHEN 'Quanly'                    THEN N'Người quản lý'
        WHEN 'NgayThuViec'               THEN N'Ngày thử việc'
        WHEN 'BankHolder'                THEN N'Chủ tài khoản NH'
        WHEN 'BankAccountNo'             THEN N'Số tài khoản NH'
        WHEN 'BankName'                  THEN N'Tên ngân hàng'
        WHEN 'BankLocation'              THEN N'Chi nhánh NH'
        WHEN 'SocialID'                  THEN N'Số thẻ BHXH'
        WHEN 'SocialDate'                THEN N'Ngày BĐ đóng BHXH'
        WHEN 'NgayKetThucBH'             THEN N'Ngày kết thúc BHXH'
        WHEN 'ShiftID'                   THEN N'Ca làm việc'
        WHEN 'SoTheBHYT'                 THEN N'Số thẻ BHYT'
        WHEN 'ThoiGianHuongBHYT'         THEN N'Thời gian hưởng BHYT'
        WHEN 'NoiDangKyBHYT'             THEN N'Nơi ĐK KCB ban đầu'
        WHEN 'ChamCong'                  THEN N'Có chấm công'
        WHEN 'LoaiHopDong'               THEN N'Loại hợp đồng'
        WHEN 'NgayHetHopDong'            THEN N'Ngày hết hiệu lực HĐ'
        WHEN 'NguoiLienHe'               THEN N'Người liên hệ khẩn cấp'
        WHEN 'MoiQuanHe'                 THEN N'Mối quan hệ người LH'
        WHEN 'NguoiLienHeSoDT'           THEN N'Số ĐT người liên hệ'
        WHEN 'FileName'                  THEN N'Tên file ảnh'
        WHEN 'Base64Content'             THEN N'Ảnh 3x4'
        WHEN 'MaNVChamCong'              THEN N'Mã NV chấm công'
        WHEN 'PersonName2'               THEN N'Tên gọi khác'
        WHEN 'PostionName'               THEN N'Vị trí công việc'
        WHEN 'NgayNghiViec'              THEN N'Ngày nghỉ việc'
        WHEN 'WorkingGroupName'          THEN N'Tổ/nhóm làm việc'
        WHEN 'DungCuLamViec'             THEN N'Dụng cụ làm việc'
        WHEN 'GhiChu'                    THEN N'Ghi chú'
        WHEN 'LocationID'                THEN N'Địa điểm làm việc'
        WHEN 'NgayDuKienTV'              THEN N'Ngày DK thử việc'
        WHEN 'UserCreate'                THEN N'Người tạo'
        WHEN 'UserUpdate'                THEN N'Người cập nhật'
        WHEN 'DateUpdate'                THEN N'Ngày cập nhật'
        WHEN 'DateCreate'                THEN N'Ngày tạo'
        WHEN 'DiaChiTamTru'              THEN N'Địa chỉ tạm trú'
        WHEN 'isTaiTuyen'                THEN N'Đã tái tuyển'
        WHEN 'PersonStatusName'          THEN N'Trạng thái'
        WHEN 'HonNhan'                   THEN N'Tình trạng hôn nhân'
        WHEN 'CMNDNgayCap'               THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap'                THEN N'Nơi cấp CCCD'
        WHEN 'NoiSinh'                   THEN N'Nơi sinh'
        WHEN 'PeoplesName'               THEN N'Dân tộc'
        WHEN 'ReligionName'              THEN N'Tôn giáo'
        WHEN 'Email'                     THEN N'Email'
        WHEN 'EducationName'             THEN N'Trình độ học vấn'
        WHEN 'Nationality'               THEN N'Quốc tịch'
        WHEN 'JobName'                   THEN N'Nghề nghiệp'
        WHEN 'CareerName'                THEN N'Chuyên ngành'
        WHEN 'HospitalName'              THEN N'Nơi KCB'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID'                  THEN 'Employee ID'
        WHEN 'PersonName'                THEN 'Full Name'
        WHEN 'GioiTinh'                  THEN 'Gender'
        WHEN 'PhongBan'                  THEN 'Department'
        WHEN 'TitleName'                 THEN 'Title'
        WHEN 'ChucDanhChuyenMon'         THEN 'Professional Title'
        WHEN 'NgaySinh'                  THEN 'Date of Birth'
        WHEN 'CMND'                      THEN 'ID/Passport'
        WHEN 'DiaChiThuongTru'           THEN 'Permanent Address'
        WHEN 'NgayVaoLam'                THEN 'Hire Date'
        WHEN 'BranchID'                  THEN 'Branch'
        WHEN 'NgayHopDong'               THEN 'Contract Date'
        WHEN 'NationName'                THEN 'Country'
        WHEN 'SoHopDong'                 THEN 'Contract No'
        WHEN 'DienThoai'                 THEN 'Phone'
        WHEN 'PersonStatus'              THEN 'Status ID'
        WHEN 'NewPersonID'               THEN 'Old Employee ID'
        WHEN 'CardNo'                    THEN 'Card No'
        WHEN 'ProvineName'               THEN 'City/Province'
        WHEN 'DiaChiHienNay'             THEN 'Current Address'
        WHEN 'Quanly'                    THEN 'Manager'
        WHEN 'NgayThuViec'               THEN 'Probation Date'
        WHEN 'BankHolder'                THEN 'Bank Acc Holder'
        WHEN 'BankAccountNo'             THEN 'Bank Acc No'
        WHEN 'BankName'                  THEN 'Bank Name'
        WHEN 'BankLocation'              THEN 'Bank Branch'
        WHEN 'SocialID'                  THEN 'Social Insurance No'
        WHEN 'SocialDate'                THEN 'SI Start Date'
        WHEN 'NgayKetThucBH'             THEN 'SI End Date'
        WHEN 'ShiftID'                   THEN 'Default Shift'
        WHEN 'SoTheBHYT'                 THEN 'Health Insurance No'
        WHEN 'ThoiGianHuongBHYT'         THEN 'HI Effective Date'
        WHEN 'NoiDangKyBHYT'             THEN 'KCB Initial Place'
        WHEN 'ChamCong'                  THEN 'Has Timekeeping'
        WHEN 'LoaiHopDong'               THEN 'Contract Type'
        WHEN 'NgayHetHopDong'            THEN 'Contract Expiry'
        WHEN 'NguoiLienHe'               THEN 'Emergency Contact'
        WHEN 'MoiQuanHe'                 THEN 'Relationship'
        WHEN 'NguoiLienHeSoDT'           THEN 'Contact Phone'
        WHEN 'FileName'                  THEN 'File Name'
        WHEN 'Base64Content'             THEN '3x4 Photo'
        WHEN 'MaNVChamCong'              THEN 'Timekeeping ID'
        WHEN 'PersonName2'               THEN 'Alias/Other Name'
        WHEN 'PostionName'               THEN 'Position'
        WHEN 'NgayNghiViec'              THEN 'Resignation Date'
        WHEN 'WorkingGroupName'          THEN 'Working Group'
        WHEN 'DungCuLamViec'             THEN 'Working Tools'
        WHEN 'GhiChu'                    THEN 'Notes'
        WHEN 'LocationID'                THEN 'Work Location'
        WHEN 'NgayDuKienTV'              THEN 'Expected Probation Date'
        WHEN 'UserCreate'                THEN 'Created By'
        WHEN 'UserUpdate'                THEN 'Updated By'
        WHEN 'DateUpdate'                THEN 'Updated Date'
        WHEN 'DateCreate'                THEN 'Created Date'
        WHEN 'DiaChiTamTru'              THEN 'Temporary Address'
        WHEN 'isTaiTuyen'                THEN 'Re-hired'
        WHEN 'PersonStatusName'          THEN 'Status'
        WHEN 'HonNhan'                   THEN 'Marital Status'
        WHEN 'CMNDNgayCap'               THEN 'ID Issue Date'
        WHEN 'CMNDNoiCap'                THEN 'ID Issue Place'
        WHEN 'NoiSinh'                   THEN 'Place of Birth'
        WHEN 'PeoplesName'               THEN 'Ethnicity'
        WHEN 'ReligionName'              THEN 'Religion'
        WHEN 'Email'                     THEN 'Email'
        WHEN 'EducationName'             THEN 'Education'
        WHEN 'Nationality'               THEN 'Nationality'
        WHEN 'JobName'                   THEN 'Job'
        WHEN 'CareerName'                THEN 'Career'
        WHEN 'HospitalName'              THEN 'Hospital'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayHetHopDong', 'NgayNghiViec', 'NgayDuKienTV', 'DateCreate', 'DateUpdate', 'CMNDNgayCap') THEN 'd'
        WHEN FieldName IN ('BranchID', 'PhongBan', 'ShiftID', 'PersonStatus', 'GioiTinh') THEN 'sl'
        WHEN FieldName IN ('ChamCong', 'isTaiTuyen') THEN 'sw'
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'BranchID'      THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PhongBan'      THEN 'HR_DepartmentListTbl'
        WHEN FieldName = 'ShiftID'       THEN 'API_HR_DropdownShifts'
        WHEN FieldName = 'PersonStatus'  THEN 'API_ComboPersonStatus'
        WHEN FieldName = 'GioiTinh'      THEN N'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác'
        ELSE NULL
    END,
    FormPosition = CASE 
        -- CÁC TRƯỜNG CƠ BẢN: Hiển thị ở cả Sơ yếu lý lịch (Inline) và Popup Modal ('6' là chia 2 cột)
        WHEN FieldName IN (
            'PersonID', 'NewPersonID', 'PersonName', 'GioiTinh', 'BranchID', 'PhongBan', 
            'TitleName', 'ChucDanhChuyenMon', 'NgayVaoLam', 'NgayThuViec', 
            'PersonStatus', 'ShiftID', 'DienThoai', 'NgaySinh',
            'MaNVChamCong', 'PersonName2', 'PostionName', 'WorkingGroupName',
            'LocationID', 'DiaChiTamTru', 'NgayNghiViec'
        ) THEN '6'
        -- CÁC TRƯỜNG CHI TIẾT CHUYÊN SÂU: Ẩn khỏi Sơ yếu lý lịch, CHỈ hiển thị trên Popup Modal
        ELSE 'grid'
    END,
    ShowInAdd  = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('PersonID', 'UserCreate', 'UserUpdate', 'DateUpdate', 'DateCreate', 'PersonStatusName') THEN 0 ELSE 1 END,
    IsReadOnlyAdd  = 1,
    IsReadOnlyEdit = 1,
    IsRequired     = 0,
    ShowInFilter   = 0,
    OrderNo = CASE FieldName
        WHEN 'PersonID'                  THEN 1
        WHEN 'PersonName'                THEN 2
        WHEN 'GioiTinh'                  THEN 3
        WHEN 'PhongBan'                  THEN 4
        WHEN 'TitleName'                 THEN 5
        WHEN 'ChucDanhChuyenMon'         THEN 6
        WHEN 'NgaySinh'                  THEN 7
        WHEN 'CMND'                      THEN 8
        WHEN 'DiaChiThuongTru'           THEN 9
        WHEN 'NgayVaoLam'                THEN 10
        WHEN 'BranchID'                  THEN 11
        WHEN 'NgayHopDong'               THEN 12
        WHEN 'NationName'                THEN 13
        WHEN 'SoHopDong'                 THEN 14
        WHEN 'DienThoai'                 THEN 15
        WHEN 'PersonStatus'              THEN 16
        WHEN 'NewPersonID'               THEN 17
        WHEN 'CardNo'                    THEN 18
        WHEN 'ProvineName'               THEN 19
        WHEN 'DiaChiHienNay'             THEN 20
        WHEN 'Quanly'                    THEN 21
        WHEN 'NgayThuViec'               THEN 22
        WHEN 'BankHolder'                THEN 23
        WHEN 'BankAccountNo'             THEN 24
        WHEN 'BankName'                  THEN 25
        WHEN 'BankLocation'              THEN 26
        WHEN 'SocialID'                  THEN 27
        WHEN 'SocialDate'                THEN 28
        WHEN 'NgayKetThucBH'             THEN 29
        WHEN 'ShiftID'                   THEN 30
        WHEN 'SoTheBHYT'                 THEN 31
        WHEN 'ThoiGianHuongBHYT'         THEN 32
        WHEN 'NoiDangKyBHYT'             THEN 33
        WHEN 'ChamCong'                  THEN 34
        WHEN 'LoaiHopDong'               THEN 35
        WHEN 'NgayHetHopDong'            THEN 36
        WHEN 'NguoiLienHe'               THEN 37
        WHEN 'MoiQuanHe'                 THEN 38
        WHEN 'NguoiLienHeSoDT'           THEN 39
        WHEN 'MaNVChamCong'              THEN 40
        WHEN 'PersonName2'               THEN 41
        WHEN 'PostionName'               THEN 42
        WHEN 'WorkingGroupName'          THEN 43
        WHEN 'LocationID'                THEN 44
        WHEN 'DiaChiTamTru'              THEN 45
        WHEN 'NgayNghiViec'              THEN 46
        WHEN 'DungCuLamViec'             THEN 47
        WHEN 'GhiChu'                    THEN 48
        WHEN 'NgayDuKienTV'              THEN 49
        WHEN 'isTaiTuyen'                THEN 50
        WHEN 'PersonStatusName'          THEN 51
        WHEN 'UserCreate'                THEN 52
        WHEN 'DateCreate'                THEN 53
        WHEN 'UserUpdate'                THEN 54
        WHEN 'DateUpdate'                THEN 55
        WHEN 'PersonStatus'              THEN 56
        WHEN 'FileName'                  THEN 57
        WHEN 'Base64Content'             THEN 58
        ELSE 99
    END
WHERE FormName = 'WA_PersonFullFrm';
GO

-- =========================================================================
-- 6. THÊM MENU VÀO HỆ THỐNG WEB (WA_Menu) — MenuID 2010
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2010',
    '20',
    N'Hồ sơ nhân viên tổng hợp',
    'General Employee Profile',
    'WA_PersonFullFrm',
    'WA_PERSONFULLFRM',
    '#/2010',
    'assignment_ind',
    0
);
GO

EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da thiet lap WA_PersonFullFrm (Ho so nhan vien tong hop) voi MenuID 2010 thanh cong!';
GO

-- Thêm các cột ảo dùng cho bộ lọc
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'LoaiHD')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonFullFrm', 'LoaiHD', N'Loại HĐ', 'Contract Type', 'sl', 0, 'grid', 0, 0, 0, 0, 100, 1, 'API_DanhSachLoaiHD')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_DanhSachLoaiHD' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'LoaiHD'
END

IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'NamLap')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonFullFrm', 'NamLap', N'Năm Lập', 'Year', 'sl', 0, 'grid', 0, 0, 0, 0, 101, 1, 'API_HopDongLaoDong_NamLap')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_HopDongLaoDong_NamLap' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'NamLap'
END

-- Đảm bảo Chi nhánh hiện bộ lọc
UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'CF_BranchListFrm' WHERE FormName = 'WA_PersonFullFrm' AND FieldName = 'BranchID'
