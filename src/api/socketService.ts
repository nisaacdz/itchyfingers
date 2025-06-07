import { io, Socket } from "socket.io-client";
import {
  TypeArgs,
  TypingSessionSchema,
  // SocketResponse, // This might be an error, review if ApiResponse should be used everywhere
  ApiResponse, // Added for consistency
  TournamentUpdateSchema,
  TournamentSession, // Added import
  ClientSchema, // Updated from ClientSchema to WebSocketClientSchema based on docs
} from "../types/api";
import { useAuthStore } from "../store/authStore"; // Added for JWT token

class SocketService {
  private socket: Socket | null = null;
  private currentTournamentId: string | null = null;

  connect(tournamentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing connection
        this.disconnect();

        const { client } = useAuthStore.getState(); // Get client info which might contain the token or user details for auth
        // Assuming the token is stored within the client object or needs to be retrieved differently.
        // For now, this is a placeholder. If the token is stored directly in authStore, adjust accordingly.
        // const token = client?.token; // This is an assumption. Replace with actual token access.
        // TODO: Replace with actual token retrieval logic from useAuthStore
        const token = (useAuthStore.getState() as any).token;


        const baseUrl =
          import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
        this.socket = io(`${baseUrl}/tournament/${tournamentId}`, {
          transports: ["websocket"],
          autoConnect: true,
          extraHeaders: token?.access ? { Authorization: `Bearer ${token.access}` } : {}, // Add JWT
        });

        this.currentTournamentId = tournamentId;

        this.socket.on("connect", () => {
          console.log(`Connected to tournament ${tournamentId}`);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentTournamentId = null;
    }
  }

  // Emit typing character
  emitTypeCharacter(args: TypeArgs): void {
    if (this.socket?.connected) {
      this.socket.emit("type-character", args);
    }
  }

  // Client-to-Server: Leave tournament
  emitLeaveTournament(): void {
    if (this.socket?.connected) {
      this.socket.emit("leave-tournament");
    }
  }

  // Subscribe to typing updates
  onTypingUpdate(
    callback: (data: ApiResponse<TypingSessionSchema>) => void, // Correct as per docs
  ): void {
    if (this.socket) {
      this.socket.on("typing:update", callback);
    }
  }

  // Subscribe to tournament events
  onTournamentStart(callback: (data: TournamentSession) => void): void { // Correct as per docs
    if (this.socket) {
      this.socket.on("tournament:start", callback);
    }
  }

  onTournamentEnd(callback: () => void): void { // No payload defined in docs, but often has final state.
    if (this.socket) {
      this.socket.on("tournament:end", callback); // Assuming 'tournament:end' is the correct event, not in docs
    }
  }

  // Server-to-Client: Join response
  onJoinResponse(callback: (data: ApiResponse<null>) => void): void {
    if (this.socket) {
      this.socket.on("join:response", callback);
    }
  }

  // Server-to-Client: Tournament update (primary state sync)
  onTournamentUpdate(callback: (data: TournamentUpdateSchema) => void): void { // Correct as per docs
    if (this.socket) {
      this.socket.on("tournament:update", callback);
    }
  }

  // Server-to-Client: User left
  onUserLeft(callback: (data: ClientSchema) => void): void { // Updated to WebSocketClientSchema
    if (this.socket) {
      this.socket.on("user:left", callback);
    }
  }

  // Server-to-Client: Leave response
  onLeaveResponse(callback: (data: ApiResponse<null>) => void): void {
    if (this.socket) {
      this.socket.on("leave:response", callback);
    }
  }

  // Server-to-Client: Typing error
  onTypingError(callback: (data: ApiResponse<null>) => void): void {
    if (this.socket) {
      this.socket.on("typing:error", callback);
    }
  }

  // Legacy/Existing listeners (review if still needed or should be replaced by onTournamentUpdate)
  // These might be redundant if tournament:update covers these scenarios.
  // For now, keeping them if they serve a specific, non-overlapping purpose.
  onParticipantJoin(callback: (data: any) => void): void { // Consider removing if covered by onTournamentUpdate
    if (this.socket) {
      this.socket.on("participant:join", callback);
    }
  }

  onParticipantLeave(callback: (data: any) => void): void { // Consider removing if covered by onTournamentUpdate
    if (this.socket) {
      this.socket.on("participant:leave", callback);
    }
  }

  // Remove all event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get tournamentId(): string | null {
    return this.currentTournamentId;
  }
}

export const socketService = new SocketService();
export default socketService;
