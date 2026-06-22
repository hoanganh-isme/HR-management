USE [X26DIMTUTAC]
GO

PRINT '========================================================================';
PRINT 'BAT DAU DANG KY TOAN BO 12 DANH MUC CUOI CUNG CON LAI';
PRINT '========================================================================';
GO

-- =========================================================================
-- 1. WA_BankListFrm (Ngân hàng)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BankListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BankListFrm', 'EDIT', N'Danh mục Ngân hàng', 'Bank List', 'HR_BankListTbl', 'BankName');

DELETE FROM dbo.WA_API WHERE list = 'WA_BankListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BankListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BankListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BankListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BankListFrm', @ObjectName = 'HR_BankListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên ngân hàng', CaptionEN = 'Bank Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'BankName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa chỉ chi nhánh', CaptionEN = 'Address', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'Address';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BankListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_BankListFrm (Danh muc Ngan hang)';
GO

-- =========================================================================
-- 2. WA_NationListFrm (Quốc gia)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_NationListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_NationListFrm', 'EDIT', N'Danh mục Quốc gia', 'Nation List', 'HR_NationListTbl', 'NationName');

DELETE FROM dbo.WA_API WHERE list = 'WA_NationListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_NationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_NationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_NationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_NationListFrm', @ObjectName = 'HR_NationListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên quốc gia', CaptionEN = 'Nation Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'NationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'isDefault';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_NationListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_NationListFrm (Danh muc Quoc gia)';
GO

-- =========================================================================
-- 3. WA_ProvinceListFrm (Tỉnh thành)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ProvinceListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_ProvinceListFrm', 'EDIT', N'Danh mục Tỉnh thành', 'Province List', 'HR_ProvineListTbl', 'ProvineName');

DELETE FROM dbo.WA_API WHERE list = 'WA_ProvinceListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ProvinceListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ProvinceListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ProvinceListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ProvinceListFrm', @ObjectName = 'HR_ProvineListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên tỉnh / thành', CaptionEN = 'Province Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Quận / huyện / TX', CaptionEN = 'Township', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_ProvinceListFrm (Danh muc Tinh thanh)';
GO

-- =========================================================================
-- 4. WA_PeopleListFrm (Dân tộc)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_PeopleListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_PeopleListFrm', 'EDIT', N'Danh mục Dân tộc', 'People List', 'HR_PeoplesListTbl', 'PeoplesName');

DELETE FROM dbo.WA_API WHERE list = 'WA_PeopleListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PeopleListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_PeopleListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PeopleListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_PeopleListFrm', @ObjectName = 'HR_PeoplesListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên dân tộc', CaptionEN = 'Ethnicity Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên khác', CaptionEN = 'Alternative Name', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName2';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Địa bàn cư trú', CaptionEN = 'Primary Region', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesPlace';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mặc định', CaptionEN = 'Default', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'isDefault';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_PeopleListFrm (Danh muc Dan toc)';
GO

-- =========================================================================
-- 5. WA_ReligionListFrm (Tôn giáo)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ReligionListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_ReligionListFrm', 'EDIT', N'Danh mục Tôn giáo', 'Religion List', 'HR_ReligionListTbl', 'ReligionName');

DELETE FROM dbo.WA_API WHERE list = 'WA_ReligionListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ReligionListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ReligionListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ReligionListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ReligionListFrm', @ObjectName = 'HR_ReligionListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên tôn giáo', CaptionEN = 'Religion Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'ReligionName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_ReligionListFrm (Danh muc Ton giao)';
GO

-- =========================================================================
-- 6. WA_EducationListFrm (Học vấn)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_EducationListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_EducationListFrm', 'EDIT', N'Danh mục Học vấn', 'Education List', 'HR_EducationListTbl', 'EducationName');

DELETE FROM dbo.WA_API WHERE list = 'WA_EducationListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_EducationListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_EducationListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_EducationListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_EducationListFrm', @ObjectName = 'HR_EducationListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Trình độ học vấn', CaptionEN = 'Education Level', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'EducationName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_EducationListFrm (Danh muc Hoc van)';
GO

-- =========================================================================
-- 7. WA_BangCapListFrm (Bằng cấp)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangCapListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangCapListFrm', 'EDIT', N'Danh mục Bằng cấp', 'Certificate List', 'HR_BangCapTbl', 'MaBangCap');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangCapListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangCapListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangCapListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangCapListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangCapListFrm', @ObjectName = 'HR_BangCapTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã bằng cấp', CaptionEN = 'Certificate ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên bằng cấp', CaptionEN = 'Certificate Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'TenBangCap';
GO
PRINT '--> Da dang ky WA_BangCapListFrm (Danh muc Bang cap)';
GO

-- =========================================================================
-- 8. WA_CareerlListFrm (Nghề nghiệp)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_CareerlListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_CareerlListFrm', 'EDIT', N'Danh mục Nghề nghiệp', 'Career List', 'HR_CareerListTbl', 'CareerName');

DELETE FROM dbo.WA_API WHERE list = 'WA_CareerlListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_CareerlListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_CareerlListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_CareerlListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_CareerlListFrm', @ObjectName = 'HR_CareerListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ngành nghề / Nghề nghiệp', CaptionEN = 'Career Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'CareerName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'GhiChu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'STT';
GO
PRINT '--> Da dang ky WA_CareerlListFrm (Danh muc Nghe nghiep)';
GO

-- =========================================================================
-- 9. WA_HinhThucNghiListFrm (Hình thức nghỉ)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HinhThucNghiListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_HinhThucNghiListFrm', 'EDIT', N'Danh mục Hình thức nghỉ', 'Leave Type List', 'HR_HinhThucNghiListTbl', 'HinhThucNghi');

DELETE FROM dbo.WA_API WHERE list = 'WA_HinhThucNghiListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HinhThucNghiListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HinhThucNghiListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HinhThucNghiListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HinhThucNghiListFrm', @ObjectName = 'HR_HinhThucNghiListTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã hình thức nghỉ', CaptionEN = 'Leave Type Code', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên hình thức nghỉ', CaptionEN = 'Leave Type Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Có hưởng lương', CaptionEN = 'With Pay', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO
PRINT '--> Da dang ky WA_HinhThucNghiListFrm (Danh muc Hinh thuc nghi)';
GO

-- =========================================================================
-- 10. CF_BranchListFrm (Chi nhánh)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'CF_BranchListFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('CF_BranchListFrm', 'EDIT', N'Danh mục Chi nhánh', 'Branch List', 'CF_BranchTbl', 'BranchID');

DELETE FROM dbo.WA_API WHERE list = 'CF_BranchListFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('CF_BranchListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('CF_BranchListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('CF_BranchListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'CF_BranchListFrm', @ObjectName = 'CF_BranchTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã chi nhánh', CaptionEN = 'Branch ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên chi nhánh', CaptionEN = 'Branch Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO
PRINT '--> Da dang ky CF_BranchListFrm (Danh muc Chi nhanh)';
GO

-- =========================================================================
-- 11. WA_BangThueTNCNFrm (Bảng thuế TNCN)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThueTNCNFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangThueTNCNFrm', 'EDIT', N'Bảng mức thuế TNCN', 'PIT Tax Bracket', 'HR_BangThueTNCNTbl', 'Bac');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangThueTNCNFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThueTNCNFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThueTNCNFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThueTNCNFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThueTNCNFrm', @ObjectName = 'HR_BangThueTNCNTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Bậc', CaptionEN = 'Level', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Bac';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Từ', CaptionEN = 'From', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Tu';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Đến', CaptionEN = 'To', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Den';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Thuế suất (%)', CaptionEN = 'Tax Rate (%)', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'ThueSuat';
GO
PRINT '--> Da dang ky WA_BangThueTNCNFrm (Bang thue TNCN)';
GO

-- =========================================================================
-- 12. WA_BangThamSoFrm (Bảng tham số tính lương)
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThamSoFrm';
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES ('WA_BangThamSoFrm', 'EDIT', N'Bảng tham số tính lương', 'Payroll Insurance Parameters', 'HR_BangThamSoTbl', 'UserAutoID');

DELETE FROM dbo.WA_API WHERE list = 'WA_BangThamSoFrm';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThamSoFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThamSoFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThamSoFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThamSoFrm', @ObjectName = 'HR_BangThamSoTbl';

UPDATE dbo.SY_FormatFields SET CaptionVN = N'Kỳ', CaptionEN = 'Period', FormatID = 't', DataSource = 'SY_Period', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'PeriodID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Loại bảo hiểm', CaptionEN = 'Insurance Type', FormatID = 'sl', DataSource = N'STATIC:NVN|Trong nước,NNN|Nước ngoài', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'LoaiBaoHiem';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHXH NLĐ (%)', CaptionEN = 'SI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHXH Cty (%)', CaptionEN = 'SI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHCTY';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHYT NLĐ (%)', CaptionEN = 'HI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHYT Cty (%)', CaptionEN = 'HI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTCTY';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHTN NLĐ (%)', CaptionEN = 'UI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNNLD';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'BHTN Cty (%)', CaptionEN = 'UI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 8 WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNCTY';
GO
PRINT '--> Da dang ky WA_BangThamSoFrm (Bang tham so tinh luong)';
GO

-- =========================================================================
-- ĐỒNG BỘ PHÂN QUYỀN TOÀN CỤC CHO TẤT CẢ CÁC FORM MỚI
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT '========================================================================';
PRINT 'DA DANG KY THANH CONG TOAN BO DANG KY CHO 12 DANH MUC TRENE!';
PRINT '========================================================================';
GO
