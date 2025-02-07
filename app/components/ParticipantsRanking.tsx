import { Participant, User } from "../types/request";
import { Crown } from "lucide-react";

type ParticipantsRankingProps = {
  user: User;
  participants: Participant[];
};

const ParticipantsRanking = ({
  user,
  participants,
}: ParticipantsRankingProps) => {
  if (participants.length <= 1) {
    return <></>;
  }
  const rankings = participants.filter((participant) => participant.endTime);

  if (rankings.length === 0) {
    return <></>;
  }

  rankings.sort((a, b) => a.endTime!.getTime() - b.endTime!.getTime());

  return (
    <div className="w-full">
      <div className="w-full max-w-2xl flex flex-col gap-3 pb-6 items-start text-white">
        <h3 className="ml-2 text-2xl font-semibold font-courier-prime">
          Rankings
        </h3>
        {rankings.map((participant, index) => (
          <div
            key={participant.id}
            className={`flex items-center justify-between w-full p-2 ${participant.id === user.userId ? "bg-gray-800 rounded-md" : ""}`} // Keep user highlight
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg font-medium text-gray-400 font-courier-prime">
                {index + 1}.
              </span>
              {index === 0 && <Crown className="size-4 text-yellow-500" />}{" "}
              <p
                className={`text-lg font-medium font-courier-prime ${participant.id === user.userId ? "text-white" : "text-gray-300"}`}
              >
                {participant.id} {participant.id === user.userId && "(You)"}
              </p>
            </div>
            <p
              className={`text-lg font-medium font-courier-prime ${participant.id === user.userId ? "text-white" : "text-gray-300"}`}
            >
              {participant.speed.toFixed(2)} WPM
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsRanking;
