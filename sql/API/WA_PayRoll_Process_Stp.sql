USE [X26DIMTUTAC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[WA_PayRoll_Process_Stp] 
    @PeriodID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- 0. Khởi động cập nhật trạng thái chấm công
        EXEC HR_TimeSheet_UpdateDailyStatus_Stp @Period = @PeriodID;
        
        DECLARE @FromDate DATE, @ToDate DATE, @ToDateDT DATETIME, @NgayCongChuan DECIMAL(18,2) = 26.0;

        SELECT @FromDate = CAST(FromDate AS DATE), @ToDate = CAST(ToDate AS DATE), @ToDateDT = ToDate 
        FROM dbo.SY_Period WHERE PeriodID = @PeriodID;

        IF @FromDate IS NULL 
        BEGIN 
            SELECT -1 AS code, N'Không tìm thấy kỳ lương.' AS msg; 
            RETURN; 
        END;

        -- 1. Backup dữ liệu kỳ hiện tại để giữ các chỉnh sửa tay
        DROP TABLE IF EXISTS #TmpBackup;
        SELECT PersonID, LuongTong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri 
        INTO #TmpBackup 
        FROM dbo.HR_PayrollTbl WHERE PeriodID = @PeriodID;

        -- 2. Dọn dẹp bảng cũ
        DELETE D FROM dbo.HR_PayrollDetailTbl D INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = D.DocumentID WHERE H.PeriodID = @PeriodID;
        DELETE FROM dbo.HR_PayrollTbl WHERE PeriodID = @PeriodID;

        -- 3. Insert với logic "Vét" dữ liệu kỳ gần nhất
        INSERT INTO dbo.HR_PayrollTbl (DocumentID, DocumentDate, PeriodID, PersonID, PersonName, MucDong, LuongTong, TongLuong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri)
        SELECT 
            CAST(UPPER(@PeriodID + P.PersonID) AS VARCHAR(50)), @ToDateDT, @PeriodID, P.PersonID, P.PersonName, 
            ISNULL(B.MucDong, 0), 
            ISNULL(T.LuongTong, Old.LuongTong), 
            0, 
            ISNULL(T.SoNguoiPhuThuoc, ISNULL(Old.SoNguoiPhuThuoc, 0)),
            -- Ưu tiên: Sửa tay tháng này > Lấy từ tháng trước > Lấy mức đóng BH
            ISNULL(T.LuongCoBan, ISNULL(Old.LuongCoBan, ISNULL(B.MucDong, 0))),
            ISNULL(T.IsBH, ISNULL(Old.IsBH, 0)), 
            ISNULL(T.IsHuuTri, ISNULL(Old.IsHuuTri, 0))
        FROM dbo.HR_PersonTbl P
        LEFT JOIN #TmpBackup T ON P.PersonID = T.PersonID
        OUTER APPLY (
            -- Tìm kỳ lương gần nhất ĐÃ CÓ LƯƠNG (>0) cho nhân viên đó
            SELECT TOP 1 LuongTong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri 
            FROM dbo.HR_PayrollTbl 
            WHERE PersonID = P.PersonID 
            AND PeriodID < @PeriodID 
            AND LuongTong > 0 
            ORDER BY PeriodID DESC
        ) Old
        LEFT JOIN (
            SELECT BH.PersonID, BH.MucDong 
            FROM dbo.HR_BaoHiemChiTietTbl BH 
            INNER JOIN (SELECT PersonID, MAX(DocumentID) as MaxDoc FROM dbo.HR_BaoHiemChiTietTbl GROUP BY PersonID) L 
            ON BH.PersonID = L.PersonID AND BH.DocumentID = L.MaxDoc
        ) B ON P.PersonID = B.PersonID
        WHERE ISNULL(P.PersonID, '') <> '';

        -- 4. Bảng tạm tính
        DROP TABLE IF EXISTS #ChamCong, #BaoHiemClean, #PhuCap, #LuongKhoan, #TmpPayrollDetail, #NhanVienPhanLoai;
        SELECT TS.PersonID, SUM(ISNULL(TS.SoNgayDiLam, 0) + ISNULL(TS.NghiPhep, 0) + ISNULL(TS.SoNgayLe, 0)) AS TongNgayCongThucTe INTO #ChamCong FROM dbo.HR_TimeSheetTbl TS WHERE TS.PeriodID = @PeriodID GROUP BY TS.PersonID;
        
        ;WITH CTE_BH AS (SELECT BH.PersonID, (ISNULL(BH.MucDongBHXHNLD, 0) + ISNULL(BH.MucDongBHYTNLD, 0) + ISNULL(BH.MucDongBHTNNLD, 0)) AS TongBH, ISNULL(BH.MucDong, 0) AS MucDong, ROW_NUMBER() OVER (PARTITION BY BH.PersonID ORDER BY M.PeriodID DESC) AS RN FROM dbo.HR_BaoHiemChiTietTbl BH INNER JOIN dbo.HR_BaoHiemTbl M ON BH.DocumentID = M.DocumentID WHERE M.PeriodID <= @PeriodID) 
        SELECT PersonID, TongBH, MucDong INTO #BaoHiemClean FROM CTE_BH WHERE RN = 1;
        
        SELECT PA.PersonID, SUM(CASE WHEN PA.MaPhuCap IN ('HOTROANCA', 'ANCA') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS AnCa, SUM(CASE WHEN PA.MaPhuCap IN ('HOTROXANGXE', 'XANGXE') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS XangXe, SUM(CASE WHEN PA.MaPhuCap IN ('HOTRODIENTHOAI', 'DIENTHOAI') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS DienThoai INTO #PhuCap FROM dbo.HR_PersonAllowanceTbl PA LEFT JOIN dbo.HR_BangPhuCapTbl BPC ON BPC.MaPhuCap = PA.MaPhuCap GROUP BY PA.PersonID;
        SELECT LK.PersonID, SUM(ISNULL(LK.SoTienKhoan, 0)) AS SoTienKhoan INTO #LuongKhoan FROM dbo.HR_LuongKhoanTbl LK WHERE @ToDateDT BETWEEN LK.TuNgay AND ISNULL(LK.DenNgay, '2099-12-31') GROUP BY LK.PersonID;
        
        SELECT H.PersonID, H.DocumentID, CASE WHEN LK.PersonID IS NOT NULL THEN 1 ELSE 0 END AS IsKhoan 
        INTO #NhanVienPhanLoai FROM dbo.HR_PayrollTbl H LEFT JOIN #LuongKhoan LK ON H.PersonID = LK.PersonID WHERE H.PeriodID = @PeriodID;
        
        CREATE TABLE #TmpPayrollDetail (DocumentID VARCHAR(50), Code INT, Mota NVARCHAR(255), SoTien DECIMAL(18,0));

        -- 5. Insert các khoản lương
        INSERT INTO #TmpPayrollDetail 
        SELECT 
            H.DocumentID, 
            10, 
            N'Lương cơ bản', 
            CASE 
                WHEN H.PersonID = 'VP016' THEN 
                    -- VP016: Dùng Lương khoán (LK.SoTienKhoan) để tính
                    ROUND((ISNULL(LK.SoTienKhoan, 0) / @NgayCongChuan) * ISNULL(CC.TongNgayCongThucTe, 0), 0)
                ELSE 
                    -- Người khác: Dùng Lương cơ bản (H.LuongCoBan) bình thường
                    ROUND((ISNULL(H.LuongCoBan, 0) / @NgayCongChuan) * ISNULL(CC.TongNgayCongThucTe, 0), 0)
            END
        FROM dbo.HR_PayrollTbl H 
        INNER JOIN #NhanVienPhanLoai NV ON H.DocumentID = NV.DocumentID 
        LEFT JOIN #ChamCong CC ON CC.PersonID = H.PersonID 
        LEFT JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID 
        WHERE H.PeriodID = @PeriodID 
        AND (NV.IsKhoan = 0 OR H.PersonID In ('VP016', 'ÐD251'));
        
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 11, N'HOTROANCA', ISNULL(PC.AnCa, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 12, N'HOTROXANGXE', ISNULL(PC.XangXe, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 13, N'HOTRODIENTHOAI', ISNULL(PC.DienThoai, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 14, N'Lương khoán', ISNULL(LK.SoTienKhoan, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 30, N'BHXH, BHYT, BHTN', CASE WHEN H.IsBH = 1 THEN ISNULL(B.TongBH, 0) ELSE 0 END FROM dbo.HR_PayrollTbl H LEFT JOIN #BaoHiemClean B ON B.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;

        INSERT INTO #TmpPayrollDetail 
        SELECT H.DocumentID, 44, N'Thưởng hiệu suất', ROUND(((ISNULL(H.LuongTong, 0) - (ISNULL(B.MucDong, 0) + ISNULL(PC.AnCa, 0) + ISNULL(PC.XangXe, 0) + ISNULL(PC.DienThoai, 0))) * ISNULL(CC.TongNgayCongThucTe, 0)) / @NgayCongChuan, -3) 
        FROM dbo.HR_PayrollTbl H INNER JOIN #NhanVienPhanLoai NV ON H.DocumentID = NV.DocumentID LEFT JOIN #ChamCong CC ON CC.PersonID = H.PersonID LEFT JOIN #BaoHiemClean B ON B.PersonID = H.PersonID LEFT JOIN #PhuCap PC ON PC.PersonID = H.PersonID AND (NV.IsKhoan = 0 OR H.PersonID IN ('VP016', 'ÐD251'));

        -- 6. Tính thuế
        INSERT INTO #TmpPayrollDetail 
        SELECT T.DocumentID, 20, N'Tổng thu nhập', SUM(CASE WHEN Code = 14 AND H.PersonID = 'VP016'  THEN 0 ELSE SoTien END)
        FROM #TmpPayrollDetail T INNER JOIN dbo.HR_PayrollTbl H ON T.DocumentID = H.DocumentID WHERE Code IN (10, 11, 12, 13, 14, 44) GROUP BY T.DocumentID; 
        
        INSERT INTO #TmpPayrollDetail 
        SELECT H.DocumentID, 50, N'Thu nhập chịu thuế', 
        CASE WHEN H.PersonID In ('VP016','ÐD251') THEN ISNULL(T10.SoTien, 0)
             ELSE ISNULL(LK.SoTienKhoan, (ISNULL(T10.SoTien, 0) + ISNULL(T12.SoTien, 0) + ISNULL(T13.SoTien, 0) + ISNULL(T44.SoTien, 0) + ISNULL(T14.SoTien, 0))) END
        FROM dbo.HR_PayrollTbl H LEFT JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID LEFT JOIN #TmpPayrollDetail T10 ON T10.DocumentID = H.DocumentID AND T10.Code = 10 
        LEFT JOIN #TmpPayrollDetail T12 ON T12.DocumentID = H.DocumentID AND T12.Code = 12 LEFT JOIN #TmpPayrollDetail T13 ON T13.DocumentID = H.DocumentID AND T13.Code = 13 
        LEFT JOIN #TmpPayrollDetail T44 ON T44.DocumentID = H.DocumentID AND T44.Code = 44 LEFT JOIN #TmpPayrollDetail T14 ON T14.DocumentID = H.DocumentID AND T14.Code = 14 WHERE H.PeriodID = @PeriodID;
        
        INSERT INTO #TmpPayrollDetail 
        SELECT T50.DocumentID, 60, N'Thu nhập tính thuế', CASE WHEN H.IsBH = 0 OR H.IsHuuTri = 1 THEN ISNULL(T50.SoTien, 0) WHEN H.SoNguoiPhuThuoc = 0 AND T50.SoTien > 15500000 THEN T50.SoTien - 15500000 WHEN H.SoNguoiPhuThuoc > 0 AND T50.SoTien > 21700000 THEN T50.SoTien - 21700000 ELSE 0 END 
        FROM #TmpPayrollDetail T50 INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = T50.DocumentID WHERE T50.Code = 50;

        INSERT INTO #TmpPayrollDetail 
        SELECT T60.DocumentID, 31, N'Thuế TNCN', CASE WHEN H.IsBH = 0 OR H.IsHuuTri = 1 THEN ROUND(ISNULL(T60.SoTien, 0) * 0.1, 0) ELSE ROUND(ISNULL(T60.SoTien, 0) * 0.05, 0) END 
        FROM #TmpPayrollDetail T60 INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = T60.DocumentID WHERE T60.Code = 60;
        
        UPDATE H SET H.TongLuong = ISNULL(T20.SoTien, 0) - ISNULL(H.TienBuTru, 0) FROM dbo.HR_PayrollTbl H LEFT JOIN #TmpPayrollDetail T20 ON T20.DocumentID = H.DocumentID AND T20.Code = 20 WHERE H.PeriodID = @PeriodID;
        
        INSERT INTO dbo.HR_PayrollDetailTbl (UserAutoID, DocumentID, Code, Mota, SoTien, Notes) 
        SELECT CONVERT(VARCHAR(50), NEWID()), T.DocumentID, T.Code, T.Mota, T.SoTien, '' 
        FROM #TmpPayrollDetail T;

        SELECT 0 AS code, N'Tính bảng lương thành công cho kỳ ' + @PeriodID + '!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lỗi tính lương: ' + ERROR_MESSAGE() AS msg;
    END CATCH
END
