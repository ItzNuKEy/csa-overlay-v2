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
  gap: 0px;

  /* 🧱 Prevent events from going under camera overlay */
  max-height: 300px; /* tweak this until it aligns visually with camera bottom */
  overflow: hidden; /* hide any extra events that go past limit */
`;


export const StatfeedItem = styled.div`
  padding: 8px 18px;
  color: white;
  font-family: "Segoe UI", sans-serif;
  max-height: 100px; /* approximate max height of item */
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;

  &.fade-out {
    animation: ${fadeOut} 0.5s ease-in forwards;
  }
`;

// 💠 Icon with its own background block
export const IconWrapper = styled.div<{ roundLeftCorners?: boolean }>`
  background: #333;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${({ roundLeftCorners }) => (roundLeftCorners ? "6px" : "0")};
  border-bottom-left-radius: ${({ roundLeftCorners }) => (roundLeftCorners ? "6px" : "0")};
`;

// 🔵 Team-colored name block
export const PlayerName = styled.span`
  padding: 2px 6px;
  font-size: 24px;
  color: white;
  font-family: Monofonto, Helvetica, sans-serif;
  white-space: nowrap;
  display: inline-block;
  border: 3px solid;
`;
