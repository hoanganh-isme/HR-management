
/*
  Không replay dump test. Không copy SY_User, permission, menu, nhân sự, lương,
  hợp đồng, bảo hiểm, chấm công hoặc toàn bảng format.
*/
SET NOCOUNT ON;
PRINT N'Không có system seed ngoài registry/route explicit của release.';
GO
