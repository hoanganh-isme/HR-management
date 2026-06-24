USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. DỌN DẸP CẤU HÌNH CŨ CỦA MODULE BẢO HIỂM
-- =========================================================================
DELETE FROM dbo.SY_FrmCfg WHERE FID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail') 
    OR UserAutoID IN ('2605151335120250506765678', '2605151333483083261637386', '2605151331213073242096744', '2605221051073133364212249', '2603121542586526686875168', '2603121542586366525246585', '2605151341536616824066742', '2603121542586686834862302', '2605151340253573798143738', '2605151620182032296531464', '2605210910464674816414727', '2605151615223383547169332', '2606171405325105364451601', '2603121541474484793805443', '2603121541474794959849522', '2603121553134214341049328', '2605191014501321424390303', '2603121553134354524588463', '2605191014501421582715453', '2603121541552763082783666', '2605131542142592801449621', '2605191015073443567375608', '2603121541553083235686747', '2603121553134524683929664', '2605191013463333524497194', '2605131542473924125695167', '2605131540321081333682254', '2605131540347958185451586', '2605131540371962141228410', '2605131549531231442946667', '2605131540395155283139277', '2605131549595765875999234');
DELETE FROM dbo.SY_FrmDrdwTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID IN ('2603121547508699001442177', '2605151346256396592323415', '2605221051164454657930559');
DELETE FROM dbo.SY_FrmExpTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmFltTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID = '2606171113062582698736665';
DELETE FROM dbo.SY_FrmGrdActTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail')
    OR UserAutoID = '2605151458489119305475685';
DELETE FROM dbo.SY_FrmMstActTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmOptBtnTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.SY_FrmCtrTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail') OR UserAutoID LIKE 'WA_BaoHiemFrm%' OR UserAutoID LIKE 'HR_BaoHiemFrm%';
DELETE FROM dbo.SY_StTbl WHERE StringID LIKE 'WA_BaoHiemFrm%' OR StringID LIKE 'API_BaoHiem_Detail%';
DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
DELETE FROM dbo.WA_API WHERE list IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail', 'WA_BaoHiemFrm_PersonID', 'WA_BaoHiemFrm_Calculate');
DELETE FROM dbo.WA_Menu WHERE MenuID = '2022' OR FormName = 'WA_BaoHiemFrm';
GO

-- =========================================================================
-- 2. ĐĂNG KÝ MENU (WA_Menu) & QUYỀN TRUY CẬP
-- =========================================================================
INSERT INTO dbo.WA_Menu (MenuID, Parent, VN, EN, FormName, FormKey, URLPara, IconClass, isDisable)
VALUES (
    '2022',
    '20', -- Parent 20 cho Quản lý Nhân sự
    N'Bảo hiểm',
    'Insurance',
    'WA_BaoHiemFrm',
    'WA_BAOHIEMFRM',
    '#/2022',
    'security', -- Icon Class cho Bảo hiểm
    0
);
GO

-- Cập nhật phân quyền tự động cho tất cả nhóm người dùng
INSERT INTO dbo.SY_UserGroupPermisstion (UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete, isManager, isAdmin) 
SELECT UserGroupID, MenuID, 1, 1, 1, 1, 0, 0  
FROM (
    SELECT UserGroupID, MenuID FROM dbo.SY_UserGroup, dbo.WA_Menu WHERE COALESCE(FormName, '') <> ''
) A 
LEFT JOIN (
    SELECT DISTINCT UserGroupID + MenuID AS Key01 FROM dbo.SY_UserGroupPermisstion  
) B ON A.UserGroupID + A.MenuID = B.Key01 
WHERE B.Key01 IS NULL;
GO

-- =========================================================================
-- 3. ĐĂNG KÝ BẢNG CẤU HÌNH FORM (SY_FrmLstTbl)
-- =========================================================================
-- Master Form: Chứng từ Bảo Hiểm
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BaoHiemFrm';
INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'WA_BaoHiemFrm', N'EDIT', N'Bảo Hiểm', N'Insurance', N'HR_BaoHiemTbl', N'DocumentID', N'保险');

-- Detail Grid: Chi tiết đóng bảo hiểm
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_BaoHiem_Detail';
INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'API_BaoHiem_Detail', N'EDIT', N'Chi tiết đóng bảo hiểm', N'Insurance Details', N'HR_BaoHiemChiTietTbl', N'UserAutoID', N'保险明细');
GO

-- =========================================================================
-- 4. KHAI BÁO ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- Routing cho Master Form (WA_BaoHiemFrm)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BaoHiemFrm', 'View', 'API_BaoHiem', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'''),
('WA_BaoHiemFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BaoHiemFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Detail Form (API_BaoHiem_Detail)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_BaoHiem_Detail', 'View', 'API_BaoHiem_Detail', '@DocumentID=N''{DocumentID}'''),
('API_BaoHiem_Detail', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_BaoHiem_Detail', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

-- Routing cho Lookups và Calculations
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BaoHiemFrm_PersonID', 'View', 'API_BaoHiem_PersonLookup', '@BranchID=N''{BranchID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @Keyword=N''{Keyword}'''),
('WA_BaoHiemFrm_Calculate', 'View', 'TinhBHStp', '@PeriodID=N''{PeriodID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @MucDong={MucDong}');
GO

-- =========================================================================
-- 5. CẤU HÌNH BỘ LỌC TOOLBAR (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [ControlWidth], [Type], [Source], [ValueColumn], [DisplayColumn], [ColumnArr], [IsSetDefaultValue], [RememberLastValue], [isLockWhenEditData], [UseLikeOperator], [IsDisable], [IsReload], [IsPrimaryKeyCombine], [Operator])  
VALUES (N'2606171113062582698736665', N'WA_BaoHiemFrm', N'0', N'BranchID', N'Chi nhánh', 200, 3, N'HR_GetBrachIDByUserStp N''{User}''', N'BranchID', N'BranchID', N'BranchID', 1, 0, 0, 0, 0, 0, 0, 4);
GO

-- =========================================================================
-- 6. CẤU HÌNH LAYOUT TỪ ĐIỂN FIELD (SY_FrmCfg)
-- =========================================================================
-- Master Layout Configs
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2605151335120250506765678', N'WA_BaoHiemFrm', N'DFP', N'', N'DocumentDate', N'', GETDATE(), N''),
(N'2605151333483083261637386', N'WA_BaoHiemFrm', N'DMK', N'', N'{P}{YY}{MM}/{3}', N'', GETDATE(), N''),
(N'2605151331213073242096744', N'WA_BaoHiemFrm', N'DPR', N'', N'BH', N'', GETDATE(), N''),
(N'2605221051073133364212249', N'WA_BaoHiemFrm', N'LYT1', N'BranchID', N'2;8;1;1;;;;;;;;;;;;;;;;0;0', N'004', GETDATE(), N''),
(N'2603121542586526686875168', N'WA_BaoHiemFrm', N'LYT1', N'DocumentDate', N'1;4;1;1;;;;;;;;;;;;;;;;0;0', N'002', GETDATE(), N''),
(N'2603121542586366525246585', N'WA_BaoHiemFrm', N'LYT1', N'DocumentID', N'1;4;1;;;;;;;;;;;;;;;;;0;0', N'001', GETDATE(), N''),
(N'2605151341536616824066742', N'WA_BaoHiemFrm', N'LYT1', N'LoaiBaoHiem', N'1;4;1;;1;;;;;;;;;;;;;;;0;0', N'007', GETDATE(), N''),
(N'2603121542586686834862302', N'WA_BaoHiemFrm', N'LYT1', N'Notes', N'1;8;1;1;;;;;;;;;;;;;;;;0;0', N'003', GETDATE(), N''),
(N'2605151340253573798143738', N'WA_BaoHiemFrm', N'LYT1', N'PeriodID', N'1;4;1;;1;;;;;;;;;;;;;;;0;0', N'006', GETDATE(), N''),
(N'2605151620182032296531464', N'WA_BaoHiemFrm', N'LYT1', N'PeriodKeyID', N'2;4;1;1;;;;;;;;;;;;;;;;0;0', N'005', GETDATE(), N''),
(N'2605210910464674816414727', N'WA_BaoHiemFrm', N'SPA2', N'', N'1', N'', GETDATE(), N''),
(N'2605151615223383547169332', N'WA_BaoHiemFrm', N'T0', N'EX', N'(PeriodID + LoaiBaoHiem) as PeriodKeyID', N'', GETDATE(), N''),
(N'2606171405325105364451601', N'WA_BaoHiemFrm', N'T0', N'FTR', N'(N''{BranchID}'' IS NULL OR N''{BranchID}'' = '''') OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(N''{BranchID}'', '',''))', N'', GETDATE(), N''),
(N'2603121541474484793805443', N'WA_BaoHiemFrm', N'T0', N'PK', N'DocumentID', N'', GETDATE(), N''),
(N'2603121541474794959849522', N'WA_BaoHiemFrm', N'T0', N'TN', N'HR_BaoHiemTbl', N'', GETDATE(), N'');

-- Detail Layout Configs (T1)
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2603121553134214341049328', N'WA_BaoHiemFrm', N'T1', N'FKA1', N'PersonID', N'', GETDATE(), N''),
(N'2605191014501321424390303', N'WA_BaoHiemFrm', N'T1', N'FKA2', N'PersonID', N'', GETDATE(), N''),
(N'2603121553134354524588463', N'WA_BaoHiemFrm', N'T1', N'FKB1', N'PersonID', N'', GETDATE(), N''),
(N'2605191014501421582715453', N'WA_BaoHiemFrm', N'T1', N'FKB2', N'PersonID', N'', GETDATE(), N''),
(N'2603121541552763082783666', N'WA_BaoHiemFrm', N'T1', N'PK', N'UserAutoID', N'', GETDATE(), N''),
(N'2605131542142592801449621', N'WA_BaoHiemFrm', N'T1', N'SE1', N'A.PersonName, A.PhongBan, A.TitleName, A.ChucDanhChuyenMon', N'', GETDATE(), N''),
(N'2605191015073443567375608', N'WA_BaoHiemFrm', N'T1', N'SE2', N'B.ChucDanhChuyenMon', N'', GETDATE(), N''),
(N'2603121541553083235686747', N'WA_BaoHiemFrm', N'T1', N'TN', N'HR_BaoHiemChiTietTbl', N'', GETDATE(), N''),
(N'2603121553134524683929664', N'WA_BaoHiemFrm', N'T1', N'TN1', N'HR_PersonTbl', N'', GETDATE(), N''),
(N'2605191013463333524497194', N'WA_BaoHiemFrm', N'T2', N'SE', N'HR_HopDongTbl.ChucDanhChuyenMon', N'', GETDATE(), N'');

-- Detail Columns & Header Groups
INSERT INTO dbo.SY_FrmCfg ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID])  
VALUES 
(N'2605131542473924125695167', N'WA_BaoHiemFrm', N'T1CS', N'12', N'PersonID;PersonName;ChucDanhChuyenMon;PhongBan;MucDong', N'', GETDATE(), N''),
(N'2605131540321081333682254', N'WA_BaoHiemFrm', N'T1CS', N'41', N'BHXH', N'', GETDATE(), N''),
(N'2605131540347958185451586', N'WA_BaoHiemFrm', N'T1CS', N'42', N'MucDongBHXHNLD;MucDongBHXHNSDLD', N'', GETDATE(), N''),
(N'2605131540371962141228410', N'WA_BaoHiemFrm', N'T1CS', N'51', N'BHYT', N'', GETDATE(), N''),
(N'2605131549531231442946667', N'WA_BaoHiemFrm', N'T1CS', N'52', N'MucDongBHYTNLD;MucDongBHYTNSDLD', N'', GETDATE(), N''),
(N'2605131540395155283139277', N'WA_BaoHiemFrm', N'T1CS', N'61', N'BHTN', N'', GETDATE(), N''),
(N'2605131549595765875999234', N'WA_BaoHiemFrm', N'T1CS', N'62', N'MucDongBHTNNLD;MucDongBHTNNSDLD', N'', GETDATE(), N'');
GO

-- =========================================================================
-- 7. CẤU HÌNH GRID ACTIONS (SY_FrmGrdActTbl) & GRID TIÊU ĐỀ NHÓM (SY_FrmCtrTbl)
-- =========================================================================
-- Grid Action khi MucDong thay đổi
INSERT INTO dbo.SY_FrmGrdActTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [Action], [Source], [Para], [TargetValue], [TargetValue2], [TargetColumn], [TargetColumn2], [MsgID], [IsDisable], [ActType], [Oderby] )  
VALUES (N'2605151458489119305475685', N'WA_BaoHiemFrm', N'grdChitiet', N'MucDong', N'UpdateColumn', N'TinhBHStp ''{0}'', ''{1}'' , {2}', N'Master.PeriodID;Master.LoaiBaoHiem;MucDong', NULL, NULL, N'MucDongBHXHNLD;MucDongBHXHNSDLD;MucDongBHYTNLD;MucDongBHYTNSDLD;MucDongBHTNNLD;MucDongBHTNNSDLD', NULL, NULL, 0, N'ExecSQL', NULL);

-- Grid Group Headers
INSERT INTO dbo.SY_FrmCtrTbl ([UserAutoID], [FormID], [ParentCtlName], [CtlName], [CaptionVN], [CaptionEN], [CtlTop], [CtlLeft], [CaptionWidth], [Width], [Height], [OrderBy], [IsDisable], [CaptionCH] )  
VALUES 
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHXHNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHXHNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHXHNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHXHNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHYTNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHYTNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHYTNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHYTNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHTNNLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHTNNLD', N'G', N'Người LD ', N'Employee share', 0, 0, 0, 0, 0, 5, 0, N''),
(N'WA_BaoHiemFrmG-grdChitiet;MucDongBHTNNSDLD', N'WA_BaoHiemFrm', N'grdChitiet;MucDongBHTNNSDLD', N'G', N'Công Ty', N'Company share', 0, 0, 0, 0, 0, 5, 0, N'');
GO

-- =========================================================================
-- 8. CẤU HÌNH DROPDOWNS (SY_FrmDrdwTbl)
-- =========================================================================
-- 8.1. Dropdown chọn Nhân viên trong Grid chi tiết (PersonID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2603121547508699001442177', N'WA_BaoHiemFrm', N'grdChitiet', N'PersonID', N'PersonID', N'PersonID', N'STT;PersonID;PersonName;PhongBan;MucDong;CanhBao', NULL, 
N'SELECT 
    ROW_NUMBER() OVER (ORDER BY P.PersonID DESC) AS STT,
    P.PersonID, 
    P.PersonName, 
    P.PhongBan, -- Đã sửa đổi thẳng về PhongBan để khớp khớp hiển thị
    ISNULL(BH.MucDong, 0) AS MucDong, 
    CASE 
        WHEN BH.PersonID IS NOT NULL 
        THEN N''!!! ĐÃ CÓ BH TẠI KỲ: '' + CAST(BH.PeriodID AS VARCHAR) + N'' (Chứng từ: '' + BH.DocumentID + '')''
        ELSE '''' 
    END AS CanhBao,
    BH.DocumentID,
    BH.PeriodID
FROM HR_PersonTbl P
LEFT JOIN (
    SELECT 
        CT.PersonID, 
        SUM(CT.MucDong) AS MucDong, 
        MAX(H.DocumentID) AS DocumentID, 
        MAX(H.PeriodID) AS PeriodID
    FROM HR_BaoHiemChiTietTbl CT
    INNER JOIN HR_BaoHiemTbl H ON H.DocumentID = CT.DocumentID
    GROUP BY CT.PersonID
) BH ON P.PersonID = BH.PersonID
WHERE P.BranchID = ''{0}''
  AND (''{1}'' = '''' OR 1=1);', N'PersonID;PersonName;MucDong', 1, N'Master.BranchID;Master.LoaiBaoHiem', NULL, N'DropSelect', 0, NULL, 1, 1, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, N'PhongBan', N'PersonName', NULL, NULL, 0, NULL, NULL, 0);

-- 8.2. Dropdown chọn Kỳ & Loại bảo hiểm (PeriodKeyID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2605151346256396592323415', N'WA_BaoHiemFrm', NULL, N'PeriodKeyID', N'PeriodKeyID', N'PeriodID;LoaiBaoHiem', N'PeriodID;LoaiBaoHiem', N'80;200', N'SELECT PeriodID, LoaiBaoHiem, (PeriodID + LoaiBaoHiem) AS PeriodKeyID FROM HR_BangThamSoTbl', N'PeriodID;LoaiBaoHiem', 1, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- 8.3. Dropdown chọn Chi nhánh (BranchID)
INSERT INTO dbo.SY_FrmDrdwTbl ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
VALUES (N'2605221051164454657930559', N'WA_BaoHiemFrm', NULL, N'BranchID', N'BranchID', N'BranchID', N'BranchID;BranchName', NULL, N'SELECT * FROM CF_BranchTbl', NULL, 1, NULL, NULL, N'Dropdown', 0, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, N'BranchName', NULL, NULL, NULL, NULL, NULL, 0);
GO

-- =========================================================================
-- 9. ĐĂNG KÝ VÀ VIỆT HÓA TỪ ĐIỂN CỘT (SY_FmtFldTbl)
-- =========================================================================
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'PeriodKeyID', NULL, N'Kỳ đóng bảo hiểm', N'Period Key', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'PeriodKeyID');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHXHNLD', NULL, N'BHXH Người lao động', N'SI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHXHNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHXHNSDLD', NULL, N'BHXH Công ty đóng', N'SI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHXHNSDLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHYTNLD', NULL, N'BHYT Người lao động', N'HI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHYTNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHYTNSDLD', NULL, N'BHYT Công ty đóng', N'HI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHYTNSDLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHTNNLD', NULL, N'BHTN Người lao động', N'UI Employee', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHTNNLD');
INSERT INTO dbo.SY_FmtFldTbl ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
SELECT NULL, N'MucDongBHTNNSDLD', NULL, N'BHTN Công ty đóng', N'UI Company', NULL WHERE NOT EXISTS (SELECT 1 FROM SY_FmtFldTbl WHERE FieldName = 'MucDongBHTNNSDLD');
GO

-- =========================================================================
-- 10. ĐỒNG BỘ TRƯỜNG TỪ TABLE VÀO SY_FormatFields
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BaoHiemFrm', @ObjectName = 'HR_BaoHiemTbl';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_BaoHiem_Detail', @ObjectName = 'HR_BaoHiemChiTietTbl';
GO

-- =========================================================================
-- 11. CẬP NHẬT THUỘC TÍNH FORM FIELDS (SY_FormatFields)
-- =========================================================================
-- Master Form Fields (WA_BaoHiemFrm)
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'DocumentID' THEN N'Số chứng từ'
        WHEN 'DocumentDate' THEN N'Ngày lập'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'PeriodID' THEN N'Kỳ'
        WHEN 'LoaiBaoHiem' THEN N'Loại bảo hiểm'
        WHEN 'Notes' THEN N'Ghi chú'
        WHEN 'PeriodKeyID' THEN N'Kỳ đóng bảo hiểm'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName = 'DocumentDate' THEN 'd'
        WHEN FieldName IN ('BranchID', 'PeriodKeyID') THEN 'sl'
        ELSE 't'
    END,
    FormPosition = CASE
        WHEN FieldName IN ('DocumentID', 'DocumentDate', 'BranchID', 'PeriodKeyID', 'Notes') THEN 'grid'
        ELSE 'form'
    END,
    ShowInAdd = CASE WHEN FieldName IN ('UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PeriodID', 'LoaiBaoHiem') THEN 0 ELSE 1 END,
    ShowInEdit = CASE WHEN FieldName IN ('UserCreate', 'DateCreate', 'UserUpdate', 'DateUpdate', 'PeriodID', 'LoaiBaoHiem') THEN 0 ELSE 1 END,
    IsReadOnlyEdit = CASE WHEN FieldName = 'DocumentID' THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('DocumentID', 'DocumentDate', 'BranchID', 'PeriodKeyID') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PeriodKeyID' THEN 'HR_BangThamSoTbl' -- link PeriodKeyID
        ELSE NULL
    END,
    OrderNo = CASE FieldName
        WHEN 'DocumentID' THEN 1
        WHEN 'DocumentDate' THEN 2
        WHEN 'BranchID' THEN 3
        WHEN 'PeriodKeyID' THEN 4
        WHEN 'Notes' THEN 5
        ELSE 99
    END
WHERE FormName = 'WA_BaoHiemFrm';

-- Detail Grid Fields (API_BaoHiem_Detail)
UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'PersonID' THEN N'Mã nhân viên'
        WHEN 'PersonName' THEN N'Họ tên'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'TitleName' THEN N'Chức vụ'
        WHEN 'ChucDanhChuyenMon' THEN N'Chuyên môn'
        WHEN 'MucDong' THEN N'Mức đóng'
        WHEN 'MucDongBHXHNLD' THEN N'BHXH Người lao động'
        WHEN 'MucDongBHXHNSDLD' THEN N'BHXH Công ty đóng'
        WHEN 'MucDongBHYTNLD' THEN N'BHYT Người lao động'
        WHEN 'MucDongBHYTNSDLD' THEN N'BHYT Công ty đóng'
        WHEN 'MucDongBHTNNLD' THEN N'BHTN Người lao động'
        WHEN 'MucDongBHTNNSDLD' THEN N'BHTN Công ty đóng'
        WHEN 'GhiChu' THEN N'Ghi chú'
        ELSE FieldName
    END,
    FormatID = CASE 
        WHEN FieldName IN ('MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 'n'
        WHEN FieldName = 'PersonID' THEN 'sl'
        ELSE 't'
    END,
    FormPosition = 'grid',
    ShowInAdd = 1,
    ShowInEdit = 1,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PersonID', 'MucDong') THEN 1 ELSE 0 END,
    DataSource = CASE WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl' ELSE NULL END,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'PhongBan' THEN 3
        WHEN 'TitleName' THEN 4
        WHEN 'ChucDanhChuyenMon' THEN 5
        WHEN 'MucDong' THEN 6
        WHEN 'MucDongBHXHNLD' THEN 7
        WHEN 'MucDongBHXHNSDLD' THEN 8
        WHEN 'MucDongBHYTNLD' THEN 9
        WHEN 'MucDongBHYTNSDLD' THEN 10
        WHEN 'MucDongBHTNNLD' THEN 11
        WHEN 'MucDongBHTNNSDLD' THEN 12
        WHEN 'GhiChu' THEN 13
        ELSE 99
    END
WHERE FormName = 'API_BaoHiem_Detail';
GO

PRINT 'Successfully configured WA_BaoHiemFrm configuration metadata!';
GO
