// electron/server.cjs
const WebSocket = require("ws");

let wss = null;
let isStopping = false;

function start() {
  if (wss) return { stop };

  isStopping = false;

  wss = new WebSocket.Server({ port: 8080 });
  console.log("✅ Overlay WebSocket server running on ws://localhost:8080");

  const overlays = new Set(); // sockets that identified as overlay

  const broadcast = (obj) => {
    // ✅ Guard: server may already be stopping/closed
    if (!wss || isStopping) return;

    const msg = JSON.stringify(obj);

    // ✅ Extra safety: wss.clients exists only while server is alive
    try {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      });
    } catch {
      // ignore during teardown
    }
  };

  const sendOverlayStatus = () => {
    broadcast({ type: "overlayStatus", overlays: overlays.size });
  };

  wss.on("connection", (ws) => {
    console.log("🔌 New client connected");

    ws.__role = "unknown";

    // If we're in shutdown, immediately close the socket
    if (isStopping) {
      try { ws.close(); } catch { }
      return;
    }

    sendOverlayStatus();

    ws.on("message", (raw) => {
      if (isStopping || !wss) return;

      let text = raw?.toString?.() ?? String(raw);

      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (data?.type === "hello") {
        const role = data.role;

        overlays.delete(ws);

        ws.__role = role;
        if (role === "overlay") overlays.add(ws);

        console.log(`🤝 hello from ${role}`);

        sendOverlayStatus();
        return;
      }

      console.log(`📡 Broadcasting message from ${ws.__role || "unknown"}:`, text.substring(0, 100));

      let sentCount = 0;

      // ✅ Guard in case server is shutting down
      if (!wss || isStopping) return;

      try {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(text);
            sentCount++;
          }
        });
      } catch {
        // ignore during teardown
      }

      console.log(`📡 Message sent to ${sentCount} client(s)`);
    });

    ws.on("close", () => {
      if (ws.__role === "overlay") overlays.delete(ws);
      console.log("❌ Client disconnected");

      // ✅ Don't broadcast if we're stopping or server is gone
      if (!isStopping && wss) sendOverlayStatus();
    });

    ws.on("error", () => {
      if (ws.__role === "overlay") overlays.delete(ws);

      // ✅ Don't broadcast if we're stopping or server is gone
      if (!isStopping && wss) sendOverlayStatus();
    });
  });

  return { stop };

  function stop() {
    if (!wss) return;

    isStopping = true;

    try {
      wss.clients.forEach((client) => {
        try { client.terminate(); } catch { }
      });
    } catch { }

    try {
      wss.close(() => console.log("🛑 Overlay WebSocket server closed"));
    } catch { }

    wss = null;
  }
}

module.exports = { start };
