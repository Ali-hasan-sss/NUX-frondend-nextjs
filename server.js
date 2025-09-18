const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Check if SSL certificates exist
  const httpsOptions = {};
  const keyPath = path.join(__dirname, "certs", "localhost-key.pem");
  const certPath = path.join(__dirname, "certs", "localhost.pem");

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions.key = fs.readFileSync(keyPath);
    httpsOptions.cert = fs.readFileSync(certPath);

    console.log("🔒 SSL certificates found, starting HTTPS server...");

    createServer(httpsOptions, async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    })
      .once("error", (err) => {
        console.error("HTTPS server error:", err);
        process.exit(1);
      })
      .listen(port, hostname, () => {
        console.log(`🚀 Ready on https://${hostname}:${port}`);
        console.log(`🌐 Network access: https://localhost:${port}`);
        console.log(`📱 Mobile access: https://YOUR_IP_ADDRESS:${port}`);
        console.log("");
        console.log("✅ HTTPS enabled - GPS and other secure APIs will work!");
      });
  } else {
    console.log("❌ SSL certificates not found!");
    console.log("🔧 Run: npm run setup-ssl");
    console.log("📁 Expected files:");
    console.log("   - certs/localhost-key.pem");
    console.log("   - certs/localhost.pem");
    process.exit(1);
  }
});
