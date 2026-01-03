import styled from "styled-components";

export const PanelWrapper = styled.div`
  padding: 6px 8px; /* was 7px 10px */
  background: #363636ff;
  border: 2px solid #494949ff;
  color: white;
  max-width: 1100px;
  height: 573px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  font-family: 'Inter', sans-serif;
`;

export const Label = styled.label`
  display: block;
  margin-top: 6px;
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 18px;
`;

export const ControlGroup = styled.div`
  margin-bottom: 8px; /* was 14px */
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

export const ScoreInput = styled.input`
  width: 36px;
  padding: 4px 6px;
  font-size: 18px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
`;

export const StyledSelect = styled.select`
  width: 160px;
  padding: 6px 10px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
  appearance: auto;

  &:focus {
    outline: none;
    border-color: #888;
  }
`;

export const TopBarInput = styled.input`
  width: 100%;
  max-width: 380px;
  padding: 8px 12px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fefefe;
  color: #222;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #666;
    background-color: #fff;
  }
`;

export const TopBarAndSeriesContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px; /* was 12px */
`;

export const UpdateButton = styled.button`
  width: 250px; /* same for all buttons */
  padding: 10px 0; /* remove horizontal padding so width is consistent */
  font-weight: bold;
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  background: #14532d;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #166534;
  }

  &:active {
    background: #22c55e;
  }
`;

export const ResetButton = styled(UpdateButton)`
  background: #d97706;

  &:hover {
    background: #f59e0b;
  }

  &:active {
    background: #fbbf24;
  }
`;

export const ResetOverlayButton = styled(UpdateButton)`
  background: #7f1d1d;

  &:hover {
    background: #991b1b;
  }

  &:active {
    background: #ef4444;
  }
`;

export const QuickSwapButton = styled(UpdateButton)`
  background: #008f8fff;

  &:hover {
    background: #00a7a7ff;
  }

  &:active {
    background: #00d4d4ff;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 26px;
  margin-top: 18px;
  justify-content: center; /* center buttons */
`;

export const TeamsContainer = styled.div`
  display: flex;
  gap: 20px; /* was 32px */
  justify-content: space-between;
  margin-top: 16px; /* was 24px */
`;

export const TeamColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

export const TeamRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 32px; /* was 60px */
`;

export const TeamControls = styled.div`
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

export const TeamLogo = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
`;

export const TeamWrapper = styled.div<{ teamColor?: "blue" | "orange" }>`
  background: ${({ teamColor }) =>
    teamColor === "blue"
      ? "rgba(59, 145, 250, 0.25)"
      : "rgba(249, 115, 22, 0.25)"};
  border: 2px solid
    ${({ teamColor }) => (teamColor === "blue" ? "#178BFF" : "#FF5622")};
  border-radius: 10px;
  padding: 10px 14px; /* was 16px 20px */
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px; /* was 10px */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
`;

export const ColorInfoWrapper = styled.div`
  margin-top: 8px;
  text-align: center;
`;

export const ColorCodeText = styled.div`
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 4px;
`;

export const ColorBar = styled.div<{ color: string }>`
  height: 6px;
  width: 96px; /* same width as logo */
  background-color: ${({ color }) => color};
  border-radius: 3px;
  margin: 0 auto; /* center horizontally */
`;

export const LogoWithColorInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const BlueTeamBarInput = styled.input`
  width: 100%;
  max-width: 150px;
  padding: 8px 12px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fefefe;
  color: #222;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #666;
    background-color: #fff;
  }
`;

export const OrangeTeamBarInput = styled.input`
  width: 100%;
  max-width: 150px;
  padding: 8px 12px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fefefe;
  color: #222;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #666;
    background-color: #fff;
  }
`;
