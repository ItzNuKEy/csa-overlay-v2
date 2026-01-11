import { useContext } from "react";
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
  LeftColumn,
  RightColumn,
  NameBarContainer,
} from "./PlayerStatsCard.style";
import { universalColors } from "../../constants/universalColor";


export const PlayerStatCard = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const spectatedPlayer = GameService.getPlayerFromTarget(gameInfo.players, gameInfo.target);
  const { BlueTeam, OrangeTeam } = universalColors;

  if (!spectatedPlayer) return null;


  const isBlueColor = spectatedPlayer.team === 0;
  const colorStyle = isBlueColor ? BlueTeam : OrangeTeam;

  return (
    <StatCardWrapper>
      {/* LEFT SIDE: Camera + Name + ColorBar */}
      <LeftColumn>
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