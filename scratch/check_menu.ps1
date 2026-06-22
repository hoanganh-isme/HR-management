$body = @{
    List = "WA_Menu"
    FormName = "WA_Menu"
    Func = "View"
    Limit = 1000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://nhansu.bms7.net/api/API_Gateway_Router" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    Write-Host "Raw Response:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Error $_.Exception.Message
}
