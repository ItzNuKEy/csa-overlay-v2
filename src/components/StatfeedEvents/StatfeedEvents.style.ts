import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); max-height: 100px; }
  to { opacity: 0; transform: translateY(-20px); max-height: 0; }
`;

export const StatfeedContainer = styled.div`
  position: absolute;
  top: 100px;
  left: 5px;
  width: 600px;
  display: flex;
  flex-direction: column-reverse;
  pointer-events: none;
  z-index: 9999;

  max-height: 300px;
  overflow: hidden;
`;

/* ✅ NEW: consistent row layout */
export const StatfeedRow = styled.div`
  display: inline-flex;
  align-items: center;
  height: 44px;            /* <-- pick the height you want */
`;

export const StatfeedItem = styled.div`
  padding: 8px 18px;
  color: white;
  font-family: "Segoe UI", sans-serif;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;

  &.fade-out {
    animation: ${fadeOut} 0.5s ease-in forwards;
  }
`;


/* ✅ Icon block matches height */
export const IconWrapper = styled.div<{ $roundLeftCorners?: boolean; $borderColor?: string }>`
  height: 44px;            /* MUST match StatfeedRow height */
  width: 44px;             /* make it a square */
  display: flex;
  align-items: center;
  justify-content: center;

  background: #333;
  border: 4px solid ${({ $borderColor }) => $borderColor || "#0000"};
  border-left-width: 4px;

  border-top-left-radius: ${({ $roundLeftCorners }) => ($roundLeftCorners ? "8px" : "0")};
  border-bottom-left-radius: ${({ $roundLeftCorners }) => ($roundLeftCorners ? "8px" : "0")};
`;

/* ✅ Name block matches height */
export const PlayerName = styled.span`
  height: 44px;            /* MUST match StatfeedRow height */
  display: inline-flex;
  align-items: center;

  padding: 0 12px;         /* no vertical padding; height handles it */
  font-size: 24px;
  color: white;
  font-family: Monofonto, Helvetica, sans-serif;
  white-space: nowrap;

  border: 4px solid;       /* thicker border like you want */
`;
