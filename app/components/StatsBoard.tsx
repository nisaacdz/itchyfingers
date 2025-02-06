import { useRef } from "react";
import useElementSize from "../hooks/useElementSize";
import { UserProgress } from "../types/request";
import SpeedVortexMeter from "./SpeedVortexMeter";

type StatsBoardProps = {
    userProgress: UserProgress,
    length: number
}

const StatsBoard = ({ userProgress, length }: StatsBoardProps) => {
    const containerRef = useRef(null);
    const containerSize = useElementSize(containerRef)
    const meterLevel = length !== 0 ? (userProgress.currentPos / length) * containerSize.width : 0;

    console.log("stats board")

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="text-2xl font-bold">Your Stats</h1>
            <div className="relative flex items-center justify-between" ref={containerRef}>
                <div className="absolute h-full bg-blue-500" style={{ width: meterLevel }}/>
            </div>
            <div className="flex items-center justify-between">
                <SpeedVortexMeter speed={userProgress.speed} />
            </div>
        </div>
    );
}

export default StatsBoard;