USE [QLTiec]
GO

CREATE OR ALTER PROCEDURE [dbo].[API_LuuKhachDen]
    @DocumentID VARCHAR(50) = NULL,
    @Makh VARCHAR(50) = NULL,
    @Tenkh NVARCHAR(200) = NULL,
    @Dienthoai VARCHAR(50) = NULL,
    @Ngaytochuc DATE = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(50) = NULL,
    @Thoigianid VARCHAR(50) = NULL,
    @SobanMan INT = 0,
    @SobanChay INT = 0,
    @Ghichu NVARCHAR(500) = NULL,
    @GoiThucDonID VARCHAR(50) = '',
    @SanhTiec VARCHAR(50) = NULL,
    @JsonSanhTiec NVARCHAR(MAX) = '[]'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @IsNew INT = 0;
    
    -- 1. Sinh mã tự động
    IF @DocumentID IS NULL OR @DocumentID = '' OR @DocumentID = 'TQ-AUTO'
    BEGIN
        SET @DocumentID = 'TQ' + FORMAT(GETDATE(), 'yyMM') + '/' + RIGHT('000' + CAST((ABS(CHECKSUM(NEWID())) % 1000) AS VARCHAR), 3);
        SET @IsNew = 1;
    END

    -- 2. Xử lý thông minh: Nhận diện nếu @Tenkh thực chất là ID khách hàng (KH...) từ Combobox
    IF @Tenkh IS NOT NULL AND @Tenkh <> '' AND (@Makh IS NULL OR @Makh = '')
    BEGIN
        IF EXISTS (SELECT 1 FROM dmkhachhang WHERE Makh = @Tenkh)
        BEGIN
            SET @Makh = @Tenkh;
            SET @Tenkh = NULL;
        END
    END

    -- 3. Xử lý khách hàng (Tạo mới nếu có Tên KH hoặc có Số điện thoại)
    IF (@Makh IS NULL OR @Makh = '') AND ((@Tenkh IS NOT NULL AND @Tenkh <> '') OR (@Dienthoai IS NOT NULL AND @Dienthoai <> ''))
    BEGIN
        IF (@Dienthoai IS NOT NULL AND @Dienthoai <> '')
        BEGIN
            SELECT TOP 1 @Makh = Makh FROM dmkhachhang WHERE Dienthoai = @Dienthoai ORDER BY DateCreate ASC;
        END

        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            SET @Makh = 'KH' + FORMAT(GETDATE(), 'yyMM') + RIGHT('0000' + CAST((ABS(CHECKSUM(NEWID())) % 10000) AS VARCHAR), 4);
            INSERT INTO dmkhachhang (Makh, Tenkh, Dienthoai, IsKhachhang, DateCreate)
            VALUES (@Makh, ISNULL(@Tenkh, N'Khách vãng lai'), @Dienthoai, 1, GETDATE());
        END
        ELSE IF (@Tenkh IS NOT NULL AND @Tenkh <> '')
        BEGIN
            UPDATE dmkhachhang SET Tenkh = ISNULL(NULLIF(@Tenkh, ''), Tenkh) WHERE Makh = @Makh;
        END
    END
    ELSE IF (@Makh IS NOT NULL AND @Makh <> '')
    BEGIN
        UPDATE dmkhachhang SET Tenkh = ISNULL(@Tenkh, Tenkh), Dienthoai = ISNULL(@Dienthoai, Dienthoai) WHERE Makh = @Makh;
    END

    -- 3. Xử lý fallback cho Gói Thực Đơn
    IF ISNULL(@GoiThucDonID, '') = ''
    BEGIN
        SELECT TOP 1 @GoiThucDonID = GoiThucDonID FROM dmGoiThucDon;
    END

    -- 4. Lưu Khách Tham Quan (Insert hoặc Update)
    IF @IsNew = 1
    BEGIN
        INSERT INTO tbmk_Khachthamquan (
            DocumentID, DocumentDate, Makh, Ngaytochuc, Nhamngay, Loaitiecid, Thoigianid, 
            SobanMan, SobanChay, TongsoBan, Ghichu, IsKetthuc, IsHuy, GoiThucDonID
        ) VALUES (
            @DocumentID, GETDATE(), @Makh, @Ngaytochuc, @Nhamngay, @Loaitiecid, @Thoigianid,
            @SobanMan, @SobanChay, (@SobanMan + @SobanChay), @Ghichu, 0, 0, @GoiThucDonID
        );
    END
    ELSE
    BEGIN
        UPDATE tbmk_Khachthamquan SET
            Makh = @Makh, Ngaytochuc = @Ngaytochuc, Nhamngay = @Nhamngay, Loaitiecid = @Loaitiecid,
            Thoigianid = @Thoigianid, SobanMan = @SobanMan, SobanChay = @SobanChay, 
            TongsoBan = (@SobanMan + @SobanChay), Ghichu = @Ghichu, GoiThucDonID = @GoiThucDonID
        WHERE DocumentID = @DocumentID;
    END

    -- 5. Xử lý Sảnh Tiệc (Sử dụng NEWID() để chống trùng mã)
    IF @SanhTiec IS NOT NULL AND @SanhTiec <> ''
    BEGIN
        DELETE FROM tbmk_Khachthamquansanhtiec WHERE DocumentID = @DocumentID;
        
        INSERT INTO tbmk_Khachthamquansanhtiec (DocumentID, Sanhtiecid, UserAutoid)
        VALUES (@DocumentID, @SanhTiec, CAST(NEWID() AS VARCHAR(50)));
    END
    ELSE IF @JsonSanhTiec IS NOT NULL AND @JsonSanhTiec <> '[]'
    BEGIN
        DELETE FROM tbmk_Khachthamquansanhtiec WHERE DocumentID = @DocumentID;
        
        INSERT INTO tbmk_Khachthamquansanhtiec (DocumentID, Sanhtiecid, UserAutoid)
        SELECT @DocumentID, JSON_VALUE(value, '$.Sanhtiecid'), CAST(NEWID() AS VARCHAR(50))
        FROM OPENJSON(@JsonSanhTiec);
    END

    SELECT @DocumentID AS DocumentID;
END
GO
