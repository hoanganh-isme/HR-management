SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_LayDanhSachMenuTatCa
-- Description: Lấy toàn bộ Cây Menu kèm cấu hình Form Builder V2/V3 & Tab Con
--              (TableName, PrimaryKey, ContractType, Custom Procedures, Datasets)
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_LayDanhSachMenuTatCa]
    @NhomNguoiDangThaoTac NVARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        M.MenuID AS [id],
        COALESCE(M.Parent, '') AS [parent],
        COALESCE(M.VN, '') AS [label],
        COALESCE(M.SubTitle, '') AS [subTitle],
        COALESCE(M.EN, '') AS [en],
        COALESCE(M.FormName, '') AS [formName],
        COALESCE(M.FormKey, '') AS [formKey],
        COALESCE(M.URLPara, '') AS [urlPara],
        COALESCE(M.IconClass, '') AS [icon],
        COALESCE(M.isDisable, 0) AS [isDisable],
        COALESCE(F.TableName, C.ExpectedTableName, '') AS [tableName],
        COALESCE(F.PrimaryKey, C.ExpectedPrimaryKey, '') AS [primaryKey],
        COALESCE(
            CASE C.ContractType
                WHEN 'MASTER_DETAIL_SIMPLE' THEN 'MASTER_DETAIL'
                WHEN 'JOIN_VIEW_SINGLE_TABLE' THEN 'JOIN_VIEW'
                ELSE C.ContractType
            END,
            'SIMPLE_TABLE'
        ) AS [contractType],
        COALESCE(C.ViewProcedure, '') AS [customViewProc],
        COALESCE(C.SaveProcedure, '') AS [customSaveProc],
        COALESCE(C.DeleteProcedure, '') AS [customDeleteProc],
        (
            SELECT
                D.DatasetKey AS datasetKey,
                COALESCE(
                    NULLIF(
                        CASE
                            WHEN ISJSON(D.RolloutReason) = 1
                                THEN JSON_VALUE(D.RolloutReason, '$.label')
                            ELSE NULL
                        END,
                        N''
                    ),
                    D.DatasetKey
                ) AS label,
                ROW_NUMBER() OVER (ORDER BY D.CreatedAt, D.DatasetKey) AS sortOrder,
                COALESCE(D.ApiList, '') AS apiList,
                COALESCE(D.ExpectedTableName, '') AS tableName,
                COALESCE(D.ExpectedPrimaryKey, '') AS primaryKey,
                COALESCE(D.ParentField, '') AS parentField,
                COALESCE(D.ChildField, '') AS childField,
                COALESCE(D.ViewProcedure, '') AS viewProcedure,
                CAST(ISNULL(D.IsReadOnly, 0) AS BIT) AS isReadOnly
            FROM dbo.WA_FieldDatasetRegistry D
            WHERE D.WebFormName = M.FormName
            ORDER BY D.CreatedAt, D.DatasetKey
            FOR JSON PATH
        ) AS [datasetsJson]
    FROM dbo.WA_Menu M
    LEFT JOIN dbo.SY_FrmLstTbl F ON M.FormName = F.FormID
    LEFT JOIN dbo.WA_FieldContractRegistry C ON M.FormName = C.WebFormName
    ORDER BY M.MenuID ASC;
END
GO
