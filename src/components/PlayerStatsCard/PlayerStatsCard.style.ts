import styled from "styled-components";

export const StatCardWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;

  width: 760px;          /* 310 left + 450 right */
  height: 215px;         /* 175 cam + 40 bar */

  display: flex;
  flex-direction: row;
  align-items: flex-end; /* both columns sit on bottom */

  font-family: Monofonto, Helvetica, sans-serif;
`;

export const LeftColumn = styled.div`
  width: 310px;
  height: 215px;

  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* camera on top, namebar at bottom */
`;

export const RightColumn = styled.div`
  width: 450px;
  height: 215px;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

/* --- Camera block --- */
export const CameraWrapper = styled.div`
  position: relative;
  width: 310px;
  height: 175px;
`;

export const StatCardCameraBackground = styled.div<{ $color?: string; $logo?: string }>`
  position: absolute;
  inset: 0;

  background-color: ${({ $color }) => $color || "#3a3a3aab"};
  background-image: ${({ $logo }) => ($logo ? `url(${$logo})` : "none")};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  opacity: 0.6;
  pointer-events: none;
`;

export const StatCardCameraWrapper = styled.div`
  position: absolute;
  inset: 0;

  overflow: hidden;
  z-index: 1;
`;

/* --- Name bar --- */
export const NameBarContainer = styled.div`
  position: relative;
  width: 310px;
  height: 44px;
`;

export const ColorBar = styled.div`
  position: absolute;
  inset: 0;
  border: 4px solid;
`;

export const StatCardPlayerName = styled.p`
  position: absolute;
  left: 12px;
  right: 12px;
  top: 47%;
  transform: translateY(-50%);

  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: white;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* --- Right stats --- */
export const StatCardContent = styled.div`
  width: 450px;
`;

export const StatCardStatRow = styled.div`
  width: 450px;
  height: 40px;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  background-color: #242424;
`;

export const StatPair = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const StatCardStatName = styled.p`
  margin: 0;
  font-size: 20px;
  color: white;
`;

export const StatCardStatValue = styled.p`
  margin: 0;
  font-size: 30px;
  font-weight: bold;
  color: white;
`;

export const StatCardUnderline = styled.div`
  width: 450px;
  height: 4px;
`;
