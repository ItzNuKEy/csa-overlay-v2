// electron/server.cjs
const WebSocket = require("ws");

let wss = null;

function start() {
  if (wss) return { stop }; // prevent double-start

  wss = new WebSocket.Server({ port: 8080 });
  console.log("✅ Overlay WebSocket server running on ws://localhost:8080");

  wss.on("connection", (ws) => {
    console.log("🔌 New client connected");

    ws.on("message", (message) => {
      console.log("📨 Received:", message.toString?.() ?? message);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on("close", () => {
      console.log("❌ Client disconnected");
    });
  });

  return { stop };
}

function stop() {
  if (!wss) return;

  // Close all clients first
  try {
    wss.clients.forEach((client) => {
      try { client.terminate(); } catch {}
    });
  } catch {}

  // Close the server
  try {
    wss.close(() => console.log("🛑 Overlay WebSocket server closed"));
  } catch {}

  wss = null;
}

module.exports = { start, stop };
