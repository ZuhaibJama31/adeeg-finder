/**
 * Reverse-proxy: forwards port 5000 (Replit preview) → Expo web on port 8081.
 * Supports both HTTP and WebSocket (hot-reload) connections.
 */

const http = require("http");
const net  = require("net");

const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 8081;
const LISTEN_PORT = parseInt(process.env.PORT || "5000", 10);

/* ── HTTP proxy ── */
const server = http.createServer((req, res) => {
  const opts = {
    hostname : TARGET_HOST,
    port     : TARGET_PORT,
    path     : req.url,
    method   : req.method,
    headers  : {
      ...req.headers,
      host: `${TARGET_HOST}:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/html; charset=utf-8" });
    }
    res.end(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta http-equiv="refresh" content="3"/>
          <style>
            body{font-family:system-ui;display:flex;align-items:center;
                 justify-content:center;height:100vh;margin:0;background:#F7F8FB;}
            .box{text-align:center;color:#0D47A1;}
            h2{font-size:20px;margin:0 0 8px;}
            p{color:#64748B;font-size:14px;}
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Starting Metro…</h2>
            <p>The app bundle is compiling. This page will refresh automatically.</p>
          </div>
        </body>
      </html>
    `);
  });

  req.pipe(proxyReq, { end: true });
});

/* ── WebSocket proxy (hot-reload) ── */
server.on("upgrade", (req, socket, head) => {
  const target = net.connect(TARGET_PORT, TARGET_HOST, () => {
    target.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries({ ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` })
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n"
    );
    if (head && head.length) target.write(head);
    target.pipe(socket, { end: true });
    socket.pipe(target, { end: true });
  });

  target.on("error", () => socket.destroy());
  socket.on("error", () => target.destroy());
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`Proxy: 0.0.0.0:${LISTEN_PORT} → ${TARGET_HOST}:${TARGET_PORT}`);
});
