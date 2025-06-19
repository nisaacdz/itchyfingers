import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tournament, TournamentStatus } from "../../types/api";

interface TournamentCardProps {
  tournament: Tournament;
  onJoinTournament: (tournamentId: string) => void;
  onSpectateTournament: (tournamentId: string) => void;
}

function getTimeLeft(scheduledFor: string, status: TournamentStatus) {
  if (status === "started") return "Started";
  if (status === "ended") return "Ended";

  const now = new Date();
  const scheduledDate = new Date(scheduledFor);
  const diff = scheduledDate.getTime() - now.getTime();

  if (diff <= 0) return "Starting...";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TournamentCard({
  tournament,
  onJoinTournament,
  onSpectateTournament,
}: TournamentCardProps) {
const tournamentStatus = tournament.endedAt ? "ended" : tournament.startedAt ? "started" : "upcoming";
  const timeLeftOrStatus = getTimeLeft(
    tournament.scheduledFor,
    tournamentStatus
  );

  return (
    <Card
      key={tournament.id}
      className="hover:shadow-lg transition-shadow flex flex-col"
    >
      <CardHeader className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl line-clamp-2">
            {tournament.title}
          </CardTitle>
          <Badge
            variant={
              tournamentStatus === "upcoming"
                ? "secondary"
                : tournamentStatus === "started"
                  ? "default"
                  : "outline"
            }
            className="capitalize"
          >
            {tournamentStatus}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Created by {tournament.creator}
        </CardDescription>
        <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {tournament.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participants:</span>
            <span>{tournament.participantCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Privacy:</span>
            <span className="capitalize">{tournament.privacy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tournamentStatus === "upcoming"
                ? "Starts in:"
                : "Status:"}
            </span>
            <span>{timeLeftOrStatus}</span>
          </div>
        </div>
        <div className="pt-4 space-y-2">
          <Button
            className="w-full"
            onClick={() => onJoinTournament(tournament.id)}
            disabled={tournamentStatus === "ended"}
          >
            {tournament.participating ? "Rejoin" : "Join"} Tournament
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onSpectateTournament(tournament.id)}
          >
            Spectate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
