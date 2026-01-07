import styled from "styled-components";

export const ScorebugWrapper = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;  /* Move from center to left */
  transform: none;  /* Remove translateX to avoid centering */
  z-index: 999;
`;


export const TopBar = styled.div`
  width: 100%;
  height: 28px; /* or whatever you need */
  background: linear-gradient(
    135deg,
    rgba(29, 29, 29, 1) 0%,
    rgba(46, 46, 46, 1) 100%
  );;
  color: white;
  font-family: 'Poggers';
  font-size: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px; /* pushes it upward away from team block */
  border-radius: 5px;
`;

export const HorizontalBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;  // ← Ensures the teams are centered now
  margin: 0;
  padding: 0;
`;

export const TeamBlock = styled.div<{ $bgColor: string; $bgImage?: string }>`
  display: flex;
  background: ${({ $bgColor }) => $bgColor};
  height: 85px;
  width: 252px;
  position: relative;
  border: 4px solid;
  box-sizing: border-box;

  overflow: hidden; /* can stay now */

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url(${(p) => p.$bgImage});
    background-size: 75%;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.5;
    z-index: 0;
  }

  * {
    z-index: 2;
  }
`;



export const LogoImg = styled.img`
  height: 48px;
  width: 48px;
  object-fit: contain;
  margin-right: 8px;
`;

export const TeamText = styled.div`
  z-index: 1;
  font-family: 'Poggers';
  font-size: 26px;
  font-weight: bold;
  color: white;
  padding-right: 2px;
  padding-left: 2px;
  margin-top: 0px;
`;

export const TeamScore = styled.div<{ $side?: "blue" | "orange" }>`
  position: absolute;
  top: -2px;               /* 👈 move up */
  ${({ $side }) => ($side === "blue" ? "right: 6px;" : "left: 6px;")} /* 👈 corners */

  font-size: 50px;
  font-weight: 900;
  color: white;
  font-family: "Monofonto", monospace;

  padding: 0;              /* ✅ kill padding so it hugs corner */
  margin: 0;               /* ✅ kill margin-top hack */
  line-height: 1;          /* ✅ prevents font baseline drift */
`;


export const TeamInnerWrapper = styled.div<{ $side: "blue" | "orange" }>`
  position: relative;
  height: 100%;
  width: 100%;
  padding: 6px 8px;
  box-sizing: border-box;
`;


export const TopRow = styled.div`
  position: relative;
  height: 52px;            /* gives us a stable area */
`;


export const BottomRow = styled.div<{ $side: "blue" | "orange" }>`
  position: absolute;
  bottom: 6px; /* ✅ tune this */
  ${({ $side }) => ($side === "blue" ? "right: 8px;" : "left: 8px;")}

  display: flex;
  align-items: center;
  z-index: 10;
`;



export const ClockGroup = styled.div<{ $isOT?: boolean }>`
position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between; /* ⬅️ this spreads out the children */
  background: linear-gradient(
    135deg,
    rgba(29, 29, 29, 1) 0%,
    rgba(46, 46, 46, 1) 100%
  );;
  height: var(--team-box-height, 30px);
  padding: 0 12px; /* ⬅️ give some space on sides */
  gap: 12px;
  border-radius: 5px;
  width: 100%; /* ⬅️ make it fill horizontally */
  box-sizing: border-box;
  margin-top: 5px;

  background: ${({ $isOT }) => ($isOT ? "#b30000" : "#242424")}; /* 🔥 red during OT */
`;

export const GameInfoLeft = styled.div`
  font-size: 18px;
  color: white;
  font-family: 'Poggers';
  width: 120px; /* <- Add fixed width */
  text-align: left;
`;

export const GameInfoRight = styled.div`
  font-size: 18px;
  color: white;
  font-family: 'Poggers';
  width: 60px; /* <- Add fixed width */
  text-align: right;
`;

export const ClockBlock = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  font-weight: bold;
  color: white;
  font-family: 'Monofonto', monospace;
  width: 120px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  text-align: center;
  pointer-events: none; /* optional: avoid interaction blocking */
`;

export const TimeoutLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 85px; // match team block height
  border-radius: 10px 0 0 10px;
  z-index: 0;
`;

export const TimeoutRight = styled.div`
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 85px; // match team block height
  z-index: 0;
`;

export const SeriesScoreWrapper = styled.div`
  margin-top: -6px; /* ← try adjusting this value */
`;

export const SeriesScoreContainer = styled.div<{ $team: "blue" | "orange" }>`
  display: flex;
  flex-direction: ${({ $team }) => ($team === "blue" ? "row-reverse" : "row")};
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
`;


export const SeriesWinBox = styled.div<{
  $filled: boolean;
  $fillColor: string;
}>`
  width: 38px;
  height: 12px;
  border-radius: 2px;

  border: 2px solid rgba(255,255,255,0.50); /* 👈 always visible */

  background-color: ${({ $filled, $fillColor }) =>
    $filled ? $fillColor : "rgba(0,0,0,0.25)"};

  box-sizing: border-box;
`;



export const SideColorBar = styled.div<{ color: string; $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background-color: ${({ color }) => color};
  border-radius: ${({ $side }) =>
    $side === "left" ? "5px 0 0 5px" : "0 5px 5px 0"};
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  z-index: 1;
`;

