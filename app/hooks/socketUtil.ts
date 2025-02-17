import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Challenge, Participant, User, UserTyping } from "../types/request";
import {
  fetchUserSession,
  getSessionParticipants,
  typingSocketAPI,
} from "../api";
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
  user: User | null,
  setTypingText: (_: string) => void,
  setParticipants: (_: Participant[]) => void,
  userTyping: UserTyping | null,
  setUserTyping: (_: UserTyping | null) => void,
  startedAt?: string,
) => {
  const [socketError, setSocketError] = useState<Error | null>(null);
  const [socketLoading, setSocketLoading] = useState(true);

  const handleStartChallenge = (newTypingText: string) => {
    setTypingText(newTypingText);
    // there'll be user but putting this check here
    if (!userTyping && user) {
      fetchUserSession(challengeId, user.userId).then(setUserTyping);
    }
  };

  useEffect(() => {
    if (!user || !challengeId) return;

    const handlers = {
      onStartChallenge: handleStartChallenge,
      onUpdateUser: setUserTyping,
      onUpdateZone: setParticipants,
      onError: setSocketError,
      onEntered: (p: Participant) => toast.success(`${p.username} entered`),
      onLeft: (p: Participant) => toast.success(`${p.username} left`),
      onDisconnect: (message: string) => toast.error(message),
    };

    typingSocketAPI.connect();
    typingSocketAPI.initializeChallengeHandlers(handlers);
    setSocketLoading(false);

    return () => {
      typingSocketAPI.disconnect();
    };
  }, [challengeId, user, startedAt]);

  const handleCharacterInput = (char: string) => {
    if (userTyping?.endTime) return;
    typingSocketAPI.sendTypingInput(char);
  };

  const handleExitCompetition = () => {
    typingSocketAPI.leaveChallenge();
  };

  return {
    socketError,
    handleCharacterInput,
    handleExitCompetition,
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
  }, [challenge?.startedAt, challengeId]);

  return { typingText, typingTextError, setTypingText };
};

export const useParticipants = (
  challenge: Challenge | null,
  challengeId: string,
) => {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [participantsError, setParticipantsError] = useState<Error | null>(
    null,
  );

  useEffect(() => {
    if (participants || !challenge?.startedAt) return;

    const loadParticipants = async () => {
      try {
        const participants = await getSessionParticipants(challengeId);
        setParticipants(participants);
        if (participantsError) setParticipantsError(null);
      } catch (err) {
        setParticipantsError(err as Error);
      }
    };

    loadParticipants();
  }, [challenge?.startedAt, challengeId]);

  return { participants, participantsError, setParticipants };
};

export const useUserTyping = (
  challenge: Challenge | null,
  challengeId: string,
  user: User | null,
) => {
  const [userTyping, setUserTyping] = useState<UserTyping | null>(null);
  const [userTypingError, setUserTypingError] = useState<Error | null>(null);

  useEffect(() => {
    if (!challenge?.startedAt || !user) return;

    const loadUserTyping = async () => {
      try {
        const newUserTyping = await fetchUserSession(challengeId, user.userId);
        if (!newUserTyping) {
          throw new Error("failed to get user session");
        }
        setUserTyping(newUserTyping);
        if (userTypingError) setUserTypingError(null);
      } catch (err) {
        setUserTypingError(err as Error);
      }
    };

    loadUserTyping();
  }, [challenge?.startedAt, user, challengeId]);

  return { userTyping, userTypingError, setUserTyping };
};
