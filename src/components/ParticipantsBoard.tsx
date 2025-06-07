import React from 'react';
import { TypingSessionSchema, TournamentSchema } from '../types/api';
import { Progress } from '@/components/ui/progress'; // Assuming shadcn/ui progress component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ParticipantsBoardProps {
  participants: TypingSessionSchema[];
  currentTournament: TournamentSchema | null;
  clientId: string | null; // To highlight the current user
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
    if (b.current_position !== a.current_position) {
      return b.current_position - a.current_position;
    }
    if (b.current_speed !== a.current_speed) {
      return b.current_speed - a.current_speed;
    }
    return b.current_accuracy - a.current_accuracy;
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
                ? (participant.current_position / currentTournament.text.length) * 100
                : 0;

              return (
                <div
                  key={participant.client.id}
                  className={`p-3 rounded-md ${isCurrentUser ? 'bg-primary/10' : 'bg-muted/50'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                      {participant.client.user?.username || 'Anonymous'}
                      {isCurrentUser && ' (You)'}
                    </span>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{participant.current_speed.toFixed(0)} WPM</span>
                      <span>{participant.current_accuracy.toFixed(0)}% Acc</span>
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
