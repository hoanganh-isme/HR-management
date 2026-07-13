-- =========================================================================
-- 2. DỌN DẸP CẤU HÌNH CŨ CỦA FORM WA_NguoiDungFrm
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_StTbl WHERE StringID LIKE 'WA_NguoiDungFrm%' OR StringID LIKE 'HR_NguoiDungFrm%';
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
DELETE FROM dbo.WA_API WHERE list IN ('WA_NguoiDungFrm', 'HR_NguoiDungFrm');
GO

-- =========================================================================
-- 3. ĐĂNG KÝ MENU (WA_Menu) & QUYỀN TRUY CẬP
-- =========================================================================
IF NOT EXISTS(SELECT * FROM WA_Menu WHERE MenuID = N'0102') 
    INSERT INTO WA_Menu (MenuID, VN, EN, CH, Parent, IconClass, FormName, URLPara, isDisable, isNotCheckPermission, isImageMenu, Sticky)  
    VALUES (N'0102', N'Danh sách người dùng', NULL, NULL, N'01', 'person', N'WA_NguoiDungFrm', '#/0102', 0, 0, 0, 0) 
ELSE 
    UPDATE WA_Menu 
    SET VN = N'Danh sách người dùng', Parent = N'01', IconClass = 'person', 
        FormName = N'WA_NguoiDungFrm', URLPara = '#/0102', isDisable = 0, isNotCheckPermission = 0, isImageMenu = 0, Sticky = 0 
    WHERE MenuID = '0102';
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
    'WA_NguoiDungFrm',
    'EDIT',
    N'Danh sách người dùng',
    'User List',
    'SY_User',
    'UserName'
);
GO

-- =========================================================================
-- 5. ĐĂNG KÝ CÁC ĐƯỜNG TUYẾN API TRONG WA_API
-- =========================================================================
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_NguoiDungFrm', 'View', 'API_NguoiDungFrm', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_NguoiDungFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_NguoiDungFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 6. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_NguoiDungFrm', @ObjectName = 'SY_User';
GO

-- =========================================================================
-- 7. TINH CHỈNH TIÊU ĐỀ CÁC CỘT VÀ KIỂU DỮ LIỆU
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên đăng nhập', CaptionEN = 'User Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1, IsReadOnlyEdit = 1
WHERE FormName = 'WA_NguoiDungFrm' AND FieldName = 'UserName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mật khẩu', CaptionEN = 'Password', FormatID = 'pw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_NguoiDungFrm' AND FieldName = 'Password';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Nhóm người dùng', CaptionEN = 'User Group', FormatID = 'cb', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_NguoiDungFrm' AND FieldName = 'UserGroupID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Phân quyền chi nhánh', CaptionEN = 'Branch Permission', FormatID = 'cb', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 
WHERE FormName = 'WA_NguoiDungFrm' AND FieldName = 'BranchID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ngừng sử dụng', CaptionEN = 'Is Disabled', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 
WHERE FormName = 'WA_NguoiDungFrm' AND FieldName = 'IsDisable';
GO

-- =========================================================================
-- 8. ĐĂNG KÝ DROPDOWN
-- =========================================================================
Insert into [SY_FrmDrdwTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
Values( N'WA_ND_BR', N'WA_NguoiDungFrm', null, N'BranchID', N'BranchID', N'BranchID', N'BranchID;BranchName', null, N'Select * from CF_BranchTbl', null,  1, null, null, N'DropCheck',  0, null,  1,  1,  0, null, null, null,  0, null, null,  0, null, null,  0,  0,  0,  0, null, null, null, null, null, null, null, null, null,  0 );

Insert into [SY_FrmDrdwTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
Values( N'WA_ND_UG', N'WA_NguoiDungFrm', null, N'UserGroupID', N'UserGroupID', N'UserGroupName', N'UserGroupID;UserGroupName', null, N'Select * from SY_UserGroup', null,  1, null, null, N'DropCheck',  0, null,  0,  1,  0, null, null, null,  0, null, null,  0, null, null,  0,  0,  0,  0, null, null, null, null, null, null, null, null, null,  0 );
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_NguoiDungFrm (Danh sach nguoi dung)!';
GO
