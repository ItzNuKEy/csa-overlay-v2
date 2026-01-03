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

export const TeamBlock = styled.div<{ bgColor: string; bgImage?: string;}>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: ${({ bgColor }) => bgColor};
  height: 85px;
  width: 252px;
  position: relative;
  overflow: hidden;
  flex: 1;
  border: 4px solid; /* ← Add your border here */
  box-sizing: border-box;
  background-clip: border-box;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${props => props.bgImage});
    background-size: 75%;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.5;
    z-index: 0;
  }

  * {
    z-index: 2; /* Ensure all children appear above background */
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

export const TeamScore = styled.div`
  font-size: 50px;
  font-weight: 900;
  color: white;
  font-family: 'Monofonto', monospace;
  padding-right: 8px;
  padding-left: 8px;
  margin-top: -4px;
`;

export const TeamInnerWrapper = styled.div<{ side: "blue" | "orange" }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 4px 6px;
`;

export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;


export const BottomRow = styled.div<{ side: "blue" | "orange" }>`
  display: flex;
  justify-content: ${({ side }) =>
    side === "blue" ? "flex-end" : "flex-start"};
  flex-direction: row;
  gap: 9px;
`;

export const ClockGroup = styled.div<{ isOT?: boolean }>`
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

  background: ${({ isOT }) => (isOT ? "#b30000" : "#242424")}; /* 🔥 red during OT */
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

export const SeriesScoreContainer = styled.div<{ team: 'blue' | 'orange' }>`
  display: flex;
  flex-direction: ${({ team }) => (team === 'blue' ? 'row-reverse' : 'row')};
  justify-content: flex-start;
  gap: 13px;
  margin-bottom: 10px;
  width: 100%;
`;

export const SeriesWinBox = styled.div<{
  filled: boolean;
  $fillColor: string;
}>`
  width: 40px;
  height: 8px;
  margin: 4px;
  border-radius: 2px;

  background-color: ${({ filled, $fillColor }) => {
    return filled ? $fillColor : "rgba(44, 44, 44, 0.7)";
  }};

  transition: all 0.3s ease;
`;

export const SideColorBar = styled.div<{ color: string; side: "left" | "right" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background-color: ${({ color }) => color};
  border-radius: ${({ side }) =>
    side === "left" ? "5px 0 0 5px" : "0 5px 5px 0"};
  ${({ side }) => (side === "left" ? "left: 0;" : "right: 0;")}
  z-index: 1;
`;

