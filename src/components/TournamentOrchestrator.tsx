import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useTournamentRealtime,
} from "@/hooks/useTournamentRealtime";

import { TournamentHeader } from "./TournamentHeader";
import { MainContentLayout } from "./tournament/MainContentLayout";
import { StatsPanel } from "./tournament/StatsPanel";
import { ParticipantsPanel } from "./tournament/ParticipantsPanel";
import { TypingChallengeArea } from "./tournament/TypingChallengeArea";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorMessage } from "./ErrorMessage";

export const TournamentRoomOrchestrator = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const authHookResult = useAuth();

  const realtimeState = useTournamentRealtime({
    tournamentId,
    authHookResult,
  });

  const {
    gamePhase,
    socketStatus,
    lastSocketError,
    tournamentStaticInfo,
    tournamentSession,
    currentUserTypingSession,
    participants,
    typingText,
    sendLeaveTournament,
    sendTypeCharacter,
  } = realtimeState;

  // Handle critical loading/error states first
  // "error_static_data" is no longer a phase from this component's perspective;
  // it would manifest as "error_socket_join" or similar from useTournamentRealtime.
  if (
    gamePhase === "initializing" ||
    gamePhase === "error_auth"
  ) {
    let message = "Initializing tournament...";
    if (gamePhase === "error_auth") {
      message = lastSocketError || "Authentication error. Cannot proceed.";
    }

    // Show loading if gamePhase is initializing OR if auth is still explicitly loading
    // (gamePhase 'initializing' should cover auth loading, but this is an extra safeguard)
    const showLoading = gamePhase === "initializing" || authHookResult.isLoading;

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
        {showLoading ? (
          <LoadingIndicator text={message} />
        ) : (
          // If not showLoading but still in these error phases, display error message
          <ErrorMessage title="Initialization Error" message={message} />
        )}
      </div>
    );
  }

  // Handle socket connection or join errors
  // These game phases are set by useTournamentRealtime
  if (
    gamePhase === "error_socket_connect" ||
    gamePhase === "error_socket_join" ||
    gamePhase === "error_disconnected"
  ) {
    let title = "Connection Problem";
    if (gamePhase === "error_socket_join") title = "Failed to Join Tournament";
    if (gamePhase === "error_disconnected") title = "Disconnected";

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
        <ErrorMessage
          title={title}
          message={
            lastSocketError || "A problem occurred with the tournament connection."
          }
        />
        {/* Optionally add a retry button here.
            It would need to call a 'retry' function exposed by useTournamentRealtime.
        */}
      </div>
    );
  }
  const tournamentName = realtimeState.tournamentStaticInfo?.name || "Tournament";

  const tournamentScheduledFor =
    realtimeState.tournamentSession?.scheduled_for ||
    realtimeState.tournamentStaticInfo?.scheduled_start;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 font-sans overflow-hidden">
      <TournamentHeader
        tournamentName={tournamentName}
        gamePhase={gamePhase}
        scheduledFor={tournamentScheduledFor}
        onLeave={sendLeaveTournament}
        currentWPM={currentUserTypingSession?.current_speed}
      />

      <MainContentLayout
        statsSlot={
          <StatsPanel
            userSession={currentUserTypingSession}
            totalTextLength={typingText?.length || 0} // typingText from realtimeState
            gamePhase={gamePhase}
          />
        }
        participantsSlot={
          <ParticipantsPanel
            participants={participants} // from realtimeState
            currentAuthClientId={authHookResult.client?.id || null}
            gamePhase={gamePhase}
            totalTextLength={typingText?.length || 0} // typingText from realtimeState
          />
        }
        mainChallengeSlot={
          <TypingChallengeArea
            realtimeState={realtimeState} // Pass the whole state object
            authClient={authHookResult.client}
            onCharTyped={sendTypeCharacter}
          />
        }
      />
      {/* Optional: Global notice for non-critical issues or transient reconnections */}
      {/* {socketStatus === "disconnected" && gamePhase !== "error_disconnected" && (
        <div className="fixed bottom-4 right-4 z-50 p-2 bg-yellow-600 text-white rounded shadow-lg">
          Connection lost. Attempting to reconnect... {lastSocketError && `(${lastSocketError})`}
        </div>
      )} */}
    </div>
  );
};