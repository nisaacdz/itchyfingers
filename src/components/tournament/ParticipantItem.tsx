// @/components/tournament/elements/ParticipantItem.tsx
import { ParticipantData } from "@/types/api";
import { GamePhase } from "@/hooks/useTournamentRealtime";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserCircle, Zap, CheckCircle2 } from "lucide-react"; // Crown for winner, or star for current user

interface ParticipantItemProps {
  participant: ParticipantData;
  isCurrentUser: boolean;
  totalTextLength: number;
  gamePhase: GamePhase;
}

export const ParticipantItem = ({
  participant,
  isCurrentUser,
  totalTextLength,
  gamePhase,
}: ParticipantItemProps) => {
  const progressPercentage =
    totalTextLength > 0
      ? (participant.correct_position / totalTextLength) * 100
      : 0;
  const displayName =
    participant.client.user?.username ||
    `Anon-${participant.client.id.substring(0, 4)}`;
  const isFinished =
    participant.ended_at ||
    (totalTextLength > 0 && participant.correct_position === totalTextLength);

  return (
    <div
      className={cn(
        "p-2.5 rounded-md transition-all duration-150 ease-in-out",
        isCurrentUser
          ? "bg-slate-700/70 border border-cyan-500/50"
          : "bg-slate-700/40 hover:bg-slate-700/60",
        isFinished &&
          gamePhase !== "lobby" &&
          gamePhase !== "countdown" &&
          "opacity-70 border-green-500/30",
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {/* Placeholder for actual avatar logic if you have user images */}
            <AvatarFallback
              className={cn(
                "text-xs",
                isCurrentUser
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
              isCurrentUser ? "text-cyan-300" : "text-slate-200",
            )}
          >
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-300">
          {isFinished &&
            (gamePhase === "active" ||
              gamePhase === "user_completed" ||
              gamePhase === "tournament_over") && (
              <CheckCircle2 size={14} className="text-green-400" />
            )}
          <Zap size={12} className="text-yellow-500" />
          <span>{Math.round(participant.current_speed)}</span>
        </div>
      </div>
      {(gamePhase === "active" ||
        gamePhase === "user_completed" ||
        gamePhase === "tournament_over") &&
        totalTextLength > 0 && (
          <Progress
            value={progressPercentage}
            className="h-1.5 [&>div]:bg-purple-500"
          />
        )}
    </div>
  );
};
