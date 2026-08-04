/*
  ==============================================================================
  SCRIPT KÍCH HOẠT VÀ MỞ KHÓA 100% METADATA V2 CHO TẤT CẢ TRANG TRÊN WEB APP
  ==============================================================================
  Mục đích:
  - Chuyển trạng thái RolloutStatus = 'ACTIVE' và IsEnabled = 1 cho tất cả các Form
    trong bảng WA_FieldContractRegistry (mở khóa hoàn toàn METADATA_BLOCKED).
  - Tự động bổ sung thông tin SY_FrmLstTbl cho toàn bộ các Form có trong WA_Menu.
  ==============================================================================
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Now datetime2 = SYSUTCDATETIME();
    DECLARE @Actor varchar(100) = 'ACTIVATE_ALL_METADATA_V2';

    -- 1. Bổ sung thông tin SY_FrmLstTbl cho các Form chưa có
    INSERT INTO dbo.SY_FrmLstTbl (FormID, FormName, TableName, PrimaryKey)
    SELECT 
        M.FormName, 
        ISNULL(M.VN, M.FormName), 
        CASE 
            WHEN M.FormName LIKE '%HopDong%' THEN 'HR_ContractTbl'
            WHEN M.FormName LIKE '%Person%' OR M.FormName LIKE '%NhanVien%' THEN 'HR_PersonTbl'
            WHEN M.FormName LIKE '%ChamCong%' OR M.FormName LIKE '%Timekeeping%' THEN 'HR_TimekeepingTbl'
            WHEN M.FormName LIKE '%CaLamViec%' OR M.FormName LIKE '%Shift%' THEN 'HR_ShiftTbl'
            WHEN M.FormName LIKE '%NghiPhep%' OR M.FormName LIKE '%Leave%' THEN 'HR_LeaveTbl'
            WHEN M.FormName LIKE '%BaoHiem%' OR M.FormName LIKE '%Insurance%' THEN 'HR_InsuranceTbl'
            WHEN M.FormName LIKE '%Luong%' OR M.FormName LIKE '%Payroll%' THEN 'HR_PayrollTbl'
            ELSE 'SY_FrmLstTbl'
        END,
        CASE 
            WHEN M.FormName LIKE '%HopDong%' THEN 'ContractID'
            WHEN M.FormName LIKE '%Person%' OR M.FormName LIKE '%NhanVien%' THEN 'PersonID'
            WHEN M.FormName LIKE '%ChamCong%' THEN 'AutoID'
            WHEN M.FormName LIKE '%CaLamViec%' THEN 'ShiftID'
            ELSE 'AutoID'
        END
    FROM dbo.WA_Menu AS M
    WHERE ISNULL(M.FormName, '') <> ''
      AND ISNULL(M.isDisable, 0) = 0
      AND NOT EXISTS (
          SELECT 1 FROM dbo.SY_FrmLstTbl AS L WHERE LOWER(L.FormID) = LOWER(M.FormName)
      );

    -- 2. Tự động đăng ký bổ sung vào WA_FieldContractRegistry cho các Form còn thiếu
    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
    BEGIN
        INSERT INTO dbo.WA_FieldContractRegistry (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        SELECT DISTINCT
            M.FormName, M.FormName, M.FormName,
            'READ_ONLY', 
            COALESCE(L.TableName, 'SY_FrmLstTbl'), 
            COALESCE(L.PrimaryKey, 'AutoID'),
            M.FormName, 
            ISNULL(A.[SQL], M.FormName),
            NULL, NULL, 'READ_ONLY', 'BRANCH_SCOPED',
            'NONE', 'ACTIVE', N'Mở khóa hoàn toàn Metadata V2',
            2, 1, @Now, @Actor, @Now, @Actor
        FROM dbo.WA_Menu AS M
        LEFT JOIN dbo.SY_FrmLstTbl AS L ON LOWER(L.FormID) = LOWER(M.FormName)
        LEFT JOIN dbo.WA_API AS A ON LOWER(A.list) = LOWER(M.FormName) AND LOWER(A.func) = 'view'
        WHERE ISNULL(M.FormName, '') <> ''
          AND ISNULL(M.isDisable, 0) = 0
          AND NOT EXISTS (
              SELECT 1 FROM dbo.WA_FieldContractRegistry AS R WHERE LOWER(R.WebFormName) = LOWER(M.FormName)
          );

        -- 3. MỞ KHÓA HOÀN TOÀN TẤT CẢ CÁC FORM TRONG REGISTRY (Đưa về ACTIVE và IsEnabled = 1)
        UPDATE dbo.WA_FieldContractRegistry
        SET RolloutStatus = 'ACTIVE',
            IsEnabled = 1,
            UpdatedAt = @Now,
            UpdatedBy = @Actor
        WHERE RolloutStatus <> 'ACTIVE' OR IsEnabled <> 1;
    END;

    COMMIT TRANSACTION;
    PRINT N'✅ ĐÃ MỞ KHÓA VÀ KÍCH HOẠT 100% METADATA V2 CHO TẤT CẢ CÁC TRANG THÀNH CÔNG!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
