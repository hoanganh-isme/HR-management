CREATE OR ALTER PROCEDURE [dbo].[API_LuuQuyenToan]
    @DocumentID VARCHAR(50) = NULL,
    @DocumentDate DATETIME = NULL,
    @Sohopdong VARCHAR(50) = NULL,
    @Nguoinop NVARCHAR(100) = NULL,
    @Tongtiencoc DECIMAL(18,2) = 0,
    @TongtienHoaDon DECIMAL(18,2) = 0,
    @Thanhtoan DECIMAL(18,2) = 0,
    @Conlai DECIMAL(18,2) = 0,
    @IsKetthuc BIT = 0,
    @Ghichu NVARCHAR(500) = NULL,

    -- Các tham số hệ thống mặc định
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự sinh mã Quyết toán nếu tạo mới
    IF @DocumentID IS NULL OR @DocumentID = ''
    BEGIN
        SET @DocumentID = 'QT' + FORMAT(GETDATE(), 'yyMMddHHmmss');
        
        INSERT INTO tbmk_Phieuthu (
            DocumentID, DocumentDate, SPthu, Ngaythu, Sohopdong, Nguoinop, Manv, 
            Tongtiencoc, TongtienHoaDon, Thanhtoan, Conlai, IsKetthuc, Ghichu, 
            UserCreate, DateCreate
        )
        VALUES (
            @DocumentID, ISNULL(@DocumentDate, GETDATE()), @DocumentID, ISNULL(@DocumentDate, GETDATE()), @Sohopdong, @Nguoinop, @User,
            @Tongtiencoc, @TongtienHoaDon, @Thanhtoan, @Conlai, @IsKetthuc, @Ghichu,
            @User, GETDATE()
        );
    END
    ELSE
    BEGIN
        UPDATE tbmk_Phieuthu
        SET DocumentDate = ISNULL(@DocumentDate, DocumentDate),
            Ngaythu = ISNULL(@DocumentDate, Ngaythu),
            Sohopdong = ISNULL(@Sohopdong, Sohopdong),
            Nguoinop = ISNULL(@Nguoinop, Nguoinop),
            Tongtiencoc = ISNULL(@Tongtiencoc, Tongtiencoc),
            TongtienHoaDon = ISNULL(@TongtienHoaDon, TongtienHoaDon),
            Thanhtoan = ISNULL(@Thanhtoan, Thanhtoan),
            Conlai = ISNULL(@Conlai, Conlai),
            IsKetthuc = ISNULL(@IsKetthuc, IsKetthuc),
            Ghichu = ISNULL(@Ghichu, Ghichu),
            UserUpdate = @User,
            DateUpdate = GETDATE()
        WHERE DocumentID = @DocumentID;
    END

    -- Tự động cập nhật trạng thái của Hợp đồng nếu phiếu thu báo kết thúc
    IF @IsKetthuc = 1 AND @Sohopdong IS NOT NULL
    BEGIN
        UPDATE tbmk_Hopdong 
        SET IsKetthuc = 1, Conlai = @Conlai
        WHERE Sohopdong = @Sohopdong;
    END

    -- Trả về dữ liệu vừa lưu để Grid cập nhật lại
    SELECT * FROM tbmk_Phieuthu WHERE DocumentID = @DocumentID;
END
GO
