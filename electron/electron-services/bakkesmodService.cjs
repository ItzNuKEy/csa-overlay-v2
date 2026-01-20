// electron/electron-services/bakkesmodService.cjs
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const { app } = require("electron");


/**
 * Locate BakkesMod base folder from APPDATA.
 * Windows only for now.
 */
function getBakkesRootDir() {
    const appData = process.env.APPDATA; // e.g. C:\Users\You\AppData\Roaming
    if (!appData) return null;
    return path.join(appData, "bakkesmod");
}

/**
 * Returns key BakkesMod paths, or null if we can't even derive them.
 */
function getBakkesPaths() {
    const root = getBakkesRootDir();
    if (!root) return null;

    const bmDir = path.join(root, "bakkesmod");
    const pluginsDir = path.join(bmDir, "plugins");
    const settingsDir = path.join(pluginsDir, "settings");
    const cfgDir = path.join(bmDir, "cfg");
    const pluginsCfg = path.join(cfgDir, "plugins.cfg");
    const exePath = path.join(root, "bakkesmod.exe");

    const dllPath = path.join(pluginsDir, "SOS.dll");
    const setPath = path.join(settingsDir, "SOS.set");

    return {
        root,
        bmDir,
        pluginsDir,
        settingsDir,
        cfgDir,
        pluginsCfg,
        exePath,
        dllPath,
        setPath,
    };
}

async function fileExists(p) {
    try {
        await fsp.access(p, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Ensure a directory exists.
 */
async function ensureDir(dir) {
    await fsp.mkdir(dir, { recursive: true });
}

/**
 * Ensure a specific line exists in a file.
 * Creates the file if it doesn't exist.
 */
async function ensureLineInFile(filePath, lineToAdd) {
    let content = "";
    try {
        content = await fsp.readFile(filePath, "utf8");
    } catch {
        // file might not exist; start with empty
        content = "";
    }

    const lines = content.split(/\r?\n/);
    const trimmed = lineToAdd.trim();

    if (!lines.some((l) => l.trim() === trimmed)) {
        const needsNewline = content.length > 0 && !content.endsWith("\n");
        const prefix = needsNewline ? "\n" : "";
        const updated = content + prefix + lineToAdd + "\n";
        await fsp.writeFile(filePath, updated, "utf8");
    }
}

/**
 * Get current status of BakkesMod + SOS plugin.
 * Returns shape:
 * {
 *   installed: boolean;
 *   pluginInstalled: boolean;
 *   paths: { ... } | null;
 * }
 */
async function getStatus() {
    const paths = getBakkesPaths();
    if (!paths) {
        return {
            installed: false,
            pluginInstalled: false,
            paths: null,
        };
    }

    const installed =
        (await fileExists(paths.exePath)) ||
        (await fileExists(paths.pluginsDir));

    const dllExists = await fileExists(paths.dllPath);
    const setExists = await fileExists(paths.setPath);

    const pluginInstalled = installed && dllExists && setExists;

    return {
        installed,
        pluginInstalled,
        paths,
    };
}

/**
 * Install SOS.dll + SOS.set into BakkesMod folders
 * and ensure "plugin load sos" is present in plugins.cfg.
 */
async function installPlugin() {
    const status = await getStatus();

    if (!status.installed) {
        throw new Error("BakkesMod not detected on this system.");
    }

    const { paths } = status;

    await ensureDir(paths.pluginsDir);
    await ensureDir(paths.settingsDir);
    await ensureDir(paths.cfgDir);

    // Where the plugin is shipped inside your app:
    const sourceRoot = app.isPackaged
        ? path.join(process.resourcesPath, "bakkesmod")             // ✅ packaged build (extraResources)
        : path.join(process.cwd(), "resources", "bakkesmod");       // ✅ dev (your repo folder)

    const dllSource = path.join(sourceRoot, "SOS.dll");
    const setSource = path.join(sourceRoot, "sos.set");

    if (!(await fileExists(dllSource))) {
        throw new Error(`Missing SOS.dll at: ${dllSource}`);
    }
    if (!(await fileExists(setSource))) {
        throw new Error(`Missing sos.set at: ${setSource}`);
    }

    // Copy files
    await fsp.copyFile(dllSource, paths.dllPath);
    await fsp.copyFile(setSource, paths.setPath);

    // Auto-load on BakkesMod start
    await ensureLineInFile(paths.pluginsCfg, "plugin load sos");

    return {
        success: true,
        dllPath: paths.dllPath,
        setPath: paths.setPath,
        pluginsCfg: paths.pluginsCfg,
    };
}

module.exports = {
    getStatus,
    installPlugin,
};
