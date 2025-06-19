import { ParticipantData } from "@/types/api";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserCircle, Zap, CheckCircle2 } from "lucide-react"; // Crown for winner, or star for current user

interface ParticipantItemProps {
  data: ParticipantData;
  watched: boolean;
  textLength: number;
}

export const ParticipantItem = ({
  data,
  watched,
  textLength,
}: ParticipantItemProps) => {
  const progressPercentage =
    textLength > 0
      ? (data.correctPosition / textLength) * 100
      : 0;
  const displayName =
    data.client.user?.username ||
    `Anon-${data.client.id.substring(0, 4)}`;
  const isFinished =
    data.endedAt ||
    (textLength > 0 && data.correctPosition === textLength);

  return (
    <div
      className={cn(
        "p-2.5 rounded-md transition-all duration-150 ease-in-out",
        watched
          ? "bg-slate-700/70 border border-cyan-500/50"
          : "bg-slate-700/40 hover:bg-slate-700/60",
        isFinished && "opacity-70 border-green-500/30",
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {/* Placeholder for actual avatar logic if you have user images */}
            <AvatarFallback
              className={cn(
                "text-xs",
                watched
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-600 text-slate-300",
              )}
            >
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "text-sm font-medium truncate max-w-[100px]",
              watched ? "text-cyan-300" : "text-slate-200",
            )}
          >
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-300">
          {isFinished && <CheckCircle2 size={14} className="text-green-400" />}
          <Zap size={12} className="text-yellow-500" />
          <span>{Math.round(data.currentSpeed)}</span>
        </div>
      </div>
      {(textLength > 0 && (
        <Progress
          value={progressPercentage}
          className="h-1.5 [&>div]:bg-purple-500"
        />
      ))}
    </div>
  );
};
