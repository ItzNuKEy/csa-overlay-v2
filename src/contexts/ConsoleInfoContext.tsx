import { createContext, useState, useEffect, ReactNode, SetStateAction, Dispatch } from "react";
import { teamKey } from "../constants/teamKey";
import fallbackLogo from "../assets/FranchLogoPackage/csaLogo.png";

export interface TeamData {
  name: string;
  city: string;
  logo: string;
  gradient: string;
  borderColor: string;
  primary: string;
  secondary: string;
}

export interface TopBar {
  topBarText: string;
}

interface TeamDataContextType {
  blueTeam: TeamData;
  orangeTeam: TeamData;
  setTeamData: (data: { blueTeamData: TeamData; orangeTeamData: TeamData }) => void;

  topBar: TopBar;
  setTopBar: Dispatch<SetStateAction<TopBar>>;

  gameNumber: number;
  setGameNumber: Dispatch<SetStateAction<number>>;
}

export const TeamDataContext = createContext<TeamDataContextType>({
  blueTeam: {
    name: "BLUE",
    city: "BLUE CITY",
    logo: fallbackLogo, // use the imported image
    gradient: "linear-gradient(90deg, rgb(23, 23, 255) rgb(23, 139, 255))",
    borderColor: "#1bbeff",
    primary: "rgb(23, 23, 255)",
    secondary: "rgb(23, 139, 255)"
  },
  orangeTeam: {
    name: "ORANGE",
    city: "ORANGE CITY",
    logo: fallbackLogo,
    gradient: "linear-gradient(90deg, rgb(255, 86, 34), rgb(212, 136, 13))",
    borderColor: "#ffc90e",
    primary: "rgb(255, 86, 34)",
    secondary: "rgb(212, 136, 13)"
  },
  setTeamData: () => {},
  topBar: { topBarText: "CSA SEASON 3 | WEEK | TIER" },
  setTopBar: () => {},
  gameNumber: 1,
  setGameNumber: () => {}
});


export const TeamDataProvider = ({ children }: { children: ReactNode }) => {
  const [topBar, setTopBar] = useState<TopBar>({ topBarText: "CSA SEASON 3 | WEEK | TIER" });
  const [gameNumber, setGameNumber] = useState<number>(1);
  const [blueTeam, setBlueTeam] = useState<TeamData>({
  name: "BLUE",
  city: "BLUE CITY",
  logo: fallbackLogo,
  gradient: "linear-gradient(90deg, rgb(23, 23, 255), rgb(23, 139, 255))",
  borderColor: "#1bbeff",
  primary: "rgb(23, 23, 255)",
  secondary: "rgb(23, 139, 255)"
});

const [orangeTeam, setOrangeTeam] = useState<TeamData>({
  name: "ORANGE",
  city: "ORANGE CITY",
  logo: fallbackLogo,
  gradient: "linear-gradient(90deg, rgb(255, 86, 34), rgb(212, 136, 13))",
  borderColor: "#ffc90e",
  primary: "rgb(255, 86, 34)",
  secondary: "rgb(212, 136, 13)"
});

  // ✅ Initial load from localStorage (in case no websocket data yet)
  useEffect(() => {
    const stored = localStorage.getItem("overlayData");
    if (stored) {
      const parsed = JSON.parse(stored);
      const newBlue = teamKey[parsed.blueTeamKey] || parsed.blueTeamData || blueTeam;
      const newOrange = teamKey[parsed.orangeTeamKey] || parsed.orangeTeamData || orangeTeam;
      setBlueTeam(newBlue);
      setOrangeTeam(newOrange);
    }
  }, []);

  // ✅ WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    const readWsData = async (data: unknown): Promise<string> => {
      if (typeof data === "string") return data;
      if (data instanceof Blob) return await data.text();
      if (data instanceof ArrayBuffer) {
        return new TextDecoder("utf-8").decode(new Uint8Array(data));
      }
      if (ArrayBuffer.isView(data)) {
        return new TextDecoder("utf-8").decode(data as Uint8Array);
      }
      // Node Buffer or anything else
      return (data as any)?.toString?.() ?? String(data ?? "");
    };

    socket.onmessage = async (event) => {
      try {
        const text = await readWsData(event.data);
        const message = JSON.parse(text);

        if (message.type === "UPDATE_TEAM") {
          const baseBlue = teamKey[message.data.blueTeamKey] || message.data.blueTeamData || blueTeam;
          const baseOrange = teamKey[message.data.orangeTeamKey] || message.data.orangeTeamData || orangeTeam;

          const blue = {
            ...baseBlue,
            name: message.data.blueDisplayName?.trim() || baseBlue.name,
          };
          const orange = {
            ...baseOrange,
            name: message.data.orangeDisplayName?.trim() || baseOrange.name,
          };

          setBlueTeam(blue);
          setOrangeTeam(orange);

          if (message.data.topBarText) setTopBar({ topBarText: message.data.topBarText });
          if (typeof message.data.gameNumber === "number") setGameNumber(message.data.gameNumber);
        }
      } catch (e) {
        console.error("❌ WebSocket data error:", e);
      }
    };

    socket.onerror = (err) => console.error("WebSocket Error:", err);
    socket.onclose = () => console.warn("WebSocket closed");

    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <TeamDataContext.Provider
      value={{
        blueTeam,
        orangeTeam,
        setTeamData: ({ blueTeamData, orangeTeamData }) => {
          setBlueTeam(blueTeamData);
          setOrangeTeam(orangeTeamData);
        },
    topBar,
    setTopBar,
    gameNumber,
    setGameNumber,
      }}
    >
      {children}
    </TeamDataContext.Provider>
  );
};
