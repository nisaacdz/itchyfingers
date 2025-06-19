import { Button } from "@/components/ui/button";
import { cn, getStatus } from "@/lib/utils";
import { LogOut, Zap } from "lucide-react";
import { ParticipantData, TournamentData, TournamentStatus } from "@/types/api";
import { socketService } from "@/api/socketService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TournamentHeaderProps {
  tournamentData: TournamentData;
  toWatch: ParticipantData;
}

const getStatusText = (
  status: TournamentStatus,
): string => {
  switch (status) {
    case "upcoming":
      return "Starting Soon!";
    case "started":
      return "Race in Progress!";
    case "ended":
      return "Tournament Ended";
  }
};

export const TournamentHeader = ({
  tournamentData,
  toWatch
}: TournamentHeaderProps) => {
  const navigate = useNavigate();
  const status = getStatus(tournamentData);
  const statusText = getStatusText(status);

  const handleLeaveTournament = async () => {
    try {
      const response = await socketService.fire("leave");
      if ("success" in response) {
        toast.success(response.success.message);
        navigate("/tournaments");
        console.log("Successfully left tournament");
      } else {
        throw new Error(response.failure.message);
      }
    } catch (error) {
      console.error("Failed to leave tournament:", error);
      toast.error(`Failed to leave tournament: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 bg-slate-800/50 backdrop-blur-sm shadow-lg text-slate-200">
      <div className="flex flex-col">
        <h1
          className="text-lg md:text-xl font-bold truncate max-w-[200px] md:max-w-xs "
          title={tournamentData.title}
        >
          {tournamentData.title}
        </h1>
        <span
          className={cn(
            "text-xs md:text-sm font-medium",
            status === "started" && "text-green-400 animate-pulse",
            status === "ended" && "text-amber-400",
          )}
        >
          {statusText}{" "}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {status === "started" && (
          <div className="flex items-center gap-1 text-sm md:text-base font-semibold text-cyan-400">
            <Zap size={18} className="text-yellow-400" />
            {Math.round(toWatch.currentSpeed)}{" "}
            <span className="text-xs text-slate-400">WPM</span>
          </div>
        )}
        {/* {status === "upcoming" && (
          <TimerDisplay targetTime={tournamentData.scheduledFor} mode="countdown" />
        )} */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLeaveTournament}
          className="text-slate-300 hover:bg-red-500/80 hover:text-white"
        >
          <LogOut size={16} className="mr-1 md:mr-2" />
          Leave
        </Button>
      </div>
    </header>
  );
};
