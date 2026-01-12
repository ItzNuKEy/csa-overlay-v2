import { useContext } from "react";
import { GameInfoContext } from "../../contexts/GameInfoContext";
import { GameService } from "../../services/gameService";
import {
  BoostMeterInnerCircle,
  BoostMeterRing,
  BoostMeterText,
  BoostMeterWrapper
} from "./PlayerBoostMeter.style";
import  boostBottom  from "../../assets/Meter_Bottom.svg";
import  boostTop  from "../../assets/Meter_Top.svg";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";
import { universalColors } from "../../constants/universalColor";

export const PlayerBoostMeter = () => {
  const { gameInfo } = useContext(GameInfoContext);
  const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const spectatedPlayer = GameService.getPlayerFromTarget(gameInfo.players, gameInfo.target);
  const { BlueTeam, OrangeTeam } = universalColors;

  const gradientId = spectatedPlayer?.team === 0 ? "boostGradientBlue" : "boostGradientOrange";
  const SVG_SIZE = 225;
  const STROKE_WIDTH = 37;

  const radius = SVG_SIZE / 2 - STROKE_WIDTH / 2 - 3;
  const fullCircumference = 2 * Math.PI * radius;
  const maxArcPercent = 0.75; // 75% of circle
  const maxArcLength = fullCircumference * maxArcPercent;

  const boostPercent = spectatedPlayer?.boost ?? 0;
  const dashOffset = maxArcLength * ((100 - boostPercent) / 100);

  const isBlueTeam = spectatedPlayer?.team === 0;
  const isBlueColor = spectatedPlayer?.team === 0;
  const teamStyle = isBlueTeam ? blueTeam : orangeTeam;
  const colorStyle = isBlueColor ? BlueTeam : OrangeTeam;

  return (
    <BoostMeterWrapper>
  {spectatedPlayer && (
    <svg height={SVG_SIZE} width={SVG_SIZE}>
  {/* Gradient Definition */}
  <defs>
    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={colorStyle.secondary} />
      <stop offset="100%" stopColor={colorStyle.primary} />
    </linearGradient>
  </defs>

  {/* Meter Base Layer */}
  <image href={boostBottom} width={SVG_SIZE} height={SVG_SIZE} />

  {/* Animated Boost Ring */}
  <BoostMeterRing
    $color={`url(#${gradientId})`}
    $dashoffset={dashOffset}
    $arcLength={maxArcLength}
    strokeWidth={STROKE_WIDTH}
    fill="transparent"
    r={radius}
    cx={SVG_SIZE / 2}
    cy={SVG_SIZE / 2}
    transform={`rotate(90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
    opacity={spectatedPlayer.boost === 0 ? 0 : 1}
  />

  {/* Inner Circle Ring */}
  <BoostMeterInnerCircle
    r={radius - STROKE_WIDTH / 2}
    cx={SVG_SIZE / 2}
    cy={SVG_SIZE / 2}
  />

  {/* Meter Top Layer */}
  <image href={boostTop} width={SVG_SIZE} height={SVG_SIZE} />

  {/* ✅ NEW: Team Logo */}
  {teamStyle.logo && (
    <image
      href={teamStyle.logo}
      x={SVG_SIZE * 0.20}
      y={SVG_SIZE * 0.20}
      width={SVG_SIZE * 0.6}
      height={SVG_SIZE * 0.6}
      opacity="0.3"
      preserveAspectRatio="xMidYMid meet"
    />
  )}

  {/* Boost Text */}
  <BoostMeterText
    $boost={spectatedPlayer.boost}
    $strokeColor={colorStyle.borderColor}
    strokeWidth={1.5}
    x="49.60%"
    y="51.75%"
  >
    {boostPercent}
  </BoostMeterText>
</svg>
  )}
</BoostMeterWrapper>
  );
};
