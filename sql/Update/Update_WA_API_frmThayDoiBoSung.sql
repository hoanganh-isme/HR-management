USE [QLTiec]
GO

-- Cập nhật lại WA_API cho frmThayDoiBoSung theo đúng chuẩn tách biệt SQL và Param
UPDATE WA_API
SET 
    SQL = 'API_TruyVanDong',
    Para = '@List=N''frmThayDoiBoSung'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
WHERE list = 'frmThayDoiBoSung' AND func = 'View';

UPDATE WA_API
SET 
    SQL = 'API_LuuTruongGiaoDien',
    Para = '@FormName=N''frmThayDoiBoSung'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @FormatID=N''{FormatID}'', @CaptionEN=N''{CaptionEN}'', @DataSource=N''{DataSource}'', @IsRequired=N''{IsRequired}'', @FormPosition=N''{FormPosition}'', @ShowInAdd=N''{ShowInAdd}'', @ShowInEdit=N''{ShowInEdit}'', @IsReadOnlyEdit=N''{IsReadOnlyEdit}'', @IsReadOnlyAdd=N''{IsReadOnlyAdd}'', @ValidateRule=N''{ValidateRule}'', @DependsOn=N''{DependsOn}'', @VisibleRule=N''{VisibleRule}'', @OrderNo=N''{OrderNo}'', @ShowInFilter=N''{ShowInFilter}'', @NoResult=N''{NoResult}'''
WHERE list = 'frmThayDoiBoSung' AND func = 'Save';

UPDATE WA_API
SET 
    SQL = 'API_XoaDong',
    Para = '@List=N''frmThayDoiBoSung'', @Ids=N''{Ids}'', @UserName=N''{UserName}'''
WHERE list = 'frmThayDoiBoSung' AND func = 'Delete';
GO
