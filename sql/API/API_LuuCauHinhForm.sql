IF OBJECT_ID('API_LuuCauHinhForm', 'P') IS NOT NULL
    DROP PROCEDURE API_LuuCauHinhForm;
GO

CREATE PROCEDURE API_LuuCauHinhForm
    @FormID varchar(50),
    @CaptionVN nvarchar(200) = NULL,
    @SubTitle nvarchar(200) = NULL,
    @PrimaryKey varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem FormID đã tồn tại trong SY_FrmLstTbl chưa
    IF EXISTS (SELECT 1 FROM SY_FrmLstTbl WHERE FormID = @FormID)
    BEGIN
        -- Cập nhật thông tin cấu hình chung của Form
        UPDATE SY_FrmLstTbl
        SET 
            CaptionVN = ISNULL(@CaptionVN, CaptionVN),
            SubTitle = ISNULL(@SubTitle, SubTitle),
            PrimaryKey = ISNULL(@PrimaryKey, PrimaryKey)
        WHERE FormID = @FormID;
    END
    ELSE
    BEGIN
        -- Nếu là Form mới, tạo dòng mới
        INSERT INTO SY_FrmLstTbl (FormID, CaptionVN, SubTitle, PrimaryKey)
        VALUES (@FormID, @CaptionVN, @SubTitle, @PrimaryKey);
    END

    -- Trả về dữ liệu vừa lưu
    SELECT FormID, CaptionVN, SubTitle, PrimaryKey
    FROM SY_FrmLstTbl 
    WHERE FormID = @FormID;
END
GO
