// @/api/socketService.ts
import { io, Socket as SocketIoClientSocket } from "socket.io-client"; // Renamed Socket from socket.io-client
import {
  TournamentSession,
  TournamentUpdateSchema,
  ClientSchema,
  TypingSessionSchema,
  TypeArgs,
  WsResponse, // Using WsResponse
} from "@/types/api"; // Assuming your types are in "@/types/api"

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || "access_token";

// Payload types using WsResponse
type JoinResponsePayload = WsResponse<null>;
type LeaveResponsePayload = WsResponse<null>;
type TypingErrorPayload = WsResponse<null>; // Assuming server sends WsResponse for errors too
type TypingUpdatePayload = WsResponse<TypingSessionSchema>; // Individual typing update

interface ServerToClientEvents {
  "join:response": (payload: JoinResponsePayload) => void;
  "tournament:start": (payload: TournamentSession) => void; // Server might send raw TournamentSession
  "tournament:update": (payload: TournamentUpdateSchema) => void; // Server sends this structured update
  "user:left": (payload: ClientSchema) => void; // Server might send raw ClientSchema
  "leave:response": (payload: LeaveResponsePayload) => void;
  "typing:update": (payload: TypingUpdatePayload) => void;
  "typing:error": (payload: TypingErrorPayload) => void;
  // Standard socket.io events
  connect: () => void;
  disconnect: (reason: SocketIoClientSocket.DisconnectReason) => void;
  connect_error: (error: Error) => void;
}

interface ClientToServerEvents {
  "type-character": (args: TypeArgs) => void;
  "leave-tournament": () => void;
}

export class SocketService {
  private socket: SocketIoClientSocket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private currentTournamentId: string | null = null; // Renamed for clarity

  private getSocketBaseUrl(): string {
    return import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
  }

  public connect(tournamentId: string): Promise<void> {
    if (this.socket && this.socket.connected && this.currentTournamentId === tournamentId) {
      console.log("SocketService: Already connected to this tournament.");
      return Promise.resolve();
    }

    if (this.socket) {
      console.log("SocketService: Disconnecting from previous tournament or connection attempt.");
      this.disconnect();
    }

    this.currentTournamentId = tournamentId;
    const baseUrl = this.getSocketBaseUrl();
    const namespaceUrl = `${baseUrl}/comp`; // Assuming "/comp" is your namespace

    console.log(`SocketService: Attempting to connect to WebSocket: ${namespaceUrl} for tournament ${tournamentId}`);

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const extraHeaders: Record<string, string> = {
      "X-Requested-With": "XMLHttpRequest",
    };
    if (accessToken) {
      extraHeaders.Authorization = `Bearer ${accessToken}`;
    }

    this.socket = io(namespaceUrl, {
      transports: ["websocket"],
      autoConnect: false, // We call connect explicitly
      reconnectionAttempts: 3, // Sensible default
      reconnectionDelay: 2000,
      extraHeaders,
      query: {
        id: tournamentId, // Server uses this to identify the tournament context
      },
    });

    return new Promise((resolve, reject) => {
      this.socket?.once("connect", () => {
        console.log(`SocketService: Successfully connected to ${namespaceUrl}. Socket ID: ${this.socket?.id}`);
        resolve();
      });

      this.socket?.once("connect_error", (error) => {
        console.error("SocketService: Connection error:", error);
        this.socket = null; // Clear socket on fatal connection error
        this.currentTournamentId = null;
        reject(error);
      });

      this.socket?.connect();
    });
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("SocketService: Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.currentTournamentId = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public emitTypeCharacter(character: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn("SocketService: Not connected. Cannot emit type-character.");
      return;
    }
    this.socket.emit("type-character", { character });
  }

  public emitLeaveTournament(): void {
    if (!this.socket || !this.socket.connected) {
      console.warn("SocketService: Not connected. Cannot emit leave-tournament.");
      return;
    }
    this.socket.emit("leave-tournament");
  }

  public on<Event extends keyof ServerToClientEvents>(
    event: Event,
    listener: ServerToClientEvents[Event],
  ): void {
    if (!this.socket) {
      // This warning is fine if listeners are attempted to be added before connect() is called
      console.warn(`SocketService: Socket not initialized. Cannot listen to ${event}.`);
      return;
    }
    // @ts-expect-error Type is actually valid
    this.socket.on(event, listener);
  }

  public off<Event extends keyof ServerToClientEvents>(
    event: Event,
    listener?: ServerToClientEvents[Event],
  ): void {
    if (!this.socket) {
      // This warning is fine if listeners are attempted to be removed when socket is already null
      // console.warn(`SocketService: Socket not initialized. Cannot unlisten from ${event}.`);
      return;
    }
    if (listener) {
      // @ts-expect-error Type is actually valid
      this.socket.off(event, listener);
    } else {
      this.socket.off(event); // Remove all listeners for this event
    }
  }
}

export const socketService = new SocketService();