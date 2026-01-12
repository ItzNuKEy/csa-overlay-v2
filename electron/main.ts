import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { startOverlayServer } from "./overlayServer";
import fs from "node:fs";
import { ipcMain } from "electron";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import {
  startDiscordAuth,
  isUserAllowed,
  clearStaffMembersCache,
} from "./discordAuth";
import { autoUpdater } from "electron-updater";
import { dialog } from "electron";



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

ipcMain.on("win:minimize", () => win?.minimize());
ipcMain.on("win:close", () => win?.close());

ipcMain.handle("net:ping", async (_e, url: string) => {
  return await new Promise<boolean>((resolve) => {
    try {
      const u = new URL(url);
      const client = u.protocol === "https:" ? https : http;

      const req = client.request(
        {
          method: "HEAD", // fast; no body needed
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + u.search,
          timeout: 1000,
        },
        (res) => {
          res.resume();
          const code = res.statusCode ?? 0;
          resolve(code >= 200 && code < 400);
        }
      );

      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });

      req.on("error", () => resolve(false));
      req.end();
    } catch {
      resolve(false);
    }
  });
});

ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:getName", () => app.getName());
ipcMain.handle("app:isPackaged", () => app.isPackaged);

// Authentication IPC handlers
ipcMain.handle("auth:login", async () => {
  try {
    const result = await startDiscordAuth();
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error?.error || error?.message || "Authentication failed",
    };
  }
});

ipcMain.handle("auth:isUserAllowed", async (_e, userId: string) => {
  return await isUserAllowed(userId);
});

ipcMain.handle("auth:clearCache", () => {
  clearStaffMembersCache();
  return true;
});

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

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => log("[updater] checking"));
  autoUpdater.on("update-available", () => log("[updater] update available"));
  autoUpdater.on("update-not-available", () => log("[updater] no update"));
  autoUpdater.on("error", (err) => log("[updater] error", err?.message ?? err));

  autoUpdater.on("download-progress", (p) => {
    log("[updater] progress", {
      percent: Math.round(p.percent),
      transferred: p.transferred,
      total: p.total,
      bytesPerSecond: p.bytesPerSecond,
    });
  });

  autoUpdater.on("update-downloaded", async () => {
    log("[updater] downloaded");
    if (!win) return;

    const res = await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      message: "Update ready",
      detail: "Restart to install the update.",
    });

    if (res.response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
}

app.setAppUserModelId("com.playcsa.casterkit");

function createWindow() {
  win = new BrowserWindow({
    width: 830,
    height: 1020,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,                 // ✅ don't show until ready
    backgroundColor: "#111111",
    autoHideMenuBar: true,

    frame: false,

    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,    // explicit, consistent
    },
  });
  win.setMenuBarVisibility(false);

  win.once("ready-to-show", () => {
    log("[window] ready-to-show");
    win?.show();
    win?.focus();
    setupAutoUpdater();
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

  // ✅ Open DevTools in both dev and packaged modes
  // In dev mode, use "right" mode to dock it, in packaged use "detach" for separate window
  win.webContents.openDevTools({ 
    mode: app.isPackaged ? "detach" : "right" 
  });

setTimeout(() => {
  if (win && !win.isVisible()) {
    console.log("[window] forcing show after timeout");
    win.show();
    win.focus();
  }
}, 1500);

}

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

let didShutdown = false;

async function shutdown() {
  if (didShutdown) return;
  didShutdown = true;

  try { overlayWsHandle?.stop(); } catch { }
  try { relayHandle?.stop(); } catch { }
  try { await overlayServer?.close?.(); } catch { }
}

app.on("before-quit", (e) => {
  // Ensure we run shutdown once, and give it a moment to run
  // (close() is async)
  if (!didShutdown) {
    e.preventDefault();
    shutdown().finally(() => app.quit());
  }
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  shutdown().finally(() => app.quit());
});

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
  shutdown().finally(() => app.quit());
});


