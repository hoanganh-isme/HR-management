/*
  Installer độc lập cho rollback. File chỉ cài procedure và hiển thị snapshot;
  quản trị viên chọn FormName hoặc BatchID khi EXEC.
*/
:r ..\UnifiedContractRollout\12_ROLLBACK_MASS_ROLLOUT.sql

/*
Ví dụ rollback một form:
DECLARE @Batch uniqueidentifier = NULL;
EXEC dbo.API_Web_RollbackFieldContractV2
    @WebFormName = 'WA_TitleListFrm',
    @BatchID = @Batch,
    @TargetStatus = 'SHADOW',
    @UserName = 'admin';

Ví dụ rollback một batch:
EXEC dbo.API_Web_RollbackFieldContractV2
    @WebFormName = NULL,
    @BatchID = '00000000-0000-0000-0000-000000000000',
    @TargetStatus = 'DISABLED',
    @UserName = 'admin';
*/
