/**
 * Dev landing page server for Replit webview (port 5000).
 * Shows instructions to scan QR code from the Expo dev server on port 8081.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

function getAppName() {
  try {
    const appJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "app.json"), "utf-8"));
    return appJson.expo?.name || "AdeegFinder";
  } catch {
    return "AdeegFinder";
  }
}

const appName = getAppName();

function getLandingHtml(req) {
  const forwardedProto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || process.env.REPLIT_DEV_DOMAIN || "localhost";
  const devDomain = process.env.REPLIT_DEV_DOMAIN || host;
  const expsUrl = devDomain;

  return `<!doctype html>
<html>
  <head>
    <title>${appName}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0; padding: 32px 20px; text-align: center;
        background: #fff; color: #222; line-height: 1.5; min-height: 100vh;
        display: flex; align-items: center; justify-content: center;
      }
      .wrapper { max-width: 520px; margin: 0 auto; }
      h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #0D47A1; }
      .subtitle { font-size: 15px; color: #666; margin-bottom: 32px; }
      .card {
        border: 1px solid #e0e0e0; border-radius: 16px;
        padding: 28px; margin-bottom: 20px; background: #fafafa;
      }
      .card h2 { font-size: 18px; margin: 0 0 12px; color: #111; }
      .card p { font-size: 14px; color: #666; margin: 0 0 16px; }
      .qr-wrap {
        background: #222; border-radius: 12px; padding: 20px;
        display: flex; flex-direction: column; align-items: center; gap: 16px;
      }
      .qr-code { background: #fff; border-radius: 8px; padding: 10px; }
      .open-btn {
        display: inline-block; padding: 12px 24px;
        background: #fff; color: #222; font-size: 14px; font-weight: 600;
        border-radius: 8px; text-decoration: none;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .store-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 4px; }
      .store-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 18px; border: 1px solid #ccc; border-radius: 8px;
        text-decoration: none; color: #333; font-size: 13px; background: #fff;
      }
      .badge {
        display: inline-block; background: #0D47A1; color: #fff;
        font-size: 11px; font-weight: 600; padding: 2px 8px;
        border-radius: 99px; letter-spacing: 0.5px; margin-bottom: 12px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <h1>${appName}</h1>
      <p class="subtitle">A mobile service-finding platform — preview on your phone</p>

      <div class="card">
        <div class="badge">STEP 1</div>
        <h2>Download Expo Go</h2>
        <p>Install the free Expo Go app to preview this app on your device.</p>
        <div class="store-buttons">
          <a href="https://apps.apple.com/app/id982107779" class="store-btn" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=host.exp.exponent" class="store-btn" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
            Google Play
          </a>
        </div>
      </div>

      <div class="card">
        <div class="badge">STEP 2</div>
        <h2>Scan QR Code or Open in Expo Go</h2>
        <p>Use your camera or Expo Go to scan the code below.</p>
        <div class="qr-wrap">
          <div class="qr-code" id="qr"></div>
          <a href="exps://${expsUrl}" class="open-btn">Open in Expo Go</a>
        </div>
      </div>
    </div>

    <script src="https://unpkg.com/qr-code-styling@1.6.0/lib/qr-code-styling.js"></script>
    <script>
      const qr = new QRCodeStyling({
        width: 200, height: 200,
        data: "exps://${expsUrl}",
        dotsOptions: { color: "#333", type: "rounded" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "extra-rounded" },
        cornersDotOptions: { type: "dot" },
        qrOptions: { errorCorrectionLevel: "H" }
      });
      qr.append(document.getElementById("qr"));

      const ua = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
      if (isMobile) {
        window.location.href = "exps://${expsUrl}";
      }
    </script>
  </body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(getLandingHtml(req));
});

const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Dev landing page running on port ${PORT}`);
});
