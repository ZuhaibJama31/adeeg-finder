/**
 * Reverse-proxy: port 5000 → Expo Metro web on port 8081.
 *
 * Extra features:
 *  - Strips Origin/Referer headers so Expo's CORS middleware doesn't reject requests.
 *  - Intercepts the Metro HTML shell and injects a phone-frame skin so the
 *    preview pane renders the app inside an iPhone silhouette.
 *  - Proxies WebSocket upgrades for hot-reload.
 */

const http = require("http");
const net  = require("net");

const TARGET_HOST = "192.168.100.187";
const TARGET_PORT = 8081;
const LISTEN_PORT = parseInt(process.env.PORT || "5000", 10);

/* ─── Phone frame CSS + JS injected into the Metro HTML shell ─── */
const PHONE_FRAME_INJECTION = `
<style id="phone-frame-skin">
  /* page background */
  html, body {
    height: 100% !important;
    margin: 0 !important;
    background: linear-gradient(160deg, #0d0d1a 0%, #1a1030 100%) !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    overflow: auto !important;
    padding: 28px 0 48px !important;
    box-sizing: border-box !important;
  }
  /* phone shell */
  #root {
    position: relative !important;
    width: 393px !important;
    min-width: 393px !important;
    max-width: 393px !important;
    height: 852px !important;
    min-height: 852px !important;
    flex: none !important;
    border-radius: 52px !important;
    overflow: hidden !important;
    background: #fff !important;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 0 0 11px #18182a,
      0 0 0 13px #252540,
      0 0 0 14px rgba(255,255,255,0.04),
      0 40px 120px rgba(0,0,0,0.8) !important;
  }
</style>
<script>
/* Inject notch + home-bar after the DOM is ready */
document.addEventListener('DOMContentLoaded', function () {
  var root = document.getElementById('root');
  if (!root) return;

  /* Dynamic notch */
  var notch = document.createElement('div');
  notch.setAttribute('style',
    'position:absolute;top:0;left:50%;transform:translateX(-50%);' +
    'width:126px;height:37px;background:#18182a;border-radius:0 0 26px 26px;' +
    'z-index:2147483647;pointer-events:none;display:flex;align-items:center;' +
    'justify-content:center;gap:8px;');

  var camera = document.createElement('div');
  camera.setAttribute('style',
    'width:12px;height:12px;border-radius:50%;background:#111128;' +
    'border:2px solid #252540;');

  var speaker = document.createElement('div');
  speaker.setAttribute('style',
    'width:52px;height:6px;border-radius:3px;background:#111128;');

  notch.appendChild(speaker);
  notch.appendChild(camera);
  root.appendChild(notch);

  /* Home indicator */
  var bar = document.createElement('div');
  bar.setAttribute('style',
    'position:absolute;bottom:0;left:0;right:0;height:28px;z-index:2147483647;' +
    'pointer-events:none;display:flex;align-items:center;justify-content:center;' +
    'background:linear-gradient(to top,rgba(255,255,255,0.9),rgba(255,255,255,0));');
  var pill = document.createElement('div');
  pill.setAttribute('style',
    'width:134px;height:5px;border-radius:3px;background:rgba(0,0,0,0.22);');
  bar.appendChild(pill);
  root.appendChild(bar);

  /* Side buttons on the shell (visual only, outside #root via body overlay) */
  var overlay = document.createElement('div');
  overlay.setAttribute('style',
    'position:fixed;top:28px;left:50%;transform:translateX(-50%);' +
    'width:419px;height:852px;pointer-events:none;z-index:2147483646;');

  /* Volume up */
  var volUp = document.createElement('div');
  volUp.setAttribute('style',
    'position:absolute;left:-12px;top:120px;width:4px;height:52px;' +
    'background:#252540;border-radius:2px;');
  /* Volume down */
  var volDn = document.createElement('div');
  volDn.setAttribute('style',
    'position:absolute;left:-12px;top:186px;width:4px;height:52px;' +
    'background:#252540;border-radius:2px;');
  /* Power */
  var power = document.createElement('div');
  power.setAttribute('style',
    'position:absolute;right:-12px;top:152px;width:4px;height:80px;' +
    'background:#252540;border-radius:2px;');

  overlay.appendChild(volUp);
  overlay.appendChild(volDn);
  overlay.appendChild(power);
  document.body.appendChild(overlay);
});
</script>
`;

/* ─── Helper: inject phone frame into Metro's HTML shell ─── */
function injectFrame(html) {
  return html.replace("</head>", PHONE_FRAME_INJECTION + "</head>");
}

/* ─── Helper: build clean headers for Metro (strip CORS-trigger headers) ─── */
function metroHeaders(incoming) {
  const h = { ...incoming };
  delete h.origin;
  delete h.referer;
  h.host = `${TARGET_HOST}:${TARGET_PORT}`;
  return h;
}

/* ─── "Starting" page shown before Metro is ready ─── */
function waitingHtml() {
  return `<!doctype html>
<html><head>
  <meta charset="utf-8"/>
  <meta http-equiv="refresh" content="3"/>
  <style>
    body{font-family:system-ui;background:#0d0d1a;color:#fff;
         display:flex;align-items:center;justify-content:center;
         height:100vh;margin:0;}
    .box{text-align:center;}
    h2{font-size:20px;margin:0 0 8px;color:#E8F0FE;}
    p{color:#64748B;font-size:14px;}
    .dot{display:inline-block;animation:blink 1s infinite;}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  </style>
</head><body>
  <div class="box">
    <h2>Starting Metro<span class="dot">…</span></h2>
    <p>Compiling the bundle. Refreshing automatically.</p>
  </div>
</body></html>`;
}

/* ─── HTTP proxy ─── */
const server = http.createServer((req, res) => {
  const opts = {
    hostname: TARGET_HOST,
    port:     TARGET_PORT,
    path:     req.url,
    method:   req.method,
    headers:  metroHeaders(req.headers),
  };

  const proxyReq = http.request(opts, (proxyRes) => {
    const ct = proxyRes.headers["content-type"] || "";
    const isHtml = ct.includes("text/html");

    if (isHtml) {
      let body = "";
      proxyRes.setEncoding("utf8");
      proxyRes.on("data", (c) => (body += c));
      proxyRes.on("end", () => {
        const modified = injectFrame(body);
        const respHeaders = { ...proxyRes.headers };
        delete respHeaders["content-length"]; // length changed after injection
        respHeaders["transfer-encoding"] = "chunked";
        res.writeHead(proxyRes.statusCode, respHeaders);
        res.end(modified);
      });
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  });

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    }
    res.end(waitingHtml());
  });

  req.pipe(proxyReq, { end: true });
});

/* ─── WebSocket proxy (hot-reload) ─── */
server.on("upgrade", (req, socket, head) => {
  const target = net.connect(TARGET_PORT, TARGET_HOST, () => {
    const headerLines = Object.entries(metroHeaders(req.headers))
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
    target.write(
      `${req.method} ${req.url} HTTP/1.1\r\n${headerLines}\r\n\r\n`
    );
    if (head && head.length) target.write(head);
    target.pipe(socket, { end: true });
    socket.pipe(target, { end: true });
  });
  target.on("error", () => socket.destroy());
  socket.on("error", () => target.destroy());
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`Phone-frame proxy: 0.0.0.0:${LISTEN_PORT} → ${TARGET_HOST}:${TARGET_PORT}`);
});
