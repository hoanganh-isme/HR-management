/*
  Installer SQLCMD cho Unified Contract Rollout.
  File 10 chỉ cài procedure cutover; không tự cutover trước khi review verify.
*/
:r ..\UnifiedContractRollout\00_PRECHECK_MASS_ROLLOUT.sql
:r ..\UnifiedContractRollout\01_CREATE_CONTROL_REGISTRY.sql
:r ..\UnifiedContractRollout\02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql
:r ..\UnifiedContractRollout\03_CREATE_DISCOVERY_PROCEDURES.sql
:r ..\UnifiedContractRollout\04_SEED_EXISTING_CONFIRMED_CONTRACTS.sql
:r ..\UnifiedContractRollout\05_DISCOVER_AND_SEED_SAFE_FORMS.sql
:r ..\UnifiedContractRollout\06_UPDATE_METADATA_PROCEDURES.sql
:r ..\UnifiedContractRollout\07_UPDATE_GENERIC_VIEW_V2.sql
:r ..\UnifiedContractRollout\08_UPDATE_SAVE_V2.sql
:r ..\UnifiedContractRollout\09_UPDATE_DELETE_V2.sql
:r ..\UnifiedContractRollout\10_CUTOVER_SAFE_FORMS.sql
:r ..\UnifiedContractRollout\11_VERIFY_MASS_ROLLOUT.sql
:r ..\UnifiedContractRollout\12_ROLLBACK_MASS_ROLLOUT.sql
