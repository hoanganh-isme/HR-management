:setvar Root "."

SET PARSEONLY ON;
GO

:r $(Root)\sql\API\API_LuuTruongGiaoDien.sql
:r $(Root)\sql\API\API_DongBoTruongGiaoDien.sql
:r $(Root)\sql\API\API_DangKyFormWeb.sql
:r $(Root)\sql\API\API_TheoDoiTaiNguyenFormWeb.sql
:r $(Root)\sql\Modules\Core\insert_SharedFieldDictionary.sql
:r $(Root)\sql\Insert\Insert_WA_KinhPhiCongDoanFrm.sql
:r $(Root)\sql\Modules\Insurance\register_Insurance.sql
:r $(Root)\sql\Modules\Payroll\register_Payroll.sql
:r $(Root)\sql\Modules\Shift\register_Shift.sql
:r $(Root)\sql\Modules\Contract\register_Contract.sql
:r $(Root)\sql\Modules\Employee\register_Employee.sql
:r $(Root)\sql\Modules\ReferenceData\register_ReferenceData.sql
:r $(Root)\sql\Modules\Core\verify_CoreRegistration.sql
:r $(Root)\sql\verify-registration.sql
:r $(Root)\sql\rollback-registration-refactor.sql

SET PARSEONLY OFF;
GO
