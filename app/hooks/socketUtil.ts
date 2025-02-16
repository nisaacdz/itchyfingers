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
  startedAt?: string,
) => {
  const [userTyping, setUserTyping] = useState<UserTyping | null>(null);
  const [socketError, setSocketError] = useState<Error | null>(null);
  const [socketLoading, setSocketLoading] = useState(true);

  useEffect(() => {
    if (!user || !challengeId) return;

    const handlers = {
      onStartChallenge: setTypingText,
      onUpdateUser: setUserTyping,
      onUpdateZone: setParticipants,
      onError: setSocketError,
      onEntered: (p: Participant) => toast.success(`${p.username} joined`),
      onLeft: (p: Participant) => toast.success(`${p.username} left`),
      onDisconnect: () => toast.error("Connection interrupted"),
    };

    typingSocketAPI.initializeChallengeHandlers(handlers);
    typingSocketAPI.connect();

    fetchUserSession(challengeId, user.userId)
      .then(setUserTyping)
      .finally(() => setSocketLoading(false));

    return () => {
      typingSocketAPI.disconnect();
    };
  }, [challengeId, user, startedAt]);

  const handleCharacterInput = (char: string) => {
    typingSocketAPI.sendTypingInput(char);
  };

  return {
    userTyping,
    socketError,
    handleCharacterInput,
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
        setTypingTextError(null);
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
        setParticipantsError(null);
      } catch (err) {
        setParticipantsError(err as Error);
      }
    };

    loadParticipants();
  }, [challenge?.startedAt, challengeId]);

  return { participants, participantsError, setParticipants };
};
