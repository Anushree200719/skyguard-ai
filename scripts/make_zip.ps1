$zipFile = "SkyGuard-AI.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

$filesToZip = Get-ChildItem -Path . -Recurse | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\venv\\' -and
    $_.FullName -notmatch '\\\.venv\\' -and
    $_.FullName -notmatch '\\__pycache__\\' -and
    $_.FullName -notmatch '\\\.git\\' -and
    $_.Name -ne 'SkyGuard-AI.zip'
}

$relativePaths = $filesToZip | ForEach-Object {
    $_.FullName.Substring((Get-Location).Path.Length + 1)
}

Write-Host "Creating SkyGuard-AI.zip excluding node_modules and venvs..."
Compress-Archive -Path $relativePaths -DestinationPath $zipFile -Force
Write-Host "Done!"
