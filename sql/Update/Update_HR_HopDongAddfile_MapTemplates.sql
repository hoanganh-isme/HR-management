USE X26DIMTUTAC
GO

-- =========================================================================
-- SCRIPT TẠO BẢNG ÁNH XẠ VÀ CẬP NHẬT MAPPING FILE MẪU CHO HỢP ĐỒNG LAO ĐỘNG
-- =========================================================================

-- 1. Tạo bảng HR_HopDongAddfile nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HR_HopDongAddfile]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.HR_HopDongAddfile (
        FormName NVARCHAR(100) NOT NULL,
        LoaiHD NVARCHAR(100) NOT NULL,
        TemplateFile NVARCHAR(250) NOT NULL,
        GhiChu NVARCHAR(500) NULL,
        CONSTRAINT PK_HR_HopDongAddfile PRIMARY KEY (FormName, LoaiHD)
    );
    PRINT '>> Da tao bang HR_HopDongAddfile thanh cong!';
END
ELSE
BEGIN
    PRINT '>> Bang HR_HopDongAddfile da ton tai.';
END
GO

-- 2. Xóa cấu hình cũ để tránh trùng lặp khi chạy lại script
TRUNCATE TABLE dbo.HR_HopDongAddfile;
GO

-- 3. Bơm dữ liệu mapping mẫu (FormName = 'WA_HopDongLaoDongFrm')
-- Bạn có thể cập nhật/thay đổi trường LoaiHD (hoặc LoaiHopDong) trực tiếp trong bảng này
INSERT INTO dbo.HR_HopDongAddfile (FormName, LoaiHD, TemplateFile, GhiChu) VALUES
('WA_HopDongLaoDongFrm', N'HĐLĐ Song ngữ', N'HR_HopDongLaoDongReport.docx', N'Hợp đồng lao động mẫu 1 (Song ngữ Anh - Việt)'),
('WA_HopDongLaoDongFrm', N'HĐLĐ Tiếng Việt', N'HR_HopDongLaoDong2Report.docx', N'Hợp đồng lao động mẫu 2 (Tiếng Việt)'),
('WA_HopDongLaoDongFrm', N'HĐ Thử việc', N'HR_HopDongLaoDong3Report.docx', N'Hợp đồng thử việc mẫu 3 (Chung)'),
('WA_HopDongLaoDongFrm', N'Thử việc', N'HR_HopDongLaoDong3Report.docx', N'Hợp đồng thử việc mẫu 3 (Chung)'),
('WA_HopDongLaoDongFrm', N'Chính thức', N'HR_HopDongLaoDong2Report.docx', N'Mặc định Hợp đồng chính thức dùng mẫu Tiếng Việt');
GO

PRINT '>> Da nap thanh cong du lieu mapping file mau cho WA_HopDongLaoDongFrm!';
GO

DELETE FROM dbo.WA_API WHERE list IN ('HR_HopDongAddfile', 'HR_HopDongAddfile_GetForm', 'HR_Documents');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('HR_HopDongAddfile', 'View', 'SELECT FormName, LoaiHD, TemplateFile, GhiChu FROM dbo.HR_HopDongAddfile WHERE FormName = N''{Keyword}'' OR ISNULL(N''{Keyword}'', '''') = ''''', ''),
('HR_HopDongAddfile_GetForm', 'View', 'SELECT TOP 1 FormName FROM dbo.HR_HopDongAddfile WHERE TemplateFile LIKE ''%'' + N''{Keyword}'' + ''%''', ''),
('HR_Documents', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('HR_Documents', 'Edit', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('HR_Documents', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT '>> Da dang ky routing cho HR_HopDongAddfile va HR_Documents trong bang WA_API thanh cong!';
GO

-- =========================================================================
-- 5. TẠO BẢNG LƯU VẾT TÀI LIỆU HR_Documents & ĐĂNG KÝ ROUTING WA_API
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HR_Documents]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.HR_Documents (
        DocumentID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        RefID VARCHAR(50) NOT NULL,             -- Mã Hợp đồng hoặc mã liên kết
        DocType VARCHAR(50) NOT NULL,           -- Loại file
        VersionNo INT DEFAULT 1,
        FilePath NVARCHAR(500) NOT NULL,        -- Đường dẫn file
        FileHash VARCHAR(255),                  -- Hash SHA-256
        TemplateVersion VARCHAR(50),
        Status VARCHAR(20) DEFAULT 'ACTIVE',
        GeneratedBy VARCHAR(50),
        GeneratedAt DATETIME DEFAULT GETDATE(),
        DeletedBy VARCHAR(50) NULL,
        DeletedAt DATETIME NULL
    );
    CREATE NONCLUSTERED INDEX IX_HRDocuments_RefID ON dbo.HR_Documents(RefID);
    PRINT '>> Da tao bang HR_Documents thanh cong!';
END
ELSE
BEGIN
    PRINT '>> Bang HR_Documents da ton tai.';
END
GO

DELETE FROM dbo.WA_API WHERE list = 'HR_Documents';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('HR_Documents', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('HR_Documents', 'Edit', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('HR_Documents', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT '>> Da dang ky routing cho HR_Documents trong bang WA_API thanh cong!';
GO
