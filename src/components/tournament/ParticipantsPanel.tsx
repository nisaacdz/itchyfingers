import { TypingSessionSchema, ClientSchema } from '@/types/api';
import { GamePhase } from '@/hooks/useTournamentRealtime';
import { ParticipantItem } from '@/components/tournament/ParticipantItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: Record<string, TypingSessionSchema>;
  currentAuthClientId: string | null;
  gamePhase: GamePhase;
  totalTextLength: number;
}

export const ParticipantsPanel = ({
  participants,
  currentAuthClientId,
  gamePhase,
  totalTextLength,
}: ParticipantsPanelProps) => {
  const participantArray = Object.values(participants);

  // Sort participants: current user first, then by progress (desc), then by WPM (desc)
  participantArray.sort((a, b) => {
    if (a.client.id === currentAuthClientId) return -1;
    if (b.client.id === currentAuthClientId) return 1;
    if (b.correct_position !== a.correct_position) {
      return b.correct_position - a.correct_position;
    }
    return b.current_speed - a.current_speed;
  });

  const title = (gamePhase === 'active' || gamePhase === 'user_completed' || gamePhase === 'tournament_over')
    ? "Leaderboard"
    : "Joined Players";

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3 text-slate-100 border-b border-slate-700 pb-2 flex items-center gap-2">
        <Users size={20} className="text-slate-400"/>
        {title} ({participantArray.length})
      </h3>
      {participantArray.length === 0 ? (
        <p className="text-sm text-slate-400 text-center flex-grow flex items-center justify-center">
          {gamePhase === 'lobby' || gamePhase === 'countdown' ? 'Waiting for players to join...' : 'No participants found.'}
        </p>
      ) : (
        <ScrollArea className="flex-grow pr-2 -mr-2 custom-scrollbar"> {/* Negative margin to hide default scrollbar if custom is wider */}
          <div className="space-y-2">
            {participantArray.map((p) => (
              <ParticipantItem
                key={p.client.id}
                participant={p}
                isCurrentUser={p.client.id === currentAuthClientId}
                totalTextLength={totalTextLength}
                gamePhase={gamePhase}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};