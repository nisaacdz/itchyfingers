// @/components/tournament/TournamentRoomOrchestrator.tsx
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming path
import { useTournamentStaticData } from '@/hooks/useTournamentStaticData';
import { useTournamentRealtime, GamePhase } from '@/hooks/useTournamentRealtime';

import { TournamentHeader } from './TournamentHeader';
import { MainContentLayout } from './tournament/MainContentLayout';
import { StatsPanel } from './tournament/StatsPanel';
import { ParticipantsPanel } from './tournament/ParticipantsPanel';
import { TypingChallengeArea } from './tournament/TypingChallengeArea';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';

export const TournamentRoomOrchestrator = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const authHookResult = useAuth();

  const {
    tournament: staticTournamentInfo,
    isLoading: isStaticLoading,
    error: staticError,
  } = useTournamentStaticData(tournamentId);

  const realtimeState = useTournamentRealtime({
    tournamentId,
    initialTournamentStaticInfo: staticTournamentInfo,
    isStaticLoading,
    staticError,
    authHookResult,
  });

  const {
    gamePhase,
    socketStatus,
    lastSocketError,
    currentUserTypingSession,
    tournamentSession,
    participants,
    typingText,
    sendLeaveTournament,
    sendTypeCharacter,
  } = realtimeState;

  // Handle critical loading/error states first
  if (gamePhase === 'initializing' || gamePhase === 'error_auth' || gamePhase === 'error_static_data') {
    let message = "Initializing tournament...";
    if (gamePhase === 'error_auth') message = lastSocketError || "Authentication error. Cannot proceed.";
    if (gamePhase === 'error_static_data') message = staticError || "Failed to load tournament details.";

    const showLoading = gamePhase === 'initializing' && (isStaticLoading || authHookResult.isLoading);

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
        {showLoading ? <LoadingIndicator text={message} /> : <ErrorMessage title="Initialization Error" message={message} />}
      </div>
    );
  }
  
  // Handle socket connection errors specifically if not covered by gamePhase error states
  if (gamePhase === 'error_socket' && socketStatus === 'error') {
     return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
        <ErrorMessage title="Connection Problem" message={lastSocketError || "Could not connect to the tournament server."} />
        {/* Optionally add a retry button if appropriate */}
      </div>
    );
  }


  const tournamentName = staticTournamentInfo?.name || "Tournament";
  const tournamentScheduledFor = tournamentSession?.scheduled_for || staticTournamentInfo?.scheduled_start;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 font-sans overflow-hidden">
      <TournamentHeader
        tournamentName={tournamentName}
        gamePhase={gamePhase}
        scheduledFor={tournamentScheduledFor}
        onLeave={sendLeaveTournament}
        currentWPM={currentUserTypingSession?.current_speed} // Pass WPM to header for a live feel
      />

      <MainContentLayout
        statsSlot={
          <StatsPanel
            userSession={currentUserTypingSession}
            totalTextLength={typingText?.length || 0}
            gamePhase={gamePhase}
          />
        }
        participantsSlot={
          <ParticipantsPanel
            participants={participants}
            currentAuthClientId={authHookResult.client?.id || null}
            gamePhase={gamePhase}
            totalTextLength={typingText?.length || 0}
          />
        }
        mainChallengeSlot={
          <TypingChallengeArea
            realtimeState={realtimeState}
            authClient={authHookResult.client}
            onCharTyped={sendTypeCharacter}
          />
        }
      />
      {/* Global error display for non-critical socket messages, or use toasts */}
      {/* {lastSocketError && gamePhase !== 'error_socket' && (
        <div className="fixed bottom-4 right-4 z-50">
          <ErrorDisplay title="Notice" message={lastSocketError} />
        </div>
      )} */}
    </div>
  );
};