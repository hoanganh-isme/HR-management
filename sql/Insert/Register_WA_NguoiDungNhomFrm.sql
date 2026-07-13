
-- =========================================================================
-- 2. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_NguoiDungNhomFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_StTbl WHERE StringID LIKE 'WA_NguoiDungNhomFrm%' OR StringID LIKE 'NguoiDungNhomFrm%';
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
DELETE FROM dbo.WA_API WHERE list IN ('WA_NguoiDungNhomFrm', 'NguoiDungNhomFrm');
GO

-- =========================================================================
-- 3. ĐĂNG KÝ MENU (WA_Menu) & QUYỀN TRUY CẬP
-- =========================================================================
IF NOT EXISTS(SELECT * FROM WA_Menu WHERE MenuID = N'0101') 
    INSERT INTO WA_Menu (MenuID, VN, EN, CH, Parent, IconClass, FormName, URLPara, isDisable, isNotCheckPermission, isImageMenu, Sticky)  
    VALUES (N'0101', N'Danh sách nhóm người dùng', NULL, NULL, N'01', 'horizontal_rule', N'WA_NguoiDungNhomFrm', '#/0101', 0, 0, 0, 0) 
ELSE 
    UPDATE WA_Menu 
    SET VN = N'Danh sách nhóm người dùng', Parent = N'01', IconClass = 'horizontal_rule', 
        FormName = N'WA_NguoiDungNhomFrm', URLPara = '#/0101', isDisable = 0, isNotCheckPermission = 0, isImageMenu = 0, Sticky = 0 
    WHERE MenuID = '0101';
GO 

-- Cập nhật phân quyền vào Menu (Chỉ cấp quyền cơ bản, Admin sẽ chỉnh lại sau)
INSERT INTO SY_UserGroupPermisstion (UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete, isManager, isAdmin) 
SELECT UserGroupID, MenuID, 1, 1, 1, 1, 0, 0  
FROM (SELECT UserGroupID, MenuID FROM SY_UserGroup, WA_Menu WHERE ISNULL(FormName,'') <> '') A 
LEFT JOIN (SELECT DISTINCT UserGroupID + MenuID AS Key01 FROM SY_UserGroupPermisstion) B 
ON A.UserGroupID + A.MenuID = B.Key01 
WHERE B.Key01 IS NULL;
GO 

-- =========================================================================
-- 4. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_NguoiDungNhomFrm',
    'EDIT',
    N'Danh sách nhóm người dùng',
    'User Group List',
    'SY_UserGroup',
    'UserGroupID'
);
GO

-- =========================================================================
-- 5. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_NguoiDungNhomFrm', 'View', 'API_NguoiDungNhomFrm', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_NguoiDungNhomFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_NguoiDungNhomFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 6. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_NguoiDungNhomFrm', @ObjectName = 'SY_UserGroup';
GO

-- =========================================================================
-- 7. TINH CHỈNH TIÊU ĐỀ CÁC CỘT VÀ KIỂU DỮ LIỆU
-- =========================================================================
-- Chèn thêm cột ảo CountUser vào SY_FormatFields vì nó không có trong SY_UserGroup
IF NOT EXISTS(SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_NguoiDungNhomFrm' AND FieldName = 'CountUser')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyAdd, IsReadOnlyEdit, OrderNo, ShowInFilter, DataSource)
    VALUES ('WA_NguoiDungNhomFrm', 'CountUser', N'Count User', 'Count User', 'n', 0, 'grid', 0, 0, 1, 1, 4, 0, NULL);
END

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã nhóm', CaptionEN = 'Group ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1, IsReadOnlyEdit = 1
WHERE FormName = 'WA_NguoiDungNhomFrm' AND FieldName = 'UserGroupID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên nhóm', CaptionEN = 'Group Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_NguoiDungNhomFrm' AND FieldName = 'UserGroupName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ngừng sử dụng', CaptionEN = 'Is Disabled', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_NguoiDungNhomFrm' AND FieldName = 'IsDisable';
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_NguoiDungNhomFrm (Danh sach nhom nguoi dung)!';
GO
