/*
  Đăng ký Stored Procedure API_Web_UpdateFieldFormat vào WA_API
  cho phép API_Gateway_Router định tuyến và thực thi việc cập nhật tiêu đề / định dạng cột SY_FmtFldTbl
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Đăng ký cho func = 'View'
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_Web_UpdateFieldFormat' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'API_Web_UpdateFieldFormat', 
        'View', 
        'API_Web_UpdateFieldFormat', 
        '@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=''{MinWidth}'', @MaxWidth=''{MaxWidth}'', @UserName=N''{UserName}'''
    );
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_Web_UpdateFieldFormat',
        Para = '@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=''{MinWidth}'', @MaxWidth=''{MaxWidth}'', @UserName=N''{UserName}'''
    WHERE list = 'API_Web_UpdateFieldFormat' AND func = 'View';
END;
GO

-- 2. Đăng ký cho func = 'Save'
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_Web_UpdateFieldFormat' AND func = 'Save')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'API_Web_UpdateFieldFormat', 
        'Save', 
        'API_Web_UpdateFieldFormat', 
        '@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=''{MinWidth}'', @MaxWidth=''{MaxWidth}'', @UserName=N''{UserName}'''
    );
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_Web_UpdateFieldFormat',
        Para = '@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=''{MinWidth}'', @MaxWidth=''{MaxWidth}'', @UserName=N''{UserName}'''
    WHERE list = 'API_Web_UpdateFieldFormat' AND func = 'Save';
END;
GO

PRINT N'Đã hoàn tất đăng ký API_Web_UpdateFieldFormat vào WA_API cho cả View và Save!';
GO
