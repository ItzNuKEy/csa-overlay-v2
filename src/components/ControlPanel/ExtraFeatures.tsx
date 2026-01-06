type ExtraFeaturesProps = {
    open: boolean;
    onClose: () => void;
};

export function ExtraFeatures({ open, onClose }: ExtraFeaturesProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Modal */}
            <div
                className="
          relative z-10 w-720 max-w-[92vw]
          rounded-2xl bg-csabg-500/95
          border border-white/10
          shadow-2xl
          p-6
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white/90">
                        Extra Features
                    </h2>

                    <button
                        aria-label="Close Overlay Setup"
                        onClick={onClose}
                        className="
              h-9 w-9 rounded-md
              flex items-center justify-center
              hover:bg-white/10
              transition-colors
              text-white/90
            "
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="text-white/80 space-y-4">
                    <p className="text-sm">
                        This is where extra features info will live.
                    </p>

                    <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                        Placeholder content
                    </div>
                </div>
            </div>
        </div>
    );
}
