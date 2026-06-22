USE [QLTiec]
GO

ALTER PROCEDURE [dbo].[API_LuuThuTuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @Type NVARCHAR(20) = 'parent',   
    @OrderedIDs NVARCHAR(MAX) = '',  
    @ParentID NVARCHAR(50) = ''      
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Tách chuỗi ID do Giao diện gửi xuống (chuẩn thứ tự bằng XML)
        DECLARE @Tbl TABLE (Idx INT IDENTITY(1,1), OldID NVARCHAR(50));
        DECLARE @xml XML = CAST('<x>' + REPLACE(@OrderedIDs, ',', '</x><x>') + '</x>' AS XML);

        INSERT INTO @Tbl (OldID)
        SELECT n.value('.', 'NVARCHAR(50)') AS ID
        FROM @xml.nodes('/x') AS p(n);

        -- 2. Lấy danh sách ID HỆ THỐNG HIỆN TẠI đang có (sắp xếp tăng dần theo Alphabet/Số)
        -- Mục đích: Lấy lại chính xác các mã Menu đang dùng để xào bài lại, không sinh mã mới
        DECLARE @TblExisting TABLE (Idx INT IDENTITY(1,1), AvailableID NVARCHAR(50));
        
        IF (@Type = 'parent')
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu 
            WHERE Parent = '' OR Parent IS NULL
            ORDER BY MenuID ASC;
        END
        ELSE
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu 
            WHERE Parent = @ParentID
            ORDER BY MenuID ASC;
        END

        -- 3. Đổi toàn bộ ID gốc sang một mã TẠM THỜI (để tránh lỗi Trùng Khóa Chính - Duplicate Key)
        -- VD: Đổi '0304' thành 'TMP_0304'
        UPDATE M
        SET M.MenuID = 'TMP_' + T.OldID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = T.OldID;

        UPDATE P
        SET P.MenuID = 'TMP_' + T.OldID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = T.OldID;

        UPDATE U
        SET U.MenuID = 'TMP_' + T.OldID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = T.OldID;

        -- Nếu đổi Nhóm Cha, phải đổi Parent của menu con trỏ theo mã Tạm
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = 'TMP_' + T.OldID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = T.OldID;
        END

        -- 4. Ghép nối: Vị trí được KÉO (Tbl) sẽ nhận Mã ID SẮP XẾP (TblExisting)
        -- VD: Kéo 0312 lên đầu (Idx=1), sẽ nhận ID nhỏ nhất của hệ thống (Idx=1 là 0304)
        UPDATE M
        SET M.MenuID = E.AvailableID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE P
        SET P.MenuID = E.AvailableID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE U
        SET U.MenuID = E.AvailableID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        -- Đổi Parent cho menu con về mã mới (nếu là nhóm cha)
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = E.AvailableID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = 'TMP_' + T.OldID
            JOIN @TblExisting E ON T.Idx = E.Idx;
        END

        -- 5. Xóa bỏ cột ThuTu nếu muốn vì giờ đã swap hẳn MenuID
        COMMIT TRANSACTION;
        SELECT 0 AS [code], N'Đã hoàn tất Hoán đổi Mã MenuID thành công' AS [msg];

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg];
    END CATCH
END
GO
