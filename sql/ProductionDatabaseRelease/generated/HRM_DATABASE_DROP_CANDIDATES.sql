
/*
  DROP_CANDIDATES - HRM_DB_CLEANUP_20260729
  FILE SINH TỰ ĐỘNG. KHÔNG SỬA TRỰC TIẾP.
  Build: node ./scripts/db-release/build-production-database-release.mjs
  Package manifest SHA-256: 4e594fe8ca7978f795ada71b45044019c79cee25ec9b060a83c7a5e2bd79fbe0
*/
:on error exit
:setvar TargetDatabase "X26DIMTUTAC"
:setvar ReleaseMode "PRODUCTION"

USE [$(TargetDatabase)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/15_Rollback/002_drop_candidates_readonly.sql | SHA-256: 09c76d52bea25e513372105694034e5608a4522f7d0cd28be9c71bf66b29db36 ===== */

/*
  Không chạy file này trong ngày rollout.
  Chỉ bỏ comment sau giai đoạn monitoring và phê duyệt thủ công.
*/
SET NOCOUNT ON;
PRINT N'Không có object SafeToDrop=true. Release này không sinh lệnh DROP.';
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/15_Rollback/002_drop_candidates_readonly.sql ===== */
