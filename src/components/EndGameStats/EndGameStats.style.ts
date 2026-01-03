import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;   /* horizontal centering */
  align-items: flex-end;     /* align everything to the bottom */
  height: 1080px;
  width: 1920px;
  background: rgba(0, 0, 0, 0.65); 
  color: white;
  font-family: "Segoe UI", sans-serif;
  font-size: 24px;
  box-sizing: border-box;
  padding-bottom: 74px; /* initial distance from bottom, adjust freely */
  position: relative; /* <-- add this */
  z-index: 1;
`;

export const TeamWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end; /* makes each column bottom-aligned */
  gap: 0px;
`;

export const TeamColumn = styled.div`
  display: flex;
  flex-direction: row;
`;

export const PlayerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px; /* fixed width for consistent layout */
  flex-shrink: 0;
`;

export const StatLabelColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: -39px;
`;

export const PlayerCell = styled.div`
  width: 180px;
  text-align: center;
  font-size: 50px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Monofonto"; monospace;
`;

export const PlayerName = styled.div`
  font-size: clamp(20px, 5vw, 40px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
  font-family: "Monofonto"; monospace;

  transform: translateY(-20px); 
`;


export const PlayerNameWrapper = styled.div`
  height: 110px;  /* increased from 60px to allow shifting */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible; /* keep this to prevent overflow elsewhere */
  position: relative; /* Add this */
`;


export const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 41px;
`;

export const StatLabelRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;

  /* Manual nudge to center everything visually */
  transform: translateX(-32px);  // adjust left/right manually
`;

export const StatIcon = styled.img`
  width: 57px;
  height: 57px;
  /* Remove position: absolute, left, top, transform */
  filter: brightness(0) invert(1);
`;

export const StatLabelText = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #ccc;
  text-transform: uppercase;
  text-align: center;
`;

export const StatLabel = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #ccc;
  text-transform: uppercase;
  margin-bottom: 3px; // just a light nudge
`;

export const LineStackWrapper = styled.div`
  position: absolute;
  bottom: 57px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  opacity: 0.75;
  z-index: 0; /* push behind */
`;

export const Underline = styled.div<{ width?: string; height?: string }>`
  background-color:rgb(70, 70, 70);
  width: ${({ width }) => width || "60%"};
  height: ${({ height }) => height || "2px"};
`;

export const SliderWrapper = styled.div`
  display: flex;
  width: 320px;  // match PlayerCell width or desired size
  height: 10px;
  background: #222;  // background for empty bar
  border-radius: 3px;
  overflow: hidden;
  margin: 8px auto 0 auto; // center and small top margin
`;

export const BlueBar = styled.div<{ widthPercent: number; bgColor: string; }>`
  background-color:${({ bgColor }) => bgColor};
  width: ${({ widthPercent }) => widthPercent}%;
  transition: width 0.3s ease;
`;

export const OrangeBar = styled.div<{ widthPercent: number; bgColor: string; }>`
  background-color:${({ bgColor }) => bgColor};
  width: ${({ widthPercent }) => widthPercent}%;
  transition: width 0.3s ease;
`;

export const BlueTeamNameBacker = styled.div<{bgColor: string; borderColor: string;}>`
  position: absolute;
  top: 190px; /* Adjust to match PlayerNameWrapper */
  left: 0;
  width: 840px; /* Half of 1920px (for blue side) */
  height: 120px;
  background: ${({ bgColor }) => bgColor};
  pointer-events: none;
  z-index: 0;
  overflow: hidden; /* clip the ::after line */

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 13px; /* thickness of the line */
    background: ${({ borderColor }) => borderColor}; /* blue gradient */
  }
`;


export const OrangeTeamNameBacker = styled.div<{bgColor: string; borderColor: string;}>`
  position: absolute;
  top: 190px; /* Adjust to match PlayerNameWrapper */
  right: 0;
  width: 840px; /* Half of 1920px (for orange side) */
  height: 120px;
  background: ${({ bgColor }) => bgColor};
  pointer-events: none;
  z-index: 0;
  overflow: hidden; /* clip the ::after line */

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 13px; /* thickness of the line */
    background: ${({ borderColor }) => borderColor}; /* orange gradient */
  }
`;

export const MVPBadge = styled.div<{ team: "blue" | "orange" }>`
  position: absolute;
  top: -29px; /* Move higher above the name */
  left: 50%;
  transform: translateX(-50%); /* Center it horizontally */
  color: rgb(238, 194, 0);
  font-weight: bold;
  font-size: 32px;
  stroke: 1px;
  stroke-color: white;
  pointer-events: none;
  user-select: none;
  z-index: 5;
`;

export const BlueTeamLogoWrapper = styled.div`
  position: absolute;
  top: 20px;
  left: 0px;
  width: 275px;
  height: 275px;
  z-index: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.6;
  }
`;

export const OrangeTeamLogoWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 0px;
  width: 275px;
  height: 275px;
  z-index: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.6;
  }
`;
