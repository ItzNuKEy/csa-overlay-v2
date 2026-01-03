import { useContext, useEffect, useRef } from "react";
import { WebsocketContext } from "../src/contexts/WebsocketContext";
import { GameInfoContext } from "../src/contexts/GameInfoContext";
import { UpdateState } from "../src/models/UpdateState/UpdateState";
import { ControlPanel } from "../src/components/ControlPanel/ControlPanel"; // ✅ Adjust path as needed

export const ControlPanelGameListener = () => {
  const websocket = useContext(WebsocketContext);
  const { setGameInfo } = useContext(GameInfoContext);
  const subscribedRef = useRef(false);

  // 🔹 Subscribe to SOS game state updates
  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    websocket.subscribe("game", "update_state", (data: UpdateState) => {
      setGameInfo((prev) => ({
        ...prev,
        arena: data.game.arena,
        isOT: data.game.isOT,
        isReplay: data.game.isReplay,
        target: data.game.target,
        timeRemaining: data.game.time_seconds,
        winner: data.game.winner,
        hasWinner: data.game.hasWinner ?? prev.hasWinner,
        players: Object.values(data.players),
        score: {
          blue: data.game.teams?.[0]?.score ?? 0,
          orange: data.game.teams?.[1]?.score ?? 0,
        },
      }));
    });
  }, [websocket, setGameInfo]);

  // 🔹 Render your actual Control Panel
  return <ControlPanel />;
};
