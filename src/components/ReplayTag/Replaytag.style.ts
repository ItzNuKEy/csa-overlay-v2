import styled, { keyframes, css } from "styled-components";

const pulseRed = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

// Add an interface for props
interface ReplayContainerProps {
  show: boolean;
  logo?: string; // optional if you still want to keep it
}

export const ReplayContainer = styled.div<ReplayContainerProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; // align replay card near bottom
  align-items: center;
  color: white;
  overflow: visible; 
  z-index: 1;

  animation: ${({ show }) =>
    show
      ? css`${slideUp} 0.5s ease-out forwards`
      : css`${slideDown} 0.5s ease-in forwards`};

  * {
    z-index: 2; // keep text above logos
  }
`;

const slideUp = keyframes`
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const slideDown = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(50px); opacity: 0; }
`;


export const ReplayTextCorner = styled.h2<{ position: "left" | "right" }>`
  position: absolute;
  top: 10px;
  ${({ position }) => (position === "left" ? "left: 25px;" : "right: 25px;")}
  font-size: 35px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;

  letter-spacing: 5px; // <-- adjust this value as needed
`;


export const GoalInfo = styled.div`
  font-size: 35px;
  line-height: 1.4;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;

  p {
    margin: 0;
    white-space: nowrap;
  }
`;

export const StatLine = styled.div`
  display: flex;
  align-items: center;
  gap: 15px; /* space between icon and text */
`;

export const StatText = styled.span`
  font-size: 35px;
  transform: translateY(-4px); /* move text up slightly */
  white-space: nowrap;
  font-family: 'Monofonto', monospace;
`;

export const StatIcon = styled.img`
  width: 45px;
  height: 45px;
  filter: brightness(0) invert(1); /* make it white */
  flex-shrink: 0;
`;

export const FlashCircle = styled.div`
  width: 25px;
  height: 25px;
  background-color: red;
  border-radius: 50%;
  margin-left: 15px;
  margin-right: 15px;
  animation: ${pulseRed} 1s ease-in-out infinite;
`;