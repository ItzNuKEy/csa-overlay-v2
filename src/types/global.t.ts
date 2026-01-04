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
    }
}
