/*
  Business procedures có caller hiện tại và canonical source rõ ràng
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_ComboPersonStatus; Input: sql/API/API_ComboPersonStatus.sql */
CREATE OR ALTER PROCEDURE dbo.API_ComboPersonStatus
(
    @Keyword NVARCHAR(200) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PersonStatus AS [Mã],
        PersonStatusName AS [Tên]
    FROM dbo.HR_PersonStatusTbl
    WHERE (@Keyword = '' OR PersonStatusName LIKE N'%' + @Keyword + '%')
    ORDER BY PersonStatus ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_DanhSachChucDanh; Input: sql/API/APINEW/API_DanhSachChucDanh.sql */
CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucDanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT
        ChucDanhChuyenMon,
        MoTa
    FROM HR_ChucDanhTbl
    WHERE
        @Keyword = ''
        OR ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
        OR MoTa LIKE N'%' + @Keyword + '%'
    ORDER BY ChucDanhChuyenMon;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_Attach; Input: sql/API/APINEW/API_HopDongLaoDong_Attach.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        MaHopDong,
        FileName,
        FileType,
        STT,
        FileSize,
        Content
    FROM dbo.HR_HopDongAttachTbl
    WHERE MaHopDong = @MaHopDong
    ORDER BY STT ASC, UserAutoID DESC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_ChiTiet; Input: sql/API/APINEW/API_HopDongLaoDong_ChiTiet.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_ChiTiet
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        D.UserAutoID,
        D.MaHopDong,
        D.MaPhuCap,
        ISNULL(D.TenPhuCap, P.TenPhuCap) AS TenPhuCap,
        D.TienPhuCap,
        P.TienPhuCapNgay,
        P.TienPhuCapThang,
        D.GhiChu
    FROM dbo.HR_HopDongDetailTbl D
    LEFT JOIN dbo.HR_BangPhuCapTbl P ON D.MaPhuCap = P.MaPhuCap
    WHERE D.MaHopDong = @MaHopDong
    ORDER BY D.MaPhuCap ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_LoaiHD; Input: sql/API/APINEW/API_HopDongLaoDong_LoaiHD.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_LoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        LoaiHD
    FROM dbo.HR_HopDongTbl
    WHERE LoaiHD IS NOT NULL AND LoaiHD <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_NamLap; Input: sql/API/APINEW/API_HopDongLaoDong_NamLap.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NamLap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        NamLap
    FROM dbo.HR_HopDongTbl
    WHERE NamLap IS NOT NULL
      AND (@Keyword = '' OR CAST(NamLap AS NVARCHAR(50)) LIKE '%' + @Keyword + '%')
    ORDER BY NamLap DESC;
END
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_Attach; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_Attach]
(
    @DocumentID VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        DocumentID,
        FileName,
        FileType,
        STT,
        FileSize,
        Content
    FROM dbo.HR_NghiPhepAttachTbl
    WHERE DocumentID = @DocumentID
    ORDER BY STT ASC, UserAutoID DESC;
END
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_Attach_Save; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_Attach_Save]
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @UserAutoID VARCHAR(50) = NULLIF(JSON_VALUE(@Data, '$.UserAutoID'), '');
        DECLARE @DocumentID NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.DocumentID'), N'');
        DECLARE @FileName NVARCHAR(500) = NULLIF(JSON_VALUE(@Data, '$.FileName'), N'');
        DECLARE @FileType INT = TRY_CONVERT(INT, JSON_VALUE(@Data, '$.FileType'));
        DECLARE @STT NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.STT'), N'');
        DECLARE @FileSize DECIMAL(18, 0) = TRY_CONVERT(DECIMAL(18, 0), JSON_VALUE(@Data, '$.FileSize'));
        DECLARE @ContentText NVARCHAR(MAX) = (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Content');
        DECLARE @Base64Content VARCHAR(MAX) = TRY_CONVERT(VARCHAR(MAX), (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Base64Content'));
        DECLARE @Content VARBINARY(MAX) = NULL;
        DECLARE @BranchID VARCHAR(50);
        DECLARE @UserBranchID VARCHAR(500);
        DECLARE @UserGroupID VARCHAR(50);
        DECLARE @MenuID NVARCHAR(50);

        IF @DocumentID IS NULL OR @FileName IS NULL OR ISJSON(@Data) <> 1
            THROW 51800, N'Dữ liệu file đính kèm không hợp lệ.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.HR_NghiPhepTbl WHERE DocumentID = @DocumentID)
            THROW 51801, N'Đơn nghỉ phép không tồn tại.', 1;

        SELECT @BranchID = P.BranchID
        FROM dbo.HR_NghiPhepTbl H
        LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = H.PersonID
        WHERE H.DocumentID = @DocumentID;

        SELECT
            @UserBranchID = U.BranchID,
            @UserGroupID = U.UserGroupID
        FROM dbo.SY_User U
        WHERE U.UserName = @UserName;

        IF UPPER(ISNULL(@UserName, '')) <> 'ADMIN'
        BEGIN
            IF @UserGroupID IS NULL
                THROW 51802, N'Không xác định được quyền người dùng.', 1;

            SELECT TOP (1) @MenuID = MenuID
            FROM dbo.WA_Menu
            WHERE FormName = 'WA_DonXinNghiPhepFrm';

            IF @MenuID IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM dbo.WA_UserGroupPermisstion
                WHERE UserGroupID = @UserGroupID
                  AND MenuID = @MenuID
                  AND (ISNULL(IsAdd, 0) = 1 OR ISNULL(IsUpdate, 0) = 1)
            )
                THROW 51803, N'Bạn không có quyền lưu tài liệu đơn xin nghỉ phép.', 1;

            IF NULLIF(LTRIM(RTRIM(@UserBranchID)), '') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM STRING_SPLIT(@UserBranchID, ',')
                   WHERE UPPER(LTRIM(RTRIM(value))) = UPPER(ISNULL(@BranchID, ''))
               )
                THROW 51804, N'Bạn không có quyền lưu tài liệu của chi nhánh này.', 1;
        END;

        IF @UserAutoID IS NULL
            SET @UserAutoID = LOWER(CONVERT(VARCHAR(36), NEWID()));

        IF @STT IS NULL
            SELECT @STT = CONVERT(NVARCHAR(100), ISNULL(MAX(TRY_CONVERT(INT, STT)), 0) + 1)
            FROM dbo.HR_NghiPhepAttachTbl WITH (UPDLOCK, HOLDLOCK)
            WHERE DocumentID = @DocumentID;

        IF @ContentText IS NOT NULL AND LTRIM(RTRIM(@ContentText)) <> N''
        BEGIN
            IF LOWER(LEFT(@ContentText, 2)) = N'0x'
                SET @Content = CONVERT(VARBINARY(MAX), @ContentText, 1);
            ELSE
                SET @Content = CAST(N'' AS XML).value('xs:base64Binary(sql:variable("@ContentText"))', 'varbinary(max)');
        END;

        IF EXISTS (SELECT 1 FROM dbo.HR_NghiPhepAttachTbl WHERE UserAutoID = @UserAutoID)
        BEGIN
            IF EXISTS (
                SELECT 1 FROM dbo.HR_NghiPhepAttachTbl
                WHERE UserAutoID = @UserAutoID AND DocumentID = @DocumentID
            )
            BEGIN
                SELECT 0 AS code, N'File đính kèm đã được lưu trước đó.' AS msg, @UserAutoID AS UserAutoID;
                RETURN;
            END;
            THROW 51805, N'UserAutoID đã tồn tại ở đơn nghỉ phép khác.', 1;
        END;

        INSERT INTO dbo.HR_NghiPhepAttachTbl (
            UserAutoID, DocumentID, FileName, FileType, STT, Content, FileSize, Base64Content
        )
        VALUES (
            @UserAutoID, @DocumentID, @FileName, ISNULL(@FileType, 0), @STT, @Content, @FileSize, @Base64Content
        );

        SELECT 0 AS code, N'Lưu file đính kèm thành công.' AS msg, @UserAutoID AS UserAutoID;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg, NULL AS UserAutoID;
    END CATCH;
END;
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_ChiTiet; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_ChiTiet]
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        D.DetailID,
        D.DocumentID,
        D.HinhThucNghi,
        D.NghiTuNgay,
        D.DenNgay,
        D.SoNgayNghi,
        D.Notes
    FROM dbo.HR_NghiPhepDetailTbl D
    WHERE D.DocumentID = @DocumentID
    ORDER BY D.NghiTuNgay ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LayQuyenCuaToi; Input: sql/API/API_LayQuyenCuaToi.sql */
CREATE OR ALTER PROCEDURE API_LayQuyenCuaToi
    @Username varchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserGroupID varchar(50);

    -- Lấy Nhóm Quyền của Nhân viên đang đăng nhập
    SELECT @UserGroupID = UserGroupID
    FROM SY_User
    WHERE UserName = @Username;

    -- Nếu không tìm thấy user hoặc chưa có nhóm, trả về mảng rỗng
    IF @UserGroupID IS NULL
    BEGIN
        SELECT 0 AS [code], 'User not found' AS [msg];
        RETURN;
    END

    -- Quét toàn bộ quyền của Nhóm này và móc với Tên Menu
    -- Trả về cho C# duyệt và convert thành chuỗi JSON { "frmStaff": { "CanAdd": 1, ... } }
    SELECT
        M.FormName AS [FormName],
        M.VN AS [MenuName],
        M.URLPara AS [URLPara],
        M.FormKey AS [FormKey],
        ISNULL(P.IsRun, 0) AS CanView,
        ISNULL(P.IsAdd, 0) AS CanAdd,
        ISNULL(P.IsUpdate, 0) AS CanEdit,
        ISNULL(P.IsDelete, 0) AS CanDelete
    FROM WA_UserGroupPermisstion P
    INNER JOIN WA_Menu M ON P.MenuID = M.MenuID
    WHERE P.UserGroupID = @UserGroupID
      AND M.FormName IS NOT NULL AND M.FormName <> '';

END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LuuThuTuMenu; Input: sql/API/API_LuuThuTuMenu.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_LuuThuTuMenu]
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

/* CanonicalSource: REPOSITORY; Object: dbo.API_XoaTruongGiaoDien; Input: sql/API/API_XoaTruongGiaoDien.sql */
CREATE OR ALTER PROCEDURE API_XoaTruongGiaoDien
    @IDs varchar(max) = NULL,
    @FormName varchar(50) = NULL, -- Form gọi API (frmFormBuilder)
    @UserName varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @IDs IS NULL OR @IDs = ''
    BEGIN
        SELECT 1 AS code, N'Thiếu ID cần xóa' AS message;
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM SY_FormatFields
        WHERE LOWER(FormName) = LOWER('WA_BangThueTNCNFrm')
          AND AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL)
    )
        THROW 52603, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: không xóa field legacy của form pilot.', 1;

    BEGIN TRY
        -- Tách chuỗi ID và xóa (hỗ trợ SQL Server 2016 trở lên)
        DELETE FROM SY_FormatFields
        WHERE AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL);

        SELECT 0 AS code, N'Xóa thành công' AS message;
    END TRY
    BEGIN CATCH
        SELECT 1 AS code, ERROR_MESSAGE() AS message;
    END CATCH
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_CandidateAttach_SaveAvatar; Input: sql/API/APINEW/API_UngVienAttach.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_CandidateAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = TRY_CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        IF @CandidateID IS NULL OR @CandidateID = ''
        BEGIN
            SELECT -1 AS code, N'Không tìm thấy mã ứng viên.' AS msg;
            RETURN;
        END;
        IF @FileType = 1
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP (1) @ExistingID = UserAutoID
            FROM dbo.HR_CandidateAttachTbl
            WHERE CandidateID = @CandidateID AND FileType = 1;
            IF @ExistingID IS NOT NULL
            BEGIN
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END;
        END;
        EXEC dbo.API_LuuDong @List=@List,@Data=@Data,@UserName=@UserName;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_PersonAttach_SaveAvatar; Input: sql/API/APINEW/API_HoSoNhanVien.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_PersonAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @PersonID VARCHAR(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = TRY_CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        DECLARE @TargetID VARCHAR(50) = ISNULL(@PersonID,@CandidateID);
        IF @TargetID IS NULL OR @TargetID = ''
        BEGIN
            SELECT -1 AS code,N'Không tìm thấy mã nhân viên/ứng viên.' AS msg;
            RETURN;
        END;
        IF @FileType = 1
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP (1) @ExistingID=UserAutoID
            FROM dbo.HR_PersonAttachTbl
            WHERE PersonID=@TargetID AND FileType=1;
            IF @ExistingID IS NOT NULL
            BEGIN
                SET @Data=JSON_MODIFY(@Data,'$.UserAutoID',@ExistingID);
                SET @Data=JSON_MODIFY(@Data,'$.IsEdit',1);
            END;
        END;
        EXEC dbo.API_LuuDong @List=@List,@Data=@Data,@UserName=@UserName;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong; Input: sql/API/APINEW/API_HopDongLaoDong.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong
(
    @Keyword NVARCHAR(200) = '',
    @NamLap NVARCHAR(50) = '',
    @LoaiHD NVARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1000 *
    FROM dbo.vHR_HopDong_LaoDong
    WHERE
        (ISNULL(@Keyword, '') = ''
         OR MaHopDong LIKE '%' + @Keyword + '%'
         OR PersonID LIKE '%' + @Keyword + '%'
         OR PersonName LIKE N'%' + @Keyword + '%')
        AND (ISNULL(@NamLap, '') = '' OR NamLap = TRY_CAST(@NamLap AS INT))
        AND (ISNULL(@LoaiHD, '') = '' OR LoaiHD = @LoaiHD)
        AND (ISNULL(@BranchID, '') = ''
             OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY NgayKyHopDong DESC, MaHopDong DESC;
END;
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HopDongLaoDong_Attach_Save; no repository definition */
CREATE OR ALTER PROCEDURE [dbo].[API_HopDongLaoDong_Attach_Save]
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)=''
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @UserAutoID VARCHAR(50)=NULLIF(JSON_VALUE(@Data,'$.UserAutoID'),'');
        DECLARE @MaHopDong NVARCHAR(100)=NULLIF(JSON_VALUE(@Data,'$.MaHopDong'),N'');
        DECLARE @FileName NVARCHAR(500)=NULLIF(JSON_VALUE(@Data,'$.FileName'),N'');
        DECLARE @FileType INT=TRY_CONVERT(INT,JSON_VALUE(@Data,'$.FileType'));
        DECLARE @STT NVARCHAR(100)=NULLIF(JSON_VALUE(@Data,'$.STT'),N'');
        DECLARE @FileSize DECIMAL(18,0)=TRY_CONVERT(DECIMAL(18,0),JSON_VALUE(@Data,'$.FileSize'));
        DECLARE @ContentText NVARCHAR(MAX)=(SELECT value FROM OPENJSON(@Data) WHERE [key]='Content');
        DECLARE @Base64Content VARCHAR(MAX)=TRY_CONVERT(VARCHAR(MAX),(SELECT value FROM OPENJSON(@Data) WHERE [key]='Base64Content'));
        DECLARE @Content VARBINARY(MAX)=NULL;
        DECLARE @BranchID VARCHAR(50),@UserBranchID VARCHAR(500),@UserGroupID VARCHAR(50),@MenuID NVARCHAR(50);
        IF ISJSON(@Data)<>1 OR @MaHopDong IS NULL OR @FileName IS NULL
            THROW 51800,N'Dữ liệu file hợp đồng không hợp lệ.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.HR_HopDongTbl WHERE MaHopDong=@MaHopDong)
            THROW 51801,N'Hợp đồng không tồn tại.',1;
        SELECT @BranchID=P.BranchID
        FROM dbo.HR_HopDongTbl AS H
        LEFT JOIN dbo.HR_PersonTbl AS P ON P.PersonID=H.PersonID
        WHERE H.MaHopDong=@MaHopDong;
        SELECT @UserBranchID=U.BranchID,@UserGroupID=U.UserGroupID
        FROM dbo.SY_User AS U WHERE U.UserName=@UserName;
        IF UPPER(ISNULL(@UserName,''))<>'ADMIN'
        BEGIN
            IF @UserGroupID IS NULL THROW 51802,N'Không xác định được quyền người dùng.',1;
            SELECT TOP (1) @MenuID=MenuID FROM dbo.WA_Menu WHERE FormName='WA_HopDongLaoDongFrm';
            IF @MenuID IS NOT NULL AND NOT EXISTS
            (
                SELECT 1 FROM dbo.WA_UserGroupPermisstion
                WHERE UserGroupID=@UserGroupID AND MenuID=@MenuID
                  AND (ISNULL(IsAdd,0)=1 OR ISNULL(IsUpdate,0)=1)
            )
                THROW 51803,N'Không có quyền lưu tài liệu hợp đồng.',1;
            IF NULLIF(LTRIM(RTRIM(@UserBranchID)),'') IS NOT NULL
               AND NOT EXISTS
               (
                   SELECT 1 FROM STRING_SPLIT(@UserBranchID,',')
                   WHERE UPPER(LTRIM(RTRIM(value)))=UPPER(ISNULL(@BranchID,''))
               )
                THROW 51804,N'Không có quyền lưu tài liệu của chi nhánh này.',1;
        END;
        IF @UserAutoID IS NULL SET @UserAutoID=LOWER(CONVERT(VARCHAR(36),NEWID()));
        IF @STT IS NULL
            SELECT @STT=CONVERT(NVARCHAR(100),ISNULL(MAX(TRY_CONVERT(INT,STT)),0)+1)
            FROM dbo.HR_HopDongAttachTbl WITH (UPDLOCK,HOLDLOCK)
            WHERE MaHopDong=@MaHopDong;
        IF @ContentText IS NOT NULL AND LTRIM(RTRIM(@ContentText))<>N''
        BEGIN
            IF LOWER(LEFT(@ContentText,2))=N'0x'
                SET @Content=CONVERT(VARBINARY(MAX),@ContentText,1);
            ELSE
                SET @Content=CAST(N'' AS XML).value('xs:base64Binary(sql:variable("@ContentText"))','varbinary(max)');
        END;
        IF EXISTS (SELECT 1 FROM dbo.HR_HopDongAttachTbl WHERE UserAutoID=@UserAutoID)
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.HR_HopDongAttachTbl WHERE UserAutoID=@UserAutoID AND MaHopDong=@MaHopDong)
            BEGIN
                SELECT 0 AS code,N'File hợp đồng đã được lưu trước đó.' AS msg,@UserAutoID AS UserAutoID;
                RETURN;
            END;
            THROW 51805,N'UserAutoID đã tồn tại ở hợp đồng khác.',1;
        END;
        INSERT INTO dbo.HR_HopDongAttachTbl
            (UserAutoID,MaHopDong,FileName,FileType,STT,Content,FileSize,Base64Content)
        VALUES
            (@UserAutoID,@MaHopDong,@FileName,ISNULL(@FileType,0),@STT,@Content,@FileSize,@Base64Content);
        SELECT 0 AS code,N'Lưu file hợp đồng thành công.' AS msg,@UserAutoID AS UserAutoID;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg,NULL AS UserAutoID;
    END CATCH;
END;
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep; current leave form route dependency */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep]
    @Keyword NVARCHAR(200)='',
    @BranchID NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (1000) V.*,A.PersonName,A.BranchID AS PersonBranchID
    FROM dbo.HR_NghiPhepView AS V
    LEFT JOIN dbo.HR_PersonTbl AS A ON V.PersonID=A.PersonID
    WHERE (NULLIF(LTRIM(RTRIM(@BranchID)),'') IS NULL
           OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID,',')))
      AND (@Keyword='' OR A.PersonID LIKE '%'+@Keyword+'%'
           OR A.PersonName LIKE N'%'+@Keyword+'%' OR V.DocumentID LIKE '%'+@Keyword+'%')
    ORDER BY V.DocumentDate DESC;
END;
GO

/* CanonicalSource: MERGED_REPOSITORY_WITH_TEST_ROUTE_CONTRACT; Object: dbo.API_KinhPhiCongDoan; Input: repository base + Schemadatatest.sql route signature */
CREATE OR ALTER PROCEDURE [dbo].[API_KinhPhiCongDoan]
    @Keyword NVARCHAR(100)=NULL,
    @BranchID VARCHAR(MAX)=NULL,
    @PeriodID VARCHAR(20)=NULL,
    @PhongBan VARCHAR(50)=NULL,
    @User VARCHAR(50)=NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF ISNULL(@BranchID,'')='' AND ISNULL(@User,'')<>''
        SET @BranchID=(SELECT TOP (1) BranchID FROM dbo.SY_User WHERE UserName=@User);
    SELECT KP.UserAutoID,KP.PersonID,KP.PersonName,KP.ChucDanhChuyenMon,KP.MucDong,
           KP.KinhPhiNopCongDoanVN,KP.CongDoanVN,KP.CongDoanCTY,P.BranchID,
           KP.PeriodID,P.LoaiHD
    FROM dbo.HR_KinhPhiCongDoanTbl AS KP
    LEFT JOIN dbo.HR_PersonView AS P ON KP.PersonID=P.PersonID
    WHERE (ISNULL(@Keyword,'')='' OR KP.PersonID LIKE '%'+@Keyword+'%'
           OR KP.PersonName LIKE N'%'+@Keyword+'%')
      AND (ISNULL(@BranchID,'')='' OR P.BranchID IN
           (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID,',')))
      AND (ISNULL(@PeriodID,'')='' OR KP.PeriodID=@PeriodID)
      AND (ISNULL(@PhongBan,'')='' OR P.PhongBan=@PhongBan)
    ORDER BY KP.PersonID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_NguoiDungFrm; Input: sql/API/APINEW/API_NguoiDungFrm.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungFrm]
    @List VARCHAR(50)='',
    @Keyword NVARCHAR(200)='',
    @SortColumn VARCHAR(50)='',
    @SortDir VARCHAR(10)='',
    @Data NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT U.*,G.UserGroupName,B.BranchName
    FROM dbo.SY_User AS U
    LEFT JOIN dbo.SY_UserGroup AS G ON U.UserGroupID=G.UserGroupID
    LEFT JOIN dbo.CF_BranchTbl AS B ON U.BranchID=B.BranchID
    WHERE @Keyword='' OR U.UserName LIKE N'%'+@Keyword+'%'
       OR U.HoTen LIKE N'%'+@Keyword+'%' OR U.EmployeeID LIKE N'%'+@Keyword+'%'
    ORDER BY U.UserName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_NguoiDungNhomFrm; Input: sql/API/APINEW/API_NguoiDungNhomFrm.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungNhomFrm]
    @List VARCHAR(50)='',
    @Keyword NVARCHAR(200)='',
    @SortColumn VARCHAR(50)='',
    @SortDir VARCHAR(10)='',
    @Data NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT G.UserGroupID,G.UserGroupName,G.IsDisable,
           (SELECT COUNT(*) FROM dbo.SY_User AS U WHERE U.UserGroupID=G.UserGroupID) AS CountUser
    FROM dbo.SY_UserGroup AS G
    WHERE @Keyword='' OR G.UserGroupName LIKE N'%'+@Keyword+'%'
       OR G.UserGroupID LIKE N'%'+@Keyword+'%'
    ORDER BY G.UserGroupID;
END;
GO
