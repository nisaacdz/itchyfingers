/* eslint-disable @typescript-eslint/no-explicit-any */
import { AllSuccessPayload, CheckSuccessPayload, DataSuccessPayload, JoinSuccessPayload, LeaveSuccessPayload, MemberJoinedPayload, MemberLeftPayload, MeSuccessPayload, TypeEventPayload, UpdateAllPayload, UpdateDataPayload, UpdateMePayload, WsFailurePayload } from "@/types/api";
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

type RealtimeUpdateEvents = {
  "update:data": (payload: UpdateDataPayload) => void;
  "update:all": (payload: UpdateAllPayload) => void;
  "update:me": (payload: UpdateMePayload) => void;
  "member:joined": (payload: MemberJoinedPayload) => void;
  "member:left": (payload: MemberLeftPayload) => void;
};

type PollableEvents = {
  "leave": { success: LeaveSuccessPayload } | { failure: WsFailurePayload };
  "me": { success: MeSuccessPayload } | { failure: WsFailurePayload };
  "all": { success: AllSuccessPayload } | { failure: WsFailurePayload };
  "data": { success: DataSuccessPayload } | { failure: WsFailurePayload };
  "check": { success: CheckSuccessPayload } | { failure: WsFailurePayload };
}

type EmitOnlyEvents = {
  "type": TypeEventPayload;
}

export class SocketService {
  private socket: SocketIoClientSocket | null = null;
  private options: ConnectOptions | null = null;

  private getSocketBaseUrl(): string {
    return import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
  }

  public async connect(options: ConnectOptions): Promise<void> {
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
      ...(clientId ? { "X-Client-ID": clientId } : {}),
      ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
    };

    const query = {
      id: options.tournamentId,
      ...(options.spectator ? { spectator: "true" } : {})
    };

    this.socket = io(namespaceUrl, {
      transports: ['polling','websocket', 'webtransport'],
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      extraHeaders,
      query,
    });

    console.log(`SocketService: Attempting to connect to WebSocket: ${namespaceUrl} for tournament ${options.tournamentId}`)

    this.registerConnectionListeners();

    this.socket?.on("reconnect_attempt", () => {
      this.registerConnectionListeners();
      console.log(`SocketService: Attempting to reconnect to WebSocket: ${namespaceUrl} for tournament ${options.tournamentId}`);
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

  public on<E extends keyof RealtimeUpdateEvents>(
    event: E,
    listener: RealtimeUpdateEvents[E]
  ): void {
    if (!this.socket) {
      console.warn(`SocketService: Socket not initialized. Cannot listen to ${event}.`);
      return;
    }
    //@ts-expect-error type is actually valid
    this.socket.on(event, listener);
  }

  public off<E extends keyof RealtimeUpdateEvents>(
    event: E,
  ): void {
    if (!this.socket) {
      console.warn(`SocketService: Socket not initialized. Cannot unlisten from ${event}.`);
      return;
    }
  }

  public async fire<E extends keyof PollableEvents>(
    event: E): Promise<PollableEvents[E]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        console.warn(`SocketService: Socket not initialized. Cannot fire ${event}.`);
        return Promise.reject(new Error(`Socket not initialized. Cannot fire ${event}.`));
      }

      const socket = this.socket;
      const successEvent = `${event}:success`;
      const failureEvent = `${event}:failure`;

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for response to "${event}"`));
      }, 10000);

      const cleanup = () => {
        socket.off(successEvent, onSuccess);
        socket.off(failureEvent, onFailure);
        clearTimeout(timeoutId);
      };

      const onSuccess = (payload: any) => {
        cleanup();
        resolve({ success: payload } as PollableEvents[E]);
      };

      const onFailure = (payload: WsFailurePayload) => {
        cleanup();
        resolve({ failure: payload } as PollableEvents[E]);
      };

      socket.once(successEvent, onSuccess);
      socket.once(failureEvent, onFailure);

      socket.emit(event);
    });
  }

  public emit<E extends keyof EmitOnlyEvents>(event: E, payload: EmitOnlyEvents[E]): void {
    if (!this.socket) {
      console.warn(`SocketService: Socket not initialized. Cannot emit ${event}.`);
      return;
    }
    this.socket.emit(event, payload);
  }
}

export const socketService = new SocketService();