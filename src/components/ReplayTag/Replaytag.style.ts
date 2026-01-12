import styled, { keyframes, css } from "styled-components";

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
  top: 0px;
  ${({ position }) => (position === "left" ? "left: 28px;" : "right: 28px;")}

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;

  margin: 0;
  padding: 8px 22px;

  font-size: 42px;
  font-weight: 800;
  letter-spacing: 6px;
  text-transform: uppercase;
  font-family: 'Monofonto', monospace;
  color: rgba(255,255,255,0.82);

  transform-origin: ${({ position }) => (position === "left" ? "left center" : "right center")};
  transform: ${({ position }) =>
    position === "left"
      ? "skewX(-7deg) rotate(2deg)"
      : "skewX(-7deg) rotate(-2deg)"};

  text-shadow:
    0 1px 0 rgba(0,0,0,0.55),
    0 0 6px rgba(255,255,255,0.30),
    0 0 12px rgba(255,255,255,0.14);

  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
`;

export const StatLine = styled.div`
  display: flex;
  align-items: center;
  gap: 15px; /* space between icon and text */
`;

export const GoalInfo = styled.div`
  font-size: 34px;
  line-height: 1.2;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;

  color: rgba(255,255,255,0.85);

  /* Image drop-shadow → text-shadow equivalent */
  text-shadow:
    0 1px 0 rgba(0,0,0,0.45),        /* hard contrast */
    0 0 6px rgba(255,255,255,0.35), /* tight glow */
    0 0 12px rgba(255,255,255,0.15);/* soft outer glow */

  p {
    margin: 0;
    white-space: nowrap;
  }
`;


export const StatText = styled.span`
  font-size: 34px;
  white-space: nowrap;
  letter-spacing: 2px;
  font-family: 'Monofonto', monospace;
`;


export const StatIcon = styled.img<{ size?: number }>`
  width: ${({ size }) => (size ? `${size}px` : "45px")};
  height: ${({ size }) => (size ? `${size}px` : "45px")};
  flex-shrink: 0;

  opacity: 0.85;

  /* Make it white */
  filter: brightness(0) invert(1);

  /* Subtle glow / haze like text */
  filter:
    brightness(0)
    invert(1)
    drop-shadow(0 1px 0 rgba(0,0,0,0.45))
    drop-shadow(0 0 6px rgba(255,255,255,0.35))
    drop-shadow(0 0 12px rgba(255,255,255,0.15));

  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
`;


const glowPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow:
      0 0 0 0 rgba(255, 0, 0, 0.55),
      0 0 12px 2px rgba(255, 0, 0, 0.45),
      0 0 22px 6px rgba(255, 0, 0, 0.25);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    box-shadow:
      0 0 0 6px rgba(255, 0, 0, 0.0),
      0 0 16px 4px rgba(255, 0, 0, 0.55),
      0 0 30px 10px rgba(255, 0, 0, 0.30);
    opacity: 0.9;
  }
`;

export const FlashCircle = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.95);
  animation: ${glowPulse} 1s ease-in-out infinite;

  /* extra crisp highlight */
  position: relative;
  &::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    filter: blur(0.2px);
  }
`;
