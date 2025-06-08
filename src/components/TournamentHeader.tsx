import { GamePhase } from "@/hooks/useTournamentRealtime";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "./tournament/TimerDisplay";
import { cn } from "@/lib/utils";
import { LogOut, Zap } from "lucide-react";

interface TournamentHeaderProps {
  tournamentName: string;
  gamePhase: GamePhase;
  scheduledFor?: string | null;
  onLeave: () => void;
  currentWPM?: number;
}

const getGamePhaseText = (
  phase: GamePhase,
  scheduledFor?: string | null,
): string => {
  switch (phase) {
    case "initializing":
      return "Initializing...";
    case "error_static_data":
    case "error_auth":
    case "error_socket":
      return "Error";
    case "lobby":
      return "Lobby - Waiting for start";
    case "countdown":
      return "Starting Soon!"; // TimerDisplay will show actual countdown
    case "active":
      return "Race in Progress!";
    case "user_completed":
      return "You Finished! Waiting for others...";
    case "tournament_over":
      return "Tournament Over";
    default:
      return "Loading...";
  }
};

export const TournamentHeader = ({
  tournamentName,
  gamePhase,
  scheduledFor,
  onLeave,
  currentWPM,
}: TournamentHeaderProps) => {
  const phaseText = getGamePhaseText(gamePhase, scheduledFor);
  const showTimer =
    gamePhase === "countdown" ||
    gamePhase === "active" ||
    gamePhase === "user_completed";

  return (
    <header className="flex items-center justify-between p-3 md:p-4 bg-slate-800/50 backdrop-blur-sm shadow-lg text-slate-200">
      <div className="flex flex-col">
        <h1
          className="text-lg md:text-xl font-bold truncate max-w-[200px] md:max-w-xs "
          title={tournamentName}
        >
          {tournamentName}
        </h1>
        <span
          className={cn(
            "text-xs md:text-sm font-medium",
            gamePhase === "active" && "text-green-400 animate-pulse",
            (gamePhase === "error_static_data" ||
              gamePhase === "error_auth" ||
              gamePhase === "error_socket") &&
              "text-red-400",
            gamePhase === "tournament_over" && "text-amber-400",
          )}
        >
          {phaseText}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {gamePhase === "active" && currentWPM !== undefined && (
          <div className="flex items-center gap-1 text-sm md:text-base font-semibold text-cyan-400">
            <Zap size={18} className="text-yellow-400" />
            {Math.round(currentWPM)}{" "}
            <span className="text-xs text-slate-400">WPM</span>
          </div>
        )}
        {showTimer && gamePhase === "countdown" && scheduledFor && (
          <TimerDisplay targetTime={scheduledFor} mode="countdown" />
        )}
        {/* Add elapsed timer if needed for 'active' phase */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="text-slate-300 hover:bg-red-500/80 hover:text-white"
        >
          <LogOut size={16} className="mr-1 md:mr-2" />
          Leave
        </Button>
      </div>
    </header>
  );
};
