import { useRef } from "react";
import useElementSize from "../hooks/useElementSize";
import { UserProgress } from "../types/request";
import SpeedIcon from "./SpeedIcon";

type ProgressMeterProps = {
    progress: UserProgress,
    length: number
}

const ProgressMeter = ({ progress: { currentPos, speed }, length }: ProgressMeterProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(containerRef);
    const progress = length === 0 ? 0 : (currentPos / length) * width;

    return (
        <div className="w-full bg-black">
            <div ref={containerRef} className="flex w-[calc(100%-64px)] h-auto">
                <SpeedIcon speed={speed} styles={{ transform: `translateX(${progress}px)` }} />
            </div>
        </div>
    );
};

export default ProgressMeter;