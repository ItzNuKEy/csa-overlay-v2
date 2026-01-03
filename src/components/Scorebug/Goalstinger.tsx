import { useEffect, useState } from "react";
import { StingerWrapper, StingerBox, StingerText } from "./GoalAnimation.style";

interface GoalStingerProps {
  gradient: string;
  show: boolean;
  onComplete: () => void;
  containerStyle?: React.CSSProperties;
}

export const GoalStinger = ({ gradient, show, onComplete, containerStyle }: GoalStingerProps) => {
  const [active, setActive] = useState(show);

  useEffect(() => {
    if (show) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onComplete();
      }, 3500);  // match shortened animation duration
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!active) return null;

  return (
    <StingerWrapper style={containerStyle}>
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",  // centers the group
      display: "flex",                           // spacing between blocks
      width: "320px",                        // manually control total width
      height: "85px",                        // match your blocks
    }}
  >
    {[...Array(5)].map((_, i) => (
      <StingerBox key={i} gradient={gradient} delay={i * 0.1} />
    ))}
    <StingerText>GOAL</StingerText>
  </div>
</StingerWrapper>

  );
};
