:setvar Root "."

SET NOCOUNT ON;

:r $(Root)\sql\Modules\Core\insert_SharedFieldDictionary.sql
:r $(Root)\sql\Insert\Insert_WA_KinhPhiCongDoanFrm.sql
:r $(Root)\sql\Modules\Insurance\register_Insurance.sql
:r $(Root)\sql\Modules\Payroll\register_Payroll.sql
:r $(Root)\sql\Modules\Shift\register_Shift.sql
:r $(Root)\sql\Modules\Contract\register_Contract.sql
:r $(Root)\sql\Modules\Employee\register_Employee.sql
:r $(Root)\sql\Modules\ReferenceData\register_ReferenceData.sql

SELECT 'RUN_1' AS RunName, COUNT(*) AS FormCount INTO #FormCounts FROM dbo.SY_FrmLstTbl;
SELECT 'RUN_1' AS RunName, COUNT(*) AS ApiCount INTO #ApiCounts FROM dbo.WA_API;
SELECT 'RUN_1' AS RunName, COUNT(*) AS FieldCount INTO #FieldCounts FROM dbo.SY_FormatFields;

:r $(Root)\sql\Modules\Core\insert_SharedFieldDictionary.sql
:r $(Root)\sql\Insert\Insert_WA_KinhPhiCongDoanFrm.sql
:r $(Root)\sql\Modules\Insurance\register_Insurance.sql
:r $(Root)\sql\Modules\Payroll\register_Payroll.sql
:r $(Root)\sql\Modules\Shift\register_Shift.sql
:r $(Root)\sql\Modules\Contract\register_Contract.sql
:r $(Root)\sql\Modules\Employee\register_Employee.sql
:r $(Root)\sql\Modules\ReferenceData\register_ReferenceData.sql

INSERT INTO #FormCounts SELECT 'RUN_2', COUNT(*) FROM dbo.SY_FrmLstTbl;
INSERT INTO #ApiCounts SELECT 'RUN_2', COUNT(*) FROM dbo.WA_API;
INSERT INTO #FieldCounts SELECT 'RUN_2', COUNT(*) FROM dbo.SY_FormatFields;

SELECT * FROM #FormCounts;
SELECT * FROM #ApiCounts;
SELECT * FROM #FieldCounts;

IF (SELECT FormCount FROM #FormCounts WHERE RunName = 'RUN_1')
 <> (SELECT FormCount FROM #FormCounts WHERE RunName = 'RUN_2')
    THROW 51900, 'Form registration is not idempotent.', 1;

IF (SELECT ApiCount FROM #ApiCounts WHERE RunName = 'RUN_1')
 <> (SELECT ApiCount FROM #ApiCounts WHERE RunName = 'RUN_2')
    THROW 51901, 'API registration is not idempotent.', 1;

IF (SELECT FieldCount FROM #FieldCounts WHERE RunName = 'RUN_1')
 <> (SELECT FieldCount FROM #FieldCounts WHERE RunName = 'RUN_2')
    THROW 51902, 'Field registration is not idempotent.', 1;

SELECT 0 AS code, N'All registration and seed counts are stable after the second run.' AS msg;
GO
