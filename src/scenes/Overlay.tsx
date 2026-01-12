import { useContext, useEffect, useState, useRef } from "react";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { GameInfoContext } from "../contexts/GameInfoContext";
import { UpdateState } from "../models/UpdateState/UpdateState";
import { Scorebug } from "../components/Scorebug/Scorebug";
import { PlayerBoostMeter } from "../components/PlayerBoostMeter/PlayerBoostMeter";
import { PlayerStatCard } from "../components/PlayerStatsCard/PlayerStatCard";
import { ReplayTag } from "../components/ReplayTag/Replaytag";
import { StatfeedEvent as StatfeedEventType } from "../models/StatfeedEvent/StatfeedEvent";
import { StatfeedEvent } from "../components/StatfeedEvents/StatfeedEvents";
// import { StatfeedEventMock } from "../components/StatfeedEvents/StatfeedMockEvent";
import { CornerLogo } from "../components/ExtraStyles/CSATopLeft.style";
import { WebsocketService } from "../services/websocketService";
// import { SponsorSpot } from "../components/SponsorSpot/SponsorSpot";

const csaLogoUrl = new URL("../assets/csa-top-left.png", import.meta.url).toString();

type TimedStatfeed = {
  id: number;
  event: StatfeedEventType;
};

declare global {
  interface Window {
    __wasUnder31?: boolean;
  }
}

export const Overlay = () => {
  const overlaySocketRef = useRef<WebSocket | null>(null);
  const websocket = useContext(WebsocketContext);
  const { setGameInfo } = useContext(GameInfoContext);

  const [statfeedEvents, setStatfeedEvents] = useState<TimedStatfeed[]>([]);
  const subscribedRef = useRef(false);

  // Set up overlay WebSocket connection
  useEffect(() => {
    const overlaySocket = new WebSocket("ws://localhost:8080");
    overlaySocketRef.current = overlaySocket;

    overlaySocket.onopen = () => {
      console.log("✅ Overlay WebSocket connected");
      overlaySocket.send(JSON.stringify({ type: "hello", role: "overlay" }));
    };

    overlaySocket.onerror = (error) => {
      console.error("❌ Overlay WebSocket error:", error);
    };

    overlaySocket.onclose = () => {
      console.log("⚠️ Overlay WebSocket closed");
      overlaySocketRef.current = null;
    };

    return () => {
      try {
        overlaySocket.close();
      } catch {}
      overlaySocketRef.current = null;
    };
  }, []);

  useEffect(() => {
    websocket.subscribe("game", "update_state", (data: UpdateState) => {
      const timeRemaining = data.game.time_seconds;
      const isOT = data.game.isOT;
      const isUnder31 = timeRemaining < 31 && !isOT;

      // Prevent duplicate spam
      if (window.__wasUnder31 !== isUnder31) {
        window.__wasUnder31 = isUnder31;

        if (WebsocketService.webSocketConnected) {
          WebsocketService.send("overlay", "UNDER_31_SECONDS", { under31: isUnder31 });
          console.log(
            `📤 UNDER_31_SECONDS → ${isUnder31 ? "TRUE (last 31s)" : "FALSE (above 31s)"}`
          );
        }
      }

      setGameInfo((prev) => ({
        ...prev,
        arena: data.game.arena,
        isOT,
        isReplay: data.game.isReplay,
        target: data.game.target,
        timeRemaining,
        winner: data.game.winner,
        players: Object.values(data.players),
        score: {
          blue: data.game.teams[0].score,
          orange: data.game.teams[1].score,
        },
      }));
    });

    websocket.subscribe("game", "match_ended", (data: { winner_team_num: number }) => {
      setGameInfo((prev) => {
        if (prev.hasWinner) return prev;

        const teamNum = data.winner_team_num as 0 | 1;
        console.log("🏆 Match ended - winner_team_num:", data.winner_team_num, "teamNum:", teamNum);
        console.log("📊 Previous series score:", prev.seriesScore);

        const newSeriesScore = {
          blue: teamNum === 0 ? prev.seriesScore.blue + 1 : prev.seriesScore.blue,
          orange: teamNum === 1 ? prev.seriesScore.orange + 1 : prev.seriesScore.orange,
        };

        console.log("📊 New series score:", newSeriesScore);

        const newGameNumber = (prev.currentGameNumber || 1) + 1;

        console.log("📤 Sending external_gameinfo_update to Control Panel:", newSeriesScore, "Game:", newGameNumber);
        console.log("📤 Overlay WebSocket state:", overlaySocketRef.current?.readyState, overlaySocketRef.current ? "exists" : "null");

        // Send update to control panel
        if (overlaySocketRef.current && overlaySocketRef.current.readyState === WebSocket.OPEN) {
          const message = JSON.stringify({
            type: "external_gameinfo_update",
            data: {
              seriesScore: newSeriesScore,
              currentGameNumber: newGameNumber,
            },
          });
          console.log("📤 Actually sending message:", message);
          overlaySocketRef.current.send(message);
          console.log("✅ Message sent successfully");
        } else {
          console.warn("⚠️ Overlay WebSocket not connected, cannot send update to control panel");
          console.warn("⚠️ Socket ref:", overlaySocketRef.current);
          console.warn("⚠️ Ready state:", overlaySocketRef.current?.readyState);
        }

        return {
          ...prev,
          hasWinner: true,
          winningTeamNum: teamNum,
          seriesScore: newSeriesScore,
          currentGameNumber: newGameNumber, // ✅ Update currentGameNumber in overlay state
        };
      });
    });

    websocket.subscribe("game", "match_destroyed", () => {
      setGameInfo((prev) => ({
        ...prev,
        score: { blue: 0, orange: 0 },
        isOT: false,
        hasWinner: false,
      }));
    });
  }, [websocket, setGameInfo]);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    websocket.subscribe("game", "statfeed_event", (event: StatfeedEventType) => {
      const id = Date.now() + Math.random();
      setStatfeedEvents((prev) => [...prev, { id, event }]);
    });
  }, [websocket]);

  useEffect(() => {
    const socket = overlaySocketRef.current;
    if (!socket) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const text = typeof event.data === "string"
          ? event.data
          : event.data instanceof Blob
            ? await event.data.text()
            : String(event.data);

        const message = JSON.parse(text);

        switch (message.type) {
          case "external_gameinfo_update": {
            const { seriesScore, currentGameNumber } = message.data;
            console.log("📥 Overlay received external_gameinfo_update:", seriesScore, currentGameNumber);

            setGameInfo((prev) => ({
              ...prev,
              seriesScore,
              currentGameNumber,
            }));
            break;
          }

          default:
            console.log("ℹ️ Unhandled overlay message type:", message.type);
        }
      } catch (err) {
        console.error("Error parsing overlay socket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [setGameInfo]);

  const { gameInfo } = useContext(GameInfoContext);

  return (
    <>
      <Scorebug />

      {!gameInfo.isReplay && (
        <>
          <PlayerBoostMeter />
          <PlayerStatCard />
        </>
      )}

      <ReplayTag />

      <StatfeedEvent
        events={statfeedEvents}
        removeEvent={(id) => {
          console.log("Removing from Overlay state:", id);
          setStatfeedEvents((prev) => prev.filter((e) => e.id !== id));
        }}
      />

      {/* <StatfeedEventMock /> */}

      <CornerLogo src={csaLogoUrl} alt="Overlay Logo" />
      {/* <SponsorSpot /> */}
    </>
  );
};
