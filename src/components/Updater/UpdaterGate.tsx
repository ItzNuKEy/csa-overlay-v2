import { useEffect, useState } from "react";
import { UpdaterModal, UpdatePhase } from "./UpdaterModal";

type UpdaterGateProps = {
    children: React.ReactNode;
};

export const UpdaterGate = ({ children }: UpdaterGateProps) => {
    const [phase, setPhase] = useState<UpdatePhase>("checking");
    const [showModal, setShowModal] = useState(true);

    useEffect(() => {
        let minVisibleTimer: number | null = null;
        let unsubscribe: (() => void) | undefined;

        // ✅ Always start with "checking"
        setPhase("checking");
        setShowModal(true);

        const MIN_VISIBLE_MS = 900;
        minVisibleTimer = window.setTimeout(() => {
            minVisibleTimer = null;
        }, MIN_VISIBLE_MS);

        if (window.updater && window.updater.onStatusChange) {
            unsubscribe = window.updater.onStatusChange(({ status }) => {
                switch (status) {
                    case "checking":
                        setPhase("checking");
                        break;

                    case "update-available":
                    case "download-progress":
                        setPhase("downloading");
                        break;

                    case "update-downloaded": {
                        // 1) Installing…
                        setPhase("installing");

                        // 2) After a beat, show “Restarting!” and actually restart
                        window.setTimeout(() => {
                            setPhase("restarting");

                            // Call into main to run quitAndInstall()
                            window.updater?.installAndRestart?.();
                            // ⬆️ App will close shortly after this; we don't need to hide modal
                        }, 900);

                        break;
                    }

                    case "update-not-available":
                    case "error": {
                        const goFinished = () => setPhase("finished");
                        if (minVisibleTimer) {
                            window.setTimeout(goFinished, 400);
                        } else {
                            goFinished();
                        }
                        break;
                    }

                    default:
                        break;
                }
            });

            // Kick off the real check
            window.updater.checkForUpdates?.();
        } else {
            // Fallback fake sequence in dev if preload/updater isn't available
            const sequence: UpdatePhase[] = [
                "checking",
                "downloading",
                "installing",
                "restarting",
                "finished",
            ];
            let idx = 0;
            setPhase(sequence[idx]);
            const interval = window.setInterval(() => {
                idx = Math.min(idx + 1, sequence.length - 1);
                setPhase(sequence[idx]);
                if (idx === sequence.length - 1) {
                    window.clearInterval(interval);
                }
            }, 2000);

            return () => window.clearInterval(interval);
        }

        return () => {
            if (unsubscribe) unsubscribe();
            if (minVisibleTimer) window.clearTimeout(minVisibleTimer);
        };
    }, []);

    // 🔹 Only hide the modal on “finished” for the “no update” path.
    // When we hit “restarting”, the app is about to close anyway.
    useEffect(() => {
        if (phase !== "finished") return;

        const timeout = window.setTimeout(() => {
            setShowModal(false);
        }, 900);

        return () => window.clearTimeout(timeout);
    }, [phase]);

    if (showModal) {
        return <UpdaterModal phase={phase} />;
    }

    // Once done (in no-update case), show the app
    return <>{children}</>;
};
