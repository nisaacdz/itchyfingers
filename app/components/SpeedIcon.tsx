import { CSSProperties } from "react";

type SpeedIconProps = {
  speed: number;
  styles?: CSSProperties;
  ref?: React.RefObject<HTMLImageElement | null>;
};

const SpeedIcon = ({ speed, styles, ref }: SpeedIconProps) => {
  // draw different icons based on speed
  const img_src =
    speed < 25
      ? "/walk.svg"
      : speed < 50
        ? "/ride.svg"
        : speed < 75
          ? "/drive.svg"
          : speed < 100
            ? "/fly.svg"
            : "/rocket.svg";
  return (
    <img
      src={img_src}
      className="size-8 2xl:size-10"
      style={styles}
      ref={ref}
    />
  );
};

export default SpeedIcon;
