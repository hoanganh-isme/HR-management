DELETE FROM dbo.WA_API WHERE [list] = 'API_DoiMaNhanVien';
INSERT INTO dbo.WA_API ([list], [func], [sys], [StoredProcedure], [Para])
VALUES ('API_DoiMaNhanVien', 'Update', 1, 'API_DoiMaNhanVien', '@OldPersonID=N''{OldPersonID}'',@NewPersonID=N''{NewPersonID}''');
GO
