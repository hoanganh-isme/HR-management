USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. REGISTER CRUD FOR MASTER FORM (WA_BangPhuCapFrm)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangPhuCapFrm' AND func IN ('Save', 'Delete');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangPhuCapFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangPhuCapFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 2. REGISTER DROPDOWN API FOR EMPLOYEE LOOKUP (HR_PersonTbl)
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'HR_PersonTbl' AND func = 'View';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('HR_PersonTbl', 'View', 'API_HoSoNhanVien', '@Keyword=N''{Keyword}''');
GO

-- =========================================================================
-- 3. REGISTER TABLE AND CRUD FOR DETAIL TAB (API_BangPhuCap_Detail)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_BangPhuCap_Detail';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('API_BangPhuCap_Detail', 'LIST', N'Nhân viên hưởng phụ cấp', 'Employees receiving allowance', 'HR_PersonAllowanceTbl', 'UserAutoID');
GO

DELETE FROM dbo.WA_API WHERE list = 'API_BangPhuCap_Detail' AND func IN ('Save', 'Delete');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_BangPhuCap_Detail', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_BangPhuCap_Detail', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 4. SYNCHRONIZE ACCESS PERMISSIONS
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Successfully configured WA_BangPhuCapFrm CRUD, HR_PersonTbl, and API_BangPhuCap_Detail CRUD!';
GO
