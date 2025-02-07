import { CSSProperties } from "react";

type SpeedIconProps = {
  speed: number;
  styles?: CSSProperties;
  ref?: React.RefObject<HTMLImageElement | null>;
};

const SpeedIcon = ({ speed, styles, ref }: SpeedIconProps) => {
  // draw different icons based on speed
  return (
    <img src="/tortoise.svg" className="size-10" style={styles} ref={ref} />
  );
};

export default SpeedIcon;
