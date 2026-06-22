USE [QLTiec]
GO

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
    @IsEdit BIT = 0
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
END
GO
