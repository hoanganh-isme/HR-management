USE [X26DIMTUTAC]
GO

UPDATE dbo.SY_FrmLstTbl
SET PrimaryKey = 'UserName',
    TableName = 'SY_User'
WHERE FormID = 'WA_NguoiDungFrm';
GO

DELETE FROM dbo.SY_FormatFields
WHERE FormName = 'WA_NguoiDungFrm'
  AND FieldName = 'UserID'
  AND NOT EXISTS (
      SELECT 1
      FROM sys.columns
      WHERE object_id = OBJECT_ID('dbo.SY_User')
        AND name = 'UserID'
  );
GO

UPDATE dbo.SY_FormatFields
SET CaptionVN = N'Tên đăng nhập',
    CaptionEN = 'User Name',
    FormatID = 't',
    IsRequired = 1,
    FormPosition = 'grid',
    OrderNo = 1,
    IsReadOnlyEdit = 1
WHERE FormName = 'WA_NguoiDungFrm'
  AND FieldName = 'UserName';
GO

PRINT 'Da sua metadata WA_NguoiDungFrm dung UserName lam khoa chinh.';
GO
