import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { startOverlayServer } from "./overlayServer";
import fs from "node:fs";

function log(...args: any[]) {
  const line = new Date().toISOString() + " " + args.map(a =>
    typeof a === "string" ? a : JSON.stringify(a)
  ).join(" ") + "\n";
  try {
    fs.appendFileSync(path.join(app.getPath("userData"), "main.log"), line);
  } catch {}
}

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = app.isPackaged
  ? app.getAppPath() // .../resources/app.asar
  : path.join(__dirname, "..");

const RESOURCES_ROOT = app.isPackaged
  ? process.resourcesPath // .../resources
  : path.join(__dirname, "..");

process.env.APP_ROOT = APP_ROOT;

console.log("[packaging] isPackaged:", app.isPackaged);
console.log("[packaging] APP_ROOT (asar):", APP_ROOT);
console.log("[packaging] RESOURCES_ROOT:", RESOURCES_ROOT);

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(APP_ROOT, "dist");

let win: BrowserWindow | null = null;
let overlayServer: ReturnType<typeof startOverlayServer> | null = null;
let relayHandle: { stop: () => void } | null = null;
let overlayWsHandle: { stop: () => void } | null = null;

// Optional: fixes "window exists but invisible" on some Windows setups
if (app.isPackaged) {
  app.disableHardwareAcceleration();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    } else {
      createWindow();
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,                 // ✅ don't show until ready
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,    // explicit, consistent
    },
  });

  win.once("ready-to-show", () => {
    log("[window] ready-to-show");
    win?.show();
    win?.focus();
  });

  win.on("closed", () => {
    log("[window] closed");
    win = null;
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
  log("[did-fail-load]", code, desc, url);
});

win.webContents.on("render-process-gone", (_e, details) => {
  log("[render-process-gone]", details);
});

  // Helpful lifecycle logs
  win.webContents.on("did-start-loading", () => console.log("[window] did-start-loading"));
  win.webContents.on("did-finish-load", () => console.log("[window] did-finish-load"));

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(RENDERER_DIST, "index.html");
    console.log("[loadFile]", indexPath);

    // ✅ if this rejects, you'll finally SEE the error
    win.loadFile(indexPath).catch((err) => log("[loadFile error]", err?.message ?? err));
  }

  if (app.isPackaged) {
  win.webContents.openDevTools({ mode: "detach" });
}

setTimeout(() => {
  if (win && !win.isVisible()) {
    console.log("[window] forcing show after timeout");
    win.show();
    win.focus();
  }
}, 1500);

}


app.on("before-quit", async () => {
  overlayWsHandle?.stop();
  relayHandle?.stop();
  await overlayServer?.close?.();
});

const SERVICES_ROOT = app.isPackaged
  ? path.join(process.resourcesPath, "electron-services") // packaged: resources/electron-services
  : path.join(process.cwd(), "electron", "electron-services"); // dev: project/electron/electron-services

function safeStartService(name: "ws-relay.cjs" | "server.cjs") {
  const fullPath = path.join(SERVICES_ROOT, name);
  log("[service] loading", fullPath);

  try {
    if (!app.isPackaged) {
      try { delete require.cache[require.resolve(fullPath)]; } catch {}
    }

    const mod = require(fullPath);
    if (!mod?.start) throw new Error(`${name} does not export start()`);

    const handle = mod.start();
    log("[service] started", name);
    return handle as { stop: () => void };
  } catch (err: any) {
    log("[service] FAILED", name, err?.message ?? err);
    throw err;
  }
}

app.whenReady().then(() => {
  overlayServer = startOverlayServer({ port: 3199, rootDir: RENDERER_DIST });

  relayHandle = safeStartService("ws-relay.cjs");
  overlayWsHandle = safeStartService("server.cjs");

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function shutdown() {
  try { overlayWsHandle?.stop(); } catch {}
  try { relayHandle?.stop(); } catch {}
  try { overlayServer?.close?.(); } catch {}
}

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  shutdown();
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
  shutdown();
  app.quit();
});

