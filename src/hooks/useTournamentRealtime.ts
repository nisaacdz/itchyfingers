// @/hooks/useTournamentRealtime.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "@/api/socketService";
import {
  TournamentSession,
  TournamentUpdateSchema,
  ClientSchema, // For current authenticated client from useAuth
  TypingSessionSchema,
  ApiResponse,
  TournamentSchema, // For initial static info
} from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Socket } from "socket.io-client"; // For type hint on disconnect reason

// Define specific event payload types for clarity from socketService.ts
type JoinResponsePayload = ApiResponse<null>;
type LeaveResponsePayload = ApiResponse<null>;
type TypingErrorPayload = ApiResponse<null>;
type TypingUpdatePayload = ApiResponse<TypingSessionSchema>;

export type GamePhase =
  | "initializing" // Waiting for static data and auth data
  | "error_static_data" // Failed to load TournamentSchema
  | "error_auth" // Auth data is invalid (e.g., client is null after auth loading)
  | "error_socket" // WebSocket connection or join failed
  | "lobby" // Connected, tournament not yet started or in countdown
  | "countdown" // Tournament scheduled_for is in near future
  | "active" // Tournament started, user is typing
  | "user_completed" // Current user finished, tournament might still be active
  | "tournament_over"; // Tournament session has ended_at

export interface TournamentRealtimeState {
  tournamentSession: TournamentSession | null;
  participants: Record<string, TypingSessionSchema>;
  currentUserTypingSession: TypingSessionSchema | null;
  socketStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  gamePhase: GamePhase;
  lastSocketError: string | null;
  typingText: string | null;
}

const initialRealtimeState: TournamentRealtimeState = {
  tournamentSession: null,
  participants: {},
  currentUserTypingSession: null,
  socketStatus: "idle",
  gamePhase: "initializing",
  lastSocketError: null,
  typingText: null,
};

interface UseTournamentRealtimeProps {
  tournamentId: string | undefined; // From useParams
  initialTournamentStaticInfo: TournamentSchema | null; // From useTournamentStaticData
  isStaticLoading: boolean; // From useTournamentStaticData
  staticError: string | null; // From useTournamentStaticData
  authHookResult: { client: ClientSchema | null; isLoading: boolean }; // Direct from useAuth()
}

interface UseTournamentRealtimeReturn extends TournamentRealtimeState {
  sendTypeCharacter: (character: string) => void;
  sendLeaveTournament: () => void;
}

export const useTournamentRealtime = ({
  tournamentId,
  initialTournamentStaticInfo,
  isStaticLoading,
  staticError,
  authHookResult,
}: UseTournamentRealtimeProps): UseTournamentRealtimeReturn => {
  const [state, setState] =
    useState<TournamentRealtimeState>(initialRealtimeState);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentAuthClient = authHookResult.client;
  const isAuthLoading = authHookResult.isLoading;

  const updateState = useCallback(
    (updates: Partial<TournamentRealtimeState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const deriveCurrentGamePhase = useCallback(
    (
      currentSocketStatus: TournamentRealtimeState["socketStatus"],
      session: TournamentSession | null,
      participantsList: Record<string, TypingSessionSchema>,
      authClientIdFromHook: string | null, // currentAuthClient.id
    ): GamePhase => {
      // Prioritize error states
      if (staticError) return "error_static_data";
      if (!isAuthLoading && !authClientIdFromHook) return "error_auth"; // Auth finished loading, but no client ID
      if (currentSocketStatus === "error") return "error_socket";

      // Initializing if critical data is still loading
      if (isStaticLoading || isAuthLoading) return "initializing";
      if (
        currentSocketStatus === "idle" ||
        currentSocketStatus === "connecting"
      ) {
        // If static and auth data are ready, but socket is still connecting
        return "lobby"; // Or a more specific "connecting_socket" phase
      }

      if (!session) {
        return "lobby"; // Socket connected, but no session info yet (e.g., waiting for first tournament:update)
      }

      if (session.ended_at) {
        return "tournament_over";
      }

      if (session.started_at) {
        const userSession = authClientIdFromHook
          ? participantsList[authClientIdFromHook]
          : null;
        if (
          userSession?.ended_at ||
          (session.text &&
            userSession?.correct_position === session.text.length)
        ) {
          return "user_completed";
        }
        return "active";
      }

      if (session.scheduled_for) {
        const scheduledTime = new Date(session.scheduled_for).getTime();
        const now = Date.now();
        // Example: Countdown starts 5 minutes before.
        const countdownWindowMs = 5 * 60 * 1000;
        if (scheduledTime > now && scheduledTime <= now + countdownWindowMs) {
          return "countdown";
        }
      }
      return "lobby"; // Default state after connection and before start/countdown
    },
    [isStaticLoading, staticError, isAuthLoading], // Add all relevant dependencies
  );

  // Effect to update gamePhase based on initial loading states and errors
  useEffect(() => {
    const newPhase = deriveCurrentGamePhase(
      state.socketStatus,
      state.tournamentSession,
      state.participants,
      currentAuthClient?.id || null,
    );
    if (newPhase !== state.gamePhase) {
      updateState({ gamePhase: newPhase });
    }
  }, [
    isStaticLoading,
    staticError,
    isAuthLoading,
    currentAuthClient, // Auth related
    state.socketStatus,
    state.tournamentSession,
    state.participants, // Realtime state
    deriveCurrentGamePhase,
    updateState,
    state.gamePhase, // Hook utilities
  ]);

  // Effect for WebSocket connection and event handling
  useEffect(() => {
    // Pre-conditions for attempting socket connection:
    if (
      isStaticLoading ||
      staticError ||
      isAuthLoading ||
      !currentAuthClient ||
      !tournamentId ||
      !initialTournamentStaticInfo
    ) {
      // If any pre-condition fails after initial loading phase, set appropriate error phase.
      if (!isStaticLoading && staticError)
        updateState({
          gamePhase: "error_static_data",
          lastSocketError: staticError,
        });
      else if (!isAuthLoading && !currentAuthClient)
        updateState({
          gamePhase: "error_auth",
          lastSocketError: "User information is not available.",
        });
      // Other conditions (like !tournamentId) should ideally be caught by page structure or routing
      return;
    }

    // At this point, static data is loaded, auth is resolved (we have currentAuthClient), and we have a tournamentId.
    updateState({ socketStatus: "connecting", gamePhase: "lobby" }); // Tentatively set to lobby
    socketService
      .connect(tournamentId)
      .then(() => {
        updateState({ socketStatus: "connected" });
        // Game phase will be further refined by join:response and tournament:update
      })
      .catch((error: Error) => {
        console.error(
          "useTournamentRealtime: Failed to connect socket:",
          error,
        );
        updateState({
          socketStatus: "error",
          lastSocketError: error.message || "Failed to connect to tournament.",
          gamePhase: "error_socket",
        });
        toast({
          title: "Connection Error",
          description: "Could not connect to the tournament server.",
          variant: "destructive",
        });
      });

    // --- WebSocket Event Handlers ---
    const handleJoinResponse = (payload: JoinResponsePayload) => {
      console.log("socket: join:response", payload);
      if (!payload.success) {
        updateState({
          lastSocketError: payload.message || "Failed to join tournament room.",
          gamePhase: "error_socket", // Treat join failure as a socket error for simplicity
          socketStatus: "error",
        });
        toast({
          title: "Join Failed",
          description: payload.message || "Could not join.",
          variant: "destructive",
        });
        socketService.disconnect();
      } else {
        // Successfully joined, awaiting tournament:update or tournament:start
        // Game phase will be derived correctly based on incoming data.
        // toast({ title: "Joined Room", description: "Waiting for the tournament." });
      }
    };

    const handleTournamentStart = (sessionData: TournamentSession) => {
      console.log("socket: tournament:start", sessionData);
      const newTypingText = sessionData.text || state.typingText;
      setState((prev) => ({
        ...prev,
        tournamentSession: sessionData,
        typingText: newTypingText,
        gamePhase: deriveCurrentGamePhase(
          "connected",
          sessionData,
          prev.participants,
          currentAuthClient.id,
        ),
        lastSocketError: null,
      }));
      if (newTypingText) {
        toast({
          title: "Tournament Started!",
          description: "Let the typing begin!",
        });
      }
    };

    const handleTournamentUpdate = (updateData: TournamentUpdateSchema) => {
      console.log("socket: tournament:update", updateData);
      const newParticipantsMap: Record<string, TypingSessionSchema> = {};
      updateData.participants.forEach((p) => {
        newParticipantsMap[p.client.id] = p;
      });

      const currentUserSession = currentAuthClient
        ? newParticipantsMap[currentAuthClient.id]
        : null;
      const newTypingText = updateData.tournament.text || state.typingText;

      setState((prev) => ({
        ...prev,
        tournamentSession: updateData.tournament,
        participants: newParticipantsMap,
        currentUserTypingSession: currentUserSession,
        typingText: newTypingText,
        gamePhase: deriveCurrentGamePhase(
          "connected",
          updateData.tournament,
          newParticipantsMap,
          currentAuthClient.id,
        ),
        lastSocketError: null,
      }));
    };

    const handleUserLeft = (clientWhoLeft: ClientSchema) => {
      console.log("socket: user:left", clientWhoLeft);
      toast({
        description: `${clientWhoLeft.user?.username || "Anonymous"} (${clientWhoLeft.id.substring(0, 6)}) has left.`,
      });
      // Participant list is updated by tournament:update
    };

    const handleLeaveResponse = (payload: LeaveResponsePayload) => {
      console.log("socket: leave:response", payload);
      if (payload.success) {
        toast({
          title: "Left Tournament",
          description: "You have successfully left.",
        });
        socketService.disconnect();
        navigate("/tournaments");
      } else {
        toast({
          title: "Error Leaving",
          description: payload.message || "Could not leave.",
          variant: "destructive",
        });
      }
    };

    const handleTypingUpdate = (payload: TypingUpdatePayload) => {
      // This provides more granular updates for a single participant.
      // Useful if tournament:update is batched or less frequent.
      if (payload.success && payload.data) {
        const updatedParticipant = payload.data;
        setState((prev) => {
          const newParticipants = {
            ...prev.participants,
            [updatedParticipant.client.id]: updatedParticipant,
          };
          const newCurrentUserTypingSession =
            currentAuthClient?.id === updatedParticipant.client.id
              ? updatedParticipant
              : prev.currentUserTypingSession;

          return {
            ...prev,
            participants: newParticipants,
            currentUserTypingSession: newCurrentUserTypingSession,
            // Re-derive gamePhase if this update could change it (e.g., user finishing)
            gamePhase: deriveCurrentGamePhase(
              prev.socketStatus,
              prev.tournamentSession,
              newParticipants,
              currentAuthClient.id,
            ),
          };
        });
      }
    };

    const handleTypingError = (payload: TypingErrorPayload) => {
      console.error("socket: typing:error", payload);
      toast({
        title: "Typing Error",
        description: payload.message || "An input error occurred.",
        variant: "destructive",
      });
      updateState({ lastSocketError: payload.message });
    };

    const handleDisconnect = (reason: Socket.DisconnectReason) => {
      console.warn("Socket disconnected:", reason);
      // If server initiated, it's a hard disconnect. Otherwise, socket.io client might try to reconnect.
      const isHardDisconnect =
        reason === "io server disconnect" || reason === "io client disconnect";
      updateState({
        socketStatus: "disconnected",
        lastSocketError: `Disconnected: ${reason}`,
        gamePhase: isHardDisconnect ? "error_socket" : state.gamePhase, // Maintain phase if reconnecting
      });
      if (isHardDisconnect) {
        toast({
          title: "Disconnected",
          description: `Connection lost: ${reason}`,
          variant: "destructive",
        });
      }
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connect_error:", error);
      updateState({
        socketStatus: "error",
        lastSocketError: error.message || "Connection establishment error.",
        gamePhase: "error_socket",
      });
    };

    // Register listeners
    socketService.on("join:response", handleJoinResponse);
    socketService.on("tournament:start", handleTournamentStart);
    socketService.on("tournament:update", handleTournamentUpdate);
    socketService.on("user:left", handleUserLeft);
    socketService.on("leave:response", handleLeaveResponse);
    socketService.on("typing:update", handleTypingUpdate);
    socketService.on("typing:error", handleTypingError);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("connect_error", handleConnectError);

    return () => {
      // Unregister listeners and disconnect
      console.log(
        "useTournamentRealtime: Cleaning up socket listeners and disconnecting.",
      );
      socketService.off("join:response", handleJoinResponse);
      socketService.off("tournament:start", handleTournamentStart);
      socketService.off("tournament:update", handleTournamentUpdate);
      socketService.off("user:left", handleUserLeft);
      socketService.off("leave:response", handleLeaveResponse);
      socketService.off("typing:update", handleTypingUpdate);
      socketService.off("typing:error", handleTypingError);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("connect_error", handleConnectError);
      socketService.disconnect();
      // Reset to a clean state, or maintain some info if navigating away briefly
      // For a full leave, reset might be appropriate.
      // updateState(initialRealtimeState); // Or a subset for persistence if needed
      updateState({ socketStatus: "idle" }); // Indicate socket is no longer active
    };
  }, [
    tournamentId,
    initialTournamentStaticInfo,
    isStaticLoading,
    staticError,
    isAuthLoading,
    currentAuthClient,
    state.gamePhase,
    updateState,
    toast,
    navigate,
    deriveCurrentGamePhase,
    state.typingText, // Utilities and state dependencies
  ]);

  // Actions to be called by components
  const sendTypeCharacter = useCallback(
    (character: string) => {
      // Only send if active and socket is connected
      if (state.gamePhase === "active" && state.socketStatus === "connected") {
        socketService.emitTypeCharacter(character);
      }
    },
    [state.gamePhase, state.socketStatus],
  );

  const sendLeaveTournament = useCallback(() => {
    if (state.socketStatus === "connected") {
      socketService.emitLeaveTournament();
    } else {
      // If not connected, perhaps just navigate away
      toast({
        title: "Not Connected",
        description: "Cannot send leave request.",
        variant: "destructive",
      });
      navigate("/tournaments");
    }
  }, [state.socketStatus, navigate, toast]);

  return { ...state, sendTypeCharacter, sendLeaveTournament };
};
