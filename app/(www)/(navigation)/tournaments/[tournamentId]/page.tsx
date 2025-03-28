"use client";
import { Challenge, Participant } from "@/types/request";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/AuthContext";
import { useChallenge, useSocket, useTypingText } from "@/hooks/socketUtil";
import { StatsBoard, StatsBoardLoading } from "@/components/custom/StatsBoard";
import ProgressBoard from "@/components/custom/ProgressBoard";
import {
  TypingArea,
  TypingAreaCountdown,
} from "@/components/custom/TypingArea";
import ParticipantsRanking from "@/components/custom/ParticipantsRanking";
import { useRouter } from "next/navigation";

const ChallengePage = () => {
  const { tournamentId } = useParams() as { tournamentId: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    tournament,
    isLoading: tournamentLoading,
    error: tournamentError,
  } = useChallenge(tournamentId);
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
    user?.userId || null,
    setTypingText,
    tournament?.startedAt || undefined,
  );

  const loading = tournamentLoading || socketLoading || authLoading;
  const error = tournamentError || socketError || typingTextError;

  const userParticipant = user ? participants[user.userId] : undefined;

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
          userParticipant={userParticipant || null}
          typingTextLength={typingText?.length || 0}
          handleExit={handleExit}
          handleRestart={handleRestart}
        />
        <MainContent
          userId={user?.userId || null}
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
  userParticipant,
  typingTextLength,
  handleExit,
  handleRestart,
}: {
  userParticipant: Participant | null;
  typingTextLength: number;
  handleExit: () => void;
  handleRestart: () => void;
}) => (
  <div className="col-span-1 w-full h-full items-center justify-center">
    {userParticipant ? (
      <StatsBoard
        userParticipant={userParticipant}
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
  userId,
  handleCharacterInput,
}: {
  tournament: Challenge | null;
  participants: Record<string, Participant>;
  typingText: string | null;
  userId: string | null;
  handleCharacterInput: (char: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-6 col-span-4 w-full h-full">
      <ProgressBoard
        participants={participants}
        textLength={typingText?.length || 0}
      />
      {typingText && userId ? (
        <TypingArea
          text={typingText}
          participants={participants}
          userId={userId}
          handleCharacterInput={handleCharacterInput}
        />
      ) : tournament ? (
        <TypingAreaCountdown scheduledAt={new Date(tournament.scheduledAt)} />
      ) : (
        <></>
      )}
      <ParticipantsRanking
        participants={participants}
        userId={userId}
        tournamentStartTime={tournament?.startedAt || undefined}
      />
    </div>
  );
};

export default ChallengePage;
