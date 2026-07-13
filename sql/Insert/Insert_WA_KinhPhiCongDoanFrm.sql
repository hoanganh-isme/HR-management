-- Prerequisite (run once per database): sql/API/API_DangKyFormWeb.sql
-- Business procedures: sql/API/APINEW/API_KinhPhiCongDoan.sql

IF OBJECT_ID('dbo.API_DangKyFormWeb', 'P') IS NULL
    THROW 50001, 'Chua cai dat API_DangKyFormWeb.', 1;
GO

-- One declaration replaces the form/API inserts, field synchronization and CASE updates.
EXEC dbo.API_DangKyFormWeb
    @FormName = 'WA_KinhPhiCongDoanFrm',
    @TableName = 'HR_KinhPhiCongDoanTbl',
    @PrimaryKey = 'UserAutoID',
    @CaptionVN = N'Kinh phí công đoàn',
    @CaptionEN = N'Trade Union Fees',
    @FormType = 'EDIT',
    @ViewProcedure = 'API_KinhPhiCongDoan',
    @ViewParameters = N'@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'',@PeriodID=N''{PeriodID}''',
    @Overrides = N'[
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
        "field":"PersonName", "captionVN":"Họ Tên", "captionEN":"Full Name",
        "position":"grid", "orderNo":2, "showInFilter":false
      },
      {
        "field":"ChucDanhChuyenMon", "captionVN":"Chức danh chuyên môn", "captionEN":"Professional Title",
        "position":"grid", "orderNo":3
      },
      {
        "field":"MucDong", "captionVN":"Mức đóng", "captionEN":"Insurance Base Salary",
        "formatId":"n", "position":"grid", "orderNo":4
      },
      {
        "field":"KinhPhiNopCongDoanVN", "captionVN":"Kinh phí nộp công đoàn VN", "captionEN":"Union Fee Total (2%)",
        "formatId":"n", "position":"grid", "orderNo":5,
        "validateRule":"formula:{MucDong}*0.02", "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"CongDoanVN", "captionVN":"Công đoàn VN", "captionEN":"Union VN Retained (25%)",
        "formatId":"n", "position":"grid", "orderNo":6,
        "validateRule":"formula:{KinhPhiNopCongDoanVN}*0.25", "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"CongDoanCTY", "captionVN":"Công đoàn CTY", "captionEN":"Union Company Retained (75%)",
        "formatId":"n", "position":"grid", "orderNo":7,
        "validateRule":"formula:{KinhPhiNopCongDoanVN}*0.75", "readOnlyAdd":true, "readOnlyEdit":true
      },
      {
        "field":"BranchID", "captionVN":"Chi nhánh", "captionEN":"Branch ID",
        "formatId":"sl", "dataSource":"CF_BranchListFrm",
        "position":"grid", "orderNo":8, "showInFilter":true
      },
      {
        "field":"PeriodID", "captionVN":"Kỳ", "captionEN":"Period",
        "formatId":"sl", "dataSource":"SY_Period",
        "position":"grid", "orderNo":9, "showInFilter":true
      },
      {
        "field":"LoaiHD", "captionVN":"Đội ngũ", "captionEN":"Workforce",
        "position":"grid", "orderNo":10, "showInFilter":false
      }
    ]';
GO

-- This datasource is business-specific, so it remains an explicit exception.
MERGE dbo.WA_API AS target
USING (
    SELECT
        'API_Calculate_MucDong_CongDoan' AS list,
        'View' AS func,
        'API_Calculate_MucDong_CongDoan' AS [SQL],
        '@Keyword=N''{Keyword}''' AS Para
) AS source
ON target.list = source.list AND target.func = source.func
WHEN MATCHED THEN UPDATE SET [SQL] = source.[SQL], Para = source.Para
WHEN NOT MATCHED THEN INSERT (list, func, [SQL], Para)
VALUES (source.list, source.func, source.[SQL], source.Para);
GO

PRINT 'Da thiet lap cau hinh WEB rut gon cho WA_KinhPhiCongDoanFrm.';
GO
