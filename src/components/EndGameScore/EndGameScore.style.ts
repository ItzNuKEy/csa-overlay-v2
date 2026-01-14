import styled from "styled-components";


export const ScorebugWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  z-index: 2;
`;

export const TopBar = styled.div<{side?: 'left' | 'right'}>`
  padding: 0 24px;
  width: 1920px;
  height: 45px;

  background: linear-gradient(
    135deg,
    rgba(29, 29, 29, 1) 0%,
    rgba(46, 46, 46, 1) 100%
  );;
  color: white;
  font-size: 25px;
  font-weight: bold;
  font-family: 'Poggers';
  white-space: nowrap;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  letter-spacing: 1.5px;
`;

export const LittleTopper = styled.div<{ bgColor: string }>`
  padding: 0 24px;
  width: 1920px;
  height: 10px;

  background: ${({ bgColor }) => bgColor};  /* <-- key fix here */
  color: white;
  font-size: 20px;
  font-weight: bold;
  font-family: 'Monofonto', monospace;
  white-space: nowrap;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  letter-spacing: 1.5px;
`;

export const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const TeamNameBlock = styled.div<{
  bgColor: string;
  side?: "left" | "right";
}>`
  width: 435px;
  height: 80px;                  /* ✅ match score height */
  background: ${({ bgColor }) => bgColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  border: 5px solid;
`;


export const TeamNameText = styled.span`
  font-weight: bold;
  text-align: center;
  font-size: clamp(35px, 2vw, 28px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  font-family: 'Poggers';
  letter-spacing: 1.5px;
  text-transform: uppercase;
`;

export const ScoreValue = styled.div<{ bgColor: string }>`
  font-size: 82px;
  font-weight: 500;
  font-family: "Monofonto", monospace;  /* ✅ fix */
  min-width: 85px;
  height: 80px;

  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0;                     /* ✅ remove margin-right:-1px */

  background: ${({ bgColor }) => bgColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;


export const ScoreBGRight = styled.div`
  background-color: white;
  display: flex;                 /* ✅ */
  height: 80px;                  /* ✅ */
  align-items: center;
`;

export const ScoreBGLeft = styled.div`
  background-color: white;
  display: flex;                 /* ✅ */
  height: 80px;                  /* ✅ */
  align-items: center;
`;


//  border-radius: 0px 7px 7px 0px;

// export const ScoreBGFiller = styled.div`
//   background-color: rgb(36, 36, 36); /* This is your background */
//   display: inline-block;
// `;

export const SeriesScoreWrapper = styled.div<{ side: 'left' | 'right' }>`
  width: 335px;
  height: 28px;
  background-color:rgb(36, 36, 36) ;
  margin-top: -5px;
  position: absolute;
  top: 90px;
  ${(props) => (props.side === 'left' ? 'left: 134px;' : 'right: 134px;')};
  z-index: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
`;

export const SeriesScoreContainer = styled.div<{ team: 'blue' | 'orange' }>`
  display: flex;
  flex-direction: ${({ team }) => (team === 'blue' ? 'row-reverse' : 'row')};
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  width: 100%;
`;

export const SeriesWinBox = styled.div<{
  filled: boolean;
  $fillColor: string;
}>`
  width: 65px;
  height: 15px;
  margin: 0 4px;
  border: 1px solid;
  border-color: white;

  background-color: ${({ filled, $fillColor }) => {
    return filled ? $fillColor : "rgba(44, 44, 44, 0.7)";
  }};

  border-radius: 2px;
  transition: all 0.3s ease;
`;

export const MainRow = styled.div`
  display: flex;
  align-items: stretch;
  margin-top: -1px;    /* ✅ pulls row up to touch the topper */
`;

export const CenterBlock = styled.div`
  width: 205px;
  height: 80px;
  background-color: white;

  display: flex;
  justify-content: center;
  align-items: center;
`;


export const ClockBlock = styled.div`
  width: 100%;  /* small padding inside white block */
  height: 90px;              /* ✅ must fit inside CenterBlock 80px */
  font-size: 55px;
  font-weight: bold;
  color: white;
  background-color: rgb(36, 36, 36);

  display: flex;
  justify-content: center;
  align-items: center;

  font-family: "Monofonto", monospace;
  line-height: 1;
  border-radius: 12px;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.5), 4px 0 8px rgba(0, 0, 0, 0.5);
`;


export const GameNumberCard = styled.div`
  width: 160px;              /* ✅ match CenterBlock */
  margin-top: 12px;           /* ✅ space under row */
  font-family: "Inter", sans-serif;
  padding: 4px 10px;
  background-color: rgba(36, 36, 36, 0.95);
  color: white;
  font-size: 22px;
  text-align: center;
  white-space: nowrap;
  letter-spacing: 1px;
  border-radius: 5px;
  line-height: 1.1;
`;



//border-radius: 0px 0 5px 5px;