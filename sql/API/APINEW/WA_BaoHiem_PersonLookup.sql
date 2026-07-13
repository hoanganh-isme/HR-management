USE X26DIM_TT;
GO
IF OBJECT_ID('dbo.WA_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.WA_BaoHiem_PersonLookup;
GO
IF OBJECT_ID('dbo.API_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_PersonLookup;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[WA_BaoHiem_PersonLookup]
(
    @BranchID NVARCHAR(50) = '',
    @LoaiBaoHiem NVARCHAR(50) = '',
    @DocumentID NVARCHAR(50) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @BranchID = ISNULL(@BranchID, '');
    SET @LoaiBaoHiem = ISNULL(@LoaiBaoHiem, '');
    SET @DocumentID = ISNULL(@DocumentID, '');
    SET @Keyword = ISNULL(@Keyword, '');

    DECLARE @LoaiHDFilter NVARCHAR(50) = '';

    ----------------------------------------------------------------
    -- Nếu không truyền BranchID / LoaiBaoHiem thì lấy từ master theo DocumentID
    ----------------------------------------------------------------
    IF @DocumentID <> ''
    BEGIN
        SELECT TOP 1
            @BranchID = CASE 
                            WHEN @BranchID = '' 
                            THEN ISNULL(BranchID, '') 
                            ELSE @BranchID 
                        END,

            @LoaiBaoHiem = CASE 
                                WHEN @LoaiBaoHiem = '' 
                                THEN ISNULL(LoaiBaoHiem, '') 
                                ELSE @LoaiBaoHiem 
                            END
        FROM dbo.HR_BaoHiemTbl
        WHERE DocumentID = @DocumentID;
    END;

    ----------------------------------------------------------------
    -- Lấy loại HD từ LoaiBaoHiem
    -- VD: BHXH_NVN => NVN
    -- VD: BHXH_NNN => NNN
    ----------------------------------------------------------------
    IF UPPER(@LoaiBaoHiem) LIKE '%NNN%'
        SET @LoaiHDFilter = 'NNN';

    IF UPPER(@LoaiBaoHiem) LIKE '%NVN%'
        SET @LoaiHDFilter = 'NVN';

    ----------------------------------------------------------------
    -- Chưa chọn chi nhánh thì không xổ nhân viên
    ----------------------------------------------------------------
    IF @BranchID = ''
    BEGIN
        SELECT 
            CAST(NULL AS NVARCHAR(50)) AS PersonID,
            CAST(NULL AS NVARCHAR(250)) AS PersonName,
            CAST(NULL AS NVARCHAR(250)) AS PhongBan,
            CAST(0 AS DECIMAL(18, 2)) AS MucDong,
            CAST(NULL AS NVARCHAR(50)) AS BranchID,
            CAST(NULL AS NVARCHAR(250)) AS ChucDanhChuyenMon,
            CAST(NULL AS NVARCHAR(50)) AS LoaiHD,
            N'' AS CanhBao
        WHERE 1 = 0;

        RETURN;
    END;

    ----------------------------------------------------------------
    -- Lấy nhân viên theo chi nhánh master
    -- Lọc NVN / NNN dựa theo LoaiBaoHiem
    ----------------------------------------------------------------
    SELECT 
        P.PersonID, 
        P.PersonName, 
        P.PhongBan, 
        ISNULL(BH.MucDong, 0) AS MucDong,
        P.BranchID,

        ISNULL(HDGN.ChucDanhChuyenMon, '') AS ChucDanhChuyenMon,

        CASE 
            WHEN ISNULL(HDGN.LoaiHD, '') LIKE '%NNN%' THEN 'NNN'
            ELSE 'NVN'
        END AS LoaiHD,

        CASE 
            WHEN BH.PersonID IS NOT NULL 
            THEN N'!!! ĐÃ CÓ BH TẠI KỲ: ' 
                 + CAST(BH.PeriodID AS VARCHAR(50))
                 + N' - Ngày CT: ' + CONVERT(VARCHAR(10), BH.DocumentDate, 103)
                 + N' (Chứng từ: ' + BH.DocumentID + N')'
            ELSE N'' 
        END AS CanhBao

    FROM dbo.HR_PersonTbl P

    OUTER APPLY
    (
        SELECT TOP 1
            HD.PersonID,
            HD.LoaiHD,
            P.ChucDanhChuyenMon,
            HD.NgayKyHopDong,
            HD.NgayCoHieuLuc,
            HD.MaHopDong
        FROM dbo.HR_HopDongTbl HD
        WHERE HD.PersonID = P.PersonID
        ORDER BY 
            ISNULL(HD.NgayCoHieuLuc, '19000101') DESC,
            ISNULL(HD.NgayKyHopDong, '19000101') DESC,
            HD.MaHopDong DESC
    ) HDGN

    OUTER APPLY
    (
        SELECT TOP 1
            CT.PersonID,
            CT.MucDong,
            H.DocumentID,
            H.PeriodID,
            H.DocumentDate
        FROM dbo.HR_BaoHiemChiTietTbl CT
        INNER JOIN dbo.HR_BaoHiemTbl H 
            ON H.DocumentID = CT.DocumentID
        WHERE CT.PersonID = P.PersonID

          AND (
                @LoaiBaoHiem = ''
                OR H.LoaiBaoHiem = @LoaiBaoHiem
              )

          -- Không lấy chính chứng từ đang sửa để cảnh báo lại chính nó
          AND (
                @DocumentID = ''
                OR H.DocumentID <> @DocumentID
              )

        ORDER BY 
            H.DocumentDate DESC,
            H.PeriodID DESC,
            H.DocumentID DESC
    ) BH

    WHERE P.BranchID = @BranchID

      AND
      (
            @LoaiHDFilter = ''

            OR
            (
                @LoaiHDFilter = 'NNN'
                AND ISNULL(HDGN.LoaiHD, '') LIKE '%NNN%'
            )

            OR
            (
                @LoaiHDFilter = 'NVN'
                AND ISNULL(HDGN.LoaiHD, '') NOT LIKE '%NNN%'
            )
      )
      
      -- Bổ sung bộ lọc Keyword cho Web App Combobox
      AND (
          @Keyword = ''
          OR P.PersonID LIKE '%' + @Keyword + '%'
          OR P.PersonName LIKE N'%' + @Keyword + '%'
      )

    ORDER BY P.PersonID DESC;
END
GO
