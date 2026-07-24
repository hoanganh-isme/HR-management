/*
  Procedure cập nhật tiêu đề và định dạng cột vào SY_FmtFldTbl
  Hỗ trợ cập nhật CaptionVN, CaptionEN, CaptionCH, FormatID, AlignX, MinWidth, MaxWidth
  Bao bọc TRY...CATCH chống crash IIS socket và cắt chuỗi an toàn với LEFT(...) tránh lỗi String or binary data would be truncated.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

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
        
        -- Chuẩn hóa AlignX về dạng R / L / C hoặc cắt max 10 ký tự
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

        -- 1. Ưu tiên UPDATE nếu tồn tại bản ghi khớp cả FormName lẫn FieldName
        IF EXISTS (
            SELECT 1 
            FROM dbo.SY_FmtFldTbl 
            WHERE LOWER(FieldName) = LOWER(@FieldName) 
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName)
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
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName);
        END
        -- 2. Ngược lại UPDATE nếu tồn tại bản ghi chung (FormName IS NULL hoặc rỗng)
        ELSE IF EXISTS (
            SELECT 1 
            FROM dbo.SY_FmtFldTbl 
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '')
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
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '');
        END
        -- 3. Cập nhật bất kỳ bản ghi nào theo FieldName
        ELSE IF EXISTS (
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
        -- 4. Nếu chưa từng có, INSERT bản ghi mới
        ELSE
        BEGIN
            INSERT INTO dbo.SY_FmtFldTbl (
                FormName, FieldName, CaptionVN, CaptionEN, CaptionCH, FormatID, AlignX, MinWidth, MaxWidth
            )
            VALUES (
                NULLIF(@WebFormName, ''), @FieldName, @CaptionVN, @CaptionEN, @CaptionCH, @FormatID, @AlignX, @MinWidth, @MaxWidth
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
