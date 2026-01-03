export interface ReplayCardSVGProps extends React.SVGProps<SVGSVGElement> {
  innerColor?: string;
  outerColor?: string;
  leftLogo?: string;
  rightLogo?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoY?: number;
  leftX?: number;
  rightX?: number;
  logoOpacity?: number; // <-- add this
}



export const ReplayCardSVG: React.FC<ReplayCardSVGProps> = ({
  innerColor = "rgba(255,255,255,0.4)",
  outerColor = "rgba(255,255,255,1)",
  leftLogo,
  rightLogo,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1920 1080"
    {...props}
  >
    <defs>
      <radialGradient id="replayGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor={innerColor} stopOpacity={0.4} />
        <stop offset="100%" stopColor={outerColor} stopOpacity={1} />
      </radialGradient>

      {/* CLIP PATH matching the card shape */}
      <clipPath id="cardClip">
        <path d="m150 958c71.39 5.05 143 7 143 7 0 0 3.32 0.49 6 2 4.8 2.7 8 8 8 8l19 28c0 0 2.99 2.94 6.57 4.49 3.93 1.68 8.55 1.73 8.55 1.73 0 0 186.4 7.52 372.88 11.78 122.98 2.81 246 4 246 4v55h-960v-134c0 0 74.88 6.69 150 12zm1620 0c-71.39 5.05-143 7-143 7 0 0-3.32 0.49-6 2-4.8 2.7-8 8-8 8l-19 28c0 0-2.99 2.94-6.57 4.49-3.93 1.68-8.55 1.73-8.55 1.73 0 0-186.4 7.52-372.88 11.78-122.98 2.81-246 4-246 4v55h960v-134c0 0-74.88 6.69-150 12z" />
      </clipPath>
    </defs>

    <path
      d="m150 958c71.39 5.05 143 7 143 7 0 0 3.32 0.49 6 2 4.8 2.7 8 8 8 8l19 28c0 0 2.99 2.94 6.57 4.49 3.93 1.68 8.55 1.73 8.55 1.73 0 0 186.4 7.52 372.88 11.78 122.98 2.81 246 4 246 4v55h-960v-134c0 0 74.88 6.69 150 12zm1620 0c-71.39 5.05-143 7-143 7 0 0-3.32 0.49-6 2-4.8 2.7-8 8-8 8l-19 28c0 0-2.99 2.94-6.57 4.49-3.93 1.68-8.55 1.73-8.55 1.73 0 0-186.4 7.52-372.88 11.78-122.98 2.81-246 4-246 4v55h960v-134c0 0-74.88 6.69-150 12z"
      fill="url(#replayGradient)"
    />

    {/* TEAM LOGOS with clipPath */}
    {leftLogo && (
  <image
    href={leftLogo}
    x={props.leftX ?? 100}
    y={props.logoY ?? 850}
    width={props.logoWidth ?? 250}
    height={props.logoHeight ?? 250}
    opacity={props.logoOpacity ?? 0.5} // semi-transparent
    clipPath="url(#cardClip)"          // <- apply the clip
  />
)}
{rightLogo && (
  <image
    href={rightLogo}
    x={props.rightX ?? 1570}
    y={props.logoY ?? 850}
    width={props.logoWidth ?? 250}
    height={props.logoHeight ?? 250}
    opacity={props.logoOpacity ?? 0.5}
    clipPath="url(#cardClip)"
  />
)}


  </svg>
);