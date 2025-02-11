import { Participant, UserTyping } from "../types/request";
import { Crown } from "lucide-react";

type ParticipantsRankingProps = {
  user: UserTyping;
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

  const formatTime = (endTime: Date): string => {
    const timeDiff = endTime.getTime() - user.startTime!.getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-4xl flex flex-col gap-3 pb-6 items-start text-accent-foreground">
        <h3 className="ml-2 text-2xl font-semibold font-courier-prime">
          Rankings
        </h3>
        <div className="w-full flex flex-col">
          {rankings.map((participant, index) => (
            <div
              key={participant.id}
              className={`grid grid-cols-7 w-full p-2 ${participant.id === user.userId ? "bg-secondary" : ""} border-t border-muted-foreground`}
            >
              <span className="text-lg font-medium text-muted-foreground font-courier-prime">
                {index + 1}.
              </span>
              <div className="flex items-center gap-2 col-span-3">
                {index === 0 && <Crown className="size-4 text-chart-3" />}{" "}
                <p
                  className={`text-lg font-medium font-courier-prime ${participant.id === user.userId ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {participant.id} {participant.id === user.userId && "(You)"}
                </p>
              </div>
              <p
                className={`text-lg font-medium font-courier-prime ${participant.id === user.userId ? "text-foreground" : "text-muted-foreground"}`}
              >
                {formatTime(participant.endTime!)}
              </p>
              <p
                className={`text-lg text-right mr-8 font-medium font-courier-prime ${participant.id === user.userId ? "text-foreground" : "text-muted-foreground"}`}
              >
                {participant.accuracy!} %
              </p>
              <p
                className={`text-lg text-right mr-2 font-medium font-courier-prime ${participant.id === user.userId ? "text-foreground" : "text-muted-foreground"}`}
              >
                {participant.speed.toFixed(0)} WPM
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsRanking;
