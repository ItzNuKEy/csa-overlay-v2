// electron/electron-services/obs-relay.cjs
const { connectOBS, setSceneWithTransition, disconnectOBS, onObsStatus } = require("./obsService.cjs");

let started = false;
let WebsocketService = null;

function emitStatus(status, extra = {}) {
  console.log("[OBS Relay] emitStatus:", status, extra);

  try {
    const ws = WebsocketService?.webSocket;
    if (!ws || ws.readyState !== 1) {
      console.log(
        "[OBS Relay] Skipping emitStatus, WS not OPEN yet. readyState=",
        ws?.readyState
      );
      return;
    }

    // Matches WebsocketService.send(channel, event, data)
    WebsocketService.send("obsAutomation", "status", { status, ...extra });
  } catch (e) {
    console.warn("[OBS Relay] emitStatus failed hard:", e);
  }
}


function waitForBusReady() {
  return new Promise((resolve) => {
    const check = () => {
      const ws = WebsocketService?.webSocket;
      if (ws && ws.readyState === 1) {
        // 1 = OPEN
        console.log("[OBS Relay] WebsocketService bus is OPEN");
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

/**
 * @typedef {Object} ObsAutomationSettings
 * @property {boolean} enabled
 * @property {"matchStartOnly" | "endgameOnly" | "both"} mode
 * @property {string} liveTransition
 * @property {string} endgameTransition
 * @property {string} liveScene
 * @property {string} endgameScene
 */

async function run(settings) {
  console.log("🚀 [OBS Relay] starting with settings:", settings);

  const wsMod = await import("../../src/services/websocketService.js");
  WebsocketService = wsMod.WebsocketService;

  console.log("🌐 [OBS Relay] Initializing WebsocketService bus…");
  WebsocketService.init(49322, true); // port + debug
  console.log("✅ [OBS Relay] WebsocketService bus connected");
  await waitForBusReady();   
  onObsStatus((status, extra) => {
    // status will be "up" or "down"
    emitStatus(status, extra);
  });
  // 🟡 UI: trying to connect to OBS
  emitStatus("connecting");

  console.log("⏳ [OBS Relay] Connecting to OBS WebSocket…");
  await connectOBS();
  console.log("✅ [OBS Relay] Connected to OBS");

  // 🟢 UI: fully connected
  emitStatus("up");

  console.log("📡 [OBS Relay] Subscribing to game events…");

  WebsocketService.subscribe("game", "pre_countdown_begin", async () => {
    console.log("🔥 [OBS Relay] EVENT: pre_countdown_begin");

    if (settings.mode === "endgameOnly") {
      console.log("[OBS Relay] mode=endgameOnly, ignoring live-match event");
      return;
    }

    await setSceneWithTransition(
      settings.liveScene || "LIVEMATCH",
      settings.liveTransition || "CSAStinger"
    );
  });

  WebsocketService.subscribe("game", "match_ended", async () => {
    console.log("🔥 [OBS Relay] EVENT: match_ended");

    if (settings.mode === "matchStartOnly") {
      console.log("[OBS Relay] mode=matchStartOnly, ignoring endgame event");
      return;
    }

    await setSceneWithTransition(
      settings.endgameScene || "ENDGAME",
      settings.endgameTransition || "Fade"
    );
  });

  console.log("✅ [OBS Relay] Subscriptions installed.");
}

function start(options = {}) {
  if (started) {
    console.log("[OBS Relay] start() called but already running");
    return { stop };
  }
  started = true;

  /** @type {ObsAutomationSettings} */
  const settings = {
    enabled: true,
    mode: options.settings?.mode || "matchStartOnly",
    liveTransition: options.settings?.liveTransition || "CSAStinger",
    endgameTransition: options.settings?.endgameTransition || "Fade",
    liveScene: options.settings?.liveScene || "LIVEMATCH",
    endgameScene: options.settings?.endgameScene || "ENDGAME",
  };

  run(settings).catch((err) => console.error("[OBS Relay] crashed:", err));
  return { stop };
}

function stop() {
  if (!started) return;
  started = false;

  try {
    emitStatus("down");
  } catch { }

  try {
    disconnectOBS();
  } catch { }

  try {
    WebsocketService?.shutdown?.();
  } catch { }

  console.log("🛑 [OBS Relay] stopped");
}

module.exports = { start, stop };
