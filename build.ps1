# Compatibility wrapper. The source order lives in scripts/frontend-bundle.manifest.json.
$builder = Join-Path $PSScriptRoot 'scripts\build-frontend-bundle.mjs'
node $builder
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
