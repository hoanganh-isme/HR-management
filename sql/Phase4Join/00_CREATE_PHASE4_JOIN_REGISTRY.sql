SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
BEGIN
    EXEC(
        N'CREATE FUNCTION dbo.API_Phase4JoinRegistry()
          RETURNS TABLE
          AS
          RETURN
          (
              SELECT
                  CAST(NULL AS varchar(100)) AS WebFormName
              WHERE 1 = 0
          );'
    );
END;
GO

/*
  Registry Phase 4 dùng chung cho JOIN read-only và JOIN editable.
  Editable JOIN chỉ được phép mutate qua API_LuuDong_V2/API_XoaDong_V2.
*/
ALTER FUNCTION dbo.API_Phase4JoinRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        V.WebFormName,
        V.DetailKey,
        V.ApiList,
        V.ExpectedProcedure,
        V.ExpectedSaveProcedure,
        V.ExpectedDeleteProcedure,
        V.ExpectedTableName,
        V.ExpectedPrimaryKey,
        CONVERT(bit, V.IsReadOnly) AS IsReadOnly,
        CONVERT(bit, V.EnableMetadata) AS EnableMetadata
    FROM
    (
        VALUES
        (
            CONVERT(varchar(100), 'WA_CaLamViecFrm'),
            CONVERT(varchar(80),  'SHIFT_DETAIL'),
            CONVERT(varchar(100), 'API_CaLamViec_ChiTiet'),
            CONVERT(sysname,      N'API_CaLamViec_ChiTiet'),
            CONVERT(sysname,      N''),
            CONVERT(sysname,      N''),
            CONVERT(sysname,      N'HR_SapCaChiTietTbl'),
            CONVERT(sysname,      N'UserAutoID'),
            CONVERT(bit, 1),
            CONVERT(bit, 1)
        ),
        (
            CONVERT(varchar(100), 'WA_CaLamViecFrm'),
            CONVERT(varchar(80),  'SHIFT_EMPLOYEES'),
            CONVERT(varchar(100), 'API_CaLamViec_NhanVien'),
            CONVERT(sysname,      N'API_CaLamViec_NhanVien'),
            CONVERT(sysname,      N'API_LuuDong_V2'),
            CONVERT(sysname,      N'API_XoaDong_V2'),
            CONVERT(sysname,      N'HR_SapCaNhanVienTbl'),
            CONVERT(sysname,      N'UserAutoID'),
            CONVERT(bit, 0),
            CONVERT(bit, 1)
        )
    ) AS V
    (
        WebFormName,
        DetailKey,
        ApiList,
        ExpectedProcedure,
        ExpectedSaveProcedure,
        ExpectedDeleteProcedure,
        ExpectedTableName,
        ExpectedPrimaryKey,
        IsReadOnly,
        EnableMetadata
    )
);
GO
