import { Participant, UserTyping } from "../types/request";
import { Crown } from "lucide-react";

type ParticipantsRankingProps = {
  userTyping: UserTyping | null;
  participants: Participant[] | null;
};

type TransformedParticipant = {
  startTime: Date;
  endTime: Date;
  userId: string;
  username: string;
  correctPosition: number;
  wpm: number;
  accuracy: number;
};

const ParticipantsRanking = ({
  userTyping,
  participants,
}: ParticipantsRankingProps) => {
  if (!userTyping || !participants || participants.length < 1) {
    return <></>;
  }
  const rankings = participants
    .filter((participant) => participant.endTime && participant.endTime)
    .map((p) => ({
      ...p,
      startTime: new Date(p.startTime!),
      endTime: new Date(p.endTime!),
    }))
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

  if (rankings.length === 0) {
    return <></>;
  }

  const formatTime = (p: TransformedParticipant): string => {
    // console.log("started at", p.startTime.toTimeString());
    // console.log("finished at", p.endTime.toTimeString());
    const timeDiff = Math.max(0, p.endTime.getTime() - p.startTime.getTime());
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
              key={participant.userId}
              className={`grid grid-cols-7 w-full p-2 ${
                participant.userId === userTyping.userId ? "bg-secondary" : ""
              } border-t border-muted-foreground`}
            >
              <span className="text-lg font-medium text-muted-foreground font-courier-prime">
                {index + 1}.
              </span>
              <div className="flex items-center gap-2 col-span-3">
                {index === 0 && <Crown className="size-4 text-chart-3" />}{" "}
                <p
                  className={`text-lg font-medium font-courier-prime ${
                    participant.userId === userTyping.userId
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {participant.username}{" "}
                  {participant.userId === userTyping.userId && "(You)"}
                </p>
              </div>
              <p
                className={`text-lg font-medium font-courier-prime ${
                  participant.userId === userTyping.userId
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(participant)}
              </p>
              <p
                className={`text-lg text-right mr-8 font-medium font-courier-prime ${
                  participant.userId === userTyping.userId
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {participant.accuracy!} %
              </p>
              <p
                className={`text-lg text-right mr-2 font-medium font-courier-prime ${
                  participant.userId === userTyping.userId
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {participant.wpm.toFixed(0)} WPM
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsRanking;
