import React, { useEffect, useState } from "react";
import { GameInfoContext, DEFAULT_GAME_INFO } from "../../contexts/GameInfoContext";
import { GameContext } from "../contexts/GameContext";

export const GameInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameInfo, setGameInfo] = useState<GameContext>(DEFAULT_GAME_INFO);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = async (event) => {
      try {
        const text = event.data instanceof Blob ? await event.data.text() : event.data;
        const message = JSON.parse(text);

        const derivedGameNumber =
          (message.data?.seriesScore?.blue ?? 0) + (message.data?.seriesScore?.orange ?? 0) + 1;

        if (message.type === "UPDATE_TEAM") {
          setGameInfo((prev) => ({
            ...prev,
            seriesLength: message.data?.seriesLength ?? prev.seriesLength,
            blueTimeoutAvailable: message.data?.blueTimeoutAvailable ?? prev.blueTimeoutAvailable,
            orangeTimeoutAvailable: message.data?.orangeTimeoutAvailable ?? prev.orangeTimeoutAvailable,
            currentGameNumber: message.data?.gameNumber ?? derivedGameNumber,
            seriesScore: {
              blue: message.data?.seriesScore?.blue ?? prev.seriesScore.blue,
              orange: message.data?.seriesScore?.orange ?? prev.seriesScore.orange,
            },
            topBarText: message.data?.topBarText ?? prev.topBarText,
          }));

          console.log("✅ GameInfoContext updated via WebSocket");
          console.log("Received UPDATE_TEAM message:", message);
        } else {
          // optional debug
          // console.log("ℹ️ Unhandled GameInfo message type:", message.type);
        }
      } catch (e) {
        console.error("❌ WebSocket GameInfo error:", e);
      }
    };

    socket.onerror = (err) => console.error("WebSocket Error (GameInfo):", err);
    socket.onclose = () => console.warn("WebSocket closed (GameInfo)");

    return () => socket.close();
  }, []);

  return (
    <GameInfoContext.Provider value={{ gameInfo, setGameInfo }}>
      {children}
    </GameInfoContext.Provider>
  );
};
