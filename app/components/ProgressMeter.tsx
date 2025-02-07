import { useRef } from "react";
import useElementSize from "../hooks/useElementSize";
import { Participant, User } from "../types/request";
import SpeedIcon from "./SpeedIcon";

type ProgressMeterProps = {
  participant: Participant;
  length: number;
};

const ProgressMeter = ({
  participant: { correctPos, speed },
  length,
}: ProgressMeterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const { width: iconWidth, height: iconHeight } = useElementSize(iconRef);
  const { width } = useElementSize(containerRef);
  const progress = length === 0 ? 0 : (correctPos / length) * width;

  return (
    <div className="w-full bg-black">
      <div
        ref={containerRef}
        className="flex my-2 border-r-4 box-border"
        style={{ width: `calc(100% - ${iconWidth}px)`, height: iconHeight }}
      >
        <SpeedIcon
          speed={speed}
          styles={{ transform: `translateX(${progress}px)` }}
          ref={iconRef}
        />
      </div>
    </div>
  );
};

export default ProgressMeter;
