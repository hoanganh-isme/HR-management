/*
  Chạy discovery rồi seed idempotent. Procedure chỉ làm mới contract còn do
  SYSTEM_DISCOVERY sở hữu, kể cả contract cũ từng DEFERRED/BLOCKED; policy do
  quản trị viên sửa thủ công không bị ghi đè.
*/
SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.API_Web_DiscoverFieldContractCandidatesV2', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_Web_SeedSafeFieldContractsV2', N'P') IS NULL
    THROW 54210, N'FIELD_CONTRACT_DISCOVERY_PROCEDURES_NOT_INSTALLED', 1;

EXEC dbo.API_Web_DiscoverFieldContractCandidatesV2;
EXEC dbo.API_Web_SeedSafeFieldContractsV2 @UserName = 'SYSTEM_DISCOVERY';
