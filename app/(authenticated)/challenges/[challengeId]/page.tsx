"use client";
import React from "react";
import { Challenge, Participant, UserTyping } from "../../../types/request";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  useChallenge,
  useParticipants,
  useSocket,
  useTypingText,
  useUserTyping,
} from "../../../hooks/socketUtil";
import { StatsBoard, StatsBoardLoading } from "@/app/components/StatsBoard";
import ProgressBoard from "@/app/components/ProgressBoard";
import { TypingArea, TypingAreaCountdown } from "@/app/components/TypingArea";
import ParticipantsRanking from "@/app/components/ParticipantsRanking";
import { useRouter } from "next/navigation";

const ChallengePage = () => {
  const { challengeId } = useParams() as { challengeId: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    challenge,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId);
  const { participants, participantsError, setParticipants } = useParticipants(
    challenge,
    challengeId,
  );

  const { typingText, typingTextError, setTypingText } = useTypingText(
    challenge,
    challengeId,
  );

  const { userTyping, userTypingError, setUserTyping } = useUserTyping(
    challenge,
    challengeId,
    user,
  );
  const {
    socketError,
    handleCharacterInput,
    socketLoading,
    handleExitCompetition,
  } = useSocket(
    challengeId,
    user,
    setTypingText,
    setParticipants,
    userTyping,
    setUserTyping,
    challenge?.startedAt || undefined,
  );

  const loading = challengeLoading || socketLoading || authLoading;
  const error =
    challengeError ||
    socketError ||
    typingTextError ||
    participantsError ||
    userTypingError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error.message}</div>;

  const handleExit = () => {
    if (confirm("Are you sure you want to exit competition?")) {
      handleExitCompetition();
      router.push("/challenges");
    }
  };

  const handleRestart = () => {};

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <StatsSection
          userTyping={userTyping}
          typingText={typingText}
          handleExit={handleExit}
          handleRestart={handleRestart}
        />
        <MainContent
          challenge={challenge}
          participants={participants}
          typingText={typingText}
          userTyping={userTyping}
          handleCharacterInput={handleCharacterInput}
        />
      </div>
    </main>
  );
};

const StatsSection = ({
  userTyping,
  typingText,
  handleExit,
  handleRestart,
}: {
  userTyping: UserTyping | null;
  typingText: string | null;
  handleExit: () => void;
  handleRestart: () => void;
}) => (
  <div className="col-span-1 w-full h-full items-center justify-center">
    {userTyping ? (
      <StatsBoard
        userTyping={userTyping}
        textLength={typingText?.length || 0}
        onLeave={handleExit}
        onRestart={handleRestart}
      />
    ) : (
      <StatsBoardLoading />
    )}
  </div>
);

const MainContent = ({
  challenge,
  participants,
  typingText,
  userTyping,
  handleCharacterInput,
}: {
  challenge: Challenge | null;
  participants: Participant[] | null;
  typingText: string | null;
  userTyping: UserTyping | null;
  handleCharacterInput: (char: string) => void;
}) => (
  <div className="flex flex-col gap-6 col-span-4 w-full h-full">
    <ProgressBoard
      participants={participants || []}
      textLength={typingText?.length || 0}
    />
    {typingText && userTyping ? (
      <TypingArea
        text={typingText}
        participants={participants || []}
        userTyping={userTyping}
        handleCharacterInput={handleCharacterInput}
      />
    ) : challenge ? (
      <TypingAreaCountdown scheduledAt={new Date(challenge.scheduledAt)} />
    ) : (
      <></>
    )}
    <ParticipantsRanking participants={participants} userTyping={userTyping} />
  </div>
);

export default ChallengePage;
