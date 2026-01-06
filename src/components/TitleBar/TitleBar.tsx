import React from "react";
import CSAIcon from "../../assets/CSAIcon.png";

type DragStyle = React.CSSProperties & {
    WebkitAppRegion?: "drag" | "no-drag";
};

const drag: DragStyle = { WebkitAppRegion: "drag" };
const noDrag: DragStyle = { WebkitAppRegion: "no-drag" };

export function TitleBar() {
    return (
        <div
            className="
        h-10 w-full flex items-center
        text-white select-none
        bg-black/10 backdrop-blur-sm
      "
        >
            {/* LEFT: app icon (non-draggable) */}
            <div
                className="h-full flex items-center px-3 gap-2"
                style={noDrag}
            >
                <img
                    src={CSAIcon}
                    alt="CSA Broadcast"
                    className="h-6 w-6"
                    draggable={false}
                />

                {/* Optional text label */}
                <span className="text-sm font-semibold opacity-90 whitespace-nowrap">
                    CSA Caster Kit
                </span>
            </div>

            {/* MIDDLE: draggable region */}
            <div className="flex-1 h-full" style={drag} />

            {/* RIGHT: window controls */}
            <div className="flex h-full" style={noDrag}>
                <button
                    type="button"
                    aria-label="Minimize"
                    onClick={() => window.windowControls.minimize()}
                    className="titlebar-btn
            w-12 h-10 flex items-center justify-center
            hover:bg-white/10
            transition-colors duration-100
          "
                >
                    <span className="text-lg leading-none opacity-90">–</span>
                </button>

                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => window.windowControls.close()}
                    className="
            titlebar-btn w-12 h-10 flex items-center justify-center
            hover:bg-red-500/90
            transition-colors duration-100
          "
                >
                    <span className="text-[15px] leading-none opacity-95">✕</span>
                </button>
            </div>
        </div>
    );
}
