import { useContext, useEffect, useState } from "react";
import { GameService } from "../../services/gameService";
import { ReplayContainer, GoalInfo, ReplayTextCorner, StatIcon, StatLine, StatText, FlashCircle } from "../ReplayTag/Replaytag.style";
import { GameInfoContext } from "../../contexts/GameInfoContext";

import GoalIcon from "../../../src/assets/RLIconsSVG/stat-icons/goal.svg";
import AssistIcon from "../../../src/assets/RLIconsSVG/stat-icons/assist.svg";
import SpeedIcon from "../../../src/assets/RLIconsSVG/stat-icons/shot-on-goal.svg";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import { ReplayCardSVG } from "./ReplayCardSVG";
import { universalColors } from "../../constants/universalColor";

const statIconMap: Record<string, string> = {
  SCORER: GoalIcon,
  ASSISTS: AssistIcon,
  SPEED: SpeedIcon,
};

export const ReplayTag = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const { BlueTeam, OrangeTeam } = universalColors;

  const [goalInfo, setGoalInfo] = useState(GameService.replayTagService.getLatestGoal());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGoalInfo(GameService.replayTagService.getLatestGoal());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Show/hide the replay card based on the actual replay event
  useEffect(() => {
    if (gameInfo.isReplay) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [gameInfo.isReplay]);

  // If we don't even have goalInfo yet, render nothing
  if (!goalInfo) return null;

  const isBlueTeam = goalInfo.scorer.teamnum === 0;
  const scorerTeam = isBlueTeam ? blueTeam : orangeTeam;
  const colorTeam = isBlueTeam ? BlueTeam : OrangeTeam;

  const innerColor = colorTeam.secondary;
  const outerColor = colorTeam.primary;
  const logoWidth = 250;
  const logoOffset = 40;

  return (
    <ReplayContainer show={visible}>
      <ReplayCardSVG
        innerColor={innerColor}
        outerColor={outerColor}
        leftLogo={scorerTeam.logo}
        rightLogo={scorerTeam.logo}
        logoWidth={logoWidth}
        logoHeight={logoWidth}
        leftX={logoOffset}
        rightX={1920 - logoWidth - logoOffset}
        logoY={895}
        logoOpacity={0.25}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* REPLAY indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '125px',
          left: 0,
          width: '100%',
          zIndex: 2,
        }}
      >
        <ReplayTextCorner position="left">
          <FlashCircle />
          REPLAY
        </ReplayTextCorner>

        <ReplayTextCorner position="right">
          REPLAY
          <FlashCircle />
        </ReplayTextCorner>

      </div>

      {/* Bottom stats */}
      <div
        style={{
          position: 'absolute',
          bottom: '6px',
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <GoalInfo>
          <StatLine>
            <StatIcon src={statIconMap.SCORER} alt="Scorer:" />
            <StatText>{goalInfo.scorer.name}</StatText>
          </StatLine>

          <StatLine>
            <StatIcon src={statIconMap.SPEED} alt="Speed:" />
            <StatText>{Math.round(goalInfo.goalspeed)} KPH</StatText>
          </StatLine>

          {goalInfo.assister && (
            <StatLine>
              <StatIcon
                src={statIconMap.ASSISTS}
                alt="Assister:"
                size={43} // 👈 1–2px smaller
              />
              <StatText>{goalInfo.assister.name}</StatText>
            </StatLine>
          )}
        </GoalInfo>
      </div>
    </ReplayContainer>
  );
};
