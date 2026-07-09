USE [X26DIM_TT]
GO

-- =========================================================================
-- Dang ky API Save/Delete cho HR_SapCaNhanVienTbl
-- Tuong tu pattern API_BaoHiem_Detail
-- =========================================================================

-- Xoa dang ky cu neu co
DELETE FROM dbo.WA_API WHERE list = 'API_CaLamViec_NhanVien';
GO

-- Dang ky View/Save/Delete cho API_CaLamViec_NhanVien
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES
('API_CaLamViec_NhanVien', 'View',   'API_CaLamViec_NhanVien', N'@SapCaID=N''{SapCaID}'''),
('API_CaLamViec_NhanVien', 'Save',   'API_LuuDong',            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_CaLamViec_NhanVien', 'Delete', 'API_XoaDong',            N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT 'Da dang ky API_CaLamViec_NhanVien Save/Delete thanh cong!';
GO
