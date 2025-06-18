import React from "react";
import { ParticipantData, TournamentData } from "../types/api";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn/ui progress component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ParticipantsBoardProps {
  participants: ParticipantData[];
  currentTournament: TournamentData | null;
  clientId: string | null;
}

const ParticipantsBoard: React.FC<ParticipantsBoardProps> = ({
  participants,
  currentTournament,
  clientId,
}) => {
  if (!currentTournament) {
    return null; // Or a loading state
  }

  const sortedParticipants = [...participants].sort((a, b) => {
    // Sort by position (desc), then speed (desc), then accuracy (desc)
    if (b.currentPosition !== a.currentPosition) {
      return b.currentPosition - a.currentPosition;
    }
    if (b.currentSpeed !== a.currentSpeed) {
      return b.currentSpeed - a.currentSpeed;
    }
    return b.currentAccuracy - a.currentAccuracy;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants.length})</CardTitle>
        <CardDescription>Live participant progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedParticipants.length === 0 ? (
            <p className="text-muted-foreground">No participants yet.</p>
          ) : (
            sortedParticipants.map((participant) => {
              const isCurrentUser = participant.client.id === clientId;
              const progressPercentage = currentTournament.text?.length
                ? (participant.currentPosition /
                    currentTournament.text.length) *
                  100
                : 0;

              return (
                <div
                  key={participant.client.id}
                  className={`p-3 rounded-md ${isCurrentUser ? "bg-primary/10" : "bg-muted/50"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}
                    >
                      {participant.client.user?.username || "Anonymous"}
                      {isCurrentUser && " (You)"}
                    </span>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{participant.currentSpeed.toFixed(0)} WPM</span>
                      <span>
                        {participant.currentAccuracy.toFixed(0)}% Acc
                      </span>
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  {/* Optional: Display rank or other stats here */}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsBoard;
