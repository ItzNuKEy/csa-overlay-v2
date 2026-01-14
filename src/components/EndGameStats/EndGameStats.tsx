import { useContext, useEffect, useState } from "react";
import { USPlayer } from "../../models/UpdateState/USPlayer";
import { GameInfoContext } from "../../contexts/GameInfoContext";

import SCOREIcon from "../../../src/assets/RLIconsSVG/stat-icons/mvp.svg";
import GoalIcon from "../../../src/assets/RLIconsSVG/stat-icons/goal.svg";
import AssistIcon from "../../../src/assets/RLIconsSVG/stat-icons/assist.svg";
import SaveIcon from "../../../src/assets/RLIconsSVG/stat-icons/save.svg";
import ShotIcon from "../../../src/assets/RLIconsSVG/stat-icons/shot-on-goal.svg";
import DemoIcon from "../../../src/assets/RLIconsSVG/stat-icons/demolition.svg";

import {
  Container,
  TeamWrapper,
  TeamColumn,
  PlayerColumn,
  StatLabelColumn,
  PlayerCell,
  PlayerName,
  PlayerNameWrapper,
  StatGroup,
  StatLabelRow,
  StatLabel,
  StatIcon,
  LineStackWrapper,
  Underline,
  BlueBar,
  OrangeBar,
  SliderWrapper,
  BlueTeamNameBacker,
  OrangeTeamNameBacker,
  MVPBadge,
  BlueTeamLogoWrapper,
  OrangeTeamLogoWrapper,
} from "./EndGameStats.style";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import { universalColors } from "../../constants/universalColor";

const statIconMap: Record<string, string> = {
  SCORE: SCOREIcon,
  GOALS: GoalIcon,
  ASSISTS: AssistIcon,
  SAVES: SaveIcon,
  SHOTS: ShotIcon,
  DEMOS: DemoIcon,
};

const LineStack = ({ count, width = "60%", height = "2px", gap = "18px" }) => (
  <LineStackWrapper style={{ gap }}>
    {Array.from({ length: count }).map((_, i) => (
      <Underline key={i} width={width} height={height} />
    ))}
  </LineStackWrapper>
);

export const EndGameStatsCard = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const { BlueTeam, OrangeTeam } = universalColors;
  const mvp = gameInfo.mvp;
  console.log("MVP from gameInfo:", mvp); // <-- Add this line
  const [players, setPlayers] = useState<USPlayer[]>([]);

  const blueTeamPlayerBG = `linear-gradient(
  to top, 
  ${BlueTeam.primary} 0%, 
  rgba(36, 36, 36, 0) 100%
)`;

const orangeTeamPlayerBG = `linear-gradient(
  to top, 
  ${OrangeTeam.primary} 0%, 
  rgba(36, 36, 36, 0) 100%
)`;

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameInfo?.players) {
        setPlayers(gameInfo.players);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [gameInfo]);

  const blueTeamP = players.filter((p) => p.team === 0);
  const orangeTeamP = players.filter((p) => p.team === 1);

  const statKeys = ["score", "goals", "assists", "saves", "shots", "demos"];
  const statLabels = ["SCORE", "GOALS", "ASSISTS", "SAVES", "SHOTS", "DEMOS"];


  // const getFontSize = (name: string) => {
  //   if (name.length > 15) return 28;
  //   if (name.length > 10) return 34;
  //   return 42;
  // };

  const getTeamStatTotals = (statKey: string) => {
    const blueTotal = blueTeamP.reduce((acc, player) => acc + (player[statKey] || 0), 0);
    const orangeTotal = orangeTeamP.reduce((acc, player) => acc + (player[statKey] || 0), 0);
    return { blueTotal, orangeTotal };
  };

  const getPercentages = (blue: number, orange: number) => {
    const total = blue + orange;
    if (total === 0) return { bluePercent: 50, orangePercent: 50 };
    return {
      bluePercent: (blue / total) * 100,
      orangePercent: (orange / total) * 100,
    };
  };

  return (
  <Container>
    <BlueTeamLogoWrapper>
      <img src={blueTeam.logo} alt="Blue Logo" />
    </BlueTeamLogoWrapper>

    <OrangeTeamLogoWrapper>
      <img src={orangeTeam.logo} alt="Orange Logo" />
    </OrangeTeamLogoWrapper>
      <LineStack count={6} width="1665px" height="4px" gap="101px" />
    <BlueTeamNameBacker bgColor={blueTeamPlayerBG} borderColor={BlueTeam.borderColor}/>
    <OrangeTeamNameBacker bgColor={orangeTeamPlayerBG} borderColor={OrangeTeam.borderColor}/>
    <TeamWrapper>
  {/* Blue Team */} 
  <TeamColumn>
    {blueTeamP.map((player) => (
      <PlayerColumn key={player.name}>
        <PlayerNameWrapper>
  {/* <PlayerName style={{ fontSize: `${getFontSize(player.name)}px` }}> */}
  <PlayerName>
    {player.name}
  </PlayerName>
  {mvp?.id === player.id && (
  <MVPBadge team={player.team === 0 ? "blue" : "orange"}>MVP</MVPBadge>
)}
</PlayerNameWrapper>
        <StatGroup>
          {statKeys.map((key) => (
            <PlayerCell key={key}>{player[key]}</PlayerCell>
          ))}
        </StatGroup>
      </PlayerColumn>
    ))}
  </TeamColumn>

  {/* Stat Labels */}
  <StatLabelColumn style={{ zIndex: 2 }}>
    <div style={{ height: "28px" }} />
    {statLabels.map((label, index) => {
      const statKey = statKeys[index];
      const { blueTotal, orangeTotal } = getTeamStatTotals(statKey);
      const { bluePercent, orangePercent } = getPercentages(blueTotal, orangeTotal);

      return (
        <div key={label} style={{ marginBottom: "22px" }}>
          <StatLabelRow>
            <StatIcon src={statIconMap[label]} alt={label} />
            <StatLabel>{label}</StatLabel>
          </StatLabelRow>
          <SliderWrapper>
            <BlueBar widthPercent={bluePercent} bgColor={BlueTeam.borderColor} />
            <OrangeBar widthPercent={orangePercent} bgColor={OrangeTeam.borderColor}/>
          </SliderWrapper>
        </div>
      );
    })}
  </StatLabelColumn>

  {/* Orange Team */}
  <TeamColumn>
    {orangeTeamP.map((player) => (
      <PlayerColumn key={player.name}>
        <PlayerNameWrapper>
  {/* <PlayerName style={{ fontSize: `${getFontSize(player.name)}px` }}> */}
  <PlayerName>
    {player.name}
  </PlayerName>
  {mvp?.id === player.id && (
  <MVPBadge team={player.team === 0 ? "blue" : "orange"}>MVP</MVPBadge>
)}
</PlayerNameWrapper>
        <StatGroup>
          {statKeys.map((key) => (
            <PlayerCell key={key}>{player[key]}</PlayerCell>
          ))}
        </StatGroup>
      </PlayerColumn>
    ))}
  </TeamColumn>
</TeamWrapper>
  </Container>
)};