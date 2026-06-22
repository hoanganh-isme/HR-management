USE [QLTiec]
GO

-- 1. Cấu hình bảng SY_FrmLstTbl (Để hàm API_TruyVanDong biết tên bảng vật lý và khóa chính)
DELETE FROM SY_FrmLstTbl WHERE FormID IN ('frmKho', 'frmHanghoadinhluong', 'frmNhapKho', 'frmXuatKho', 'frmHanghoa');

INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmKho', 'dmKho', 'Khoid');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmHanghoa', 'dmHangHoa', 'Mahang'); -- NVL Map với dmHangHoa
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmHanghoadinhluong', 'dmHanghoadinhluong', 'UserAutoID');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmNhapKho', 'tbNhaphang', 'DocumentID');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmXuatKho', 'tbXuatnvl', 'DocumentID');

-- 2. Cấu hình bảng WA_API (Sửa lại cú pháp Para dùng biến định danh @Param=N'...' để Gateway parse chuẩn)
DELETE FROM WA_API WHERE list IN ('frmKho', 'frmHanghoadinhluong', 'frmNhapKho', 'frmXuatKho', 'frmHanghoa') AND func = 'View';

INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmHanghoa', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmHanghoadinhluong', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmNhapKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmXuatKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');

GO
