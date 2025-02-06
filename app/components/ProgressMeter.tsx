import { useRef } from "react";
import useElementSize from "../hooks/useElementSize";
import { UserProgress } from "../types/request";
import SpeedIcon from "./SpeedIcon";

const ProgressMeter = ({ currentPos, totalCount, speed }: UserProgress) => {
    const containerRef = useRef(null);
    const { width } = useElementSize(containerRef);
    const progress = (currentPos / totalCount) * width;
    return (
        <div className="relative w-full h-full" ref={containerRef}>
            <div style={{ left: progress, top: 0, position: 'absolute', height: '100%', width: 'auto'}}>
                <SpeedIcon speed={speed}/>
            </div>
        </div>
    );
}

export default ProgressMeter;