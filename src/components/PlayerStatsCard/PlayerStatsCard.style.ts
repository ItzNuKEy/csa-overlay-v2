import styled from "styled-components";

export const StatCardWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 700px;
  height: 215px; // colorbar + camerawrapper height
  display: flex;
  flex-direction: row;
  align-items: flex-end; // align columns to bottom
  font-family: Monofonto, Helvetica, sans-serif;
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;  // 🟢 left-align camera + color bar
  justify-content: flex-start;
  margin-right: -33px;
  height: 100%;
`;


export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  height: 100%;
`;


export const CameraWrapper = styled.div`
  position: relative;
  width: 310px;
  height: 175px;
  margin: 0;
  padding: 0;
`;

export const ColorBar = styled.div`
  width: 310px;
  height: 40px;
  border: 4px solid;
  z-index: 0; // behind name
`;

export const StatCardPlayerName = styled.p`
  position: absolute;
  bottom: -32px; /* keep it comfortably inside the color bar */
  left: 12px;
  z-index: 2;
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NameBarContainer = styled.div`
  position: relative;
  width: 349px;
  height: 40px;
  margin-top: -4px; /* pulls it tight under the camera */
  z-index: 5; /* sits above color bar but below camera */
  display: flex;
  align-items: center; /* vertically center name text */
`;


export const StatCardContent = styled.div`
  position: relative;  // make ColorBar stack behind text
  z-index: 1;
  width: 100%;
  padding: 0;
`;

export const StatCardStatRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background-color: #242424;
  height: 40px;
  width: 450px;
  align-items: center;
`;


// Wrap each stat name and value in a flex row container
export const StatPair = styled.div`
  display: flex;
  flex-direction: row;  // side by side
  align-items: center;  // vertically centered
  gap: 6px;
`; 

export const StatCardStatName = styled.p`
  font-size: 20px;
  margin: 0;
  color: white;
  text-shadow:
  z-index: 999;
`;

export const StatCardStatValue = styled.p`
  font-size: 30px;
  font-weight: bold;
  margin: 0;
  color: white;
`;

export const StatCardUnderline = styled.div`
  height: 4px;
  width: 450px;
`;

export const StatCardCameraWrapper = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 310px;
  height: 175px;
  overflow: hidden;
  z-index: 1;
`;

export const StatCardCameraBackground = styled.div<{ color?: string; logo?: string }>`
  position: absolute;
  bottom: 3px;
  left: 3px;
  width: 314px;
  height: 177px;

  background-color: ${({ color }) => color || "#3a3a3aab"};
  background-image: ${({ logo }) => (logo ? `url(${logo})` : "none")};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0; // behind StatCardCameraWrapper
  pointer-events: none;
  opacity: 0.6;
`;
