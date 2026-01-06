import { ControlPanelGameListener } from "./ControlPanelGameListener";
import { TitleBar } from "../src/components/TitleBar/TitleBar";
import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [version, setVersion] = useState<string>("—");

  useEffect(() => {
    window.appInfo?.getVersion?.()
      .then(setVersion)
      .catch(() => setVersion("dev"));
  }, []);

  return (
    <div
      className="
        h-screen w-screen
        overflow-hidden
        flex flex-col
        relative
        bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500
      "
    >
      <TitleBar />

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-3">
        <ControlPanelGameListener />
      </div>

      {/* ✅ GLOBAL FOOTER (outside panels) */}
      <div
        className="
          absolute bottom-2 left-3
          text-xs text-white/60
          flex items-center gap-2
          pointer-events-none
          select-none
        "
      >
        <span className="opacity-80">v{version}</span>
        <span className="opacity-40">•</span>
        <span className="opacity-60">Made by NuKEy</span>
      </div>

      {/* ✅ GLOBAL FOOTER — RIGHT */}
      <div
        className="
    absolute bottom-2 right-3
    text-xs text-white/80
    pointer-events-none
    select-none
    flex items-center gap-1
  "
      >
        <span className="opacity-80">©</span>
        <span className="font-medium tracking-wide">
          playcsa.com
        </span>
      </div>
    </div>
  );
}
