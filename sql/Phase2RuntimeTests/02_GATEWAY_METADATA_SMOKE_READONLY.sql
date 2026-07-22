/*
  Gateway smoke test cho metadata V2.

  READ ONLY: chỉ gọi API_Gateway_Router với Func=View; không sửa WA_API hay
  bảng nghiệp vụ. Thay @UserName bằng tài khoản đang hoạt động trước khi chạy.

  Kỳ vọng:
  - 4 dòng metadata của API_Web_GridFieldSchemaV2: gateway đã chạy được.
  - code = -1, error_number = 201: Para còn {WebFormName}/thiếu tham số.
  - code = -1, error_number = 229: SQL API principal thiếu EXECUTE trực tiếp
    trên procedure đích (dynamic EXEC không dùng ownership chain).
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @UserName varchar(100) = 'REPLACE_WITH_ACTIVE_TEST_USER';
IF @UserName = 'REPLACE_WITH_ACTIVE_TEST_USER' OR LTRIM(RTRIM(@UserName)) = ''
    THROW 52801, N'Phải nhập @UserName của tài khoản test đang hoạt động.', 1;

SELECT
    DB_NAME() AS DatabaseName,
    SUSER_SNAME() AS SqlLogin,
    HAS_PERMS_BY_NAME(N'dbo.API_Gateway_Router', N'OBJECT', N'EXECUTE') AS CanExecuteGateway,
    HAS_PERMS_BY_NAME(N'dbo.API_Web_GridFieldSchemaV2', N'OBJECT', N'EXECUTE') AS CanExecuteGridSchemaV2;

SELECT
    [list],
    [func],
    [SQL],
    [Para],
    COUNT(*) OVER (PARTITION BY [list], [func]) AS RegistrationCount
FROM dbo.WA_API
WHERE [list] = 'API_Web_GridFieldSchemaV2'
  AND [func] = 'View';

EXEC dbo.API_Gateway_Router
    @List = 'API_Web_GridFieldSchemaV2',
    @Func = 'View',
    @UserName = @UserName,
    @Keyword = N'',
    @Page = 1,
    @Limit = 50,
    @JsonData = N'{"FormName":"WA_BangThueTNCNFrm","ERPFormID":"HR_BangThueTNCNFrm","BranchID":""}';
