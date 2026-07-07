USE X26DIM_TT;
GO

IF OBJECT_ID('dbo.WA_BaoHiemFrm_Save', 'P') IS NOT NULL
    DROP PROCEDURE dbo.WA_BaoHiemFrm_Save;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE dbo.WA_BaoHiemFrm_Save
(
    @List VARCHAR(50) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Trích xuất PeriodKeyID từ JSON (VD: 202606_NVN)
        DECLARE @PeriodKeyID VARCHAR(50) = JSON_VALUE(@Data, '$.PeriodKeyID');
        
        IF @PeriodKeyID IS NOT NULL AND CHARINDEX('_', @PeriodKeyID) > 0
        BEGIN
            -- Tách PeriodID và LoaiBaoHiem từ PeriodKeyID
            DECLARE @PeriodID VARCHAR(20) = SUBSTRING(@PeriodKeyID, 1, CHARINDEX('_', @PeriodKeyID) - 1);
            DECLARE @LoaiBaoHiem VARCHAR(50) = SUBSTRING(@PeriodKeyID, CHARINDEX('_', @PeriodKeyID) + 1, LEN(@PeriodKeyID));
            
            -- Bơm ngược lại PeriodID và LoaiBaoHiem vào JSON
            SET @Data = JSON_MODIFY(@Data, '$.PeriodID', @PeriodID);
            SET @Data = JSON_MODIFY(@Data, '$.LoaiBaoHiem', @LoaiBaoHiem);
        END

        -- Gọi lại hàm lõi API_LuuDong để tiến hành lưu
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;

    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO
