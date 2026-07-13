UPDATE dbo.WA_API
SET Para = N'@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'',@PeriodID=N''{PeriodID}'''
WHERE list = 'WA_KinhPhiCongDoanFrm'
  AND func = 'View';
GO

SELECT list, func, [SQL], Para
FROM dbo.WA_API
WHERE list = 'WA_KinhPhiCongDoanFrm'
  AND func = 'View';
GO
