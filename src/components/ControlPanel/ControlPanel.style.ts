import styled from "styled-components";

export const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #111;
`;

export const Main = styled.div`
  flex: 1;
  overflow: auto;
  padding: 12px;
`;

export const BottomBar = styled.div`
  height: 80px;
  border-top: 2px solid #2a2a2a;
  background: #141414;
  display: flex;
  align-items: center;
`;

export const BottomBarInner = styled.div`
  width: 100%;
  padding: 0 16px;
`;
