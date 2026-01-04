import { useState, useEffect, useContext } from "react";
import { OverlayControls } from "./OverlayControls/OverlayControls";
import { FiSettings, FiZap } from "react-icons/fi";
import { WebsocketContext } from "../../contexts/WebsocketContext";

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

  const websocket = useContext(WebsocketContext);
  const [rocketLeagueConnectionOk, setRocketLeagueConnectionOk] = useState(false);
  const [overlayConnectionOk, setOverlayConnectionOk] = useState(false);
  const [overlayServerOk, setOverlayServerOk] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      const ok = await window.net.ping("http://127.0.0.1:3199/overlay.html");
      if (!cancelled) setOverlayServerOk(ok);
    };

    ping();
    const t = setInterval(ping, 1500);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);



  useEffect(() => {
    const t = setInterval(() => {
      setRocketLeagueConnectionOk(!!websocket.webSocketConnected);
    }, 500);

    return () => clearInterval(t);
  }, [websocket]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;
    let retryTimer: number | null = null;

    const connect = () => {
      if (!alive) return;

      try {
        ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => setOverlayConnectionOk(true);
        ws.onclose = () => setOverlayConnectionOk(false);
        ws.onerror = () => setOverlayConnectionOk(false);

        // optional: if server sends "pong" or any message, we know it's alive
        ws.onmessage = () => setOverlayConnectionOk(true);
      } catch {
        setOverlayConnectionOk(false);
      }

      // simple reconnect
      retryTimer = window.setTimeout(() => {
        if (!alive) return;
        if (!ws || ws.readyState === WebSocket.CLOSED) connect();
      }, 1000);
    };

    connect();

    return () => {
      alive = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      try { ws?.close(); } catch { }
    };
  }, []);

  const StatusPill = ({ ok }: { ok: boolean }) => (
    <div
      className={[
        "h-5 w-5 rounded-sm",                  // ✅ big square with rounded corners
        ok ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.60)]" : "bg-red-500",
        "transition-colors duration-150",
      ].join(" ")}
      aria-label={ok ? "Connected" : "Disconnected"}
      title={ok ? "Connected" : "Disconnected"}
    />
  );

  const StatusItem = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className="flex items-center justify-end gap-3 min-w-0">
      <span
        className="
    text-lg font-semibold text-white/90
    whitespace-nowrap
  "
        title={label}
      >
        {label}
      </span>


      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-black/20 shrink-0">
        <StatusPill ok={ok} />
      </div>
    </div>
  );


  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-hidden">
      {/* TOP PANEL */}
      <div className="flex-1 bg-csabg-500/85 rounded-2xl overflow-hidden">
        <OverlayControls overlayState={overlayState} setOverlayState={setOverlayState} />
      </div>

      {/* BOTTOM BAR */}
      <div className="h-30 bg-csabg-500/85 rounded-2xl shrink-0 px-4 py-3">
        <div className="h-full grid grid-cols-[240px_1fr] gap-4">
          {/* Left: stacked buttons */}
          <div className="flex flex-col justify-center gap-3 h-full pl-3">
            <button className="btn bg-csabg-300 text-white border-0 justify-start gap-3 h-10 w-45 shadow-lg/35">
              <FiSettings className="text-lg" />
              Overlay Setup
            </button>

            <button className="btn bg-csabg-300 text-white border-0 justify-start gap-3 h-10 w-45 shadow-lg/35">
              <FiZap className="text-lg" />
              Extra Features
            </button>
          </div>

          {/* Right: connection indicators */}
          <div className="grid grid-cols-2 grid-rows-2 gap-x-15 gap-y-2 items-center pr-3">
            {/* Row 1 */}
            <StatusItem label="Overlay Connection" ok={overlayConnectionOk} />
            <StatusItem label="Rocket League Connection" ok={rocketLeagueConnectionOk} />

            {/* Row 2 (left cell used, right left blank like your mock) */}
            <StatusItem label="Overlay Server" ok={overlayServerOk} />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};
