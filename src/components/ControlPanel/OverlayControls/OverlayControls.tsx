import { useContext, useEffect, useRef, useState } from "react";
import { GameInfoContext } from "../../../contexts/GameInfoContext";
import { TeamDataContext } from "../../../contexts/ConsoleInfoContext";
import { teamKey } from "../../../constants/teamKey";
import fallbackLogo from "../../../assets/FranchLogoPackage/csaLogo.png";
import { WebsocketService } from "../../../services/websocketService";

import {
  PanelWrapper,
  UpdateButton,
  Label,
  ScoreInput,
  StyledSelect,
  TopBarInput,
  TopBarAndSeriesContainer,
  ControlGroup,
  TeamsContainer,
  TeamLogo,
  TeamRow,
  ColorBar,
  ColorCodeText,
  ColorInfoWrapper,
  LogoWithColorInfo,
  ButtonRow,
  ResetButton,
  ResetOverlayButton,
  BlueTeamBarInput,
  OrangeTeamBarInput,
  TeamWrapper,
  TeamColumn,
  QuickSwapButton,
} from "./OverlayControls.style";

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

    socket.onmessage = async (event) => {
      try {
        const text = await event.data.text();
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
      topBarText: "",
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
    <PanelWrapper>
      <TopBarAndSeriesContainer>
        <ControlGroup style={{ flex: 1 }}>
          <Label>Top Bar Text:</Label>
          <TopBarInput
            type="text"
            value={topBarText}
            onChange={(e) => updateField("topBarText", e.target.value)}
            placeholder="Insert Top Bar Text Ex: CSA SEASON 1 | ..."
          />
        </ControlGroup>

        <ControlGroup>
          <Label>Series Length:</Label>
          <StyledSelect
            value={seriesLength}
            onChange={(e) => updateField("seriesLength", e.target.value === "5" ? 5 : 7)}
          >
            <option value="5">Best of 5</option>
            <option value="7">Best of 7</option>
          </StyledSelect>
        </ControlGroup>
      </TopBarAndSeriesContainer>

      <TeamsContainer>
        {/* BLUE */}
        <TeamWrapper teamColor="blue">
          <TeamColumn>
            <TeamRow>
              <div>
                <ControlGroup>
                  <Label>Team:</Label>
                  <StyledSelect
                    value={blueTeamId}
                    onChange={(e) => updateField("blueTeamId", e.target.value)}
                  >
                    {Object.keys(teamKey).map((key) => (
                      <option key={key} value={key}>
                        {teamKey[key].name}
                      </option>
                    ))}
                  </StyledSelect>
                </ControlGroup>

                <ControlGroup>
                  <Label>
                    <input
                      type="checkbox"
                      checked={blueCustomNameEnabled}
                      onChange={() => setBlueCustomNameEnabled(!blueCustomNameEnabled)}
                    />{" "}
                    Custom Name Needed
                  </Label>

                  <BlueTeamBarInput
                    type="text"
                    placeholder="Custom Name"
                    value={blueCustomName}
                    onChange={(e) => updateField("blueCustomName", e.target.value)}
                    disabled={!blueCustomNameEnabled}
                    style={{
                      backgroundColor: blueCustomNameEnabled ? "white" : "#e0e0e0",
                      cursor: blueCustomNameEnabled ? "text" : "not-allowed",
                    }}
                  />
                </ControlGroup>

                <ControlGroup>
                  <Label>Series Score:</Label>
                  <ScoreInput
                    type="number"
                    value={blueSeriesScore}
                    onChange={(e) => {
                      userEditingRef.current = true;
                      updateField("blueSeriesScore", Number(e.target.value));
                    }}
                  />
                </ControlGroup>

                <Label>
                  <input
                    type="checkbox"
                    checked={blueTimeoutAvailable}
                    onChange={() => updateField("blueTimeoutAvailable", !blueTimeoutAvailable)}
                  />{" "}
                  Timeout Used
                </Label>
              </div>

              <LogoWithColorInfo>
                <TeamLogo src={teamKey[blueTeamId]?.logo || fallbackLogo} alt="Blue Team Logo" />
                <ColorInfoWrapper>
                  <ColorCodeText>{teamKey[blueTeamId]?.borderColor || "#000000"}</ColorCodeText>
                  <ColorBar color={teamKey[blueTeamId]?.borderColor || "#000000"} />
                </ColorInfoWrapper>
              </LogoWithColorInfo>
            </TeamRow>
          </TeamColumn>
        </TeamWrapper>

        {/* ORANGE */}
        <TeamWrapper teamColor="orange">
          <TeamColumn>
            <TeamRow>
              <div>
                <ControlGroup>
                  <Label>Team:</Label>
                  <StyledSelect
                    value={orangeTeamId}
                    onChange={(e) => updateField("orangeTeamId", e.target.value)}
                  >
                    {Object.keys(teamKey).map((key) => (
                      <option key={key} value={key}>
                        {teamKey[key].name}
                      </option>
                    ))}
                  </StyledSelect>
                </ControlGroup>

                <ControlGroup>
                  <Label>
                    <input
                      type="checkbox"
                      checked={orangeCustomNameEnabled}
                      onChange={() => setOrangeCustomNameEnabled(!orangeCustomNameEnabled)}
                    />{" "}
                    Custom Name Needed
                  </Label>

                  <OrangeTeamBarInput
                    type="text"
                    placeholder="Custom Name"
                    value={orangeCustomName}
                    onChange={(e) => updateField("orangeCustomName", e.target.value)}
                    disabled={!orangeCustomNameEnabled}
                    style={{
                      backgroundColor: orangeCustomNameEnabled ? "white" : "#e0e0e0",
                      cursor: orangeCustomNameEnabled ? "text" : "not-allowed",
                    }}
                  />
                </ControlGroup>

                <ControlGroup>
                  <Label>Series Score:</Label>
                  <ScoreInput
                    type="number"
                    value={orangeSeriesScore}
                    onChange={(e) => {
                      userEditingRef.current = true;
                      updateField("orangeSeriesScore", Number(e.target.value));
                    }}
                  />
                </ControlGroup>

                <Label>
                  <input
                    type="checkbox"
                    checked={orangeTimeoutAvailable}
                    onChange={() =>
                      updateField("orangeTimeoutAvailable", !orangeTimeoutAvailable)
                    }
                  />{" "}
                  Timeout Used
                </Label>
              </div>

              <LogoWithColorInfo>
                <TeamLogo
                  src={teamKey[orangeTeamId]?.logo || fallbackLogo}
                  alt="Orange Team Logo"
                />
                <ColorInfoWrapper>
                  <ColorCodeText>{teamKey[orangeTeamId]?.borderColor || "#000000"}</ColorCodeText>
                  <ColorBar color={teamKey[orangeTeamId]?.borderColor || "#000000"} />
                </ColorInfoWrapper>
              </LogoWithColorInfo>
            </TeamRow>
          </TeamColumn>
        </TeamWrapper>
      </TeamsContainer>

      <ButtonRow>
        <UpdateButton onClick={sendUpdate}>Update</UpdateButton>
        <QuickSwapButton onClick={quickSwitch}>Quick Switch</QuickSwapButton>
        <ResetButton onClick={resetSeries}>Reset Series</ResetButton>
        <ResetOverlayButton onClick={resetOverlay}>Reset Overlay</ResetOverlayButton>
      </ButtonRow>
    </PanelWrapper>
  );
};
