import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../index.css"; // or "./overlay.css" if you prefer

import { WebsocketService } from "../services/websocketService";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { Overlay } from "../scenes/Overlay";
import { TeamDataProvider } from "../contexts/ConsoleInfoContext";
import { GameInfoProvider } from "../models/contexts/GameinfoProvider";
import { GameService } from "../services/gameService";

function OverlayRoot() {
  // ✅ init once
  useEffect(() => {
    WebsocketService.init(49322, false);
    GameService.replayTagService.init();

    // (optional) cleanup if you have it
    return () => {
      // WebsocketService.disconnect?.();
      // GameService.replayTagService.destroy?.();
    };
  }, []);

  return (
    <WebsocketContext.Provider value={WebsocketService}>
      <TeamDataProvider>
        <GameInfoProvider>
          <Overlay />
        </GameInfoProvider>
      </TeamDataProvider>
    </WebsocketContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OverlayRoot />
  </React.StrictMode>
);
