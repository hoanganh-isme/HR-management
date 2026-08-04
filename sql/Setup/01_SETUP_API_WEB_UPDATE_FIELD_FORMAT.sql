/*
  ==============================================================================
  SETUP SCRIPT ĐỒNG BỘ TIÊU ĐỀ & ĐỊNH DẠNG CỘT (FIELD FORMAT SYNC V2 SETUP)
  Chạy duy nhất script này trên CSDL SQL Server để cài đặt Stored Procedure
  và đăng ký vào bảng WA_API.
  ==============================================================================
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Tạo hoặc Cập nhật Stored Procedure API_Web_UpdateFieldFormat
IF OBJECT_ID(N'dbo.API_Web_UpdateFieldFormat', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_UpdateFieldFormat AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_UpdateFieldFormat
    @WebFormName varchar(100) = NULL,
    @FieldName varchar(128),
    @CaptionVN nvarchar(250) = NULL,
    @CaptionEN nvarchar(250) = NULL,
    @CaptionCH nvarchar(250) = NULL,
    @FormatID varchar(50) = NULL,
    @AlignX varchar(10) = NULL,
    @MinWidth int = 0,
    @MaxWidth int = 0,
    @UserName varchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        SET @WebFormName = LEFT(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), 100);
        SET @FieldName = LEFT(LTRIM(RTRIM(ISNULL(@FieldName, ''))), 128);
        SET @CaptionVN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionVN, ''))), 250);
        SET @CaptionEN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionEN, ''))), 250);
        SET @CaptionCH = LEFT(LTRIM(RTRIM(ISNULL(@CaptionCH, ''))), 250);
        SET @FormatID = LEFT(LTRIM(RTRIM(ISNULL(@FormatID, ''))), 50);
        
        DECLARE @RawAlign varchar(10) = LTRIM(RTRIM(ISNULL(@AlignX, '')));
        IF LOWER(@RawAlign) IN ('right', 'r', 'phải') SET @AlignX = 'R';
        ELSE IF LOWER(@RawAlign) IN ('left', 'l', 'trái') SET @AlignX = 'L';
        ELSE IF LOWER(@RawAlign) IN ('center', 'c', 'giữa') SET @AlignX = 'C';
        ELSE SET @AlignX = LEFT(@RawAlign, 10);

        SET @MinWidth = ISNULL(@MinWidth, 0);
        SET @MaxWidth = ISNULL(@MaxWidth, 0);

        IF @FieldName = ''
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'Tên trường (FieldName) không được để trống.' AS Message;
            RETURN;
        END;

        -- 1. Cập nhật tất cả bản ghi hiện có của FieldName (Bao gồm bản ghi Global và FormName riêng)
        IF EXISTS (
            SELECT 1 
            FROM dbo.SY_FmtFldTbl 
            WHERE LOWER(FieldName) = LOWER(@FieldName)
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName);
        END
        ELSE
        BEGIN
            -- 2. Nếu trường này chưa từng có trong SY_FmtFldTbl, tạo mới bản ghi GLOBAL (FormName = NULL)
            INSERT INTO dbo.SY_FmtFldTbl (
                FormName, FieldName, CaptionVN, CaptionEN, CaptionCH, FormatID, AlignX, MinWidth, MaxWidth
            )
            VALUES (
                NULL, @FieldName, @CaptionVN, @CaptionEN, @CaptionCH, @FormatID, @AlignX, @MinWidth, @MaxWidth
            );
        END;

        SELECT 
            CAST(1 AS bit) AS Success,
            N'Đã cập nhật tiêu đề và định dạng cột thành công.' AS Message,
            @FieldName AS FieldName,
            @CaptionVN AS CaptionVN,
            @CaptionEN AS CaptionEN,
            @CaptionCH AS CaptionCH,
            @FormatID AS FormatID,
            @AlignX AS AlignX,
            @MinWidth AS MinWidth,
            @MaxWidth AS MaxWidth;
    END TRY
    BEGIN CATCH
        SELECT 
            CAST(0 AS bit) AS Success,
            ERROR_MESSAGE() AS Message,
            @FieldName AS FieldName;
    END CATCH;
END;
GO

-- 2. Đăng ký API vào WA_API (func = 'View' và func = 'Save')
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

-- 3. Chuẩn hóa an toàn các bản ghi đơn lẻ về GLOBAL (FormName = NULL) mà không vi phạm UNIQUE KEY IX_SY_FormatFields
UPDATE F
SET FormName = NULL
FROM dbo.SY_FmtFldTbl AS F
WHERE F.FormName IS NOT NULL 
  AND LTRIM(RTRIM(F.FormName)) <> ''
  AND NOT EXISTS (
      SELECT 1 
      FROM dbo.SY_FmtFldTbl AS G 
      WHERE LOWER(G.FieldName) = LOWER(F.FieldName) 
        AND (G.FormName IS NULL OR LTRIM(RTRIM(G.FormName)) = '')
  );
GO

PRINT N'✅ Đã khởi tạo thành công SP API_Web_UpdateFieldFormat (Global Mode) và đăng ký đầy đủ vào WA_API!';
GO
