/*
  Hồ sơ nhân viên tổng hợp.

  - Danh sách chính đọc trực tiếp từ HR_PersonView giống cấu hình ERP desktop.
  - Các tab chi tiết chỉ đăng ký bảng vật lý; việc đọc dùng chung
    API_TruyVanDong_V2 và được cutover bằng script trong sql/Deploy.
  - File này không đăng ký route vào WA_API.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
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

    /*
      Giữ đúng read model của ERP desktop:
          SELECT TOP (1000) HR_PersonView.*
          FROM HR_PersonView
    */
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

/*
  Đăng ký bảng vật lý cho các tab chi tiết.
  Không xóa rồi chèn lại để tránh làm mất cấu hình ngoài phạm vi module.
*/
DECLARE @DetailForms table
(
    FormID varchar(100) NOT NULL PRIMARY KEY,
    FormType varchar(50) NOT NULL,
    CaptionVN nvarchar(200) NOT NULL,
    CaptionEN nvarchar(200) NOT NULL,
    TableName sysname NOT NULL,
    PrimaryKey sysname NOT NULL
);

INSERT INTO @DetailForms
    (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES
    ('API_PersonFull_T1_Salary',    'LIST', N'Quá trình lương',       N'Salary',       N'HR_PersonSalaryTbl',    N'UserAutoID'),
    ('API_PersonFull_T2_Allowance', 'LIST', N'Phụ cấp',               N'Allowance',    N'HR_PersonAllowanceTbl', N'UserAutoID'),
    ('API_PersonFull_T3_KTKL',      'LIST', N'Khen thưởng - Kỷ luật', N'Reward',       N'HR_PersonKTKLTbl',      N'UserAutoID'),
    ('API_PersonFull_T4_NghiPhep',  'LIST', N'Nghỉ phép',             N'Leave',        N'HR_PersonNghiPhepTbl',  N'UserAutoID'),
    ('API_PersonFull_T5_Relation',  'LIST', N'Gia cảnh',              N'Relation',     N'HR_PersonRelationTbl',  N'UserAutoID'),
    ('API_PersonFull_T6_HopDong',   'LIST', N'Hợp đồng',              N'Contract',     N'HR_HopDongTbl',         N'MaHopDong'),
    ('API_PersonFull_T7_CongTac',   'LIST', N'Công tác',              N'Work history', N'HR_LichSuCongTacTbl',   N'UserAutoID'),
    ('API_PersonFull_T8_Log',       'LIST', N'Lịch sử công việc',     N'Work log',     N'HR_PersonLogTbl',       N'UserAutoID'),
    ('API_PersonFull_T9_GiayTo',    'LIST', N'Giấy tờ',               N'Document',     N'HR_PersonGiayToTbl',    N'DocumentID');

UPDATE RegisteredForm
SET
    RegisteredForm.FormType = SourceForm.FormType,
    RegisteredForm.CaptionVN = SourceForm.CaptionVN,
    RegisteredForm.CaptionEN = SourceForm.CaptionEN,
    RegisteredForm.TableName = SourceForm.TableName,
    RegisteredForm.PrimaryKey = SourceForm.PrimaryKey
FROM dbo.SY_FrmLstTbl AS RegisteredForm
INNER JOIN @DetailForms AS SourceForm
    ON SourceForm.FormID = RegisteredForm.FormID;

INSERT INTO dbo.SY_FrmLstTbl
    (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
SELECT
    SourceForm.FormID,
    SourceForm.FormType,
    SourceForm.CaptionVN,
    SourceForm.CaptionEN,
    SourceForm.TableName,
    SourceForm.PrimaryKey
FROM @DetailForms AS SourceForm
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.SY_FrmLstTbl AS RegisteredForm
    WHERE RegisteredForm.FormID = SourceForm.FormID
);
GO

CREATE OR ALTER PROCEDURE dbo.API_PersonAttach_SaveAvatar
    @List varchar(50),
    @Data nvarchar(max),
    @UserName varchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @PersonID varchar(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID varchar(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType int = TRY_CONVERT(int, JSON_VALUE(@Data, '$.FileType'));
        DECLARE @TargetID varchar(50) = COALESCE(NULLIF(@PersonID, ''), NULLIF(@CandidateID, ''));

        IF @TargetID IS NULL
        BEGIN
            SELECT -1 AS code, N'Không tìm thấy mã nhân viên hoặc ứng viên.' AS msg;
            RETURN;
        END;

        /* Ảnh đại diện chỉ có một bản ghi cho mỗi nhân viên/ứng viên. */
        IF @FileType = 1
        BEGIN
            DECLARE @ExistingID varchar(50);

            SELECT TOP (1)
                @ExistingID = Attachment.UserAutoID
            FROM dbo.HR_PersonAttachTbl AS Attachment
            WHERE Attachment.PersonID = @TargetID
              AND Attachment.FileType = 1
            ORDER BY Attachment.UserAutoID DESC;

            IF @ExistingID IS NOT NULL
            BEGIN
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END;
        END;

        /*
          File đính kèm chứa dữ liệu nhị phân nên tiếp tục đi qua API chuyên biệt.
          Không chuyển payload này sang generic mutation V2.
        */
        EXEC dbo.API_LuuDong
            @List = @List,
            @Data = @Data,
            @UserName = @UserName;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH;
END;
GO
