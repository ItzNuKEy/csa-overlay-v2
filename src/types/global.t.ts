export { };

declare global {
    interface Window {
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
