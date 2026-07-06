
-- =========================================================================
-- 1. Master API: Danh sách nhân viên tổng hợp
-- EXEC dbo.API_HoSoNhanVien @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
ALTER PROCEDURE dbo.API_HoSoNhanVien
(
    @Keyword           NVARCHAR(200) = '',
    @BranchID          NVARCHAR(MAX) = '',
    @PhongBan          NVARCHAR(50)  = '',
    @NamLap            INT           = NULL,
    @LoaiHD            NVARCHAR(50)  = '',
    @PersonStatusName  NVARCHAR(100) = '', -- Thêm tham số nhận Tên trạng thái từ UI
    @PersonStatus      NVARCHAR(50)  = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- Chức vụ
        P.ChucDanhChuyenMon,    -- Chức danh chuyên môn
        P.NgaySinh,             -- Ngày sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Địa chỉ thường trú
        P.NgayVaoLam,           -- Ngày nhận việc
        P.BranchID,
        P.NgayHopDong,
        P.NationName,
        P.SoHopDong,
        P.DienThoai,
        P.PersonStatus,
        P.NewPersonID,
        P.CardNo,
        P.ProvineName,
        P.DiaChiHienNay,
        P.Quanly,
        P.NgayThuViec,
        P.BankHolder,
        P.BankAccountNo,
        P.BankName,
        P.BankLocation,
        P.SocialID,
        P.SocialDate,
        P.NgayKetThucBH,
        P.ShiftID,
        P.SoTheBHYT,
        P.ThoiGianHuongBHYT,
        P.NoiDangKyBHYT,
        P.ChamCong,
        P.LoaiHopDong,
        P.NgayHetHopDong,
        P.NguoiLienHe,
        P.MoiQuanHe,
        P.NguoiLienHeSoDT,
        P.GioiTinh,
        P.HonNhan,
        P.CMNDNgayCap,
        P.CMNDNoiCap,
        P.NoiSinh,
        P.PeoplesName,
        P.ReligionName,
        P.Email,
        P.EducationName,
        P.Nationality,
        P.JobName,
        P.CareerName,
        P.HospitalName,
        P.MaNVChamCong,
        P.PersonName2,
        P.PostionName,
        P.NgayNghiViec,
        P.WorkingGroupName,
        P.DungCuLamViec,
        P.GhiChu,
        P.LocationID,
        P.NgayDuKienTV,
        P.UserCreate,
        P.UserUpdate,
        P.DateUpdate,
        P.DateCreate,
        P.DiaChiTamTru,
        P.isTaiTuyen,
        S.PersonStatusName,
        HD.LoaiHD,
        YEAR(P.NgayVaoLam) AS NamLap,
        PA.FileName,
        PA.Content
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_PersonStatusTbl S 
        ON P.PersonStatus = S.PersonStatus
    OUTER APPLY (
        SELECT TOP 1 FileName, Content
        FROM dbo.HR_PersonAttachTbl
        WHERE PersonID = P.PersonID
        ORDER BY UserAutoID DESC
    ) PA
    OUTER APPLY (
        SELECT TOP 1 LoaiHD
        FROM dbo.HR_HopDongTbl
        WHERE PersonID = P.PersonID
        ORDER BY NgayKyHopDong DESC
    ) HD
    WHERE 
        -- Bộ lọc từ khoá (Keyword)
        (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
        
        -- Bộ lọc chi nhánh (BranchID)
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        -- Bộ lọc bộ phận (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        
        -- Bộ lọc năm lập
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
        
        -- Bộ lọc loại hợp đồng (LoaiHD từ HR_HopDongTbl)
        AND (@LoaiHD = '' OR HD.LoaiHD LIKE N'%' + @LoaiHD + '%')
        
        -- Bộ lọc trạng thái nhân sự (theo tên hiển thị trên UI hoặc mã trạng thái)
        AND (@PersonStatusName = '' OR S.PersonStatusName = @PersonStatusName)
        AND (@PersonStatus = '' OR P.PersonStatus = @PersonStatus)
        
    ORDER BY P.PersonID DESC;
END
GO
-- =========================================================================
-- 2. Detail API Tab 1: Quá trình làm việc và lương (HR_PersonSalaryTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T1_Salary
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
       *
    FROM dbo.HR_PersonSalaryTbl
    WHERE PersonID = @PersonID
END
GO

-- =========================================================================
-- 4. Detail API Tab 3: Khen thưởng - Kỷ luật (HR_PersonKTKLTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T3_KTKL
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        NoiDungKTKL,
        GhiChu
    FROM dbo.HR_PersonKTKLTbl
    WHERE PersonID = @PersonID;
END
GO

-- =========================================================================
-- 5. Detail API Tab 4: Khai báo phép năm (HR_PersonNghiPhepTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T4_NghiPhep
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        Nam,
        SoNgay,
        PhepThamNien,
        SoNgayDaSuDung,
        SoNgayConLai,
        PhepTonNamTruoc,
        SoNgayPhepTet,
        SoNgayPhepOm,
        NgayCapNhat,
        GhiChu
    FROM dbo.HR_PersonNghiPhepTbl
    WHERE PersonID = @PersonID
    ORDER BY Nam DESC;
END
GO

-- =========================================================================
-- 6. Detail API Tab 5: Gia cảnh & Mối liên hệ (HR_PersonRelationTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T5_Relation
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        RelationID,
        PersonRelationName,
        NgaySinh,
        DiaChiThuongTru,
        DiaChiHienNay,
        IsNguoiPhuThuoc,
        GiamTruTuThang,
        GiamTruDenThang
    FROM dbo.HR_PersonRelationTbl
    WHERE PersonID = @PersonID;
END
GO

-- =========================================================================
-- 7. Detail API Tab 6: Lịch sử hợp đồng (HR_HopDongTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T6_HopDong
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaHopDong,
        PersonID,
        PersonName,
        NgayKyHopDong,
        NgayCoHieuLuc,
        NgayHetHieuLuc,
        LoaiHopDong,
        LuongCoBan,
        MucDong,
        NoiDung
    FROM dbo.HR_HopDongTbl
    WHERE PersonID = @PersonID
    ORDER BY NgayKyHopDong DESC;
END
GO

-- =========================================================================
-- 8. Detail API Tab 7: Lịch sử công tác (HR_LichSuCongTacTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T7_CongTac
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        PhongBan,
        TitleName,
        PostionName,
        Quanly,
        ShiftID,
        NgayThayDoi,
        UserName
    FROM dbo.HR_LichSuCongTacTbl
    WHERE PersonID = @PersonID
    ORDER BY NgayThayDoi DESC;
END
GO

-- =========================================================================
-- 9. Detail API Tab 8: Lịch sử công việc (HR_PersonLogTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T8_Log
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        UserName,
        LogDate,
        BranchID,
        StatusID,
        Notes
    FROM dbo.HR_PersonLogTbl
    WHERE PersonID = @PersonID
    ORDER BY LogDate DESC;
END
GO

-- =========================================================================
-- 10. Detail API Tab 9: Giấy tờ (HR_PersonGiayToTbl)
-- =========================================================================
ALTER PROCEDURE dbo.API_PersonFull_T9_GiayTo
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        DocumentID,
        PersonID,
        LoaiGiayTo,
        TuNgay,
        DenNgay,
        Notes
    FROM dbo.HR_PersonGiayToTbl
    WHERE PersonID = @PersonID
    ORDER BY DocumentID DESC;
END
GO

-- =========================================================================
-- Đăng ký các API này vào bảng WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_PersonFullFrm';
DELETE FROM dbo.WA_API WHERE list LIKE 'API_PersonFull_T%';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PersonFullFrm', 'View', 'API_HoSoNhanVien', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @PersonStatus=N''{PersonStatus}'''),
('WA_PersonFullFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PersonFullFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T1_Salary',    'View', 'API_PersonFull_T1_Salary',    '@PersonID=N''{PersonID}'''),
('API_PersonFull_T2_Allowance', 'View', 'API_PersonFull_T2_Allowance', '@PersonID=N''{PersonID}'''),
('API_PersonFull_T3_KTKL',      'View', 'API_PersonFull_T3_KTKL',      '@PersonID=N''{PersonID}'''),
('API_PersonFull_T4_NghiPhep',  'View', 'API_PersonFull_T4_NghiPhep',  '@PersonID=N''{PersonID}'''),
('API_PersonFull_T5_Relation',  'View', 'API_PersonFull_T5_Relation',  '@PersonID=N''{PersonID}'''),
('API_PersonFull_T6_HopDong',   'View', 'API_PersonFull_T6_HopDong',   '@PersonID=N''{PersonID}'''),
('API_PersonFull_T7_CongTac',   'View', 'API_PersonFull_T7_CongTac',   '@PersonID=N''{PersonID}'''),
('API_PersonFull_T8_Log',       'View', 'API_PersonFull_T8_Log',       '@PersonID=N''{PersonID}'''),
('API_PersonFull_T9_GiayTo',    'View', 'API_PersonFull_T9_GiayTo',    '@PersonID=N''{PersonID}''');
GO

-- 1. Đăng ký các Detail API làm danh sách (List) trong SY_FrmLstTbl
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (
    'API_PersonFull_T1_Salary',
    'API_PersonFull_T2_Allowance',
    'API_PersonFull_T3_KTKL',
    'API_PersonFull_T4_NghiPhep',
    'API_PersonFull_T5_Relation',
    'API_PersonFull_T6_HopDong',
    'API_PersonFull_T7_CongTac',
    'API_PersonFull_T8_Log',
    'API_PersonFull_T9_GiayTo'
);

INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey])
VALUES 
('API_PersonFull_T1_Salary', 'LIST', N'Quá trình lương', 'Salary', 'HR_PersonSalaryTbl', 'UserAutoID'),
('API_PersonFull_T2_Allowance', 'LIST', N'Phụ cấp', 'Allowance', 'HR_PersonAllowanceTbl', 'UserAutoID'),
('API_PersonFull_T3_KTKL', 'LIST', N'Khen thưởng kỷ luật', 'KTKL', 'HR_PersonKTKLTbl', 'UserAutoID'),
('API_PersonFull_T4_NghiPhep', 'LIST', N'Nghỉ phép', 'Leave', 'HR_PersonNghiPhepTbl', 'UserAutoID'),
('API_PersonFull_T5_Relation', 'LIST', N'Gia cảnh', 'Relation', 'HR_PersonRelationTbl', 'RelationID'),
('API_PersonFull_T6_HopDong', 'LIST', N'Hợp đồng', 'Contract', 'HR_HopDongTbl', 'MaHopDong'),
('API_PersonFull_T7_CongTac', 'LIST', N'Công tác', 'Work history', 'HR_LichSuCongTacTbl', 'UserAutoID'),
('API_PersonFull_T8_Log', 'LIST', N'Log', 'Log', 'HR_LichSuCongViecTbl', 'UserAutoID'),
('API_PersonFull_T9_GiayTo', 'LIST', N'Giấy tờ', 'Document', 'HR_GiayToTbl', 'DocumentID');
GO

-- 2. Đăng ký Save/Delete trong WA_API
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_PersonFull_T1_Salary', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T1_Salary', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T2_Allowance', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T2_Allowance', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T3_KTKL', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T3_KTKL', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T4_NghiPhep', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T4_NghiPhep', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T5_Relation', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T5_Relation', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T6_HopDong', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T6_HopDong', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T7_CongTac', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T7_CongTac', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T8_Log', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T8_Log', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T9_GiayTo', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T9_GiayTo', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO



CREATE OR ALTER PROCEDURE [dbo].[API_PersonAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Trích xuất PersonID hoặc CandidateID từ chuỗi JSON
        DECLARE @PersonID VARCHAR(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        
        DECLARE @TargetID VARCHAR(50) = ISNULL(@PersonID, @CandidateID);
        
        IF @TargetID IS NULL OR @TargetID = ''
        BEGIN
            SELECT -1 AS code, N'Lỗi: Không tìm thấy mã nhân viên/ứng viên!' AS msg;
            RETURN;
        END

        -- Nếu là tải ảnh đại diện (FileType = 1) -> Tìm ID ảnh cũ để ghi đè (UPDATE)
        IF @FileType = 1 
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP 1 @ExistingID = UserAutoID 
            FROM HR_PersonAttachTbl 
            WHERE (PersonID = @TargetID) AND FileType = 1;

            IF @ExistingID IS NOT NULL
            BEGIN
                -- Nếu đã tồn tại ảnh -> Bơm UserAutoID vào JSON và đổi IsEdit = 1
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END
        END
        
        -- Uỷ quyền lại cho hàm lõi API_LuuDong xử lý JSON chuẩn
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;
        
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO
GO

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_PersonAttach' AND func = 'SaveAvatar')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('API_PersonAttach', 'SaveAvatar', 'API_PersonAttach_SaveAvatar', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
END