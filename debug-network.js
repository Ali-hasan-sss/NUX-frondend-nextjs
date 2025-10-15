// Network debugging script
const os = require("os");

console.log("🌐 Network Debug Information");
console.log("============================");
console.log("");

// Get all network interfaces
const networkInterfaces = os.networkInterfaces();

console.log("📡 Available Network Interfaces:");
Object.keys(networkInterfaces).forEach((interfaceName) => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach((iface) => {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`  ${interfaceName}: ${iface.address}`);
      console.log(`    🔗 Frontend: https://${iface.address}:3000`);
      console.log(`    🔗 Backend:  http://${iface.address}:5000`);
    }
  });
});

console.log("");
console.log("🔧 Mobile Access Instructions:");
console.log("1. Make sure your mobile device is on the same WiFi network");
console.log("2. Use one of the IP addresses above for https://IP:3000");
console.log("3. Accept the security warning (self-signed certificate)");
console.log("4. Make sure backend is running on http://IP:5000");
console.log("");
console.log("⚠️  Common Issues:");
console.log("- Windows Firewall blocking connections");
console.log("- Antivirus blocking network access");
console.log("- Different WiFi networks");
console.log("- Backend not accessible from network");
console.log("");

// Test backend connectivity
const testBackendConnection = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/health");
    if (response.ok) {
      console.log("✅ Backend is accessible on localhost:5000");
    } else {
      console.log("❌ Backend responded with error:", response.status);
    }
  } catch (error) {
    console.log("❌ Backend is not accessible:", error.message);
    console.log("   Make sure backend is running: npm run dev");
  }
};

testBackendConnection();
