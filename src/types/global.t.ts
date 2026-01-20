import type { ObsAutomationSettings } from "../components/ControlPanel/ExtraFeatures";

export { };

declare global {
    interface Window {
        downloads?: {
            downloadCasterBgKit: () => Promise<
                | { cancelled: true }
                | { cancelled: false; filePath: string }
            >;
        };
        bakkesmod?: {
            getStatus: () => Promise<{
                installed: boolean;
                pluginInstalled: boolean;
                paths: any | null;
            }>;
            installPlugin: () => Promise<any>;
            openDownloadPage: () => void;
        };
        obsAutomation: {
            getSettings: () => Promise<ObsAutomationSettings>;
            saveSettings: (
                settings: ObsAutomationSettings
            ) => Promise<{ ok: boolean }>;
            setEnabledEphemeral: (enabled: boolean) => Promise<{ ok: boolean }>;
            getObsState: () => Promise<{
                connected: boolean;
                scenes: string[];
                transitions: string[];
                currentProgramSceneName?: string;
                currentTransitionName?: string;
            }>;
        };
        net: {
            ping: (url: string) => Promise<boolean>;
        };
        windowControls: {
            minimize: () => void;
            close: () => void;
        };
        appInfo: {
            getVersion: () => Promise<string>;
            getName: () => Promise<string>;
            isPackaged: () => Promise<boolean>;
        };
        auth: {
            login: () => Promise<{ success: boolean; user?: DiscordUser; error?: string }>;
            isUserAllowed: (userId: string) => Promise<boolean>;
            clearCache: () => Promise<boolean>;
        };
    }
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}
