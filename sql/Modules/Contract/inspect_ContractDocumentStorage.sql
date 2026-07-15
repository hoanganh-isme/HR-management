-- Chỉ đọc: chạy trên DB thật để kiểm tra trước khi triển khai.
SET NOCOUNT ON;

EXEC sp_help 'dbo.HR_HopDongAttachTbl';

SELECT COUNT(*) AS SoDong
FROM dbo.HR_HopDongAttachTbl;

SELECT TOP (50)
       UserAutoID,
       MaHopDong,
       FileName,
       FileType,
       STT,
       FileSize,
       DATALENGTH(Content) AS ContentBytes,
       DATALENGTH(Base64Content) AS Base64ContentBytes,
       DATALENGTH(Content2) AS Content2Bytes,
       DATALENGTH(Base64Content2) AS Base64Content2Bytes
FROM dbo.HR_HopDongAttachTbl
ORDER BY UserAutoID DESC;

SELECT OBJECT_ID('dbo.HR_Documents') AS HR_Documents_ObjectID;

IF OBJECT_ID('dbo.HR_Documents') IS NOT NULL
BEGIN
    EXEC sp_help 'dbo.HR_Documents';
    SELECT COUNT(*) AS SoDong FROM dbo.HR_Documents;
END;

SELECT o.type_desc,
       QUOTENAME(OBJECT_SCHEMA_NAME(o.object_id)) + '.' + QUOTENAME(o.name) AS ObjectName
FROM sys.objects o
JOIN sys.sql_modules m ON m.object_id = o.object_id
WHERE m.definition LIKE '%HR_HopDongAttachTbl%'
   OR m.definition LIKE '%HR_Documents%'
   OR m.definition LIKE '%API_HopDongLaoDong_Attach%'
ORDER BY o.type_desc, ObjectName;

SELECT tr.name AS TriggerName,
       OBJECT_NAME(tr.parent_id) AS ParentObject,
       tr.is_disabled
FROM sys.triggers tr
WHERE tr.parent_id IN (OBJECT_ID('dbo.HR_HopDongAttachTbl'), OBJECT_ID('dbo.HR_Documents'));

SELECT *
FROM dbo.WA_API
WHERE list IN ('API_HopDongLaoDong_Attach', 'HR_Documents')
ORDER BY list, func;

