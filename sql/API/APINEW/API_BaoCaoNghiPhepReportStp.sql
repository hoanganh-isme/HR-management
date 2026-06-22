Use X26DIMTUTAC
Go 
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoNghiPhepReportStp 
    @PeriodID varchar(50) = '', 
    @BranchID1 varchar(50) = '',
    @Keyword NVARCHAR(200) = ''  
AS 
BEGIN
    SET NOCOUNT ON;

    SET @PeriodID = LTRIM(RTRIM(ISNULL(@PeriodID, '')));
    SET @BranchID1 = LTRIM(RTRIM(ISNULL(@BranchID1, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    IF @PeriodID = '' OR @PeriodID LIKE '%{PeriodID}%'
    BEGIN
        SET @PeriodID = '';
    END

    IF @BranchID1 = '' OR @BranchID1 LIKE '%{BranchID1}%'
    BEGIN
        SET @BranchID1 = '';
    END

    IF @Keyword LIKE '%{%}%'
    BEGIN
        SET @Keyword = '';
    END

    -- Nếu kỳ lương trống, tự động lấy kỳ lương hoạt động mới nhất
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        ORDER BY FromDate DESC;
    END

    -- Nếu vẫn trống, tìm từ bảng chấm công
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
    END

    DECLARE @NamBC INT, @ThangBC INT;
    
    IF LEN(@PeriodID) >= 6
    BEGIN
        SET @NamBC = CAST(LEFT(@PeriodID, 4) AS INT);   
        SET @ThangBC = CAST(SUBSTRING(@PeriodID, 5, 2) AS INT); 
    END
    ELSE
    BEGIN
        SET @NamBC = YEAR(GETDATE());
        SET @ThangBC = MONTH(GETDATE());
    END;

    ------------------------------------------------------------
    -- 1. Tầng bung chi tiết từ bảng DETAIL 
    ------------------------------------------------------------
    ;WITH BungDonNghi_CTE AS (
        SELECT
            M.PersonID,
            ISNULL(LTRIM(RTRIM(DT.HinhThucNghi)), '') AS HinhThucNghi, 
            M.StatusID,
            DATEADD(DAY, V.number, CAST(DT.NghiTuNgay AS DATE)) AS NgayThucTe,
            ISNULL(DT.SoNgayNghi, 1) AS TongSoNgayNghiThuong, 
            CEILING(ISNULL(DT.SoNgayNghi, 1)) AS SoDongDuKien
        FROM dbo.HR_NghiPhepTbl M
        INNER JOIN dbo.HR_NghiPhepDetailTbl DT ON M.DocumentID = DT.DocumentID
        JOIN master..spt_values V ON V.type = 'P' AND V.number < CEILING(ISNULL(DT.SoNgayNghi, 1))
        WHERE ISNULL(M.IsXinHuy, 0) = 0 
          AND YEAR(CAST(DT.NghiTuNgay AS DATE)) = @NamBC 
    ),
    
    PhanLoaiNgayNghi_CTE AS (
        SELECT 
            B.PersonID,
            B.NgayThucTe,
            MONTH(B.NgayThucTe) AS ThangNghi,
            B.HinhThucNghi,
            -- Thử việc (1), Chính thức (2), Đã duyệt (8) đều ghi nhận lên bảng 12 tháng
            CAST(CASE 
                WHEN B.StatusID IN (1, 2, 8) AND B.SoDongDuKien > 0 AND B.HinhThucNghi <> 'HH' 
                    THEN B.TongSoNgayNghiThuong / B.SoDongDuKien
                ELSE 0
            END AS DECIMAL(18,2)) AS GiaTriPhanBoPhep,
            
            CAST(CASE
                WHEN B.StatusID IN (1, 2, 8) AND B.SoDongDuKien > 0 AND B.HinhThucNghi = 'HH' 
                    THEN B.TongSoNgayNghiThuong / B.SoDongDuKien
                ELSE 0
            END AS DECIMAL(18,2)) AS CongNghiThucTe
        FROM BungDonNghi_CTE B
    ),

    MonthlyLeave_CTE AS (
        SELECT 
            PersonID,
            SUM(CASE WHEN ThangNghi = 1  THEN GiaTriPhanBoPhep ELSE 0 END) AS T1,
            SUM(CASE WHEN ThangNghi = 2  THEN GiaTriPhanBoPhep ELSE 0 END) AS T2,
            SUM(CASE WHEN ThangNghi = 3  THEN GiaTriPhanBoPhep ELSE 0 END) AS T3,
            SUM(CASE WHEN ThangNghi = 4  THEN GiaTriPhanBoPhep ELSE 0 END) AS T4,
            SUM(CASE WHEN ThangNghi = 5  THEN GiaTriPhanBoPhep ELSE 0 END) AS T5,
            SUM(CASE WHEN ThangNghi = 6  THEN GiaTriPhanBoPhep ELSE 0 END) AS T6,
            SUM(CASE WHEN ThangNghi = 7  THEN GiaTriPhanBoPhep ELSE 0 END) AS T7,
            SUM(CASE WHEN ThangNghi = 8  THEN GiaTriPhanBoPhep ELSE 0 END) AS T8,
            SUM(CASE WHEN ThangNghi = 9  THEN GiaTriPhanBoPhep ELSE 0 END) AS T9,
            SUM(CASE WHEN ThangNghi = 10 THEN GiaTriPhanBoPhep ELSE 0 END) AS T10,
            SUM(CASE WHEN ThangNghi = 11 THEN GiaTriPhanBoPhep ELSE 0 END) AS T11,
            SUM(CASE WHEN ThangNghi = 12 THEN GiaTriPhanBoPhep ELSE 0 END) AS T12,
            
            SUM(CASE WHEN ThangNghi <= @ThangBC THEN GiaTriPhanBoPhep ELSE 0 END) AS DaSuDungDenThang,
            SUM(CASE WHEN ThangNghi <= @ThangBC THEN CongNghiThucTe ELSE 0 END) AS HieuHi
        FROM PhanLoaiNgayNghi_CTE
        GROUP BY PersonID
    )

    ------------------------------------------------------------
    -- 2. Tầng xuất dữ liệu khớp 100% thứ tự cột bảng Excel mẫu
    ------------------------------------------------------------
    SELECT 
        -- Cột 1, 2, 3: Thông tin nhân viên
        ROW_NUMBER() OVER (ORDER BY PE.PersonID) AS TT, 
        PE.PersonName AS HoVaTen, 
        PE.ChucDanhChuyenMon AS ChucDanh, 
        
        -- Cột 4 đến 15: Chi tiết từ Tháng 1 đến Tháng 12
        ISNULL(m.T1, 0) AS M1, 
        ISNULL(m.T2, 0) AS M2, 
        ISNULL(m.T3, 0) AS M3, 
        ISNULL(m.T4, 0) AS M4, 
        ISNULL(m.T5, 0) AS M5, 
        ISNULL(m.T6, 0) AS M6,
        ISNULL(m.T7, 0) AS M7, 
        ISNULL(m.T8, 0) AS M8, 
        ISNULL(m.T9, 0) AS M9, 
        ISNULL(m.T10, 0) AS M10, 
        ISNULL(m.T11, 0) AS M11, 
        ISNULL(m.T12, 0) AS M12,
        
        -- Cột 16: Còn phép năm 2025 chuyển qua tính đến hết quý 1/2026
        ISNULL(p.PhepTonNamTruoc, 0) AS PhepTonNamTruoc, 
        
        -- Cột 17: Phép năm 2026 (đến tháng 04) -> Lấy số ngày tiêu chuẩn + ngày cộng thêm nhập tay
      --  (ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0)) AS QuyPhepNamNay, 
        
        -- Cột 18: Phép Thâm niên/năm
        ISNULL(p.PhepThamNien, 0) AS PhepThamNien,
        
        -- Cột 19: Ngày tết âm lịch 2026 (đưa vào phép) do đi làm
        ISNULL(p.SoNgayPhepTet, 0) AS PhepTetAmLichDiLam, 
        
        -- Cột 20: Hiếu, hỷ
        ISNULL(m.HieuHi, 0) AS HieuHi,                 
        
        -- Cột 21: Tổng phép = Phép tồn gốc + Phép năm + Phép thêm + Thâm niên + Phép làm Tết
        (ISNULL(p.PhepTonNamTruoc, 0) + ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0) + ISNULL(p.PhepThamNien, 0)) AS TongPhep,
        
        -- Cột 22: Phép đã sử dụng trong năm 2026 (Tổng từ các đơn tháng)
        ISNULL(m.DaSuDungDenThang, 0) AS PhepDaSuDungDenThang,                
        
        -- Cột 23: Phép còn lại năm 2026 = Tổng quỹ phép trừ đi số ngày đã nghỉ thực tế
        ((ISNULL(p.PhepTonNamTruoc, 0) + ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0) + ISNULL(p.PhepThamNien, 0)) - ISNULL(m.DaSuDungDenThang, 0)) AS PhepConLai,
        
        -- Cột 24: Ghi chú
        ISNULL(p.GhiChu, N'') AS GhiChu

        --Cột 25 : Phép tết

    FROM dbo.HR_PersonTbl PE 
    LEFT JOIN dbo.HR_PersonNghiPhepTbl p ON PE.PersonID = p.PersonID AND p.Nam = @NamBC
    LEFT JOIN MonthlyLeave_CTE m ON PE.PersonID = m.PersonID

    WHERE (@BranchID1 = '' OR @BranchID1 = 'ALL' OR PE.BranchID = @BranchID1)
      AND (
            @Keyword = ''
            OR PE.PersonID LIKE '%' + @Keyword + '%'
            OR PE.PersonName LIKE N'%' + @Keyword + '%'
            OR PE.ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
          ); 
END
