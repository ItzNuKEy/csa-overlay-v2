import { GameInfoContext } from "../../contexts/GameInfoContext";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import {
  ClockBlock,
  GameNumberCard,
  ScoreBGRight,
  ScoreBGLeft,
  ScoreValue,
  ScorebugWrapper,
  SeriesScoreContainer,
  SeriesScoreWrapper,
  SeriesWinBox,
  TeamContainer,
  TeamNameBlock,
  TeamNameText,
  TopBar,
  LittleTopper,
  MainRow,
  CenterBlock,
} from "./EndGameScore.style";
import { useContext } from "react";
import { universalColors } from "../../constants/universalColor";

export const EndGameScore = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam, topBar } = useContext(TeamDataContext);
  const { BlueTeam, OrangeTeam } = universalColors;
  const littleTopperColor = `linear-gradient(
  90deg, 
  ${BlueTeam.borderColor} 0%, 
  rgb(36, 36, 36) 50%, 
  ${OrangeTeam.borderColor} 100%
)`;

  const currentGameNumber = gameInfo.currentGameNumber;

  return (
    <ScorebugWrapper>
      <TopBar>{topBar.topBarText}</TopBar>
      <LittleTopper bgColor={littleTopperColor} />

      {/* ✅ NEW: stack wrapper */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <MainRow>
          <TeamContainer>
            <TeamNameBlock
              bgColor={BlueTeam.gradient}
              side="left"
              style={{ borderColor: BlueTeam.borderColor }}
            >
              <TeamNameText>{blueTeam.city}</TeamNameText>
            </TeamNameBlock>

            <ScoreBGLeft>
              <ScoreValue bgColor={BlueTeam.gradient}>{gameInfo.score.blue}</ScoreValue>
            </ScoreBGLeft>

            <SeriesScoreWrapper side="left">
              <SeriesScoreContainer team="blue">
                {[...Array(gameInfo.seriesLength === 5 ? 3 : 4)].map((_, i) => (
                  <SeriesWinBox
                    key={i}
                    filled={i < gameInfo.seriesScore.blue}
                    $fillColor={BlueTeam.borderColor}
                  />
                ))}
              </SeriesScoreContainer>
            </SeriesScoreWrapper>
          </TeamContainer>

          {/* ✅ Center block ONLY contains the clock */}
          <CenterBlock>
            <ClockBlock>GAME {currentGameNumber}</ClockBlock>
          </CenterBlock>

          <TeamContainer>
            <ScoreBGRight>
              <ScoreValue bgColor={OrangeTeam.gradient}>{gameInfo.score.orange}</ScoreValue>
            </ScoreBGRight>

            <TeamNameBlock
              bgColor={OrangeTeam.gradient}
              side="right"
              style={{ borderColor: OrangeTeam.borderColor }}
            >
              <TeamNameText>{orangeTeam.city}</TeamNameText>
            </TeamNameBlock>

            <SeriesScoreWrapper side="right">
              <SeriesScoreContainer team="orange">
                {[...Array(gameInfo.seriesLength === 5 ? 3 : 4)].map((_, i) => (
                  <SeriesWinBox
                    key={i}
                    filled={i < gameInfo.seriesScore.orange}
                    $fillColor={OrangeTeam.borderColor}
                  />
                ))}
              </SeriesScoreContainer>
            </SeriesScoreWrapper>
          </TeamContainer>
        </MainRow>

        {/* ✅ Now it’s beneath the clock, centered */}
        <GameNumberCard>BEST OF {gameInfo.seriesLength}</GameNumberCard>
      </div>
    </ScorebugWrapper>
  );
};
