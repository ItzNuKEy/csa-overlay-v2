import React from "react";

type DragStyle = React.CSSProperties & {
    WebkitAppRegion?: "drag" | "no-drag";
};

const drag: DragStyle = { WebkitAppRegion: "drag" };
const noDrag: DragStyle = { WebkitAppRegion: "no-drag" };

export function TitleBar() {
    return (
        <div className="h-10 w-full flex items-center text-white select-none
                    bg-black/10 backdrop-blur-sm">
            {/* draggable region */}
            <div className="flex-1 h-full" style={drag} />

            {/* window controls */}
            <div className="flex h-full" style={noDrag}>
                <button
                    type="button"
                    aria-label="Minimize"
                    onClick={() => window.windowControls.minimize()}
                    style={{ borderRadius: 0 }}
                    className="
                    w-12 h-10 flex items-center justify-center
                    hover:bg-white/10
                    focus:outline-none focus-visible:outline-none focus:ring-0
                    active:outline-none
                    transition-colors duration-100
                "
                >

                    <span className="text-lg leading-none opacity-90">–</span>
                </button>

                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => window.windowControls.close()}
                    style={{ borderRadius: 0 }}
                    className="
                    w-12 h-10 flex items-center justify-center
                    hover:bg-red-500/90
                    focus:outline-none focus-visible:outline-none focus:ring-0
                    active:outline-none
                    transition-colors duration-100
                "
                >
                    <span className="text-[15px] leading-none opacity-95">✕</span>
                </button>
            </div>
        </div>
    );
}

