import { CSSProperties } from "react";

type SpeedIconProps = {
  wpm: number;
  styles?: CSSProperties;
  ref?: React.RefObject<HTMLImageElement | null>;
};

const SpeedIcon = ({ wpm, styles, ref }: SpeedIconProps) => {
  // draw different icons based on speed
  const img_src =
    wpm < 25
      ? "/walk.svg"
      : wpm < 50
        ? "/ride.svg"
        : wpm < 75
          ? "/drive.svg"
          : wpm < 100
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
