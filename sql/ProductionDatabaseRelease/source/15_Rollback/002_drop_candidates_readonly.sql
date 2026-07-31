
/*
  Không chạy file này trong ngày rollout.
  Chỉ bỏ comment sau giai đoạn monitoring và phê duyệt thủ công.
*/
SET NOCOUNT ON;
PRINT N'Không có object SafeToDrop=true. Release này không sinh lệnh DROP.';
GO
