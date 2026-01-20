import { useEffect, useState } from "react";

type BakkesStatus = {
    installed: boolean;
    pluginInstalled: boolean;
};

export function BakkesmodSetupModal({
    open,
    onClose,
    onResolved,
}: {
    open: boolean;
    onClose: () => void;
    onResolved: () => void;
}) {
    const [status, setStatus] = useState<BakkesStatus | null>(null);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);

    async function refresh() {
        setChecking(true);
        try {
            const s = await window.bakkesmod?.getStatus?.();
            if (s) setStatus({ installed: s.installed, pluginInstalled: s.pluginInstalled });
        } catch (e) {
            setStatus({ installed: false, pluginInstalled: false });
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        if (open) refresh();
    }, [open]);

    const needsBakkes = status && !status.installed;
    const needsPlugin = status && status.installed && !status.pluginInstalled;
    const allGood = !!(status?.installed && status?.pluginInstalled);

    async function installSOS() {
        setInstalling(true);
        try {
            await window.bakkesmod?.installPlugin?.();
            // 🔁 just refresh UI – DO NOT close the modal here
            await refresh();
        } catch (e) {
            console.error("[BakkesmodSetupModal] installPlugin failed", e);
        } finally {
            setInstalling(false);
        }
    }

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl p-0 overflow-hidden bg-csabg-500/95 backdrop-blur-md text-white border border-white/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <p className="text-xs tracking-widest text-white/60 uppercase">
                            Setup Required
                        </p>
                        <h3 className="text-2xl font-bold">BakkesMod + SOS Plugin</h3>
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
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-white/75">
                        CSA needs <span className="font-semibold">BakkesMod</span> and the{" "}
                        <span className="font-semibold">CSA SOS Plugin</span> installed to read match
                        events and power the automation.
                    </p>

                    {checking && (
                        <div className="text-xs text-white/60">Checking your system…</div>
                    )}

                    {!checking && status && (
                        <div className="space-y-4">
                            {/* Status card */}
                            <div className="rounded-xl border border-white/15 bg-black/30 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">BakkesMod Detected</span>
                                    <span
                                        className={`text-sm font-bold ${status.installed ? "text-emerald-300" : "text-red-300"
                                            }`}
                                    >
                                        {status.installed ? "Yes" : "No"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">SOS Plugin Installed</span>
                                    <span
                                        className={`text-sm font-bold ${status.pluginInstalled ? "text-emerald-300" : "text-amber-300"
                                            }`}
                                    >
                                        {status.pluginInstalled ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>

                            {/* Needs BakkesMod */}
                            {needsBakkes && (
                                <div className="rounded-xl border border-white/15 bg-black/20 p-4 space-y-2">
                                    <p className="text-sm font-semibold text-amber-200">
                                        BakkesMod is not installed
                                    </p>
                                    <p className="text-xs text-white/65">
                                        Click below to download it, install it, then come back and hit Re-check.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            className="btn btn-sm bg-csabg-300 text-white border-0"
                                            onClick={() => window.bakkesmod?.openDownloadPage?.()}
                                        >
                                            Download BakkesMod
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm bg-white/5 text-white/80 border-0"
                                            onClick={refresh}
                                        >
                                            Re-check
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Needs SOS plugin */}
                            {needsPlugin && (
                                <div className="rounded-xl border border-white/15 bg-black/20 p-4 space-y-2">
                                    <p className="text-sm font-semibold text-amber-200">
                                        SOS plugin is missing
                                    </p>
                                    <p className="text-xs text-white/65">
                                        We can install the CSA SOS plugin automatically.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            className="btn btn-sm bg-csabg-300 text-white border-0"
                                            disabled={installing}
                                            onClick={installSOS}
                                        >
                                            {installing ? "Installing…" : "Install SOS Plugin"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm bg-white/5 text-white/80 border-0"
                                            onClick={refresh}
                                            disabled={installing}
                                        >
                                            Re-check
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ✅ Big success message */}
                            {allGood && (
                                <div className="rounded-2xl border border-emerald-400/70 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-black/40 px-4 py-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/80 shadow-[0_0_18px_rgba(16,185,129,0.75)]">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-emerald-200">
                                            All set! You can use the app successfully.
                                        </p>
                                        <p className="text-xs text-emerald-100/80">
                                            BakkesMod and the CSA SOS plugin are installed and set to auto-load.
                                            You’re ready to produce matches.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="btn btn-sm bg-white/5 text-white/80 border-0 hover:bg-white/10"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm bg-csabg-300 text-white border-0 hover:bg-csabg-200"
                        onClick={() => {
                            // ✅ Only call onResolved when everything is good
                            if (allGood) {
                                onResolved();
                            } else {
                                onClose();
                            }
                        }}
                    >
                        {allGood ? "Done" : "Skip for now"}
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} type="button">
                    close
                </button>
            </form>
        </dialog>
    );
}
