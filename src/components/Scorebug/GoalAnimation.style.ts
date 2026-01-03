import styled, { keyframes } from "styled-components";

// 1️⃣ Expand: grow from left
const expand = keyframes`
  0% {
    transform: skew(-20deg) scaleX(0);
  }
  100% {
    transform: skew(-20deg) scaleX(1);
  }
`;

// 2️⃣ Retract: shrink from right
const retract = keyframes`
  0% {
    transform: skew(-20deg) scaleX(1);
    transform-origin: right;
  }
  100% {
    transform: skew(-20deg) scaleX(0);
    transform-origin: right;
  }
`;

// Slide + fade + spacing effect
const textAnim = keyframes`
  0% {
    opacity: 0;
    transform: translate(-150%, -50%) scale(0.95);
    letter-spacing: 10px;       /* start with small gaps */
  }
  25% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    letter-spacing: 10px;       /* keep normal while centered */
  }
  45% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
    letter-spacing: 22px;      /* pop bigger gaps */
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    letter-spacing: 10px;       /* settle back */
  }
  100% {
    opacity: 0;
    transform: translate(50%, -50%) scale(0.95);
    letter-spacing: 10px;
  }
`;

export const StingerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;           /* sit above TeamInnerWrapper */
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StingerBox = styled.div<{ gradient: string; delay: number }>`
  width: 65px;
  height: 100%;
  background: ${({ gradient }) => gradient};
  transform-origin: left;
  transform: scaleX(0) skew(-20deg);
  animation: 
    ${expand} 0.6s ease forwards,
    ${retract} 0.6s ease forwards 3.5s;
  animation-delay: ${({ delay }) => `${delay}s, ${delay + 2}s`}; 
`;



export const StingerText = styled.div`
  position: absolute;
  top: 50%;
  left: 53%;
  transform: translate(-50%, -50%);
  font-size: 60px;
  font-weight: 900;
  color: white;
  font-family: 'Monofonto', monospace;
  z-index: 10;
  pointer-events: none;
  text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
  white-space: nowrap;

  animation: ${textAnim} 3.5s ease-in-out forwards;
`;


