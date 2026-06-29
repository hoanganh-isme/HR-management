USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_BaoCaoNhanSuReport
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg       WHERE FID    IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmDrdwTbl   WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmExpTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmFltTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmCtrTbl    WHERE FormID IN ('WA_BaoCaoNhanSuReport');
DELETE FROM dbo.SY_FrmLstTbl    WHERE FormID  = 'WA_BaoCaoNhanSuReport';
DELETE FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoCaoNhanSuReport';
DELETE FROM dbo.WA_API          WHERE list     = 'WA_BaoCaoNhanSuReport';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ FORM CHÍNH (SY_FrmLstTbl)
--    FormType = 'LIST'  →  Chỉ xem, không cho thêm/sửa/xóa trực tiếp
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl
    ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])
VALUES
    (N'WA_BaoCaoNhanSuReport', N'LIST', N'Báo cáo nhân sự',
     N'HR Personnel Report', N'HR_PersonTbl', N'PersonID', N'人事报告');
GO

-- =========================================================================
-- 3. KHAI BÁO CẤU HÌNH ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BaoCaoNhanSuReport';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BaoCaoNhanSuReport',
    'View',
    'API_BaoCaoNhanSuReportStp',
    '@BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @Keyword=N''{Keyword}'''
);
GO

PRINT 'Da dang ky WA_API [WA_BaoCaoNhanSuReport / View] thanh cong!';
GO

-- =========================================================================
-- 4. ĐỒNG BỘ CỘT GIAO DIỆN TỪ STORED PROCEDURE (API_BaoCaoNhanSuReportStp)
--    Lệnh này tự động quét metadata của SP và INSERT vào SY_FormatFields
-- =========================================================================
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName  = 'WA_BaoCaoNhanSuReport',
    @ObjectName = 'API_BaoCaoNhanSuReportStp';
GO

-- =========================================================================
-- 5. CẤU HÌNH CHI TIẾT NHÃN VÀ ĐỊNH DẠNG TRƯỜNG (SY_FormatFields)
--    Chỉ bao gồm các cột thực tế được SELECT trong API_BaoCaoNhanSuReportStp
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET
    -- ── Nhãn tiếng Việt ────────────────────────────────────────────────
    CaptionVN = CASE FieldName
        -- Định danh
        WHEN 'PersonID'          THEN N'Mã nhân viên'
        WHEN 'NewPersonID'       THEN N'Mã NV cũ'
        WHEN 'PersonName'        THEN N'Họ Tên'
        WHEN 'PersonName2'       THEN N'Tên tiếng Anh'
        WHEN 'GioiTinh'          THEN N'Giới tính'
        WHEN 'NgaySinh'          THEN N'Ngày sinh'
        WHEN 'Tuoi'              THEN N'Tuổi'
        -- CCCD/CMND
        WHEN 'CMND'              THEN N'Số CCCD/CMND'
        WHEN 'CMNDNgayCap'       THEN N'Ngày cấp CCCD'
        WHEN 'CMNDNoiCap'        THEN N'Nơi cấp CCCD'
        -- Liên hệ & địa chỉ
        WHEN 'DienThoai'         THEN N'Điện thoại'
        WHEN 'DiaChiThuongTru'   THEN N'Địa chỉ thường trú'
        WHEN 'DiaChiTamTru'      THEN N'Địa chỉ tạm trú'
        -- Tổ chức
        WHEN 'BranchID'          THEN N'Chi nhánh'
        WHEN 'PhongBan'          THEN N'Mã bộ phận'
        WHEN 'TitleName'         THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        -- Thời gian làm việc
        WHEN 'PersonStatus'      THEN N'Mã trạng thái'
        WHEN 'PersonStatusName'  THEN N'Trạng thái'
        WHEN 'isTaiTuyen'        THEN N'Tái tuyển'
        -- Hợp đồng
        WHEN 'SoHopDong'         THEN N'Số hợp đồng'
        WHEN 'LoaiHopDong'       THEN N'Loại hợp đồng'
        WHEN 'NgayHopDong'       THEN N'Ngày ký HĐ'
        WHEN 'LuongCoBanHD'      THEN N'Lương cơ bản HĐ'
        -- Ngân hàng
        WHEN 'BankName'          THEN N'Tên ngân hàng'
        WHEN 'BankAccountNo'     THEN N'Số tài khoản'
        WHEN 'BankHolder'        THEN N'Chủ tài khoản'
        WHEN 'BankLocation'      THEN N'Chi nhánh NH'
        -- Học vấn / nghề nghiệp / nhân khẩu
        WHEN 'EducationName'     THEN N'Học vấn'
        WHEN 'NationName'        THEN N'Quốc gia'
        WHEN 'Nationality'       THEN N'Quốc tịch'
        WHEN 'PeoplesName'       THEN N'Dân tộc'
        WHEN 'ReligionName'      THEN N'Tôn giáo'
        -- Chấm công
        WHEN 'ChamCong'          THEN N'Chấm công'
        WHEN 'UserID'            THEN N'Mã MCC'
        WHEN 'STT'               THEN N'STT hệ thống'
        -- Audit
        WHEN 'UserCreate'        THEN N'Người tạo'
        WHEN 'UserUpdate'        THEN N'Người sửa'
        WHEN 'DateCreate'        THEN N'Ngày tạo'
        WHEN 'DateUpdate'        THEN N'Ngày sửa'
        ELSE FieldName
    END,

    -- ── Nhãn tiếng Anh ────────────────────────────────────────────────
    CaptionEN = CASE FieldName
        WHEN 'PersonID'          THEN 'Employee ID'
        WHEN 'NewPersonID'       THEN 'Old Employee ID'
        WHEN 'PersonName'        THEN 'Full Name'
        WHEN 'PersonName2'       THEN 'English Name'
        WHEN 'GioiTinh'          THEN 'Gender'
        WHEN 'NgaySinh'          THEN 'Date of Birth'
        WHEN 'Tuoi'              THEN 'Age'
        WHEN 'CMND'              THEN 'ID Card No.'
        WHEN 'CMNDNgayCap'       THEN 'ID Issue Date'
        WHEN 'CMNDNoiCap'        THEN 'ID Issue Place'
        WHEN 'DienThoai'         THEN 'Phone'
        WHEN 'DiaChiThuongTru'   THEN 'Permanent Address'
        WHEN 'DiaChiTamTru'      THEN 'Temporary Address'
        WHEN 'BranchID'          THEN 'Branch'
        WHEN 'PhongBan'          THEN 'Dept. Code'
        WHEN 'TitleName'         THEN 'Title'
        WHEN 'ChucDanhChuyenMon' THEN 'Professional Title'
        WHEN 'PersonStatus'      THEN 'Status Code'
        WHEN 'PersonStatusName'  THEN 'Status'
        WHEN 'isTaiTuyen'        THEN 'Re-hired'
        WHEN 'SoHopDong'         THEN 'Contract No.'
        WHEN 'LoaiHopDong'       THEN 'Contract Type'
        WHEN 'NgayHopDong'       THEN 'Contract Date'
        WHEN 'LuongCoBanHD'      THEN 'Base Salary (Contract)'
        WHEN 'BankName'          THEN 'Bank Name'
        WHEN 'BankAccountNo'     THEN 'Bank Account No.'
        WHEN 'BankHolder'        THEN 'Account Holder'
        WHEN 'BankLocation'      THEN 'Bank Branch'
        WHEN 'EducationName'     THEN 'Education'
        WHEN 'NationName'        THEN 'Country'
        WHEN 'Nationality'       THEN 'Nationality'
        WHEN 'PeoplesName'       THEN 'Ethnicity'
        WHEN 'ReligionName'      THEN 'Religion'
        WHEN 'ChamCong'          THEN 'Timekeeping'
        WHEN 'UserID'            THEN 'User ID'
        WHEN 'STT'               THEN 'System No.'
        WHEN 'UserCreate'        THEN 'Created By'
        WHEN 'UserUpdate'        THEN 'Updated By'
        WHEN 'DateCreate'        THEN 'Created Date'
        WHEN 'DateUpdate'        THEN 'Updated Date'
        ELSE FieldName
    END,

    -- ── Định dạng hiển thị ────────────────────────────────────────────
    FormatID = CASE FieldName
        WHEN 'NgaySinh'       THEN 'dt'
        WHEN 'CMNDNgayCap'    THEN 'dt'
        WHEN 'NgayHopDong'    THEN 'dt'
        WHEN 'DateCreate'     THEN 'dt'
        WHEN 'DateUpdate'     THEN 'dt'
        WHEN 'LuongCoBanHD'   THEN 'n2'  -- Tiền: 2 chữ số thập phân
        WHEN 'Tuoi'           THEN 'n0'
        WHEN 'BranchID'       THEN 'sl'
        ELSE NULL
    END,

    -- ── Báo cáo chỉ đọc → hiện ở grid, không cho thêm/sửa ────────────
    FormPosition   = 'grid',
    ShowInAdd      = 0,
    ShowInEdit     = 0,
    IsReadOnlyAdd  = 1,
    IsReadOnlyEdit = 1,
    IsRequired     = 0,
    ShowInFilter   = CASE WHEN FieldName = 'BranchID' THEN 1 ELSE 0 END,
    DataSource     = CASE WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm' ELSE NULL END,

    -- ── Thứ tự cột hiển thị ───────────────────────────────────────────
    OrderNo = CASE FieldName
        -- Nhóm 1: Định danh cơ bản
        WHEN 'PersonID'          THEN 1
        WHEN 'PersonName'        THEN 2
        WHEN 'PhongBan'          THEN 3
        WHEN 'TitleName'         THEN 4
        WHEN 'BranchID'          THEN 6
        WHEN 'GioiTinh'          THEN 7
        WHEN 'NgaySinh'          THEN 8
        WHEN 'Tuoi'              THEN 9
        -- Nhóm 2: Liên hệ
        WHEN 'DienThoai'         THEN 10
        -- Nhóm 3: Thời gian làm việc
        WHEN 'PersonStatus'      THEN 12
        WHEN 'PersonStatusName'  THEN 13
        -- Nhóm 4: CCCD/CMND
        WHEN 'CMND'              THEN 15
        WHEN 'CMNDNgayCap'       THEN 16
        WHEN 'CMNDNoiCap'        THEN 17
        -- Nhóm 5: Địa chỉ
        WHEN 'DiaChiThuongTru'   THEN 18
        WHEN 'DiaChiTamTru'      THEN 19
        -- Nhóm 6: Hợp đồng
        WHEN 'SoHopDong'         THEN 21
        WHEN 'LoaiHopDong'       THEN 22
        WHEN 'NgayHopDong'       THEN 23
        WHEN 'LuongCoBanHD'      THEN 25
        -- Nhóm 7: Ngân hàng
        WHEN 'BankName'          THEN 26
        WHEN 'BankAccountNo'     THEN 27
        WHEN 'BankHolder'        THEN 28
        WHEN 'BankLocation'      THEN 29
        -- Nhóm 8: Học vấn / nhân khẩu
        WHEN 'EducationName'     THEN 30
        WHEN 'NationName'        THEN 32
        WHEN 'Nationality'       THEN 34
        WHEN 'PeoplesName'       THEN 35
        WHEN 'ReligionName'      THEN 36
        -- Nhóm 9: Tổ chức mở rộng
        WHEN 'ChucDanhChuyenMon' THEN 38
        -- Nhóm 10: Chấm công
        WHEN 'ChamCong'          THEN 43
        WHEN 'UserID'            THEN 45
        -- Nhóm 11: Liên hệ khẩn cấp
        WHEN 'isTaiTuyen'        THEN 51
        WHEN 'NewPersonID'       THEN 52
        WHEN 'PersonName2'       THEN 53
        WHEN 'STT'               THEN 54
        -- Audit (cuối cùng)
        WHEN 'UserCreate'        THEN 90
        WHEN 'UserUpdate'        THEN 91
        WHEN 'DateCreate'        THEN 92
        WHEN 'DateUpdate'        THEN 93
        ELSE 99
    END

WHERE FormName = 'WA_BaoCaoNhanSuReport';
GO

PRINT 'Da cap nhat SY_FormatFields cho WA_BaoCaoNhanSuReport thanh cong!';
GO
