/*
  Phase 2 pilot View V2 cho WA_BangThueTNCNFrm.
  - Giữ nguyên các tham số của API_TruyVanDong đang được WA_API sử dụng.
  - Bổ sung UserName/BranchID tùy chọn để kiểm tra quyền phía SQL khi đăng ký V2.
  - Không đọc metadata layout cũ; không sửa dữ liệu.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_BangThueTNCN_V2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_BangThueTNCN_V2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_BangThueTNCN_V2
    @List varchar(50),
    @Keyword nvarchar(200) = N'',
    @SortColumn varchar(50) = '',
    @SortDir varchar(10) = '',
    @Data nvarchar(max) = N'',
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @SortColumn = LTRIM(RTRIM(ISNULL(@SortColumn, '')));
    SET @SortDir = UPPER(LTRIM(RTRIM(ISNULL(@SortDir, ''))));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF LOWER(@List) <> LOWER('WA_BangThueTNCNFrm')
        THROW 52101, N'View V2 này chỉ được phép chạy cho pilot WA_BangThueTNCNFrm.', 1;

    IF @UserName = ''
        THROW 52102, N'Thiếu ngữ cảnh người dùng.', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID,
           @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 52103, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    /* PHASE2_BRANCH_FAIL_CLOSED */
    IF LOWER(@UserGroupID) <> 'admin'
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
            THROW 52118, N'Người dùng không phải admin chưa được gán chi nhánh; từ chối theo nguyên tắc fail-closed.', 1;
        IF @BranchID = ''
            THROW 52115, N'Thiếu ngữ cảnh chi nhánh của người dùng.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE UPPER(LTRIM(RTRIM(Allowed.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
              )
        )
            THROW 52116, N'Chi nhánh nằm ngoài phạm vi người dùng.', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1)
        @MenuID = M.MenuID,
        @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName = @List
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
        THROW 52104, N'Form pilot chưa có menu hoạt động để kiểm tra quyền.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID = @UserGroupID
          AND P.MenuID = @MenuID;

        SELECT @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName = @UserName
          AND P.MenuID = @MenuID;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
            THROW 52105, N'Không có quyền xem danh mục thuế TNCN.', 1;
    END;

    DECLARE @RegistryCount int, @RegistryTable sysname, @RegistryPrimaryKey sysname;
    SELECT
        @RegistryCount = COUNT(*),
        @RegistryTable = MIN(LTRIM(RTRIM(L.TableName))),
        @RegistryPrimaryKey = MIN(LTRIM(RTRIM(L.PrimaryKey)))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @List;

    IF ISNULL(@RegistryCount, 0) <> 1
       OR LOWER(ISNULL(@RegistryTable, '')) <> LOWER('HR_BangThueTNCNTbl')
       OR LOWER(ISNULL(@RegistryPrimaryKey, '')) <> LOWER('Bac')
        THROW 52106, N'Registry TableName/PrimaryKey của pilot không đúng contract đã audit.', 1;

    IF OBJECT_ID(N'dbo.HR_BangThueTNCNTbl', N'U') IS NULL
        THROW 52107, N'Không tìm thấy bảng nghiệp vụ của pilot.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND (
                LOWER(C.name) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                  'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
             OR LOWER(T.name) IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                  'sql_variant', 'geography', 'geometry', 'hierarchyid')
          )
    )
        THROW 52108, N'Pilot có cột kỹ thuật/blob thuộc deny-list; MAIN_TABLE_STAR bị chặn.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
        THROW 52109, N'Pilot không còn là danh mục toàn cục; cần bổ sung isolation trước khi chạy.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND (
                LOWER(name) LIKE '%password%'
             OR LOWER(name) LIKE '%token%'
             OR LOWER(name) LIKE '%secret%'
             OR LOWER(name) LIKE '%bank%'
             OR LOWER(name) LIKE '%cccd%'
             OR LOWER(name) LIKE '%cmnd%'
             OR LOWER(name) LIKE '%bhxh%'
             OR LOWER(name) LIKE '%salary%'
             OR LOWER(name) LIKE '%luong%'
             OR LOWER(name) LIKE '%email%'
             OR LOWER(name) LIKE '%phone%'
             OR LOWER(name) LIKE '%dienthoai%'
             OR LOWER(name) LIKE '%diachi%'
          )
    )
        THROW 52110, N'Pilot xuất hiện cột dữ liệu nhạy cảm ngoài contract danh mục; cần audit lại.', 1;

    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND LOWER(name) = 'isdeleted'
    )
        THROW 52113, N'Pilot có soft-delete nhưng View V2 chưa có policy lọc IsDeleted xác minh.', 1;

    IF (SELECT COUNT(*) FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND LOWER(name) IN ('bac', 'tu', 'den', 'thuesuat')) <> 4
        THROW 52111, N'Pilot thiếu một trong các cột contract Bac/Tu/Den/ThueSuat.', 1;

    IF @Data <> N'' AND (ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{')
        THROW 52112, N'JsonData bộ lọc không hợp lệ.', 1;

    /* PHASE2_NEW_FIELDS_DISPLAY_ONLY: filter/sort chỉ mở cho contract legacy; field V2 mới là display-only. */
    IF ISJSON(@Data) = 1 AND EXISTS (
        SELECT LOWER(J.[key])
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key])
        HAVING COUNT(*) > 1
    )
        THROW 52117, N'JsonData có khóa lặp; từ chối contract không xác định.', 1;

    DECLARE @DataBranchID nvarchar(max) = NULL;
    IF ISJSON(@Data) = 1
        SELECT TOP (1) @DataBranchID = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) = 'branchid';

    IF @DataBranchID IS NOT NULL
    BEGIN
        IF LOWER(@UserGroupID) <> 'admin' AND @BranchID = ''
            THROW 52119, N'Thiếu ngữ cảnh chi nhánh trong request View.', 1;
        IF @BranchID <> '' AND EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@DataBranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
                  WHERE UPPER(LTRIM(RTRIM(ContextBranch.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
              )
        )
            THROW 52120, N'BranchID trong JsonData vượt ngữ cảnh request.', 1;
    END;

    DECLARE @FilterBac nvarchar(200), @FilterTu nvarchar(200), @FilterDen nvarchar(200), @FilterThueSuat nvarchar(200);
    IF ISJSON(@Data) = 1
    BEGIN
        SELECT TOP (1) @FilterBac = CONVERT(nvarchar(200), J.[value]) FROM OPENJSON(@Data) AS J WHERE LOWER(J.[key]) = 'bac';
        SELECT TOP (1) @FilterTu = CONVERT(nvarchar(200), J.[value]) FROM OPENJSON(@Data) AS J WHERE LOWER(J.[key]) = 'tu';
        SELECT TOP (1) @FilterDen = CONVERT(nvarchar(200), J.[value]) FROM OPENJSON(@Data) AS J WHERE LOWER(J.[key]) = 'den';
        SELECT TOP (1) @FilterThueSuat = CONVERT(nvarchar(200), J.[value]) FROM OPENJSON(@Data) AS J WHERE LOWER(J.[key]) = 'thuesuat';
    END;

    IF ISJSON(@Data) = 1 AND EXISTS (
        SELECT 1 FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) NOT IN ('bac', 'tu', 'den', 'thuesuat', 'keyword', 'branchid')
    )
        THROW 52114, N'Bộ lọc pilot chưa có allow-list; không bỏ qua field mới âm thầm.', 1;

    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'ASC';
    IF @SortColumn <> '' AND LOWER(@SortColumn) NOT IN ('bac', 'tu', 'den', 'thuesuat')
        THROW 52121, N'Cột sắp xếp chưa nằm trong contract pilot; field V2 mới hiện chỉ được hiển thị.', 1;

    /* MAIN_TABLE_STAR_APPROVED: bảng pilot đã được chặn blob/sensitive/scope ở phía server. */
    SELECT T.*
    FROM dbo.HR_BangThueTNCNTbl AS T
    WHERE (@Keyword = N'' OR CONVERT(nvarchar(200), T.Bac) LIKE N'%' + @Keyword + N'%'
                       OR CONVERT(nvarchar(200), T.Tu) LIKE N'%' + @Keyword + N'%'
                       OR CONVERT(nvarchar(200), T.Den) LIKE N'%' + @Keyword + N'%'
                       OR CONVERT(nvarchar(200), T.ThueSuat) LIKE N'%' + @Keyword + N'%')
      AND (@FilterBac IS NULL OR CONVERT(nvarchar(200), T.Bac) LIKE N'%' + @FilterBac + N'%')
      AND (@FilterTu IS NULL OR CONVERT(nvarchar(200), T.Tu) LIKE N'%' + @FilterTu + N'%')
      AND (@FilterDen IS NULL OR CONVERT(nvarchar(200), T.Den) LIKE N'%' + @FilterDen + N'%')
      AND (@FilterThueSuat IS NULL OR CONVERT(nvarchar(200), T.ThueSuat) LIKE N'%' + @FilterThueSuat + N'%')
    ORDER BY
        CASE WHEN LOWER(@SortColumn) = 'bac' AND @SortDir = 'ASC' THEN T.Bac END ASC,
        CASE WHEN LOWER(@SortColumn) = 'bac' AND @SortDir = 'DESC' THEN T.Bac END DESC,
        CASE WHEN LOWER(@SortColumn) = 'tu' AND @SortDir = 'ASC' THEN T.Tu END ASC,
        CASE WHEN LOWER(@SortColumn) = 'tu' AND @SortDir = 'DESC' THEN T.Tu END DESC,
        CASE WHEN LOWER(@SortColumn) = 'den' AND @SortDir = 'ASC' THEN T.Den END ASC,
        CASE WHEN LOWER(@SortColumn) = 'den' AND @SortDir = 'DESC' THEN T.Den END DESC,
        CASE WHEN LOWER(@SortColumn) = 'thuesuat' AND @SortDir = 'ASC' THEN T.ThueSuat END ASC,
        CASE WHEN LOWER(@SortColumn) = 'thuesuat' AND @SortDir = 'DESC' THEN T.ThueSuat END DESC,
        CASE WHEN @SortColumn = '' THEN T.Bac END DESC,
        T.Bac DESC;
END;
GO
