import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";
import { WebsocketService } from "./services/websocketService";
import { WebsocketContext } from "./contexts/WebsocketContext";
import { TeamDataProvider } from "./contexts/ConsoleInfoContext";
import { GameInfoProvider } from "./models/contexts/GameinfoProvider";

function ControlPanelRoot() {
  useEffect(() => {
    // Rocket League relay
    WebsocketService.init(49322, false);

    return () => {
      // optional cleanup
      // WebsocketService.disconnect?.();
    };
  }, []);

  return (
    <WebsocketContext.Provider value={WebsocketService}>
      <TeamDataProvider>
        <GameInfoProvider>
          <App />
        </GameInfoProvider>
      </TeamDataProvider>
    </WebsocketContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ControlPanelRoot />
  </React.StrictMode>
);
