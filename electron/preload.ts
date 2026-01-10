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
    clearCache: () => ipcRenderer.invoke("auth:clearCache") as Promise<boolean>,
  });

} catch (err) {
  console.error("[preload] failed:", err);
}
