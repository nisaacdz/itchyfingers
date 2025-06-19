import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { ConnectOptions, socketService } from "@/api/socketService";
import { ParticipantData, TournamentData } from "@/types/api";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

type socketStatus = "connecting" | "connected" | "disconnected" | "failed";

export const TournamentPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const location = useLocation();
  // spectator from url query
  const spectator = new URLSearchParams(location.search).get("spectator") === "true";
  const { client } = useAuth();

  const [socketStatus, setSocketStatus] = useState<socketStatus | null>(null);

  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [participants, setParticipants] = useState<Record<string, ParticipantData>>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast: detailedToast } = useToast();

  useEffect(() => {
    if (!tournamentId) return setError("Invalid url")
    const connectOptions: ConnectOptions = {
      tournamentId,
      spectator,
      onJoinSuccess: (data) => {
        setSocketStatus("connected");
        setTournamentData(data.data);
        setParticipants(
          data.participants.reduce((acc: Record<string, ParticipantData>, participant: ParticipantData) => {
            acc[participant.client.id] = participant;
            return acc;
          }, {})
        )
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
        if (failure.code === 1004) { // deadline passed for participants
          navigate(".?spectator=true");
        }
      }
    };

    socketService.connect(connectOptions);

    return () => {
      socketService.disconnect();
      setSocketStatus(null);
      setTournamentData(null);
      setParticipants({});
    };
  }, [spectator, tournamentId, navigate, detailedToast]);

  useEffect(() => {
    if (socketStatus === "connected") {
      // Handle successful connection logic here
      console.log("Successfully connected to tournament socket");

      socketService.on("update:all", (data) => {
        setParticipants((prev) => {
          const newParticipants = { ...prev };
          data.updates.forEach((update) => {
            if (newParticipants[update.clientId]) {
              newParticipants[update.clientId] = {
                ...newParticipants[update.clientId],
                ...update.updates,
              };
            }
          });
          return newParticipants;
        });
      });

      socketService.on("update:data", (data) => {
        setTournamentData((prev) =>
          prev ? { ...prev, ...data.updates } : null
        );
      });

      socketService.on("update:me", (data) => {
        setParticipants((prev) => {
          const me = prev[client.id];
          if (!me) return prev;
          return {
            ...prev,
            [client.id]: {
              ...me,
              ...data.updates,
            },
          };
        });
      });

      socketService.on("member:joined", (data) => {
        setParticipants(prev => ({
          ...prev,
          [data.participant.client.id]: data.participant
        }));
      });

      socketService.on("member:left", (data) => {
        setParticipants(prev => {
          const { [data.clientId]: delme, ...remParticipants } = { ...prev };
          return remParticipants;
        });
      });
    }

    return () => {
      socketService.off("update:all");
      socketService.off("update:data");
      socketService.off("update:me");
      socketService.off("member:joined");
      socketService.off("member:left");
    }
  }, [client.id, socketStatus]);

  return (
    <>
      {tournamentData && (
        <TournamentRoomOrchestrator
          participants={participants}
          tournamentData={tournamentData} />)}
    </>
  );
};

export default TournamentPage;
