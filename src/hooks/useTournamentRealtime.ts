import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "@/api/socketService";
import {
  TournamentSession,
  TypingSessionSchema,
  ClientSchema,
  TournamentUpdateSchema,
  WsResponse,
} from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Socket as SocketIoClientSocket } from "socket.io-client";

type JoinResponsePayload = WsResponse<null>;
type LeaveResponsePayload = WsResponse<null>;
type TypingErrorPayload = WsResponse<null>;
type TypingUpdatePayload = WsResponse<TypingSessionSchema>;

export interface TournamentRealtimeMinimalState {
  tournamentSession: TournamentSession | null;
  participants: Record<string, TypingSessionSchema>;
  socketStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  lastSocketError: string | null;
}

const initialRealtimeState: TournamentRealtimeMinimalState = {
  tournamentSession: null,
  participants: {},
  socketStatus: "idle",
  lastSocketError: null,
};

interface UseTournamentRealtimeProps {
  tournamentId: string | undefined; // From useParams
  // initialTournamentStaticInfo: TournamentSchema | null; // No longer passed to hook, orchestrator holds it
  isStaticDataLoading: boolean; // From useTournamentStaticData (renamed for clarity)
  staticDataError: string | null; // From useTournamentStaticData (renamed for clarity)
  authClient: ClientSchema | null; // Direct client object
  isAuthLoading: boolean;
}

// What the hook returns
interface UseTournamentRealtimeReturn extends TournamentRealtimeMinimalState {
  sendTypeCharacter: (character: string) => void;
  sendLeaveTournament: () => void;
}

export const useTournamentRealtime = ({
  tournamentId,
  isStaticDataLoading,
  staticDataError,
  authClient,
  isAuthLoading,
}: UseTournamentRealtimeProps): UseTournamentRealtimeReturn => {
  const [state, setState] =
    useState<TournamentRealtimeMinimalState>(initialRealtimeState);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Using a ref for handlers to avoid re-registering listeners unnecessarily
  // The handlers themselves will be updated in a separate effect.
  const eventHandlersRef = useRef({
    handleJoinResponse: (payload: JoinResponsePayload) => {},
    handleTournamentStart: (sessionData: TournamentSession) => {},
    handleTournamentUpdate: (updateData: TournamentUpdateSchema) => {},
    handleUserLeft: (clientWhoLeft: ClientSchema) => {},
    handleLeaveResponse: (payload: LeaveResponsePayload) => {},
    handleTypingUpdate: (payload: TypingUpdatePayload) => {},
    handleTypingError: (payload: TypingErrorPayload) => {},
    handleSocketConnect: () => {},
    handleSocketDisconnect: (reason: SocketIoClientSocket.DisconnectReason) => {},
    handleSocketConnectError: (error: Error) => {},
  });

  // Effect to define/update the actual handler logic
  useEffect(() => {
    eventHandlersRef.current.handleJoinResponse = (payload: JoinResponsePayload) => {
      console.log("Socket Event: join:response", payload);
      if (!payload.success) {
        setState(prev => ({
            ...prev,
            lastSocketError: payload.message || "Failed to join tournament room.",
            socketStatus: "error", // Or "disconnected" if server implies this
        }));
        toast({ title: "Join Failed", description: payload.message || "Could not join.", variant: "destructive" });
        // Consider if socketService.disconnect() is needed here if server rejects join.
      }
      // On success, expect a tournament:update or tournament:start shortly.
    };

    eventHandlersRef.current.handleTournamentStart = (sessionData: TournamentSession) => {
      console.log("Socket Event: tournament:start", sessionData);
      setState(prev => ({
        ...prev,
        tournamentSession: sessionData,
        participants: {}, // Reset participants on new start? Or does update handle it?
        lastSocketError: null,
      }));
      if (sessionData.text) {
        toast({ title: "Tournament Started!", description: "Let the typing begin!" });
      }
    };

    eventHandlersRef.current.handleTournamentUpdate = (updateData: TournamentUpdateSchema) => {
      console.log("Socket Event: tournament:update", updateData);
      setState(prev => {
        const newParticipantsMap: Record<string, TypingSessionSchema> = {};
        updateData.participants.forEach((p) => {
          newParticipantsMap[p.client.id] = p;
        });
        return {
          ...prev,
          tournamentSession: updateData.tournament,
          participants: newParticipantsMap,
          lastSocketError: null,
        };
      });
    };

    eventHandlersRef.current.handleUserLeft = (clientWhoLeft: ClientSchema) => {
      console.log("Socket Event: user:left", clientWhoLeft);
      toast({ description: `${clientWhoLeft.user?.username || "User"} left.` });
      // participants list is updated by tournament:update, so no direct state change here needed typically.
    };

    eventHandlersRef.current.handleLeaveResponse = (payload: LeaveResponsePayload) => {
      console.log("Socket Event: leave:response", payload);
      if (payload.success) {
        toast({ title: "Left Tournament", description: "You have successfully left." });
        // socketService.disconnect(); // Already disconnected by emitting leave, or server will disconnect.
        navigate("/tournaments"); // Navigate after confirmation
      } else {
        toast({ title: "Error Leaving", description: payload.message || "Could not leave.", variant: "destructive" });
      }
    };

    eventHandlersRef.current.handleTypingUpdate = (payload: TypingUpdatePayload) => {
      console.log("Socket Event: typing:update", payload);
      if (payload.success && payload.data) {
        const updatedParticipant = payload.data;
        setState(prev => ({
          ...prev,
          participants: {
            ...prev.participants,
            [updatedParticipant.client.id]: updatedParticipant,
          },
        }));
      }
    };

    eventHandlersRef.current.handleTypingError = (payload: TypingErrorPayload) => {
      console.error("Socket Event: typing:error", payload);
      toast({ title: "Typing Error", description: payload.message || "An input error occurred.", variant: "destructive" });
      setState(prev => ({ ...prev, lastSocketError: payload.message }));
    };

    eventHandlersRef.current.handleSocketConnect = () => {
      console.log("Socket Event: Native 'connect' (or reconnect)");
      setState(prev => ({ ...prev, socketStatus: "connected", lastSocketError: null }));
    };

    eventHandlersRef.current.handleSocketDisconnect = (reason: SocketIoClientSocket.DisconnectReason) => {
      console.warn("Socket Event: Native 'disconnect'", reason);
      setState(prev => ({
        ...prev,
        socketStatus: "disconnected",
        lastSocketError: `Disconnected: ${reason}`,
      }));
      // Toast for hard disconnects, socket.io client handles reconnection attempts for others.
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        toast({ title: "Disconnected", description: `Connection lost: ${reason}`, variant: "destructive" });
      }
    };

    eventHandlersRef.current.handleSocketConnectError = (error: Error) => {
      console.error("Socket Event: Native 'connect_error'", error);
      setState(prev => ({
        ...prev,
        socketStatus: "error", // Or "disconnected" if it's a final failure
        lastSocketError: error.message || "Connection establishment error.",
      }));
    };
  }, [toast, navigate]); // Dependencies for the handler logic (stable ones)

  // Effect for WebSocket Connection/Disconnection Management
  useEffect(() => {
    // Pre-conditions for attempting socket connection:
    if (isStaticDataLoading || isAuthLoading) {
      // If still loading critical prerequisites, ensure we are in 'idle' or 'initializing'
      // This prevents trying to connect prematurely.
      if (state.socketStatus !== "idle" && state.socketStatus !== "connecting") {
         setState(prev => ({ ...prev, socketStatus: "idle", lastSocketError: "Waiting for data/auth..."}));
      }
      return;
    }

    if (staticDataError) {
      setState(prev => ({ ...prev, socketStatus: "error", lastSocketError: `Static data error: ${staticDataError}` }));
      return;
    }
    if (!authClient) {
      setState(prev => ({ ...prev, socketStatus: "error", lastSocketError: "Authentication required." }));
      return;
    }
    if (!tournamentId) {
      setState(prev => ({ ...prev, socketStatus: "error", lastSocketError: "Tournament ID missing." }));
      return;
    }

    // All prerequisites met, proceed with connection
    console.log(`useTournamentRealtime: Prerequisites met. Attempting to connect for tournament: ${tournamentId}`);
    setState(prev => ({ ...prev, socketStatus: "connecting", lastSocketError: null }));

    socketService
      .connect(tournamentId)
      .then(() => {
        // The 'connect' event handler via eventHandlersRef will set status to "connected"
        console.log("useTournamentRealtime: socketService.connect() promise resolved.");
        // No direct setState here for "connected"; let the 'connect' event handler do it.
      })
      .catch((error: Error) => {
        console.error("useTournamentRealtime: Failed to connect socket via promise:", error);
        setState(prev => ({
          ...prev,
          socketStatus: "error",
          lastSocketError: error.message || "Failed to connect to tournament.",
        }));
        toast({
          title: "Connection Error",
          description: error.message || "Could not connect to the tournament server.",
          variant: "destructive",
        });
      });

    return () => {
      console.log("useTournamentRealtime: Connection effect cleanup. Disconnecting socket.");
      socketService.disconnect();
      // Reset state on disconnect? Or just socketStatus?
      // Setting to idle signifies the connection attempt controlled by this effect is over.
      setState(prev => ({ ...prev, socketStatus: "idle" }));
    };
  }, [
    tournamentId,
    authClient,
    staticDataError,
    isAuthLoading,
    toast,
  ]);

  // Effect for Registering/Unregistering Socket Event Listeners
  useEffect(() => {
    // Listeners should only be active if a connection is established or being established
    // and the socket instance in socketService is expected to be valid.
    if (state.socketStatus !== "connected" && state.socketStatus !== "connecting") {
      // If not connected or connecting, ensure no listeners are attempted to be set.
      // Cleanup for listeners happens in the return function of this effect
      // when socketStatus changes FROM a state where listeners were set.
      return;
    }

    console.log(`useTournamentRealtime: Socket status is '${state.socketStatus}'. (Re)Registering listeners.`);

    const getHandler = <K extends keyof typeof eventHandlersRef.current>(key: K) => 
        (...args: Parameters<typeof eventHandlersRef.current[K]>) => {
            return eventHandlersRef.current[key](...args);
        };
        
    const localOnConnect = getHandler('handleSocketConnect');
    const localOnDisconnect = getHandler('handleSocketDisconnect');
    const localOnConnectError = getHandler('handleSocketConnectError');
    const localOnJoinResponse = getHandler('handleJoinResponse');
    const localOnTournamentStart = getHandler('handleTournamentStart');
    const localOnTournamentUpdate = getHandler('handleTournamentUpdate');
    const localOnUserLeft = getHandler('handleUserLeft');
    const localOnLeaveResponse = getHandler('handleLeaveResponse');
    const localOnTypingUpdate = getHandler('handleTypingUpdate');
    const localOnTypingError = getHandler('handleTypingError');

    // Register listeners using the refs
    socketService.on("connect", localOnConnect);
    socketService.on("disconnect", localOnDisconnect);
    socketService.on("connect_error", localOnConnectError);
    socketService.on("join:response", localOnJoinResponse);
    socketService.on("tournament:start", localOnTournamentStart);
    socketService.on("tournament:update", localOnTournamentUpdate);
    socketService.on("user:left", localOnUserLeft);
    socketService.on("leave:response", localOnLeaveResponse);
    socketService.on("typing:update", localOnTypingUpdate);
    socketService.on("typing:error", localOnTypingError);

    return () => {
      console.log("useTournamentRealtime: Listener effect cleanup. Unregistering listeners.");
      socketService.off("connect", localOnConnect);
      socketService.off("disconnect", localOnDisconnect);
      socketService.off("connect_error", localOnConnectError);
      socketService.off("join:response", localOnJoinResponse);
      socketService.off("tournament:start", localOnTournamentStart);
      socketService.off("tournament:update", localOnTournamentUpdate);
      socketService.off("user:left", localOnUserLeft);
      socketService.off("leave:response", localOnLeaveResponse);
      socketService.off("typing:update", localOnTypingUpdate);
      socketService.off("typing:error", localOnTypingError);
    };
  }, [state.socketStatus]); // Re-run only when socketStatus changes


  const sendTypeCharacter = useCallback(
    (character: string) => {
      if (state.socketStatus === "connected") { // Check derived gamePhase in component
        socketService.emitTypeCharacter(character);
      } else {
        console.warn("Cannot sendTypeCharacter: Socket not connected.");
      }
    },
    [state.socketStatus],
  );

  const sendLeaveTournament = useCallback(() => {
    if (state.socketStatus === "connected") {
      socketService.emitLeaveTournament();
    } else {
      console.warn("Cannot sendLeaveTournament: Socket not connected. Navigating away.");
      navigate("/tournaments"); // Or show toast
    }
  }, [state.socketStatus, navigate]);

  return { ...state, sendTypeCharacter, sendLeaveTournament };
};