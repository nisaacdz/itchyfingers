import { Participant, User } from "../types/request";
import ProgressMeter from "./ProgressMeter";

type ProgressBoardProps = {
  participants: Participant[];
  text: string;
};

const ProgressBoard = ({ participants, text }: ProgressBoardProps) => {
  const textLength = text.length;
  return (
    <div className="flex flex-col w-full pb-6 items-start gap-2">
      {participants.map((participant, index) => (
        <ProgressMeter
          key={index}
          participant={participant}
          length={textLength}
        />
      ))}
    </div>
  );
};

export default ProgressBoard;
