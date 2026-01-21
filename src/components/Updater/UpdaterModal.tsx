import { FiDownload, FiSettings, FiZap } from "react-icons/fi";
import "./UpdaterModal.css";
import carVideo from "../../assets/car.webm";

export type UpdatePhase =
    | "checking"
    | "downloading"
    | "installing"
    | "restarting"
    | "finished";

type UpdaterModalProps = {
    phase: UpdatePhase;
};

const PHASE_MAIN_TEXT: Record<UpdatePhase, string> = {
    checking: "Checking for updates…",
    downloading: "Downloading updates…",
    installing: "Installing updates…",
    restarting: "Finishing up…",
    finished: "Enjoy your broadcast!",
};

const PHASE_SUBTEXT: Record<UpdatePhase, string> = {
    checking: "Making sure your overlay is running the latest build.",
    downloading: "Pulling in new assets and features from the CSA cloud.",
    installing: "Swapping in fresh code and tightening a few bolts.",
    restarting: "Quick reset so everything boots clean and synced.",
    finished: "You’re all set — have an amazing show.",
};

export const UpdaterModal = ({ phase }: UpdaterModalProps) => {
    const isFinished = phase === "finished";

    return (
        <div
            className="
      absolute inset-0 z-10
      flex items-center justify-center
      bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500
    "
        >
            {/* optional soft dark overlay */}
            <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

            <div
                className={`
        updater-card
        relative w-full max-w-lg mx-4
        rounded-2xl border border-white/10
        bg-slate-900/90
        shadow-2xl
        p-6 md:p-7
      `}
            >
                {/* Accent bar at top */}
                <div className="
  h-1 w-full rounded-full
  bg-gradient-to-r from-[#ff8a00] via-[#ffb347] to-[#ffe29f]
  mb-4 shadow-[0_0_12px_rgba(255,152,0,0.5)]
" />

                {/* Icon + text */}
                <div className="flex items-start gap-4">
                    <div className="updater-icon-wrapper mt-1">
                        {phase === "checking" && <FiSettings className="h-6 w-6" />}
                        {phase === "downloading" && <FiDownload className="h-6 w-6" />}
                        {phase === "installing" && <FiZap className="h-6 w-6" />}
                        {phase === "restarting" && <FiSettings className="h-6 w-6" />}
                        {phase === "finished" && (
                            <span className="updater-checkmark">✓</span>
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="updater-title text-xl md:text-2xl font-semibold mb-1">
                            {PHASE_MAIN_TEXT[phase]}
                        </h2>
                        <p className="text-sm md:text-base text-slate-300 mb-4">
                            {PHASE_SUBTEXT[phase]}
                        </p>

                        {/* Progress / status line */}
                        <div className="space-y-2">
                            {/* Progress bar shell – we’ll wire real % later */}
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                    className={`
                    updater-progress
                    h-full rounded-full
                    ${isFinished ? "updater-progress-full" : ""}
                  `}
                                />
                            </div>

                            {/* Bottom hint text */}
                            <p className="text-xs text-slate-400">
                                {phase === "checking" &&
                                    "We’ll never interrupt a live match to update."}
                                {phase === "downloading" &&
                                    "Downloading in the background. You don’t need to do anything."}
                                {phase === "installing" &&
                                    "Installing safely so your overlays and scenes stay in sync."}
                                {phase === "restarting" &&
                                    "Just refreshing the app with your new version."}
                                {phase === "finished" &&
                                    "Launching straight into your control panel…"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ✅ Car video section */}
                <div className="mt-6">
                    <div className="updater-car-track">
                        <div
                            className={
                                isFinished
                                    ? "updater-car updater-car-exit"
                                    : "updater-car updater-car-enter"
                            }
                        >
                            <div className="updater-car-video-wrap">
                                <video
                                    src={carVideo}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                    className="updater-car-video"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
