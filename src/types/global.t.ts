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
    }
}
