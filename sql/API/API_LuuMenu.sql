
/****** Object:  StoredProcedure [dbo].[API_LuuMenu] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LuuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @MenuID NVARCHAR(50),
    @OldMenuID NVARCHAR(50) = '',
    @ParentID NVARCHAR(50) = '',
    @Label NVARCHAR(250),
    @EN NVARCHAR(250) = '',
    @SubTitle NVARCHAR(250) = '',
    @FormName NVARCHAR(250) = '',
    @FormKey NVARCHAR(250) = '',
    @URLPara NVARCHAR(250) = '',
    @Icon NVARCHAR(100) = '',
    @IsDisable BIT = 0,
    @IsEdit BIT = 0,
    -- CÁC THAM SỐ MỞ RỘNG CHO TÍNH NĂNG FORM BUILDER ĐỘNG (V2 & V3)
    @TableName NVARCHAR(250) = '',
    @PrimaryKey NVARCHAR(250) = '',
    @AllowHardDelete BIT = 0,
    @ContractType NVARCHAR(50) = 'SIMPLE_TABLE',
    @CustomViewProc NVARCHAR(250) = '',
    @CustomSaveProc NVARCHAR(250) = '',
    @CustomDeleteProc NVARCHAR(250) = '',
    @DatasetsJson NVARCHAR(MAX) = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra Nhóm Cha (ParentID) có hợp lệ không
    IF (@ParentID <> '')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM WA_Menu WHERE MenuID = @ParentID)
        BEGIN
            -- Tự động tạo một Menu Cha (Root) mới thay vì báo lỗi
            INSERT INTO WA_Menu (MenuID, Parent, VN, EN, SubTitle, FormName, FormKey, URLPara, IconClass, isDisable)
            VALUES (@ParentID, '', N'Nhóm Menu ' + @ParentID, '', '', '', '', '', 'folder', 0);
        END

        IF (@IsEdit = 1 AND @ParentID = @OldMenuID)
        BEGIN
            RAISERROR (N'Lỗi: Một Menu không thể tự chọn chính nó làm Nhóm Cha!', 16, 1);
            RETURN;
        END
    END

    -- Tự động bóc tách và gán tiền tố ID Nhóm Cha vào Menu ID
    IF (@IsEdit = 1)
    BEGIN
        DECLARE @OldParentID NVARCHAR(50);
        SELECT @OldParentID = ISNULL(Parent, '') FROM WA_Menu WHERE MenuID = @OldMenuID;
        
        -- Nếu ID hiện tại đang dính Parent cũ, cắt bỏ Parent cũ ra khỏi ID
        IF (@OldParentID <> '' AND @MenuID LIKE @OldParentID + '%')
        BEGIN
            SET @MenuID = RIGHT(@MenuID, LEN(@MenuID) - LEN(@OldParentID));
        END
    END

    -- Gắn Parent mới vào ID nếu có chọn Nhóm Cha và ID chưa chứa Nhóm Cha
    IF (@ParentID <> '' AND @MenuID NOT LIKE @ParentID + '%')
    BEGIN
        SET @MenuID = @ParentID + @MenuID;
    END

    IF (@IsEdit = 1)
    BEGIN
        -- Đổi ID nếu cần thiết
        IF (@OldMenuID <> '' AND @OldMenuID <> @MenuID)
        BEGIN
            UPDATE WA_Menu SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            UPDATE WA_UserGroupPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            UPDATE WA_UserPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            -- Đồng bộ cập nhật cột Parent cho các menu con nếu đổi ID của Group cha
            UPDATE WA_Menu SET Parent = @MenuID WHERE Parent = @OldMenuID;
        END

        UPDATE WA_Menu 
        SET 
            Parent = @ParentID,
            VN = @Label,
            EN = @EN,
            SubTitle = @SubTitle,
            FormName = @FormName,
            FormKey = @FormKey,
            URLPara = @URLPara,
            IconClass = @Icon,
            isDisable = @IsDisable
        WHERE MenuID = @MenuID;
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM WA_Menu WHERE MenuID = @MenuID)
        BEGIN
            RAISERROR (N'Lỗi: Menu ID này đã tồn tại trong hệ thống!', 16, 1);
            RETURN;
        END

        INSERT INTO WA_Menu (MenuID, Parent, VN, EN, SubTitle, FormName, FormKey, URLPara, IconClass, isDisable)
        VALUES (@MenuID, @ParentID, @Label, @EN, @SubTitle, @FormName, @FormKey, @URLPara, @Icon, @IsDisable);
    END

    -- =========================================================================================
    -- MAGIC: HỆ SINH THÁI FORM ĐỘNG V2 & V3 (METADATA-DRIVEN)
    -- Tự động hóa các bước tạo form để biến màn hình Menu thành 1 Form Builder hoàn chỉnh.
    -- =========================================================================================
    IF (LTRIM(RTRIM(@FormName)) <> '')
    BEGIN
        -- Phân loại chế độ kết nối & Procedure định tuyến
        DECLARE @TargetViewProc NVARCHAR(250) = 'API_TruyVanDong_V2';
        DECLARE @TargetSaveProc NVARCHAR(250) = 'API_LuuDong_V2';
        DECLARE @TargetDeleteProc NVARCHAR(250) = 'API_XoaDong_V2';
        DECLARE @RegContractType NVARCHAR(50) = 'SIMPLE_TABLE';

        SET @ContractType = UPPER(LTRIM(RTRIM(ISNULL(@ContractType, 'SIMPLE_TABLE'))));
        IF (@ContractType = '') SET @ContractType = 'SIMPLE_TABLE';

        IF (@ContractType = 'JOIN_VIEW')
        BEGIN
            SET @RegContractType = 'JOIN_VIEW_SINGLE_TABLE';
            IF (LTRIM(RTRIM(@CustomViewProc)) <> '')
                SET @TargetViewProc = LTRIM(RTRIM(@CustomViewProc));
        END
        ELSE IF (@ContractType = 'CUSTOM_API')
        BEGIN
            SET @RegContractType = 'CUSTOM_API';
            IF (LTRIM(RTRIM(@CustomViewProc)) <> '') SET @TargetViewProc = LTRIM(RTRIM(@CustomViewProc));
            IF (LTRIM(RTRIM(@CustomSaveProc)) <> '') SET @TargetSaveProc = LTRIM(RTRIM(@CustomSaveProc));
            IF (LTRIM(RTRIM(@CustomDeleteProc)) <> '') SET @TargetDeleteProc = LTRIM(RTRIM(@CustomDeleteProc));
        END
        ELSE IF (@ContractType = 'MASTER_DETAIL' OR @ContractType = 'MASTER_DETAIL_SIMPLE')
        BEGIN
            SET @RegContractType = 'MASTER_DETAIL_SIMPLE';
            IF (LTRIM(RTRIM(@CustomViewProc)) <> '') SET @TargetViewProc = LTRIM(RTRIM(@CustomViewProc));
            SET @TargetSaveProc = 'API_LuuDong_V2';
            SET @TargetDeleteProc = 'API_XoaDong_V2';
        END

        -- 1. Đăng ký/Cập nhật Bảng vật lý vào SY_FrmLstTbl (Nếu có khai báo TableName)
        IF (LTRIM(RTRIM(@TableName)) <> '')
        BEGIN
            IF EXISTS (SELECT 1 FROM SY_FrmLstTbl WHERE FormID = @FormName)
            BEGIN
                UPDATE SY_FrmLstTbl 
                SET TableName = @TableName, PrimaryKey = @PrimaryKey
                WHERE FormID = @FormName;
            END
            ELSE
            BEGIN
                INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey)
                VALUES (@FormName, @TableName, @PrimaryKey);
            END

            -- Đánh dấu cấp phép xóa cứng bằng Extended Properties trên bảng vật lý
            IF (@AllowHardDelete = 1 AND OBJECT_ID(@TableName) IS NOT NULL)
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.extended_properties 
                    WHERE major_id = OBJECT_ID(@TableName) AND name = 'AllowHardDelete'
                )
                BEGIN
                    EXEC sys.sp_updateextendedproperty @name = N'AllowHardDelete', @value = N'1', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = @TableName;
                END
                ELSE
                BEGIN
                    EXEC sys.sp_addextendedproperty @name = N'AllowHardDelete', @value = N'1', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = @TableName;
                END
            END
        END

        -- 2. Tự động định tuyến (Routing) sang bộ 3 API (V2 Dùng chung hoặc Custom Procedure)
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'View')
            INSERT INTO WA_API ([list], [func], [SQL], [Para]) VALUES (@FormName, 'View', @TargetViewProc, N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');
        ELSE
            UPDATE WA_API SET [SQL] = @TargetViewProc, [Para] = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''' WHERE [list] = @FormName AND [func] = 'View';
            
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'Save')
            INSERT INTO WA_API ([list], [func], [SQL], [Para]) VALUES (@FormName, 'Save', @TargetSaveProc, N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');
        ELSE
            UPDATE WA_API SET [SQL] = @TargetSaveProc, [Para] = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''' WHERE [list] = @FormName AND [func] = 'Save';
            
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'Delete')
            INSERT INTO WA_API ([list], [func], [SQL], [Para]) VALUES (@FormName, 'Delete', @TargetDeleteProc, N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''');
        ELSE
            UPDATE WA_API SET [SQL] = @TargetDeleteProc, [Para] = N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''' WHERE [list] = @FormName AND [func] = 'Delete';

        -- 3. Tự động cấp Full Quyền cho Super Admin trên form mới để có thể dùng ngay
        IF NOT EXISTS (SELECT 1 FROM WA_UserGroupPermisstion WHERE UserGroupID = 'admin' AND MenuID = @MenuID)
        BEGIN
            INSERT INTO WA_UserGroupPermisstion (UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete)
            VALUES ('admin', @MenuID, 1, 1, 1, 1);
        END

        -- 4. Tự động đăng ký Form Builder V2/V3 vào WA_FieldContractRegistry
        IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry WHERE WebFormName = @FormName)
            BEGIN
                UPDATE dbo.WA_FieldContractRegistry
                SET ContractType = @RegContractType,
                    ExpectedTableName = NULLIF(@TableName, ''),
                    ExpectedPrimaryKey = NULLIF(@PrimaryKey, ''),
                    ViewProcedure = @TargetViewProc,
                    SaveProcedure = @TargetSaveProc,
                    DeleteProcedure = @TargetDeleteProc,
                    RolloutStatus = 'ACTIVE',
                    IsEnabled = 1,
                    UpdatedAt = SYSUTCDATETIME(),
                    UpdatedBy = N'System'
                WHERE WebFormName = @FormName;
            END
            ELSE
            BEGIN
                INSERT INTO dbo.WA_FieldContractRegistry
                (
                    WebFormName, ERPFormID, PermissionFormName, ContractType,
                    ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
                    SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy, DeletePolicy,
                    RolloutStatus, RolloutReason, SchemaVersion, IsEnabled, CreatedBy, UpdatedBy
                )
                VALUES
                (
                    @FormName, @FormName, @FormName, @RegContractType,
                    NULLIF(@TableName, ''), NULLIF(@PrimaryKey, ''), @FormName, @TargetViewProc,
                    @TargetSaveProc, @TargetDeleteProc, 'SAFE_TABLE_COLUMNS', 'AUTO_SCHEMA', 'AUTO_SCHEMA',
                    'ACTIVE', N'FORM_BUILDER_V3_AUTO_REGISTERED', 2, 1, 'System', 'System'
                );
            END
        END

        -- 4.5. Đăng ký các Tab Con (Sub-Datasets) vào WA_FieldDatasetRegistry nếu có truyền DatasetsJson
        IF OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NOT NULL AND (ISJSON(@DatasetsJson) = 1)
        BEGIN
            DECLARE @ParsedDatasets TABLE
            (
                DatasetKey VARCHAR(80) NOT NULL,
                DisplayLabel NVARCHAR(200) NOT NULL,
                SortOrder INT NOT NULL,
                ApiList VARCHAR(100) NOT NULL,
                ViewProcedure SYSNAME NULL,
                TableName SYSNAME NULL,
                PrimaryKey SYSNAME NULL,
                ParentField SYSNAME NULL,
                ChildField SYSNAME NULL,
                IsReadOnly BIT NOT NULL,
                SaveProcedure SYSNAME NULL,
                DeleteProcedure SYSNAME NULL
            );

            INSERT INTO @ParsedDatasets
            (
                DatasetKey, DisplayLabel, SortOrder, ApiList, ViewProcedure, TableName, PrimaryKey,
                ParentField, ChildField, IsReadOnly, SaveProcedure, DeleteProcedure
            )
            SELECT
                J.datasetKey,
                COALESCE(NULLIF(LTRIM(RTRIM(J.label)), N''), CONVERT(NVARCHAR(200), J.datasetKey)),
                TRY_CONVERT(INT, DatasetItem.[key]) + 1,
                ISNULL(NULLIF(J.apiList, ''), ISNULL(NULLIF(J.tableName, ''), J.datasetKey)),
                NULLIF(J.viewProcedure, ''),
                NULLIF(J.tableName, ''),
                NULLIF(J.primaryKey, ''),
                NULLIF(J.parentField, ''),
                NULLIF(J.childField, ''),
                CASE WHEN J.isReadOnly = 1 THEN 1 ELSE 0 END,
                CASE
                    WHEN J.isReadOnly = 1 THEN NULL
                    ELSE COALESCE(NULLIF(J.saveProcedure, ''), N'API_LuuDong_V2')
                END,
                CASE
                    WHEN J.isReadOnly = 1 THEN NULL
                    ELSE COALESCE(NULLIF(J.deleteProcedure, ''), N'API_XoaDong_V2')
                END
            FROM OPENJSON(@DatasetsJson) AS DatasetItem
            CROSS APPLY OPENJSON(DatasetItem.[value])
            WITH
            (
                datasetKey VARCHAR(80) '$.datasetKey',
                label NVARCHAR(200) '$.label',
                apiList VARCHAR(100) '$.apiList',
                viewProcedure SYSNAME '$.viewProcedure',
                tableName SYSNAME '$.tableName',
                primaryKey SYSNAME '$.primaryKey',
                parentField SYSNAME '$.parentField',
                childField SYSNAME '$.childField',
                isReadOnly BIT '$.isReadOnly',
                saveProcedure SYSNAME '$.saveProcedure',
                deleteProcedure SYSNAME '$.deleteProcedure'
            ) AS J
            WHERE NULLIF(LTRIM(RTRIM(J.datasetKey)), '') IS NOT NULL;

            DELETE FROM dbo.WA_FieldDatasetRegistry WHERE WebFormName = @FormName;

            DECLARE @DatasetOrderBase DATETIME2(3) = SYSUTCDATETIME();

            INSERT INTO dbo.WA_FieldDatasetRegistry
            (
                WebFormName, DatasetKey, ApiList, ViewProcedure, ExpectedTableName, ExpectedPrimaryKey,
                ParentField, ChildField, IsReadOnly, SaveProcedure, DeleteProcedure,
                WritePolicy, BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
                CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
            )
            SELECT
                @FormName,
                D.DatasetKey,
                D.ApiList,
                D.ViewProcedure,
                D.TableName,
                D.PrimaryKey,
                D.ParentField,
                D.ChildField,
                D.IsReadOnly,
                D.SaveProcedure,
                D.DeleteProcedure,
                'SAFE_TABLE_COLUMNS',
                'AUTO_SCHEMA',
                'ACTIVE',
                (
                    SELECT
                        N'FORM_BUILDER_DATASET_REGISTERED' AS [source],
                        D.DisplayLabel AS [label]
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ),
                2,
                DATEADD(MILLISECOND, D.SortOrder, @DatasetOrderBase),
                'System',
                DATEADD(MILLISECOND, D.SortOrder, @DatasetOrderBase),
                'System'
            FROM @ParsedDatasets AS D;

            -- Đăng ký route đọc cho từng tab con. DynamicDetailManager gọi bằng ApiList,
            -- không gọi trực tiếp tên procedure do người dùng nhập.
            UPDATE A
            SET
                A.[SQL] = D.ViewProcedure,
                A.[Para] = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
            FROM dbo.WA_API AS A
            INNER JOIN @ParsedDatasets AS D
                ON D.ApiList = A.[list]
            WHERE A.[func] = 'View'
              AND D.ViewProcedure IS NOT NULL;

            INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
            SELECT
                D.ApiList,
                'View',
                D.ViewProcedure,
                N'@List=N''{List}'', @Keyword=N''{Keyword}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
            FROM @ParsedDatasets AS D
            WHERE D.ViewProcedure IS NOT NULL
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_API AS A
                  WHERE A.[list] = D.ApiList
                    AND A.[func] = 'View'
              );

            UPDATE A
            SET
                A.[SQL] = D.SaveProcedure,
                A.[Para] = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            FROM dbo.WA_API AS A
            INNER JOIN @ParsedDatasets AS D
                ON D.ApiList = A.[list]
            WHERE A.[func] = 'Save'
              AND D.IsReadOnly = 0;

            INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
            SELECT
                D.ApiList,
                'Save',
                D.SaveProcedure,
                N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            FROM @ParsedDatasets AS D
            WHERE D.IsReadOnly = 0
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_API AS A
                  WHERE A.[list] = D.ApiList
                    AND A.[func] = 'Save'
              );

            UPDATE A
            SET
                A.[SQL] = D.DeleteProcedure,
                A.[Para] = N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            FROM dbo.WA_API AS A
            INNER JOIN @ParsedDatasets AS D
                ON D.ApiList = A.[list]
            WHERE A.[func] = 'Delete'
              AND D.IsReadOnly = 0;

            INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
            SELECT
                D.ApiList,
                'Delete',
                D.DeleteProcedure,
                N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            FROM @ParsedDatasets AS D
            WHERE D.IsReadOnly = 0
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_API AS A
                  WHERE A.[list] = D.ApiList
                    AND A.[func] = 'Delete'
              );
        END

        -- 5. Tự động đồng bộ phân quyền cho toàn bộ các Nhóm Người Dùng trong hệ thống
        IF OBJECT_ID(N'dbo.API_DongBoQuyenTruyCap', N'P') IS NOT NULL
        BEGIN
            EXEC dbo.API_DongBoQuyenTruyCap;
        END
    END

    SELECT 0 AS [code], N'Lưu Menu thành công!' AS [msg];
END
GO
