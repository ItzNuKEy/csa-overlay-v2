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
import { CornerLogo } from "../components/ExtraStyles/CSATopLeft.style";
import csaLogo from "../assets/CSA Top Left Corner Gold.png";
import { WebsocketService } from "../services/websocketService";
// import { SponsorSpot } from "../components/SponsorSpot/SponsorSpot";

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

  const overlaySocket = new WebSocket("ws://localhost:8080");

  overlaySocket.onopen = () => {
    console.log("✅ Overlay WebSocket connected");
    overlaySocket.send(JSON.stringify({ type: "hello", role: "overlay" }));
  };

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

        const newSeriesScore = {
          blue: teamNum === 0 ? prev.seriesScore.blue + 1 : prev.seriesScore.blue,
          orange: teamNum === 1 ? prev.seriesScore.orange + 1 : prev.seriesScore.orange,
        };

        console.log("📤 Sending external_gameinfo_update to Control Panel:", newSeriesScore);

        overlaySocketRef.current?.send(
          JSON.stringify({
            type: "external_gameinfo_update",
            data: {
              seriesScore: newSeriesScore,
              currentGameNumber: (prev.currentGameNumber || 1) + 1,
            },
          })
        );

        return {
          ...prev,
          hasWinner: true,
          winningTeamNum: teamNum,
          seriesScore: newSeriesScore,
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
    overlaySocket.onmessage = async (event) => {
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

      <CornerLogo src={csaLogo} alt="Overlay Logo" />
      {/* <SponsorSpot /> */}
    </>
  );
};
