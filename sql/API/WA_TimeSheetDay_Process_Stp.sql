USE [X26DIMTUTAC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[WA_TimeSheetDay_Process_Stp] 
    @PeriodID VARCHAR(10),
    @BranchID NVARCHAR(MAX) = ''
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_WARNINGS OFF;
    SET DATEFIRST 1; -- Thứ 2 = 1, Thứ 7 = 6, Chủ nhật = 7

    BEGIN TRY
        DECLARE 
            @FromDate DATETIME, 
            @ToDate DATETIME;

        SELECT 
            @FromDate = FromDate,
            @ToDate = ToDate
        FROM dbo.SY_Period
        WHERE PeriodID = @PeriodID;

        IF @FromDate IS NULL 
        BEGIN
            SELECT -1 AS code, N'Không tìm thấy kỳ chấm công ' + @PeriodID AS msg;
            RETURN;
        END;

        -- 1. Xoá dữ liệu cũ theo kỳ và chi nhánh
        DELETE T
        FROM dbo.HR_TimeSheetDayTbl T
        INNER JOIN dbo.HR_PersonTbl P
            ON T.PersonID = P.PersonID
        WHERE T.PeriodID = @PeriodID
          AND (@BranchID = '' OR P.BranchID = @BranchID);

        -- 2. Tính toán và chèn dữ liệu chấm công mới
        ;WITH Attendance AS
        (
            SELECT
                LTRIM(RTRIM(CAST(A.UserID AS NVARCHAR(50)))) AS UserID_Clean,
                CAST(A.EventTime AS DATE) AS Ngay,
                MIN(A.EventTime) AS GioVao,
                MAX(A.EventTime) AS GioRa
            FROM X26DIMTUTACACS.dbo.AC_EventTbl A
            WHERE A.EventTime >= @FromDate
              AND A.EventTime < DATEADD(DAY, 1, @ToDate)
            GROUP BY
                LTRIM(RTRIM(CAST(A.UserID AS NVARCHAR(50)))),
                CAST(A.EventTime AS DATE)
        )
        INSERT INTO dbo.HR_TimeSheetDayTbl
        (
            UserAutoID,
            PersonID,
            PeriodID,
            Ngay,
            ThoiGianVao,
            ThoiGianRa,
            SoCong,
            GhiChu,
            LyDo
        )
        SELECT
            P.PersonID + FORMAT(A.Ngay, 'ddMMyyyy') AS UserAutoID,
            P.PersonID,
            @PeriodID AS PeriodID,
            A.Ngay,
            V.ActualVao AS ThoiGianVao,
            V.ActualRa AS ThoiGianRa,

            CASE
                WHEN FinalShift.ShiftID IS NULL THEN 0
                WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL THEN 0
                WHEN DATEPART(WEEKDAY, A.Ngay) = 7 THEN 0

                -- Làm đủ số phút của ca thì lấy số công khai báo trong HR_ShiftListTbl
                WHEN W.TongPhutLam >= Q.PhutCaQuyDinh
                    THEN ISNULL(SH.SoCong, 1)

                ELSE 0
            END AS SoCong,

            CASE
                WHEN FinalShift.ShiftID IS NULL THEN N'Không có ca'
                WHEN DATEPART(WEEKDAY, A.Ngay) = 7 THEN N'Chủ nhật'
                WHEN FinalShift.SapCaID IS NOT NULL 
                    THEN N'Tính theo sắp ca: ' + ISNULL(SH.ShiftName, FinalShift.ShiftID)
                ELSE 
                    N'Tính theo ca tự động: ' + ISNULL(SH.ShiftName, FinalShift.ShiftID)
            END AS GhiChu,

            CASE
                WHEN FinalShift.ShiftID IS NULL
                    THEN N'Không có sắp ca và không có ca tự động'

                WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL
                    THEN N'Không đủ dữ liệu chấm công'

                WHEN DATEPART(WEEKDAY, A.Ngay) = 7
                    THEN N'Chủ nhật không tính công thường'

                WHEN W.TongPhutLam < Q.PhutCaQuyDinh
                    THEN N'Chưa đủ giờ công. Làm '
                         + CAST(W.TongPhutLam AS NVARCHAR(20))
                         + N' phút / cần '
                         + CAST(Q.PhutCaQuyDinh AS NVARCHAR(20))
                         + N' phút'

                ELSE N'Đủ giờ công'
            END AS LyDo

        FROM Attendance A

        INNER JOIN dbo.HR_PersonTbl P
            ON LTRIM(RTRIM(CAST(P.UserID AS NVARCHAR(50)))) = A.UserID_Clean

        OUTER APPLY
        (
            SELECT TOP 1
                CT.SapCaID,
                CT.ShiftID
            FROM dbo.HR_SapCaChiTietTbl CT
            WHERE CT.PersonID = P.PersonID
              AND CAST(CT.NgayLamViec AS DATE) = A.Ngay
            ORDER BY CT.UserAutoID DESC
        ) SCCT

        OUTER APPLY
        (
            SELECT TOP 1
                SC.SapCaID,
                CASE DATEPART(WEEKDAY, A.Ngay)
                    WHEN 1 THEN SC.ShiftIDThu2
                    WHEN 2 THEN SC.ShiftIDThu3
                    WHEN 3 THEN SC.ShiftIDThu4
                    WHEN 4 THEN SC.ShiftIDThu5
                    WHEN 5 THEN SC.ShiftIDThu6
                    WHEN 6 THEN SC.ShiftIDThu7
                    WHEN 7 THEN SC.ShiftIDChuNhat
             END AS ShiftID
            FROM dbo.HR_SapCaTbl SC
            WHERE SC.SapCaID = SCCT.SapCaID
              AND A.Ngay >= CAST(SC.TuNgay AS DATE)
              AND A.Ngay <= CAST(SC.DenNgay AS DATE)
        ) SCTuSapCaID

        OUTER APPLY
        (
            SELECT TOP 1
                SC.SapCaID,
                CASE DATEPART(WEEKDAY, A.Ngay)
                    WHEN 1 THEN SC.ShiftIDThu2
                    WHEN 2 THEN SC.ShiftIDThu3
                    WHEN 3 THEN SC.ShiftIDThu4
                    WHEN 4 THEN SC.ShiftIDThu5
                    WHEN 5 THEN SC.ShiftIDThu6
                    WHEN 6 THEN SC.ShiftIDThu7
                    WHEN 7 THEN SC.ShiftIDChuNhat
                END AS ShiftID
            FROM dbo.HR_SapCaChiTietTbl CT
            INNER JOIN dbo.HR_SapCaTbl SC
                ON SC.SapCaID = CT.SapCaID
            WHERE CT.PersonID = P.PersonID
              AND A.Ngay >= CAST(SC.TuNgay AS DATE)
              AND A.Ngay <= CAST(SC.DenNgay AS DATE)
            ORDER BY SC.SapCaID DESC
        ) SCTuLichTuan

        -- Nếu không có sắp ca thì lấy ca tự động trong HR_ShiftListTbl
        -- Thứ 2-6: lấy ca HC tự động
        -- Thứ 7: lấy ca T7_SANG tự động
        OUTER APPLY
        (
            SELECT TOP 1
                SH2.ShiftID
            FROM dbo.HR_ShiftListTbl SH2
            WHERE ISNULL(SH2.CaTuDong, 0) = 1
              AND (
                    (DATEPART(WEEKDAY, A.Ngay) BETWEEN 1 AND 5 AND SH2.ShiftID = 'HC')
                 OR (DATEPART(WEEKDAY, A.Ngay) = 6 AND SH2.ShiftID = 'T7_SANG')
              )
            ORDER BY SH2.ShiftID
        ) AutoShift

        OUTER APPLY
        (
            SELECT
                COALESCE
                (
                    SCCT.ShiftID,
                    SCTuSapCaID.ShiftID,
                    SCTuLichTuan.ShiftID,
                    AutoShift.ShiftID
                ) AS ShiftID,

                COALESCE
                (
                    SCCT.SapCaID,
                    SCTuSapCaID.SapCaID,
                    SCTuLichTuan.SapCaID
                ) AS SapCaID
        ) FinalShift

        LEFT JOIN dbo.HR_ShiftListTbl SH
            ON SH.ShiftID = FinalShift.ShiftID

        LEFT JOIN dbo.HR_TimeSheetDayEditTbl E
            ON P.PersonID = E.PersonID
           AND A.Ngay = CAST(E.ThoiGianVao AS DATE)

        CROSS APPLY
        (
            SELECT
                ISNULL(E.ThoiGianVao, A.GioVao) AS ActualVao,
                ISNULL(E.ThoiGianRa, A.GioRa) AS ActualRa
        ) RealTime

        CROSS APPLY
        (
            SELECT
                RealTime.ActualVao,
                RealTime.ActualRa
        ) V

        CROSS APPLY
        (
            SELECT
                CASE
                    WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL THEN 0
                    WHEN V.ActualRa < V.ActualVao THEN 0
                    ELSE DATEDIFF(MINUTE, V.ActualVao, V.ActualRa)
                END AS TongPhutLam
        ) W

        CROSS APPLY
        (
            SELECT
                CASE
                    WHEN SH.GioBatDau IS NULL OR SH.GioKetThuc IS NULL THEN 0

                    WHEN CAST(SH.GioKetThuc AS TIME) < CAST(SH.GioBatDau AS TIME)
                        THEN DATEDIFF
                        (
                            MINUTE,
                            CAST(SH.GioBatDau AS TIME),
                            CAST(SH.GioKetThuc AS TIME)
                        ) + 1440

                    ELSE DATEDIFF
                    (
                        MINUTE,
                        CAST(SH.GioBatDau AS TIME),
                        CAST(SH.GioKetThuc AS TIME)
                    )
                END AS PhutCaQuyDinh
        ) Q

        WHERE (@BranchID = '' OR P.BranchID = @BranchID);

        SELECT 0 AS code, N'Tạo bảng chấm công thành công cho kỳ ' + @PeriodID + N'!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lỗi tạo bảng chấm công: ' + ERROR_MESSAGE() AS msg;
    END CATCH

    SET ANSI_WARNINGS ON;
END
GO
