# Download mkcert for Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Downloading mkcert for Windows" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create tools directory
$toolsDir = ".\tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir
    Write-Host "✅ Created tools directory" -ForegroundColor Green
}

# Download mkcert
$mkcertUrl = "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe"
$mkcertPath = "$toolsDir\mkcert.exe"

Write-Host "📥 Downloading mkcert..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $mkcertUrl -OutFile $mkcertPath
    Write-Host "✅ mkcert downloaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download mkcert: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add to PATH for current session
$env:PATH += ";$(Resolve-Path $toolsDir)"
Write-Host "✅ Added mkcert to PATH" -ForegroundColor Green

# Test mkcert
Write-Host ""
Write-Host "🧪 Testing mkcert..." -ForegroundColor Yellow
& "$mkcertPath" -version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ mkcert is working!" -ForegroundColor Green
} else {
    Write-Host "❌ mkcert test failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         mkcert Ready!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run: .\tools\mkcert.exe -install" -ForegroundColor Yellow
Write-Host "Then run: npm run setup-ssl-manual" -ForegroundColor Yellow
