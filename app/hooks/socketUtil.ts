import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Challenge, Participant, StartChallenge } from "../types/request";
import { fetchSessionParticipants, typingSocketAPI } from "../api";
import { fetchChallenge, getTypingText } from "../api";
import { toast } from "react-toastify";

export const useChallenge = (challengeId: string) => {
  const { data, isLoading, error } = useQuery<Challenge>({
    queryKey: ["challenge", challengeId],
    queryFn: () => fetchChallenge(challengeId),
    enabled: !!challengeId,
  });

  return {
    challenge: data || null,
    isLoading,
    error: error as Error | null,
  };
};

export const useSocket = (
  challengeId: string,
  userId: string | null,
  setTypingText: (_: string) => void,
  challengeStartedAt?: string,
) => {
  const [socketError, setSocketError] = useState<Error | null>(null);
  const [socketLoading, setSocketLoading] = useState(true);
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {},
  );

  const handleLeftChallenge = (p: Participant) => {
    toast.success(`${p.username} left`);
    setParticipants((participants) => {
      delete participants[p.userId];
      return participants;
    });
  };

  useEffect(() => {
    if (!userId) return;

    const handleStartChallenge = (data: StartChallenge) => {
      setTypingText(data.typingText);
      setParticipants(
        data.participants.reduce((acc: Record<string, Participant>, p) => {
          acc[p.userId] = p;
          return acc;
        }, {}),
      );
    };

    const handleUpdateParticipant = (p: Participant) => {
      setParticipants((prev) => {
        return { ...prev, [p.userId]: p };
      });
    };

    const handleEnteredChallenge = (p: Participant) => {
      toast.success(`${p.username} entered`);
      handleUpdateParticipant(p);
    };

    const handlers = {
      onStartChallenge: handleStartChallenge,
      onUpdateParticipant: handleUpdateParticipant,
      onError: setSocketError,
      onEntered: handleEnteredChallenge,
      onLeft: handleLeftChallenge,
      onDisconnect: (message: string) => toast.error(message),
    };

    typingSocketAPI.initialize(challengeId, handlers);

    if (challengeStartedAt && new Date() > new Date(challengeStartedAt)) {
      fetchSessionParticipants(challengeId).then((pss) => {
        const data = pss.reduce((acc: Record<string, Participant>, p) => {
          acc[p.userId] = p;
          return acc;
        }, {});
        setParticipants(data);
      });
    }

    setSocketLoading(false);

    return () => {
      typingSocketAPI.disconnect();
    };
  }, [challengeId, userId, challengeStartedAt, setTypingText, setParticipants]);

  const handleCharacterInput = (char: string) => {
    if (!userId) return;
    const userParticipant = participants[userId];
    if (userParticipant?.endTime) return;
    typingSocketAPI.sendTypingInput(char);
  };

  const handleExitCompetition = () => {
    typingSocketAPI.leaveChallenge();
  };

  return {
    socketError,
    handleCharacterInput,
    handleExitCompetition,
    participants,
    socketLoading,
  };
};

export const useTypingText = (
  challenge: Challenge | null,
  challengeId: string,
) => {
  const [typingText, setTypingText] = useState<string | null>(null);
  const [typingTextError, setTypingTextError] = useState<Error | null>(null);

  useEffect(() => {
    if (!challenge?.startedAt) return;

    const loadText = async () => {
      try {
        const text = await getTypingText(challengeId);
        setTypingText(text);
        if (typingTextError) setTypingTextError(null);
      } catch (err) {
        setTypingTextError(err as Error);
      }
    };

    loadText();
  }, [challenge?.startedAt, challengeId, typingTextError]);

  return { typingText, typingTextError, setTypingText };
};
