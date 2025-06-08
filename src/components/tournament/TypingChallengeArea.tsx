import {
  TournamentRealtimeState,
  GamePhase,
} from "@/hooks/useTournamentRealtime";
import { ClientSchema } from "@/types/api";
import { PreGameLobby } from "./PreGameLobby";
import { CountdownTimer } from "./CountdownTimer";
import { PostGameSummary } from "./PostGameSummary";
import { TypingArena } from "./TypingArena";
import { LoadingIndicator } from "../LoadingIndicator";

interface TypingChallengeAreaProps {
  realtimeState: TournamentRealtimeState;
  authClient: ClientSchema | null;
  onCharTyped: (char: string) => void;
}

export const TypingChallengeArea = ({
  realtimeState,
  authClient,
  onCharTyped,
}: TypingChallengeAreaProps) => {
  const {
    gamePhase,
    tournamentSession,
    typingText,
    participants,
    currentUserTypingSession,
    lastSocketError, // For displaying context-specific errors
    socketStatus,
  } = realtimeState;

  // Handle critical error states that might not be caught by Orchestrator's top-level checks
  if (gamePhase === "error_socket" && lastSocketError) {
    return (
      <div className="text-center text-red-400">
        <p>Connection Issue: {lastSocketError}</p>
        <p>Please try refreshing.</p>
      </div>
    );
  }
  if (gamePhase === "initializing" && socketStatus !== "error") {
    return <LoadingIndicator text="Preparing challenge..." />;
  }

  switch (gamePhase) {
    case "lobby":
      return <PreGameLobby tournamentSession={tournamentSession} />;
    case "countdown":
      return tournamentSession?.scheduled_for ? (
        <CountdownTimer scheduledFor={tournamentSession.scheduled_for} />
      ) : (
        <PreGameLobby
          message="Waiting for start signal..."
          tournamentSession={tournamentSession}
        />
      );
    case "active":
    case "user_completed": // User still sees the arena even if they finished, until tournament_over
      if (!typingText || !authClient || !currentUserTypingSession) {
        return <LoadingIndicator text="Loading typing text..." />;
      }
      return (
        <TypingArena
          text={typingText}
          allParticipants={participants}
          currentUserAuthId={authClient.id} // Pass current user's auth ID
          currentUserSession={currentUserTypingSession}
          onCharTyped={onCharTyped}
          gamePhase={gamePhase} // Pass gamePhase to TypingArena
        />
      );
    case "tournament_over":
      return (
        <PostGameSummary
          participants={participants}
          currentAuthClientId={authClient?.id || null}
        />
      );
    default:
      return (
        <LoadingIndicator text={`Loading view for phase: ${gamePhase}...`} />
      );
  }
};
