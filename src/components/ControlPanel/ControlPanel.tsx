import { useState } from "react";
import { OverlayControls } from "./OverlayControls/OverlayControls";
import { Page, Main, BottomBar, BottomBarInner } from "./ControlPanel.style";

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
    <Page>
      <Main>
        <OverlayControls overlayState={overlayState} setOverlayState={setOverlayState} />
      </Main>

      {/* ✅ Keep the lower bar area (empty for now) */}
      <BottomBar>
        <BottomBarInner>
          {/* Intentionally empty – reserved for future connection/status UI */}
        </BottomBarInner>
      </BottomBar>
    </Page>
  );
};
