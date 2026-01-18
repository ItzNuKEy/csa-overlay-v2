// electron/electron-services/obsService.cjs
const OBSWebSocket = require("obs-websocket-js").default;

const obs = new OBSWebSocket();
let isConnected = false;

obs.on("ConnectionClosed", () => {
  isConnected = false;
  notify("down");
  try {
    if (globalThis.obsConnection === obs) globalThis.obsConnection = undefined;
  } catch { }
  console.log("⚠️ OBS WebSocket connection closed");
});

obs.on("error", (e) => {
  isConnected = false;
  notify("down", { reason: "error" });
});


// 🔹 NEW: shared state for connection management
let retryTimer = null;
let wantConnection = false;
let connectingPromise = null;
let statusListener = null;
function onObsStatus(cb) {
  statusListener = cb;
}
function notify(status, extra = {}) {
  try { statusListener?.(status, extra); } catch {
    notify("down", { reason: "connect_failed" });
}
}


function getOBSConnected() {
  isConnected = true;
  notify("up");
}

async function connectOBS(
  address = "ws://127.0.0.1:4455",
  password = "csaoverlay",
  retryInterval = 3000
) {
  // we now WANT a connection
  wantConnection = true;

  // already connected?
  if (isConnected) return obs;

  // if a previous connect is in flight, re-use it
  if (connectingPromise) return connectingPromise;

  const doConnect = async () => {
    try {
      const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
        address,
        password,
        { rpcVersion: 1 }
      );

      isConnected = true;
      globalThis.obsConnection = obs;
      console.log(
        `✅ Connected to OBS ${obsWebSocketVersion} (RPC ${negotiatedRpcVersion})`
      );

      return obs;
    } catch (error) {
      console.error(
        "❌ Failed to connect to OBS:",
        error.code || "",
        error.message || error
      );

      // if we no longer care about being connected, don't retry
      if (!wantConnection) {
        throw error;
      }

      // optional: retry loop that respects wantConnection
      await new Promise((resolve) => {
        retryTimer = setTimeout(resolve, retryInterval);
      });

      if (!wantConnection) {
        throw error;
      }

      return doConnect();
    }
  };

  connectingPromise = doConnect()
    .catch((err) => {
      // surface error but clear state
      throw err;
    })
    .finally(() => {
      connectingPromise = null;
      retryTimer = null;
    });

  return connectingPromise;
}

async function pingOBS() {
  try {
    await obs.call("GetVersion");
    isConnected = true;
    return true;
  } catch {
    isConnected = false;
    return false;
  }
}

function disconnectOBS() {
  // we no longer want an OBS connection
  wantConnection = false;

  // clear any pending retry
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  // if a connect is currently in-flight, it'll see wantConnection=false
  if (!isConnected) return;

  try {
    obs.disconnect(); // closes the socket
    console.log("🔌 Disconnected from OBS WebSocket");
  } catch (error) {
    console.error("❌ Error while disconnecting from OBS:", error);
  } finally {
    isConnected = false;
    try {
      if (globalThis.obsConnection === obs) {
        globalThis.obsConnection = undefined;
      }
    } catch { }
  }
}

async function getSceneAndTransitionOptions() {
  try {
    const alive = await pingOBS();
    if (!alive) return { connected: false, scenes: [], transitions: [] };
    // If we aren't connected yet, try to connect first.
    if (!isConnected) {
      console.log(
        "[obsService] not connected yet, attempting connect before listing scenes…"
      );
      await connectOBS();
    }

    const { scenes, currentProgramSceneName } = await obs.call("GetSceneList");
    const { transitions, currentSceneTransitionName } =
      await obs.call("GetSceneTransitionList");

    const sceneNames = (scenes || []).map((s) => s.sceneName);
    const transitionNames = (transitions || []).map((t) => t.transitionName);

    console.log("[obsService] scenes from OBS:", sceneNames);
    console.log("[obsService] transitions from OBS:", transitionNames);

    return {
      connected: true,
      scenes: sceneNames,
      transitions: transitionNames,
      currentProgramSceneName,
      currentTransitionName: currentSceneTransitionName,
    };
  } catch (error) {
    console.error("[obsService] getSceneAndTransitionOptions failed:", error);
    return {
      connected: isConnected,
      scenes: [],
      transitions: [],
    };
  }
}

async function setScene(sceneName) {
  try {
    await obs.call("SetCurrentProgramScene", { sceneName });
    console.log(`🎬 Scene switched to: ${sceneName}`);
  } catch (error) {
    console.error("❌ Error switching scene:", error);
  }
}

async function saveReplayBuffer() {
  try {
    await obs.call("SaveReplayBuffer");
    console.log("💾 Replay buffer saved!");
  } catch (error) {
    console.error("❌ Failed to save replay buffer:", error);
  }
}

function onSceneChange(callback) {
  obs.on("CurrentProgramSceneChanged", (data) => {
    callback(data); // data.sceneName
  });
}

async function setSceneWithTransition(sceneName, transitionName = "Fade") {
  try {
    await obs.call("SetCurrentSceneTransition", { transitionName });
    await obs.call("SetCurrentProgramScene", { sceneName });

    console.log(
      `🎬 Scene switched to "${sceneName}" with "${transitionName}" transition`
    );
  } catch (error) {
    console.error("❌ Error switching scene with transition:", error);
  }
}

async function setBrowserSourceUrl(sceneName, sourceName, url) {
  try {
    await obs.call("SetInputSettings", {
      inputName: sourceName,
      inputSettings: { url },
      overlay: true,
    });
    console.log(`🔗 Updated ${sceneName}/${sourceName} URL → ${url}`);
  } catch (error) {
    console.error(`❌ Failed to update ${sourceName}:`, error);
  }
}

async function setBrowserSourceVisibility(sceneName, sourceName, visible) {
  try {
    console.log(
      `🔧 [VisibilityTest] Trying ${sceneName}/${sourceName} → ${visible}`
    );
    const { sceneItemId } = await obs.call("GetSceneItemId", {
      sceneName,
      sourceName,
    });
    console.log(`🔎 Found ${sourceName} → ID ${sceneItemId}`);

    await obs.call("SetSceneItemEnabled", {
      sceneName,
      sceneItemId,
      sceneItemEnabled: visible,
    });

    console.log(
      `👁️ ${visible ? "Shown" : "Hidden"} ${sourceName} in ${sceneName}`
    );
  } catch (error) {
    console.error(
      `❌ Visibility error for ${sourceName} in ${sceneName}:`,
      error
    );
  }
}

async function restartMediaInput(inputName) {
  try {
    await obs.call("TriggerMediaInputAction", {
      inputName,
      mediaAction: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART",
    });
    console.log(`🔁 Restarted media input: ${inputName}`);
  } catch (error) {
    console.error(`❌ Failed to restart media input "${inputName}":`, error);
  }
}

async function setSceneItemEnabled(sceneName, sourceName, enabled) {
  const { sceneItemId } = await obs.call("GetSceneItemId", {
    sceneName,
    sourceName,
  });

  await obs.call("SetSceneItemEnabled", {
    sceneName,
    sceneItemId,
    sceneItemEnabled: enabled,
  });
}

async function getSceneItemEnabled(sceneName, sourceName) {
  try {
    const { sceneItemId } = await obs.call("GetSceneItemId", {
      sceneName,
      sourceName,
    });

    const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
      sceneName,
      sceneItemId,
    });

    return sceneItemEnabled;
  } catch (error) {
    console.error(
      `❌ Failed to get enabled state for ${sourceName} in ${sceneName}:`,
      error
    );
    return false;
  }
}

module.exports = {
  connectOBS,
  disconnectOBS,
  getOBSConnected,
  onObsStatus,
  setScene,
  getSceneAndTransitionOptions,
  saveReplayBuffer,
  onSceneChange,
  setSceneWithTransition,
  setBrowserSourceUrl,
  setBrowserSourceVisibility,
  restartMediaInput,
  setSceneItemEnabled,
  getSceneItemEnabled,
};
