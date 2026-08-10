-- ==========================================
-- Config WA_BangPhuCapFrm for V2 dynamic
-- ==========================================

-- 1. CẬP NHẬT WA_API CHO MASTER
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'View')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('WA_BangPhuCapFrm', 'View', 'API_TruyVanDong_V2', '@List=N''{List}'',@Keyword=N''{Keyword}'',@SortColumn=N''{SortColumn}'',@SortDir=N''{SortDir}'',@Data=N''{JsonData}'',@UserName=N''{User}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_TruyVanDong_V2', [Para] = '@List=N''{List}'',@Keyword=N''{Keyword}'',@SortColumn=N''{SortColumn}'',@SortDir=N''{SortDir}'',@Data=N''{JsonData}'',@UserName=N''{User}''' WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'View';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'Save')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('WA_BangPhuCapFrm', 'Save', 'API_LuuDong_V2', '@List=N''{List}'',@Data=N''{JsonData}'',@UserName=N''{User}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_LuuDong_V2', [Para] = '@List=N''{List}'',@Data=N''{JsonData}'',@UserName=N''{User}''' WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'Save';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'Delete')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('WA_BangPhuCapFrm', 'Delete', 'API_XoaDong_V2', '@List=N''{List}'',@Ids=N''{Ids}'',@UserName=N''{User}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_XoaDong_V2', [Para] = '@List=N''{List}'',@Ids=N''{Ids}'',@UserName=N''{User}''' WHERE [list] = 'WA_BangPhuCapFrm' AND [func] = 'Delete';

-- 2. CẬP NHẬT WA_API CHO DETAIL
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'View')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('API_BangPhuCap_Detail', 'View', 'API_BangPhuCap_Detail', '@MaPhuCap=N''{MaPhuCap}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_BangPhuCap_Detail', [Para] = '@MaPhuCap=N''{MaPhuCap}''' WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'View';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'Save')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('API_BangPhuCap_Detail', 'Save', 'API_LuuDong_V2', '@List=N''{List}'',@Data=N''{JsonData}'',@UserName=N''{User}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_LuuDong_V2', [Para] = '@List=N''{List}'',@Data=N''{JsonData}'',@UserName=N''{User}''' WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'Save';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'Delete')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('API_BangPhuCap_Detail', 'Delete', 'API_XoaDong_V2', '@List=N''{List}'',@Ids=N''{Ids}'',@UserName=N''{User}''');
ELSE
    UPDATE dbo.WA_API SET [SQL] = 'API_XoaDong_V2', [Para] = '@List=N''{List}'',@Ids=N''{Ids}'',@UserName=N''{User}''' WHERE [list] = 'API_BangPhuCap_Detail' AND [func] = 'Delete';

-- 3. ĐĂNG KÝ MASTER VÀO PHASE 3 REGISTRY
IF NOT EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = 'WA_BangPhuCapFrm')
BEGIN
    INSERT INTO dbo.WA_FieldContractRegistry (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
        IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    VALUES (
        'WA_BangPhuCapFrm', 'WA_BangPhuCapFrm', 'WA_BangPhuCapFrm', 'MASTER_DETAIL_SIMPLE',
        'HR_BangPhuCapTbl', 'MaPhuCap', 'WA_BangPhuCapFrm', 'API_TruyVanDong_V2',
        'API_LuuDong_V2', 'API_XoaDong_V2', 'SAFE_TABLE_COLUMNS', 'AUTO_SCHEMA',
        'AUTO_SCHEMA', 'ACTIVE', 'MANUAL_CONFIG', 2,
        1, GETDATE(), 'admin', GETDATE(), 'admin'
    );
END
ELSE
BEGIN
    UPDATE dbo.WA_FieldContractRegistry
    SET ERPFormID = 'WA_BangPhuCapFrm',
        PermissionFormName = 'WA_BangPhuCapFrm',
        ContractType = 'MASTER_DETAIL_SIMPLE',
        ExpectedTableName = 'HR_BangPhuCapTbl',
        ExpectedPrimaryKey = 'MaPhuCap',
        ViewList = 'WA_BangPhuCapFrm',
        ViewProcedure = 'API_TruyVanDong_V2',
        SaveProcedure = 'API_LuuDong_V2',
        DeleteProcedure = 'API_XoaDong_V2',
        WritePolicy = 'SAFE_TABLE_COLUMNS',
        BranchPolicy = 'AUTO_SCHEMA',
        DeletePolicy = 'AUTO_SCHEMA',
        RolloutStatus = 'ACTIVE',
        RolloutReason = 'MANUAL_CONFIG',
        SchemaVersion = 2,
        IsEnabled = 1,
        UpdatedBy = 'admin',
        UpdatedAt = GETDATE()
    WHERE WebFormName = 'WA_BangPhuCapFrm';
END

-- 4. ĐĂNG KÝ DETAIL VÀO PHASE 3 DATASET REGISTRY
IF NOT EXISTS (SELECT 1 FROM dbo.WA_FieldDatasetRegistry WHERE WebFormName = 'WA_BangPhuCapFrm' AND DatasetKey = 'API_BangPhuCap_Detail')
BEGIN
    INSERT INTO dbo.WA_FieldDatasetRegistry (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    VALUES (
        'WA_BangPhuCapFrm', 'API_BangPhuCap_Detail', 'API_BangPhuCap_Detail', 'API_BangPhuCap_Detail',
        'HR_PersonAllowanceTbl', 'UserAutoID', 'MaPhuCap', 'MaPhuCap',
        0, 'API_LuuDong_V2', 'API_XoaDong_V2', 'VIEW_PHYSICAL_COLUMNS',
        'AUTO_SCHEMA', 'ACTIVE', 'MANUAL_CONFIG', 2,
        GETDATE(), 'admin', GETDATE(), 'admin'
    );
END
ELSE
BEGIN
    UPDATE dbo.WA_FieldDatasetRegistry
    SET ApiList = 'API_BangPhuCap_Detail',
        ViewProcedure = 'API_BangPhuCap_Detail',
        ExpectedTableName = 'HR_PersonAllowanceTbl',
        ExpectedPrimaryKey = 'UserAutoID',
        ParentField = 'MaPhuCap',
        ChildField = 'MaPhuCap',
        IsReadOnly = 0,
        SaveProcedure = 'API_LuuDong_V2',
        DeleteProcedure = 'API_XoaDong_V2',
        WritePolicy = 'VIEW_PHYSICAL_COLUMNS',
        BranchPolicy = 'AUTO_SCHEMA',
        RolloutStatus = 'ACTIVE',
        RolloutReason = 'MANUAL_CONFIG',
        SchemaVersion = 2,
        UpdatedBy = 'admin',
        UpdatedAt = GETDATE()
    WHERE WebFormName = 'WA_BangPhuCapFrm' AND DatasetKey = 'API_BangPhuCap_Detail';
END
GO
