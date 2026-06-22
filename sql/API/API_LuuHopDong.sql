USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-19
-- Description: API Lưu (Thêm/Sửa) Hợp Đồng Tiệc Cưới (LoaiPhieu = 2)
-- =============================================
CREATE PROCEDURE [dbo].[API_LuuHopDong]
    @Sohopdong VARCHAR(50) = NULL OUTPUT, -- Nếu NULL: Thêm mới HĐ, Ngược lại: Cập nhật
    @Sobiennhan VARCHAR(20) = NULL,       -- ID Biên nhận cọc chỗ
    
    -- Thông tin Khách hàng (Tạo mới hoặc cập nhật nếu có)
    @Makh VARCHAR(20) = NULL OUTPUT,
    @Tenchure NVARCHAR(255) = NULL,
    @Tencodau NVARCHAR(255) = NULL,
    @Dienthoai NVARCHAR(50) = NULL,
    @Diachi NVARCHAR(500) = NULL,
    @Mail NVARCHAR(100) = NULL,
    
    -- Thông tin Hợp đồng Tiệc
    @Ngayhopdong DATETIME = NULL,
    @Ngaytochuc DATETIME = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(10) = NULL,
    @Thoigianid VARCHAR(20) = NULL,      -- Ca tiệc
    
    @SobanManchinhthuc INT = 0,
    @SobanManduphong INT = 0,
    @SobanChaychinhthuc INT = 0,
    @SobanChayduphong INT = 0,
    @TongSoBan DECIMAL(18,2) = 0,
    
    @Tongtienhopdong DECIMAL(18,2) = 0,
    @Sotiencoccho DECIMAL(18,2) = 0,
    @Sotiencochopdong DECIMAL(18,2) = 0,
    @Tongtiencoc DECIMAL(18,2) = 0,
    
    @Ghichu NVARCHAR(1000) = NULL,
    @Manv VARCHAR(20) = NULL,
    @UserCreate VARCHAR(20) = 'System',
    
    -- Danh sách Sảnh đặt (Dạng JSON: [{"Sanhtiecid":"S01", "IsSanhchinh": 1}, ...])
    @JsonSanhTiec NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Now DATETIME = GETDATE();

        -- ==========================================================
        -- 0. KIỂM TRA TRÙNG LỊCH SẢNH (CONFLICT VALIDATION)
        -- ==========================================================
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            IF EXISTS (
                -- Kiểm tra trùng với Hợp đồng khác
                SELECT 1 
                FROM tbmk_Hopdong h
                INNER JOIN tbmk_Hopdongsanhtiec hs ON h.Sohopdong = hs.Sohopdong
                INNER JOIN OPENJSON(@JsonSanhTiec) j ON hs.Sanhtiecid = JSON_VALUE(j.value, '$.Sanhtiecid')
                WHERE h.Ngaytochuc = @Ngaytochuc 
                  AND h.Thoigianid = @Thoigianid
                  AND ISNULL(h.IsHuy, 0) = 0
                  AND h.Sohopdong != ISNULL(@Sohopdong, '')
                  
                UNION ALL
                
                -- Kiểm tra trùng với Cọc chỗ khác (chưa lên Hợp đồng)
                SELECT 1 
                FROM tbmk_Biennhancoccho b
                INNER JOIN tbmk_Biennhancocchosanhtiec bs ON b.DocumentID = bs.DocumentID
                INNER JOIN OPENJSON(@JsonSanhTiec) j ON bs.Sanhtiecid = JSON_VALUE(j.value, '$.Sanhtiecid')
                WHERE b.Ngaytochuc = @Ngaytochuc 
                  AND b.Thoigianid = @Thoigianid
                  AND ISNULL(b.IsHuy, 0) = 0
                  AND ISNULL(b.IsKetthuc, 0) = 0
                  AND b.DocumentID != ISNULL(@Sobiennhan, '')
            )
            BEGIN
                ROLLBACK TRANSACTION;
                SELECT 0 AS [Success], N'Lỗi: Sảnh bạn chọn đã được đặt hoặc cọc trước đó trong ca tiệc này. Vui lòng kiểm tra lại!' AS [Message], NULL AS [Sohopdong], NULL AS [Makh];
                RETURN;
            END
        END

        -- ==========================================================
        -- 1. XỬ LÝ KHÁCH HÀNG (dmkhachhang)
        -- ==========================================================
        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            -- Tìm khách hàng đã có theo SĐT trước (tránh tạo duplicate)
            IF (@Dienthoai IS NOT NULL AND @Dienthoai <> '')
            BEGIN
                SELECT TOP 1 @Makh = Makh
                FROM dmkhachhang
                WHERE Dienthoai = @Dienthoai
                  AND ISNULL(IsKhachhang, 0) = 1
                ORDER BY DateCreate ASC;  -- Lấy record cũ nhất (gốc)
            END

            -- Không tìm thấy → tạo mới
            IF (@Makh IS NULL OR @Makh = '')
            BEGIN
                SET @Makh = 'KH' + FORMAT(@Now, 'yyMMddHHmmss');

                INSERT INTO dmkhachhang (
                    Makh, Tenkh, Tenchure, Tencodau, Dienthoai, Diachi, Mail, 
                    IsKhachhang, DateCreate, UserCreate
                )
                VALUES (
                    @Makh, 
                    CASE 
                        WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                        ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                    END, 
                    @Tenchure, @Tencodau, @Dienthoai, @Diachi, @Mail, 
                    1, @Now, @UserCreate
                );
            END
            ELSE
            BEGIN
                -- Tìm thấy khách cũ → cập nhật thông tin nếu có thay đổi
                UPDATE dmkhachhang
                SET
                    Tenchure    = ISNULL(NULLIF(@Tenchure, ''), Tenchure),
                    Tencodau    = ISNULL(NULLIF(@Tencodau, ''), Tencodau),
                    Diachi      = ISNULL(NULLIF(@Diachi,   ''), Diachi),
                    Mail        = ISNULL(NULLIF(@Mail,     ''), Mail),
                    DateUpdate  = @Now,
                    UserUpdate  = @UserCreate
                WHERE Makh = @Makh;
            END
        END
        ELSE
        BEGIN
            UPDATE dmkhachhang
            SET 
                Tenkh = CASE 
                            WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                            ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                        END,
                Tenchure = @Tenchure,
                Tencodau = @Tencodau,
                Dienthoai = @Dienthoai,
                Diachi = @Diachi,
                Mail = @Mail,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Makh = @Makh;
        END

        -- ==========================================================
        -- 2. XỬ LÝ HỢP ĐỒNG (tbmk_Hopdong)
        -- ==========================================================
        IF (@Sohopdong IS NULL OR @Sohopdong = '')
        BEGIN
            -- Phát sinh mã Hợp Đồng (Max 20 chars)
            SET @Sohopdong = 'HD' + FORMAT(@Now, 'yyMMddHHmmss');

            INSERT INTO tbmk_Hopdong (
                Sohopdong, Sobiennhan, Ngayhopdong, Ngaytochuc, Nhamngay, Makh, Loaitiecid, Thoigianid,
                SobanManchinhthuc, SobanManduphong, SobanChaychinhthuc, SobanChayduphong, TongSoBan,
                Tongtienhopdong, Sotiencoccho, Sotiencochopdong, Tongtiencoc,
                Manv, Ghichu, IsHuy, IsKetthuc, DateCreate, UserCreate, GoiThucDonID
            )
            VALUES (
                @Sohopdong, @Sobiennhan, ISNULL(@Ngayhopdong, @Now), @Ngaytochuc, @Nhamngay, @Makh, @Loaitiecid, @Thoigianid,
                @SobanManchinhthuc, @SobanManduphong, @SobanChaychinhthuc, @SobanChayduphong, @TongSoBan,
                @Tongtienhopdong, @Sotiencoccho, @Sotiencochopdong, @Tongtiencoc,
                @Manv, @Ghichu, 0, 0, @Now, @UserCreate, ''
            );

            -- Cập nhật trạng thái phiếu cọc nếu có truyền Sobiennhan
            IF (@Sobiennhan IS NOT NULL AND @Sobiennhan != '')
            BEGIN
                UPDATE tbmk_Biennhancoccho 
                SET IsKetthuc = 1, DateUpdate = @Now, UserUpdate = @UserCreate
                WHERE DocumentID = @Sobiennhan;
            END
        END
        ELSE
        BEGIN
            -- Cập nhật Hợp Đồng
            UPDATE tbmk_Hopdong
            SET 
                Sobiennhan = @Sobiennhan,
                Makh = @Makh,
                Ngayhopdong = @Ngayhopdong,
                Ngaytochuc = @Ngaytochuc,
                Nhamngay = @Nhamngay,
                Loaitiecid = @Loaitiecid,
                Thoigianid = @Thoigianid,
                SobanManchinhthuc = @SobanManchinhthuc,
                SobanManduphong = @SobanManduphong,
                SobanChaychinhthuc = @SobanChaychinhthuc,
                SobanChayduphong = @SobanChayduphong,
                TongSoBan = @TongSoBan,
                Tongtienhopdong = @Tongtienhopdong,
                Sotiencoccho = @Sotiencoccho,
                Sotiencochopdong = @Sotiencochopdong,
                Tongtiencoc = @Tongtiencoc,
                Ghichu = @Ghichu,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Sohopdong = @Sohopdong;
        END

        -- ==========================================================
        -- 3. XỬ LÝ CHI TIẾT SẢNH TIỆC (tbmk_Hopdongsanhtiec)
        -- ==========================================================
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            -- Xóa sảnh cũ
            DELETE FROM tbmk_Hopdongsanhtiec WHERE Sohopdong = @Sohopdong;

            -- Insert sảnh mới từ JSON
            INSERT INTO tbmk_Hopdongsanhtiec (
                UserAutoid, Sohopdong, Sanhtiecid, IsSanhchinh, 
                DateCreate, UserCreate
            )
            SELECT 
                NEWID(), 
                @Sohopdong, 
                JSON_VALUE(value, '$.Sanhtiecid'),
                ISNULL(CAST(JSON_VALUE(value, '$.IsSanhchinh') AS BIT), 0),
                @Now,
                @UserCreate
            FROM OPENJSON(@JsonSanhTiec);
        END

        COMMIT TRANSACTION;
        
        -- Trả về kết quả
        SELECT 1 AS [Success], N'Lưu Hợp đồng Tiệc Cưới thành công' AS [Message], @Sohopdong AS [Sohopdong], @Makh AS [Makh];
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 0 AS [Success], ERROR_MESSAGE() AS [Message], NULL AS [Sohopdong], NULL AS [Makh];
    END CATCH
END
GO
