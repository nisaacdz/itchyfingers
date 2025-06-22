/* eslint-disable react-refresh/only-export-components */
import { socketService, ConnectOptions } from "@/api/socketService";
import { Button } from "@/components/ui/button";
import {
  ParticipantData,
  TournamentData,
  TournamentRoomMember,
} from "@/types/api";
import { useContext, useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { toast } from "sonner";

export interface TournamentRoomContextValue {
  participants: Record<string, ParticipantData>;
  data: TournamentData;
  member: TournamentRoomMember;
  participating: boolean;
}

export interface TournamentRoomContextState {
  participants: Record<string, ParticipantData>;
  data: TournamentData;
  member: TournamentRoomMember;
}

export interface TournamentRoomContextProps {
  tournamentId: string;
  spectator: boolean;
  anonymous: boolean;
}

export type socketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";

const TournamentRoomContext = createContext<
  TournamentRoomContextValue | undefined
>(undefined);

export const TournamentRoom = ({
  children,
  tournamentId,
  spectator,
  anonymous,
}: React.PropsWithChildren<TournamentRoomContextProps>) => {
  const [socketStatus, setSocketStatus] = useState<socketStatus | null>(null);
  const [contextValue, setContextValue] =
    useState<TournamentRoomContextState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast: detailedToast } = useToast();

  useEffect(() => {
    if (!tournamentId) return setError("Invalid url");
    const connectOptions: ConnectOptions = {
      tournamentId,
      spectator,
      anonymous,
      onJoinSuccess: (data) => {
        setSocketStatus("connected");
        const participants = data.participants.reduce(
          (
            acc: Record<string, ParticipantData>,
            participant: ParticipantData,
          ) => {
            acc[participant.member.id] = participant;
            return acc;
          },
          {},
        );
        setContextValue({
          participants,
          data: data.data,
          member: data.member,
        });
      },
      onConnectError: (error) => {
        setSocketStatus("failed");
        console.error("Failed to join tournament:", error);
        detailedToast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      },
      onDisconnect: () => {
        setSocketStatus("disconnected");
        console.warn("Disconnected from tournament socket");
      },
      onJoinFailure: (failure) => {
        setSocketStatus("failed");
        console.error("Failed to join tournament:", failure);
        toast.error(failure.message);
        if (failure.code === 1004) {
          // deadline passed for participants
          const searchParams = new URLSearchParams(location.search);
          searchParams.set("spectator", "true");
          if (anonymous) {
            searchParams.set("anonymous", "true");
          }
          navigate({ search: searchParams.toString() }, { replace: true });
        }
      },
    };

    socketService.connect(connectOptions);

    return () => {
      socketService.disconnect();
      setSocketStatus(null);
    };
  }, [tournamentId, spectator, anonymous, navigate, detailedToast]);

  useEffect(() => {
    if (socketStatus === "connected") {
      // Handle successful connection logic here
      console.log("Successfully connected to tournament socket");

      socketService.on("update:all", (data) => {
        if (!data.updates.length) return;
        setContextValue((prev) => {
          if (!prev) return null;
          const newParticipants = { ...prev.participants };
          data.updates.forEach((update) => {
            if (newParticipants[update.clientId]) {
              newParticipants[update.clientId] = {
                ...newParticipants[update.clientId],
                ...update.updates,
              };
            }
          });
          return {
            ...prev,
            participants: newParticipants,
          };
        });
      });

      socketService.on("update:data", (data) => {
        if (!data.updates) return;
        setContextValue((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            data: {
              ...prev.data,
              ...data.updates,
            },
          };
        });
      });

      socketService.on("update:me", (data) => {
        setContextValue((prev) => {
          if (!prev) return null;
          const memberId = prev.member.id;
          if (!memberId) return prev;
          const me = prev.participants[memberId];
          if (!me) return prev;
          return {
            ...prev,
            participants: {
              ...prev.participants,
              [memberId]: {
                ...me,
                ...data.updates,
              },
            },
          };
        });
      });

      socketService.on("member:joined", (data) => {
        setContextValue((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            participants: {
              ...prev.participants,
              [data.participant.member.id]: data.participant,
            },
          };
        });
      });

      socketService.on("member:left", (data) => {
        setContextValue((prev) => {
          if (!prev) return null;
          const { [data.clientId]: delme, ...remParticipants } = {
            ...prev.participants,
          };
          return {
            ...prev,
            participants: remParticipants,
          };
        });
      });
    }

    return () => {
      socketService.off("update:all");
      socketService.off("update:data");
      socketService.off("update:me");
      socketService.off("member:joined");
      socketService.off("member:left");
    };
  }, [socketStatus]);

  return contextValue ? (
    <TournamentRoomContext.Provider
      value={{
        participants: contextValue.participants,
        data: contextValue.data,
        member: contextValue.member,
        participating: contextValue.member.id in contextValue.participants,
      }}
    >
      {children}
    </TournamentRoomContext.Provider>
  ) : (
    <></>
  );
};

export const useRoom = () => {
  const context = useContext(TournamentRoomContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an TournamentRoom");
  }
  return context;
};
