import { UserProgress } from "../types/request";
import ProgressMeter from "./ProgressMeter";

type ProgressBoardProps = {
    participants: UserProgress[],
    textLength: number
}

const ProgressBoard = ({ participants, textLength }: ProgressBoardProps) => {
    console.log("progress board")
    return (
        <div className="flex flex-col w-full pb-6 items-start">
            {participants.map((participant, index) => (
                <ProgressMeter key={index} progress={participant} length={textLength}/>
            ))}
        </div>
    );
};

export default ProgressBoard;