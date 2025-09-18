# Complete HTTPS Setup for Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Complete HTTPS Setup for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-Host "⚠️  This script requires administrator privileges for mkcert installation." -ForegroundColor Yellow
    Write-Host "   Please run PowerShell as Administrator or continue with manual setup." -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Download mkcert
Write-Host "Step 1: Setting up mkcert..." -ForegroundColor Green
$toolsDir = ".\tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Host "✅ Created tools directory" -ForegroundColor Green
}

$mkcertPath = "$toolsDir\mkcert.exe"
if (!(Test-Path $mkcertPath)) {
    Write-Host "📥 Downloading mkcert..." -ForegroundColor Yellow
    try {
        $mkcertUrl = "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe"
        Invoke-WebRequest -Uri $mkcertUrl -OutFile $mkcertPath
        Write-Host "✅ mkcert downloaded!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download mkcert: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual download:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Yellow
        Write-Host "2. Download: mkcert-v1.4.4-windows-amd64.exe" -ForegroundColor Yellow
        Write-Host "3. Save as: .\tools\mkcert.exe" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ mkcert already downloaded" -ForegroundColor Green
}

# Step 2: Create certs directory
Write-Host ""
Write-Host "Step 2: Creating certificates directory..." -ForegroundColor Green
if (!(Test-Path ".\certs")) {
    New-Item -ItemType Directory -Path ".\certs" | Out-Null
    Write-Host "✅ Created certs directory" -ForegroundColor Green
} else {
    Write-Host "✅ Certs directory already exists" -ForegroundColor Green
}

# Step 3: Install mkcert CA
Write-Host ""
Write-Host "Step 3: Installing local Certificate Authority..." -ForegroundColor Green
try {
    & $mkcertPath -install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Local CA installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CA installation may have failed. Continuing anyway..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  CA installation failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   You may need to run as administrator or install manually." -ForegroundColor Yellow
}

# Step 4: Generate certificates
Write-Host ""
Write-Host "Step 4: Generating SSL certificates..." -ForegroundColor Green
try {
    & $mkcertPath -key-file "certs\localhost-key.pem" -cert-file "certs\localhost.pem" "localhost" "127.0.0.1" "::1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSL certificates generated!" -ForegroundColor Green
    } else {
        Write-Host "❌ Certificate generation failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Certificate generation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Verify certificates
Write-Host ""
Write-Host "Step 5: Verifying certificates..." -ForegroundColor Green
if ((Test-Path ".\certs\localhost.pem") -and (Test-Path ".\certs\localhost-key.pem")) {
    Write-Host "✅ Certificates verified!" -ForegroundColor Green
    
    # Show certificate info
    $certInfo = & $mkcertPath -version
    Write-Host "📋 mkcert version: $certInfo" -ForegroundColor Cyan
} else {
    Write-Host "❌ Certificates not found!" -ForegroundColor Red
    exit 1
}

# Final success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your HTTPS development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To start your app with HTTPS:" -ForegroundColor Yellow
Write-Host "  npm run dev:https" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Yellow
Write-Host "  🔒 https://localhost:3000" -ForegroundColor Cyan
Write-Host "  🌐 https://YOUR_IP:3000 (for mobile access)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Benefits:" -ForegroundColor Yellow
Write-Host "  ✅ GPS will work with high accuracy" -ForegroundColor Green
Write-Host "  ✅ All secure APIs will work" -ForegroundColor Green
Write-Host "  ✅ Production-like experience" -ForegroundColor Green
Write-Host ""
