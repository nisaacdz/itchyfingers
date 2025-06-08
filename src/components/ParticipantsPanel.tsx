import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ParticipantItem from "./ParticipantItem";
import {
  useTournamentStore,
  selectAllParticipantsArray,
} from "@/store/tournamentStore";
import { useAuthStore } from "@/store/authStore";
import { TournamentSchema, TournamentSession } from "@/types/api";

interface ParticipantsPanelProps {
  // Pass these if not subscribing directly in this component, or for calculation
   liveTournamentSession: TournamentSession | null;
   currentTournament: TournamentSchema | null; // For text length fallback
}

export default function ParticipantsPanel({ liveTournamentSession, currentTournament }: ParticipantsPanelProps) {
  const allParticipantsArray = useTournamentStore(selectAllParticipantsArray);
  const { client: authClient } = useAuthStore();

  const textLength = liveTournamentSession?.text?.length || currentTournament?.text?.length || 1;

  return (
    <Card className="lg:col-span-1"> {/* This class depends on the parent grid */}
      <CardHeader>
        <CardTitle>Participants ({allParticipantsArray.length})</CardTitle>
        <CardDescription>Live participant progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allParticipantsArray.length === 0 ? (
            <p className="text-muted-foreground">
              No participants yet. Waiting for players to join...
            </p>
          ) : (
            allParticipantsArray.map((participant) => (
              <ParticipantItem
                key={participant.client.id}
                participant={participant}
                isCurrentUser={participant.client.id === authClient?.id}
                textLength={textLength}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}