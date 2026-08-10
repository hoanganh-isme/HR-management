
/*
  Route registration/cutover: backup trước, transaction, idempotent, không DELETE hàng loạt.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ReleaseID varchar(100) = 'HRM_DB_CLEANUP_20260729';
DECLARE @Actor varchar(100) = LEFT(COALESCE(NULLIF(CONVERT(varchar(128), SUSER_SNAME()),''),'PRODUCTION_DATABASE_RELEASE'),100);
DECLARE @MetadataBatchID uniqueidentifier = NEWID();
DECLARE @FieldBatchID uniqueidentifier = NEWID();

DECLARE @Targets table
(
    ApiList varchar(100) NOT NULL,
    Func varchar(20) NOT NULL,
    DesiredProcedure sysname NOT NULL,
    DesiredPara nvarchar(max) NULL,
    KnownOriginalProcedure sysname NULL,
    PRIMARY KEY (ApiList, Func)
);
INSERT INTO @Targets (ApiList, Func, DesiredProcedure, DesiredPara, KnownOriginalProcedure)
VALUES
        (N'API_BangThueTNCN_V2', N'Execute', N'API_BangThueTNCN_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_BaoHiem_Detail', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_BaoHiem_Detail', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_BaoHiem_Detail', N'View', N'API_BaoHiem_Detail', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_CaLamViec', N'Execute', N'API_CaLamViec', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_CaLamViec_ChiTiet', N'Execute', N'API_CaLamViec_ChiTiet', N'@SapCaID=N''{SapCaID}''', NULL),
        (N'API_CaLamViec_NhanVien', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'API_CaLamViec_NhanVien', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'API_CandidateAttach', N'SaveAvatar', N'API_CandidateAttach_SaveAvatar', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_CandidateAttach', N'View', N'API_TruyVanDong', N'@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'API_ComboPersonStatus', N'Execute', N'API_ComboPersonStatus', N'@Keyword=N''{Keyword}'', @UserName=N''{User}''', NULL),
        (N'API_ComboPersonStatus', N'View', N'API_ComboPersonStatus', N'@Keyword=N''{Keyword}'', @UserName=N''{User}''', NULL),
        (N'API_DanhSachChucDanh', N'Execute', N'API_DanhSachChucDanh', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_DanhSachChucDanh', N'View', N'API_DanhSachChucDanh', N'@Keyword=''{Keyword}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'Save', N'API_HopDongLaoDong_Attach_Save', N'@Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'View', N'API_HopDongLaoDong_Attach', N'@MaHopDong=N''{MaHopDong}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'View', N'API_HopDongLaoDong_ChiTiet', N'@MaHopDong=N''{MaHopDong}''', NULL),
        (N'API_HopDongLaoDong_LoaiHD', N'View', N'API_HopDongLaoDong_LoaiHD', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_HopDongLaoDong_NamLap', N'View', N'API_HopDongLaoDong_NamLap', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_HR_Dashboard_Birthdays', N'Execute', N'API_HR_Dashboard_Birthdays', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_ContractsExpiring', N'Execute', N'API_HR_Dashboard_ContractsExpiring', N'@Days=N''{Days}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Demographics', N'Execute', N'API_HR_Dashboard_Demographics', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Department', N'Execute', N'API_HR_Dashboard_Department', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_GetBranches', N'Execute', N'API_HR_Dashboard_GetBranches', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_OverviewToday', N'Execute', N'API_HR_Dashboard_OverviewToday', N'@Date=N''{Date}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Payroll', N'Execute', N'API_HR_Dashboard_Payroll', N'@PeriodID=N''{PeriodID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'Save', N'API_LuuDong', N'@List=N''API_HR_NghiPhep_Attach'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'View', N'API_HR_NghiPhep_Attach', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_HR_NghiPhep_Attach_Save', N'Execute', N'API_HR_NghiPhep_Attach_Save', N'@Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'Save', N'API_LuuDong', N'@List=N''API_HR_NghiPhep_ChiTiet'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'View', N'API_HR_NghiPhep_ChiTiet', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_LayCacTruongGiaoDien', N'Execute', N'API_LayCacTruongGiaoDien', N'@FormName=N''{List}''', NULL),
        (N'API_LayDanhSachMenuTatCa', N'Execute', N'API_LayDanhSachMenuTatCa', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}''', NULL),
        (N'API_LayDanhSachNhom', N'Execute', N'API_LayDanhSachNhom', N'', NULL),
        (N'API_LayGiaTriSetup', N'Execute', N'API_LayGiaTriSetup', N'', NULL),
        (N'API_LayMenuTheoNhomQuyen', N'Execute', N'API_LayMenuTheoNhomQuyen', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}''', NULL),
        (N'API_LayPhienBanQuyen', N'Execute', N'API_LayPhienBanQuyen', N'', NULL),
        (N'API_LayQuyenCuaToi', N'Execute', N'API_LayQuyenCuaToi', N'@Username=N''{User}''', NULL),
        (N'API_LayQuyenNhomDayDu', N'Execute', N'API_LayQuyenNhomDayDu', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}''', NULL),
        (N'API_SaoChepQuyenNhom', N'Execute', N'API_SaoChepQuyenNhom', N'@UserName=N''{UserName}'', @SourceUserGroupID=N''{SourceUserGroupID}'', @TargetUserGroupID=N''{TargetUserGroupID}''', NULL),
        (N'API_LuuDong_V2', N'Execute', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_LuuMenu', N'Execute', N'API_LuuMenu', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @MenuID=N''{MenuID}'', @OldMenuID=N''{OldMenuID}'', @ParentID=N''{ParentID}'', @Label=N''{Label}'', @EN=N''{EN}'', @SubTitle=N''{SubTitle}'', @FormName=N''{FormName}'', @FormKey=N''{FormKey}'', @URLPara=N''{URLPara}'', @Icon=N''{Icon}'', @IsDisable=N''{IsDisable}'', @IsEdit=N''{IsEdit}'', @TableName=N''{TableName}'', @PrimaryKey=N''{PrimaryKey}'', @AllowHardDelete=N''{AllowHardDelete}''', NULL),
        (N'API_LuuQuyenCuaNhom', N'Execute', N'API_LuuQuyenCuaNhom', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}'', @MenuID=N''{MenuID}'', @IsRun=N''{IsRun}'', @IsAdd=N''{IsAdd}'', @IsUpdate=N''{IsUpdate}'', @IsDelete=N''{IsDelete}'', @isManager=N''{isManager}'', @isAdmin=N''{isAdmin}'', @isAutoLock=N''{isAutoLock}'', @isHideAmount=N''{isHideAmount}'', @isLockDoc=N''{isLockDoc}'', @isUnLockDoc=N''{isUnLockDoc}'', @isExportExcel=N''{isExportExcel}''', NULL),
        (N'API_PersonAttach', N'SaveAvatar', N'API_PersonAttach_SaveAvatar', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonAttach', N'View', N'API_TruyVanDong', N'@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T1_Salary', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T1_Salary', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T2_Allowance', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T2_Allowance', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T3_KTKL', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T3_KTKL', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T4_NghiPhep', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T4_NghiPhep', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T5_Relation', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T5_Relation', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T6_HopDong', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T6_HopDong', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T7_CongTac', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T7_CongTac', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T8_Log', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T8_Log', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T9_GiayTo', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T9_GiayTo', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_TruyVanDong_V2', N'Execute', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_CutoverSafeFieldContractsV2', N'Execute', N'API_Web_CutoverSafeFieldContractsV2', N'@WebFormName=N''{FormName}'', @UserName=N''{User}'', @BatchID=N''{BatchID}''', NULL),
        (N'API_Web_DiscoverFieldContractCandidatesV2', N'Execute', N'API_Web_DiscoverFieldContractCandidatesV2', N'', NULL),
        (N'API_Web_FieldContractResolveV2', N'Execute', N'API_Web_FieldContractResolveV2', N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_FieldContractResolveV2', N'View', N'API_Web_FieldContractResolveV2', N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldCompareV2', N'Execute', N'API_Web_GridFieldCompareV2', N'@WebFormName=N''{WebFormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldCompareV2', N'View', N'API_Web_GridFieldCompareV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldSchemaV2', N'Execute', N'API_Web_GridFieldSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldSchemaV2', N'View', N'API_Web_GridFieldSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_JoinFieldSchemaV2', N'Execute', N'API_Web_JoinFieldSchemaV2', N'@WebFormName=N''{FormName}'', @DetailKey=N''{DetailKey}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_JoinFieldSchemaV2', N'View', N'API_Web_JoinFieldSchemaV2', N'@WebFormName=N''{FormName}'', @DetailKey=N''{DetailKey}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_LookupSchemaV2', N'Execute', N'API_Web_LookupSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=N''{LookupKey}'', @Keyword=N''{Keyword}'', @Page=N''{Page}'', @PageSize=N''{Limit}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_LookupSchemaV2', N'View', N'API_Web_LookupSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=''{LookupKey}'', @Keyword=N''{Keyword}'', @Page={Page}, @PageSize={PageSize}, @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_RollbackFieldContractV2', N'Execute', N'API_Web_RollbackFieldContractV2', N'@WebFormName=N''{FormName}'', @BatchID=N''{BatchID}'', @TargetStatus=N''{TargetStatus}'', @UserName=N''{User}''', NULL),
        (N'API_Web_SeedSafeFieldContractsV2', N'Execute', N'API_Web_SeedSafeFieldContractsV2', N'@UserName=N''{User}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'Execute', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{FormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=N''{MinWidth}'', @MaxWidth=N''{MaxWidth}'', @UserName=N''{User}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'Save', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth={MinWidth}, @MaxWidth={MaxWidth}, @UserName=N''{UserName}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'View', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth={MinWidth}, @MaxWidth={MaxWidth}, @UserName=N''{UserName}''', NULL),
        (N'API_XoaDong_V2', N'Execute', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'CF_BranchListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'CF_BranchListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'CF_BranchListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'HR_Documents', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'HR_Documents', N'Edit', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'HR_Documents', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'HR_HopDongAddfile', N'View', N'API_TruyVanDong', N'@List=N''HR_HopDongAddfile'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_BangCapListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangCapListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangCapListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BangThamSoFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangThamSoFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangThamSoFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BangThueTNCNFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangThueTNCNFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangThueTNCNFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BankListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BankListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BankListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_CaLamViecFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_CaLamViecFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_CaLamViecFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_CaLamViec'),
        (N'WA_CareerlListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_CareerlListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_CareerlListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_ChucDanhFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_ChucDanhFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_ChucDanhFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_DanhSachUngVienFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_DanhSachUngVienFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DepartmentListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_DepartmentListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_DepartmentListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_DonXinNghiPhepF', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepF', N'Save', N'API_LuuDong', N'@List=N''WA_DonXinNghiPhepF'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'Save', N'API_LuuDong', N'@List=N''WA_DonXinNghiPhepFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'View', N'API_HR_NghiPhep', N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_EducationListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_EducationListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_EducationListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_HinhThucNghiListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_HinhThucNghiListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_HopDongLaoDongFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_HopDongLaoDongFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_HopDongLaoDongFrm', N'View', N'API_HopDongLaoDong', N'@Keyword=N''{Keyword}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_HospitalListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_HospitalListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_HospitalListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_HR_NghiPhepFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_HR_NghiPhepFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_JobListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_JobListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_JobListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_KinhPhiCongDoanFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_KinhPhiCongDoanFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_KinhPhiCongDoanFrm', N'View', N'API_KinhPhiCongDoan', N'@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'',@PeriodID=N''{PeriodID}''', NULL),
        (N'WA_LuongKhoanFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_LuongKhoanFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_NationListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_NationListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_NationListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_NguoiDungFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_NguoiDungFrm', N'View', N'API_NguoiDungFrm', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'View', N'API_NguoiDungNhomFrm', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_PeopleListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_PeopleListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_PeopleListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_PersonFullFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_PersonFullFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_PositionListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_PositionListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_PositionListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_ProvinceListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_ProvinceListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_ProvinceListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_QuanLyNghiPhepNamFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_QuanLyNghiPhepNamFrm', N'Save', N'API_LuuDong', N'@List=N''WA_QuanLyNghiPhepNamFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_ShiftListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_ShiftListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_ShiftListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_TitleListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_TitleListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_TitleListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_WorkingGroupListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_WorkingGroupListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_WorkingGroupListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong');

/*
  Chỉ giữ route có caller hiện tại. V2 cho form chỉ được áp dụng với registry đã audit;
  Dashboard gọi direct SQL; procedure quản trị cutover không public qua WA_API.
*/
DELETE FROM @Targets
WHERE ApiList = 'API_BangThueTNCN_V2'
   OR ApiList LIKE 'API_HR_Dashboard[_]%'
   OR ApiList IN
      ('API_Web_CutoverSafeFieldContractsV2','API_Web_DiscoverFieldContractCandidatesV2',
       'API_Web_SeedSafeFieldContractsV2','API_Web_RollbackFieldContractV2');

DELETE FROM @Targets
WHERE DesiredProcedure IN ('API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2')
  AND ApiList NOT IN
      ('WA_BangThueTNCNFrm','WA_ChucDanhFrm','WA_TitleListFrm','WA_ShiftListFrm',
       'WA_CaLamViecFrm','CF_BranchListFrm','API_CaLamViec_NhanVien',
       'API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2');

/* Kinh phí công đoàn giữ business View và mutation legacy cho đến khi contract được audit riêng. */
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Save')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Save','API_LuuDong',
         N'@List=N''WA_KinhPhiCongDoanFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Delete')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Delete','API_XoaDong',
         N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    GROUP BY T.ApiList, T.Func
    HAVING COUNT(*) > 1
)
    THROW 56300, N'RELEASE_ROUTE_DUPLICATE', 1;

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    WHERE OBJECT_ID(N'dbo.' + T.DesiredProcedure, N'P') IS NULL
)
    THROW 56301, N'RELEASE_ROUTE_PROCEDURE_MISSING', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) NOT IN
        (T.DesiredProcedure, ISNULL(T.KnownOriginalProcedure,T.DesiredProcedure))
)
    THROW 56302, N'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED', 1;

BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO dbo.WA_FieldContractRouteBackup
    (
        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
        [SQL], Para, BackupTime, BackupUser
    )
    SELECT
        @MetadataBatchID, T.ApiList, T.ApiList, T.Func,
        CASE WHEN A.[list] IS NULL THEN 0 ELSE 1 END,
        A.[SQL], A.Para, SYSUTCDATETIME(), @Actor
    FROM @Targets AS T
    LEFT JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE A.[list] IS NULL
       OR PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    UPDATE A
    SET [SQL] = T.DesiredProcedure, Para = T.DesiredPara
    FROM dbo.WA_API AS A
    INNER JOIN @Targets AS T ON T.ApiList = A.[list] AND T.Func = A.[func]
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    INSERT INTO dbo.WA_API ([list],[func],[SQL],Para)
    SELECT T.ApiList,T.Func,T.DesiredProcedure,T.DesiredPara
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.WA_API AS A
        WHERE A.[list] = T.ApiList AND A.[func] = T.Func
    );

    EXEC dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName = NULL,
        @UserName = @Actor,
        @BatchID = @FieldBatchID OUTPUT;

    IF EXISTS (SELECT 1 FROM dbo.WA_DatabaseReleaseHistory WHERE ReleaseID = @ReleaseID)
        UPDATE dbo.WA_DatabaseReleaseHistory
        SET InstalledAt = SYSUTCDATETIME(), InstalledBy = @Actor,
            ReleaseMode = '$(ReleaseMode)', MetadataRouteBatchID = @MetadataBatchID,
            FieldRouteBatchID = @FieldBatchID, Status = 'INSTALLED',
            ManifestSha256 = 'PENDING_BUILD_MANIFEST',
            RolledBackAt = NULL, RolledBackBy = NULL
        WHERE ReleaseID = @ReleaseID;
    ELSE
        INSERT INTO dbo.WA_DatabaseReleaseHistory
        (
            ReleaseID,InstalledAt,InstalledBy,ReleaseMode,MetadataRouteBatchID,
            FieldRouteBatchID,Status,ManifestSha256
        )
        VALUES
        (
            @ReleaseID,SYSUTCDATETIME(),@Actor,'$(ReleaseMode)',@MetadataBatchID,
            @FieldBatchID,'INSTALLED','PENDING_BUILD_MANIFEST'
        );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
