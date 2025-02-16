"use client";
import React, { useState } from "react";
import { Challenge, Participant, UserTyping } from "../../../types/request";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  useChallenge,
  useParticipants,
  useSocket,
  useTypingText,
} from "../../../hooks/socketUtil";
import StatsBoard from "@/app/components/StatsBoard";
import ProgressBoard from "@/app/components/ProgressBoard";
import { TypingArea, TypingAreaCountdown } from "@/app/components/TypingArea";
import ParticipantsRanking from "@/app/components/ParticipantsRanking";

const ChallengePage = () => {
  const { challengeId } = useParams() as { challengeId: string };
  const { user, loading: authLoading } = useAuth();
  // Custom hooks
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
  const { userTyping, socketError, handleCharacterInput, socketLoading } =
    useSocket(
      challengeId,
      user,
      setTypingText,
      setParticipants,
      challenge?.startedAt || undefined,
    );

  const loading = challengeLoading || socketLoading || authLoading;
  const error =
    challengeError || socketError || typingTextError || participantsError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error.message}</div>;
  if (!challenge)
    return <div className="text-red-500 p-4">Challenge not found</div>;

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <StatsSection userTyping={userTyping} typingText={typingText} />
        <MainContent
          challenge={challenge}
          participants={participants || []}
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
}: {
  userTyping: UserTyping | null;
  typingText: string | null;
}) => (
  <div className="col-span-1 w-full h-full items-center justify-center">
    <StatsBoard user={userTyping!} textLength={typingText?.length || 0} />
  </div>
);

const MainContent = ({
  challenge,
  participants,
  typingText,
  userTyping,
  handleCharacterInput,
}: {
  challenge: Challenge;
  participants: Participant[];
  typingText: string | null;
  userTyping: UserTyping | null;
  handleCharacterInput: (char: string) => void;
}) => (
  <div className="flex flex-col gap-6 col-span-4 w-full h-full">
    <ProgressBoard
      participants={participants}
      textLength={typingText?.length || 0}
    />
    {typingText ? (
      <TypingArea
        text={typingText}
        participants={participants}
        user={userTyping!}
        handleCharacterInput={handleCharacterInput}
      />
    ) : (
      <TypingAreaCountdown scheduledAt={new Date(challenge.scheduledAt)} />
    )}
    <ParticipantsRanking participants={participants} user={userTyping!} />
  </div>
);

export default ChallengePage;
