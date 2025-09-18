@echo off
echo ========================================
echo          HTTPS Setup for Windows
echo ========================================
echo.

echo 1. Checking if mkcert is installed...
where mkcert >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ mkcert not found!
    echo.
    echo Please install mkcert first:
    echo   Option 1: choco install mkcert
    echo   Option 2: scoop install mkcert  
    echo   Option 3: Download from https://github.com/FiloSottile/mkcert/releases
    echo.
    pause
    exit /b 1
)
echo ✅ mkcert found!

echo.
echo 2. Creating certs directory...
if not exist "certs" mkdir certs
echo ✅ Directory created!

echo.
echo 3. Installing local CA...
mkcert -install
echo ✅ Local CA installed!

echo.
echo 4. Generating SSL certificates...
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
echo ✅ SSL certificates generated!

echo.
echo ========================================
echo            Setup Complete! 
echo ========================================
echo.
echo Now you can run:
echo   npm run dev:https
echo.
echo Your app will be available at:
echo   🔒 https://localhost:3000
echo.
pause
