// electron/server.cjs
const WebSocket = require("ws");

let wss = null;

function start() {
  if (wss) return { stop };

  wss = new WebSocket.Server({ port: 8080 });
  console.log("✅ Overlay WebSocket server running on ws://localhost:8080");

  const overlays = new Set(); // sockets that identified as overlay

  const broadcast = (obj) => {
    const msg = JSON.stringify(obj);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  };

  const sendOverlayStatus = () => {
    broadcast({ type: "overlayStatus", overlays: overlays.size });
  };

  wss.on("connection", (ws) => {
    console.log("🔌 New client connected");

    // Default role until hello arrives
    ws.__role = "unknown";

    // Send current status immediately (so control panel can show yellow/green fast)
    sendOverlayStatus();

    ws.on("message", (raw) => {
      let text = raw?.toString?.() ?? String(raw);

      // Try to parse JSON messages
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      // ✅ Handshake handling
      if (data?.type === "hello") {
        const role = data.role;

        // remove from overlays in case of role changes
        overlays.delete(ws);

        ws.__role = role;

        if (role === "overlay") overlays.add(ws);

        console.log(`🤝 hello from ${role}`);

        // Broadcast updated overlay count
        sendOverlayStatus();
        return;
      }

      // ✅ Normal payloads: just broadcast them through like before
      console.log(`📡 Broadcasting message from ${ws.__role || "unknown"}:`, text.substring(0, 100));
      let sentCount = 0;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(text);
          sentCount++;
        }
      });
      console.log(`📡 Message sent to ${sentCount} client(s)`);
    });

    ws.on("close", () => {
      if (ws.__role === "overlay") overlays.delete(ws);
      console.log("❌ Client disconnected");
      sendOverlayStatus();
    });

    ws.on("error", () => {
      if (ws.__role === "overlay") overlays.delete(ws);
      sendOverlayStatus();
    });
  });

  return { stop };

  function stop() {
    if (!wss) return;

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
