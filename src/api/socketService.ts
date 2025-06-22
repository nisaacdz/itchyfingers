/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AllSuccessPayload,
  CheckSuccessPayload,
  DataSuccessPayload,
  JoinSuccessPayload,
  LeaveSuccessPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  MeSuccessPayload,
  TypeEventPayload,
  UpdateAllPayload,
  UpdateDataPayload,
  UpdateMePayload,
  WsFailurePayload,
} from "@/types/api";
import { io, Socket as SocketIoClientSocket } from "socket.io-client"; // Renamed Socket from socket.io-client

const ACCESS_TOKEN_KEY =
  import.meta.env.VITE_ACCESS_TOKEN_KEY || "access_token";
const NOAUTH_UNIQUE_KEY =
  import.meta.env.VITE_NOAUTH_UNIQUE_KEY || "noauth_unique";

export type ConnectOptions = {
  tournamentId: string;
  spectator?: boolean;
  anonymous?: boolean;
  onJoinSuccess: (payload: JoinSuccessPayload) => void;
  onDisconnect: (reason: string) => void;
  onJoinFailure: (payload: WsFailurePayload) => void;
  onConnectError: (error: Error) => void;
};

type RealtimeUpdateEvents = {
  "update:data": (payload: UpdateDataPayload) => void;
  "update:all": (payload: UpdateAllPayload) => void;
  "update:me": (payload: UpdateMePayload) => void;
  "participant:joined": (payload: ParticipantJoinedPayload) => void;
  "participant:left": (payload: ParticipantLeftPayload) => void;
};

type PollableEvents = {
  leave: { success: LeaveSuccessPayload } | { failure: WsFailurePayload };
  me: { success: MeSuccessPayload } | { failure: WsFailurePayload };
  all: { success: AllSuccessPayload } | { failure: WsFailurePayload };
  data: { success: DataSuccessPayload } | { failure: WsFailurePayload };
  check: { success: CheckSuccessPayload } | { failure: WsFailurePayload };
};

type EmitOnlyEvents = {
  type: TypeEventPayload;
};

export class SocketService {
  private socket: SocketIoClientSocket | null = null;
  private options: ConnectOptions | null = null;

  private getSocketBaseUrl(): string {
    return import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";
  }

  public connect(options: ConnectOptions): void {
    if (
      this.socket &&
      this.options?.tournamentId === options.tournamentId &&
      this.options?.spectator === options.spectator &&
      this.options?.anonymous === options.anonymous
    ) {
      this.options = options; // Will be used on the next reconnection attempt

      this.ensureConnected();
      return;
    }

    this.options = options;

    if (this.socket) {
      console.log("SocketService: Disconnecting from previous tournament.");
      this.disconnect();
    }

    const baseUrl = this.getSocketBaseUrl();
    const namespaceUrl = `${baseUrl}/`;

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const noauth = localStorage.getItem(NOAUTH_UNIQUE_KEY);
    const extraHeaders = {
      ...(noauth ? { "x-noauth-unique": noauth } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const query = {
      id: options.tournamentId,
      ...(options.spectator ? { spectator: "true" } : {}),
      ...(options.anonymous ? { anonymous: "true" } : {}),
    };

    this.socket = io(namespaceUrl, {
      transports: ["polling", "websocket", "webtransport"],
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      extraHeaders,
      query,
    });

    this.socket?.on("reconnect_attempt", () => {
      this.registerConnectionListeners();
      console.log(`SocketService: Connecting to WS tournament ${options.tournamentId}`);
    });

    this.socket?.on("disconnect", (reason) => this.options?.onDisconnect(reason));

    this.ensureConnected();
  }

  public ensureConnected(): SocketIoClientSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.options && this.socket) {
      console.log(`SocketService: Connecting to WS tournament: ${this.options.tournamentId}`);

      this.registerConnectionListeners();

      this.socket?.connect();

      return this.socket;
    }

    throw new Error("SocketService: Socket not initialized.");
  }

  registerConnectionListeners(): void {
    this.cleanUpConnectionListeners();
    this.socket?.once("join:success", (payload) => {
      const { noauth, ...remPayload } = payload;
      if (payload.noauth) {
        localStorage.setItem(NOAUTH_UNIQUE_KEY, payload.noauth);
      }
      this.options?.onJoinSuccess(remPayload);
      this.cleanUpConnectionListeners();
    });
    this.socket?.once("join:failure", (payload) => {
      this.options?.onJoinFailure(payload);
      this.cleanUpConnectionListeners();
    });
    this.socket?.once("reconnect_failed", (payload) => {
      this.options?.onConnectError(payload);
      this.cleanUpConnectionListeners();
    });
    this.socket?.once("connect_error", (payload) => {
      this.options?.onConnectError(payload);
      this.cleanUpConnectionListeners();
    });
    this.socket?.once("connect", () => {
      console.log(`SocketService: Connected. Socket ID: ${this.socket?.id}`);
    });
  }

  cleanUpConnectionListeners(): void {
    this.socket?.off("join:success");
    this.socket?.off("join:failure");
    this.socket?.off("reconnect_failed");
    this.socket?.off("connect_error");
    this.socket?.off("reconnect_success");
    this.socket?.off("connect");
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("SocketService: Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.options = null;
    }
  }

  public on<E extends keyof RealtimeUpdateEvents>(
    event: E,
    listener: RealtimeUpdateEvents[E],
  ): void {
    if (!this.socket) {
      console.warn(
        `SocketService: Socket not initialized. Cannot listen to ${event}.`,
      );
      return;
    }
    //@ts-expect-error type is actually valid
    this.socket.on(event, listener);
  }

  public off<E extends keyof RealtimeUpdateEvents>(event: E): void {
    if (!this.socket) {
      console.warn(
        `SocketService: Socket not initialized. Cannot unlisten from ${event}.`,
      );
      return;
    }
    this.socket?.off(event);
  }

  public async fire<E extends keyof PollableEvents>(
    event: E,
  ): Promise<PollableEvents[E]> {
    return new Promise((resolve, reject) => {
      const socket = this.ensureConnected();
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

  public emit<E extends keyof EmitOnlyEvents>(
    event: E,
    payload: EmitOnlyEvents[E],
  ): void {
    //const socket = this.ensureConnected();
    this.socket?.emit(event, payload);
  }
}

export const socketService = new SocketService();
