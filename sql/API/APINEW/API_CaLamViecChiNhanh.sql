SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- 1. MASTER API: API_CaLamViecChiNhanh_Master
-- Description: API truy vấn danh sách Master Sắp ca chi nhánh (HR_SapCaChiNhanhTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_CaLamViecChiNhanh_Master
(
    @List NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, N'')));

    SELECT TOP 1000 M.*
    FROM dbo.HR_SapCaChiNhanhTbl M
    WHERE 
        (@Keyword = N'' OR M.SapCaID LIKE '%' + @Keyword + '%' OR ISNULL(M.TenBangCa, N'') LIKE N'%' + @Keyword + '%')
        AND (
            @BranchID = N'' 
            OR ISNULL(M.BranchID, N'') = N''
            OR M.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','))
        )
    ORDER BY M.TuNgay DESC, M.SapCaID DESC;
END
GO

-- Read Model View chuẩn ERP Desktop cho Nhân viên Ca Chi Nhánh
CREATE OR ALTER VIEW dbo.HR_SapCaNhanVienChiNhanhView
AS
SELECT 
    D.UserAutoID,
    D.SapCaID,
    D.PersonID,
    P.PersonName,
    P.PhongBan,
    P.TitleName,
    D.BranchID,
    D.ShiftID,
    D.Thu2,
    D.Thu3,
    D.Thu4,
    D.Thu5,
    D.Thu6,
    D.Thu7,
    D.ChuNhat,
    D.GhiChu
FROM dbo.HR_SapCaNhanVienChiNhanhTbl D
LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = D.PersonID;
GO

-- =========================================================================
-- 2. DETAIL API 1: API_CaLamViecChiNhanh_NhanVien (Tab 1: Nhân viên)
-- Description: API truy vấn danh sách nhân viên gán ca dùng Read Model VIEW (SELECT *)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_CaLamViecChiNhanh_NhanVien
(
    @List NVARCHAR(100) = '',
    @SapCaID NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @SapCaID = LTRIM(RTRIM(ISNULL(@SapCaID, N'')));
    IF (@SapCaID = N'' AND ISJSON(@Data) = 1)
        SET @SapCaID = ISNULL(JSON_VALUE(@Data, '$.SapCaID'), ISNULL(JSON_VALUE(@Data, '$.parentId'), ''));

    SELECT TOP 1000 *
    FROM dbo.HR_SapCaNhanVienChiNhanhView
    WHERE (@SapCaID = N'' OR SapCaID = @SapCaID)
    ORDER BY UserAutoID ASC;
END
GO

-- =========================================================================
-- 3. DETAIL API 2: API_CaLamViecChiNhanh_ChiTiet (Tab 2: Bảng ca chi tiết - READ ONLY)
-- Description: API truy vấn danh sách ca chi tiết ngày kèm Họ tên, Phòng ban, Chi nhánh
--              (HR_SapCaChiNhanhChiTietTbl LEFT JOIN HR_PersonTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_CaLamViecChiNhanh_ChiTiet
(
    @List NVARCHAR(100) = '',
    @SapCaID NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @SapCaID = LTRIM(RTRIM(ISNULL(@SapCaID, N'')));
    IF (@SapCaID = N'' AND ISJSON(@Data) = 1)
        SET @SapCaID = ISNULL(JSON_VALUE(@Data, '$.SapCaID'), ISNULL(JSON_VALUE(@Data, '$.parentId'), ''));

    SELECT TOP 1000 
        D.*, 
        A.PersonName, 
        A.PhongBan, 
        A.BranchID
    FROM dbo.HR_SapCaChiNhanhChiTietTbl D
    LEFT JOIN dbo.HR_PersonTbl A ON D.PersonID = A.PersonID
    WHERE (@SapCaID = N'' OR D.SapCaID = @SapCaID)
    ORDER BY D.UserAutoID ASC;
END
GO

-- =========================================================================
-- 3. CONTRACT REGISTRATION + ROUTES (Nạp Contract Detail cho API_LuuDong_V2 & WA_API)
-- =========================================================================
DECLARE @Now datetime2(3) = SYSUTCDATETIME();
DECLARE @Actor varchar(100) = 'API_CaLamViecChiNhanh.sql';

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = 'API_CaLamViecChiNhanh_NhanVien')
    BEGIN
        UPDATE dbo.WA_FieldContractRegistry
        SET 
            ExpectedTableName = 'HR_SapCaNhanVienChiNhanhTbl',
            ExpectedPrimaryKey = 'UserAutoID',
            SaveProcedure = 'API_LuuDong_V2',
            DeleteProcedure = 'API_XoaDong_V2',
            UpdatedAt = @Now
        WHERE WebFormName = 'API_CaLamViecChiNhanh_NhanVien';
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
            'API_CaLamViecChiNhanh_NhanVien', 'API_CaLamViecChiNhanh_NhanVien', 'WA_CaLamViecCNFrm',
            'MASTER_DETAIL_SIMPLE', N'HR_SapCaNhanVienChiNhanhTbl', N'UserAutoID',
            'API_CaLamViecChiNhanh_NhanVien', N'API_CaLamViecChiNhanh_NhanVien',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'BRANCH_SCOPED', 'AUTO_SCHEMA',
            'ACTIVE', N'BRANCH_SHIFT_EMPLOYEES_EDITABLE',
            2, 1, @Now, @Actor, @Now, @Actor
        );
    END;
END;

IF OBJECT_ID(N'dbo.WA_API', N'U') IS NOT NULL
BEGIN
    DECLARE @Routes TABLE
    (
        ListName varchar(100) NOT NULL,
        FuncName varchar(100) NOT NULL,
        SqlName sysname NOT NULL,
        Para nvarchar(max) NOT NULL,
        PRIMARY KEY (ListName, FuncName)
    );

    INSERT INTO @Routes (ListName, FuncName, SqlName, Para)
    VALUES
        (
            'WA_CaLamViecCNFrm',
            'View',
            N'API_CaLamViecChiNhanh_Master',
            N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        ),
        (
            'WA_CaLamViecCNFrm',
            'Save',
            N'API_LuuDong_V2',
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        ),
        (
            'WA_CaLamViecCNFrm',
            'Delete',
            N'API_XoaDong_V2',
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
        ),
        (
            'API_CaLamViecChiNhanh_NhanVien',
            'View',
            N'API_CaLamViecChiNhanh_NhanVien',
            N'@List=N''{List}'', @SapCaID=N''{SapCaID}'', @Keyword=N''{Keyword}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
        ),
        (
            'API_CaLamViecChiNhanh_NhanVien',
            'Save',
            N'API_LuuDong_V2',
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        ),
        (
            'API_CaLamViecChiNhanh_NhanVien',
            'Delete',
            N'API_XoaDong_V2',
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
        ),
        (
            'API_CaLamViecChiNhanh_ChiTiet',
            'View',
            N'API_CaLamViecChiNhanh_ChiTiet',
            N'@List=N''{List}'', @SapCaID=N''{SapCaID}'', @Keyword=N''{Keyword}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
        );

    UPDATE ExistingRoute
    SET
        ExistingRoute.[SQL] = SourceRoute.SqlName,
        ExistingRoute.Para = SourceRoute.Para
    FROM dbo.WA_API AS ExistingRoute
    INNER JOIN @Routes AS SourceRoute
        ON SourceRoute.ListName COLLATE DATABASE_DEFAULT = ExistingRoute.[list] COLLATE DATABASE_DEFAULT
       AND SourceRoute.FuncName COLLATE DATABASE_DEFAULT = ExistingRoute.[func] COLLATE DATABASE_DEFAULT;

    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
    SELECT
        SourceRoute.ListName,
        SourceRoute.FuncName,
        SourceRoute.SqlName,
        SourceRoute.Para
    FROM @Routes AS SourceRoute
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_API AS ExistingRoute
        WHERE ExistingRoute.[list] COLLATE DATABASE_DEFAULT = SourceRoute.ListName COLLATE DATABASE_DEFAULT
          AND ExistingRoute.[func] COLLATE DATABASE_DEFAULT = SourceRoute.FuncName COLLATE DATABASE_DEFAULT
    );
END;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
BEGIN
    UPDATE dbo.WA_FieldContractRegistry
    SET
        ERPFormID = 'WA_CaLamViecCNFrm',
        PermissionFormName = 'WA_CaLamViecCNFrm',
        ContractType = 'MASTER_DETAIL_SIMPLE',
        ExpectedTableName = N'HR_SapCaChiNhanhTbl',
        ExpectedPrimaryKey = N'SapCaID',
        ViewList = 'WA_CaLamViecCNFrm',
        ViewProcedure = N'API_CaLamViecChiNhanh_Master',
        SaveProcedure = N'API_LuuDong_V2',
        DeleteProcedure = N'API_XoaDong_V2',
        WritePolicy = 'SAFE_TABLE_COLUMNS',
        BranchPolicy = 'BRANCH_SCOPED',
        DeletePolicy = 'AUTO_SCHEMA',
        RolloutStatus = 'ACTIVE',
        RolloutReason = N'BRANCH_SHIFT_MASTER_DETAIL',
        SchemaVersion = 2,
        IsEnabled = 1,
        UpdatedAt = @Now,
        UpdatedBy = @Actor
    WHERE WebFormName = 'WA_CaLamViecCNFrm';

    IF @@ROWCOUNT = 0
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
            'WA_CaLamViecCNFrm', 'WA_CaLamViecCNFrm', 'WA_CaLamViecCNFrm',
            'MASTER_DETAIL_SIMPLE', N'HR_SapCaChiNhanhTbl', N'SapCaID',
            'WA_CaLamViecCNFrm', N'API_CaLamViecChiNhanh_Master',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'BRANCH_SCOPED', 'AUTO_SCHEMA',
            'ACTIVE', N'BRANCH_SHIFT_MASTER_DETAIL',
            2, 1, @Now, @Actor, @Now, @Actor
        );
    END;
END;

IF OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = 'WA_CaLamViecCNFrm')
BEGIN
    DECLARE @Datasets TABLE
    (
        DatasetKey varchar(80) NOT NULL PRIMARY KEY,
        ApiList varchar(100) NOT NULL,
        ViewProcedure sysname NOT NULL,
        ExpectedTableName sysname NOT NULL,
        ExpectedPrimaryKey sysname NOT NULL,
        IsReadOnly bit NOT NULL,
        SaveProcedure sysname NULL,
        DeleteProcedure sysname NULL,
        WritePolicy varchar(40) NOT NULL,
        RolloutReason nvarchar(500) NULL
    );

    INSERT INTO @Datasets
        (DatasetKey, ApiList, ViewProcedure, ExpectedTableName, ExpectedPrimaryKey, IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy, RolloutReason)
    VALUES
        ('SHIFT_EMPLOYEES', 'API_CaLamViecChiNhanh_NhanVien', N'API_CaLamViecChiNhanh_NhanVien', N'HR_SapCaNhanVienChiNhanhTbl', N'UserAutoID', 0, N'API_LuuDong_V2', N'API_XoaDong_V2', 'SAFE_TABLE_COLUMNS', N'BRANCH_SHIFT_EMPLOYEES_EDITABLE'),
        ('SHIFT_DETAIL', 'API_CaLamViecChiNhanh_ChiTiet', N'API_CaLamViecChiNhanh_ChiTiet', N'HR_SapCaChiNhanhChiTietTbl', N'UserAutoID', 1, NULL, NULL, 'READ_ONLY', N'BRANCH_SHIFT_DETAIL_READ_ONLY');

    UPDATE ExistingDataset
    SET
        ExistingDataset.ApiList = SourceDataset.ApiList,
        ExistingDataset.ViewProcedure = SourceDataset.ViewProcedure,
        ExistingDataset.ExpectedTableName = SourceDataset.ExpectedTableName,
        ExistingDataset.ExpectedPrimaryKey = SourceDataset.ExpectedPrimaryKey,
        ExistingDataset.ParentField = N'SapCaID',
        ExistingDataset.ChildField = N'SapCaID',
        ExistingDataset.IsReadOnly = SourceDataset.IsReadOnly,
        ExistingDataset.SaveProcedure = SourceDataset.SaveProcedure,
        ExistingDataset.DeleteProcedure = SourceDataset.DeleteProcedure,
        ExistingDataset.WritePolicy = SourceDataset.WritePolicy,
        ExistingDataset.BranchPolicy = 'BRANCH_SCOPED',
        ExistingDataset.RolloutStatus = 'ACTIVE',
        ExistingDataset.RolloutReason = SourceDataset.RolloutReason,
        ExistingDataset.SchemaVersion = 2,
        ExistingDataset.UpdatedAt = @Now,
        ExistingDataset.UpdatedBy = @Actor
    FROM dbo.WA_FieldDatasetRegistry AS ExistingDataset
    INNER JOIN @Datasets AS SourceDataset
        ON SourceDataset.DatasetKey COLLATE DATABASE_DEFAULT = ExistingDataset.DatasetKey COLLATE DATABASE_DEFAULT
    WHERE ExistingDataset.WebFormName = 'WA_CaLamViecCNFrm';

    INSERT INTO dbo.WA_FieldDatasetRegistry
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT
        'WA_CaLamViecCNFrm',
        SourceDataset.DatasetKey,
        SourceDataset.ApiList,
        SourceDataset.ViewProcedure,
        SourceDataset.ExpectedTableName,
        SourceDataset.ExpectedPrimaryKey,
        N'SapCaID',
        N'SapCaID',
        SourceDataset.IsReadOnly,
        SourceDataset.SaveProcedure,
        SourceDataset.DeleteProcedure,
        SourceDataset.WritePolicy,
        'BRANCH_SCOPED',
        'ACTIVE',
        SourceDataset.RolloutReason,
        2,
        @Now,
        @Actor,
        @Now,
        @Actor
    FROM @Datasets AS SourceDataset
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS ExistingDataset
        WHERE ExistingDataset.WebFormName = 'WA_CaLamViecCNFrm'
          AND ExistingDataset.DatasetKey COLLATE DATABASE_DEFAULT = SourceDataset.DatasetKey COLLATE DATABASE_DEFAULT
    );
END;
GO

-- =========================================================================
-- 4. ACTION ROUTE: tái sử dụng procedure ERP, không tạo procedure/bảng mới.
-- Frontend gọi List=WA_CaLamViecCNFrm, Func=HR_SapCaChiNhanh_Process_Stp.
-- =========================================================================
UPDATE dbo.WA_API
SET
    [SQL] = N'HR_SapCaChiNhanh_Process_Stp',
    Para = N'@SapCaID=N''{SapCaID}'''
WHERE list = 'WA_CaLamViecCNFrm'
  AND func = 'HR_SapCaChiNhanh_Process_Stp';

IF @@ROWCOUNT = 0
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES
    (
        'WA_CaLamViecCNFrm',
        'HR_SapCaChiNhanh_Process_Stp',
        N'HR_SapCaChiNhanh_Process_Stp',
        N'@SapCaID=N''{SapCaID}'''
    );
END;
GO
