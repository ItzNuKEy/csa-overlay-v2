import { useContext, useEffect, useRef, useState } from "react";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { GameInfoContext } from "../contexts/GameInfoContext";
import { UpdateState } from "../models/UpdateState/UpdateState";
import { EndGameStatsCard } from "../components/EndGameStats/EndGameStats";
import { EndGameScore } from "../components/EndGameScore/EndGameScore";
// import { EndGameStatsTest } from "../components/EndGameTest.tsx/EndGameTest";
// import { SponsorEnd } from "../components/SponsorSpot/SponsorEnd";

export const EndGame = () => {
  const websocket = useContext(WebsocketContext);
  const { setGameInfo } = useContext(GameInfoContext);

  const [isPlayerStatsFrozen, setIsPlayerStatsFrozen] = useState(false);
  const playerStatsFrozenRef = useRef(false);

  // ✅ NEW: External WS (Control Panel / Electron) connection ref
  const endgameSocketRef = useRef<WebSocket | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    playerStatsFrozenRef.current = isPlayerStatsFrozen;
  }, [isPlayerStatsFrozen]);

  // ✅ NEW: Set up EndGame WebSocket connection (same pattern as Overlay.tsx)
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    endgameSocketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ EndGame WebSocket connected");
      socket.send(JSON.stringify({ type: "hello", role: "endgame" }));
    };

    socket.onerror = (error) => {
      console.error("❌ EndGame WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("⚠️ EndGame WebSocket closed");
      endgameSocketRef.current = null;
    };

    return () => {
      try {
        socket.close();
      } catch { }
      endgameSocketRef.current = null;
    };
  }, []);

  // ✅ NEW: Listen for messages from Control Panel (external_gameinfo_update)
  useEffect(() => {
    const socket = endgameSocketRef.current;
    if (!socket) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const text =
          typeof event.data === "string"
            ? event.data
            : event.data instanceof Blob
              ? await event.data.text()
              : String(event.data);

        const message = JSON.parse(text);

        switch (message.type) {
          case "external_gameinfo_update": {
            const { seriesScore, currentGameNumber, seriesLength } = message.data ?? {};
            console.log(
              "📥 EndGame received external_gameinfo_update:",
              seriesScore,
              currentGameNumber,
              seriesLength
            );

            setGameInfo((prev) => {
              const next: Partial<typeof prev> = {};

              if (seriesScore) next.seriesScore = seriesScore;
              if (typeof currentGameNumber === "number") next.currentGameNumber = currentGameNumber;

              // ✅ IMPORTANT: your GameContext expects 5 | 7, not any number
              if (seriesLength === 5 || seriesLength === 7) {
                next.seriesLength = seriesLength; // now it's typed as 5 | 7
              }

              return { ...prev, ...next };
            });

            break;
          }

          default:
            console.log("ℹ️ Unhandled endgame message type:", message.type);
        }
      } catch (err) {
        console.error("Error parsing endgame socket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [setGameInfo]);

  useEffect(() => {
    websocket.subscribe("game", "update_state", (data: UpdateState) => {
      if (playerStatsFrozenRef.current) {
        // Allow game-level info to still update
        setGameInfo((prev) => ({
          ...prev,
          score: {
            blue: data.game.teams[0].score,
            orange: data.game.teams[1].score,
          },
          timeRemaining: data.game.time_seconds,
        }));
        return;
      }

      if (data.game.isReplay) return;

      setGameInfo((prev) => {
        const newScore = {
          blue: data.game.teams[0].score,
          orange: data.game.teams[1].score,
        };

        const shouldResetHasWinner =
          prev.hasWinner &&
          data.game.teams[0].score === 0 &&
          data.game.teams[1].score === 0 &&
          !data.game.hasWinner;

        let newMVP = prev.mvp;
        let newHasWinner = prev.hasWinner;
        let newWinningTeamNum = prev.winningTeamNum;

        if (data.game.hasWinner && !prev.hasWinner) {
          const players = Object.values(data.players);
          const winningTeamNum = Number(data.game.winner);

          const winningTeamPlayers = players.filter((p) => p.team === winningTeamNum);

          const pickedMVP =
            winningTeamPlayers.length > 0
              ? winningTeamPlayers.reduce((top, curr) =>
                (curr.score || 0) > (top.score || 0) ? curr : top
              )
              : undefined;

          newMVP = pickedMVP;
          newHasWinner = true;
          newWinningTeamNum = winningTeamNum;
          console.log("✅ MVP selected from winning team:", newMVP);
        }

        return {
          ...prev,
          arena: data.game.arena,
          isOT: data.game.isOT,
          isReplay: data.game.isReplay,
          target: data.game.target,
          timeRemaining: data.game.time_seconds,
          winner: data.game.winner,
          hasWinner: shouldResetHasWinner ? false : newHasWinner,
          players: Object.values(data.players),
          score: newScore,
          seriesScore: prev.seriesScore,
          currentGameNumber: prev.currentGameNumber,
          seriesLength: prev.seriesLength,
          winningTeamNum: newWinningTeamNum,
          mvp: newMVP,
        };
      });
    });

    websocket.subscribe("game", "match_ended", (data: { winner_team_num: number }) => {
      console.log("MATCH_ENDED received:", data);
      setIsPlayerStatsFrozen(true);
      playerStatsFrozenRef.current = true;

      setGameInfo((prev) => {
        if (prev.hasWinner) {
          console.warn("Match ended already registered, skipping duplicate.");
          return prev;
        }

        const teamNum = data.winner_team_num as 0 | 1;
        const newSeriesScore = { ...prev.seriesScore };
        if (teamNum === 0) newSeriesScore.blue += 1;
        else if (teamNum === 1) newSeriesScore.orange += 1;

        const winningTeamPlayers = prev.players.filter((p) => p.team === teamNum);

        const mvp =
          winningTeamPlayers.length > 0
            ? winningTeamPlayers.reduce((top, curr) =>
              (curr.score || 0) > (top.score || 0) ? curr : top
            )
            : undefined;

        console.log("✅ MVP selected from winning team:", mvp);

        return {
          ...prev,
          hasWinner: true,
          winningTeamNum: teamNum,
          seriesScore: newSeriesScore,
          mvp,
        };
      });
    });

    websocket.subscribe("game", "match_destroyed", () => {
      console.log("MATCH_DESTROYED received");

      setGameInfo((prev) => {
        const shouldAdvanceGame =
          prev.hasWinner &&
          prev.seriesScore.blue + prev.seriesScore.orange === prev.currentGameNumber;

        if (!shouldAdvanceGame) return prev;

        return {
          ...prev,
          currentGameNumber: prev.currentGameNumber + 1,
          hasWinner: false,
          mvp: undefined,
        };
      });
    });

    websocket.subscribe("game", "pre_countdown_begin", () => {
      console.log("PRE_COUNTDOWN_BEGIN received → unfreezing player stats");
      setIsPlayerStatsFrozen(false);
      playerStatsFrozenRef.current = false;
    });
  }, [websocket, setGameInfo]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <EndGameStatsCard />
      {/* <SponsorEnd /> */}
      {/* <EndGameStatsTest /> */}
      <EndGameScore />
    </div>
  );
};
