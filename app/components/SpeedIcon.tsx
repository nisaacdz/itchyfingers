import { CSSProperties } from "react";

type SpeedIconProps = {
  speed: number;
  styles?: CSSProperties;
  ref?: React.RefObject<HTMLImageElement | null>;
};

const SpeedIcon = ({ speed, styles, ref }: SpeedIconProps) => {
  // draw different icons based on speed
  const img_src = speed < 30 ? "/tortoise.svg" : speed < 50 ? "/rabbit.svg" : speed < 80 ? "/dog.svg" : "/rocket.svg";
  return (
    <img src={img_src} className="size-10" style={styles} ref={ref} />
  );
};

export default SpeedIcon;
