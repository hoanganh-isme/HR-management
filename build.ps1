# Compatibility wrapper. The JSON manifest is the single source of truth.
# Use -Check to validate without touching generated bundles.
param([switch]$Check)

$argsList = @('scripts/build-frontend-bundle.mjs')
if ($Check) { $argsList += '--check' }
& node @argsList
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
