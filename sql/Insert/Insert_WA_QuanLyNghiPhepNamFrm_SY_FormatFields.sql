USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID  IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_QuanLyNghiPhepNamFrm');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.SY_FormatFields  WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.WA_API           WHERE list = 'WA_QuanLyNghiPhepNamFrm';
DELETE FROM dbo.WA_API           WHERE list = 'API_QuanLyNghiPhepNam_ChiTiet';
DELETE FROM dbo.WA_Menu          WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
-- Master: HR_PersonTbl (Thông tin nhân viên)
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl 
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES 
    (N'WA_QuanLyNghiPhepNamFrm', N'EDIT', N'Quản lý nghỉ phép năm', N'Annual Leave Management', N'HR_PersonTbl', N'PersonID', N'Quản lý nghỉ phép năm');
GO

-- =========================================================================
-- 3. CẤU HÌNH THUỘC TÍNH MASTER-DETAIL (SY_FrmCfg)
-- =========================================================================
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])
VALUES
-- Master
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T0', N'TN', N'HR_PersonTbl',         N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T0', N'PK', N'PersonID',              N'', GETDATE(), N''),
-- Detail: Phép năm
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'TN', N'HR_PersonNghiPhepTbl', N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'PK', N'UserAutoID',            N'', GETDATE(), N''),
(NEWID(), N'WA_QuanLyNghiPhepNamFrm', N'T1', N'DCP', N'Phép năm',             N'', GETDATE(), N'');
GO

-- =========================================================================
-- 4. ĐĂNG KÝ CẤU HÌNH API (WA_API)
-- =========================================================================
-- API View chính (danh sách nhân viên)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('WA_QuanLyNghiPhepNamFrm', 'View', 'API_QuanLyNghiPhepNam',
        '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @PersonName=N''{PersonName}''');

-- API Detail tab: Lịch sử phép năm theo PersonID
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_QuanLyNghiPhepNam_ChiTiet', 'View', 'API_QuanLyNghiPhepNam_ChiTiet', '@PersonID=N''{PersonID}''');
GO

-- =========================================================================
-- 5. ĐỒNG BỘ CỘT GIAO DIỆN TỪ SP API_QuanLyNghiPhepNam
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_QuanLyNghiPhepNamFrm',
    @ObjectName = 'API_QuanLyNghiPhepNam';
GO

-- =========================================================================
-- 6. CẤU HÌNH NHÃN + HIỂN THỊ CỘT TRÊN LƯỚI MASTER (SY_FormatFields)
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID'          THEN N'Mã nhân viên'
        WHEN 'PersonName'        THEN N'Họ tên'
        WHEN 'PhongBan'          THEN N'Bộ phận'
        WHEN 'TitleName'         THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        WHEN 'NgaySinh'          THEN N'Ngày sinh'
        WHEN 'CMND'              THEN N'CCCD'
        WHEN 'DiaChiThuongTru'   THEN N'Địa chỉ thường trú'
        WHEN 'NationName'        THEN N'Quốc gia'
        WHEN 'NgayVaoLam'        THEN N'Ngày nhận việc'
        WHEN 'SoHopDong'         THEN N'Số hợp đồng'
        WHEN 'NgayHopDong'       THEN N'Ngày hợp đồng'
        WHEN 'BranchID'          THEN N'Chi nhánh'
        WHEN 'DienThoai'         THEN N'Điện thoại'
        ELSE FieldName
    END,
    CaptionEN = CASE FieldName
        WHEN 'PersonID'          THEN 'Employee ID'
        WHEN 'PersonName'        THEN 'Full Name'
        WHEN 'PhongBan'          THEN 'Department'
        WHEN 'TitleName'         THEN 'Title'
        WHEN 'ChucDanhChuyenMon' THEN 'Professional title'
        WHEN 'NgaySinh'          THEN 'Date of Birth'
        WHEN 'CMND'              THEN 'ID/Passport'
        WHEN 'DiaChiThuongTru'   THEN 'Permanent Address'
        WHEN 'NationName'        THEN 'Country'
        WHEN 'NgayVaoLam'        THEN 'Hire Date'
        WHEN 'SoHopDong'         THEN 'Contract No'
        WHEN 'NgayHopDong'       THEN 'Contract Date'
        WHEN 'BranchID'          THEN 'Branch'
        WHEN 'DienThoai'         THEN 'Phone'
        ELSE FieldName
    END,
    FormatID = CASE
        WHEN FieldName IN ('NgaySinh', 'NgayVaoLam', 'NgayHopDong') THEN 'd'
        WHEN FieldName IN ('BranchID')  THEN 'sl'   -- Filter dropdown Chi nhánh
        WHEN FieldName IN ('PhongBan')  THEN 'sl'   -- Filter dropdown Bộ phận
        ELSE 't'
    END,
    DataSource = CASE
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PhongBan' THEN 'HR_DepartmentListTbl'
        ELSE NULL
    END,
    FormPosition = 'grid',
    ShowInAdd  = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName = 'PersonID' THEN 0 ELSE 1 END,
    IsReadOnlyAdd  = 1,
    IsReadOnlyEdit = 1,
    IsRequired     = 0,
    ShowInFilter   = CASE WHEN FieldName IN ('BranchID', 'PhongBan', 'PersonName') THEN 1 ELSE 0 END,
    OrderNo = CASE FieldName
        WHEN 'PersonID'          THEN 1
        WHEN 'PersonName'        THEN 2
        WHEN 'PhongBan'          THEN 3
        WHEN 'TitleName'         THEN 4
        WHEN 'ChucDanhChuyenMon' THEN 5
        WHEN 'NgaySinh'          THEN 6
        WHEN 'CMND'              THEN 7
        WHEN 'DiaChiThuongTru'   THEN 8
        WHEN 'NationName'        THEN 9
        WHEN 'NgayVaoLam'        THEN 10
        WHEN 'SoHopDong'         THEN 11
        WHEN 'NgayHopDong'       THEN 12
        WHEN 'BranchID'          THEN 13
        WHEN 'DienThoai'         THEN 14
        ELSE 99
    END
WHERE FormName = 'WA_QuanLyNghiPhepNamFrm';
GO

-- =========================================================================
-- 7. THÊM MENU (WA_Menu) — MenuID 2054
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2106',
    '21',
    N'Quản lý nghỉ phép năm',
    'Annual Leave Management',
    'WA_QuanLyNghiPhepNamFrm',
    '',
    '#/2106',
    'event_available',
    0
);
GO

PRINT 'Da thiet lap WA_QuanLyNghiPhepNamFrm (Quan ly nghi phep nam - Master/Detail) voi MenuID 2106 thanh cong!';
GO
