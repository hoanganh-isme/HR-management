USE [X26DIMTUTAC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [WA_TimeSheetDay_Process_Stp] - WRAPPER GỌI TRỰC TIẾP HR_TimeSheetDay_Process_Stp
-- Sử dụng chính thức dbo.HR_TimeSheetDay_Process_Stp trong DB gốc để đồng bộ 100% với Desktop App
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[WA_TimeSheetDay_Process_Stp] 
    @PeriodID VARCHAR(10),
    @BranchID NVARCHAR(MAX) = ''
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_WARNINGS OFF;

    BEGIN TRY
        DECLARE @FromDate DATETIME;

        SELECT 
            @FromDate = FromDate
        FROM dbo.SY_Period
        WHERE PeriodID = @PeriodID;

        IF @FromDate IS NULL 
        BEGIN
            SELECT -1 AS code, N'Không tìm thấy kỳ chấm công ' + ISNULL(@PeriodID, '') AS msg;
            RETURN;
        END;

        -- Thực thi Stored Procedure xử lý chấm công gốc trong DB: HR_TimeSheetDay_Process_Stp
        EXEC dbo.HR_TimeSheetDay_Process_Stp
            @Period = @PeriodID,
            @BranchID = @BranchID;

        SELECT 0 AS code, N'Tạo bảng chấm công thành công cho kỳ ' + @PeriodID + N'!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lỗi tạo bảng chấm công: ' + ERROR_MESSAGE() AS msg;
    END CATCH

    SET ANSI_WARNINGS ON;
END
GO
