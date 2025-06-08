import { io, Socket } from 'socket.io-client';
import {
  ApiResponse,
  TournamentSession,
  TournamentUpdateSchema,
  ClientSchema,
  TypingSessionSchema,
  TypeArgs,
} from '@/types/api';

type JoinResponsePayload = ApiResponse<null>;
type LeaveResponsePayload = ApiResponse<null>;
type TypingErrorPayload = ApiResponse<null>;
type TypingUpdatePayload = ApiResponse<TypingSessionSchema>;

interface ServerToClientEvents {
  'join:response': (payload: JoinResponsePayload) => void;
  'tournament:start': (payload: TournamentSession) => void;
  'tournament:update': (payload: TournamentUpdateSchema) => void;
  'user:left': (payload: ClientSchema) => void;
  'leave:response': (payload: LeaveResponsePayload) => void;
  'typing:update': (payload: TypingUpdatePayload) => void;
  'typing:error': (payload: TypingErrorPayload) => void;
  connect: () => void;
  disconnect: (reason: Socket.DisconnectReason) => void;
  connect_error: (error: Error) => void;
}

interface ClientToServerEvents {
  'type-character': (args: TypeArgs) => void;
  'leave-tournament': () => void;
}

export class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private tournamentId: string | null = null;

  private getSocketBaseUrl(): string {
    return import.meta.env.VITE_SOCKET_BASE_URL || 'http://localhost:8000';
  }

  // No token management here; token is passed in
  public connect(tournamentId: string, accessToken: string | null): Promise<void> {
    if (this.socket && this.socket.connected && this.tournamentId === tournamentId) {
      console.log('Socket already connected to this tournament.');
      return Promise.resolve();
    }

    if (this.socket) {
      this.disconnect(); // Disconnect from previous tournament if any
    }

    this.tournamentId = tournamentId;
    const baseUrl = this.getSocketBaseUrl();
    const namespaceUrl = `${baseUrl}/tournament/${tournamentId}`;

    console.log(`Attempting to connect to WebSocket: ${namespaceUrl}`);

    const extraHeaders: { [key: string]: string } = {};
    if (accessToken) {
      extraHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    this.socket = io(namespaceUrl, {
      transports: ['websocket'],
      autoConnect: false, // We'll call connect explicitly
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      extraHeaders,
    });

    return new Promise((resolve, reject) => {
      this.socket?.once('connect', () => {
        console.log('Socket connected successfully to', namespaceUrl);
        resolve();
      });

      this.socket?.once('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.socket = null; // Clear socket instance on connection failure
        reject(error);
      });

      this.socket?.connect();
    });
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.tournamentId = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // --- Event Emitters (Client-to-Server) ---
  public emitTypeCharacter(character: string): void {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot emit type-character.');
      return;
    }
    this.socket.emit('type-character', { character });
  }

  public emitLeaveTournament(): void {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot emit leave-tournament.');
      return;
    }
    this.socket.emit('leave-tournament');
  }

  public on<Event extends keyof ServerToClientEvents>(
    event: Event,
    listener: ServerToClientEvents[Event],
  ): void {
    if (!this.socket) {
      console.warn(`Socket not initialized. Cannot listen to ${event}.`);
      return;
    }
    this.socket.on(event, listener);
  }

  public off<Event extends keyof ServerToClientEvents>(
    event: Event,
    listener?: ServerToClientEvents[Event],
  ): void {
    if (!this.socket) {
      console.warn(`Socket not initialized. Cannot unlisten from ${event}.`);
      return;
    }
    if (listener) {
      this.socket.off(event, listener);
    } else {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();