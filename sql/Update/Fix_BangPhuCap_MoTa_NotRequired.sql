USE [X26DIMTUTAC]
GO

-- =========================================================================
-- FIX: Bỏ required cho Mô tả (TenPhuCap) trong WA_BangPhuCapFrm
-- =========================================================================
UPDATE dbo.SY_FormatFields
SET IsRequired = 0
WHERE FormName = 'WA_BangPhuCapFrm'
  AND FieldName = 'TenPhuCap';
GO

PRINT 'FIX 1: TenPhuCap (Mo ta) da bo bat buoc nhap.';
GO
