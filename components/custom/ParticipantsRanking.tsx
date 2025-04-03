import { Participant } from "@/types/request";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type ParticipantsRankingProps = {
  clientId: string | null;
  participants: Record<string, Participant>;
  tournamentStartTime?: string;
};

const ParticipantsRanking = ({
  clientId,
  participants,
  tournamentStartTime,
}: ParticipantsRankingProps) => {
  if (!clientId || !tournamentStartTime) return null;

  const tournamentStart = new Date(tournamentStartTime);
  const rankings = Object.values(participants)
    .filter((p) => p.started_at && p.ended_at)
    .map((p) => ({
      ...p,
      startTime: new Date(p.started_at!),
      endTime: new Date(p.ended_at!),
    }))
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

  if (rankings.length === 0) return null;

  const currentUser = participants[clientId];

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatStartOffset = (start: Date) => {
    const diff = start.getTime() - tournamentStart.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const centis = Math.floor((diff % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  const getRowStyle = (clientId: string) =>
    cn(
      "grid grid-cols-8 items-center w-full p-3 gap-4 transition-colors",
      "border-t border-border/50 hover:bg-accent/50",
      clientId === currentUser.user_id ? "bg-secondary/80" : "",
    );

  const getTextStyle = (clientId: string) =>
    cn(
      "font-medium font-mono",
      clientId === currentUser.user_id
        ? "text-foreground"
        : "text-muted-foreground",
    );

  return (
    <div className="w-full mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Crown className="w-5 h-5 text-amber-400" />
        <h2 className="text-2xl font-bold font-courier-prime">Race Rankings</h2>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-8 px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        <span>Rank</span>
        <span className="col-span-2">Racer</span>
        <span>Start</span>
        <span>Duration</span>
        <span>Accuracy</span>
        <span>WPM</span>
      </div>

      {/* Rankings List */}
      <div className="rounded-lg border border-border overflow-hidden shadow-sm">
        {rankings.map((participant, index) => (
          <div
            key={participant.user_id}
            className={getRowStyle(participant.user_id)}
          >
            {/* Rank */}
            <span className={getTextStyle(participant.user_id)}>
              {index + 1}.
              {index === 0 && <span className="ml-2 text-amber-400">🥇</span>}
            </span>

            {/* Racer Name */}
            <div className="col-span-2 flex items-center gap-2">
              <span className={getTextStyle(participant.user_id)}>
                {participant.user_name || "Anonymous"}
                {participant.user_id === currentUser.user_id && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
              </span>
            </div>

            {/* Start Offset */}
            <span className={getTextStyle(participant.user_id)}>
              {formatStartOffset(participant.startTime)}
            </span>

            {/* Duration */}
            <span className={getTextStyle(participant.user_id)}>
              {formatDuration(participant.startTime, participant.endTime)}
            </span>

            {/* Accuracy */}
            <span className={getTextStyle(participant.user_id)}>
              {participant.current_accuracy?.toFixed(1)}%
            </span>

            {/* WPM */}
            <span className={getTextStyle(participant.user_id)}>
              {participant.current_speed?.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsRanking;
