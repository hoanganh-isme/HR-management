SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.API_DangKyFormWeb', 'P') IS NULL
        THROW 51300, 'API_DangKyFormWeb is not installed.', 1;

    DECLARE @FormName VARCHAR(50) = 'WA_KinhPhiCongDoanFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_KinhPhiCongDoanTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'UserAutoID';
    DECLARE @CaptionVN NVARCHAR(255) = N'Kinh phí công đoàn';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_KinhPhiCongDoan';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {
        "field":"UserAutoID", "captionVN":"Mã hệ thống", "captionEN":"System ID",
        "position":"6", "orderNo":99, "showInAdd":false, "showInEdit":false
      },
      {
        "field":"PersonID", "captionVN":"Mã nhân viên", "captionEN":"Employee ID",
        "formatId":"sl", "dataSource":"API_Calculate_MucDong_CongDoan",
        "position":"grid", "orderNo":1, "required":true,
        "showInAdd":true, "showInEdit":false, "showInFilter":false
      },
      {
        "field":"PersonName", "captionVN":"Họ tên", "captionEN":"Full Name",
        "position":"grid", "orderNo":2, "showInFilter":false
      },
      {
        "field":"ChucDanhChuyenMon", "captionVN":"Chức danh chuyên môn",
        "captionEN":"Professional Title", "position":"grid", "orderNo":3
      },
      {
        "field":"MucDong", "captionVN":"Mức đóng", "captionEN":"Insurance Base Salary",
        "formatId":"n", "position":"grid", "orderNo":4
      },
      {
        "field":"KinhPhiNopCongDoanVN", "captionVN":"Kinh phí nộp công đoàn VN",
        "captionEN":"Union Fee Total (2%)", "formatId":"n", "position":"grid",
        "orderNo":5, "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"CongDoanVN", "captionVN":"Công đoàn VN",
        "captionEN":"Union VN Retained (25%)", "formatId":"n", "position":"grid",
        "orderNo":6, "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"CongDoanCTY", "captionVN":"Công đoàn công ty",
        "captionEN":"Union Company Retained (75%)", "formatId":"n", "position":"grid",
        "orderNo":7, "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"BranchID", "captionVN":"Chi nhánh", "captionEN":"Branch ID",
        "formatId":"sl", "dataSource":"CF_BranchListFrm", "position":"grid",
        "orderNo":8, "showInFilter":true
      },
      {
        "field":"PeriodID", "captionVN":"Kỳ", "captionEN":"Period",
        "formatId":"sl", "dataSource":"SY_Period", "position":"grid",
        "orderNo":9, "showInFilter":true
      },
      {
        "field":"LoaiHD", "captionVN":"Đội ngũ", "captionEN":"Workforce",
        "position":"grid", "orderNo":10, "showInFilter":false
      }
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[
      {
        "func":"Calculate",
        "sql":"API_Calculate_MucDong_CongDoan",
        "para":"@Keyword=N''''{Keyword}''''"
      }
    ]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'Trade Union Fees',
        @FormType = 'EDIT',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'',@PeriodID=N''{PeriodID}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 1;

    IF EXISTS (
        SELECT 1
        FROM dbo.WA_API
        WHERE list = 'API_Calculate_MucDong_CongDoan'
          AND func = 'View'
        GROUP BY list, func
        HAVING COUNT(*) > 1
    )
        THROW 51301, 'Duplicate union-fee datasource route detected.', 1;

    UPDATE dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
       SET [SQL] = 'API_Calculate_MucDong_CongDoan',
           Para = N'@Keyword=N''{Keyword}'''
    WHERE list = 'API_Calculate_MucDong_CongDoan'
      AND func = 'View';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.WA_API (list, func, [SQL], Para)
        VALUES (
            'API_Calculate_MucDong_CongDoan',
            'View',
            'API_Calculate_MucDong_CongDoan',
            N'@Keyword=N''{Keyword}'''
        );
    END

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.SY_FrmLstTbl
        WHERE FormID = @FormName
          AND TableName = @TableName
          AND PrimaryKey = @PrimaryKey
    )
        THROW 51302, 'Union-fee form verification failed.', 1;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 4
        THROW 51303, 'Union-fee operation verification failed.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = @FormName)
        THROW 51304, 'Union-fee field metadata verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Union-fee registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
