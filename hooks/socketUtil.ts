import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Challenge, Participant, TournamentInfo } from "../types/request";
import { fetchSessionParticipants, typingSocketAPI } from "../api/requests";
import { fetchChallenge, getTypingText } from "../api/requests";
import { toast } from "react-toastify";
import { ChallengeEventCallbacks } from "@/api/socket";

export const useChallenge = (tournamentId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => fetchChallenge(tournamentId),
    enabled: !!tournamentId,
  });

  return {
    tournament: data || null,
    isLoading,
    error: error as Error | null,
  };
};

export const useSocket = (
  tournamentId: string,
  userId: string | null,
  setTypingText: (_: string) => void,
  tournamentStartedAt?: string,
) => {
  const [socketError, setSocketError] = useState<Error | null>(null);
  const [socketLoading, setSocketLoading] = useState(true);
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {},
  );

  const handleLeftTournament = (data: { user_id: string }) => {
    toast.success(`User ${data.user_id} left`);
    setParticipants((prev) => {
      const updated = { ...prev };
      delete updated[data.user_id];
      return updated;
    });
  };

  useEffect(() => {
    if (!userId) return;

    const handleTournamentStart = (data: TournamentInfo) => {
      setTypingText(data.text);
      setSocketLoading(false);
    };

    const handleSessionUpdate = (session: Participant) => {
      setParticipants((prev) => ({
        ...prev,
        [session.user_id]: {
          ...session,
        },
      }));
    };

    const handleParticipantJoined = (session: Participant) => {
      toast.success(`User ${session.user_id} joined`);
      handleSessionUpdate(session);
    };

    const handlers: ChallengeEventCallbacks = {
      onSessionUpdate: handleSessionUpdate,
      onTournamentStart: handleTournamentStart,
      onError: (message) => {
        setSocketError(new Error(message));
      },
      onJoined: handleParticipantJoined,
      onLeft: handleLeftTournament,
      onDisconnect: (message) => toast.error(`Disconnected: ${message}`),
      onTournamentUpdate: (data) => {
        console.log(data);
        // Handle tournament metadata updates if needed
      },
    };

    typingSocketAPI.initialize(tournamentId, handlers);

    if (tournamentStartedAt && new Date() > new Date(tournamentStartedAt)) {
      fetchSessionParticipants(tournamentId).then((sessions) => {
        const initialParticipants = sessions.reduce(
          (acc, session) => ({
            ...acc,
            [session.user_id]: {
              ...session,
            },
          }),
          {} as Record<string, Participant>,
        );
        setParticipants(initialParticipants);
      });
    }

    return () => {
      typingSocketAPI.disconnect();
      setSocketLoading(true);
    };
  }, [tournamentId, userId, tournamentStartedAt, setTypingText]);

  const handleCharacterInput = (input: string) => {
    if (!userId || participants[userId]?.ended_at) return;
    typingSocketAPI.sendTypingInput(input);
  };

  const handleExitCompetition = () => {
    typingSocketAPI.leaveTournament();
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
  tournament: Challenge | null,
  tournamentId: string,
) => {
  const [typingText, setTypingText] = useState<string | null>(null);
  const [typingTextError, setTypingTextError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tournament?.startedAt) return;

    const loadText = async () => {
      try {
        const text = await getTypingText(tournamentId);
        setTypingText(text);
        if (typingTextError) setTypingTextError(null);
      } catch (err) {
        setTypingTextError(err as Error);
      }
    };

    loadText();
  }, [tournament?.startedAt, tournamentId, typingTextError]);

  return { typingText, typingTextError, setTypingText };
};
