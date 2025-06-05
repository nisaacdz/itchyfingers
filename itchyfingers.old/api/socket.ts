import config from "@/config";
import { TournamentInfo, Participant } from "@/types/request";
import { io, Socket } from "socket.io-client";

export type TournamentEventCallbacks = {
  onSessionUpdate: (data: Participant) => void;
  onTournamentStart: (startData: TournamentInfo) => void;
  onError: (error: string) => void;
  onJoined: (data: Participant) => void;
  onDisconnect: (message: string) => void;
  onLeft: (data: { user_id: string }) => void;
  onTournamentUpdate: (data: TournamentInfo) => void;
};

class TypingSocketAPI {
  private socket: Socket | null = null;
  private callbacks: TournamentEventCallbacks | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(config.apps.core, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
    });

    this.registerBaseHandlers();
  }

  private registerBaseHandlers() {
    this.socket?.on("connect", () => {
      console.log("Connected to typing tournament server");
    });

    this.socket?.on("connect_error", (err) => {
      this.callbacks?.onError(err.message);
    });

    this.socket?.on("disconnect", (reason) => {
      this.callbacks?.onDisconnect(reason.toString());
    });

    // Raw date strings passed through
    this.socket?.on("tournament:update", (data: TournamentInfo) => {
      this.callbacks?.onTournamentUpdate(data);
    });

    this.socket?.on("session:update", (data: Participant) => {
      this.callbacks?.onSessionUpdate(data);
    });
  }

  public initialize(tournamentId: string, callbacks: TournamentEventCallbacks) {
    this.callbacks = callbacks;
    this.connect();

    // Direct passthrough of raw server data
    this.socket?.on("tournament:start", (data: TournamentInfo) => {
      this.callbacks?.onTournamentStart(data);
    });

    this.socket?.on("tournament:joined", (data: Participant) => {
      this.callbacks?.onJoined(data);
    });

    this.socket?.on("tournament:left", (data: { user_id: string }) => {
      this.callbacks?.onLeft(data);
    });

    this.socket?.emit("tournament:join", { tournament_id: tournamentId });
  }

  public sendTypingInput(character: string) {
    this.socket?.emit("typing:input", {
      character,
    });
  }

  public leaveTournament() {
    this.socket?.emit("tournament:leave");
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.callbacks = null;
  }

  public get isConnected() {
    return this.socket?.connected || false;
  }
}

// Optional conversion helpers for consumer side
export class DateConverters {
  static toDate(isoString: string | null): Date | null {
    return isoString ? new Date(isoString) : null;
  }

  static toLocalString(isoString: string | null): string {
    return isoString ? new Date(isoString).toLocaleString() : "";
  }
}

export const typingSocketAPI = new TypingSocketAPI();
