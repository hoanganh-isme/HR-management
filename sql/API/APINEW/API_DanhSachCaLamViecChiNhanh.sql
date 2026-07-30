

CREATE OR ALTER PROCEDURE dbo.API_DanhSachCaLamViecChiNhanh
(
    @Keyword NVARCHAR(200) = '',
    @UserBranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        BranchID,
        ShiftID,
        ShiftName,
        LoaiCa,
        CachChamCong,
        GioVaoDoan1,
        GioRaDoan1,
        GioVaoDoan2,
        GioRaDoan2,
        GioVaoThang,
        GioRaThang,
        IsCaDem,
        SoGioCong,
        SoCong,
        GhiChu,
        UserCreate,
        DateCreate,
        UserUpdate,
        DateUpdate
    FROM dbo.HR_ShiftListCNTbl
    WHERE 
        (@UserBranchID = '' OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@UserBranchID, ',')))
        AND (@Keyword = ''
        OR ShiftID LIKE '%' + @Keyword + '%'
        OR ShiftName LIKE N'%' + @Keyword + '%')
    ORDER BY BranchID, ShiftID ASC;
END
GO

