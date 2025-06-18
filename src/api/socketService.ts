import { JoinSuccessPayload, WsFailurePayload } from "@/types/api";
import { io, Socket as SocketIoClientSocket } from "socket.io-client"; // Renamed Socket from socket.io-client

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || "access_token";
const CLIENT_ID_KEY = import.meta.env.VITE_CLIENT_ID_KEY || "client_id";

export type ConnectOptions = {
  tournamentId: string;
  spectator?: boolean;
  onJoinSuccess: (payload: JoinSuccessPayload) => void;
  onDisconnect: (reason: string) => void;
  onJoinFailure: (payload: WsFailurePayload) => void;
  onConnectError: (error: Error) => void;
}

export class SocketService {
  private socket: SocketIoClientSocket | null = null;
  private options: ConnectOptions | null = null;

  private getSocketBaseUrl(): string {
    return import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
  }

  public connect(options: ConnectOptions): Promise<void> {
    if (this.socket && this.socket.connected && this.options?.tournamentId === options.tournamentId) {
      console.log("SocketService: Already connected to this tournament.");
      console.error("Why are you trying to connect again?");
      return Promise.resolve();
    }

    this.options = options;

    if (this.socket) {
      console.log("SocketService: Disconnecting from previous tournament.");
      this.disconnect();
    }

    const baseUrl = this.getSocketBaseUrl();
    const namespaceUrl = `${baseUrl}/`;

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const clientId = sessionStorage.getItem(CLIENT_ID_KEY);
    const extraHeaders = {
      "X-Requested-With": "XMLHttpRequest",
      ...(clientId ? { "X-Client-ID": clientId } : {}),
      ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
    };

    const query = {
      id: options.tournamentId,
      ...(options.spectator ? { spectator: "true" } : {})
    };

    this.socket = io(namespaceUrl, {
      transports: ["websocket"],
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      extraHeaders,
      query,
    });

    console.log(`SocketService: Attempting to connect to WebSocket: ${namespaceUrl} for tournament ${options.tournamentId}`)

    this.registerConnectionListeners();

    this.socket?.on("reconnect_attempt", () => {
      this.registerConnectionListeners()

      // listen to successful reconnect? but how to make it not forever remain listening.
      // we want only listen to reconnect_success
    });

    this.socket?.on("disconnect", this.options?.onDisconnect);

    this.socket?.connect();
  }

  registerConnectionListeners(): void {
    this.socket?.once("join:success", payload => {
      this.options?.onJoinSuccess(payload)
      this.cleanUpConnectionListeners()
    })
    this.socket?.once("join:failure", payload => {
      this.options?.onJoinFailure(payload)
      this.cleanUpConnectionListeners()
    })
    this.socket?.once("reconnect_failed", payload => {
      this.options?.onConnectError(payload)
      this.cleanUpConnectionListeners()
    });
    this.socket?.once("connect_error", payload => {
      this.options?.onConnectError(payload)
      this.cleanUpConnectionListeners()
    });
    this.socket?.once("connect", () => {
      console.log(`SocketService: Successfully connected. Socket ID: ${this.socket?.id}`);
    });
  }

  cleanUpConnectionListeners(): void {
    this.socket?.off("join:success")
    this.socket?.off("join:failure")
    this.socket?.off("reconnect_failed");
    this.socket?.off("connect_error")
    this.socket?.off("reconnect_success")
    this.socket?.off("connect")
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("SocketService: Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.options = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public on(
    event: string,
    listener: (payload: unknown) => void,
  ): void {
    if (!this.socket) {
      console.warn(`SocketService: Socket not initialized. Cannot listen to ${event}.`);
      return;
    }
    this.socket.on(event, listener);
  }

  public off(
    event: string,
    listener?: (payload: unknown) => void,
  ): void {
    if (!this.socket) {
      console.warn(`SocketService: Socket not initialized. Cannot unlisten from ${event}.`);
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