import { ControlPanelGameListener } from "./ControlPanelGameListener";
import { TitleBar } from "../src/components/TitleBar/TitleBar";
import "./index.css";

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col
                    bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500">
      <TitleBar />

      {/* Content */}
      <div className="flex-1 overflow-hidden p-3">
        <ControlPanelGameListener />
      </div>
    </div>
  );
}
