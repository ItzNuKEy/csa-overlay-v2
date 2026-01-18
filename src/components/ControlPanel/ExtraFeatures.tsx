import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";

export type ObsAutomationMode = "matchStartOnly" | "endgameOnly" | "both";

export interface ObsAutomationSettings {
    enabled: boolean;
    mode: ObsAutomationMode;
    liveTransition: string;
    endgameTransition: string;
    liveScene: string;
    endgameScene: string;
}

type Props = {
    open: boolean;
    onClose: () => void;
    initialSettings: ObsAutomationSettings;
    onSave: (settings: ObsAutomationSettings) => void;
    onEnabledChange?: (enabled: boolean) => void;  // 👈 NEW
};

const FALLBACK_TRANSITIONS = ["CSAStinger", "Fade", "Cut"];

export function ExtraFeatures({
    open,
    onClose,
    initialSettings,
    onSave,
    onEnabledChange,   // 👈 grab it here
}: Props) {
    const [settings, setSettings] = useState<ObsAutomationSettings>(initialSettings);
    const [saving, setSaving] = useState(false);

    const [availableScenes, setAvailableScenes] = useState<string[]>([]);
    const [availableTransitions, setAvailableTransitions] =
        useState<string[]>(FALLBACK_TRANSITIONS);
    const [obsStatus, setObsStatus] = useState<
        "idle" | "loading" | "connected" | "error"
    >("idle");

    // sync when parent changes (e.g. first open or reload)
    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    // Whenever the modal is open & automation is enabled, try to poll OBS
    useEffect(() => {
        if (!open || !settings.enabled) {
            setObsStatus("idle");
            return;
        }

        let cancelled = false;

        async function fetchObsState() {
            setObsStatus("loading");
            try {
                const state = await window.obsAutomation?.getObsState?.();
                if (!state || cancelled) return;

                if (!state.connected) {
                    // Give OBS a moment to finish connecting, then try once more
                    console.log("[ExtraFeatures] OBS not connected yet, retrying in 1s…");
                    setObsStatus("loading");
                    setTimeout(() => {
                        if (!cancelled) {
                            fetchObsState();
                        }
                    }, 1000);
                    return;
                }


                setObsStatus("connected");
                const scenes = state.scenes ?? [];
                const transitions =
                    state.transitions && state.transitions.length
                        ? state.transitions
                        : FALLBACK_TRANSITIONS;

                setAvailableScenes(scenes);
                setAvailableTransitions(transitions);

                // Auto-fill scene names if they’re blank
                setSettings((prev) => ({
                    ...prev,
                    liveScene:
                        prev.liveScene ||
                        state.currentProgramSceneName ||
                        scenes[0] ||
                        "",
                    endgameScene:
                        prev.endgameScene ||
                        scenes.find((n) => n.toLowerCase().includes("end")) ||
                        scenes.find((n) => n.toLowerCase().includes("stats")) ||
                        scenes[1] ||
                        prev.endgameScene,
                    liveTransition:
                        prev.liveTransition ||
                        state.currentTransitionName ||
                        transitions[0] ||
                        "",
                    endgameTransition:
                        prev.endgameTransition || transitions[0] || "",
                }));
            } catch (err) {
                console.error("[ExtraFeatures] failed to fetch OBS state", err);
                if (!cancelled) {
                    setObsStatus("error");
                    setAvailableScenes([]);
                    setAvailableTransitions(FALLBACK_TRANSITIONS);
                }
            }
        }

        fetchObsState();

        return () => {
            cancelled = true;
        };
    }, [open, settings.enabled]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(settings);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnabled = async (checked: boolean) => {
        // update local state
        setSettings((s) => ({ ...s, enabled: checked }));

        // immediately tell parent (ControlPanel) so it can show/hide the pill
        onEnabledChange?.(checked);

        try {
            await window.obsAutomation?.setEnabledEphemeral(checked);
        } catch (err) {
            console.error("[ExtraFeatures] failed to toggle OBS automation", err);
        }
    };


    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-3xl p-0 overflow-hidden bg-csabg-500/95 backdrop-blur-md text-white border border-white/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <p className="text-xs tracking-widest text-white/60 uppercase">
                            Extra Features
                        </p>
                        <h3 className="text-2xl font-bold">OBS Automation</h3>
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
                        <p className="text-lg font-semibold">
                            Let the app swap your OBS scenes automatically.
                        </p>
                        <p className="text-white/70 text-sm">
                            When enabled, the app listens to game events and switches between{" "}
                            <span className="font-semibold">LIVEMATCH</span> and{" "}
                            <span className="font-semibold">ENDGAME</span> scenes for you.
                        </p>
                    </div>

                    {/* tiny status line */}
                    {settings.enabled && (
                        <p className="text-[11px] text-white/60">
                            {obsStatus === "loading" && "Checking OBS for scenes & transitions…"}
                            {obsStatus === "connected" && "OBS connected · scenes loaded."}
                            {obsStatus === "error" &&
                                "Could not read scenes/transitions from OBS. Make sure OBS WebSocket is enabled and connected."}
                        </p>
                    )}

                    <div className="h-px bg-white/10" />

                    {/* Main toggle */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold">Enable OBS Automation</p>
                            <p className="text-xs text-white/65 max-w-md">
                                Toggle this on to let the app control OBS via the OBS WebSocket.
                                You can customize how aggressive the automation is below.
                            </p>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                                {settings.enabled ? "On" : "Off"}
                            </span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={settings.enabled}
                                onChange={(e) => handleToggleEnabled(e.target.checked)}
                            />
                        </label>
                    </div>

                    {/* When disabled, dim the options */}
                    <div
                        className={`mt-3 rounded-xl border border-white/10 bg-black/15 p-4 space-y-4 transition-opacity ${settings.enabled
                                ? "opacity-100"
                                : "opacity-40 pointer-events-none"
                            }`}
                    >
                        {/* Mode */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Automation Mode</p>
                            <p className="text-xs text-white/65">
                                Choose when the app should swap scenes for you. Then Select {" "}
                                <span className="text-xs font-bold text-white/65">Apply & Save.</span>
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSettings((s) => ({ ...s, mode: "matchStartOnly" }))
                                    }
                                    className={`btn btn-xs md:btn-sm border-0 ${settings.mode === "matchStartOnly"
                                            ? "bg-csabg-300 text-white"
                                            : "bg-white/5 text-white/75 hover:bg-white/10"
                                        }`}
                                >
                                    Live Match Only
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSettings((s) => ({ ...s, mode: "endgameOnly" }))
                                    }
                                    className={`btn btn-xs md:btn-sm border-0 ${settings.mode === "endgameOnly"
                                            ? "bg-csabg-300 text-white"
                                            : "bg-white/5 text-white/75 hover:bg-white/10"
                                        }`}
                                >
                                    Endgame Only
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSettings((s) => ({ ...s, mode: "both" }))
                                    }
                                    className={`btn btn-xs md:btn-sm border-0 ${settings.mode === "both"
                                            ? "bg-csabg-300 text-white"
                                            : "bg-white/5 text-white/75 hover:bg-white/10"
                                        }`}
                                >
                                    Live Match + Endgame
                                </button>
                            </div>
                        </div>

                        {/* Scenes + Transitions */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Live match scene */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                                    Live Match Scene
                                </p>
                                <select
                                    className="select select-sm w-full bg-black/40 border border-white/15 text-sm"
                                    value={settings.liveScene}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            liveScene: e.target.value,
                                        }))
                                    }
                                >
                                    {availableScenes.length === 0 ? (
                                        <option value="">No scenes found</option>
                                    ) : (
                                        availableScenes.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-[11px] text-white/60">
                                    Scene used for in-game gameplay.
                                </p>
                            </div>

                            {/* Endgame scene */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                                    Endgame Scene
                                </p>
                                <select
                                    className="select select-sm w-full bg-black/40 border border-white/15 text-sm"
                                    value={settings.endgameScene}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            endgameScene: e.target.value,
                                        }))
                                    }
                                >
                                    {availableScenes.length === 0 ? (
                                        <option value="">No scenes found</option>
                                    ) : (
                                        availableScenes.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-[11px] text-white/60">
                                    Scene used for post-game statistics / analysis.
                                </p>
                            </div>

                            {/* Live match transition */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                                    Live Match Transition
                                </p>
                                <select
                                    className="select select-sm w-full bg-black/40 border border-white/15 text-sm"
                                    value={settings.liveTransition}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            liveTransition: e.target.value,
                                        }))
                                    }
                                >
                                    {availableTransitions.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-white/60">
                                    Used when a match begins (e.g. game pre-countdown).
                                </p>
                            </div>

                            {/* Endgame transition */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                                    Endgame Transition
                                </p>
                                <select
                                    className="select select-sm w-full bg-black/40 border border-white/15 text-sm"
                                    value={settings.endgameTransition}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            endgameTransition: e.target.value,
                                        }))
                                    }
                                >
                                    {availableTransitions.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-white/60">
                                    Used when the match ends and you swap to End Game Stats.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-[11px] text-white/65">
                        OBS WebSocket must be enabled in OBS and listening on the same port
                        you’ve configured for this app.
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <p className="text-xs text-white/55 max-w-sm">
                        Saving will keep OBS Automation enabled/disabled next time you
                        launch the application. You can change this at any time.
                    </p>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm bg-white/5 text-white/80 border-0 hover:bg-white/10"
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-sm bg-csabg-300 text-white border-0 hover:bg-csabg-200 flex items-center gap-2"
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <FiSave />
                            {saving ? "Saving..." : "Apply & Save"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} type="button">
                    close
                </button>
            </form>
        </dialog>
    );
}
