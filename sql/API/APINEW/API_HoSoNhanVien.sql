
-- =========================================================================
-- 1. Master API: Danh sÃ¡ch nhÃ¢n viÃªn tá»•ng há»£p
-- EXEC dbo.API_HoSoNhanVien @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVien
(
    @Keyword           NVARCHAR(200) = '',
    @BranchID          NVARCHAR(MAX) = '',
    @PhongBan          NVARCHAR(50)  = '',
    @NamLap            INT           = NULL,
    @LoaiHD            NVARCHAR(50)  = '',
    @PersonStatusName  NVARCHAR(100) = '', -- ThÃªm tham sá»‘ nháº­n TÃªn tráº¡ng thÃ¡i tá»« UI
    @PersonStatus      NVARCHAR(50)  = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- Chá»©c vá»¥
        P.ChucDanhChuyenMon,    -- Chá»©c danh chuyÃªn mÃ´n
        P.NgaySinh,             -- NgÃ y sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Äá»‹a chá»‰ thÆ°á»ng trÃº
        P.NgayVaoLam,           -- NgÃ y nháº­n viá»‡c
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
        NULL AS Content -- Removed PA.Content to drastically improve load time
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_PersonStatusTbl S 
        ON P.PersonStatus = S.PersonStatus
    OUTER APPLY (
        SELECT TOP 1 FileName
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
        -- Bá»™ lá»c tá»« khoÃ¡ (Keyword)
        (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
        
        -- Bá»™ lá»c chi nhÃ¡nh (BranchID)
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        -- Bá»™ lá»c bá»™ pháº­n (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        
        -- Bá»™ lá»c nÄƒm láº­p
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
        
        -- Bá»™ lá»c loáº¡i há»£p Ä‘á»“ng (LoaiHD tá»« HR_HopDongTbl)
        AND (@LoaiHD = '' OR HD.LoaiHD LIKE N'%' + @LoaiHD + '%')
        
        -- Bá»™ lá»c tráº¡ng thÃ¡i nhÃ¢n sá»± (theo tÃªn hiá»ƒn thá»‹ trÃªn UI hoáº·c mÃ£ tráº¡ng thÃ¡i)
        AND (@PersonStatusName = '' OR S.PersonStatusName = @PersonStatusName)
        AND (@PersonStatus = '' OR P.PersonStatus = @PersonStatus)
        
    ORDER BY P.PersonID DESC;
END
GO
-- =========================================================================
-- 2. Detail API Tab 1: QuÃ¡ trÃ¬nh lÃ m viá»‡c vÃ  lÆ°Æ¡ng (HR_PersonSalaryTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T1_Salary
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
-- 4. Detail API Tab 3: Khen thÆ°á»Ÿng - Ká»· luáº­t (HR_PersonKTKLTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T3_KTKL
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
-- 5. Detail API Tab 4: Khai bÃ¡o phÃ©p nÄƒm (HR_PersonNghiPhepTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T4_NghiPhep
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
-- 6. Detail API Tab 5: Gia cáº£nh & Má»‘i liÃªn há»‡ (HR_PersonRelationTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T5_Relation
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
-- 7. Detail API Tab 6: Lá»‹ch sá»­ há»£p Ä‘á»“ng (HR_HopDongTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T6_HopDong
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
-- 8. Detail API Tab 7: Lá»‹ch sá»­ cÃ´ng tÃ¡c (HR_LichSuCongTacTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T7_CongTac
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
-- 9. Detail API Tab 8: Lá»‹ch sá»­ cÃ´ng viá»‡c (HR_PersonLogTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T8_Log
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
-- 10. Detail API Tab 9: Giáº¥y tá» (HR_PersonGiayToTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T9_GiayTo
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
-- ÄÄƒng kÃ½ cÃ¡c API nÃ y vÃ o báº£ng WA_API
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

-- 1. ÄÄƒng kÃ½ cÃ¡c Detail API lÃ m danh sÃ¡ch (List) trong SY_FrmLstTbl
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
('API_PersonFull_T1_Salary', 'LIST', N'QuÃ¡ trÃ¬nh lÆ°Æ¡ng', 'Salary', 'HR_PersonSalaryTbl', 'UserAutoID'),
('API_PersonFull_T2_Allowance', 'LIST', N'Phá»¥ cáº¥p', 'Allowance', 'HR_PersonAllowanceTbl', 'UserAutoID'),
('API_PersonFull_T3_KTKL', 'LIST', N'Khen thÆ°á»Ÿng ká»· luáº­t', 'KTKL', 'HR_PersonKTKLTbl', 'UserAutoID'),
('API_PersonFull_T4_NghiPhep', 'LIST', N'Nghá»‰ phÃ©p', 'Leave', 'HR_PersonNghiPhepTbl', 'UserAutoID'),
('API_PersonFull_T5_Relation', 'LIST', N'Gia cáº£nh', 'Relation', 'HR_PersonRelationTbl', 'RelationID'),
('API_PersonFull_T6_HopDong', 'LIST', N'Há»£p Ä‘á»“ng', 'Contract', 'HR_HopDongTbl', 'MaHopDong'),
('API_PersonFull_T7_CongTac', 'LIST', N'CÃ´ng tÃ¡c', 'Work history', 'HR_LichSuCongTacTbl', 'UserAutoID'),
('API_PersonFull_T8_Log', 'LIST', N'Log', 'Log', 'HR_LichSuCongViecTbl', 'UserAutoID'),
('API_PersonFull_T9_GiayTo', 'LIST', N'Giáº¥y tá»', 'Document', 'HR_GiayToTbl', 'DocumentID');
GO

-- 2. ÄÄƒng kÃ½ Save/Delete trong WA_API
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
        -- TrÃ­ch xuáº¥t PersonID hoáº·c CandidateID tá»« chuá»—i JSON
        DECLARE @PersonID VARCHAR(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        
        DECLARE @TargetID VARCHAR(50) = ISNULL(@PersonID, @CandidateID);
        
        IF @TargetID IS NULL OR @TargetID = ''
        BEGIN
            SELECT -1 AS code, N'Lá»—i: KhÃ´ng tÃ¬m tháº¥y mÃ£ nhÃ¢n viÃªn/á»©ng viÃªn!' AS msg;
            RETURN;
        END

        -- Náº¿u lÃ  táº£i áº£nh Ä‘áº¡i diá»‡n (FileType = 1) -> TÃ¬m ID áº£nh cÅ© Ä‘á»ƒ ghi Ä‘Ã¨ (UPDATE)
        IF @FileType = 1 
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP 1 @ExistingID = UserAutoID 
            FROM HR_PersonAttachTbl 
            WHERE (PersonID = @TargetID) AND FileType = 1;

            IF @ExistingID IS NOT NULL
            BEGIN
                -- Náº¿u Ä‘Ã£ tá»“n táº¡i áº£nh -> BÆ¡m UserAutoID vÃ o JSON vÃ  Ä‘á»•i IsEdit = 1
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END
        END
        
        -- Uá»· quyá»n láº¡i cho hÃ m lÃµi API_LuuDong xá»­ lÃ½ JSON chuáº©n
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
