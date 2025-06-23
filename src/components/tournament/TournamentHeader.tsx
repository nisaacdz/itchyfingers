import { Button } from "@/components/ui/button";
import { cn, getStatus } from "@/lib/utils";
import { List, LogOut, Zap } from "lucide-react";
import { ParticipantData, TournamentStatus } from "@/types/api";
import { socketService } from "@/api/socketService";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useRoom } from "@/hooks/useRoom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TournamentHeaderProps {
  toWatch: ParticipantData | null;
}

const getStatusText = (status: TournamentStatus): string => {
  switch (status) {
    case "upcoming":
      return "Starting Soon!";
    case "started":
      return "Race in Progress!";
    case "ended":
      return "Tournament Ended";
  }
};

export const TournamentHeader = ({ toWatch }: TournamentHeaderProps) => {
  const { data: tournamentData } = useRoom();
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
      toast.error(
        `Failed to leave tournament: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  return (
    <header className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 p-3 md:p-4 bg-accent backdrop-blur-sm shadow-lg text-slate-200">
      <div className="justify-self-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/tournaments"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                >
                  <List size={16} />
                  <span className="hidden md:inline">Tournaments</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className="font-medium truncate max-w-32 md:max-w-xs"
                title={tournamentData.title}
              >
                {tournamentData.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="flex items-baseline gap-2 justify-center">
          <h1
            className="text-lg md:text-xl font-bold truncate"
            title={tournamentData.title}
          >
            {tournamentData.title}
          </h1>
          {tournamentData.description && (
            <>
              <span className="text-slate-500 text-sm hidden md:inline">
                -
              </span>
              <p
                className="text-sm text-slate-400 truncate max-w-[100px] md:max-w-sm hidden md:inline"
                title={tournamentData.description}
              >
                {tournamentData.description}
              </p>
            </>
          )}
        </div>
        <span
          className={cn(
            "text-xs md:text-sm font-medium",
            status === "started" && "text-green-400 animate-pulse",
            status === "ended" && "text-amber-400",
          )}
        >
          {statusText}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-4">
        {status === "started" && (
          <div className="flex items-center gap-1 text-sm md:text-base font-semibold text-cyan-400">
            <Zap size={18} className="text-yellow-400" />
            {toWatch ? toWatch.currentSpeed.toFixed(0) : "_"}{" "}
            <span className="text-xs text-slate-400">WPM</span>
          </div>
        )}
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
