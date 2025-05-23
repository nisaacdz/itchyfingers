"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  TournamentAPI,
  TournamentEventCallbacks,
  WsResponse,
} from "@/api/socket";
import { Client, Participant, TournamentInfo } from "@/types/request";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export type TournamentContextState = {
  tournamentId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  tournamentInfo: TournamentInfo | null;
  participants: Record<string, Participant>;
  currentParticipant: Participant | null;
  sendTypingInput: (char: string) => void;
  leaveTournament: () => void;
};

const TournamentContext = createContext<TournamentContextState | null>(null);

interface TournamentProviderProps {
  children: ReactNode;
  tournamentId: string;
}

export const TournamentProvider = ({
  children,
  tournamentId,
}: TournamentProviderProps) => {
  const { client, loading: authLoading } = useAuth();
  const clientId = client?.id || null;

  const [isConnected, setIsConnected] = useState(TournamentAPI.isConnected);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(
    null,
  );
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {},
  );

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
    console.log("Context: Socket Connected");
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    // Don't set loading true here, it's a disconnect, not initial load
    // Consider showing a specific disconnected message/state
    // setError(`Disconnected: ${reason}. Attempting to reconnect...`);
    toast.error(`Disconnected: ${reason}`);
    // Optionally clear state on disconnect, or keep it for display
    // setTournamentInfo(null);
    // setParticipants({});
  }, []);

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsConnected(TournamentAPI.isConnected);
    setIsLoading(false);
    toast.error(`Socket Error: ${errorMsg}`);
  }, []);

  const handleJoinSuccess = useCallback(
    (response: WsResponse<TournamentInfo>) => {
      console.log("Context: Joined Tournament Successfully", response);
      setError(null);
      setIsLoading(false);
      toast.success(response.message || "Joined tournament!");
      if (response.data) {
        setTournamentInfo(response.data);
      }
    },
    [],
  );

  const handleJoinError = useCallback(
    (response: WsResponse<TournamentInfo>) => {
      console.error("Context: Failed to Join Tournament", response);
      setError(response.message || "Failed to join tournament.");
      setIsLoading(false);
    },
    [],
  );

  const handleLeaveSuccess = useCallback((response: WsResponse<null>) => {
    console.log("Context: Left tournament", response);
    toast.success(response.message || "Left tournament");
    // State will be cleared by the disconnect cleanup in useEffect or navigation
  }, []);

  const handleTournamentStart = useCallback(
    (startData: TournamentInfo) => {
      console.log("Context: Tournament Started", startData);
      setTournamentInfo(startData);
    },
    [tournamentId],
  );

  const handleTournamentUpdate = useCallback(
    (data: { tournament: TournamentInfo; participants: Participant[] }) => {
      console.log("Context: Tournament Updated", data);
      const participantsMap = data.participants.reduce(
        (acc: Record<string, Participant>, participant: Participant) => {
          acc[participant.client.id] = participant;
          return acc;
        },
        {} as Record<string, Participant>,
      );

      setParticipants(participantsMap);
      setTournamentInfo(data.tournament);
    },
    [tournamentId],
  );

  const handleUserJoined = useCallback(
    (participantData: Participant) => {
      setParticipants((prev) => ({
        ...prev,
        [participantData.client.id]: participantData,
      }));
      toast.info(
        `${participantData.client.user?.username || "Anonymous user"} joined.`,
      );
    },
    [clientId],
  );

  const handleUserLeft = useCallback((data: Client) => {
    console.log("Context: User Left", data);
    toast.info(`${data.user?.username || "Ananymous user"} left.`);
    setParticipants((prev) => {
      const updated = { ...prev };
      delete updated[data.id];
      return updated;
    });
  }, []);

  const handleParticipantUpdate = useCallback(
    (response: WsResponse<Participant>) => {
      const participantData = response.data;
      if (!participantData || !participantData.client.id) return;
      setParticipants((prev) => ({
        ...prev,
        [participantData.client.id]: {
          ...(prev[participantData.client.id] || {}),
          ...participantData,
        },
      }));
    },
    [],
  );

  const handleTypingError = useCallback((errorData: WsResponse<null>) => {
    console.error("Context: Typing Error", errorData);
    toast.error(`Typing Error: ${errorData.message}`);
  }, []);

  useEffect(() => {
    if (!tournamentId) {
      setError("Authentication required to join.");
      setIsLoading(false);
      return;
    }

    console.log(
      `Context: Initializing socket for tournament ${tournamentId} and client ${clientId}`,
    );
    setIsLoading(true);

    const callbacks: TournamentEventCallbacks = {
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
      onJoinSuccess: handleJoinSuccess,
      onJoinError: handleJoinError,
      onLeaveSuccess: handleLeaveSuccess,
      onTournamentStart: handleTournamentStart,
      onTournamentUpdate: handleTournamentUpdate,
      onUserJoined: handleUserJoined,
      onUserLeft: handleUserLeft,
      onParticipantUpdate: handleParticipantUpdate,
      onTypingError: handleTypingError,
    };

    TournamentAPI.connect(tournamentId, callbacks);

    return () => {
      console.log(`Context: Cleaning up socket for tournament ${tournamentId}`);
      TournamentAPI.disconnect();
      // Reset state on cleanup
      setIsConnected(false);
      setIsLoading(true);
      setError(null);
      setTournamentInfo(null);
      setParticipants({});
    };
  }, [
    tournamentId,
    clientId,
    authLoading,
    handleConnect,
    handleDisconnect,
    handleError,
    handleJoinSuccess,
    handleJoinError,
    handleLeaveSuccess,
    handleTournamentStart,
    handleTournamentUpdate,
    handleUserJoined,
    handleUserLeft,
    handleParticipantUpdate,
    handleTypingError,
  ]);

  const sendTypingInput = useCallback(
    (char: string) => {
      const currentUser = participants[clientId || ""];
      if (
        !isConnected ||
        !tournamentInfo?.started_at ||
        currentUser?.ended_at
      ) {
        console.warn("Typing input blocked:", {
          isConnected,
          started: !!tournamentInfo?.started_at,
          ended: !!currentUser?.ended_at,
        });
        toast.warning(
          !isConnected
            ? "Disconnected from server"
            : !tournamentInfo?.started_at
              ? "Tournament hasn't started yet"
              : "You've already finished typing",
        );
        return;
      }
      TournamentAPI.sendTypingInput(char);
    },
    [isConnected, clientId, participants, tournamentInfo?.started_at],
  );

  const leaveTournament = useCallback(() => {
    if (!isConnected) return;
    TournamentAPI.leaveTournament();
  }, [isConnected]);

  const contextValue = useMemo(
    () => ({
      tournamentId,
      isConnected,
      isLoading,
      error,
      tournamentInfo,
      participants,
      currentParticipant: clientId ? participants[clientId] || null : null,
      sendTypingInput,
      leaveTournament,
    }),
    [
      tournamentId,
      isConnected,
      isLoading,
      error,
      tournamentInfo,
      participants,
      clientId,
      sendTypingInput,
      leaveTournament,
    ],
  );

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error(
      "useTournamentContext must be used within a TournamentProvider",
    );
  }
  return context;
};
