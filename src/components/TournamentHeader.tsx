import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TournamentSchema, TournamentSession } from "@/types/api";

interface TournamentHeaderProps {
  tournament: TournamentSchema;
  liveSession: TournamentSession | null;
}

export default function TournamentHeader({ tournament, liveSession }: TournamentHeaderProps) {
  const getStatusText = () => {
    if (liveSession?.started_at && !liveSession?.ended_at) return "Active";
    if (liveSession?.ended_at) return "Completed";
    if (tournament.status === "active") return "Active (Syncing...)"; // Fallback
    return "Room";
  };

  const getStatusVariant = () => {
    if (liveSession?.started_at && !liveSession?.ended_at) return "default";
    if (tournament.status === "active") return "default";
    return "secondary";
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-muted-foreground mb-4">{tournament.description}</p>
      <div className="flex flex-wrap gap-2 md:gap-4 mb-4"> {/* Added flex-wrap for smaller screens */}
        <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        <Badge variant="outline">
          Max Players: {tournament.max_participants}
        </Badge>
        {(liveSession?.scheduled_for || tournament.scheduled_start) && (
          <Badge variant="outline">
            Starts:{" "}
            {new Date(
              liveSession?.scheduled_for || tournament.scheduled_start!
            ).toLocaleString()}
          </Badge>
        )}
         {/* You can add more badges here if needed, e.g., tournament creator, privacy */}
      </div>
    </div>
  );
}