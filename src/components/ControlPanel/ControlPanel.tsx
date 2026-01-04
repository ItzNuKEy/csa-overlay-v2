import { useState } from "react";
import { OverlayControls } from "./OverlayControls/OverlayControls";

type OverlayState = {
  blueTeamId: string;
  orangeTeamId: string;
  blueCustomName: string;
  orangeCustomName: string;
  seriesLength: number;
  blueTimeoutAvailable: boolean;
  orangeTimeoutAvailable: boolean;
  blueSeriesScore: number;
  orangeSeriesScore: number;
  topBarText: string;
  gameNumber: string;
};

export const ControlPanel = () => {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    blueTeamId: "CSABlue",
    orangeTeamId: "CSAOrange",
    blueCustomName: "",
    orangeCustomName: "",
    seriesLength: 5,
    blueTimeoutAvailable: false,
    orangeTimeoutAvailable: false,
    blueSeriesScore: 0,
    orangeSeriesScore: 0,
    topBarText: "",
    gameNumber: "",
  });

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-hidden">
      {/* TOP PANEL */}
      <div className="flex-1 bg-csabg-500/85 rounded-2xl overflow-hidden">
        <OverlayControls overlayState={overlayState} setOverlayState={setOverlayState} />
      </div>

      {/* BOTTOM BAR */}
      <div className="h-30 bg-csabg-500/85 rounded-2xl shrink-0">
        {/* lower bar content */}
      </div>
    </div>
  );
};
