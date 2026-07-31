
/* Không seed secret/config từ DB test. Source hiện tại không có caller VNPT eContract trực tiếp. */
SET NOCOUNT ON;
SELECT N'VNPT_ECONTRACT' AS Feature,N'REVIEW_REQUIRED_NOT_DEPLOYED' AS Decision;
GO
