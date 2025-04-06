"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Assuming you have this
import {
  TournamentProvider,
  useTournamentContext,
} from "@/context/TournamentContext";
import { StatsBoard, StatsBoardLoading } from "@/components/custom/StatsBoard";
import ProgressBoard from "@/components/custom/ProgressBoard";
import {
  TypingArea,
  TypingAreaCountdown,
} from "@/components/custom/TypingArea";
import ParticipantsRanking from "@/components/custom/ParticipantsRanking";
import { ContentLoader } from "@/components/custom/ContentLoader";
import { PageLoader } from "@/components/custom/PageLoader";

const TournamentPageWrapper = () => {
  const { tournamentId } = useParams() as { tournamentId: string };
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <TournamentProvider tournamentId={tournamentId}>
      <TournamentPageContent />
    </TournamentProvider>
  );
};

const TournamentPageContent = () => {
  const {
    isLoading,
    error,
    tournamentInfo,
    participants,
    currentParticipant,
    sendTypingInput,
    leaveTournament,
  } = useTournamentContext();
  const router = useRouter();

  const clientId = currentParticipant?.client.id || null;
  const typingText = tournamentInfo?.text || null;
  const textLength = typingText?.length || 0;

  if (isLoading) return <ContentLoader />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!tournamentInfo && !isLoading)
    return <div className="p-4">Tournament data not available.</div>; // Handle case where join succeeded but no info yet?

  const handleExit = () => {
    if (confirm("Are you sure you want to leave the tournament?")) {
      leaveTournament();
      router.push("/tournaments"); // Navigate away after initiating leave
    }
  };

  // Restart might need specific backend logic or just be a client-side reset if allowed
  const handleRestart = () => {
    console.log("Restart action triggered - implement if needed");
    // This might involve re-joining or a specific socket event if supported by backend
  };

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        {/* Stats Section */}
        <div className="col-span-1 w-full h-full items-center justify-center">
          {currentParticipant ? (
            <StatsBoard
              currentParticipant={currentParticipant}
              textLength={textLength}
              onLeave={handleExit}
              onRestart={handleRestart} // Pass handler if implemented
            />
          ) : (
            // Show loading state if participant data isn't available yet,
            // even if global loading is false (e.g., waiting for user:joined event)
            <StatsBoardLoading />
          )}
        </div>

        {/* Main Content Section */}
        <div className="flex flex-col gap-6 col-span-4 w-full h-full">
          {/* Progress Board */}
          {textLength > 0 && (
            <ProgressBoard
              participants={participants}
              textLength={textLength}
            />
          )}

          {/* Typing Area or Countdown */}
          {/* Check if tournament has started using started_at from tournamentInfo */}
          {tournamentInfo?.started_at && typingText && clientId ? (
            <TypingArea
              text={typingText}
              participants={participants} // Pass all for potential multi-cursor display
              clientId={clientId} // Identify the current user
              handleCharacterInput={sendTypingInput} // Pass action from context
            />
          ) : tournamentInfo?.scheduled_for ? (
            // Show countdown if not started yet but scheduled
            <TypingAreaCountdown
              scheduledAt={new Date(tournamentInfo.scheduled_for)}
            />
          ) : (
            // Fallback if info isn't ready or structure is unexpected
            <div className="p-4">Waiting for tournament details...</div>
          )}

          {/* Participants Ranking */}
          {tournamentInfo && (
            <ParticipantsRanking
              participants={participants}
              clientId={clientId}
              tournamentStartTime={tournamentInfo.started_at || undefined}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default TournamentPageWrapper; // Export the wrapper component
