/*
  ==============================================================================
  SCRIPT KÍCH HOẠT VÀ MỞ KHÓA 100% METADATA V2 CHO TẤT CẢ TRANG TRÊN WEB APP
  ==============================================================================
  Mục đích:
  - Chuyển trạng thái RolloutStatus = 'ACTIVE' và IsEnabled = 1 cho tất cả các Form
    trong bảng WA_FieldContractRegistry (mở khóa hoàn toàn METADATA_BLOCKED).
  - Tự động bổ sung thông tin SY_FrmLstTbl cho toàn bộ các Form có trong WA_Menu.
  - Cập nhật ContractType thành SIMPLE_TABLE, WritePolicy = SAFE_TABLE_COLUMNS,
    DeletePolicy = AUTO_SCHEMA cho tất cả các form nhập liệu (không phải Report)
    để mở khóa các nút Thêm, Sửa, Xóa trên giao diện.
  ==============================================================================
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
SET NOCOUNT ON;
GO
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Now datetime2 = SYSUTCDATETIME();
    DECLARE @Actor varchar(100) = 'ACTIVATE_ALL_METADATA_V2';

    -- 1. Bổ sung thông tin SY_FrmLstTbl cho các Form chưa có (Dùng CTE lọc trùng tuyệt đối)
    ;WITH UniqueMenuForms AS (
        SELECT 
            LTRIM(RTRIM(M.FormName)) AS FormName,
            ISNULL(M.VN, M.FormName) AS CaptionVN,
            ISNULL(M.EN, M.FormName) AS CaptionEN,
            ROW_NUMBER() OVER (PARTITION BY LOWER(LTRIM(RTRIM(M.FormName))) ORDER BY ISNULL(M.MenuID, 9999)) AS Rn
        FROM dbo.WA_Menu AS M
        WHERE LTRIM(RTRIM(ISNULL(M.FormName, ''))) <> ''
          AND ISNULL(M.isDisable, 0) = 0
    )
    INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
    SELECT 
        U.FormName, 
        'EDIT',
        U.CaptionVN, 
        U.CaptionEN,
        CASE 
            WHEN U.FormName LIKE '%HopDong%' THEN 'HR_ContractTbl'
            WHEN U.FormName LIKE '%Person%' OR U.FormName LIKE '%NhanVien%' THEN 'HR_PersonTbl'
            WHEN U.FormName LIKE '%ChamCong%' OR U.FormName LIKE '%Timekeeping%' THEN 'HR_TimekeepingTbl'
            WHEN U.FormName LIKE '%CaLamViec%' OR U.FormName LIKE '%Shift%' THEN 'HR_ShiftTbl'
            WHEN U.FormName LIKE '%NghiPhep%' OR U.FormName LIKE '%Leave%' THEN 'HR_LeaveTbl'
            WHEN U.FormName LIKE '%BaoHiem%' OR U.FormName LIKE '%Insurance%' THEN 'HR_InsuranceTbl'
            WHEN U.FormName LIKE '%Luong%' OR U.FormName LIKE '%Payroll%' THEN 'HR_PayrollTbl'
            WHEN LOWER(U.FormName) = 'wa_nguoidungnhomfrm' THEN 'SY_UserGroup'
            WHEN LOWER(U.FormName) = 'wa_nguoidungfrm' THEN 'SY_User'
            ELSE 'SY_FrmLstTbl'
        END,
        CASE 
            WHEN U.FormName LIKE '%HopDong%' THEN 'ContractID'
            WHEN U.FormName LIKE '%Person%' OR U.FormName LIKE '%NhanVien%' THEN 'PersonID'
            WHEN U.FormName LIKE '%ChamCong%' THEN 'AutoID'
            WHEN U.FormName LIKE '%CaLamViec%' THEN 'ShiftID'
            WHEN LOWER(U.FormName) = 'wa_nguoidungnhomfrm' THEN 'UserGroupID'
            WHEN LOWER(U.FormName) = 'wa_nguoidungfrm' THEN 'UserName'
            ELSE 'AutoID'
        END
    FROM UniqueMenuForms AS U
    WHERE U.Rn = 1
      AND NOT EXISTS (
          SELECT 1 FROM dbo.SY_FrmLstTbl AS L 
          WHERE LOWER(LTRIM(RTRIM(L.FormID))) = LOWER(U.FormName)
      );

    -- 2. Tự động đăng ký bổ sung vào WA_FieldContractRegistry cho các Form còn thiếu
    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NOT NULL
    BEGIN
        ;WITH UniqueRegistryForms AS (
            SELECT 
                LTRIM(RTRIM(M.FormName)) AS FormName,
                ROW_NUMBER() OVER (PARTITION BY LOWER(LTRIM(RTRIM(M.FormName))) ORDER BY ISNULL(M.MenuID, 9999)) AS Rn
            FROM dbo.WA_Menu AS M
            WHERE LTRIM(RTRIM(ISNULL(M.FormName, ''))) <> ''
              AND ISNULL(M.isDisable, 0) = 0
        )
        INSERT INTO dbo.WA_FieldContractRegistry (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        SELECT 
            U.FormName, U.FormName, U.FormName,
            CASE WHEN U.FormName LIKE '%Report%' THEN 'READ_ONLY' ELSE 'SIMPLE_TABLE' END, 
            COALESCE(L.TableName, 'SY_FrmLstTbl'), 
            COALESCE(L.PrimaryKey, 'AutoID'),
            U.FormName, 
            ISNULL(A_View.[SQL], U.FormName),
            CASE WHEN U.FormName LIKE '%Report%' THEN NULL ELSE ISNULL(A_Save.[SQL], 'API_LuuDong_V2') END,
            CASE WHEN U.FormName LIKE '%Report%' THEN NULL ELSE ISNULL(A_Del.[SQL], 'API_XoaDong_V2') END,
            CASE WHEN U.FormName LIKE '%Report%' THEN 'READ_ONLY' ELSE 'SAFE_TABLE_COLUMNS' END,
            'BRANCH_SCOPED',
            CASE WHEN U.FormName LIKE '%Report%' THEN 'NONE' ELSE 'AUTO_SCHEMA' END,
            'ACTIVE', N'Mở khóa hoàn toàn Metadata V2',
            2, 1, @Now, @Actor, @Now, @Actor
        FROM UniqueRegistryForms AS U
        LEFT JOIN dbo.SY_FrmLstTbl AS L ON LOWER(LTRIM(RTRIM(L.FormID))) = LOWER(U.FormName)
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(U.FormName) AND LOWER(func) = 'view'
        ) AS A_View
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(U.FormName) AND LOWER(func) = 'save'
        ) AS A_Save
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(U.FormName) AND LOWER(func) = 'delete'
        ) AS A_Del
        WHERE U.Rn = 1
          AND NOT EXISTS (
              SELECT 1 FROM dbo.WA_FieldContractRegistry AS R 
              WHERE LOWER(LTRIM(RTRIM(R.WebFormName))) = LOWER(U.FormName)
          );

        -- 3. MỞ KHÓA VÀ CẬP NHẬT TẤT CẢ CÁC FORM TRONG REGISTRY
        -- Đổi READ_ONLY -> SIMPLE_TABLE cho các form nhập liệu để mở nút Sửa / Xóa
        UPDATE R
        SET R.ContractType = CASE WHEN R.WebFormName LIKE '%Report%' THEN 'READ_ONLY' ELSE 'SIMPLE_TABLE' END,
            R.WritePolicy = CASE WHEN R.WebFormName LIKE '%Report%' THEN 'READ_ONLY' ELSE 'SAFE_TABLE_COLUMNS' END,
            R.DeletePolicy = CASE WHEN R.WebFormName LIKE '%Report%' THEN 'NONE' ELSE 'AUTO_SCHEMA' END,
            R.ViewProcedure = ISNULL(A_View.[SQL], R.ViewProcedure),
            R.SaveProcedure = CASE WHEN R.WebFormName LIKE '%Report%' THEN NULL ELSE ISNULL(A_Save.[SQL], 'API_LuuDong_V2') END,
            R.DeleteProcedure = CASE WHEN R.WebFormName LIKE '%Report%' THEN NULL ELSE ISNULL(A_Del.[SQL], 'API_XoaDong_V2') END,
            R.RolloutStatus = 'ACTIVE',
            R.IsEnabled = 1,
            R.UpdatedAt = @Now,
            R.UpdatedBy = @Actor
        FROM dbo.WA_FieldContractRegistry AS R
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(R.WebFormName) AND LOWER(func) = 'view'
        ) AS A_View
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(R.WebFormName) AND LOWER(func) = 'save'
        ) AS A_Save
        OUTER APPLY (
            SELECT TOP 1 [SQL] FROM dbo.WA_API WHERE LOWER(list) = LOWER(R.WebFormName) AND LOWER(func) = 'delete'
        ) AS A_Del;
    END;

    COMMIT TRANSACTION;
    PRINT N'✅ ĐÃ MỞ KHÓA VÀ KÍCH HOẠT 100% METADATA V2 & ENABLE CÁC NÚT THÊM / SỬA / XÓA THÀNH CÔNG!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
