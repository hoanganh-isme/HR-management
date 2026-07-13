
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
DELETE FROM dbo.WA_API WHERE list IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail', 'WA_BaoHiemFrm_PersonID', 'WA_BaoHiemFrm_Calculate', 'HR_BangThamSoTbl');
DELETE FROM dbo.WA_Menu WHERE MenuID = '2022' OR FormName = 'WA_BaoHiemFrm';

DELETE FROM SY_FrmCfg WHERE FID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmDrdwTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmExpTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmFltTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmGrdActTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmMstActTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmOptBtnTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_FrmCtrTbl WHERE FormID IN ('WA_BaoHiemFrm')
DELETE FROM SY_StTbl WHERE StringID LIKE 'WA_BaoHiemFrm%' 
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
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN ('WA_BaoHiemFrm', 'API_BaoHiem_Detail');
INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'WA_BaoHiemFrm', N'EDIT', N'Bảo Hiểm', N'Insurance', N'HR_BaoHiemTbl', N'DocumentID', N'保险');

INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey], [CaptionCH])  
VALUES (N'API_BaoHiem_Detail', N'EDIT', N'Bảo Hiểm Chi Tiết', N'Insurance Detail', N'HR_BaoHiemChiTietTbl', N'UserAutoID', N'保险明细');
GO

-- =========================================================================
-- 4. KHAI BÁO ĐỊNH TUYẾN WEB (WA_API)
-- =========================================================================
-- Routing cho Master Form (WA_BaoHiemFrm)
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BaoHiemFrm', 'View', 'API_BaoHiem', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'''),
('WA_BaoHiemFrm', 'Save', 'WA_BaoHiemFrm_Save', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
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
('HR_BangThamSoTbl', 'View', 'API_HR_BangThamSo_Lookup', '@Keyword=N''{Keyword}'''),
('WA_BaoHiemFrm_PersonID', 'View', 'WA_BaoHiem_PersonLookup', '@BranchID=N''{BranchID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @DocumentID=N''{DocumentID}'', @Keyword=N''{Keyword}'''),
('WA_BaoHiemFrm_Calculate', 'View', 'TinhBHStp', '@PeriodID=N''{PeriodID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @MucDong={MucDong}');
GO

-- =========================================================================
-- 5. CẤU HÌNH BỘ LỌC TOOLBAR (SY_FrmFltTbl)
-- =========================================================================
INSERT INTO dbo.SY_FrmFltTbl ([UserAutoID], [FormID], [KeyID], [ColumnID], [Caption], [ControlWidth], [Type], [Source], [ValueColumn], [DisplayColumn], [ColumnArr], [IsSetDefaultValue], [RememberLastValue], [isLockWhenEditData], [UseLikeOperator], [IsDisable], [IsReload], [IsPrimaryKeyCombine], [Operator])  
VALUES (N'2606171113062582698736665_WA', N'WA_BaoHiemFrm', N'0', N'BranchID', N'Chi nhánh', 200, 3, N'HR_GetBrachIDByUserStp N''{User}''', N'BranchID', N'BranchID', N'BranchID', 1, 0, 0, 0, 0, 0, 0, 4);
GO

-- =========================================================================
-- 6. CẤU HÌNH TỪ ĐIỂN FIELD (TỪ HR_BaoHiemFrm CHUYỂN SANG WA_BaoHiemFrm)
-- =========================================================================

Insert into [SY_FrmGrdActTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [Action], [Source], [Para], [TargetValue], [TargetValue2], [TargetColumn], [TargetColumn2], [MsgID], [IsDisable], [ActType], [Oderby] )  
Values( N'2606241746271341539736379_WA', N'WA_BaoHiemFrm', N'grdChitiet', N'MucDong', N'UpdateColumn', N'TinhBHStp ''{0}'',''{1}'',''{2}''', N'Master.PeriodID;Master.LoaiBaoHiem;MucDong', null, null, N';MucDongBHXHNLD;MucDongBHXHNSDLD;MucDongBHYTNLD;MucDongBHYTNSDLD;MucDongBHTNNLD;MucDongBHTNNSDLD', null, null,  0, N'ExecSQL', null ) 
Go 

Insert into [SY_FrmDrdwTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
Values( N'2606241634559109292897438_WA', N'WA_BaoHiemFrm', null, N'PeriodKeyID', N'KeyID', N'PeriodID;LoaiBaoHiem', N'PeriodID;LoaiBaoHiem', null, N'SELECT  
    CONCAT(PeriodID, ''_'', LoaiBaoHiem) AS KeyID,
    PeriodID,
    LoaiBaoHiem
FROM dbo.HR_BangThamSoTbl
GROUP BY PeriodID, LoaiBaoHiem
ORDER BY PeriodID, LoaiBaoHiem', N'PeriodID;LoaiBaoHiem',  1, null, null, N'Dropdown',  0, null,  0,  0,  0, null, null, null,  0, null, null,  0, null, null,  0,  0,  0,  0, null, null, null, null, null, null, null, null, null,  0 ) 
Go 
Insert into [SY_FrmDrdwTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
Values( N'2606241639262422663849609_WA', N'WA_BaoHiemFrm', null, N'BranchID', N'BranchID', N'BranchID', N'BranchID;BranchName', null, N'HR_GetBrachIDByUserStp N''{User}''', null,  1, null, null, null,  0, null,  0,  0,  0, null, null, null,  0, null, null,  0, null, null,  0,  0,  0,  0, null, null, null, null, null, null, null, null, null,  0 ) 
Go 
Insert into [SY_FrmDrdwTbl] ([UserAutoID], [FormID], [GridName], [ColumnID], [ValueColumn], [DisplayColumn], [ColumnArr], [WidthArr], [Source], [LinkColumn], [DisableAddNew], [ParaArr], [ParaRequireArr], [Type], [KeepValue], [SummaryFieldArr], [IsMultiSelect], [IsNotInList], [IsDisable], [ColumnName_Filter], [ColumnValue_Filter], [OnlyValue_Filter], [ManualSQLSearch], [ManualSQLOrderBy], [DefaultValue], [IsReload], [EditableColumns], [Caption], [isLock], [isInvisible], [isWordWrap], [isMultiValue], [GroupCaption], [WordWrapArr], [GroupColumnArr], [DisplayMember2], [TreeViewColumn], [TreeViewColumnParent], [ReloadType], [EditType], [DefaultValueSQL], [TriggerOnOpenForm] )  
Values( N'2606241648007747933300103_WA', N'WA_BaoHiemFrm', N'grdChitiet', N'PersonID', N'PersonID', N'PersonID;PersonName', N'PersonID;PersonName;ChucDanhChuyenMon;BranchID;MucDong;PhongBan;CanhBao', null, N'WA_BaoHiem_PersonLookup ''{0}'',''{1}''', N'PersonID;ChucDanhChuyenMon;BranchID;MucDong;PhongBan',  0, N'Master.BranchID;Master.LoaiBaoHiem;Master.DocumentID', null, N'DropSelect',  0, null,  1,  1,  0, null, null, null,  0, null, null,  0, null, null,  0,  0,  0,  0, null, null, N'BranchID', null, null, null, null, null, null,  0 ) 
Go 

Insert into [SY_FrmExpTbl] ([UserAutoID], [FormID], [DataName], [Oderby], [ColumnID], [Expression], [RefColumn], [ParaArr], [IsDisable], [LevelLoop], [RoundType], [RoundPara], [ResetColumnArr] )  
Values( N'2606241715068618776413095_WA', N'WA_BaoHiemFrm', N'Detail', 6, N'MucDong', N'TinhBHStp', N'', N'Master.PeriodID;Master.LoaiBaoHiem;MucDong',  0, null, null, null, null ) 
Go 

Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616590981147049447_WA', N'WA_BaoHiemFrm', N'LYT1', N'BranchID', N'2;4;1;;;;;;;;;;;;;;;;;0;0', N'006',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616590510677756113_WA', N'WA_BaoHiemFrm', N'LYT1', N'DocumentDate', N'4;4;1;;;;;;;;;;;;;;;;;0;0', N'002',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616590370513160726_WA', N'WA_BaoHiemFrm', N'LYT1', N'DocumentID', N'1;4;1;;;;;;;;;;;;;;;;;0;1', N'001',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241646232993185756161_WA', N'WA_BaoHiemFrm', N'LYT1', N'PeriodKeyID', N'2;4;1;1;;;;;;;;;;;;;;;;0;0', N'003',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616590830987001225_WA', N'WA_BaoHiemFrm', N'LYT1', N'LoaiBaoHiem', N'1;4;1;;1;;;;;;;;;;;;;;;0;0', N'005',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616591141301463109_WA', N'WA_BaoHiemFrm', N'LYT1', N'Notes', N'1;12;1;1;;;;;;;;;;;;;;;;0;0', N'007',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616590670831194105_WA', N'WA_BaoHiemFrm', N'LYT1', N'PeriodID', N'1;4;1;1;1;;;;;;;;;;;;;;;0;0', N'004',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241616141181394710626_WA', N'WA_BaoHiemFrm', N'SPA2', N'', N'1', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610317607746574180_WA', N'WA_BaoHiemFrm', N'T0', N'PK', N'DocumentID', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241755223433602640688_WA', N'WA_BaoHiemFrm', N'T0', N'SDD', N'1', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610317747898326869_WA', N'WA_BaoHiemFrm', N'T0', N'TN', N'HR_BaoHiemTbl', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241641590981236124130_WA', N'WA_BaoHiemFrm', N'T0', N'TV', N'HR_BaoHiemView', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610510760952061429_WA', N'WA_BaoHiemFrm', N'T1', N'FKA1', N'PersonID', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610510951114079194_WA', N'WA_BaoHiemFrm', N'T1', N'FKB1', N'PersonID', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610381401655485299_WA', N'WA_BaoHiemFrm', N'T1', N'PK', N'UserAutoID', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241611065575775403480_WA', N'WA_BaoHiemFrm', N'T1', N'SE1', N'A.PersonName, A.PhongBan, A.ChucDanhChuyenMon', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606251014311912052265172_WA', N'WA_BaoHiemFrm', N'T1', N'SUM', N'MucDong', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610381651816896518_WA', N'WA_BaoHiemFrm', N'T1', N'TN', N'HR_BaoHiemChiTietTbl', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606241610511131277648119_WA', N'WA_BaoHiemFrm', N'T1', N'TN1', N'HR_PersonTbl', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606250849406937098331307_WA', N'WA_BaoHiemFrm', N'T1CS', N'12', N'PersonID;PersonName;ChucDanhChuyenMon;BranchID;PhongBan;MucDong;MucDongBHXHNLD;MucDongBHXHNSDLD;MucDongBHYTNLD;MucDongBHYTNSDLD;MucDongBHTNNLD;MucDongBHTNNSDLD;GhiChu', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606252013122482631377419_WA', N'WA_BaoHiemFrm', N'T1F1', N'C1', N'DocumentID;PersonID;MucDong;MucDongBHXHNLD;MucDongBHXHNSDLD;MucDongBHYTNLD;MucDongBHYTNSDLD;MucDongBHTNNLD;MucDongBHTNNSDLD;GhiChu;BranchID;IsNVMoi;PersonName;PhongBan;ChucDanhChuyenMon', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606252012290360578217230_WA', N'WA_BaoHiemFrm', N'T1F1', N'C2', N'IsNVMoi', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2607011004202202396331920_WA', N'WA_BaoHiemFrm', N'T1F1', N'CO', N'-65536', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2607011004344564782505337_WA', N'WA_BaoHiemFrm', N'T1F1', N'FB', N'1', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606252027204784984908582_WA', N'WA_BaoHiemFrm', N'T1F1', N'TA', N'1', N'',  '2026-07-01 10:05', N'' ) 
Go 
Insert into [SY_FrmCfg] ([UserAutoID], [FID], [KeyID], [SubID], [KeyValue], [SubValue], [VDate], [PFID] )  
Values( N'2606252012550801035592506_WA', N'WA_BaoHiemFrm', N'T1F1', N'V1', N'1', N'',  '2026-07-01 10:05', N'' ) 
Go 

-- Export SY_FmtFldTbl , Rows = 22
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'UserAutoID' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'UserAutoID', null, N'UserAutoID', N'UserAutoID', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'UserCreate' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'UserCreate', null, N'Người tạo', N'Creator', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'UserUpdate' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'UserUpdate', null, N'Người sửa', N'Editor', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'DateCreate' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'DT', N'DateCreate', null, N'Ngày tạo', N'开始日期', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'DateUpdate' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'DT', N'DateUpdate', null, N'Ngày sửa', N'编辑日期', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'PeriodID' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'PeriodID', null, N'Kỳ', N'Kỳ', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'Notes' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'Notes', null, N'Ghi chú', N'型号', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'DocumentID' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'DocumentID', null, N'Số chứng từ', N'Số chứng từ', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'DocumentDate' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'D', N'DocumentDate', null, N'Ngày', N'Ngày chứng từ', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'GhiChu' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'GhiChu', null, N'Ghi chú', N'GhiChu', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'LoaiBaoHiem' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'LoaiBaoHiem', null, N'Loại bảo hiểm', N'LoaiBaoHiem', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'PersonID' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'PersonID', null, N'Mã nhân viên', N'PersonID', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'BranchID' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'BranchID', null, N'Chi nhánh', N'BranchID', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDong' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'MucDong', null, N'Mức đóng', N'Mức đóng', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHXHNLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'MucDongBHXHNLD', null, N'MucDongBHXHNLD', N'MucDongBHXHNLD', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHXHNSDLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'MucDongBHXHNSDLD', null, N'BHXH Công ty đóng', N'SI Company', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHYTNLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'MucDongBHYTNLD', null, N'BHYT Người lao động', N'HI Employee', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHYTNSDLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'MucDongBHYTNSDLD', null, N'BHYT Công ty đóng', N'HI Company', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHTNNLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'MucDongBHTNNLD', null, N'BHTN Người lao động', N'UI Employee', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'MucDongBHTNNSDLD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( null, N'MucDongBHTNNSDLD', null, N'BHTN Công ty đóng', N'UI Company', null ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'IsNVMoi' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'IsNVMoi', null, N'NVMoiThamGiaBH', N'NVMoiThamGiaBH', N'' ) 
Go 
if not exists(select * from SY_FmtFldTbl where FieldName = N'LoaiHD' ) 
Insert into [SY_FmtFldTbl] ([FormatID], [FieldName], [FormName], [CaptionVN], [CaptionEN], [AlignX] )  
Values( N'', N'LoaiHD', null, N'Đội ngũ', N'LoaiHD', N'' ) 
Go 

-- =========================================================================
-- 10. ĐỒNG BỘ TRƯỜNG TỪ TABLE VÀO SY_FormatFields
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BaoHiemFrm', @ObjectName = 'HR_BaoHiemTbl';
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'API_BaoHiem_Detail', @ObjectName = 'HR_BaoHiemChiTietTbl'; 
GO

-- =========================================================================
-- 11. CẬP NHẬT THUỘC TÍNH FORM FIELDS (SY_FormatFields) DÀNH RIÊNG CHO WEB
-- =========================================================================
-- Master Form Fields (WA_BaoHiemFrm)
-- Đảm bảo có trường PeriodKeyID (vì nó là cột ảo sinh ra từ API_BaoHiem, không có trong bảng vật lý)
IF NOT EXISTS(SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = 'WA_BaoHiemFrm' AND FieldName = 'PeriodKeyID')
BEGIN
    INSERT INTO dbo.SY_FormatFields (FormName, FieldName, FormatID, FormPosition, ShowInAdd, ShowInEdit, IsRequired, DataSource, OrderNo, CaptionVN, CaptionEN)
    VALUES ('WA_BaoHiemFrm', 'PeriodKeyID', 'sl', 'grid', 1, 1, 1, 'HR_BangThamSoTbl', 4, N'Mã số', 'ID');
END

UPDATE dbo.SY_FormatFields
SET CaptionVN = CASE FieldName
        WHEN 'DocumentID' THEN N'Số chứng từ'
        WHEN 'DocumentDate' THEN N'Ngày lập'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'PeriodID' THEN N'Kỳ'
        WHEN 'LoaiBaoHiem' THEN N'Loại bảo hiểm'
        WHEN 'Notes' THEN N'Ghi chú'
        WHEN 'PeriodKeyID' THEN N'Mã số'
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
    ShowInAdd = CASE WHEN FieldName IN ('DocumentID', 'PeriodKeyID', 'PeriodID', 'DocumentDate', 'LoaiBaoHiem', 'BranchID', 'Notes') THEN 1 ELSE 0 END,
    ShowInEdit = CASE WHEN FieldName IN ('DocumentID', 'PeriodKeyID', 'PeriodID', 'DocumentDate', 'LoaiBaoHiem', 'BranchID', 'Notes') THEN 1 ELSE 0 END,
    IsReadOnlyAdd = CASE WHEN FieldName IN ('PeriodID', 'LoaiBaoHiem') THEN 1 ELSE 0 END,
    IsReadOnlyEdit = CASE WHEN FieldName IN ('DocumentID', 'PeriodID', 'LoaiBaoHiem') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('DocumentID', 'DocumentDate', 'BranchID', 'PeriodKeyID') THEN 1 ELSE 0 END,
    DataSource = CASE 
        WHEN FieldName = 'BranchID' THEN 'CF_BranchListFrm'
        WHEN FieldName = 'PeriodKeyID' THEN 'HR_BangThamSoTbl'
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
        WHEN 'ChucDanhChuyenMon' THEN N'Chức danh chuyên môn'
        WHEN 'BranchID' THEN N'Chi nhánh'
        WHEN 'PhongBan' THEN N'Bộ phận'
        WHEN 'MucDong' THEN N'Mức đóng'
        WHEN 'MucDongBHXHNLD' THEN N'MucDongBHXHNLD'
        WHEN 'MucDongBHXHNSDLD' THEN N'BHXH Công ty đóng'
        WHEN 'MucDongBHYTNLD' THEN N'BHYT Người lao động'
        WHEN 'MucDongBHYTNSDLD' THEN N'BHYT Công ty đóng'
        WHEN 'MucDongBHTNNLD' THEN N'BHTN Người lao động'
        WHEN 'MucDongBHTNNSDLD' THEN N'BHTN Công ty đóng'
        WHEN 'GhiChu' THEN N'Ghi chú'
        WHEN 'IsNVMoi' THEN N'NVMớiThamGiaBH'
        ELSE FieldName
    END,
    ShowInAdd = CASE 
        WHEN FieldName IN ('PersonID', 'PersonName', 'ChucDanhChuyenMon', 'BranchID', 'PhongBan', 'MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD', 'GhiChu', 'IsNVMoi') THEN 1
        ELSE 0
    END,
    ShowInEdit = CASE 
        WHEN FieldName IN ('PersonID', 'PersonName', 'ChucDanhChuyenMon', 'BranchID', 'PhongBan', 'MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD', 'GhiChu', 'IsNVMoi') THEN 1
        ELSE 0
    END,
    FormatID = CASE 
        WHEN FieldName IN ('MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 'n'
        WHEN FieldName = 'PersonID' THEN 'sl'
        WHEN FieldName = 'IsNVMoi' THEN 'cb'
        ELSE 't'
    END,
    FormPosition = 'grid',
    IsReadOnlyEdit = CASE WHEN FieldName IN ('PersonName', 'ChucDanhChuyenMon', 'BranchID', 'PhongBan', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD') THEN 1 ELSE 0 END,
    IsRequired = CASE WHEN FieldName IN ('PersonID', 'MucDong') THEN 1 ELSE 0 END,
    DataSource = CASE WHEN FieldName = 'PersonID' THEN 'HR_PersonTbl' ELSE NULL END,
    OrderNo = CASE FieldName
        WHEN 'PersonID' THEN 1
        WHEN 'PersonName' THEN 2
        WHEN 'ChucDanhChuyenMon' THEN 3
        WHEN 'BranchID' THEN 4
        WHEN 'PhongBan' THEN 5
        WHEN 'MucDong' THEN 6
        WHEN 'MucDongBHXHNLD' THEN 7
        WHEN 'MucDongBHXHNSDLD' THEN 8
        WHEN 'MucDongBHYTNLD' THEN 9
        WHEN 'MucDongBHYTNSDLD' THEN 10
        WHEN 'MucDongBHTNNLD' THEN 11
        WHEN 'MucDongBHTNNSDLD' THEN 12
        WHEN 'GhiChu' THEN 13
        WHEN 'IsNVMoi' THEN 14
        ELSE 99
    END
WHERE FormName = 'API_BaoHiem_Detail';
GO
