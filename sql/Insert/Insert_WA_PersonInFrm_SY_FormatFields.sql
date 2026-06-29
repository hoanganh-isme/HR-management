
-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID    IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_PersonInFrm');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID  = 'WA_PersonInFrm';
DELETE FROM dbo.SY_FormatFields  WHERE FormName = 'WA_PersonInFrm';
DELETE FROM dbo.WA_Menu          WHERE FormName = 'WA_PersonInFrm' OR MenuID = '2011';
DELETE FROM dbo.WA_API           WHERE list IN ('WA_PersonInFrm');
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES
    (N'WA_PersonInFrm', N'EDIT', N'Hồ sơ nhân viên (Đang làm việc)', N'Active Employee Profile', N'HR_PersonTbl', N'PersonID', N'Hồ sơ nhân viên (Đang làm việc)');
GO

-- =========================================================================
-- 3. CẤU HÌNH LIÊN KẾT MASTER-DETAIL (SY_FrmCfg)
-- Dùng chung cùng bảng với WA_PersonFullFrm, chỉ khác FormID
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])
VALUES
-- Master (T0)
(NEWID(), N'WA_PersonInFrm', N'T0', N'TN', N'HR_PersonTbl',          N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T0', N'PK', N'PersonID',               N'', GETDATE(), N''),

-- Detail Tab 1: Quá trình làm việc và lương (HR_PersonSalaryTbl)
(NEWID(), N'WA_PersonInFrm', N'T1', N'TN', N'HR_PersonSalaryTbl',    N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T1', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T1', N'DCP', N'Quá trình làm việc và lương', N'', GETDATE(), N''),

-- Detail Tab 2: Lương & Phụ cấp (HR_PersonAllowanceTbl)
(NEWID(), N'WA_PersonInFrm', N'T2', N'TN', N'HR_PersonAllowanceTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T2', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T2', N'DCP', N'Lương & Phụ cấp',       N'', GETDATE(), N''),

-- Detail Tab 3: Khen thưởng - Kỷ luật (HR_PersonKTKLTbl)
(NEWID(), N'WA_PersonInFrm', N'T3', N'TN', N'HR_PersonKTKLTbl',      N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T3', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T3', N'DCP', N'Khen thưởng - Kỷ luật', N'', GETDATE(), N''),

-- Detail Tab 4: Khai báo phép năm (HR_PersonNghiPhepTbl)
(NEWID(), N'WA_PersonInFrm', N'T4', N'TN', N'HR_PersonNghiPhepTbl',  N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T4', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T4', N'DCP', N'Khai báo phép năm',     N'', GETDATE(), N''),

-- Detail Tab 5: Gia cảnh & Mối liên hệ (HR_PersonRelationTbl)
(NEWID(), N'WA_PersonInFrm', N'T5', N'TN', N'HR_PersonRelationTbl',  N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T5', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T5', N'DCP', N'Gia cảnh & Liên hệ',    N'', GETDATE(), N''),

-- Detail Tab 6: Lịch sử hợp đồng (HR_HopDongTbl)
(NEWID(), N'WA_PersonInFrm', N'T6', N'TN', N'HR_HopDongTbl',          N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T6', N'PK', N'MaHopDong',              N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T6', N'DCP', N'Lịch sử hợp đồng',      N'', GETDATE(), N''),

-- Detail Tab 7: Lịch sử công tác (HR_LichSuCongTacTbl)
(NEWID(), N'WA_PersonInFrm', N'T7', N'TN', N'HR_LichSuCongTacTbl',    N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T7', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T7', N'DCP', N'Lịch sử công tác',      N'', GETDATE(), N''),

-- Detail Tab 8: Lịch sử công việc (HR_PersonLogTbl)
(NEWID(), N'WA_PersonInFrm', N'T8', N'TN', N'HR_PersonLogTbl',        N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T8', N'PK', N'UserAutoID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T8', N'DCP', N'Lịch sử công việc',     N'', GETDATE(), N''),

-- Detail Tab 9: Giấy tờ (HR_PersonGiayToTbl)
(NEWID(), N'WA_PersonInFrm', N'T9', N'TN', N'HR_PersonGiayToTbl',     N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T9', N'PK', N'DocumentID',             N'', GETDATE(), N''),
(NEWID(), N'WA_PersonInFrm', N'T9', N'DCP', N'Giấy tờ',               N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ SP API_HoSoNhanVienIn
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName   = 'WA_PersonInFrm',
    @ObjectName = 'API_HoSoNhanVienIn';
GO

-- =========================================================================
-- 5. CẤU HÌNH NHÃN + HIỂN THỊ CỘT TRÊN LƯỚI MASTER (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID'           THEN N'Mã nhân viên'
        WHEN 'PersonName'         THEN N'Họ tên'
        WHEN 'PhongBan'           THEN N'Bộ phận'
        WHEN 'TitleName'          THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon'  THEN N'Chức danh chuyên môn'
        WHEN 'NgaySinh'           THEN N'Ngày sinh'
        WHEN 'CMND'               THEN N'CCCD'
        WHEN 'DiaChiThuongTru'    THEN N'Địa chỉ thường trú'
        WHEN 'NgayVaoLam'         THEN N'Ngày nhận việc'
        WHEN 'BranchID'           THEN N'Chi nhánh'
        WHEN 'NgayHopDong'        THEN N'Ngày hợp đồng'
        WHEN 'NationName'         THEN N'Quốc gia'
        WHEN 'SoHopDong'          THEN N'Số hợp đồng'
        WHEN 'DienThoai'          THEN N'Điện thoại'
        WHEN 'PersonStatus'       THEN N'Trạng thái'
        WHEN 'NewPersonID'        THEN N'Mã nhân viên mới'
        WHEN 'CardNo'             THEN N'Mã số thẻ'
        WHEN 'ProvineName'        THEN N'Tỉnh thành'
        WHEN 'DiaChiHienNay'      THEN N'Địa chỉ hiện nay'
        WHEN 'Quanly'             THEN N'Người quản lý'
        WHEN 'NgayThuViec'        THEN N'Ngày thử việc'
        WHEN 'BankHolder'         THEN N'Chủ tài khoản NH'
        WHEN 'BankAccountNo'      THEN N'Số tài khoản NH'
        WHEN 'BankName'           THEN N'Tên ngân hàng'
        WHEN 'BankLocation'       THEN N'Chi nhánh NH'
        WHEN 'SocialID'           THEN N'Số thẻ BHXH'
        WHEN 'SocialDate'         THEN N'Ngày BĐ đóng BHXH'
        WHEN 'NgayKetThucBH'      THEN N'Ngày kết thúc BHXH'
        WHEN 'ShiftID'            THEN N'Ca làm việc'
        WHEN 'SoTheBHYT'          THEN N'Số thẻ BHYT'
        WHEN 'ThoiGianHuongBHYT'  THEN N'Thời gian hưởng BHYT'
        WHEN 'NoiDangKyBHYT'      THEN N'Nơi ĐK KCB ban đầu'
        WHEN 'ChamCong'           THEN N'Có chấm công'
        WHEN 'LoaiHopDong'        THEN N'Loại hợp đồng'
        WHEN 'NgayHetHopDong'     THEN N'Ngày hết hiệu lực HĐ'
        WHEN 'NguoiLienHe'        THEN N'Người liên hệ khẩn cấp'
        WHEN 'MoiQuanHe'          THEN N'Mối quan hệ người LH'
        WHEN 'NguoiLienHeSoDT'    THEN N'Số ĐT người liên hệ'
        WHEN 'FileName'           THEN N'Tên file ảnh'
        WHEN 'Content'            THEN N'Ảnh 3x4'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID'           THEN 'Employee ID'
        WHEN 'PersonName'         THEN 'Full Name'
        WHEN 'PhongBan'           THEN 'Department'
        WHEN 'TitleName'          THEN 'Title'
        WHEN 'ChucDanhChuyenMon'  THEN 'Professional title'
        WHEN 'NgaySinh'           THEN 'Date of Birth'
        WHEN 'CMND'               THEN 'ID/Passport'
        WHEN 'DiaChiThuongTru'    THEN 'Permanent Address'
        WHEN 'NgayVaoLam'         THEN 'Hire Date'
        WHEN 'BranchID'           THEN 'Branch'
        WHEN 'NgayHopDong'        THEN 'Contract Date'
        WHEN 'NationName'         THEN 'Country'
        WHEN 'SoHopDong'          THEN 'Contract No'
        WHEN 'DienThoai'          THEN 'Phone'
        WHEN 'PersonStatus'       THEN 'Status'
        WHEN 'NewPersonID'        THEN 'New Employee ID'
        WHEN 'CardNo'             THEN 'Card No'
        WHEN 'ProvineName'        THEN 'City/Province'
        WHEN 'DiaChiHienNay'      THEN 'Current Address'
        WHEN 'Quanly'             THEN 'Manager'
        WHEN 'NgayThuViec'        THEN 'Probation Date'
        WHEN 'BankHolder'         THEN 'Bank Acc Holder'
        WHEN 'BankAccountNo'      THEN 'Bank Acc No'
        WHEN 'BankName'           THEN 'Bank Name'
        WHEN 'BankLocation'       THEN 'Bank Branch'
        WHEN 'SocialID'           THEN 'Social Insurance No'
        WHEN 'SocialDate'         THEN 'SI Start Date'
        WHEN 'NgayKetThucBH'      THEN 'SI End Date'
        WHEN 'ShiftID'            THEN 'Default Shift'
        WHEN 'SoTheBHYT'          THEN 'Health Insurance No'
        WHEN 'ThoiGianHuongBHYT'  THEN 'HI Effective Date'
        WHEN 'NoiDangKyBHYT'      THEN 'KCB Initial Place'
        WHEN 'ChamCong'           THEN 'Has Timekeeping'
        WHEN 'LoaiHopDong'        THEN 'Contract Type'
        WHEN 'NgayHetHopDong'     THEN 'Contract Expiry'
        WHEN 'NguoiLienHe'        THEN 'Emergency Contact'
        WHEN 'MoiQuanHe'          THEN 'Relationship'
        WHEN 'NguoiLienHeSoDT'    THEN 'Contact Phone'
        WHEN 'FileName'           THEN 'File Name'
        WHEN 'Content'            THEN '3x4 Photo'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayThuViec',
                           'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayHetHopDong') THEN 'd'
        WHEN FieldName IN ('BranchID', 'PhongBan', 'ShiftID', 'PersonStatus') THEN 'sl'
        WHEN FieldName IN ('ChamCong') THEN 'sw'
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PhongBan' THEN 'HR_DepartmentListTbl'
        WHEN FieldName = 'ShiftID'  THEN 'API_HR_DropdownShifts'
        WHEN FieldName = 'PersonStatus' THEN 'API_ComboPersonStatus'
        ELSE NULL
    END,
    FormPosition = CASE
        WHEN FieldName IN (
            'PersonID', 'PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon',
            'NgaySinh', 'CMND', 'DiaChiThuongTru', 'NgayVaoLam', 'BranchID',
            'NgayHopDong', 'NationName', 'SoHopDong', 'DienThoai', 'PersonStatus'
        ) THEN 'grid'
        ELSE '6'
    END,
    ShowInAdd  = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd  = CASE WHEN FieldName = 'PersonID' THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName = 'PersonID' THEN 1 ELSE 0 END,
    IsRequired     = 0,
    ShowInFilter   = 0,
    OrderNo = CASE FieldName
        WHEN 'PersonID'           THEN 1
        WHEN 'PersonName'         THEN 2
        WHEN 'PhongBan'           THEN 3
        WHEN 'TitleName'          THEN 4
        WHEN 'ChucDanhChuyenMon'  THEN 5
        WHEN 'NgaySinh'           THEN 6
        WHEN 'CMND'               THEN 7
        WHEN 'DiaChiThuongTru'    THEN 8
        WHEN 'NgayVaoLam'         THEN 9
        WHEN 'BranchID'           THEN 10
        WHEN 'NgayHopDong'        THEN 11
        WHEN 'NationName'         THEN 12
        WHEN 'SoHopDong'          THEN 13
        WHEN 'DienThoai'          THEN 14
        WHEN 'PersonStatus'       THEN 15
        WHEN 'NewPersonID'        THEN 16
        WHEN 'CardNo'             THEN 17
        WHEN 'ProvineName'        THEN 18
        WHEN 'DiaChiHienNay'      THEN 19
        WHEN 'Quanly'             THEN 20
        WHEN 'NgayThuViec'        THEN 21
        WHEN 'BankHolder'         THEN 22
        WHEN 'BankAccountNo'      THEN 23
        WHEN 'BankName'           THEN 24
        WHEN 'BankLocation'       THEN 25
        WHEN 'SocialID'           THEN 26
        WHEN 'SocialDate'         THEN 27
        WHEN 'NgayKetThucBH'      THEN 28
        WHEN 'ShiftID'            THEN 29
        WHEN 'SoTheBHYT'          THEN 30
        WHEN 'ThoiGianHuongBHYT'  THEN 31
        WHEN 'NoiDangKyBHYT'      THEN 32
        WHEN 'ChamCong'           THEN 33
        WHEN 'LoaiHopDong'        THEN 34
        WHEN 'NgayHetHopDong'     THEN 35
        WHEN 'NguoiLienHe'        THEN 36
        WHEN 'MoiQuanHe'          THEN 37
        WHEN 'NguoiLienHeSoDT'    THEN 38
        WHEN 'FileName'           THEN 39
        WHEN 'Content'            THEN 40
        ELSE 99
    END
WHERE FormName = 'WA_PersonInFrm';
GO

-- =========================================================================
-- 6. THÊM MENU VÀO HỆ THỐNG WEB (WA_Menu) — MenuID 2011
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2011',
    '20',
    N'Hồ sơ nhân viên (Đang làm việc)',
    'Active Employee Profile',
    'WA_PersonInFrm',
    'WA_PERSONINFRM',
    '#/2011',
    'badge',
    0
);
GO

-- =========================================================================
-- 7. ĐĂNG KÝ WA_API (chuyển từ API_HoSoNhanVienIn.sql)
--    Master: SP riêng lọc PersonStatus IN (1, 4)
--    Detail: Dùng chung API_PersonFull_T* với WA_PersonFullFrm
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES
('WA_PersonInFrm', 'View',   'API_HoSoNhanVienIn', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'''),
('WA_PersonInFrm', 'Save',   'API_LuuDong',         '@List=N''WA_PersonInFrm'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PersonInFrm', 'Delete', 'API_XoaDong',          '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da thiet lap WA_PersonInFrm (Ho so nhan vien dang lam viec) voi MenuID 2011 thanh cong!';
GO

-- Thêm các cột ảo dùng cho bộ lọc
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonInFrm' AND FieldName = 'LoaiHD')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonInFrm', 'LoaiHD', N'Loại HĐ', 'Contract Type', 'sl', 0, 'grid', 0, 0, 0, 0, 100, 1, 'API_DanhSachLoaiHD')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_DanhSachLoaiHD' WHERE FormName = 'WA_PersonInFrm' AND FieldName = 'LoaiHD'
END

IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_PersonInFrm' AND FieldName = 'NamLap')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_PersonInFrm', 'NamLap', N'Năm Lập', 'Year', 'sl', 0, 'grid', 0, 0, 0, 0, 101, 1, 'API_HopDongLaoDong_NamLap')
END
ELSE BEGIN
    UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'API_HopDongLaoDong_NamLap' WHERE FormName = 'WA_PersonInFrm' AND FieldName = 'NamLap'
END

-- Đảm bảo Chi nhánh hiện bộ lọc
UPDATE dbo.SY_FormatFields SET ShowInFilter = 1, DataSource = 'CF_BranchListFrm' WHERE FormName = 'WA_PersonInFrm' AND FieldName = 'BranchID'
