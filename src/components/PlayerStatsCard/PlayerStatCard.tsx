import { useContext, useEffect, useRef } from "react";
import { GameInfoContext } from "../../contexts/GameInfoContext";
import { GameService } from "../../services/gameService";
import {
  StatCardWrapper,
  StatCardContent,
  ColorBar,
  StatCardStatRow,
  StatPair,
  StatCardStatName,
  StatCardStatValue,
  StatCardPlayerName,
  StatCardUnderline,
  StatCardCameraWrapper,
  StatCardCameraBackground,
  CameraWrapper,
  LeftColumn,
  RightColumn,
  NameBarContainer,
} from "./PlayerStatsCard.style";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import { WebsocketService } from "../../services/websocketService";
import { universalColors } from "../../constants/universalColor";


export const PlayerStatCard = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const spectatedPlayer = GameService.getPlayerFromTarget(gameInfo.players, gameInfo.target);
  const { BlueTeam, OrangeTeam } = universalColors;

  const cameraWrapperRef = useRef<HTMLDivElement>(null);
  const prevPlayerRef = useRef<string | null>(null);
  
useEffect(() => {
  const currentPlayerName = spectatedPlayer?.name ?? "";

  if (!WebsocketService.webSocketConnected) return;

  // Only send if the player changed
  if (prevPlayerRef.current !== currentPlayerName) {
    if (currentPlayerName) {
      WebsocketService.send("overlay", "SHOW_PLAYER_CAMERA", {
        data: { name: currentPlayerName },
      });
      WebsocketService.send("overlay", "SHOW_CAMERA_KEY", {});
    } else {
      WebsocketService.send("overlay", "HIDE_CAMERA_KEY", {});
    }

    prevPlayerRef.current = currentPlayerName;
  }
}, [spectatedPlayer]);

useEffect(() => {
  return () => {
    if (WebsocketService.webSocketConnected) {
      console.log("🧹 PlayerStatCard unmounted — hiding CameraKey");
      WebsocketService.send("overlay", "HIDE_CAMERA_KEY", {});
    }
  };
}, []);

  if (!spectatedPlayer) return null;


  const isBlueTeam = spectatedPlayer.team === 0;
  const isBlueColor = spectatedPlayer.team === 0;
  const teamStyle = isBlueTeam ? blueTeam : orangeTeam;
  const colorStyle = isBlueColor ? BlueTeam : OrangeTeam;

  return (
    <StatCardWrapper>
      {/* LEFT SIDE: Camera + Name + ColorBar */}
      <LeftColumn>
        <CameraWrapper>
          <StatCardCameraBackground color="#3a3a3aff" logo={teamStyle.logo} />
          <StatCardCameraWrapper ref={cameraWrapperRef} style={{ border: `4px solid ${colorStyle.borderColor}` }} />
        </CameraWrapper>
        <NameBarContainer>
  <ColorBar style={{ background: colorStyle.gradient, borderColor: colorStyle.borderColor }} />
  <StatCardPlayerName>{spectatedPlayer.name}</StatCardPlayerName>
</NameBarContainer>


      </LeftColumn>

      {/* RIGHT SIDE: Stats */}
      <RightColumn>
        <StatCardContent>
          <StatCardStatRow>
            <StatPair>
              <StatCardStatValue>{spectatedPlayer.goals}</StatCardStatValue>
              <StatCardStatName>GOALS</StatCardStatName>
            </StatPair>
            <StatPair>
              <StatCardStatValue>{spectatedPlayer.shots}</StatCardStatValue>
              <StatCardStatName>SHOTS</StatCardStatName>
            </StatPair>
            <StatPair>
              <StatCardStatValue>{spectatedPlayer.assists}</StatCardStatValue>
              <StatCardStatName>ASST</StatCardStatName>
            </StatPair>
            <StatPair>
              <StatCardStatValue>{spectatedPlayer.saves}</StatCardStatValue>
              <StatCardStatName>SAVES</StatCardStatName>
            </StatPair>
          </StatCardStatRow>
          <StatCardUnderline style={{ background: colorStyle.borderColor }} />
        </StatCardContent>
      </RightColumn>
    </StatCardWrapper>
  );
};