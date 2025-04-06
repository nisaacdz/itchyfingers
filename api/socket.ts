// src/api/socket.ts (or similar path)
import config from "@/config";
import { TournamentInfo, Participant } from "@/types/request"; // Assuming these types match backend schemas
import { io, Socket } from "socket.io-client";

// Backend sends WsResponse structure for responses/errors
export interface WsResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Define specific payload types based on backend emissions
// These might need adjustments based on exact backend structures
type JoinResponsePayload = WsResponse<null>; // Or maybe initial data?
type LeaveResponsePayload = WsResponse<null>;
type TypingUpdatePayload = WsResponse<Participant>; // Participant might correspond to TypingSessionSchema
type TypingErrorPayload = WsResponse<null>;
type UserJoinedPayload = Participant; // Backend sends ClientSchema, adapt as needed
type UserLeftPayload = { user_id: string }; // Adapt based on backend ClientSchema/ID emission
type TournamentStartPayload = TournamentInfo; // Adapt based on backend TournamentSession/Info emission
type TournamentUpdatePayload = TournamentInfo; // Adapt based on backend TournamentSession/Info emission

// Callbacks expected by the context provider
export type TournamentEventCallbacks = {
  // Connection Status
  onConnect: () => void;
  onDisconnect: (reason: string) => void;
  onError: (errorMsg: string) => void;

  // Tournament Lifecycle & Data
  onJoinSuccess: (response: JoinResponsePayload) => void; // Handle success/failure of join attempt
  onJoinError: (response: JoinResponsePayload) => void;
  onLeaveSuccess: (response: LeaveResponsePayload) => void;
  onTournamentStart: (startData: TournamentStartPayload) => void;
  onTournamentUpdate: (data: TournamentUpdatePayload) => void;

  // Participant Updates
  onUserJoined: (data: UserJoinedPayload) => void;
  onUserLeft: (data: UserLeftPayload) => void;
  onParticipantUpdate: (data: TypingUpdatePayload) => void; // Renamed from onSessionUpdate for clarity
  onTypingError: (errorData: TypingErrorPayload) => void;
};

class TournamentAPIService {
  private socket: Socket | null = null;
  private callbacks: TournamentEventCallbacks | null = null;
  private tournamentId: string | null = null;

  connect(callbacks: TournamentEventCallbacks) {
    if (this.socket?.connected) {
      console.warn("Socket already connected.");
      // Ensure callbacks are updated if re-connecting logically
      this.callbacks = callbacks;
      // Maybe re-register base handlers if needed, though usually not
      return;
    }

    this.callbacks = callbacks;
    console.log("Attempting to connect to WS:", config.apps.ws);

    this.socket = io(config.apps.ws, {
      withCredentials: true,
      autoConnect: true, // Let it auto-connect
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
      // Consider adding transports: ['websocket'] if needed
    });

    this.registerBaseHandlers();
    this.registerTournamentHandlers(); // Register app-specific handlers
  }

  private registerBaseHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.callbacks?.onConnect();
      // Re-join the tournament room if connection was lost and re-established
      if (this.tournamentId) {
        console.log("Re-joining tournament room:", this.tournamentId);
        this.joinTournament(this.tournamentId); // Emit join event again
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      this.callbacks?.onError(err.message || "Connection failed");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.callbacks?.onDisconnect(reason);
      // Reset tournamentId on clean disconnect if needed, or handle via UI logic
      // this.tournamentId = null;
    });
  }

  // Register listeners for specific backend events
  private registerTournamentHandlers() {
    if (!this.socket) return;

    // --- Listener Alignment Example (MUST MATCH BACKEND) ---
    // Assuming backend emits 'join:response' after 'join-tournament' request
    this.socket.on("join:response", (response: JoinResponsePayload) => {
      if (response.success) {
        this.callbacks?.onJoinSuccess(response);
      } else {
        this.callbacks?.onJoinError(response);
      }
    });

    // Assuming backend emits 'leave:response' after 'leave-tournament' request
    this.socket.on("leave:response", (response: LeaveResponsePayload) => {
      if (response.success) {
        this.callbacks?.onLeaveSuccess(response);
      } else {
        // Handle leave error if necessary, maybe via onError callback
        this.callbacks?.onError(response.message || "Failed to leave");
      }
    });

    // Assuming backend emits 'user:joined' when someone joins the room
    this.socket.on("user:joined", (data: UserJoinedPayload) => {
      this.callbacks?.onUserJoined(data);
    });

    // Assuming backend emits 'user:left' when someone leaves
    this.socket.on("user:left", (data: UserLeftPayload) => {
      this.callbacks?.onUserLeft(data);
    });

    // Assuming backend emits 'typing:update' for participant progress
    this.socket.on("typing:update", (data: TypingUpdatePayload) => {
      if (data.success && data.data) {
        this.callbacks?.onParticipantUpdate(data);
      } else {
        // Handle potential error within the update structure
        console.error("Typing update error:", data.message);
      }
    });

    // Assuming backend emits 'typing:error' for specific typing issues
    this.socket.on("typing:error", (data: TypingErrorPayload) => {
      this.callbacks?.onTypingError(data);
    });

    // Assuming backend emits 'tournament:start' when ready
    this.socket.on("tournament:start", (data: TournamentStartPayload) => {
      console.log("Tournament Start event received", data);
      this.callbacks?.onTournamentStart(data);
    });

    // Assuming backend emits 'tournament:update' for meta changes (less common)
    this.socket.on("tournament:update", (data: TournamentUpdatePayload) => {
      this.callbacks?.onTournamentUpdate(data);
    });

    // Add listeners for any other events from your backend...
  }

  // --- Emitter Alignment Example (MUST MATCH BACKEND) ---
  public joinTournament(tournamentId: string) {
    if (!this.socket) {
      console.error("Socket not initialized for joinTournament");
      return;
    }
    this.tournamentId = tournamentId; // Store for potential rejoin on reconnect
    // Assuming backend listens on 'join-tournament'
    this.socket.emit("join-tournament", { tournament_id: tournamentId });
  }

  public sendTypingInput(character: string) {
    if (!this.socket) {
      console.error("Socket not initialized for sendTypingInput");
      return;
    }
    this.socket.emit("type-character", { character });
  }

  public leaveTournament() {
    if (!this.socket || !this.tournamentId) {
      console.error(
        "Socket not initialized or no tournament ID for leaveTournament",
      );
      return;
    }
    this.socket.emit("leave-tournament", { tournament_id: this.tournamentId });
    this.tournamentId = null;
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.callbacks = null;
    this.tournamentId = null;
    console.log("Socket API disconnected and cleaned up.");
  }

  public get isConnected() {
    return this.socket?.connected || false;
  }
}

export const TournamentAPI = new TournamentAPIService();

export class DateConverters {
  static toDate(isoString: string | null | undefined): Date | null {
    return isoString ? new Date(isoString) : null;
  }

  static toLocalString(isoString: string | null | undefined): string {
    const date = this.toDate(isoString);
    return date ? date.toLocaleString() : "N/A";
  }
}
