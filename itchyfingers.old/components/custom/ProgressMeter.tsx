import { useRef } from "react";
import useElementSize from "@/hooks/useElementSize";
import { Participant } from "@/types/request";
import SpeedIcon from "./SpeedIcon";

type ProgressMeterProps = {
  participant: Participant;
  length: number;
};

const ProgressMeter = ({
  participant: { correct_position, current_speed },
  length,
}: ProgressMeterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const { width: iconWidth, height: iconHeight } = useElementSize(iconRef);
  const { width } = useElementSize(containerRef);
  const progress = length === 0 ? 0 : (correct_position / length) * width;

  return (
    <div className="w-full bg-muted py-1">
      <div
        ref={containerRef}
        className="flex border-r-4 box-border border-muted-foreground"
        style={{ width: `calc(100% - ${iconWidth}px)`, height: iconHeight }}
      >
        <SpeedIcon
          wpm={current_speed}
          styles={{ transform: `translateX(${progress}px)` }}
          ref={iconRef}
        />
      </div>
    </div>
  );
};

export default ProgressMeter;
