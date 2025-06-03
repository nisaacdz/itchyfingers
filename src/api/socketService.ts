import { io, Socket } from "socket.io-client";
import { TypeArgs, TypingSessionSchema, SocketResponse } from "../types/api";

class SocketService {
  private socket: Socket | null = null;
  private currentTournamentId: string | null = null;

  connect(tournamentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing connection
        this.disconnect();

        const baseUrl =
          import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
        this.socket = io(`${baseUrl}/tournament/${tournamentId}`, {
          transports: ["websocket"],
          autoConnect: true,
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

  // Subscribe to typing updates
  onTypingUpdate(
    callback: (data: SocketResponse<TypingSessionSchema>) => void,
  ): void {
    if (this.socket) {
      this.socket.on("typing:update", callback);
    }
  }

  // Subscribe to tournament events
  onTournamentStart(callback: () => void): void {
    if (this.socket) {
      this.socket.on("tournament:start", callback);
    }
  }

  onTournamentEnd(callback: () => void): void {
    if (this.socket) {
      this.socket.on("tournament:end", callback);
    }
  }

  onParticipantJoin(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("participant:join", callback);
    }
  }

  onParticipantLeave(callback: (data: any) => void): void {
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
