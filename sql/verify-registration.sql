SET NOCOUNT ON;

DECLARE @ExpectedForms TABLE (
    ModuleName VARCHAR(50) NOT NULL,
    FormName VARCHAR(50) NOT NULL PRIMARY KEY,
    TableName VARCHAR(128) NOT NULL,
    PrimaryKey VARCHAR(50) NOT NULL,
    ViewProcedure VARCHAR(128) NOT NULL,
    ExpectedOperationCount INT NOT NULL
);

INSERT INTO @ExpectedForms
    (ModuleName, FormName, TableName, PrimaryKey, ViewProcedure, ExpectedOperationCount)
VALUES
    ('UnionFee', 'WA_KinhPhiCongDoanFrm', 'HR_KinhPhiCongDoanTbl', 'UserAutoID', 'API_KinhPhiCongDoan', 4),
    ('Insurance', 'WA_BaoHiemFrm', 'HR_BaoHiemTbl', 'DocumentID', 'API_BaoHiem', 4),
    ('Insurance', 'API_BaoHiem_Detail', 'HR_BaoHiemChiTietTbl', 'UserAutoID', 'API_BaoHiem_Detail', 3),
    ('Payroll', 'WA_PayrollFrm', 'HR_PayrollTbl', 'DocumentID', 'API_Payroll', 4),
    ('Payroll', 'API_Payroll_Detail', 'HR_PayrollDetailTbl', 'UserAutoID', 'API_Payroll_Detail', 3),
    ('Shift', 'WA_CaLamViecFrm', 'HR_SapCaTbl', 'SapCaID', 'API_CaLamViec', 4),
    ('Shift', 'API_CaLamViec_NhanVien', 'HR_SapCaNhanVienTbl', 'UserAutoID', 'API_CaLamViec_NhanVien', 3),
    ('Contract', 'WA_HopDongLaoDongFrm', 'HR_HopDongTbl', 'MaHopDong', 'API_HopDongLaoDong', 3),
    ('Contract', 'API_HopDongLaoDong_ChiTiet', 'HR_HopDongDetailTbl', 'UserAutoID', 'API_HopDongLaoDong_ChiTiet', 3),
    ('Contract', 'API_HopDongLaoDong_Attach', 'HR_HopDongAttachTbl', 'UserAutoID', 'API_HopDongLaoDong_Attach', 3),
    ('Employee', 'WA_PersonFullFrm', 'HR_PersonTbl', 'PersonID', 'API_HoSoNhanVien', 3),
    ('Employee', 'API_PersonAttach', 'HR_PersonAttachTbl', 'UserAutoID', 'API_PersonAttach', 4);

SELECT
    expected.ModuleName,
    expected.FormName,
    expected.TableName,
    expected.PrimaryKey,
    expected.ViewProcedure,
    CASE WHEN form.FormID IS NULL THEN 0 ELSE 1 END AS FormExists,
    CASE
        WHEN form.TableName = expected.TableName
         AND form.PrimaryKey = expected.PrimaryKey THEN 1 ELSE 0
    END AS FormContractMatches,
    CASE WHEN OBJECT_ID('dbo.' + expected.ViewProcedure, 'P') IS NULL THEN 0 ELSE 1 END AS ViewProcedureExists,
    COALESCE(api.ApiCount, 0) AS ApiCount,
    expected.ExpectedOperationCount,
    COALESCE(field.FieldCount, 0) AS FieldCount
FROM @ExpectedForms expected
LEFT JOIN dbo.SY_FrmLstTbl form ON form.FormID = expected.FormName
OUTER APPLY (
    SELECT COUNT(*) AS ApiCount
    FROM dbo.WA_API route
    WHERE route.list = expected.FormName
) api
OUTER APPLY (
    SELECT COUNT(*) AS FieldCount
    FROM dbo.SY_FormatFields metadata
    WHERE metadata.FormName = expected.FormName
) field
ORDER BY expected.ModuleName, expected.FormName;

SELECT list, func, COUNT(*) AS DuplicateCount
FROM dbo.WA_API
GROUP BY list, func
HAVING COUNT(*) > 1;

SELECT FormName, FieldName, COUNT(*) AS DuplicateCount
FROM dbo.SY_FormatFields
GROUP BY FormName, FieldName
HAVING COUNT(*) > 1;
GO
