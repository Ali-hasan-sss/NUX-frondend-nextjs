#!/bin/bash

echo "========================================"
echo "        HTTPS Setup for macOS/Linux"
echo "========================================"
echo

echo "1. Checking if mkcert is installed..."
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert not found!"
    echo
    echo "Please install mkcert first:"
    echo "  macOS: brew install mkcert"
    echo "  Ubuntu/Debian: sudo apt install libnss3-tools && wget mkcert"
    echo "  Or visit: https://github.com/FiloSottile/mkcert"
    echo
    exit 1
fi
echo "✅ mkcert found!"

echo
echo "2. Creating certs directory..."
mkdir -p certs
echo "✅ Directory created!"

echo
echo "3. Installing local CA..."
mkcert -install
echo "✅ Local CA installed!"

echo
echo "4. Generating SSL certificates..."
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
echo "✅ SSL certificates generated!"

echo
echo "========================================"
echo "           Setup Complete!"
echo "========================================"
echo
echo "Now you can run:"
echo "  npm run dev:https"
echo
echo "Your app will be available at:"
echo "  🔒 https://localhost:3000"
echo

# Make certificates readable
chmod 644 certs/*.pem

echo "🎉 All done! Happy coding with HTTPS!"
