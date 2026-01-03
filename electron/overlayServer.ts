import http from "node:http";
import path from "node:path";
import fs from "node:fs";

function contentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "text/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".woff": return "font/woff";
    case ".woff2": return "font/woff2";
    case ".ttf": return "font/ttf";
    default: return "application/octet-stream";
  }
}

export function startOverlayServer(opts: { port?: number; rootDir: string }) {
  const port = opts.port ?? 3199;
  const rootDir = path.resolve(opts.rootDir);

  const server = http.createServer((req, res) => {
    try {
      const urlPath = (req.url ?? "/").split("?")[0];

      if (urlPath === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      // nice landing page
      if (urlPath === "/" || urlPath === "") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <!doctype html>
          <html>
            <body style="margin:0;background:#111;color:#fff;font-family:sans-serif;padding:16px">
              <h2 style="margin:0 0 12px">CSA Overlay Server ✅</h2>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:18px">
                <a style="color:#7dd3fc" href="/overlay.html">overlay.html</a>
                <a style="color:#7dd3fc" href="/endgame.html">endgame.html</a>
                <a style="color:#7dd3fc" href="/health">health</a>
              </div>
            </body>
          </html>
        `);
        return;
      }

      // prevent path traversal
      const safePath = path
        .normalize(urlPath)
        .replace(/^(\.\.[/\\])+/, "")
        .replace(/^[/\\]+/, "");

      const filePath = path.join(rootDir, safePath);

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(data);
    } catch (err: any) {
      console.error("[overlay-server] error:", err?.message ?? err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error");
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[overlay-server] serving: ${rootDir}`);
    console.log(`[overlay-server] running at http://127.0.0.1:${port}`);
  });

  return server;
}
