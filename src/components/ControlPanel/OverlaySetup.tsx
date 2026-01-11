import { FiCopy } from "react-icons/fi";

type Props = {
    open: boolean;
    onClose: () => void;
    overlayUrl: string;   // e.g. http://127.0.0.1:3199/overlay.html
    endgameUrl: string;   // e.g. http://127.0.0.1:3199/endgame.html
};

export function OverlaySetupModal({ open, onClose, overlayUrl, endgameUrl }: Props) {
    const copy = async (text: string) => {
        try { await navigator.clipboard.writeText(text); } catch { }
    };

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-3xl p-0 overflow-hidden bg-csabg-500/95 backdrop-blur-md text-white border border-white/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <p className="text-xs tracking-widest text-white/60 uppercase">Overlays Setup</p>
                        <h3 className="text-2xl font-bold">Setup the Overlay!</h3>
                    </div>

                    <button
                        className="btn btn-sm btn-ghost text-white/80 hover:bg-white/10"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Intro */}
                    <div className="space-y-2">
                        <p className="text-lg font-semibold">Setting up the Overlay for casting is extremely simple.</p>
                        <p className="text-white/70">
                            Follow the steps below and you’ll be live in a minute.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/10" />

                    {/* Steps */}
                    <div className="space-y-3">
                        <h4 className="text-sm tracking-widest text-white/60 uppercase">Quick Steps</h4>

                        <ul className="list-disc pl-6 space-y-2 text-white/85">
                            <li>
                                In OBS, add a <span className="font-semibold">Browser Source</span> to your scene with Rocket League underneath the browser source.
                            </li>
                            <li>
                                Paste the <span className="font-semibold">Overlay URL</span> below and set the size to the recommended resolution.
                            </li>
                            <li>
                                Add the <span className="font-semibold">Endgame</span> Browser Source in your Endgame scene using the Endgame URL.
                            </li>
                        </ul>
                    </div>

                    {/* URLs */}
                    <div className="grid gap-3 md:grid-cols-2">
                        {/* Overlay URL card */}
                        <div className="rounded-xl bg-black/20 border border-white/10 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">Overlay URL</p>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-xs bg-white/10 border-0 hover:bg-white/15"
                                        onClick={() => copy(overlayUrl)}
                                        type="button"
                                    >
                                        <FiCopy /> Copy
                                    </button>
                                </div>
                            </div>

                            <div className="font-mono text-xs text-white/80 break-all bg-black/20 rounded-lg p-2">
                                {overlayUrl}
                            </div>

                            <div className="text-xs text-white/60">
                                Recommended size: <span className="text-white/80">1920×1080</span>
                            </div>
                        </div>

                        {/* Endgame URL card */}
                        <div className="rounded-xl bg-black/20 border border-white/10 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">Endgame URL</p>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-xs bg-white/10 border-0 hover:bg-white/15"
                                        onClick={() => copy(endgameUrl)}
                                        type="button"
                                    >
                                        <FiCopy /> Copy
                                    </button>
                                </div>
                            </div>

                            <div className="font-mono text-xs text-white/80 break-all bg-black/20 rounded-lg p-2">
                                {endgameUrl}
                            </div>

                            <div className="text-xs text-white/60">
                                Recommended size: <span className="text-white/80">1920×1080</span>
                            </div>
                        </div>
                    </div>

                    {/* Connection Key */}
                    <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                        <p className="font-semibold mb-3">Connection Key</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            {/* Red */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <span
                                    className="h-5 w-5 rounded-sm bg-red-500"
                                    aria-label="Red"
                                    title="Red"
                                />
                                <div className="text-white/80">
                                    <span className="block font-semibold text-white/90">Red</span>
                                    <span className="block">
                                        Failed to Start
                                    </span>
                                </div>
                            </div>

                            {/* Yellow */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <span
                                    className="h-5 w-5 rounded-sm bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]"
                                    aria-label="Yellow"
                                    title="Yellow"
                                />
                                <div className="text-white/80">
                                    <span className="block font-semibold text-white/90">Yellow</span>
                                    <span className="block">
                                        Waiting to Connect
                                    </span>
                                </div>
                            </div>

                            {/* Green */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <span
                                    className="h-5 w-5 rounded-sm bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                                    aria-label="Green"
                                    title="Green"
                                />
                                <div className="text-white/80">
                                    <span className="block font-semibold text-white/90">Green</span>
                                    <span className="block">
                                        Connected
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Troubleshooting */}
                    <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                        <p className="font-semibold mb-2">Troubleshooting</p>

                        <ul className="list-disc pl-6 space-y-1 text-sm text-white/75">
                            <li>
                                If nothing shows up but the app is running:{" "}
                                <span className="text-white/85 font-semibold">Refresh the Browser Source</span> in OBS
                                (Right-click → “Refresh cache of current page”).
                            </li>

                            <li>
                                <span className="text-white/85 font-semibold">Red light = Restart.</span>{" "}
                                Something didn’t start correctly. Close and relaunch the app.
                                If it happens more than twice,{" "}
                                <span className="text-white/85 font-semibold">contact NuKEy.</span>
                            </li>

                            <li>
                                Rocket League connection issues? Make sure{" "}
                                <span className="text-white/85 font-semibold">BakkesMod is launched</span> and connected to the game.
                            </li>

                            <li>
                                Any other issues: reach out to{" "}
                                <span className="text-white/85 font-semibold">NuKEy</span> for guidance.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
                    {/* Left note */}
                    <p className="text-xs text-white/55 max-w-md">
                        If you’re stuck, include a screenshot of the three status lights when messaging NuKEy.
                    </p>

                    {/* Right action */}
                    <button
                        className="btn bg-csabg-300 text-white border-0 hover:bg-csabg-200 shrink-0"
                        onClick={onClose}
                        type="button"
                    >
                        Done
                    </button>
                </div>
            </div>

            {/* Backdrop click closes */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} type="button">close</button>
            </form>
        </dialog>
    );
}
