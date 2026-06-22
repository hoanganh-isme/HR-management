USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Antigravity
-- Create date: 2026-04-29
-- Description: API Lưu (Thêm/Sửa) Biên nhận cọc chỗ (Cọc lần 1 & Lần 2)
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[API_LuuPhieuCoc]
    @DocumentID VARCHAR(50) = NULL OUTPUT, -- Nếu NULL: Thêm mới, Ngược lại: Cập nhật
    -- Thông tin Khách hàng
    @Makh VARCHAR(50) = NULL OUTPUT, -- Nếu NULL: Tạo khách hàng mới
    @Tenchure NVARCHAR(255) = NULL,
    @Tencodau NVARCHAR(255) = NULL,
    @DTchure NVARCHAR(50) = NULL,           -- ĐT riêng chú rể
    @DTcodau NVARCHAR(50) = NULL,           -- ĐT riêng cô dâu
    @Diachi NVARCHAR(500) = NULL,
    @Nguoigd NVARCHAR(100) = NULL,          -- Người đại diện
    @DienThoaiDaiDien NVARCHAR(50) = NULL,  -- ĐT người đại diện
    @Mail NVARCHAR(100) = NULL,
    
    -- Thông tin Phiếu Cọc
    @DocumentDate DATETIME = NULL,
    @Ngaytochuc DATETIME = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(50) = NULL,
    @Thoigianid VARCHAR(50) = NULL, -- Ca tiệc
    @SobanManchinhthuc INT = 0,
    @SobanManduphong INT = 0,
    @SobanChaychinhthuc INT = 0,
    @SobanChayduphong INT = 0,
    @Tongtien DECIMAL(18,2) = 0, -- Số tiền đặt cọc
    @Solan TINYINT = 1, -- 1: Cọc lần 1, 2: Cọc lần 2
    @Ghichu NVARCHAR(500) = NULL,
    @Manv VARCHAR(50) = NULL,
    @UserCreate VARCHAR(50) = 'System',
    
    -- Danh sách Sảnh đặt (Dạng JSON: [{"Sanhtiecid":"S01", "IsSanhchinh": 1}, ...])
    @JsonSanhTiec NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Now DATETIME = GETDATE();
        DECLARE @Tongsoban INT = ISNULL(@SobanManchinhthuc, 0) + ISNULL(@SobanChaychinhthuc, 0);

        -- ==========================================================
        -- 1. XỬ LÝ KHÁCH HÀNG (dmkhachhang)
        -- ==========================================================
        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            -- Tìm khách hàng cũ theo SĐT chú rể hoặc cô dâu (tránh tạo duplicate)
            DECLARE @SdtTimkiem NVARCHAR(50) = ISNULL(NULLIF(@DTchure, ''), @DTcodau);
            IF (@SdtTimkiem IS NOT NULL AND @SdtTimkiem <> '')
            BEGIN
                SELECT TOP 1 @Makh = Makh
                FROM dmkhachhang
                WHERE (Dienthoai = @SdtTimkiem OR DTchure = @SdtTimkiem OR DTcodau = @SdtTimkiem)
                  AND ISNULL(Tenchure, '') = ISNULL(@Tenchure, '') 
                  AND ISNULL(Tencodau, '') = ISNULL(@Tencodau, '')
                ORDER BY DateCreate ASC;  -- Lấy record gốc cũ nhất
            END

            -- Không tìm thấy → tạo mới
            IF (@Makh IS NULL OR @Makh = '')
            BEGIN
                SET @Makh = 'KH' + FORMAT(@Now, 'yyMMddHHmmss');

                INSERT INTO dmkhachhang (
                    Makh, Tenkh, Tenchure, Tencodau, DTchure, DTcodau, Dienthoai, Diachi, Nguoigd, DienThoaiDaiDien, Mail,
                    IsKhachhang, DateCreate, UserCreate
                )
                VALUES (
                    @Makh,
                    CASE
                        WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                        ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '')
                    END,
                    @Tenchure, @Tencodau, @DTchure, @DTcodau, ISNULL(@DTchure, @DTcodau), @Diachi, @Nguoigd, @DienThoaiDaiDien, @Mail,
                    1, @Now, @UserCreate
                );
            END
            ELSE
            BEGIN
                -- Tìm thấy khách cũ → cập nhật thông tin (ghi đè dữ liệu mới nếu có)
                UPDATE dmkhachhang
                SET
                    Tenchure          = ISNULL(NULLIF(@Tenchure, ''),          Tenchure),
                    Tencodau          = ISNULL(NULLIF(@Tencodau, ''),          Tencodau),
                    DTchure           = ISNULL(NULLIF(@DTchure,  ''),          DTchure),
                    DTcodau           = ISNULL(NULLIF(@DTcodau,  ''),          DTcodau),
                    Diachi            = ISNULL(NULLIF(@Diachi,   ''),          Diachi),
                    Mail              = ISNULL(NULLIF(@Mail,     ''),          Mail),
                    Nguoigd           = ISNULL(NULLIF(@Nguoigd,  ''),          Nguoigd),
                    DienThoaiDaiDien  = ISNULL(NULLIF(@DienThoaiDaiDien, ''), DienThoaiDaiDien),
                    DateUpdate        = @Now,
                    UserUpdate        = @UserCreate
                WHERE Makh = @Makh;
            END
        END
        ELSE
        BEGIN
            -- Cập nhật thông tin khách hàng nếu đã tồn tại
            UPDATE dmkhachhang
            SET 
                Tenkh = CASE 
                            WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                            ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                        END,
                Tenchure = @Tenchure,
                Tencodau = @Tencodau,
                DTchure = @DTchure,
                DTcodau = @DTcodau,
                Dienthoai = ISNULL(@DTchure, @DTcodau),
                Diachi = @Diachi,
                Nguoigd = @Nguoigd,
                DienThoaiDaiDien = @DienThoaiDaiDien,
                Mail = @Mail,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Makh = @Makh;
        END

        -- ==========================================================
        -- 2. XỬ LÝ PHIẾU BIÊN NHẬN CỌC CHỖ (tbmk_Biennhancoccho)
        -- ==========================================================
        IF (@DocumentID IS NULL OR @DocumentID = '')
        BEGIN
            -- Phát sinh mã phiếu (DocumentID & SoBN)
            -- SoBN thường theo định dạng: BNCC-YYMM-XXXX
            DECLARE @SoBN VARCHAR(50) = 'BNCC' + FORMAT(@Now, 'yyMMddHHmmss');
            SET @DocumentID = @SoBN; -- Tạm dùng SoBN làm DocumentID nếu không có logic AutoID phức tạp

            INSERT INTO tbmk_Biennhancoccho (
                DocumentID, SoBN, DocumentDate, Makh, Solan, Manv, Loaitiecid,
                Ngaytochuc, Nhamngay, Tongtien, Tongsoban, SobanManchinhthuc, SobanManduphong, SobanChaychinhthuc, SobanChayduphong,
                Thoigianid, Ghichu, IsHuy, IsKetthuc, GoiThucDonID, DateCreate, UserCreate
            )
            VALUES (
                @DocumentID, @SoBN, ISNULL(@DocumentDate, @Now), @Makh, @Solan, @Manv, @Loaitiecid,
                @Ngaytochuc, @Nhamngay, @Tongtien, @Tongsoban, @SobanManchinhthuc, @SobanManduphong, @SobanChaychinhthuc, @SobanChayduphong,
                @Thoigianid, @Ghichu, 0, 0, '', @Now, @UserCreate
            );
        END
        ELSE
        BEGIN
            -- Cập nhật phiếu cọc
            UPDATE tbmk_Biennhancoccho
            SET 
                Makh = @Makh,
                Solan = @Solan,
                Loaitiecid = @Loaitiecid,
                Ngaytochuc = @Ngaytochuc,
                Nhamngay = @Nhamngay,
                Tongtien = @Tongtien,
                Tongsoban = @Tongsoban,
                SobanManchinhthuc = @SobanManchinhthuc,
                SobanManduphong = @SobanManduphong,
                SobanChaychinhthuc = @SobanChaychinhthuc,
                SobanChayduphong = @SobanChayduphong,
                Thoigianid = @Thoigianid,
                Ghichu = @Ghichu,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE DocumentID = @DocumentID;
        END

        -- ==========================================================
        -- 3. XỬ LÝ CHI TIẾT SẢNH TIỆC (tbmk_Biennhancocchosanhtiec)
        -- ==========================================================
        -- Chỉ xử lý nếu có truyền danh sách Sảnh
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            -- Xóa sảnh cũ của phiếu này
            DELETE FROM tbmk_Biennhancocchosanhtiec WHERE DocumentID = @DocumentID;

            -- Parse JSON và Insert sảnh mới (Yêu cầu SQL Server 2016+)
            INSERT INTO tbmk_Biennhancocchosanhtiec (
                UserAutoid, DocumentID, Sanhtiecid, IsSanhchinh, 
                DateCreate, UserCreate
            )
            SELECT 
                NEWID(), -- Tự sinh GUID cho UserAutoid
                @DocumentID, 
                JSON_VALUE(value, '$.Sanhtiecid'),
                ISNULL(CAST(JSON_VALUE(value, '$.IsSanhchinh') AS BIT), 0),
                @Now,
                @UserCreate
            FROM OPENJSON(@JsonSanhTiec);
        END

        COMMIT TRANSACTION;
        
        -- Trả về kết quả thành công kèm ID
        SELECT 1 AS [Success], N'Lưu biên nhận cọc thành công' AS [Message], @DocumentID AS [DocumentID], @Makh AS [Makh];
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Trả về lỗi
        SELECT 0 AS [Success], ERROR_MESSAGE() AS [Message], NULL AS [DocumentID], NULL AS [Makh];
    END CATCH
END
GO
