/*
  Chuyển API_HoSoNhanVien sang read model HR_PersonView của ERP desktop.
  Script này chỉ cập nhật stored procedure, không thay đổi route hoặc metadata.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.HR_PersonView', N'V') IS NULL
    THROW 51470, N'API_HOSONHANVIEN_HR_PERSONVIEW_NOT_FOUND', 1;

IF OBJECT_ID(N'dbo.HR_PersonStatusTbl', N'U') IS NULL
    THROW 51471, N'API_HOSONHANVIEN_PERSON_STATUS_TABLE_NOT_FOUND', 1;

IF OBJECT_ID(N'dbo.SY_User', N'U') IS NULL
    THROW 51474, N'API_HOSONHANVIEN_ACTOR_TABLE_NOT_FOUND', 1;
GO

CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVien
(
    @Keyword          nvarchar(200) = N'',
    @BranchID         nvarchar(max) = N'',
    @PhongBan         nvarchar(50)  = N'',
    @NamLap           nvarchar(50)  = N'',
    @LoaiHD           nvarchar(50)  = N'',
    @PersonStatusName nvarchar(100) = N'',
    @PersonStatus     nvarchar(50)  = N'',
    @UserName         varchar(100)  = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, N'')));
    SET @PhongBan = LTRIM(RTRIM(ISNULL(@PhongBan, N'')));
    SET @NamLap = LTRIM(RTRIM(ISNULL(@NamLap, N'')));
    SET @LoaiHD = LTRIM(RTRIM(ISNULL(@LoaiHD, N'')));
    SET @PersonStatusName = LTRIM(RTRIM(ISNULL(@PersonStatusName, N'')));
    SET @PersonStatus = LTRIM(RTRIM(ISNULL(@PersonStatus, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));

    IF @UserName = ''
        THROW 51470, N'PERSON_VIEW_ACTOR_REQUIRED', 1;

    DECLARE
        @UserGroupID varchar(50),
        @AllowedBranches nvarchar(max);

    SELECT
        @UserGroupID = [User].UserGroupID,
        @AllowedBranches = LTRIM(RTRIM(ISNULL([User].BranchID, N'')))
    FROM dbo.SY_User AS [User]
    WHERE [User].UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL([User].Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 51471, N'PERSON_VIEW_ACTOR_INVALID_OR_DISABLED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF @AllowedBranches = N''
            THROW 51472, N'PERSON_VIEW_BRANCH_CONTEXT_REQUIRED', 1;

        IF @BranchID = N''
            SET @BranchID = @AllowedBranches;

        IF EXISTS
        (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, N',') AS RequestedBranch
            WHERE LTRIM(RTRIM(RequestedBranch.[value])) <> N''
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM STRING_SPLIT(@AllowedBranches, N',') AS AllowedBranch
                  WHERE LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                      = LTRIM(RTRIM(RequestedBranch.[value])) COLLATE DATABASE_DEFAULT
              )
        )
            THROW 51473, N'PERSON_VIEW_BRANCH_CONTEXT_DENIED', 1;
    END;

    SELECT TOP (1000)
        HR_PersonView.*
    FROM dbo.HR_PersonView
    WHERE
        (
            @Keyword = N''
            OR HR_PersonView.PersonName LIKE N'%' + @Keyword + N'%'
            OR HR_PersonView.PersonID LIKE N'%' + @Keyword + N'%'
            OR HR_PersonView.DienThoai LIKE N'%' + @Keyword + N'%'
        )
        AND
        (
            (LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT = 'admin' COLLATE DATABASE_DEFAULT
             AND @BranchID = N'')
            OR EXISTS
            (
                SELECT 1
                FROM STRING_SPLIT(@BranchID, N',') AS AllowedBranch
                WHERE LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                    = LTRIM(RTRIM(HR_PersonView.BranchID)) COLLATE DATABASE_DEFAULT
            )
        )
        AND (@PhongBan = N'' OR HR_PersonView.PhongBan = @PhongBan)
        AND
        (
            @NamLap = N''
            OR CONVERT(nvarchar(50), HR_PersonView.NamLap) = @NamLap
        )
        AND (@LoaiHD = N'' OR HR_PersonView.LoaiHD LIKE N'%' + @LoaiHD + N'%')
        AND
        (
            @PersonStatusName = N''
            OR EXISTS
            (
                SELECT 1
                FROM dbo.HR_PersonStatusTbl AS PersonStatus
                WHERE PersonStatus.PersonStatus = HR_PersonView.PersonStatus
                  AND PersonStatus.PersonStatusName = @PersonStatusName
            )
        )
        AND
        (
            @PersonStatus = N''
            OR CONVERT(nvarchar(50), HR_PersonView.PersonStatus) = @PersonStatus
        )
    ORDER BY HR_PersonView.PersonID DESC;
END;
GO

EXEC sys.sp_refreshsqlmodule N'dbo.API_HoSoNhanVien';

IF NOT EXISTS
(
    SELECT 1
    FROM sys.sql_expression_dependencies AS Dependency
    WHERE Dependency.referencing_id = OBJECT_ID(N'dbo.API_HoSoNhanVien', N'P')
      AND Dependency.referenced_id = OBJECT_ID(N'dbo.HR_PersonView', N'V')
)
    THROW 51473, N'API_HOSONHANVIEN_HR_PERSONVIEW_DEPENDENCY_MISSING', 1;

SELECT
    ProcedureObject.name AS ProcedureName,
    ViewObject.name AS ReadModel,
    ProcedureObject.modify_date AS ModifiedAt
FROM sys.procedures AS ProcedureObject
CROSS JOIN sys.views AS ViewObject
WHERE ProcedureObject.object_id = OBJECT_ID(N'dbo.API_HoSoNhanVien', N'P')
  AND ViewObject.object_id = OBJECT_ID(N'dbo.HR_PersonView', N'V');
GO
