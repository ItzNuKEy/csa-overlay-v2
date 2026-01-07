import { useContext, useState, useEffect, useRef } from "react";
import { GameInfoContext } from "../../contexts/GameInfoContext";
import {
  ScorebugWrapper,
  HorizontalBar,
  TeamBlock,
  TeamText,
  TeamScore,
  ClockGroup,
  ClockBlock,
  GameInfoLeft,
  GameInfoRight,
  TopBar,
  SeriesWinBox,
  TeamInnerWrapper,
  BottomRow,
  TopRow,
  SeriesScoreContainer,
  SideColorBar,
} from "./Scorebug.style";
import { GameService } from "../../services/gameService";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import TO_Indicator from "../../assets/TO_Indicator.png";
import { GoalStinger } from "./Goalstinger";
import { universalColors } from "../../constants/universalColor";

export const Scorebug = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam, topBar } = useContext(TeamDataContext);

  const { BlueTeam, OrangeTeam } = universalColors;

  const [goalStinger, setGoalStinger] = useState<{ gradient: string } | null>(null);
  const [lastScoringTeam, setLastScoringTeam] = useState<'blue' | 'orange' | null>(null);
  const [displayBlueScore, setDisplayBlueScore] = useState(gameInfo.score.blue);
  const [displayOrangeScore, setDisplayOrangeScore] = useState(gameInfo.score.orange);
  const prevScoreRef = useRef({ blue: 0, orange: 0 });

  const currentGameNumber = gameInfo.currentGameNumber;
  const orangeColor = '#ff5622';
  const blueColor = '#178BFF';
  const seriesScoreWin = '#ffffff';

  // // helper for triggering stinger
  // const triggerStinger = (
  //   team: "blue" | "orange",
  //   gradient: string,
  //   onScoreUpdate: () => void
  // ) => {
  //   // Only trigger if score actually increased
  //   if (gameInfo.score[team] <= prevScoreRef.current[team]) return;

  //   setGoalStinger(null);
  //   setTimeout(() => {
  //     setLastScoringTeam(team);
  //     setGoalStinger({ gradient });
  //   }, 0);

  //   setTimeout(() => {
  //     onScoreUpdate();
  //   }, 2100);
  // };

  // Trigger goal stinger only when score increases
useEffect(() => {
  const prev = prevScoreRef.current;

  // BLUE
  if (gameInfo.score.blue > prev.blue) {
    // Score increased → trigger stinger
    setLastScoringTeam("blue");
    setGoalStinger({ gradient: BlueTeam.gradient });
    setTimeout(() => setDisplayBlueScore(gameInfo.score.blue), 2100);
  } else if (gameInfo.score.blue !== prev.blue) {
    // Score decreased or reset → just update display
    setDisplayBlueScore(gameInfo.score.blue);
    setLastScoringTeam(null);
  }

  // ORANGE
  if (gameInfo.score.orange > prev.orange) {
    setLastScoringTeam("orange");
    setGoalStinger({ gradient: OrangeTeam.gradient });
    setTimeout(() => setDisplayOrangeScore(gameInfo.score.orange), 2100);
  } else if (gameInfo.score.orange !== prev.orange) {
    setDisplayOrangeScore(gameInfo.score.orange);
    setLastScoringTeam(null);
  }

  prevScoreRef.current = { ...gameInfo.score };
}, [gameInfo.score.blue, gameInfo.score.orange, BlueTeam.gradient, OrangeTeam.gradient]);


  return (
    <ScorebugWrapper>
      <TopBar>{topBar.topBarText}</TopBar>

      <HorizontalBar>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* LEFT TEAM */}
          <TeamBlock
            $bgColor={BlueTeam.gradient}
            $bgImage={blueTeam.logo}
            style={{ borderColor: BlueTeam.borderColor }}
          >
            <TeamInnerWrapper $side="blue">
              <TopRow>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <TeamText>{blueTeam.name}</TeamText>
                  {!gameInfo.blueTimeoutAvailable && (
                    <img
                      src={TO_Indicator}
                      alt="Timeout"
                      style={{ width: "20px", marginTop: "2px", marginLeft: "3px" }}
                    />
                  )}
                </div>
                <TeamScore $side="blue">{displayBlueScore}</TeamScore>
              </TopRow>
              <BottomRow $side="blue">
                <SeriesScoreContainer $team="blue">
                  {[...Array(gameInfo.seriesLength === 5 ? 3 : 4)].map((_, i) => (
                    <SeriesWinBox
                      key={i}
                      $filled={i < gameInfo.seriesScore.blue}
                      $fillColor={seriesScoreWin}
                    />
                  ))}
                </SeriesScoreContainer>
              </BottomRow>
            </TeamInnerWrapper>
            {lastScoringTeam === "blue" && goalStinger && (
              <GoalStinger
                key={`blue-${gameInfo.score.blue}`}
                gradient={goalStinger.gradient}
                show={true}
                containerStyle={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}
                onComplete={() => setGoalStinger(null)}
              />
            )}
          </TeamBlock>

          {/* RIGHT TEAM */}
          <TeamBlock
            $bgColor={OrangeTeam.gradient}
            $bgImage={orangeTeam.logo}
            style={{ borderColor: OrangeTeam.borderColor }}
          >
            <TeamInnerWrapper $side="orange">
              <TopRow>
                <TeamScore $side="orange">{displayOrangeScore}</TeamScore>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <TeamText>{orangeTeam.name}</TeamText>
                  {!gameInfo.orangeTimeoutAvailable && (
                    <img
                      src={TO_Indicator}
                      alt="Timeout"
                      style={{ width: "20px", marginTop: "2px", marginRight: "3px" }}
                    />
                  )}
                </div>
              </TopRow>
              <BottomRow $side="orange">
                <SeriesScoreContainer $team="orange">
                  {[...Array(gameInfo.seriesLength === 5 ? 3 : 4)].map((_, i) => (
                    <SeriesWinBox
                      key={i}
                      $filled={i < gameInfo.seriesScore.orange}
                      $fillColor={seriesScoreWin}
                    />
                  ))}
                </SeriesScoreContainer>
              </BottomRow>
            </TeamInnerWrapper>
            {lastScoringTeam === "orange" && goalStinger && (
              <GoalStinger
                key={`orange-${gameInfo.score.orange}`}
                gradient={goalStinger.gradient}
                show={true}
                containerStyle={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}
                onComplete={() => setGoalStinger(null)}
              />
            )}
          </TeamBlock>
        </div>
      </HorizontalBar>

      <ClockGroup $isOT={gameInfo.isOT}>
        <SideColorBar color={blueColor} $side="left" />
        <GameInfoLeft>GAME {currentGameNumber}</GameInfoLeft>
        <ClockBlock>{GameService.getClockFromSeconds(gameInfo.timeRemaining, gameInfo.isOT)}</ClockBlock>
        <GameInfoRight>BO{gameInfo.seriesLength}</GameInfoRight>
        <SideColorBar color={orangeColor} $side="right" />
      </ClockGroup>
    </ScorebugWrapper>
  );
};
