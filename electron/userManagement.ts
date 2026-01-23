import { BrowserWindow, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canManageUsers } from "./discordAuth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = process.env.APP_ROOT || path.join(__dirname, "..");
const RENDERER_DIST = path.join(APP_ROOT, "dist");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

export async function createUserManagementWindow(discordId?: string): Promise<BrowserWindow | null> {
  // If discordId is provided, verify permissions before opening
  if (discordId) {
    const hasPermission = await canManageUsers(discordId);
    if (!hasPermission) {
      dialog.showErrorBox(
        "Access Denied",
        "You do not have permission to manage users."
      );
      return null;
    }
  }

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load user management React component
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}/user-management`);
  } else {
    // In production, load index.html and navigate to /user-management
    const indexPath = path.join(RENDERER_DIST, "index.html");
    win.loadFile(indexPath).then(() => {
      // Navigate to user-management route after page loads
      win.webContents.executeJavaScript(`
        window.history.pushState({}, '', '/user-management');
        window.dispatchEvent(new PopStateEvent('popstate'));
      `);
    });
  }

  return win;
}
