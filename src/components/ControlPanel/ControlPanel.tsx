import { useState, useEffect, useContext, useMemo } from "react";
import { OverlayControls } from "./OverlayControls/OverlayControls";
import { FiSettings, FiZap } from "react-icons/fi";
import { WebsocketContext } from "../../contexts/WebsocketContext";
import { OverlaySetupModal } from "./OverlaySetup";
import { ExtraFeatures, ObsAutomationSettings } from "./ExtraFeatures";
import { UserProfile } from "../Auth/UserProfile";

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
  const [overlayStatus, setOverlayStatus] = useState<ConnStatus>("down");
  const [obsAutomationStatus, setObsAutomationStatus] = useState<ConnStatus>("down");
  const [obsSettings, setObsSettings] = useState<ObsAutomationSettings>({
    enabled: false,
    mode: "matchStartOnly",
    liveTransition: "CSAStinger",
    endgameTransition: "Fade",
    liveScene: "LIVEMATCH",   // 👈 default gameplay scene
    endgameScene: "ENDGAME",  // 👈 default stats scene
  });


  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const loaded = await window.obsAutomation.getSettings();
        if (!cancelled && loaded) {
          const next = {
            enabled: !!loaded.enabled,
            mode: loaded.mode ?? "matchStartOnly",
            liveTransition: loaded.liveTransition ?? "CSAStinger",
            endgameTransition: loaded.endgameTransition ?? "Fade",
            liveScene: loaded.liveScene ?? "LIVEMATCH",
            endgameScene: loaded.endgameScene ?? "ENDGAME",
          };

          setObsSettings(next);

          // 👇 If automation was ON last time, start the pill as "connecting"
          if (next.enabled) {
            setObsAutomationStatus("connecting");
          } else {
            setObsAutomationStatus("down");
          }
        }
      } catch (err) {
        console.error("[ControlPanel] failed to load OBS settings", err);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);



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

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;
    let retryTimer: number | null = null;

    const connect = () => {
      if (!alive) return;

      // we're attempting to connect
      setOverlayStatus("connecting");

      try {
        ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => {
          // identify as control panel
          ws?.send(JSON.stringify({ type: "hello", role: "control" }));

          // server is up, but we don't know if overlays exist yet
          setOverlayStatus("connecting");
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data as string);

            if (data?.type === "overlayStatus") {
              // ✅ overlays >= 1 => green, otherwise yellow
              setOverlayStatus(data.overlays >= 1 ? "up" : "connecting");
              return;
            }
          } catch {
            // ignore non-json messages
          }
        };

        ws.onclose = () => setOverlayStatus("down");
        ws.onerror = () => setOverlayStatus("down");
      } catch {
        setOverlayStatus("down");
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

  useEffect(() => {
    const onStatus = (data: { status?: ConnStatus }) => {
      console.log("[ControlPanel] obsAutomation status event:", data);
      if (data?.status) {
        setObsAutomationStatus(data.status);
      }
    };

    try {
      websocket.subscribe("obsAutomation", "status", onStatus);
    } catch (err) {
      console.error("[ControlPanel] failed to subscribe to obsAutomation:status", err);
    }

    return () => {
      try {
        websocket.unsubscribe?.("obsAutomation", "status", onStatus);
      } catch { }
    };
  }, [websocket]);

  const StatusDot = ({ status }: { status: ConnStatus }) => {
    const color =
      status === "up"
        ? "status-success"
        : status === "connecting"
          ? "status-warning"
          : "status-error";

    return (
      <div className="inline-grid *:[grid-area:1/1]">
        <div className={`status ${color} w-3 h-3 animate-ping`} />
        <div className={`status ${color} w-3 h-3`} />
      </div>
    );
  };

  const StatusItem = ({ label, status }: { label: string; status: ConnStatus }) => (
    <div className="flex items-center justify-end gap-3 min-w-0">
      <span className="text-lg font-semibold text-white/90 whitespace-nowrap" title={label}>
        {label}
      </span>
      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-black/20 shrink-0">
        <StatusDot status={status} />
      </div>
    </div>
  );

  return (
    <div className="h-234 w-full flex flex-col gap-3 overflow-hidden">
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
        initialSettings={obsSettings}
        onSave={async (newSettings) => {
          // 1) update local state
          setObsSettings(newSettings);

          // 2) persist to main + disk
          try {
            await window.obsAutomation.saveSettings(newSettings);
          } catch (err) {
            console.error("[ControlPanel] failed to save OBS settings", err);
          }
        }}
        onEnabledChange={(enabled) => {
          // toggle pill visibility immediately
          setObsSettings((prev) => ({
            ...prev,
            enabled,
          }));

          // If you want: when turning ON, you can start with "connecting" so
          // the pill isn’t red until first status event:
          if (enabled) {
            setObsAutomationStatus("connecting");
          } 
        }}
      />


    <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white/90">Welcome to the CSA Caster Production Kit</div>
          <div>
            <UserProfile />
          </div>
    </div>

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
            <StatusItem label="Overlay Connection" status={overlayStatus} />
            <StatusItem label="Rocket League Connection" status={rocketLeagueStatus} />
            <StatusItem label="Overlay Server" status={overlayServerOk ? "up" : "down"} />

            {obsSettings.enabled ? (
              <StatusItem label="OBS Automation" status={obsAutomationStatus} />
            ) : (
              <div />  /* keeps layout symmetric when hidden */)}
          </div>
        </div>
      </div>
    </div>
  );
};
