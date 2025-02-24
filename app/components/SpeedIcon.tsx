import Image from "next/image";
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
    <Image
      src={img_src}
      className="size-8 2xl:size-10"
      width={32}
      height={32}
      style={styles}
      ref={ref}
      alt={`Speed Icon for ${wpm} WPM`}
    />
  );
};

export default SpeedIcon;
