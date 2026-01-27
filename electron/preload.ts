import { ipcRenderer, contextBridge } from "electron";

try {
  contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args;
      return ipcRenderer.on(channel, (event, ...rest) => listener(event, ...rest));
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args;
      return ipcRenderer.off(channel, ...omit);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args;
      return ipcRenderer.send(channel, ...omit);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
    },
  });

  contextBridge.exposeInMainWorld("updater", {
    onStatusChange: (
      callback: (data: { status: string; payload?: unknown }) => void
    ) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        data: { status: string; payload?: unknown }
      ) => {
        callback(data);
      };

      ipcRenderer.on("updater:status", listener);

      // return unsubscribe fn
      return () => {
        ipcRenderer.off("updater:status", listener);
      };
    },

    checkForUpdates: () => ipcRenderer.invoke("updater:check"),

    installAndRestart: () =>
      ipcRenderer.invoke("updater:installAndRestart"),
  });


  contextBridge.exposeInMainWorld("bakkesmod", {
    getStatus: () => ipcRenderer.invoke("bakkesmod:getStatus"),
    installPlugin: () => ipcRenderer.invoke("bakkesmod:installPlugin"),
    openDownloadPage: () => ipcRenderer.invoke("bakkesmod:openDownloadPage"),
  });

  contextBridge.exposeInMainWorld("downloads", {
    downloadCasterBgKit: () => ipcRenderer.invoke("download-caster-bg-kit"),
  });

  contextBridge.exposeInMainWorld("net", {
    ping: (url: string) => ipcRenderer.invoke("net:ping", url),
  });

  contextBridge.exposeInMainWorld("windowControls", {
    minimize: () => ipcRenderer.send("win:minimize"),
    close: () => ipcRenderer.send("win:close"),
  });

  contextBridge.exposeInMainWorld("appInfo", {
    getVersion: () => ipcRenderer.invoke("app:getVersion") as Promise<string>,
    getName: () => ipcRenderer.invoke("app:getName") as Promise<string>,
    isPackaged: () => ipcRenderer.invoke("app:isPackaged") as Promise<boolean>,
  });

  contextBridge.exposeInMainWorld("auth", {
    login: () => ipcRenderer.invoke("auth:login") as Promise<{ success: boolean; user?: any; error?: string }>,
    isUserAllowed: (userId: string) => ipcRenderer.invoke("auth:isUserAllowed", userId) as Promise<boolean>,
    canManageUsers: (userId: string) => ipcRenderer.invoke("auth:canManageUsers", userId) as Promise<boolean>,
    clearCache: () => ipcRenderer.invoke("auth:clearCache") as Promise<boolean>,
    requestAccess: (discordId: string, username: string | null) => ipcRenderer.invoke("auth:requestAccess", discordId, username) as Promise<{ success: boolean; error?: string; hasPendingRequest?: boolean }>,
    checkPendingRequest: (discordId: string) => ipcRenderer.invoke("auth:checkPendingRequest", discordId) as Promise<{ hasPendingRequest: boolean; request?: any }>,
  });

  contextBridge.exposeInMainWorld("userManagement", {
    open: (discordId?: string) => ipcRenderer.invoke("open-user-management", discordId) as Promise<boolean>,
  });

  contextBridge.exposeInMainWorld("userManagementApi", {
    fetchUsers: () => ipcRenderer.invoke("userManagementApi:fetchUsers") as Promise<any[]>,
    createUser: (discordId: string, username?: string) => ipcRenderer.invoke("userManagementApi:createUser", discordId, username) as Promise<any>,
    updateUser: (discordId: string, updates: any) => ipcRenderer.invoke("userManagementApi:updateUser", discordId, updates) as Promise<any>,
    deleteUser: (discordId: string) => ipcRenderer.invoke("userManagementApi:deleteUser", discordId) as Promise<void>,
    fetchAccessRequests: (status?: string) => ipcRenderer.invoke("userManagementApi:fetchAccessRequests", status) as Promise<any[]>,
    approveAccessRequest: (discordId: string, notes?: string) => ipcRenderer.invoke("userManagementApi:approveAccessRequest", discordId, notes) as Promise<any>,
    denyAccessRequest: (discordId: string, notes?: string) => ipcRenderer.invoke("userManagementApi:denyAccessRequest", discordId, notes) as Promise<any>,
  });

  contextBridge.exposeInMainWorld("shell", {
    openExternal: (url: string) => ipcRenderer.invoke("open-external-url", url) as Promise<void>,
  });

  contextBridge.exposeInMainWorld("obsAutomation", {
    getSettings: () =>
      ipcRenderer.invoke("obsAutomation:getSettings") as Promise<{
        enabled: boolean;
        mode: "matchStartOnly" | "endgameOnly" | "both";
        liveTransition: string;
        endgameTransition: string;
        liveScene: string;
        endgameScene: string;
      }>,

    saveSettings: (settings: {
      enabled: boolean;
      mode: "matchStartOnly" | "endgameOnly" | "both";
      liveTransition: string;
      endgameTransition: string;
      liveScene: string;
      endgameScene: string;
    }) => ipcRenderer.invoke("obsAutomation:saveSettings", settings),

    // 👇 NEW: immediate toggle without saving
    setEnabledEphemeral: (enabled: boolean) =>
      ipcRenderer.invoke("obsAutomation:setEnabledEphemeral", enabled),

    // 👇 NEW: pull scenes + transitions from OBS
    getObsState: () =>
      ipcRenderer.invoke("obsAutomation:getObsState") as Promise<{
        connected: boolean;
        scenes: string[];
        transitions: string[];
        currentProgramSceneName?: string;
        currentTransitionName?: string;
      }>,
  });

} catch (err) {
  console.error("[preload] failed:", err);
}
