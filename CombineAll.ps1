$folder1 = "d:\chuyenfile\clonecode\HR-Management\sql\Insert"
$output1 = "$folder1\Combined_Insert.sql"
Remove-Item -Path $output1 -ErrorAction SilentlyContinue
Get-ChildItem -Path $folder1 -Filter *.sql -Exclude Combined_Insert.sql | ForEach-Object {
    Get-Content $_.FullName | Out-File -FilePath $output1 -Encoding UTF8 -Append
    "`r`nGO`r`n" | Out-File -FilePath $output1 -Encoding UTF8 -Append
}

$folder2 = "d:\chuyenfile\clonecode\HR-Management\sql\API"
$output2 = "$folder2\Combined_API.sql"
Remove-Item -Path $output2 -ErrorAction SilentlyContinue
Get-ChildItem -Path $folder2 -Filter *.sql -Recurse -Exclude Combined_API.sql | ForEach-Object {
    Get-Content $_.FullName | Out-File -FilePath $output2 -Encoding UTF8 -Append
    "`r`nGO`r`n" | Out-File -FilePath $output2 -Encoding UTF8 -Append
}
