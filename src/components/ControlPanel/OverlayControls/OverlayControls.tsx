import { useContext, useEffect, useRef, useState } from "react";
import { GameInfoContext } from "../../../contexts/GameInfoContext";
import { TeamDataContext } from "../../../contexts/ConsoleInfoContext";
import { teamKey } from "../../../constants/teamKey";
import fallbackLogo from "../../../assets/FranchLogoPackage/csaLogo.png";
import { WebsocketService } from "../../../services/websocketService";

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

type OverlayControlsProps = {
  overlayState: OverlayState;
  setOverlayState: React.Dispatch<React.SetStateAction<OverlayState>>;
};

export const OverlayControls = ({ overlayState, setOverlayState }: OverlayControlsProps) => {
  const { gameInfo } = useContext(GameInfoContext);
  const { setGameNumber } = useContext(TeamDataContext);

  const socketRef = useRef<WebSocket | null>(null);
  const userEditingRef = useRef(false);

  const prevBlueWins = useRef(gameInfo.seriesScore.blue);
  const prevOrangeWins = useRef(gameInfo.seriesScore.orange);

  const {
    blueTeamId,
    orangeTeamId,
    blueCustomName,
    orangeCustomName,
    seriesLength,
    blueTimeoutAvailable,
    orangeTimeoutAvailable,
    blueSeriesScore,
    orangeSeriesScore,
    topBarText,
  } = overlayState;

  const updateField = (field: keyof OverlayState, value: any) => {
    setOverlayState((prev) => ({ ...prev, [field]: value }));
  };

  // Keep series settings in sync with GameInfoContext (optional, but you had it)
  useEffect(() => {
    updateField("seriesLength", gameInfo.seriesLength);
    updateField("blueTimeoutAvailable", gameInfo.blueTimeoutAvailable);
    updateField("orangeTimeoutAvailable", gameInfo.orangeTimeoutAvailable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameInfo.seriesLength, gameInfo.blueTimeoutAvailable, gameInfo.orangeTimeoutAvailable]);

  // WebSocket connection for external updates
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Connected to WebSocket server");
    socket.onerror = (error) => console.error("❌ WebSocket Error:", error);

    const readWsData = async (data: unknown): Promise<string> => {
      if (typeof data === "string") return data;
      if (data instanceof Blob) return await data.text();
      if (data instanceof ArrayBuffer) {
        return new TextDecoder("utf-8").decode(new Uint8Array(data));
      }
      return String(data ?? "");
    };

    socket.onmessage = async (event) => {
      try {
        const text = await readWsData(event.data);
        const parsed = JSON.parse(text);

        if (parsed.type === "match_destroyed") {
          setGameNumber((prev) => prev + 1);
        }

        if (parsed.type === "external_gameinfo_update") {
          if (!userEditingRef.current) {
            updateField("blueSeriesScore", parsed.data.seriesScore.blue);
            updateField("orangeSeriesScore", parsed.data.seriesScore.orange);

            if (parsed.data.currentGameNumber) {
              setGameNumber(parsed.data.currentGameNumber);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    return () => {
      try {
        socket.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setGameNumber]);

  // Display names
  const blueDisplayName = blueCustomName.trim() || teamKey[blueTeamId]?.name || "Unknown";
  const orangeDisplayName = orangeCustomName.trim() || teamKey[orangeTeamId]?.name || "Unknown";

  const [blueCustomNameEnabled, setBlueCustomNameEnabled] = useState(!!blueCustomName);
  const [orangeCustomNameEnabled, setOrangeCustomNameEnabled] = useState(!!orangeCustomName);

  const sendUpdate = () => {
    userEditingRef.current = false;

    const gameNumber = blueSeriesScore + orangeSeriesScore + 1;

    const updateMessage = {
      type: "UPDATE_TEAM",
      data: {
        blueTeamKey: blueTeamId,
        orangeTeamKey: orangeTeamId,
        blueDisplayName,
        orangeDisplayName,
        seriesLength,
        blueTimeoutAvailable,
        orangeTimeoutAvailable,
        seriesScore: { blue: blueSeriesScore, orange: orangeSeriesScore },
        topBarText,
        gameNumber,
      },
    };

    socketRef.current?.send(JSON.stringify(updateMessage));

    // Keep your “manual match_destroyed” behavior when series score increments
    const totalBefore = prevBlueWins.current + prevOrangeWins.current;
    const totalAfter = blueSeriesScore + orangeSeriesScore;

    if (totalAfter > totalBefore) {
      setTimeout(() => {
        if (WebsocketService.webSocketConnected) {
          WebsocketService.send("game", "match_destroyed", {});
          console.log("✅ Sent fake match_destroyed (manual update)");
        } else {
          console.warn("⚠️ WebsocketService not connected yet");
        }
      }, 100);
    }

    prevBlueWins.current = blueSeriesScore;
    prevOrangeWins.current = orangeSeriesScore;
  };

  const quickSwitch = () => {
    const swappedState = {
      ...overlayState,
      blueTeamId: overlayState.orangeTeamId,
      orangeTeamId: overlayState.blueTeamId,
      blueCustomName: overlayState.orangeCustomName,
      orangeCustomName: overlayState.blueCustomName,
      blueSeriesScore: overlayState.orangeSeriesScore,
      orangeSeriesScore: overlayState.blueSeriesScore,
      blueTimeoutAvailable: overlayState.orangeTimeoutAvailable,
      orangeTimeoutAvailable: overlayState.blueTimeoutAvailable,
    };

    setOverlayState(swappedState);

    const updateMessage = {
      type: "UPDATE_TEAM",
      data: {
        blueTeamKey: swappedState.blueTeamId,
        orangeTeamKey: swappedState.orangeTeamId,
        blueDisplayName:
          swappedState.blueCustomName.trim() || teamKey[swappedState.blueTeamId]?.name,
        orangeDisplayName:
          swappedState.orangeCustomName.trim() || teamKey[swappedState.orangeTeamId]?.name,
        seriesLength: swappedState.seriesLength,
        blueTimeoutAvailable: swappedState.blueTimeoutAvailable,
        orangeTimeoutAvailable: swappedState.orangeTimeoutAvailable,
        seriesScore: { blue: swappedState.blueSeriesScore, orange: swappedState.orangeSeriesScore },
        topBarText: swappedState.topBarText,
        gameNumber: swappedState.blueSeriesScore + swappedState.orangeSeriesScore + 1,
      },
    };

    socketRef.current?.send(JSON.stringify(updateMessage));
  };

  const resetSeries = () => {
    updateField("blueSeriesScore", 0);
    updateField("orangeSeriesScore", 0);

    const updateMessage = {
      type: "UPDATE_TEAM",
      data: {
        blueTeamKey: blueTeamId,
        orangeTeamKey: orangeTeamId,
        seriesLength,
        blueTimeoutAvailable,
        orangeTimeoutAvailable,
        seriesScore: { blue: 0, orange: 0 },
        topBarText,
        gameNumber: 1,
      },
    };

    socketRef.current?.send(JSON.stringify(updateMessage));

    if (WebsocketService.webSocketConnected) {
      WebsocketService.send("game", "match_destroyed", {});
      console.log("✅ Sent match_destroyed on series reset");
    }
  };

  const resetOverlay = () => {
    const defaults = {
      blueTeamId: "CSABlue",
      orangeTeamId: "CSAOrange",
      blueCustomName: "",
      orangeCustomName: "",
      blueSeriesScore: 0,
      orangeSeriesScore: 0,
      blueTimeoutAvailable: false,
      orangeTimeoutAvailable: false,
      topBarText: "CSA SEASON 3 | WEEK # | [TIER]",
      seriesLength: 5,
    };

    setOverlayState((prev) => ({ ...prev, ...defaults }));

    socketRef.current?.send(
      JSON.stringify({
        type: "UPDATE_TEAM",
        data: { ...defaults, gameNumber: 1 },
      })
    );
  };

  return (
    <body className="h-full flex-col w-full">
      <form className="flex w-full pr-6 pl-6 pt-4">

        <fieldset className="fieldset w-9/10">
          <legend className="w-9/10 text-lg/6 font-semibold text-white">Top Bar Text</legend>
          <input type="text" value={topBarText} onChange={(e) => updateField("topBarText", e.target.value)} className="input w-9/10 bg-csabg-300" placeholder="Input Text Ex. CSA SEASON 3 | ..." />
        </fieldset>

        <fieldset className="fieldset w-1/5">
          <legend className="text-lg/6 font-semibold text-white">Series Length</legend>  
            <select defaultValue="Best of" value={seriesLength} onChange={(e) => updateField("seriesLength", e.target.value === "5" ? 5 : 7)}className="select bg-csabg-300">
                <option disabled={true}>Best of</option>
                <option value="5">Best of 5</option>
                <option value="7">Best of 7</option>
            </select>
        </fieldset>

        </form>

      <div className="p-6">
        {/* BLUE */}
        <div className="bg-linear-to-r from-blue-800 to-blue-600 border-3 border-blue-400 rounded-xl p-2.5 mb-4">
            <div className="flex items-center">
              <div>
                <form>

                <fieldset className="fieldset">
                  <legend className="text-lg/6 font-semibold text-white">Team Select:</legend>
                  <select className="select w-full shadow-lg/35" value={blueTeamId} onChange={(e) => updateField("blueTeamId", e.target.value)}>
                    {Object.keys(teamKey).map((key) => (
                      <option key={key} value={key}>
                        {teamKey[key].name}
                      </option>
                    ))}
                  </select>
                </fieldset>

              <div className="flex gap-2 mb-2">
                  <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border pl-3 pr-3 pt-2 pb-3 flex-col shadow-lg/35">
                    <legend className="fieldset-legend text-lg text-white">Name Settings</legend>
                    <label className="label text-white">
                    <input type="checkbox" checked={blueCustomNameEnabled}
                      onChange={() => setBlueCustomNameEnabled(!blueCustomNameEnabled)} defaultChecked className="checkbox" />{" "}
                    Custom Name Override
                  </label>
                    <label className="text-xs/6 text-white">
                      <p className="text-left">Custom Name Input</p>
                      <input className="input text-white border-white"
                      type="text"
                      placeholder="Custom Name"
                      value={blueCustomName}
                      onChange={(e) => updateField("blueCustomName", e.target.value)}
                      disabled={!blueCustomNameEnabled}
                      style={{
                        cursor: blueCustomNameEnabled ? "text" : "not-allowed",
                      }} />
                  </label>
                </fieldset>

                  <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-50 border pl-3 pr-3 pt-2 pb-3 flex-col shadow-lg/35">
                    <legend className="fieldset-legend text-lg text-white">Series Settings</legend>
                    <label className="label text-white">
                    <input type="checkbox"
                      checked={blueTimeoutAvailable}
                      onChange={() => updateField("blueTimeoutAvailable", !blueTimeoutAvailable)} className="checkbox" />{" "}
                    Timeout Used
                  </label>

                  
                  <label className="text-white text-xs/6">
                      <p className="text-left">Series Score</p>
                    <input type="number" className="input text-white border-white"
                      value={blueSeriesScore}
                      onChange={(e) => {
                        userEditingRef.current = true;
                        updateField("blueSeriesScore", Number(e.target.value))
                      }} />
                  </label>
                </fieldset>
              </div>

                </form>
              </div>

              <div className="ml-3">
                <img src={teamKey[blueTeamId]?.logo || fallbackLogo} alt="Blue Team Logo" className="max-w-60"/>
              </div>
            </div>
        </div>

        {/* ORANGE */}
        <div className="bg-linear-to-r from-orange-700 to-orange-500 border-3 border-orange-400 rounded-xl p-2.5">
          <div className="flex items-center">
            <div>
              <form>

                <fieldset className="fieldset">
                  <legend className="text-lg/6 font-semibold text-white">Team Select:</legend>
                  <select className="select w-full shadow-lg/35" value={orangeTeamId} onChange={(e) => updateField("orangeTeamId", e.target.value)}>
                    {Object.keys(teamKey).map((key) => (
                      <option key={key} value={key}>
                        {teamKey[key].name}
                      </option>
                    ))}
                  </select>
                </fieldset>

                <div className="flex gap-2 mb-2">
                  <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border pl-3 pr-3 pt-2 pb-3 flex-col shadow-lg/35">
                    <legend className="fieldset-legend text-lg text-white">Name Settings</legend>
                    <label className="label text-white">
                      <input type="checkbox" checked={orangeCustomNameEnabled}
                        onChange={() => setOrangeCustomNameEnabled(!orangeCustomNameEnabled)} defaultChecked className="checkbox" />{" "}
                      Custom Name Override
                    </label>
                    <label className="text-xs/6 text-white">
                      <p className="text-left">Custom Name Input</p>
                      <input className="input text-white border-white"
                        type="text"
                        placeholder="Custom Name"
                        value={orangeCustomName}
                        onChange={(e) => updateField("orangeCustomName", e.target.value)}
                        disabled={!orangeCustomNameEnabled}
                        style={{
                          cursor: orangeCustomNameEnabled ? "text" : "not-allowed",
                        }} />
                    </label>
                  </fieldset>

                  <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-50 border pl-3 pr-3 pt-2 pb-3 flex-col shadow-lg/35">
                    <legend className="fieldset-legend text-lg text-white">Series Settings</legend>
                    <label className="label text-white">
                      <input type="checkbox"
                        checked={orangeTimeoutAvailable}
                        onChange={() => updateField("orangeTimeoutAvailable", !orangeTimeoutAvailable)} className="checkbox" />{" "}
                      Timeout Used
                    </label>


                    <label className="text-white text-xs/6">
                      <p className="text-left">Series Score</p>
                      <input type="number" className="input text-white border-white"
                        value={orangeSeriesScore}
                        onChange={(e) => {
                          userEditingRef.current = true;
                          updateField("orangeSeriesScore", Number(e.target.value))
                        }} />
                    </label>
                  </fieldset>
                </div>

              </form>
            </div>

            <div className="ml-3">
              <img src={teamKey[orangeTeamId]?.logo || fallbackLogo} alt="Orange Team Logo" className="max-w-60" />
            </div>
          </div>
        </div>
      </div>

      <div className="pr-2 pl-2 flex gap-3 justify-center">
        <button className="btn btn-success w-44 shadow-md shadow-emerald-500/50" onClick={sendUpdate}>Update</button>
        <button className="btn btn-info w-44 shadow-md shadow-cyan-500/50" onClick={quickSwitch}>Quick Switch</button>
        <button className="btn btn-warning w-44 shadow-md shadow-amber-500/50" onClick={resetSeries}>Reset Series</button>
        <button className="btn btn-error w-44 shadow-md shadow-red-500/50" onClick={resetOverlay}>Reset Overlay</button>
      </div>
    </body>
  );
};
