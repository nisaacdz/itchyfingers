"use client";
import { TournamentInfo, Participant } from "@/types/request";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/AuthContext";
import { useTournament, useSocket, useTypingText } from "@/hooks/socketUtil";
import { StatsBoard, StatsBoardLoading } from "@/components/custom/StatsBoard";
import ProgressBoard from "@/components/custom/ProgressBoard";
import {
  TypingArea,
  TypingAreaCountdown,
} from "@/components/custom/TypingArea";
import ParticipantsRanking from "@/components/custom/ParticipantsRanking";
import { useRouter } from "next/navigation";

const TournamentPage = () => {
  const { tournamentId } = useParams() as { tournamentId: string };
  const { client, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    tournament,
    isLoading: tournamentLoading,
    error: tournamentError,
  } = useTournament(tournamentId);
  const { typingText, typingTextError, setTypingText } = useTypingText(
    tournament,
    tournamentId,
  );

  const {
    socketError,
    handleCharacterInput,
    socketLoading,
    participants,
    handleExitCompetition,
  } = useSocket(
    tournamentId,
    client?.client_id || null,
    setTypingText,
    tournament?.started_at || undefined,
  );

  const loading = tournamentLoading || socketLoading || authLoading;
  const error = tournamentError || socketError || typingTextError;

  const currentParticipant = client
    ? participants[client.client_id]
    : undefined;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error.message}</div>;

  const handleExit = () => {
    if (confirm("Are you sure you want to exit competition?")) {
      handleExitCompetition();
      router.push("/tournaments");
    }
  };

  const handleRestart = () => {};

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <StatsSection
          currentParticipant={currentParticipant || null}
          typingTextLength={typingText?.length || 0}
          handleExit={handleExit}
          handleRestart={handleRestart}
        />
        <MainContent
          clientId={client?.client_id || null}
          tournament={tournament}
          participants={participants}
          typingText={typingText}
          handleCharacterInput={handleCharacterInput}
        />
      </div>
    </main>
  );
};

const StatsSection = ({
  currentParticipant,
  typingTextLength,
  handleExit,
  handleRestart,
}: {
  currentParticipant: Participant | null;
  typingTextLength: number;
  handleExit: () => void;
  handleRestart: () => void;
}) => (
  <div className="col-span-1 w-full h-full items-center justify-center">
    {currentParticipant ? (
      <StatsBoard
        currentParticipant={currentParticipant}
        textLength={typingTextLength}
        onLeave={handleExit}
        onRestart={handleRestart}
      />
    ) : (
      <StatsBoardLoading />
    )}
  </div>
);

const MainContent = ({
  tournament,
  participants,
  typingText,
  clientId,
  handleCharacterInput,
}: {
  tournament: TournamentInfo | null;
  participants: Record<string, Participant>;
  typingText: string | null;
  clientId: string | null;
  handleCharacterInput: (char: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-6 col-span-4 w-full h-full">
      <ProgressBoard
        participants={participants}
        textLength={typingText?.length || 0}
      />
      {typingText && clientId ? (
        <TypingArea
          text={typingText}
          participants={participants}
          clientId={clientId}
          handleCharacterInput={handleCharacterInput}
        />
      ) : tournament ? (
        <TypingAreaCountdown scheduledAt={new Date(tournament.started_at!)} />
      ) : (
        <></>
      )}
      <ParticipantsRanking
        participants={participants}
        clientId={clientId}
        tournamentStartTime={tournament?.started_at || undefined}
      />
    </div>
  );
};

export default TournamentPage;
