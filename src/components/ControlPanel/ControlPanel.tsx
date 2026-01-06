import { useState, useEffect, useContext, useMemo } from "react";
import { OverlayControls } from "./OverlayControls/OverlayControls";
import { FiSettings, FiZap } from "react-icons/fi";
import { WebsocketContext } from "../../contexts/WebsocketContext";
import { OverlaySetupModal } from "./OverlaySetup";
import { ExtraFeatures } from "./ExtraFeatures";

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

type ConnStatus = "down" | "connecting" | "up";

export const ControlPanel = () => {
  const [showOverlaySetup, setShowOverlaySetup] = useState(false);
  const [showExtraFeatures, setShowExtraFeatures] = useState(false);

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

  // URLs for the modal + ping target
  const HOST = "http://127.0.0.1:3199";
  const overlayUrl = useMemo(() => `${HOST}/overlay.html`, []);
  const endgameUrl = useMemo(() => `${HOST}/endgame.html`, []);

  const websocket = useContext(WebsocketContext);

  const [rocketLeagueStatus, setRocketLeagueStatus] = useState<ConnStatus>("down");
  const [overlayConnectionOk, setOverlayConnectionOk] = useState(false);
  const [overlayServerOk, setOverlayServerOk] = useState(false);

  // Overlay Server ping (via preload net.ping)
  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        const ok = await window.net.ping(overlayUrl);
        if (!cancelled) setOverlayServerOk(ok);
      } catch {
        if (!cancelled) setOverlayServerOk(false);
      }
    };

    ping();
    const t = window.setInterval(ping, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [overlayUrl]);

  // Rocket League (ws-relay) status via your WebsocketService
  useEffect(() => {
    const onStatus = (data: { status?: ConnStatus }) => {
      if (data?.status) setRocketLeagueStatus(data.status);
    };

    try {
      websocket.subscribe("rl", "status", onStatus);
    } catch { }

    // If your WebsocketService supports unsubscribe, do it here.
    // return () => websocket.unsubscribe?.("rl", "status", onStatus);

  }, [websocket]);

  // Overlay Connection check (ws://localhost:8080)
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
        ws.onmessage = () => setOverlayConnectionOk(true);
      } catch {
        setOverlayConnectionOk(false);
      }

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

  const StatusPill = ({ status }: { status: ConnStatus }) => {
    const cls =
      status === "up"
        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.60)]"
        : status === "connecting"
          ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
          : "bg-red-500";

    const label =
      status === "up" ? "Connected" : status === "connecting" ? "Connecting" : "Disconnected";

    return (
      <div
        className={["h-5 w-5 rounded-sm transition-colors duration-150", cls].join(" ")}
        aria-label={label}
        title={label}
      />
    );
  };

  const StatusItem = ({ label, status }: { label: string; status: ConnStatus }) => (
    <div className="flex items-center justify-end gap-3 min-w-0">
      <span className="text-lg font-semibold text-white/90 whitespace-nowrap" title={label}>
        {label}
      </span>
      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-black/20 shrink-0">
        <StatusPill status={status} />
      </div>
    </div>
  );

  return (
    <div className="h-222 w-full flex flex-col gap-3 overflow-hidden">
      {/* ✅ Overlay Setup Modal */}
      <OverlaySetupModal
        open={showOverlaySetup}
        onClose={() => setShowOverlaySetup(false)}
        overlayUrl={overlayUrl}
        endgameUrl={endgameUrl}
      />

      {/* ✅ Extra Features Modal (your component) */}
      <ExtraFeatures
        open={showExtraFeatures}
        onClose={() => setShowExtraFeatures(false)}
      />

      {/* TOP PANEL */}
      <div className="flex-1 bg-csabg-500/85 rounded-2xl overflow-hidden">
        <OverlayControls overlayState={overlayState} setOverlayState={setOverlayState} />
      </div>

      {/* BOTTOM BAR */}
      <div className="h-30 bg-csabg-500/85 rounded-2xl shrink-0 px-4 py-3">
        <div className="h-full grid grid-cols-[240px_1fr] gap-4">
          {/* Left: stacked buttons */}
          <div className="flex flex-col justify-center gap-3 h-full pl-3">
            <button
              onClick={() => setShowOverlaySetup(true)}
              className="btn bg-csabg-300 text-white border-0 justify-start gap-3 h-10 w-45 shadow-lg/35"
              type="button"
            >
              <FiSettings className="text-lg" />
              Overlay Setup
            </button>

            <button
              onClick={() => setShowExtraFeatures(true)}
              className="btn bg-csabg-300 text-white border-0 justify-start gap-3 h-10 w-45 shadow-lg/35"
              type="button"
            >
              <FiZap className="text-lg" />
              Extra Features
            </button>
          </div>

          {/* Right: connection indicators */}
          <div className="grid grid-cols-2 grid-rows-2 gap-x-15 gap-y-2 items-center pr-3">
            <StatusItem label="Overlay Connection" status={overlayConnectionOk ? "up" : "down"} />
            <StatusItem label="Rocket League Connection" status={rocketLeagueStatus} />
            <StatusItem label="Overlay Server" status={overlayServerOk ? "up" : "down"} />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};
