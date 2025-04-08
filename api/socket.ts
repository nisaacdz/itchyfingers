import config from "@/config";
import { TournamentInfo, Participant, Client } from "@/types/request";
import { io, Socket } from "socket.io-client";

export interface WsResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

type JoinResponsePayload = WsResponse<TournamentInfo>;
type LeaveResponsePayload = WsResponse<null>;
type TypingUpdatePayload = WsResponse<Participant>;
type TypingErrorPayload = WsResponse<null>;
type UserJoinedPayload = Participant;
type UserLeftPayload = Client;
type TournamentStartPayload = TournamentInfo;
type TournamentUpdatePayload = {
  tournament: TournamentInfo;
  participants: Participant[];
};

export type TournamentEventCallbacks = {
  onConnect: () => void;
  onDisconnect: (reason: string) => void;
  onError: (errorMsg: string) => void;

  onJoinSuccess: (response: JoinResponsePayload) => void;
  onJoinError: (response: JoinResponsePayload) => void;
  onLeaveSuccess: (response: LeaveResponsePayload) => void;
  onTournamentStart: (startData: TournamentStartPayload) => void;
  onTournamentUpdate: (data: TournamentUpdatePayload) => void;

  onUserJoined: (data: UserJoinedPayload) => void;
  onUserLeft: (data: UserLeftPayload) => void;
  onParticipantUpdate: (data: TypingUpdatePayload) => void;
  onTypingError: (errorData: TypingErrorPayload) => void;
};

class TournamentAPIService {
  private socket: Socket | null = null;
  private callbacks: TournamentEventCallbacks | null = null;
  private tournamentId: string | null = null;

  connect(callbacks: TournamentEventCallbacks) {
    if (this.socket?.connected) {
      console.warn("Socket already connected.");
      this.callbacks = callbacks;
      return;
    }

    this.callbacks = callbacks;
    console.log("Attempting to connect to WS:", config.apps.ws);

    this.socket = io(config.apps.ws, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
    });

    this.registerBaseHandlers();
    this.registerTournamentHandlers();
  }

  private registerBaseHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.callbacks?.onConnect();
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      this.callbacks?.onError(err.message || "Connection failed");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.callbacks?.onDisconnect(reason);
    });
  }

  private registerTournamentHandlers() {
    if (!this.socket) return;

    this.socket.on("join:response", (response: JoinResponsePayload) => {
      if (response.success) {
        this.callbacks?.onJoinSuccess(response);
      } else {
        this.callbacks?.onJoinError(response);
      }
    });

    this.socket.on("leave:response", (response: LeaveResponsePayload) => {
      if (response.success) {
        this.callbacks?.onLeaveSuccess(response);
      } else {
        this.callbacks?.onError(response.message || "Failed to leave");
      }
    });

    this.socket.on("user:joined", (data: UserJoinedPayload) => {
      this.callbacks?.onUserJoined(data);
    });

    this.socket.on("user:left", (data: UserLeftPayload) => {
      this.callbacks?.onUserLeft(data);
    });

    this.socket.on("typing:update", (data: TypingUpdatePayload) => {
      if (data.success && data.data) {
        this.callbacks?.onParticipantUpdate(data);
      } else {
        console.error("Typing update error:", data.message);
      }
    });

    this.socket.on("typing:error", (data: TypingErrorPayload) => {
      this.callbacks?.onTypingError(data);
    });

    this.socket.on("tournament:start", (data: TournamentStartPayload) => {
      console.log("Tournament Start event received", data);
      this.callbacks?.onTournamentStart(data);
    });

    this.socket.on("tournament:update", (data: TournamentUpdatePayload) => {
      this.callbacks?.onTournamentUpdate(data);
    });
  }

  // --- Emitter Alignment Example (MUST MATCH BACKEND) ---
  public joinTournament(tournamentId: string) {
    if (!this.socket) {
      console.error("Socket not initialized for joinTournament");
      return;
    }
    this.tournamentId = tournamentId;
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
