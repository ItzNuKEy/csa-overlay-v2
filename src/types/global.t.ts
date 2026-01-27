import type { ObsAutomationSettings } from "../components/ControlPanel/ExtraFeatures";

export { };

declare global {
    interface Window {
        updater?: {
            onStatusChange: (
                cb: (data: { status: string; payload?: unknown }) => void
            ) => () => void;
            checkForUpdates: () => Promise<void>;
            installAndRestart: () => Promise<void>;
        };
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
            canManageUsers: (userId: string) => Promise<boolean>;
            clearCache: () => Promise<boolean>;
        };
        userManagement?: {
            open: (discordId?: string) => Promise<boolean>;
        };
        userManagementApi?: {
            fetchUsers: () => Promise<any[]>;
            createUser: (discordId: string, username?: string) => Promise<any>;
            updateUser: (discordId: string, updates: any) => Promise<any>;
            deleteUser: (discordId: string) => Promise<void>;
            fetchAccessRequests: (status?: string) => Promise<any[]>;
            approveAccessRequest: (discordId: string, notes?: string) => Promise<any>;
            denyAccessRequest: (discordId: string, notes?: string) => Promise<any>;
        };
        shell?: {
            openExternal: (url: string) => Promise<void>;
        };
    }
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}
