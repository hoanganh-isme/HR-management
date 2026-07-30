CREATE OR ALTER PROCEDURE [dbo].[API_LayMenuTheoNhomQuyen]
    @NhomNguoiDangThaoTac NVARCHAR(50),
    @UserGroupID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF (@NhomNguoiDangThaoTac <> @UserGroupID)
       AND (UPPER(@NhomNguoiDangThaoTac) <> 'ADMIN')
    BEGIN
        RAISERROR (
            N'Lỗi: Bạn không có thẩm quyền xem cấu trúc phân quyền của nhóm khác!',
            16,
            1
        );
        RETURN;
    END;

    ;WITH VisibleMenus AS
    (
        -- Menu lá mà nhóm hiện tại được phép chạy.
        SELECT
            M.MenuID,
            M.Parent,
            M.VN,
            M.SubTitle,
            M.IconClass,
            M.FormName,
            M.URLPara,
            M.FormKey,
            P.IsRun,
            P.IsAdd,
            P.IsUpdate,
            P.IsDelete,
            P.isManager,
            P.isAdmin,
            P.isAutoLock,
            P.isHideAmount,
            P.isLockDoc,
            P.isUnLockDoc,
            P.isExportExcel
        FROM dbo.WA_Menu AS M
        INNER JOIN dbo.WA_UserGroupPermisstion AS P
            ON P.MenuID = M.MenuID
        WHERE COALESCE(M.isDisable, 0) = 0
          AND P.IsRun = 1
          AND P.UserGroupID = @UserGroupID

        UNION ALL

        -- Thư mục cha cần thiết để dựng cây menu.
        SELECT
            M.MenuID,
            M.Parent,
            M.VN,
            M.SubTitle,
            M.IconClass,
            M.FormName,
            M.URLPara,
            M.FormKey,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        FROM dbo.WA_Menu AS M
        WHERE COALESCE(M.isDisable, 0) = 0
          AND M.MenuID IN
          (
              SELECT M_Child.Parent
              FROM dbo.WA_Menu AS M_Child
              INNER JOIN dbo.WA_UserGroupPermisstion AS P_Child
                  ON P_Child.MenuID = M_Child.MenuID
              WHERE COALESCE(M_Child.isDisable, 0) = 0
                AND P_Child.IsRun = 1
                AND P_Child.UserGroupID = @UserGroupID
          )
          AND M.MenuID NOT IN
          (
              SELECT P_Current.MenuID
              FROM dbo.WA_UserGroupPermisstion AS P_Current
              WHERE P_Current.IsRun = 1
                AND P_Current.UserGroupID = @UserGroupID
          )
    )
    SELECT
        V.MenuID AS [id],
        COALESCE(V.Parent, '') AS [parent],
        COALESCE(V.VN, '') AS [label],
        COALESCE(V.SubTitle, '') AS [subTitle],
        COALESCE(V.IconClass, '') AS [icon],
        COALESCE(V.FormName, '') AS [formName],
        COALESCE(V.URLPara, '') AS [URLPara],
        COALESCE(V.FormKey, '') AS [formKey],
        V.IsRun,
        V.IsAdd,
        V.IsUpdate,
        V.IsDelete,
        V.isManager,
        V.isAdmin,
        V.isAutoLock,
        V.isHideAmount,
        V.isLockDoc,
        V.isUnLockDoc,
        V.isExportExcel,
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
                CAST(COALESCE(D.IsReadOnly, 0) AS BIT) AS isReadOnly
            FROM dbo.WA_FieldDatasetRegistry AS D
            WHERE D.WebFormName = V.FormName
            ORDER BY D.CreatedAt, D.DatasetKey
            FOR JSON PATH
        ) AS [datasetsJson]
    FROM VisibleMenus AS V
    LEFT JOIN dbo.SY_FrmLstTbl AS F
        ON F.FormID = V.FormName
    LEFT JOIN dbo.WA_FieldContractRegistry AS C
        ON C.WebFormName = V.FormName
    ORDER BY V.MenuID;
END
GO
