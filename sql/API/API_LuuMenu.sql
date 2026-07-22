
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
    -- CÁC THAM SỐ MỞ RỘNG CHO TÍNH NĂNG FORM BUILDER ĐỘNG (V2)
    @TableName NVARCHAR(250) = '',
    @PrimaryKey NVARCHAR(250) = '',
    @AllowHardDelete BIT = 0
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
    -- MAGIC: HỆ SINH THÁI FORM ĐỘNG V2 (METADATA-DRIVEN)
    -- Tự động hóa các bước tạo form để biến màn hình Menu thành 1 Form Builder hoàn chỉnh.
    -- =========================================================================================
    IF (LTRIM(RTRIM(@FormName)) <> '')
    BEGIN
        -- 1. Đăng ký/Cập nhật Bảng vật lý vào SY_FrmLstTbl
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

        -- 2. Tự động định tuyến (Routing) sang bộ 3 API V2 Dùng Chung
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'View')
            INSERT INTO WA_API ([list], [func], [SQL]) VALUES (@FormName, 'View', 'API_TruyVanDong_V2');
            
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'Save')
            INSERT INTO WA_API ([list], [func], [SQL]) VALUES (@FormName, 'Save', 'API_LuuDong_V2');
            
        IF NOT EXISTS (SELECT 1 FROM WA_API WHERE [list] = @FormName AND [func] = 'Delete')
            INSERT INTO WA_API ([list], [func], [SQL]) VALUES (@FormName, 'Delete', 'API_XoaDong_V2');

        -- 3. Tự động cấp Full Quyền cho Super Admin trên form mới để có thể dùng ngay
        IF NOT EXISTS (SELECT 1 FROM WA_UserGroupPermisstion WHERE UserGroupID = 'admin' AND MenuID = @MenuID)
        BEGIN
            INSERT INTO WA_UserGroupPermisstion (UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete)
            VALUES ('admin', @MenuID, 1, 1, 1, 1);
        END
    END
END
GO
