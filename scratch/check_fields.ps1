$body = @{
    FormName = "WA_TimeSheetDayFrm"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://nhansu.bms7.net/api/API_LayCacTruongGiaoDien" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    Write-Host "Response received:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Error $_.Exception.Message
}
