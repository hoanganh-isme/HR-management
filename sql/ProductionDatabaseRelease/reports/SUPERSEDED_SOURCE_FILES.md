# Source cũ bị superseded khỏi production manifest

File phase cũ vẫn được giữ trong repository làm lịch sử; production manifest chỉ dùng canonical source trong ProductionDatabaseRelease/source.

| ObjectName | CanonicalFile | SupersededFile | ExactDuplicate |
| --- | --- | --- | --- |
| API_Web_GridFieldSchemaV2 | sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql | sql/Phase3SimpleCrud/02_UPDATE_UNIFIED_FIELD_CONTRACT.sql | false |
| API_Web_GridFieldSchemaV2 | sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql | sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql | false |
| API_Web_UpdateFieldFormat | sql/FieldSyncPhase1/02_CREATE_UPDATE_FIELD_FORMAT_PROC.sql | sql/Setup/01_SETUP_API_WEB_UPDATE_FIELD_FORMAT.sql | false |
| API_TruyVanDong_V2 | sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql | sql/Phase3SimpleCrud/01_CREATE_GENERIC_VIEW_V2.sql | false |
| API_TruyVanDong_V2 | sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql | sql/Phase2ApiMigration/01_CREATE_VIEW_V2.sql | false |
| API_LuuDong_V2 | sql/UnifiedContractRollout/08_UPDATE_SAVE_V2.sql | sql/Phase3SimpleCrud/03_UPDATE_SAVE_V2.sql | false |
| API_LuuDong_V2 | sql/UnifiedContractRollout/08_UPDATE_SAVE_V2.sql | sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql | false |
| API_XoaDong_V2 | sql/UnifiedContractRollout/09_UPDATE_DELETE_V2.sql | sql/Phase3SimpleCrud/04_UPDATE_DELETE_V2.sql | false |
| API_XoaDong_V2 | sql/UnifiedContractRollout/09_UPDATE_DELETE_V2.sql | sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql | false |
| API_Phase3SimpleCrudRegistry | sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql | sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql | false |
| API_Phase3SimpleCrudRegistry | sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql | sql/Phase3SimpleCrud/01_CREATE_GENERIC_VIEW_V2.sql | true |
| API_Phase4JoinRegistry | sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql | sql/Phase4Join/00_CREATE_PHASE4_JOIN_REGISTRY.sql | false |
| API_Web_JoinFieldSchemaV2 | sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql | sql/Phase4Join/01_API_WEB_JOIN_FIELD_SCHEMA_V2.sql | false |
