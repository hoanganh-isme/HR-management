$connString = "Server=localhost;Database=X26DIMTUTAC;Integrated Security=True;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
try {
    $conn.Open()
    Write-Output "Connected to localhost!"
} catch {
    Write-Output "Localhost failed: $_"
    $connString = "Server=.\SQLEXPRESS;Database=X26DIMTUTAC;Integrated Security=True;TrustServerCertificate=True;"
    $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
    try {
        $conn.Open()
        Write-Output "Connected to SQLEXPRESS!"
    } catch {
        Write-Output "SQLEXPRESS failed: $_"
        exit 1
    }
}

$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT name, is_identity FROM sys.columns WHERE object_id = OBJECT_ID('HR_BangThamSoTbl')"
$reader = $cmd.ExecuteReader()
Write-Output "--- Physical Table Columns (HR_BangThamSoTbl) ---"
while ($reader.Read()) {
    Write-Output "Column: $($reader['name']) (IsIdentity: $($reader['is_identity']))"
}
$reader.Close()

$conn.Close()
