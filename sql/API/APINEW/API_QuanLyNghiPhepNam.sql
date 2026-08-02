SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- =========================================================================
-- MASTER API: Danh sách nhân viên (Master Grid) - Bảng HR_PersonTbl
-- Theo đúng cấu hình Desktop App (Image 1 & Image 3)
-- EXEC dbo.API_QuanLyNghiPhepNam @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam
(
    @Keyword  NVARCHAR(200) = '',
    @BranchID NVARCHAR(MAX)  = '',
    @PhongBan NVARCHAR(50)  = '',
    @PersonName NVARCHAR(200) = '',
    @Nam NVARCHAR(10) = ''
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
        P.DienThoai
    FROM dbo.HR_PersonTbl P
    WHERE 
        ISNULL(P.PersonStatus, 1) <> 5   -- Không phải đã nghỉ việc (Trạng thái 5 = Nghỉ việc)
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
        AND (@PhongBan  = '' OR P.PhongBan = @PhongBan)
        AND (@PersonName = '' OR P.PersonName LIKE N'%' + @PersonName + '%')
        AND (
            @Keyword = ''
            OR P.PersonID   LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY P.PhongBan, P.PersonName;
END;
GO

-- =========================================================================
-- 1. CẤU HÌNH BẢNG MASTER CHO TRANG TRONG SY_FrmLstTbl (ĐỒNG BỘ CONTRACT)
-- =========================================================================
IF OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = N'WA_QuanLyNghiPhepNamFrm')
    BEGIN
        INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
        VALUES (N'WA_QuanLyNghiPhepNamFrm', N'EDIT', N'Quản lý nghỉ phép năm', N'HR_PersonTbl', N'PersonID');
    END
    ELSE
    BEGIN
        UPDATE dbo.SY_FrmLstTbl
        SET TableName = N'HR_PersonTbl',
            PrimaryKey = N'PersonID'
        WHERE FormID = N'WA_QuanLyNghiPhepNamFrm';
    END;
END;
GO

-- =========================================================================
-- 2. ĐĂNG KÝ ROUTE ĐỊNH TUYẾN WA_API CHO MASTER VÀ DETAIL TAB (TỐI ƯU CÚ PHÁP)
-- =========================================================================
IF OBJECT_ID(N'dbo.WA_API', N'U') IS NOT NULL
BEGIN
    DELETE FROM dbo.WA_API WHERE list = 'WA_QuanLyNghiPhepNamFrm' AND func = 'View';
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('WA_QuanLyNghiPhepNamFrm', 'View', N'API_QuanLyNghiPhepNam', N'@Keyword=N''{Keyword}''');

    DELETE FROM dbo.WA_API WHERE list = 'API_QuanLyNghiPhepNam_ChiTiet' AND func = 'View';
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('API_QuanLyNghiPhepNam_ChiTiet', 'View', N'API_QuanLyNghiPhepNam_ChiTiet', N'@PersonID=N''{PersonID}''');
END;
GO

-- =========================================================================
-- 3. ĐĂNG KÝ CONTRACT REGISTRY CHO MASTER VÀ DETAIL TAB (PHÉP NĂM)
-- Theo đúng Desktop App: 
-- - Master Table: HR_PersonTbl (PrimaryKey: PersonID)
-- - Detail Table (Phép năm): HR_PersonNghiPhepTbl (PrimaryKey: UserAutoID, Foreign Key: PersonID)
-- =========================================================================
IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
BEGIN
    DECLARE @Now datetime2(3) = SYSUTCDATETIME();

    -- Master Contract Registration (WA_QuanLyNghiPhepNamFrm)
    IF EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = N'WA_QuanLyNghiPhepNamFrm')
    BEGIN
        UPDATE dbo.WA_FieldContractRegistry
        SET ExpectedTableName = N'HR_PersonTbl',
            ExpectedPrimaryKey = N'PersonID',
            ContractType = N'MASTER_DETAIL_SIMPLE',
            ViewProcedure = N'API_QuanLyNghiPhepNam',
            SaveProcedure = N'API_LuuDong_V2',
            DeleteProcedure = N'API_XoaDong_V2',
            IsEnabled = 1,
            UpdatedAt = @Now,
            UpdatedBy = N'SYSTEM'
        WHERE WebFormName = N'WA_QuanLyNghiPhepNamFrm';
    END
    ELSE
    BEGIN
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        VALUES
        (
            N'WA_QuanLyNghiPhepNamFrm', N'WA_QuanLyNghiPhepNamFrm', N'WA_QuanLyNghiPhepNamFrm',
            N'MASTER_DETAIL_SIMPLE', N'HR_PersonTbl', N'PersonID',
            N'API_QuanLyNghiPhepNam', N'API_QuanLyNghiPhepNam',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            N'SAFE_TABLE_COLUMNS', N'BRANCH_SCOPED', N'AUTO_SCHEMA',
            N'ACTIVE', N'ANNUAL_LEAVE_MANAGEMENT',
            2, 1, @Now, N'SYSTEM', @Now, N'SYSTEM'
        );
    END;

    -- Detail Tab Contract Registration (DETAIL_TAB_1: HR_PersonNghiPhepTbl)
    IF EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = N'DETAIL_TAB_1' AND ERPFormID = N'WA_QuanLyNghiPhepNamFrm')
    BEGIN
        UPDATE dbo.WA_FieldContractRegistry
        SET ExpectedTableName = N'HR_PersonNghiPhepTbl',
            ExpectedPrimaryKey = N'UserAutoID',
            ContractType = N'MASTER_DETAIL_SIMPLE',
            ViewProcedure = N'API_QuanLyNghiPhepNam_ChiTiet',
            SaveProcedure = N'API_LuuDong_V2',
            DeleteProcedure = N'API_XoaDong_V2',
            IsEnabled = 1,
            UpdatedAt = @Now,
            UpdatedBy = N'SYSTEM'
        WHERE WebFormName = N'DETAIL_TAB_1' AND ERPFormID = N'WA_QuanLyNghiPhepNamFrm';
    END
    ELSE
    BEGIN
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        VALUES
        (
            N'DETAIL_TAB_1', N'WA_QuanLyNghiPhepNamFrm', N'WA_QuanLyNghiPhepNamFrm',
            N'MASTER_DETAIL_SIMPLE', N'HR_PersonNghiPhepTbl', N'UserAutoID',
            N'API_QuanLyNghiPhepNam_ChiTiet', N'API_QuanLyNghiPhepNam_ChiTiet',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            N'SAFE_TABLE_COLUMNS', N'BRANCH_SCOPED', N'AUTO_SCHEMA',
            N'ACTIVE', N'ANNUAL_LEAVE_DETAIL_TAB',
            2, 1, @Now, N'SYSTEM', @Now, N'SYSTEM'
        );
    END;
END;
GO
